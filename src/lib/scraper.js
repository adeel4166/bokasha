import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Normalizes Amazon ASIN or direct URL into a clean Amazon product URL.
 */
export function getAmazonUrl(input, region = 'US') {
  const cleanInput = input.trim();
  
  // Standard Amazon domains based on region
  const domains = {
    US: 'amazon.com',
    UK: 'amazon.co.uk',
    DE: 'amazon.de',
    CA: 'amazon.ca',
    FR: 'amazon.fr',
    IT: 'amazon.it',
    ES: 'amazon.es',
  };
  
  const domain = domains[region.toUpperCase()] || 'amazon.com';
  
  // Regular expression to match ASIN (10 alphanumeric characters)
  const asinMatch = cleanInput.match(/\b([A-Z0-9]{10})\b/i);
  
  if (asinMatch) {
    return `https://www.${domain}/dp/${asinMatch[1]}`;
  }
  
  // If it's a URL already, try to extract ASIN and reconstruct to prevent tracking/ref parameter issues
  const urlAsinMatch = cleanInput.match(/\/dp\/([A-Z0-9]{10})/i) || cleanInput.match(/\/gp\/product\/([A-Z0-9]{10})/i);
  if (urlAsinMatch) {
    return `https://www.${domain}/dp/${urlAsinMatch[1]}`;
  }
  
  // Fallback to original input if we can't extract ASIN
  return cleanInput;
}

/**
 * Extracts ASIN from any Amazon URL or raw string.
 */
export function extractAsin(input) {
  const asinMatch = input.trim().match(/\b([A-Z0-9]{10})\b/i);
  if (asinMatch) return asinMatch[1].toUpperCase();
  
  const urlAsinMatch = input.trim().match(/\/dp\/([A-Z0-9]{10})/i) || input.trim().match(/\/gp\/product\/([A-Z0-9]{10})/i);
  if (urlAsinMatch) return urlAsinMatch[1].toUpperCase();
  
  return null;
}

/**
 * Scrapes product details from Amazon URL.
 */
export async function scrapeAmazonProduct(inputUrl, region = 'US') {
  const url = getAmazonUrl(inputUrl, region);
  const asin = extractAsin(url) || 'UNKNOWN';

  try {
    let response;
    const scraperApiKey = process.env.SCRAPER_API_KEY;

    if (scraperApiKey) {
      console.log('Using ScraperAPI to bypass Amazon block:', url);
      const scraperUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}`;
      response = await axios.get(scraperUrl, { timeout: 30000 });
    } else {
      console.log('Using direct request (fallback):', url);
      response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Device-Memory': '8',
        },
        timeout: 15000,
      });
    }

    const $ = cheerio.load(response.data);

    // 1. Extract Title
    const title = $('#productTitle').text().trim() || 
                  $('meta[name="title"]').attr('content')?.trim() || 
                  $('title').text().replace('Amazon.com:', '').replace('Amazon.de:', '').trim();

    // 2. Extract Bullet Points (Key Features)
    const bulletPoints = [];
    $('#feature-bullets ul li span.a-list-item').each((_, el) => {
      const text = $(el).text().trim();
      // Filter out promotional text or blank lines
      if (text && !text.includes('Make sure this fits') && text.length > 5) {
        bulletPoints.push(text);
      }
    });

    // 3. Extract Main Image
    let imageUrl = '';
    const imgEl = $('#landingImage');
    if (imgEl.length > 0) {
      const dynamicImageJson = imgEl.attr('data-a-dynamic-image');
      if (dynamicImageJson) {
        try {
          const parsed = JSON.parse(dynamicImageJson);
          imageUrl = Object.keys(parsed)[0]; // Selects highest resolution image
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

    // 4. Extract Product Specs / Details
    const specifications = {};
    
    // Check tables like .prodDetTable or #prodDetails
    $('.prodDetTable tr').each((_, el) => {
      const key = $(el).find('th').text().trim();
      const value = $(el).find('td').text().trim().replace(/\s+/g, ' ');
      if (key && value) {
        specifications[key] = value;
      }
    });

    // Fallback: Check bullet-style specifications (common for clothes/books)
    if (Object.keys(specifications).length === 0) {
      $('#detailBullets_feature_div ul li').each((_, el) => {
        const text = $(el).text().trim().replace(/\s+/g, ' ');
        const parts = text.split(':');
        if (parts.length >= 2) {
          const key = parts[0].trim().replace(/[^a-zA-Z0-9\s]/g, '');
          const value = parts.slice(1).join(':').trim();
          if (key && value) {
            specifications[key] = value;
          }
        }
      });
    }

    return {
      asin,
      url,
      title: title || 'Amazon Product',
      imageUrl,
      bulletPoints,
      specifications,
      rawHtmlPreview: response.data.substring(0, 1000), // useful for debugging
    };

  } catch (error) {
    console.error('Error scraping Amazon product:', error.message);
    throw new Error(`Failed to retrieve product details from Amazon. Make sure the URL/ASIN is valid.`);
  }
}
