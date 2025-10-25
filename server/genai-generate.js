import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Make sure your GOOGLE_API_KEY is set in your .env file
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error("Error: GOOGLE_API_KEY is not set in the .env file.");
  process.exit(1);
}

// Main function to run the generation
async function run() {
  try {
    console.log("Initializing Google Generative AI client...");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const prompt = "Write a one-paragraph story about a robot who discovers music.";

    // --- Method 1: Simple String Prompt (Recommended for single-turn chat) ---
    // The SDK automatically wraps the string in the correct request structure.
    console.log("Sending request using the simple string shortcut...");
    
    // FIX: Declared 'result' only once here.
    const resultFromString = await model.generateContent(prompt);
    const responseFromString = resultFromString.response;
    const textFromString = responseFromString.text();

    console.log("\n--- Gemini's Response (from simple string) ---");
    console.log(textFromString);
    console.log("------------------------------------------------\n");


    // --- Method 2: Full Request Object (Useful for more complex scenarios) ---
    // This demonstrates how to build the request object manually.
    // This is required for multi-turn conversations or multi-modal input.
    console.log("Sending request using the full request object...");

    const request = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };
    
    // FIX: Used a new variable name 'resultFromObject' to avoid redeclaration.
    const resultFromObject = await model.generateContent(request);
    const responseFromObject = resultFromObject.response;
    const textFromObject = responseFromObject.text();

    console.log("\n--- Gemini's Response (from full object) ---");
    console.log(textFromObject);
    console.log("----------------------------------------------\n");

  } catch (error) {
    // The original error object from the SDK might have more details
    console.error("Error calling Gemini model:", error.message);
  }
}

// Execute the main function
run();