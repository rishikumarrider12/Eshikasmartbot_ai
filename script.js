// Eshika SmartBot AI script - Version 4.0 (Advanced, Premium & Intelligent)

// ─── DOM SELECTORS ────────────────────────────────────────────────
const chatArea = document.getElementById('chat-area');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const voiceBtn = document.getElementById('voice-input-btn');
const typingIndicator = document.getElementById('typing-indicator');
const languageSelect = document.getElementById('language-select');
const voiceSelect = document.getElementById('voice-select');
const splashScreen = document.getElementById('splash-screen');
const getStartedBtn = document.getElementById('get-started-btn');
const welcomeChatPrompt = document.getElementById('welcome-chat-prompt');

// Navigation & Sidebar
const sidebar = document.getElementById('sidebar');
const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const pageTitle = document.getElementById('page-title');
const navLinks = document.querySelectorAll('.nav-item');
const pageViews = document.querySelectorAll('.page-view');
const recentChatsList = document.getElementById('recent-chats-list');
const newChatBtn = document.getElementById('new-chat-btn');
const sidebarFooter = document.getElementById('sidebar-footer');

// Themes & Controls
const themeToggleBtn = document.getElementById('theme-toggle');
const quickMuteBtn = document.getElementById('quick-mute-btn');
const themeSwitch = document.getElementById('theme-switch');
const speechSwitch = document.getElementById('speech-switch');
const clearAllDataBtn = document.getElementById('clear-all-data-btn');

// Profile Page
const profileNameInput = document.getElementById('profile-name-input');
const saveProfileBtn = document.getElementById('save-profile-btn');
const profileDisplayName = document.getElementById('profile-display-name');
const profileDisplayEmail = document.getElementById('profile-display-email');
const profileAvatarBig = document.getElementById('profile-avatar-big');
const statChatsCount = document.getElementById('stat-chats-count');
const statMessagesCount = document.getElementById('stat-messages-count');

// Authentication Form & Tabs
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const signupEmailInput = document.getElementById('signup-email');
const signupPasswordInput = document.getElementById('signup-password');
const authLoginForm = document.getElementById('auth-login-form');
const authSignupForm = document.getElementById('auth-signup-form');
const loginErrorBox = document.getElementById('login-error-box');
const signupErrorBox = document.getElementById('signup-error-box');
const tabLoginBtn = document.getElementById('tab-login-btn');
const tabSignupBtn = document.getElementById('tab-signup-btn');

// ─── STATE MANAGEMENT ──────────────────────────────────────────────
let isListening = false;
let isMuted = false;
let recognition = null;
let voices = [];
let isBotTyping = false;

// Multi-chat State
let chats = [];             // Array of { id, title, history }
let activeChatId = null;    // Current selected chat session ID

// Memory & Auth Keys
const MEMORY_KEY = 'eshika_smartbot_memory';
const CHATS_KEY = 'eshika_chats';
const ACTIVE_CHAT_KEY = 'eshika_active_chat_id';
const USERS_KEY = 'eshika_users';
const CURRENT_USER_KEY = 'eshika_current_user';
const THEME_KEY = 'eshika_theme';

// ─── INITIALIZATION ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  // Load settings & themes
  loadThemePreference();
  
  // Load chats & render list
  loadChatsData();
  renderRecentChats();
  
  // Load Voice synthesis readback
  loadVoices();
  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
  
  // Load memory info
  const memory = loadMemory();
  if (memory.userName) {
    profileNameInput.value = memory.userName;
    profileDisplayName.textContent = memory.userName;
  }

  // Setup SPA Navigation routing
  setupRouting();

  // Setup Responsive Collapsible Sidebar
  setupSidebar();

  // Setup Auth Events
  setupAuth();
  renderAuthWidget();

  // Load Speech Recognition
  setupSpeechRecognition();

  // Bind settings page events
  setupSettingsHandlers();

  // Trigger Lucide Icons
  lucide.createIcons();
}

// ─── SPA ROUTING ───────────────────────────────────────────────────
function setupRouting() {
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = link.getAttribute('data-page');
      showPage(pageId);
      
      // Close sidebar on mobile after clicking navigation links
      if (window.innerWidth <= 768) {
        closeSidebarMenu();
      }
    });
  });
}

