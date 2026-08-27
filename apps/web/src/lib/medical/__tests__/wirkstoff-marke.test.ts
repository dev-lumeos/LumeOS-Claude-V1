// G-210: Handelsnamen — Scemblix findet Asciminib, und Concor
// schweigt nicht.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  markeTrifft, passendeMarken, herstellerZahl, entdoppelt,
  markenJeWirkstoff, MAERKTE, type Marke,
} from '../wirkstoff-marke'

// `[cmd]` **Die echten zwei Zeilen aus dem Bestand**, gemessen
// 2026-08-27 — nicht erfunden.
const SCEMBLIX: Marke[] = [
  { name: 'Scemblix', hersteller: 'Novartis',
    maerkte: ['TH', 'US', 'EU', 'UK', 'CA', 'AU'] },
  { name: 'Scemblix', hersteller: 'NOVARTIS PHARMACEUTICALS CANADA INC',
    maerkte: ['CA'] },
]

// ── Der Fall, mit dem alles anfing ───────────────────────────────

test('G-210: „Scemblix" trifft die Marke', () => {
  assert.equal(markeTrifft(SCEMBLIX[0], 'Scemblix'), true)
})

test('G-210: Gross- und Kleinschreibung ist egal', () => {
  // `[read]` **Tom tippt nicht mit Grossbuchstaben.** Und der Bestand
  // schreibt selbst uneinheitlich: `ALPHAGAN P`, `allergy relief`,
  // `B. AMOX` — `[cmd]` `Effexor XR` steht sogar zweimal, als
  // `Effexor XR` und `Effexor Xr`.
  for (const wort of ['scemblix', 'SCEMBLIX', 'ScEmBlIx']) {
    assert.equal(markeTrifft(SCEMBLIX[0], wort), true, wort)
  }
})

test('G-210: ein Teilwort trifft', () => {
  assert.equal(markeTrifft(SCEMBLIX[0], 'scem'), true)
})

test('G-210: ein leeres Wort trifft nichts', () => {
  // `[read]` Sonst waere jede Marke bei leerer Suche ein „Treffer"
  // und die Begruendungszeile stuende unter allen 498 Zeilen.
  assert.equal(markeTrifft(SCEMBLIX[0], ''), false)
  assert.equal(markeTrifft(SCEMBLIX[0], '   '), false)
})

test('G-210: eine fremde Marke trifft nicht', () => {
  assert.equal(markeTrifft(SCEMBLIX[0], 'Concor'), false)
})

// ── Ein Wirkstoff steht einmal, auch bei zwei Produkten ──────────

test('G-210: zwei Produktzeilen ergeben EINE Begruendung', () => {
  // **Auftrag: *„Eine Marke kann mehrfach vorkommen — Scemblix
  // zweimal, mit verschiedenen Herstellerschreibweisen. Ein Wirkstoff
  // darf in der Ergebnisliste trotzdem nur einmal stehen."***
  const m = passendeMarken(SCEMBLIX, 'Scemblix')
  assert.equal(m.length, 1)
  assert.equal(m[0].name, 'Scemblix')
})

test('G-210: die Zahl der Hersteller bleibt sichtbar', () => {
  // `[read]` **Entdoppelt heisst nicht verschwiegen.** Die zweite
  // Zeile existiert; sie wird gezaehlt statt wiederholt.
  assert.equal(herstellerZahl(SCEMBLIX, 'Scemblix'), 2)
})

test('G-210: verschiedene Marken desselben Wirkstoffs bleiben beide', () => {
  // `[cmd]` **Atorvastatin traegt fuenf Marken** (Lipitor, ATORVIN 40,
  // LIPITOR 80 MG …). `[read]` Wer „lipitor" sucht, soll beide
  // Lipitor-Schreibweisen als Begruendung sehen — es sind zwei
  // verschiedene Namen, nicht zwei Zeilen desselben.
  const atorva: Marke[] = [
    { name: 'Lipitor', hersteller: 'Pfizer', maerkte: ['US'] },
    { name: 'LIPITOR 80 MG', hersteller: 'Pfizer TH', maerkte: ['TH'] },
    { name: 'ATORVIN 40', hersteller: 'Berlin Pharm', maerkte: ['TH'] },
  ]
  assert.equal(passendeMarken(atorva, 'lipitor').length, 2)
  assert.equal(passendeMarken(atorva, 'atorvin').length, 1)
})

test('G-210: ein Wirkstoff erscheint in der Liste einmal', () => {
  const treffer = [{ id: 'a' }, { id: 'b' }, { id: 'a' }, { id: 'c' }]
  assert.deepEqual(entdoppelt(treffer).map(t => t.id), ['a', 'b', 'c'])
})

test('G-210: die Entdoppelung behaelt die Reihenfolge', () => {
  const treffer = [{ id: 'z' }, { id: 'a' }, { id: 'z' }]
  assert.deepEqual(entdoppelt(treffer).map(t => t.id), ['z', 'a'])
})

