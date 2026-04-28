const API_KEY = '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';
const chatArea = document.getElementById('chat-area');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const voiceBtn = document.getElementById('voice-input-btn');
const typingIndicator = document.getElementById('typing-indicator');
const languageSelect = document.getElementById('language-select');
const muteBtn = document.getElementById('mute-btn');
const splashScreen = document.getElementById('splash-screen');
const getStartedBtn = document.getElementById('get-started-btn');

let isListening = false;
let isMuted = false;
let recognition;

// Initialize Speech Recognition
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = languageSelect.value;

    recognition.onstart = () => {
        isListening = true;
        voiceBtn.classList.add('voice-active');
        userInput.placeholder = "Listening...";
    };

    recognition.onend = () => {
        isListening = false;
        voiceBtn.classList.remove('voice-active');
        userInput.placeholder = "Type your message...";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        sendMessage();
    };
}

// Handle Language Change
languageSelect.addEventListener('change', () => {
    if (recognition) {
        recognition.lang = languageSelect.value;
    }
});

// Handle Mute
muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
    if (isMuted) {
        window.speechSynthesis.cancel();
    }
});

// Speak Function
function speak(text) {
    if (isMuted) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageSelect.value;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
}

// Add Message to UI
function addMessage(text, isUser = false) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    msgDiv.classList.add(isUser ? 'user-message' : 'bot-message');

    if (isUser) {
        msgDiv.textContent = text;
    } else {
        // Render Markdown for bot messages
        msgDiv.innerHTML = marked.parse(text);
    }

    chatArea.appendChild(msgDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Send Message to OpenAI
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, true);
    userInput.value = '';
    userInput.style.height = 'auto';

    typingIndicator.style.display = 'block';
    chatArea.scrollTop = chatArea.scrollHeight;

    const currentLang = languageSelect.options[languageSelect.selectedIndex].text;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'Eshika SmartBot AI'
            },
            body: JSON.stringify({
                model: 'openai/gpt-3.5-turbo',
                messages: [
                    { 
                        role: 'system', 
                        content: `You are Eshika SmartBot AI. 
                        - CEO & Founder of Eshika: P Raghu Varma.
                        - Founder of Eshika Smartbot: N Rishikumar (Son of N Chiranjeevi).
                        - Developed by: Eshika Developers Team.
                        The user is speaking in ${currentLang}. Please reply in ${currentLang} and be smart and helpful.` 
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
            addMessage(`**OpenAI Error:** ${data.error.message}`, false);
        } else {
            addMessage("I'm sorry, I'm having trouble connecting to my brain right now.", false);
        }
    } catch (error) {
        console.error('Error:', error);
        typingIndicator.style.display = 'none';
        addMessage("Error: Failed to fetch response. Please check your API key or connection.", false);
    }
}

// Event Listeners
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

voiceBtn.addEventListener('click', () => {
    if (!recognition) {
        alert("Speech recognition is not supported in this browser.");
        return;
    }
    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
    }
});

// Auto-resize textarea
userInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Splash Screen Logic
getStartedBtn.addEventListener('click', () => {
    splashScreen.classList.add('splash-hidden');
    // Speak welcome message when starting
    setTimeout(() => {
        const welcomeMsg = "Hello! I am Eshika SmartBot AI, your intelligent multilingual companion. I was founded by N Rishikumar and led by CEO P Raghu Varma. How can I help you today?";
        addMessage(welcomeMsg, false);
        speak(welcomeMsg);
    }, 500);
});

// Welcome message removed from window.onload to be triggered by Get Started
window.onload = () => {
    // Initial setup if needed
};
