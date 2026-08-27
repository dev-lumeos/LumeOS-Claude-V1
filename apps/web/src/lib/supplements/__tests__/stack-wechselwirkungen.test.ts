// G-187: die Wechselwirkungen eines Stacks.
//
// ══ DIE ZAHL, DIE ALLES ENTSCHIED ═══════════════════════════════════
//
// `[cmd]` **Gemessen 2026-08-25:** `supplement_interactions` traegt 78
// Zeilen — **77 gegen Medikamente, 1 gegen Alkohol, 0 zwischen zwei
// Katalogsubstanzen.** Treffende Paare bei allen drei vorhandenen
// Staenden: **0.**
//
// `[read]` **Der Reiter, wie der Auftrag ihn beschreibt — Paare
// ZWISCHEN den Substanzen im Stack — ist damit nicht baubar.** Nicht
// weil die Daten fehlen, sondern weil sie eine andere Frage
// beantworten. Diese Pruefung haelt beides fest.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { wechselwirkungenFuer } from '../stack-wechselwirkungen'
import type { StackPosition } from '../stack-read'

const TABS = path.join(process.cwd(), 'src/app/v2/supplements/tabs.tsx')

function position(name: string, katalogId: string | null): StackPosition {
  return {
    id: `pos-${name}`, name, dose: 1, dose_unit: 'g', timing: 'any',
    frequency: 'daily', sort_order: 0, is_active: true,
    stock_remaining: null, stock_unit: null, low_stock_threshold: null,
    katalog: katalogId
      ? {
          id: katalogId, slug: 's', name, category: '—', evidence_grade: 'B',
          evidence_summary: null, typical_dose_min: null, typical_dose_max: null,
          dose_unit: null, serving_size: null, serving_unit: null,
          cost_per_serving: null, timing_default: 'any', requires_food: false,
          priority: 'unknown', benefits: [],
        }
      : null,
    notes: null, portionen_pro_tag: null, kosten_pro_tag: null,
    tage_bis_leer: null, unter_schwelle: null,
  }
}

test('G-187: die Wechselwirkung wird der richtigen Position zugeordnet', () => {
  // `[cmd]` Der echte Fall auf `test-user@lumeos.local`: Omega-3 traegt
  // *„anticoagulants (mild additive)"*, Kreatin *„caffeine interaction
  // debated"* — beide `partner_type='drug'`.
  const positionen = [position('Omega-3 (EPA/DHA)', 'id-omega')]
  const aus = wechselwirkungenFuer(positionen, [
    {
      supplement_id: 'id-omega', partner_type: 'drug',
      partner_label: 'anticoagulants (mild additive)', severity: 'caution',
      description_de: null, description_en: 'anticoagulants (mild additive)',
    },
  ])
  assert.equal(aus.length, 1)
  assert.equal(aus[0].position, 'Omega-3 (EPA/DHA)')
  assert.equal(aus[0].art, 'drug')
  assert.equal(aus[0].schwere, 'caution')
})

test('G-187: eine Zeile ohne Position im Stack zaehlt nicht', () => {
  // `[read]` **Der Kern der Zusage:** gezeigt wird nur, was den Stack
  // des Nutzers betrifft. Sonst waeren es 78 Zeilen fuer jeden.
  const aus = wechselwirkungenFuer([position('Kreatin', 'id-kreatin')], [
    { supplement_id: 'id-fremd', partner_type: 'drug', partner_label: 'Warfarin',
      severity: 'high', description_de: null, description_en: null },
  ])
  assert.deepEqual(aus, [])
})

test('G-187: eine Position ohne Katalogbezug kann nicht treffen', () => {
  // `[cmd]` Auf `test-user` ist genau eine der drei Positionen frei
  // eingetragen (`Vitamin D3`, ohne `supplement_id`).
  const aus = wechselwirkungenFuer([position('Vitamin D3', null)], [
    { supplement_id: 'id-irgendwas', partner_type: 'drug', partner_label: 'X',
      severity: null, description_de: null, description_en: null },
  ])
  assert.deepEqual(aus, [])
})

test('G-187: die Beschreibung entfaellt, wenn sie der Partner ist', () => {
  // `[cmd]` **Bei beiden Zeilen des test-user-Stacks ist genau das der
  // Fall:** `description_en` ist woertlich `partner_label`. Ohne diese
  // Regel stuende derselbe Text zweimal nebeneinander — derselbe
  // Befund wie in G-186.
  const aus = wechselwirkungenFuer([position('Kreatin', 'id-k')], [
    { supplement_id: 'id-k', partner_type: 'drug',
      partner_label: 'caffeine interaction debated', severity: 'caution',
      description_de: null, description_en: 'caffeine interaction debated' },
  ])
  assert.equal(aus[0].hinweis, null,
    'Eine Beschreibung, die der Partner ist, sagt nichts dazu.')
})

