// G-199: drei Zustaende, feste Kachelmenge.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { kachel, dosisKacheln, NICHT_ERHOBEN } from '../dosis-zustand'

const LEER = {
  menge: null, obergrenze: null, einnahme: null, mitEssen: null,
}

test('G-199: ein Wert schlaegt einen Grund', () => {
  const k = kachel('x', 'X', '3–5 g/day', 'Keine Leitlinie nennt eine Dosis.')
  assert.equal(k.zustand, 'wert')
  assert.equal(k.wert, '3–5 g/day')
  assert.equal(k.grund, null, 'Neben einem Wert steht kein Grund.')
})

test('G-199: ohne Wert, aber mit Grund → gibt_es_nicht', () => {
  // `[cmd]` **Der haeufigste Fall:** `upper_limit` 246 von 412,
  // `guideline_dose` 261.
  const k = kachel('x', 'X', null, 'Für Peptide gibt es keine Obergrenze.')
  assert.equal(k.zustand, 'gibt_es_nicht')
  assert.equal(k.grund, 'Für Peptide gibt es keine Obergrenze.')
})

test('G-199: ohne beides → nicht_erhoben', () => {
  // ══ DER SICHERHEITSRELEVANTE ZUSTAND ════════════════════════════
  //
  // `[cmd]` **157 bzw. 137 von 412** — nicht selten, sondern die
  // zweitgroesste Gruppe. `[read]` *„Nie untersucht"* darf nicht
  // aussehen wie *„unbedenklich"*.
  const k = kachel('x', 'X', null, null)
  assert.equal(k.zustand, 'nicht_erhoben')
  assert.equal(k.wert, null)
  assert.equal(k.grund, null)
})

test('G-199: Leerraum zaehlt nicht als Wert', () => {
  assert.equal(kachel('x', 'X', '   ', null).zustand, 'nicht_erhoben')
  assert.equal(kachel('x', 'X', null, '  ').zustand, 'nicht_erhoben')
})

test('G-199: immer vier Kacheln, egal wie leer', () => {
  // **Tom:** *„von mir aus muessen immer alle kacheln angezeigt werden
  // dass es einheitlich wirkt."* `[read]` **Das aendert §9 fuer
  // Zahlenkacheln** — fuer Textbloecke gilt „kein Block ohne Inhalt"
  // weiter.
  assert.equal(dosisKacheln(LEER).length, 4)
  assert.equal(dosisKacheln({ ...LEER, menge: '3 g' }).length, 4)
  // Und alle vier sind im leeren Fall „nicht erhoben" — keine
  // verschwindet.
  assert.deepEqual(dosisKacheln(LEER).map(k => k.zustand),
    ['nicht_erhoben', 'nicht_erhoben', 'nicht_erhoben', 'nicht_erhoben'])
})

test('G-199: die Reihenfolge ist fest', () => {
  // `[read]` **Der Sinn der festen Menge:** wer drei Substanzen
  // durchklickt, findet die Zahlen an derselben Stelle. Eine
  // verschobene Reihenfolge waere derselbe Fehler wie eine fehlende
  // Kachel.
  assert.deepEqual(dosisKacheln(LEER).map(k => k.id),
    ['menge', 'obergrenze', 'einnahme', 'mitessen'])
})

test('G-199: „nicht erhoben" traegt Worte, keinen Strich', () => {
  // `[read]` Ein Strich sieht aus wie eine Angabe — derselbe Grund,
  // aus dem in G-191 der Strich aus der Mengenkachel flog.
  assert.equal(NICHT_ERHOBEN, 'Nicht erhoben')
  assert.equal(/^[-–—]$/.test(NICHT_ERHOBEN), false)
})

