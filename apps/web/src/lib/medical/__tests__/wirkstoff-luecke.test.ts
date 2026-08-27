// G-208: der Unterschied zwischen „begruendet leer" und „nicht
// bearbeitet" — und dass er nicht wieder verschwindet.
//
// `[read]` **Diese Datei bewacht genau die Regel, wegen der der
// Auftrag entstand.** Wer `feld()` so aendert, dass eine Begruendung
// verlorengeht, faellt hier auf — nicht erst auf einem Bildschirmfoto.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  feld, textFeld, grundAus, textGrundAus, grundText, atcCodes,
  zaehleZustaende, NICHT_BEARBEITET, GRUND_TEXT, istKurz, KURZ_GRENZE,
} from '../wirkstoff-luecke'
import { wirkstoffReiter, ersterWirkstoffReiter } from '../wirkstoff-reiter'

// ── Die drei Zustaende ───────────────────────────────────────────

test('G-208: ein Wert ist ein Wert', () => {
  const f = feld('cas', 'CAS-Nummer', '657-24-9', null)
  assert.equal(f.zustand, 'wert')
  assert.equal(f.wert, '657-24-9')
  assert.equal(f.grund, null)
})

test('G-208: ein Wert schlaegt eine Begruendung', () => {
  // `[read]` Steht beides da, gilt der Wert — sonst verdeckt ein
  // liegengebliebener `missing_reason` einen echten Inhalt.
  const f = feld('cas', 'CAS-Nummer', '657-24-9', 'MIXTURE_NO_SINGLE_CAS')
  assert.equal(f.zustand, 'wert')
})

test('G-208: BEGRUENDET leer ist NICHT dasselbe wie leer', () => {
  const mischpraeparat = feld('cas', 'CAS-Nummer', null, 'MIXTURE_NO_SINGLE_CAS')
  const unbearbeitet = feld('vorsicht', 'Vorsichtsmassnahmen', null, null)

  assert.equal(mischpraeparat.zustand, 'begruendet_leer')
  assert.equal(unbearbeitet.zustand, 'nicht_bearbeitet')
  assert.notEqual(mischpraeparat.zustand, unbearbeitet.zustand)
})

test('G-208: der Begruendungssatz sagt, dass der Datensatz vollstaendig ist', () => {
  // `[read]` **Das ist die eigentliche Auskunft.** Bei einem
  // Mischpraeparat FEHLT keine CAS-Nummer — es GIBT keine. Ein Satz,
  // der nur „nicht vorhanden" sagt, waere wieder dieselbe Luege.
  const f = feld('cas', 'CAS-Nummer', null, 'MIXTURE_NO_SINGLE_CAS')
  assert.match(f.grundText ?? '', /vollständig/i)
  assert.match(f.grundText ?? '', /Mischpräparat/i)
})

test('G-208: der leere Zustand traegt WORTE, keinen Strich', () => {
  // `[read]` Ein Strich sieht aus wie eine Angabe (die Lehre aus
  // G-199). „Nicht recherchiert" ist eine Aussage ueber die Arbeit.
  assert.equal(NICHT_BEARBEITET, 'Nicht recherchiert')
  assert.doesNotMatch(NICHT_BEARBEITET, /^[—–-]$/)
})

test('G-208: leere Zeichenketten zaehlen nicht als Wert', () => {
  assert.equal(feld('x', 'X', '   ', null).zustand, 'nicht_bearbeitet')
  assert.equal(feld('x', 'X', '', 'NOT_FOUND_IN_SOURCES').zustand, 'begruendet_leer')
})

// ── Ein unbekannter Code darf nicht durchfallen ──────────────────

test('G-208: ein UNBEKANNTER Code bleibt „begruendet leer"', () => {
  // `[read]` **Die Lehre aus `b?.abbr ?? m` (G-207), in die andere
  // Richtung:** ein Code, den die Uebersetzungstabelle nicht kennt,
  // heisst, dass die Pipeline einen neuen Grund eingefuehrt hat.
  // **Ihn stumm auf „nicht bearbeitet" fallen zu lassen waere die
  // Luege** — ein begruendetes Feld saehe aus wie ein unbearbeitetes.
  const f = feld('x', 'X', null, 'IRGENDEIN_NEUER_CODE_2027')
  assert.equal(f.zustand, 'begruendet_leer')
  assert.equal(f.grundText, 'IRGENDEIN_NEUER_CODE_2027')
})

