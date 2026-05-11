'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LogOut, Send, Mic, Volume2, VolumeX, Trash2, User, ChevronDown, Settings, Github } from 'lucide-react'
import { marked } from 'marked'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isBotTyping, setIsBotTyping] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [language, setLanguage] = useState('en-US')
  const [voice, setVoice] = useState('female')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const chatAreaRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        addBotMessage(`Welcome back, **${session.user.user_metadata?.full_name || 'User'}**! 👋 How can I help you today?`)
      } else {
        router.push('/login')
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const addBotMessage = (text) => {
    setMessages(prev => [...prev, { role: 'bot', text, id: Date.now() }])
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isBotTyping) return
    
    const userText = input.trim()
    setMessages(prev => [...prev, { role: 'user', text: userText, id: Date.now() }])
    setInput('')
    setIsBotTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages.map(m => ({ 
            role: m.role === 'bot' ? 'model' : 'user', 
            parts: [{ text: m.text }] 
          })),
          language: language
        })
      })
      const data = await response.json()
      setIsBotTyping(false)

      if (data.candidates && data.candidates[0]) {
        const botResponse = data.candidates[0].content.parts[0].text
        addBotMessage(botResponse)
        if (!isMuted) speak(botResponse)
      }
    } catch (err) {
      setIsBotTyping(false)
      addBotMessage("❌ **Connection failed.** Please try again.")
    }
  }

  const speak = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text.replace(/[#*_`~>\-]/g, ''))
    utterance.lang = language
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight
    }
  }, [messages, isBotTyping])

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="header-brand">
          <img src="/logo.png" alt="Eshika Logo" className="header-logo" />
          <h1 className="header-title">Eshika AI</h1>
        </div>
        
        <div className="header-actions">
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="header-select">
            <option value="en-US">English</option>
            <option value="te-IN">Telugu</option>
            <option value="hi-IN">Hindi</option>
          </select>
          
          <button onClick={() => setIsMuted(!isMuted)} className="header-icon-btn">
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          <button onClick={() => setMessages([])} className="header-icon-btn">
            <Trash2 size={20} />
          </button>

          <div className="profile-dropdown-container">
            <button className="profile-trigger" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <div className="avatar">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <ChevronDown size={16} />
            </button>

            {showProfileMenu && (
              <div className="profile-menu">
                <div className="menu-header">
                  <p className="menu-name">{user?.user_metadata?.full_name || 'User'}</p>
                  <p className="menu-email">{user?.email}</p>
                </div>
                <div className="menu-divider" />
                <button className="menu-item"><Settings size={16} /> Settings</button>
                <button className="menu-item" onClick={handleLogout}><LogOut size={16} /> Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="chat-container" ref={chatAreaRef}>
        {messages.map((m) => (
          <div key={m.id} className={`message-wrapper ${m.role}`}>
            <div className="message-content" dangerouslySetInnerHTML={{ __html: marked.parse(m.text) }} />
          </div>
        ))}
        {isBotTyping && (
          <div className="message-wrapper bot">
            <div className="typing-indicator">Eshika is thinking...</div>
          </div>
        )}
      </main>

      <footer className="chat-input-area">
        <div className="input-box">
          <textarea 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
            placeholder="Type your message..."
            rows={1}
          />
          <div className="input-btns">
            <button className="voice-btn"><Mic size={20} /></button>
            <button className="send-btn" onClick={handleSendMessage} disabled={isBotTyping}>
              <Send size={20} />
            </button>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .dashboard-layout {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #0f172a;
          color: white;
        }
        .dashboard-header {
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .header-brand { display: flex; align-items: center; gap: 12px; }
        .header-logo { width: 32px; height: 32px; }
        .header-title { font-size: 1.25rem; font-weight: 700; }
        .header-actions { display: flex; align-items: center; gap: 16px; }
        .header-select { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 6px 12px; border-radius: 8px; font-size: 0.875rem; }
        .header-icon-btn { background: none; border: none; color: #94a3b8; cursor: pointer; transition: color 0.2s; }
        .header-icon-btn:hover { color: white; }
        .profile-dropdown-container { position: relative; }
        .profile-trigger { display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; color: #94a3b8; }
        .avatar { width: 32px; height: 32px; border-radius: 50%; background: #8b5cf6; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.875rem; }
        .profile-menu { position: absolute; top: calc(100% + 12px); right: 0; width: 220px; background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5); z-index: 100; overflow: hidden; }
        .menu-header { padding: 16px; }
        .menu-name { font-weight: 600; font-size: 0.875rem; }
        .menu-email { font-size: 0.75rem; color: #94a3b8; }
        .menu-divider { height: 1px; background: rgba(255,255,255,0.1); }
        .menu-item { width: 100%; text-align: left; padding: 12px 16px; background: none; border: none; color: #f8fafc; font-size: 0.875rem; cursor: pointer; display: flex; align-items: center; gap: 10px; }
        .menu-item:hover { background: rgba(255,255,255,0.05); }
        .chat-container { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 24px; }
        .message-wrapper { max-width: 80%; }
        .message-wrapper.user { align-self: flex-end; }
        .message-wrapper.bot { align-self: flex-start; }
        .message-content { padding: 16px; border-radius: 16px; font-size: 1rem; line-height: 1.6; }
        .user .message-content { background: #8b5cf6; color: white; border-bottom-right-radius: 4px; }
        .bot .message-content { background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255,255,255,0.1); border-bottom-left-radius: 4px; }
        .chat-input-area { padding: 24px; background: #0f172a; }
        .input-box { max-width: 800px; margin: 0 auto; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 8px 16px; display: flex; align-items: flex-end; gap: 12px; }
        .input-box textarea { flex: 1; background: none; border: none; color: white; padding: 12px 0; font-size: 1rem; resize: none; max-height: 150px; outline: none; }
        .input-btns { display: flex; gap: 8px; padding-bottom: 8px; }
        .voice-btn, .send-btn { background: none; border: none; color: #94a3b8; cursor: pointer; transition: all 0.2s; padding: 8px; border-radius: 8px; }
        .send-btn { color: #8b5cf6; }
        .send-btn:hover { background: rgba(139, 92, 246, 0.1); transform: scale(1.1); }
        .voice-btn:hover { color: white; background: rgba(255,255,255,0.05); }
        .typing-indicator { font-size: 0.875rem; color: #94a3b8; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
      `}</style>
    </div>
  )
}
