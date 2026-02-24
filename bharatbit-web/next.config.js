/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://crypto-trading-desk.preview.emergentagent.com'
  }
}

module.exports = nextConfig