test('G-208: die vier gemessenen Codes haben einen deutschen Satz', () => {
  // `[cmd]` **Gemessen 2026-08-27:** mehr Codes gibt es im Bestand
  // nicht — MIXTURE_NO_SINGLE_CAS 8, BIOLOGIC_NO_CAS 1,
  // NOT_FOUND_IN_SOURCES 5, MECHANISM_UNKNOWN 3, not_supplied 155.
  for (const code of ['MIXTURE_NO_SINGLE_CAS', 'BIOLOGIC_NO_CAS',
    'NOT_FOUND_IN_SOURCES', 'MECHANISM_UNKNOWN', 'not_supplied']) {
    assert.ok(GRUND_TEXT[code], `${code} ohne Satz`)
    assert.notEqual(grundText(code), code, `${code} nicht uebersetzt`)
  }
})

// ── Die zwei Gestalten von `evidence_provenance` ─────────────────

test('G-208: `missing_reason` aus einem OBJEKT (precautions)', () => {
  const prov = { c292_precautions: { missing_reason: 'NOT_FOUND_IN_SOURCES' } }
  assert.equal(grundAus(prov, 'c292_precautions'), 'NOT_FOUND_IN_SOURCES')
})

test('G-208: `missing_reason` aus einem ARRAY (identifiers)', () => {
  // `[cmd]` **`c292_identifiers` ist bei allen 442 ein Array**,
  // gemessen 2026-08-27 — die anderen beiden sind Objekte. **Wer nur
  // eine Gestalt prueft, verliert die neun Mischpraeparate.**
  const prov = {
    c292_identifiers: [
      { cas: null, missing_reason: 'MIXTURE_NO_SINGLE_CAS' },
    ],
  }
  assert.equal(grundAus(prov, 'c292_identifiers'), 'MIXTURE_NO_SINGLE_CAS')
})

test('G-208: ein Array ohne Grund ergibt null, keinen Absturz', () => {
  const prov = { c292_identifiers: [{ cas: '657-24-9', missing_reason: null }] }
  assert.equal(grundAus(prov, 'c292_identifiers'), null)
})

test('G-208: fehlende Herkunft ergibt null', () => {
  assert.equal(grundAus(null, 'c292_precautions'), null)
  assert.equal(grundAus({}, 'c292_precautions'), null)
  assert.equal(grundAus({ anderes: {} }, 'c292_precautions'), null)
})

// ── `null_context` bei den Textfeldern ───────────────────────────

test('G-208: `reason_status` aus `null_context`', () => {
  const nk = {
    mythen_de: {
      reason_status: 'not_supplied',
      reason_basis: 'master_de_meds.jsonl has no missing_reason field',
      source_value: 'null',
    },
  }
  assert.equal(textGrundAus(nk, 'mythen_de'), 'not_supplied')
  assert.equal(textGrundAus(nk, 'zu_wenig_de'), null)
})

test('G-208: ein Textfeld ohne Wert, aber mit Kontext, ist begruendet leer', () => {
  const nk = { zu_wenig_de: { reason_status: 'not_supplied' } }
  const f = textFeld('zu_wenig', 'Bei zu wenig', null, nk, 'zu_wenig_de')
  assert.equal(f.zustand, 'begruendet_leer')
  assert.match(f.grundText ?? '', /geraten wird nicht/i)
})

test('G-208: ohne Kontext bleibt es unbearbeitet', () => {
  const f = textFeld('zu_wenig', 'Bei zu wenig', null, {}, 'zu_wenig_de')
  assert.equal(f.zustand, 'nicht_bearbeitet')
})

// ── Die ATC-Falle ────────────────────────────────────────────────

test('G-208: ATC als JSON-Zeichenkette wird zerlegt', () => {
  // `[cmd]` **419 von 497 tragen einen JSON-Array als Text**,
  // gemessen 2026-08-27. `[read]` Ungefiltert stuende `["B02AA"]`
  // woertlich in der Kachel — dieselbe Falle wie G-191.
  assert.deepEqual(atcCodes('["J05AF", "J05AR"]'), ['J05AF', 'J05AR'])
  assert.deepEqual(atcCodes('["B02AA"]'), ['B02AA'])
})

