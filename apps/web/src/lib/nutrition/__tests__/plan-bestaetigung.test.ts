// G-274: die Regeln des Bestaetigens — aus SPEC_03 Flow 4.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  zustandVon, felderPassen, istRueckwirkend, rueckwirkendSatz,
  abweichungSatz, ABWEICHUNG_AB_PROZENT, STATUS_TEXT, STATUS_FARBE,
} from '../plan-bestaetigung'

const lies = (f: string) => fs.readFileSync(path.join(process.cwd(), f), 'utf8')
const ohneKommentare = (f: string) => lies(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

// ── Die Schwelle stammt aus dem Flow ─────────────────────────────

test('G-274: 20 Prozent — die Zahl steht in Flow 4', () => {
  // `[cmd]` **`SPEC_03_USER_FLOWS` Flow 4**, Case 1 Schritt 7 und
  // Case 2 Schritt 4b: *„deviated wenn dkcal > 20%"*. **Zweimal
  // genannt, nicht erfunden.**
  assert.equal(ABWEICHUNG_AB_PROZENT, 20)
})

test('G-274: knapp darunter ist bestaetigt, deutlich darueber abgewichen', () => {
  // `[cmd]` **An der laufenden Datenbank gegengeprobt (2026-08-30):**
  // geplant 150 g = 166,5 kcal. **170 g = 188,7 kcal (+13,3 %) ->
  // confirmed; 200 g = 222 kcal (+33,3 %) -> deviated.**
  assert.equal(zustandVon(166.5, 188.7).status, 'confirmed')
  const ab = zustandVon(166.5, 222)
  assert.equal(ab.status, 'deviated')
  assert.equal(ab.pct, 33.3)
})

test('G-274: genau 20 Prozent ist noch keine Abweichung', () => {
  // `[read]` **Flow 4 sagt „> 20%"**, nicht „>= 20%". Die Grenze
  // gehoert zur unauffaelligen Seite.
  assert.equal(zustandVon(100, 120).status, 'confirmed')
  assert.equal(zustandVon(100, 121).status, 'deviated')
})

test('G-274: auch zu wenig ist eine Abweichung', () => {
  // `[read]` **Eine Abweichung hat eine Richtung.** Wer die Haelfte
  // isst, weicht ab — nicht nur, wer mehr isst.
  const w = zustandVon(200, 80)
  assert.equal(w.status, 'deviated')
  assert.equal(w.pct, -60)
  assert.match(abweichungSatz(w.kcal, w.pct), /-120 kcal/)
})

test('G-274: ohne Bezugsgroesse keine Abweichung', () => {
  // `[read]` **Eine Abweichung ohne Plan-kcal waere keine Aussage.**
  assert.equal(zustandVon(null, 500).status, 'confirmed')
  assert.equal(zustandVon(0, 500).status, 'confirmed')
  assert.equal(zustandVon(500, null).status, 'confirmed')
  assert.equal(zustandVon(null, 500).pct, null)
})

// ── Die Felder muessen zum Zustand passen ────────────────────────

test('G-274: der CHECK in einer Funktion — pending traegt nichts', () => {
  // `[cmd]` **Der Datenbank-CHECK verlangt es so.** `[read]` Hier
  // steht er ein zweites Mal, damit die Meldung aus der Anwendung
  // kommt statt als 500er.
  const leer = {
    actual_meal_id: null, confirmation_mode: null, confirmed_at: null,
    skipped_at: null, deviation_kcal: null, deviation_pct: null,
  }
  assert.equal(felderPassen('pending', leer), true)
  assert.equal(felderPassen('pending',
    { ...leer, actual_meal_id: 'x', confirmation_mode: 'manual', confirmed_at: 'jetzt' }),
  false, 'Ein offener Eintrag darf keine Mahlzeit tragen.')
  // `[read]` **Jedes Feld einzeln, nicht nur „alle drei zusammen".**
  // Eine Sabotage mit `!bestaetigt` ueberlebte den Fall oben — sie
  // laesst eine HALBE Bestaetigung durch.
  assert.equal(felderPassen('pending', { ...leer, actual_meal_id: 'x' }), false,
    'Eine halbe Bestaetigung kommt als „offen" durch.')
  assert.equal(felderPassen('pending', { ...leer, confirmed_at: 'jetzt' }), false,
    'Ein Bestaetigungszeitpunkt ohne Mahlzeit kommt durch.')
})

test('G-274: confirmed braucht Mahlzeit, Art und Zeitpunkt', () => {
  const voll = {
    actual_meal_id: 'm', confirmation_mode: 'manual', confirmed_at: 'jetzt',
    skipped_at: null, deviation_kcal: null, deviation_pct: null,
  }
  assert.equal(felderPassen('confirmed', voll), true)
  assert.equal(felderPassen('confirmed', { ...voll, actual_meal_id: null }), false)
  assert.equal(felderPassen('confirmed', { ...voll, confirmation_mode: null }), false)
})

test('G-274: deviated braucht zusaetzlich beide Abweichungszahlen', () => {
  const voll = {
    actual_meal_id: 'm', confirmation_mode: 'manual', confirmed_at: 'jetzt',
    skipped_at: null, deviation_kcal: 55, deviation_pct: 33,
  }
  assert.equal(felderPassen('deviated', voll), true)
  assert.equal(felderPassen('deviated', { ...voll, deviation_pct: null }), false,
    'Eine Abweichung ohne Prozentwert ist keine.')
})

test('G-274: skipped traegt keine Mahlzeit', () => {
  // `[read]` **Wer nichts isst, hat nichts gegessen.** Flow 4:
  // „Status -> skipped, Ghost Entry ausgegraut" — kein Meal.
  const s = {
    actual_meal_id: null, confirmation_mode: null, confirmed_at: null,
    skipped_at: 'jetzt', deviation_kcal: null, deviation_pct: null,
  }
  assert.equal(felderPassen('skipped', s), true)
  assert.equal(felderPassen('skipped', { ...s, actual_meal_id: 'm' }), false)
})

// ── Rueckwirkend — Flow 4 kennt den Fall ─────────────────────────

test('G-274: rueckwirkend wird erkannt und benannt', () => {
  // `[cmd]` **Flow 4:** *„Bestaetigung mit originalem
  // `execution_date`, `confirmed_at` = jetzt."* `[cmd]` **Und:**
  // *„Ghost Entries haben kein automatisches Expiry."* — **also
  // keine Sperre fuer alte Tage.**
  assert.equal(istRueckwirkend('2026-08-28', '2026-08-30'), true)
  assert.equal(istRueckwirkend('2026-08-30', '2026-08-30'), false)
  assert.match(rueckwirkendSatz('2026-08-28'), /2026-08-28/)
  assert.match(rueckwirkendSatz('2026-08-28'), /nicht auf heute/)
})

test('G-274: offen ist grau, nicht gelb', () => {
  // `[read]` **Offen ist kein Befund, sondern das Fehlen einer
  // Entscheidung** — dieselbe Regel wie bei `unvollstaendig` (G-249).
  assert.equal(STATUS_FARBE.pending, 'var(--fg-dim)')
  assert.notEqual(STATUS_FARBE.deviated, STATUS_FARBE.confirmed)
  assert.equal(STATUS_TEXT.deviated, 'abgewichen')
})

// ── Der Schreibweg haelt sich an den Flow ────────────────────────

const WRITE = 'src/lib/nutrition/plan-log-write.ts'

test('G-274: erst die Mahlzeit, dann das Log', () => {
  // `[cmd]` **Flow 4, Case 1:** Schritt 6 Mahlzeit, Schritt 8 Log.
  // `[read]` **Die andere Reihenfolge ginge nicht** — das Log
  // verweist auf die Mahlzeit.
  const s = ohneKommentare(WRITE)
  const mahlzeit = s.indexOf('mahlzeitSicherstellen(eingabe.execution_date')
  const log = s.indexOf("from('meal_plan_logs')")
  assert.ok(mahlzeit > 0 && log > 0, 'Beide Schritte fehlen.')
  assert.ok(mahlzeit < log, 'Das Log wird vor der Mahlzeit geschrieben (G-274).')
})

test('G-274: kein zweiter Schreibweg — G-272 wird gerufen', () => {
  // `[read]` **`createMeal` und `addMealItem` frieren die Naehrwerte
  // ein** — genau, was Flow 4 Schritt 6 verlangt. **Ein eigener
  // Insert waere die zweite Wahrheit.**
  const s = ohneKommentare(WRITE)
  assert.match(s, /import \{ addMealItem, createMeal \}/,
    'Der Weg aus G-272 wird nicht benutzt (G-274).')
  assert.doesNotMatch(s, /from\('meal_items'\)/,
    'Es wird direkt in meal_items geschrieben — zweiter Weg (G-274).')
})

test('G-274: Ueberspringen legt keine Mahlzeit an', () => {
  const s = ohneKommentare(WRITE)
  const fn = /export async function planEintragUeberspringen[\s\S]*?\n\}/.exec(s)
  assert.ok(fn, 'Die Funktion fehlt.')
  assert.doesNotMatch(fn[0], /createMeal|addMealItem|mahlzeitSicherstellen/,
    'Ueberspringen legt eine Mahlzeit an (G-274).')
  assert.match(fn[0], /status: 'skipped'/)
  assert.match(fn[0], /actual_meal_id: null/)
})

