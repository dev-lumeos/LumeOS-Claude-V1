// Der Waechter fuer G-172: Deutsch und Scrollbarkeit.
//
// ── ZWEI DINGE, DIE LEISE ZURUECKKOMMEN ─────────────────────────
//
// `[cmd]` **1. Englische Sichttexte.** Supplements hatte 22 davon fest
// im Quelltext, waehrend Nutrition und Settings die i18n-Schicht seit
// A-14 nutzen. Wer eine Kachel ergaenzt, tippt den Text hin — und
// niemand merkt es, weil die Seite ja aussieht wie vorher.
//
// `[cmd]` **2. Der Scroll-Container.** `.v2-supp-tbl-wrap` hatte nur
// `overflow-x`; die Tabelle wuchs in die Seite, und der Spaltenkopf war
// nach dem ersten Bildschirm weg. Ein `overflow-y` faellt beim
// Aufraeumen schnell wieder heraus.
//
// `[read]` **Am Quelltext geprueft, nicht im Browser:** Beides sind
// Aussagen ueber den Bauplan („kein englischer Text fest verdrahtet",
// „die Regel steht in der CSS"), nicht ueber einen Zustand. Sie gelten
// fuer jede Sprache und jede Breite zugleich.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const V2 = path.join(process.cwd(), 'src/app/v2/supplements')
const CSS = path.join(V2, 'supplements.css')

/**
 * Die englischen Sichttexte, die G-172 entfernt hat.
 *
 * `[read]` Bewusst die WORTLAUTE, nicht ein Muster wie /[A-Z][a-z]+/ —
 * eine Heuristik ueber englische Woerter meldet `Icon name="plus"` und
 * jeden Eigennamen mit. Was hier steht, stand wirklich in der Anzeige.
 */
const RAUS = [
  'Add supplement', 'Add to stack', 'Export stack', 'Search catalog',
  'in stack', 'not in stack',
  '>Evidence<', '>In stack<', '>Action<', '>Mode<', '>Timing<',
]

/**
 * `[cmd]` **`>Dose<` steht NICHT in der Liste**, obwohl G-172 es an
 * drei Stellen ersetzt hat. Die vierte sitzt in `LogInjektionFenster`
 * — einer Attrappe, die nicht auf der Liste der 22 stand und deshalb
 * englisch bleibt.
 *
 * `[read]` **Ein halb uebersetzter Dialog ist schlechter als ein
 * ganzer englischer.** Der Rest des Fensters (`Site`, `Volume`,
 * `Pain`) ist ebenfalls englisch; im Bericht steht es als Befund.
 */


/** Dateien, die G-172 auf `messages/` umgestellt hat. */
const UMGESTELLT = [
  'ansicht.tsx', 'modale.tsx', 'substanz-detail.tsx',
]

test('keine englischen Sichttexte mehr fest im Quelltext', () => {
  for (const datei of UMGESTELLT) {
    const p = path.join(V2, datei)
    const roh = fs.readFileSync(p, 'utf8')
    // Kommentare zaehlen nicht — sie erklaeren, was FRUEHER dastand.
    // `[read]` Ohne das bestaetigt der Test sein eigenes Changelog;
    // derselbe Fehler wie in G-166, dort gegengeprobt.
    const quelle = roh
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/[^\n]*/g, '')
    for (const wort of RAUS) {
      assert.ok(!quelle.includes(wort),
        `${datei} enthaelt wieder «${wort}» fest im Quelltext. `
        + 'Sichttexte gehoeren nach `messages/{de,en}.json` (G-172).')
    }
  }
})

test('die Tab-Beschriftungen kommen aus messages, nicht aus Zeichenketten', () => {
  const quelle = fs.readFileSync(path.join(V2, 'ansicht.tsx'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
  // `[cmd]` Elf Tabs, elf `t(...)`-Aufrufe in `tabs()`.
  const block = quelle.slice(quelle.indexOf('function tabs('),
                             quelle.indexOf('export function SupplementsAnsicht'))
  const treffer = block.match(/label:\s*t\('/g) ?? []
  assert.equal(treffer.length, 11,
    `Erwartet elf uebersetzte Tab-Beschriftungen, gefunden ${treffer.length}. `
    + 'Steht wieder ein `label: \'…\'` da, faellt es hier auf.')
  assert.ok(!/label:\s*'/.test(block),
    'Ein Tab traegt wieder eine feste Zeichenkette statt `t(…)`.')
})

test('die Substanzliste hat einen senkrechten Scroll-Container', () => {
  const css = fs.readFileSync(CSS, 'utf8')
  const i = css.indexOf('.v2-supp-tbl-wrap {')
  assert.ok(i > 0, '`.v2-supp-tbl-wrap` fehlt in supplements.css.')
  const block = css.slice(i, css.indexOf('}', i))
  assert.match(block, /overflow-y:\s*auto/,
    '`.v2-supp-tbl-wrap` hat kein `overflow-y` mehr — die Liste waechst '
    + 'dann wieder in die Seite und der Spaltenkopf verschwindet (G-172).')
  assert.match(block, /max-height:\s*\d+vh/,
    '`.v2-supp-tbl-wrap` hat keine `max-height` in `vh` mehr. Ohne sie '
    + 'greift `overflow-y` nicht (G-172).')
})

test('der Spaltenkopf bleibt beim Scrollen stehen', () => {
  const css = fs.readFileSync(CSS, 'utf8')
  const i = css.indexOf('.v2-supp-tbl-wrap thead th')
  assert.ok(i > 0, 'Die Sticky-Regel fuer den Spaltenkopf fehlt.')
  const block = css.slice(i, css.indexOf('}', i))
  assert.match(block, /position:\s*sticky/)
  // `[cmd]` Ohne Hintergrund scrollen die Zeilen durch den Kopf.
  assert.match(block, /background:/,
    'Der klebende Kopf braucht einen Hintergrund — sonst scrollen die '
    + 'Zeilen sichtbar hindurch.')
})

test('der Katalog-Tab zeigt die echte Datenbank, nicht den Entwurf', () => {
  const quelle = fs.readFileSync(path.join(V2, 'ansicht.tsx'), 'utf8')
  assert.match(quelle, /tab === 'catalog' && <SuppDatabase \/>/,
    'Der Katalog-Tab zeigt wieder etwas anderes als `SuppDatabase` (G-172).')
  // `[cmd]` Der Entwurf ist geloescht, nicht versteckt.
  const spec = fs.readFileSync(path.join(V2, 'tab-spec.tsx'), 'utf8')
  assert.ok(!/export function SuppCatalog\(/.test(spec),
    '`SuppCatalog` ist wieder da. Der Entwurf wurde in G-172 geloescht, '
    + 'weil er neben der echten Datenbank stand.')
})
