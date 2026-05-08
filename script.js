// Eshika SmartBot AI script - Version 3.0 (Advanced & Intelligent)

const chatArea = document.getElementById('chat-area');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const voiceBtn = document.getElementById('voice-input-btn');
const typingIndicator = document.getElementById('typing-indicator');
const muteBtn = document.getElementById('mute-btn');
const languageSelect = document.getElementById('language-select');
const voiceSelect = document.getElementById('voice-select');
const splashScreen = document.getElementById('splash-screen');
const getStartedBtn = document.getElementById('get-started-btn');

let isListening = false;
let isMuted = false;
let recognition = null;
let voices = [];
let chatHistory = [];
let isBotTyping = false;

// ─── Memory System (localStorage) ───────────────────────────────
const MEMORY_KEY = 'eshika_smartbot_memory';
const HISTORY_KEY = 'eshika_smartbot_history';

function loadMemory() {
  try {
    return JSON.parse(localStorage.getItem(MEMORY_KEY)) || { userName: null, preferences: {}, facts: [] };
  } catch { return { userName: null, preferences: {}, facts: [] }; }
}

function saveMemory(memory) {
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
}

function loadSavedHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch { return []; }
}

function saveChatHistory() {
  // Keep last 30 messages to avoid bloating localStorage
  const trimmed = chatHistory.slice(-30);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

// Extract user info from messages for memory
function extractMemory(userText, botText) {
  const memory = loadMemory();
  
  // Detect user name patterns
  const namePatterns = [
    /my name is\s+(.+)/i,
    /i(?:'| a)?m\s+(.+)/i,
    /call me\s+(.+)/i,
    /this is\s+(.+)/i
  ];
  for (const pattern of namePatterns) {
    const match = userText.match(pattern);
    if (match && match[1] && match[1].trim().length < 40) {
      const name = match[1].replace(/[.!?,;].*$/, '').trim();
      if (name.split(' ').length <= 4 && name.length > 1) {
        memory.userName = name;
      }
    }
  }

  // Detect language preference
  const langMatch = userText.match(/(?:speak|reply|talk|respond)\s+(?:in|to me in)\s+(\w+)/i);
  if (langMatch) {
    memory.preferences.language = langMatch[1];
  }

  saveMemory(memory);
}

// Build memory context for the system prompt
function getMemoryContext() {
  const memory = loadMemory();
  let context = '';
  if (memory.userName) {
    context += `\n- The user's name is "${memory.userName}". Use it naturally sometimes.`;
  }
  if (memory.preferences.language) {
    context += `\n- The user prefers communication in ${memory.preferences.language}.`;
  }
  if (memory.facts.length > 0) {
    context += `\n- Known facts about user: ${memory.facts.join('; ')}`;
  }
  return context;
}

// ─── System Prompt ──────────────────────────────────────────────
function getSystemPrompt() {
  const memoryCtx = getMemoryContext();
  
  return `You are **Eshika SmartBot AI** — a next-gen, intelligent, multilingual AI assistant. ✨

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
${memoryCtx}

## 💡 Personality
- Smart, witty, modern AI assistant
- Friendly but not annoying
- Confident and direct
- Remembers context from the conversation`;
}

// ─── Voice System ───────────────────────────────────────────────
function loadVoices() {
  voices = window.speechSynthesis.getVoices();
}
window.speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = languageSelect.value;

  recognition.onstart = () => {
    isListening = true;
    voiceBtn.classList.add('voice-active');
    userInput.placeholder = '🎤 Listening...';
  };
  recognition.onend = () => {
    isListening = false;
    voiceBtn.classList.remove('voice-active');
    userInput.placeholder = 'Type your message...';
  };
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    sendMessage();
  };
}

languageSelect.addEventListener('change', () => {
  if (recognition) recognition.lang = languageSelect.value;
});

muteBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  muteBtn.textContent = isMuted ? '🔇' : '🔊';
  if (isMuted) window.speechSynthesis.cancel();
});

