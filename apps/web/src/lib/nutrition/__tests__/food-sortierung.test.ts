// G-70 / G-112: die acht Achsen und der Mehrfachfilter.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  SERVER_SORTS, ACHSEN, ALLE_SORTIERUNGEN, SORT_TEXT, SORTIERT_SEITE,
  serverKann, serverSort, istAbsteigend, sortiereSeite, naechsteSortierung,
} from '../food-sortierung'
import { buildFoodSearchFilters } from '../food-search'

const t = (prot: unknown, kcal: unknown, cho: unknown, fat: unknown) =>
  ({ prot625: prot, enercc: kcal, cho, fat })

// ── Was die Datenbank wirklich kann ──────────────────────────────

test('G-70: die Datenbank kennt VIER Sortierwerte, nicht zehn', () => {
  // `[cmd]` **Gemessen 2026-08-29 gegen die laufende Funktion.** Der
  // Auftrag nennt zehn; die Bedingung im Quelltext lautet
  // `p_sort IN ('relevance','protein_desc','kcal_asc','name_asc')`.
  assert.deepEqual([...SERVER_SORTS],
    ['relevance', 'name_asc', 'protein_desc', 'kcal_asc'])
  for (const s of ['protein_desc', 'kcal_asc', 'name_asc', 'relevance'] as const) {
    assert.equal(serverKann(s), true, s)
  }
  for (const s of ['carbs_desc', 'carbs_asc', 'fat_desc', 'fat_asc',
    'protein_asc', 'kcal_desc'] as const) {
    assert.equal(serverKann(s), false, s)
  }
})

test('G-70: an die Datenbank geht nie ein Wert, den sie nicht kennt', () => {
  // `[read]` Sie faellt zwar schweigend auf `relevance` zurueck —
  // aber sich darauf zu verlassen hiesse, ein Verhalten anzunehmen,
  // das nirgends zugesichert ist.
  assert.equal(serverSort('carbs_desc'), 'relevance')
  assert.equal(serverSort('fat_asc'), 'relevance')
  assert.equal(serverSort('protein_desc'), 'protein_desc')
  assert.equal(serverSort('kcal_asc'), 'kcal_asc')
})

test('G-70: acht Achsen, vier Naehrstoffe in zwei Richtungen (E-23)', () => {
  assert.equal(ACHSEN.length, 8)
  assert.equal(ALLE_SORTIERUNGEN.length, 10)
  for (const a of ACHSEN) {
    assert.ok(SORT_TEXT[a], `${a} ohne Beschriftung (G-70).`)
    assert.match(SORT_TEXT[a], /hoch|niedrig/,
      `${a} nennt die Richtung nicht (G-70).`)
  }
})

// ── Die Probe, die zaehlt ────────────────────────────────────────

test('G-70: bei carbs_desc steht oben mehr als unten', () => {
  // **Der Auftrag: „die einfachste Probe und die, die zaehlt."**
  const liste = [t(5, 100, 10, 1), t(9, 300, 77, 2), t(2, 50, 40, 0)]
  const s = sortiereSeite(liste, 'carbs_desc')
  assert.equal(s[0].cho, 77)
  assert.equal(s[s.length - 1].cho, 10)
  assert.ok(Number(s[0].cho) > Number(s[s.length - 1].cho),
    'Oben steht nicht mehr als unten (G-70).')
})

test('G-70: und bei carbs_asc umgekehrt', () => {
  const liste = [t(5, 100, 10, 1), t(9, 300, 77, 2), t(2, 50, 40, 0)]
  const s = sortiereSeite(liste, 'carbs_asc')
  assert.equal(s[0].cho, 10)
  assert.equal(s[s.length - 1].cho, 77)
})

test('G-70: jede der acht Achsen ordnet ihr eigenes Feld', () => {
  const liste = [t(1, 300, 10, 9), t(9, 100, 77, 1), t(5, 200, 40, 5)]
  const paare: Array<[typeof ACHSEN[number], 'prot625' | 'enercc' | 'cho' | 'fat']> = [
    ['protein_desc', 'prot625'], ['protein_asc', 'prot625'],
    ['kcal_desc', 'enercc'], ['kcal_asc', 'enercc'],
    ['carbs_desc', 'cho'], ['carbs_asc', 'cho'],
    ['fat_desc', 'fat'], ['fat_asc', 'fat'],
  ]
  for (const [achse, feld] of paare) {
    const s = sortiereSeite(liste, achse)
    const erst = Number(s[0][feld])
    const letzt = Number(s[s.length - 1][feld])
    if (istAbsteigend(achse)) {
      assert.ok(erst > letzt, `${achse}: ${erst} nicht groesser als ${letzt}`)
    } else {
      assert.ok(erst < letzt, `${achse}: ${erst} nicht kleiner als ${letzt}`)
    }
  }
})

test('G-70: ein fehlender Wert ist keine Null', () => {
  // `[read]` Beim Aufsteigen stuende `null` sonst vorn und
  // behauptete den niedrigsten Wert.
  const liste = [t(5, 100, null, 1), t(9, 300, 77, 2), t(2, 50, 40, 0)]
  for (const achse of ['carbs_asc', 'carbs_desc'] as const) {
    const s = sortiereSeite(liste, achse)
    assert.equal(s[s.length - 1].cho, null,
      `${achse}: der fehlende Wert steht nicht am Ende (G-70).`)
  }
})

test('G-70: bei Gleichstand bleibt die Reihenfolge des Servers', () => {
  // `[read]` Sonst springt die Liste zwischen zwei Aufrufen.
  const liste = [t(1, 100, 50, 1), t(2, 100, 50, 2), t(3, 100, 50, 3)]
  const s = sortiereSeite(liste, 'carbs_desc')
  assert.deepEqual(s.map(x => x.prot625), [1, 2, 3])
})

