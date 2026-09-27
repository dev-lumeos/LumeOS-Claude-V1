/** @type {import('next').NextConfig} */

// Build-Verzeichnis ueber LUMEOS_DIST_DIR waehlbar — siehe
// apps/web/next.config.js fuer die vollstaendige Begruendung (B-18).
// Kurz: Gate-Build und Dev-Server duerfen sich kein Verzeichnis teilen,
// sonst raeumt der Build `.next/types/**` ab, waehrend tsc daraus liest.
const distDir = process.env.LUMEOS_DIST_DIR || '.next'

// G-518: die Trennung durchsetzen, nicht nur anbieten. Begruendung
// und Messung in tools/dist-dir-sperre.js.
require('../../tools/dist-dir-sperre').pruefeDistDir('admin')

const nextConfig = {
  distDir,
  // Lint laeuft einmal explizit im Root-Gate, nicht erneut pro Build.
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: ['@lumeos/shared'],
  experimental: {
    typedRoutes: true,
  },
}

module.exports = nextConfig