function speak(text) {
  if (isMuted || !window.speechSynthesis) return;

  // Ensure voices are loaded (some browsers load them asynchronously)
  if (!voices || voices.length === 0) {
    voices = window.speechSynthesis.getVoices();
  }

  // Cancel any ongoing speech to prevent queueing issues
  window.speechSynthesis.cancel();

  // Strip markdown for speech
  const cleanText = text
    .replace(/[#*_`~>\-]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, '. ')
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  const gender = voiceSelect.value;
  
  // Detect language based on script ranges
  let detectedLang = languageSelect.value;
  
  const scriptChecks = [
    { regex: /[\u0C00-\u0C7F]/, lang: 'te-IN' }, // Telugu
    { regex: /[\u0900-\u097F]/, lang: 'hi-IN' }, // Hindi/Marathi
    { regex: /[\u0B80-\u0BFF]/, lang: 'ta-IN' }, // Tamil
    { regex: /[\u0C80-\u0CFF]/, lang: 'kn-IN' }, // Kannada
    { regex: /[\u0980-\u09FF]/, lang: 'bn-IN' }, // Bengali
    { regex: /[\u0D00-\u0D7F]/, lang: 'ml-IN' }, // Malayalam
    { regex: /[\u0A80-\u0AFF]/, lang: 'gu-IN' }, // Gujarati
    { regex: /[\u0A00-\u0A7F]/, lang: 'pa-IN' }, // Punjabi
    { regex: /[\u0600-\u06FF]/, lang: 'ur-PK' }, // Urdu/Arabic
    { regex: /[\u4E00-\u9FFF]/, lang: 'zh-CN' }, // Chinese
    { regex: /[\u3040-\u30FF]/, lang: 'ja-JP' }, // Japanese
    { regex: /[\uAC00-\uD7AF]/, lang: 'ko-KR' }, // Korean
    { regex: /[а-яА-Я]/, lang: 'ru-RU' }          // Russian
  ];

  for (const check of scriptChecks) {
    if (check.regex.test(cleanText)) {
      detectedLang = check.lang;
      break;
    }
  }

  utterance.lang = detectedLang;
  
  // Try to find a voice that matches the detected language and preferred gender
  const filtered = voices.filter(v => v.lang.startsWith(detectedLang.split('-')[0]));
  if (filtered.length) {
    let selected = filtered.find(v => v.name.toLowerCase().includes(gender));
    if (!selected) {
      // Fallback to first available voice for that language
      selected = filtered[0];
    }
    utterance.voice = selected;
  }
  
  // Adjust rate and pitch slightly for a more natural feel
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
}

// ─── Message Display with Typing Animation ──────────────────────
function addMessage(text, isUser = false) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message');
  msgDiv.classList.add(isUser ? 'user-message' : 'bot-message');
  
  if (isUser) {
    msgDiv.textContent = text;
    chatArea.appendChild(msgDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
  } else {
    // Typing animation for bot messages
    chatArea.appendChild(msgDiv);
    typeMessage(msgDiv, text);
  }
}

function typeMessage(element, fullText) {
  const parsed = marked.parse(fullText);
  const words = fullText.split(/(\s+)/);
  let currentIndex = 0;
  let currentText = '';
  
  element.classList.add('typing-active');
  isBotTyping = true;
  
  const typeInterval = setInterval(() => {
    if (currentIndex < words.length) {
      currentText += words[currentIndex];
      currentIndex++;
      
      // Render markdown progressively (every few words for performance)
      if (currentIndex % 3 === 0 || currentIndex >= words.length) {
        element.innerHTML = marked.parse(currentText);
        chatArea.scrollTop = chatArea.scrollHeight;
      }
    } else {
      clearInterval(typeInterval);
      element.innerHTML = marked.parse(fullText);
      element.classList.remove('typing-active');
      element.classList.add('typing-done');
      isBotTyping = false;
      chatArea.scrollTop = chatArea.scrollHeight;
    }
  }, 25); // Speed: 25ms per word chunk
}

// ─── Send Message ───────────────────────────────────────────────
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isBotTyping) return;

  addMessage(text, true);
  userInput.value = '';
  userInput.style.height = 'auto';
  typingIndicator.style.display = 'flex';

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
  
  try {
    let response;
    let responseBody;
    
    if (isLocal) {
      // Using the local testing key from the remote conflict
      const LOCAL_KEY = ''; // Add your key here for local testing ONLY! 
      
      if (!LOCAL_KEY) {
        addMessage("⚠️ Please add your API key to `script.js` for local testing.", false);
        typingIndicator.style.display = 'none';
        return;
      }

      const url = 'https://api.groq.com/openai/v1/chat/completions';
      
      // Build messages with system prompt + history
      const messages = [
        { role: "system", content: getSystemPrompt() }
      ];
      
      chatHistory.forEach(h => {
        messages.push({
          role: h.role === 'model' ? 'assistant' : 'user',
          content: h.parts[0].text
        });
      });
      
      messages.push({ role: 'user', content: text });

      response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LOCAL_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: messages,
          temperature: 0.7,
          max_tokens: 512
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0]) {
        responseBody = {
          candidates: [{
            content: {
              parts: [{ text: data.choices[0].message.content }]
            }
          }]
        };
      } else {
        responseBody = data;
      }
    } else {
      // Production: Call the secure serverless backend
      response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatHistory
        })
      });
      responseBody = await response.json();
    }

    const data = responseBody;
    typingIndicator.style.display = 'none';

    if (data.candidates && data.candidates[0]) {
      const botResponse = data.candidates[0].content.parts[0].text;
      chatHistory.push({ role: 'user', parts: [{ text: text }] });
      chatHistory.push({ role: 'model', parts: [{ text: botResponse }] });
      
      // Save to memory & history
      extractMemory(text, botResponse);
      saveChatHistory();
      
      addMessage(botResponse, false);
      speak(botResponse);
    } else if (data.error) {
      const errorMsg = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
      addMessage(`⚠️ **Error:** ${errorMsg}`, false);
    } else {
      addMessage("⚠️ Unexpected response. Please try again.", false);
    }
  } catch (err) {
    typingIndicator.style.display = 'none';
    addMessage('❌ **Connection failed.** Check your internet or server status.', false);
  }
}

// ─── Clear Chat ─────────────────────────────────────────────────
function clearChat() {
  chatArea.innerHTML = '';
  chatHistory = [];
  localStorage.removeItem(HISTORY_KEY);
  addMessage("🗑️ Chat cleared! How can I help you?", false);
}

// ─── Event Listeners ────────────────────────────────────────────
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

voiceBtn.addEventListener('click', () => {
  if (!recognition) { alert('Speech recognition not supported in this browser.'); return; }
  if (isListening) recognition.stop(); else recognition.start();
});

userInput.addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
});

// ─── Splash Screen & Init ───────────────────────────────────────
getStartedBtn.addEventListener('click', () => {
  splashScreen.classList.add('splash-hidden');
  
  // Load previous history
  const savedHistory = loadSavedHistory();
  if (savedHistory.length > 0) {
    chatHistory = savedHistory;
  }

  setTimeout(() => {
    const memory = loadMemory();
    const greeting = memory.userName 
      ? `Welcome back, **${memory.userName}**! 👋 How can I help you today?`
      : `Hey there! 👋 I'm **Eshika SmartBot AI** — your smart multilingual assistant.\n\nAsk me anything! 🚀`;
    addMessage(greeting, false);
    speak(greeting);
  }, 500);
});