test('G-274: ein Eintrag je Tag — der UNIQUE wird nicht umgangen', () => {
  // `[cmd]` **`UNIQUE (plan_entry_id, execution_date)`** — gemessen.
  // `[read]` **Deshalb `upsert`, nicht `insert`:** zweimal
  // bestaetigen soll die Zeile aendern, nicht scheitern.
  const s = ohneKommentare(WRITE)
  assert.match(s, /onConflict: 'plan_entry_id,execution_date'/,
    'Der UNIQUE wird nicht behandelt (G-274).')
  // `[read]` **Wirkung, nicht Wort:** ein `insert` statt `upsert`
  // scheitert beim zweiten Bestaetigen. Eine Sabotage, die nur
  // `onConflict` entfernte, ueberlebte die reine Namenssuche.
  const schreibstellen = (s.match(/\.(insert|upsert)\(/g) ?? [])
  assert.deepEqual(Array.from(new Set(schreibstellen)), ['.upsert('],
    `Ins Log wird mit ${schreibstellen.join(', ')} geschrieben — `
    + 'ein insert scheitert beim zweiten Mal (G-274).')
  // `[read]` **Und jeder `upsert` braucht seinen Konflikt.** Ohne
  // `onConflict` faellt PostgREST auf den Primaerschluessel zurueck —
  // `id` ist aber immer neu, also entstuende eine zweite Zeile und
  // der UNIQUE schluege zu. **Eine Sabotage, die nur `onConflict`
  // entfernte, ueberlebte die reine Namenspruefung.**
  const upserts = (s.match(/\.upsert\(/g) ?? []).length
  const konflikte = (s.match(/onConflict: 'plan_entry_id,execution_date'/g) ?? []).length
  assert.equal(konflikte, upserts,
    `${upserts} upsert-Aufrufe, aber ${konflikte} mit onConflict (G-274).`)
})

test('G-274: die Zutaten eines Rezepts werden aufgeloest', () => {
  // `[cmd]` **72 der 112 Eintraege sind `recipe`** — `addMealItem`
  // verlangt aber ein `food_id`. `[cmd]` Die Zutaten tragen alle
  // eines (gemessen: 4/4, 3/3).
  const s = ohneKommentare(WRITE)
  assert.match(s, /from\('recipe_ingredients'\)/,
    'Rezepteintraege werden nicht aufgeloest (G-274).')
  assert.match(s, /planned_servings/,
    'Die Portionszahl skaliert die Zutaten nicht (G-274).')
})

test('G-274: die Knoepfe haengen am offenen Eintrag', () => {
  // `[read]` **Wirkung, nicht Wort:** geprueft wird der Aufruf mit
  // seiner Art, nicht nur der Name.
  const s = ohneKommentare('src/app/v2/nutrition/plan-eintraege.tsx')
  assert.match(s, /art: 'bestaetigen'/, 'Bestaetigen fehlt (G-274).')
  assert.match(s, /art: 'ueberspringen'/, 'Ueberspringen fehlt (G-274).')
  assert.match(s, /confirmation_mode: 'mealcam'/, 'MealCam fehlt (G-274).')
  assert.match(s, /\{offen && \(/,
    'Die Knoepfe stehen auch an entschiedenen Eintraegen (G-274).')
})
