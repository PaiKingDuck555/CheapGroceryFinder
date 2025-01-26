const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Improved HTML fetching with proper headers
const fetchHTML = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    throw new Error(`Failed to fetch ${url}: ${error.message}`);
  }
};

// Improved Aldi scraper
const scrapeAldi = ($) => {
  const results = [];
  try {
    $('.product-teaser-item.product-grid__item').each((i, element) => {
      if (i >= 5) return false;
      
      const parentElement = $(element);
      const productTile = parentElement.find('.product-tile');
      
      const productName = productTile.attr('title');
      const priceElement = parentElement.find('.base-price__regular');
      const priceText = priceElement.length ? priceElement.text().replace(/[^0-9.]/g, '') : null;
      const price = parseFloat(priceText);

      if (productName && !isNaN(price)) {
        results.push({
          productName: productName.trim(),
          price: price
        });
      }
    });
  } catch (error) {
    console.error('Error in scrapeAldi:', error);
  }
  return results;
};

// Product scraping endpoint
app.get('/scrape', async (req, res) => {
  const products = req.query.products?.split(',').map(product => product.trim()) || [];

  if (!products.length) {
    return res.status(400).json({ error: 'At least one product name is required!' });
  }

  const stores = [{
    storeName: 'Aldi',
    url: (product) => `https://new.aldi.us/results?q=${encodeURIComponent(product)}`,
    scraper: scrapeAldi
  }];

  try {
    const storeResults = await Promise.all(
      stores.map(async (store) => {
        const productQueries = await Promise.all(
          products.map(async (product) => {
            try {
              const url = store.url(product);
              console.log(`Fetching ${url}`);
              const html = await fetchHTML(url);
              const $ = cheerio.load(html);
              const scrapedProducts = store.scraper($);
              
              return {
                query: product,
                products: scrapedProducts,
                success: true
              };
            } catch (error) {
              console.error(`Error scraping ${product} from ${store.storeName}:`, error);
              return {
                query: product,
                products: [],
                success: false,
                error: error.message
              };
            }
          })
        );

        return {
          storeName: store.storeName,
          results: productQueries
        };
      })
    );

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
app.get('/grocery-stores', async (req, res) => {
  try {
    const location = await getLocationFromIP();
    const storeLocations = await getNearbyGroceryStores(location.latitude, location.longitude);
    res.json({ location, storeLocations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get location from IP
const getLocationFromIP = async () => {
  try {
    const response = await axios.get('https://ipinfo.io/json?token=36ffe8ac3653dd');
    const location = response.data.loc;
    const [latitude, longitude] = location.split(',');
    return { latitude, longitude };
  } catch (error) {
    console.error('Error getting location:', error);
    // Default to a fallback location
    return { latitude: "39.952217", longitude: "-75.193214" };
  }
};

// Get nearby grocery stores
const getNearbyGroceryStores = async (latitude, longitude) => {
  const apiKey = 'AIzaSyDqsSuEJNTpCH2BxaPb5hoMSeeC9a5D8Bk';
  const searchRadius = 2000;
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${searchRadius}&type=grocery_or_supermarket&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const storeList = response.data.results.map(store => ({
      name: store.name,
      address: store.vicinity,
      location: store.geometry.location
    }));
    return storeList;
  } catch (error) {
    console.error("Error fetching stores:", error);
    return [];
  }
};

// Serve the static HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'RealCheapGrocery.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

//,{storeName : 'Giant', url : (product) => `https://giantfoodstores.com/product-search/${encodeURIComponent(product)}`}
//,{storeName : 'Acme', url : (product) => `https://www.acmemarkets.com/shop/search-results.html?q=${encodeURIComponent(product)}`}