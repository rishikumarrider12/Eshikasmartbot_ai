'use client'

import Link from 'next/link'
import { ArrowRight, Bot, Shield, Zap, Globe } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="landing-container">
      <nav className="nav">
        <div className="nav-content">
          <div className="brand">
            <img src="/logo.png" alt="Logo" className="logo" />
            <span className="brand-name">Eshika AI</span>
          </div>
          <div className="nav-links">
            <Link href="/login" className="nav-btn-link">Login</Link>
            <Link href="/signup" className="nav-btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="hero">
        <div className="hero-content">
          <div className="badge">Founded by N Rishikumar</div>
          <h1 className="hero-title">
            The Next Generation of <br />
            <span className="gradient-text">Multilingual AI</span>
          </h1>
          <p className="hero-subtitle">
            Experience the power of Eshika SmartBot AI. Intelligent, secure, and human-like 
            conversations in over 25 languages.
          </p>
          <div className="hero-btns">
            <Link href="/signup" className="hero-btn-primary">
              Start Chatting Now <ArrowRight size={20} />
            </Link>
            <Link href="/login" className="hero-btn-secondary">
              Sign In
            </Link>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <Bot className="feature-icon" />
            <h3>Intelligent Bot</h3>
            <p>Advanced Llama-powered intelligence for smart replies.</p>
          </div>
          <div className="feature-card">
            <Globe className="feature-icon" />
            <h3>25+ Languages</h3>
            <p>Seamless communication in Telugu, Hindi, and more.</p>
          </div>
          <div className="feature-card">
            <Shield className="feature-icon" />
            <h3>Secure Auth</h3>
            <p>Professional grade authentication and data protection.</p>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2026 Eshika SmartBot AI. Developed by Eshika Developers Team.</p>
      </footer>

      <style jsx>{`
        .landing-container {
          min-height: 100vh;
          background: #0f172a;
          color: white;
          overflow-x: hidden;
        }
        .nav {
          padding: 24px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .nav-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .brand { display: flex; align-items: center; gap: 12px; }
        .logo { width: 32px; height: 32px; }
        .brand-name { font-size: 1.5rem; font-weight: 700; }
        .nav-links { display: flex; gap: 24px; align-items: center; }
        .nav-btn-link { color: #94a3b8; text-decoration: none; font-weight: 500; transition: color 0.2s; }
        .nav-btn-link:hover { color: white; }
        .nav-btn-primary { background: #8b5cf6; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; transition: all 0.2s; }
        .nav-btn-primary:hover { background: #7c3aed; transform: translateY(-1px); }
        
        .hero {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 24px;
          text-align: center;
        }
        .badge {
          display: inline-block;
          background: rgba(139, 92, 246, 0.1);
          color: #a78bfa;
          padding: 6px 16px;
          border-radius: 99px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 32px;
          border: 1px solid rgba(139, 92, 246, 0.2);
        }
        .hero-title { font-size: 4rem; font-weight: 800; line-height: 1.1; margin-bottom: 24px; }
        .gradient-text { background: linear-gradient(to right, #a78bfa, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-subtitle { font-size: 1.25rem; color: #94a3b8; max-width: 600px; margin: 0 auto 40px; }
        .hero-btns { display: flex; gap: 16px; justify-content: center; }
        .hero-btn-primary { background: #8b5cf6; color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .hero-btn-primary:hover { background: #7c3aed; transform: scale(1.05); }
        .hero-btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; transition: all 0.2s; }
        .hero-btn-secondary:hover { background: rgba(255,255,255,0.1); }
        
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; margin-top: 100px; }
        .feature-card { background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255,255,255,0.05); padding: 32px; border-radius: 24px; text-align: left; }
        .feature-icon { color: #8b5cf6; margin-bottom: 16px; width: 32px; height: 32px; }
        .feature-card h3 { margin-bottom: 12px; font-size: 1.25rem; }
        .feature-card p { color: #94a3b8; font-size: 0.875rem; }
        
        .footer { margin-top: 100px; padding: 40px 0; border-top: 1px solid rgba(255,255,255,0.05); color: #64748b; font-size: 0.875rem; }
        
        @media (max-width: 768px) {
          .hero-title { font-size: 2.5rem; }
          .features-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
