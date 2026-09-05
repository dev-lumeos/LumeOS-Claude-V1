/**
 * G-336 — das Raster liest `meal_plan_slots`, und das Anlegen ist ein
 * Modal.
 *
 * **Tom, 2026-09-02:** *,,ich habe getestet einen neuen plan anzulegen,
 * genau was ich sage es uebernimmt die definition in preferences
 * nicht."*
 *
 * `[cmd]` **Gemessen am 2026-09-02, VOR dem Bau** — der Satz unter dem
 * Raster war in jedem gemessenen Fall falsch herum:
 *
 *     test, 5 Slots, 0 Eintraege   -> "4 Reihen aus deinen Vorlieben"
 *     Aufbau, 0 Slots, 84 Eintr.   -> "4 Reihen aus diesem Plan"
 *     Lean bulk, 0 Slots           -> "4 Reihen aus diesem Plan"
 *
 * `[read]` **Die Ursache: `planZeilen` kam aus den EINTRAEGEN.** Ein
 * Plan ohne Eintraege hat trotzdem eine Struktur, und ein Plan mit
 * Eintraegen hat deshalb noch keine eigene.
 *
 * `[read]` **Die Waechter messen die Wirkung, nicht das Wort** —
 * CLAUDE.md nennt vier Faelle (G-216, G-247, G-246, G-108), in denen
 * einer gruen blieb, waehrend die Sache kaputt war. **Deshalb steht
 * hier ein Aufruf mit Werten, wo immer es geht.**
 */
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { test } from 'node:test'

import { rasterQuelle, zeilenSatz, type MahlzeitSlot } from '../slots-lage'

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

const LESEN = 'apps/web/src/lib/nutrition/plan-lesen.ts'
const SLOTLESEN = 'apps/web/src/lib/nutrition/slots-lesen.ts'
const PLANNER = 'apps/web/src/app/v2/nutrition/tab-planner-echt.tsx'
const DIARY = 'apps/web/src/app/v2/nutrition/mahlzeiten.tsx'
const HUELLE = 'apps/web/src/app/v2/nutrition/zieh-modal.tsx'
const SUCHE = 'apps/web/src/app/v2/nutrition/food-such-modal.tsx'

/** Die fuenf Slots des Plans `test`, wie am 2026-09-02 gemessen. */
const PLAN_SLOTS: MahlzeitSlot[] = [
  { position: 1, name: 'Frühstück', planned_time: '07:30' },
  { position: 2, name: 'Snack', planned_time: '10:14' },
  { position: 3, name: 'Mittagessen', planned_time: '12:30' },
  { position: 4, name: 'Nachmittagssnack', planned_time: '16:00' },
  { position: 5, name: 'Abendessen', planned_time: '19:30' },
]
const NUTZER_SLOTS: MahlzeitSlot[] = [
  { position: 1, name: 'Morgenbrei', planned_time: '06:45' },
  { position: 2, name: 'Mittag', planned_time: '12:00' },
]
const VORLIEBEN = ['breakfast', 'lunch', 'dinner', 'snack']

test('die Dateiproben finden ihre Dateien — unabhaengig vom Startort', () => {
  for (const f of [LESEN, SLOTLESEN, PLANNER, DIARY, HUELLE, SUCHE]) {
    assert.ok(fs.existsSync(path.join(WURZEL, f)), `${f} nicht gefunden`)
    assert.ok(lies(f).length > 400, `${f} ist verdaechtig kurz`)
  }
  assert.ok(fs.existsSync(path.join(WURZEL, 'pnpm-workspace.yaml')),
    `WURZEL zeigt nicht auf das Repo: ${WURZEL}`)
})

// ══ 1 · Die Rangfolge ════════════════════════════════════════════════

test('G-336: Plan-Slots schlagen alles (E-59)', () => {
  const r = rasterQuelle({
    planSlots: PLAN_SLOTS, nutzerSlots: NUTZER_SLOTS,
    planEigen: true, vorlieben: VORLIEBEN,
  })
  assert.equal(r.quelle, 'plan')
  // `[cmd]` **FUENF Zeilen, nicht vier** — der gemessene Befund.
  assert.equal(r.zeilen.length, 5,
    'der Plan mit fuenf Slots ergibt nicht fuenf Zeilen')
  assert.deepEqual(r.zeilen.map(z => z.label),
    ['Frühstück', 'Snack', 'Mittagessen', 'Nachmittagssnack', 'Abendessen'])
  // Die Zeit steht mit dran — sie kommt aus dem Plan.
  assert.equal(r.zeilen[3].zeit, '16:00')
})

