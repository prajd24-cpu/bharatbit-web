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
    // Get mobile from localStorage
    const storedMobile = localStorage.getItem('otpMobile')
    if (!storedMobile) {
      router.replace('/login')
      return
    }
    setMobile(storedMobile)
    
    // Auto-focus the input
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [router])

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    if (value.length <= 6) {
      setOtp(value)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-2fa`, {
        mobile,
        otp
      })

      // Store token and redirect to dashboard
      localStorage.setItem('token', response.data.access_token)
      localStorage.removeItem('otpMobile')
      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = () => {
    alert('A new OTP has been sent to your phone and email.')
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
          <h1>Two-Factor Authentication</h1>
          <p className="subtitle">Enter the OTP sent to your email & phone</p>
          <p className="mobile-number">{mobile}</p>
        </div>

        <form className="form-card" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="otp">Enter 6-Digit OTP</label>
            <input
              ref={inputRef}
              id="otp"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={handleOtpChange}
              placeholder="000000"
              autoComplete="one-time-code"
              className="otp-input"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || otp.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>
        </form>

        <div className="footer">
          <button type="button" className="resend-btn" onClick={handleResend}>
            Didn't receive OTP? Resend
          </button>
        </div>
      </div>
    </div>
  )
}
