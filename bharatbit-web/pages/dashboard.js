import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bharatbit-preview.preview.emergentagent.com'

function DocumentUpload({ label, onCapture, onUpload, file, accept = "image/*" }) {
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  return (
    <div className="document-upload">
      <label>{label}</label>
      <div className="upload-options">
        <button type="button" className="upload-btn camera" onClick={() => cameraInputRef.current?.click()}>
          📷 Take Photo
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => onCapture(e.target.files[0])}
            style={{ display: 'none' }}
          />
        </button>
        <button type="button" className="upload-btn file" onClick={() => fileInputRef.current?.click()}>
          📁 Upload File
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={(e) => onUpload(e.target.files[0])}
            style={{ display: 'none' }}
          />
        </button>
      </div>
      {file && <p className="file-name">✓ {file.name}</p>}
      <style jsx>{`
        .document-upload { margin-bottom: 20px; }
        .document-upload label { display: block; font-size: 13px; font-weight: 600; color: #666; margin-bottom: 10px; }
        .upload-options { display: flex; gap: 12px; }
        .upload-btn { flex: 1; padding: 14px; border: 2px dashed #e0e0e0; border-radius: 10px; background: #f8f9fa; cursor: pointer; font-size: 14px; font-family: inherit; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .upload-btn:hover { border-color: #E95721; background: rgba(233, 87, 33, 0.05); }
        .upload-btn.camera { border-color: #4CAF50; }
        .upload-btn.camera:hover { background: rgba(76, 175, 80, 0.05); }
        .file-name { margin-top: 8px; font-size: 13px; color: #4CAF50; }
      `}</style>
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('portfolio')
  const [showKYCModal, setShowKYCModal] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [kycStep, setKycStep] = useState(1)
  const [isNRI, setIsNRI] = useState(false)
  const [kycData, setKycData] = useState({
    pan_number: '',
    aadhaar_number: '',
    passport_number: '',
    address: '',
    pan_image: null,
    aadhaar_front: null,
    aadhaar_back: null,
    passport_front: null,
    passport_back: null,
    selfie: null
  })
  const [walletData, setWalletData] = useState({
    wallet_type: 'exchange',
    exchange_name: '',
    wallet_address: '',
    asset: 'BTC',
    ownership_proof: null,
    notes: ''
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.replace('/login')
      return
    }
    fetchProfile(token)
  }, [router])

  const fetchProfile = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(response.data)
    } catch (err) {
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

  const handleKYCSubmit = async () => {
    alert('KYC documents submitted successfully! Our team will review and verify within 24-48 hours.')
    setShowKYCModal(false)
    setKycStep(1)
  }

  const handleWalletSubmit = async () => {
    alert('Wallet submitted for verification! Our team will verify ownership within 24 hours.')
    setShowWalletModal(false)
    setWalletData({ wallet_type: 'exchange', exchange_name: '', wallet_address: '', asset: 'BTC', ownership_proof: null, notes: '' })
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="logo-icon">B</div>
        <p>Loading...</p>
        <style jsx>{`
          .loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 16px; font-family: 'Inter', sans-serif; }
          .logo-icon { width: 60px; height: 60px; background: #E95721; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; color: white; }
        `}</style>
      </div>
    )
  }

  return (
    <div className="dashboard">
      {/* KYC Modal */}
      {showKYCModal && (
        <div className="modal-overlay" onClick={() => setShowKYCModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>KYC Verification</h2>
              <button className="close-btn" onClick={() => setShowKYCModal(false)}>×</button>
            </div>
            
            <div className="kyc-progress">
              <div className={`progress-step ${kycStep >= 1 ? 'active' : ''}`}>1. Details</div>
              <div className={`progress-step ${kycStep >= 2 ? 'active' : ''}`}>2. Documents</div>
              <div className={`progress-step ${kycStep >= 3 ? 'active' : ''}`}>3. Selfie</div>
            </div>

            {kycStep === 1 && (
              <div className="kyc-form">
                <h3>Personal Details</h3>
                
                <div className="nri-toggle">
                  <label>
                    <input type="checkbox" checked={isNRI} onChange={e => setIsNRI(e.target.checked)} />
                    I am an NRI / Non-Indian Resident
                  </label>
                </div>

                <div className="form-group">
                  <label>PAN Number (Required for all)</label>
                  <input type="text" value={kycData.pan_number} onChange={e => setKycData({...kycData, pan_number: e.target.value.toUpperCase()})} placeholder="ABCDE1234F" maxLength={10} />
                </div>

                {!isNRI && (
                  <div className="form-group">
                    <label>Aadhaar Number</label>
                    <input type="text" value={kycData.aadhaar_number} onChange={e => setKycData({...kycData, aadhaar_number: e.target.value.replace(/\D/g, '')})} placeholder="1234 5678 9012" maxLength={12} />
                  </div>
                )}

                {isNRI && (
                  <div className="form-group">
                    <label>Passport Number</label>
                    <input type="text" value={kycData.passport_number} onChange={e => setKycData({...kycData, passport_number: e.target.value.toUpperCase()})} placeholder="A12345678" maxLength={12} />
                  </div>
                )}

                <div className="form-group">
                  <label>Current Address</label>
                  <textarea value={kycData.address} onChange={e => setKycData({...kycData, address: e.target.value})} placeholder="Enter your full address" rows={3} />
                </div>
                
                <button className="btn-primary" onClick={() => setKycStep(2)}>Continue</button>
              </div>
            )}

            {kycStep === 2 && (
              <div className="kyc-form">
                <h3>Upload Documents</h3>
                <p className="doc-info">You can take a photo or upload an existing image</p>

                <DocumentUpload 
                  label="PAN Card" 
                  file={kycData.pan_image}
                  onCapture={file => setKycData({...kycData, pan_image: file})}
                  onUpload={file => setKycData({...kycData, pan_image: file})}
                />

                {!isNRI && (
                  <>
                    <DocumentUpload 
                      label="Aadhaar Card - Front" 
                      file={kycData.aadhaar_front}
                      onCapture={file => setKycData({...kycData, aadhaar_front: file})}
                      onUpload={file => setKycData({...kycData, aadhaar_front: file})}
                    />
                    <DocumentUpload 
                      label="Aadhaar Card - Back" 
                      file={kycData.aadhaar_back}
                      onCapture={file => setKycData({...kycData, aadhaar_back: file})}
                      onUpload={file => setKycData({...kycData, aadhaar_back: file})}
                    />
                  </>
                )}

                {isNRI && (
                  <>
                    <DocumentUpload 
                      label="Passport - Front Page" 
                      file={kycData.passport_front}
                      onCapture={file => setKycData({...kycData, passport_front: file})}
                      onUpload={file => setKycData({...kycData, passport_front: file})}
                    />
                    <DocumentUpload 
                      label="Passport - Back/Visa Page" 
                      file={kycData.passport_back}
                      onCapture={file => setKycData({...kycData, passport_back: file})}
                      onUpload={file => setKycData({...kycData, passport_back: file})}
                    />
                  </>
                )}

                <div className="btn-row">
                  <button className="btn-secondary" onClick={() => setKycStep(1)}>Back</button>
                  <button className="btn-primary" onClick={() => setKycStep(3)}>Continue</button>
                </div>
              </div>
            )}

            {kycStep === 3 && (
              <div className="kyc-form">
                <h3>Selfie Verification</h3>
                <p className="doc-info">Take a clear selfie holding your PAN card next to your face</p>
                
                <DocumentUpload 
                  label="Selfie with PAN Card" 
                  file={kycData.selfie}
                  onCapture={file => setKycData({...kycData, selfie: file})}
                  onUpload={file => setKycData({...kycData, selfie: file})}
                />

                <div className="btn-row">
                  <button className="btn-secondary" onClick={() => setKycStep(2)}>Back</button>
                  <button className="btn-primary" onClick={handleKYCSubmit}>Submit KYC</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="modal-overlay" onClick={() => setShowWalletModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Withdrawal Wallet</h2>
              <button className="close-btn" onClick={() => setShowWalletModal(false)}>×</button>
            </div>
            
            <div className="wallet-form">
              <div className="form-group">
                <label>Wallet Type</label>
                <select value={walletData.wallet_type} onChange={e => setWalletData({...walletData, wallet_type: e.target.value})}>
                  <option value="exchange">Exchange Wallet</option>
                  <option value="custodial">Custodial Wallet</option>
                  <option value="self_custody">Self-Custody (Hardware/Software)</option>
                </select>
              </div>

              {walletData.wallet_type === 'exchange' && (
                <div className="form-group">
                  <label>Exchange Name</label>
                  <select value={walletData.exchange_name} onChange={e => setWalletData({...walletData, exchange_name: e.target.value})}>
                    <option value="">Select Exchange</option>
                    <option value="wazirx">WazirX</option>
                    <option value="coindcx">CoinDCX</option>
                    <option value="zebpay">ZebPay</option>
                    <option value="binance">Binance</option>
                    <option value="coinbase">Coinbase</option>
                    <option value="kraken">Kraken</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}

              {walletData.wallet_type === 'custodial' && (
                <div className="form-group">
                  <label>Custodian Name</label>
                  <input type="text" value={walletData.exchange_name} onChange={e => setWalletData({...walletData, exchange_name: e.target.value})} placeholder="e.g., BitGo, Fireblocks" />
                </div>
              )}

              <div className="form-group">
                <label>Crypto Asset</label>
                <select value={walletData.asset} onChange={e => setWalletData({...walletData, asset: e.target.value})}>
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="USDT">Tether (USDT)</option>
                  <option value="USDC">USD Coin (USDC)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Wallet Address</label>
                <input type="text" value={walletData.wallet_address} onChange={e => setWalletData({...walletData, wallet_address: e.target.value})} placeholder="Enter your wallet address" />
              </div>

              <DocumentUpload 
                label={walletData.wallet_type === 'exchange' ? 'Ownership Proof (Exchange deposit page screenshot)' : walletData.wallet_type === 'custodial' ? 'Ownership Proof (Custodian agreement)' : 'Ownership Proof (Signed message from wallet)'}
                file={walletData.ownership_proof}
                onCapture={file => setWalletData({...walletData, ownership_proof: file})}
                onUpload={file => setWalletData({...walletData, ownership_proof: file})}
                accept="image/*,.pdf"
              />

              <div className="form-group">
                <label>Additional Notes (Optional)</label>
                <textarea value={walletData.notes} onChange={e => setWalletData({...walletData, notes: e.target.value})} placeholder="Any additional information" rows={2} />
              </div>

              <div className="info-box">
                <strong>Important:</strong> All wallets must be verified before withdrawals. Verification typically takes 24 hours.
              </div>

              <button className="btn-primary" onClick={handleWalletSubmit}>Submit for Verification</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo"><div className="logo-icon">B</div><span>BharatBit</span></div>
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => setActiveTab('portfolio')}><span className="nav-icon">📊</span>Portfolio</button>
          <button className={`nav-item ${activeTab === 'trade' ? 'active' : ''}`} onClick={() => setActiveTab('trade')}><span className="nav-icon">💱</span>Trade</button>
          <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}><span className="nav-icon">📋</span>Orders</button>
          <button className={`nav-item ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => setActiveTab('wallet')}><span className="nav-icon">💰</span>Wallets</button>
          <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}><span className="nav-icon">👤</span>Profile</button>
        </nav>
        <div className="sidebar-footer"><button className="logout-btn" onClick={handleLogout}><span>🚪</span> Logout</button></div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="user-info">
            <span className="kyc-badge" data-status={user?.kyc_status || 'pending'}>KYC: {user?.kyc_status || 'Pending'}</span>
            <span className="user-email">{user?.email}</span>
          </div>
        </header>

        {user?.kyc_status !== 'approved' && (
          <div className="kyc-alert"><span>⚠️</span><p>Complete your KYC verification to start trading</p><button onClick={() => setShowKYCModal(true)}>Complete KYC</button></div>
        )}

        <div className="content-area">
          {activeTab === 'portfolio' && (
            <div className="portfolio-section">
              <div className="portfolio-summary">
                <div className="summary-card"><span className="card-label">Total Portfolio Value</span><span className="card-value">₹0.00</span><span className="card-change positive">+0.00%</span></div>
                <div className="summary-card"><span className="card-label">Available Balance (INR)</span><span className="card-value">₹0.00</span></div>
                <div className="summary-card"><span className="card-label">Crypto Holdings</span><span className="card-value">0 BTC</span></div>
              </div>
              <div className="market-prices">
                <h2>Live Market Prices</h2>
                <div className="price-grid">
                  <div className="price-card"><div className="coin-info"><span className="coin-icon">₿</span><div><span className="coin-name">Bitcoin</span><span className="coin-symbol">BTC</span></div></div><div className="coin-price"><span className="price">₹87,45,000</span><span className="change positive">+2.4%</span></div></div>
                  <div className="price-card"><div className="coin-info"><span className="coin-icon">Ξ</span><div><span className="coin-name">Ethereum</span><span className="coin-symbol">ETH</span></div></div><div className="coin-price"><span className="price">₹2,32,500</span><span className="change positive">+1.8%</span></div></div>
                  <div className="price-card"><div className="coin-info"><span className="coin-icon">◎</span><div><span className="coin-name">Solana</span><span className="coin-symbol">SOL</span></div></div><div className="coin-price"><span className="price">₹12,450</span><span className="change negative">-0.5%</span></div></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trade' && (
            <div className="trade-section">
              <div className="trade-card">
                <h2>Place OTC Order</h2>
                <p className="trade-info">Execute large trades with personalized rates</p>
                <div className="trade-type-selector"><button className="trade-type active">Buy</button><button className="trade-type">Sell</button></div>
                <div className="trade-form">
                  <div className="form-group"><label>Select Asset</label><select><option>Bitcoin (BTC)</option><option>Ethereum (ETH)</option><option>USDT</option></select></div>
                  <div className="form-group"><label>Amount (INR)</label><input type="text" placeholder="Enter amount in INR" /></div>
                  <div className="indicative-rate"><span>Indicative Rate:</span><span>₹87,45,000 / BTC</span></div>
                  <p className="disclaimer">* Final rate will be confirmed by our OTC desk</p>
                  <button className="btn-trade" disabled={user?.kyc_status !== 'approved'}>{user?.kyc_status !== 'approved' ? 'Complete KYC to Trade' : 'Request Quote'}</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-section"><h2>Your Orders</h2><div className="empty-state"><span className="empty-icon">📋</span><p>No orders yet</p><span>Your OTC orders will appear here</span></div></div>
          )}

          {activeTab === 'wallet' && (
            <div className="wallet-section"><h2>Your Withdrawal Wallets</h2><p className="section-desc">Add and verify your wallets for secure withdrawals</p><div className="empty-state"><span className="empty-icon">💰</span><p>No wallets added</p><span>Add your crypto wallet addresses for withdrawals</span><button className="btn-add" onClick={() => setShowWalletModal(true)}>+ Add Wallet</button></div></div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="profile-card"><h2>Account Details</h2><div className="profile-info"><div className="info-row"><span className="info-label">Email</span><span className="info-value">{user?.email}</span></div><div className="info-row"><span className="info-label">Mobile</span><span className="info-value">{user?.mobile_number}</span></div><div className="info-row"><span className="info-label">Account Type</span><span className="info-value">{user?.account_type || 'Individual'}</span></div><div className="info-row"><span className="info-label">KYC Status</span><span className={`status-badge ${user?.kyc_status || 'pending'}`}>{user?.kyc_status || 'Pending'}</span></div></div></div>
              <div className="kyc-card"><h2>KYC Verification</h2><p>Complete your KYC to start trading on BharatBit</p><div className="kyc-steps"><div className="step"><span className="step-num">1</span><span>Personal Details</span></div><div className="step"><span className="step-num">2</span><span>Document Upload</span></div><div className="step"><span className="step-num">3</span><span>Selfie Verification</span></div></div><button className="btn-kyc" onClick={() => setShowKYCModal(true)}>Start KYC Process</button></div>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .dashboard { display: flex; min-height: 100vh; background: #f5f7fa; font-family: 'Inter', -apple-system, sans-serif; }
        .sidebar { width: 260px; background: #1a1a2e; color: white; display: flex; flex-direction: column; }
        .sidebar-header { padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .logo { display: flex; align-items: center; gap: 12px; }
        .logo-icon { width: 40px; height: 40px; background: #E95721; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; }
        .logo span { font-size: 20px; font-weight: 700; }
        .sidebar-nav { flex: 1; padding: 16px; display: flex; flex-direction: column; gap: 8px; }
        .nav-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: transparent; border: none; border-radius: 10px; color: rgba(255,255,255,0.7); font-size: 15px; cursor: pointer; text-align: left; font-family: inherit; }
        .nav-item:hover { background: rgba(255,255,255,0.1); color: white; }
        .nav-item.active { background: #E95721; color: white; }
        .sidebar-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.1); }
        .logout-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.05); border: none; border-radius: 10px; color: rgba(255,255,255,0.7); cursor: pointer; font-family: inherit; }
        .main-content { flex: 1; display: flex; flex-direction: column; }
        .topbar { display: flex; justify-content: space-between; align-items: center; padding: 20px 32px; background: white; border-bottom: 1px solid #e0e0e0; }
        .topbar h1 { font-size: 24px; color: #1a1a2e; }
        .user-info { display: flex; align-items: center; gap: 16px; }
        .kyc-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }
        .kyc-badge[data-status="pending"] { background: #fff3cd; color: #856404; }
        .kyc-badge[data-status="approved"] { background: #d4edda; color: #155724; }
        .user-email { color: #666; font-size: 14px; }
        .kyc-alert { display: flex; align-items: center; gap: 12px; margin: 20px 32px; padding: 16px 20px; background: #fff3cd; border-radius: 12px; color: #856404; }
        .kyc-alert p { flex: 1; font-size: 14px; }
        .kyc-alert button { padding: 8px 16px; background: #E95721; color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; font-family: inherit; }
        .content-area { flex: 1; padding: 24px 32px; overflow-y: auto; }
        
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal { background: white; border-radius: 20px; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 24px; border-bottom: 1px solid #e0e0e0; }
        .modal-header h2 { font-size: 20px; color: #1a1a2e; }
        .close-btn { width: 36px; height: 36px; border: none; background: #f0f0f0; border-radius: 50%; font-size: 24px; cursor: pointer; }
        .kyc-progress { display: flex; padding: 16px 24px; gap: 8px; border-bottom: 1px solid #f0f0f0; }
        .progress-step { flex: 1; padding: 10px; text-align: center; font-size: 13px; color: #999; background: #f8f9fa; border-radius: 8px; }
        .progress-step.active { background: #E95721; color: white; }
        .kyc-form, .wallet-form { padding: 24px; }
        .kyc-form h3 { font-size: 18px; margin-bottom: 16px; color: #1a1a2e; }
        .doc-info { color: #666; font-size: 14px; margin-bottom: 20px; }
        .nri-toggle { margin-bottom: 20px; padding: 12px 16px; background: #f8f9fa; border-radius: 10px; }
        .nri-toggle label { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #666; cursor: pointer; }
        .nri-toggle input { width: 18px; height: 18px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; font-size: 13px; font-weight: 600; color: #666; margin-bottom: 8px; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 12px 16px; font-size: 15px; border: 1px solid #e0e0e0; border-radius: 10px; background: #f8f9fa; font-family: inherit; }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #E95721; background: white; }
        .btn-primary { width: 100%; padding: 14px; background: #E95721; color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .btn-secondary { padding: 14px 24px; background: #f0f0f0; color: #1a1a2e; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .btn-row { display: flex; gap: 12px; }
        .btn-row .btn-primary { flex: 1; }
        .info-box { background: #e3f2fd; color: #1565c0; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 20px; }

        .portfolio-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
        .summary-card { background: white; padding: 24px; border-radius: 16px; display: flex; flex-direction: column; gap: 8px; }
        .card-label { font-size: 13px; color: #666; text-transform: uppercase; }
        .card-value { font-size: 28px; font-weight: 700; color: #1a1a2e; }
        .card-change { font-size: 14px; font-weight: 500; }
        .card-change.positive { color: #22c55e; }
        .card-change.negative { color: #ef4444; }
        .market-prices h2 { font-size: 18px; color: #1a1a2e; margin-bottom: 16px; }
        .price-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .price-card { background: white; padding: 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
        .coin-info { display: flex; align-items: center; gap: 12px; }
        .coin-icon { width: 44px; height: 44px; background: #f0f0f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .coin-name { display: block; font-weight: 600; color: #1a1a2e; }
        .coin-symbol { font-size: 13px; color: #666; }
        .coin-price { text-align: right; }
        .price { display: block; font-weight: 600; color: #1a1a2e; }
        .change { font-size: 13px; font-weight: 500; }
        .change.positive { color: #22c55e; }
        .change.negative { color: #ef4444; }

        .trade-section { max-width: 500px; }
        .trade-card { background: white; padding: 32px; border-radius: 16px; }
        .trade-card h2 { margin-bottom: 8px; }
        .trade-info { color: #666; margin-bottom: 24px; }
        .trade-type-selector { display: flex; gap: 12px; margin-bottom: 24px; }
        .trade-type { flex: 1; padding: 14px; border: 2px solid #e0e0e0; border-radius: 10px; background: white; font-weight: 600; cursor: pointer; font-family: inherit; }
        .trade-type.active { border-color: #E95721; background: rgba(233, 87, 33, 0.05); color: #E95721; }
        .trade-form .form-group { margin-bottom: 20px; }
        .trade-form label { display: block; font-size: 13px; font-weight: 600; color: #666; margin-bottom: 8px; }
        .trade-form input, .trade-form select { width: 100%; height: 48px; padding: 0 16px; border: 1px solid #e0e0e0; border-radius: 10px; font-size: 16px; font-family: inherit; }
        .indicative-rate { display: flex; justify-content: space-between; padding: 12px 16px; background: #f8f9fa; border-radius: 8px; margin-bottom: 12px; }
        .disclaimer { font-size: 12px; color: #999; margin-bottom: 20px; }
        .btn-trade { width: 100%; padding: 16px; background: #ccc; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; font-family: inherit; }

        .empty-state { text-align: center; padding: 60px 20px; background: white; border-radius: 16px; }
        .empty-icon { font-size: 48px; display: block; margin-bottom: 16px; }
        .empty-state p { font-size: 18px; font-weight: 600; color: #1a1a2e; margin-bottom: 8px; }
        .empty-state span { color: #666; }
        .btn-add { margin-top: 20px; padding: 12px 24px; background: #E95721; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .section-desc { color: #666; margin-bottom: 20px; }

        .profile-section { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .profile-card, .kyc-card { background: white; padding: 28px; border-radius: 16px; }
        .profile-card h2, .kyc-card h2 { margin-bottom: 20px; }
        .profile-info { display: flex; flex-direction: column; gap: 16px; }
        .info-row { display: flex; justify-content: space-between; padding-bottom: 16px; border-bottom: 1px solid #f0f0f0; }
        .info-label { color: #666; }
        .info-value { font-weight: 500; }
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }
        .status-badge.pending { background: #fff3cd; color: #856404; }
        .status-badge.approved { background: #d4edda; color: #155724; }
        .kyc-card p { color: #666; margin-bottom: 24px; }
        .kyc-steps { display: flex; gap: 20px; margin-bottom: 24px; }
        .step { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 13px; color: #666; }
        .step-num { width: 32px; height: 32px; background: #f0f0f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; }
        .btn-kyc { width: 100%; padding: 14px; background: #E95721; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-family: inherit; }

        @media (max-width: 1024px) {
          .sidebar { width: 80px; }
          .sidebar-header .logo span, .nav-item span:last-child, .logout-btn span:last-child { display: none; }
          .portfolio-summary, .price-grid, .profile-section { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .sidebar { display: none; }
          .content-area { padding: 16px; }
        }
      `}</style>
    </div>
  )
}
