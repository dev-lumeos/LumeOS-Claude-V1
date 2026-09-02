// G-315: die Kopie folgt der Vorlage Zeile fuer Zeile.
//
// **Tom, 2026-09-02:** *,,wo siehst du hier die parallelen zu dem
// mockup? ... ganz und gar nicht was wir spezifiziert haben oder das
// mockup grafisch zeigt."*
//
// `[cmd]` **Vorlage: `theme-v1/module-nutrition-spec.jsx`,
// `MealPlansView` Zeile 334-521.**
//
// `[read]` **Die Waechter nennen die Zeilennummer** — wer sie
// aendert, muss in die Vorlage sehen.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { SLOT_LABEL } from '../plan-model'
// G-335: die Namen stehen jetzt in `slots-lage.ts`.
import { KATEGORIE_TEXT } from '../slots-lage'
import { aendertInhalt, AUSFUEHRENDE_FELDER } from '../plan-write'

const WURZEL = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)), '../../../../../..',
)
const lies = (f: string) => fs.readFileSync(path.join(WURZEL, f), 'utf8')
const ohneKommentare = (f: string) => lies(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const VORLAGE = 'docs/spezifikation/10-plattform/design-system/'
  + 'theme-v1/module-nutrition-spec.jsx'
const EINTR = 'apps/web/src/app/v2/nutrition/plan-eintraege.tsx'
const ECHT = 'apps/web/src/app/v2/nutrition/plans-echt.tsx'
const TAB = 'apps/web/src/app/v2/nutrition/tab-plans.tsx'
const WERKB = 'apps/web/src/app/v2/nutrition/plan-werkbank-ui.tsx'
const SCHREIB = 'apps/web/src/lib/nutrition/plan-write.ts'
const LESEN = 'apps/web/src/lib/nutrition/plan-lesen.ts'

test('die Vorlage liegt da, wo der Dateikopf sie nennt', () => {
  // `[read]` **Ohne sie ist jeder Waechter hier eine Behauptung.**
  assert.ok(fs.existsSync(path.join(WURZEL, VORLAGE)),
    `Die Vorlage fehlt: ${VORLAGE}`)
  const v = lies(VORLAGE)
  assert.ok(v.includes('window.MealPlansView'),
    'Die Vorlage enthaelt MealPlansView nicht')
  // `[cmd]` **Der Dateikopf von `tab-plans.tsx` nennt Z. 334-521.**
  const zeilen = v.split('\n')
  assert.ok(zeilen.length >= 521,
    `Die Vorlage hat nur ${zeilen.length} Zeilen, der Kopf nennt 521`)
  assert.match(zeilen[333], /window\.MealPlansView/,
    'Z. 334 ist nicht der Anfang von MealPlansView')
})

// ══ DIE ZWEI FEHLER ═════════════════════════════════════════════════

test('G-315/1: Aktivieren ist keine Aenderung', () => {
  // **Tom, 2026-09-02:** *,,schwachsinn hoch 2 plan aktivieren
  // gesperrt wegen aenderung? wenn man starten will."*
  //
  // `[cmd]` **`planAendern` fragte `darfAendern` vor JEDEM Feld** —
  // auch vor `status: 'active'`.
  //
  // `[cmd]` **E-42: `darf_weiterverkaufen` schuetzt vor
  // Weiterverkauf, nicht vor Benutzung.** `[cmd]` **E-29 schuetzt den
  // INHALT des Coach-Plans.** `[read]` **Aktivieren aendert den
  // Inhalt nicht.**
  // ══ BERICHTIGT NACH DER SABOTAGEPROBE ═════════════════
  //
  // `[cmd]` **S1, S2 und S4 kamen durch:** der Waechter suchte die
  // FELDNAMEN im Quelltext. **`aendertInhalt = true` liess ihn gruen,
  // waehrend Aktivieren wieder gesperrt war.**
  //
  // `[read]` **Genau der Fehler aus G-216/G-247** — das Wort steht
  // da, die Wirkung fehlt. **Deshalb wird jetzt die Funktion
  // AUFGERUFEN.**

  // Ausfuehren: geht durch, egal wie der Plan herkommt.
  assert.equal(aendertInhalt({ status: 'active' }), false,
    'Aktivieren gilt als Inhaltsaenderung — dann ist es gesperrt')
  assert.equal(aendertInhalt({ status: 'active', is_active: true }), false)
  assert.equal(aendertInhalt({ start_date: '2026-09-02' }), false,
    'das Startdatum gilt als Inhaltsaenderung (Flow 3, Schritt 5)')
  assert.equal(aendertInhalt({ lifecycle_type: 'once' }), false,
    'der Lebenszyklus gilt als Inhaltsaenderung (Flow 3, Schritt 6)')
  assert.equal(aendertInhalt({ rollover_count: 2 }), false,
    'der Neustart-Zaehler gilt als Inhaltsaenderung (C-373)')

  // Inhalt: bleibt gesperrt — E-29 gilt weiter.
  assert.equal(aendertInhalt({ name: 'X' }), true,
    'Umbenennen gilt nicht als Inhaltsaenderung — E-29 faellt')
  assert.equal(aendertInhalt({ target_kcal: 2200 }), true,
    'ein Zielwert gilt nicht als Inhaltsaenderung')
  assert.equal(aendertInhalt({ description: 'X' }), true)
  // `[read]` **Gemischt zaehlt als Aenderung** — wer nebenbei
  // umbenennt, umgeht die Sperre sonst ueber das Aktivieren.
  assert.equal(aendertInhalt({ status: 'active', name: 'X' }), true,
    'ein Aktivieren MIT Umbenennung kommt an der Sperre vorbei')

  // `[read]` **Ein leerer Aufruf ist keine Aenderung.**
  assert.equal(aendertInhalt({}), false)
  assert.equal(aendertInhalt({ name: undefined }), false,
    'ein nicht gesetztes Feld zaehlt als Aenderung')

  // `[cmd]` **Die Liste ist vollstaendig** — gezaehlt, nicht
  // gesucht: faellt eines heraus, sperrt es wieder.
  assert.equal(AUSFUEHRENDE_FELDER.length, 5,
    `${AUSFUEHRENDE_FELDER.length} ausfuehrende Felder statt 5`)

  // Und die Sperre steht weiter im Schreibweg.
  const s = ohneKommentare(SCHREIB)
  assert.match(s, /if \(aendertInhalt\(felder\) && !\(await darfAendern\(herkunft\)\)\)/,
    'die Herkunftssperre ist nicht mehr an aendertInhalt gebunden')
  // `[read]` **Und die Meldung sagt, was GEHT** — nicht nur, was
  // nicht geht.
  //
  // `[cmd]` **S4 kam durch:** der Wächter suchte einen Satzanfang,
  // die Sabotage tauschte ihn gegen *„Dieser Plan ist gesperrt."* —
  // **und der gesuchte Text stand weiter im anderen Zweig.**
  //
  // `[read]` **Also die Wirkung: BEIDE Meldungen** — die für den
  // Coach-Plan und die für den Marktplatz — **müssen den erlaubten
  // Weg nennen.** Gezählt, nicht gesucht (G-216).
  const meldungen = (s.match(/Du kannst ihn aktivieren und/g) ?? []).length
  assert.equal(meldungen, 2,
    `${meldungen} von 2 Meldungen nennen den erlaubten Weg — `
    + 'eine Sperre ohne Ausweg ist eine Sackgasse')
  // Und keine sagt mehr, der Plan sei pauschal gesperrt.
  assert.ok(!s.includes('ist für direkte Änderungen gesperrt'),
    'die alte Pauschalsperre lebt weiter — sie blockierte das Aktivieren')
})

test('G-315/2: „In der Werkbank" steht an den NICHT-aktiven', () => {
  // `[cmd]` **Tom, 2026-09-02: der Knopf stand am aktiven Plan** —
  // dem, der schon offen ist.
  //
  // `[read]` **Ein Knopf, der sagt *,,du bist hier"*, ist kein
  // Knopf.**
  // ══ BERICHTIGT in G-319 ═══════════════════════════════════════
  //
  // **Tom, 2026-09-02:** *,,anstatt diesen anwaehlbutton einfach die
  // kachel anwaehlbar machen."*
  //
  // `[cmd]` **Hier stand das Muster des Knopfes.** `[read]` **Den
  // gibt es nicht mehr — die Kachel selbst waehlt an.** **Was G-315
  // sichert, bleibt gesichert:** der offene Plan traegt eine Marke,
  // und kein Klick tut an ihm etwas.
  const w = ohneKommentare(WERKB)
  assert.match(w, /\{offen && <Pill variant="acc">In der Werkbank<\/Pill>\}/,
    'der offene Plan traegt keine Marke')
  // `[cmd]` **Und der Klick haengt am GESCHLOSSENEN** — beim offenen
  // ist er `undefined`, sonst waere die Kachel ein Knopf, der sagt
  // *,,du bist hier"*.
  assert.match(w, /onClick=\{offen \? undefined : \(*\(\) => onWaehlen\(p\.id\)\)*\}/,
    'die Auswahl haengt nicht am geschlossenen Plan')
})

// ══ DER AKTIVE PLAN STEHT EINMAL ════════════════════════════════════

test('G-315: der aktive Plan steht EINMAL, nicht dreimal', () => {
  // **Tom, 2026-09-02:** *,,der untere teil alles ineinander
  // verschoben."*
  //
  // `[cmd]` **Er stand dreimal:** `PlanKopfEcht`, `MealPlanCard` mit
  // Aufklappzeile, Bibliothek.
  //
  // `[cmd]` **Die Vorlage trennt in UNTER-TABS** — `tab ===
  // "active"` (Z. 359) und `tab === "library"` (Z. 447). **Sie stehen
  // nie gleichzeitig auf dem Schirm.**
  const t = ohneKommentare(TAB)
  assert.doesNotMatch(t, /(?<![a-zA-Z0-9_])MealPlanCard(?![a-zA-Z0-9_])/,
    'MealPlanCard lebt weiter — der aktive Plan steht zweimal')
  assert.doesNotMatch(t, /(?<![a-zA-Z0-9_])MealPlanDetail(?![a-zA-Z0-9_])/,
    'die Aufklappzeile lebt weiter')
  assert.doesNotMatch(t, /(?<![a-zA-Z0-9_])detailOffen(?![a-zA-Z0-9_])/,
    'der Zustand der Aufklappzeile lebt weiter (A-59)')
  // Der Kopf bleibt, die Bibliothek bleibt.
  assert.match(t, /<PlanKopfEcht/, 'der Plankopf fehlt')
  // `[cmd]` **S6 kam durch:** `&& false &&` liess das Element im
  // Quelltext stehen. `[read]` **Der Waechter suchte den Namen, nicht
  // die Bedingung** (G-216).
  assert.match(t, /\{d && allePlaene\.length > 0 && \(\s*\n\s*<PlanBibliothekEcht/,
    'die Bibliothek haengt an einer anderen Bedingung — oder an keiner')
  // `[read]` **Und die Bibliothek laesst den aktiven aus.**
  const e = ohneKommentare(ECHT)
  assert.match(e, /p\.id !== aktivId/,
    'die Bibliothek zeigt den aktiven Plan mit')
})

// ══ DIE ZEILEN DER VORLAGE ══════════════════════════════════════════

test('G-315/Z. 384-388: der Rahmen traegt die Statusfarbe', () => {
  // `[cmd]` **Vorlage Z. 385-388:** `padding: 12, borderRadius: 7`;
  // **gestrichelt bei `pending`, sonst durchgezogen mit 5 %
  // Hintergrund und 25 % Rand.**
  const e = ohneKommentare(EINTR)
  assert.match(e, /padding: 12, borderRadius: 7/,
    'Z. 385: Polsterung und Radius stimmen nicht')
  assert.match(e, /STATUS_FARBE\[e\.status\]\} 5%, var\(--surface\)\)/,
    'Z. 386: der Hintergrund traegt die Statusfarbe nicht')
  assert.match(e, /STATUS_FARBE\[e\.status\]\} 25%, var\(--border\)\)/,
    'Z. 387: der Rand traegt die Statusfarbe nicht')
  assert.match(e, /\$\{offen \? 'dashed' : 'solid'\}/,
    'Z. 388: pending ist nicht gestrichelt')
})