// ── Was NICHT geschehen darf ─────────────────────────────────────

test('G-210: eine Marke ohne Hersteller stuerzt nicht ab', () => {
  // `[cmd]` Heute ist `manufacturer` bei allen 448 gefuellt — **das
  // ist ein Datenstand, keine Zusage.**
  const ohne: Marke[] = [{ name: 'Testonym', hersteller: null, maerkte: [] }]
  assert.equal(herstellerZahl(ohne, 'Testonym'), 0)
  assert.equal(passendeMarken(ohne, 'testonym').length, 1)
})

test('G-210: aus dem Wirkstoffnamen wird KEINE Marke abgeleitet', () => {
  // `[read]` **Auftrag: *„Keine Marken erfinden, ableiten oder aus dem
  // Wirkstoffnamen erzeugen — das waere dieselbe Klasse Fehler wie
  // `b?.abbr ?? m`, nur schlimmer."***
  //
  // **Dieser Test bewacht eine Abwesenheit:** eine leere Markenliste
  // bleibt leer. Wer je einen Rueckfall auf den Wirkstoffnamen
  // einbaut, faellt hier auf.
  assert.deepEqual(passendeMarken([], 'Asciminib'), [])
  assert.equal(herstellerZahl([], 'Asciminib'), 0)
})

// ── NEGATIVPROBE: die Kette reisst ───────────────────────────────
//
// **Auftrag: *„einer Marke testweise die `formulation_id` entziehen —
// der Treffer muss verschwinden oder sich als unaufloesbar zeigen,
// nicht auf einen falschen Wirkstoff fallen."***
//
// `[cmd]` **Am laufenden System liess sich das NICHT herstellen:**
// `formulation_id` ist `NOT NULL` und traegt den Fremdschluessel
// `medication_products_formulation_id_fkey`. Beide Eingriffe wurden
// von der Datenbank abgewiesen; **0 von 448 Produkten sind
// unaufloesbar, und die Zahl kann keine andere sein.**
//
// `[read]` **Deshalb hier**, wo der Fall konstruierbar ist. Die
// Aussage, um die es geht, braucht keine Datenbank.

const FORM_KARTE = new Map([['medform_ok', 'drug_asciminib']])

test('G-210 Negativprobe: ohne `formulation_id` faellt die Marke weg', () => {
  const { marken, unaufloesbar } = markenJeWirkstoff([
    { formulation_id: null, brand_name: 'Scemblix',
      manufacturer: 'Novartis', jurisdictions: ['US'] },
  ], FORM_KARTE)

  assert.equal(marken.size, 0, 'Die Marke haengt an keinem Wirkstoff.')
  assert.deepEqual(unaufloesbar,
    [{ marke: 'Scemblix', grund: 'ohne_formulierung' }])
})

test('G-210 Negativprobe: eine unbekannte Formulierung faellt weg', () => {
  const { marken, unaufloesbar } = markenJeWirkstoff([
    { formulation_id: 'medform_GIBTESNICHT', brand_name: 'Scemblix',
      manufacturer: 'Novartis', jurisdictions: ['US'] },
  ], FORM_KARTE)

  assert.equal(marken.size, 0)
  assert.deepEqual(unaufloesbar,
    [{ marke: 'Scemblix', grund: 'formulierung_unbekannt' }])
})

test('G-210 Negativprobe: sie faellt NICHT auf einen fremden Wirkstoff', () => {
  // `[read]` **Das ist der Kern.** Eine kaputte Zeile neben einer
  // heilen darf nicht deren Wirkstoff erben — **ein falscher
  // Handelsname fuehrt zum falschen Praeparat.** Das waere
  // `b?.abbr ?? m` (G-207) mit einem Medikament.
  const karte = new Map([
    ['medform_ok', 'drug_asciminib'],
    ['medform_zwei', 'drug_imatinib'],
  ])
  const { marken, unaufloesbar } = markenJeWirkstoff([
    { formulation_id: 'medform_ok', brand_name: 'Scemblix',
      manufacturer: 'Novartis', jurisdictions: ['US'] },
    { formulation_id: 'medform_KAPUTT', brand_name: 'Glivec',
      manufacturer: 'Novartis', jurisdictions: ['US'] },
  ], karte)

  assert.deepEqual(marken.get('drug_asciminib')?.map(m => m.name), ['Scemblix'])
  // Glivec taucht NIRGENDS als Marke auf — bei keinem der beiden.
  // `[read]` `forEach` statt `for…of`: das TS-Ziel dieses Pakets
  // erlaubt kein Durchlaufen einer Map (dieselbe Grenze wie in G-200).
  const alleNamen: string[] = []
  marken.forEach(liste => liste.forEach(m => alleNamen.push(m.name)))
  assert.ok(!alleNamen.includes('Glivec'),
    'Eine unaufloesbare Marke ist einem Wirkstoff zugeordnet worden.')
  assert.equal(unaufloesbar.length, 1)
  assert.equal(unaufloesbar[0].marke, 'Glivec')
})

