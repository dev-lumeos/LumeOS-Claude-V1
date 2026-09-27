/** @type {import('next').NextConfig} */
// distDir wie in apps/web und apps/admin (B-18): Gate-Build und
// Dev-Server teilen sich kein Verzeichnis. Das Gate setzt
// LUMEOS_DIST_DIR=.next-gate, der Dev-Server bleibt auf .next.
// G-518: die Trennung durchsetzen, nicht nur anbieten. Begruendung
// und Messung in tools/dist-dir-sperre.js.
require('../../tools/dist-dir-sperre').pruefeDistDir('coach')

const nextConfig = {
  distDir: process.env.LUMEOS_DIST_DIR || '.next',
  // Lint laeuft einmal explizit im Root-Gate, nicht erneut pro Build.
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: ['@lumeos/shared', '@lumeos/ui'],
}

module.exports = nextConfig
