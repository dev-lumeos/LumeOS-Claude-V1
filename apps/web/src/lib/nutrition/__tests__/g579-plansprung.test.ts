/**
 * G-579 — der Plansprung bekommt seinen Aufrufer
 *
 * `[cmd]` **`nutrition.meal_plan_set_next_plan` hatte null Aufrufer**
 * in `apps/web/src` und `packages/`, gezaehlt am 2026-10-02 — **nicht
 * einmal einen Kommentar.** Gebaut in
 * `058b_recipes_meal_plans.sql:1205`, seit G-535 auf `auth.uid()`.
 *
 * `[read]` **Die Fehlerklasse aus G-571:** jede Messung hat gefragt,
 * ob die Funktion RICHTIG ist, keine, ob sie ANKOMMT.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  moeglicheFolgeplaene, pruefeSprung, sprungSatz,
} from '../plansprung'
import { fachmeldung, fehlerart } from '../../fehler/ladefehler'
import {
  ZYKLUS_WAEHLBAR, ZYKLUS_BRAUCHT_ZWEITEN_SATZ,
} from '../plan-werkbank'

const HIER = dirname(fileURLToPath(import.meta.url))
const SRC = join(HIER, '..', '..', '..')

const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
const lies = (p: string) => ohneKommentare(readFileSync(p, 'utf8'))

const PLAN = (id: string, name: string) => ({
  id, name, description: null, status: 'assigned', is_active: false,
  plan_origin: null, wochen: 1, tage: 7, positionen: 0,
  lifecycle_type: 'once' as string | null,
}) as never

// ════════════════════════════════════════════════════════════════
// A5 — der Waechter zaehlt den AUFRUF, nicht den Namen
// ════════════════════════════════════════════════════════════════

function quelldateien(pfad: string, aus: string[] = []): string[] {
  for (const e of readdirSync(pfad)) {
    if (e === '__tests__' || e === 'node_modules' || e.startsWith('.next')) continue
    const p = join(pfad, e)
    if (statSync(p).isDirectory()) quelldateien(p, aus)
    else if (e.endsWith('.ts') || e.endsWith('.tsx')) aus.push(p)
  }
  return aus
}

describe('G-579/A5 — die Datenbankfunktion hat einen Aufrufer', () => {
  const DATEIEN = quelldateien(SRC)

  it('der Heuhaufen ist nicht leer', () => {
    assert.ok(DATEIEN.length > 200,
      `nur ${DATEIEN.length} Quelldateien — der Waechter laeuft ins Leere`)
  })

  it('meal_plan_set_next_plan wird gerufen, nicht nur erwaehnt', () => {
    const rufer = DATEIEN.filter(p =>
      /\.rpc\(\s*'meal_plan_set_next_plan'/.test(lies(p)))
    assert.ok(rufer.length >= 1,
      'nutrition.meal_plan_set_next_plan hat keinen Aufrufer — gebaut '
      + 'und unerreichbar (G-571)')
  })

  it('der Waechter trifft die Form, die er sucht', () => {
    // `[read]` **An einem bekannten Fall eichen** — sonst beweist ein
    // Nichtfund nichts. `[cmd]` **G-578 hat denselben Waechter an
    // einem Kommentar geeicht** (`katalog-suche.tsx:20`).
    assert.ok(/\.rpc\(\s*'meal_plan_set_next_plan'/.test(
      ".rpc('meal_plan_set_next_plan', { p_plan_id: a, p_next_plan_id: b })"),
      'der Waechter findet den eigenen Aufruf nicht')
    // `[cmd]` **Eine blosse Erwaehnung darf NICHT zaehlen.**
    assert.ok(!/\.rpc\(\s*'meal_plan_set_next_plan'/.test(
      '// spaeter ruft das meal_plan_set_next_plan auf'),
      'der Waechter haelt eine Erwaehnung fuer einen Aufruf')
  })

  it('der Weg fuehrt von der Oberflaeche bis zur Funktion', () => {
    const ui = lies(join(SRC, 'app', 'v2', 'nutrition', 'plan-werkbank-ui.tsx'))
    assert.match(ui, /folgeplanSetzenAktion\(/,
      'die Aktivierungsfrage ruft die Serveraktion nicht')
    assert.match(ui, /data-folgeplan/, 'es gibt keine Folgeplanwahl')

    const aktion = lies(join(SRC, 'app', 'v2', 'nutrition',
      'plansprung-aktionen.ts'))
    assert.match(aktion, /'use server'/, 'die Aktion laeuft nicht serverseitig')
    assert.match(aktion, /folgeplanSetzen\(/,
      'die Serveraktion ruft den Schreibweg nicht')

    const write = lies(join(SRC, 'lib', 'nutrition', 'plansprung-write.ts'))
    assert.match(write, /\.rpc\(\s*'meal_plan_set_next_plan'/,
      'der Schreibweg ruft die Datenbankfunktion nicht')
  })

  it('beide Aufrufer reichen die Planliste durch', () => {
    // `[read]` **Ohne Liste keine Wahl** — und `sequence` stuende
    // nicht zur Verfuegung, obwohl es gebaut ist.
    for (const datei of ['plans-echt.tsx', 'plan-werkbank-ui.tsx']) {
      const q = lies(join(SRC, 'app', 'v2', 'nutrition', datei))
      assert.match(q, /alle=\{plaene\}/,
        `${datei} reicht die Planliste nicht an AktivierenFrage`)
    }
  })
})

// ════════════════════════════════════════════════════════════════
// A1 — was die Funktion selbst tut
// ════════════════════════════════════════════════════════════════

describe('G-579/A1 — zwei Spalten, eine Anweisung', () => {
  it('der Aufrufer setzt lifecycle_type bei sequence NICHT selbst', () => {
    // `[cmd]` **`meal_plans_sequence_target_check` koppelt
    // `lifecycle_type = 'sequence'` an `next_plan_id`** — gemessen
    // 2026-10-02: ein `PATCH` mit `sequence` allein ergibt `23514`.
    //
    // `[read]` **Die Funktion setzt beide zusammen.** **Zwei
    // Schreiber fuer eine gekoppelte Regel waeren zwei Wahrheiten.**
    const ui = lies(join(SRC, 'app', 'v2', 'nutrition', 'plan-werkbank-ui.tsx'))
    const i = ui.indexOf("art: 'plan_aendern', id: plan.id")
    assert.ok(i > 0, 'der Aktivierungsaufruf wurde nicht gefunden')
    const block = ui.slice(i, i + 400)
    assert.match(block, /zyklus === 'sequence' \? \{\} : \{ lifecycle_type/,
      'der Aktivierungsweg schreibt lifecycle_type auch bei sequence — '
      + 'das faellt am CHECK, bevor der Folgeplan gesetzt ist')
  })

  it('die zwei Parameter heissen wie in der Signatur', () => {
    // `[cmd]` **`pg_get_function_arguments`, 2026-10-02:**
    // `p_plan_id uuid, p_next_plan_id uuid`.
    const write = lies(join(SRC, 'lib', 'nutrition', 'plansprung-write.ts'))
    assert.match(write, /p_plan_id:/, 'p_plan_id fehlt')
    assert.match(write, /p_next_plan_id:/, 'p_next_plan_id fehlt')
  })

  it('die Rueckgabe wird geprueft, nicht angenommen', () => {
    // `[cmd]` **G-79** — die Funktion gibt `next_plan_id` zurueck.
    const write = lies(join(SRC, 'lib', 'nutrition', 'plansprung-write.ts'))
    assert.match(write, /if \(!data\)/,
      'ein Ergebnis ohne Kennung gilt als Erfolg')
  })

  it('ein Plan kann nicht auf sich selbst folgen', () => {
    // `[cmd]` **Der Rumpf verbietet es** (`22023`).
    const a = PLAN('a', 'Plan A')
    const b = PLAN('b', 'Plan B')
    const k = moeglicheFolgeplaene(a, [a, b])
    assert.deepEqual(k.map(x => x.id), ['b'],
      'der Plan steht als eigener Nachfolger zur Wahl')
  })

  it('ohne zweiten Plan gibt es keinen Kandidaten', () => {
    const a = PLAN('a', 'Plan A')
    assert.deepEqual(moeglicheFolgeplaene(a, [a]), [])
  })
})

// ════════════════════════════════════════════════════════════════
// A1 — die Pruefung kommt der Funktion zuvor
// ════════════════════════════════════════════════════════════════

describe('G-579/A1 — die drei Faelle des Rumpfes', () => {
  it('ohne Folgeplan faellt sie', () => {
    assert.ok(pruefeSprung('a', '').some(f => f.feld === 'folgeplan'))
    assert.ok(pruefeSprung('a', null).some(f => f.feld === 'folgeplan'))
  })

  it('ohne Quellplan faellt sie', () => {
    assert.ok(pruefeSprung('', 'b').some(f => f.feld === 'plan'))
  })

  it('derselbe Plan zweimal faellt', () => {
    const f = pruefeSprung('a', 'a')
    assert.ok(f.some(x => x.feld === 'folgeplan'))
    assert.match(f[0].text, /sich selbst/,
      'der Satz sagt nicht, warum es nicht geht')
  })

  it('der gueltige Fall faellt nicht', () => {
    assert.deepEqual(pruefeSprung('a', 'b'), [])
  })

  it('der Satz nennt BEIDE Plaene', () => {
    // `[read]` **„gespeichert" allein sagt nicht, was jetzt gilt.**
    const s = sprungSatz('Woche A', 'Woche B')
    assert.match(s, /Woche A/)
    assert.match(s, /Woche B/)
  })
})

// ════════════════════════════════════════════════════════════════
// A3 — die Fachmeldungen bekommen Texte
// ════════════════════════════════════════════════════════════════

describe('G-579/A3 — die drei Rumpfmeldungen haben einen Satz', () => {
  it('der Selbstbezug wird uebersetzt', () => {
    const s = fachmeldung(
      'meal_plan_set_next_plan: Quelle und unterschiedlicher Folgeplan sind erforderlich')
    assert.ok(s, 'ohne Text')
    assert.match(s!, /sich selbst/)
  })

  it('beide P0002-Faelle werden unterschieden', () => {
    const q = fachmeldung('meal_plan_set_next_plan: eigener Quellplan nicht gefunden')
    const f = fachmeldung('meal_plan_set_next_plan: eigener Folgeplan nicht gefunden')
    assert.ok(q && f, 'ein Fall hat keinen Text')
    assert.notEqual(q, f,
      'beide P0002-Faelle bekommen denselben Satz — dann sagt er '
      + 'nicht, WELCHER Plan fehlt')
  })

  it('42501 war schon abgedeckt — kein neuer Eintrag', () => {
    // `[cmd]` **G-578 hat `fehlerart()` die SQLSTATEs beigebracht.**
    // `[read]` **A3 verlangte, nur nachzutragen, was fehlt.**
    assert.equal(
      fehlerart('meal_plan_set_next_plan: Anmeldung erforderlich', '42501'),
      'sitzung')
  })

  it('der Schreibweg benutzt die querliegende Datei', () => {
    const write = lies(join(SRC, 'lib', 'nutrition', 'plansprung-write.ts'))
    assert.match(write, /from '\.\.\/fehler\/ladefehler'/,
      'der Schreibweg fuehrt eine eigene Fehlerkunde')
    assert.match(write, /fachmeldung\(/, 'die Fachmeldung wird nicht benutzt')
  })
})

// ════════════════════════════════════════════════════════════════
// A4 — der Vermerk war richtig gemessen, und ist jetzt eingeloest
// ════════════════════════════════════════════════════════════════

describe('G-579/A4 — die feste Liste bleibt bei zwei', () => {
  it('ZYKLUS_WAEHLBAR traegt weiter zwei Werte', () => {
    // `[read]` **`sequence` ist BEDINGT waehlbar** — es braucht einen
    // zweiten Plan. **Eine feste Dreierliste waere eine Zusage, die
    // bei einem einzigen Plan bricht.**
    assert.deepEqual([...ZYKLUS_WAEHLBAR], ['once', 'rollover'])
  })

  it('der Satz nennt jetzt die Bedingung, nicht die Baustelle', () => {
    // `[cmd]` **Hier stand: *„die Auswahl dafuer ist noch nicht
    // gebaut"*** — richtig gemessen, aber seit G-579 eingeloest.
    assert.match(ZYKLUS_BRAUCHT_ZWEITEN_SATZ, /zweiten Plan/)
    assert.ok(!/nicht gebaut/.test(ZYKLUS_BRAUCHT_ZWEITEN_SATZ),
      'der Satz behauptet weiter, die Auswahl fehle')
  })

  it('sequence steht nur zur Wahl, wenn es Kandidaten gibt', () => {
    const ui = lies(join(SRC, 'app', 'v2', 'nutrition', 'plan-werkbank-ui.tsx'))
    assert.match(ui, /kandidaten\.length\s*\n?\s*\?\s*\(\[\.\.\.ZYKLUS_WAEHLBAR, 'sequence'\]/,
      'sequence steht unbedingt zur Wahl — bei einem einzigen Plan '
      + 'waere das ein Knopf, der garantiert scheitert')
    assert.match(ui, /data-kein-folgeplan/,
      'ohne Kandidaten fehlt der Satz, der sagt warum')
  })
})
