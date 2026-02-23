# BharatBit OTC Desk - Product Requirements Document

## Original Problem Statement
Build a premium Over-the-Counter (OTC) crypto trading desk mobile and web application named "BharatBit OTC Desk" for high-net-worth Indian clients.

## Core Requirements
- **Branding**: Premium light theme, white background, orange buttons (#E95721), dark navy blue text, "B" logo
- **Target Audience**: High-net-worth Indian crypto traders

## Implemented Features

### Authentication (COMPLETE)
- [x] User registration with Mobile + Country Code Picker (29 countries)
- [x] Email OTP verification via Resend (LIVE)
- [x] SMS OTP verification via MSG91 (LIVE) - Completed Feb 23, 2026
- [x] Secure Login with 2FA (Email + SMS OTP)
- [x] Forgot Password flow with email reset link

### KYC Module (COMPLETE)
- [x] Multi-step KYC form (PAN, Aadhaar, Selfie)
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

## Live Integrations
| Service | Provider | Status |
|---------|----------|--------|
| Email OTP & Notifications | Resend | LIVE |
| SMS OTP | MSG91 | LIVE |
| Database | MongoDB | LIVE |

## Stubbed/Planned Integrations
| Service | Provider | Status |
|---------|----------|--------|
| KYC Verification | Signzy | Stubbed |
| Push Notifications | Expo | Stubbed |
| Live Crypto Prices | TBD | Planned |

## Tech Stack
- **Frontend**: Expo (React Native + Web), TypeScript, expo-router
- **Backend**: FastAPI, Python, Motor (async MongoDB)
- **Database**: MongoDB
- **Integrations**: Resend (email), MSG91 (SMS)

## API Credentials
- **MSG91 Auth Key**: 495975AzbFFpTNWc699c0cd4P1
- **Resend API Key**: re_d6KmGr7R_JE8zW7Yp2Gt7mSSiPjc4Vz7D
- **Admin Account**: admin@bharatbit.com / admin123

## Upcoming Tasks (P1)
1. Push Notifications for KYC approval and order status
2. Live Crypto Charts & Auto-Refresh Rates
3. Enhanced Admin Analytics

## Future Tasks (P2)
1. Full App Store Deployment (EAS)
2. WhatsApp Notifications
3. Refactor server.py into modular routers

## Code Architecture
```
/app
├── backend/
│   ├── server.py          # Main FastAPI app (~1200+ lines, needs refactoring)
│   └── services/
│       ├── email_service.py   # Resend integration (LIVE)
│       ├── sms_service.py     # MSG91 integration (LIVE)
│       ├── kyc_service.py     # Signzy stub
│       └── push_notification_service.py  # Expo stub
├── frontend/
│   ├── app/
│   │   ├── (tabs)/        # Main app screens
│   │   ├── auth/          # Login, Register, OTP, 2FA, Password Reset
│   │   ├── admin/         # Admin panel
│   │   ├── kyc/           # KYC submission
│   │   ├── orders/        # Order management
│   │   └── wallets/       # Wallet management
│   └── constants/
│       └── theme.ts       # Brand colors (#E95721)
```

## Last Updated
- **Date**: February 23, 2026
- **Last Task Completed**: MSG91 SMS OTP Integration - Tested and verified working
