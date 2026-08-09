const axios = require('axios');
const cheerio = require('cheerio');

async function testCheerio() {
  const apiKey = '01d75a3b46c83232985317b9224eca6a';
  const url = 'https://www.amazon.com/dp/B0CF5MT56V';
  const scraperUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(url)}`;
  
  console.log('Fetching via ScraperAPI:', url);
  try {
    const response = await axios.get(scraperUrl);
    const $ = cheerio.load(response.data);
    
    const title = $('#productTitle').text().trim() || 
                  $('meta[name="title"]').attr('content')?.trim() || 
                  $('title').text().trim();
    console.log('Parsed Title:', title);

    const bulletPoints = [];
    $('#feature-bullets ul li span.a-list-item').each((_, el) => {
      const text = $(el).text().trim();
      if (text && !text.includes('Make sure this fits') && text.length > 5) {
        bulletPoints.push(text);
      }
    });
    console.log('Parsed Bullets Count:', bulletPoints.length);
    console.log('Bullets:', bulletPoints.slice(0, 3));

    let imageUrl = '';
    const imgEl = $('#landingImage');
    if (imgEl.length > 0) {
      const dynamicImageJson = imgEl.attr('data-a-dynamic-image');
      if (dynamicImageJson) {
        try {
          const parsed = JSON.parse(dynamicImageJson);
          imageUrl = Object.keys(parsed)[0];
        } catch (e) {
          imageUrl = imgEl.attr('src');
        }
      } else {
        imageUrl = imgEl.attr('src');
      }
    }
    if (!imageUrl) {
      imageUrl = $('#imgBlkFront').attr('src') || $('meta[property="og:image"]').attr('content') || '';
    }
    console.log('Parsed Image URL:', imageUrl);

    const specifications = {};
    $('.prodDetTable tr').each((_, el) => {
      const key = $(el).find('th').text().trim();
      const value = $(el).find('td').text().trim().replace(/\s+/g, ' ');
      if (key && value) {
        specifications[key] = value;
      }
    });
    console.log('Parsed Specs Count:', Object.keys(specifications).length);
    console.log('Specs:', specifications);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testCheerio();
