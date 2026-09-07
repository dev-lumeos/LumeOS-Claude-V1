// G-186/188/189: die dreiwertige Rollenlage, der Reitername und der
// entfernte Rueckfallzweig.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  zustandVon, lageAus, lageSatz, rolleText, LEERE_LAGE, KEINE_LAGE,
} from '../rollen-lage'

// ── Die drei Zustaende ───────────────────────────────────────────

test('G-186: die drei Zustaende kommen aus dem Bestand', () => {
  // `[cmd]` **Die Rollenwerte sind gemessen, nicht angenommen**
  // (2026-08-28): `not_relevant`, `unknown`, `inhibitor`, `substrate`,
  // `inducer`, `substrate_and_inhibitor`.
  assert.equal(zustandVon('not_relevant'), 'ohne_befund')
  assert.equal(zustandVon('unknown'), 'ungeprueft')
  for (const r of ['inhibitor', 'substrate', 'inducer',
    'substrate_and_inhibitor']) {
    assert.equal(zustandVon(r), 'rolle', r)
  }
})

test('G-186: fehlende Rolle gilt als ungeprueft', () => {
  assert.equal(zustandVon(null), 'ungeprueft')
  assert.equal(zustandVon(''), 'ungeprueft')
  assert.equal(zustandVon('   '), 'ungeprueft')
})

test('G-186: eine UNBEKANNTE Rolle ist ein Befund, kein Nichts', () => {
  // ══ DIE LEHRE AUS `b?.abbr ?? m` (G-207) ════════════════════════
  //
  // `[read]` **Was die Anzeige nicht kennt, darf sie nicht
  // stillschweigend zu „nichts" machen.** Eine neue Rolle aus der
  // Pipeline erscheint als das, was sie ist — ein Befund, den jemand
  // ansehen muss.
  assert.equal(zustandVon('neuer_wert_2027'), 'rolle')
  const l = lageAus([{ art: 'enzym', name: 'CYP3A4', rolle: 'neuer_wert_2027' }])
  assert.equal(l.befunde.length, 1)
  assert.equal(l.ungeprueft, 0)
})

// ── Nichts wird weggeworfen ──────────────────────────────────────

test('G-186: not_relevant und unknown werden GEZAEHLT, nicht gefiltert', () => {
  // ══ DER KERN DES PUNKTES ════════════════════════════════════════
  //
  // `[read]` **Das ist der Unterschied zu `.filter(Boolean)` aus
  // G-207:** eine Zeile ohne Befund verschwindet nicht, sie erhoeht
  // einen Zaehler. **Sonst sieht „geprueft, kein Effekt" genauso aus
  // wie „nie geprueft".**
  const l = lageAus([
    { art: 'enzym', name: 'CYP3A4', rolle: 'inhibitor' },
    { art: 'enzym', name: 'CYP2D6', rolle: 'not_relevant' },
    { art: 'enzym', name: 'CYP1A2', rolle: 'not_relevant' },
    { art: 'transporter', name: 'P-gp', rolle: 'unknown' },
  ])
  assert.equal(l.befunde.length, 1)
  assert.equal(l.ohne_befund, 2)
  assert.equal(l.ungeprueft, 1)
})

test('G-186: der Satz nennt beide Zahlen GETRENNT', () => {
  // `[read]` **Ein gemeinsames „4 geprueft" waere wieder
  // zweiwertig** — genau das, wogegen der Punkt gebaut ist.
  const s = lageSatz({ befunde: [], ohne_befund: 3, ungeprueft: 2 })
  assert.match(s ?? '', /3 geprüft, ohne Befund/)
  assert.match(s ?? '', /2 nicht geprüft/)
})

test('G-186: nur eine Sorte — nur eine Zahl im Satz', () => {
  const nurOhne = lageSatz({ befunde: [], ohne_befund: 6, ungeprueft: 0 })
  assert.match(nurOhne ?? '', /6 geprüft, ohne Befund/)
  assert.doesNotMatch(nurOhne ?? '', /nicht geprüft/)

  const nurUn = lageSatz({ befunde: [], ohne_befund: 0, ungeprueft: 6 })
  assert.match(nurUn ?? '', /6 nicht geprüft/)
  assert.doesNotMatch(nurUn ?? '', /ohne Befund/)
})

test('G-186: gar nichts ergibt keinen Satz', () => {
  assert.equal(lageSatz(LEERE_LAGE), null)
})

test('G-186: „gar keine Untersuchung" ist eine eigene Auskunft', () => {
  // `[cmd]` **111 der 412 sichtbaren Substanzen haben CYP-Daten, 14
  // Transporterdaten** (gemessen 2026-08-28). `[read]` Bei den
  // uebrigen fehlt die Untersuchung — **das heisst weder „geprueft"
  // noch „unbedenklich".**
  assert.match(KEINE_LAGE, /weder ein Befund noch/)
})

test('G-186: Doppelte werden zusammengefasst', () => {
  // `[cmd]` **Der Bestand fuehrt dieselbe Aussage mehrfach**, wenn
  // mehrere Quellen sie belegen — wie bei den Laborwirkungen (271
  // Zeilen auf 156 verschiedene).
  const l = lageAus([
    { art: 'enzym', name: 'CYP3A4', rolle: 'inhibitor' },
    { art: 'enzym', name: 'CYP3A4', rolle: 'inhibitor' },
    { art: 'enzym', name: 'CYP3A4', rolle: 'substrate' },
  ])
  assert.equal(l.befunde.length, 2)
})

test('G-186: eine Rolle ohne Namen faellt zu ungeprueft', () => {
  // `[read]` **Ein Datenfehler wird sichtbar, nicht als halbe Zeile
  // angezeigt.**
  const l = lageAus([{ art: 'enzym', name: '  ', rolle: 'inhibitor' }])
  assert.equal(l.befunde.length, 0)
  assert.equal(l.ungeprueft, 1)
})

