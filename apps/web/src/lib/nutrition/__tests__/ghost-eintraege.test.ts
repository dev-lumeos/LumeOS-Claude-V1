// G-309: die Naht zwischen Plan und Tagebuch.
//
// **Grundlage: `SPEC_03` Flow 3 Schritte 5–7, Flow 4,
// `ADR_GHOST_ENTRY_RECIPE`, `SPEC_03_FLOW4_RECIPE_PATCH`.**
//
// `[read]` **Die Waechter messen die Wirkung, nicht das Wort.**
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  WECHSEL_AB_MAL, WECHSEL_AB_QUOTE, LEERER_WECHSELSTAND,
} from '../plan-lage'
import {
  startVorgabe, startGrenze, startErlaubt, startFehler, pausiertSatz,
  START_MAX_TAGE, ZYKLUS_WAEHLBAR, ZYKLUS_FEHLT_SATZ, AKTIVIEREN_TITEL,
} from '../plan-werkbank'

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

const LESEN = 'apps/web/src/lib/nutrition/plan-lesen.ts'
const SCHREIB = 'apps/web/src/lib/nutrition/plan-write.ts'
const LOGWRITE = 'apps/web/src/lib/nutrition/plan-log-write.ts'
const GHOST = 'apps/web/src/app/v2/nutrition/ghost-eintrag.tsx'
const MAHLZEITEN = 'apps/web/src/app/v2/nutrition/mahlzeiten.tsx'
const WERKBANK_UI = 'apps/web/src/app/v2/nutrition/plan-werkbank-ui.tsx'
const ROUTE = 'apps/web/src/app/api/nutrition/plan/route.ts'
const PLANS_ECHT = 'apps/web/src/app/v2/nutrition/plans-echt.tsx'

test('die Dateiproben finden ihre Dateien — unabhaengig vom Startort', () => {
  for (const f of [LESEN, SCHREIB, LOGWRITE, GHOST, MAHLZEITEN,
    WERKBANK_UI, ROUTE, PLANS_ECHT]) {
    assert.ok(fs.existsSync(path.join(WURZEL, f)), `${f} nicht gefunden`)
    assert.ok(lies(f).length > 500, `${f} ist verdaechtig kurz`)
  }
  assert.ok(fs.existsSync(path.join(WURZEL, 'pnpm-workspace.yaml')),
    `WURZEL zeigt nicht auf das Repo: ${WURZEL}`)
})

// ══ 1: EIN GHOST ENTRY WIRD NICHT GESCHRIEBEN ═══════════════════════

test('G-309: `meal_plan_day_to_diary` bekommt keinen Aufrufer aus apps/', () => {
  // **Tom, 2026-09-01:** *,,Das ist ein Seed-Werkzeug, kein
  // Produktweg — der Name taeuscht. Sie bleibt, wo sie ist, und wird
  // nicht gerufen. Ein Waechter, der das festhaelt, waere richtig."*
  //
  // `[cmd]` **Die Funktion schreibt echte `meals` mit
  // `entry_source = 'seed'`.** `[read]` **Wer sie beim Aktivieren
  // ruft, hat gegessen, ohne gegessen zu haben** — und die
  // Tagesbilanz zaehlt es mit.
  //
  // `[cmd]` **`SPEC_03` Flow 4: *,,kein automatisches Expiry, auch
  // retroaktiv"*.** `[read]` **Ein geschriebener `meals`-Satz koennte
  // das nicht** — er waere gegessen oder geloescht.
  //
  // `[read]` **Der Waechter sucht die WIRKUNG, nicht nur den Namen:**
  // jeder Aufrufweg geht ueber `rpc(`, und der Name steht als
  // Zeichenkette darin.
  const treffer: string[] = []
  const suche = (verzeichnis: string) => {
    for (const e of fs.readdirSync(path.join(WURZEL, verzeichnis),
      { withFileTypes: true })) {
      const rel = `${verzeichnis}/${e.name}`
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name === '.next') continue
        suche(rel)
      } else if (/\.(ts|tsx|mjs|js)$/.test(e.name)) {
        // `[read]` **Waechter ausgenommen** — dieser hier traegt den
        // Namen selbst, als Suchmuster. **Ein Waechter, der sich
        // selbst findet, meldet immer.**
        if (rel.includes('__tests__')) continue
        const quelle = ohneKommentare(rel)
        if (/(?<![a-zA-Z0-9_])meal_plan_day_to_diary(?![a-zA-Z0-9_])/.test(quelle)) {
          treffer.push(rel)
        }
      }
    }
  }
  suche('apps')
  assert.deepEqual(treffer, [],
    `meal_plan_day_to_diary wird gerufen: ${treffer.join(', ')}`)
})

