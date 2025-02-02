const OpenAI = require("openai");
require('dotenv').config();
const Tesseract = require("tesseract.js");

// OpenAI API setup
const openai = new OpenAI({ 
    apiKey: process.env.OPEN_AI_API_KEY 
});

// Function to extract text from an image file
async function extractTextFromImage(imagePath) {
    try {
        const result = await Tesseract.recognize(imagePath, "eng", {
            logger: (info) => console.log(info)
        });
        return result.data.text.trim();
    } catch (error) {
        console.error("Error with Tesseract.js:", error.message);
        throw error; // Propagate error to caller
    }
}

// Function to submit a combined query to OpenAI
async function submitCombinedQuery(userText, screenshotText) {
    const combinedQuery = `
        User Input: ${userText}
        Screenshot Content: ${screenshotText}
    `.trim();

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ 
                role: "user", 
                content: combinedQuery 
            }],
            temperature: 0.7,
            max_tokens: 500
        });

        // Check if response and choices exist
        if (!response || !response.choices || !response.choices[0]) {
            throw new Error("Invalid response format from OpenAI");
        }

        return response.choices[0].message.content;
    } catch (error) {
        console.error("Error with OpenAI API:", error.message);
        throw error; // Propagate error to caller
    }
}

// Main function to handle both text and screenshot inputs
async function handleCombinedInput(userText, screenshotPath) {
    try {
        console.log("Processing input...");
        
        let screenshotText = "";
        if (screenshotPath) {
            console.log("Extracting text from the screenshot...");
            screenshotText = await extractTextFromImage(screenshotPath);
        }

        console.log("Submitting query to OpenAI...");
        const response = await submitCombinedQuery(userText, screenshotText);
        
        console.log("OpenAI Response:", response);
        return response;
    } catch (error) {
        console.error("Error in handleCombinedInput:", error.message);
        throw error; // Propagate error to caller
    }
}

// Function for text-only input
async function textInput(userText) {
    try {
        const response = await submitCombinedQuery(userText, "");
        console.log("OpenAI Response:", response);
        return response;
    } catch (error) {
        console.error("Error in textInput:", error.message);
        throw error;
    }
}

module.exports = { 
    handleCombinedInput,
    textInput
};

// Example usage
// const userText = "Can you summarize this information?";
// const screenshotPath = "path/to/screenshot.png"; // Replace with the actual file path

// handleCombinedInput(userText, screenshotPath);
