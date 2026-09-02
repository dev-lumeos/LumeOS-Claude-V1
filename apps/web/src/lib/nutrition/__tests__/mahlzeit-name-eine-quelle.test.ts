/**
 * G-335 — EINE Namensliste, und der Name kommt aus der Quelle.
 *
 * **Tom, 2026-09-02:** *„Wo ein Plan die Quelle ist, kommt der Name aus
 * dem Plan (E-59). Wo der Nutzer die Quelle ist, aus meal_slots (E-58).
 * meal_type bleibt Kategorie ohne Bedeutung — nicht Beschriftung."*
 *
 * `[cmd]` **Gemessen an HEAD, 2026-09-02:** `meal_type` wurde ueber
 * **FUENF eigene Namenstabellen** an **ZEHN Stellen** uebersetzt —
 * mit **VIER Schreibweisen fuer `pre_workout`**: `Pre-Workout`
 * (plans-echt, plan-model), `Pre-workout` (mahlzeiten), `Vor dem
 * Training` (plan-eintrag-editor), `vor dem Training` (erfassen).
 *
 * `[read]` **Berichtigt gegenueber dem Auftrag**, der acht Stellen
 * nannte: acht war meine Zahl, zehn ist die gemessene.
 *
 * `[read]` **Die Waechter messen die Wirkung, nicht das Wort** —
 * CLAUDE.md nennt vier Faelle (G-216, G-247, G-246, G-108), in denen
 * einer gruen blieb, waehrend die Sache kaputt war. **Deshalb steht
 * hier fuenfmal ein Aufruf mit Werten statt einer Textprobe.**
 */
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { test } from 'node:test'

import { KATEGORIE_TEXT, kategorieAuswahl, mahlzeitName } from '../slots-lage'
import type { MahlzeitSlot } from '../slots-lage'

// `[cmd]` **Pfad aus der Lage DIESER Datei** — mit `process.cwd()`
// gruen aus der Wurzel und rot im Gate (G-291, A-63).
const WURZEL = path.resolve(
  path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')),
  '../../../../../..',
)
const lies = (f: string) => fs.readFileSync(path.join(WURZEL, f), 'utf8')
const ohneKommentare = (f: string) => lies(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const LAGE = 'apps/web/src/lib/nutrition/slots-lage.ts'
const MODEL = 'apps/web/src/lib/nutrition/plan-model.ts'
const GHOST = 'apps/web/src/app/v2/nutrition/ghost-eintrag.tsx'
const DIARY = 'apps/web/src/app/v2/nutrition/mahlzeiten.tsx'
const PREFS = 'apps/web/src/app/v2/nutrition/tab-vorlieben.tsx'
// G-339: die sechste Liste stand hier.
const MODALE = 'apps/web/src/app/v2/nutrition/modale.tsx'

// `[cmd]` **Der Waechter liest die Platte, nicht den Index** —
// `git ls-files` sieht Ungetracktes nicht (A-63).
const QUELLEN = [
  'apps/web/src/lib/nutrition',
  'apps/web/src/app/v2/nutrition',
]

// ══ G-333: der Ausschluss ist weg ════════════════════
//
// `[cmd]` **Hier stand `TOT`** — `erfassen.tsx` war von der
// Zaehlung ausgenommen, weil sie tot war und ein Umbau nichts
// geaendert haette.
//
// `[cmd]` **Die Datei ist in G-333 geloescht** (477 Zeilen).
// **Damit faellt der Ausschluss** — genau, wie es der Waechter
// unten verlangt hat: die ausgeschlossene Datei gibt es nicht
// mehr, also faellt der Ausschluss.
//
// `[read]` **Der Zaehler sieht jetzt den ganzen Baum.**

/** Alle `.ts`/`.tsx` unterhalb eines Ordners, ohne `__tests__`. */
function dateien(rel: string): string[] {
  const abs = path.join(WURZEL, rel)
  const raus: string[] = []
  for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
    if (e.name === '__tests__') continue
    const p = path.join(rel, e.name).replace(/\\/g, '/')
    if (e.isDirectory()) raus.push(...dateien(p))
    else if (/\.tsx?$/.test(e.name)) raus.push(p)
  }
  return raus
}

