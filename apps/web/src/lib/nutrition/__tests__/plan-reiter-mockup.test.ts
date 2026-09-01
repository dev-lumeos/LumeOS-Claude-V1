// G-310 / G-311: der Plan-Reiter folgt der Attrappe.
//
// ══ DIE ATTRAPPE IST DIE VORLAGE ════════════════════════════════════
//
// **Tom, 2026-09-01:** *,,es war definiert das attrappe mockup bleibt
// im code reaktivierbar und das angebunden ist eine kopie des mockups
// angebunden."*
//
// `[cmd]` **Herkunft der Attrappe: `theme-v1/module-nutrition-spec.jsx`,
// `MealPlansView` Zeile 334-521** (Dateikopf von `tab-plans.tsx`).
//
// `[read]` **Die Waechter messen die Wirkung, nicht das Wort.**
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  einhaltungVon, quoteVon, tagesQuoten, schnittQuote,
  herkunftVon, HERKUNFT_BADGE, HERKUNFT_FARBE, HERKUNFT_TEXT,
  type LogZeile,
} from '../plan-lage'

// `[cmd]` **Pfad aus der Lage DIESER Datei** — mit `process.cwd()`
// gruen aus der Wurzel und rot im Gate (G-291).
const WURZEL = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)), '../../../../../..',
)
const lies = (f: string) => fs.readFileSync(path.join(WURZEL, f), 'utf8')
const ohneKommentare = (f: string) => lies(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const TAB = 'apps/web/src/app/v2/nutrition/tab-plans.tsx'
const ECHT = 'apps/web/src/app/v2/nutrition/plans-echt.tsx'
const DETAIL = 'apps/web/src/app/v2/nutrition/plan-detail.tsx'
const PLANNER = 'apps/web/src/app/v2/nutrition/tab-planner-echt.tsx'
const WERKBANK = 'apps/web/src/app/v2/nutrition/plan-werkbank-ui.tsx'
const LESEN = 'apps/web/src/lib/nutrition/plan-lesen.ts'
const EINTRAEGE = 'apps/web/src/app/v2/nutrition/plan-eintraege.tsx'

test('die Dateiproben finden ihre Dateien — unabhaengig vom Startort', () => {
  for (const f of [TAB, ECHT, DETAIL, PLANNER, WERKBANK, LESEN, EINTRAEGE]) {
    assert.ok(fs.existsSync(path.join(WURZEL, f)), `${f} nicht gefunden`)
    assert.ok(lies(f).length > 500, `${f} ist verdaechtig kurz`)
  }
  assert.ok(fs.existsSync(path.join(WURZEL, 'pnpm-workspace.yaml')),
    `WURZEL zeigt nicht auf das Repo: ${WURZEL}`)
})

// ══ DIE ATTRAPPE BLEIBT REAKTIVIERBAR ═══════════════════════════════

test('G-310: die Attrappen-Zweige stehen noch — sie SIND die Vorlage', () => {
  // **Tom:** *,,attrappe mockup bleibt im code reaktivierbar."*
  //
  // `[read]` **Wer eine Kachel anbindet, ERSETZT die Attrappe nicht**
  // — sie bleibt als `{d ? <Echt/> : <Attrappe/>}` stehen. **Ohne sie
  // gibt es keine Vorlage mehr, gegen die man pruefen kann.**
  // `[cmd]` **BERICHTIGT nach der Sabotageprobe:** hier stand
  // `>= 4`, **und es sind sechs** — eine einzelne Marke konnte
  // verschwinden, ohne dass der Waechter fiel.
  //
  // `[read]` **Gezaehlt, nicht verglichen** (G-216): eine Untergrenze
  // erlaubt Verlust, eine feste Zahl nicht. **Kommt eine Kachel dazu,
  // faellt der Waechter auch** — und das ist richtig, dann gehoert
  // die Zahl bewusst nachgezogen.
  const t = lies(TAB)
  const zweige = (t.match(/attrappe=\{ATTRAPPE\}/g) ?? []).length
  assert.equal(zweige, 6,
    `${zweige} Attrappen-Zweige statt 6 — die Vorlage wird ab- oder aufgebaut`)

  // Und das Muster: die Attrappe haengt an den DATEN, nicht an einem
  // Schalter. `[read]` **Ein Schalter waere abschaltbar, Daten nicht.**
  const s = ohneKommentare(TAB)
  assert.match(s, /\{d \? <PlanKopfEcht/, 'die Kopfkarte haengt nicht an `d`')
  assert.match(s, /\{d \? <EinhaltungEcht/, 'die Compliance haengt nicht an `d`')
})

// ══ DIE TITEL KOMMEN AUS DER ATTRAPPE ═══════════════════════════════

test('G-310: die Kopien tragen die Titel der Attrappe, keine erfundenen', () => {
  // `[cmd]` **Gemessen am 2026-09-01: drei Titel waren erfunden** —
  // `Planumfang` (Attrappe: `Plan settings`), `Einhaltung` (Attrappe:
  // `7-day compliance`), `Lebenszyklus` (Attrappe: `Lifecycle
  // types`). `[cmd]` **Und `Plan-Eintraege`** statt `Today's ghost
  // entries`.
  //
  // `[read]` **Ein erfundener Titel neben einer Attrappe, die einen
  // anderen traegt, ist genau das Gegenteil einer Kopie.**
  const e = ohneKommentare(ECHT)
  const ein = ohneKommentare(EINTRAEGE)

  for (const [titel, datei, quelle] of [
    ['Plan settings', e, 'Attrappe Z. 246'],
    ['7-day compliance', e, 'Attrappe Z. 301'],
    ['Lifecycle types', e, 'Attrappe Z. 274'],
    ["Today's ghost entries", ein, 'Attrappe Z. 188'],
  ] as const) {
    assert.ok(datei.includes(`title="${titel}"`),
      `der Titel „${titel}" fehlt — er steht in der ${quelle}`)
  }

  // Und die erfundenen sind weg.
  for (const erfunden of ['Planumfang', 'Einhaltung', 'Plan-Einträge']) {
    assert.ok(!e.includes(`title="${erfunden}"`) && !ein.includes(`title="${erfunden}"`),
      `der erfundene Titel „${erfunden}" lebt weiter`)
  }
})

// ══ WAS DIE ATTRAPPE ZEIGT UND DIE KOPIE ZEIGEN MUSS ════════════════

test('G-310: Ring und ausgeschriebene Rechnung — wie in der Attrappe', () => {
  // `[cmd]` **Attrappe Z. 153:** ein `Ring` mit der Compliance.
  // `[cmd]` **Attrappe Z. 164-166:** die Rechnung ausgeschrieben.
  //
  // `[cmd]` **Die alte Begruendung *,,ohne Ring, weil
  // `meal_plan_entries` keinen Status fuehrt"* ist seit G-309
  // hinfaellig** — der Status liegt im Log, und dort entstehen Zeilen.
  const e = ohneKommentare(ECHT)
  const von = e.indexOf('export function PlanKopfEcht')
  assert.notEqual(von, -1, 'die Kopfkarte fehlt')
  const bis = e.indexOf('\nexport ', von + 10)
  const block = e.slice(von, bis === -1 ? undefined : bis)

  assert.match(block, /<Ring\b/, 'der Compliance-Ring fehlt')
  // `[read]` **Die Rechnung nennt ALLE vier Zahlen** — sonst ist sie
  // nicht nachvollziehbar.
  for (const teil of ['e.bestaetigt', 'e.abgewichen', 'e.ausgelassen', 'e.offen']) {
    assert.ok(block.includes(teil),
      `die Rechnung nennt ${teil} nicht — die Attrappe schreibt sie aus`)
  }
  // `[read]` **Ohne Entscheidung kein Ring** — ein Ring auf 0 %
  // behauptet, der Plan sei nicht eingehalten worden (C-323).
  assert.match(block, /quote !== null && \(/,
    'der Ring erscheint auch ohne entschiedene Zeile')

  // `[read]` **Und die Rechnung sagt dann, dass nichts entschieden
  // ist** — statt „(0 + 0) / (0 + 0 + 0) = 0 %", was eine Aussage
  // ueber einen Plan waere, den niemand angefasst hat.
  assert.match(block, /quote === null\s*\n?\s*\? `noch nichts entschieden/,
    'die Rechnung behauptet Zahlen, wo nichts entschieden ist')
})

test('G-310: die Sparkline der Attrappe, mit Avg · Deviations · Skips', () => {
  // `[cmd]` **Attrappe Z. 301-306.**
  const e = ohneKommentare(ECHT)
  const von = e.indexOf('export function EinhaltungEcht')
  const bis = e.indexOf('\nexport ', von + 10)
  const block = e.slice(von, bis === -1 ? undefined : bis)

  assert.match(block, /<Sparkline\b/, 'die Sparkline fehlt')
  for (const zahl of ['Avg', 'Deviations', 'Skips']) {
    assert.ok(block.includes(zahl), `die Zahl „${zahl}" fehlt`)
  }
  // `[read]` **Eine Linie durch EINEN Punkt ist keine Kurve** —
  // sondern eine Behauptung ueber einen Verlauf, den niemand gemessen
  // hat.
  assert.match(block, /filter\(x => x\.quote !== null\)\.length >= 2/,
    'die Sparkline zeichnet auch bei einem einzigen Datenpunkt')
})

// ══ DIE COMPLIANCE-FORMEL STAMMT AUS SPEC_09 ════════════════════════

test('G-310/SPEC_09: abgewichen zaehlt als Erfolg', () => {
  // `[cmd]` **`SPEC_09` Abschnitt 2, Regeln:** *,,`deviated` zaehlt
  // als Erfolg fuer Compliance (User hat sich aktiv entschieden)."*
  // `[cmd]` **Und `theme-v1` Zeile 340 rechnet genauso:**
  // `((confirmed + deviated) / (confirmed + deviated + skipped))`.
  //
  // **Tom, 2026-09-01:** *,,Compliance misst, ob jemand seinen Plan
  // verfolgt — nicht, ob er gehorcht."*
  const zeile = (n: number, s: LogZeile['status']): LogZeile[] =>
    Array.from({ length: n }, (_, i) => ({
      execution_date: `2026-09-${String(i + 1).padStart(2, '0')}`,
      status: s, confirmation_mode: null, deviation_kcal: null,
    }))

  assert.equal(quoteVon(einhaltungVon([
    ...zeile(1, 'confirmed'), ...zeile(1, 'deviated'),
  ])), 100, 'abgewichen senkt die Quote')

  // `[read]` **Ausgelassen bleibt ein Misserfolg** — wer nichts isst,
  // hat den Plan nicht umgesetzt.
  assert.equal(quoteVon(einhaltungVon([
    ...zeile(1, 'confirmed'), ...zeile(1, 'skipped'),
  ])), 50)

  // `[cmd]` **Offen zaehlt NICHT im Nenner** — SPEC_09: *,,kein
  // Zwang, kein Malus"*.
  const mitOffen = einhaltungVon([
    ...zeile(2, 'confirmed'), ...zeile(8, 'pending'),
  ])
  assert.equal(mitOffen.entschieden, 2)
  assert.equal(quoteVon(mitOffen), 100)

  // Und ohne Entscheidung gibt es keine Zahl, nicht null Prozent.
  assert.equal(quoteVon(einhaltungVon(zeile(5, 'pending'))), null)
})

test('G-310: die Sieben-Tage-Reihe hat sieben Tage — auch leere', () => {
  // `[read]` **Eine Sparkline mit Luecken zeigt eine falsche
  // Steigung.** `[cmd]` **Jeder Tag kommt vor, Tage ohne Entscheidung
  // tragen `null`** — nicht `0`.
  const logs: LogZeile[] = [
    { execution_date: '2026-09-01', status: 'confirmed', confirmation_mode: null, deviation_kcal: null },
    { execution_date: '2026-09-03', status: 'skipped', confirmation_mode: null, deviation_kcal: null },
  ]
  const reihe = tagesQuoten(logs, '2026-09-05', 7)
  assert.equal(reihe.length, 7, 'die Reihe hat nicht sieben Tage')
  assert.equal(reihe[0].datum, '2026-08-30', 'die Reihe beginnt falsch')
  assert.equal(reihe[6].datum, '2026-09-05', 'die Reihe endet falsch')

  const am1 = reihe.find(t => t.datum === '2026-09-01')
  assert.equal(am1?.quote, 100)
  const am3 = reihe.find(t => t.datum === '2026-09-03')
  assert.equal(am3?.quote, 0, 'ausgelassen ist 0 %, nicht null')
  const am2 = reihe.find(t => t.datum === '2026-09-02')
  assert.equal(am2?.quote, null, 'ein Tag ohne Zeile traegt 0 statt null')

  // `[read]` **Der Schnitt geht ueber Tage MIT Aussage** — sonst zoege
  // jeder leere Tag ihn gegen null.
  assert.equal(schnittQuote(reihe), 50, '(100 + 0) / 2')
  assert.equal(schnittQuote(tagesQuoten([], '2026-09-05', 7)), null)
})

// ══ DIE HERKUNFT IST EIN BADGE, KEINE KACHEL ════════════════════════

test('G-310: vier Herkuenfte, und `self_created` traegt kein Badge', () => {
  // `[cmd]` **Der CHECK erlaubt VIER Werte** — am 2026-09-01 gemessen.
  // `[cmd]` **`SPEC_03` Flow 3 Schritt 2: *,,Eigene (source: user) —
  // ohne Label"*.**
  assert.equal(herkunftVon('buddy'), 'buddy',
    'buddy faellt auf `unbekannt` — Mockup Z. 14 und SPEC_03 nennen es')
  assert.equal(herkunftVon('marketplace'), 'marketplace')
  assert.equal(herkunftVon('coach_created'), 'coach_created')
  assert.equal(herkunftVon('self_created'), 'self_created')
  assert.equal(herkunftVon(null), 'unbekannt')
  assert.equal(herkunftVon('etwas_anderes'), 'unbekannt')

  // `[read]` **Ohne Label heisst: KEIN Badge**, nicht ein leeres.
  assert.equal(HERKUNFT_BADGE.self_created, null,
    'ein eigener Plan traegt ein Badge — SPEC_03 sagt „ohne Label"')
  assert.equal(HERKUNFT_BADGE.unbekannt, null,
    'unbekannte Herkunft traegt ein Badge statt des Satzes')
  assert.equal(HERKUNFT_BADGE.coach_created, 'Von Coach')
  assert.equal(HERKUNFT_BADGE.marketplace, 'Marketplace')
  assert.equal(HERKUNFT_BADGE.buddy, 'AI erstellt')

  // Die Farben stammen aus dem Mockup (Z. 11, 13, 15).
  assert.equal(HERKUNFT_FARBE.marketplace, '#f97316')
  assert.equal(HERKUNFT_FARBE.coach_created, '#3b82f6')
  assert.equal(HERKUNFT_FARBE.self_created, null)

  // Und jede Herkunft hat einen Text — auch die ohne Badge.
  for (const h of ['self_created', 'coach_created', 'marketplace',
    'buddy', 'unbekannt'] as const) {
    assert.ok(HERKUNFT_TEXT[h].length > 3, `${h} ohne Text`)
  }
})

test('G-310/A-59: die Herkunfts-KACHEL ist entfernt', () => {
  // `[cmd]` **Sie stand in keiner Attrappe** — sie war aus dem Schema
  // abgeleitet, eine Kachel je Spaltengruppe.
  //
  // `[cmd]` **In der Vorlage ist die Herkunft ein Badge an der
  // Plankarte** (Mockup Z. 89).
  const e = ohneKommentare(ECHT)
  const t = ohneKommentare(TAB)
  assert.doesNotMatch(e, /(?<![a-zA-Z0-9_])HerkunftEcht(?![a-zA-Z0-9_])/,
    'HerkunftEcht lebt weiter')
  assert.doesNotMatch(t, /(?<![a-zA-Z0-9_])HerkunftEcht(?![a-zA-Z0-9_])/,
    'HerkunftEcht wird noch gerendert')

  // Das Badge steht in der Plankarte, und zwar bedingt.
  const d = ohneKommentare(DETAIL)
  assert.match(d, /HERKUNFT_BADGE\[herkunft\] && \(/,
    'das Badge erscheint auch ohne Beschriftung')
  assert.match(d, /HERKUNFT_FARBE\[herkunft\]/, 'die Badge-Farbe fehlt')
})

// ══ WAS NICHT IN DER VORLAGE STEHT, IST WEG ═════════════════════════

test('G-310: fuenf Elemente ohne Vorlage sind entfernt', () => {
  // `[cmd]` **BERICHTIGT beim ersten Lauf:** der Waechter prueft die
  // KOPIE, nicht die Attrappe. **In `tab-plans.tsx` steht
  // `<Row label="Next restart">` weiter** — das ist die Vorlage, und
  // sie bleibt reaktivierbar (Tom, 2026-09-01).
  //
  // `[read]` **Und `ohneKommentare` raeumt `/** */`-Bloecke nur
  // teilweise** — die Begruendungen fuer die Entfernung nennen die
  // Namen. **Deshalb wird auf `<Row label="...">` geprueft, also auf
  // die WIRKUNG, nicht auf das Wort** (G-216/G-247).
  const e = ohneKommentare(ECHT)

  // `[cmd]` **`Next restart` behauptet einen Termin, an dem etwas
  // geschieht.** `[read]` **Nach C-373/E-42 geschieht nichts von
  // selbst** — der Ablauf erzeugt eine Frage, der Nutzer waehlt.
  assert.ok(!e.includes('label="Next restart"'),
    '„Next restart" wird gerendert — ein Termin ohne Ausfuehrer')

  // `[cmd]` **`confirmation_mode` liegt an `meal_plan_logs`** — je
  // Ausfuehrung, nicht als Planeinstellung. **Und MealCam gibt es
  // nicht** (G-276).
  assert.ok(!e.includes('label="Confirm mode"'),
    '„Confirm mode" wird gerendert — er steht am Log, nicht am Plan')

  // `[cmd]` **E-42 loest die Plansperre ab** — sie haengt an der
  // geloggten Position.
  for (const weg of ['read-only while active', 'Pause plan', 'Duplicate']) {
    assert.ok(!e.includes(weg), `„${weg}" lebt in der Kopie weiter (E-42)`)
  }

  // `[read]` **Und die Gegenprobe: in der ATTRAPPE stehen sie noch.**
  // `[cmd]` **Sonst pruefte der Waechter eine Vorlage, die es nicht
  // mehr gibt** — und wuerde gruen bleiben, waehrend beide weg sind.
  const attrappe = lies(TAB)
  assert.ok(attrappe.includes('Next restart'),
    'die Attrappe hat „Next restart" verloren — dann fehlt die Vorlage')
  assert.ok(attrappe.includes('read-only while active'),
    'die Attrappe hat den Sperrhinweis verloren')
})

// ══ DIE BIBLIOTHEK — E-41 UND SPEC_03 FLOW 3 ════════════════════════

test('G-310: alle Plaene stehen im Reiter, nicht nur der aktive', () => {
  // `[cmd]` **Am 2026-09-01 gemessen: vier Plaene bei `test-user`,
  // EINER erschien.** `[cmd]` **`allePlaene` war geladen, ging aber
  // nur an den Planner.**
  //
  // `[cmd]` **Drei Quellen verlangen die Liste:** die Attrappe
  // (Z. 343), **E-41** (*,,Meal plans ist die Bibliothek"*) und
  // **`SPEC_03` Flow 3 Schritt 2** (*,,Uebersicht zeigt alle
  // verfuegbaren Plaene"*).
  const e = ohneKommentare(ECHT)
  const t = ohneKommentare(TAB)
  assert.match(e, /export function PlanBibliothekEcht/, 'die Bibliothek fehlt')
  assert.match(t, /<PlanBibliothekEcht/, 'die Bibliothek wird nicht gerendert')
  assert.match(t, /allePlaene=\{allePlaene\}|plaene=\{allePlaene\}/,
    'die Bibliothek bekommt die Plaene nicht')

  // `[read]` **Der aktive Plan steht oben in voller Breite** — ihn
  // hier zu wiederholen waere derselbe Plan zweimal. **Das Mockup
  // macht es genauso:** `plans.slice(1)` (Z. 84).
  assert.match(e, /p\.id !== aktivId/,
    'die Bibliothek zeigt den aktiven Plan doppelt')
})

// ══ G-311: DIE DREI SACKGASSEN ══════════════════════════════════════

test('G-311/1: „In der Werkbank" fuehrt wirklich in die Werkbank', () => {
  // `[cmd]` **Der Knopf setzte einen `useState` in der Liste** — und
  // das Raster darunter zeigte weiter den aktiven Plan.
  //
  // `[read]` **Der Zustand blieb im Client, der Plan wird auf dem
  // Server geladen** — sie konnten sich gar nicht treffen.
  const w = ohneKommentare(WERKBANK)
  assert.match(w, /router\.push\(`\?\$\{q\.toString\(\)\}`/,
    'der Knopf schreibt die Wahl nicht in die URL')
  assert.match(w, /q\.set\('plan', id\)/, 'die Kennung fehlt in der URL')
  // `[read]` **Kein Client-Zustand mehr** — sonst gaebe es zwei
  // Wahrheiten ueber denselben Plan.
  assert.doesNotMatch(w, /const \[gewaehlt, setGewaehlt\]/,
    'der Client-Zustand lebt weiter — er kann von der URL abweichen')

  // Und der Leseweg nimmt sie entgegen.
  const l = ohneKommentare(LESEN)
  assert.match(l, /export async function ladePlan\(planId\?: string \| null\)/,
    'ladePlan kann keinen Plan gezielt laden')
  assert.match(l, /planId \? liste\.find\(p => text\(p\.id\) === planId\) : null/,
    'die Kennung waehlt den Plan nicht aus')
  // `[read]` **Eine unbekannte Kennung faellt zurueck** — sie kommt
  // aus der URL und kann veraltet sein.
  assert.match(l, /\?\?\s*liste\[0\] \?\? null/,
    'eine veraltete Kennung ergibt ein leeres Raster')
})

test('G-311/2: ein Rezept im Raster laesst sich oeffnen', () => {
  // **Tom, 2026-09-01:** *,,eingetragene recipes sind ja ok, aber
  // mindestens bei klick drauf will man sehen was darin ist an
  // lebensmittel und details."*
  const p = ohneKommentare(PLANNER)
  assert.match(p, /function ZutatenListe/, 'die Zutatenliste fehlt')
  assert.match(p, /<ZutatenListe/, 'sie wird nicht gerendert')
  // `[read]` **NUR ein Rezept** — ein BLS-Eintrag ist sein eigener
  // Inhalt. **Ein Knopf, der nichts oeffnet, waere die naechste
  // Sackgasse.**
  assert.match(p, /e\.entry_type === 'recipe' \? \(/,
    'auch BLS-Eintraege bekommen einen Knopf')

  // `[cmd]` **Die Zutaten kommen aus demselben Verbund** — keine
  // zweite Runde (G-252).
  const l = ohneKommentare(LESEN)
  assert.match(l, /recipe_ingredients \( id, amount_g, food_name_snapshot/,
    'die Zutaten werden nicht mitgelesen')
  assert.match(l, /posten: \(Array\.isArray\(r\.recipe_ingredients\)/,
    'die Zutaten landen nicht im Ergebnis')

  // `[read]` **`planned_servings / servings` skaliert** — dieselbe
  // Rechnung wie beim Bestaetigen (G-309). **Sonst zeigte das Raster
  // andere Mengen als das Tagebuch.**
  assert.match(p, /\(portionen \?\? 1\) \/ proRezept/,
    'die Menge skaliert nicht mit der Portionszahl')
})

test('G-311/3: die Rezepte-Auflistung unter dem Raster ist entfernt', () => {
  // **Tom, 2026-09-01:** *,,darunter rezepte auflistung? fuer was ist
  // das zeigt nur irgendwelche daten an."*
  //
  // `[cmd]` **Sie stand in keiner Spec und in keinem Mockup** — und
  // ist seit dem Rezepte-Reiter (G-289) doppelt.
  const p = ohneKommentare(PLANNER)
  assert.doesNotMatch(p, /(?<![a-zA-Z0-9_])RezeptListe(?![a-zA-Z0-9_])/,
    'die Rezepte-Auflistung lebt weiter (A-59)')
  // `[read]` **Und keine Tabelle mit Kueche/Koennen/Zeit** — das war
  // ihre Form.
  assert.ok(!p.includes('<th>Rezept</th>'),
    'die Rezepttabelle steht noch im Planner')
})
