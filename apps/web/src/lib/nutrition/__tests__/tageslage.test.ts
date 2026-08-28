// C-48: die Lage des Tages — vier Zustaende und die Fehlzaehler.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  tageslageVon, lageSatz, LAGE_TITEL,
  lueckenVon, lueckenSatz, istVollstaendig, restVon,
} from '../tageslage'
import type { DailySummaryRow, SummaryMacro } from '../diary-summary'

function summe(p: {
  meal_count?: number; item_count?: number
  macros?: Partial<Record<SummaryMacro, { value: number | null; missing: number }>>
} = {}): DailySummaryRow {
  const leer = { value: null as number | null, missing: 0, complete: false }
  const macros: Record<string, typeof leer> = {}
  for (const c of ['enercc', 'prot625', 'cho', 'fat', 'nacl', 'water_g']) {
    macros[c] = { ...leer }
  }
  for (const [k, v] of Object.entries(p.macros ?? {})) {
    macros[k] = { value: v!.value, missing: v!.missing,
      complete: v!.missing === 0 && v!.value !== null }
  }
  return {
    entry_date: '2026-05-29',
    meal_count: p.meal_count ?? 0,
    item_count: p.item_count ?? 0,
    macros,
  } as unknown as DailySummaryRow
}

// ── Die vier Zustaende ───────────────────────────────────────────

test('C-48: ohne Zeile ist nichts angelegt', () => {
  // `[cmd]` 2026-01-15 auf dev: keine Zeile in `daily_summary`,
  // 0 Mahlzeiten.
  assert.equal(tageslageVon(null), 'nichts_angelegt')
})

test('C-48: Mahlzeit ohne Positionen ist NICHT dasselbe wie nichts', () => {
  // `[cmd]` **Der Befund, der diese Datei noetig macht.** Auf dev
  // gemessen: 2026-05-29 traegt 4 Mahlzeiten und 0 Positionen, und
  // der Reiter zeigte denselben Satz wie an einem Tag, an dem nie
  // etwas angelegt wurde.
  const a = tageslageVon(summe({ meal_count: 4, item_count: 0 }))
  const b = tageslageVon(null)
  assert.equal(a, 'ohne_positionen')
  assert.notEqual(a, b,
    'Gegessen-und-nichts-erfasst muss sich von nie-gegessen unterscheiden (C-48).')
  assert.notEqual(LAGE_TITEL.ohne_positionen, LAGE_TITEL.nichts_angelegt)
})

test('C-48: der Satz sagt, dass die leere Summe keine Aussage ist', () => {
  const s = lageSatz('ohne_positionen', 4)
  assert.match(s, /4 Mahlzeiten/)
  assert.match(s, /keine Aussage/,
    'Ohne diesen Satz liest sich die leere Summe als „nichts gegessen" (C-48).')
  assert.match(lageSatz('ohne_positionen', 1), /Eine Mahlzeit steht/)
})

test('C-48: mit Positionen ist der Tag erfasst', () => {
  assert.equal(tageslageVon(summe({ meal_count: 4, item_count: 13 })), 'erfasst')
  assert.equal(LAGE_TITEL.erfasst, '', 'Ein erfasster Tag braucht keinen Hinweis (C-48).')
})

// ── Regel 1: die Fehlzaehler ─────────────────────────────────────

// `[cmd]` **Nur diese neun Codes laedt `diary-summary.ts`** — von den
// 35 `_missing`-Spalten der View. `vitc` und `fe` sind NICHT dabei;
// siehe Bericht.
const MAKROS = [
  { code: 'enercc' as SummaryMacro, label: 'Kalorien' },
  { code: 'nacl' as SummaryMacro, label: 'Salz' },
  { code: 'water_g' as SummaryMacro, label: 'Wasser' },
]

test('C-48 Regel 1: ein Fehlzaehler ueber null wird sichtbar', () => {
  // `[cmd]` `daily_summary` traegt 74 Spalten, davon 35
  // `_missing`-Zaehler (gemessen 2026-08-28).
  const l = lueckenVon(summe({
    meal_count: 4, item_count: 24,
    macros: {
      enercc: { value: 2581, missing: 0 },
      water_g: { value: 1200, missing: 1 },
    },
  }), MAKROS)
  assert.deepEqual(l.map(x => x.code), ['water_g'])
  assert.equal(l[0].fehlend, 1)
})

test('C-48 Regel 1: der Satz nennt die Richtung des Fehlers', () => {
  // `[read]` „Unvollstaendig" allein genuegt nicht — wer nicht
  // weiss, dass die Summe zu NIEDRIG ist, liest eine Unterdeckung.
  const s = lueckenSatz([{ code: 'water_g' as SummaryMacro, label: 'Wasser', fehlend: 1 }])
  assert.match(s, /Eine Position ohne Wert bei Wasser/)
  assert.match(s, /zu niedrig/)
})

