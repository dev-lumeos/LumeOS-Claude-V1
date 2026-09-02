/**
 * G-331 / G-305 / G-314 — die Suchen auf den Hook, zwei Sackgassen.
 *
 * `[read]` **Die Wächter messen die Wirkung, nicht das Wort** —
 * CLAUDE.md nennt vier Fälle (G-216, G-247, G-246, G-108), in denen
 * einer grün blieb, während die Sache kaputt war.
 */
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { test } from 'node:test'

import { sucheParams, LEERE_LAGE } from '../food-suche-hook'

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

const DIARY = 'apps/web/src/app/v2/nutrition/mahlzeiten.tsx'
const PREFS = 'apps/web/src/app/v2/nutrition/tab-vorlieben.tsx'
const PLANNER = 'apps/web/src/app/v2/nutrition/tab-planner-echt.tsx'
const PLANS = 'apps/web/src/app/v2/nutrition/plans-echt.tsx'
const ROUTE = 'apps/web/src/app/api/nutrition/plan/route.ts'

test('die Dateiproben finden ihre Dateien — unabhängig vom Startort', () => {
  for (const f of [DIARY, PREFS, PLANNER, PLANS, ROUTE]) {
    assert.ok(fs.existsSync(path.join(WURZEL, f)), `${f} nicht gefunden`)
    assert.ok(lies(f).length > 500, `${f} ist verdächtig kurz`)
  }
  assert.ok(fs.existsSync(path.join(WURZEL, 'pnpm-workspace.yaml')),
    `WURZEL zeigt nicht auf das Repo: ${WURZEL}`)
})

// ══ 1 · Die Suchen ═══════════════════════════════════════════════════

test('G-331: das Tagebuch ruft das geteilte Modal', () => {
  // `[cmd]` **`HinzufuegenModal` trug 380 Zeilen mit eigenem `fetch`**
  // — und **sechs der acht Lehren fehlten** (2026-09-02 gemessen).
  const roh = lies(DIARY)
  const d = ohneKommentare(DIARY)

  // A-59: entfernt, nicht auskommentiert.
  assert.doesNotMatch(roh, /function HinzufuegenModal\(/,
    'HinzufuegenModal lebt weiter — auch auskommentiert ist sie da')
  assert.doesNotMatch(d, /\/api\/nutrition\/foods/,
    'das Tagebuch sucht selbst — das wäre die fünfte Suche')
  assert.match(d, /<FoodSuchModal/, 'das geteilte Modal wird nicht gerufen')

  // `[read]` **Der Schreibweg bleibt beim Aufrufer** — ein Modal, das
  // ihn kennt, wäre an ihn gebunden.
  const i = d.indexOf('<FoodSuchModal')
  const block = d.slice(i, d.indexOf('/>', d.indexOf('onWaehlen', i)))
  assert.match(block, /art: 'position', meal_id: mealId/,
    'der Schreibweg ist nicht beim Aufrufer geblieben')
  assert.match(block, /art: 'tag'/, 'das Modal wird nicht im Tagesmodus gerufen')
})

test('G-331: die Vorlieben suchen über den Hook — OHNE prefs', () => {
  // `[cmd]` **Gemessen: vier der acht Lehren fehlten.**
  //
  // `[cmd]` **Aber `prefs=1` wäre hier falsch** — diese Suche SETZT
  // Vorlieben (`foodSetzen(…, 'liked')`).
  //
  // `[read]` **Mit den Vorlieben angewandt versteckte der Filter
  // genau die Lebensmittel, die man aufnehmen will.**
  const p = ohneKommentare(PREFS)
  assert.doesNotMatch(p, /\/api\/nutrition\/foods/,
    'der Vorlieben-Reiter sucht noch selbst')
  assert.match(p, /useFoodSuche\(foodLage, 6, null, 2, false\)/,
    'die Suche läuft nicht über den Hook oder wendet die Vorlieben an')

  // Die Wirkung, nicht das Wort: der Schalter greift wirklich.
  const mit = sucheParams({ ...LEERE_LAGE, suche: 'nuss' }, 6)
  const ohne = sucheParams({ ...LEERE_LAGE, suche: 'nuss' }, 6, false)
  assert.equal(mit.get('prefs'), '1', 'die Vorgabe wendet die Vorlieben nicht an')
  assert.equal(ohne.get('prefs'), null,
    'der Schalter wirkt nicht — die Vorlieben filtern weiter')
})

test('G-331: erfassen.tsx ist toter Code — gemeldet, nicht umgebaut', () => {
  // `[cmd]` **477 Zeilen, `export function Erfassen`, KEIN Aufrufer**
  // — gemessen am 2026-09-02, zuletzt geändert am 16.08.
  //
  // `[read]` **Deshalb nicht auf den Hook umgestellt:** eine tote
  // Datei zu verbessern kostet Zeit und ändert nichts. **Der Punkt
  // steht im Bericht.**
  //
  // `[cmd]` **Fällt dieser Wächter, hat die Datei einen Aufrufer
  // bekommen** — dann gehört sie auf den Hook.
  const dateien = fs.readdirSync(path.join(WURZEL, 'apps/web/src'), {
    recursive: true, encoding: 'utf-8',
  }).filter(f => (f.endsWith('.tsx') || f.endsWith('.ts'))
    && !f.includes('__tests__')
    && !f.endsWith('erfassen.tsx'))

  const rufer = dateien.filter(f => {
    const t = fs.readFileSync(path.join(WURZEL, 'apps/web/src', f), 'utf-8')
    return /from '[^']*\/erfassen'/.test(t) || /<Erfassen[\s/>]/.test(t)
  })
  assert.deepEqual(rufer, [],
    `erfassen.tsx hat Aufrufer (${rufer.join(', ')}) — dann gehört sie auf den Hook`)
})

