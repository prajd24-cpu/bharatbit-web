#!/bin/bash
# BharatBit Web App Setup Script
# Run this in an empty folder to create the project

mkdir -p bharatbit-web/{pages,styles}
cd bharatbit-web

# Create package.json
cat > package.json << 'EOF'
{
  "name": "bharatbit-web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.2.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "axios": "^1.6.8"
  }
}
EOF

# Create next.config.js
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://bharatbit-preview.preview.emergentagent.com'
  }
}
module.exports = nextConfig
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules
.next/
out/
build
.DS_Store
*.pem
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.env*.local
.vercel
EOF

# Create styles/globals.css
cat > styles/globals.css << 'EOF'
:root {
  --primary: #E95721;
  --primary-dark: #d04d1d;
  --bg: #f8f9fa;
  --card-bg: #ffffff;
  --text-primary: #1a1a2e;
  --text-secondary: #666666;
  --text-muted: #999999;
  --border: #e0e0e0;
  --error: #dc2626;
  --error-bg: #fee2e2;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: var(--bg);
  color: var(--text-primary);
  min-height: 100vh;
}
.container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
.card { width: 100%; max-width: 400px; }
.header { text-align: center; margin-bottom: 32px; }
.icon-wrapper {
  width: 80px; height: 80px; border-radius: 50%;
  background-color: rgba(233, 87, 33, 0.1);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 20px;
}
.icon-wrapper svg { width: 48px; height: 48px; color: var(--primary); }
h1 { font-size: 28px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
.subtitle { font-size: 16px; color: var(--text-secondary); }
.mobile-number { font-size: 18px; font-weight: 600; color: var(--primary); margin-top: 8px; }
.form-card {
  background-color: var(--card-bg); border-radius: 16px;
  padding: 24px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
.error-message {
  background-color: var(--error-bg); color: var(--error);
  padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 14px;
}
.form-group { margin-bottom: 16px; }
.form-group label {
  display: block; font-size: 12px; font-weight: 600;
  color: var(--text-secondary); margin-bottom: 8px;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.form-group input {
  width: 100%; height: 48px; padding: 0 16px; font-size: 16px;
  border: 1px solid var(--border); border-radius: 10px;
  background-color: var(--bg); color: var(--text-primary); outline: none;
}
.form-group input:focus { border-color: var(--primary); }
.otp-input {
  height: 60px !important; font-size: 28px !important; text-align: center;
  letter-spacing: 12px; border: 2px solid var(--primary) !important;
  border-radius: 12px !important; background-color: var(--card-bg) !important;
}
.forgot-link { text-align: right; margin-bottom: 20px; }
.forgot-link a { color: var(--primary); font-size: 14px; text-decoration: none; }
.btn {
  width: 100%; height: 56px; border: none; border-radius: 12px;
  font-size: 17px; font-weight: 600; cursor: pointer;
}
.btn-primary {
  background-color: var(--primary); color: white;
  box-shadow: 0 4px 14px rgba(233, 87, 33, 0.3);
}
.btn-primary:hover { background-color: var(--primary-dark); }
.btn-primary:disabled { background-color: #cccccc; box-shadow: none; cursor: not-allowed; }
.btn-outline { background-color: transparent; color: var(--primary); border: 1.5px solid var(--primary); }
.footer { text-align: center; margin-top: 24px; }
.footer p { color: var(--text-secondary); font-size: 14px; margin-bottom: 12px; }
.footer .btn-outline { width: auto; height: auto; padding: 10px 24px; font-size: 14px; }
.resend-btn { background: none; border: none; color: var(--primary); font-size: 15px; font-weight: 500; cursor: pointer; padding: 12px; }
EOF

# Create pages/_app.js
cat > pages/_app.js << 'EOF'
import '../styles/globals.css'
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
EOF

# Create pages/index.js
cat > pages/index.js << 'EOF'
import { useRouter } from 'next/router'
export default function Home() {
  const router = useRouter()
  if (typeof window !== 'undefined') { router.replace('/login') }
  return <div className="container"><p>Redirecting to login...</p></div>
}
EOF

# Create pages/login.js
cat > pages/login.js << 'EOF'
import { useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bharatbit-preview.preview.emergentagent.com'
export default function Login() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!identifier || !password) { setError('Please fill all fields'); return }
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { identifier, password })
      if (response.data.requires_2fa) {
        localStorage.setItem('otpMobile', response.data.mobile)
        router.push('/verify-otp')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally { setLoading(false) }
  }
  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <div className="icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <h1>Welcome Back</h1>
          <p className="subtitle">Sign in to your private vault</p>
        </div>
        <form className="form-card" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="identifier">Mobile / Email</label>
            <input id="identifier" type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Enter mobile number or email" autoComplete="username" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" />
          </div>
          <div className="forgot-link"><a href="/forgot-password">Forgot Password?</a></div>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Signing In...' : 'Sign In'}</button>
        </form>
        <div className="footer">
          <p>Don't have an account?</p>
          <button type="button" className="btn btn-outline" onClick={() => router.push('/register')}>Create Account</button>
        </div>
      </div>
    </div>
  )
}
EOF

# Create pages/verify-otp.js
cat > pages/verify-otp.js << 'EOF'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bharatbit-preview.preview.emergentagent.com'
export default function VerifyOTP() {
  const router = useRouter()
  const inputRef = useRef(null)
  const [otp, setOtp] = useState('')
  const [mobile, setMobile] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    const storedMobile = localStorage.getItem('otpMobile')
    if (!storedMobile) { router.replace('/login'); return }
    setMobile(storedMobile)
    if (inputRef.current) { inputRef.current.focus() }
  }, [router])
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    if (value.length <= 6) { setOtp(value) }
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!otp || otp.length !== 6) { setError('Please enter a valid 6-digit OTP'); return }
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-2fa`, { mobile, otp })
      localStorage.setItem('token', response.data.access_token)
      localStorage.removeItem('otpMobile')
      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP. Please try again.')
    } finally { setLoading(false) }
  }
  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <div className="icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <h1>Two-Factor Authentication</h1>
          <p className="subtitle">Enter the OTP sent to your email & phone</p>
          <p className="mobile-number">{mobile}</p>
        </div>
        <form className="form-card" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="otp">Enter 6-Digit OTP</label>
            <input ref={inputRef} id="otp" type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={otp} onChange={handleOtpChange} placeholder="000000" autoComplete="one-time-code" className="otp-input" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading || otp.length !== 6}>{loading ? 'Verifying...' : 'Verify & Login'}</button>
        </form>
        <div className="footer">
          <button type="button" className="resend-btn" onClick={() => alert('A new OTP has been sent.')}>Didn't receive OTP? Resend</button>
        </div>
      </div>
    </div>
  )
}
EOF

# Create pages/dashboard.js
cat > pages/dashboard.js << 'EOF'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
export default function Dashboard() {
  const router = useRouter()
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.replace('/login') }
  }, [router])
  const handleLogout = () => { localStorage.removeItem('token'); router.push('/login') }
  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <div className="icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
          </div>
          <h1>Welcome to BharatBit</h1>
          <p className="subtitle">Your OTC Trading Dashboard</p>
        </div>
        <div className="form-card">
          <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>You have successfully logged in!</p>
          <button type="button" className="btn btn-primary" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  )
}
EOF

echo "✅ Project created! Now run:"
echo "   npm install"
echo "   npm run dev"