test('G-315/Z. 390-397: Zeit, Name, Pille, kcal, Posten, Notiz', () => {
  const e = ohneKommentare(EINTR)

  // Z. 391 — die Zeit, 38 px, num dim.
  assert.match(e, /className="v2-num v2-dim" style=\{\{ fontSize: 10, width: 38 \}\}/,
    'Z. 391: die Zeitspalte fehlt oder ist nicht 38 px breit')
  assert.match(e, /\{e\.planned_time \?\? ''\}/,
    'Z. 391: die Uhrzeit wird nicht gezeigt')

  // Z. 392 — der Mahlzeitname, 12,5 px, 600.
  assert.match(e, /fontSize: 12\.5, fontWeight: 600/,
    'Z. 392: der Mahlzeitname hat nicht 12,5 px / 600')
  // `[read]` **Der NAME, nicht der Code** — `meal_type` heisst
  // `breakfast`, die Vorlage zeigt `Breakfast`.
  assert.match(e, /MAHLZEIT_LABEL\[e\.meal_type\]/,
    'Z. 392: der rohe meal_type steht da statt des Namens')

  // Z. 393 — die Pille in der Statusfarbe, auch im Rand.
  assert.match(e, /borderColor: `color-mix\(in srgb, \$\{STATUS_FARBE\[e\.status\]\} 35%/,
    'Z. 393: die Pille traegt die Statusfarbe nicht im Rand')

  // Z. 394 — kcal rechtsbuendig.
  assert.match(e, /marginLeft: 'auto', fontSize: 11/,
    'Z. 394: die kcal stehen nicht rechtsbuendig')

  // Z. 396 — die Lebensmittel, 46 px eingerueckt.
  assert.match(e, /fontSize: 11\.5, paddingLeft: 46, lineHeight: 1\.5/,
    'Z. 396: die Lebensmittel sind nicht 46 px eingerueckt')

  // Z. 397 — die Notiz bei Abweichung: Pfeil, warn, mono.
  assert.match(e, /color: 'var\(--warn\)', fontFamily: 'var\(--font-mono\)'/,
    'Z. 397: die Abweichungsnotiz ist nicht in warn/mono')
  assert.match(e, /↳ \{abweichungSatz/,
    'Z. 397: der Pfeil vor der Notiz fehlt')
})

test('G-315/Z. 398-404: die Knoepfe, 46 px eingerueckt', () => {
  const e = ohneKommentare(EINTR)
  // Z. 399 — dieselbe Einrueckung wie die Zeilen darueber.
  assert.match(e, /display: 'flex', gap: 6, marginTop: 8,\s*\n\s*paddingLeft: 46/,
    'Z. 399: die Knopfzeile ist nicht 46 px eingerueckt')
  // Z. 400 und 403 — die Namen der Vorlage.
  assert.match(e, /'Confirm as planned'/, 'Z. 400: der Knopfname stimmt nicht')
  assert.match(e, />\s*Skip\s*</, 'Z. 403: der Knopf heisst nicht `Skip`')
  assert.match(e, /className="v2-btn v2-btn-primary v2-btn-sm"/,
    'Z. 400: `Confirm as planned` ist nicht primaer')

  // `[cmd]` **Z. 401 `MealCam` ist NICHT gebaut** — G-276: der Knopf
  // schrieb `confirmation_mode: 'mealcam'`, ohne dass fotografiert
  // wurde. `[read]` **Er darf nicht zurueckkommen, solange kein
  // Fotoweg existiert.**
  assert.doesNotMatch(e, /name="camera"/,
    'der MealCam-Knopf ist zurueck — ohne Fotoweg (G-276)')

  // `[cmd]` **BERICHTIGT in G-317/G-316: Z. 402 IST gebaut.**
  //
  // `[cmd]` **Hier stand, die Zeile sei als fehlend vermerkt** — mit
  // der Begruendung, die Posten fehlten im Tageseintrag.
  //
  // `[cmd]` **G-316 hat den Leseweg nachgezogen** (derselbe Verbund
  // wie in G-311), **und am 2026-09-02 belegt:** 200 g auf 600 g
  // ergaben `deviated` mit 1.372 kcal und 200,0 %.
  assert.match(e, />\s*Log deviation\s*<\/button>/,
    'Z. 402: der Knopf fehlt — er ist seit G-316 gebaut')
  assert.match(e, /aria-label=\{`Menge \$\{p\.name\}`\}/,
    'Z. 402: die Mengenfelder fehlen')
})

test('G-315/Z. 414-419: Plan settings hat GENAU fuenf Zeilen', () => {
  // `[cmd]` **Die Vorlage hat fuenf** — und vier davon standen bei
  // uns doppelt (Wochen, Tage, Eintraege in der Kopfkarte).
  //
  // `[read]` **Eine Zahl an zwei Stellen ist keine Bestaetigung,
  // sondern eine Frage** — welche gilt, wenn sie auseinandergehen?
  const e = ohneKommentare(ECHT)
  const von = e.indexOf('export function PlanEinstellungenEcht')
  assert.notEqual(von, -1, 'Plan settings fehlt')
  const bis = e.indexOf('\nexport ', von + 10)
  const block = e.slice(von, bis === -1 ? undefined : bis)

  const zeilen = (block.match(/<Row label=/g) ?? []).length
  assert.equal(zeilen, 5,
    `${zeilen} Zeilen statt 5 — die Vorlage (Z. 414-419) hat fuenf`)

  // Drei kommen woertlich aus der Vorlage.
  for (const [nr, label] of [[415, 'Lifecycle'], [416, 'Days count'],
    [417, 'Started']] as const) {
    assert.ok(block.includes(`label="${label}"`),
      `Z. ${nr}: die Zeile „${label}" fehlt`)
  }
  // `[cmd]` **Z. 418 `Next restart` bleibt weg** (C-373: kein
  // Automatismus). **Statt dessen das Ende der Laufzeit** — es ist
  // gemessen und behauptet keinen Vollzug.
  assert.ok(!block.includes('label="Next restart"'),
    'Z. 418: `Next restart` ist zurueck — ein Termin ohne Ausfuehrer')
  assert.ok(block.includes('Läuft bis'),
    'der Ersatz fuer `Next restart` fehlt')
  // `[cmd]` **Z. 419 `Confirm mode` bleibt weg** — `confirmation_mode`
  // liegt an `meal_plan_logs`, je Ausfuehrung.
  assert.ok(!block.includes('label="Confirm mode"'),
    'Z. 419: `Confirm mode` ist zurueck — er haengt am Log')
  // Und die vier doppelten sind weg.
  for (const doppelt of ['Wochen', 'Tage gesamt', 'Einträge']) {
    assert.ok(!block.includes(`label="${doppelt}"`),
      `„${doppelt}" steht doppelt — es steht schon in der Kopfkarte`)
  }
})

