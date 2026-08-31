// G-291 / G-292 / G-293 / G-295: die vier Insights-Kacheln.
//
// `[read]` **Die Waechter messen die Wirkung, nicht das Wort** —
// G-216/G-246/G-247 sind dreimal daran gescheitert, dass eine
// Textsuche gruen blieb, waehrend die Sache kaputt war.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  FENSTER, imFenster, schnitt, pfadMitLuecken,
  deckung, stufeVon, STUFE_FARBE, STUFE_TEXT,
  istVollstaendig, luekenSatz, restVon,
  anteil, belastbarkeit, sortiere, DUENN_SATZ,
  DEFIZIT_WIDERSPRUCH,
  type TrendTag, type MakroKnoten, type Flag, type Stufe,
} from '../insights-lage'

/**
 * `[cmd]` **Der Pfad kommt aus der Lage DIESER Datei, nicht aus
 * `process.cwd()`.**
 *
 * `[read]` **Gemessen am 2026-08-31:** mit `cwd` liefen alle 14
 * Dateiproben gruen, solange ich sie aus der Wurzel startete — **und
 * fielen im Gate**, das aus `apps/web/` laeuft. **Eine Probe, die vom
 * Startort abhaengt, prueft nicht die Sache, sondern den Startort.**
 */
const WURZEL = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)), '../../../../../..',
)
const lies = (f: string) => fs.readFileSync(path.join(WURZEL, f), 'utf8')
/** Kommentare weg — sonst findet ein Waechter sein eigenes Wort (G-186). */
const ohneKommentare = (f: string) => lies(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const KACHELN = 'apps/web/src/app/v2/nutrition/insights-kacheln.tsx'
const LESEWEG = 'apps/web/src/lib/nutrition/insights-read.ts'
const ANSICHT = 'apps/web/src/app/v2/nutrition/ansicht.tsx'

/**
 * Den Block einer Funktion herausschneiden.
 *
 * `[read]` **Ohne das sucht jede Probe im ganzen Modul und ist immer
 * gruen** — der Fehler aus `pruefung-sucht-im-zu-grossen-heuhaufen`.
 */
function block(quelle: string, name: string): string {
  const start = quelle.indexOf(`export function ${name}`)
  assert.notEqual(start, -1, `${name} nicht gefunden`)
  const rest = quelle.slice(start)
  const naechste = rest.slice(1).search(/^export function /m)
  return naechste === -1 ? rest : rest.slice(0, naechste + 1)
}

const tag = (datum: string, kcal: number | null): TrendTag =>
  ({ datum, kcal, protein: kcal, carbs: kcal, fett: kcal })

test('die Dateiproben finden ihre Dateien — unabhaengig vom Startort', () => {
  // `[cmd]` **Gemessen am 2026-08-31: aus der Wurzel gestartet liefen
  // alle 14 Dateiproben gruen, aus `apps/web/` fielen sie** — das Gate
  // startet dort. `[read]` **Eine Probe, die stillschweigend nichts
  // findet, ist schlimmer als keine.** Deshalb steht diese zuerst.
  for (const f of [KACHELN, LESEWEG, ANSICHT]) {
    assert.ok(fs.existsSync(path.join(WURZEL, f)), `${f} nicht gefunden`)
    assert.ok(lies(f).length > 500, `${f} ist verdaechtig kurz`)
  }
  // Und die Wurzel ist wirklich die Wurzel, nicht irgendein Ordner.
  assert.ok(fs.existsSync(path.join(WURZEL, 'pnpm-workspace.yaml')),
    `WURZEL zeigt nicht auf das Repo: ${WURZEL}`)
})

// ══ G-291: der Zeitraum ══════════════════════════════════════════

test('G-291: das Fenster ist beidseitig begrenzt — kuenftige Tage fallen weg', () => {
  // `[cmd]` **Gemessen am 2026-08-31: `daily_summary` traegt fuer dev
  // 104 vergangene und 77 KUENFTIGE Tage**, bis 2026-11-16.
  // `[read]` **`entry_date > current_date - 7` lieferte 55 statt 7.**
  const reihe = [
    tag('2026-08-20', 100),  // vor dem Fenster
    tag('2026-08-25', 200),
    tag('2026-08-31', 300),  // heute
    tag('2026-09-05', 999),  // KUENFTIG — darf nicht mitzeichnen
    tag('2026-11-16', 999),
  ]
  const sieben = imFenster(reihe, 7, '2026-08-31')
  assert.deepEqual(sieben.map(t => t.datum), ['2026-08-25', '2026-08-31'])
  // Die Wirkung, nicht das Wort: kein Wert aus der Zukunft im Schnitt.
  assert.equal(schnitt(sieben, 'kcal'), 250)
})

test('G-291: jedes Fenster kappt oben — nicht nur das kleinste', () => {
  // `[read]` **Ein Waechter, der nur 7 prueft, laesst 14 und 30
  // ungeschuetzt.** Deshalb alle drei, gezaehlt.
  const reihe = [tag('2026-08-31', 100), tag('2026-09-30', 999)]
  let geprueft = 0
  for (const f of FENSTER) {
    const r = imFenster(reihe, f, '2026-08-31')
    assert.deepEqual(r.map(t => t.datum), ['2026-08-31'],
      `Fenster ${f} laesst die Zukunft durch`)
    geprueft += 1
  }
  assert.equal(geprueft, 3, 'FENSTER hat nicht mehr drei Eintraege')
})

test('G-291: der Schnitt zaehlt nur belegte Tage', () => {
  // `[read]` **Ein `null` als 0 zu zaehlen zoege den Schnitt herunter
  // und behauptete einen Fastentag.**
  const reihe = [tag('2026-08-29', 200), tag('2026-08-30', null), tag('2026-08-31', 400)]
  assert.equal(schnitt(reihe, 'kcal'), 300)
  assert.equal(schnitt([tag('2026-08-31', null)], 'kcal'), null)
})

test('G-291: die Kurve bricht an der Luecke ab, statt sie zu ueberspannen', () => {
  // `[read]` **Die Funktion wird AUSGEFUEHRT, nicht gelesen.** Eine
  // Textprobe auf `neu = true` blieb gruen, als die Sabotageprobe den
  // Ruecksetzer entfernte — die Deklaration steht ja weiter oben.
  // **Derselbe Fehler wie G-216/G-246: das Wort statt der Wirkung.**
  const mitLuecke = pfadMitLuecken([1, null, 3], i => i, v => v)
  const ohne = pfadMitLuecken([1, 2, 3], i => i, v => v)
  const mCount = (d: string) => (d.match(/M/g) ?? []).length

  // ZWEI Neuansaetze bei einer Luecke, EINER ohne.
  assert.equal(mCount(mitLuecke), 2,
    `die Kurve ueberspannt die Luecke: ${mitLuecke}`)
  assert.equal(mCount(ohne), 1,
    `eine ununterbrochene Reihe wird zerteilt: ${ohne}`)
  // Und der Luecken-Tag bekommt keinen Punkt: drei Werte, einer
  // davon `null`, ergeben ZWEI Koordinatenpaare.
  assert.equal((mitLuecke.match(/[ML]/g) ?? []).length, 2,
    `der Tag ohne Eintrag wird gezeichnet: ${mitLuecke}`)
  assert.equal((ohne.match(/[ML]/g) ?? []).length, 3)

  // Und der Aufrufer benutzt sie wirklich.
  assert.match(ohneKommentare(KACHELN), /d=\{pfadMitLuecken\(/,
    'der Pfad wird nicht mit pfadMitLuecken gezeichnet')
})

test('G-291: LineChart wird NICHT benutzt — er kann keine Luecke', () => {
  // `[read]` **`LineChart` nimmt `number[]`.** Ein Tag ohne Eintrag
  // muesste dort 0 werden oder wegfallen — **beides luegt.**
  const s = ohneKommentare(KACHELN)
  assert.doesNotMatch(s, /(?<![a-zA-Z0-9_])LineChart(?![a-zA-Z0-9_])/,
    'LineChart ist zurueck — er kann die Luecke nicht zeigen')
})

// ══ G-295: die Heatmap ═══════════════════════════════════════════

test('G-295: ohne Ziel keine Deckung — und keine erfundene 100 %', () => {
  // `[cmd]` **Die Vorlage `HeatmapView.js` rechnet gegen ein festes
  // `calTarget = 2100`.** `[read]` **Eine erfundene Zahl faerbte hier
  // 28 Felder, ohne dass jemand saehe, dass sie erfunden ist.**
  assert.equal(deckung(2500, null), null)
  assert.equal(deckung(null, 2500), null)
  assert.equal(deckung(2500, 0), null)
  assert.equal(deckung(2500, 2500), 100)
})

test('G-295: die fuenf Stufen der Vorlage, an ihren Grenzen', () => {
  // `[cmd]` `HeatmapView.js:16-21` — 95 / 85 / 75.
  const faelle: Array<[number | null, Stufe]> = [
    [null, 'leer'], [95, 'optimal'], [94, 'gut'], [85, 'gut'],
    [84, 'knapp'], [75, 'knapp'], [74, 'gering'], [0, 'gering'],
  ]
  for (const [pct, erwartet] of faelle) {
    assert.equal(stufeVon(pct), erwartet, `${pct} ist nicht ${erwartet}`)
  }
  // Jede Stufe hat Farbe UND Text — sonst ist die Legende lueckenhaft.
  const stufen: Stufe[] = ['optimal', 'gut', 'knapp', 'gering', 'leer']
  for (const st of stufen) {
    assert.ok(STUFE_FARBE[st], `${st} ohne Farbe`)
    assert.ok(STUFE_TEXT[st], `${st} ohne Text`)
  }
})

test('G-295: die Kachel zeigt den Hinweis statt eines gefaerbten Gitters', () => {
  const s = ohneKommentare(KACHELN)
  const b = block(s, 'HeatmapKachel')
  // Die Wirkung: bei `zielKcal === null` wird frueh zurueckgekehrt,
  // BEVOR das Gitter gebaut wird.
  const zweig = b.indexOf('d.zielKcal === null')
  const gitter = b.indexOf('gridTemplateColumns')
  assert.notEqual(zweig, -1, 'der Zweig ohne Ziel fehlt')
  assert.notEqual(gitter, -1, 'das Gitter fehlt')
  assert.ok(zweig < gitter,
    'das Gitter wird gebaut, bevor das fehlende Ziel geprueft ist')
})

test('G-297: das Gitter fuellt die Kachelbreite — ohne sie zu sprengen', () => {
  // **BERICHTIGT am 2026-08-31.** Der vorige Auftrag hiess
  // *,,tagesdeckung geht kleiner"*, und dieser Waechter sicherte eine
  // Deckelung auf 26 px.
  //
  // **Tom danach:** *,,die hoehe ist nun definiert fuer tagesdeckung,
  // wieso verteilt man dann nicht auf optimale groesse die grafik
  // darin?"*
  //
  // `[cmd]` **Gemessen: beide Kacheln 386 px hoch, unter dem
  // 26-px-Gitter blieben 58 px leer.** `[read]` **Die Deckelung war
  // die falsche Antwort** — das Gitter soll die Kachel ausfuellen.
  const b = block(ohneKommentare(KACHELN), 'HeatmapKachel')
  assert.doesNotMatch(b, /minmax\(0, 26px\)/,
    'die alte Deckelung ist zurueck — das Gitter fuellt die Kachel nicht')
  assert.match(b, /repeat\(7, minmax\(0, 1fr\)\)/,
    'das Gitter waechst nicht mit der Kachelbreite')
  // `[read]` **Die 0 in `minmax(0, 1fr)` ist nicht schmueckend:**
  // ohne sie kann eine Spalte nicht unter ihre Inhaltsbreite
  // schrumpfen, und auf 375 px sprengt das Gitter die Karte.
  assert.doesNotMatch(b, /repeat\(7, 1fr\)/,
    'ohne minmax(0, …) sprengt das Gitter die Karte auf schmalen Schirmen')
  // Und die Felder bleiben quadratisch — sonst wird aus der Breite
  // keine Hoehe.
  assert.match(b, /aspectRatio: '1'/, 'die Felder sind nicht mehr quadratisch')

  // `[cmd]` **A-59: `tagNummer` ist entfernt, nicht nur unbenutzt.**
  const lage = ohneKommentare('apps/web/src/lib/nutrition/insights-lage.ts')
  assert.doesNotMatch(lage, /(?<![a-zA-Z0-9_])tagNummer(?![a-zA-Z0-9_])/,
    'tagNummer lebt weiter, obwohl niemand sie ruft')
  assert.doesNotMatch(b, /(?<![a-zA-Z0-9_])tagNummer(?![a-zA-Z0-9_])/,
    'die Ziffer steht wieder im Feld')

  // Und die Legende ist eine Zeile, keine Liste — sonst sind es
  // wieder fuenf Zeilen unter dem Gitter.
  assert.match(b, /flexWrap: 'wrap'/, 'die Legende ist keine Flex-Zeile mehr')
})

test('G-295: alle fuenf Stufen stehen in der Legende', () => {
  const b = block(ohneKommentare(KACHELN), 'HeatmapKachel')
  const legende = b.match(/\['optimal', 'gut', 'knapp', 'gering', 'leer'\]/)
  assert.ok(legende, 'die Legende fuehrt nicht alle fuenf Stufen')
})

// ══ G-293: die Fetthierarchie ════════════════════════════════════

const knoten = (
  code: string, wert: number | null, vollstaendig = 30, tage = 30,
  kinder: MakroKnoten[] = [],
): MakroKnoten => ({ code, name: code, wert, einheit: 'g', vollstaendig, tage, kinder })

test('G-293: die Differenz zwischen Ganzem und Teilen wird gezeigt', () => {
  // `[cmd]` **Gemessen 2026-08-31, 30 Tage:** FAT 65,40 gegen
  // 14,07 + 29,95 + 11,29 = 55,31. **Differenz 10,09.**
  const fat = knoten('FAT', 65.40, 30, 30, [
    knoten('FASAT', 14.07), knoten('FAMS', 29.95), knoten('FAPU', 11.29),
  ])
  assert.equal(restVon(fat), 10.09)
})

test('G-293: uebersteigen die Teile das Ganze, gibt es keinen Rest', () => {
  // `[cmd]` **Gefunden am 2026-08-31:** `FIBT` stand unter `CHO`, und
  // die Teile ergaben 320,78 gegen 281,86 — **`CHO` ist
  // *Kohlenhydrate, VERFUEGBAR*, Ballaststoffe zaehlen nicht hinein.**
  // `[read]` **Ein negativer „Rest" ist ein Zuordnungsfehler**, keine
  // unaufgeschluesselte Menge — und darf nicht als solche erscheinen.
  const falsch = knoten('CHO', 281.86, 30, 30, [
    knoten('SUGAR', 44.45), knoten('STARCH', 234.54),
    knoten('POLYL', 2.36), knoten('FIBT', 39.43),  // gehoert nicht hierher
  ])
  assert.equal(restVon(falsch), null)

  // Richtig zugeordnet bleibt ein kleiner, positiver Rest.
  const richtig = knoten('CHO', 281.86, 30, 30, [
    knoten('SUGAR', 44.45), knoten('STARCH', 234.54), knoten('POLYL', 2.36),
  ])
  assert.equal(restVon(richtig), 0.51)
})

test('G-293: Ballaststoffe stehen NEBEN den Kohlenhydraten, nicht darunter', () => {
  // `[read]` **Die Wirkung im Leseweg**, nicht nur die Rechnung.
  const l = ohneKommentare(LESEWEG)
  const start = l.indexOf('stand.makroBaum = [')
  assert.notEqual(start, -1, 'der Baum fehlt')
  const baum = l.slice(start, l.indexOf(']', l.indexOf('knoten(\'FAT\'')) + 300)
  // FIBT ist ein Wurzelknoten: es steht auf derselben Einrueckung wie
  // CHO und FAT, nicht in deren Kinderliste.
  assert.match(baum, /^\s{8}knoten\('FIBT'\),$/m,
    'FIBT steht nicht als eigener Knoten in der Wurzel')
  // `[read]` Kein `/s` — der Zielstandard kennt den Schalter nicht.
  // `[\s\S]` tut dasselbe und laeuft ueberall.
  const choZeile = baum.match(/knoten\('CHO', \[([\s\S]*?)\]\)/)
  assert.ok(choZeile, 'CHO hat keine Kinderliste')
  assert.doesNotMatch(choZeile[1], /FIBT/,
    'FIBT haengt wieder unter CHO — die Teile uebersteigen dann das Ganze')
  // Und Staerke und Zuckeralkohole sind da: ohne sie blieben 197,98 g
  // als „nicht aufgeschluesselt" stehen, obwohl sie einen Namen haben.
  assert.match(choZeile[1], /STARCH/, 'Staerke fehlt im Baum')
  assert.match(choZeile[1], /POLYL/, 'Zuckeralkohole fehlen im Baum')
})

test('G-293: eine Differenz aus unvollstaendigen Teilen ist keine', () => {
  // `[read]` **`null` heisst nicht 0.** Ein Kind ohne Wert macht die
  // Differenz unbestimmbar — sie wird dann nicht behauptet.
  const fat = knoten('FAT', 65.40, 30, 30, [
    knoten('FASAT', 14.07), knoten('FAMS', null),
  ])
  assert.equal(restVon(fat), null)
  assert.equal(restVon(knoten('FAT', null, 30, 30, [knoten('FASAT', 1)])), null)
  assert.equal(restVon(knoten('FAT', 65.40)), null, 'ohne Kinder gibt es keinen Rest')
})

test('G-293: die Luecke steht an der Zahl, nicht im Kleingedruckten', () => {
  // `[cmd]` **FAMS ist an 25 von 30 Tagen vollstaendig, FIBT an 24.**
  const fams = knoten('FAMS', 29.95, 25, 30)
  assert.equal(istVollstaendig(fams), false)
  assert.equal(luekenSatz(fams), 'aus 25 von 30 Tagen')
  assert.equal(luekenSatz(knoten('FAT', 65.40, 30, 30)), '',
    'ein vollstaendiger Wert bekommt keinen Zusatz')
  assert.equal(istVollstaendig(knoten('X', null, 0, 0)), false,
    'null Tage sind nicht vollstaendig')
})

test('G-293: die Zeile ist aufklappbar, und die Kinder haengen daran', () => {
  const b = block(ohneKommentare(KACHELN), 'MakroDetailKachel')
  void b
  const s = ohneKommentare(KACHELN)
  const start = s.indexOf('function MakroZeile')
  assert.notEqual(start, -1)
  const fn = s.slice(start, s.indexOf('export function MakroDetailKachel'))
  // Die Wirkung: der Zustand steuert das Rendern der Kinder.
  assert.match(fn, /aria-expanded=\{offen\}/, 'der Zustand steht nicht am Knopf')
  assert.match(fn, /\{offen && hatKinder && \(/,
    'die Kinder haengen nicht am Aufklappzustand')
  assert.match(fn, /setOffen\(o => !o\)/, 'der Knopf schaltet nicht um')
  // Und die Rekursion greift, sonst ist es keine Hierarchie.
  assert.match(fn, /<MakroZeile key=\{kind\.code\}/,
    'die Zeile ruft sich nicht rekursiv auf')
})

// ══ G-292: die Warnungen ═════════════════════════════════════════

const flag = (
  code: string, getroffen: number, bewertet: number, unvollstaendig = 0,
): Flag => ({ code, name: code, richtung: 'target', getroffen, bewertet, unvollstaendig })

test('G-292: der Anteil rechnet gegen die BEWERTETEN Tage', () => {
  // `[read]` **Gegen das Fenster gerechnet saehe Chlorid harmlos aus:**
  // 4 von 30 waeren 13 %, tatsaechlich sind es 4 von 8 = 50 %.
  assert.equal(anteil(flag('CLD', 4, 8, 22)), 50)
  assert.equal(anteil(flag('WATER', 30, 30)), 100)
  assert.equal(anteil(flag('X', 0, 0)), null, 'ohne bewertete Tage keine Zahl')
})

test('G-292: Duennes steht hinten, auch bei HOEHEREM Anteil', () => {
  // `[cmd]` **Gemessen 2026-08-31, 30 Tage: Chlorid 4/8, EPA 6/12** —
  // beide 50 %, beide unter der halben Fensterlaenge.
  //
  // `[read]` **Der Fall muss das duenne Flag OBEN haben, wenn nur
  // nach Anteil sortiert wird** — sonst faellt ein Sortieren ohne
  // Belastbarkeit nicht auf. **Die Sabotageprobe hat genau das
  // gefunden:** mit CLD bei 50 % gegen WATER bei 100 % war die
  // Reihenfolge zufaellig dieselbe.
  const flags = [
    flag('CA', 19, 30),           // belegt, 63 %
    flag('CLD', 8, 8, 22),        // duenn, 100 % — hoechster Anteil
    flag('WATER', 24, 30),        // belegt, 80 %
  ]
  const s = sortiere(flags, 30)
  // Das duenne Flag hat den hoechsten Anteil und steht trotzdem hinten.
  assert.equal(anteil(flags[1]), 100)
  assert.deepEqual(s.map(f => f.code), ['WATER', 'CA', 'CLD'])
  assert.equal(belastbarkeit(s[2], 30), 'duenn')
  // Und innerhalb einer Belastbarkeit gilt weiter der Anteil.
  assert.ok((anteil(s[0]) ?? 0) > (anteil(s[1]) ?? 0))
})

test('G-292: die Schwelle haengt am Fenster, nicht an einer festen Zahl', () => {
  // 8 bewertete Tage: bei 30 duenn, bei 14 belegt (Schwelle 7).
  const f = flag('CLD', 4, 8)
  assert.equal(belastbarkeit(f, 30), 'duenn')
  assert.equal(belastbarkeit(f, 14), 'belegt')
  assert.equal(belastbarkeit(flag('X', 1, 7), 14), 'belegt', 'Schwelle 14 → 7')
  assert.equal(belastbarkeit(flag('X', 1, 6), 14), 'duenn')
})

test('G-292: der Satz steht an der Zeile, nicht nur in der Sortierung', () => {
  // `[read]` **Wer nur sortiert, verlaesst sich darauf, dass jemand
  // die Reihenfolge deutet.**
  const b = block(ohneKommentare(KACHELN), 'WarnungenKachel')
  assert.match(b, /\{DUENN_SATZ\}/, 'der Hinweis steht nicht an der Zeile')
  assert.match(b, /schmal && \(/, 'der Hinweis haengt an keiner Bedingung')
  assert.match(b, /belastbarkeit\(f, fenster\)/,
    'die Zeile fragt die Belastbarkeit nicht')
  assert.match(DUENN_SATZ, /wenigen Tagen bewertbar/)
})

test('G-292: die Zeile nennt getroffene UND bewertete Tage', () => {
  // `[read]` **Ein Prozentwert allein sagt nicht, worauf er sich
  // bezieht.** 50 % aus 8 Tagen ist etwas anderes als 50 % aus 30.
  const b = block(ohneKommentare(KACHELN), 'WarnungenKachel')
  assert.match(b, /\{f\.getroffen\} von \{f\.bewertet\} Tagen/,
    'die Bezugsgroesse fehlt an der Zeile')
})

// ══ DeficitSuggestions: gemeldet, nicht gebaut ═══════════════════

test('DeficitSuggestions ist NICHT gebaut — der Widerspruch ist benannt', () => {
  // `[cmd]` **SPEC_10 will Food-Empfehlungen, C-108/F-02 verbietet
  // sie.** `[read]` **Der Auftrag sagt: melden, nicht bauen.**
  assert.match(DEFIZIT_WIDERSPRUCH, /SPEC_10/)
  assert.match(DEFIZIT_WIDERSPRUCH, /C-108/)
  assert.match(DEFIZIT_WIDERSPRUCH, /gemeldet, nicht gebaut/)

  // Und die Wirkung: keine Kachel, die Lebensmittel vorschlaegt.
  const s = ohneKommentare(KACHELN)
  assert.doesNotMatch(s, /export function DefizitKachel/,
    'eine DeficitSuggestions-Kachel ist entstanden')
  assert.doesNotMatch(s, /(?<![a-zA-Z0-9_])empfehl/i,
    'die Kachel empfiehlt etwas — C-108 verbietet das')
})

// ══ Die Verdrahtung ══════════════════════════════════════════════

test('G-291..295: alle vier Kacheln sind gerendert, nicht nur gebaut', () => {
  // `[cmd]` **A-59: Code ohne Aufrufer wird geloescht, nicht
  // stehengelassen.** G-192 ist genau so haengengeblieben.
  const a = ohneKommentare(ANSICHT)
  const vier = ['TrendKachel', 'HeatmapKachel', 'MakroDetailKachel', 'WarnungenKachel']
  for (const name of vier) {
    // Import UND Verwendung — beides, sonst zaehlt ein Import allein.
    assert.match(a, new RegExp(`(?<![a-zA-Z0-9_])${name}(?![a-zA-Z0-9_])`),
      `${name} kommt in ansicht.tsx nicht vor`)
    assert.match(a, new RegExp(`<${name}\\s`), `${name} wird nicht gerendert`)
  }
})

test('G-291: der Leseweg begrenzt das Fenster beidseitig', () => {
  // `[read]` **Ohne `lte` zeichnete der Trend morgen mit** — die
  // Wirkung, nicht der Kommentar darueber.
  const l = ohneKommentare(LESEWEG)
  const gte = (l.match(/\.gte\('entry_date', vonIso\)/g) ?? []).length
  const lte = (l.match(/\.lte\('entry_date', stichtag\)/g) ?? []).length
  assert.ok(gte >= 2, `nur ${gte} untere Grenzen`)
  assert.equal(lte, gte,
    `${gte} untere Grenzen, aber ${lte} obere — eine Abfrage faengt die Zukunft mit`)
})

test('G-293: der Leseweg holt Name und Einheit aus der Sicht', () => {
  // `[read]` **Eine Namenstabelle im Code waere eine zweite Wahrheit**
  // — sie veraltet, sobald jemand `nutrient_defs` aendert.
  const l = ohneKommentare(LESEWEG)
  assert.match(l, /nutrient_name_de/, 'der Name kommt nicht aus der Sicht')
  assert.match(l, /nutrient_unit/, 'die Einheit kommt nicht aus der Sicht')
  assert.doesNotMatch(l, /(?<![a-zA-Z0-9_])MAKRO_NAME(?![a-zA-Z0-9_])/,
    'eine Namenstabelle ist zurueck')
})

test('G-295: das Kalorienziel wird geholt, nicht angenommen', () => {
  const l = ohneKommentare(LESEWEG)
  assert.match(l, /from\('nutrition_targets'\)/, 'das Ziel wird nicht geladen')
  // `[read]` **Die juengste gueltige Zeile, nicht irgendeine** —
  // sonst faerbt ein altes Ziel die Felder.
  assert.match(l, /\.lte\('gueltig_ab', stichtag\)/,
    'ein kuenftiges Ziel koennte gewaehlt werden')
  assert.match(l, /ascending: false/, 'die juengste Zeile wird nicht gewaehlt')
})

test('G-291: die Kacheln importieren nichts aus dem Leseweg ausser Typen', () => {
  // `[cmd]` **A-30: nur Typen und reine Funktionen in Browserdateien.**
  const s = lies(KACHELN)
  const zeilen = s.split('\n').filter(z => z.includes('insights-read'))
  assert.equal(zeilen.length, 1, `${zeilen.length} Importe aus dem Leseweg`)
  assert.match(zeilen[0], /^import type /,
    'der Leseweg wird als Wert importiert, nicht nur als Typ')
})
