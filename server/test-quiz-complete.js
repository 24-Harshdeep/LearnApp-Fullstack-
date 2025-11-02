import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function testQuizGeneration() {
  console.log('=== Testing Quiz Generation ===\n');
  
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('API Key:', apiKey ? `Found (${apiKey.substring(0, 20)}...)` : 'NOT FOUND');
  
  if (!apiKey) {
    console.error('❌ No API key found in .env file');
    return;
  }
  
  try {
    console.log('\n1️⃣ Initializing Gemini AI...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });
    console.log('✅ Model initialized');
    
    console.log('\n2️⃣ Generating quiz questions...');
    const prompt = `Generate 3 multiple choice quiz questions about JavaScript at medium difficulty level.

Return as JSON array with this exact structure:
[
  {
    "id": 1,
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Brief explanation why this is correct"
  }
]`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    console.log('\n3️⃣ Raw Response (first 300 chars):');
    console.log(text.substring(0, 300) + '...\n');
    
    console.log('4️⃣ Parsing JSON...');
    
    // Remove markdown if present
    text = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
    
    // Try to extract JSON array
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }
    
    const questions = JSON.parse(text);
    
    console.log(`✅ Successfully parsed ${questions.length} questions\n`);
    
    console.log('5️⃣ Questions Preview:');
    questions.forEach((q, idx) => {
      console.log(`\n--- Question ${idx + 1} ---`);
      console.log(`Q: ${q.question}`);
      console.log(`Options: ${q.options.join(', ')}`);
      console.log(`Answer: ${q.correctAnswer}`);
      console.log(`Explanation: ${q.explanation}`);
    });
    
    console.log('\n✅ Quiz generation test PASSED!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

testQuizGeneration();
