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
        // Store mobile for OTP page
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
    <div className="container">
      <div className="card">
        <div className="header">
          <div className="icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <h1>Welcome Back</h1>
          <p className="subtitle">Sign in to your private vault</p>
        </div>

        <form className="form-card" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

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
            <a href="/forgot-password">Forgot Password?</a>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="footer">
          <p>Don't have an account?</p>
          <button 
            type="button" 
            className="btn btn-outline"
            onClick={() => router.push('/register')}
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  )
}
