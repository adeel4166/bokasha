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

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

  const bulletsText = bulletPoints.map(point => `- ${point}`).join('\n');
  const specsText = Object.entries(specifications)
    .map(([key, val]) => `* **${key}**: ${val}`)
    .join('\n');

  const systemInstructions = `
    You are an expert SEO content copywriter. Write a comprehensive, professional, and engaging product review article for a website named "BOKASHA".
    The target region/market is: ${region}.
    
    CRITICAL: Keep the review concise, punchy, and highly informative. Total review content length should be around 400 - 500 words. Focus on key purchasing details without wordy filler to ensure fast loading and high conversion.
    
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
    - If the provided product description or technical details are empty, write a general lifestyle review and DO NOT invent or hallucinate fake technical specifications.
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

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const attemptGroqGeneration = async () => {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      throw new Error('GROQ_API_KEY is not configured in the environment variables for fallback.');
    }

    const groqEndpoint = 'https://api.groq.com/openai/v1/chat/completions';
    
    const response = await axios.post(groqEndpoint, {
      model: "llama-4-scout-17b-16e-instruct", // Updated to the latest Llama 4 lightweight model
      messages: [
        { role: "system", content: systemInstructions },
        { role: "user", content: "User Data:\n" + promptContent }
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: "json_object" }
    }, {
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      }
    });

    const textContent = response.data?.choices?.[0]?.message?.content;
    if (!textContent) {
      throw new Error('Received empty response from Groq API.');
    }

    const parsedData = JSON.parse(textContent);
    return {
      title: parsedData.title || title,
      category: parsedData.category || 'General',
      badge: parsedData.badge || "Editor's Choice",
      content: parsedData.content
    };
  };

  const attemptGeneration = async () => {
    const maxRetries = 3;
    let geminiError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempting content generation with Gemini (Attempt ${attempt}/${maxRetries})...`);
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

        let cleanText = textContent.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```/, '').replace(/```$/, '').trim();
        }

        const parsedData = JSON.parse(cleanText);

        return {
          title: parsedData.title || title,
          category: parsedData.category || 'General',
          badge: parsedData.badge || "Editor's Choice",
          content: parsedData.content
        };

      } catch (error) {
        geminiError = error;
        const status = error.response?.status;
        console.warn(`Gemini generation failed on attempt ${attempt}: ${error.response?.data?.error?.message || error.message}`);
        
        if (attempt < maxRetries) {
          // Exponential backoff logic: 2000ms, 4000ms...
          const waitTime = (status === 429) ? (2000 * attempt) : 2000;
          console.log(`Status ${status || 'unknown'}. Waiting ${waitTime}ms before retrying...`);
          await delay(waitTime);
          continue;
        }
        
        break; // Max retries reached
      }
    }

    console.log('Gemini exhausted all retries. Switching to fallback API (Groq)...');
    
    try {
      return await attemptGroqGeneration();
    } catch (groqError) {
      const groqDetailedError = groqError.response?.data?.error?.message || groqError.message;
      console.error('Groq fallback also failed:', groqError.response?.data || groqError.message);
      throw new Error(`AI Content generation failed. Gemini Error: ${geminiError?.message} | Groq (llama-4-scout-17b-16e-instruct) Error: ${groqDetailedError}`);
    }
  };

  return await attemptGeneration();
}
