import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon">B</div>
          <span className="logo-text">BharatBit<sup>®</sup></span>
        </div>
        <div className="nav-buttons">
          <button className="btn-outline-nav" onClick={() => router.push('/login')}>Sign In</button>
          <button className="btn-primary-nav" onClick={() => router.push('/register')}>Get Started</button>
        </div>
      </nav>

      <main className="hero">
        <div className="hero-content">
          <div className="hero-badge">Premium OTC Trading</div>
          <h1><span className="white-text">India's Regulated</span><br /><span className="highlight">OTC Crypto Desk</span></h1>
          <p className="hero-subtitle">
            Execute large crypto trades with institutional-grade security, 
            competitive rates, and personalized service.
          </p>
          <p className="tagline-text">Discreet. Secure. Direct.</p>
          <div className="hero-buttons">
            <button className="btn-primary-large" onClick={() => router.push('/register')}>
              Create Account
            </button>
            <button className="btn-outline-large" onClick={() => router.push('/login')}>
              Sign In
            </button>
          </div>
        </div>
      </main>

      <section className="features">
        <h2>Why Choose BharatBit?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#E95721" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                <circle cx="12" cy="16" r="1"/>
              </svg>
            </div>
            <h3>Bank-Grade Security</h3>
            <p>Multi-layer security with 2FA, biometrics, and cold storage</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#E95721" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
            <h3>Best Rates</h3>
            <p>Competitive OTC rates for large volume trades</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#E95721" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <h3>Instant Settlement</h3>
            <p>Quick processing with same-day INR settlement</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#E95721" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
                <path d="M16 11l2 2 4-4"/>
              </svg>
            </div>
            <h3>Dedicated Support</h3>
            <p>Personal relationship manager for premium clients</p>
          </div>
        </div>
      </section>

      <div className="invitation-banner">
        <span className="invitation-line">By Invitation Only</span>
        <span className="client-line">For High Net-Worth Clients</span>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <div className="logo-icon">B</div>
            <span>BharatBit<sup>®</sup> OTC Desk</span>
          </div>
          <p>BharatBit<sup>®</sup> is a trademark owned by G.F.T. Investments Private Limited. All rights reserved © 2026</p>
        </div>
      </footer>

      <style jsx>{`
        .landing-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: white;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-icon {
          width: 45px;
          height: 45px;
          background: #E95721;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
          color: white;
        }
        .logo-text {
          font-size: 24px;
          font-weight: 700;
        }
        .nav-buttons {
          display: flex;
          gap: 12px;
        }
        .btn-outline-nav {
          padding: 10px 24px;
          background: transparent;
          border: 1.5px solid rgba(255,255,255,0.3);
          border-radius: 8px;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .btn-outline-nav:hover {
          border-color: white;
        }
        .btn-primary-nav {
          padding: 10px 24px;
          background: #E95721;
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .btn-primary-nav:hover {
          background: #d04d1d;
        }
        .hero {
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 40px 80px;
          text-align: center;
        }
        .hero-badge {
          display: inline-block;
          padding: 8px 16px;
          background: rgba(233, 87, 33, 0.2);
          border: 1px solid rgba(233, 87, 33, 0.5);
          border-radius: 20px;
          font-size: 14px;
          color: #E95721;
          margin-bottom: 24px;
        }
        .hero h1 {
          font-size: 56px;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 24px;
        }
        .white-text {
          color: #ffffff;
        }
        .highlight {
          color: #E95721;
        }
        .hero-subtitle {
          font-size: 18px;
          color: rgba(255,255,255,0.7);
          max-width: 600px;
          margin: 0 auto 24px;
          line-height: 1.6;
        }
        .tagline-text {
          font-size: 22px;
          font-style: italic;
          color: #ffffff;
          margin-bottom: 40px;
          letter-spacing: 2px;
        }
        .hero-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
        }
        .btn-primary-large {
          padding: 16px 40px;
          background: #E95721;
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 17px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(233, 87, 33, 0.4);
          font-family: inherit;
        }
        .btn-outline-large {
          padding: 16px 40px;
          background: transparent;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 12px;
          color: white;
          font-size: 17px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
        }
        .features {
          background: #f8f9fa;
          padding: 80px 40px;
          color: #1a1a2e;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .features h2 {
          text-align: center;
          font-size: 36px;
          margin-bottom: 50px;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .feature-card {
          background: white;
          padding: 32px 24px;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .feature-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 16px;
        }
        .feature-icon svg {
          width: 100%;
          height: 100%;
        }
        .feature-card h3 {
          font-size: 18px;
          margin-bottom: 8px;
          color: #1a1a2e;
        }
        .feature-card p {
          font-size: 14px;
          color: #666;
          line-height: 1.5;
        }
        .invitation-banner {
          background: #1a1a2e;
          padding: 24px 40px;
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .invitation-banner .invitation-line {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #E95721;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 4px;
        }
        .invitation-banner .client-line {
          display: block;
          font-size: 11px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 1px;
        }
        .footer {
          background: #1a1a2e;
          padding: 40px;
          text-align: center;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .footer-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          color: white;
          font-size: 18px;
          font-weight: 600;
        }
        .footer p {
          color: rgba(255,255,255,0.5);
          font-size: 14px;
        }
        @media (max-width: 768px) {
          .navbar {
            padding: 16px 20px;
          }
          .nav-buttons {
            gap: 8px;
          }
          .btn-outline-nav, .btn-primary-nav {
            padding: 8px 16px;
            font-size: 14px;
          }
          .hero {
            padding: 40px 20px 60px;
          }
          .hero h1 {
            font-size: 32px;
          }
          .hero-subtitle {
            font-size: 16px;
          }
          .hero-buttons {
            flex-direction: column;
          }
          .btn-primary-large, .btn-outline-large {
            width: 100%;
          }
          .features {
            padding: 60px 20px;
          }
          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