test('G-208: ein glatter ATC-Code bleibt, wie er ist', () => {
  // `[cmd]` **78 von 497 sind glatt** — `A10BA02`.
  assert.deepEqual(atcCodes('A10BA02'), ['A10BA02'])
})

test('G-208: unzerlegbarer Text wird gezeigt, nicht verschluckt', () => {
  // `[read]` **Kein stiller Rueckfall auf `[]`.** Es GIBT einen Wert,
  // er ist nur nicht lesbar — ein leeres Feld waere hier wieder die
  // Luege, gegen die der ganze Auftrag gebaut ist.
  assert.deepEqual(atcCodes('[kaputt'), ['[kaputt'])
})

test('G-208: leer bleibt leer', () => {
  assert.deepEqual(atcCodes(null), [])
  assert.deepEqual(atcCodes('  '), [])
})

// ── Ein Satz ist keine Zahl ──────────────────────────────────────

test('G-208: kurze Werte bleiben in der Wertform', () => {
  // `[cmd]` **Gemessen 2026-08-27:** `cas_number` max 13 Zeichen,
  // verketteter ATC max 47.
  assert.equal(istKurz('103-90-2'), true)
  assert.equal(istKurz('N04BA'), true)
})

test('G-208: ein Absatz faellt aus der Wertform heraus', () => {
  // `[cmd]` **Der Anlass stand im ersten Bildschirmfoto:** der
  // englische Wirkmechanismus (Median 151 Zeichen) in
  // 18-px-Fettschrift sprengte die Kachel. **Dieselbe Falle wie
  // G-191**, eine Ebene hoeher.
  const satz = 'Dopamine replacement: levodopa crosses the blood-brain '
    + 'barrier and is decarboxylated to dopamine.'
  assert.ok(satz.length > KURZ_GRENZE)
  assert.equal(istKurz(satz), false)
})

test('G-208: null ist nie kurz', () => {
  assert.equal(istKurz(null), false)
})

// ── Die Bilanz ───────────────────────────────────────────────────

test('G-208: die Zustaende werden gezaehlt', () => {
  const felder = [
    feld('a', 'A', 'x', null),
    feld('b', 'B', null, 'MIXTURE_NO_SINGLE_CAS'),
    feld('c', 'C', null, null),
    feld('d', 'D', null, null),
  ]
  assert.deepEqual(zaehleZustaende(felder),
    { wert: 1, begruendet_leer: 1, nicht_bearbeitet: 2 })
})

// ── Die Reiter ───────────────────────────────────────────────────

const LEER = { ueberblickFelder: [], einnahmeFelder: [], sicherheitFelder: [],
  wechselwirkung: null, recht: null, mythen: [], schwangerschaft: false,
  fragen: 0 }

test('G-208: ein Reiter erscheint auch bei NUR begruendet leeren Feldern', () => {
  // `[read]` **Das ist der Unterschied zum Vorbild G-180.** Bei einem
  // Mischpraeparat traegt die Ueberblickskachel „keine einzelne
  // CAS-Nummer" — **und genau das ist die Auskunft, die jemand
  // sucht.** Ein weggelassener Reiter haette sie verschwiegen.
  const r = wirkstoffReiter({
    ...LEER,
    ueberblickFelder: [feld('cas', 'CAS', null, 'MIXTURE_NO_SINGLE_CAS')],
  })
  assert.deepEqual(r.map(x => x.id), ['ueberblick'])
})

test('G-208: ein Reiter mit NUR unbearbeiteten Feldern entfaellt', () => {
  const r = wirkstoffReiter({
    ...LEER,
    ueberblickFelder: [feld('cas', 'CAS', null, null)],
  })
  assert.deepEqual(r, [])
  assert.equal(ersterWirkstoffReiter(r), null)
})

test('G-208: die Reihenfolge steht fest', () => {
  const r = wirkstoffReiter({
    ueberblickFelder: [feld('a', 'A', 'x', null)],
    einnahmeFelder: [feld('b', 'B', 'x', null)],
    sicherheitFelder: [feld('c', 'C', 'x', null)],
    wechselwirkung: 'Alkohol ist die Alltagsfalle.',
    recht: 'Rezeptpflichtig.',
    mythen: ['Mythos eins'],
    schwangerschaft: true,
    fragen: 5,
  })
  assert.deepEqual(r.map(x => x.id), [
    'ueberblick', 'einnahme', 'sicherheit', 'wechselwirkung',
    'recht', 'schwangerschaft', 'mythen', 'fragen',
  ])
  assert.equal(ersterWirkstoffReiter(r), 'ueberblick')
})

