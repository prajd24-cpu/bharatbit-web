import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  return (
    <div className="landing-page">
      {/* Subtle background pattern */}
      <div className="bg-pattern" />
      
      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon">B</div>
          <span className="logo-text">BharatBit<sup>®</sup></span>
        </div>
        <div className="nav-buttons">
          <button className="btn-ghost" onClick={() => router.push('/login')}>Sign In</button>
          <button className="btn-primary-nav" onClick={() => router.push('/register')}>Get Started</button>
        </div>
      </nav>

      <main className="hero">
        <div className="hero-content">
          <div className="hero-badge">Premium OTC Trading</div>
          <h1>
            <span className="white-text">India's Regulated</span>
            <br />
            <span className="highlight">OTC Crypto Desk</span>
          </h1>
          <p className="hero-subtitle">
            Execute large crypto trades with institutional-grade security, competitive rates, and personalized service.
          </p>
          <p className="tagline">Discreet. Secure. Direct.</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => router.push('/register')}>
              Create Account
            </button>
            <button className="btn-outline" onClick={() => router.push('/login')}>
              Sign In
            </button>
          </div>
        </div>
      </main>

      <section className="features">
        <div className="features-inner">
          <h2>Why Choose BharatBit?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
              </div>
              <h3>Best Rates</h3>
              <p>Competitive OTC rates for large volume trades</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <h3>Instant Settlement</h3>
              <p>Quick processing with same-day INR settlement</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                  <path d="M16 11l2 2 4-4"/>
                </svg>
              </div>
              <h3>Dedicated Support</h3>
              <p>Personal relationship manager for premium clients</p>
            </div>
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
            <div className="logo-icon small">B</div>
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
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          position: relative;
          overflow-x: hidden;
        }
        
        .bg-pattern {
          display: none;
        }

        /* Navbar */
        .navbar {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 48px;
          max-width: 1280px;
          margin: 0 auto;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
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
        
        .logo-icon.small {
          width: 36px;
          height: 36px;
          font-size: 18px;
        }
        
        .logo-text {
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.3px;
        }
        
        .nav-buttons {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .btn-ghost {
          padding: 10px 20px;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.8);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s;
          font-family: inherit;
        }
        
        .btn-ghost:hover {
          color: white;
        }
        
        .btn-primary-nav {
          padding: 10px 22px;
          background: #E95721;
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        
        .btn-primary-nav:hover {
          background: #d04d1d;
          transform: translateY(-1px);
        }

        /* Hero */
        .hero {
          position: relative;
          max-width: 1280px;
          margin: 0 auto;
          padding: 80px 48px 100px;
          text-align: center;
        }
        
        .hero-badge {
          display: inline-block;
          padding: 8px 18px;
          background: rgba(233, 87, 33, 0.12);
          border: 1px solid rgba(233, 87, 33, 0.3);
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          color: #E95721;
          margin-bottom: 32px;
          letter-spacing: 0.5px;
        }
        
        .hero h1 {
          font-size: 52px;
          font-weight: 600;
          line-height: 1.15;
          margin-bottom: 24px;
          letter-spacing: -1px;
        }
        
        .white-text {
          color: rgba(255,255,255,0.95);
        }
        
        .highlight {
          color: #E95721;
        }
        
        .hero-subtitle {
          font-size: 17px;
          color: rgba(255,255,255,0.6);
          max-width: 520px;
          margin: 0 auto 28px;
          line-height: 1.7;
          font-weight: 400;
        }
        
        .tagline {
          font-size: 18px;
          font-style: italic;
          color: rgba(255,255,255,0.85);
          margin-bottom: 48px;
          letter-spacing: 1px;
          font-weight: 400;
        }
        
        .hero-buttons {
          display: flex;
          gap: 14px;
          justify-content: center;
        }
        
        .btn-primary {
          padding: 14px 36px;
          background: #E95721;
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          box-shadow: 0 8px 24px rgba(233, 87, 33, 0.3);
        }
        
        .btn-primary:hover {
          background: #d04d1d;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(233, 87, 33, 0.35);
        }
        
        .btn-outline {
          padding: 14px 36px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 8px;
          color: rgba(255,255,255,0.9);
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        
        .btn-outline:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.25);
        }

        /* Features */
        .features {
          background: #f8f9fa;
          border-top: none;
          padding: 80px 48px;
        }
        
        .features-inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        
        .features h2 {
          text-align: center;
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 48px;
          color: #1a1a2e;
          letter-spacing: -0.5px;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        
        .feature-card {
          background: white;
          border: 1px solid rgba(0,0,0,0.06);
          padding: 28px 24px;
          border-radius: 12px;
          text-align: center;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        
        .feature-icon {
          width: 44px;
          height: 44px;
          margin: 0 auto 18px;
          color: #E95721;
        }
        
        .feature-icon svg {
          width: 100%;
          height: 100%;
        }
        
        .feature-card h3 {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #1a1a2e;
        }
        
        .feature-card p {
          font-size: 13px;
          color: #666;
          line-height: 1.6;
        }

        /* Invitation Banner */
        .invitation-banner {
          background: rgba(0,0,0,0.3);
          padding: 28px 48px;
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.04);
        }
        
        .invitation-line {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #E95721;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 6px;
        }
        
        .client-line {
          display: block;
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.5px;
        }

        /* Footer */
        .footer {
          background: transparent;
          padding: 40px 48px;
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.04);
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
          gap: 10px;
          color: rgba(255,255,255,0.9);
          font-size: 16px;
          font-weight: 500;
        }
        
        .footer p {
          color: rgba(255,255,255,0.35);
          font-size: 12px;
        }

        /* Mobile Responsive */
        @media (max-width: 1024px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 16px 20px;
          }
          
          .logo-icon {
            width: 36px;
            height: 36px;
            font-size: 18px;
            border-radius: 8px;
          }
          
          .logo-text {
            font-size: 18px;
          }
          
          .nav-buttons {
            gap: 8px;
          }
          
          .btn-ghost {
            padding: 8px 12px;
            font-size: 13px;
          }
          
          .btn-primary-nav {
            padding: 8px 14px;
            font-size: 13px;
            border-radius: 6px;
          }
          
          .hero {
            padding: 48px 24px 64px;
          }
          
          .hero-badge {
            font-size: 12px;
            padding: 6px 14px;
            margin-bottom: 24px;
          }
          
          .hero h1 {
            font-size: 32px;
            margin-bottom: 20px;
          }
          
          .hero-subtitle {
            font-size: 15px;
            margin-bottom: 20px;
          }
          
          .tagline {
            font-size: 16px;
            margin-bottom: 36px;
          }
          
          .hero-buttons {
            flex-direction: column;
            gap: 12px;
          }
          
          .btn-primary, .btn-outline {
            width: 100%;
            padding: 14px 24px;
            font-size: 14px;
          }
          
          .features {
            padding: 48px 20px;
          }
          
          .features h2 {
            font-size: 22px;
            margin-bottom: 32px;
            color: #1a1a2e;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          
          .feature-card {
            padding: 24px 20px;
          }
          
          .invitation-banner {
            padding: 24px 20px;
          }
          
          .footer {
            padding: 32px 20px;
          }
          
          .footer p {
            font-size: 11px;
            line-height: 1.5;
          }
        }
        
        @media (max-width: 480px) {
          .navbar {
            padding: 14px 16px;
          }
          
          .logo-icon {
            width: 32px;
            height: 32px;
            font-size: 16px;
          }
          
          .logo-text {
            font-size: 16px;
          }
          
          .btn-ghost {
            padding: 6px 10px;
            font-size: 12px;
          }
          
          .btn-primary-nav {
            padding: 7px 12px;
            font-size: 12px;
          }
          
          .hero h1 {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  )
}
