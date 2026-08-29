// G-246: die Erklaertexte und ihre drei Zustaende.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  erklaerlageVon, ohneEintragSatz, istEinzelfettsaeure,
  ueberdosisLageVon, UEBERDOSIS_SATZ,
  athletWertEigen, ATHLET_GLEICH_SATZ, KACHEL_ORDNUNG,
} from '../erklaertext-lage'
import type { Erklaertext } from '../reference-assessment-read'

const text = (p: Partial<Erklaertext> = {}): Erklaertext => ({
  nutrient_code: 'VITA', funktion: 'Sicht, Immunsystem, Haut',
  beiMangel: 'Nachtblindheit', beiUeberschuss: 'Kopfschmerzen',
  quellen: ['Leber', 'Karotten'], rdaStandard: '900μg (M), 700μg (F)',
  rdaAthlet: 'Standard', obergrenze: '3000μg',
  wechselwirkungen: null, tipp: null, detail: null,
  quelle: 'Vorgaengerrepo nutrientDetails.ts', ...p,
})

// ── Zustand 1: kein Detailtext ───────────────────────────────────

test('G-246: ohne Zeile ist der Zustand „kein Eintrag", nicht leer', () => {
  // `[cmd]` 28 der 138 Naehrstoffe haben keine Zeile — gemessen
  // 2026-08-29, Bestand nutzerunabhaengig.
  assert.equal(erklaerlageVon(undefined), 'kein_eintrag')
  assert.equal(erklaerlageVon(text()), 'text_da')
})

test('G-246: Einzelfettsaeuren werden am Muster erkannt, nicht an einer Liste', () => {
  // `[cmd]` Die 27 Codes folgen alle `F<Zahl>`: F4:0, F18:1CN9,
  // F22:5CN3. `[read]` Eine Liste veraltet beim naechsten Import.
  for (const c of ['F10:0', 'F18:1CN9', 'F22:5CN3', 'F4:0', 'F24:0']) {
    assert.equal(istEinzelfettsaeure(c), true, c)
  }
  for (const c of ['FD', 'FOLAC', 'VITA', 'FE', 'OLSAC', 'FASAT']) {
    assert.equal(istEinzelfettsaeure(c), false, c)
  }
})

test('G-246: der Satz sagt WARUM, nicht nur DASS etwas fehlt', () => {
  const fs_ = ohneEintragSatz('F18:1CN9')
  assert.match(fs_, /Bestandteil des Fettprofils/)
  assert.match(fs_, /nicht als Nährstoff mit eigenem Bedarf/)

  const andere = ohneEintragSatz('OLSAC')
  assert.match(andere, /keine Aussage über seine Bedeutung/,
    'Ohne diesen Zusatz liest sich das Fehlen als Urteil (G-246).')
  assert.notEqual(fs_, andere)
})

// ── Zustand 2: kein Ueberdosierungstext ──────────────────────────

test('G-246: die Probe fuer excess_de ist das UL, nicht der Text', () => {
  // `[cmd]` **Der Kern der zweiten Messfrage.** 17 Naehrstoffe
  // fuehren ein UL, 15 davon haben `excess_de` — zwei fehlen (FD,
  // FOLAC). `[read]` Wer nur auf `excess_de === null` prueft, meldet
  // 69 Luecken statt zwei.
  assert.equal(ueberdosisLageVon('Kopfschmerzen', true), 'text_da')
  assert.equal(ueberdosisLageVon(null, true), 'text_fehlt')
  assert.equal(ueberdosisLageVon(null, false), 'keine_obergrenze')
})

test('G-246: „keine Obergrenze" ist nicht „unbedenklich"', () => {
  // `[read]` Der haeufigste Fehlschluss: kein UL heisst nicht,
  // dass beliebig viel geht.
  assert.match(UEBERDOSIS_SATZ.keine_obergrenze, /nicht, dass beliebig viel/)
  assert.match(UEBERDOSIS_SATZ.text_fehlt, /Zahl steht oben/,
    'Wo die Obergrenze steht, gehoert in den Satz (G-246).')
  assert.notEqual(UEBERDOSIS_SATZ.keine_obergrenze, UEBERDOSIS_SATZ.text_fehlt)
})

// ── Der Sportlerwert ─────────────────────────────────────────────

