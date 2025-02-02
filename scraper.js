const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const { getGroceryStores } = require('./grocery-location');

puppeteer.use(StealthPlugin());

const fetchPageScreenshot = async (query, storeName, product) => {

    const scraperUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
    

    const browser = await puppeteer.launch({
        headless: true,  // Set to true if you want headless mode
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-blink-features=AutomationControlled',
        ],
    });

    try {
        const page = await browser.newPage();

        await page.setViewport({ width: 1920, height: 1080 });

        console.log(`🔍 Navigating to: ${scraperUrl}`);

        await page.goto(scraperUrl, { waitUntil: 'domcontentloaded', timeout: 100000 });

        // Add a random delay to mimic human behavior

        const screenshotDir = path.resolve('screenshots');
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir);
        }

        const screenshotPath = path.join(screenshotDir, `${storeName}_${product}.png`);
        
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`✅ Screenshot saved: ${screenshotPath}`);

        return screenshotPath;
    } catch (error) {
        console.error(`❌ Error taking screenshot for ${product} at ${storeName}:`, error);
        return null;
    } finally {
        await browser.close();
    }
};
const clearScreenshotsFolder = () => {
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (fs.existsSync(screenshotsDir)) {
        fs.readdirSync(screenshotsDir).forEach(file => {
            const filePath = path.join(screenshotsDir, file);
            try {
                fs.unlinkSync(filePath); // Delete file
                console.log(`🗑️ Deleted old screenshot: ${filePath}`);
            } catch (err) {
                console.error(`❌ Error deleting ${filePath}:`, err);
            }
        });
    }
};
const emptyImagePath = path.join(__dirname, 'empty.png');
const scrapeStoresWithScreenshots = async (products) => { 
    const response = await getGroceryStores();
    const stores = response.storeLocations.map(store => store.name);

    if (!stores.length) {
        console.log("❌ No stores found.");
        return;
    }
    clearScreenshotsFolder();
    
    return Promise.all(
        stores.map(async (store) => {
            return Promise.all(
                products.map(async (product) => {
                    try {
                        const searchQuery = `What is the price of ${product} at ${store}`;

                        console.log(`🔍 Searching for: ${searchQuery}`);

                        const screenshotPath = await fetchPageScreenshot(searchQuery, store, product);

                        return {
                            product,
                            screenshotPath,
                            success: !!screenshotPath,
                        };
                    } catch (error) {
                        console.error(`❌ Error fetching screenshot for ${product} from ${store}:`, error);

                        return {
                            product,
                            screenshotPath: emptyImagePath,
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
// scrapeStoresWithScreenshots(["milk", "bread"]).then(results => {
//      console.log("✅ All screenshots captured:", results);
// });

module.exports = { scrapeStoresWithScreenshots };