// ══ EINE TABELLE, NICHT ZWEI ════════════════════════════════════════

test('G-315/G-335: die Mahlzeitnamen stehen an EINER Stelle', () => {
  // ══ BERICHTIGT IN G-335 ═════════════════════════
  //
  // `[cmd]` **Hier stand `MAHLZEIT_LABEL` aus `plan-model.ts`.**
  // `[cmd]` **G-335 hat gemessen: `meal_type` wurde an ZEHN Stellen
  // uebersetzt** — vier Schreibweisen fuer `pre_workout` allein.
  //
  // `[read]` **Was G-315 sichert, gilt schaerfer:** die Namen stehen
  // an EINER Stelle — **jetzt in `slots-lage.ts`, wo auch die
  // Aufloesung sitzt** (Plan vor Nutzerslot vor Kategorie).
  //
  // `[read]` **Und `meal_type` ist eine Kategorie, keine
  // Beschriftung** (E-58/E-59) — deshalb heisst die Tabelle
  // `KATEGORIE_TEXT` und nicht mehr `MAHLZEIT_LABEL`.
  const lage = ohneKommentare('apps/web/src/lib/nutrition/slots-lage.ts')
  assert.match(lage, /export const KATEGORIE_TEXT: Record<string, string> = \{/,
    'die gemeinsame Tabelle fehlt')

  // Die sieben Kategorien des CHECKs, auf Deutsch.
  assert.equal(KATEGORIE_TEXT.breakfast, 'Frühstück')
  assert.equal(KATEGORIE_TEXT.pre_workout, 'Vor dem Training')
  assert.equal(KATEGORIE_TEXT.post_workout, 'Nach dem Training')
  assert.equal(KATEGORIE_TEXT.other, 'Sonstiges')
  assert.equal(Object.keys(KATEGORIE_TEXT).length, 7,
    'die Tabelle deckt nicht alle sieben CHECK-Werte')

  // `[cmd]` **Die Ghost-Karte holt den Namen aus den Slots**, nicht
  // aus einer eigenen Liste — Toms Befund *,,Breakfast statt
  // Fruehstueck"*.
  const g = ohneKommentare('apps/web/src/app/v2/nutrition/ghost-eintrag.tsx')
  assert.match(g, /mahlzeitName\(eintrag\.meal_type, \{/,
    'die Ghost-Karte loest den Namen nicht ueber die Slots auf')
  assert.doesNotMatch(g, /MAHLZEIT_LABEL\[/,
    'die Ghost-Karte benutzt wieder eine eigene Liste')
})

// ══ DIE UHRZEIT KOMMT AUS DEM SCHEMA ════════════════════════════════

test('G-315/Z. 391: `planned_time` wird gelesen', () => {
  // `[cmd]` **Die Spalte steht in `meal_plan_entries` und ist
  // gefuellt** — 07:30, 12:30, 16:00, 19:30 (2026-09-02 gemessen).
  // **Der Leseweg holte sie nur nicht.**
  const l = ohneKommentare(LESEN)
  const von = l.indexOf('export async function ladeTagesEintraege')
  assert.notEqual(von, -1)
  const bis = l.indexOf('\nexport ', von + 10)
  const block = l.slice(von, bis === -1 ? undefined : bis)
  assert.match(block, /planned_time,/, 'die Abfrage holt planned_time nicht')
  // `[read]` **Ohne Sekunden** — die Vorlage zeigt `07:30`.
  assert.match(block, /text\(roh\.planned_time\)\?\.slice\(0, 5\)/,
    'die Uhrzeit wird nicht auf HH:MM gekuerzt')
})
