import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: [],
  experimental: {
    typedRoutes: true
  }
}

export default nextConfig