test('G-336: ohne Plan-Slots gelten die Nutzerslots — nur bei eigenem Plan', () => {
  const eigen = rasterQuelle({
    nutzerSlots: NUTZER_SLOTS, planEigen: true, vorlieben: VORLIEBEN,
  })
  assert.equal(eigen.quelle, 'nutzer')
  assert.deepEqual(eigen.zeilen.map(z => z.label), ['Morgenbrei', 'Mittag'])

  // `[read]` **Ein gelieferter Plan bekommt NICHT die eigenen Slots**
  // — er hat entweder eine Struktur oder keine (E-59).
  const fremd = rasterQuelle({
    nutzerSlots: NUTZER_SLOTS, planEigen: false, vorlieben: VORLIEBEN,
  })
  assert.equal(fremd.quelle, 'vorlieben',
    'ein gelieferter Plan uebernimmt die Nutzerslots — das waere E-59 verletzt')
  assert.equal(fremd.zeilen.length, 4)
})

test('G-336: der Rueckfall sind die Vorlieben', () => {
  const r = rasterQuelle({ vorlieben: VORLIEBEN })
  assert.equal(r.quelle, 'vorlieben')
  assert.deepEqual(r.zeilen.map(z => z.kategorie), VORLIEBEN)
  // `[read]` **Ohne Slot gibt es keine Zeit** — nicht `'—'`, nicht `''`.
  assert.deepEqual(r.zeilen.map(z => z.zeit), [null, null, null, null])
})

test('G-336: die Kategorie folgt der Stellung, nicht dem Namen', () => {
  // `[cmd]` **`meal_plan_entries` traegt `meal_type`** — eine Zeile
  // braucht die Kategorie zum Filtern, sonst bleibt sie leer.
  const r = rasterQuelle({
    planSlots: PLAN_SLOTS, vorlieben: VORLIEBEN,
    reihen: ['breakfast', 'lunch', 'dinner', 'snack'],
  })
  // `[cmd]` **Hier stand `other` als fuenfter Wert** — und der
  // Kommentar nannte es richtig: *,,er verschwindet nicht"*.
  //
  // `[cmd]` **Berichtigt am 2026-09-05 (G-351): er verschwand
  // doch** — **`rasterZeilen` hat keine Karte fuer `other`**, also
  // fiel die Zeile aus dem Tag. **Die Absicht stimmte, das Mittel
  // nicht.**
  //
  // `[read]` **Jetzt traegt der Ueberhang die letzte Kategorie** —
  // keine Sammelgruppe (E-63), und der Slot bleibt sichtbar.
  assert.deepEqual(r.zeilen.map(z => z.kategorie),
    ['breakfast', 'lunch', 'dinner', 'snack', 'snack'])
  // **Er verschwindet nicht** — das war und bleibt die Zusage.
  assert.equal(r.zeilen[4].label, 'Abendessen')
  assert.equal(r.zeilen.length, 5, 'der fuenfte Slot ist weg')
})

test('G-336: Slots werden nach Position sortiert, nicht nach Lesefolge', () => {
  const verdreht: MahlzeitSlot[] = [
    { position: 3, name: 'Dritter', planned_time: '18:00' },
    { position: 1, name: 'Erster', planned_time: '07:00' },
    { position: 2, name: 'Zweiter', planned_time: '12:00' },
  ]
  const r = rasterQuelle({ planSlots: verdreht, vorlieben: VORLIEBEN })
  assert.deepEqual(r.zeilen.map(z => z.label),
    ['Erster', 'Zweiter', 'Dritter'])
})

// ══ 2 · Der Satz nennt die richtige Quelle ═══════════════════════════

test('G-336: der Satz sagt, welche Quelle gilt', () => {
  // `[cmd]` **Vorher stand *,,aus diesem Plan"* bei NULL Slots** — der
  // Satz behauptete das Gegenteil des Gemessenen.
  const plan = zeilenSatz('plan', 5)
  assert.match(plan, /5 Reihen aus diesem Plan/)
  assert.doesNotMatch(plan, /Vorlieben/,
    'der Plan-Satz spricht von Vorlieben')

  const nutzer = zeilenSatz('nutzer', 2)
  assert.match(nutzer, /2 Reihen aus deinen Mahlzeiten/)
  assert.doesNotMatch(nutzer, /aus diesem Plan/,
    'der Nutzer-Satz behauptet, es kaeme aus dem Plan')

  const fremd = zeilenSatz('vorlieben', 4, false)
  assert.match(fremd, /4 Reihen aus deinen Vorlieben/)
  assert.match(fremd, /keine eigene Struktur/,
    'der Satz sagt nicht, dass dem Plan die Struktur fehlt')

  // `[read]` **Die drei Saetze sind verschieden** — sonst waere die
  // Quelle nicht erkennbar.
  assert.equal(new Set([plan, nutzer, fremd]).size, 3)
})