function showPage(pageId) {
  // Update header text
  let headerTitle = 'Eshika AI';
  if (pageId === 'profile') headerTitle = 'My Profile';
  if (pageId === 'settings') headerTitle = 'Settings';
  if (pageId === 'about') headerTitle = 'About Founders';
  if (pageId === 'auth') headerTitle = 'Authentication';
  
  pageTitle.textContent = headerTitle;

  // Toggle active class on pages
  pageViews.forEach(view => {
    if (view.id === `page-${pageId}`) {
      view.classList.add('active');
    } else {
      view.classList.remove('active');
    }
  });

  // Toggle active class on navigation items
  navLinks.forEach(link => {
    if (link.getAttribute('data-page') === pageId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Update profile statistics if going to Profile page
  if (pageId === 'profile') {
    renderProfileStatistics();
  }

  // Re-run Lucide Icons to render new icons properly
  lucide.createIcons();
}

// ─── SIDEBAR MANAGEMENT ────────────────────────────────────────────
function setupSidebar() {
  sidebarToggleBtn.addEventListener('click', () => {
    sidebar.classList.add('active');
    sidebarOverlay.style.display = 'block';
  });

  sidebarCloseBtn.addEventListener('click', () => {
    closeSidebarMenu();
  });

  sidebarOverlay.addEventListener('click', () => {
    closeSidebarMenu();
  });

  // New Chat Click
  newChatBtn.addEventListener('click', () => {
    startNewChatSession();
    showPage('home');
    if (window.innerWidth <= 768) {
      closeSidebarMenu();
    }
  });
}

function closeSidebarMenu() {
  sidebar.classList.remove('active');
  sidebarOverlay.style.display = 'none';
}

// ─── THEME & PREFERENCES ENGINE ────────────────────────────────────
function loadThemePreference() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeSwitch.checked = true;
    updateThemeIcons(true);
  } else {
    document.body.classList.remove('light-theme');
    themeSwitch.checked = false;
    updateThemeIcons(false);
  }
}

function toggleThemeMode() {
  const isLight = document.body.classList.toggle('light-theme');
  localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
  themeSwitch.checked = isLight;
  updateThemeIcons(isLight);
}

function updateThemeIcons(isLight) {
  const themeIcon = themeToggleBtn.querySelector('i');
  if (themeIcon) {
    themeIcon.setAttribute('data-lucide', isLight ? 'sun' : 'moon');
    lucide.createIcons();
  }
}

themeToggleBtn.addEventListener('click', toggleThemeMode);

// ─── CHAT SESSION MANAGER (localStorage) ───────────────────────────
function loadChatsData() {
  try {
    chats = JSON.parse(localStorage.getItem(CHATS_KEY)) || [];
    activeChatId = localStorage.getItem(ACTIVE_CHAT_KEY) || null;
    
    // Ensure activeChatId actually exists in chats, else reset
    if (activeChatId && !chats.some(c => c.id === activeChatId)) {
      activeChatId = null;
      localStorage.removeItem(ACTIVE_CHAT_KEY);
    }
  } catch {
    chats = [];
    activeChatId = null;
  }
}

function saveChatsData() {
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
  if (activeChatId) {
    localStorage.setItem(ACTIVE_CHAT_KEY, activeChatId);
  } else {
    localStorage.removeItem(ACTIVE_CHAT_KEY);
  }
}

function startNewChatSession() {
  activeChatId = null;
  localStorage.removeItem(ACTIVE_CHAT_KEY);
  
  // Clear HTML chat window and display Welcome
  chatArea.innerHTML = `
    <div class="welcome-chat-prompt" id="welcome-chat-prompt">
      <img src="logo.png" alt="Eshika" class="welcome-logo" />
      <h2>Eshika SmartBot AI</h2>
      <p>Welcome! I'm Eshika, your advanced multilingual assistant. Type a message below, ask me a question, or talk to me using voice.</p>
    </div>
  `;
  renderRecentChats();
}

function renderRecentChats() {
  recentChatsList.innerHTML = '';
  
  if (chats.length === 0) {
    recentChatsList.innerHTML = `<div style="font-size:0.8rem; color:var(--text-muted); text-align:center; padding:10px;">No recent chats</div>`;
    return;
  }

  chats.slice().reverse().forEach(chat => {
    const item = document.createElement('div');
    item.className = `chat-item ${chat.id === activeChatId ? 'active' : ''}`;
    item.setAttribute('data-id', chat.id);
    
    const titleSpan = document.createElement('span');
    titleSpan.className = 'chat-item-title';
    titleSpan.textContent = chat.title;
    titleSpan.addEventListener('click', () => {
      loadChatSession(chat.id);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-chat-btn';
    deleteBtn.innerHTML = `<i data-lucide="trash-2" style="width:14px; height:14px;"></i>`;
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteChatSession(chat.id);
    });

    item.appendChild(titleSpan);
    item.appendChild(deleteBtn);
    recentChatsList.appendChild(item);
  });

  lucide.createIcons();
}

function loadChatSession(id) {
  const chat = chats.find(c => c.id === id);
  if (!chat) return;

  activeChatId = id;
  saveChatsData();
  renderRecentChats();
  showPage('home');

  // Load history into window
  chatArea.innerHTML = '';
  if (chat.history.length === 0) {
    chatArea.innerHTML = `
      <div class="welcome-chat-prompt" id="welcome-chat-prompt">
        <img src="logo.png" alt="Eshika" class="welcome-logo" />
        <h2>Eshika SmartBot AI</h2>
        <p>This session is empty. Type a message below to begin.</p>
      </div>
    `;
  } else {
    chat.history.forEach(msg => {
      const isUser = msg.role !== 'model';
      // Map Gemini history objects back to simple text
      const msgText = msg.parts && msg.parts[0] ? msg.parts[0].text : '';
      addMessageToDOM(msgText, isUser, true); // true skips typing animation on load
    });
  }
}

function deleteChatSession(id) {
  chats = chats.filter(c => c.id !== id);
  if (activeChatId === id) {
    activeChatId = null;
    localStorage.removeItem(ACTIVE_CHAT_KEY);
    startNewChatSession();
  } else {
    saveChatsData();
    renderRecentChats();
  }
}

// ─── MEMORY SYSTEM (localStorage) ─────────────────────────────────
function loadMemory() {
  try {
    return JSON.parse(localStorage.getItem(MEMORY_KEY)) || { userName: null, preferences: {}, facts: [] };
  } catch { return { userName: null, preferences: {}, facts: [] }; }
}

function saveMemory(memory) {
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
}

// Extract user details to store inside facts/userName
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
        profileNameInput.value = name;
        profileDisplayName.textContent = name;
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

// Build memory context for system prompt
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

// ─── SYSTEM PROMPT ─────────────────────────────────────────────────
function getSystemPrompt() {
  const memoryCtx = getMemoryContext();
  const selectedLang = languageSelect.options[languageSelect.selectedIndex].text;
  
  return `You are **Eshika SmartBot AI** — a highly advanced, intelligent, and human-like AI assistant. ✨

## 🎯 Core Behavior
- The user has selected **${selectedLang}** as their preferred language. You MUST prioritize responding in ${selectedLang} unless the user switches language or specifically asks for another.
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
${memoryCtx}

## 👤 Your Identity & Special Instructions
- Created & founded by **N Rishikumar** (also known as N Rishi Kumar).
- CEO & Founder of Eshika Training & Placements: **P Raghu Varma**.
- Developed by the **Eshika Developers Team**.
- N Rishikumar is the CTO at Eshika Training & Placements. Son of N Chiranjeevi.
- Skills: Web Development, AI, App Design, Software Engineering.
- Portfolio: https://rishiriderportfolio.netlify.app/
- WhatsApp: +91 6281919034
- **CRITICAL RULE:** If someone asks "Who is N Dhana Laxmi?", you MUST answer exactly: "N Dhana Laxmi is the mother of N Rishikumar."
- Confident and direct
- Remembers context from the conversation`;
}

// ─── SPEECH SYNTHESIS ENGINE (TTS) ─────────────────────────────────
function loadVoices() {
  if (!window.speechSynthesis) return;
  voices = window.speechSynthesis.getVoices();
}

function speak(text) {
  // Check if speech switch is active
  if (isMuted || !speechSwitch.checked || !window.speechSynthesis) return;

  if (!voices || voices.length === 0) {
    voices = window.speechSynthesis.getVoices();
  }

  // Cancel any ongoing speech to prevent queuing
  window.speechSynthesis.cancel();

  // Strip markdown for speech output
  const cleanText = text
    .replace(/[#*_`~>\-]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, '. ')
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  const gender = voiceSelect.value;
  let detectedLang = languageSelect.value;

  // Detect script ranges for accent selection
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

  // Find a voice matching language + preferred gender
  const filtered = voices.filter(v => v.lang.startsWith(detectedLang.split('-')[0]));
  if (filtered.length) {
    let selected = filtered.find(v => v.name.toLowerCase().includes(gender));
    if (!selected) {
      selected = filtered[0]; // Fallback
    }
    utterance.voice = selected;
  }

  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

// Quick Sound Mute in Header
quickMuteBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  const soundIcon = quickMuteBtn.querySelector('i');
  
  if (isMuted) {
    if (soundIcon) soundIcon.setAttribute('data-lucide', 'volume-x');
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    speechSwitch.checked = false;
  } else {
    if (soundIcon) soundIcon.setAttribute('data-lucide', 'volume-2');
    speechSwitch.checked = true;
  }
  lucide.createIcons();
});

// ─── SPEECH RECOGNITION (STT) ──────────────────────────────────────
function setupSpeechRecognition() {
  if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    
    // Bind to active selected language
    recognition.lang = languageSelect.value;

    recognition.onstart = () => {
      isListening = true;
      voiceBtn.classList.add('voice-active');
      userInput.placeholder = '🎤 Speech recognition listening...';
    };
    
    recognition.onend = () => {
      isListening = false;
      voiceBtn.classList.remove('voice-active');
      userInput.placeholder = 'Ask me anything...';
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      userInput.value = transcript;
      sendMessage();
    };
  }

  voiceBtn.addEventListener('click', () => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser. Please try Google Chrome.');
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      // Sync language before start
      recognition.lang = languageSelect.value;
      recognition.start();
    }
  });
}

