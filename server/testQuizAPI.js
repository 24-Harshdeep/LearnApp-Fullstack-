const axios = require('axios');

async function testQuizAPI() {
  try {
    console.log('Testing Quiz API...\n');
    
    const response = await axios.post('http://localhost:5000/api/social/ai/quiz', {
      topics: ['JavaScript'],
      difficulty: 'medium',
      questionCount: 3
    });
    
    console.log('Response Status:', response.status);
    console.log('\nGenerated:', response.data.generated ? 'Yes (AI)' : 'No (Fallback)');
    console.log('Topic:', response.data.topic);
    console.log('Difficulty:', response.data.difficulty);
    console.log('\nQuestions received:', response.data.questions.length);
    
    response.data.questions.forEach((q, idx) => {
      console.log(`\n--- Question ${idx + 1} ---`);
      console.log('Q:', q.question);
      console.log('Options:', q.options);
      console.log('Answer:', q.correctAnswer);
      console.log('Explanation:', q.explanation);
    });
    
    console.log('\n✅ Quiz API test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing quiz API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testQuizAPI();
