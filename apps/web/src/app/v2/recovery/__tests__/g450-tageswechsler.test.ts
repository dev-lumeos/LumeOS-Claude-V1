// G-450 — der Tageswechsler rechnet.
//
// ══ WAS HIER BEWACHT WIRD ══════════════════════════════════════════
//
// **Codex, C-493:** *„Der Tageswechsler aendert das Datum, aber nicht
// die Kartenberechnung; die Bizepsfarbe bleibt gleich."*
//
// `[cmd]` **Die Ursache, gemessen 2026-09-15:**
//
//     recovery/page.tsx:77   ladeMuskelzustand(105)
//     muskelzustand-read:93  jetzt: Date = new Date()
//
// `[read]` **Ein nicht uebergebenes Argument, von einem Vorgabewert
// zugedeckt** — kein Typfehler, keine Meldung, nur eine Zahl, die
// sich nie ruehrte.
//
// `[read]` **Die Rechnung wird AUFGERUFEN, nicht gesucht.** `[cmd]`
// **Ein Waechter, der `bezugszeitpunkt` im Text findet, bleibt gruen,
// wenn das Argument wieder wegfaellt** — dieselbe Lehre wie in G-428,
// G-452 und G-453.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  bezugszeitpunkt, istZukunft, muskelzustaende,
  type RohSatz, type RohUebung, type RohSitzung, type RohZuordnung,
} from '../../../../lib/training/muskelzustand'

const V2 = path.join(process.cwd(), 'src/app/v2/recovery')
const lies = (f: string) => fs.readFileSync(path.join(V2, f), 'utf8')

// ══ A2 — der gewaehlte Tag geht in die Rechnung ═════════════════════

test('A2: der Bezugszeitpunkt ist der Tagesbeginn des gewaehlten Tages', () => {
  const jetzt = new Date('2026-09-15T14:30:00Z')
  // `[read]` **Tagesbeginn, nicht Mitte** — dieselbe Bezugsgroesse wie
  // `session_date`, das in `muskelzustaende` auf `T00:00:00Z` gesetzt
  // wird. `[cmd]` Ein Mittagswert ergaebe fuer „heute trainiert,
  // heute angesehen" 12 h statt 0, und `base(12)` ist 30 statt 10.
  assert.equal(bezugszeitpunkt('2026-09-05', jetzt).toISOString(),
    '2026-09-05T00:00:00.000Z')

  // Ohne Auswahl bleibt es beim echten Augenblick.
  assert.equal(bezugszeitpunkt(undefined, jetzt), jetzt)
  assert.equal(bezugszeitpunkt('', jetzt), jetzt)
  // `[read]` **Unsinn faellt auf jetzt zurueck**, statt `Invalid Date`
  // in die Rechnung zu tragen — dort wuerde daraus stumm `NaN`.
  assert.equal(bezugszeitpunkt('nicht-ein-datum', jetzt), jetzt)
  assert.equal(bezugszeitpunkt('2026-13-45', jetzt), jetzt)
})