test('C-48 Regel 1: mehrere Naehrstoffe werden nicht zu einer Zahl verschmolzen', () => {
  // `[read]` „3 Positionen" bei Wasser und Salz sind zwei betroffene
  // Naehrstoffe, nicht sechs Luecken.
  const s = lueckenSatz([
    { code: 'water_g' as SummaryMacro, label: 'Wasser', fehlend: 1 },
    { code: 'nacl' as SummaryMacro, label: 'Salz', fehlend: 2 },
  ])
  assert.match(s, /Wasser, Salz/)
  assert.match(s, /3 Positionen/)
})

test('C-48 Regel 1: ohne Luecke kein Satz', () => {
  assert.equal(lueckenSatz([]), '')
  assert.deepEqual(lueckenVon(summe({ item_count: 5 }), MAKROS), [])
  assert.deepEqual(lueckenVon(null, MAKROS), [])
})

test('C-48 Regel 1: vollstaendig heisst Zaehler auf null', () => {
  const s = summe({ macros: { water_g: { value: 1200, missing: 1 },
    enercc: { value: 2581, missing: 0 } } })
  assert.equal(istVollstaendig(s, 'water_g' as SummaryMacro), false)
  assert.equal(istVollstaendig(s, 'enercc' as SummaryMacro), true)
  assert.equal(istVollstaendig(null, 'enercc' as SummaryMacro), false)
})

// ── Was noch offen ist ───────────────────────────────────────────

test('C-48: ohne Ziel kein Rest — keine erfundene Zahl', () => {
  // `[read]` Die Vorlage rechnet gegen ein festes Ziel von 2.700.
  // In diesem Repo gibt es keines; ein erfundener Nenner waere eine
  // Behauptung (Kopfkommentar `ansicht.tsx`).
  const r = restVon(summe({ macros: { enercc: { value: 1847, missing: 0 } } }),
    'enercc' as SummaryMacro, 'Kalorien', null)
  assert.equal(r.offen, null)
  assert.equal(r.prozent, null)
  assert.equal(r.wert, 1847)
})

test('C-48: mit Ziel wird der Rest gerechnet', () => {
  const r = restVon(summe({ macros: { enercc: { value: 1847, missing: 0 } } }),
    'enercc' as SummaryMacro, 'Kalorien', 2700)
  assert.equal(r.offen, 853)
  assert.equal(r.prozent, 68)
})

test('C-48: der Rest traegt die Unvollstaendigkeit mit', () => {
  // `[read]` Ein Rest, der aus einer luckenhaften Summe stammt, ist
  // selbst unsicher — das darf nicht verlorengehen.
  const r = restVon(summe({ macros: { enercc: { value: 1847, missing: 2 } } }),
    'enercc' as SummaryMacro, 'Kalorien', 2700)
  assert.equal(r.unvollstaendig, true)
})

test('C-48: ohne Wert kein Prozentwert', () => {
  const r = restVon(null, 'enercc' as SummaryMacro, 'Kalorien', 2700)
  assert.equal(r.wert, null)
  assert.equal(r.prozent, null)
  assert.equal(r.offen, null,
    'Ohne Wert ist der Rest nicht das ganze Ziel (C-48).')
})

// ── Die Anzeige haelt sich daran ─────────────────────────────────

const ohneKommentare = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

test('C-48: die Anzeige wirft die zwei Leerlagen nicht mehr zusammen', () => {
  // `[cmd]` Vorher: `const leer = !summe || summe.item_count === 0`
  // — beide Faelle zeigten denselben Satz.
  const s = ohneKommentare('src/app/v2/nutrition/ansicht.tsx')
  assert.doesNotMatch(s, /const leer = !summe \|\| summe\.item_count === 0/,
    'Die alte Sammelbedingung ist zurueck (C-48).')
  assert.match(s, /tageslageVon\(/,
    'Die Anzeige benutzt die Lage nicht (C-48).')
})

test('C-48: die Lage-Datei rechnet keine Bewertung', () => {
  // `[read]` Die Bewertung steht in `mikro-lage.ts` (G-239) und in
  // der Datenbank. Hier waere sie eine zweite Wahrheit.
  const s = ohneKommentare('src/lib/nutrition/tageslage.ts')
  assert.doesNotMatch(s, /reference_pct|reference_status|reference_kind/,
    'Die Tageslage greift in die Bewertung (C-48, G-239).')
})
