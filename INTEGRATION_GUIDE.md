# BharatBit OTC Desk - Integration Guide

This guide explains how to integrate real third-party services into the application.

## Required Integrations

### 1. SMS OTP Service (for Indian Mobile Verification)

**Recommended Services:**
- **Twilio** (Most reliable, global coverage)
- **MSG91** (India-focused, cheaper)
- **AWS SNS** (If using AWS infrastructure)

**Integration Location:** `/app/backend/services/sms_service.py`

**Steps to Integrate:**

1. Sign up for the service and get API credentials
2. Install required package:
   ```bash
   # For Twilio
   pip install twilio
   
   # For MSG91
   pip install requests
   ```

3. Add to `.env`:
   ```
   SMS_PROVIDER=twilio  # or msg91, aws_sns
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   
   # OR for MSG91
   MSG91_AUTH_KEY=your_auth_key
   MSG91_SENDER_ID=BHRTBT
   MSG91_ROUTE=4
   ```

4. Replace mock OTP function in `/app/backend/server.py`:
   ```python
   from services.sms_service import send_sms
   
   # Replace generate_otp() calls with:
   otp = generate_otp()
   await send_sms(mobile, f"Your BharatBit OTP is: {otp}. Valid for 10 minutes.")
   ```

### 2. Email Service

**Recommended Services:**
- **SendGrid** (Easy setup, good deliverability)
- **AWS SES** (Cheapest for high volume)
- **Resend** (Modern, developer-friendly)

**Integration Location:** `/app/backend/services/email_service.py`

**Steps to Integrate:**

1. Sign up and get API key
2. Install package:
   ```bash
   # For SendGrid
   pip install sendgrid
   
   # For Resend
   pip install resend
   ```

3. Add to `.env`:
   ```
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=your_api_key
   FROM_EMAIL=noreply@bharatbit.com
   FROM_NAME=BharatBit OTC Desk
   ```

4. Create email templates for:
   - Welcome email
   - OTP emails
   - KYC approval/rejection
   - Order confirmations

### 3. KYC Verification API (Signzy)

**Integration Location:** `/app/backend/services/kyc_service.py`

**Steps to Integrate:**

1. Sign up at https://signzy.com
2. Get API credentials
3. Install:
   ```bash
   pip install requests
   ```

4. Add to `.env`:
   ```
   SIGNZY_API_KEY=your_api_key
   SIGNZY_BASE_URL=https://api.signzy.tech
   ```

5. Implement verification functions:
   - PAN verification
   - Aadhaar verification (with consent)
   - Bank account verification (Penny drop)

**Important:** Always get user consent before Aadhaar verification (UIDAI compliance)

### 4. Payment Gateway - UPI QR Generation

**Recommended:**
- **Razorpay** (Best for India)
- **Cashfree**  
- **PayU**

**Integration Location:** `/app/backend/services/payment_service.py`

**Steps to Integrate:**

1. Sign up for payment gateway
2. Install SDK:
   ```bash
   pip install razorpay
   ```

3. Add to `.env`:
   ```
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   ```

4. Implement:
   - Dynamic UPI QR code generation per order
   - Payment webhook verification
   - Auto-update order status on payment confirmation

### 5. WhatsApp Business API (Optional - for RM communication)

**Recommended:** 
- **Twilio WhatsApp API**
- **Meta WhatsApp Business API**

**Steps:**
1. Get WhatsApp Business API access
2. Configure webhook for two-way communication
3. Send order updates via WhatsApp

## Environment Variables Setup

Create `/app/backend/.env` with all credentials:

```bash
# Database
MONGO_URL=mongodb://localhost:27017
DB_NAME=bharatbit_otc

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# SMS
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Email
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=
FROM_EMAIL=noreply@bharatbit.com

# KYC
SIGNZY_API_KEY=
SIGNZY_BASE_URL=https://api.signzy.tech

# Payment
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Bank Details (Your actual bank account)
BANK_NAME=HDFC Bank
BANK_ACCOUNT_NUMBER=50100123456789
BANK_IFSC=HDFC0001234
BANK_ACCOUNT_HOLDER=BharatBit OTC Desk Pvt Ltd
UPI_ID=bharatbit@hdfc
```

## Testing with Real APIs

### Test Mode
Most services provide test/sandbox modes:
- **Twilio:** Test credentials don't send real SMS
- **Razorpay:** Test mode for payments
- **Signzy:** Sandbox API for KYC testing

### Production Checklist
- [ ] All API keys are production keys
- [ ] Webhook URLs are configured
- [ ] Rate limits are understood
- [ ] Error handling is comprehensive
- [ ] Logging is configured
- [ ] Monitoring/alerts are set up

## Security Best Practices

1. **Never commit API keys** to git
2. **Use environment variables** for all secrets
3. **Validate webhook signatures** to prevent tampering
4. **Rate limit** API endpoints
5. **Log all transactions** for audit trail
6. **Encrypt sensitive data** in database
7. **Use HTTPS** for all communications

## Compliance (India)

### KYC Compliance
- Follow RBI guidelines for customer identification
- Store KYC documents for 5 years minimum
- Get explicit consent for Aadhaar usage
- Implement AML checks

### Data Privacy
- Comply with DPDP Act 2023
- Implement data deletion requests
- Secure storage of PII
- Regular security audits

### Tax Reporting
- TDS on crypto transactions (if applicable)
- Maintain transaction records
- GST compliance

## Support Contacts

**Service Provider Support:**
- Twilio: support@twilio.com
- SendGrid: support@sendgrid.com
- Signzy: support@signzy.com
- Razorpay: support@razorpay.com

**BharatBit Dev Team:**
- Technical issues: tech@bharatbit.com
- Integration help: dev@bharatbit.com
