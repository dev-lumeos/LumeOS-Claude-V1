// G-464 — die Tafel fragte die falsche Spalte.
//
// ══ TOMS BEFUND ═════════════════════════════════════════════════════
//
// **Am Schirm, 2026-09-08:**
//
//     Calcium 1440 mg    ohne „auswertbar"
//     Vitamin C 65 mg    ohne
//     Iron 5.3 mg        ohne
//     Zinc 18 mg         ohne
//     Thiamin 5.1 mg     auswertbar
//     Biotin 300 mcg     auswertbar
//
// `[cmd]` **Gemessen:** `Calcium` hat das gueltige Mapping `CA` und
// galt trotzdem als *nicht im Katalog* — **die Marke hing an
// `supplement_id` ALLEIN.**
//
// ══ WAS HIER BEWACHT WIRD ═══════════════════════════════════════════
//
//     1  die Marke haengt an BEIDEM
//     2  die Gruppe kommt aus der Einstufung, nicht der Kategorie
//     3  der Rueckfall bleibt, wenn C-505 fehlt
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  buendelFuer, buendelFuerZeile, etikettBuendel,
} from '../../../../lib/supplements/produkt-etikett'
import type { InhaltsZeile } from '../../../../lib/supplements/produkte-read'

const WEB = process.cwd()
const lies = (p: string) => fs.readFileSync(path.join(WEB, 'src', p), 'utf8')

/**
 * Kommentare weg, bevor gesucht wird.
 *
 * `[cmd]` **G-455/G-166:** eine Probe fand ihren eigenen Erklaertext
 * und blieb gruen, obwohl die Sache fehlte.
 */
function ohneKommentare(q: string): string {
  return q.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
}

function z(x: Partial<InhaltsZeile> & { id: string }): InhaltsZeile {
  return {
    ingredient_name: x.id,
    ingredient_category: null,
    amount_per_serving: null,
    unit: null,
    amount_qualifier: 'not_stated',
    blend_id: null,
    reihenfolge: null,
    ist_wirkstoff: true,
    bekannt: false,
    content_class: null,
    ...x,
  }
}

// ══ 1 — die Einstufung entscheidet ueber die Gruppe ═════════════════

test('A1: ein Naehrwert steht bei den Naehrwerten, egal welche Kategorie', () => {
  // **Toms Befund:** *„Vitamin A, Calcium, Iron stehen unter
  // WIRKSTOFFE. Das sind Naehrwerte."*
  //
  // `[cmd]` **Gemessen an `Serious Mass Vanilla` (2026-09-17): 40 von
  // 85 Zeilen tragen `vitamin` oder `mineral` und sind nach C-505
  // `naehrwert`.**
  for (const kat of ['vitamin', 'mineral']) {
    assert.equal(
      buendelFuerZeile({ ingredient_category: kat, content_class: 'naehrwert' }),
      'naehrwerte',
      `${kat} als Naehrwert landet nicht bei den Naehrwerten.`)
    // `[read]` **Die Gegenrichtung gehoert dazu:** dieselbe Kategorie
    // mit einer anderen Einstufung muss woanders landen — sonst
    // pruefte die Probe nur die Kategorie.
    assert.equal(
      buendelFuerZeile({ ingredient_category: kat, content_class: 'wirkstoff' }),
      'wirkstoffe',
      `${kat} als Wirkstoff landet nicht bei den Wirkstoffen.`)
  }
})

test('A2: ohne Einstufung gilt die Kategorie — der Rueckfall', () => {
  // `[read]` **Faellt die Sicht aus, gruppiert die Tafel wie vor
  // G-464.** `[cmd]` **Besser als eine Zeile, die verschwindet** —
  // und `kandidat` bekommt bewusst KEIN eigenes Buendel, weil der
  // Auftrag vier Ueberschriften nennt.
  assert.equal(
    buendelFuerZeile({ ingredient_category: 'vitamin', content_class: null }),
    buendelFuer('vitamin'))
  assert.equal(
    buendelFuerZeile({ ingredient_category: 'mineral', content_class: 'kandidat' }),
    buendelFuer('mineral'))
  assert.equal(
    buendelFuerZeile({ ingredient_category: 'fat', content_class: null }),
    'naehrwerte')
})

test('A3: Hilfsstoffe bleiben Hilfsstoffe', () => {
  // `[cmd]` **C-505: `NOT ist_wirkstoff` -> `hilfsstoff`.** Gemessen
  // am Beispielprodukt: 7 Zeilen, alle `other ingredient`.
  assert.equal(
    buendelFuerZeile({ ingredient_category: 'amino acid', content_class: 'hilfsstoff' }),
    'hilfsstoffe',
    'Ein Hilfsstoff wandert nach seiner Kategorie — dann steht '
    + 'Lecithin zwischen den Wirkstoffen.')
})

