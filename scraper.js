const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const { getGroceryStores } = require('./grocery-location');

puppeteer.use(StealthPlugin());

const fetchPageScreenshot = async (query, storeName, product) => {

    const scraperUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;

    console.log(`🚀 Using ScraperAPI for: ${scraperUrl}`);
    

    const browser = await puppeteer.launch({
        headless: false,  // Set to true if you want headless mode
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-blink-features=AutomationControlled',
        ],
    });

    try {
        const page = await browser.newPage();
        console.log("2");
        await page.setViewport({ width: 1920, height: 1080 });
        console.log("3");
        console.log(`🔍 Navigating to: ${scraperUrl}`);
        console.log("4");
        await page.goto(scraperUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        console.log("5");
        // Add a random delay to mimic human behavior
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 10000)));
        console.log("6");
        const screenshotDir = path.resolve('screenshots');
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir);
        }
        console.log("7");
        const screenshotPath = path.join(screenshotDir, `${storeName}_${product}.png`);
        
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`✅ Screenshot saved: ${screenshotPath}`);

        return screenshotPath;
    } catch (error) {
        console.error(`❌ Error taking screenshot for ${product} at ${storeName}:`, error);
        console.log("8");
        return null;
    } finally {
        await browser.close();
    }
};

const scrapeStoresWithScreenshots = async (products) => { 
    const response = await getGroceryStores();
    const stores = ['Walmart', 'Trader Joes'];

    if (!stores.length) {
        console.log("❌ No stores found.");
        return;
    }

    return Promise.all(
        stores.map(async (store) => {
            return Promise.all(
                products.map(async (product) => {
                    try {
                        const searchQuery = `What is the price of ${product} at ${store}`;
                        console.log("9");
                        console.log(`🔍 Searching for: ${searchQuery}`);

                        const screenshotPath = await fetchPageScreenshot(searchQuery, store, product);

                        return {
                            product,
                            screenshotPath,
                            success: !!screenshotPath,
                        };
                    } catch (error) {
                        console.error(`❌ Error fetching screenshot for ${product} from ${store}:`, error);
                        console.log("10");
                        return {
                            product,
                            screenshotPath: null,
                            success: false,
                            error: error.message,
                        };
                    }
                })
            );
        })
    );
};

// Example usage
scrapeStoresWithScreenshots(["milk", "bread"]).then(results => {
    console.log("✅ All screenshots captured:", results);
});

module.exports = { scrapeStoresWithScreenshots };
