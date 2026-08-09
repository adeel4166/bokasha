const axios = require('axios');

async function listModels() {
  const apiKey = 'YOUR_API_KEY_HERE';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await axios.get(endpoint);
    console.log('Available Models:');
    response.data.models.forEach(m => {
      console.log(`- ${m.name} (supports: ${m.supportedGenerationMethods.join(', ')})`);
    });
  } catch (error) {
    console.error('List models failed:', error.response?.data || error.message);
  }
}

listModels();