test('die Dateiproben finden ihre Dateien — unabhaengig vom Startort', () => {
  for (const f of [LAGE, MODEL, GHOST, DIARY, PREFS]) {
    assert.ok(fs.existsSync(path.join(WURZEL, f)), `${f} nicht gefunden`)
    assert.ok(lies(f).length > 500, `${f} ist verdaechtig kurz`)
  }
  assert.ok(fs.existsSync(path.join(WURZEL, 'pnpm-workspace.yaml')),
    `WURZEL zeigt nicht auf das Repo: ${WURZEL}`)
  assert.ok(dateien(QUELLEN[1]).length > 20,
    'der Dateibaum ist leer — die Suche unten liefe ins Leere')

  // `[cmd]` **G-333: `erfassen.tsx` ist geloescht** — und damit auch
  // der Ausschluss, der sie aus der Zaehlung nahm.
  //
  // `[read]` **Die Zusage kehrt sich um:** vorher *,,die Datei ist da
  // und bleibt draussen"*, jetzt *,,sie ist weg und niemand ruft
  // sie"*. **`suchen-und-vorschau.test.ts` fuehrt die Hauptzusage**;
  // hier steht nur, dass die Zaehlung sie nicht wieder einsammelt.
  assert.ok(!fs.existsSync(
    path.join(WURZEL, 'apps/web/src/app/v2/nutrition/erfassen.tsx')),
  'erfassen.tsx ist zurueck — dann gehoert sie auf den Hook (G-333)')
})

// ══ 1 · EINE Liste, nicht fuenf ══════════════════════════════════════

