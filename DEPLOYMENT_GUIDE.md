# BharatBit OTC Desk - Production Deployment Guide

## Quick Start Deployment

### Prerequisites
- GitHub account
- Railway account (for backend)
- Vercel account (for frontend)
- MongoDB Atlas account (free tier)

---

## Step-by-Step Deployment

### 1. MongoDB Atlas Setup (5 minutes)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create FREE M0 cluster
3. Create database user (save username/password)
4. Add IP whitelist: 0.0.0.0/0 (allow all)
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net`

---

### 2. Backend Deployment on Railway (10 minutes)

#### A. Push Code to GitHub
```bash
cd /app
git init
git add .
git commit -m "BharatBit OTC Desk - Production Ready"
git remote add origin https://github.com/yourusername/bharatbit-otc.git
git push -u origin main
```

#### B. Deploy on Railway
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Select `/backend` as root directory

#### C. Add Environment Variables in Railway
```
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/bharatbit
DB_NAME=bharatbit_otc
JWT_SECRET=change-this-to-a-long-random-string-minimum-32-characters
EMAIL_PROVIDER=mock
SENDGRID_API_KEY=
FROM_EMAIL=noreply@bharatbit.com
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
SIGNZY_API_KEY=
BANK_NAME=HDFC Bank
BANK_ACCOUNT_NUMBER=50100123456789
BANK_IFSC=HDFC0001234
BANK_ACCOUNT_HOLDER=BharatBit OTC Desk Pvt Ltd
UPI_ID=bharatbit@hdfc
```

#### D. Generate Production URL
- Railway will provide: `https://bharatbit-production.up.railway.app`
- API will be at: `https://bharatbit-production.up.railway.app/api`

---

### 3. Frontend Deployment on Vercel (10 minutes)

#### A. Configure Frontend
In `/app/frontend/app.json`, ensure:
```json
{
  "expo": {
    "name": "BharatBit OTC Desk",
    "platforms": ["web", "ios", "android"],
    "web": {
      "bundler": "metro"
    }
  }
}
```

#### B. Deploy on Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Import from GitHub
4. **Framework Preset:** Other
5. **Root Directory:** `frontend`
6. **Build Command:** `npx expo export:web`
7. **Output Directory:** `dist`
8. **Install Command:** `yarn install`

#### C. Add Environment Variable
```
EXPO_PUBLIC_BACKEND_URL=https://your-railway-backend-url.up.railway.app
```

#### D. Deploy
- Vercel will provide: `https://bharatbit.vercel.app`
- This is your production URL!

---

### 4. Initialize Production Data

After deployment, run once:
```bash
curl -X POST https://your-railway-url.up.railway.app/api/admin/init-default-data
```

This creates:
- Admin user: admin@bharatbit.com / admin123
- Default crypto rates (USDT, BTC, ETH)

---

### 5. Custom Domain (Optional)

#### For Backend (Railway):
1. Go to Railway project settings
2. Click "Domains"
3. Add custom domain: `api.bharatbit.com`
4. Add DNS records as shown

#### For Frontend (Vercel):
1. Go to Vercel project settings
2. Click "Domains"
3. Add custom domain: `app.bharatbit.com`
4. Update DNS records

---

## Post-Deployment Setup

### 1. Test the Application
- Frontend: `https://bharatbit.vercel.app`
- Backend: `https://your-railway-url.up.railway.app/api`
- Login: admin@bharatbit.com / admin123

### 2. Add Real API Keys (When Ready)

Update Railway environment variables:
```bash
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx

RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxx

SIGNZY_API_KEY=xxxxxxxxxxxxx
```

Restart backend service in Railway after adding keys.

### 3. Update Bank Details
In Railway env vars, update:
```bash
BANK_NAME=Your Actual Bank
BANK_ACCOUNT_NUMBER=Your Real Account Number
BANK_IFSC=Your Real IFSC
BANK_ACCOUNT_HOLDER=Your Business Legal Name
UPI_ID=yourbusiness@yourbank
```

---

## Mobile App Deployment (Optional)

### For iOS (App Store)
```bash
cd /app/frontend
eas build --platform ios
eas submit --platform ios
```

### For Android (Play Store)
```bash
cd /app/frontend
eas build --platform android
eas submit --platform android
```

Requires:
- Expo EAS account
- Apple Developer Account ($99/year)
- Google Play Developer Account ($25 one-time)

---

## Monitoring & Maintenance

### 1. Railway Logs
- View backend logs in Railway dashboard
- Monitor API requests and errors

### 2. Vercel Analytics
- View frontend traffic in Vercel dashboard
- Monitor page load times

### 3. MongoDB Atlas
- Monitor database usage
- Set up backup schedule
- View query performance

---

## Cost Estimate

| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| Railway | $5 free/month | $5-20/month |
| Vercel | Free (hobby) | $20/month (pro) |
| MongoDB Atlas | 512MB free | $9/month (2GB) |
| SendGrid | 100 emails/day | $15/month |
| Razorpay | Free | 2% transaction fee |
| **Total** | **~$0/month** | **$50-70/month** |

---

## Security Checklist

- [ ] Changed default admin password
- [ ] Updated JWT_SECRET to long random string
- [ ] Added all API keys securely
- [ ] Enabled HTTPS (automatic on Railway/Vercel)
- [ ] Set up CORS properly
- [ ] Configured rate limiting
- [ ] Regular backups enabled on MongoDB Atlas

---

## Support

If you encounter issues:
1. Check Railway logs for backend errors
2. Check Vercel deployment logs for frontend issues
3. Verify all environment variables are set correctly
4. Ensure MongoDB connection string is correct

---

## Quick Reference

**Production URLs:**
- Frontend: `https://bharatbit.vercel.app`
- Backend: `https://bharatbit-production.up.railway.app`
- API Docs: `https://bharatbit-production.up.railway.app/docs`

**Default Admin:**
- Email: admin@bharatbit.com
- Password: admin123 (CHANGE THIS!)

**Status Check:**
```bash
# Test backend
curl https://your-railway-url.up.railway.app/api/admin/analytics

# Test frontend
curl https://bharatbit.vercel.app
```

---

Your BharatBit OTC Desk is now live in production! 🚀
