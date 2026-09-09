// Die Rotationsrechnung — G-390 (Uhr) und G-393 (Ids).
//
// ══ WAS SICH GEAENDERT HAT ══════════════════════════════════════════
//
// `[cmd]` **Bis C-445 fuehrte `injection_sites` vier REGIONEN ohne
// Seite** (`deltoid`, `vastus_lateralis`, ...), und eine Tabelle
// `KARTEN_ORTE` bildete jede auf ein Links/Rechts-Paar ab. **Seit
// C-445 heissen die Zeilen selbst `delt_l`, `quad_l`, `vglute_l`** —
// 16 Stueck.
//
// `[cmd]` **Die alte Tabelle lieferte damit fuer jede Zeile
// `undefined`, und die Karte blieb leer** — obwohl 16 Zeilen
// dastanden. **Dieser Test prueft jetzt die neue Regel:** die
// Zeilen-Id IST die Punkt-Id, bis auf `vglute` -> `vg`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { tageSeitInjektion, punktFuerOrt, PUNKT_UMBENENNUNG } from '../injektion-karte'

/** Die Punkt-Ids der Figur (`packages/ui`, gemessen). */
const PUNKTE = new Set([
  'delt_l', 'delt_r', 'pec_l', 'pec_r', 'bicep_l', 'bicep_r',
  'quad_l', 'quad_r', 'glute_l', 'glute_r', 'vg_l', 'vg_r',
  'lat_l', 'lat_r', 'tricep_l', 'tricep_r',
])

/** Die 16 Zeilen aus `medical.injection_sites` (gemessen 2026-09-09). */
const ORTE = [
  { id: 'delt_l', display_name: 'Deltoid L' },
  { id: 'delt_r', display_name: 'Deltoid R' },
  { id: 'glute_l', display_name: 'Gluteus L' },
  { id: 'glute_r', display_name: 'Gluteus R' },
  { id: 'lat_l', display_name: 'Latissimus L' },
  { id: 'lat_r', display_name: 'Latissimus R' },
  { id: 'quad_l', display_name: 'Quadriceps L' },
  { id: 'quad_r', display_name: 'Quadriceps R' },
  { id: 'vglute_l', display_name: 'Ventrogluteal L' },
  { id: 'vglute_r', display_name: 'Ventrogluteal R' },
  { id: 'abd_l', display_name: 'Abdomen L' },
  { id: 'abd_r', display_name: 'Abdomen R' },
  { id: 'sq_delt_l', display_name: 'SubQ Deltoid L' },
  { id: 'sq_delt_r', display_name: 'SubQ Deltoid R' },
  { id: 'thigh_sq_l', display_name: 'SubQ Thigh L' },
  { id: 'thigh_sq_r', display_name: 'SubQ Thigh R' },
]

test('die Zeilen-Id ist die Punkt-Id', () => {
  assert.equal(punktFuerOrt('delt_l', PUNKTE), 'delt_l')
  assert.equal(punktFuerOrt('quad_r', PUNKTE), 'quad_r')
})

test('vglute wird auf vg umbenannt — die einzige Ausnahme', () => {
  // `[read]` **Eine Schreibweise, kein fehlender Punkt.** Die Stelle
  // gibt es, sie heisst in `packages/ui` nur anders.
  assert.equal(punktFuerOrt('vglute_l', PUNKTE), 'vg_l')
  assert.equal(punktFuerOrt('vglute_r', PUNKTE), 'vg_r')
  assert.equal(Object.keys(PUNKT_UMBENENNUNG).length, 2,
    'mehr als eine Umbenennung: gehoert das wirklich hierher?')
})

test('ein Ort ohne Stelle auf der Figur faellt heraus', () => {
  // `[read]` **`null`, nicht der Name selbst** — sonst kaeme ein
  // Punkt durch, den die Karte still wegwirft, und die Kachel
  // behauptete mehr als sie zeigt.
  for (const id of ['abd_l', 'sq_delt_r', 'thigh_sq_l']) {
    assert.equal(punktFuerOrt(id, PUNKTE), null, `${id} hat keinen Punkt`)
  }
})

test('zehn der sechzehn Orte landen auf der Figur', () => {
  // `[cmd]` **Gemessen 2026-09-09:** acht decken sich unmittelbar,
  // `vglute_l/r` ueber die Umbenennung. **Die sechs SubQ-Orte haben
  // keine Stelle** — das ist ein Befund, kein Fehler.
  const p = tageSeitInjektion(ORTE, [], '2026-09-09', PUNKTE)
  assert.equal(p.length, 10)
  assert.ok(p.every(x => PUNKTE.has(x.id)),
    'ein Punkt liegt ausserhalb der Figur')
})

test('ohne Protokoll bleibt jeder Punkt ohne Wert', () => {
  // `[cmd]` **`injection_logs` hat 0 Zeilen** (gemessen). `[read]`
  // **`undefined`, nicht 0** — 0 hiesse „heute injiziert".
  const p = tageSeitInjektion(ORTE, [], '2026-09-09', PUNKTE)
  assert.ok(p.length > 0)
  assert.ok(p.every(x => x.daysSince === undefined))
})

test('die Tage zaehlen vom Stichtag, nicht von der Uhr', () => {
  // `[cmd]` **Gemessen: 6, nicht 7.** Der Stichtag ist Mitternacht
  // UTC, die Injektion war um 10:00 — dazwischen liegen 6 Tage und
  // 14 Stunden, und `floor` macht daraus 6.
  //
  // `[read]` **Die Richtung stimmt:** lieber einen Tag zu wenig
  // gutschreiben als einen zu viel — wer zu frueh „bereit" zeigt,
  // schickt jemanden in eine Stelle, die noch ruht.
  const p = tageSeitInjektion(
    ORTE, [{ site_id: 'delt_l', injected_at: '2026-09-02T10:00:00Z' }],
    '2026-09-09', PUNKTE)
  assert.equal(p.find(x => x.id === 'delt_l')?.daysSince, 6)
})

test('ein Einstich am Stichtag selbst ergibt 0 Tage', () => {
  const p = tageSeitInjektion(
    ORTE, [{ site_id: 'delt_l', injected_at: '2026-09-09T08:00:00Z' }],
    '2026-09-09', PUNKTE)
  assert.equal(p.find(x => x.id === 'delt_l')?.daysSince, 0)
})

test('derselbe Aufruf gibt zweimal dasselbe', () => {
  // `[cmd]` **Das ist die Hydrationsbedingung** (G-390): Server und
  // Browser rufen dieselbe Funktion mit demselben Stichtag und
  // muessen dasselbe bekommen.
  const a = () => tageSeitInjektion(
    ORTE, [{ site_id: 'delt_l', injected_at: '2026-09-02T10:00:00Z' }],
    '2026-09-09', PUNKTE)
  assert.deepEqual(a(), a())
})

test('ein unlesbarer Stichtag rechnet nicht falsch, sondern gar nicht', () => {
  assert.deepEqual(tageSeitInjektion(ORTE, [], 'kein Datum', PUNKTE), [])
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

test('die alte Regionentabelle ist weg', () => {
  // `[cmd]` **`KARTEN_ORTE` bildete Regionen auf Paare ab und
  // lieferte seit C-445 fuer jede Zeile `undefined`.** Wer sie
  // zurueckbringt, macht die Karte wieder leer.
  const q = ohneKommentare(QUELLE)
  assert.ok(!/\bKARTEN_ORTE\b/.test(q),
    'KARTEN_ORTE ist zurueck — die Karte bleibt damit leer')
})