// ══ 2 · G-305: die letzte Sackgasse im Planner ═══════════════════════

test('G-305: der Planner behauptet keinen fehlenden Schreibpfad mehr', () => {
  // `[cmd]` **Hier stand ein `InEntwicklungKnopf`:** *„der Schreibpfad
  // im Browser ist nicht Teil dieses Auftrags (G-97)"*.
  //
  // `[cmd]` **Gemessen: `planMitWochenAnlegen` (C-372) steht**, und
  // `NeuerPlanForm` ruft ihn in der Werkbank.
  //
  // `[read]` **Ein Knopf, der falsch informiert, ist schlimmer als
  // keiner** (G-305).
  const roh = lies(PLANNER)
  assert.doesNotMatch(roh, /nicht Teil dieses Auftrags/,
    'die überholte Begründung steht wieder da')
  assert.doesNotMatch(ohneKommentare(PLANNER), /InEntwicklungKnopf/,
    'im Planner steht wieder eine Attrappe')

  // Der Ersatz führt dorthin, wo es geht.
  const p = ohneKommentare(PLANNER)
  assert.match(p, /data-probe="plan-anlegen-verweis"/,
    'der Verweis auf die Werkbank fehlt')

  // `[cmd]` **Und der Weg existiert wirklich** — sonst wäre der
  // Verweis die nächste Sackgasse.
  const w = ohneKommentare('apps/web/src/app/v2/nutrition/plan-werkbank-ui.tsx')
  assert.match(w, /export function NeuerPlanForm\(/,
    'NeuerPlanForm gibt es nicht — der Verweis führt ins Leere')
  assert.match(w, /<NeuerPlanForm/, 'NeuerPlanForm wird nicht gerufen')
})

// ══ 3 · G-314: die Vorschau ══════════════════════════════════════════

test('G-314: die Vorschau lädt einen beliebigen Plan', () => {
  // **`SPEC_03` Flow 3, Schritt 3:** *„Tap auf Plan → Plan-Vorschau"*.
  //
  // `[cmd]` **`ladePlan(planId)` nimmt seit G-311 einen Bezeichner** —
  // nur der Weg dorthin fehlte.
  const r = ohneKommentare(ROUTE)
  assert.match(r, /searchParams\.get\('vorschau'\)/,
    'die Route kennt keine Vorschau')
  assert.match(r, /ladePlan\(vorschau\)/,
    'die Vorschau lädt den Plan nicht')

  // `[read]` **Rein lesend** — in der GET-Route, nicht in POST.
  const g = r.indexOf('export async function GET')
  const post = r.indexOf('export async function POST')
  const i = r.indexOf("get('vorschau')")
  assert.ok(i > g && (post < 0 || i < post),
    'die Vorschau sitzt nicht in der lesenden Route')

  // `[cmd]` **Die Kennung wird geprüft** — sonst ginge jeder Text an
  // die Datenbank.
  assert.match(r, /\[0-9a-f-\]\{36\}/,
    'die Plan-Kennung wird nicht auf UUID geprüft')
})

test('G-314: der Knopf öffnet ein Fenster und setzt keine Adresse', () => {
  // `[read]` **Seit G-327 gilt `?plan=` nur im Planner** — die
  // Vorschau darf den Reiter nicht umschalten.
  const p = ohneKommentare(PLANS)
  assert.match(p, /data-probe="vorschau-knopf"/, 'der Vorschau-Knopf fehlt')
  assert.match(p, /data-probe="plan-vorschau"/, 'das Vorschaufenster fehlt')

  // Die Wirkung: kein Router, kein `?plan=`.
  const i = p.indexOf('function PlanVorschau(')
  const j = p.indexOf('export function PlanBibliothekEcht')
  const block = p.slice(i, j > i ? j : undefined)
  assert.doesNotMatch(block, /router\.(push|replace)/,
    'die Vorschau wechselt die Adresse — dann schaltet der Reiter um')
  assert.doesNotMatch(block, /\?plan=/,
    'die Vorschau setzt ?plan= — das gilt seit G-327 nur im Planner')

  // `[cmd]` **Und der Klick trägt `stopPropagation`** — die Kachel
  // wählt sonst mit an (G-319).
  const k = p.indexOf('data-probe="vorschau-knopf"')
  const knopf = p.slice(k, p.indexOf('</button>', k))
  assert.match(knopf, /e\.stopPropagation\(\)/,
    'der Vorschau-Knopf wählt die Kachel mit an')
})

test('G-314: die Vorschau zeigt die Tage, nicht nur Zahlen', () => {
  // `[cmd]` **Am 2026-09-02 gemessen: 7 Tageszeilen für „Lean bulk
  // 3100"** (1 Woche, 7 Tage, 28 Positionen).
  //
  // `[read]` **Nur die erste Woche** — bei 28 Tagen wäre das Fenster
  // eine Tabelle, durch die niemand scrollt. **Die Zahl daneben sagt,
  // was nicht gezeigt wird.**
  const p = ohneKommentare(PLANS)
  assert.match(p, /data-probe="vorschau-tage"/, 'die Tage werden nicht gezeigt')
  assert.match(p, /daten\.wochen\[0\]\.tage\.map/,
    'die Vorschau zeigt nicht die Tage der ersten Woche')
  assert.match(p, /daten\.wochen\.length > 1 &&/,
    'die Vorschau verschweigt, dass weitere Wochen folgen')

  // `[read]` **Ein Tag ohne Einträge sagt es** — statt leer zu bleiben.
  assert.match(p, /nichts geplant/,
    'ein leerer Tag bleibt stumm')
})
