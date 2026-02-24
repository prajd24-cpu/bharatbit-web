import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon">B</div>
          <span className="logo-text">BharatBit</span>
        </div>
        <div className="nav-buttons">
          <button className="btn-outline-nav" onClick={() => router.push('/login')}>Sign In</button>
          <button className="btn-primary-nav" onClick={() => router.push('/register')}>Get Started</button>
        </div>
      </nav>

      <main className="hero">
        <div className="hero-content">
          <div className="hero-badge">Premium OTC Trading</div>
          <h1>India's Most Trusted<br /><span className="highlight">OTC Crypto Desk</span></h1>
          <p className="hero-subtitle">
            Execute large crypto trades with institutional-grade security, 
            competitive rates, and personalized service for high-net-worth individuals.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary-large" onClick={() => router.push('/register')}>
              Start Trading
            </button>
            <button className="btn-outline-large" onClick={() => router.push('/login')}>
              Sign In
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-value">₹500Cr+</span>
              <span className="stat-label">Trading Volume</span>
            </div>
            <div className="stat">
              <span className="stat-value">10,000+</span>
              <span className="stat-label">Happy Clients</span>
            </div>
            <div className="stat">
              <span className="stat-value">24/7</span>
              <span className="stat-label">Support</span>
            </div>
          </div>
        </div>
      </main>

      <section className="features">
        <h2>Why Choose BharatBit?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Bank-Grade Security</h3>
            <p>Multi-layer security with 2FA, biometrics, and cold storage</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💹</div>
            <h3>Best Rates</h3>
            <p>Competitive OTC rates for large volume trades</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Instant Settlement</h3>
            <p>Quick processing with same-day INR settlement</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Dedicated Support</h3>
            <p>Personal relationship manager for premium clients</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <div className="logo-icon">B</div>
            <span>BharatBit OTC Desk</span>
          </div>
          <p>© 2025 BharatBit. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        .landing-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: white;
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
        .highlight {
          color: #E95721;
        }
        .hero-subtitle {
          font-size: 18px;
          color: rgba(255,255,255,0.7);
          max-width: 600px;
          margin: 0 auto 40px;
          line-height: 1.6;
        }
        .hero-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-bottom: 60px;
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
        }
        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 60px;
        }
        .stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #E95721;
        }
        .stat-label {
          font-size: 14px;
          color: rgba(255,255,255,0.6);
        }
        .features {
          background: #f8f9fa;
          padding: 80px 40px;
          color: #1a1a2e;
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
          font-size: 40px;
          margin-bottom: 16px;
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
        .footer {
          background: #1a1a2e;
          padding: 40px;
          text-align: center;
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
          .hero-stats {
            flex-direction: column;
            gap: 24px;
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
