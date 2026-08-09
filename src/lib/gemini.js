import axios from 'axios';

/**
 * Generates an SEO-optimized product review article, categorizes it, and tags it with a badge.
 * Returns a JSON object: { title, category, badge, content }
 */
export async function generateProductReview({ title, bulletPoints, specifications, affiliateUrl, region }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment variables.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const bulletsText = bulletPoints.map(point => `- ${point}`).join('\n');
  const specsText = Object.entries(specifications)
    .map(([key, val]) => `* **${key}**: ${val}`)
    .join('\n');

  const systemInstructions = `
    You are an expert SEO content copywriter. Write a comprehensive, professional, and engaging product review article for a website named "BOKASHA".
    The target region/market is: ${region}.
    
    CRITICAL: Keep the review concise, punchy, and highly informative. Total review content length should be around 600 - 800 words. Focus on key purchasing details without wordy filler to ensure fast loading and high conversion.
    
    You must output a JSON object containing exactly these fields:
    1. "title": A catchy, vibrant, SEO-optimized title containing the product name.
    2. "category": Select the most suitable category from this list:
       ["Electronics", "Home & Kitchen", "Health & Personal Care", "Garden & Outdoors", "Sports & Outdoors", "Automotive", "Tools & DIY"]
    3. "badge": Choose the most fitting recommendation badge from this list:
       ["Top Pick", "Best Seller", "Editor's Choice", "Best Value", "Premium Pick"]
    4. "content": The review body written in clean HTML format. Structure the HTML using these tags:
       - <p class="intro">[Introduction paragraph explaining what the product is and why it's popular in ${region}]</p>
       - <h2>Key Features</h2> followed by detailed feature breakdowns.
       - <h2>Technical Specifications</h2> followed by a structured HTML table showing specs.
       - A <div class="pros-cons-grid"> containing a "pros-box" and a "cons-box".
       - <h2>Final Verdict</h2> summarizing suitability.
       
    IMPORTANT FOR HTML CONTENT:
    - DO NOT include the <h1> title in the "content" field (it is already stored separately in "title").
    - DO NOT include the final "Check Price on Amazon" affiliate link/button in the "content" field (the website template renders this automatically).
    - DO NOT list static prices or exact price numbers.
    - Output ONLY valid, clean JSON. Do not wrap the JSON output in markdown blocks like "\`\`\`json".
  `;

  const promptContent = `
    Product Name: ${title}
    Affiliate/Target Link: ${affiliateUrl}
    
    Product Description Points:
    ${bulletsText}
    
    Technical Details/Specs:
    ${specsText}
  `;

  try {
    const response = await axios.post(endpoint, {
      contents: [{
        parts: [{
          text: `${systemInstructions}\n\nUser Data:\n${promptContent}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192, // Increase limit to prevent truncating JSON strings
        responseMimeType: "application/json" // Enforce JSON Output
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const candidate = response.data?.candidates?.[0];
    const textContent = candidate?.content?.parts?.[0]?.text;
    
    if (!textContent) {
      throw new Error('Received empty response from Gemini API.');
    }

    // Helper to extract JSON block from text to bypass markdown wrappers or trailing characters
    const extractJson = (text) => {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        return text.substring(start, end + 1);
      }
      return text;
    };

    // Parse the JSON structure
    const parsedData = JSON.parse(extractJson(textContent.trim()));
    
    return {
      title: parsedData.title || title,
      category: parsedData.category || 'General',
      badge: parsedData.badge || "Editor's Choice",
      content: parsedData.content
    };

  } catch (error) {
    console.error('Gemini content generation failed:', error.response?.data || error.message);
    throw new Error(`AI Content generation failed: ${error.message}`);
  }
}
