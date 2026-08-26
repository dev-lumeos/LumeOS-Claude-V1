// G-180: welche Reiter erscheinen — und welche nicht.
//
// `[read]` **Die Regel „ein Reiter ohne Inhalt erscheint nicht" ist
// dieselbe wie §9s „kein Block ohne Inhalt"**, nur eine Ebene hoeher.
// Ein Reiter, der nichts zeigt, ist ein Versprechen, das er nicht
// einloest.
//
// `[cmd]` **Und sie greift oft:** gemessen am 2026-08-25 haben **15 von
// 318** Katalogeintraegen Unterformen — bei 303 entfaellt „Formen".
// **28 haben gar keine Nutzertextzeile**, darunter alle 15
// Sammeleintraege.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { reiterFuer, ersterReiter } from '../substanz-reiter'
import type { Zahlen } from '../substanz-reiter'
import type { CommunityHinweise, Nutzertexte, Unterform, Frage } from '../substanz-read'

const TAFEL = path.join(process.cwd(), 'src/app/v2/supplements/substanz-tafel.tsx')

const LEER: Zahlen = { menge: null, obergrenze: null, einnahme: null, mitEssen: null }

function texte(teil: Partial<Nutzertexte> = {}): Nutzertexte {
  return {
    kurz_was: null, wofuer: [], wie_wirkt: null, was_bringt_es: null,
    zu_viel: null, zu_wenig: null, wann_wie: null, wer_nicht: [],
    mythen: null, irreversibel: null, ueberwachung: null, reinheit: null,
    nicht_im_blut: null, rechtslage_klartext: null,
    ...teil,
  }
}

const FORM: Unterform = {
  id: 'f1', slug: 'mg-citrat', name: 'Magnesium citrate',
  hinweis: 'Citrat; gut löslich.', grad: 'B',
}
const FRAGE: Frage = { frage: 'Muss ich laden?', antwort: 'Nötig ist es nicht.' }
const COMMUNITY: CommunityHinweise = {
  // G-199: die Evidenzklasse steht sichtbar im Reiter.
  evidenzklasse: 'E',
  nebenwirkungen: [{
    id: 'se1',
    effekt: 'Deca dick',
    attribution: '19-nor-AAS werden in der Szene so zugeordnet.',
    onset: 'subakut',
    verbreitung: 'COMMON',
    vertrauen: 'MODERATE',
    abgleich: 'PARTIALLY_SUPPORTED',
    evidenz: 'E',
    grenzen: ['nicht substanzspezifisch beweisend'],
  }],
  tradeoffs: [],
  mythen: [],
  qualitaet: [],
  begriffe: [],
}

test('ohne alles gibt es keinen einzigen Reiter', () => {
  // `[cmd]` Der Fall der 28 ohne Nutzertextzeile und ohne Formen.
  assert.deepEqual(reiterFuer(null, LEER, [], [], null), [])
  assert.equal(ersterReiter([]), null)
})

test('nur Formen: nur der Formen-Reiter — der Fall Magnesium', () => {
  // `[cmd]` **Sammeleintrag `magnesium`: 7 Formen, KEINE Textzeile**
  // (gemessen 2026-08-25). Ein fest auf „Überblick" gesetzter
  // Startwert zeigte hier eine leere Flaeche.
  const r = reiterFuer(null, LEER, [FORM], [], null)
  assert.deepEqual(r.map(x => x.id), ['formen'])
  assert.equal(r[0].zahl, 1, 'Der Formen-Reiter traegt seine Zahl.')
  assert.equal(ersterReiter(r), 'formen',
    'Der erste vorhandene Reiter ist offen, nicht ein fester.')
})

test('die Zahl steht nur, wo es eine gibt', () => {
  const r = reiterFuer(texte({ kurz_was: 'Ein Satz.' }), LEER, [FORM], [FRAGE, FRAGE], null)
  const nach = Object.fromEntries(r.map(x => [x.id, x.zahl]))
  assert.equal(nach.ueberblick, null, 'Überblick hat keine sinnvolle Zahl.')
  assert.equal(nach.formen, 1)
  assert.equal(nach.fragen, 2)
})

test('Dosierung erscheint schon bei EINER Zahl', () => {
  // `[cmd]` Gemessen ueber die 318: Menge 83, Obergrenze 38,
  // Einnahme 19 — eine Substanz hat oft nur eine der drei.
  const nurMenge = reiterFuer(null, { ...LEER, menge: '3-5 g' }, [], [], null)
  assert.deepEqual(nurMenge.map(x => x.id), ['dosierung'])
  const nurGrenze = reiterFuer(null, { ...LEER, obergrenze: '350 mg' }, [], [], null)
  assert.deepEqual(nurGrenze.map(x => x.id), ['dosierung'])
})

