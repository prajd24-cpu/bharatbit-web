import { useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://crypto-trading-desk.preview.emergentagent.com'

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

// Eye icons for password visibility
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export default function Register() {
  const router = useRouter()
  const [accountType, setAccountType] = useState('individual')
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile_number: '',
    country_code: '+91',
    password: '',
    confirmPassword: '',
    company_name: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCountryCodeChange = (e) => {
    // Allow direct input - validate it starts with +
    let value = e.target.value
    if (!value.startsWith('+') && value.length > 0) {
      value = '+' + value
    }
    setFormData({ ...formData, country_code: value })
  }

  const selectCountryCode = (code) => {
    setFormData({ ...formData, country_code: code })
    setShowCountryDropdown(false)
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
        account_type: accountType,
        company_name: accountType === 'corporate' ? formData.company_name : null
      }

      const response = await axios.post(`${API_URL}/api/auth/register`, payload)
      
      if (response.data.success) {
        localStorage.setItem('otpMobile', formData.email)
        localStorage.setItem('userEmail', formData.email)
        localStorage.setItem('userMobile', formData.country_code + formData.mobile_number)
        if (response.data.client_uid) {
          localStorage.setItem('clientUID', response.data.client_uid)
        }
        router.push('/verify-otp')
      }
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
          <span className="logo-text">BharatBit<sup>®</sup></span>
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
                <label>Country Code</label>
                <div className="country-input-wrapper">
                  <input
                    type="text"
                    name="country_code"
                    value={formData.country_code}
                    onChange={handleCountryCodeChange}
                    onFocus={() => setShowCountryDropdown(true)}
                    placeholder="+91"
                    className="country-input"
                  />
                  <button 
                    type="button" 
                    className="dropdown-toggle"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  >
                    ▼
                  </button>
                  {showCountryDropdown && (
                    <div className="country-dropdown">
                      {countryCodes.map(c => (
                        <div 
                          key={c.code} 
                          className="country-option"
                          onClick={() => selectCountryCode(c.code)}
                        >
                          <span className="code">{c.code}</span>
                          <span className="name">{c.country}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
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

            <div className="form-group">
              <label>Confirm Password</label>
              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
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
          font-size: 14px;
          color: #666;
        }
        .nav-links a {
          color: #E95721;
          font-weight: 600;
          cursor: pointer;
          margin-left: 4px;
        }
        .register-container {
          display: flex;
          justify-content: center;
          padding: 40px 20px;
        }
        .register-card {
          background: white;
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 480px;
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
          font-size: 14px;
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
        }
        .type-btn:hover {
          border-color: #E95721;
        }
        .type-btn.active {
          border-color: #E95721;
          background: rgba(233, 87, 33, 0.05);
        }
        .type-icon {
          font-size: 24px;
        }
        .type-label {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a2e;
        }
        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
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
          color: #333;
          margin-bottom: 8px;
        }
        .form-group input, .form-group select {
          width: 100%;
          padding: 12px 16px;
          font-size: 15px;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          background: #f8f9fa;
          transition: all 0.2s;
          font-family: inherit;
        }
        .form-group input:focus, .form-group select:focus {
          outline: none;
          border-color: #E95721;
          background: white;
        }
        .form-row {
          display: flex;
          gap: 12px;
        }
        .form-group.country-code {
          width: 140px;
          flex-shrink: 0;
          position: relative;
        }
        .form-group.mobile {
          flex: 1;
        }
        
        /* Country Code Input with Dropdown */
        .country-input-wrapper {
          position: relative;
          display: flex;
        }
        .country-input {
          width: 100%;
          padding-right: 35px !important;
        }
        .dropdown-toggle {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #666;
          font-size: 10px;
          cursor: pointer;
          padding: 4px;
        }
        .country-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          max-height: 200px;
          overflow-y: auto;
          z-index: 100;
        }
        .country-option {
          padding: 10px 12px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }
        .country-option:hover {
          background: #f5f5f5;
        }
        .country-option .code {
          font-weight: 600;
          color: #E95721;
        }
        .country-option .name {
          color: #666;
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
        
        .terms {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 24px;
          font-size: 13px;
          color: #666;
        }
        .terms input {
          margin-top: 2px;
        }
        .terms a {
          color: #E95721;
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
        @media (max-width: 600px) {
          .navbar {
            padding: 16px 20px;
          }
          .register-card {
            padding: 24px;
          }
          .form-row {
            flex-direction: column;
          }
          .form-group.country-code {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
