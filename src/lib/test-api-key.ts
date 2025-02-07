import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

async function testApiKey() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    console.log('API Key found:', apiKey.substring(0, 8) + '...');

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Test with a simple text prompt
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    console.log('Testing API connection...');
    const result = await model.generateContent("Hello! Please respond with 'API is working!' if you receive this message.");
    const response = await result.response;
    const text = response.text();
    
    console.log('\nAPI Response:', text);
    console.log('\n✅ API test successful!');
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Run the test
testApiKey(); 