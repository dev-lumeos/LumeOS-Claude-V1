/** @type {import('next').NextConfig} */
// distDir wie in apps/web und apps/admin (B-18): Gate-Build und
// Dev-Server teilen sich kein Verzeichnis. Das Gate setzt
// LUMEOS_DIST_DIR=.next-gate, der Dev-Server bleibt auf .next.
const nextConfig = {
  distDir: process.env.LUMEOS_DIST_DIR || '.next',
  transpilePackages: ['@lumeos/shared', '@lumeos/ui'],
}

module.exports = nextConfig
