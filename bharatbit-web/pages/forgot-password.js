import { useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://crypto-trading-desk.preview.emergentagent.com'

export default function ForgotPassword() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send reset link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-page">
      <nav className="navbar">
        <div className="logo" onClick={() => router.push('/')}>
          <div className="logo-icon">B</div>
          <span className="logo-text">BharatBit</span>
        </div>
        <div className="nav-links">
          Remember your password? <a onClick={() => router.push('/login')}>Sign In</a>
        </div>
      </nav>

      <main className="container">
        <div className="card">
          {sent ? (
            <div className="success-state">
              <div className="success-icon">✓</div>
              <h1>Check Your Email</h1>
              <p>We've sent a password reset link to <strong>{email}</strong></p>
              <p className="note">If you don't see the email, check your spam folder.</p>
              <button className="btn-primary" onClick={() => router.push('/login')}>
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              <div className="header">
                <div className="icon-wrapper">🔐</div>
                <h1>Forgot Password?</h1>
                <p>Enter your email and we'll send you a reset link</p>
              </div>

              {error && <div className="error-message">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    autoComplete="email"
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="back-link">
                <a onClick={() => router.push('/login')}>← Back to Sign In</a>
              </div>
            </>
          )}
        </div>
      </main>

      <style jsx>{`
        .forgot-page {
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
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 80px);
          padding: 40px 20px;
        }
        .card {
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
          font-size: 48px;
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
          margin-bottom: 24px;
        }
        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #666;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .form-group input {
          width: 100%;
          height: 52px;
          padding: 0 16px;
          font-size: 16px;
          border: 1.5px solid #e0e0e0;
          border-radius: 12px;
          background: #f8f9fa;
        }
        .form-group input:focus {
          outline: none;
          border-color: #E95721;
          background: white;
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
        }
        .btn-primary:disabled {
          background: #ccc;
          box-shadow: none;
        }
        .back-link {
          text-align: center;
          margin-top: 24px;
        }
        .back-link a {
          color: #666;
          cursor: pointer;
        }
        .success-state {
          text-align: center;
        }
        .success-icon {
          width: 80px;
          height: 80px;
          background: #d4edda;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          color: #28a745;
          margin: 0 auto 24px;
        }
        .success-state h1 {
          font-size: 24px;
          color: #1a1a2e;
          margin-bottom: 12px;
        }
        .success-state p {
          color: #666;
          margin-bottom: 8px;
        }
        .success-state .note {
          font-size: 13px;
          color: #999;
          margin-bottom: 24px;
        }
        @media (max-width: 768px) {
          .navbar {
            padding: 16px 20px;
            flex-direction: column;
            gap: 12px;
          }
          .card {
            padding: 28px 24px;
          }
        }
      `}</style>
    </div>
  )
}
