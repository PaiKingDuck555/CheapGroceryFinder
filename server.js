const express = require('express');
const cors = require('cors');
const path = require('path');
const { scrapeStoresWithScreenshots } = require('./scraper');
const { getGroceryStores } = require('./grocery-location'); 


const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Product scraping endpoint
app.get('/scraper', async (req, res) => {
  const products = req.query.products?.split(',').map(product => product.trim()) || [];

  if (!products.length) {
    return res.status(400).json({ error: 'At least one product name is required!' });
  }

  try {
    const storeResults = await scrapeStoresWithScreenshots(products);
    res.json(storeResults);
  } catch (error) {
    console.error('Error in scrape route:', error);
    res.status(500).json({
      error: 'Error scraping the data',
      details: error.message
    });
  }
});  

// Store locator endpoint
app.get('/grocery-location', async (req, res) => {
  try {
    const storeLocations = await getGroceryStores();
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