test('G-335: es gibt genau EINE Namensliste im Quelltext', () => {
  // `[cmd]` **Die Wirkung, nicht das Wort:** eine zweite Liste erkennt
  // man daran, dass ein Kategoriecode als Objektschluessel neben einem
  // Text steht. **Gesucht wird das Muster, nicht der Variablenname** —
  // die naechste Kopie heisst anders.
  //
  // ══ ERWEITERT IN G-339 ══════════════════════════════════════
  //
  // `[cmd]` **Dieser Waechter hat die SECHSTE Liste nicht gesehen.**
  // `modale.tsx` schrieb `{ id: 'breakfast', label: 'Breakfast' }` —
  // **der Code stand als WERT, nicht als Schluessel**, und der
  // fuenfte hiess `preworkout` ohne Unterstrich.
  //
  // `[read]` **Beide Bedingungen verfehlten ihn**, und die Liste
  // ueberlebte G-335 unbemerkt. **Ein Waechter, der nur eine
  // Schreibform kennt, findet die naechste Kopie nicht.**
  //
  // `[read]` **Jetzt zaehlt die Sache, nicht die Form:** eine Datei
  // gilt als Namensliste, wenn drei oder mehr Kategoriecodes darin
  // neben Text stehen — als Schluessel ODER als Wert.
  const CODES = ['breakfast', 'lunch', 'dinner', 'snack',
    'pre_workout', 'preworkout', 'post_workout', 'postworkout']
  const treffer: string[] = []
  for (const rel of QUELLEN) {
    for (const f of dateien(rel)) {
      const t = ohneKommentare(f)
      // `breakfast: '…'` (Schluessel) oder `'breakfast'` (Wert in
      // einem Tupel mit Beschriftung).
      // `[cmd]` **Eine Uhrzeit ist keine Beschriftung.** `modale.tsx`
      // traegt seit G-339 `VORGABE_ZEIT` — dieselben Codes, aber
      // `'07:00'` dahinter. **Ohne diese Ausnahme faende der Waechter
      // eine Namensliste, wo eine Zeittabelle steht.**
      const NUR_ZEIT = /^['"]\d{2}:\d{2}['"]/
      const gefunden = CODES.filter(c => {
        const alsSchluessel = new RegExp(`(?<![a-z0-9_])${c}:\\s*(['"][^'"]*['"])`)
          .exec(t)
        if (alsSchluessel && !NUR_ZEIT.test(alsSchluessel[1])) return true
        return new RegExp(`id:\\s*['"]${c}['"]`).test(t)
      })
      if (gefunden.length >= 3) treffer.push(f)
    }
  }
  assert.deepEqual(treffer, [LAGE],
    `Namenslisten stehen in ${treffer.length} Dateien statt in einer`)
})

test('G-335: die alten Listen sind Weiterleitungen, keine Kopien', () => {
  // `[cmd]` **`plan-model.ts` trug beide** — `SLOT_LABEL` (vier
  // englische) und `MAHLZEIT_LABEL` (sieben englische).
  //
  // `[read]` **Sie bleiben als Name bestehen** — die Aufrufer
  // importieren sie weiter. **Aber sie zeigen auf dieselbe Tabelle.**
  const m = ohneKommentare(MODEL)
  assert.match(m, /export \{ KATEGORIE_TEXT as MAHLZEIT_LABEL \}/,
    'MAHLZEIT_LABEL ist wieder eine eigene Tabelle')
  assert.match(m, /export \{ KATEGORIE_TEXT as SLOT_LABEL \}/,
    'SLOT_LABEL ist wieder eine eigene Tabelle')

  // `[cmd]` **Die Wirkung:** derselbe Code liefert denselben Text,
  // egal ueber welchen Namen.
  assert.equal(KATEGORIE_TEXT.pre_workout, 'Vor dem Training')
  assert.ok(!Object.values(KATEGORIE_TEXT).some(v => /[A-Za-z]-[A-Za-z]/.test(v)
    && v.includes('Workout')), 'eine englische Schreibweise ist zurueck')
})

test('G-335: alle sieben Kategorien des CHECK haben einen Text', () => {
  // `[cmd]` **Der CHECK steht in ZWEI Tabellen** — `meals` und
  // `meal_plan_entries` — und nennt sieben Werte.
  //
  // `[read]` **Fehlt einer, faellt `mahlzeitName` auf den Rohcode
  // zurueck** und der Nutzer liest `pre_workout` auf dem Schirm.
  for (const code of ['breakfast', 'lunch', 'dinner', 'snack',
    'pre_workout', 'post_workout', 'other']) {
    assert.ok(KATEGORIE_TEXT[code], `${code} hat keinen Text`)
    assert.notEqual(mahlzeitName(code), code,
      `${code} erscheint roh auf dem Schirm`)
  }
  assert.equal(Object.keys(KATEGORIE_TEXT).length, 7,
    'die Liste deckt nicht genau die sieben CHECK-Werte ab')
})

// ══ 2 · Die Rangfolge der Quellen ════════════════════════════════════

const SLOTS: MahlzeitSlot[] = [
  { position: 1, name: 'Morgenbrei', planned_time: '07:00' },
  { position: 2, name: 'Mittag', planned_time: '12:30' },
  { position: 3, name: 'Abendbrot', planned_time: '19:00' },
]

test('G-335/E-59: ein gelieferter Plan schlaegt alles', () => {
  // `[read]` **Ein gekaufter Plan bringt seine Benennung mit** — sie
  // gilt, auch wenn der Nutzer eigene Slots hat.
  assert.equal(
    mahlzeitName('breakfast', {
      planName: 'Refeed 1', zeit: '07:00', slots: SLOTS,
    }),
    'Refeed 1',
    'der Plannname wird von der Slotliste ueberstimmt')

  // `[cmd]` **Leerer Plannname ist keine Quelle** — sonst stuende eine
  // leere Ueberschrift da.
  assert.equal(
    mahlzeitName('breakfast', { planName: '   ', zeit: '07:00', slots: SLOTS }),
    'Morgenbrei',
    'ein leerer Plannname verdeckt die Slotliste')
})

test('G-335/E-58: ohne Plan entscheidet die Zeit', () => {
  // `[read]` **Die Buchung ist die Wahrheit** — der Slot ordnet sie nur
  // ein. **Wer um 12:35 isst, isst zu Mittag.**
  assert.equal(mahlzeitName('other', { zeit: '12:35', slots: SLOTS }), 'Mittag')
  assert.equal(mahlzeitName('breakfast', { zeit: '19:10', slots: SLOTS }),
    'Abendbrot', 'die Kategorie schlaegt die Zeit — falsch herum')

  // `[cmd]` **Ausserhalb jedes Fensters bleibt es bei der Kategorie** —
  // `MAX_ABSTAND_MIN` ist 120, 03:00 liegt 240 min von 07:00 weg.
  assert.equal(mahlzeitName('snack', { zeit: '03:00', slots: SLOTS }), 'Snack',
    'eine Zeit weit ausserhalb wird trotzdem einem Slot zugeschlagen')
})

test('G-335: ohne Zeit entscheidet die Reihenfolge, dann die Kategorie', () => {
  // `[read]` **Eine Planzeile ohne Zeit hat trotzdem eine Position** —
  // die zweite Reihe des Rasters ist der zweite Slot des Nutzers.
  assert.equal(
    mahlzeitName('lunch', { slots: SLOTS, reihen: ['breakfast', 'lunch', 'dinner'] }),
    'Mittag')

  // **Ohne jede Quelle: der deutsche Text.**
  assert.equal(mahlzeitName('pre_workout'), 'Vor dem Training')
  assert.equal(mahlzeitName('lunch', { slots: [] }), 'Mittagessen')
})

test('G-335: das Pulldown zeigt die Namen des Nutzers, nicht die Kategorien', () => {
  // `[cmd]` **Die Auswahl traegt sieben Eintraege** — die Codes bleiben
  // als Wert, nur die Beschriftung folgt der Quelle.
  const ohne = kategorieAuswahl()
  assert.equal(ohne.length, 7)
  assert.deepEqual(ohne.map(o => o.label).slice(0, 3),
    ['Frühstück', 'Mittagessen', 'Abendessen'])

  const mit = kategorieAuswahl(SLOTS, ['breakfast', 'lunch', 'dinner'])
  assert.deepEqual(mit.map(o => o.label).slice(0, 3),
    ['Morgenbrei', 'Mittag', 'Abendbrot'],
    'das Pulldown zeigt die Kategorien statt der Nutzernamen')
  assert.deepEqual(mit.map(o => o.code), ohne.map(o => o.code),
    'die gespeicherten Werte haben sich mitverschoben')
})

// ══ 3 · Die Verdrahtung ══════════════════════════════════════════════

test('G-335: die Ghost-Karten fragen mit Zeit UND Slots', () => {
  // `[cmd]` **Hier stand `MAHLZEIT_LABEL[eintrag.meal_type]`** — an
  // ZWEI Stellen (Karte und Uebergabe an das Modal).
  //
  // `[read]` **Ein Aufruf ohne `zeit` waere gruen und wirkungslos** —
  // deshalb pruefen beide Argumente.
  const g = ohneKommentare(GHOST)
  const rufe = g.match(/mahlzeitName\(eintrag\.meal_type, \{[^}]*\}/g) ?? []
  assert.equal(rufe.length, 2,
    `${rufe.length} Aufrufe statt zwei — eine Anzeigestelle fehlt`)
  for (const r of rufe) {
    assert.match(r, /zeit: eintrag\.planned_time/, `ohne Zeit: ${r}`)
    assert.match(r, /slots(,|\s*\})/, `ohne Slots: ${r}`)
  }

  // `[cmd]` **Und die Zeit muss geladen werden** — sonst ist sie immer
  // `null` und die Zeitregel laeuft leer.
  //
  // ══ BERICHTIGT NACH DER SABOTAGEPROBE ═══════════════════════════
  //
  // `[cmd]` **Hier stand `assert.match(l, /planned_time/)`.** Die
  // Sabotage benannte ALLE ACHT Vorkommen um — typkonsistent, gruen,
  // und die Zeit kam nie an. **Ein Wortwaechter, wie ihn CLAUDE.md
  // viermal beschreibt (G-216, G-247, G-246, G-108).**
  //
  // `[read]` **Die Wirkung haengt am SPALTENNAMEN**, den PostgREST
  // kennt — `meal_plan_entries.planned_time`. **Ein umbenanntes Feld
  // liefert `undefined`.** Deshalb wird die Kette einzeln geprueft:
  // Abfrage, Rohtyp, Rueckgabe.
  const l = ohneKommentare('apps/web/src/lib/nutrition/plan-lesen.ts')

  // 1 · die Spalte steht in der `.select`-Liste der Ghost-Abfrage
  const i = l.indexOf(".from('meal_plan_entries')")
  assert.ok(i > 0, 'die Ghost-Abfrage ist weg')
  const select = l.slice(i, l.indexOf('`', l.indexOf('.select(`', i) + 9))
  assert.match(select, /(?<![a-z0-9_])planned_time(?![a-z0-9_])/,
    'planned_time steht nicht in der Spaltenliste — die Zeit kommt nie an')

  // 2 · aus dem Rohsatz gelesen, nicht erfunden
  assert.match(l, /planned_time: text\(roh\.planned_time\)/,
    'die Zeit wird nicht aus dem Rohsatz uebernommen')

  // 3 · und weitergereicht
  assert.match(l, /planned_time: e\.planned_time/,
    'die Zeit erreicht die Karte nicht')
})