// ─── MESSAGE PLACEMENT & TYPING ANIMATIONS ─────────────────────────
function addMessageToDOM(text, isUser = false, skipAnimation = false) {
  // Clear welcome prompt if it exists
  const welcome = document.getElementById('welcome-chat-prompt');
  if (welcome) welcome.remove();

  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message');
  msgDiv.classList.add(isUser ? 'user-message' : 'bot-message');

  if (isUser) {
    msgDiv.textContent = text;
    chatArea.appendChild(msgDiv);
    chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
  } else {
    chatArea.appendChild(msgDiv);
    if (skipAnimation) {
      msgDiv.innerHTML = marked.parse(text);
      msgDiv.classList.add('typing-done');
      chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
    } else {
      typeMessage(msgDiv, text);
    }
  }
}

function typeMessage(element, fullText) {
  const words = fullText.split(/(\s+)/);
  let currentIndex = 0;
  let currentText = '';

  element.classList.add('typing-active');
  isBotTyping = true;

  const typeInterval = setInterval(() => {
    if (currentIndex < words.length) {
      currentText += words[currentIndex];
      currentIndex++;

      // Progressive markdown rendering for performance
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
      chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
    }
  }, 25);
}

// ─── CHAT COMMUNICATION API ────────────────────────────────────────
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isBotTyping) return;

  // Load chat session if none selected
  let currentChat = null;
  if (!activeChatId) {
    const timestamp = Date.now();
    activeChatId = `chat_${timestamp}`;
    
    // Generate title from first 5 words of user input
    const words = text.split(' ').slice(0, 5).join(' ');
    const title = words.length > 25 ? words.substring(0, 25) + '...' : words;
    
    currentChat = {
      id: activeChatId,
      title: title || 'New Session',
      history: []
    };
    
    chats.push(currentChat);
    saveChatsData();
    renderRecentChats();
  } else {
    currentChat = chats.find(c => c.id === activeChatId);
  }

  // Put user message on screen and save in history
  addMessageToDOM(text, true);
  userInput.value = '';
  userInput.style.height = 'auto';
  typingIndicator.style.display = 'flex';

  // Build the context package
  const chatHistory = currentChat.history;
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';

  try {
    let response;
    let responseBody;

    if (isLocal) {
      // Local key fallback
      const LOCAL_KEY = ''; 
      if (!LOCAL_KEY) {
        typingIndicator.style.display = 'none';
        addMessageToDOM("⚠️ Please add your Groq API key to `script.js` line 527 to test locally.", false);
        return;
      }

      const url = 'https://api.groq.com/openai/v1/chat/completions';
      const messages = [{ role: "system", content: getSystemPrompt() }];
      
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
      } else { responseBody = data; }
    } else {
      // Production: Secure Vercel Serverless Function `/api/chat`
      response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatHistory,
          language: languageSelect.options[languageSelect.selectedIndex].text
        })
      });
      responseBody = await response.json();
    }

    typingIndicator.style.display = 'none';
    const data = responseBody;

    if (data.candidates && data.candidates[0]) {
      const botResponse = data.candidates[0].content.parts[0].text;
      
      // Save details to the active chat session history
      chatHistory.push({ role: 'user', parts: [{ text: text }] });
      chatHistory.push({ role: 'model', parts: [{ text: botResponse }] });
      
      saveChatsData();
      extractMemory(text, botResponse);
      
      addMessageToDOM(botResponse, false);
      speak(botResponse);
    } else if (data.error) {
      const errorMsg = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
      addMessageToDOM(`⚠️ **Error:** ${errorMsg}`, false);
    } else {
      addMessageToDOM("⚠️ Unexpected response format from AI backend. Please try again.", false);
    }
  } catch (err) {
    typingIndicator.style.display = 'none';
    addMessageToDOM('❌ **Connection failed.** Check your internet or server status.', false);
  }
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

