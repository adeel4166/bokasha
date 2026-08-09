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
  
  // 1. Prioritize URL path match (extremely safe: requires /dp/ or /gp/product/)
  const urlAsinMatch = cleanInput.match(/\/dp\/([A-Z0-9]{10})/i) || cleanInput.match(/\/gp\/product\/([A-Z0-9]{10})/i);
  if (urlAsinMatch) {
    return `https://www.${domain}/dp/${urlAsinMatch[1].toUpperCase()}`;
  }
  
  // 2. Fallback to raw ASIN/ISBN pattern match (starts with B or 10-digit ISBN)
  const asinMatch = cleanInput.match(/\b(B[A-Z0-9]{9})\b/i) || cleanInput.match(/\b(\d{9}[0-9X])\b/i);
  if (asinMatch) {
    return `https://www.${domain}/dp/${asinMatch[1].toUpperCase()}`;
  }
  
  // Fallback to original input if we can't extract ASIN
  return cleanInput;
}

/**
 * Extracts ASIN from any Amazon URL or raw string.
 */
export function extractAsin(input) {
  const cleanInput = input.trim();

  // 1. Prioritize URL path match (extremely safe: requires /dp/ or /gp/product/)
  const urlAsinMatch = cleanInput.match(/\/dp\/([A-Z0-9]{10})/i) || cleanInput.match(/\/gp\/product\/([A-Z0-9]{10})/i);
  if (urlAsinMatch) return urlAsinMatch[1].toUpperCase();

  // 2. Fallback to raw ASIN/ISBN pattern match (starts with B or 10-digit ISBN)
  const asinMatch = cleanInput.match(/\b(B[A-Z0-9]{9})\b/i) || cleanInput.match(/\b(\d{9}[0-9X])\b/i);
  if (asinMatch) return asinMatch[1].toUpperCase();
  
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

    // 3. Extract Main Image (Robust Multi-Selector Approach)
    let imageUrl = '';
    const imgSelectors = [
      '#landingImage',
      '#imgBlkFront',
      '#main-image',
      '#imgTagWrapperId img',
      '#imageBlock img',
      '#landingImageWrapper img',
      '#ebooksImgBlkFront',
      '.a-dynamic-image'
    ];
    
    for (const selector of imgSelectors) {
      const imgEl = $(selector);
      if (imgEl.length > 0) {
        const dynamicImageJson = imgEl.attr('data-a-dynamic-image');
        if (dynamicImageJson) {
          try {
            const parsed = JSON.parse(dynamicImageJson);
            const keys = Object.keys(parsed);
            if (keys.length > 0) {
              const possibleUrl = keys[0];
              if (possibleUrl && !possibleUrl.includes('transparent-pixel') && !possibleUrl.includes('spacer.gif')) {
                imageUrl = possibleUrl;
                break;
              }
            }
          } catch (e) {
            // fallback
          }
        }
        const candidateUrl = imgEl.attr('data-old-hires') || imgEl.attr('data-src') || imgEl.attr('src');
        if (candidateUrl && !candidateUrl.includes('transparent-pixel') && !candidateUrl.includes('spacer.gif')) {
          imageUrl = candidateUrl;
          break;
        }
      }
    }
    
    if (!imageUrl) {
      const ogImage = $('meta[property="og:image"]').attr('content') || 
                      $('meta[name="twitter:image"]').attr('content') || 
                      '';
      if (ogImage && !ogImage.includes('transparent-pixel') && !ogImage.includes('spacer.gif')) {
        imageUrl = ogImage;
      }
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
