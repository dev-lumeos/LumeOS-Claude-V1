// G-473 — der Schalter, der den Absturz messbar gemacht hat.
//
// ══ WAS DIESE REIHE BEWACHT ═════════════════════════════════════════
//
// `[read]` **Der Absturz selbst ist NICHT behoben** (siehe Bericht).
// **Was hier bewacht wird, ist das Werkzeug:** ohne Quellkarten war
// der Absturzpunkt im verkleinerten Buendel nicht lesbar, und ohne
// den Schalter kostet jeder normale Bau sie mit.
//
// ══ DER BEFUND, KORRIGIERT ══════════════════════════════════════════
//
// `[cmd]` **Gemessen 2026-09-17, Produktionsbau:**
//
//     /login         1. Aufruf 200, 2. Aufruf TOT
//     /dashboard     1. Aufruf 200, 2. Aufruf TOT
//     /v2/dashboard  1. Aufruf 200, 2. Aufruf TOT
//
// `[cmd]` **Dev-Server: fuenf Navigationen hintereinander, alle 200.**
//
// `[read]` **Damit ist die Bedingung aus G-471 ueberholt:** es liegt
// **weder an der Anmeldung noch an `/v2`.** **Der Reiter stirbt bei
// der ZWEITEN Navigation, egal wohin.** **Beide frueheren Merkmale
// waren Nebenwirkungen davon, dass die Proben mehrfach navigiert
// haben.**
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const WEB = process.cwd()

function ohneKommentare(q: string): string {
  return q.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
}

test('G-473: Quellkarten haengen an einer Umgebungsvariablen', () => {
  // `[read]` **Nicht fest an:** Karten kosten Bauzeit (66 s gegen
  // 46 s gemessen) und Plattenplatz. `[read]` **Und nicht fest aus:**
  // sonst ist der naechste Absturz wieder unlesbar.
  const cfg = ohneKommentare(
    fs.readFileSync(path.join(WEB, 'next.config.js'), 'utf8'))
  assert.match(cfg, /productionBrowserSourceMaps:\s*process\.env\.LUMEOS_SOURCEMAPS\s*===\s*'1'/,
    'Der Quellkarten-Schalter fehlt oder haengt nicht mehr an '
    + 'LUMEOS_SOURCEMAPS — dann ist der naechste Absturz im '
    + 'verkleinerten Buendel wieder nicht lesbar.')
})

test('G-473: der normale Bau bleibt OHNE Karten', () => {
  // `[cmd]` **Die Vorgabe muss `false` ergeben** — ein Bau ohne die
  // Variable darf sich nicht aendern. `[read]` **Sonst waere aus
  // einem Messwerkzeug eine dauerhafte Last geworden.**
  const cfg = ohneKommentare(
    fs.readFileSync(path.join(WEB, 'next.config.js'), 'utf8'))
  assert.doesNotMatch(cfg, /productionBrowserSourceMaps:\s*true/,
    'Die Quellkarten sind fest eingeschaltet — das verlangsamt '
    + 'jeden Bau und legt den Quelltext ins Auslieferverzeichnis.')

  // Und der Wert wird wirklich verglichen, nicht nur gelesen.
  assert.doesNotMatch(cfg, /productionBrowserSourceMaps:\s*!!\s*process\.env/,
    'Jeder nichtleere Wert schaltet die Karten ein — dann genuegt '
    + 'ein versehentliches LUMEOS_SOURCEMAPS=0.')
})

test('G-473: der Bau bleibt vom Dev-Server getrennt', () => {
  // `[read]` **Diese Messung hat zweimal gebaut** (66 s und 46 s) —
  // **und der Dev-Server lief durchgehend weiter.** `[cmd]` **Nur
  // weil `LUMEOS_DIST_DIR` die Verzeichnisse trennt** (B-18).
  const w = fs.readFileSync(path.join(WEB, 'scripts', 'gate-build.js'), 'utf8')
  assert.match(w, /LUMEOS_DIST_DIR\s*\|\|\s*'\.next-gate'/,
    'Der Bau schreibt nicht mehr nach .next-gate — dann raeumt er '
    + 'das Verzeichnis des laufenden Dev-Servers ab.')
  const cfg = fs.readFileSync(path.join(WEB, 'next.config.js'), 'utf8')
  assert.match(cfg, /process\.env\.LUMEOS_DIST_DIR \|\| '\.next'/,
    'Der Dev-Server nimmt nicht mehr `.next` als Vorgabe.')
})

test('G-473: KONTROLLE — das blosse Wort macht keine Probe rot', () => {
  // `[read]` **Ohne sie misst die Reihe nur, dass jemand die Datei
  // angefasst hat** (Lehre aus G-460).
  assert.ok(
    ohneKommentare('// productionBrowserSourceMaps: true\ncode')
      .indexOf('productionBrowserSourceMaps') === -1,
    'ohneKommentare entfernt Zeilenkommentare nicht — dann findet '
    + 'die Probe ihre eigene Begruendung.')
})
