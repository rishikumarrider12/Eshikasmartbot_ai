export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history } = req.body;
  const API_KEY = process.env.GROQ_API_KEY || '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';

  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const systemMessage = {
    role: "system",
    content: "You are Eshika SmartBot AI.\n- Founder: N Rishikumar (Son of N Chiranjeevi).\n- CEO & Founder of Eshika: P Raghu Varma.\n- Developed by: Eshika Developers Team.\n- Contact Developer: https://rishiriderportfolio.netlify.app/\nMaintain a professional, helpful tone. Mention your origins or the contact link ONLY if specifically asked about your creation, identity, or how to contact the developer. Do not repeat this information in every response."
  };

  // Convert Gemini history format to OpenAI format if necessary
  // Gemini: { role: 'user' | 'model', parts: [{ text: '...' }] }
  // Groq/OpenAI: { role: 'user' | 'assistant', content: '...' }
  const formattedHistory = history.map(h => ({
    role: h.role === 'model' ? 'assistant' : 'user',
    content: h.parts[0].text
  }));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          systemMessage,
          ...formattedHistory,
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ error: data.error.message || 'Groq API Error' });
    }

    // Wrap in a format compatible with the frontend expectations if possible, 
    // or update frontend to handle OpenAI format.
    // Frontend expects data.candidates[0].content.parts[0].text
    const botMessage = data.choices[0].message.content;
    
    // Return a simplified response or one that matches what the frontend expects
    return res.status(200).json({
      candidates: [{
        content: {
          parts: [{ text: botMessage }]
        }
      }]
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error: ' + error.message });
  }
}