test('G-309: der Ghost Entry schreibt NICHT — er zeigt', () => {
  // `[read]` **Der Leseweg darf keine Mahlzeit anlegen.** `[cmd]`
  // **Gezaehlt, nicht gesucht:** ein einzelnes `insert` genuegt, um
  // aus der Anzeige eine Erfassung zu machen.
  const l = ohneKommentare(LESEN)
  const von = l.indexOf('export async function ladeGhostEintraege')
  assert.notEqual(von, -1, 'der Leseweg fehlt')
  const bis = l.indexOf('\nexport ', von + 10)
  const block = l.slice(von, bis === -1 ? undefined : bis)
  for (const verboten of ['insert(', 'upsert(', 'update(', 'delete(']) {
    assert.ok(!block.includes(verboten),
      `der Leseweg schreibt: ${verboten} — ein Ghost Entry ist eine Absicht`)
  }

  // `[read]` **Und der GET-Weg als Ganzes.** `[cmd]` **In der
  // Sabotageprobe kam S1 durch**, weil der Wächter nur diesen einen
  // Block prüfte — ein Schreibzugriff in einer Nachbarfunktion
  // desselben Aufrufwegs wäre unbemerkt geblieben.
  const r = ohneKommentare(ROUTE)
  const rvon = r.indexOf('export async function GET')
  assert.notEqual(rvon, -1, 'die Leseroute fehlt')
  const rbis = r.indexOf('\nexport ', rvon + 10)
  const rblock = r.slice(rvon, rbis === -1 ? undefined : rbis)
  for (const verboten of ['insert(', 'upsert(', 'delete(']) {
    assert.ok(!rblock.includes(verboten),
      `die GET-Route schreibt: ${verboten}`)
  }
  // Und die Anzeige ruft nur den Leseweg, nicht `art: 'mahlzeit'`.
  const g = ohneKommentare(GHOST)
  assert.ok(!/art: 'mahlzeit'/.test(g),
    'die Ghost-Karte legt eine Mahlzeit an, bevor entschieden wurde')
})

test('G-309: NUR der aktive Plan erzeugt Ghost Entries', () => {
  // `[cmd]` **`ladeTagesEintraege` (G-274) filtert den Planstatus
  // NICHT** — sie liefert die Positionen jedes Plans mit einem Tag an
  // diesem Datum.
  //
  // `[read]` **Fuer die Anzeige waere das falsch:** ein pausierter
  // Plan hat keinen Anspruch auf den Tag — genau deshalb wird beim
  // Aktivieren pausiert.
  const l = ohneKommentare(LESEN)
  const von = l.indexOf('export async function ladeGhostEintraege')
  const bis = l.indexOf('\nexport ', von + 10)
  const block = l.slice(von, bis === -1 ? undefined : bis)
  assert.match(block, /meal_plans\.status', 'active'/,
    'der Leseweg filtert den Planstatus nicht')
  // `!inner` erzwingt den Verbund — ohne ihn kaemen Positionen ohne
  // passenden Plan mit `null` durch.
  assert.match(block, /meal_plans!inner/, 'der Verbund ist nicht erzwungen')
})

// ══ 2: DER BESTEHENDE PLAN WIRD PAUSIERT ════════════════════════════

