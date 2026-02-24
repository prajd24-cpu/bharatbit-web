# BharatBit Web

A clean, standalone web application for BharatBit OTC Desk login functionality.

## Features

- Login with email/mobile and password
- Two-factor authentication (OTP verification)
- Mobile-friendly design
- Works reliably on all browsers

## Setup

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Run development server:
```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push this code to a new GitHub repository
2. Go to [Vercel](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://bharatbit-preview.preview.emergentagent.com`
6. Click "Deploy"

## Tech Stack

- Next.js 14
- React 18
- Axios for API calls
