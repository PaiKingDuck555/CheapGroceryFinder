const express = require('express');
const cors = require('cors');
const path = require('path');
const { scrapeStoresWithScreenshots } = require('./scraper');
const { getGroceryStores } = require('./grocery-location');  
const { screenshotAnalysis } = require('./analysis');


const app = express();
const PORT = 8000;

app.use(cors()); 
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Product scraping endpoint
  app.post('/scrape', async (req, res) => {
    console.log('Request body:', req.body);
    const products = req.body.products?.split(',').map(product => product.trim()) || [];
    const storeLocations = await getGroceryStores();  

    storeLocations.storeLocations.sort((a, b) => a.name.localeCompare(b.name));

    const uniqueStoreNames = storeLocations.storeLocations
    .map(store => store.name)
    .filter((name, index, self) => self.indexOf(name) === index); 
    
    
    if (!products.length) {
      return res.status(400).json({ error: 'At least one product name is required!' });
    }
  
    try {
      // First scrape the screenshots
      await scrapeStoresWithScreenshots(products);
      
      // Then analyze them and get results
      const analysisResults = await screenshotAnalysis();

      if (!Array.isArray(analysisResults)) {
        console.error("🚨 Invalid analysisResults:", analysisResults);
        return res.status(500).json({ error: "Invalid analysis results received" });
      }
    
      console.log("📊 Analysis Results:", analysisResults);

      const storeCount = Math.floor(analysisResults.length / products.length);

      let stores = [];
        
      for (let i = 0; i < storeCount; i++) {
        let storeProducts = [];
    
        for (let j = 0; j < products.length; j++) {
            const index = i * products.length + j;
            if (index < analysisResults.length) {
                const rawData = analysisResults[index]; // Extract raw data
    
                // Check if the result is "Unable to find product"
                if (rawData.includes("Unable to find product")) {
                    storeProducts.push({
                        productName: "Unable to find product",
                        priceData: "$0.00"
                    });
                } else {
                    // Normal case: Extract product name and price
                    const splitData = rawData.split(':');
                    const productNameVar = splitData[0].trim();
                    const priceDataVar = splitData.slice(1).join(':').trim();
    
                    storeProducts.push({
                        productName: productNameVar,
                        priceData: priceDataVar
                    });
                }
            }
        }
    

        const storeNameVar = uniqueStoreNames[i];
        stores.push({
            storeName: storeNameVar, // You may replace this with actual store names if available
            products: storeProducts
        });
      }

    console.log("📌 Structured Store List:", stores);
    res.json({ stores });


    } catch (error) {
      console.error('Error in scrape route:', error);
      res.status(500).json({
        error: 'Error processing the data',
        details: error.message
      });
    }
  });  

// Store locator endpoint
app.get('/grocery-location', async (req, res) => {
  try {
    const storeLocations = await getGroceryStores();
    storeLocations.storeLocations = storeLocations.storeLocations.filter((store, index, self) =>
      index === self.findIndex(s => s.name === store.name)
  );
  res.json(storeLocations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve the static HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'RealCheapGrocery.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