test('A2/A4: derselbe Muskel, drei Tage, drei verschiedene Stunden', () => {
  // `[cmd]` **Die gemessene Lage von `Trapezius`** (dev@lumeos.app,
  // C-493-Seed): letzte Sitzung **2026-09-04, 3 Saetze**, danach kein
  // Reiz mehr.
  const saetze: RohSatz[] = [
    { workout_exercise_id: 'we1' },
    { workout_exercise_id: 'we1' },
    { workout_exercise_id: 'we1' },
  ]
  const uebungen: RohUebung[] = [
    { id: 'we1', exercise_id: 'ex1', workout_session_id: 's1' },
  ]
  const sitzungen: RohSitzung[] = [
    { id: 's1', session_date: '2026-09-04', name: 'C-493 Karten-Seed' },
  ]
  const zuordnungen: RohZuordnung[] = [
    { exercise_id: 'ex1', muscle_group_id: 'trapezius', role: 'primary' },
  ]

  const stundenAn = (tag: string) => muskelzustaende(
    saetze, uebungen, sitzungen, zuordnungen,
    bezugszeitpunkt(tag))['trapezius'].hours

  // `[cmd]` **Genau die Zahlen, die am Schirm stehen** (gemessen
  // 2026-09-15 ueber `tools/_g450-tage.mjs`).
  assert.equal(stundenAn('2026-09-04'), 0)
  assert.equal(stundenAn('2026-09-05'), 24)
  assert.equal(stundenAn('2026-09-06'), 48)
  assert.equal(stundenAn('2026-09-11'), 168)
  assert.equal(stundenAn('2026-09-17'), 312)

  // ══ DIE EIGENTLICHE ZUSAGE ═══════════════════════════════════════
  //
  // `[read]` **Drei verschiedene Tage muessen drei verschiedene
  // Stunden ergeben.** `[cmd]` **Vor G-450 waren alle drei gleich** —
  // 55 h, gemessen in der Gegenprobe (A5).
  const drei = ['2026-09-05', '2026-09-11', '2026-09-17'].map(stundenAn)
  assert.equal(new Set(drei).size, 3,
    `Drei Tage ergaben ${new Set(drei).size} verschiedene Stundenwerte `
    + `(${drei.join(', ')}) — der Wechsler rechnet nicht.`)
  // Und sie wachsen, statt zu springen: je Tag genau 24 h.
  assert.equal(stundenAn('2026-09-06') - stundenAn('2026-09-05'), 24)
})

test('A4: der Erholungswert wandert mit — Rest, Caution, Ready', () => {
  // `[cmd]` **Die Kurve aus `motor.ts:145` und `volumeMod`**, hier
  // nachgerechnet: **die Probe darf nicht aus `motor.ts` importieren**
  // (die Datei zieht die ganze Ansicht mit).
  const lerp = (a: number, b: number, t: number) =>
    a + (b - a) * Math.max(0, Math.min(1, t))
  const base = (h: number) =>
    h < 12 ? lerp(10, 30, h / 12)
    : h < 24 ? lerp(30, 50, (h - 12) / 12)
    : h < 48 ? lerp(50, 75, (h - 24) / 24)
    : h < 72 ? lerp(75, 90, (h - 48) / 24)
    : h < 96 ? lerp(90, 100, (h - 72) / 24)
    : 100
  // 3 Saetze -> volumeMod 1.10
  const wert = (h: number) => Math.min(100, Math.round(base(h) * 1.10))
  // `[cmd]` **Die Karte zeigt ERMUEDUNG = 100 - Erholung**, und die
  // Stufen stehen in `packages/ui/koerperkarte.tsx:581`:
  // Ready <= 25, Caution <= 60, Rest darueber.
  const stufe = (h: number) => {
    const erm = 100 - wert(h)
    return erm <= 25 ? 'Ready' : erm <= 60 ? 'Caution' : 'Rest'
  }

  assert.equal(stufe(0), 'Rest')
  assert.equal(stufe(24), 'Caution')
  assert.equal(stufe(168), 'Ready')

  // `[read]` **Die Zusage ist die WANDERUNG, nicht der Einzelwert** —
  // `[cmd]` ein Muskel, der ueber zwei Wochen dieselbe Stufe behaelt,
  // war genau der Befund aus C-493.
  const weg = [0, 24, 168].map(stufe)
  assert.deepEqual(weg, ['Rest', 'Caution', 'Ready'],
    `Der Weg war ${weg.join(' -> ')} statt Rest -> Caution -> Ready.`)
})

// ══ A1/A5 — die Stelle, an der es hing ══════════════════════════════

test('A1/A5: die Seite reicht den Bezugszeitpunkt durch', () => {
  const q = lies('page.tsx')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
  // ══ DAS ARGUMENT, NICHT DER NAME ═════════════════════════════════
  //
  // `[cmd]` **Hier stand `ladeMuskelzustand(105)`.** `[read]` **Die
  // Probe prueft den vollstaendigen Aufruf** — ein Waechter, der nur
  // `bezugszeitpunkt` irgendwo im Text sucht, bliebe gruen, wenn das
  // Argument wieder wegfaellt und der Import stehen bleibt.
  assert.match(q, /ladeMuskelzustand\(105, bezugszeitpunkt\(stichtag\)\)/,
    'Die Karte bekommt den gewaehlten Tag nicht (mehr) — dann rechnet '
    + 'sie wieder gegen `new Date()`, und der Wechsler ist wirkungslos '
    + '(C-493).')
  // `[cmd]` **Der nackte Aufruf darf NICHT wieder auftauchen.**
  assert.doesNotMatch(q, /ladeMuskelzustand\(105\)/,
    'Der einargumentige Aufruf ist zurueck — der Vorgabewert '
    // eslint-disable-next-line no-useless-concat
    + '`new Date()` deckt den Fehler dann wieder zu.')
})

