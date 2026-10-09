/**
 * G-635 — nach `apps/<app>/.next` schreibt nur `next dev`.
 *
 * `[cmd]` **Ursache, belegt am 2026-10-09:** `turbo.json` meldete fuer
 * `build` die Ausgaben `[".next-gate/**", ".next/**", "dist/**"]`. Turbo
 * sicherte nach jedem Gate-Build die Dateien des LAUFENDEN Dev-Servers
 * mit (Artefakt `49586e6a620668a5`: 1.912 Dateien unter `apps/web/.next/`,
 * davon 1.550 Hot-Update-Schnipsel) — und schrieb sie bei einem
 * Cache-Treffer zurueck. Gate-Lauf 2026-10-08 16:18:45–16:19:23:
 * `@lumeos/web:build: cache hit, replaying logs 49586e6a620668a5`. Die
 * zurueckgeschriebene `static/css/app/layout.css` trug
 * `__variable_8b3a0b` / `__variable_e896d9`, das HTML des Dev-Servers
 * `__variable_176161` → Times New Roman (Befund Tom 17:43).
 *
 * `[read]` **G-518 (`tools/dist-dir-sperre.js`) sperrt nur `next build`**
 * — dieser Weg brauchte gar keinen Build. Zweiter Schreiber: `next lint`
 * legte seinen Cache nach `.next/cache/eslint` (harmlos, aber nicht dev).
 *
 * `[read]` **Der Waechter fragt Turbo selbst** (`--dry=json`) statt
 * `turbo.json` zu lesen — er sieht damit auch Ausgaben aus Paket-eigenen
 * `turbo.json` und Vorgaben.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const APPS = ['@lumeos/web', '@lumeos/coach', '@lumeos/admin']

/** Dateien, die nur ein laufender `next dev` erzeugt — je eine pro Ebene. */
const DEV_DATEIEN = [
  '.next/static/css/app/layout.css',
  '.next/server/app/page.js',
  '.next/static/webpack/app/layout.3c089cdec76cbba4.hot-update.js',
  '.next/package.json',
  '.next/cache/eslint/.cache_j7d06q',
]

/**
 * Glob → RegExp, **Punktdateien eingeschlossen** — wie Turbo sie sichert.
 * `[cmd]` **Node's `path.matchesGlob` laesst Punktverzeichnisse aus:**
 * `matchesGlob('.next/x', '**')` ist `false` (gemessen 2026-10-09). Mit
 * ihm blieb ein Alles-Muster unentdeckt (Sabotage S2 kam nur im Eichtest an).
 */
export function passt(pfad, muster) {
  const re = muster.split(/(\*\*\/?|\*|\?)/).map(t =>
    t === '**/' ? '(?:.*/)?' : t === '**' ? '.*' : t === '*' ? '[^/]*' : t === '?' ? '[^/]'
      : t.replace(/[.+^${}()|[\]\\]/g, '\\$&')).join('')
  return new RegExp(`^${re}$`).test(pfad)
}

/** Welche Ausgabemuster erfassen eine Datei aus `.next/`? (reine Funktion, unten geeicht) */
export function erfasstDevVerzeichnis(muster) {
  return muster.filter(m => DEV_DATEIEN.some(d => passt(d, m)))
}

test('G-635: der Abgleich selbst — erkennt .next/**, laesst .next-gate/** durch', () => {
  assert.deepEqual(erfasstDevVerzeichnis(['.next/**']), ['.next/**'])
  assert.deepEqual(erfasstDevVerzeichnis(['**']), ['**'], 'ein Alles-Muster erfasst .next mit')
  assert.deepEqual(erfasstDevVerzeichnis(['.next*/**']), ['.next*/**'])
  assert.deepEqual(erfasstDevVerzeichnis(['.next/static/**']), ['.next/static/**'])
  assert.deepEqual(erfasstDevVerzeichnis(['.next-gate/**', 'dist/**']), [])
})

test('G-635: kein Turbo-Schritt sichert (und stellt wieder her) apps/*/.next', () => {
  const roh = execSync('npx turbo run build lint typecheck test --dry=json', {
    cwd: WURZEL, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024,
  })
  const tasks = JSON.parse(roh).tasks.filter(t => APPS.includes(t.package))
  assert.ok(tasks.length >= 12, `nur ${tasks.length} Schritte der drei Apps gefunden`)
  const builds = tasks.filter(t => t.task === 'build')
  assert.equal(builds.length, 3)
  for (const b of builds) assert.ok((b.outputs ?? []).length > 0, `${b.taskId} meldet keine Ausgabe — Muster falsch gelesen?`)
  const treffer = tasks
    .map(t => [t.taskId, erfasstDevVerzeichnis(t.outputs ?? [])])
    .filter(([, m]) => m.length)
  assert.deepEqual(treffer, [],
    'Turbo sichert das Verzeichnis des Dev-Servers und schreibt es bei einem Cache-Treffer zurueck (G-635)')
})

test('G-635: next lint legt seinen Cache nicht nach .next', () => {
  const lint = JSON.parse(readFileSync(join(WURZEL, 'apps', 'web', 'package.json'), 'utf8')).scripts.lint
  const ort = /--cache-location\s+(\S+)/.exec(lint)?.[1]
  assert.ok(ort, `apps/web lint ohne --cache-location: ${lint} — der Vorgabeort ist .next/cache/eslint`)
  assert.ok(!passt(ort.replace(/^\.\//, '').replace(/\/$/, '') + '/x', '.next/**'), `Cache-Ort ${ort} liegt in .next`)
})
