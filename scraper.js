const puppeteer = require('puppeteer');
const fs = require('fs');  
const path = require('path'); 
const { handleCombinedInput, textInput} = require('./chatgpt'); 




const stores = [{
  storeName: 'Walmart',
  url: (product) => `https://www.walmart.com/search?q=${encodeURIComponent(product)}`,
}, {
  storeName: 'Target',
  url: (product) => `https://www.target.com/s?searchTerm=${encodeURIComponent(product)}`,
},{
  storeName: 'Aldi',
  url: (product) => `https://new.aldi.us/results?q=${encodeURIComponent(product)}`,
}];

//This is a method that takes in a url, storeName, and product. 
// It then takes a screenshot of the page and saves it to the screenshots folder.
const fetchPageScreenshot = async (url, storeName, product) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    channel: 'chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    const newPath = path.resolve('screenshots');
    if (!fs.existsSync(newPath)) {
      fs.mkdirSync(newPath);
    }

    // Define the screenshot file path
    const screenshotPath = path.join( newPath, `${storeName}_${product}.png`);

    // Take a screenshot of the entire page
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved: ${screenshotPath}`);

    return screenshotPath;
  } finally {
    await browser.close();
  }
};

// This is a for loop on the outside for products
const scrapeStoresWithScreenshots = async (products) => {
  return Promise.all(
    //This is another for loop for all of the stores in stores. 
    stores.map(async (store) => {
      const screenshots = await Promise.all(
        products.map(async (product) => {
          try {
            const url = store.url(product);
            console.log(`Fetching ${url}`);
            //this is where the screenshot is being taken and saved
            const screenshotPath = await fetchPageScreenshot(url, store.storeName, product);
            
            return {
              product,
              screenshotPath,
              success: true,
            };
          } catch (error) {
            console.error(`Error fetching screenshot for ${product} from ${store.storeName}:`, error);
            return {
              product,
              screenshotPath: null,
              success: false,
              error: error.message,
            };
          }
        })
      );

      return {
        storeName: store.storeName,
        results: screenshots,
      };
    })
  );
};

module.exports = { scrapeStoresWithScreenshots };
