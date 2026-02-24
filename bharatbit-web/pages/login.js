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

    if (!identifier || !password) {
      setError('Please fill all fields')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        identifier,
        password
      })

      if (response.data.requires_2fa) {
        localStorage.setItem('otpMobile', response.data.mobile)
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
          <span className="logo-text">BharatBit</span>
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
            <p>Sign in to your BharatBit account</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="identifier">Mobile / Email</label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter mobile number or email"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
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
          width: 100%;
          max-width: 420px;
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
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
        }
        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-size: 14px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #666;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .form-group input {
          width: 100%;
          height: 52px;
          padding: 0 16px;
          font-size: 16px;
          border: 1.5px solid #e0e0e0;
          border-radius: 12px;
          background: #f8f9fa;
          transition: all 0.2s;
        }
        .form-group input:focus {
          outline: none;
          border-color: #E95721;
          background: white;
        }
        .forgot-link {
          text-align: right;
          margin-bottom: 24px;
        }
        .forgot-link a {
          color: #E95721;
          font-size: 14px;
          cursor: pointer;
        }
        .btn-primary {
          width: 100%;
          height: 56px;
          background: #E95721;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 17px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(233, 87, 33, 0.3);
          transition: all 0.2s;
        }
        .btn-primary:hover {
          background: #d04d1d;
        }
        .btn-primary:disabled {
          background: #ccc;
          box-shadow: none;
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
          font-size: 14px;
        }
        .btn-secondary {
          width: 100%;
          height: 52px;
          background: transparent;
          color: #E95721;
          border: 2px solid #E95721;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-secondary:hover {
          background: rgba(233, 87, 33, 0.05);
        }
        @media (max-width: 768px) {
          .navbar {
            padding: 16px 20px;
            flex-direction: column;
            gap: 12px;
          }
          .login-card {
            padding: 28px 24px;
          }
        }
      `}</style>
    </div>
  )
}
