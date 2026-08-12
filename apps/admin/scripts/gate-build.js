#!/usr/bin/env node
/**
 * Gate-Build fuer apps/admin — gleiche Bauart wie apps/web/scripts/gate-build.js.
 *
 * Uebernommen, nicht neu erfunden: der B-18-Befund (2026-08-06) gilt hier
 * genauso, sobald jemand `pnpm dev` fuer diese App laufen laesst. `next dev`
 * und der Gate-Build wuerden sich sonst `.next` teilen, der Build raeumt es
 * beim Start ab, und `tsc` bricht mit TS6053 ueber `.next/types/**` ab.
 *
 * Warum ein Node-Wrapper und nicht `LUMEOS_DIST_DIR=... next build` direkt:
 * pnpm fuehrt Skripte unter Windows durch cmd.exe aus, wo die POSIX-Syntax
 * fuer vorangestellte Umgebungsvariablen nicht greift. `cross-env` waere ein
 * neues Paket — laut .claude/rules/code-quality.md nur mit explizitem Task.
 *
 * Der zweite Teil des B-18-Fixes (`dependsOn: ["^build", "build"]` bei
 * typecheck) steht in turbo.json und gilt global, also auch fuer diese App.
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