test('Dosierung erscheint auch, wenn nur `wann_wie` dasteht', () => {
  // `[read]` Der Text ist die Angabe, wenn die Zahl fehlt — bei 143
  // von 318 ist `dosing.status = 'unbekannt'`.
  const r = reiterFuer(texte({ wann_wie: 'Zum Essen.' }), LEER, [], [], null)
  assert.deepEqual(r.map(x => x.id), ['dosierung'])
})

test('Sicherheit erscheint bei jedem einzelnen ihrer Felder', () => {
  for (const feld of ['zu_viel', 'zu_wenig', 'mythen'] as const) {
    const r = reiterFuer(texte({ [feld]: 'Text.' }), LEER, [], [], null)
    assert.ok(r.some(x => x.id === 'sicherheit'), `${feld} muss den Reiter zeigen.`)
  }
  const werNicht = reiterFuer(texte({ wer_nicht: ['Schwangere'] }), LEER, [], [], null)
  assert.ok(werNicht.some(x => x.id === 'sicherheit'))
})

test('die Enhanced-Felder zaehlen zur Sicherheit', () => {
  // ── Der Test, der den Enhanced-Teil belegt ──────────────────────
  //
  // `[cmd]` **`irreversibel_de`, `ueberwachung_de` und `reinheit_de`
  // stehen heute bei 0 von 290** — der C-264-Import hat sie geleert
  // (vorher 136). Codex fuellt sie in C-266.
  //
  // `[read]` **Deshalb per Test und nicht am Bild**, wie der Auftrag
  // verlangt: sobald ein Feld Inhalt hat, erscheint der Reiter.
  for (const feld of ['irreversibel', 'ueberwachung', 'reinheit'] as const) {
    const r = reiterFuer(texte({ [feld]: 'Text.' }), LEER, [], [], null)
    assert.deepEqual(r.map(x => x.id), ['sicherheit'],
      `${feld} allein muss den Sicherheits-Reiter zeigen (G-180).`)
  }
})

test('der Laborbezug allein traegt den Sicherheits-Reiter', () => {
  const r = reiterFuer(null, LEER, [], [], 'Kreatinin steigt harmlos an.')
  assert.deepEqual(r.map(x => x.id), ['sicherheit'])
})

test('G-182: der Quellen-Reiter erscheint, wo Quellen liegen', () => {
  // `[cmd]` **`sources` ist bei 290 von 290 gefuellt** (C-264). Der
  // Chip zeigte die Zahl und tat nichts — Tom: *„quellen haben keine
  // funktion."*
  const ohne = reiterFuer(null, LEER, [], [], null, [])
  assert.equal(ohne.some(r => r.id === 'quellen'), false)

  const mit = reiterFuer(null, LEER, [], [], null,
    [{ ref: 'Pandit et al., Andrologia 2016', felder: ['was_bringt_es'], geprueft: false }])
  assert.deepEqual(mit.map(r => r.id), ['quellen'])
  assert.equal(mit[0].zahl, 1, 'Der Reiter traegt seine Zahl wie die anderen.')
})

