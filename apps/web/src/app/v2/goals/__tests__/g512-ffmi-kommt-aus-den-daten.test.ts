/**
 * G-512 — der FFMI ueber der Linie ist eine gemessene Zahl
 *
 * `[cmd]` **In `FehlendePhysiqueKacheln` stand `22.4` fest im JSX**,
 * darunter der Satz *,,Der WERT ist angebunden"*. `[cmd]` **Gemessen
 * am 2026-09-26 auf `dev@lumeos.app`: `goals.body_composition_navy`
 * gibt 21,81.**
 *
 * `[read]` **Die Attrappenmarke deckte nur die BAENDER** — der Wert
 * stand ungekennzeichnet daneben und sah aus wie eine Zahl aus der
 * Datenbank. **Und 22,4 faellt in ein anderes Band als 21,81** (die
 * Grenze liegt bei 22): die Kachel zeigte *,,Advanced natural"*, wo
 * der echte Wert *,,Natural trained"* traegt.
 *
 * `[read]` **Diese Datei misst die WIRKUNG, nicht das Wort:** kommt
 * der angezeigte Wert aus einer Requisite, und steht keine
 * FFMI-Zahl mehr als Literal im Rumpf?
 *
 * `[cmd]` **Sabotageprobe 2026-09-26** — beide Zusicherungen einzeln
 * gebrochen und rot gesehen:
 *   `22.4` wieder ins JSX  -> Zusicherung 2 faellt
 *   `ffmi`-Prop entfernt   -> Zusicherung 1 faellt
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HIER = dirname(fileURLToPath(import.meta.url))
const GOALS = join(HIER, '..')

const lies = (p: string) => readFileSync(join(GOALS, p), 'utf8')

/**
 * Der Rumpf von `FehlendePhysiqueKacheln` — nur dort gilt die Regel.
 *
 * `[read]` **Nicht die ganze Datei durchsuchen:** die anderen
 * Kacheln tragen Entwurfszahlen mit Recht, und eine Dateizaehlung
 * wuerde sie mitfangen (die Lehre aus dem zu weiten Heuhaufen).
 */
function physiqueRumpf(): string {
  const q = lies('fehlende-kacheln.tsx')
  const von = q.indexOf('export function FehlendePhysiqueKacheln')
  assert.ok(von > 0, 'FehlendePhysiqueKacheln nicht gefunden — umbenannt?')
  // Bis zum naechsten export oder Dateiende.
  const rest = q.slice(von + 10)
  const bis = rest.indexOf('\nexport ')
  return bis > 0 ? rest.slice(0, bis) : rest
}

/**
 * Derselbe Rumpf OHNE Kommentare.
 *
 * `[cmd]` **Beim ersten Lauf war die Probe an sich selbst rot:** die
 * Begruendung ueber der Kachel nennt `22,4` und den alten Satz, und
 * eine Textsuche im ganzen Rumpf findet den eigenen Kommentar.
 *
 * `[read]` **Ein Waechter, der seine eigene Begruendung liest, misst
 * den Text und nicht die Sache.**
 */
function physiqueCode(): string {
  return physiqueRumpf()
    .replace(/\/\*[\s\S]*?\*\//g, '')   // Blockkommentare
    .replace(/^[ \t]*\/\/.*$/gm, '')    // ganze Kommentarzeilen
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '') // JSX-Kommentare
}

describe('G-512 — der FFMI ueber der Linie ist echt', () => {
  it('die Wurzelmarke stimmt — sonst misst der Rest nichts', () => {
    assert.ok(physiqueRumpf().length > 200,
      'der Rumpf ist leer — der Schnitt stimmt nicht')
  })

  // ── 1 · Der Wert kommt von aussen ────────────────────────────────
  it('die Kachel nimmt den FFMI als Requisite entgegen', () => {
    const rumpf = physiqueRumpf()
    assert.match(rumpf, /FehlendePhysiqueKacheln\(\{\s*ffmi\s*\}/,
      'die Kachel nimmt keinen `ffmi` entgegen — sie rechnet wieder '
      + 'aus sich selbst')
  })

  it('der Aufrufer reicht ihn aus dem Leseweg durch', () => {
    const ansicht = lies('ansicht.tsx')
    assert.match(ansicht, /<FehlendePhysiqueKacheln[\s\S]{0,200}?ffmi=\{/,
      '`ansicht.tsx` ruft die Kachel ohne `ffmi` auf')
    assert.match(ansicht, /<FehlendePhysiqueKacheln[\s\S]{0,200}?echt\.navy\?\.ffmi/,
      'der Wert stammt nicht aus `echt.navy` — woher dann?')
  })

  // ── 2 · Keine FFMI-Zahl mehr im Rumpf ────────────────────────────
  it('keine FFMI-Zahl steht als Literal im Code', () => {
    const code = physiqueCode()
    // `[read]` **Eine FFMI-Zahl liegt zwischen 15 und 29 mit
    // Nachkommastelle.** `[cmd]` **Die Schriftgroessen (11.5, 10.5)
    // liegen darunter und werden bewusst nicht getroffen** — sonst
    // meldet der Waechter Gestaltung als Befund.
    const treffer = code.match(/(?<![.\d])(?:1[5-9]|2\d)\.\d(?![\d])/g) ?? []
    assert.deepEqual(treffer, [],
      `FFMI-artige Zahl im Code: ${treffer.join(', ')} — `
      + 'steht dort wieder ein erfundener Wert?')
  })

  // ── 3 · Das Band folgt dem Wert, nicht einer festen Marke ────────
  it('das aktive Band wird gerechnet, nicht eingetragen', () => {
    const rumpf = physiqueRumpf()
    assert.match(rumpf, /const aktiv = imBand\(/,
      'das aktive Band kommt nicht aus `imBand()` — steht es wieder fest?')
    assert.doesNotMatch(rumpf, /\[\s*'2[025]\D[^\]]*,\s*true\s*\]/,
      'ein Band traegt wieder ein festes `true`')
  })

  // ── 4 · Ohne Wert keine Einstufung ───────────────────────────────
  it('ohne FFMI steht kein Grad da', () => {
    const rumpf = physiqueRumpf()
    assert.match(rumpf, /ffmi == null/,
      'der Leerfall wird nicht behandelt — eine Pille ueber einem '
      + 'Strich waere eine Behauptung (E-72)')
  })

  // ── 5 · Die Marke sagt weiterhin, was Entwurf ist ────────────────
  it('die Baender bleiben als Entwurf gekennzeichnet', () => {
    const code = physiqueCode()
    assert.match(code, /attrappe=\{marke\(/,
      'die Marke ist weg — die Baender haben immer noch keine Quelle '
      + '(GO-21)')
    assert.doesNotMatch(code, /Der WERT ist angebunden/,
      'der alte Satz steht wieder da — er stand ueber einer festen 22,4')
  })
})
