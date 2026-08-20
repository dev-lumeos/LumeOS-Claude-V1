#!/usr/bin/env node
/**
 * Gate-Build fuer apps/coach — gleiche Bauart wie apps/web und
 * apps/admin. Der B-18-Befund gilt hier genauso: `next dev` und der
 * Gate-Build duerfen sich `.next` nicht teilen.
 *
 * Node-Wrapper statt `LUMEOS_DIST_DIR=... next build`, weil pnpm unter
 * Windows durch cmd.exe ausfuehrt, wo POSIX-Umgebungsvariablen-Praefixe
 * nicht greifen (Begruendung wie apps/admin/scripts/gate-build.js).
 */
const { spawnSync } = require('node:child_process')

const distDir = process.env.LUMEOS_DIST_DIR || '.next-gate'

const result = spawnSync('next', ['build'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, LUMEOS_DIST_DIR: distDir },
})

if (result.error) {
  console.error(`[gate-build] next build liess sich nicht starten: ${result.error.message}`)
  process.exit(1)
}

process.exit(result.status ?? 1)
