// server/gemini-server.js
import express from "express";
import fetch from "node-fetch"; // or import axios from 'axios';
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

// --- Start of Gemini API Configuration ---

// FIX 1: Use the correct Gemini API endpoint. Note the ':generateContent' action.
const GOOGLE_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent";

// FIX 2: Use your Google API Key from the .env file.
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  console.error("ERROR: GOOGLE_API_KEY environment variable is not set.");
  process.exit(1); // Exit if the API key is missing.
}

// Helper function to call Google Gemini API
async function generateText(prompt, maxTokens = 512, temperature = 0.7) {
  // FIX 3: Construct the full URL with the API key as a query parameter.
  const url = `${GOOGLE_API_URL}?key=${GOOGLE_API_KEY}`;

  // FIX 4: Create the request payload in the format required by the Gemini API.
  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: temperature,
      maxOutputTokens: maxTokens,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Gemini API Error:", errorData);
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = await response.json();

  // FIX 5: Parse the response according to the Gemini API's structure.
  // The response can be complex, so we safely navigate the object.
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    console.error("No text found in Gemini API response:", data);
    throw new Error("No output generated or unexpected response format.");
  }

  return text;
}
// --- End of Gemini API Configuration ---

// POST endpoint for your frontend
app.post("/generate", async (req, res) => {
  // The prompt is expected in the request body
  const { prompt, maxTokens, temperature } = req.body;

  if (!prompt) {
    return res.status(400).json({ success: false, error: "Prompt is required." });
  }

  try {
    const output = await generateText(
      prompt,
      maxTokens || 512, // Default value if not provided
      temperature || 0.7 // Default value if not provided
    );
    res.json({ success: true, output });
  } catch (err) {
    console.error("Error generating text:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Simple health check
app.get("/", (req, res) => res.send("Gemini API server running"));

const PORT = process.env.GEMINI_PORT || 3001;
app.listen(PORT, () =>
  console.log(`✅ Backend running on http://localhost:${PORT}`)
);