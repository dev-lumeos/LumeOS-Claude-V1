/**
 * G-518 — `next build` kann das Verzeichnis des Dev-Servers nicht
 * mehr treffen
 *
 * `[cmd]` **Zweimal derselbe Vorfall** (2026-09-08 und 2026-09-27):
 * der Dev-Server lieferte HTML ohne JavaScript, 404 auf
 * `main-app.js` und `app-pages-internals.js`. **Beide Male hat ein
 * Neustart es weggemacht.**
 *
 * `[cmd]` **Die Ursache, am 2026-09-27 gemessen:**
 *
 *     apps/web/.next/BUILD_ID        9Gr-DMlsJLyVv6vA_Zhks
 *     apps/web/.next-gate/BUILD_ID   M191AWaoOQ5UC1-_xp4al
 *
 * **Zwei getrennte Baulaeufe** — der Gate-Bau ging richtig nach
 * `.next-gate`, ein direkter `next build` schrieb nach `.next`.
 * `[cmd]` **Danach lagen 22 gehashte Bau-Chunks neben 4
 * Dev-Buendeln**, und die Manifeste gehoerten nur einer der beiden
 * Generationen.
 *
 * `[read]` **B-18 hatte die Trennung gebaut — aber nur ANGEBOTEN,
 * nicht durchgesetzt.** Diese Datei misst, dass sie jetzt greift.
 *
 * `[cmd]` **Gegenprobe gelaufen (2026-09-27), je Anwendung:**
 * `npx next build` -> abgewiesen mit `[G-518]`;
 * `pnpm --filter @lumeos/web build` -> laeuft durch nach
 * `.next-gate` (BUILD_ID `BTRMv0jhLN32zItCDV8WL`).
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'

const HIER = dirname(fileURLToPath(import.meta.url))
const WURZEL = join(HIER, '..', '..')
const SPERRE = join(WURZEL, 'tools', 'dist-dir-sperre.js')

// ── N3: die Funktion AUSFUEHREN, nicht ihren Quelltext lesen ──────
//
// `[cmd]` **Die erste Fassung hatte zwoelf `assert.match` auf den
// Quelltext und rief `pruefeDistDir` nie.** `[read]` **Damit
// bewiesen die vier Sabotagen nur, dass ein Textabgleich Text
// trifft** — **die Klasse aus G-216.**
//
// `[read]` **`pruefeDistDir` ist rein:** sie liest `process.argv`
// und `process.env` und wirft oder wirft nicht. **Also laesst sie
// sich mit gefaelschter Umgebung aufrufen.**
const { pruefeDistDir } = createRequire(import.meta.url)(SPERRE)

/**
 * Ruft die Sperre mit gefaelschter Umgebung.
 *
 * `[read]` **Beides wird danach zurueckgesetzt** — ein Test, der
 * `process.env` veraendert zurueklaesst, vergiftet die folgenden.
 */
function mitUmgebung({ argv, env }, fn) {
  const argvVorher = process.argv
  const envVorher = { ...process.env }
  process.argv = argv
  // Nur die zwei Schluessel setzen, die die Sperre liest.
  if ('NODE_ENV' in env) process.env.NODE_ENV = env.NODE_ENV
  else delete process.env.NODE_ENV
  if ('LUMEOS_DIST_DIR' in env) process.env.LUMEOS_DIST_DIR = env.LUMEOS_DIST_DIR
  else delete process.env.LUMEOS_DIST_DIR
  try { return fn() } finally {
    process.argv = argvVorher
    for (const k of ['NODE_ENV', 'LUMEOS_DIST_DIR']) {
      if (k in envVorher) process.env[k] = envVorher[k]
      else delete process.env[k]
    }
  }
}

/** Ein Bau-Aufruf, wie `next build` ihn hinterlaesst. */
const BAU = ['node', 'next', 'build']
/** Ein Dev-Aufruf. */
const DEV = ['node', 'next', 'dev', '-p', '3200']

const lies = p => readFileSync(p, 'utf8')

/** Quelltext ohne Kommentare — sonst liest der Waechter seine
 *  eigene Begruendung (die Lehre aus G-512). */
const ohneKommentare = q => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const APPS = ['web', 'coach', 'admin']

