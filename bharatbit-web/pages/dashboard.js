import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bharatbit-preview.preview.emergentagent.com'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('portfolio')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.replace('/login')
      return
    }
    
    // Fetch user profile
    fetchProfile(token)
  }, [router])

  const fetchProfile = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(response.data)
    } catch (err) {
      console.error('Failed to fetch profile')
      // Use mock data for display
      setUser({
        email: 'user@example.com',
        mobile_number: '9999999999',
        kyc_status: 'pending',
        account_type: 'individual'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="logo-icon">B</div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">B</div>
            <span>BharatBit</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            <span className="nav-icon">📊</span>
            Portfolio
          </button>
          <button 
            className={`nav-item ${activeTab === 'trade' ? 'active' : ''}`}
            onClick={() => setActiveTab('trade')}
          >
            <span className="nav-icon">💱</span>
            Trade
          </button>
          <button 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <span className="nav-icon">📋</span>
            Orders
          </button>
          <button 
            className={`nav-item ${activeTab === 'wallet' ? 'active' : ''}`}
            onClick={() => setActiveTab('wallet')}
          >
            <span className="nav-icon">💰</span>
            Wallets
          </button>
          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="nav-icon">👤</span>
            Profile
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="topbar">
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="user-info">
            <span className="kyc-badge" data-status={user?.kyc_status || 'pending'}>
              KYC: {user?.kyc_status || 'Pending'}
            </span>
            <span className="user-email">{user?.email}</span>
          </div>
        </header>

        {/* KYC Alert Banner */}
        {user?.kyc_status !== 'approved' && (
          <div className="kyc-alert">
            <span>⚠️</span>
            <p>Complete your KYC verification to start trading</p>
            <button onClick={() => setActiveTab('profile')}>Complete KYC</button>
          </div>
        )}

        {/* Content Area */}
        <div className="content-area">
          {activeTab === 'portfolio' && (
            <div className="portfolio-section">
              <div className="portfolio-summary">
                <div className="summary-card">
                  <span className="card-label">Total Portfolio Value</span>
                  <span className="card-value">₹0.00</span>
                  <span className="card-change positive">+0.00%</span>
                </div>
                <div className="summary-card">
                  <span className="card-label">Available Balance (INR)</span>
                  <span className="card-value">₹0.00</span>
                </div>
                <div className="summary-card">
                  <span className="card-label">Crypto Holdings</span>
                  <span className="card-value">0 BTC</span>
                </div>
              </div>

              <div className="market-prices">
                <h2>Live Market Prices</h2>
                <div className="price-grid">
                  <div className="price-card">
                    <div className="coin-info">
                      <span className="coin-icon">₿</span>
                      <div>
                        <span className="coin-name">Bitcoin</span>
                        <span className="coin-symbol">BTC</span>
                      </div>
                    </div>
                    <div className="coin-price">
                      <span className="price">₹87,45,000</span>
                      <span className="change positive">+2.4%</span>
                    </div>
                  </div>
                  <div className="price-card">
                    <div className="coin-info">
                      <span className="coin-icon">Ξ</span>
                      <div>
                        <span className="coin-name">Ethereum</span>
                        <span className="coin-symbol">ETH</span>
                      </div>
                    </div>
                    <div className="coin-price">
                      <span className="price">₹2,32,500</span>
                      <span className="change positive">+1.8%</span>
                    </div>
                  </div>
                  <div className="price-card">
                    <div className="coin-info">
                      <span className="coin-icon">◎</span>
                      <div>
                        <span className="coin-name">Solana</span>
                        <span className="coin-symbol">SOL</span>
                      </div>
                    </div>
                    <div className="coin-price">
                      <span className="price">₹12,450</span>
                      <span className="change negative">-0.5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trade' && (
            <div className="trade-section">
              <div className="trade-card">
                <h2>Place OTC Order</h2>
                <p className="trade-info">Execute large trades with personalized rates</p>
                
                <div className="trade-type-selector">
                  <button className="trade-type active">Buy</button>
                  <button className="trade-type">Sell</button>
                </div>

                <div className="trade-form">
                  <div className="form-group">
                    <label>Select Asset</label>
                    <select>
                      <option>Bitcoin (BTC)</option>
                      <option>Ethereum (ETH)</option>
                      <option>USDT</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Amount (INR)</label>
                    <input type="text" placeholder="Enter amount in INR" />
                  </div>
                  <div className="indicative-rate">
                    <span>Indicative Rate:</span>
                    <span>₹87,45,000 / BTC</span>
                  </div>
                  <p className="disclaimer">
                    * Final rate will be confirmed by our OTC desk
                  </p>
                  <button className="btn-trade" disabled>
                    Complete KYC to Trade
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-section">
              <h2>Your Orders</h2>
              <div className="empty-state">
                <span className="empty-icon">📋</span>
                <p>No orders yet</p>
                <span>Your OTC orders will appear here</span>
              </div>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="wallet-section">
              <h2>Your Wallets</h2>
              <div className="empty-state">
                <span className="empty-icon">💰</span>
                <p>No wallets added</p>
                <span>Add your crypto wallet addresses for withdrawals</span>
                <button className="btn-add">+ Add Wallet</button>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="profile-card">
                <h2>Account Details</h2>
                <div className="profile-info">
                  <div className="info-row">
                    <span className="info-label">Email</span>
                    <span className="info-value">{user?.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Mobile</span>
                    <span className="info-value">{user?.mobile_number}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Account Type</span>
                    <span className="info-value">{user?.account_type || 'Individual'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">KYC Status</span>
                    <span className={`status-badge ${user?.kyc_status || 'pending'}`}>
                      {user?.kyc_status || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="kyc-card">
                <h2>KYC Verification</h2>
                <p>Complete your KYC to start trading on BharatBit</p>
                <div className="kyc-steps">
                  <div className="step">
                    <span className="step-num">1</span>
                    <span>Personal Details</span>
                  </div>
                  <div className="step">
                    <span className="step-num">2</span>
                    <span>Document Upload</span>
                  </div>
                  <div className="step">
                    <span className="step-num">3</span>
                    <span>Verification</span>
                  </div>
                </div>
                <button className="btn-kyc">Start KYC Process</button>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .dashboard {
          display: flex;
          min-height: 100vh;
          background: #f5f7fa;
        }
        .loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          gap: 16px;
        }
        .sidebar {
          width: 260px;
          background: #1a1a2e;
          color: white;
          display: flex;
          flex-direction: column;
        }
        .sidebar-header {
          padding: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
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
        }
        .logo span {
          font-size: 20px;
          font-weight: 700;
        }
        .sidebar-nav {
          flex: 1;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: transparent;
          border: none;
          border-radius: 10px;
          color: rgba(255,255,255,0.7);
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .nav-item:hover {
          background: rgba(255,255,255,0.1);
          color: white;
        }
        .nav-item.active {
          background: #E95721;
          color: white;
        }
        .nav-icon {
          font-size: 18px;
        }
        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 12px 16px;
          background: rgba(255,255,255,0.05);
          border: none;
          border-radius: 10px;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
        }
        .logout-btn:hover {
          background: rgba(255,255,255,0.1);
          color: white;
        }
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 32px;
          background: white;
          border-bottom: 1px solid #e0e0e0;
        }
        .topbar h1 {
          font-size: 24px;
          color: #1a1a2e;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .kyc-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
        }
        .kyc-badge[data-status="pending"] {
          background: #fff3cd;
          color: #856404;
        }
        .kyc-badge[data-status="approved"] {
          background: #d4edda;
          color: #155724;
        }
        .user-email {
          color: #666;
          font-size: 14px;
        }
        .kyc-alert {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 32px;
          padding: 16px 20px;
          background: #fff3cd;
          border-radius: 12px;
          color: #856404;
        }
        .kyc-alert p {
          flex: 1;
          font-size: 14px;
        }
        .kyc-alert button {
          padding: 8px 16px;
          background: #E95721;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
        }
        .content-area {
          flex: 1;
          padding: 24px 32px;
          overflow-y: auto;
        }
        .portfolio-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }
        .summary-card {
          background: white;
          padding: 24px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .card-label {
          font-size: 13px;
          color: #666;
          text-transform: uppercase;
        }
        .card-value {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a2e;
        }
        .card-change {
          font-size: 14px;
          font-weight: 500;
        }
        .card-change.positive { color: #22c55e; }
        .card-change.negative { color: #ef4444; }
        .market-prices h2 {
          font-size: 18px;
          color: #1a1a2e;
          margin-bottom: 16px;
        }
        .price-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .price-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .coin-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .coin-icon {
          width: 44px;
          height: 44px;
          background: #f0f0f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        .coin-name {
          display: block;
          font-weight: 600;
          color: #1a1a2e;
        }
        .coin-symbol {
          font-size: 13px;
          color: #666;
        }
        .coin-price {
          text-align: right;
        }
        .price {
          display: block;
          font-weight: 600;
          color: #1a1a2e;
        }
        .change {
          font-size: 13px;
          font-weight: 500;
        }
        .change.positive { color: #22c55e; }
        .change.negative { color: #ef4444; }
        .trade-section {
          max-width: 500px;
        }
        .trade-card {
          background: white;
          padding: 32px;
          border-radius: 16px;
        }
        .trade-card h2 {
          margin-bottom: 8px;
        }
        .trade-info {
          color: #666;
          margin-bottom: 24px;
        }
        .trade-type-selector {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }
        .trade-type {
          flex: 1;
          padding: 14px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          background: white;
          font-weight: 600;
          cursor: pointer;
        }
        .trade-type.active {
          border-color: #E95721;
          background: rgba(233, 87, 33, 0.05);
          color: #E95721;
        }
        .trade-form .form-group {
          margin-bottom: 20px;
        }
        .trade-form label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #666;
          margin-bottom: 8px;
        }
        .trade-form input, .trade-form select {
          width: 100%;
          height: 48px;
          padding: 0 16px;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          font-size: 16px;
        }
        .indicative-rate {
          display: flex;
          justify-content: space-between;
          padding: 12px 16px;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 12px;
        }
        .disclaimer {
          font-size: 12px;
          color: #999;
          margin-bottom: 20px;
        }
        .btn-trade {
          width: 100%;
          padding: 16px;
          background: #ccc;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
        }
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 16px;
        }
        .empty-icon {
          font-size: 48px;
          display: block;
          margin-bottom: 16px;
        }
        .empty-state p {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a2e;
          margin-bottom: 8px;
        }
        .empty-state span {
          color: #666;
        }
        .btn-add {
          margin-top: 20px;
          padding: 12px 24px;
          background: #E95721;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
        }
        .profile-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .profile-card, .kyc-card {
          background: white;
          padding: 28px;
          border-radius: 16px;
        }
        .profile-card h2, .kyc-card h2 {
          margin-bottom: 20px;
        }
        .profile-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding-bottom: 16px;
          border-bottom: 1px solid #f0f0f0;
        }
        .info-label {
          color: #666;
        }
        .info-value {
          font-weight: 500;
        }
        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
        }
        .status-badge.pending {
          background: #fff3cd;
          color: #856404;
        }
        .status-badge.approved {
          background: #d4edda;
          color: #155724;
        }
        .kyc-card p {
          color: #666;
          margin-bottom: 24px;
        }
        .kyc-steps {
          display: flex;
          gap: 20px;
          margin-bottom: 24px;
        }
        .step {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #666;
        }
        .step-num {
          width: 32px;
          height: 32px;
          background: #f0f0f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }
        .btn-kyc {
          width: 100%;
          padding: 14px;
          background: #E95721;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
        }
        @media (max-width: 1024px) {
          .sidebar {
            width: 80px;
          }
          .sidebar-header .logo span,
          .nav-item span:last-child,
          .logout-btn span:last-child {
            display: none;
          }
          .portfolio-summary, .price-grid, .profile-section {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .sidebar {
            display: none;
          }
          .content-area {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  )
}