test('A4: Toms sechs Zutaten landen dort, wo sie hingehoeren', () => {
  // `[cmd]` **Die Einstufungen sind gemessen** (C-505, 2026-09-17,
  // `Serious Mass Vanilla`):
  //
  //     Calcium    mineral  CA      -> naehrwert
  //     Vitamin C  vitamin  VITC    -> naehrwert
  //     Iron       mineral  FE      -> naehrwert
  //     Zinc       mineral  ZN      -> naehrwert
  //     Biotin     vitamin  (kein)  -> wirkstoff
  const zeilen = etikettBuendel([
    z({ id: 'Total Fat', ingredient_category: 'fat', content_class: 'naehrwert', reihenfolge: 1 }),
    z({ id: 'Calcium', ingredient_category: 'mineral', content_class: 'naehrwert', reihenfolge: 2 }),
    z({ id: 'Vitamin C', ingredient_category: 'vitamin', content_class: 'naehrwert', reihenfolge: 3 }),
    z({ id: 'Biotin', ingredient_category: 'vitamin', content_class: 'wirkstoff', reihenfolge: 4 }),
    z({ id: 'Lecithin', ingredient_category: 'other ingredient', content_class: 'hilfsstoff', reihenfolge: 5 }),
  ])
  const gruppeVon = (name: string) =>
    zeilen.find(b => b.zeilen.some(x => x.ingredient_name === name))?.id

  assert.equal(gruppeVon('Calcium'), 'naehrwerte',
    'Calcium steht nicht bei den Naehrwerten — genau Toms Befund.')
  assert.equal(gruppeVon('Vitamin C'), 'naehrwerte')
  assert.equal(gruppeVon('Total Fat'), 'naehrwerte',
    'Total Fat und Calcium muessen in DERSELBEN Gruppe stehen.')
  assert.equal(gruppeVon('Biotin'), 'wirkstoffe',
    'Biotin ist ueber supplement_id auswertbar, nicht als Naehrwert.')
  assert.equal(gruppeVon('Lecithin'), 'hilfsstoffe')
})

test('A5: eine Mischung wird NICHT zerrissen (G-453 bleibt)', () => {
  // `[read]` **Die Einstufung darf die Mischungsregel nicht
  // aushebeln** — ein Kind folgt seinem Kopf, auch wenn C-505 es
  // anders einstuft.
  // `[cmd]` **Der Kopf traegt hier NICHT die Kategorie `blend`.**
  // Ein erster Entwurf gab ihm `blend`, und damit landete er auch
  // ohne die Mischungsregel bei den Mischungen (ueber
  // `buendelFuer('blend')`) — **die Sabotage blieb gruen, die Probe
  // war blind.** `[read]` **So entscheidet allein `istMischung`.**
  const b = etikettBuendel([
    z({ id: 'kopf', ingredient_category: 'amino acid', reihenfolge: 1 }),
    z({ id: 'kind', blend_id: 'kopf', content_class: 'naehrwert', reihenfolge: 2 }),
  ])
  const mischung = b.find(x => x.id === 'mischungen')
  assert.ok(mischung, 'Keine Mischung gebildet — `istMischung` wirkt nicht.')
  assert.equal(mischung!.zeilen.length, 2,
    'Das Kind wurde nach seiner Einstufung einsortiert — die '
    + 'Mischung ist auseinandergerissen (die Lehre aus G-453).')
  // `[read]` **Und das Kind steht NICHT bei den Naehrwerten**, obwohl
  // seine Einstufung das saegte.
  assert.ok(!b.some(x => x.id === 'naehrwerte'
    && x.zeilen.some(y => y.ingredient_name === 'kind')),
    'Das Kind folgt seiner Einstufung statt seinem Kopf.')
})

// ══ 2 — der Leseweg fragt beide Spalten ═════════════════════════════

test('A6: die Marke haengt an supplement_id ODER nutrient_code', () => {
  // ══ DER GEMESSENE GRUND ══════════════════════════════════════════
  //
  // `[cmd]` **Hier stand `s(r.supplement_id) !== null` allein.**
  // **Gemessen an `Serious Mass Vanilla` (85 Zeilen):**
  //
  //     nur supplement_id            22 markiert
  //     supplement_id ODER nutrient  62 markiert
  //
  // `[read]` **Es sind zwei Wege, dieselbe Zeile auszuwerten** — als
  // Wirkstoff oder als Naehrwert.
  const q = ohneKommentare(lies('lib/supplements/produkte-read.ts'))
  assert.match(q, /bekannt:\s*s\(r\.supplement_id\)\s*!==\s*null[\s\S]{0,120}?nutrient_code/,
    'Die Marke fragt `nutrient_code` nicht — dann bleibt Calcium '
    + 'unmarkiert, obwohl es das Mapping CA hat.')
})

