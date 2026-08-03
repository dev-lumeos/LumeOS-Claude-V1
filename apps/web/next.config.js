/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@lumeos/shared'],
  experimental: {
    typedRoutes: true,
  },
}

module.exports = nextConfig