// ══ 3 · Die Verdrahtung ══════════════════════════════════════════════

test('G-336: plan-lesen liest meal_plan_slots', () => {
  // `[cmd]` **Die Tabelle hatte in `apps/` KEINEN Leser** — nur die
  // Pipeline und ihr Test.
  const t = ohneKommentare(LESEN)
  assert.match(t, /\.from\('meal_plan_slots'\)/,
    'plan-lesen fragt meal_plan_slots nicht ab')
  // Die Wirkung: gefiltert auf DIESEN Plan, nicht auf alle.
  assert.match(t, /\.eq\('plan_id', planSlotId\)/,
    'die Abfrage haengt nicht am gewaehlten Plan')
  // ══ BERICHTIGT NACH DER SABOTAGEPROBE ═══════════════════════
  //
  // `[cmd]` **Hier stand `assert.match(t, /rasterQuelle\(\{/)`.** Die
  // Sabotage ersetzte die Rueckgabe durch
  // `rasterQuelle({ vorlieben: vorliebenZeilen })` — **der Aufruf
  // stand noch da, die Planslots gingen nicht mehr hinein, und der
  // Waechter blieb gruen.**
  //
  // `[read]` **Genau der Wortwaechter, den CLAUDE.md viermal
  // beschreibt** (G-216, G-247, G-246, G-108).
  //
  // `[read]` **Die Wirkung haengt daran, dass GENAU DIESER Aufruf die
  // Rueckgabe speist** — deshalb wird der Aufrufblock herausgeschnitten
  // und einzeln geprueft (Memory: erst den Block schneiden, dann
  // suchen).
  const i = t.indexOf('const rasterLage = rasterQuelle({')
  assert.ok(i > 0, 'die Rangfolge wird nicht in `rasterLage` gerufen')
  const aufruf = t.slice(i, t.indexOf('})', i))
  for (const feld of ['planSlots', 'nutzerSlots', 'planEigen', 'vorlieben']) {
    assert.ok(new RegExp(`(?<![a-z0-9_])${feld}(?![a-z0-9_])`).test(aufruf),
      `${feld} geht nicht in die Rangfolge`)
  }
  // Und ihr Ergebnis ist die Rueckgabe — nicht ein zweiter Aufruf.
  assert.match(t, /zeilen: rasterLage\.zeilen,/,
    'die Zeilen kommen nicht aus der Rangfolge')
  assert.match(t, /zeilenQuelle: rasterLage\.quelle,/,
    'die Quelle kommt nicht aus der Rangfolge')

  // `[cmd]` **Der alte Weg ist weg** — `planZeilen` aus den
  // Eintraegen abzuleiten war die Ursache (A-59: entfernen, nicht
  // auskommentieren).
  assert.doesNotMatch(t, /(?<![a-z0-9_])planZeilen(?![a-z0-9_])/,
    'planZeilen lebt weiter — dann gibt es zwei Wahrheiten')
})

test('G-336: der Ghost-Leseweg fragt den AKTIVEN Plan', () => {
  const t = ohneKommentare(SLOTLESEN)
  assert.match(t, /export async function ladeAktivPlanSlots/,
    'der Leseweg fehlt')
  // `[read]` **Dieselbe Bedingung wie `ladeGhostEintraege`** — zwei
  // Bedingungen fuer dieselbe Frage waeren zwei Wahrheiten.
  const block = t.slice(t.indexOf('ladeAktivPlanSlots'))
  assert.match(block, /\.eq\('status', 'active'\)/,
    'der aktive Plan wird nicht ueber status=active gesucht')
  assert.match(block, /\.from\('meal_plan_slots'\)/,
    'die Planslots werden nicht gelesen')
})

test('G-336: das Raster zeigt den Namen, nicht die Kategorie', () => {
  const t = ohneKommentare(PLANNER)
  // `[cmd]` **Hier stand `SLOT_LABEL[slot]`.**
  assert.match(t, /\{zeile\.label\}/,
    'die Zeile zeigt ihre Beschriftung nicht')
  // Die Wirkung: gefiltert wird ueber die Kategorie, nicht das Wort.
  assert.match(t, /e\.meal_type === zeile\.kategorie/,
    'die Eintraege werden nicht nach der Zeilenkategorie gefiltert')
  assert.doesNotMatch(t, /SLOT_LABEL\[slot\]/,
    'die feste Kategorienliste ist zurueck')
})

// ══ 4 · Das Modal ════════════════════════════════════════════════════

