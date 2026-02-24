import { useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://crypto-trading-web.preview.emergentagent.com'

const countryCodes = [
  { code: '+91', country: 'India' },
  { code: '+1', country: 'USA/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+971', country: 'UAE' },
  { code: '+65', country: 'Singapore' },
  { code: '+852', country: 'Hong Kong' },
  { code: '+81', country: 'Japan' },
  { code: '+86', country: 'China' },
  { code: '+61', country: 'Australia' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+41', country: 'Switzerland' },
  { code: '+31', country: 'Netherlands' },
  { code: '+966', country: 'Saudi Arabia' },
  { code: '+974', country: 'Qatar' },
  { code: '+973', country: 'Bahrain' },
  { code: '+968', country: 'Oman' },
  { code: '+60', country: 'Malaysia' },
  { code: '+66', country: 'Thailand' },
  { code: '+63', country: 'Philippines' },
  { code: '+62', country: 'Indonesia' },
  { code: '+84', country: 'Vietnam' },
  { code: '+27', country: 'South Africa' },
  { code: '+234', country: 'Nigeria' },
  { code: '+254', country: 'Kenya' },
]

export default function Register() {
  const router = useRouter()
  const [accountType, setAccountType] = useState('individual')
  const [formData, setFormData] = useState({
    email: '',
    mobile_number: '',
    country_code: '+91',
    password: '',
    confirmPassword: '',
    company_name: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const payload = {
        email: formData.email,
        mobile_number: formData.mobile_number,
        country_code: formData.country_code,
        password: formData.password,
        account_type: accountType
      }
      
      if (accountType === 'corporate') {
        payload.company_name = formData.company_name
      }

      await axios.post(`${API_URL}/api/auth/register`, payload)
      
      localStorage.setItem('otpMobile', formData.mobile_number)
      router.push('/verify-otp?type=registration')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <nav className="navbar">
        <div className="logo" onClick={() => router.push('/')}>
          <div className="logo-icon">B</div>
          <span className="logo-text">BharatBit</span>
        </div>
        <div className="nav-links">
          Already have an account? <a onClick={() => router.push('/login')}>Sign In</a>
        </div>
      </nav>

      <main className="register-container">
        <div className="register-card">
          <div className="header">
            <h1>Create Account</h1>
            <p>Join India's premier OTC crypto trading platform</p>
          </div>

          <div className="account-type-selector">
            <button 
              className={`type-btn ${accountType === 'individual' ? 'active' : ''}`}
              onClick={() => setAccountType('individual')}
              type="button"
            >
              <span className="type-icon">👤</span>
              <span className="type-label">Individual</span>
            </button>
            <button 
              className={`type-btn ${accountType === 'corporate' ? 'active' : ''}`}
              onClick={() => setAccountType('corporate')}
              type="button"
            >
              <span className="type-icon">🏢</span>
              <span className="type-label">Corporate</span>
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            {accountType === 'corporate' && (
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group country-code">
                <label>Country</label>
                <select 
                  name="country_code" 
                  value={formData.country_code}
                  onChange={handleChange}
                >
                  {countryCodes.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.code} {c.country}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group mobile">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>

            <div className="terms">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
              </label>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </main>

      <style jsx>{`
        .register-page {
          min-height: 100vh;
          background: #f8f9fa;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
        .register-container {
          max-width: 480px;
          margin: 40px auto;
          padding: 0 20px;
        }
        .register-card {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .header {
          text-align: center;
          margin-bottom: 32px;
        }
        .header h1 {
          font-size: 28px;
          color: #1a1a2e;
          margin-bottom: 8px;
        }
        .header p {
          color: #666;
        }
        .account-type-selector {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }
        .type-btn {
          flex: 1;
          padding: 16px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          font-family: inherit;
        }
        .type-btn.active {
          border-color: #E95721;
          background: rgba(233, 87, 33, 0.05);
        }
        .type-icon {
          font-size: 24px;
        }
        .type-label {
          font-weight: 600;
          color: #1a1a2e;
        }
        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
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
        }
        .form-group input, .form-group select {
          width: 100%;
          height: 48px;
          padding: 0 16px;
          font-size: 16px;
          font-family: inherit;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          background: #f8f9fa;
        }
        .form-group input:focus, .form-group select:focus {
          outline: none;
          border-color: #E95721;
        }
        .form-row {
          display: flex;
          gap: 12px;
        }
        .country-code {
          width: 160px;
        }
        .mobile {
          flex: 1;
        }
        .terms {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 24px;
        }
        .terms input {
          margin-top: 4px;
        }
        .terms label {
          font-size: 13px;
          color: #666;
          line-height: 1.4;
        }
        .terms a {
          color: #E95721;
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
          font-family: inherit;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(233, 87, 33, 0.3);
        }
        .btn-primary:disabled {
          background: #ccc;
          box-shadow: none;
        }
        @media (max-width: 768px) {
          .navbar {
            padding: 16px 20px;
            flex-direction: column;
            gap: 12px;
          }
          .register-card {
            padding: 24px;
          }
          .form-row {
            flex-direction: column;
          }
          .country-code {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
