import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function ResetPassword() {
  const router = useRouter()
  const { token } = router.query
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        new_password: password
      })
      
      if (response.data.success) {
        setSuccess(true)
        setTimeout(() => router.push('/login'), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password. Link may be expired.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="reset-page">
        <div className="reset-card">
          <h1>Invalid Link</h1>
          <p>This password reset link is invalid or has expired.</p>
          <button onClick={() => router.push('/forgot-password')}>Request New Link</button>
        </div>
        <style jsx>{styles}</style>
      </div>
    )
  }

  if (success) {
    return (
      <div className="reset-page">
        <div className="reset-card success">
          <div className="success-icon">✓</div>
          <h1>Password Reset!</h1>
          <p>Your password has been reset successfully.</p>
          <p>Redirecting to login...</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    )
  }

  return (
    <div className="reset-page">
      <div className="reset-card">
        <div className="logo">
          <div className="logo-icon">B</div>
          <span>BharatBit<sup>®</sup></span>
        </div>
        
        <h1>Reset Password</h1>
        <p className="subtitle">Enter your new password below</p>
        
        {error && <div className="error-msg">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
              <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        
        <p className="back-link">
          <a onClick={() => router.push('/login')}>← Back to Login</a>
        </p>
      </div>
      <style jsx>{styles}</style>
    </div>
  )
}

const styles = `
  .reset-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    font-family: 'Inter', -apple-system, sans-serif;
  }
  
  .reset-card {
    background: white;
    border-radius: 16px;
    padding: 40px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  }
  
  .reset-card.success {
    text-align: center;
  }
  
  .success-icon {
    width: 60px;
    height: 60px;
    background: #10B981;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    color: white;
    margin: 0 auto 20px;
  }
  
  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 30px;
  }
  
  .logo-icon {
    width: 42px;
    height: 42px;
    background: #E95721;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 700;
    color: white;
  }
  
  .logo span {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a2e;
  }
  
  h1 {
    font-size: 24px;
    color: #1a1a2e;
    margin-bottom: 8px;
  }
  
  .subtitle {
    color: #666;
    font-size: 14px;
    margin-bottom: 24px;
  }
  
  .error-msg {
    background: #FEE2E2;
    color: #DC2626;
    padding: 12px;
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 20px;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
  }
  
  .form-group input {
    width: 100%;
    padding: 14px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 15px;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }
  
  .form-group input:focus {
    outline: none;
    border-color: #E95721;
  }
  
  .password-wrapper {
    position: relative;
  }
  
  .password-wrapper input {
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
    font-size: 18px;
  }
  
  .submit-btn {
    width: 100%;
    padding: 14px;
    background: #E95721;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .submit-btn:hover {
    background: #d04d1d;
  }
  
  .submit-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  .back-link {
    text-align: center;
    margin-top: 20px;
  }
  
  .back-link a {
    color: #E95721;
    cursor: pointer;
    font-size: 14px;
  }
`