test('G-210: eine heile Kette loest auf', () => {
  // Die Gegenprobe zur Negativprobe: ohne sie belegt sie nur, dass
  // nichts ankommt.
  const { marken, unaufloesbar } = markenJeWirkstoff([
    { formulation_id: 'medform_ok', brand_name: 'Scemblix',
      manufacturer: 'Novartis', jurisdictions: ['TH', 'US'] },
  ], FORM_KARTE)

  assert.deepEqual(unaufloesbar, [])
  const m = marken.get('drug_asciminib')
  assert.equal(m?.length, 1)
  assert.equal(m?.[0].name, 'Scemblix')
  assert.deepEqual(m?.[0].maerkte, ['TH', 'US'])
})

test('G-210: ein Produkt ohne Markennamen wird still uebergangen', () => {
  // `[read]` **Kein Befund**, im Unterschied zur gerissenen Kette:
  // ein Produkt ohne `brand_name` traegt keine Information, die
  // verlorengehen koennte. `[cmd]` Heute ist `brand_name` bei allen
  // 448 gefuellt.
  const { marken, unaufloesbar } = markenJeWirkstoff([
    { formulation_id: 'medform_ok', brand_name: '   ',
      manufacturer: 'X', jurisdictions: [] },
  ], FORM_KARTE)
  assert.equal(marken.size, 0)
  assert.deepEqual(unaufloesbar, [])
})

// ── Das Leerergebnis ─────────────────────────────────────────────

test('G-210: die Maerkte sind gemessen und DE fehlt darin', () => {
  // `[cmd]` **Gemessen 2026-08-27 ueber `unnest(jurisdictions)`:**
  // US 380 · CA 92 · TH 62 · UK 60 · AU 58 · EU 56. **DE steht bei
  // null** — `'DE' = any(jurisdictions)` trifft kein einziges Produkt.
  //
  // `[read]` **Deshalb findet Tom Concor nicht** — und deshalb darf
  // das Leerergebnis nicht schweigen.
  assert.equal(MAERKTE.length, 6)
  assert.deepEqual(MAERKTE.map(m => m.markt),
    ['US', 'CA', 'TH', 'UK', 'AU', 'EU'])
  assert.equal(MAERKTE.find(m => m.markt === 'DE'), undefined)
  assert.equal(MAERKTE[0].marken, 380)
})

// ── Die Verdrahtung ──────────────────────────────────────────────

const roh = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

test('G-210: der Leseweg liest Produkte und Formulierungen', () => {
  // `[read]` **Neunter Fall derselben Pruefung** (G-184/186/187/191/
  // 196/199/207/208): eine Funktion, die niemand aufruft, besteht
  // jeden Funktionstest. `[cmd]` Und `tools/verdrahtung-pruefen.mjs`
  // meldet neue Tabellennamen von sich aus.
  const lesen = roh('src/lib/medical/wirkstoff-read.ts')
  for (const t of ['medication_products', 'medication_formulations']) {
    assert.ok(new RegExp(`\\.from\\('${t}'\\)`).test(lesen),
      `Der Leseweg liest \`${t}\` nicht (G-210).`)
  }
  assert.match(lesen, /brand_name/,
    'Der Leseweg holt den Handelsnamen nicht (G-210).')
})

test('G-210: die Suche durchsucht die Marken', () => {
  const tab = roh('src/app/v2/medical/tab-wirkstoffe.tsx')
  assert.match(tab, /z\.marken\.some/,
    'Die Suche sieht die Handelsnamen nicht an (G-210).')
  assert.match(tab, /passendeMarken\(/,
    'Die Trefferzeile nennt die Marke nicht (G-210).')
  assert.match(tab, /MAERKTE/,
    'Das Leerergebnis nennt die Maerkte nicht (G-210).')
})

test('G-210: der Leseweg benutzt die gepruefte Aufloesung', () => {
  // `[read]` **Die Regel wohnt in `wirkstoff-marke.ts`** — dort ist
  // sie ohne Datenbank pruefbar (siehe Negativprobe oben). **Dieser
  // Test haelt fest, dass der Leseweg sie auch aufruft**, statt
  // daneben eine zweite, ungeprueft Fassung zu fuehren.
  const lesen = roh('src/lib/medical/wirkstoff-read.ts')
  assert.match(lesen, /markenJeWirkstoff\(/,
    'Der Leseweg loest die Marken nicht ueber die geprueft Funktion auf (G-210).')
  assert.match(lesen, /unaufloesbar/,
    'Der Leseweg nimmt die unaufloesbaren Produkte nicht entgegen (G-210).')
})
