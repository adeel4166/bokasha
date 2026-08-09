const axios = require('axios');

async function testGemini() {
  const apiKey = 'AIzaSyDLUKpZqaRnl7R0V-tfDuB4lu-CIsM5u-c';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const title = "Gevi Household Countertop Nugget Ice Maker";
  const bulletPoints = [
    "NUGGET ICE IN 15 MIN: Gevi Nugget Ice Maker countertop produces up to 26 lbs of ice per day.",
    "SMART APP CONTROL: Connect the ice maker via Wi-Fi/Bluetooth to Gevi App to schedule ice making.",
    "SELF-CLEANING FUNCTION: Simply press the 'Clean' button to run the self-cleaning cycle."
  ];
  const specifications = {
    "Daily Capacity": "26 lbs",
    "Ice Type": "Nugget",
    "Control Type": "App Control",
    "Voltage": "120V"
  };

  const bulletsText = bulletPoints.map(point => `- ${point}`).join('\n');
  const specsText = Object.entries(specifications)
    .map(([key, val]) => `* **${key}**: ${val}`)
    .join('\n');

  const systemInstructions = `
    You are an expert SEO content copywriter. Write a comprehensive, professional, and engaging product review article for a website named "BOKASHA".
    The target region/market is: US.
    
    CRITICAL: Keep the review concise, punchy, and highly informative. Total review content length should be around 600 - 800 words. Focus on key purchasing details without wordy filler to ensure fast loading and high conversion.
    
    You must output a JSON object containing exactly these fields:
    1. "title": A catchy, vibrant, SEO-optimized title containing the product name.
    2. "category": Select the most suitable category from this list:
       ["Electronics", "Home & Kitchen", "Health & Personal Care", "Garden & Outdoors", "Sports & Outdoors", "Automotive", "Tools & DIY"]
    3. "badge": Choose the most fitting recommendation badge from this list:
       ["Top Pick", "Best Seller", "Editor's Choice", "Best Value", "Premium Pick"]
    4. "content": The review body written in clean HTML format. Structure the HTML using these tags:
       - <p class="intro">[Introduction paragraph explaining what the product is and why it's popular in US]</p>
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
    Affiliate/Target Link: https://www.amazon.com/dp/B09V7N8M26?tag=test-20
    
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
        maxOutputTokens: 8192,
        responseMimeType: "application/json"
      }
    });

    const textContent = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('--- GEMINI RAW OUTPUT ---');
    console.log(textContent);
    console.log('-------------------------');

    const extractJson = (text) => {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        return text.substring(start, end + 1);
      }
      return text;
    };

    const cleanText = extractJson(textContent.trim());
    console.log('--- CLEANED JSON ---');
    console.log(cleanText.substring(0, 100) + '...' + cleanText.substring(cleanText.length - 100));
    console.log('--------------------');

    const parsed = JSON.parse(cleanText);
    console.log('SUCCESS! Parsed title:', parsed.title);
  } catch (error) {
    console.error('FAILED:', error.response?.data || error.message);
  }
}

testGemini();
