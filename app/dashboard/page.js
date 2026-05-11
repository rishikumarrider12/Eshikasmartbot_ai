'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LogOut, Send, Mic, Volume2, VolumeX, Trash2, User, ChevronDown, Settings } from 'lucide-react'
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


    </div>
  )
}