test('G-335: das Tagebuch benennt die Karten aus der Slotliste', () => {
  const d = ohneKommentare(DIARY)
  assert.match(d, /const SLOT_LABEL = KATEGORIE_TEXT/,
    'das Tagebuch haelt wieder eine eigene Liste')
  assert.match(d, /slotFuerZeit\(/, 'die Karten fragen die Zeit nicht ab')
  assert.match(d, /slotFuerTyp\(mahlzeitSlots, typ, reihen\) \?\? SLOT_LABEL\[typ\]/,
    'die leeren Karten tragen die Kategorie statt des Nutzernamens')
})

// ══ 4 · Die Verschmelzung ════════════════════════════════════════════

test('G-335: Mahlzeitenstruktur ist in Meine Mahlzeiten aufgegangen', () => {
  // **Tom, 2026-09-02:** *„mahlzeitenstruktur muessen wir mit meine
  // mahlzeiten verschmelzen."*
  //
  // `[read]` **Die Wirkung ist eine Abwesenheit plus eine Anwesenheit**
  // — die Kachel weg, die Slotliste da. **Beides zaehlt.**
  const p = ohneKommentare(PREFS)
  assert.doesNotMatch(p, /title="Mahlzeitenstruktur"/,
    'die Kachel Mahlzeitenstruktur ist zurueck')
  assert.doesNotMatch(p, /Hauptmahlzeiten/,
    'das Feld Hauptmahlzeiten ist zurueck — zwei Wahrheiten')
  assert.match(p, /<SlotsFormular start=\{d\.slots\}/,
    'die Slotliste steht nicht in den Vorlieben')

  // `[cmd]` **`rasterZeilen` wird hier nicht mehr gebraucht** — ein
  // verwaister Import ist kein Fehler, aber ein Rest.
  assert.doesNotMatch(p, /(?<![a-z0-9_])rasterZeilen(?![a-z0-9_])/,
    'der verwaiste rasterZeilen-Import ist zurueck')
})

// ══ 5 · G-339: Quick-Add schickt CHECK-taugliche Werte ═══════════════

test('G-339: die Quick-Add-Auswahl kommt aus KATEGORIE_TEXT', () => {
  // `[cmd]` **Hier stand eine sechste Liste** — fuenf englische Namen
  // (`Breakfast` … `Pre-workout`) mit dem Schluessel `preworkout`.
  //
  // `[read]` **Sie ueberlebte G-335**, weil sie den Code als WERT
  // schrieb (`{ id: 'breakfast' }`) statt als Schluessel.
  const m = ohneKommentare(MODALE)
  assert.match(m, /const MEAL_TYPES = Object\.entries\(KATEGORIE_TEXT\)/,
    'die Auswahl haelt wieder eine eigene Liste')
  assert.match(m, /import \{ KATEGORIE_TEXT \}/,
    'die eine Namensquelle wird nicht importiert')
})

test('G-339: preworkout ist weg — der CHECK kennt ihn nicht', () => {
  // `[cmd]` **`nutrition.meals.meal_type` CHECK, gemessen 2026-09-02:**
  // breakfast, lunch, dinner, snack, pre_workout, post_workout, other.
  //
  // `[cmd]` **`preworkout` ohne Unterstrich steht NICHT darin.**
  const m = ohneKommentare(MODALE)
  assert.doesNotMatch(m, /(?<![a-z0-9_])preworkout(?![a-z0-9_])/,
    'preworkout ist zurueck — die Zeile waere nicht schreibbar')

  // Die Wirkung: jeder angebotene Wert steht im CHECK.
  const CHECK = ['breakfast', 'lunch', 'dinner', 'snack',
    'pre_workout', 'post_workout', 'other']
  for (const code of Object.keys(KATEGORIE_TEXT)) {
    assert.ok(CHECK.includes(code),
      `${code} wird angeboten, steht aber nicht im CHECK`)
  }
  assert.equal(Object.keys(KATEGORIE_TEXT).length, CHECK.length,
    'die Auswahl deckt nicht genau die CHECK-Werte ab')
})

test('G-339: die option traegt ein value — sonst faehrt der Label los', () => {
  // `[cmd]` **Am 2026-09-02 gemessen, vor dem Bau:** die `<option>`
  // hatte KEIN `value`. **Der Browser schickt dann den Text** — also
  // `Pre-workout`, nicht einmal `preworkout`.
  //
  // `[read]` **Das ist schlimmer als der falsche Schluessel** und
  // faellt in keinem Typecheck auf.
  const m = ohneKommentare(MODALE)
  const i = m.indexOf('aria-label="Meal"')
  assert.ok(i > 0, 'die Mahlzeitenauswahl fehlt')
  const block = m.slice(i, i + 400)
  assert.match(block, /<option key=\{m\.id\} value=\{m\.id\}>/,
    'die option traegt kein value — der Browser schickt den Label')
})

test('G-339/G-342: in modale.tsx stehen keine Zeiten mehr', () => {
  // `[read]` **Die alte Liste vermischte beides** — wie eine
  // Kategorie heisst UND wann sie liegt.
  //
  // ══ UMGESTELLT IN G-342, 2026-09-02 ═════════════════════════
  //
  // `[cmd]` **G-339 trennte sie in `VORGABE_ZEIT`** — noetig fuer
  // den `meal_schedule`-Block in *Nutrition settings*.
  //
  // `[cmd]` **G-342 hat diesen Block geloescht** (132 Zeilen, kein
  // Aufrufer, seit E-58 ueberholt). **Damit faellt auch die
  // Zeittabelle** — sie hatte nur ihn als Verbraucher.
  //
  // `[read]` **Die Trennung ist jetzt vollstaendig:** `modale.tsx`
  // fuehrt ueberhaupt keine Zeiten mehr. **Die echten stehen in
  // `nutrition.meal_slots`** (C-392), gepflegt im Vorlieben-Reiter.
  const m = ohneKommentare(MODALE)
  assert.doesNotMatch(m, /const VORGABE_ZEIT/,
    'die Vorgabezeiten sind zurueck — dann ist der tote Block auch zurueck')

  // `[cmd]` **Die Wirkung, nicht das Wort:** keine `'HH:MM'`-Werte
  // im Quelltext. **Ein zweiter Zeitvorrat waere eine zweite
  // Wahrheit ueber die Mahlzeitenstruktur.**
  assert.doesNotMatch(m, /['"][012]\d:[0-5]\d['"]/,
    'in modale.tsx stehen wieder Uhrzeiten — sie gehoeren in meal_slots')
})

test('G-342: der tote Einstellungsblock ist weg', () => {
  // `[cmd]` **`nutsettings` hatte keinen Aufrufer** — der Typ stand
  // da, der Verteiler auch, **aber nichts setzte ihn.**
  //
  // `[read]` **Die Wirkung ist eine dreifache Abwesenheit:** die
  // Funktion, der Typwert und die Verteilerzeile. **Fehlt eine
  // Probe, kaeme der Block ueber sie zurueck.**
  const m = ohneKommentare(MODALE)
  assert.doesNotMatch(m, /function NutritionSettingsModal/,
    'das Einstellungsmodal ist zurueck')
  assert.doesNotMatch(m, /'nutsettings'/,
    'der Typwert nutsettings ist zurueck')
  assert.doesNotMatch(m, /meal_schedule/,
    'der meal_schedule-Block ist zurueck — die Struktur liegt in meal_slots (E-58)')

  // `[read]` **Die vier lebenden Modale bleiben** — die Loeschung
  // sollte genau eines treffen.
  for (const k of ['MealCamModal', 'CustomFoodModal', 'QuickAddModal']) {
    assert.match(m, new RegExp(`function ${k}\\b`),
      `${k} ist mitgeloescht worden — nur nutsettings war gemeint`)
  }
})