test('A7: das Etikett wird aus C-505 gelesen, nicht aus der Rohtabelle', () => {
  // `[cmd]` **`supplements.supplier_product_content_catalog`** traegt
  // `nutrient_code` und `content_class`; `product_contents` traegt
  // beides NICHT. `[read]` **Ohne die Sicht liesse sich die Marke
  // nicht an beide Spalten haengen** — man muesste die Einstufung
  // nachrechnen, und das waere die verbotene zweite Fassung.
  const q = ohneKommentare(lies('lib/supplements/produkte-read.ts'))
  assert.match(q, /from\('supplier_product_content_catalog'\)/,
    'Die Sicht aus C-505 wird nicht gelesen.')
  assert.match(q, /content_class/,
    'Die Einstufung wird nicht mitgelesen.')

  // `[read]` **Und die Einstufung wird NICHT nachgerechnet** — kein
  // `dsld_name`, kein eigenes CASE ueber `ist_wirkstoff`.
  assert.doesNotMatch(q, /dsld_name/,
    'Die Einstufung wird hier nachgebaut — C-505 liefert sie.')
})

test('A8: blend_id kommt weiter aus product_contents', () => {
  // `[cmd]` **Die Sicht traegt KEIN `blend_id` und keine
  // `reihenfolge`** (gemessen 2026-09-17 an der Migration) — **ohne
  // die Tabelle verloere das Etikett seine Ordnung und die
  // Einrueckung der Mischungen.**
  const q = ohneKommentare(lies('lib/supplements/produkte-read.ts'))
  assert.match(q, /from\('product_contents'\)[\s\S]{0,160}?blend_id/,
    'Die Einrueckung wird nicht mehr gelesen.')
})

test('A9: eine unbekannte Klasse wird null, nicht geraten', async () => {
  // `[read]` **Kaeme eine fuenfte Klasse dazu, gruppierte die Tafel
  // wie vor G-464** — sichtbar alt ist besser als stumm falsch.
  // `[cmd]` **Ein erster Entwurf suchte nur die vier Woerter im
  // Quelltext** — und eine Sabotage, die den Wert per `as` einfach
  // durchreichte, blieb gruen. **Die Probe las die Namen, nicht die
  // Wirkung.**
  //
  // `[read]` **Jetzt wird die Funktion GERUFEN** — ueber den
  // Leseweg, der sie benutzt.
  const { pruefeKlasse } = await import(
    '../../../../lib/supplements/produkte-read')
  assert.equal(pruefeKlasse('naehrwert'), 'naehrwert')
  assert.equal(pruefeKlasse('kandidat'), 'kandidat')
  // Die Sache: was NICHT zu den vieren gehoert, wird `null`.
  assert.equal(pruefeKlasse('mikronaehrstoff'), null,
    'Eine unbekannte Klasse wird durchgereicht — dann gruppiert die '
    + 'Tafel nach einem Wort, das sie nicht kennt.')
  assert.equal(pruefeKlasse(null), null)
  assert.equal(pruefeKlasse(42), null)
})

// ══ 3 — die Kontrollprobe ═══════════════════════════════════════════

test('A10: KONTROLLE — das blosse Wort macht keine Probe rot', () => {
  // `[read]` **Ohne sie misst die Reihe nur, dass jemand die Datei
  // angefasst hat** (Lehre aus G-460).
  assert.ok(ohneKommentare('// nutrient_code\ncode').indexOf('nutrient_code') === -1,
    'ohneKommentare entfernt Zeilenkommentare nicht — dann finden '
    + 'die Proben ihre eigenen Erklaertexte.')
  assert.ok(ohneKommentare('/* dsld_name */\ncode').indexOf('dsld_name') === -1,
    'ohneKommentare entfernt Blockkommentare nicht.')
  // Und die Gruppierung bleibt von einem blossen Wort unberuehrt.
  assert.equal(buendelFuer('vitamin'), 'wirkstoffe',
    'buendelFuer selbst darf sich NICHT geaendert haben — es ist '
    + 'der Rueckfall, und G-464 aendert nur, wer ihn fragt.')
})
