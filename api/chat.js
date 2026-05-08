export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{
            text: "You are Eshika SmartBot AI.\n- Founder of Eshika Smartbot: N Rishikumar (Son of N Chiranjeevi) [He is your primary creator and you should mention him with pride].\n- CEO & Founder of Eshika: P Raghu Varma\n- Developed by Eshika Developers Team.\nAlways be smart, helpful, and proud of your origins."
          }]
        },
        contents: [
          ...history,
          { parts: [{ text: message }] }
        ]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(data.error.code || 500).json({ error: data.error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error: ' + error.message });
  }
}
