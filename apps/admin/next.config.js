/** @type {import('next').NextConfig} */

// Build-Verzeichnis ueber LUMEOS_DIST_DIR waehlbar — siehe
// apps/web/next.config.js fuer die vollstaendige Begruendung (B-18).
// Kurz: Gate-Build und Dev-Server duerfen sich kein Verzeichnis teilen,
// sonst raeumt der Build `.next/types/**` ab, waehrend tsc daraus liest.
const distDir = process.env.LUMEOS_DIST_DIR || '.next'

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
