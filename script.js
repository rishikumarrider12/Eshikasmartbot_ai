// Eshika SmartBot AI script - Version 2.0 (Secure & Intelligent)

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

languageSelect.addEventListener('change', () => {
  if (recognition) recognition.lang = languageSelect.value;
});

muteBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  muteBtn.textContent = isMuted ? '🔇' : '🔊';
  if (isMuted) window.speechSynthesis.cancel();
});

function speak(text) {
  if (isMuted) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = languageSelect.value;
  const gender = voiceSelect.value;
  
  const filtered = voices.filter(v => v.lang.startsWith(languageSelect.value.split('-')[0]));
  if (filtered.length) {
    let selected = filtered.find(v => v.name.toLowerCase().includes(gender));
    if (!selected) selected = filtered[0];
    utterance.voice = selected;
  }
  window.speechSynthesis.speak(utterance);
}

function addMessage(text, isUser = false) {
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

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, true);
  userInput.value = '';
  userInput.style.height = 'auto';
  typingIndicator.style.display = 'block';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        history: chatHistory
      })
    });

    const data = await response.json();
    typingIndicator.style.display = 'none';

    if (data.candidates && data.candidates[0]) {
      const botResponse = data.candidates[0].content.parts[0].text;
      chatHistory.push({ role: 'user', parts: [{ text: text }] });
      chatHistory.push({ role: 'model', parts: [{ text: botResponse }] });
      addMessage(botResponse, false);
      speak(botResponse);
    } else if (data.error) {
      // Show the specific error from the server
      addMessage(`**Backend Error:** ${data.error}`, false);
    } else {
      addMessage("I encountered an unexpected response. Please check your Vercel logs.", false);
    }
  } catch (err) {
    typingIndicator.style.display = 'none';
    addMessage('Error: Failed to connect to server. Ensure you are running on Vercel.', false);
  }
}

function clearChat() {
  chatArea.innerHTML = '';
  chatHistory = [];
  addMessage("Chat history cleared. How can I help you now?", false);
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

voiceBtn.addEventListener('click', () => {
  if (!recognition) { alert('Speech recognition not supported.'); return; }
  if (isListening) recognition.stop(); else recognition.start();
});

userInput.addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
});

getStartedBtn.addEventListener('click', () => {
  splashScreen.classList.add('splash-hidden');
  setTimeout(() => {
    const welcomeMsg = "Hello! I am Eshika SmartBot AI, your intelligent multilingual companion. Founded by N Rishikumar (Son of N Chiranjeevi). How can I help you today?";
    addMessage(welcomeMsg, false);
    speak(welcomeMsg);
  }, 500);
});
