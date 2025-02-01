const { handleCombinedInput } = require('./chatgpt');
const fs = require('fs').promises; // Use promises version of fs
const path = require('path');



async function processScreenshots() {
    try {
        // Read directory 
        const screenshotsDir = path.join(__dirname, '/screenshots');
        const imageFiles = await fs.readdir(screenshotsDir);

        if (imageFiles.length === 0) {
            console.log('No image files found in directory');
            return [];
        }

        console.log(`Found ${imageFiles.length} images to process`);

        // Process images
        const results = await Promise.all(
            imageFiles.map(async (file, index) => {
                const filePath = path.join(screenshotsDir, file);
                
                try {
                    console.log(`Processing file ${index + 1}/${imageFiles.length}: ${filePath}`);
                    
                    const response = await handleCombinedInput(
                        "You are extracting product prices from an image. Look at the screenshot carefully and determine a **single** product and its price.\n" +
                        "\n**Format your response as:**\n" +
                        '"(Store Name) (Product Name): Price"\n' +
                        'For example: "Walmart HoneyCrisp Apples: $8.95"\n' +
                        "\n**Rules:**\n" +
                        "1. If multiple prices are present, choose one specific product and **give the full product name**.\n" +
                        "2. If the store name is visible, use it. If not, **do not guess** the store name.\n" +
                        '3. If no product or price can be found, respond with: **"Unable to find product"**.\n' +
                        "4. Do **not** add extra details or descriptions—just the formatted response.\n" +
                        "\nNow, extract and format the price from the given screenshot.",
                        filePath
                    );
                    
                    return { file, response };
                } catch (error) {
                    console.error(`Error processing file ${file}:`, error);
                    return { file, response: `Error: ${error.message}` };
                }
            })
        );

        return results;
    } catch (error) {
        console.error('Error reading screenshots directory:', error);
        throw error;
    }
}

// Main execution
async function screenshotAnalysis() {
    try {
        const results = await processScreenshots();
        
        console.log("\n✅ All results received:");
        results.forEach((result, index) => {
            console.log(`Result ${index + 1} - ${result.file}: ${result.response}`);
        });
    } catch (error) {
        console.error("Fatal error processing screenshots:", error);
        process.exit(1);
    }
}

// Run the script
screenshotAnalysis(); 
module.exports = { screenshotAnalysis};