test('A1: die drei uebrigen Lesewege nehmen denselben Tag', () => {
  const q = lies('page.tsx')
  // `[read]` **Sie taten es schon vor G-450** — deshalb wechselte die
  // Kopfzeile, waehrend die Karte stand. `[cmd]` **Der Waechter haelt
  // fest, dass die Seite EINEN Tag fuehrt, nicht zwei.**
  for (const weg of [
    /ladeCheckins\(30, stichtag\)/,
    /ladeScores\(180, stichtag\)/,
    /ladeModalitaeten\(120, stichtag\)/,
  ]) {
    assert.match(q, weg,
      `Ein Leseweg nimmt den Stichtag nicht mehr: ${weg}`)
  }
})

// ══ A6 — ein Tag in der Zukunft ═════════════════════════════════════

test('A6: ein kuenftiger Tag wird als Annahme ausgewiesen', () => {
  const jetzt = new Date('2026-09-15T14:30:00Z')
  assert.equal(istZukunft('2026-12-01', jetzt), true)
  assert.equal(istZukunft('2026-09-16', jetzt), true)
  // `[read]` **Heute ist NIE Zukunft** — auch nicht, wenn der
  // Bezugszeitpunkt auf den Tagesbeginn gesetzt wurde und `jetzt`
  // mittags ist. `[cmd]` Verglichen wird auf Tagesebene.
  assert.equal(istZukunft('2026-09-15', jetzt), false)
  assert.equal(istZukunft('2026-09-14', jetzt), false)
  assert.equal(istZukunft(undefined, jetzt), false)

  // Und die Karte sagt es.
  const q = lies('tab-messwerte.tsx')
  assert.ok(q.includes('angenommener Tag'),
    'Die Marke fuer einen kuenftigen Tag fehlt.')
  assert.ok(q.includes('liegt in der Zukunft'),
    'Der Satz, der die Annahme benennt, fehlt.')
  // `[read]` **Die Zahlen werden NICHT unterdrueckt** — sie sind die
  // richtige Antwort der Formel auf „angenommen, es waere so weit".
  // `[cmd]` Ein `if (zukunft) return null` waere der falsche Schluss.
  assert.doesNotMatch(q, /if \(zukunft\)\s*return null/,
    'Bei einem kuenftigen Tag wird die Karte unterdrueckt — sie soll '
    + 'rechnen und die Annahme benennen, nicht schweigen.')
})

test('A2: der Bezugstag steht im Etikett', () => {
  const q = lies('tab-messwerte.tsx')
  // ══ DIE BEDINGUNG, NICHT DIE ZEICHENKETTE ════════════════════════
  //
  // `[cmd]` **Hier stand `q.includes('gerechnet gegen den')` — und
  // die Sabotageprobe blieb GRUEN:** `if (false) teile.push(
  // \`gerechnet gegen den ${stichtag}\`)` enthaelt den Text
  // weiterhin, schiebt ihn aber nie ins Etikett.
  //
  // `[read]` **Derselbe blinde Fleck wie in G-453** — ein Waechter,
  // der die Zeilenform sucht, misst die Zeilenform. **Geprueft wird
  // die ganze Bedingung.**
  assert.match(q, /if \(stichtag\) teile\.push\(`gerechnet gegen den \$\{stichtag\}`\)/,
    'Das Etikett nennt den Bezugstag nicht (mehr) — oder die '
    + 'Bedingung davor ist eine andere geworden. Ohne ihn sieht man '
    + 'der Zahl nicht an, gegen welchen Tag sie gilt.')
})