test('G-246: „Standard" ist kein zweiter Wert', () => {
  // `[cmd]` `rda_athlete_text` steht bei allen 110 Zeilen, oft als
  // `Standard`. `[read]` Ihn danebenzustellen wie eine eigene
  // Empfehlung waere irrefuehrend.
  assert.equal(athletWertEigen('Standard', '900μg (M), 700μg (F)'), false)
  assert.equal(athletWertEigen('n/a', 'n/a'), false)
  assert.equal(athletWertEigen(null, '16mg'), false)
  // Niacin: echter zweiter Wert.
  assert.equal(athletWertEigen('20mg', '16mg (M), 14mg (F)'), true)
})

test('G-246: ein gleicher Wert wird als solcher benannt', () => {
  assert.match(ATHLET_GLEICH_SATZ, /derselbe Wert/)
})

// ── Die Ordnung ──────────────────────────────────────────────────

test('G-246: die Funktion steht vor den Warnungen', () => {
  // `[cmd]` Uebernommen aus dem Mockup
  // (`module-nutrition-nutrients.jsx:780-800`). `[read]` Wer
  // aufklappt, will zuerst wissen, wofuer der Naehrstoff gut ist.
  const i = (k: string) => KACHEL_ORDNUNG.indexOf(k as never)
  assert.ok(i('funktion') < i('mangel_ueberschuss'))
  assert.ok(i('mangel_ueberschuss') < i('quellen'))
  assert.ok(i('beleg') === KACHEL_ORDNUNG.length - 1,
    'Der Beleg steht zuletzt (G-246).')
})

// ── Die Anzeige haelt sich daran ─────────────────────────────────

const ohneKommentare = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

test('G-246: die Anzeige nutzt alle geforderten Felder', () => {
  // `[read]` **`rdaAthlet` besonders** — der Auftrag nennt ihn
  // ausdruecklich: „der Teil, den ein Sportler sucht. Nicht
  // weglassen."
  const s = ohneKommentare('src/app/v2/nutrition/mikro-ansicht.tsx')
  for (const feld of ['funktion', 'beiMangel', 'beiUeberschuss', 'quellen',
    'rdaStandard', 'rdaAthlet', 'obergrenze', 'wechselwirkungen',
    'tipp', 'detail', 'quelle']) {
    // `[read]` **Am Zugriff `text.<feld>` gemessen, nicht am blossen
    // Vorkommen des Wortes** — sonst genuegt eine Erwaehnung in
    // einer toten Zeile.
    assert.match(s, new RegExp(`text\\.${feld}(?![a-zA-Z])`),
      `Das Feld ${feld} wird nicht gelesen (G-246).`)
  }
})

test('G-246: der Sportlerwert wird wirklich unterschieden', () => {
  // `[read]` **Erste Fassung kam durch, als `athletEigen` auf `false`
  // festgenagelt wurde** — das Wort stand ja noch da. Geprueft wird
  // jetzt der Aufruf mit beiden Werten.
  const s = ohneKommentare('src/app/v2/nutrition/mikro-ansicht.tsx')
  assert.match(s, /athletWertEigen\(text\.rdaAthlet,\s*text\.rdaStandard\)/,
    'Der Sportlerwert wird nicht gegen den Standard geprueft (G-246).')
  assert.doesNotMatch(s, /const athletEigen = (false|true)\b/,
    'Der Sportlerwert ist festgenagelt (G-246).')
})

test('G-246: die Anzeige schreibt keine Texte', () => {
  // `[read]` Auftrag: „Keine Texte schreiben oder ergaenzen. Was
  // fehlt, wird gemeldet, nicht gefuellt."
  const s = ohneKommentare('src/lib/nutrition/erklaertext-lage.ts')
  assert.doesNotMatch(s, /\.(insert|update|upsert)\(/,
    'Die Lage-Datei schreibt (G-246).')
})

test('G-246: nur die deutschen Felder werden gelesen', () => {
  // `[read]` Auftrag: „Die drei Sprachen nicht vermischen — `_de`
  // ist die Anzeige, `_en`/`_th` bleiben liegen."
  const s = ohneKommentare('src/lib/nutrition/reference-assessment-read.ts')
  const select = /from\('nutrient_details'\)\s*\.select\(([\s\S]*?)\)/.exec(s)
  assert.ok(select, 'Kein select auf nutrient_details gefunden (G-246).')
  assert.doesNotMatch(select[1], /_en\b|_th\b/,
    'Die Abfrage laedt englische oder thailaendische Felder (G-246).')
})
