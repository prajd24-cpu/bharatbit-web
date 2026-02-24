# BharatBit OTC Desk - Product Requirements Document

## Original Problem Statement
Build a premium Over-the-Counter (OTC) crypto trading desk mobile and web application named "BharatBit OTC Desk" for high-net-worth Indian and international clients.

## Core Requirements
- **Branding**: Premium light theme, white background, orange buttons (#E95721), dark navy blue text, "B" logo
- **Target Audience**: High-net-worth Indian and international crypto traders
- **Account Types**: Individual and Corporate/Entity accounts

---

## Implemented Features

### Authentication (COMPLETE)
- [x] User registration with Mobile + Country Code Picker (29 countries)
- [x] **Account Type Selection**: Individual or Corporate/Entity (NEW - Feb 23, 2026)
- [x] Company Name field for Corporate accounts (NEW - Feb 23, 2026)
- [x] Email OTP verification via Resend (LIVE)
- [x] SMS OTP via MSG91 (LIVE - pending DLT registration for actual delivery)
- [x] Secure Login with 2FA (Email + SMS OTP)
- [x] Forgot Password flow with email reset link

### KYC Module (ENHANCED - Feb 23, 2026)
- [x] Multi-step KYC form with conditional fields based on account type
- [x] **Individual KYC Documents**:
  - PAN Card (number + image)
  - Aadhaar Card (front + back)
  - Live Selfie
  - Address Proof
  - Passport (mandatory for non-Indian clients)
- [x] **Corporate KYC Documents**: (NEW - Feb 23, 2026)
  - Company Registration Certificate
  - GST Certificate
  - Board Resolution
  - Authorized Signatory ID Proof
- [x] Camera capture and gallery upload options
- [x] KYC status banner on dashboard
- [x] Admin approval workflow

### Wallet Management (COMPLETE)
- [x] External wallet address submission with proof of ownership
- [x] Admin verification workflow
- [x] Primary wallet selection

### OTC Trading (COMPLETE)
- [x] Buy/Sell Crypto orders
- [x] Order status tracking
- [x] INR settlement

### Admin Panel (COMPLETE)
- [x] User management
- [x] KYC approval/rejection
- [x] Order management
- [x] Wallet address verification
- [x] Enhanced analytics with charts (NEW - Feb 23, 2026)

### Live Crypto Prices (ENHANCED - Feb 23, 2026)
- [x] Real-time prices from CoinGecko API
- [x] 10 supported cryptocurrencies (BTC, ETH, USDT, USDC, BNB, XRP, SOL, ADA, DOGE, MATIC)
- [x] 7-day price history for charts
- [x] INR and USD prices with 24h change percentage
- [x] **Dashboard crypto price cards with sparkline charts** (Re-integrated)

### Push Notifications (IMPLEMENTED - Feb 23, 2026)
- [x] Backend push notification service (Expo Push)
- [x] Push notifications for KYC approval/rejection
- [x] Push notifications for order status updates
- [x] Frontend push token registration on login
- [x] Notification listeners with screen navigation support
- [ ] Full testing on physical device pending

### Web App Access
- [x] **Live Web URL**: https://bharatbit-preview.preview.emergentagent.com
- [x] Works directly in browser without Expo Go
- [x] Supports registration, login, KYC, orders, and portfolio management

### Backend Refactoring (NEW - Feb 23, 2026)
- [x] Modular architecture with separate routers
- [x] `/routers/auth.py` - Authentication routes
- [x] `/routers/admin.py` - Admin routes with analytics
- [x] `/routers/orders.py` - Order management
- [x] `/routers/wallets.py` - Wallet management  
- [x] `/routers/kyc.py` - KYC submission
- [x] `/routers/rates.py` - Asset rates
- [x] `/routers/crypto.py` - Live crypto prices

### Push Notifications (STUBBED - Feb 23, 2026)
- [x] Service structure in place
- [x] Notification functions for KYC approval/rejection
- [x] Notification functions for order status updates
- [ ] Expo push token integration (pending)

---

## Live Integrations
| Service | Provider | Status |
|---------|----------|--------|
| Email OTP & Notifications | Resend | LIVE |
| SMS OTP | MSG91 | API Working (DLT pending) |
| Live Crypto Prices | CoinGecko | LIVE |
| Database | MongoDB | LIVE |

## Stubbed/Planned Integrations
| Service | Provider | Status |
|---------|----------|--------|
| KYC Verification | Signzy | Stubbed |
| Push Notifications | Expo | Stubbed (service ready) |

---

## Tech Stack
- **Frontend**: Expo (React Native + Web), TypeScript, expo-router
- **Backend**: FastAPI, Python, Motor (async MongoDB)
- **Database**: MongoDB
- **Integrations**: Resend (email), MSG91 (SMS), CoinGecko (prices)

## API Credentials
- **MSG91 Auth Key**: 495975AzbFFpTNWc699c0cd4P1
- **Resend API Key**: re_d6KmGr7R_JE8zW7Yp2Gt7mSSiPjc4Vz7D
- **Admin Account**: admin@bharatbit.com / admin123

---

## Code Architecture (Refactored)
```
/app/backend/
├── server.py              # Main entry point
├── core/
│   ├── config.py          # Environment configuration
│   ├── database.py        # MongoDB connection
│   └── dependencies.py    # Auth & security helpers
├── models/
│   └── schemas.py         # Pydantic models
├── routers/
│   ├── auth.py            # Authentication
│   ├── admin.py           # Admin with analytics
│   ├── orders.py          # Order management
│   ├── wallets.py         # Wallet management
│   ├── kyc.py             # KYC submission
│   ├── rates.py           # Asset rates
│   └── crypto.py          # Live crypto prices
└── services/
    ├── email_service.py   # Resend integration
    ├── sms_service.py     # MSG91 integration
    ├── crypto_price_service.py  # CoinGecko (NEW)
    └── push_service.py    # Push notifications (stubbed)
```

---

## Key API Endpoints

### Authentication
- `POST /api/auth/register` - Register with OTP
- `POST /api/auth/verify-otp` - Verify registration OTP
- `POST /api/auth/login` - Login with 2FA
- `POST /api/auth/verify-2fa` - Verify 2FA OTP
- `POST /api/auth/forgot-password` - Request reset
- `POST /api/auth/reset-password` - Reset password

### Crypto Prices
- `GET /api/crypto/prices` - Live prices (auth required)
- `GET /api/crypto/prices/{symbol}/history?days=7` - Price history
- `GET /api/crypto/supported` - List supported cryptos

### Admin Analytics
- `GET /api/admin/analytics` - Enhanced analytics with:
  - `overview`: User counts, order stats, KYC stats
  - `volume`: Buy/sell volume totals
  - `charts`: daily_orders (7 days), kyc_status breakdown, asset_breakdown

---

## Pending User Actions
1. **MSG91 DLT Registration** - Required for SMS delivery in India
   - Register on DLT platform (Jio/Airtel/Vodafone)
   - Get Sender ID and Template ID approved
   - Provide DLT Template ID for code integration

---

## Future Tasks (Backlog)
- [ ] Full App Store Deployment (EAS)
- [ ] WhatsApp Notifications (Twilio)
- [ ] Expo Push Token integration
- [ ] Advanced charting library for frontend

---

## Last Updated
- **Date**: February 23, 2026
- **Session Tasks Completed**:
  1. MSG91 SMS Integration (API working, DLT pending)
  2. Backend Refactoring (modular routers)
  3. Live Crypto Prices (CoinGecko)
  4. Enhanced Admin Analytics (charts data)
  5. Push Notification Service (stubbed)
  6. **Account Type Feature (Individual vs Corporate)** (NEW - Feb 23, 2026)
     - Registration screen with account type selector
     - Corporate requires company_name field
     - Conditional KYC form rendering
     - Backend validation and storage
  7. **Enhanced KYC for Corporate Accounts** (NEW - Feb 23, 2026)
     - Company Registration Certificate
     - GST Certificate
     - Board Resolution
     - Authorized Signatory ID proof

---

## Database Schema Updates (Feb 23, 2026)

### users collection
```json
{
  "id": "uuid",
  "mobile": "+919876543210",
  "email": "user@example.com",
  "password_hash": "...",
  "account_type": "individual" | "corporate",  // NEW
  "company_name": "Company Pvt Ltd",  // NEW - for corporate accounts
  "kyc_status": "pending" | "under_review" | "approved" | "rejected",
  "role": "user" | "admin",
  ...
}
```

### kyc_documents collection
```json
{
  "id": "uuid",
  "user_id": "user-uuid",
  // Individual fields
  "pan_number": "ABCDE1234F",
  "pan_image": "base64...",
  "aadhaar_number": "1234 5678 9012",
  "aadhaar_front": "base64...",
  "aadhaar_back": "base64...",
  "selfie_image": "base64...",
  "address_proof": "base64...",
  "passport_number": "...",  // For non-Indian clients
  "passport_image": "base64...",
  // Corporate fields (NEW)
  "company_registration_cert": "base64...",
  "gst_certificate": "base64...",
  "board_resolution": "base64...",
  "authorized_signatory_id": "base64...",
  "authorized_signatory_name": "John Doe",
  // Common fields
  "bank_account_number": "...",
  "bank_ifsc": "HDFC0001234",
  "bank_name": "HDFC Bank",
  ...
}
```
