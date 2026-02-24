import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://crypto-trading-web.preview.emergentagent.com'

export default function VerifyOTP() {
  const router = useRouter()
  const inputRef = useRef(null)
  const [otp, setOtp] = useState('')
  const [mobile, setMobile] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const storedMobile = localStorage.getItem('otpMobile')
    if (!storedMobile) {
      router.replace('/login')
      return
    }
    setMobile(storedMobile)
    
    // Focus input after mount
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 100)
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

      // Store token and user data
      localStorage.setItem('token', response.data.token || response.data.access_token)
      
      // Store user info for profile
      if (response.data.user) {
        localStorage.setItem('userEmail', response.data.user.email)
        localStorage.setItem('userMobile', response.data.user.mobile)
        localStorage.setItem('clientUID', response.data.user.client_uid)
        localStorage.setItem('kycStatus', response.data.user.kyc_status)
        localStorage.setItem('accountType', response.data.user.account_type)
        if (response.data.user.company_name) {
          localStorage.setItem('companyName', response.data.user.company_name)
        }
      }
      
      localStorage.removeItem('otpMobile')
      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/resend-otp`, { mobile })
      alert('A new OTP has been sent to your phone and email.')
    } catch (err) {
      alert('Failed to resend OTP. Please try again.')
    }
  }

  return (
    <div className="verify-page">
      <nav className="navbar">
        <div className="logo" onClick={() => router.push('/')}>
          <div className="logo-icon">B</div>
          <span className="logo-text">BharatBit</span>
        </div>
      </nav>

      <main className="container">
        <div className="card">
          <div className="header">
            <div className="icon-wrapper">
              <div className="shield-icon">🛡️</div>
            </div>
            <h1>Verify Your Identity</h1>
            <p>Enter the 6-digit OTP sent to</p>
            <p className="mobile-number">{mobile}</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                ref={inputRef}
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

            <button type="submit" className="btn-primary" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>

          <div className="footer">
            <p>Didn't receive the code?</p>
            <button type="button" className="resend-btn" onClick={handleResend}>
              Resend OTP
            </button>
          </div>
        </div>
      </main>

      <style jsx>{`
        .verify-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
        .navbar {
          display: flex;
          justify-content: center;
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
          margin-bottom: 20px;
        }
        .shield-icon {
          font-size: 56px;
        }
        .header h1 {
          font-size: 26px;
          color: #1a1a2e;
          margin-bottom: 8px;
        }
        .header p {
          color: #666;
        }
        .mobile-number {
          font-size: 18px;
          font-weight: 600;
          color: #E95721;
          margin-top: 4px;
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
          margin-bottom: 12px;
          text-transform: uppercase;
          text-align: center;
        }
        .otp-input {
          width: 100%;
          height: 64px;
          padding: 0 16px;
          font-size: 32px;
          font-weight: 600;
          text-align: center;
          letter-spacing: 16px;
          border: 2px solid #E95721;
          border-radius: 14px;
          background: white;
          color: #1a1a2e;
        }
        .otp-input:focus {
          outline: none;
          box-shadow: 0 0 0 4px rgba(233, 87, 33, 0.15);
        }
        .otp-input::placeholder {
          color: #ddd;
          letter-spacing: 16px;
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
        .btn-primary:disabled {
          background: #ccc;
          box-shadow: none;
          cursor: not-allowed;
        }
        .footer {
          text-align: center;
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid #f0f0f0;
        }
        .footer p {
          color: #999;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .resend-btn {
          background: none;
          border: none;
          color: #E95721;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          padding: 8px 16px;
        }
        .resend-btn:hover {
          text-decoration: underline;
        }
        @media (max-width: 768px) {
          .navbar {
            padding: 16px 20px;
          }
          .card {
            padding: 28px 24px;
          }
          .otp-input {
            font-size: 26px;
            letter-spacing: 12px;
          }
        }
      `}</style>
    </div>
  )
}
