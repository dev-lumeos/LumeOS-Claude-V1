// G-488 — drei Zahlen zum Plan, keine zwei passten.
//
// **Tom, 2026-09-08, auf einem Schirm:**
//
//     Flaeche oben     „Tag 3 von 35"
//     Flaeche unten    „Dauer 28 Tage"
//     „Laeuft bis"     23.10.  (19.09. + 28 Tage waere der 17.10.)
//
// `[cmd]` **Gemessen 2026-09-23 am aktiven Plan:**
//
//     meal_plans.days_count        28
//     meal_plan_days, gezaehlt     35   (5 Wochen, 19.09.-23.10.)
//     rollover_count                1
//
// `[read]` **Zwei der drei Zahlen stimmten** — sie kommen aus den
// Tageszeilen. **Falsch war `days_count`.**
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const SRC = path.resolve(__dirname, '..', '..', '..', '..')
const lies = (p: string) => readFileSync(path.join(SRC, p), 'utf8')
const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')

const PLAENE = 'app/v2/nutrition/plans-echt.tsx'

test('G-488/A1: die Dauer kommt aus den gezaehlten Tagen', () => {
  const q = ohneKommentare(lies(PLAENE))
  // `[cmd]` **Hier stand `${p.days_count} Tage`** — die gespeicherte
  // Zahl, roh. `[read]` **Dieselbe Regel wie bei „Days count"
  // (`?? z.tage`) und „Laeuft bis" (aus `plan_date`): die
  // Tageszeilen sind die Wahrheit.**
  assert.match(q, /label="Dauer" value=\{`\$\{zaehlung\.tage\} Tage`\}/,
    'Die Dauer zeigt wieder `days_count` statt der gezaehlten Tage.')
  assert.doesNotMatch(q, /label="Dauer" value=\{`\$\{p\.days_count\} Tage`\}/,
    'Die Dauer zeigt wieder die gespeicherte Zahl.')
})

test('G-488/A2: die Abweichung wird GENANNT, nicht geglaettet', () => {
  const q = ohneKommentare(lies(PLAENE))
  // `[read]` **Ein stiller Austausch verbaerge, dass die Spalte
  // veraltet ist** — und der naechste Leser hielte 35 fuer
  // gespeichert.
  assert.match(q, /data-probe="dauer-weicht-ab"/,
    'Die Abweichung wird verschwiegen.')
  assert.match(q, /p\.days_count !== zaehlung\.tage/,
    'Der Hinweis haengt nicht am Vergleich der beiden Zahlen.')
  // `[cmd]` **Und er nennt BEIDE Zahlen** — eine allein erklaerte
  // nichts.
  assert.match(q, /\{zaehlung\.tage\} Tage in \{zaehlung\.wochen\} Wochen/,
    'Der Hinweis nennt die gezaehlten Tage nicht.')
  assert.match(q, /\{p\.days_count\} Tagen angelegt/,
    'Der Hinweis nennt die gespeicherte Zahl nicht.')
})

test('G-488/A3: „Laeuft bis" bleibt GELESEN, nicht gerechnet', () => {
  const q = ohneKommentare(lies(PLAENE))
  // `[cmd]` **Gemessen: 23.10. ist der letzte `plan_date`** —
  // 19.09. + 28 Tage waere der 17.10. `[read]` **Die Zeile war also
  // nie falsch**, und sie darf nicht auf `days_count` umgestellt
  // werden.
  assert.match(q, /laufzeitVon\(\s*d\.wochen\.flatMap/,
    'Die Laufzeit kommt nicht mehr aus den Tageszeilen.')
  const i = q.indexOf('label="Läuft bis"')
  assert.ok(i > 0, 'Die Zeile „Läuft bis" fehlt.')
  const zeile = q.slice(i, i + 120)
  assert.doesNotMatch(zeile, /days_count/,
    '„Läuft bis" rechnet wieder mit `days_count`.')
})