test('G-186: die Rollen haben deutsche Namen', () => {
  assert.equal(rolleText('inhibitor'), 'hemmt')
  assert.equal(rolleText('substrate'), 'wird darüber abgebaut')
  // `[read]` Ein unbekannter Wert kommt als er selbst durch.
  assert.equal(rolleText('neuer_wert'), 'neuer_wert')
})

// ── Die Verdrahtung ──────────────────────────────────────────────

const roh = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
const ohneKommentare = (p: string) => roh(p)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

test('G-186: der Lesepfad liest beide Tabellen', () => {
  // `[cmd]` **Das ist der Rest von G-186**, den G-212 gemeldet hat:
  // `geprueft_ohne_befund` wurde nie gesetzt und war immer 0.
  const s = ohneKommentare('src/lib/supplements/substanz-read.ts')
  assert.match(s, /entity_cyp\(enzyme, role/,
    'Der Lesepfad liest `entity_cyp` nicht (G-186).')
  assert.match(s, /entity_transporters\(transporter, role/,
    'Der Lesepfad liest `entity_transporters` nicht (G-186).')
  assert.match(s, /rollen: rollenAus\(/,
    'Die Lage wird nicht durchgereicht (G-186).')
})

test('G-186: `geprueft_ohne_befund` ist weg', () => {
  // `[read]` **Nicht auskommentiert, sondern ersetzt** (G-163). Ein
  // Feld, das immer 0 ist, wird beim naechsten Umbau wiederbelebt.
  for (const p of ['src/lib/supplements/substanz-read.ts',
    'src/app/v2/supplements/substanz-tafel.tsx']) {
    assert.doesNotMatch(ohneKommentare(p), /geprueft_ohne_befund/,
      `${p} fuehrt das tote Feld weiter (G-186).`)
  }
})

test('G-186: die Anzeige zeigt alle drei Zustaende', () => {
  const s = ohneKommentare('src/app/v2/supplements/substanz-tafel.tsx')
  assert.match(s, /lageSatz\(/,
    'Die Tafel nennt die zwei Zahlen nicht (G-186).')
  assert.match(s, /KEINE_LAGE/,
    'Die Tafel sagt nicht, wenn gar nichts vorliegt (G-186).')
  assert.match(s, /r\.befunde\.map/,
    'Die Tafel zeigt die Befunde nicht (G-186).')
})

// ── G-188 ────────────────────────────────────────────────────────

test('G-188: der Block heisst, was er zeigt', () => {
  // `[cmd]` **`supplement_interactions`: 77 gegen `drug`, 1 gegen
  // `alcohol`, 0 zwischen zwei Katalogsubstanzen.** `[read]` **Der
  // alte Titel versprach Paare zwischen Supplements, die es nicht
  // gibt.**
  const s = roh('src/app/v2/supplements/substanz-tafel.tsx')
  assert.match(s, /titel="Wechselwirkung mit Medikamenten und Labor"/,
    'Der Blocktitel verspricht wieder Supplement-Paare (G-188).')
})

test('G-188: der Reiter nennt die Medikamente', () => {
  const de = JSON.parse(roh('messages/de.json'))
  const en = JSON.parse(roh('messages/en.json'))
  assert.match(de.Supplements.tabWechselwirkungen, /Medikamente/,
    'Der deutsche Reitername nennt die Medikamente nicht (G-188).')
  assert.match(en.Supplements.tabWechselwirkungen, /medication/i,
    'Der englische Reitername nennt die Medikamente nicht (G-188).')
})

// ── G-189 ────────────────────────────────────────────────────────

test('G-189: `SuppInteractions` ist ersatzlos entfernt', () => {
  // `[cmd]` **Der Zweig griff nur bei `regeln.length === 0`** — und
  // `rule_catalog` traegt 64 Zeilen mit `qual: true`. **Er war nicht
  // erreichbar.**
  //
  // `[read]` **G-163-Beschluss:** Rueckfallfassungen bleiben nicht
  // stehen. Sie werden beim naechsten Umbau wiederbelebt.
  // `[cmd]` **G-365 (E-69) hat den Mockup-Reiter zurueckgebracht** —
  // aber NICHT als Rueckfall: `SuppInteractionsReferenz` rendert
  // unbedingt, unter der Trennlinie, als Vergleich.
  //
  // `[read]` **Die Zusage bleibt und wird schaerfer:** kein
  // Sonst-Zweig, der nur bei `regeln.length === 0` greift. **Genau
  // das prueft der Test jetzt, statt den Namen zu verbieten.**
  for (const p of ['src/app/v2/supplements/tabs.tsx',
    'src/app/v2/supplements/ansicht.tsx']) {
    const s = ohneKommentare(p)
    assert.doesNotMatch(s, /:\s*<SuppInteractions\s*\/>/,
      `${p} fuehrt den toten Rueckfallzweig weiter (G-189).`)
    assert.doesNotMatch(s, /regeln\.length === 0\s*\?/,
      `${p} entscheidet wieder ueber die Regelzahl (G-189).`)
  }
})

test('G-189: der Reiter rendert ohne Rueckfall', () => {
  const s = ohneKommentare('src/app/v2/supplements/ansicht.tsx')
  assert.match(s, /tab === 'interactions' && regeln &&/,
    'Der Reiter hat wieder einen Rueckfallzweig (G-189).')
  assert.doesNotMatch(s, /regeln\.regeln\.length > 0[\s\S]{0,80}:/,
    'Die tote Bedingung ist zurueck (G-189).')
})