test('G-182: der Warnkasten steht NUR im Ueberblick', () => {
  // ══ Punkt 2 ═════════════════════════════════════════════════════
  //
  // `[cmd]` Gemessen am 2026-08-25 VOR der Aenderung: der Kasten
  // „Was nicht zurückkommt" stand bei jeder Enhanced-Substanz auf
  // **3 von 4 Reitern** — dreimal derselbe Text.
  //
  // **Tom:** *„es gibt keinen grund oben ueberall dasselbe zu
  // zeigen."*
  //
  // `[read]` Geprueft wird der Quelltext: `WarnKasten` darf genau
  // einmal gerendert werden.
  const quelle = fs.readFileSync(TAFEL, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
  const treffer = quelle.match(/<WarnKasten\s/g) ?? []
  assert.equal(treffer.length, 1,
    `\`WarnKasten\` wird ${treffer.length}-mal gerendert — er gehoert `
    + 'einmal in den Ueberblick (G-182 Punkt 2).')
})

test('G-182: Ueberwachung und Reinheit stehen NICHT rechtsbuendig', () => {
  // ══ Punkt 3 ═════════════════════════════════════════════════════
  //
  // **Tom:** *„erste obere kachel unstrukturiert."*
  //
  // `[cmd]` Vorher trugen sie `v2-supp-kasten-zeile` mit
  // `v2-supp-kasten-wert` — **rechtsbuendig**. `[read]` Die
  // Rechtsbuendigkeit war fuer ZAHLEN gedacht: „350 mg" rechts ist
  // ablesbar, ein Satz ueber vier Zeilen rechtsbuendig nicht.
  const quelle = fs.readFileSync(TAFEL, 'utf8')
  const anfang = quelle.indexOf('export function WarnKasten(')
  const ende = quelle.indexOf('export function', anfang + 30)
  const rumpf = quelle.slice(anfang, ende > 0 ? ende : undefined)
  assert.ok(rumpf.length > 0, '`WarnKasten` nicht gefunden.')
  assert.equal(/v2-supp-kasten-wert/.test(rumpf), false,
    'Im Warnkasten steht wieder ein rechtsbuendiger Wert — das ist die '
    + 'Zeile aus dem Zahlenkasten und fuer Saetze unlesbar (G-182).')
  assert.match(rumpf, /v2-supp-textkachel/,
    'Die drei gehoeren als Textkacheln nebeneinander, linksbuendig.')
})

test('G-186: Labor- und Wechselwirkung tragen den Sicherheits-Reiter', () => {
  // `[cmd]` **Gemessen 2026-08-25:** `supplement_lab_effects` 222
  // Zeilen ueber **90** Substanzen, `supplement_interactions` 78 ueber
  // **78** — zusammen haben **121 der 318** etwas. Bei einigen ist es
  // der EINZIGE Sicherheitsinhalt.
  const nurLabor = reiterFuer(null, LEER, [], [], null, null,
    [{ analyt: 'TSH', richtung: 'false_low', folge: 'Fehldiagnose' }], null)
  assert.deepEqual(nurLabor.map(r => r.id), ['sicherheit'])

  const nurWechsel = reiterFuer(null, LEER, [], [], null, null, null,
    [{ partner: 'Warfarin', schwere: 'high', beschreibung: null }])
  assert.deepEqual(nurWechsel.map(r => r.id), ['sicherheit'])
})

test('G-186: der Wechselwirkungsblock haengt in der Sicherheit', () => {
  // ══ DIE VERDRAHTUNG, NICHT NUR DIE FUNKTION ═════════════════════
  //
  // `[read]` **Das war zweimal der blinde Fleck** — G-180 bei der
  // Hoehenbremse, G-183 bei zwei Eingriffen. Ein Block, den niemand
  // rendert, besteht jeden Funktionstest.
  const quelle = fs.readFileSync(TAFEL, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

  assert.match(quelle, /<Wechselwirkungsblock\s/,
    'Der Block wird nirgends gerendert (G-186 Punkt 2).')

  // Er steht im Sicherheits-Zweig, nicht im Ueberblick.
  const sicher = quelle.slice(quelle.indexOf("reiter === 'sicherheit'"))
  const bis = sicher.indexOf("if (reiter === 'formen')")
  assert.match(sicher.slice(0, bis > 0 ? bis : undefined), /<Wechselwirkungsblock\s/,
    'Der Block gehoert in die Sicherheit — dass Biotin einen '
    + 'Troponinwert faelscht, zaehlt beim Befund, nicht im Ueberblick.')

  // Und der Lesepfad liefert ihn entdoppelt.
  const read = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/supplements/substanz-read.ts'), 'utf8')
  assert.match(read, /supplement_lab_effects\(/,
    'Die Laborwirkungen werden nicht geladen (G-186).')
  assert.match(read, /function alleLaborwirkungen/,
    'Die Entdoppelung fehlt — 222 Zeilen sind nur 156 verschiedene.')
})

test('G-192: Community erscheint nur mit erlaubtem Inhalt', () => {
  const ohne = reiterFuer(null, LEER, [], [], null, null, null, null, null)
  assert.equal(ohne.some(r => r.id === 'community'), false)

  const mit = reiterFuer(null, LEER, [], [], null, null, null, null, COMMUNITY)
  assert.deepEqual(mit.map(r => r.id), ['community'])
  assert.equal(mit[0].titel, 'Aus der Community')
  assert.equal(mit[0].zahl, 1)
})

test('G-192: Anleitungsfelder bleiben aus dem Community-Lesepfad draussen', () => {
  const read = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/supplements/substanz-read.ts'), 'utf8')
  const verboten = [
    'reported_mitigations',
    'components',
    'reported_reason_for_combination',
    'why_these_doses',
  ]
  for (const feld of verboten) {
    assert.equal(read.includes(feld), false,
      `${feld} ist wieder im Lesepfad. G-192 zeigt Kosten, keine Anleitung.`)
  }
})

test('die Reihenfolge steht fest', () => {
  const r = reiterFuer(
    texte({ kurz_was: 'x', wann_wie: 'y', zu_viel: 'z' }),
    { ...LEER, menge: '1 g' }, [FORM], [FRAGE], null)
  assert.deepEqual(r.map(x => x.id),
    ['ueberblick', 'dosierung', 'sicherheit', 'formen', 'fragen'])
})

test('Leerraum zaehlt nicht als Inhalt', () => {
  // `[read]` Sonst entstuende ein Reiter, der eine leere Flaeche zeigt.
  const r = reiterFuer(texte({ kurz_was: '   ' }), { ...LEER, menge: '  ' }, [], [], '  ')
  assert.deepEqual(r, [])
})
