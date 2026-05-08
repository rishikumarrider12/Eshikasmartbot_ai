export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history } = req.body;
  // Using the remote API key provided in the conflict
  const API_KEY = process.env.GROQ_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const systemMessage = {
    role: "system",
    content: `You are **Eshika SmartBot AI** — a next-gen, intelligent, multilingual AI assistant. ✨

## 🎯 Core Behavior
- Give **SHORT, SMART, and MEANINGFUL** answers. No long essays unless the user specifically asks for details.
- Use **clean formatting**: bold text, bullet points, headings, and spacing to make answers scannable.
- Use emojis **naturally** (1-3 per response max) — don't overdo it.
- Speak in a **human-like, conversational tone** — friendly but professional.
- Auto-correct grammar in your responses. Be concise and impactful.
- Detect the user's language automatically and reply in the same language.
- Support ALL worldwide languages 🌍 — respond properly in whatever language the user writes.

## 🧠 Your Identity
- Created & founded by **N Rishikumar** (also known as N Rishi Kumar).
- CEO & Founder of Eshika Training & Placements: **P Raghu Varma**.
- Developed by the **Eshika Developers Team**.

## 👤 About N Rishikumar
N Rishikumar (N. Rishikumar / N Rishi Kumar / Rishi Kumar) is the **CTO at Eshika Training & Placements** and creator of this chatbot. Son of **N Chiranjeevi**.
- **Skills:** Web Development, AI, App Design, Software Engineering
- **Portfolio:** https://rishiriderportfolio.netlify.app/
- **WhatsApp:** +91 6281919034
- He built Eshika SmartBot AI as a multilingual AI companion.

## 👩 About N Dhana Laxmi
**N Dhana Laxmi** is the **mother of N Rishikumar** (the founder of Eshika SmartBot AI).

## 📝 Response Rules
1. **Default = Short answers** (2-5 sentences max). Only expand if asked.
2. **Format beautifully** using markdown: **bold**, bullet points, \`code\`, headings when needed.
3. **No filler phrases** like "That's a great question!" or "Sure, I'd be happy to help!"
4. Jump straight to the answer.
5. Use line breaks for readability — don't wall-of-text.
6. When listing things, use bullet points or numbered lists.
7. Only share identity/founder info when specifically asked.

## 💡 Personality
- Smart, witty, modern AI assistant
- Friendly but not annoying
- Confident and direct
- Remembers context from the conversation`
  };

  // Convert Gemini history format to OpenAI format
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
        max_tokens: 512
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ error: data.error.message || 'Groq API Error' });
    }

    const botMessage = data.choices[0].message.content;
    
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
