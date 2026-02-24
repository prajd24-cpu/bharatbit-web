# BharatBit OTC Desk - Web Frontend

Premium OTC crypto trading desk for high-net-worth clients.

## Vercel Deployment

### Quick Deploy

1. Push this code to your GitHub repository
2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Select the `frontend` folder as root directory
6. Add environment variable:
   - `EXPO_PUBLIC_BACKEND_URL` = `https://bharatbit-preview.preview.emergentagent.com`
7. Click Deploy

### Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_BACKEND_URL` | Backend API URL |

### Custom Domain Setup

After deployment:
1. Go to Project Settings → Domains
2. Add `app.bharatbit.world`
3. Add DNS records to GoDaddy as shown by Vercel

## Local Development

```bash
cd frontend
yarn install
yarn web
```

## Build

```bash
yarn build:web
```

Output will be in the `dist` folder.
