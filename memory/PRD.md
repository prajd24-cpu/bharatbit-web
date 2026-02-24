# BharatBit OTC Desk - Product Requirements Document

## Original Problem Statement
Build a premium Over-the-Counter (OTC) crypto trading desk web application named "BharatBit OTC Desk" for high-net-worth Indian and international clients.

## Core Requirements
- **Branding**: Premium dark theme, "By invitation only. For High Net-Worth Clients." tagline, Inter font
- **Target Audience**: High-net-worth Indian and international crypto traders
- **Account Types**: Individual and Corporate/Entity accounts

---

## Technology Stack

### New Next.js Web App (Primary)
- **Location**: `/app/bharatbit-web/`
- **Framework**: Next.js 14.2.3
- **Styling**: CSS-in-JS (styled-jsx)
- **API Client**: Axios
- **Deployment**: Vercel

### Backend (Unchanged)
- **Framework**: FastAPI
- **Database**: MongoDB (Motor async driver)
- **Email**: Resend (LIVE)
- **SMS**: MSG91 (LIVE - DLT pending)

---

## Implemented Features

### Authentication (COMPLETE)
- [x] User registration with Mobile + Country Code selector (25+ countries)
- [x] **Country Code Dropdown** on registration form
- [x] **Account Type Selection**: Individual or Corporate/Entity
- [x] Company Name field for Corporate accounts
- [x] Email OTP verification via Resend (LIVE)
- [x] SMS OTP via MSG91 (LIVE - pending DLT registration)
- [x] Secure Login with 2FA (Email + SMS OTP)
- [x] Forgot Password flow with email reset link
- [x] **7-Digit Client UID** auto-generated on registration

### KYC Module (ENHANCED - Feb 24, 2026)
- [x] Multi-step KYC form with conditional fields
- [x] **Camera Capture** using `capture="environment"` for documents, `capture="user"` for selfies
- [x] **Form Validation** - Blocks submission until ALL required documents uploaded
- [x] **Document Checklist** showing upload status before submission
- [x] **Individual KYC Documents**: PAN Card, Aadhaar (front/back), Selfie
- [x] **NRI KYC Documents**: PAN Card, Passport (front/back), Selfie
- [x] **Email Notification** to `support@bharatbit.world` on KYC submission

### Wallet Management (IMPLEMENTED - Feb 24, 2026)
- [x] **Add Wallet Modal** with wallet type selection (Exchange/Custodial/Self-Custody)
- [x] Exchange dropdown (WazirX, CoinDCX, Binance, etc.)
- [x] Wallet address input with ownership proof upload
- [x] **Email Notification** to `otc@bharatbit.world` on wallet submission

### Bank Account Management (IMPLEMENTED - Feb 24, 2026)
- [x] **Add Bank Account Modal** with full form fields
- [x] Account holder, number (with confirmation), IFSC, bank name, branch
- [x] **Email Notification** to `otc@bharatbit.world` on bank submission

### Deposit/Payment Details (IMPLEMENTED)
- [x] **Our Bank Details** section with BharatBit account info
- [x] Account: G.F.T. INVESTMENTS PRIVATE LIMITED
- [x] ICICI Bank, IFSC: ICIC0003458
- [x] Instructions for NEFT/RTGS transfers

### Dashboard (COMPLETE)
- [x] **Home Button** in sidebar and topbar
- [x] Portfolio overview with value display
- [x] **Trade History Tab** - placeholder for completed trades
- [x] **Transaction History Tab** - placeholder for deposits/withdrawals
- [x] **Profile Section** with Client ID, verification status
- [x] KYC status banner with action button

### Place Trade Page (IMPLEMENTED)
- [x] **Disclaimers** about indicative pricing
- [x] Processing time notice: 1-24 hours
- [x] Manual execution notice
- [x] Buy/Sell toggle (UI ready)

### Admin Notifications (COMPLETE)
- [x] Registration notification to `support@bharatbit.world`
- [x] KYC submission notification to `support@bharatbit.world`
- [x] Wallet submission notification to `otc@bharatbit.world`
- [x] Bank account notification to `otc@bharatbit.world`

---

## Backend API Endpoints

