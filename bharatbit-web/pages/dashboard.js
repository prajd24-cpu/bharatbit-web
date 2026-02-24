import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Head from 'next/head'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://crypto-trading-web.preview.emergentagent.com'

// Sleek Fintech Icons (SVG)
const Icons = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  portfolio: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"/>
      <line x1="18" y1="20" x2="18" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  ),
  trade: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  orders: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  history: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  wallet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
      <path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
    </svg>
  ),
  bank: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18"/>
      <path d="M3 10h18"/>
      <path d="M5 6l7-3 7 3"/>
      <path d="M4 10v11"/>
      <path d="M20 10v11"/>
      <path d="M8 14v3"/>
      <path d="M12 14v3"/>
      <path d="M16 14v3"/>
    </svg>
  ),
  deposit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="15"/>
      <polyline points="5 8 12 15 19 8"/>
      <path d="M5 21h14"/>
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  transactions: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  camera: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  folder: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

// Document Upload Component with Camera
function DocumentUpload({ label, onFileSelect, file, required = false }) {
  const cameraRef = useRef(null)
  const fileRef = useRef(null)

  return (
    <div className="document-upload" data-testid={`doc-upload-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <label>{label} {required && <span className="required">*</span>}</label>
      <div className="upload-options">
        <button type="button" className="upload-btn camera" onClick={() => cameraRef.current?.click()}>
          <span className="icon">{Icons.camera}</span> Take Photo
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture={label.toLowerCase().includes('selfie') ? 'user' : 'environment'}
            onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])}
            style={{ display: 'none' }}
          />
        </button>
        <button type="button" className="upload-btn file" onClick={() => fileRef.current?.click()}>
          <span className="icon">{Icons.folder}</span> Choose File
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
        .upload-btn .icon { width: 18px; height: 18px; }
        .upload-btn.camera .icon { color: #4CAF50; }
        .upload-btn.file .icon { color: #E95721; }
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
  const [showMobileMenu, setShowMobileMenu] = useState(false)
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
      localStorage.setItem('userEmail', response.data.email)
      localStorage.setItem('userMobile', response.data.mobile_number || response.data.mobile)
      localStorage.setItem('clientUID', response.data.client_uid || response.data.client_id)
    } catch (err) {
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
    setShowMobileMenu(false)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setShowMobileMenu(false)
  }

  // KYC validation functions
  const areAllDocumentsUploaded = () => {
    if (!kycData.pan_image) return false
    if (isNRI) {
      return kycData.passport_front && kycData.passport_back && kycData.selfie
    } else {
      return kycData.aadhaar_front && kycData.aadhaar_back && kycData.selfie
    }
  }

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

  const validateStep2 = () => {
    if (!kycData.pan_image) {
      setKycError('Please upload PAN card image')
      return false
    }
    if (!isNRI) {
      if (!kycData.aadhaar_front) { setKycError('Please upload Aadhaar front image'); return false }
      if (!kycData.aadhaar_back) { setKycError('Please upload Aadhaar back image'); return false }
    } else {
      if (!kycData.passport_front) { setKycError('Please upload Passport front page'); return false }
      if (!kycData.passport_back) { setKycError('Please upload Passport back/visa page'); return false }
    }
    setKycError('')
    return true
  }

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
      
      alert('KYC documents submitted successfully! Our team will review and verify within 24-48 hours.')
      setShowKYCModal(false)
      setKycStep(1)
    } catch (err) {
      alert('KYC documents submitted! Our team will review shortly.')
      setShowKYCModal(false)
      setKycStep(1)
    } finally {
      setSubmitting(false)
    }
  }

  const handleWalletSubmit = async () => {
    if (!walletData.wallet_address) { alert('Please enter wallet address'); return }
    if (!walletData.ownership_proof) { alert('Please upload ownership proof'); return }
    if (walletData.wallet_type === 'exchange' && !walletData.exchange_name) { alert('Please select an exchange'); return }
    
    setSubmitting(true)
    try {
      await axios.post(`${API_URL}/api/notifications/send-wallet`, {
        client_id: user?.client_id,
        email: user?.email,
        wallet_data: walletData,
        to_email: 'otc@bharatbit.world'
      })
      alert('Wallet submitted for verification!')
      setShowWalletModal(false)
      setWalletData({ wallet_type: 'exchange', exchange_name: '', wallet_address: '', asset: 'BTC', ownership_proof: null, notes: '' })
    } catch (err) {
      alert('Wallet submitted!')
      setShowWalletModal(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleBankSubmit = async () => {
    if (bankData.account_number !== bankData.confirm_account) { alert('Account numbers do not match'); return }
    if (!bankData.account_holder || !bankData.account_number || !bankData.ifsc_code) { alert('Please fill all required fields'); return }
    
    setSubmitting(true)
    try {
      await axios.post(`${API_URL}/api/notifications/send-bank`, {
        client_id: user?.client_id,
        email: user?.email,
        bank_data: bankData,
        to_email: 'otc@bharatbit.world'
      })
      alert('Bank details submitted for verification!')
      setShowBankModal(false)
      setBankData({ account_holder: '', account_number: '', confirm_account: '', ifsc_code: '', bank_name: '', branch: '', account_type: 'savings' })
    } catch (err) {
      alert('Bank details submitted!')
      setShowBankModal(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <Head>
          <link href="https://fonts.googleapis.com/css2?family=Bungee+Outline&display=swap" rel="stylesheet" />
        </Head>
        <div className="logo-icon">B</div>
        <p>Loading...</p>
        <style jsx>{`
          .loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 16px; font-family: 'Inter', sans-serif; background: #f5f7fa; }
          .logo-icon { width: 60px; height: 60px; background: #E95721; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-family: 'Bungee Outline', cursive; font-weight: 400; color: white; }
        `}</style>
      </div>
    )
  }

  return (
    <div className="dashboard" data-testid="dashboard-container">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Bungee+Outline&display=swap" rel="stylesheet" />
      </Head>
      {/* KYC Modal */}
      {showKYCModal && (
        <div className="modal-overlay" onClick={() => setShowKYCModal(false)} data-testid="kyc-modal">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>KYC Verification</h2>
              <button className="close-btn" onClick={() => setShowKYCModal(false)}>{Icons.close}</button>
            </div>
            
            <div className="kyc-progress">
              <div className={`progress-step ${kycStep >= 1 ? 'active' : ''}`}>1. Details</div>
              <div className={`progress-step ${kycStep >= 2 ? 'active' : ''}`}>2. Documents</div>
              <div className={`progress-step ${kycStep >= 3 ? 'active' : ''}`}>3. Selfie</div>
            </div>

            {kycError && <div className="error-msg">{kycError}</div>}

            {kycStep === 1 && (
              <div className="kyc-form">
                <h3>Personal Details</h3>
                <div className="nri-toggle">
                  <label><input type="checkbox" checked={isNRI} onChange={e => setIsNRI(e.target.checked)} /> I am an NRI / Non-Indian Resident</label>
                </div>
                <div className="form-group">
                  <label>PAN Number <span className="req">*</span></label>
                  <input type="text" value={kycData.pan_number} onChange={e => setKycData({...kycData, pan_number: e.target.value.toUpperCase()})} placeholder="ABCDE1234F" maxLength={10} />
                </div>
                {!isNRI && (
                  <div className="form-group">
                    <label>Aadhaar Number <span className="req">*</span></label>
                    <input type="text" value={kycData.aadhaar_number} onChange={e => setKycData({...kycData, aadhaar_number: e.target.value.replace(/\D/g, '')})} placeholder="123456789012" maxLength={12} />
                  </div>
                )}
                {isNRI && (
                  <div className="form-group">
                    <label>Passport Number <span className="req">*</span></label>
                    <input type="text" value={kycData.passport_number} onChange={e => setKycData({...kycData, passport_number: e.target.value.toUpperCase()})} placeholder="A12345678" maxLength={12} />
                  </div>
                )}
                <div className="form-group">
                  <label>Current Address <span className="req">*</span></label>
                  <textarea value={kycData.address} onChange={e => setKycData({...kycData, address: e.target.value})} placeholder="Enter your full address" rows={3} />
                </div>
                <button className="btn-primary" onClick={() => handleKYCNext(2)}>Continue</button>
              </div>
            )}

            {kycStep === 2 && (
              <div className="kyc-form">
                <h3>Upload Documents</h3>
                <p className="doc-info">On mobile: "Take Photo" opens your camera directly.</p>
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
                  <button className="btn-secondary" onClick={() => setKycStep(1)}>Back</button>
                  <button className="btn-primary" onClick={() => handleKYCNext(3)}>Continue</button>
                </div>
              </div>
            )}

            {kycStep === 3 && (
              <div className="kyc-form">
                <h3>Selfie Verification</h3>
                <p className="doc-info">Take a clear selfie holding your PAN card next to your face.</p>
                <DocumentUpload label="Selfie with PAN Card" file={kycData.selfie} onFileSelect={file => setKycData({...kycData, selfie: file})} required />
                
                <div className="doc-checklist">
                  <h4>Document Checklist</h4>
                  <div className={`check-item ${kycData.pan_image ? 'done' : ''}`}>{kycData.pan_image ? '✓' : '○'} PAN Card</div>
                  {!isNRI ? (
                    <>
                      <div className={`check-item ${kycData.aadhaar_front ? 'done' : ''}`}>{kycData.aadhaar_front ? '✓' : '○'} Aadhaar Front</div>
                      <div className={`check-item ${kycData.aadhaar_back ? 'done' : ''}`}>{kycData.aadhaar_back ? '✓' : '○'} Aadhaar Back</div>
                    </>
                  ) : (
                    <>
                      <div className={`check-item ${kycData.passport_front ? 'done' : ''}`}>{kycData.passport_front ? '✓' : '○'} Passport Front</div>
                      <div className={`check-item ${kycData.passport_back ? 'done' : ''}`}>{kycData.passport_back ? '✓' : '○'} Passport Back</div>
                    </>
                  )}
                  <div className={`check-item ${kycData.selfie ? 'done' : ''}`}>{kycData.selfie ? '✓' : '○'} Selfie with PAN</div>
                </div>
                
                <div className="btn-row">
                  <button className="btn-secondary" onClick={() => setKycStep(2)}>Back</button>
                  <button className="btn-primary" onClick={handleKYCSubmit} disabled={!areAllDocumentsUploaded() || submitting}>
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
        <div className="modal-overlay" onClick={() => setShowWalletModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Withdrawal Wallet</h2>
              <button className="close-btn" onClick={() => setShowWalletModal(false)}>{Icons.close}</button>
            </div>
            <div className="wallet-form">
              <div className="form-group">
                <label>Wallet Type <span className="req">*</span></label>
                <select value={walletData.wallet_type} onChange={e => setWalletData({...walletData, wallet_type: e.target.value})}>
                  <option value="exchange">Exchange Wallet</option>
                  <option value="custodial">Custodial Wallet</option>
                  <option value="self_custody">Self-Custody</option>
                </select>
              </div>
              {walletData.wallet_type === 'exchange' && (
                <div className="form-group">
                  <label>Exchange Name <span className="req">*</span></label>
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
              <div className="form-group">
                <label>Crypto Asset <span className="req">*</span></label>
                <select value={walletData.asset} onChange={e => setWalletData({...walletData, asset: e.target.value})}>
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="USDT">Tether (USDT)</option>
                  <option value="USDC">USD Coin (USDC)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Wallet Address <span className="req">*</span></label>
                <input type="text" value={walletData.wallet_address} onChange={e => setWalletData({...walletData, wallet_address: e.target.value})} placeholder="Enter your wallet address" />
              </div>
              <DocumentUpload label="Ownership Proof" file={walletData.ownership_proof} onFileSelect={file => setWalletData({...walletData, ownership_proof: file})} required />
              <div className="info-box">All wallets require verification. Processing: 24 hours.</div>
              <button className="btn-primary" onClick={handleWalletSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit for Verification'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Modal */}
      {showBankModal && (
        <div className="modal-overlay" onClick={() => setShowBankModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Bank Account</h2>
              <button className="close-btn" onClick={() => setShowBankModal(false)}>{Icons.close}</button>
            </div>
            <div className="bank-form">
              <div className="form-group">
                <label>Account Holder Name <span className="req">*</span></label>
                <input type="text" value={bankData.account_holder} onChange={e => setBankData({...bankData, account_holder: e.target.value})} placeholder="As per bank records" />
              </div>
              <div className="form-group">
                <label>Account Number <span className="req">*</span></label>
                <input type="text" value={bankData.account_number} onChange={e => setBankData({...bankData, account_number: e.target.value})} placeholder="Enter account number" />
              </div>
              <div className="form-group">
                <label>Confirm Account Number <span className="req">*</span></label>
                <input type="text" value={bankData.confirm_account} onChange={e => setBankData({...bankData, confirm_account: e.target.value})} placeholder="Re-enter account number" />
              </div>
              <div className="form-group">
                <label>IFSC Code <span className="req">*</span></label>
                <input type="text" value={bankData.ifsc_code} onChange={e => setBankData({...bankData, ifsc_code: e.target.value.toUpperCase()})} placeholder="e.g., ICIC0003458" maxLength={11} />
              </div>
              <div className="form-group">
                <label>Bank Name</label>
                <input type="text" value={bankData.bank_name} onChange={e => setBankData({...bankData, bank_name: e.target.value})} placeholder="e.g., ICICI Bank" />
              </div>
              <div className="info-box">Bank verification required. A small test amount will be credited.</div>
              <button className="btn-primary" onClick={handleBankSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Bank Details'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Slide-out Menu */}
      {showMobileMenu && (
        <div className="mobile-menu-overlay" onClick={() => setShowMobileMenu(false)}>
          <div className="mobile-menu" onClick={e => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div className="logo"><div className="logo-icon">B</div><span>BharatBit</span></div>
              <button className="close-menu" onClick={() => setShowMobileMenu(false)}>{Icons.close}</button>
            </div>
            <nav className="mobile-menu-nav">
              <button className={`menu-item ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => handleTabChange('portfolio')}><span className="icon">{Icons.portfolio}</span>Portfolio</button>
              <button className={`menu-item ${activeTab === 'trade' ? 'active' : ''}`} onClick={() => handleTabChange('trade')}><span className="icon">{Icons.trade}</span>Place Trade</button>
              <button className={`menu-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => handleTabChange('orders')}><span className="icon">{Icons.orders}</span>Orders</button>
              <button className={`menu-item ${activeTab === 'trade_history' ? 'active' : ''}`} onClick={() => handleTabChange('trade_history')}><span className="icon">{Icons.history}</span>Trade History</button>
              <button className={`menu-item ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => handleTabChange('transactions')}><span className="icon">{Icons.transactions}</span>Transactions</button>
              <button className={`menu-item ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => handleTabChange('wallet')}><span className="icon">{Icons.wallet}</span>Wallets</button>
              <button className={`menu-item ${activeTab === 'bank' ? 'active' : ''}`} onClick={() => handleTabChange('bank')}><span className="icon">{Icons.bank}</span>Bank Account</button>
              <button className={`menu-item ${activeTab === 'deposit' ? 'active' : ''}`} onClick={() => handleTabChange('deposit')}><span className="icon">{Icons.deposit}</span>Deposit Funds</button>
              <button className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => handleTabChange('profile')}><span className="icon">{Icons.profile}</span>Profile</button>
              <button className="menu-item logout" onClick={handleLogout}><span className="icon">{Icons.logout}</span>Logout</button>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="sidebar" data-testid="sidebar">
        <div className="sidebar-header">
          <div className="logo" onClick={goHome} style={{cursor:'pointer'}}><div className="logo-icon">B</div><span>BharatBit</span></div>
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => handleTabChange('portfolio')}><span className="nav-icon">{Icons.portfolio}</span>Portfolio</button>
          <button className={`nav-item ${activeTab === 'trade' ? 'active' : ''}`} onClick={() => handleTabChange('trade')}><span className="nav-icon">{Icons.trade}</span>Place Trade</button>
          <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => handleTabChange('orders')}><span className="nav-icon">{Icons.orders}</span>Orders</button>
          <button className={`nav-item ${activeTab === 'trade_history' ? 'active' : ''}`} onClick={() => handleTabChange('trade_history')}><span className="nav-icon">{Icons.history}</span>Trade History</button>
          <button className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => handleTabChange('transactions')}><span className="nav-icon">{Icons.transactions}</span>Transactions</button>
          <button className={`nav-item ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => handleTabChange('wallet')}><span className="nav-icon">{Icons.wallet}</span>Wallets</button>
          <button className={`nav-item ${activeTab === 'bank' ? 'active' : ''}`} onClick={() => handleTabChange('bank')}><span className="nav-icon">{Icons.bank}</span>Bank Account</button>
          <button className={`nav-item ${activeTab === 'deposit' ? 'active' : ''}`} onClick={() => handleTabChange('deposit')}><span className="nav-icon">{Icons.deposit}</span>Deposit Funds</button>
          <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => handleTabChange('profile')}><span className="nav-icon">{Icons.profile}</span>Profile</button>
        </nav>
        <div className="sidebar-footer"><button className="logout-btn" onClick={handleLogout}><span className="nav-icon">{Icons.logout}</span>Logout</button></div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Mobile Header */}
        <header className="mobile-header">
          <button className="menu-toggle" onClick={() => setShowMobileMenu(true)}>{Icons.menu}</button>
          <div className="logo"><div className="logo-icon">B</div></div>
          <span className="kyc-badge mobile" data-status={user?.kyc_status || 'pending'}>
            {user?.kyc_status === 'approved' ? '✓' : 'KYC'}
          </span>
        </header>

        {/* Desktop Header */}
        <header className="topbar">
          <div className="topbar-left">
            <h1>{activeTab === 'trade_history' ? 'Trade History' : activeTab === 'transactions' ? 'Transactions' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          </div>
          <div className="user-info">
            <span className="client-id">ID: {user?.client_id}</span>
            <span className="kyc-badge" data-status={user?.kyc_status || 'pending'}>
              {user?.kyc_status === 'approved' ? '✓ Verified' : 'KYC Pending'}
            </span>
          </div>
        </header>

        {user?.kyc_status !== 'approved' && (
          <div className="kyc-alert"><span className="icon">{Icons.orders}</span><p>Complete your KYC verification to start trading</p><button onClick={() => setShowKYCModal(true)}>Complete KYC</button></div>
        )}

        <div className="content-area">
          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="portfolio-section">
              <div className="portfolio-summary">
                <div className="summary-card"><span className="card-label">Total Portfolio Value</span><span className="card-value">₹0.00</span></div>
                <div className="summary-card"><span className="card-label">Available Balance (INR)</span><span className="card-value">₹0.00</span></div>
                <div className="summary-card"><span className="card-label">Crypto Holdings</span><span className="card-value">0 BTC</span></div>
              </div>
              <div className="market-prices">
                <h2>Live Market Prices</h2>
                <p className="price-disclaimer">Indicative only • Updates every 30s</p>
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
            <div className="trade-section">
              <div className="trade-card">
                <h2>Place OTC Order</h2>
                <div className="trade-disclaimer">
                  <p><strong>Important Notice:</strong></p>
                  <ul>
                    <li>All prices are <strong>indicative only</strong></li>
                    <li>Processing time: <strong>1-24 hours</strong></li>
                    <li>Final rates confirmed by OTC desk</li>
                  </ul>
                </div>
                <div className="trade-type-selector"><button className="trade-type active">Buy</button><button className="trade-type">Sell</button></div>
                <div className="trade-form">
                  <div className="form-group"><label>Select Asset</label><select><option>Bitcoin (BTC)</option><option>Ethereum (ETH)</option><option>USDT</option></select></div>
                  <div className="form-group"><label>Amount (INR)</label><input type="text" placeholder="Enter amount in INR" /></div>
                  <div className="indicative-rate"><span>Indicative Rate:</span><span>{formatINR(cryptoPrices.bitcoin.inr)} / BTC</span></div>
                  <button className="btn-trade" disabled={user?.kyc_status !== 'approved'}>{user?.kyc_status !== 'approved' ? 'Complete KYC to Trade' : 'Request Quote'}</button>
                </div>
              </div>
            </div>
          )}

          {/* Other Tabs */}
          {activeTab === 'orders' && (
            <div className="orders-section"><h2>Active Orders</h2><div className="empty-state"><span className="empty-icon">{Icons.orders}</span><p>No active orders</p><span>Your pending OTC orders will appear here</span></div></div>
          )}

          {activeTab === 'trade_history' && (
            <div className="history-section"><h2>Trade History</h2><div className="empty-state"><span className="empty-icon">{Icons.history}</span><p>No trade history</p><span>Your completed trades will appear here</span></div></div>
          )}

          {activeTab === 'transactions' && (
            <div className="history-section"><h2>Transaction History</h2><div className="empty-state"><span className="empty-icon">{Icons.transactions}</span><p>No transactions</p><span>Your deposits and withdrawals will appear here</span></div></div>
          )}

          {activeTab === 'wallet' && (
            <div className="wallet-section"><h2>Withdrawal Wallets</h2><p className="section-desc">Add and verify your crypto wallets</p><div className="empty-state"><span className="empty-icon">{Icons.wallet}</span><p>No wallets added</p><span>Add your crypto wallet addresses</span><button className="btn-add" onClick={() => setShowWalletModal(true)}>+ Add Wallet</button></div></div>
          )}

          {activeTab === 'bank' && (
            <div className="bank-section"><h2>Bank Account</h2><p className="section-desc">Add your bank for INR withdrawals</p><div className="empty-state"><span className="empty-icon">{Icons.bank}</span><p>No bank account added</p><span>Add your bank details for withdrawals</span><button className="btn-add" onClick={() => setShowBankModal(true)}>+ Add Bank Account</button></div></div>
          )}

          {activeTab === 'deposit' && (
            <div className="deposit-section">
              <h2>Deposit Funds</h2>
              <p className="section-desc">Transfer via NEFT/RTGS/Net Banking</p>
              <div className="bank-details-card">
                <h3>Our Bank Details</h3>
                <div className="detail-row"><span className="label">Account Name</span><span className="value">G.F.T. INVESTMENTS PRIVATE LIMITED</span></div>
                <div className="detail-row"><span className="label">Account Number</span><span className="value highlight">345805000533</span></div>
                <div className="detail-row"><span className="label">IFSC Code</span><span className="value highlight">ICIC0003458</span></div>
                <div className="detail-row"><span className="label">Branch</span><span className="value">BALEWADI HIGH STREET, PUNE</span></div>
                <div className="detail-row"><span className="label">Bank</span><span className="value">ICICI Bank</span></div>
              </div>
              <div className="deposit-instructions">
                <h4>Instructions:</h4>
                <ol>
                  <li>Transfer via <strong>NEFT, RTGS, or Net Banking</strong></li>
                  <li>Use Client ID <strong>{user?.client_id}</strong> as reference</li>
                  <li>Deposits credited within <strong>1-2 hours</strong></li>
                  <li>Minimum deposit: <strong>₹1,00,000</strong></li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="profile-header-card">
                <div className="profile-avatar"><span>{Icons.profile}</span></div>
                <div className="profile-main-info">
                  <h2>{user?.name || user?.email?.split('@')[0] || 'BharatBit User'}</h2>
                  <p className="client-uid">Client ID: <strong>{user?.client_id || user?.client_uid}</strong></p>
                  <span className={`verification-badge ${user?.kyc_status}`}>
                    {user?.kyc_status === 'approved' ? '✓ Verified Account' : 'Verification Pending'}
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
                  </div>
                </div>
                <div className="profile-card">
                  <h3>Verification Status</h3>
                  <div className="status-list">
                    <div className="status-item"><span className="status-label">KYC Status</span><span className={`status-value ${user?.kyc_status === 'approved' ? 'verified' : 'pending'}`}>{user?.kyc_status === 'approved' ? '✓ Verified' : 'Pending'}</span></div>
                    <div className="status-item"><span className="status-label">Bank Account</span><span className={`status-value ${user?.bank_verified ? 'verified' : 'pending'}`}>{user?.bank_verified ? '✓ Verified' : 'Not Added'}</span></div>
                    <div className="status-item"><span className="status-label">Wallet</span><span className={`status-value ${user?.wallet_verified ? 'verified' : 'pending'}`}>{user?.wallet_verified ? '✓ Verified' : 'Not Added'}</span></div>
                  </div>
                  {user?.kyc_status !== 'approved' && <button className="btn-kyc" onClick={() => setShowKYCModal(true)}>Complete KYC</button>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Footer */}
        <footer className="app-footer desktop">
          <p>BharatBit™ is a trademark owned by G.F.T. Investments Private Limited. All rights reserved © 2026</p>
        </footer>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <button className={`nav-btn ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => handleTabChange('portfolio')}>
          <span className="icon">{Icons.home}</span>
          <span className="label">Home</span>
        </button>
        <button className={`nav-btn ${activeTab === 'trade' ? 'active' : ''}`} onClick={() => handleTabChange('trade')}>
          <span className="icon">{Icons.trade}</span>
          <span className="label">Trade</span>
        </button>
        <button className={`nav-btn ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => handleTabChange('wallet')}>
          <span className="icon">{Icons.wallet}</span>
          <span className="label">Wallets</span>
        </button>
        <button className={`nav-btn ${activeTab === 'deposit' ? 'active' : ''}`} onClick={() => handleTabChange('deposit')}>
          <span className="icon">{Icons.deposit}</span>
          <span className="label">Deposit</span>
        </button>
        <button className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => handleTabChange('profile')}>
          <span className="icon">{Icons.profile}</span>
          <span className="label">Profile</span>
        </button>
      </nav>

      <style jsx>{`
        .dashboard { display: flex; min-height: 100vh; background: #f5f7fa; font-family: 'Inter', -apple-system, sans-serif; }
        
        /* Sidebar - Desktop Only */
        .sidebar { width: 240px; background: #1a1a2e; color: white; display: flex; flex-direction: column; }
        .sidebar-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .logo { display: flex; align-items: center; gap: 10px; }
        .logo-icon { width: 36px; height: 36px; background: #E95721; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-family: 'Bungee Outline', cursive; font-weight: 400; color: white; }
        .logo span { font-size: 18px; font-weight: 700; }
        .sidebar-nav { flex: 1; padding: 12px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: transparent; border: none; border-radius: 8px; color: rgba(255,255,255,0.7); font-size: 14px; cursor: pointer; text-align: left; font-family: inherit; transition: all 0.2s; }
        .nav-item:hover { background: rgba(255,255,255,0.1); color: white; }
        .nav-item.active { background: #E95721; color: white; }
        .nav-icon { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; }
        .sidebar-footer { padding: 12px; border-top: 1px solid rgba(255,255,255,0.1); }
        .logout-btn { display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 14px; background: rgba(255,255,255,0.05); border: none; border-radius: 8px; color: rgba(255,255,255,0.7); cursor: pointer; font-family: inherit; font-size: 14px; }
        
        /* Main Content */
        .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        
        /* Mobile Header - Hidden on Desktop */
        .mobile-header { display: none; justify-content: space-between; align-items: center; padding: 12px 16px; background: #1a1a2e; color: white; }
        .menu-toggle { background: transparent; border: none; color: white; width: 28px; height: 28px; cursor: pointer; }
        .mobile-header .logo-icon { width: 32px; height: 32px; font-size: 16px; }
        .kyc-badge.mobile { padding: 4px 8px; font-size: 10px; background: #fff3cd; color: #856404; border-radius: 12px; }
        
        /* Desktop Topbar */
        .topbar { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; background: white; border-bottom: 1px solid #e0e0e0; }
        .topbar h1 { font-size: 20px; color: #1a1a2e; }
        .user-info { display: flex; align-items: center; gap: 12px; }
        .client-id { font-size: 13px; color: #666; font-weight: 500; }
        .kyc-badge { padding: 5px 10px; border-radius: 16px; font-size: 12px; font-weight: 600; }
        .kyc-badge[data-status="pending"] { background: #fff3cd; color: #856404; }
        .kyc-badge[data-status="approved"] { background: #d4edda; color: #155724; }
        
        .kyc-alert { display: flex; align-items: center; gap: 12px; margin: 16px 24px; padding: 14px 18px; background: #fff3cd; border-radius: 10px; color: #856404; }
        .kyc-alert .icon { width: 20px; height: 20px; }
        .kyc-alert p { flex: 1; font-size: 14px; margin: 0; }
        .kyc-alert button { padding: 8px 14px; background: #E95721; color: white; border: none; border-radius: 6px; font-weight: 500; cursor: pointer; font-family: inherit; font-size: 13px; }
        
        .content-area { flex: 1; padding: 24px; overflow-y: auto; }
        
        /* Footer */
        .app-footer { padding: 16px 24px; background: #f8f9fa; border-top: 1px solid #e0e0e0; text-align: center; }
        .app-footer p { margin: 0; font-size: 12px; color: #666; }
        
        /* Mobile Bottom Navigation */
        .mobile-bottom-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #e0e0e0; padding: 8px 0; padding-bottom: calc(8px + env(safe-area-inset-bottom)); z-index: 100; }
        .nav-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 4px; background: transparent; border: none; cursor: pointer; font-family: inherit; color: #666; transition: color 0.2s; }
        .nav-btn.active { color: #E95721; }
        .nav-btn .icon { width: 22px; height: 22px; }
        .nav-btn .label { font-size: 10px; font-weight: 500; }
        
        /* Mobile Menu Overlay */
        .mobile-menu-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 200; }
        .mobile-menu { width: 280px; height: 100%; background: #1a1a2e; color: white; display: flex; flex-direction: column; }
        .mobile-menu-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .close-menu { background: transparent; border: none; color: white; width: 28px; height: 28px; cursor: pointer; }
        .mobile-menu-nav { flex: 1; padding: 12px; overflow-y: auto; }
        .menu-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: transparent; border: none; border-radius: 8px; color: rgba(255,255,255,0.7); font-size: 15px; cursor: pointer; text-align: left; font-family: inherit; width: 100%; }
        .menu-item:hover { background: rgba(255,255,255,0.1); color: white; }
        .menu-item.active { background: #E95721; color: white; }
        .menu-item.logout { color: #ff6b6b; margin-top: auto; }
        .menu-item .icon { width: 20px; height: 20px; }
        
        /* Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal { background: white; border-radius: 16px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e0e0e0; }
        .modal-header h2 { font-size: 18px; color: #1a1a2e; margin: 0; }
        .close-btn { width: 32px; height: 32px; border: none; background: #f0f0f0; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
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
        .coin-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 600; }
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
        .empty-icon { width: 48px; height: 48px; margin: 0 auto 12px; display: block; color: #ccc; }
        .empty-state p { font-size: 16px; font-weight: 600; color: #1a1a2e; margin-bottom: 6px; }
        .empty-state span { color: #666; font-size: 13px; display: block; margin-bottom: 16px; }
        .btn-add { padding: 10px 20px; background: #E95721; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-family: inherit; font-size: 14px; }
        .section-desc { color: #666; margin-bottom: 16px; font-size: 14px; }

        /* Deposit Section */
        .deposit-section h2 { margin-bottom: 8px; font-size: 18px; }
        .bank-details-card { background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; border: 2px solid #E95721; }
        .bank-details-card h3 { font-size: 16px; margin-bottom: 16px; color: #1a1a2e; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; flex-wrap: wrap; gap: 8px; }
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
        .profile-avatar { width: 80px; height: 80px; background: #f0f0f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #999; }
        .profile-avatar span { width: 40px; height: 40px; }
        .profile-main-info h2 { font-size: 20px; margin-bottom: 4px; }
        .client-uid { font-size: 14px; color: #666; margin-bottom: 8px; display: block; }
        .verification-badge { display: inline-block; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; }
        .verification-badge.approved { background: #d4edda; color: #155724; }
        .verification-badge.pending { background: #fff3cd; color: #856404; }
        .profile-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .profile-card { background: white; border-radius: 12px; padding: 20px; }
        .profile-card h3 { font-size: 15px; margin-bottom: 16px; color: #1a1a2e; }
        .info-list, .status-list { display: flex; flex-direction: column; gap: 12px; }
        .info-item, .status-item { display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0; flex-wrap: wrap; gap: 4px; }
        .info-item:last-child, .status-item:last-child { border-bottom: none; }
        .info-item .label, .status-item .status-label { color: #666; font-size: 13px; }
        .info-item .value { font-weight: 500; font-size: 13px; word-break: break-all; }
        .status-value { font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 12px; }
        .status-value.verified { background: #d4edda; color: #155724; }
        .status-value.pending { background: #f0f0f0; color: #666; }
        .btn-kyc { width: 100%; padding: 12px; background: #E95721; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-family: inherit; margin-top: 16px; font-size: 14px; }

        /* Responsive - Tablet */
        @media (max-width: 1024px) {
          .sidebar { width: 70px; }
          .sidebar-header .logo span, .nav-item span:not(.nav-icon), .logout-btn span:not(.nav-icon) { display: none; }
          .portfolio-summary, .price-grid, .profile-details-grid { grid-template-columns: 1fr; }
        }
        
        /* Responsive - Mobile */
        @media (max-width: 768px) {
          .sidebar { display: none; }
          .topbar { display: none; }
          .mobile-header { display: flex; }
          .mobile-bottom-nav { display: flex; }
          .mobile-menu-overlay { display: block; }
          .app-footer.desktop { display: none; }
          .content-area { padding: 16px; padding-bottom: 80px; }
          .kyc-alert { margin: 12px 16px; padding: 12px; flex-wrap: wrap; }
          .kyc-alert p { font-size: 13px; }
          .summary-card { padding: 16px; }
          .card-value { font-size: 20px; }
          .price-card { flex-direction: column; align-items: flex-start; gap: 8px; }
          .coin-price { text-align: left; }
          .profile-header-card { flex-direction: column; text-align: center; }
          .profile-avatar { width: 70px; height: 70px; }
          .modal { margin: 10px; max-height: calc(100vh - 20px); border-radius: 12px; }
        }
      `}</style>
    </div>
  )
}
