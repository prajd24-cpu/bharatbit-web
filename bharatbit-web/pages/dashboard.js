import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.replace('/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <div className="icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
          </div>
          <h1>Welcome to BharatBit</h1>
          <p className="subtitle">Your OTC Trading Dashboard</p>
        </div>

        <div className="form-card">
          <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
            You have successfully logged in!
          </p>
          <p style={{ textAlign: 'center', marginBottom: '20px', color: '#999', fontSize: '14px' }}>
            This is a basic web version. For full features, please use the mobile app.
          </p>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