test('G-208: die Zahl steht nur, wo eine etwas bedeutet', () => {
  const r = wirkstoffReiter({
    ...LEER, mythen: ['a', 'b'], fragen: 5,
  })
  assert.equal(r.find(x => x.id === 'mythen')?.zahl, 2)
  assert.equal(r.find(x => x.id === 'fragen')?.zahl, 5)
})

// ── Die Verdrahtung ──────────────────────────────────────────────

test('G-208: der Leseweg ist verdrahtet', () => {
  // `[read]` **Achter Fall derselben Pruefung** (G-184/186/187/191/
  // 196/199/207): eine Funktion, die niemand aufruft, besteht jeden
  // Funktionstest. `[cmd]` **Und `tools/verdrahtung-pruefen.mjs`
  // (G-197) hat die vier Tabellennamen hier zuerst gemeldet** —
  // deshalb stehen sie in diesem Test und nicht auf der
  // Bestandsliste.
  //
  // `[read]` **Kommentare werden vorher entfernt**, sonst genuegte
  // ein Tabellenname in einer Erklaerung.
  const roh = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
  const lesen = roh('src/lib/medical/wirkstoff-read.ts')

  for (const t of ['medication_active_substances', 'medication_user_texts',
    'medication_faq', 'medication_reproductive_evidence']) {
    assert.ok(new RegExp(`\\.from\\('${t}'\\)`).test(lesen),
      `Der Leseweg liest \`${t}\` nicht (G-208).`)
  }
  // Und die Luecken-Aufloesung wird tatsaechlich benutzt — sonst
  // saehen begruendete und unbearbeitete Felder wieder gleich aus.
  assert.match(lesen, /grundAus\(/,
    'Der Leseweg liest `evidence_provenance` nicht aus (G-208).')
  assert.match(lesen, /textFeld\(/,
    'Der Leseweg liest `null_context` nicht aus (G-208).')
})

test('G-208: die Ansicht ist verdrahtet', () => {
  const roh = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
  const ansicht = roh('src/app/v2/medical/ansicht.tsx')
  const seite = roh('src/app/v2/medical/page.tsx')
  const tafel = roh('src/app/v2/medical/wirkstoff-tafel.tsx')

  assert.match(seite, /ladeWirkstoffListe\(\)/,
    'Die Seite laedt die Liste nicht (G-208).')
  assert.match(ansicht, /<MedWirkstoffe/,
    'Der Reiter zeigt den Katalog nicht (G-208).')
  // `[read]` **Die drei Zustaende muessen in der Anzeige ankommen.**
  // Ein Bauteil, das nur zwei kennt, macht aus 101 unbearbeiteten
  // Feldern wieder 101 leere.
  for (const z of ['wert', 'begruendet_leer', 'nicht_bearbeitet']) {
    assert.ok(tafel.includes(`'${z}'`),
      `Die Tafel kennt den Zustand \`${z}\` nicht (G-208).`)
  }
})

test('G-208: `drug_class` wird NICHT angezeigt (C-296)', () => {
  // `[cmd]` **Gemessen 2026-08-27, und schlimmer als C-296 sagt:** die
  // Spalte fuehrt fallverdoppelte Tags — `MAOI` (15) UND `maoi` (15),
  // `SSRI` (10) UND `ssri` (10). **15 Wirkstoffe tragen `maoi`, nicht
  // neun**, und sechs davon sind SSRI: Escitalopram, Citalopram,
  // Paroxetin, Fluvoxamin, Vilazodon, Vortioxetin — jeder mit
  // `{SSRI, MAOI, maoi, ssri}` gleichzeitig.
  //
  // `[read]` **Dieser Test haelt die Entscheidung fest**, damit sie
  // nicht beim naechsten Umbau versehentlich zurueckgenommen wird.
  const roh = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
  for (const p of ['src/lib/medical/wirkstoff-read.ts',
    'src/app/v2/medical/wirkstoff-tafel.tsx',
    'src/app/v2/medical/tab-wirkstoffe.tsx']) {
    assert.doesNotMatch(roh(p), /drug_class/,
      `${p} zeigt \`drug_class\` — C-296 ist offen (G-208).`)
  }
})
