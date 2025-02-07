import { testGeminiIntegration } from './test-gemini';

async function runTest() {
  try {
    console.log('Testing Gemini API...');
    const result = await testGeminiIntegration();
    console.log('Test completed successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTest(); 