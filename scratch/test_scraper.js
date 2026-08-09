const axios = require('axios');
const cheerio = require('cheerio');

async function testScrape() {
  const url = 'https://www.amazon.com/dp/B08GLYFDRB';
  console.log('Fetching:', url);
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Device-Memory': '8',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const title = $('#productTitle').text().trim() || $('title').text().trim();
    console.log('HTML Title:', title);
    
    let imageUrl = '';
    const imgEl = $('#landingImage');
    if (imgEl.length > 0) {
      imageUrl = imgEl.attr('src');
    }
    console.log('Image URL:', imageUrl);
    
    if (response.data.includes('api-services-support@amazon.com') || response.data.includes('Robot Check')) {
      console.log('Result: BLOCKED BY CAPTCHA');
    } else {
      console.log('Result: SUCCESS');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testScrape();