test('G-187: doppelte Zeilen werden entdoppelt', () => {
  const aus = wechselwirkungenFuer([position('Kreatin', 'id-k')], [
    { supplement_id: 'id-k', partner_type: 'drug', partner_label: 'Koffein',
      severity: 'caution', description_de: null, description_en: null },
    { supplement_id: 'id-k', partner_type: 'drug', partner_label: 'Koffein',
      severity: 'caution', description_de: null, description_en: null },
  ])
  assert.equal(aus.length, 1)
})

test('G-187: ohne Zeilen entsteht nichts — kein erfundenes Paar', () => {
  // `[read]` **Eine ausgedachte Warnung ist schlimmer als keine** —
  // sie sieht aus wie eine geprueufte.
  assert.deepEqual(wechselwirkungenFuer([position('Kreatin', 'id-k')], []), [])
  assert.deepEqual(wechselwirkungenFuer([], []), [])
})

test('G-187: der Reiter ist mit dem Lesepfad verdrahtet', () => {
  // ══ DIE VERDRAHTUNG, NICHT NUR DIE FUNKTION ═════════════════════
  //
  // `[read]` **In G-186 war das dreifach der blinde Fleck.** Eine
  // Funktion, die niemand aufruft, besteht jeden Funktionstest.
  const quelle = fs.readFileSync(TABS, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

  // ── Warum hier nicht auf den Namen geprueft wird ────────────────
  //
  // `[cmd]` Die erste Fassung lautete `/daten\?\.wechselwirkungen/`
  // und blieb bei der Sabotage `daten?.wechselwirkungenX` **gruen** —
  // ein Teilstring passt eben auch. Der Fehler aus G-186.
  //
  // `[read]` **Ein Muster am Wortende zu verankern heilt das nicht**,
  // es verschiebt es nur: jeder andere Tippfehler kaeme durch. Der
  // Feldname ist ohnehin die falsche Frage — **entscheidend ist, dass
  // der Zugriff zum Typ passt.** Das prueft `tsc`, nicht ein Regex.
  // Hier wird deshalb nur festgehalten, DASS der Reiter aus `daten`
  // liest und nicht aus einer Konstanten.
  // `[cmd]` **G-189 hat den lesenden Block aus `tabs.tsx` entfernt** —
  // `SuppInteractions` war nicht erreichbar. **Der Zugriffstest kann
  // dort nichts mehr finden**, und ihn auf eine geloeschte Fassung
  // zeigen zu lassen waere ein gruener Test ohne Gegenstand.
  //
  // `[read]` **Was bleibt, ist die haertere Haelfte:** dass der
  // LESEPFAD die Wechselwirkungen rechnet (unten). Ob eine Komponente
  // sie anzeigt, prueft der Attrappenzaehler.
  assert.equal(/INTERACTIONS/.test(quelle), false,
    'Die Entwurfskonstante ist zurueck (G-163-Beschluss).')

  // Und der Lesepfad rechnet sie ueberhaupt.
  const read = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/supplements/stack-read.ts'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
  assert.match(read, /wechselwirkungenFuer\(positionen/,
    'Der Lesepfad ruft `wechselwirkungenFuer` nicht auf — dann ist die '
    + 'Liste immer leer (G-187).')
  assert.match(read, /from\('supplement_interactions'\)/,
    'Der Lesepfad laedt `supplement_interactions` nicht.')
})

test('G-187: die Ueberschrift sagt, dass es MEDIKAMENTE sind', () => {
  // `[read]` **Ohne diesen Satz liest man Medikamentenhinweise als
  // Stack-Paarungen** — und das waere eine Aussage, die die Daten
  // nicht hergeben.
  // `[cmd]` **G-189 hat `SuppInteractions` entfernt** — er war nicht
  // erreichbar (`rule_catalog` traegt 64 Zeilen mit `qual: true`).
  // **Die Zusage aus G-187 ist damit in den erreichbaren Reiter
  // gewandert**, nicht verschwunden: `tab-interactions-echt.tsx`.
  const block = fs.readFileSync(path.join(process.cwd(),
    'src/app/v2/supplements/tab-interactions-echt.tsx'), 'utf8')
  assert.match(block, /Medikamente/,
    'Der Reiter muss sagen, worauf sich die Liste bezieht (G-187).')
  assert.match(block, /nicht untereinander|zwischen zwei Supplements/,
    'Er muss sagen, dass es KEINE Paarungen zwischen Supplements sind.')
})