test('G-336: es gibt EINE Ziehlogik, nicht zwei', () => {
  // **Der Auftrag:** *,,Dieselbe Machart, keine neue."*
  //
  // `[read]` **Die Wirkung: der Griffpunkt steht genau einmal im
  // Quelltext.** **Eine Kopie waere eine zweite Wahrheit.**
  const dateien = fs.readdirSync(
    path.join(WURZEL, 'apps/web/src/app/v2/nutrition'))
    .filter(f => f.endsWith('.tsx'))
  const mitZug = dateien.filter(f => /griff\.current = \{/.test(
    ohneKommentare(`apps/web/src/app/v2/nutrition/${f}`)))
  assert.deepEqual(mitZug, ['zieh-modal.tsx'],
    `die Ziehlogik steht in ${mitZug.length} Dateien statt in einer`)

  // Und die Suche benutzt sie, statt eine eigene zu halten.
  assert.match(ohneKommentare(SUCHE), /<ZiehModal/,
    'FoodSuchModal benutzt die gemeinsame Huelle nicht')
})

test('G-336: Mahlzeit hinzufuegen steht im Modal, der Knopf bleibt', () => {
  // `[cmd]` **Gemessen vor dem Bau: `knopf_noch_da: 0`** — beim Klick
  // war er weg, und das Formular stand bei y=2720.
  const t = ohneKommentare(DIARY)
  const i = t.indexOf('data-probe="freie-mahlzeit-oeffnen"')
  assert.ok(i > 0, 'der Knopf fehlt')

  // `[read]` **Der Knopf steht NICHT mehr in einem `if (!offen)`** —
  // genau das liess ihn verschwinden.
  const vorKnopf = t.slice(Math.max(0, i - 600), i)
  assert.doesNotMatch(vorKnopf, /if \(!offen\) \{/,
    'der Knopf haengt wieder an `!offen` — dann verschwindet er beim Klick')

  // Und das Formular liegt im Modal.
  assert.match(t, /<ZiehModal[\s\S]{0,400}probe="freie-mahlzeit"/,
    'das Formular steht nicht im Modal')
})

test('G-336: die Auswahl bietet Slots MIT Zeit und Kategorien getrennt', () => {
  const t = ohneKommentare(DIARY)
  const i = t.indexOf('data-probe="freie-art"')
  assert.ok(i > 0, 'die Auswahl fehlt')
  const block = t.slice(i, i + 1400)

  // `[cmd]` **Vorher standen dort die sieben Kategorien** — kein
  // einziger Name des Nutzers.
  assert.match(block, /\{s\.name\} \(\{s\.planned_time\}\)/,
    'die Slots stehen nicht mit ihrer Zeit in der Auswahl')

  // `[cmd]` **Die Kategorien OHNE Slots aufgeloest** — sonst zeigen
  // beide Haelften dieselben Namen (gemessen 2026-09-02).
  assert.match(block, /kategorieAuswahl\(\)/,
    'die Kategorien werden ueber die Nutzerslots aufgeloest — dann '
    + 'stehen dieselben Namen zweimal da')

  // Und der Freitext daneben.
  assert.match(t, /data-probe="freie-name"/, 'das Freitextfeld fehlt')
})

test('G-336: der Einsortiersatz steht im Modal und nennt beide Faelle', () => {
  const t = ohneKommentare(DIARY)
  const i = t.indexOf('data-probe="freie-hinweis"')
  assert.ok(i > 0, 'der Hinweis fehlt')

  // `[read]` **Der 22-Uhr-Fall** — E-58: die Slots ordnen, sie
  // schreiben nicht vor.
  const block = t.slice(i, i + 700)
  assert.match(block, /einsortiert/, 'der Einsortiersatz fehlt')
  assert.match(block, /trotzdem erfasst/,
    'der Fall ohne passenden Slot fehlt — dann waere 22:00 gesperrt')

  // Die Wirkung: `Anlegen` haengt an der ZEIT, nicht am Vorschlag.
  assert.match(t, /disabled=\{laeuft \|\| !zeit\}/,
    'Anlegen haengt an etwas anderem als der Uhrzeit')
})

test('G-336: der freie Text geht nach notes — meals hat keine Namensspalte', () => {
  // `[cmd]` **Gemessen 2026-09-02:** `nutrition.meals` traegt
  // `id, user_id, entry_date, meal_type, notes, created_at,
  // updated_at, meal_time, entry_source, source_detail` — **keine
  // Namensspalte.**
  //
  // `[read]` **Deshalb heisst das Feld *Notiz*** — eine Beschriftung
  // *Name* haette ihr Feld nicht gehalten.
  const t = ohneKommentare(DIARY)
  assert.match(t, /notes: name\.trim\(\)/,
    'der freie Text wird nicht mitgeschrieben')
  assert.match(t, /Notiz \(frei\)/,
    'das Feld heisst wieder Name — meals hat aber keine Namensspalte')
})