describe('G-518 — die dist-dir-Sperre greift', () => {
  it('die Wurzelmarke stimmt — sonst misst der Rest nichts', () => {
    assert.ok(existsSync(SPERRE), 'tools/dist-dir-sperre.js fehlt')
    assert.ok(lies(SPERRE).length > 500, 'die Sperre ist leer')
  })

  // ── 1 · Jede Anwendung ruft sie ─────────────────────────────────
  for (const app of APPS) {
    it(`apps/${app} ruft die Sperre`, () => {
      const cfg = ohneKommentare(lies(join(WURZEL, 'apps', app, 'next.config.js')))
      assert.match(cfg, /pruefeDistDir\(/,
        `apps/${app}/next.config.js ruft die Sperre nicht — ein direkter `
        + '`next build` trifft dort wieder .next')
      assert.match(cfg, new RegExp(`pruefeDistDir\\('${app}'\\)`),
        `apps/${app} meldet einen fremden Namen — die Fehlermeldung `
        + 'nennt dann die falsche Anwendung')
    })
  }

  // ── 2 · Die VIER Faelle, ausgefuehrt ────────────────────────────
  //
  // `[read]` **Nicht der Quelltext, sondern das Verhalten.**

  it('FALL 1 — direkter Bau ohne Variable: wirft', () => {
    mitUmgebung({ argv: BAU, env: { NODE_ENV: 'production' } }, () => {
      assert.throws(() => pruefeDistDir('web'), /G-518/,
        '`next build` ohne LUMEOS_DIST_DIR geht durch — es trifft .next')
    })
  })

  it('FALL 2 — Bau nach .next-gate: laesst durch', () => {
    mitUmgebung({
      argv: BAU,
      env: { NODE_ENV: 'production', LUMEOS_DIST_DIR: '.next-gate' },
    }, () => {
      assert.doesNotThrow(() => pruefeDistDir('web'),
        'der Gate-Bau wird abgewiesen — dann faellt das ganze Gate')
    })
  })

  // ── N1: der Fall, den die erste Fassung durchliess ──────────────
  //
  // `[cmd]` **Sie fragte nur, OB die Variable gesetzt ist.**
  // `[read]` **`LUMEOS_DIST_DIR=.next next build` war damit erlaubt
  // — und richtet genau den Schaden an.**
  for (const wert of ['.next', './.next', '.next/', 'apps/web/.next', '.\\.next']) {
    it(`FALL 3 — Bau mit LUMEOS_DIST_DIR=${wert}: wirft (N1)`, () => {
      mitUmgebung({
        argv: BAU,
        env: { NODE_ENV: 'production', LUMEOS_DIST_DIR: wert },
      }, () => {
        assert.throws(() => pruefeDistDir('web'), /G-518/,
          `LUMEOS_DIST_DIR=${wert} zeigt auf das Verzeichnis des `
          + 'Dev-Servers und muss abgewiesen werden')
      })
    })
  }

  it('FALL 4 — next dev: laesst durch', () => {
    mitUmgebung({ argv: DEV, env: { NODE_ENV: 'development' } }, () => {
      assert.doesNotThrow(() => pruefeDistDir('web'),
        '`next dev` wird abgewiesen — er BRAUCHT .next')
    })
  })

  it('next start laesst sie durch — es liest nur', () => {
    mitUmgebung({
      argv: ['node', 'next', 'start', '-p', '3200'],
      env: { NODE_ENV: 'production' },
    }, () => {
      assert.doesNotThrow(() => pruefeDistDir('web'),
        '`next start` wird abgewiesen, obwohl es nichts schreibt')
    })
  })

  it('die Meldung nennt den gesetzten Wert, wenn es einen gab', () => {
    mitUmgebung({
      argv: BAU,
      env: { NODE_ENV: 'production', LUMEOS_DIST_DIR: '.next' },
    }, () => {
      assert.throws(() => pruefeDistDir('coach'), e => {
        assert.match(e.message, /LUMEOS_DIST_DIR=\.next/,
          'die Meldung nennt den Wert nicht — der Leser sucht dann, '
          + 'warum die Sperre trotz gesetzter Variable kam')
        assert.match(e.message, /apps\/coach/,
          'die Meldung nennt die falsche Anwendung')
        return true
      })
    })
  })

  // ── 3 · Die Meldung nennt den Ausweg ────────────────────────────
  it('die Meldung nennt den richtigen Befehl und das Werkzeug', () => {
    const q = ohneKommentare(lies(SPERRE))
    assert.match(q, /pnpm --filter/,
      'die Meldung nennt den richtigen Befehl nicht')
    assert.match(q, /LUMEOS_DIST_DIR=\.next-gate/,
      'die Meldung nennt den bewussten Ausweg nicht')
    assert.match(q, /next-zustand\.mjs/,
      'die Meldung nennt das Pruefwerkzeug nicht')
  })

  // ── 4 · Eine Stelle, nicht drei ─────────────────────────────────
  it('die Regel steht an EINER Stelle', () => {
    for (const app of APPS) {
      const cfg = ohneKommentare(lies(join(WURZEL, 'apps', app, 'next.config.js')))
      // `[read]` **Kein eigener `throw` je Anwendung** — drei Kopien
      // sind drei Stellen, an denen die Regel altern kann.
      assert.doesNotMatch(cfg, /throw new Error\([\s\S]{0,80}G-518/,
        `apps/${app} traegt eine eigene Kopie der Sperre`)
    }
  })

  // ── 5 · Der Wrapper bleibt der richtige Weg ─────────────────────
  for (const app of APPS) {
    it(`apps/${app} baut ueber gate-build.js`, () => {
      const pkg = JSON.parse(lies(join(WURZEL, 'apps', app, 'package.json')))
      assert.match(pkg.scripts?.build ?? '', /gate-build\.js/,
        `apps/${app} baut nicht ueber den Wrapper — dann greift die `
        + 'Sperre beim Gate-Lauf')
    })
  }

  // ── 6 · Das Pruefwerkzeug fasst nichts an ───────────────────────
  it('next-zustand.mjs startet, beendet und loescht nichts', () => {
    const q = ohneKommentare(lies(join(WURZEL, 'tools', 'next-zustand.mjs')))
    for (const verboten of ['rmSync', 'unlinkSync', 'spawn', 'exec', 'kill']) {
      assert.doesNotMatch(q, new RegExp(`\\b${verboten}\\b`),
        `next-zustand.mjs benutzt ${verboten} — es soll nur messen`)
    }
  })
})
