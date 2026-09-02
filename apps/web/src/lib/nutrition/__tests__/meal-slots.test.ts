/**
 * G-332 — die Mahlzeiten benennen und terminieren.
 *
 * **Tom, 2026-09-02:** *„kuenftig sagt man wieviele mahlzeiten man hat
 * und dann definiert man jede einzelne mit zeit und namen."*
 *
 * `[read]` **Die Wächter messen die Wirkung, nicht das Wort** —
 * CLAUDE.md nennt vier Fälle (G-216, G-247, G-246, G-108), in denen
 * einer grün blieb, während die Sache kaputt war.
 */
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { test } from 'node:test'

import {
  MAX_ABSTAND_MIN, NAMEN_VORSCHLAEGE, aufAnzahl, initialSlots,
  kurzZeit, listenFehler, minuten, ohnePosition, slotFuerTyp,
  slotFuerZeit, zeilenFehler, type MahlzeitSlot,
} from '../slots-lage'

// `[cmd]` **Pfad aus der Lage DIESER Datei** — mit `process.cwd()`
// grün aus der Wurzel und rot im Gate (G-291, A-63).
const WURZEL = path.resolve(
  path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')),
  '../../../../../..',
)
const lies = (f: string) => fs.readFileSync(path.join(WURZEL, f), 'utf8')
const ohneKommentare = (f: string) => lies(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const FORM = 'apps/web/src/app/v2/nutrition/slots-formular.tsx'
const AKTION = 'apps/web/src/app/v2/nutrition/slots-aktionen.ts'
const DIARY = 'apps/web/src/app/v2/nutrition/mahlzeiten.tsx'
const PREFS = 'apps/web/src/app/v2/nutrition/tab-vorlieben.tsx'
const SETTINGS = 'apps/web/src/app/v2/settings/formular.tsx'
const PLAN = 'apps/web/src/lib/nutrition/plan-lesen.ts'
const MODEL = 'apps/web/src/lib/nutrition/diary-model.ts'

/** Die fünf Slots, die `dev@lumeos.app` trägt (C-394). */
const DEV: MahlzeitSlot[] = [
  { position: 1, name: 'Frühstück', planned_time: '07:30' },
  { position: 2, name: 'Snack', planned_time: '10:14' },
  { position: 3, name: 'Mittagessen', planned_time: '12:30' },
  { position: 4, name: 'Nachmittagssnack', planned_time: '16:00' },
  { position: 5, name: 'Abendessen', planned_time: '19:30' },
]

test('die Dateiproben finden ihre Dateien — unabhängig vom Startort', () => {
  for (const f of [FORM, AKTION, DIARY, PREFS, SETTINGS, PLAN, MODEL]) {
    assert.ok(fs.existsSync(path.join(WURZEL, f)), `${f} nicht gefunden`)
    assert.ok(lies(f).length > 300, `${f} ist verdächtig kurz`)
  }
  assert.ok(fs.existsSync(path.join(WURZEL, 'pnpm-workspace.yaml')),
    `WURZEL zeigt nicht auf das Repo: ${WURZEL}`)
})

// ══ Die Rechnung ═════════════════════════════════════════════════════

test('G-332: die Zuordnung nimmt die nächstliegende Zeit', () => {
  // **Der Auftrag:** *„Die Zuordnung macht die Zeit — nächstliegende
  // Slot-Zeit, ohne gespeicherte Kennung."*
  //
  // `[read]` **Nächstliegend, nicht „der letzte davor"** — wer um
  // 11:50 isst, gehört zum Mittagessen (12:30), nicht zum Snack
  // (10:14).
  assert.equal(slotFuerZeit(DEV, '11:50')?.name, 'Mittagessen')
  assert.equal(slotFuerZeit(DEV, '12:20')?.name, 'Mittagessen')
  assert.equal(slotFuerZeit(DEV, '07:35')?.name, 'Frühstück')
  assert.equal(slotFuerZeit(DEV, '19:00')?.name, 'Abendessen')
})

test('G-332: zu weit weg heisst KEIN Slot — der 22-Uhr-Fall', () => {
  // **Tom:** *„wer um 22:00 noch isst, hat dafuer keinen Slot und
  // soll trotzdem erfassen koennen."*
  //
  // `[cmd]` **Ohne Grenze fände 22:00 das Abendessen um 19:30** —
  // 150 Minuten entfernt. **Das ist keine Zuordnung, das ist der
  // nächstbeste Rest.**
  //
  // `[cmd]` **Gemessen an den dev-Slots:** die Abstände zwischen
  // benachbarten Slots sind 164, 136, 210, 210 Minuten — **die
  // Hälfte des grössten ist 105.**
  assert.equal(slotFuerZeit(DEV, '22:00'), null,
    '22:00 bekommt einen Slot — dann ist die Grenze zu weit')

  // `[read]` **Und jede Zeit ZWISCHEN zwei Slots wird noch
  // zugeordnet** — auch in der weitesten Lücke (12:30 → 16:00).
  assert.ok(slotFuerZeit(DEV, '14:15') !== null,
    'die Mitte der weitesten Lücke fällt heraus — die Grenze ist zu eng')
  assert.equal(MAX_ABSTAND_MIN, 120,
    'die Grenze ist verstellt — die Begründung neu messen')
})

test('G-332: ohne Zeit oder ohne Slots gibt es keine Zuordnung', () => {
  // `[cmd]` **0 von 2.899 `meals` sind ohne `meal_time`** — aber der
  // Fall muss trotzdem beantwortet sein.
  assert.equal(slotFuerZeit(DEV, null), null)
  assert.equal(slotFuerZeit(DEV, 'quatsch'), null)
  assert.equal(slotFuerZeit([], '12:30'), null)
})

test('G-332: Initialwerte tragen die gemessenen Zeiten', () => {
  // `[cmd]` **Gemessen, nicht geraten** — die dev-Slots stehen auf
  // 07:30, 12:30, 19:30 für die drei Hauptmahlzeiten.
  const drei = initialSlots(3)
  assert.deepEqual(drei.map(s => s.name),
    ['Frühstück', 'Mittagessen', 'Abendessen'])
  assert.deepEqual(drei.map(s => s.planned_time),
    ['07:30', '12:30', '19:30'])

  // `[read]` **Nach Zeit sortiert** — sonst stünde die
  // Zwischenmahlzeit (10:00) hinter dem Abendessen.
  const fuenf = initialSlots(5)
  const zeiten = fuenf.map(s => minuten(s.planned_time) ?? 0)
  assert.deepEqual([...zeiten].sort((a, b) => a - b), zeiten,
    'die Initialwerte stehen nicht in zeitlicher Reihenfolge')
  assert.deepEqual(fuenf.map(s => s.position), [1, 2, 3, 4, 5])
})

test('G-332: keine Obergrenze — über sechs wird aufgefüllt', () => {
  // `[cmd]` **Der CHECK auf `meals_per_day` ist seit C-392 weg.**
  // `[read]` **Eine stumm gekürzte Liste wäre schlimmer als eine mit
  // faden Namen.**
  const acht = initialSlots(8)
  assert.equal(acht.length, 8, 'die Liste wird abgeschnitten')
  assert.deepEqual(acht.map(s => s.position), [1, 2, 3, 4, 5, 6, 7, 8])
  assert.equal(initialSlots(0).length, 0)
  assert.equal(initialSlots(-3).length, 0)
})

test('G-332: die Anzahl ändern — hoch fügt an, runter kürzt von unten', () => {
  // **Der Auftrag:** *„Wer die Anzahl erhöht, bekommt neue Zeilen;
  // wer sie senkt, verliert Zeilen von unten."*
  //
  // `[read]` **Vorhandene Zeilen bleiben unverändert** — ein
  // geänderter Name überlebt die Erhöhung.
  const eigen: MahlzeitSlot[] = [
    { position: 1, name: 'Mein Morgen', planned_time: '06:00' },
    { position: 2, name: 'Mein Mittag', planned_time: '13:00' },
  ]
  const hoch = aufAnzahl(eigen, 4)
  assert.equal(hoch.length, 4)
  assert.equal(hoch[0].name, 'Mein Morgen', 'ein eigener Name ging verloren')
  assert.equal(hoch[1].name, 'Mein Mittag')

  const runter = aufAnzahl(DEV, 3)
  assert.deepEqual(runter.map(s => s.name),
    ['Frühstück', 'Snack', 'Mittagessen'])
  assert.deepEqual(runter.map(s => s.position), [1, 2, 3])
})

test('G-332: eine gelöschte Position schliesst die Lücke', () => {
  // **Die Auftragsfrage:** *„Miss, was mit einer gelöschten Position
  // geschieht, deren Nummer eine andere braucht."*
  //
  // `[cmd]` **Am 2026-09-02 gegen die Datenbank gemessen:**
  //
  //     DELETE position=2, dann UPDATE 3 -> 2     geht
  //     UPDATE 3 -> 2, waehrend 2 noch steht      duplicate key
  //
  // `[read]` **Der PK ist `(user_id, position)`**, es gibt keine `id`.
  const ohne = ohnePosition(DEV, 2)
  assert.equal(ohne.length, 4)
  assert.deepEqual(ohne.map(s => s.position), [1, 2, 3, 4],
    'die Nummern haben eine Lücke — der PK verträgt das, die Anzeige nicht')
  assert.deepEqual(ohne.map(s => s.name),
    ['Frühstück', 'Mittagessen', 'Nachmittagssnack', 'Abendessen'])
})

test('G-332: der Schreibweg löscht erst und fügt dann ein', () => {
  // `[read]` **Mit `UPDATE` hinge die Richtigkeit an der Reihenfolge
  // der Anweisungen** — beim Löschen von vorn nach hinten, beim
  // Einfügen umgekehrt. **Ein Fehler dort fällt erst auf, wenn jemand
  // die dritte von fünf löscht.**
  const a = ohneKommentare(AKTION)
  const i = a.indexOf(".from('meal_slots').delete()")
  const j = a.indexOf(".from('meal_slots').insert(")
  assert.ok(i > 0, 'der Schreibweg löscht nicht')
  assert.ok(j > i, 'eingefügt wird vor dem Löschen — das kollidiert')
  assert.doesNotMatch(a, /from\('meal_slots'\)[\s\S]{0,40}\.update\(/,
    'der Schreibweg benutzt UPDATE — dann hängt es an der Reihenfolge')

  // `[cmd]` **Die Nummer kommt aus der Reihenfolge**, nicht aus dem
  // Feld — so kann keine Lücke entstehen.
  //
  // `[cmd]` **BERICHTIGT nach der Sabotageprobe:** hier stand nur
  // `assert.match(a, /position: i \+ 1/)`. **`position: s.position`
  // kam durch** — das Muster steht auch in `slots-lage.ts`, und der
  // Schnitt umfasste die ganze Datei.
  //
  // `[read]` **Also im INSERT-Block geschnitten**, und die falsche
  // Form ausdrücklich ausgeschlossen.
  const ins = a.indexOf(".from('meal_slots').insert(")
  const block = a.slice(ins, a.indexOf('}))', ins))
  assert.match(block, /position: i \+ 1/,
    'die Position wird übernommen statt neu vergeben')
  assert.doesNotMatch(block, /position: s\.position/,
    'der Insert übernimmt die alte Nummer — dann bleibt eine Lücke')

  // `[cmd]` **Und die Prüfung läuft VOR dem Schreiben.**
  // `[read]` **Alle vier Spalten sind NOT NULL** — ein leerer Name
  // käme sonst als Datenbankfehler zurück, nicht als Satz.
  const pruef = a.indexOf('listenFehler(slots)')
  assert.ok(pruef > 0 && pruef < ins,
    'die Prüfung läuft nicht vor dem Schreiben')
  assert.match(a, /if \(fehler\) return \{ ok: false, fehler \}/,
    'ein Prüffehler hält das Schreiben nicht auf')
})

test('G-332: alle vier Spalten sind NOT NULL — die Prüfung läuft vorher', () => {
  // `[cmd]` **C-392: `user_id`, `position`, `name`, `planned_time`
  // sind alle NOT NULL.** `[read]` **Ein leerer Name käme sonst als
  // Datenbankfehler zurück.**
  assert.equal(zeilenFehler({ position: 1, name: '', planned_time: '07:30' }) !== null, true)
  assert.equal(zeilenFehler({ position: 1, name: '  ', planned_time: '07:30' }) !== null, true)
  assert.equal(zeilenFehler({ position: 1, name: 'X', planned_time: '25:00' }) !== null, true)
  assert.equal(zeilenFehler({ position: 1, name: 'X', planned_time: '07:30' }), null)

  // Zwei Zeilen mit derselben Nummer verletzen den PK.
  assert.ok(listenFehler([
    { position: 1, name: 'A', planned_time: '07:00' },
    { position: 1, name: 'B', planned_time: '12:00' },
  ]) !== null, 'zwei gleiche Nummern kommen durch — der PK lehnt sie ab')

  // `[read]` **Zwei Zeilen zur selben UHRZEIT sind erlaubt** — wer
  // zweimal um 12:30 isst, hat zwei Mahlzeiten.
  assert.equal(listenFehler([
    { position: 1, name: 'A', planned_time: '12:30' },
    { position: 2, name: 'B', planned_time: '12:30' },
  ]), null, 'zwei gleiche Zeiten werden abgelehnt — das ist erlaubt')
})

test('G-332: die Datenbank liefert Sekunden, die Anzeige nicht', () => {
  assert.equal(kurzZeit('07:30:00'), '07:30')
  assert.equal(kurzZeit('07:30'), '07:30')
})

// ══ Die Oberfläche ═══════════════════════════════════════════════════

test('G-332: das Formular hat beide Schritte', () => {
  // **Tom:** *„sagt man wieviele mahlzeiten man hat und dann
  // definiert man jede einzelne mit zeit und namen."*
  const f = ohneKommentare(FORM)
  assert.match(f, /data-probe="slots-anzahl"/, 'der Anzahl-Schritt fehlt')
  assert.match(f, /data-probe="slot-name"/, 'das Namensfeld fehlt')
  assert.match(f, /data-probe="slot-zeit"/, 'das Zeitfeld fehlt')

  // Die Wirkung: die Anzahl ändert die Liste.
  assert.match(f, /onChange=\{e => anzahlSetzen\(Number\(e\.target\.value\)\)\}/,
    'die Anzahl wirkt nicht auf die Liste')
  assert.match(f, /aufAnzahl\(slots, n\)/,
    'die Anzahl rechnet die Liste nicht neu')
})

test('G-332: Namen als Auswahl PLUS Freitext', () => {
  // **Tom:** *„die gaengigsten als pulldown plus manuelle eingabe."*
  //
  // `[cmd]` **`<datalist>` ist genau das** — ein `<select>` verböte
  // freien Text, und `name` ist in der Datenbank frei.
  const f = ohneKommentare(FORM)
  assert.match(f, /<datalist id="slot-namen">/, 'die Vorschlagsliste fehlt')
  assert.match(f, /list="slot-namen"/, 'das Namensfeld nutzt die Vorschläge nicht')
  assert.doesNotMatch(f, /<select[^>]*data-probe="slot-name"/,
    'der Name ist ein select — dann geht kein Freitext')
  assert.ok(NAMEN_VORSCHLAEGE.length >= 5,
    `nur ${NAMEN_VORSCHLAEGE.length} Vorschläge`)
})

test('G-332: der Leerzustand bekommt ein Angebot, keinen Fehler', () => {
  // `[cmd]` **`test-user@lumeos.local` trägt null Slots** (C-394) —
  // **das ist kein Defekt.**
  const f = ohneKommentare(FORM)
  assert.match(f, /data-probe="slots-leer"/, 'der Leerhinweis fehlt')
  assert.match(f, /data-probe="slots-vorschlag"/, 'das Angebot fehlt')
  assert.match(f, /speichern\(initialSlots\(4\)\)/,
    'das Angebot legt keine Slots an')
})

test('G-332: EIN Formular, zwei Orte', () => {
  // **Der Auftrag:** *„Ein Formular, zwei Orte — nicht zwei
  // Formulare."*
  //
  // `[cmd]` **Die Kollision aus G-72 fällt weg:** dort lagen die
  // Zahlen in `food_preferences`, während Settings nach
  // `user_profiles` schrieb.
  const p = ohneKommentare(PREFS)
  const s = ohneKommentare(SETTINGS)
  assert.match(p, /<SlotsFormular start=\{d\.slots\}/,
    'Preferences ruft das Formular nicht')
  assert.match(s, /<SlotsFormular start=\{slots\}/,
    'Settings ruft das Formular nicht')

  // Die Wirkung: es gibt nur EINE Definition.
  const f = lies(FORM)
  const defs = (f.match(/export function SlotsFormular\(/g) ?? []).length
  assert.equal(defs, 1, `${defs} Definitionen von SlotsFormular`)

  // `[read]` **Und Settings schreibt nicht selbst** — beide rufen
  // dieselbe Aktion.
  assert.doesNotMatch(s, /meal_slots/,
    'Settings fasst die Tabelle direkt an — das wäre der zweite Schreibweg')
})

// ══ Tagebuch ═════════════════════════════════════════════════════════

test('G-332: die Tagebuchzeilen heissen wie die Slots', () => {
  const d = ohneKommentare(DIARY)
  assert.match(d, /data-probe="karten-name"/, 'der Kartenname ist nicht markiert')
  assert.match(d, /const s = slotFuerZeit\(mahlzeitSlots, zeit\)/,
    'die Zuordnung läuft nicht über die Zeit')
  assert.match(d, /return s\?\.name \?\? SLOT_LABEL\[typ\]/,
    'ohne Slot fällt es nicht auf SLOT_LABEL zurück')

  // `[read]` **Eine leere Karte hat keine Uhrzeit** — dort über die
  // Stellung in der Reihe.
  assert.match(d, /slotFuerTyp\(mahlzeitSlots, typ, reihen\) \?\? SLOT_LABEL\[typ\]/,
    'leere Karten bekommen keinen Slot-Namen')
})

test('G-332: slotFuerTyp geht über die Stellung, nicht über meal_type', () => {
  // `[read]` **Eine Abbildung *breakfast → Frühstück* wäre geraten**,
  // sobald jemand seinen ersten Slot „Morgenmahlzeit" nennt.
  const reihen = ['breakfast', 'lunch', 'dinner', 'snack']
  assert.equal(slotFuerTyp(DEV, 'breakfast', reihen), 'Frühstück')
  assert.equal(slotFuerTyp(DEV, 'lunch', reihen), 'Snack')
  assert.equal(slotFuerTyp(DEV, 'other', reihen), null,
    'ein Typ ausserhalb der Reihen bekommt einen Namen')
  assert.equal(slotFuerTyp([], 'breakfast', reihen), null)
})

test('G-332: eine Mahlzeit ausserhalb der Slots ist anlegbar', () => {
  // **Tom:** *„ein user kann auch jederzeit im diary eine neue
  // mahlzeit anlegen und nutrients reinpacken."*
  //
  // `[cmd]` **Gemessen: der Knopf ist NICHT mit G-331 verschwunden**
  // — `sicherstellen()` legt seit C-03 an. **Es gab ihn nie für eine
  // FREIE Mahlzeit:** leere Karten entstehen je vordefiniertem Slot.
  const d = ohneKommentare(DIARY)
  assert.match(d, /data-probe="freie-mahlzeit-oeffnen"/, 'der Knopf fehlt')
  assert.match(d, /data-probe="freie-zeit"/, 'die Zeit ist nicht wählbar')
  assert.match(d, /art: 'mahlzeit', entry_date: datum, meal_type: typ, meal_time: zeit/,
    'die freie Mahlzeit schickt ihre Zeit nicht mit')

  // `[cmd]` **`meal_time` wurde bis heute NIE gesetzt** — ohne die
  // Schema-Erweiterung liefe die Zuordnung ins Leere.
  const m = ohneKommentare(MODEL)
  assert.match(m, /meal_time: z\.string\(\)/,
    'das Schema nimmt keine meal_time')
  assert.match(m, /meal_time: input\.meal_time \?\? null/,
    'der Insert setzt die Zeit nicht')
})

// ══ Planner ══════════════════════════════════════════════════════════

test('G-332/G-336: ein gelieferter Plan bringt seine Struktur mit', () => {
  // **Tom:** *„bei gekauften oder von coach wird der plan ja
  // vollstaendig geliefert."*
  //
  // ══ BERICHTIGT IN G-336 ═════════════════════════
  //
  // `[cmd]` **Hier stand `planZeilen: Slot[] = SLOTS.filter(...)`** —
  // die Zeilen aus den EINTRAEGEN abgeleitet.
  //
  // `[cmd]` **Am 2026-09-02 gemessen, und es ging in beide Richtungen
  // schief:**
  //
  //     test, 5 Slots, 0 Eintraege    -> 4 Zeilen "aus deinen
  //                                      Vorlieben"
  //     Lean bulk, 0 Slots, marketpl. -> 4 Zeilen "aus diesem Plan"
  //
  // `[read]` **Ein Plan ohne Eintraege hat trotzdem eine Struktur**,
  // und ein Plan mit Eintraegen hat deshalb noch keine eigene.
  //
  // `[read]` **Die Zusage bleibt, ihre Quelle wechselt:** die
  // Struktur steht in `meal_plan_slots` (C-396), nicht in dem, was
  // schon eingetragen wurde. **Die Rangfolge prueft
  // `raster-liest-planslots.test.ts` mit Werten.**
  const p = ohneKommentare(PLAN)
  assert.match(p, /\.from\('meal_plan_slots'\)/,
    'die Planstruktur wird nicht gelesen')
  assert.match(p, /rasterQuelle\(\{/,
    'die Rangfolge entscheidet die Zeilen nicht')

  // `[cmd]` **Der alte Weg ist entfernt, nicht auskommentiert**
  // (A-59).
  assert.doesNotMatch(p, /(?<![a-z0-9_])planZeilen(?![a-z0-9_])/,
    'planZeilen lebt weiter — dann gibt es zwei Wahrheiten')

  // `[read]` **Der Rueckfall auf die Vorlieben bleibt** — fuer einen
  // Nutzer ohne Slots ist er die einzige Quelle.
  // `[cmd]` **Ueber Zeilenumbrueche hinweg** — G-336 hat den Aufruf
  // auf zwei Zeilen gelegt, und ein Muster auf einer Zeile faende ihn
  // nicht mehr. **Die Wirkung ist, DASS aus den zwei Spalten
  // gerechnet wird, nicht wie es umbrochen ist.**
  assert.match(p, /rasterZeilen\(\s*zahl\(p\?\.meals_per_day\),\s*zahl\(p\?\.snacks_per_day\)\)/,
    'der Rueckfall auf die Vorlieben ist weg')
  assert.match(p, /vorliebenZeilen = rasterZeilen\(/,
    'das Ergebnis des Rueckfalls wird nicht behalten')

  // `[read]` **Die benutzten Kategorien werden weiter gesammelt** —
  // sie sagen jetzt die Zuordnung, nicht die Zeilenzahl.
  assert.match(p, /const benutzteReihen: string\[\] = SLOTS\.filter/,
    'die benutzten Kategorien werden nicht mehr gesammelt')
})
