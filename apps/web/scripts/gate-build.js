#!/usr/bin/env node
/**
 * B-18 (2026-08-06): Gate-Build in ein eigenes Verzeichnis.
 *
 * Anlass: `next dev` und der Gate-Build teilten sich `apps/web/.next`.
 * Der Build raeumt das Verzeichnis beim Start ab und schreibt es neu,
 * waehrend ein laufender Dev-Server dieselben Dateien fortschreibt.
 * Dazwischen las `tsc` die in tsconfig `include` gelistete
 * `.next/types/**` und brach mit TS6053 ab.
 *
 * Warum ein Node-Wrapper und nicht `LUMEOS_DIST_DIR=.next-gate next build`
 * direkt im npm-Skript: pnpm fuehrt Skripte unter Windows durch cmd.exe
 * aus, wo die POSIX-Praefix-Syntax fuer Umgebungsvariablen nicht greift.
 * `cross-env` waere ein neues Paket — laut .claude/rules/code-quality.md
 * nur mit explizitem Task. Dieser Wrapper kommt ohne Abhaengigkeit aus und
 * verhaelt sich auf allen Plattformen gleich.
 *
 * Der Dev-Server bleibt ohne die Variable auf `.next` (siehe next.config.js).
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
