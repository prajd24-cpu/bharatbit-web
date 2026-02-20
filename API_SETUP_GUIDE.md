# BharatBit OTC Desk - API Setup Guide

This guide explains how to obtain and configure API keys for all integrations.

## 📧 1. Email OTP Integration (Resend)

### Getting Your Resend API Key

1. **Sign up at Resend**: Go to [https://resend.com](https://resend.com) and create a free account
2. **Get API Key**: 
   - Go to Dashboard → API Keys → Create API Key
   - Name it something like "BharatBit Production"
   - Copy the key (starts with `re_...`)
3. **Verify Your Domain** (for production):
   - Go to Domains → Add Domain
   - Add your domain (e.g., `bharatbit.world`)
   - Add the DNS records shown
   - Once verified, you can send from `@bharatbit.world` emails

### Configure in App

Update `/app/backend/.env`:
```
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_actual_key_here
FROM_EMAIL=noreply@bharatbit.world    # Use your verified domain
FROM_NAME=BharatBit OTC Desk
```

**Free Tier Limits**: 100 emails/day, 3,000 emails/month

---

## 🔔 2. Push Notifications (Expo)

Push notifications are **FREE** with Expo! No API key needed.

### How It Works
1. Users install the app via Expo Go or a standalone build
2. The app requests notification permissions
3. Expo provides a push token automatically
4. We store this token and use it to send notifications

### To Enable (Already configured)
- The backend service at `/app/backend/services/push_service.py` is ready
- Push notifications trigger on:
  - KYC Approval/Rejection
  - Order Status Updates
  - Wallet Verification

---

## 💳 3. Payment Gateway (Razorpay) - Future

When ready to integrate Razorpay:

1. **Sign up**: [https://razorpay.com](https://razorpay.com)
2. **Complete KYC**: Business verification required
3. **Get API Keys**: Dashboard → Settings → API Keys

Update `/app/backend/.env`:
```
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

---

## 🪪 4. KYC Verification (Signzy) - Future

When ready to automate KYC:

1. **Contact Signzy**: [https://signzy.com](https://signzy.com)
2. **Sign agreement**: Enterprise pricing
3. **Get credentials**: API key and secret

---

## 📲 5. WhatsApp Notifications (Twilio) - Future

1. **Sign up**: [https://twilio.com](https://twilio.com)
2. **Get WhatsApp Business API access**
3. **Configure sender**: Verify your business phone

---

## 🔐 Environment Variables Summary

Here's your complete `/app/backend/.env` template:

```bash
# Database (DO NOT CHANGE)
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"

# Email Configuration (Resend)
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx   # ⬅️ Add your key here
FROM_EMAIL=noreply@bharatbit.world
FROM_NAME=BharatBit OTC Desk

# Admin Notification Emails
SUPPORT_EMAIL=support@bharatbit.world
OTC_EMAIL=otc@bharatbit.world

# JWT Secret (change in production)
JWT_SECRET=your-super-secret-key-change-this

# Push Notifications (no key needed for Expo)
PUSH_NOTIFICATIONS_ENABLED=true

# Future Integrations (uncomment when ready)
# RAZORPAY_KEY_ID=
# RAZORPAY_KEY_SECRET=
# SIGNZY_API_KEY=
# SIGNZY_API_SECRET=
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
```

---

## 🚀 Quick Start Steps

1. **Get Resend API Key** (5 minutes)
   - Sign up → Create API Key → Copy key

2. **Update .env file**
   ```bash
   RESEND_API_KEY=re_your_key_here
   ```

3. **Restart Backend**
   ```bash
   sudo supervisorctl restart backend
   ```

4. **Test Registration**
   - Register a new user
   - Check if OTP email is received

---

## 📧 Email Notifications Summary

### User Emails
- OTP for registration
- OTP for 2FA login
- KYC approval/rejection
- Order confirmations
- Order status updates
- Wallet verification status

### Admin Emails (Automatic)
| Event | Recipient |
|-------|-----------|
| New user registration | support@bharatbit.world |
| KYC submission | support@bharatbit.world |
| New order placed | otc@bharatbit.world |
| Payment proof uploaded | otc@bharatbit.world |
| Order status change | otc@bharatbit.world |
| New wallet submitted | support@bharatbit.world |

---

## 🆘 Troubleshooting

### Emails not sending?
1. Check if `EMAIL_PROVIDER=resend` in .env
2. Verify API key is correct
3. Check backend logs: `cat /var/log/supervisor/backend.err.log`

### Mock mode
If no API key is set, emails run in "mock mode" - they're logged but not sent:
```
[MOCK EMAIL] To: user@example.com, Subject: Your BharatBit OTP Code
```

---

## 💰 Cost Summary

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| Resend | 100 emails/day | From $20/month |
| Expo Push | Unlimited | Free |
| Razorpay | Per transaction | 2% per transaction |
| Signzy | Contact sales | Enterprise pricing |