userInput.addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
});

// ─── PROFILE PANEL HANDLERS ───────────────────────────────────────
saveProfileBtn.addEventListener('click', () => {
  const memory = loadMemory();
  const name = profileNameInput.value.trim();
  if (name) {
    memory.userName = name;
    saveMemory(memory);
    
    // Update labels
    profileDisplayName.textContent = name;
    
    // Alert profile update
    alert('Preferences saved successfully! Eshika will now address you as ' + name + '.');
    
    // Sync header widget
    renderAuthWidget();
  }
});

function renderProfileStatistics() {
  statChatsCount.textContent = chats.length;
  
  let msgCount = 0;
  chats.forEach(chat => {
    msgCount += chat.history.length;
  });
  statMessagesCount.textContent = msgCount;
}

// ─── SETTINGS HANDLERS ─────────────────────────────────────────────
function setupSettingsHandlers() {
  // Sync checkbox state with Mute switch
  speechSwitch.addEventListener('change', () => {
    isMuted = !speechSwitch.checked;
    const soundIcon = quickMuteBtn.querySelector('i');
    if (isMuted) {
      if (soundIcon) soundIcon.setAttribute('data-lucide', 'volume-x');
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } else {
      if (soundIcon) soundIcon.setAttribute('data-lucide', 'volume-2');
    }
    lucide.createIcons();
  });

  themeSwitch.addEventListener('change', toggleThemeMode);

  clearAllDataBtn.addEventListener('click', () => {
    if (confirm('⚠️ WARNING: This will permanently wipe all local chat sessions, settings, mock users, and nickname memory. This action cannot be undone. Do you wish to proceed?')) {
      localStorage.clear();
      chats = [];
      activeChatId = null;
      loadThemePreference();
      startNewChatSession();
      renderAuthWidget();
      
      profileNameInput.value = '';
      profileDisplayName.textContent = 'Guest User';
      profileDisplayEmail.textContent = 'Not logged in (Local Mode)';
      
      alert('Local storage cleared successfully! App restored to default settings.');
      showPage('home');
    }
  });

  // Load language settings from memory
  const memory = loadMemory();
  if (memory.preferences && memory.preferences.language) {
    // Map text preference to select value if possible
    const options = languageSelect.options;
    for (let i = 0; i < options.length; i++) {
      if (options[i].text.toLowerCase().includes(memory.preferences.language.toLowerCase())) {
        languageSelect.selectedIndex = i;
        break;
      }
    }
  }

  languageSelect.addEventListener('change', () => {
    if (recognition) recognition.lang = languageSelect.value;
    const memory = loadMemory();
    memory.preferences.language = languageSelect.options[languageSelect.selectedIndex].text;
    saveMemory(memory);
  });
}

