// G-286 (Tages-Akkordeon), G-287 (Plan-Karte), G-290 (Aktivierung).
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  ZYKLUS_WAEHLBAR, istWaehlbar, planKennzahlen, tagesKcal,
} from '../plan-detail-lage'
import { ZYKLUS_TEXT, ZYKLUS_ERKLAERUNG } from '../plan-lage'
import type { PlanDaten, PlanTag } from '../plan-lesen'

const WURZEL = path.resolve(process.cwd(), '../..')
const lies = (rel: string) => fs.readFileSync(path.join(WURZEL, rel), 'utf8')
const ohneKommentare = (rel: string) => lies(rel)
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const eintrag = (kcal: number | null, id = 'e1') => ({
  id, meal_type: 'breakfast' as const, slot_order: 1, entry_type: 'bls',
  recipe_id: null, food_id: null, bezeichnung: 'x',
  amount_g: 100, planned_servings: null, note: null, kcal,
})
const tag = (kcals: Array<number | null>, id = 't1'): PlanTag => ({
  id, plan_date: '2026-06-18', day_index: 1,
  eintraege: kcals.map((k, i) => eintrag(k, `${id}-${i}`)),
})

// ══ G-286 ══════════════════════════════════════════════════════════

test('G-286: ein Tag ohne belegte Werte liefert null, nicht 0', () => {
  // `[read]` **`kcal: null` heisst „nicht ermittelbar", nicht „null
  // Kalorien"** — die Regel steht am Typ in `plan-lesen.ts`.
  // **Ein einziger unbelegter Eintrag macht den Tag unbelegbar**,
  // sonst waere die Summe eine Behauptung ueber Teile, die fehlen.
  assert.equal(tagesKcal(tag([100, 200])), 300)
  assert.equal(tagesKcal(tag([100, null])), null,
    'Ein Eintrag ohne Wert wird als 0 mitgezaehlt (G-286).')
  assert.equal(tagesKcal(tag([])), null,
    'Ein leerer Tag liefert 0 statt null (G-286).')
})

test('G-286: der kcal-Schnitt zaehlt nur vollstaendige Tage', () => {
  // `[read]` **Sonst senkt ein unvollstaendiger Tag den Schnitt** und
  // die Karte behauptet etwas ueber den Plan, das die Daten nicht
  // hergeben.
  const d = {
    plan: null, rezepte: [], wochen: [
      { id: 'w1', week_start: '2026-06-18', name: null, kopiert_von: null,
        tage: [tag([100, 200], 'a'), tag([300, null], 'b'), tag([400, 200], 'c')] },
    ],
  } as unknown as PlanDaten
  const k = planKennzahlen(d)
  assert.equal(k.tage, 3)
  assert.equal(k.eintraege, 6)
  // (300 + 600) / 2 = 450 — der unbelegte Tag faellt heraus.
  assert.equal(k.kcalSchnitt, 450,
    'Der Schnitt rechnet unbelegte Tage mit (G-286).')
})

test('G-286: ohne einen einzigen belegten Tag gibt es keinen Schnitt', () => {
  const d = {
    plan: null, rezepte: [], wochen: [
      { id: 'w1', week_start: '2026-06-18', name: null, kopiert_von: null,
        tage: [tag([null], 'a'), tag([], 'b')] },
    ],
  } as unknown as PlanDaten
  assert.equal(planKennzahlen(d).kcalSchnitt, null,
    'Ohne belegten Tag entsteht eine erfundene Zahl (G-286).')
})

