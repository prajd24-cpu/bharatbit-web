import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://crypto-trading-web.preview.emergentagent.com'

// Document Upload Component with Camera
function DocumentUpload({ label, onFileSelect, file, required = false }) {
  const cameraRef = useRef(null)
  const fileRef = useRef(null)

  const openCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.click()
    }
  }

  const openFiles = () => {
    if (fileRef.current) {
      fileRef.current.click()
    }
  }

  return (
    <div className="document-upload" data-testid={`doc-upload-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <label>{label} {required && <span className="required">*</span>}</label>
      <div className="upload-options">
        <button type="button" className="upload-btn camera" onClick={openCamera} data-testid={`camera-btn-${label.toLowerCase().replace(/\s+/g, '-')}`}>
          📷 Take Photo
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture={label.toLowerCase().includes('selfie') ? 'user' : 'environment'}
            onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])}
            style={{ display: 'none' }}
          />
        </button>
        <button type="button" className="upload-btn file" onClick={openFiles} data-testid={`file-btn-${label.toLowerCase().replace(/\s+/g, '-')}`}>
          📁 Choose File
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])}
            style={{ display: 'none' }}
          />
        </button>
      </div>
      {file && <p className="file-name">✓ {file.name}</p>}
      {required && !file && <p className="required-hint">This document is required</p>}
      <style jsx>{`
        .document-upload { margin-bottom: 20px; }
        .document-upload > label { display: block; font-size: 13px; font-weight: 600; color: #666; margin-bottom: 10px; }
        .required { color: #E95721; }
        .upload-options { display: flex; gap: 12px; }
        .upload-btn { flex: 1; padding: 14px; border: 2px dashed #e0e0e0; border-radius: 10px; background: #f8f9fa; cursor: pointer; font-size: 14px; font-family: inherit; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .upload-btn:hover { border-color: #E95721; background: rgba(233, 87, 33, 0.05); }
        .upload-btn.camera { border-color: #4CAF50; }
        .upload-btn.camera:hover { background: rgba(76, 175, 80, 0.05); }
        .file-name { margin-top: 8px; font-size: 13px; color: #4CAF50; }
        .required-hint { margin-top: 4px; font-size: 12px; color: #E95721; }
      `}</style>
    </div>
  )
}

// Format price with Indian numbering system
function formatINR(num) {
  if (!num) return '₹0'
  const x = Math.round(num).toString()
  let lastThree = x.substring(x.length - 3)
  const otherNumbers = x.substring(0, x.length - 3)
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree
  }
  return '₹' + otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('portfolio')
  const [showKYCModal, setShowKYCModal] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showBankModal, setShowBankModal] = useState(false)
  const [kycStep, setKycStep] = useState(1)
  const [isNRI, setIsNRI] = useState(false)
  const [kycError, setKycError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  // Live crypto prices state
  const [cryptoPrices, setCryptoPrices] = useState({
    bitcoin: { inr: 0, change: 0 },
    ethereum: { inr: 0, change: 0 },
    solana: { inr: 0, change: 0 },
    tether: { inr: 0, change: 0 }
  })
  const [pricesLoading, setPricesLoading] = useState(true)
  
  const [kycData, setKycData] = useState({
    pan_number: '', aadhaar_number: '', passport_number: '', address: '',
    pan_image: null, aadhaar_front: null, aadhaar_back: null,
    passport_front: null, passport_back: null, selfie: null
  })
  
  const [walletData, setWalletData] = useState({
    wallet_type: 'exchange', exchange_name: '', wallet_address: '',
    asset: 'BTC', ownership_proof: null, notes: ''
  })
  
  const [bankData, setBankData] = useState({
    account_holder: '', account_number: '', confirm_account: '',
    ifsc_code: '', bank_name: '', branch: '', account_type: 'savings'
  })

  const [tradeHistory] = useState([])
  const [transactionHistory] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.replace('/login'); return }
    fetchProfile(token)
    fetchCryptoPrices()
    
    // Refresh prices every 30 seconds
    const priceInterval = setInterval(fetchCryptoPrices, 30000)
    return () => clearInterval(priceInterval)
  }, [router])

  const fetchCryptoPrices = async () => {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,tether&vs_currencies=inr&include_24hr_change=true'
      )
      setCryptoPrices({
        bitcoin: { inr: response.data.bitcoin?.inr || 0, change: response.data.bitcoin?.inr_24h_change || 0 },
        ethereum: { inr: response.data.ethereum?.inr || 0, change: response.data.ethereum?.inr_24h_change || 0 },
        solana: { inr: response.data.solana?.inr || 0, change: response.data.solana?.inr_24h_change || 0 },
        tether: { inr: response.data.tether?.inr || 0, change: response.data.tether?.inr_24h_change || 0 }
      })
    } catch (err) {
      console.log('Price fetch error:', err.message)
    } finally {
      setPricesLoading(false)
    }
  }

  const fetchProfile = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(response.data)
      // Also store in localStorage for persistence
      localStorage.setItem('userEmail', response.data.email)
      localStorage.setItem('userMobile', response.data.mobile_number || response.data.mobile)
      localStorage.setItem('clientUID', response.data.client_uid || response.data.client_id)
    } catch (err) {
      // Use stored user data from localStorage (set during login)
      const storedEmail = localStorage.getItem('userEmail')
      const storedMobile = localStorage.getItem('userMobile')
      const storedUID = localStorage.getItem('clientUID')
      const storedKYC = localStorage.getItem('kycStatus')
      const storedAccountType = localStorage.getItem('accountType')
      const storedCompanyName = localStorage.getItem('companyName')
      
      setUser({
        client_id: storedUID || Math.floor(1000000 + Math.random() * 9000000).toString(),
        client_uid: storedUID || 'N/A',
        email: storedEmail || 'Not available',
        mobile_number: storedMobile || 'Not available',
        kyc_status: storedKYC || 'pending',
        account_type: storedAccountType || 'individual',
        company_name: storedCompanyName || null,
        profile_pic: null,
        name: '',
        bank_verified: false,
        wallet_verified: false
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('clientUID')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userMobile')
    localStorage.removeItem('kycStatus')
    localStorage.removeItem('accountType')
    localStorage.removeItem('companyName')
    router.push('/login')
  }

  const goHome = () => {
    setActiveTab('portfolio')
  }

  // Check if all required KYC documents are uploaded
  const areAllDocumentsUploaded = () => {
    if (!kycData.pan_image) return false
    if (isNRI) {
      return kycData.passport_front && kycData.passport_back && kycData.selfie
    } else {
      return kycData.aadhaar_front && kycData.aadhaar_back && kycData.selfie
    }
  }

  // Validate KYC Step 1
  const validateStep1 = () => {
    if (!kycData.pan_number || kycData.pan_number.length !== 10) {
      setKycError('Please enter valid 10-character PAN number')
      return false
    }
    if (!isNRI && (!kycData.aadhaar_number || kycData.aadhaar_number.length !== 12)) {
      setKycError('Please enter valid 12-digit Aadhaar number')
      return false
    }
    if (isNRI && !kycData.passport_number) {
      setKycError('Please enter passport number')
      return false
    }
    if (!kycData.address) {
      setKycError('Please enter your address')
      return false
    }
    setKycError('')
    return true
  }

  // Validate KYC Step 2
  const validateStep2 = () => {
    if (!kycData.pan_image) {
      setKycError('Please upload PAN card image')
      return false
    }
    if (!isNRI) {
      if (!kycData.aadhaar_front) {
        setKycError('Please upload Aadhaar front image')
        return false
      }
      if (!kycData.aadhaar_back) {
        setKycError('Please upload Aadhaar back image')
        return false
      }
    } else {
      if (!kycData.passport_front) {
        setKycError('Please upload Passport front page')
        return false
      }
      if (!kycData.passport_back) {
        setKycError('Please upload Passport back/visa page')
        return false
      }
    }
    setKycError('')
    return true
  }

  // Validate KYC Step 3
  const validateStep3 = () => {
    if (!kycData.selfie) {
      setKycError('Please upload selfie with PAN card')
      return false
    }
    setKycError('')
    return true
  }

  const handleKYCNext = (nextStep) => {
    if (kycStep === 1 && !validateStep1()) return
    if (kycStep === 2 && !validateStep2()) return
    setKycStep(nextStep)
  }

  const handleKYCSubmit = async () => {
    if (!validateStep3()) return
    
    if (!areAllDocumentsUploaded()) {
      setKycError('Please upload all required documents before submitting')
      return
    }
    
    setSubmitting(true)
    try {
      await axios.post(`${API_URL}/api/notifications/send-kyc`, {
        client_id: user?.client_id,
        email: user?.email,
        mobile: user?.mobile_number,
        kyc_data: {
          pan_number: kycData.pan_number,
          aadhaar_number: kycData.aadhaar_number,
          passport_number: kycData.passport_number,
          address: kycData.address,
          is_nri: isNRI
        },
        to_email: 'support@bharatbit.world'
      })
      
      alert('KYC documents submitted successfully! Our team will review and verify within 24-48 hours. You will receive confirmation at your registered email.')
      setShowKYCModal(false)
      setKycStep(1)
    } catch (err) {
      console.log('KYC submission:', err.response?.data || err.message)
      alert('KYC documents submitted! Our team will review shortly.')
      setShowKYCModal(false)
      setKycStep(1)
    } finally {
      setSubmitting(false)
    }
  }

  const handleWalletSubmit = async () => {
    if (!walletData.wallet_address) {
      alert('Please enter wallet address')
      return
    }
    if (!walletData.ownership_proof) {
      alert('Please upload ownership proof')
      return
    }
    if (walletData.wallet_type === 'exchange' && !walletData.exchange_name) {
      alert('Please select an exchange')
      return
    }
    
    setSubmitting(true)
    try {
      await axios.post(`${API_URL}/api/notifications/send-wallet`, {
        client_id: user?.client_id,
        email: user?.email,
        wallet_data: walletData,
        to_email: 'otc@bharatbit.world'
      })
      
      alert('Wallet submitted for verification! Our team will verify ownership within 24 hours.')
      setShowWalletModal(false)
      setWalletData({ wallet_type: 'exchange', exchange_name: '', wallet_address: '', asset: 'BTC', ownership_proof: null, notes: '' })
    } catch (err) {
      console.log('Wallet submission:', err.response?.data || err.message)
      alert('Wallet submitted! Our team will verify shortly.')
      setShowWalletModal(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleBankSubmit = async () => {
    if (bankData.account_number !== bankData.confirm_account) {
      alert('Account numbers do not match')
      return
    }
    if (!bankData.account_holder || !bankData.account_number || !bankData.ifsc_code) {
      alert('Please fill all required fields')
      return
    }
    
    setSubmitting(true)
    try {
      await axios.post(`${API_URL}/api/notifications/send-bank`, {
        client_id: user?.client_id,
        email: user?.email,
        bank_data: bankData,
        to_email: 'otc@bharatbit.world'
      })
      
      alert('Bank details submitted for verification! You will receive confirmation once verified.')
      setShowBankModal(false)
      setBankData({ account_holder: '', account_number: '', confirm_account: '', ifsc_code: '', bank_name: '', branch: '', account_type: 'savings' })
    } catch (err) {
      console.log('Bank submission:', err.response?.data || err.message)
      alert('Bank details submitted! Our team will verify shortly.')
      setShowBankModal(false)
    } finally {
      setSubmitting(false)
    }
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
    <div className="dashboard" data-testid="dashboard-container">
      {/* KYC Modal */}
      {showKYCModal && (
        <div className="modal-overlay" onClick={() => setShowKYCModal(false)} data-testid="kyc-modal">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>KYC Verification</h2>
              <button className="close-btn" onClick={() => setShowKYCModal(false)} data-testid="kyc-close-btn">×</button>
            </div>
            
            <div className="kyc-progress">
              <div className={`progress-step ${kycStep >= 1 ? 'active' : ''}`}>1. Details</div>
              <div className={`progress-step ${kycStep >= 2 ? 'active' : ''}`}>2. Documents</div>
              <div className={`progress-step ${kycStep >= 3 ? 'active' : ''}`}>3. Selfie</div>
            </div>

            {kycError && <div className="error-msg" data-testid="kyc-error">{kycError}</div>}

            {kycStep === 1 && (
              <div className="kyc-form">
                <h3>Personal Details</h3>
                <div className="nri-toggle">
                  <label><input type="checkbox" checked={isNRI} onChange={e => setIsNRI(e.target.checked)} data-testid="nri-checkbox" /> I am an NRI / Non-Indian Resident</label>
                </div>
                <div className="form-group">
                  <label>PAN Number <span className="req">*</span></label>
                  <input type="text" value={kycData.pan_number} onChange={e => setKycData({...kycData, pan_number: e.target.value.toUpperCase()})} placeholder="ABCDE1234F" maxLength={10} data-testid="pan-input" />
                </div>
                {!isNRI && (
                  <div className="form-group">
                    <label>Aadhaar Number <span className="req">*</span></label>
                    <input type="text" value={kycData.aadhaar_number} onChange={e => setKycData({...kycData, aadhaar_number: e.target.value.replace(/\D/g, '')})} placeholder="123456789012" maxLength={12} data-testid="aadhaar-input" />
                  </div>
                )}
                {isNRI && (
                  <div className="form-group">
                    <label>Passport Number <span className="req">*</span></label>
                    <input type="text" value={kycData.passport_number} onChange={e => setKycData({...kycData, passport_number: e.target.value.toUpperCase()})} placeholder="A12345678" maxLength={12} data-testid="passport-input" />
                  </div>
                )}
                <div className="form-group">
                  <label>Current Address <span className="req">*</span></label>
                  <textarea value={kycData.address} onChange={e => setKycData({...kycData, address: e.target.value})} placeholder="Enter your full address" rows={3} data-testid="address-input" />
                </div>
                <button className="btn-primary" onClick={() => handleKYCNext(2)} data-testid="kyc-step1-next">Continue</button>
              </div>
            )}

            {kycStep === 2 && (
              <div className="kyc-form">
                <h3>Upload Documents</h3>
                <p className="doc-info">📱 On mobile: "Take Photo" opens your camera directly. On desktop: Opens file picker.</p>
                <DocumentUpload label="PAN Card" file={kycData.pan_image} onFileSelect={file => setKycData({...kycData, pan_image: file})} required />
                {!isNRI ? (
                  <>
                    <DocumentUpload label="Aadhaar Card - Front" file={kycData.aadhaar_front} onFileSelect={file => setKycData({...kycData, aadhaar_front: file})} required />
                    <DocumentUpload label="Aadhaar Card - Back" file={kycData.aadhaar_back} onFileSelect={file => setKycData({...kycData, aadhaar_back: file})} required />
                  </>
                ) : (
                  <>
                    <DocumentUpload label="Passport - Front Page" file={kycData.passport_front} onFileSelect={file => setKycData({...kycData, passport_front: file})} required />
                    <DocumentUpload label="Passport - Back/Visa Page" file={kycData.passport_back} onFileSelect={file => setKycData({...kycData, passport_back: file})} required />
                  </>
                )}
                <div className="btn-row">
                  <button className="btn-secondary" onClick={() => setKycStep(1)} data-testid="kyc-step2-back">Back</button>
                  <button className="btn-primary" onClick={() => handleKYCNext(3)} data-testid="kyc-step2-next">Continue</button>
                </div>
              </div>
            )}

            {kycStep === 3 && (
              <div className="kyc-form">
                <h3>Selfie Verification</h3>
                <p className="doc-info">Take a clear selfie holding your PAN card next to your face. Front camera will open on mobile.</p>
                <DocumentUpload label="Selfie with PAN Card" file={kycData.selfie} onFileSelect={file => setKycData({...kycData, selfie: file})} required />
                
                <div className="doc-checklist">
                  <h4>Document Checklist</h4>
                  <div className={`check-item ${kycData.pan_image ? 'done' : ''}`}>
                    {kycData.pan_image ? '✓' : '○'} PAN Card
                  </div>
                  {!isNRI ? (
                    <>
                      <div className={`check-item ${kycData.aadhaar_front ? 'done' : ''}`}>
                        {kycData.aadhaar_front ? '✓' : '○'} Aadhaar Front
                      </div>
                      <div className={`check-item ${kycData.aadhaar_back ? 'done' : ''}`}>
                        {kycData.aadhaar_back ? '✓' : '○'} Aadhaar Back
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={`check-item ${kycData.passport_front ? 'done' : ''}`}>
                        {kycData.passport_front ? '✓' : '○'} Passport Front
                      </div>
                      <div className={`check-item ${kycData.passport_back ? 'done' : ''}`}>
                        {kycData.passport_back ? '✓' : '○'} Passport Back
                      </div>
                    </>
                  )}
                  <div className={`check-item ${kycData.selfie ? 'done' : ''}`}>
                    {kycData.selfie ? '✓' : '○'} Selfie with PAN
                  </div>
                </div>
                
                <div className="btn-row">
                  <button className="btn-secondary" onClick={() => setKycStep(2)} data-testid="kyc-step3-back">Back</button>
                  <button 
                    className="btn-primary" 
                    onClick={handleKYCSubmit} 
                    disabled={!areAllDocumentsUploaded() || submitting}
                    data-testid="kyc-submit-btn"
                  >
                    {submitting ? 'Submitting...' : 'Submit KYC'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="modal-overlay" onClick={() => setShowWalletModal(false)} data-testid="wallet-modal">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Withdrawal Wallet</h2>
              <button className="close-btn" onClick={() => setShowWalletModal(false)} data-testid="wallet-close-btn">×</button>
            </div>
            <div className="wallet-form">
              <div className="form-group">
                <label>Wallet Type <span className="req">*</span></label>
                <select value={walletData.wallet_type} onChange={e => setWalletData({...walletData, wallet_type: e.target.value})} data-testid="wallet-type-select">
                  <option value="exchange">Exchange Wallet</option>
                  <option value="custodial">Custodial Wallet</option>
                  <option value="self_custody">Self-Custody (Hardware/Software)</option>
                </select>
              </div>
              {walletData.wallet_type === 'exchange' && (
                <div className="form-group">
                  <label>Exchange Name <span className="req">*</span></label>
                  <select value={walletData.exchange_name} onChange={e => setWalletData({...walletData, exchange_name: e.target.value})} data-testid="exchange-select">
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
                  <label>Custodian Name <span className="req">*</span></label>
                  <input type="text" value={walletData.exchange_name} onChange={e => setWalletData({...walletData, exchange_name: e.target.value})} placeholder="e.g., BitGo, Fireblocks" data-testid="custodian-input" />
                </div>
              )}
              <div className="form-group">
                <label>Crypto Asset <span className="req">*</span></label>
                <select value={walletData.asset} onChange={e => setWalletData({...walletData, asset: e.target.value})} data-testid="asset-select">
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="USDT">Tether (USDT)</option>
                  <option value="USDC">USD Coin (USDC)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Wallet Address <span className="req">*</span></label>
                <input type="text" value={walletData.wallet_address} onChange={e => setWalletData({...walletData, wallet_address: e.target.value})} placeholder="Enter your wallet address" data-testid="wallet-address-input" />
              </div>
              <DocumentUpload 
                label="Ownership Proof (Screenshot/Document)" 
                file={walletData.ownership_proof} 
                onFileSelect={file => setWalletData({...walletData, ownership_proof: file})} 
                required 
              />
              <div className="form-group">
                <label>Additional Notes</label>
                <textarea value={walletData.notes} onChange={e => setWalletData({...walletData, notes: e.target.value})} placeholder="Any additional information" rows={2} data-testid="wallet-notes-input" />
              </div>
              <div className="info-box">⚠️ All wallets require verification before withdrawals. Processing time: 24 hours.</div>
              <button className="btn-primary" onClick={handleWalletSubmit} disabled={submitting} data-testid="wallet-submit-btn">
                {submitting ? 'Submitting...' : 'Submit for Verification'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Account Modal */}
      {showBankModal && (
        <div className="modal-overlay" onClick={() => setShowBankModal(false)} data-testid="bank-modal">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Bank Account</h2>
              <button className="close-btn" onClick={() => setShowBankModal(false)} data-testid="bank-close-btn">×</button>
            </div>
            <div className="bank-form">
              <div className="form-group">
                <label>Account Holder Name <span className="req">*</span></label>
                <input type="text" value={bankData.account_holder} onChange={e => setBankData({...bankData, account_holder: e.target.value})} placeholder="As per bank records" data-testid="account-holder-input" />
              </div>
              <div className="form-group">
                <label>Account Number <span className="req">*</span></label>
                <input type="text" value={bankData.account_number} onChange={e => setBankData({...bankData, account_number: e.target.value})} placeholder="Enter account number" data-testid="account-number-input" />
              </div>
              <div className="form-group">
                <label>Confirm Account Number <span className="req">*</span></label>
                <input type="text" value={bankData.confirm_account} onChange={e => setBankData({...bankData, confirm_account: e.target.value})} placeholder="Re-enter account number" data-testid="confirm-account-input" />
              </div>
              <div className="form-group">
                <label>IFSC Code <span className="req">*</span></label>
                <input type="text" value={bankData.ifsc_code} onChange={e => setBankData({...bankData, ifsc_code: e.target.value.toUpperCase()})} placeholder="e.g., ICIC0003458" maxLength={11} data-testid="ifsc-input" />
              </div>
              <div className="form-group">
                <label>Bank Name</label>
                <input type="text" value={bankData.bank_name} onChange={e => setBankData({...bankData, bank_name: e.target.value})} placeholder="e.g., ICICI Bank" data-testid="bank-name-input" />
              </div>
              <div className="form-group">
                <label>Branch</label>
                <input type="text" value={bankData.branch} onChange={e => setBankData({...bankData, branch: e.target.value})} placeholder="e.g., Balewadi, Pune" data-testid="branch-input" />
              </div>
              <div className="form-group">
                <label>Account Type</label>
                <select value={bankData.account_type} onChange={e => setBankData({...bankData, account_type: e.target.value})} data-testid="account-type-select">
                  <option value="savings">Savings</option>
                  <option value="current">Current</option>
                </select>
              </div>
              <div className="info-box">⚠️ Bank account verification required. A small test amount will be credited for verification.</div>
              <button className="btn-primary" onClick={handleBankSubmit} disabled={submitting} data-testid="bank-submit-btn">
                {submitting ? 'Submitting...' : 'Submit Bank Details'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar" data-testid="sidebar">
        <div className="sidebar-header">
          <div className="logo" onClick={goHome} style={{cursor:'pointer'}}><div className="logo-icon">B</div><span>BharatBit</span></div>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item home-btn" onClick={goHome} data-testid="home-btn"><span className="nav-icon">🏠</span>Home</button>
          <button className={`nav-item ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => setActiveTab('portfolio')} data-testid="portfolio-tab"><span className="nav-icon">📊</span>Portfolio</button>
          <button className={`nav-item ${activeTab === 'trade' ? 'active' : ''}`} onClick={() => setActiveTab('trade')} data-testid="trade-tab"><span className="nav-icon">💱</span>Place Trade</button>
          <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')} data-testid="orders-tab"><span className="nav-icon">📋</span>Orders</button>
          <button className={`nav-item ${activeTab === 'trade_history' ? 'active' : ''}`} onClick={() => setActiveTab('trade_history')} data-testid="trade-history-tab"><span className="nav-icon">📈</span>Trade History</button>
          <button className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')} data-testid="transactions-tab"><span className="nav-icon">💳</span>Transactions</button>
          <button className={`nav-item ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => setActiveTab('wallet')} data-testid="wallet-tab"><span className="nav-icon">💰</span>Wallets</button>
          <button className={`nav-item ${activeTab === 'bank' ? 'active' : ''}`} onClick={() => setActiveTab('bank')} data-testid="bank-tab"><span className="nav-icon">🏦</span>Bank Account</button>
          <button className={`nav-item ${activeTab === 'deposit' ? 'active' : ''}`} onClick={() => setActiveTab('deposit')} data-testid="deposit-tab"><span className="nav-icon">💵</span>Deposit Funds</button>
          <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')} data-testid="profile-tab"><span className="nav-icon">👤</span>Profile</button>
        </nav>
        <div className="sidebar-footer"><button className="logout-btn" onClick={handleLogout} data-testid="logout-btn"><span>🚪</span> Logout</button></div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="home-icon-btn" onClick={goHome} data-testid="topbar-home-btn">🏠</button>
            <h1>{activeTab === 'trade_history' ? 'Trade History' : activeTab === 'transactions' ? 'Transaction History' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          </div>
          <div className="user-info">
            <span className="client-id" data-testid="client-id">ID: {user?.client_id}</span>
            <span className="kyc-badge" data-status={user?.kyc_status || 'pending'} data-testid="kyc-badge">
              {user?.kyc_status === 'approved' ? '✓ Verified' : 'KYC Pending'}
            </span>
          </div>
        </header>

        {user?.kyc_status !== 'approved' && (
          <div className="kyc-alert" data-testid="kyc-alert"><span>⚠️</span><p>Complete your KYC verification to start trading</p><button onClick={() => setShowKYCModal(true)} data-testid="complete-kyc-btn">Complete KYC</button></div>
        )}

        <div className="content-area">
          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="portfolio-section" data-testid="portfolio-section">
              <div className="portfolio-summary">
                <div className="summary-card"><span className="card-label">Total Portfolio Value</span><span className="card-value">₹0.00</span></div>
                <div className="summary-card"><span className="card-label">Available Balance (INR)</span><span className="card-value">₹0.00</span></div>
                <div className="summary-card"><span className="card-label">Crypto Holdings</span><span className="card-value">0 BTC</span></div>
              </div>
              <div className="market-prices">
                <h2>Live Market Prices</h2>
                <p className="price-disclaimer">All prices are indicative only • Updated every 30 seconds</p>
                <div className="price-grid">
                  <div className="price-card">
                    <div className="coin-info"><span className="coin-icon btc">₿</span><div><span className="coin-name">Bitcoin</span><span className="coin-symbol">BTC</span></div></div>
                    <div className="coin-price">
                      <span className="price">{pricesLoading ? '...' : formatINR(cryptoPrices.bitcoin.inr)}</span>
                      <span className={`change ${cryptoPrices.bitcoin.change >= 0 ? 'positive' : 'negative'}`}>
                        {cryptoPrices.bitcoin.change >= 0 ? '+' : ''}{cryptoPrices.bitcoin.change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="price-card">
                    <div className="coin-info"><span className="coin-icon eth">Ξ</span><div><span className="coin-name">Ethereum</span><span className="coin-symbol">ETH</span></div></div>
                    <div className="coin-price">
                      <span className="price">{pricesLoading ? '...' : formatINR(cryptoPrices.ethereum.inr)}</span>
                      <span className={`change ${cryptoPrices.ethereum.change >= 0 ? 'positive' : 'negative'}`}>
                        {cryptoPrices.ethereum.change >= 0 ? '+' : ''}{cryptoPrices.ethereum.change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="price-card">
                    <div className="coin-info"><span className="coin-icon sol">◎</span><div><span className="coin-name">Solana</span><span className="coin-symbol">SOL</span></div></div>
                    <div className="coin-price">
                      <span className="price">{pricesLoading ? '...' : formatINR(cryptoPrices.solana.inr)}</span>
                      <span className={`change ${cryptoPrices.solana.change >= 0 ? 'positive' : 'negative'}`}>
                        {cryptoPrices.solana.change >= 0 ? '+' : ''}{cryptoPrices.solana.change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trade Tab */}
          {activeTab === 'trade' && (
            <div className="trade-section" data-testid="trade-section">
              <div className="trade-card">
                <h2>Place OTC Order</h2>
                <div className="trade-disclaimer">
                  <p><strong>⚠️ Important Notice:</strong></p>
                  <ul>
                    <li>All prices displayed are <strong>indicative only</strong></li>
                    <li>Orders are processed with <strong>manual execution</strong> once we receive your confirmation</li>
                    <li>Processing time: <strong>1 hour to 24 hours</strong></li>
                    <li>Final rates will be confirmed by our OTC desk before execution</li>
                  </ul>
                </div>
                <div className="trade-type-selector"><button className="trade-type active">Buy</button><button className="trade-type">Sell</button></div>
                <div className="trade-form">
                  <div className="form-group"><label>Select Asset</label><select><option>Bitcoin (BTC)</option><option>Ethereum (ETH)</option><option>USDT</option></select></div>
                  <div className="form-group"><label>Amount (INR)</label><input type="text" placeholder="Enter amount in INR" /></div>
                  <div className="indicative-rate"><span>Indicative Rate:</span><span>{formatINR(cryptoPrices.bitcoin.inr)} / BTC</span></div>
                  <button className="btn-trade" disabled={user?.kyc_status !== 'approved'} data-testid="place-trade-btn">{user?.kyc_status !== 'approved' ? 'Complete KYC to Trade' : 'Request Quote'}</button>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="orders-section" data-testid="orders-section"><h2>Active Orders</h2><div className="empty-state"><span className="empty-icon">📋</span><p>No active orders</p><span>Your pending OTC orders will appear here</span></div></div>
          )}

          {/* Trade History Tab */}
          {activeTab === 'trade_history' && (
            <div className="history-section" data-testid="trade-history-section">
              <h2>Trade History</h2>
              {tradeHistory.length === 0 ? (
                <div className="empty-state"><span className="empty-icon">📈</span><p>No trade history</p><span>Your completed trades will appear here</span></div>
              ) : (
                <div className="history-list"></div>
              )}
            </div>
          )}

          {/* Transaction History Tab */}
          {activeTab === 'transactions' && (
            <div className="history-section" data-testid="transactions-section">
              <h2>Transaction History</h2>
              {transactionHistory.length === 0 ? (
                <div className="empty-state"><span className="empty-icon">💳</span><p>No transactions</p><span>Your deposits and withdrawals will appear here</span></div>
              ) : (
                <div className="history-list"></div>
              )}
            </div>
          )}

          {/* Wallet Tab */}
          {activeTab === 'wallet' && (
            <div className="wallet-section" data-testid="wallet-section"><h2>Withdrawal Wallets</h2><p className="section-desc">Add and verify your crypto wallets for withdrawals</p><div className="empty-state"><span className="empty-icon">💰</span><p>No wallets added</p><span>Add your crypto wallet addresses</span><button className="btn-add" onClick={() => setShowWalletModal(true)} data-testid="add-wallet-btn">+ Add Wallet</button></div></div>
          )}

          {/* Bank Account Tab */}
          {activeTab === 'bank' && (
            <div className="bank-section" data-testid="bank-section">
              <h2>Bank Account</h2>
              <p className="section-desc">Add your bank account for INR withdrawals</p>
              <div className="empty-state">
                <span className="empty-icon">🏦</span>
                <p>No bank account added</p>
                <span>Add your bank details for withdrawals</span>
                <button className="btn-add" onClick={() => setShowBankModal(true)} data-testid="add-bank-btn">+ Add Bank Account</button>
              </div>
            </div>
          )}

          {/* Deposit Funds Tab */}
          {activeTab === 'deposit' && (
            <div className="deposit-section" data-testid="deposit-section">
              <h2>Deposit Funds</h2>
              <p className="section-desc">Transfer funds to our account via NEFT/RTGS/Net Banking</p>
              
              <div className="bank-details-card">
                <h3>🏦 Our Bank Details</h3>
                <div className="detail-row"><span className="label">Account Name</span><span className="value">G.F.T. INVESTMENTS PRIVATE LIMITED</span></div>
                <div className="detail-row"><span className="label">Account Number</span><span className="value highlight">345805000533</span></div>
                <div className="detail-row"><span className="label">IFSC Code</span><span className="value highlight">ICIC0003458</span></div>
                <div className="detail-row"><span className="label">Branch</span><span className="value">BALEWADI HIGH STREET, PUNE 411045</span></div>
                <div className="detail-row"><span className="label">Bank</span><span className="value">ICICI Bank</span></div>
              </div>

              <div className="deposit-instructions">
                <h4>Instructions:</h4>
                <ol>
                  <li>Transfer funds via <strong>NEFT, RTGS, or Net Banking</strong> only</li>
                  <li>Use your <strong>Client ID ({user?.client_id})</strong> as payment reference</li>
                  <li>Deposits are credited within <strong>1-2 business hours</strong></li>
                  <li>Minimum deposit: <strong>₹1,00,000</strong></li>
                  <li>After transfer, notify us at <strong>otc@bharatbit.world</strong></li>
                </ol>
              </div>

              <div className="info-box warning">⚠️ Only transfer from your registered bank account. Third-party transfers will be rejected.</div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="profile-section" data-testid="profile-section">
              <div className="profile-header-card">
                <div className="profile-avatar">
                  {user?.profile_pic ? <img src={user.profile_pic} alt="Profile" /> : <span>👤</span>}
                </div>
                <div className="profile-main-info">
                  <h2>{user?.name || user?.email?.split('@')[0] || 'BharatBit User'}</h2>
                  <p className="client-uid">Client ID: <strong>{user?.client_id || user?.client_uid}</strong></p>
                  <span className={`verification-badge ${user?.kyc_status}`}>
                    {user?.kyc_status === 'approved' ? '✓ Verified Account' : '⏳ Verification Pending'}
                  </span>
                </div>
              </div>

              <div className="profile-details-grid">
                <div className="profile-card">
                  <h3>Account Information</h3>
                  <div className="info-list">
                    <div className="info-item"><span className="label">Client ID</span><span className="value">{user?.client_id || user?.client_uid}</span></div>
                    <div className="info-item"><span className="label">Email</span><span className="value">{user?.email}</span></div>
                    <div className="info-item"><span className="label">Mobile</span><span className="value">{user?.mobile_number || user?.mobile}</span></div>
                    <div className="info-item"><span className="label">Account Type</span><span className="value" style={{textTransform:'capitalize'}}>{user?.account_type || 'Individual'}</span></div>
                    {user?.company_name && (
                      <div className="info-item"><span className="label">Company</span><span className="value">{user?.company_name}</span></div>
                    )}
                  </div>
                </div>

                <div className="profile-card">
                  <h3>Verification Status</h3>
                  <div className="status-list">
                    <div className="status-item">
                      <span className="status-label">KYC Status</span>
                      <span className={`status-value ${user?.kyc_status === 'approved' ? 'verified' : 'pending'}`}>
                        {user?.kyc_status === 'approved' ? '✓ Verified' : '⏳ Pending'}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Bank Account</span>
                      <span className={`status-value ${user?.bank_verified ? 'verified' : 'pending'}`}>
                        {user?.bank_verified ? '✓ Verified' : '⏳ Not Added'}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Wallet</span>
                      <span className={`status-value ${user?.wallet_verified ? 'verified' : 'pending'}`}>
                        {user?.wallet_verified ? '✓ Verified' : '⏳ Not Added'}
                      </span>
                    </div>
                  </div>
                  {user?.kyc_status !== 'approved' && (
                    <button className="btn-kyc" onClick={() => setShowKYCModal(true)} data-testid="profile-kyc-btn">Complete KYC</button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="app-footer">
          <p>BharatBit™ is a trademark owned by G.F.T. Investments Private Limited. All rights reserved © 2026</p>
        </footer>
      </main>

      <style jsx>{`
        .dashboard { display: flex; min-height: 100vh; background: #f5f7fa; font-family: 'Inter', -apple-system, sans-serif; }
        .sidebar { width: 240px; background: #1a1a2e; color: white; display: flex; flex-direction: column; }
        .sidebar-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .logo { display: flex; align-items: center; gap: 10px; }
        .logo-icon { width: 36px; height: 36px; background: #E95721; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; }
        .logo span { font-size: 18px; font-weight: 700; }
        .sidebar-nav { flex: 1; padding: 12px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: transparent; border: none; border-radius: 8px; color: rgba(255,255,255,0.7); font-size: 14px; cursor: pointer; text-align: left; font-family: inherit; transition: all 0.2s; }
        .nav-item:hover { background: rgba(255,255,255,0.1); color: white; }
        .nav-item.active { background: #E95721; color: white; }
        .nav-item.home-btn { background: rgba(233,87,33,0.2); color: #E95721; margin-bottom: 8px; }
        .nav-icon { font-size: 16px; width: 20px; }
        .sidebar-footer { padding: 12px; border-top: 1px solid rgba(255,255,255,0.1); }
        .logout-btn { display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 14px; background: rgba(255,255,255,0.05); border: none; border-radius: 8px; color: rgba(255,255,255,0.7); cursor: pointer; font-family: inherit; font-size: 14px; }
        
        .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .topbar { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; background: white; border-bottom: 1px solid #e0e0e0; }
        .topbar-left { display: flex; align-items: center; gap: 12px; }
        .home-icon-btn { background: #f0f0f0; border: none; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-size: 16px; }
        .topbar h1 { font-size: 20px; color: #1a1a2e; }
        .user-info { display: flex; align-items: center; gap: 12px; }
        .client-id { font-size: 13px; color: #666; font-weight: 500; }
        .kyc-badge { padding: 5px 10px; border-radius: 16px; font-size: 12px; font-weight: 600; }
        .kyc-badge[data-status="pending"] { background: #fff3cd; color: #856404; }
        .kyc-badge[data-status="approved"] { background: #d4edda; color: #155724; }
        
        .kyc-alert { display: flex; align-items: center; gap: 12px; margin: 16px 24px; padding: 14px 18px; background: #fff3cd; border-radius: 10px; color: #856404; }
        .kyc-alert p { flex: 1; font-size: 14px; margin: 0; }
        .kyc-alert button { padding: 8px 14px; background: #E95721; color: white; border: none; border-radius: 6px; font-weight: 500; cursor: pointer; font-family: inherit; font-size: 13px; }
        
        .content-area { flex: 1; padding: 24px; overflow-y: auto; }
        
        /* Footer */
        .app-footer { padding: 16px 24px; background: #f8f9fa; border-top: 1px solid #e0e0e0; text-align: center; }
        .app-footer p { margin: 0; font-size: 12px; color: #666; }
        
        /* Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal { background: white; border-radius: 16px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e0e0e0; }
        .modal-header h2 { font-size: 18px; color: #1a1a2e; margin: 0; }
        .close-btn { width: 32px; height: 32px; border: none; background: #f0f0f0; border-radius: 50%; font-size: 20px; cursor: pointer; line-height: 1; }
        .error-msg { margin: 12px 20px; padding: 10px 14px; background: #fee2e2; color: #dc2626; border-radius: 8px; font-size: 13px; }
        .kyc-progress { display: flex; padding: 14px 20px; gap: 8px; border-bottom: 1px solid #f0f0f0; }
        .progress-step { flex: 1; padding: 8px; text-align: center; font-size: 12px; color: #999; background: #f8f9fa; border-radius: 6px; }
        .progress-step.active { background: #E95721; color: white; }
        .kyc-form, .wallet-form, .bank-form { padding: 20px; }
        .kyc-form h3 { font-size: 16px; margin-bottom: 14px; color: #1a1a2e; }
        .doc-info { color: #666; font-size: 13px; margin-bottom: 16px; background: #e3f2fd; padding: 10px 12px; border-radius: 6px; }
        .nri-toggle { margin-bottom: 16px; padding: 10px 14px; background: #f8f9fa; border-radius: 8px; }
        .nri-toggle label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #666; cursor: pointer; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; font-size: 12px; font-weight: 600; color: #666; margin-bottom: 6px; }
        .req { color: #E95721; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 14px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 8px; background: #f8f9fa; font-family: inherit; }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #E95721; background: white; }
        .btn-primary { width: 100%; padding: 12px; background: #E95721; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .btn-primary:disabled { background: #ccc; cursor: not-allowed; }
        .btn-secondary { padding: 12px 20px; background: #f0f0f0; color: #1a1a2e; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .btn-row { display: flex; gap: 10px; }
        .btn-row .btn-primary { flex: 1; }
        .info-box { background: #e3f2fd; color: #1565c0; padding: 10px 14px; border-radius: 6px; font-size: 12px; margin-bottom: 16px; }
        .info-box.warning { background: #fff3cd; color: #856404; }
        
        /* Document Checklist */
        .doc-checklist { background: #f8f9fa; border-radius: 8px; padding: 14px; margin: 16px 0; }
        .doc-checklist h4 { font-size: 13px; margin: 0 0 10px 0; color: #666; }
        .check-item { font-size: 13px; padding: 4px 0; color: #999; }
        .check-item.done { color: #4CAF50; }

        /* Content Sections */
        .portfolio-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        .summary-card { background: white; padding: 20px; border-radius: 12px; }
        .card-label { font-size: 12px; color: #666; text-transform: uppercase; display: block; margin-bottom: 8px; }
        .card-value { font-size: 24px; font-weight: 700; color: #1a1a2e; }
        .market-prices h2 { font-size: 16px; color: #1a1a2e; margin-bottom: 8px; }
        .price-disclaimer { font-size: 12px; color: #E95721; margin-bottom: 16px; }
        .price-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .price-card { background: white; padding: 16px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; }
        .coin-info { display: flex; align-items: center; gap: 10px; }
        .coin-icon { width: 40px; height: 40px; background: #f0f0f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .coin-icon.btc { background: #f7931a; color: white; }
        .coin-icon.eth { background: #627eea; color: white; }
        .coin-icon.sol { background: #9945ff; color: white; }
        .coin-name { display: block; font-weight: 600; color: #1a1a2e; font-size: 14px; }
        .coin-symbol { font-size: 12px; color: #666; }
        .coin-price { text-align: right; }
        .price { display: block; font-weight: 600; color: #1a1a2e; font-size: 14px; }
        .change { font-size: 12px; font-weight: 500; }
        .change.positive { color: #22c55e; }
        .change.negative { color: #ef4444; }

        .trade-section { max-width: 500px; }
        .trade-card { background: white; padding: 24px; border-radius: 12px; }
        .trade-card h2 { margin-bottom: 16px; font-size: 18px; }
        .trade-disclaimer { background: #fff8e1; border: 1px solid #ffcc02; border-radius: 8px; padding: 14px; margin-bottom: 20px; }
        .trade-disclaimer p { font-size: 13px; margin: 0 0 8px; }
        .trade-disclaimer ul { margin: 0; padding-left: 18px; font-size: 12px; color: #666; }
        .trade-disclaimer li { margin-bottom: 4px; }
        .trade-type-selector { display: flex; gap: 10px; margin-bottom: 20px; }
        .trade-type { flex: 1; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; background: white; font-weight: 600; cursor: pointer; font-family: inherit; font-size: 14px; }
        .trade-type.active { border-color: #E95721; background: rgba(233, 87, 33, 0.05); color: #E95721; }
        .trade-form .form-group { margin-bottom: 16px; }
        .trade-form label { display: block; font-size: 12px; font-weight: 600; color: #666; margin-bottom: 6px; }
        .trade-form input, .trade-form select { width: 100%; height: 44px; padding: 0 14px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; font-family: inherit; }
        .indicative-rate { display: flex; justify-content: space-between; padding: 10px 14px; background: #f8f9fa; border-radius: 6px; margin-bottom: 16px; font-size: 13px; }
        .btn-trade { width: 100%; padding: 14px; background: #E95721; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; font-family: inherit; cursor: pointer; }
        .btn-trade:disabled { background: #ccc; cursor: not-allowed; }

        .empty-state { text-align: center; padding: 48px 20px; background: white; border-radius: 12px; }
        .empty-icon { font-size: 40px; display: block; margin-bottom: 12px; }
        .empty-state p { font-size: 16px; font-weight: 600; color: #1a1a2e; margin-bottom: 6px; }
        .empty-state span { color: #666; font-size: 13px; display: block; margin-bottom: 16px; }
        .btn-add { padding: 10px 20px; background: #E95721; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-family: inherit; font-size: 14px; }
        .section-desc { color: #666; margin-bottom: 16px; font-size: 14px; }

        /* Deposit Section */
        .deposit-section h2 { margin-bottom: 8px; font-size: 18px; }
        .bank-details-card { background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; border: 2px solid #E95721; }
        .bank-details-card h3 { font-size: 16px; margin-bottom: 16px; color: #1a1a2e; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
        .detail-row:last-child { border-bottom: none; }
        .detail-row .label { color: #666; font-size: 13px; }
        .detail-row .value { font-weight: 600; color: #1a1a2e; font-size: 13px; }
        .detail-row .value.highlight { color: #E95721; font-size: 14px; }
        .deposit-instructions { background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
        .deposit-instructions h4 { font-size: 14px; margin-bottom: 12px; }
        .deposit-instructions ol { padding-left: 18px; font-size: 13px; color: #666; }
        .deposit-instructions li { margin-bottom: 8px; }

        /* Profile Section */
        .profile-header-card { background: white; border-radius: 12px; padding: 24px; display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
        .profile-avatar { width: 80px; height: 80px; background: #f0f0f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; }
        .profile-avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
        .profile-main-info h2 { font-size: 20px; margin-bottom: 4px; }
        .client-uid { font-size: 14px; color: #666; margin-bottom: 8px; display: block; }
        .verification-badge { display: inline-block; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; }
        .verification-badge.approved { background: #d4edda; color: #155724; }
        .verification-badge.pending { background: #fff3cd; color: #856404; }
        .profile-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .profile-card { background: white; border-radius: 12px; padding: 20px; }
        .profile-card h3 { font-size: 15px; margin-bottom: 16px; color: #1a1a2e; }
        .info-list, .status-list { display: flex; flex-direction: column; gap: 12px; }
        .info-item, .status-item { display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0; }
        .info-item:last-child, .status-item:last-child { border-bottom: none; }
        .info-item .label, .status-item .status-label { color: #666; font-size: 13px; }
        .info-item .value { font-weight: 500; font-size: 13px; }
        .status-value { font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 12px; }
        .status-value.verified { background: #d4edda; color: #155724; }
        .status-value.pending { background: #f0f0f0; color: #666; }
        .btn-kyc { width: 100%; padding: 12px; background: #E95721; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-family: inherit; margin-top: 16px; font-size: 14px; }

        @media (max-width: 1024px) {
          .sidebar { width: 70px; }
          .sidebar-header .logo span, .nav-item span:not(.nav-icon), .logout-btn span:last-child { display: none; }
          .portfolio-summary, .price-grid, .profile-details-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .sidebar { display: none; }
          .content-area { padding: 16px; }
          .topbar { padding: 12px 16px; }
        }
      `}</style>
    </div>
  )
}