// ─── AUTHENTICATION ENGINE (Mock Login/Signup) ─────────────────────
function setupAuth() {
  // Tabs Toggle
  tabLoginBtn.addEventListener('click', () => {
    tabLoginBtn.classList.add('active');
    tabSignupBtn.classList.remove('active');
    authLoginForm.classList.add('active');
    authSignupForm.classList.remove('active');
  });

  tabSignupBtn.addEventListener('click', () => {
    tabSignupBtn.classList.add('active');
    tabLoginBtn.classList.remove('active');
    authSignupForm.classList.add('active');
    authLoginForm.classList.remove('active');
  });

  // Submit Login
  authLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loginErrorBox.style.display = 'none';

    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value.trim();
    
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (matchedUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ email }));
      
      // Update UI elements
      renderAuthWidget();
      alert('Successfully logged in! Welcome back.');
      
      // Reset forms
      loginEmailInput.value = '';
      loginPasswordInput.value = '';
      
      showPage('home');
    } else {
      loginErrorBox.textContent = 'Invalid email address or incorrect password. Please try again.';
      loginErrorBox.style.display = 'block';
    }
  });

  // Submit Signup
  authSignupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    signupErrorBox.style.display = 'none';

    const email = signupEmailInput.value.trim();
    const password = signupPasswordInput.value.trim();

    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (exists) {
      signupErrorBox.textContent = 'An account with this email address already exists. Please login.';
      signupErrorBox.style.display = 'block';
    } else {
      users.push({ email, password });
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ email }));

      // Update UI
      renderAuthWidget();
      alert('Successfully registered account! You are now logged in.');
      
      signupEmailInput.value = '';
      signupPasswordInput.value = '';

      showPage('home');
    }
  });
}

