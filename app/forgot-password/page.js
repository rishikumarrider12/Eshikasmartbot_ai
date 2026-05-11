'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">We'll send you a link to reset your password</p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={48} style={{ color: '#10b981', marginBottom: '16px' }} />
            <p style={{ marginBottom: '24px' }}>Check your email for the reset link.</p>
            <Link href="/login" className="btn-primary">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleReset}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '16px' }}>{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader2 className="loader" /> : 'Send Reset Link'}
            </button>
            
            <div className="auth-footer">
              <Link href="/login" className="auth-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