test('G-199: es gibt genau drei Zustaende', () => {
  // ══ DIE NEGATIVPROBE AUS DEM AUFTRAG ════════════════════════════
  //
  // **Auftrag: *„eine Kachel auf einen vierten Zustand setzen — ein
  // Waechter muss rot werden."***
  const ERLAUBT = new Set(['wert', 'gibt_es_nicht', 'nicht_erhoben'])
  const alle = [
    kachel('a', 'A', '1 g', null),
    kachel('b', 'B', null, 'Grund'),
    kachel('c', 'C', null, null),
    ...dosisKacheln({ ...LEER, menge: '2 g', obergrenze: '9 g' }),
  ]
  for (const k of alle) {
    assert.ok(ERLAUBT.has(k.zustand),
      `«${k.id}» traegt «${k.zustand}» — das ist kein bekannter Zustand.`)
  }
  // Und die Anzeige kennt genau diese drei.
  const tafel = fs.readFileSync(path.join(process.cwd(),
    'src/app/v2/supplements/substanz-tafel.tsx'), 'utf8')
  const gezeigt: string[] = []
  const muster = /k\.zustand === '(\w+)'/g
  let t: RegExpExecArray | null
  while ((t = muster.exec(tafel)) !== null) {
    if (!gezeigt.includes(t[1])) gezeigt.push(t[1])
  }
  assert.deepEqual(gezeigt.sort(),
    ['gibt_es_nicht', 'nicht_erhoben', 'wert'],
    'Die Anzeige behandelt andere Zustaende als die Rechnung kennt.')
  for (const z of gezeigt) {
    assert.ok(ERLAUBT.has(z), `Die Anzeige kennt «${z}» — ein vierter Zustand.`)
  }
})

test('G-199: die Kacheln sind verdrahtet', () => {
  // `[read]` **Sechster Fall derselben Pruefung.** Eine Funktion, die
  // niemand aufruft, besteht jeden Funktionstest.
  const roh = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
  const tafel = roh('src/app/v2/supplements/substanz-tafel.tsx')

  assert.match(tafel, /<DosisKacheln zahlen=\{zahlen\}/,
    'Der Dosierungs-Reiter zeigt die Kacheln nicht (G-199).')
  assert.equal(/<Zahlenkasten/.test(tafel), false,
    'Der graue Zeilenkasten ist zurueck — er war der Rest von G-191.')

  // G-199 Punkt 2: die WADA-Kachel gehoert NICHT in die Dosierung.
  assert.match(tafel, /k\.id !== 'beleglage' && k\.id !== 'wada'/,
    'Die WADA-Kachel steht wieder in der Dosierung (G-199 Punkt 2).')
})

test('G-199: der Community-Lesepfad haengt an der C-280-Sicht', () => {
  // ══ DER FUENFTE BLINDE FLECK ════════════════════════════════════
  //
  // `[cmd]` **Bei der Negativprobe blieb genau diese Sabotage gruen:**
  // `.from('community_anzeige')` auf `…X` geaendert — kein Test fiel
  // um. **Das ist derselbe Fehler wie G-186/187/191/184/196:** die
  // Funktion war geprueft, die Verdrahtung nicht.
  //
  // `[read]` **Und er waere teuer gewesen:** G-192 hat den Reiter
  // gebaut und nie befuellt, weil der Lesepfad still `null` zurueckgab.
  // Genau dieser Zustand darf nicht zurueckkehren.
  const roh = fs.readFileSync(path.join(process.cwd(),
    'src/lib/supplements/substanz-read.ts'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')

  assert.match(roh, /\.from\('community_anzeige'\)/,
    'Der Community-Lesepfad liest nicht mehr aus `community_anzeige` '
    + '(C-280) — dann bleibt der Reiter leer wie vor G-199.')
  assert.match(roh, /\.schema\('supplements'\)/,
    'Die Sicht wird nicht im Fachschema gesucht (G-199).')
  assert.match(roh, /\.contains\('substance_ids', \[slug\]\)/,
    'Die Zuordnung ueber `substance_ids` fehlt — dann kaeme fuer jede '
    + 'Substanz alles oder nichts (G-199).')

  // `[cmd]` Der alte Weg ueber `wissen` ist raus — er gab still
  // `null` zurueck, sobald PostgREST das Schema nicht kennt.
  assert.equal(/from\('community_records'\)/.test(roh), false,
    'Der alte `wissen`-Lesepfad ist zurueck (G-199).')
})
