/**
 * G-517 — `schuss.mjs` meldet die Ursache, nicht nur die Zeit
 *
 * `[cmd]` **2026-09-27 meldete Tom *,,ich hab ueberall 404"*.
 * `schuss.mjs` sagte dazu nur:**
 *
 *     page.waitForURL: Timeout 60000ms exceeded.
 *
 * `[cmd]` **Die Ursache: das HTML kam, KEIN JavaScript lud** — vier
 * 404er auf `/_next/static/`. `[read]` **Das Werkzeug ZAEHLTE die
 * Konsolenfehler die ganze Zeit** — es meldete sie nur nicht, weil
 * der `try`-Block ein `finally` hatte, aber kein `catch`.
 *
 * `[read]` **Diese Datei misst die WIRKUNG, nicht das Wort:** faengt
 * das Werkzeug die Ausnahme ab, sammelt es fehlgeschlagene
 * Anfragen, und nennt es den Sonderfall samt Behebung?
 *
 * `[cmd]` **Die Gegenprobe lief gegen den echten Server**
 * (`LUMEOS_SABOTAGE_404=1`, 2026-09-27): sechs 404er erkannt,
 * Diagnose und Behebung ausgegeben.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HIER = dirname(fileURLToPath(import.meta.url))
const SCHUSS = join(HIER, '..', 'schuss.mjs')

const roh = () => readFileSync(SCHUSS, 'utf8')

/**
 * Quelltext ohne Kommentare.
 *
 * `[read]` **Sonst liest der Waechter seine eigene Begruendung** —
 * die Lehre aus G-512: der Kopf dieser Datei nennt `404`,
 * `waitForURL` und die Behebung, und eine Textsuche faende sie
 * dort statt im Code.
 */
function code() {
  return roh()
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
}

describe('G-517 — schuss.mjs meldet die Ursache', () => {
  it('die Wurzelmarke stimmt — sonst misst der Rest nichts', () => {
    assert.ok(roh().length > 3000, 'schuss.mjs nicht gefunden')
    assert.match(code(), /chromium/, 'der Quelltext passt nicht')
  })

  // ── 1 · Die Ausnahme wird ueberhaupt gefangen ───────────────────
  it('der try-Block hat ein catch, nicht nur ein finally', () => {
    const q = code()
    assert.match(q, /\}\s*catch\s*\([\s\S]{0,40}?\)\s*\{/,
      'kein catch — die Ausnahme verlaesst das Werkzeug wieder mit '
      + 'Playwrights blosser Meldung, waehrend die Fehler gefuellt '
      + 'danebenliegen')
  })

  // ── 2 · Fehlgeschlagene Anfragen werden gesammelt ───────────────
  it('404er werden mitgeschrieben', () => {
    const q = code()
    assert.match(q, /on\('response'/,
      'keine Antworten beobachtet — 404er fallen unter den Tisch')
    assert.match(q, /status\(\)\s*>=\s*400/,
      'der Status wird nicht geprueft')
    assert.match(q, /on\('requestfailed'/,
      'abgebrochene Anfragen fehlen — sie haben gar keine Antwort')
  })

  // ── 3 · Der Sonderfall wird beim Namen genannt ──────────────────
  it('„kein JavaScript geladen" hat einen eigenen Namen', () => {
    const q = code()
    assert.match(q, /KEIN JAVASCRIPT GELADEN/,
      'der Sonderfall wird nicht benannt — er hat eine bekannte '
      + 'Ursache und eine bekannte Behebung')
    assert.match(q, /_next\\?\/static/,
      'die Buendel werden nicht erkannt')
  })

  // ── 4 · Die Behebung steht dabei ────────────────────────────────
  it('die Behebung nennt Neustart UND dass .next bleibt', () => {
    const q = code()
    assert.match(q, /next dev/,
      'der Neustart wird nicht genannt')
    assert.match(q, /\.next NICHT loeschen|\.next` NICHT loeschen/,
      'die Projektregel fehlt — ohne sie loescht der naechste .next')
  })

  // ── 5 · Der Bericht geht nach stderr, nicht in die Ausgabe ──────
  it('die Klartextmeldung laeuft ueber stderr', () => {
    const q = code()
    assert.match(q, /console\.error\(/,
      'der Befund wird nicht auf stderr gemeldet')
    // `[read]` **`stdout` bleibt JSON** — sonst zerbricht jeder
    // Aufrufer, der die Ausgabe einliest.
    const nachCatch = q.slice(q.search(/\}\s*catch\s*\(/))
    assert.match(nachCatch, /console\.log\(JSON\.stringify\(/,
      'der Abbruchbericht ist kein JSON — Aufrufer koennen ihn nicht lesen')
  })

  // ── 6 · Ein normaler Lauf bleibt unveraendert ───────────────────
  it('die Gegenprobe haengt an einer Umgebungsvariablen, nicht an einem Schalter', () => {
    const q = code()
    assert.match(q, /LUMEOS_SABOTAGE_404/,
      'die Gegenprobe laesst sich nicht ausloesen')
    // `[read]` **Kein Schalter** — ein `--sabotage` im Hilfetext
    // lockt dazu, ihn im Ernst zu benutzen.
    assert.ok(!/alle\('--sabotage/.test(q),
      'die Gegenprobe haengt an einem Schalter statt an der Umgebung')
  })

  it('der Abbruchbericht kuerzt die Meldungen, der normale Lauf nicht', () => {
    const q = code()
    // `[cmd]` **Ein React-Fehler schleppt dreissig `at …`-Zeilen
    // mit** — im Abbruchbericht verdecken sie genau das, wofuer er
    // da ist.
    assert.match(q, /split\('\\n'\)\[0\]/,
      'die Meldungen werden nicht auf die erste Zeile gekuerzt')
    // Im normalen Lauf steht weiterhin `fehler.slice(0, 5)` ohne map.
    assert.match(q, /fehler:\s*fehler\.slice\(0,\s*5\),/,
      'der normale Lauf kuerzt jetzt auch — der volle Text ist weg')
  })
})
