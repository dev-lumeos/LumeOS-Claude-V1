// Die Rotationsrechnung ohne Uhr — G-390.
//
// `[cmd]` **G-388 gab `new Date()` hinein**, und `ansicht.tsx:193`
// warnt woertlich davor. **Gemessen: Hydrationsfehler auf allen elf
// Reitern des Moduls** — `tab-injektionen` wird in `ansicht.tsx`
// importiert, die Rechnung lief beim Anstrich der Schale.
//
// `[read]` **Der Waechter hier prueft die FORM, nicht das Wort:**
// nimmt die Funktion einen Zeitpunkt entgegen, oder nimmt sie sich
// einen? **Eine Funktion, die keinen Zeitpunkt annimmt, kann keinen
// falschen annehmen.**
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { tageSeitInjektion, KARTEN_ORTE } from '../injektion-karte'

const ORTE = [
  { id: 'deltoid', display_name: 'Deltoid' },
  { id: 'ventrogluteal', display_name: 'Ventrogluteal' },
]

test('ohne Protokoll bleibt der Punkt ohne Wert', () => {
  // `[read]` **`undefined`, nicht 0** — 0 hiesse „heute injiziert".
  const p = tageSeitInjektion(ORTE, [], '2026-09-09')
  assert.equal(p.length, 4)          // zwei Regionen, je links/rechts
  assert.ok(p.every(x => x.daysSince === undefined))
})

test('die Tage zaehlen vom Stichtag, nicht von der Uhr', () => {
  // `[cmd]` **Gemessen: 6, nicht 7.** Der Stichtag ist Mitternacht
  // UTC, die Injektion war um 10:00 — dazwischen liegen 6 Tage und
  // 14 Stunden, und `floor` macht daraus 6.
  //
  // `[read]` **Das ist die richtige Richtung:** die Karte faerbt nach
  // verstrichener Ruhe. **Lieber einen Tag zu wenig gutschreiben als
  // einen zu viel** — wer zu frueh „bereit" zeigt, schickt jemanden
  // in eine Stelle, die noch ruht.
  const p = tageSeitInjektion(
    ORTE,
    [{ site_id: 'deltoid', injected_at: '2026-09-02T10:00:00Z' }],
    '2026-09-09')
  const delt = p.filter(x => x.id.startsWith('delt_'))
  assert.equal(delt.length, 2)
  for (const x of delt) assert.equal(x.daysSince, 6)
})

test('ein Einstich am Stichtag selbst ergibt 0 Tage', () => {
  const p = tageSeitInjektion(
    [{ id: 'deltoid', display_name: 'Deltoid' }],
    [{ site_id: 'deltoid', injected_at: '2026-09-09T08:00:00Z' }],
    '2026-09-09')
  // `[read]` **Nicht negativ** — `Math.max(0, ...)` haelt die Zahl
  // bei null, auch wenn die Uhrzeit nach Mitternacht liegt.
  for (const x of p) assert.equal(x.daysSince, 0)
})

test('derselbe Aufruf gibt zweimal dasselbe', () => {
  // `[cmd]` **Das ist die Hydrationsbedingung**: Server und Browser
  // rufen dieselbe Funktion mit demselben Stichtag und muessen
  // dasselbe bekommen. Mit `new Date()` galt das nicht.
  const args = [ORTE, [{ site_id: 'deltoid', injected_at: '2026-09-02T10:00:00Z' }],
                '2026-09-09'] as const
  assert.deepEqual(tageSeitInjektion(...args), tageSeitInjektion(...args))
})

test('ein unlesbarer Stichtag rechnet nicht falsch, sondern gar nicht', () => {
  assert.deepEqual(tageSeitInjektion(ORTE, [], 'kein Datum'), [])
})

test('subcutaneous hat keinen Ort auf der Figur', () => {
  // `[read]` Ein WEG, kein Ort — `INJEKTIONS_ORTE` fuehrt keinen.
  assert.deepEqual(KARTEN_ORTE.subcutaneous, [])
  const p = tageSeitInjektion([{ id: 'subcutaneous', display_name: 'Subkutan' }], [], '2026-09-09')
  assert.deepEqual(p, [])
})

// ── Die Signatur ist die Zusage ─────────────────────────────────────
//
// `[cmd]` Der Pfad kommt aus `import.meta.url`, nicht aus `cwd` —
// sonst ist die Probe aus der Wurzel gruen und faellt im Gate.
const HIER = dirname(fileURLToPath(import.meta.url))
const QUELLE = readFileSync(join(HIER, '..', 'injektion-karte.ts'), 'utf8')

function ohneKommentare(s: string): string {
  return s.split('\n').filter(z => !z.trimStart().startsWith('//')
                                && !z.trimStart().startsWith('*')
                                && !z.trimStart().startsWith('/*')).join('\n')
}

test('die Rechnung nimmt einen Stichtag entgegen, keine Uhr', () => {
  const q = ohneKommentare(QUELLE)
  assert.ok(!/\bnew Date\(\s*\)/.test(q),
    'in der Rechnung steht wieder `new Date()` — das zerlegt die Hydration')
  assert.match(q, /stichtag:\s*string/,
    'die Signatur nimmt keinen Stichtag mehr entgegen')
})
