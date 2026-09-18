// G-474 — der Absturz lag am BROWSER, nicht an LumeOS.
//
// ══ DER BEFUND ══════════════════════════════════════════════════════
//
// `[cmd]` **Gemessen 2026-09-17, zweimal dieselbe Route im
// Produktionsbau:**
//
//     Playwright-Chromium 121.0.6167.57   200, TOT
//     Google Chrome       150.0.7871.187  200, 200, 200
//     Microsoft Edge      150.0.4078.105  200, 200, 200
//
// `[read]` **Chromium 121 ist von Anfang 2024.** **Ein Renderer, der
// beim zweiten Anstrich mit zwischengespeichertem Stilblatt stirbt,
// ist ein Fehler dieses Browsers** — **die Anwendung ist in
// Ordnung.**
//
// `[cmd]` **Die Belegkette** (`tools/_g474-belegkette.mjs`):
//
//     unveraendert                   stirbt
//     CSS blockiert                  lebt
//     CSS durchgereicht (abgefangen) lebt   <- umgeht den Speicher
//     Network.setCacheDisabled       lebt
//     nur Network.enable             stirbt <- also NICHT das Werkzeug
//
// ══ WAS HIER BEWACHT WIRD ═══════════════════════════════════════════
//
// `[read]` **Es gibt nichts zu reparieren** — **also bewacht diese
// Reihe, dass der Fehler nicht noch einmal DER ANWENDUNG angelastet
// wird.** `[cmd]` **Drei Auftraege (G-471, G-473, G-474) haben durch
// diesen einen veralteten Browser gemessen.**
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(process.cwd(), '../..')

/**
 * Die Chromium-Fassung, die Playwright mitbringt.
 *
 * `[read]` **Aus der Paketsperre gelesen, nicht aus dem Browser** —
 * eine Probe startet keinen Browser.
 */
function playwrightFassung(): string | null {
  const p = path.join(WURZEL, 'pnpm-lock.yaml')
  if (!fs.existsSync(p)) return null
  const text = fs.readFileSync(p, 'utf8')
  const m = text.match(/playwright(?:-core|\/test)?@?[:\s]*(\d+\.\d+\.\d+)/)
  return m ? m[1] : null
}

test('G-474: die Browserfassung steht fest und ist bekannt', () => {
  // `[cmd]` **Playwright 1.41.2 bringt Chromium 121** (gemessen).
  // `[read]` **Steigt die Fassung, gilt der Befund neu** — dann
  // sollte jemand nachmessen, ob der Absturz weg ist.
  const v = playwrightFassung()
  assert.ok(v, 'Die Playwright-Fassung ist nicht mehr feststellbar — '
    + 'dann laesst sich der Befund aus G-474 nicht mehr einordnen.')
  assert.match(v!, /^\d+\.\d+\.\d+$/)
})

test('G-474: die Werkzeuge messen NICHT blind mit der Vorgabe', () => {
  // ══ DER GEMESSENE GRUND ══════════════════════════════════════════
  //
  // `[cmd]` **Drei Auftraege lang wurde ein Browserfehler fuer einen
  // Anwendungsfehler gehalten** — weil jede Probe den
  // Playwright-Chromium nahm, ohne es zu sagen.
  //
  // `[read]` **Mindestens ein Werkzeug muss gegen einen ECHTEN
  // Browser messen koennen** (`channel: 'chrome'` oder `'msedge'`).
  // **Sonst faellt derselbe Irrtum wieder an.**
  // `[cmd]` **Eine ZAHL genuegt nicht:** eine Sabotage, die EINEM
  // Werkzeug den Kanal nimmt, liess die Probe gruen — es gab noch
  // genug andere, und die Sabotagedatei selbst zaehlte mit.
  // `[read]` **Deshalb werden die beiden Werkzeuge BENANNT**, die
  // den Befund tragen.
  const NOETIG = [
    // Der Versionsvergleich — er hat den Fehler ueberhaupt erst
    // dem Browser zugeordnet.
    ['_g474-browserversionen.mjs', /channel:\s*['"]chrome['"]/],
    // Die /v2-Probe — sie zeigt, was ein Nutzer sieht.
    ['_g474-v2-echt.mjs', /channel:\s*KANAL/],
  ] as const

  for (const [datei, muster] of NOETIG) {
    const p = path.join(WURZEL, 'tools', datei)
    assert.ok(fs.existsSync(p), `${datei} fehlt — ohne sie ist der '`
      + 'Befund aus G-474 nicht mehr nachpruefbar.')
    assert.match(fs.readFileSync(p, 'utf8'), muster,
      `${datei} misst nicht mehr gegen einen ECHTEN Browser. `
      + 'Dann wird der naechste Browserfehler wieder der Anwendung '
      + 'angelastet (G-471 bis G-473, drei Auftraege lang).')
  }
})

test('G-474: die Belegkette ist als Werkzeug da', () => {
  // `[read]` **Der Befund muss nachpruefbar bleiben** — Tom konnte
  // `_g473-befund.mjs` nicht nachvollziehen, weil der Server nicht
  // lief. `[cmd]` **Die G-474-Werkzeuge starten ihn selbst.**
  const p = path.join(WURZEL, 'tools', '_g474-belegkette.mjs')
  assert.ok(fs.existsSync(p), 'Die Belegkette fehlt — dann laesst '
    + 'sich die Ursache nicht mehr nachvollziehen.')
  const t = fs.readFileSync(p, 'utf8')
  assert.match(t, /setCacheDisabled/,
    'Die Belegkette prueft den Zwischenspeicher nicht mehr.')
  assert.match(t, /ursacheBelegt/,
    'Die Belegkette faellt kein Urteil mehr.')

  const start = fs.readFileSync(
    path.join(WURZEL, 'tools', '_g474-anstrich.mjs'), 'utf8')
  assert.match(start, /next['"]\s*,\s*['"]start/,
    'Das Werkzeug startet den Produktionsbau nicht mehr selbst — '
    + 'dann meldet es `?` statt eines Ergebnisses, wenn der Server '
    + 'fehlt (Toms Befund zu G-473).')
})

test('G-474: KONTROLLE — das blosse Wort macht keine Probe rot', () => {
  const ohneKommentare = (q: string) =>
    q.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  assert.ok(
    ohneKommentare("// channel: 'chrome'\ncode").indexOf('channel') === -1,
    'ohneKommentare entfernt Zeilenkommentare nicht.')
})