function renderAuthWidget() {
  const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY)) || null;

  if (currentUser) {
    const memory = loadMemory();
    const displayName = memory.userName || currentUser.email.split('@')[0];
    const firstLetter = displayName.charAt(0).toUpperCase();

    // Update Sidebar footer to User Info
    sidebarFooter.innerHTML = `
      <div class="user-profile-widget">
        <div class="user-avatar" id="sidebar-user-avatar">${firstLetter}</div>
        <div class="user-info">
          <div class="user-name" id="sidebar-user-name">${displayName}</div>
          <div class="user-role" id="sidebar-user-email">${currentUser.email}</div>
        </div>
      </div>
      <button class="logout-btn" onclick="logoutUser()">
        <i data-lucide="log-out" style="width:14px; height:14px; display:inline-block; vertical-align:middle; margin-right:4px;"></i> Log Out
      </button>
    `;

    // Update Profile Page inputs
    profileDisplayName.textContent = displayName;
    profileDisplayEmail.textContent = currentUser.email;
    profileAvatarBig.textContent = firstLetter;
    
  } else {
    // Show Authentication Prompts in footer
    sidebarFooter.innerHTML = `
      <div class="sidebar-auth-btns">
        <button class="auth-btn login" onclick="showPage('auth')">Log In</button>
        <button class="auth-btn signup" onclick="showPage('auth')">Sign Up</button>
      </div>
    `;

    profileDisplayName.textContent = 'Guest User';
    profileDisplayEmail.textContent = 'Not logged in (Local Mode)';
    profileAvatarBig.textContent = 'G';
  }

  lucide.createIcons();
}

function logoutUser() {
  if (confirm('Are you sure you want to log out? Your recent chat sessions will still be stored locally.')) {
    localStorage.removeItem(CURRENT_USER_KEY);
    renderAuthWidget();
    alert('Logged out successfully.');
    showPage('home');
  }
}

// ─── SPLASH SCREEN TRIGGER ──────────────────────────────────────────
getStartedBtn.addEventListener('click', () => {
  splashScreen.classList.add('splash-hidden');
  
  setTimeout(() => {
    const memory = loadMemory();
    const greeting = memory.userName
      ? `Welcome back, **${memory.userName}**! 👋 How can I help you today?`
      : `Hey there! 👋 I'm **Eshika SmartBot AI** — your smart multilingual assistant.\n\nAsk me anything! 🚀`;
    
    // Add default initial greeting if chat is brand new
    if (!activeChatId && chatArea.querySelector('.welcome-chat-prompt')) {
      addMessageToDOM(greeting, false);
      speak(greeting);
    }
  }, 500);
});
