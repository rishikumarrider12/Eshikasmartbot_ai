// Eshika SmartBot AI script
const API_KEY = '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';

// DOM elements
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

// Load speech synthesis voices
function loadVoices() {
  voices = window.speechSynthesis.getVoices();
}
window.speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

// Initialize Speech Recognition if supported
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = languageSelect.value;

  recognition.onstart = () => {
    isListening = true;
    voiceBtn.classList.add('voice-active');
    userInput.placeholder = 'Listening...';
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

// Update language for recognition and synthesis
languageSelect.addEventListener('change', () => {
  if (recognition) recognition.lang = languageSelect.value;
});

// Voice gender selection – handled in speak()
voiceSelect.addEventListener('change', () => {});

// Mute toggle
muteBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  muteBtn.textContent = isMuted ? '🔇' : '🔊';
  if (isMuted) window.speechSynthesis.cancel();
});

// Speech synthesis helper
function speak(text) {
  if (isMuted) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = languageSelect.value;
  const gender = voiceSelect.value; // 'male' or 'female'
  
  // Try to find a voice that matches language and gender
  const filtered = voices.filter(v => v.lang.startsWith(languageSelect.value.split('-')[0]));
  if (filtered.length) {
    let selected = filtered.find(v => v.name.toLowerCase().includes(gender));
    if (!selected) selected = filtered[0];
    utterance.voice = selected;
  }
  
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

// Add message bubble to chat UI
function addMessage(text, isUser = false) {
  // Suppress duplicate OpenAI error messages
  if (!isUser && text.includes('OpenAI Error')) {
    const last = chatArea.lastElementChild;
    if (last && last.classList.contains('bot-message') && last.textContent.includes('OpenAI Error')) {
      console.warn('Duplicate OpenAI error suppressed');
      return;
    }
  }
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message');
  msgDiv.classList.add(isUser ? 'user-message' : 'bot-message');
  if (isUser) {
    msgDiv.textContent = text;
  } else {
    msgDiv.innerHTML = marked.parse(text);
  }
  chatArea.appendChild(msgDiv);
  chatArea.scrollTop = chatArea.scrollHeight;
}

// Send message to OpenRouter (OpenAI) backend
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  addMessage(text, true);
  userInput.value = '';
  userInput.style.height = 'auto';
  typingIndicator.style.display = 'block';

  const currentLang = languageSelect.options[languageSelect.selectedIndex].text;
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Referer': window.location.href,
        'X-Title': 'Eshika SmartBot AI'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-lite-preview-02-05:free',
        messages: [
          {
            role: 'system',
            content: `You are Eshika SmartBot AI.\n- CEO & Founder of Eshika: P Raghu Varma\n- Founder of Eshika Smartbot: N Rishikumar (Son of N Chiranjeevi)\n- Developed by Eshika Developers Team.\nThe user is speaking in ${currentLang}. Please reply in ${currentLang} and be smart and helpful.`
          },
          { role: 'user', content: text }
        ]
      })
    });
    const data = await response.json();
    typingIndicator.style.display = 'none';
    if (data.choices && data.choices[0]) {
      const botResponse = data.choices[0].message.content;
      addMessage(botResponse, false);
      speak(botResponse);
    } else if (data.error) {
      let errMsg = data.error.message;
      if (errMsg.includes('User not found')) {
        errMsg = 'Invalid user/account. Check your API key.';
      }
      // Avoid duplicating "OpenAI Error" prefix
      if (errMsg.toLowerCase().startsWith('openai error')) {
        addMessage(errMsg, false);
      } else {
        addMessage(`**OpenAI Error:** ${errMsg}`, false);
      }
    } else {
      addMessage("I'm having trouble connecting to my brain right now.", false);
    }
  } catch (err) {
    console.error(err);
    typingIndicator.style.display = 'none';
    addMessage('Error: Failed to fetch response. Check API key or connection.', false);
  }
}

// Event listeners
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

// Auto-resize textarea
userInput.addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
});

// Splash screen handling – stays until Get Started is clicked
getStartedBtn.addEventListener('click', () => {
  splashScreen.classList.add('splash-hidden');
  // Speak welcome message when starting
  setTimeout(() => {
    const welcomeMsg = "Hello! I am Eshika SmartBot AI, your intelligent multilingual companion. I was founded by N Rishikumar and led by CEO P Raghu Varma. How can I help you today?";
    addMessage(welcomeMsg, false);
    speak(welcomeMsg);
  }, 500);
});

// Initial setup
window.onload = () => {
  // Initial setup if needed
};