test('G-309: beim Aktivieren wird der bestehende Plan pausiert', () => {
  // **`SPEC_03` Flow 3, Schritt 7:** *,,Bestätigen → status: active /
  // Bestehender aktiver Plan → status: paused."*
  //
  // `[cmd]` **Am 2026-09-01 gemessen: das geschah nicht.**
  const s = ohneKommentare(SCHREIB)
  const von = s.indexOf('async function anderePlaenePausieren')
  assert.notEqual(von, -1, 'die Pausierung fehlt')
  // `[read]` **Bis zur schliessenden Klammer auf Spalte 0.** `[cmd]`
  // **Mit `indexOf('\n/**')` lief der Block weiter** — die Funktion
  // hat keinen Kommentar direkt dahinter, **und der Schnitt fing
  // `status: 'completed'` aus `ablaufKlaeren` mit.**
  const bis = s.indexOf('\n}', von)
  assert.notEqual(bis, -1, 'die Funktion hat kein Ende')
  const block = s.slice(von, bis + 2)

  // `[read]` **`paused`, nicht `completed`** — der Plan ruht, er ist
  // nicht durch.
  assert.match(block, /status: 'paused'/, 'der alte Plan wird nicht pausiert')
  assert.ok(!block.includes("status: 'completed'"),
    'der alte Plan wird abgeschlossen statt pausiert')
  // Und `is_active` faellt mit — sonst blieben zwei aktiv.
  assert.match(block, /is_active: false/, 'is_active bleibt stehen')
  // `[read]` **Nur die anderen**, sonst pausiert der Aufruf den
  // gerade aktivierten Plan gleich mit.
  assert.match(block, /\.eq\('status', 'active'\)/)
  assert.match(block, /\.neq\('id', ausser\)/,
    'der eigene Plan ist nicht ausgenommen')

  // `[cmd]` **ZWEI Wege setzen `active`** — `planAendern` und
  // `ablaufKlaeren` (C-373). **Gezaehlt, nicht gesucht:** ein Weg
  // ohne Aufruf faellt bei `assert.match` nicht auf.
  const aufrufe = (s.match(/await anderePlaenePausieren\(/g) ?? []).length
  assert.equal(aufrufe, 2,
    `${aufrufe} von 2 Aktivierungswegen pausieren den bestehenden Plan`)
})

test('G-309: Flow 3 Schritte 5+6 — Startdatum und Lebenszyklus', () => {
  // `[cmd]` **Flow 3, Schritt 5: *,,Default: morgen, max. 7 Tage im
  // Voraus"*.** `[read]` **Heute waere falsch:** wer mittags
  // aktiviert, haette Ghost Entries fuer ein Fruehstueck, das vorbei
  // ist.
  assert.equal(startVorgabe('2026-09-01'), '2026-09-02')
  assert.equal(startVorgabe('2026-12-31'), '2027-01-01', 'Jahreswechsel')
  assert.equal(START_MAX_TAGE, 7)
  assert.equal(startGrenze('2026-09-01'), '2026-09-08')

  // Das Fenster: heute bis +7, nichts davor, nichts danach.
  assert.equal(startErlaubt('2026-09-01', '2026-09-01'), true, 'heute')
  assert.equal(startErlaubt('2026-09-08', '2026-09-01'), true, 'die Grenze')
  assert.equal(startErlaubt('2026-09-09', '2026-09-01'), false, 'einen zu weit')
  assert.equal(startErlaubt('2026-08-31', '2026-09-01'), false, 'gestern')
  assert.match(startFehler('2026-09-01'), /8\.9\.2026/)

  // `[cmd]` **`meal_plans_sequence_target_check`: `sequence` verlangt
  // `next_plan_id NOT NULL`.** `[read]` **Ohne Planpicker waere die
  // Wahl nicht speicherbar** — eine Wahl, die beim Speichern
  // scheitert, ist schlimmer als eine, die fehlt.
  assert.deepEqual([...ZYKLUS_WAEHLBAR], ['once', 'rollover'])
  assert.match(ZYKLUS_FEHLT_SATZ, /Folgeplan/,
    'der Satz sagt nicht, was fehlt')

  // Und der Hinweis nennt den Plan, der ruhen wird.
  assert.match(pausiertSatz('Mein Plan'), /Mein Plan/)
  assert.match(pausiertSatz('X'), /pausiert/)
  assert.match(pausiertSatz('X'), /Bibliothek|zurückgeholt/,
    'der Satz sagt nicht, dass der Plan bleibt')
})

test('G-309: der Aktivieren-Knopf ist im Browser erreichbar', () => {
  // `[cmd]` **Am 2026-09-01 gemessen: die Bibliothek hatte NUR
  // *Bearbeiten*.** `[read]` **Damit war Flow 3 an Schritt 4 zu
  // Ende** — und ohne aktiven Plan gibt es keine Ghost Entries.
  const u = ohneKommentare(WERKBANK_UI)
  assert.match(u, /export function AktivierenFrage/, 'die Frage fehlt')
  assert.match(u, /<AktivierenFrage/, 'die Frage wird nicht gerendert')
  assert.match(u, />\s*Aktivieren\s*</, 'der Knopf fehlt')
  assert.match(u, /aria-label="Startdatum"/, 'das Datumsfeld fehlt')
  // `[read]` **Ein laufender Plan wird nicht noch einmal aktiviert.**
  assert.match(u, /p\.status !== 'active' && aktiviert !== p\.id/,
    'der Knopf steht auch an einem laufenden Plan')
  assert.equal(AKTIVIEREN_TITEL, 'Plan aktivieren')
})

// ══ 3: DAS PROTOKOLL — UND DIE REZEPTRECHNUNG ═══════════════════════

test('G-309: die Rezeptmenge wird GETEILT, nicht multipliziert', () => {
  // `[cmd]` **Am 2026-09-01 gemessen, `servings = 2`,
  // `planned_servings = 1`:** 400 g Zutat ergaben 400 g statt 200 g.
  //
  // `[read]` **Sichtbar wurde es am ZUSTAND, nicht an der Menge:**
  // eine Bestaetigung mit 600 statt 200 g wurde `confirmed` statt
  // `deviated` — der Vergleichswert war doppelt so gross wie der
  // Plan, und die Verdreifachung sah wie eine Unterschreitung aus.
  //
  // `[cmd]` **Der Massstab sind die zwei Stellen, die es richtig
  // rechnen:** `nutrition.meal_plan_day_to_diary` (`ri.amount_g *
  // e.planned_servings / r.servings`) und `ladeGhostEintraege`.
  const w = ohneKommentare(LOGWRITE)
  const von = w.indexOf('async function eintragLesen')
  assert.notEqual(von, -1)
  const bis = w.indexOf('\n/**', von)
  const block = w.slice(von, bis === -1 ? undefined : bis)
  assert.match(block, /portionen \/ proRezept/,
    'die Rezeptmenge wird nicht durch die Portionszahl geteilt')
  assert.match(block, /recipe:recipes \( servings \)/,
    'die Portionszahl des Rezepts wird nicht gelesen')
  // `[cmd]` **`servings` ist `numeric`** — PostgREST liefert eine
  // Zeichenkette. `[read]` **Ein `typeof === 'number'` waere immer
  // falsch gewesen**, und der Nenner still 1 geblieben.
  assert.match(block, /typeof rohPortionen === 'string'/,
    'numeric als Zeichenkette wird nicht behandelt')

  // Und derselbe Nenner im Leseweg — sonst zeigt die Vorschau etwas
  // anderes, als das Bestaetigen schreibt.
  const l = ohneKommentare(LESEN)
  const lvon = l.indexOf('export async function ladeGhostEintraege')
  const lbis = l.indexOf('\nexport ', lvon + 10)
  assert.match(l.slice(lvon, lbis === -1 ? undefined : lbis),
    /portionen \/ proRezept/,
    'der Leseweg rechnet anders als der Schreibweg')
})

test('G-309: kein zweiter Schreibweg — G-274 wird gerufen', () => {
  // **Der Auftrag:** *,,Keine zweite Schreibnaht — `addMealItem` aus
  // G-272 ist der Weg."*
  //
  // `[cmd]` **`plan-log-write.ts` steht seit G-274 und schreibt
  // `meal_plan_logs` vollstaendig** — beide Wege, alle Pflichtfelder
  // des `resolution_check`. **Am 2026-09-01 nachgemessen.**
  const g = ohneKommentare(GHOST)
  assert.match(g, /art: 'bestaetigen'/, 'der Bestaetigungsweg wird nicht gerufen')
  assert.match(g, /art: 'ueberspringen'/, 'der Auslassweg wird nicht gerufen')
  // `[read]` **Die Karte schreibt nicht selbst.**
  assert.ok(!/from\('meal_plan_logs'\)/.test(g),
    'die Ghost-Karte schreibt am Bestaetigungsweg vorbei')
  assert.ok(!/from\('meal_items'\)/.test(g),
    'die Ghost-Karte legt Posten selbst an')
  // `[cmd]` **`confirmation_mode` ist Pflicht** — der
  // `resolution_check` verlangt es bei `confirmed` UND `deviated`.
  assert.match(g, /confirmation_mode: 'manual'/, 'der Modus fehlt')
})

test('G-309: das Rezept erscheint als EINZELZUTATEN', () => {
  // `[cmd]` **`ADR_GHOST_ENTRY_RECIPE`:** *,,Ghost Entries die aus
  // einem `MealPlanItem.recipe_id` stammen zeigen immer alle
  // Einzelzutaten — nie das Rezept als Einheit."* **Jede Zeile hat
  // ein editierbares Mengenfeld.**
  //
  // `[cmd]` **Am 2026-09-02 im Browser gemessen:** Rezeptname als
  // Ueberschrift, drei Zutaten einzeln, je ein Mengenfeld.
  const g = ohneKommentare(GHOST)
  // Der Rezeptname steht als Ueberschrift (Flow-4-Patch) …
  assert.match(g, /eintrag\.rezept &&/, 'der Rezeptname fehlt')
  // … und die Posten einzeln darunter, jeder mit eigenem Feld.
  //
  // `[cmd]` **Berichtigt nach der Sabotageprobe:** hier stand
  // `assert.match(g, /eintrag\.posten\.map/)`. **`.slice(0, 0).map`
  // liess das Wort stehen und rendert nichts** — der Waechter blieb
  // gruen, waehrend die Liste leer war (G-216/G-247).
  //
  // `[read]` **Also: ueber die volle Liste, ohne Zwischenschnitt.**
  //
  // ══ BERICHTIGT IN G-329 ════════════════════════
  //
  // `[cmd]` **Hier stand `{eintrag.posten.map(p => (` und ein Verbot
  // von `filter`.** **Tom, 2026-09-02:** *,,die ghosteintraege
  // brauchen bearbeiten (fuer manuelle aenderungen)."*
  //
  // `[read]` **Zutaten entfernen HEISST filtern** — das Verbot
  // stand der Anforderung im Weg.
  //
  // `[read]` **Was G-309 sichert, gilt weiter:** die Zutaten stehen
  // EINZELN da, nicht das Rezept als Einheit. **Nur wird jetzt die
  // Wirkung geprueft, nicht der Wortlaut:** gerendert wird ueber
  // `posten`, und diese Liste entsteht sichtbar aus der vollen Liste
  // minus den vom NUTZER entfernten.
  assert.match(g, /\{posten\.map\(p => \{/,
    'die Zutaten werden nicht einzeln gerendert')
  assert.match(g, /\[\.\.\.eintrag\.posten\.filter\(p => !entfernt\.has\(p\.food_id\)\), \.\.\.dazu\]/,
    'die gerenderte Liste entsteht nicht aus der vollen Liste')
  // `[cmd]` **Und ohne Nutzereingriff ist sie vollstaendig** — der
  // Anfangszustand ist leer, also faellt nichts still weg.
  assert.match(g, /useState<Set<string>>\(new Set\(\)\)/,
    'die Entfernt-Liste beginnt nicht leer — dann fehlten Zutaten von Anfang an')
  assert.match(g, /aria-label=\{`Menge \$\{p\.name\}`\}/,
    'die Zutaten haben keine eigenen Mengenfelder')
  // `[read]` **Kein *Rezept als Einheit bestaetigen*.**
  assert.ok(!/recipe_id: /.test(g),
    'die Karte sendet ein Rezept als Einheit')
})

test('G-309: unveraendert heisst „stimmt so" — keine Mengen gehen mit', () => {
  // `[cmd]` **Flow 4, Case 2, Schritt 4a:** *,,Stimmt so → Mahlzeit
  // direkt erstellt mit Plan-Mengen."*
  //
  // `[read]` **Sonst waere *unveraendert* von *zufaellig gleich* nicht
  // unterscheidbar** — und jede Bestaetigung schriebe Mengen mit, die
  // niemand angefasst hat.
  const g = ohneKommentare(GHOST)
  assert.match(g, /return abweichend \? aus : undefined/,
    'unveraenderte Mengen werden trotzdem gesendet')
})

// ══ 4: DIE AUSWERTUNG ═══════════════════════════════════════════════

test('G-309: die Auswertung sagt, WELCHE Position stoert', () => {
  // **Tom, 2026-08-31:** *,,dass er seinen plan dementsprechend
  // vielleicht anpassen sollte wenn er eh zb die eine mahlzeit immer
  // gewechselt hat weil er es vielleicht nicht mag."*
  //
  // `[read]` **Zwei Schwellen, nicht eine:** 2 von 2 ist ein Muster,
  // 2 von 20 nicht. **Ein einzelner Ausrutscher ist keiner.**
  assert.equal(WECHSEL_AB_MAL, 2)
  assert.equal(WECHSEL_AB_QUOTE, 0.5)

  const l = ohneKommentare(LESEN)
  const von = l.indexOf('export async function ladeWechselbefunde')
  assert.notEqual(von, -1, 'die Auswertung fehlt')
  const bis = l.indexOf('\nexport ', von + 10)
  const block = l.slice(von, bis === -1 ? undefined : bis)

  // `[cmd]` **Der Auftrag: *,,eine Abfrage ueber `status =
  // 'deviated'` je `plan_entry_id`"*.** `[read]` **`skipped` zaehlt
  // mit:** wer eine Position dreimal auslaesst, mag sie so wenig wie
  // einer, der sie dreimal austauscht.
  assert.match(block, /status === 'deviated'/)
  assert.match(block, /status === 'skipped'/)
  assert.match(block, /\.neq\('status', 'pending'\)/,
    'offene Zeilen zaehlen als entschieden')

  // `[cmd]` **Der Zeitraum ist beidseitig begrenzt** — die Seeds
  // reichen in die Zukunft, eine offene Grenze finge sie mit (A-56).
  assert.match(block, /\.gte\('execution_date'/)
  assert.match(block, /\.lte\('execution_date', bisDatum\)/,
    'die obere Grenze fehlt — die Zukunft zaehlt mit')

  // Beide Schwellen greifen wirklich.
  assert.match(block, /gewechselt < WECHSEL_AB_MAL/)
  assert.match(block, /quote < WECHSEL_AB_QUOTE/)
})

test('G-309: Befunde und Grundgesamtheit kommen aus EINER Messung', () => {
  // `[cmd]` **Am 2026-09-01 gemessen: die Kachel sagte *,,Noch nichts
  // protokolliert"*, waehrend `lunch` dreimal abgewichen war.**
  //
  // `[read]` **Die Ursache waren zwei Quellen fuer eine Aussage:** die
  // Befunde aus 28 Tagen, die Zahl der entschiedenen Zeilen aus
  // `ladePlanLogs(datum, 7)`. **Ein Wechsel vor mehr als sieben Tagen
  // erzeugte einen Befund, den die Kachel als *,,nichts da"* auswies.**
  assert.deepEqual(LEERER_WECHSELSTAND, { befunde: [], entschieden: 0 })

  const l = ohneKommentare(LESEN)
  const von = l.indexOf('export async function ladeWechselbefunde')
  const bis = l.indexOf('\nexport ', von + 10)
  const block = l.slice(von, bis === -1 ? undefined : bis)
  // `entschieden` kommt aus DERSELBEN Antwort wie die Befunde.
  assert.match(block, /entschieden: \(data as unknown as unknown\[\]\)\.length/,
    'die Grundgesamtheit stammt aus einer anderen Abfrage')

  // Und die Kachel unterscheidet drei Lagen, nicht zwei.
  const p = ohneKommentare(PLANS_ECHT)
  const pvon = p.indexOf('export function WechselbefundEcht')
  assert.notEqual(pvon, -1, 'die Kachel fehlt')
  const pbis = p.indexOf('\n/**', pvon)
  const pblock = p.slice(pvon, pbis === -1 ? undefined : pbis)
  assert.match(pblock, /entschieden === 0/,
    'die Kachel unterscheidet „nichts protokolliert" nicht')
  assert.match(pblock, /befunde\.length === 0/,
    'die Kachel unterscheidet „unauffaellig" nicht von „nichts da"')
})

test('G-309: die Auswertung haengt am Typ ohne Serverbezug (A-30)', () => {
  // `[cmd]` **Am 2026-09-01 gemessen: `/login` antwortete HTTP 500**,
  // *,,You're importing a component that needs next/headers"*.
  //
  // `[read]` **Ein WERT-Import aus `plan-lesen.ts` zieht
  // `next/headers` mit** — und der ganze Server stand, nicht nur die
  // Kachel. **Ein `import type` waere durchgegangen; der Wert
  // `LEERER_WECHSELSTAND` nicht.**
  //
  // `[read]` **Der Typecheck faengt das NICHT** — er war gruen,
  // waehrend der Server 500 warf.
  for (const datei of [PLANS_ECHT, 'apps/web/src/app/v2/nutrition/tab-plans.tsx',
    'apps/web/src/app/v2/nutrition/ansicht.tsx']) {
    const q = ohneKommentare(datei)
    // Ein Wert-Import aus dem Leseweg: `import {` ohne `type` davor.
    const zeilen = q.split(/\n(?=import )/)
      .filter(z => z.includes("from '../../../lib/nutrition/plan-lesen'"))
    for (const z of zeilen) {
      assert.ok(z.startsWith('import type '),
        `${datei} importiert einen WERT aus plan-lesen — das zieht `
        + `next/headers in eine Client-Komponente (A-30):\n${z.slice(0, 120)}`)
    }
  }
})

// ══ DIE NAHT ALS GANZES ═════════════════════════════════════════════

test('G-309: das Tagebuch fragt den Plan — und ein Planfehler leert es nicht', () => {
  const m = ohneKommentare(MAHLZEITEN)
  assert.match(m, /<GhostEintragKarte/, 'die Ghost Entries werden nicht gerendert')
  // `[read]` **Gleichzeitig, nicht nacheinander** — sonst wartet das
  // Tagebuch auf den Plan (G-252).
  assert.match(m, /await Promise\.all\(\[\s*\n\s*fetch\(`\/api\/nutrition\/diary/,
    'Tagebuch und Plan werden nacheinander geladen')
  // `[read]` **Ein Planfehler darf das Tagebuch nicht leeren.**
  assert.match(m, /aG\.ok \?/, 'ein Planfehler reisst das Tagebuch mit')

  // `[read]` **Nur die OFFENEN.** Ein bestaetigter Eintrag hat eine
  // Mahlzeit erzeugt, die schon oben steht.
  assert.match(m, /g\.status === 'pending'/,
    'auch entschiedene Ghost Entries werden gezeigt')
  // `[read]` **Ein Slot mit Ghost Entry bekommt keine leere Karte** —
  // sonst stuenden „Empty" und der Plan-Vorschlag nebeneinander.
  assert.match(m, /!belegteTypen\.has\(typ\) && !ghostTypen\.has\(typ\)/,
    'ein Slot zeigt Ghost Entry UND leere Karte')

  // Und die Route liest lesend.
  const r = ohneKommentare(ROUTE)
  assert.match(r, /export async function GET/, 'der Leseweg hat keine Route')
  assert.match(r, /ladeGhostEintraege\(datum\)/, 'die Route ruft den Leseweg nicht')
})