test('G-286: das Akkordeon zeigt die Eintraege, nicht nur die Zahl', () => {
  // `[cmd]` **Tom, 2026-08-31:** *„irgend eine auflistung die gar
  // nichts sagt, nichtmal anschaubar ist oder editierbar."*
  //
  // `[read]` **Die Wirkung pruefen:** rendert die Tageszeile die
  // Eintraege, oder nur ihre Anzahl?
  const s = ohneKommentare('apps/web/src/app/v2/nutrition/plan-detail.tsx')
  assert.match(s, /t\.eintraege\.map\(e =>/,
    'Der Tag zeigt seine Eintraege nicht mehr (G-286).')
  assert.match(s, /\{e\.bezeichnung\}/,
    'Die Eintragszeile nennt die Bezeichnung nicht (G-286).')
  // `[read]` **Gezaehlt, nicht gesucht.** `aria-expanded={offen}`
  // steht ZWEIMAL — an der Karte (G-287) und an der Tageszeile
  // (G-286). `[cmd]` **Die Sabotage hat genau das ausgenutzt:** sie
  // entfernte eines, der Waechter fand das andere und blieb gruen.
  // **Dieselbe Lehre wie G-274 und G-281.**
  const klappbar = (s.match(/aria-expanded=\{offen\}/g) ?? []).length
  assert.equal(klappbar, 2,
    `Karte und Tageszeile muessen beide aufklappbar sein, gefunden: `
    + `${klappbar} (G-286/G-287).`)
})

test('G-286: keine zweite Ausfuehrungsansicht', () => {
  // `[read]` **`PlanEintraegeEcht` zeigt die Eintraege EINES Tages mit
  // ihrem Ausfuehrungszustand** — Bestaetigen und Ueberspringen,
  // Flow 4. **Das Akkordeon zeigt die STRUKTUR.** Wer beides
  // zusammenlegt, bietet an einem Plantag in vier Wochen Knoepfe zum
  // Abhaken.
  const s = ohneKommentare('apps/web/src/app/v2/nutrition/plan-detail.tsx')
  for (const [was, muster] of [
    ['Bestaetigen', /bestaetigen/i],
    ['Ueberspringen', /ueberspringen/i],
    ['den Log-Zustand', /confirmation_mode|deviation_kcal/],
  ] as const) {
    assert.doesNotMatch(s, muster,
      `Das Akkordeon zeigt ${was} — das ist die Ausfuehrung (Flow 4), `
      + 'nicht die Struktur (G-286).')
  }
})

// ══ G-287 ══════════════════════════════════════════════════════════

test('G-287: die Karte fuehrt aufs Detail', () => {
  // `[cmd]` **Der Kern von G-287: die Liste war nicht anklickbar.**
  const s = ohneKommentare('apps/web/src/app/v2/nutrition/plan-detail.tsx')
  // `[read]` **Zweimal `onClick={onOeffnen}`** — der Kartenkopf und
  // der Knopf darunter. **Gezaehlt, nicht gesucht**, sonst ueberlebt
  // das Entfernen eines von beiden.
  const klick = (s.match(/onClick=\{onOeffnen\}/g) ?? []).length
  assert.equal(klick, 2,
    `Kopf und Knopf muessen beide aufs Detail fuehren, gefunden: ${klick} (G-287).`)
  // SPEC_10: Name, Quelle, Status, Tage, kcal/Tag.
  for (const [was, muster] of [
    // `[cmd]` **BERICHTIGT in G-310:** hier stand
    // `HERKUNFT_TEXT[herkunft]`. **Die Quelle steht weiter an der
    // Karte — aber als BADGE**, wie in der Vorlage
    // (`MealPlansView.js` Z. 89) und `SPEC_03` Flow 3 Schritt 2.
    //
    // `[read]` **`SPEC_10` verlangt *,,Quelle"*, nicht eine bestimmte
    // Schreibweise** — der Waechter prueft weiter, DASS sie da ist.
    ['die Quelle', /HERKUNFT_BADGE\[herkunft\]/],
    ['den Status', /\{p\.status\}/],
    ['die Tage', /\{k\.tage\} Tage/],
    ['kcal\\/Tag', /k\.kcalSchnitt/],
  ] as const) {
    assert.match(s, muster, `Die Karte zeigt ${was} nicht mehr (G-287).`)
  }
})

test('G-287: eine fehlende Herkunft wird gezeigt, nicht gefuellt', () => {
  // `[cmd]` **Die zwei Bestandsplaene tragen `plan_origin = NULL`.**
  // `[read]` **Zeigen, nicht fuellen** — der Auftrag sagt es
  // ausdruecklich.
  const s = ohneKommentare('apps/web/src/app/v2/nutrition/plan-detail.tsx')
  assert.match(s, /herkunft === 'unbekannt'/,
    'Die Karte unterscheidet die fehlende Herkunft nicht mehr (G-287).')
  assert.match(s, /HERKUNFT_UNBEKANNT_SATZ/,
    'Der Grund fuer die fehlende Herkunft steht nicht mehr da (G-287).')
  // Und sie erfindet keine.
  assert.doesNotMatch(s, /plan_origin\s*[?]{2}\s*'self_created'/,
    'Die Karte fuellt eine fehlende Herkunft auf (G-287).')
})

test('G-287/G-310: die Bibliothek ist zurueck — mit anderem Inhalt', () => {
  // ══ BERICHTIGT IN G-310 ════════════════════════════
  //
  // `[cmd]` **Hier stand `doesNotMatch(/export function
  // PlanBibliothekEcht/)`.** `[read]` **In G-287 war das richtig:**
  // die alte Bibliothek zeigte je Woche eine Textzeile, nicht
  // anklickbar — *,,irgend eine auflistung die gar nichts sagt"*.
  //
  // `[cmd]` **G-310 baut sie neu, aus drei Quellen:** die Attrappe
  // (`tab-plans.tsx` Z. 343, ein Raster aus Plankarten), **E-41**
  // (*,,Meal plans ist die Bibliothek — alle Plaene, aktivieren"*)
  // und **`SPEC_03` Flow 3 Schritt 2**.
  //
  // `[cmd]` **Und der Befund, der sie noetig machte: vier Plaene bei
  // `test-user`, EINER erschien** (2026-09-01 gemessen).
  //
  // `[read]` **Derselbe Name, andere Sache** — deshalb prueft der
  // Waechter jetzt, dass sie das tut, was G-287 vermisst hat:
  // **Plaene zeigen, die man aktivieren kann.**
  const s = ohneKommentare('apps/web/src/app/v2/nutrition/plans-echt.tsx')
  assert.match(s, /export function PlanBibliothekEcht/,
    'Die Bibliothek fehlt — E-41 und SPEC_03 Flow 3 verlangen sie.')
  // ══ BERICHTIGT IN G-319 ════════════════════════════
  //
  // `[cmd]` **Hier stand `onAktivieren?: (id: string) => void`.**
  // `[read]` **Der Name war da, die Wirkung nicht:** der Aufrufer gab
  // `onAktivieren={() => setAktivieren(true)}` — **die `id` wurde
  // verworfen**, und der Dialog oeffnete fuer den AKTIVEN Plan.
  //
  // **Tom, 2026-09-02:** *„wenn unten plaene stehen muessen die auch
  // aktivierbar sein, da geht nichts."*
  //
  // `[read]` **Also prueft der Waechter die Wirkung** — die Bibliothek
  // fuehrt die Frage selbst, je Kachel eine, mit der `id` DIESER
  // Kachel. **Ein Rueckruf, der sie verliert, faellt hier durch.**
  assert.match(s, /aktiviert === p\.id && \(/,
    'Die Bibliothek fragt nicht je Kachel — dann trifft die '
    + 'Aktivierung wieder den falschen Plan (G-319).')
  assert.match(s, /<AktivierenFrage[\s\S]{0,240}?plan=\{p\}/,
    'Die Frage bekommt nicht den Plan der Kachel — genau der '
    + 'Fehler, den G-319 behoben hat.')
  assert.match(s, /p\.status !== 'active' && aktiviert !== p\.id && \(/,
    'Der Aktivieren-Knopf steht auch am laufenden Plan.')
})

// ══ G-290 ══════════════════════════════════════════════════════════

test('G-290: waehlbar sind drei Zyklen, `unbekannt` ist keiner', () => {
  // `[cmd]` **Der CHECK erlaubt `once | rollover | sequence`.**
  // `[read]` **`unbekannt` ist der Zustand der Bestandsplaene, keine
  // Wahl** — wer ihn anbietet, laesst eine Leerstelle schreiben.
  assert.deepEqual([...ZYKLUS_WAEHLBAR], ['once', 'rollover', 'sequence'])
  assert.equal(istWaehlbar('unbekannt'), false,
    '`unbekannt` gilt als waehlbar (G-290).')
  for (const z of ZYKLUS_WAEHLBAR) {
    assert.equal(istWaehlbar(z), true)
    // Jede Wahl traegt einen Text UND eine Erklaerung — sonst waehlt
    // man drei Woerter ohne Wirkung (G-270).
    assert.ok(ZYKLUS_TEXT[z].length > 0, `${z}: kein Text.`)
    assert.ok(ZYKLUS_ERKLAERUNG[z].length > 0, `${z}: keine Erklaerung.`)
  }
})

test('G-290: der Dialog schickt alle vier Felder', () => {
  // `[cmd]` **`planAendernSchema` nimmt `lifecycle_type`,
  // `start_date`, `days_count`, `status`.** `[read]` **Fehlt eines,
  // ist der Plan halb aktiviert** — etwa aktiv ohne Startdatum.
  const s = ohneKommentare('apps/web/src/app/v2/nutrition/plan-detail.tsx')
  const koerper = /art: 'plan_aendern'[\s\S]{0,320}?\}\)/.exec(s)
  assert.ok(koerper, 'Der Aktivierungs-Aufruf wurde nicht gefunden (G-290).')
  for (const feld of ['lifecycle_type', 'start_date', 'days_count', 'status']) {
    assert.ok(koerper[0].includes(feld),
      `Der Dialog schickt \`${feld}\` nicht mehr (G-290).`)
  }
  assert.match(koerper[0], /status: 'active'/,
    'Der Dialog setzt den Plan nicht mehr aktiv (G-290).')
})

test('G-290: die Zyklen kommen aus einer Quelle', () => {
  // `[read]` **`ZYKLUS_TEXT` und `ZYKLUS_ERKLAERUNG` stehen in
  // `plan-lage.ts`** — eine zweite Fassung im Dialog waere eine
  // zweite Wahrheit. **Genau das war der erste Entwurf hier.**
  const s = ohneKommentare('apps/web/src/lib/nutrition/plan-detail-lage.ts')
  assert.doesNotMatch(s, /ZYKLUS_TEXT\s*:/,
    'Die Zyklustexte sind hier ein zweites Mal definiert (G-290).')
  assert.doesNotMatch(s, /ZYKLUS_ERKLAERUNG\s*:/,
    'Die Erklaerungen sind hier ein zweites Mal definiert (G-290).')
})
