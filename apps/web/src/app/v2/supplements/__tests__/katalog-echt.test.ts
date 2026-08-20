// Der angebundene Catalog-Tab (G-91).
//
// `[read]` **Warum als Quelltextpruefung und nicht als Rechnung:** der
// Tab filtert und sortiert, er rechnet nichts. Was schiefgehen kann,
// ist deshalb nicht eine falsche Zahl, sondern eine **stillschweigend
// wieder eingefuehrte Behauptung** — ein Gewicht je Evidenzstufe, eine
// Dosisempfehlung, eine Spalte ohne Spalte.
//
// `[cmd]` Genau das ist die Klasse Fehler, die G-45 beim Katalog schon
// einmal getroffen hat (34 gegen 44 Eintraege) und die am Bildschirm
// nicht auffaellt.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const DATEI = path.join(process.cwd(), 'src/app/v2/supplements/tab-katalog-echt.tsx')
const quelle = fs.readFileSync(DATEI, 'utf8')

/** Der Quelltext ohne Kommentare — sonst faengt die Pruefung sich selbst. */
const code = quelle
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter(z => !z.trim().startsWith('//'))
  .join('\n')

test('der Tab liest den echten Katalog, nicht die Vorlage', () => {
  assert.match(code, /KatalogEintrag/, 'nimmt den Typ des Lesepfads')
  assert.doesNotMatch(code, /from '\.\/spec-daten'/,
    'zieht nichts aus der Entwurfsdatei nach')
  assert.doesNotMatch(code, /\bCATALOG\b/,
    'benutzt nicht den Katalog der Vorlage')
})

test('kein Gewicht je Evidenzstufe — die Tabelle fuehrt keines', () => {
  // `[cmd]` Die Vorlage setzt S 1.00 · A 0.90 · B 0.75 · C 0.50 …
  // Diese Zahlen stehen nur in `spec-daten.ts` und haben weder Spalte
  // noch Quelle. Wer sie hier wieder einbaut, behauptet Evidenz.
  assert.doesNotMatch(code, /EVIDENCE_WEIGHT|\bw:\s*0?\.\d/,
    'kein uebernommenes Stufengewicht')
  assert.doesNotMatch(code, /1\.00|0\.90|0\.75/,
    'keine Gewichtszahl im Klartext')
})

test('die Dosisspalte zeigt die Portionsgroesse, nicht eine Empfehlung', () => {
  // `[read]` Die schaerfste Grenze des Auftrags: eine Dosis **zeigen**
  // ist etwas anderes, als eine zu **raten**. `typical_dose_min` ist
  // auf allen 44 Eintraegen leer — wer daraus etwas ableitet, raet.
  assert.match(code, /serving_size/, 'zeigt die Portionsgroesse')
  assert.doesNotMatch(code, /typical_dose_(min|max)/,
    'ruehrt die leeren Dosisspalten nicht an')
  assert.doesNotMatch(code, /recommend|empfohlen|sollte/i,
    'keine Empfehlungssprache')
})

test('keine Spalte „Mode" — es gibt kein solches Feld', () => {
  // `[cmd]` `supplement_catalog` fuehrt kein standard/enhanced, und
  // `enhanced_substances` existiert nicht. Alle 44 pauschal
  // „standard" zu nennen waere eine erfundene Einstufung.
  assert.doesNotMatch(code, /'enhanced'|"enhanced"/,
    'stuft nichts als enhanced ein')
})

test('die Stufen werden gezaehlt, nicht gesetzt', () => {
  // Die Zahl an jeder Filterstufe kommt aus dem Katalog selbst.
  assert.match(code, /vorhandeneStufen/, 'leitet die Stufen aus den Daten ab')
  assert.doesNotMatch(code, /S · 4|A · 13|B · 16/,
    'keine festgeschriebene Verteilung')
})

test('der Tab traegt keine Attrappenmarke mehr', () => {
  assert.doesNotMatch(code, /attrappe=\{/,
    'angebundene Flaechen tragen keine Marke')
})

test('gesagt wird, was zur Evidenzstufe fehlt', () => {
  // `[cmd]` `evidence_summary` 0/44, `evidence_sources` auf allen ein
  // leeres Feld. Der Nutzer erfaehrt, dass nur der Buchstabe vorliegt.
  assert.match(quelle, /evidence_summary/, 'nennt die leere Zusammenfassung')
  assert.match(quelle, /evidence_sources/, 'nennt die leeren Quellen')
})