test('G-70: relevance und name_asc ordnet die Seite nicht um', () => {
  // `[read]` Das macht die Datenbank — hier waere es eine zweite,
  // schlechtere Ordnung ueber nur einer Seite.
  //
  // `[read]` **Mit gleichen Werten geprueft, nicht mit
  // verschiedenen** — die erste Fassung kam durch, weil ein
  // fehlendes Feld (`FELD['relevance']` ist undefined) alle Werte
  // auf `null` abbildet und die Reihenfolge dadurch zufaellig
  // erhalten blieb. **Hier tragen alle drei dieselben Makros: nur
  // eine echte Rueckgabe der Eingangsliste besteht das.**
  const liste = [t(5, 100, 50, 5), t(5, 100, 50, 5), t(5, 100, 50, 5)]
    .map((x, i) => ({ ...x, marke: i }))
  for (const s of ['relevance', 'name_asc'] as const) {
    assert.deepEqual(sortiereSeite(liste, s).map(x => x.marke), [0, 1, 2], s)
  }
  // Und die Rueckgabe ist eine KOPIE, nicht die Eingangsliste selbst.
  assert.notEqual(sortiereSeite(liste, 'relevance'), liste)
})

test('G-70: der Klick geht ab -> auf -> aus', () => {
  // `[read]` Absteigend zuerst — „am meisten Protein" ist die
  // haeufigere Frage.
  assert.equal(naechsteSortierung('relevance', 'carbs'), 'carbs_desc')
  assert.equal(naechsteSortierung('carbs_desc', 'carbs'), 'carbs_asc')
  assert.equal(naechsteSortierung('carbs_asc', 'carbs'), 'relevance')
  // Ein Wechsel der Spalte beginnt wieder absteigend.
  assert.equal(naechsteSortierung('carbs_asc', 'fat'), 'fat_desc')
})

test('G-70: die Grenze der Seitensortierung steht als Satz da', () => {
  // `[read]` Sonst haelt jemand die Seitenspitze fuer die
  // Gesamtspitze.
  assert.match(SORTIERT_SEITE, /geladene Seite/)
  assert.match(SORTIERT_SEITE, /Protein|Kalorien/)
})

// ── G-112: mehrere Filter ────────────────────────────────────────

test('G-112: mehrere Tags ergeben mehrere Gruppen (UND)', () => {
  // `[cmd]` **Gemessen 2026-08-29:** `vegan` 1.377, `high_protein`
  // 1.400 — **ODER 2.712, UND 65.** Eine Gruppe je Tag heisst UND.
  const f = buildFoodSearchFilters([], ['vegan', 'high_protein'])
  assert.deepEqual(f?.tag_groups, [['high_protein'], ['vegan']])
})

test('G-112: ein einzelner Tag bleibt ein einzelner Filter', () => {
  const f = buildFoodSearchFilters([], ['vegan'])
  assert.deepEqual(f?.tag_groups, [['vegan']])
})

test('G-112: Ausschluss und Auswahl stehen nebeneinander', () => {
  const f = buildFoodSearchFilters(['laktose'], ['vegan'])
  assert.deepEqual(f?.exclude_tag_codes, ['laktose'])
  assert.deepEqual(f?.tag_groups, [['vegan']])
})

test('G-112: ohne Auswahl bleibt es null (G-133)', () => {
  assert.equal(buildFoodSearchFilters([], []), null)
  assert.equal(buildFoodSearchFilters(), null)
})

test('G-112: doppelte Tags erzeugen nicht zweimal dieselbe Bedingung', () => {
  const f = buildFoodSearchFilters([], ['vegan', 'vegan', ' vegan '])
  assert.deepEqual(f?.tag_groups, [['vegan']])
})

// ── Die Oberflaeche haelt sich daran ─────────────────────────────

const ohneKommentare = (f: string) => fs.readFileSync(path.join(process.cwd(), f), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

test('G-70: die Oberflaeche kennt alle zehn Sortierungen', () => {
  const s = ohneKommentare('src/app/v2/nutrition/tab-foods.tsx')
  assert.match(s, /from '\.\.\/\.\.\/\.\.\/lib\/nutrition\/food-sortierung'/,
    'Der Reiter benutzt die Sortierlogik nicht (G-70).')
  assert.match(s, /sortiereSeite\(/,
    'Die Seitensortierung wird nicht angewandt (G-70).')
  assert.match(s, /serverSort\(/,
    'An die Datenbank geht die rohe Sortierung (G-70).')
})

test('G-70: die Oberflaeche fuehrt keine eigene Sortierliste mehr', () => {
  // `[read]` Zwei Listen laufen auseinander — dieselbe Begruendung
  // wie bei der Naht (G-122).
  const s = ohneKommentare('src/app/v2/nutrition/tab-foods.tsx')
  assert.doesNotMatch(s, /type Sortierung =\s*'relevance'/,
    'Der Reiter haelt eine zweite Sortierliste (G-70).')
})

test('G-112: der Filter haelt mehrere Tags', () => {
  const s = ohneKommentare('src/app/v2/nutrition/tab-foods.tsx')
  assert.doesNotMatch(s, /useState<string \| null>\(null\)[\s\S]{0,40}\/\/ tag/,
    'Der Tag-Zustand ist noch einwertig (G-112).')
  assert.match(s, /Set<string>|string\[\]/,
    'Der Filterzustand traegt keine Mehrfachauswahl (G-112).')
})