### Authentication
- `POST /api/auth/register` - Registration with country_code, mobile_number
- `POST /api/auth/login` - Login with 2FA
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/verify-2fa` - 2FA verification
- `GET /api/users/profile` - User profile with client_uid

### Notifications
- `POST /api/notifications/send-kyc` - Send KYC submission email
- `POST /api/notifications/send-wallet` - Send wallet submission email
- `POST /api/notifications/send-bank` - Send bank submission email

### Other
- `GET /api/health` - Health check
- `GET /api/payment/bank-details` - BharatBit bank details
- `GET /api/crypto/prices` - Live crypto prices

---

## Code Architecture

```
/app
├── backend/                  # FastAPI Backend
│   ├── routers/
│   │   ├── auth.py          # Authentication + users_router
│   │   ├── notifications.py # NEW: KYC/Wallet/Bank notifications
│   │   ├── admin.py
│   │   ├── orders.py
│   │   └── ...
│   ├── models/schemas.py    # Updated with client_uid, country_code
│   └── services/
│       └── email_service.py # Resend integration
│
└── bharatbit-web/           # NEW Next.js Frontend
    ├── pages/
    │   ├── index.js         # Landing page
    │   ├── login.js         # Login with 2FA
    │   ├── register.js      # Registration + country code
    │   ├── dashboard.js     # Main dashboard + modals
    │   └── verify-otp.js    # OTP verification
    └── .env.local           # NEXT_PUBLIC_API_URL
```

---

## Database Schema

### users collection
```json
{
  "id": "uuid",
  "client_uid": "7-digit-number",
  "mobile": "+919876543210",
  "email": "user@example.com",
  "password_hash": "...",
  "account_type": "individual" | "corporate",
  "company_name": "Company Pvt Ltd",
  "kyc_status": "pending" | "approved" | "rejected"
}
```

---

## Live Integrations

| Service | Provider | Status |
|---------|----------|--------|
| Email OTP & Notifications | Resend | LIVE |
| SMS OTP | MSG91 | API Working (DLT pending) |
| Live Crypto Prices | CoinGecko | LIVE |
| Database | MongoDB | LIVE |

---

## Deployment Instructions

### Vercel Deployment (Next.js Frontend)
1. Push code to GitHub via "Save to Github"
2. In Vercel dashboard, create new project
3. Select `/bharatbit-web` as root directory
4. Add environment variable: `NEXT_PUBLIC_API_URL=https://crypto-trading-web.preview.emergentagent.com`
5. Deploy - **Important**: Disable build cache on redeploy for changes to take effect

---

## Pending User Actions
1. **MSG91 DLT Registration** - Required for SMS delivery in India
2. **Vercel Deployment** - Deploy the new Next.js app from `/bharatbit-web`

---

## Future Tasks (Backlog)
- [ ] Live crypto prices on dashboard (connect CoinGecko API)
- [ ] Order placement flow with backend integration
- [ ] Admin panel for KYC/Wallet approval
- [ ] Push notifications (web service worker)
- [ ] PWA enhancements

---

## Last Updated
- **Date**: February 24, 2026
- **Session Tasks Completed**:
  1. ✅ Created notification endpoints (KYC/Wallet/Bank)
  2. ✅ Added 7-digit Client UID generation
  3. ✅ Fixed KYC form validation (blocks incomplete submissions)
  4. ✅ Fixed camera capture with proper `capture` attribute
  5. ✅ Country code dropdown on registration
  6. ✅ Add Wallet modal fully implemented
  7. ✅ Add Bank Account modal fully implemented
  8. ✅ Our Payment Details section
  9. ✅ Home button in dashboard
  10. ✅ Trade History and Transaction History tabs
  11. ✅ Profile section with Client ID
  12. ✅ All backend tests passing (100%)
  13. ✅ Footer with BharatBit trademark (G.F.T. Investments Pvt Ltd © 2026)
  14. ✅ Profile page now shows email and mobile from login session
  15. ✅ Live crypto prices from CoinGecko API (updates every 30s)
  16. ✅ **Mobile Bottom Navigation** - Fixed navigation for mobile browsers
  17. ✅ **Sleek SVG Icons** - Replaced emoji icons with professional fintech SVG icons
  18. ✅ **Mobile Slide-out Menu** - Hamburger menu with full navigation access

---

## Test Results
- Backend Tests: 16/16 passed (100%)
- Test file: `/app/backend/tests/test_bharatbit_nextjs_backend.py`
