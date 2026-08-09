const axios = require('axios');
const cheerio = require('cheerio');

async function testScrape() {
  const url = 'https://www.amazon.com/dp/B07R7Q8Z9F';
  console.log('Fetching with Fetch API:', url);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      }
    });

    const html = await response.text();
    const $ = cheerio.load(html);
    const title = $('#productTitle').text().trim() || $('title').text().trim();
    console.log('HTML Title:', title);
    
    let imageUrl = '';
    const imgEl = $('#landingImage');
    if (imgEl.length > 0) {
      imageUrl = imgEl.attr('src');
    }
    console.log('Image URL:', imageUrl);
    
    if (html.includes('api-services-support@amazon.com') || html.includes('Robot Check')) {
      console.log('Result: BLOCKED BY CAPTCHA');
    } else {
      console.log('Result: SUCCESS');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testScrape();
