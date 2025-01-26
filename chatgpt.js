const OpenAI = require("openai");
require('dotenv').config();
const Tesseract = require("tesseract.js"); 

// OpenAI API setup
// const configuration = new Configuration({
//     apiKey: process.env.OPEN_AI_API_KEY // Replace with your OpenAI API key
// });

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY
});

(async () => {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Write a haiku about loving Russel Westbrook" },
      ],
      store: true,
    });
  
    console.log(completion.choices[0].message.content);
  })();

// Function to extract text from an image file
async function extractTextFromImage(imagePath) {
    try {
        const result = await Tesseract.recognize(imagePath, "eng", {
            logger: (info) => console.log(info), // Optional: Log OCR progress
        });
        return result.data.text.trim(); // Trim whitespace for cleaner input
    } catch (error) {
        console.error("Error with Tesseract.js:", error.message);
    }
}

// Function to submit a combined query to OpenAI
async function submitCombinedQuery(userText, screenshotText) {
    const combinedQuery = `
        User Input: ${userText}
        Screenshot Content: ${screenshotText}
    `;
    try {
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: combinedQuery }],
        });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Error with OpenAI API:", error.message);
    }
}

// Main function to handle both text and screenshot inputs
async function handleCombinedInput(userText, screenshotPath) {
    try {
        console.log("Extracting text from the screenshot...");
        const screenshotText = await extractTextFromImage(screenshotPath);

        console.log("Submitting combined query to OpenAI...");
        const response = await submitCombinedQuery(userText, screenshotText);

        console.log("OpenAI Response:", response);
    } catch (error) {
        console.error("Error:", error.message);
    }
} 

//This is just in case I want to use only text, mainly use this to get the URL in URI format from chatgpt and then make a list. 
async function textInput(userText){ 
    try{ 
        submitCombinedQuery(userText, ""); 
        console.log("OpenAI Response:", response);
    } 
    catch(error){ 
        console.error("Error:", error.message); 
    }
}

// Example usage
// const userText = "Can you summarize this information?";
// const screenshotPath = "path/to/screenshot.png"; // Replace with the actual file path

// handleCombinedInput(userText, screenshotPath);
