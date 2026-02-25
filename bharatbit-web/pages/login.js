import { useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://crypto-trading-desk.preview.emergentagent.com'

// Eye icons for password visibility
const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export default function Login() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        identifier,
        password
      })

      if (response.data.requires_2fa) {
        localStorage.setItem('otpMobile', response.data.mobile)
        // Pre-store identifier for profile page
        localStorage.setItem('userEmail', identifier.includes('@') ? identifier : '')
        localStorage.setItem('userMobile', !identifier.includes('@') ? identifier : response.data.mobile)
        router.push('/verify-otp')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <nav className="navbar">
        <div className="logo" onClick={() => router.push('/')}>
          <div className="logo-icon">B</div>
          <span className="logo-text">BharatBit<sup>®</sup></span>
        </div>
        <div className="nav-links">
          New here? <a onClick={() => router.push('/register')}>Create Account</a>
        </div>
      </nav>

      <main className="login-container">
        <div className="login-card">
          <div className="header">
            <div className="icon-wrapper">
              <div className="logo-icon large">B</div>
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to your BharatBit<sup>®</sup> Private Vault</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="identifier">Email or Mobile</label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter email or mobile number"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="forgot-link">
              <a onClick={() => router.push('/forgot-password')}>Forgot Password?</a>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <button className="btn-secondary" onClick={() => router.push('/register')}>
            Create New Account
          </button>
        </div>
      </main>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }
        .logo-icon {
          width: 40px;
          height: 40px;
          background: #E95721;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 700;
          color: white;
        }
        .logo-icon.large {
          width: 64px;
          height: 64px;
          font-size: 32px;
          border-radius: 16px;
        }
        .logo-text {
          font-size: 22px;
          font-weight: 700;
          color: #1a1a2e;
        }
        .nav-links {
          font-size: 14px;
          color: #666;
        }
        .nav-links a {
          color: #E95721;
          font-weight: 600;
          cursor: pointer;
          margin-left: 4px;
        }
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 80px);
          padding: 40px 20px;
        }
        .login-card {
          background: white;
          border-radius: 20px;
          padding: 48px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 32px;
        }
        .icon-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }
        .header h1 {
          font-size: 28px;
          color: #1a1a2e;
          margin-bottom: 8px;
        }
        .header p {
          color: #666;
          font-size: 14px;
        }
        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-size: 14px;
          text-align: center;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }
        .form-group input {
          width: 100%;
          padding: 14px 16px;
          font-size: 15px;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          background: #f8f9fa;
          transition: all 0.2s;
        }
        .form-group input:focus {
          outline: none;
          border-color: #E95721;
          background: white;
        }
        
        /* Password Visibility Toggle */
        .password-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .password-wrapper input {
          width: 100%;
          padding-right: 50px;
        }
        .toggle-password {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }
        .toggle-password:hover {
          color: #E95721;
        }
        .toggle-password svg {
          width: 20px;
          height: 20px;
        }
        
        .forgot-link {
          text-align: right;
          margin-bottom: 24px;
        }
        .forgot-link a {
          color: #E95721;
          font-size: 13px;
          cursor: pointer;
        }
        .btn-primary {
          width: 100%;
          padding: 14px;
          background: #E95721;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          font-family: inherit;
        }
        .btn-primary:hover {
          background: #d14d1a;
        }
        .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .divider {
          display: flex;
          align-items: center;
          margin: 24px 0;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e0e0e0;
        }
        .divider span {
          padding: 0 16px;
          color: #999;
          font-size: 13px;
        }
        .btn-secondary {
          width: 100%;
          padding: 14px;
          background: white;
          color: #1a1a2e;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .btn-secondary:hover {
          border-color: #E95721;
          color: #E95721;
        }
        @media (max-width: 600px) {
          .navbar {
            padding: 16px 20px;
          }
          .login-card {
            padding: 32px 24px;
          }
        }
      `}</style>
    </div>
  )
}
