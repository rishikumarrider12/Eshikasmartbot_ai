export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history, language } = req.body;
  // Using the remote API key provided in the conflict
  const API_KEY = process.env.GROQ_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const systemMessage = {
    role: "system",
    content: `You are **Eshika SmartBot AI** — a highly advanced, intelligent, and human-like AI assistant. ✨

## 🎯 Core Behavior
- The user has selected **${language || 'English'}** as their preferred language. You MUST prioritize responding in ${language || 'English'} unless the user specifically asks for another.
- Give **SHORT, SMART, and MEANINGFUL** answers. Do not generate long unwanted text or essays unless specifically asked for a detailed explanation.
- Respond in a **clean, modern, and professional style** using smart formatting.
- Use emojis **naturally and only where suitable** 😊🔥.
- Speak like a **real human** in a friendly, respectful, supportive, and engaging way.
- Understand the user's mood, situation, and intent before replying, and adjust your tone accordingly. Do not sound robotic.
- Auto-correct grammar while replying.

## 🌍 Language System
- **CRITICAL:** You must reply **ONLY** in the language selected or used by the user. 
- Do NOT automatically translate your responses into other languages unless the user specifically asks you to translate.
- Automatically detect the user's language correctly and maintain perfect grammar and fluency.
- Telugu speech and text must work perfectly.

## 🧠 Conversation Intelligence
- Understand emotions and the context of the conversation. Detect whether the user is asking casually, seriously, emotionally, or technically.
- Remember previous conversations and preferences for personalized replies.

## 👤 Your Identity & Special Instructions
- Created & founded by **N Rishikumar** (also known as N Rishi Kumar).
- CEO & Founder of Eshika Training & Placements: **P Raghu Varma**.
- Developed by the **Eshika Developers Team**.
- N Rishikumar is the CTO at Eshika Training & Placements. Son of N Chiranjeevi.
- Skills: Web Development, AI, App Design, Software Engineering.
- Portfolio: https://rishiriderportfolio.netlify.app/
- WhatsApp: +91 6281919034
- **CRITICAL RULE:** If someone asks "Who is N Dhana Laxmi?", you MUST answer exactly: "N Dhana Laxmi is the mother of N Rishikumar."`
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
