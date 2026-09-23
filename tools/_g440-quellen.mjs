// G-440 - was steht WIRKLICH da, und fuer WEN?
//
// ══ DER BEFUND ══════════════════════════════════════════════════
//
// **Tom, 2026-09-13:** *„oben steht echte daten und es
// korrespondiert von der grafik nicht in die liste, und zweidrittel
// der liste zeigt keine werte."*
//
// `[cmd]` **`MUSCLE_STATE` sind 18 feste Zeilen aus dem Mockup** -
// `Push B · Wed` ist kein Datum aus der Datenbank.
//
// `[read]` **Bevor irgendetwas gebaut wird: reicht das, was da
// liegt, ueberhaupt?** `[cmd]` **Und fuer WELCHES Konto** - die
// Lehre `zahlen-tragen-ihren-stichtag-und-ihren-nutzer`.
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const WURZEL = path.resolve(import.meta.dirname, '..')
const env = Object.fromEntries(
  fs.readFileSync(path.join(WURZEL, '.env'), 'utf8')
    .split('\n').filter(z => z.includes('=') && !z.trim().startsWith('#'))
    .map(z => [z.slice(0, z.indexOf('=')).trim(),
      z.slice(z.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')]))

const s = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SERVICE_ROLE,
  { auth: { persistSession: false } })

/** PostgREST deckelt bei 1.000 - blattweise holen. */
async function alle(schema, tabelle, spalten) {
  const aus = []
  for (let von = 0; ; von += 1000) {
    const t = await s.schema(schema).from(tabelle).select(spalten).range(von, von + 999)
    if (t.error) { console.log(`  FEHLER ${tabelle}: ${t.error.message}`); return aus }
    aus.push(...t.data)
    if (t.data.length < 1000) break
  }
  return aus
}

console.log('\n=== Was liegt in training? ===\n')
const saetze = await alle('training', 'workout_sets', '*')
const sitzungen = await alle('training', 'workout_sessions', '*')
const zuordnung = await alle('training', 'exercise_muscles', '*')
console.log(`  workout_sets       ${String(saetze.length).padStart(5)}   (Auftrag nennt 258)`)
console.log(`  workout_sessions   ${String(sitzungen.length).padStart(5)}   (Auftrag nennt 66)`)
console.log(`  exercise_muscles   ${String(zuordnung.length).padStart(5)}   (Auftrag nennt 6.588)`)

// ── Die Spalten: was traegt ein Satz, was eine Sitzung? ─────────
console.log('\n  Spalten workout_sets:')
console.log(`    ${Object.keys(saetze[0] ?? {}).join(', ')}`)
console.log('\n  Spalten workout_sessions:')
console.log(`    ${Object.keys(sitzungen[0] ?? {}).join(', ')}`)
console.log('\n  Spalten exercise_muscles:')
console.log(`    ${Object.keys(zuordnung[0] ?? {}).join(', ')}`)

// ── FUER WEN? ───────────────────────────────────────────────────
//
// `[read]` **Eine Zahl ohne Nutzer ist keine Messung.**
const nutzerFeld = ['user_id', 'client_id', 'profile_id']
  .find(f => sitzungen[0] && f in sitzungen[0])
console.log(`\n=== Fuer wen? (Feld: ${nutzerFeld ?? 'KEINS'}) ===\n`)
if (nutzerFeld) {
  const proNutzer = {}
  for (const z of sitzungen) proNutzer[z[nutzerFeld]] = (proNutzer[z[nutzerFeld]] ?? 0) + 1
  const sortiert = Object.entries(proNutzer).sort((a, b) => b[1] - a[1])
  console.log(`  ${sortiert.length} Konten mit Sitzungen:`)
  for (const [id, n] of sortiert.slice(0, 6)) console.log(`    ${id}  ${n} Sitzungen`)
}

// Welches Konto ist `test-user@lumeos.local`?
const { data: nutzer } = await s.schema('auth').from('users').select('id,email')
  .in('email', ['test-user@lumeos.local', 'dev@lumeos.app'])
console.log('\n  Die Konten:')
for (const u of nutzer ?? []) console.log(`    ${u.email.padEnd(26)} ${u.id}`)

// ── Reicht das je Muskel? ───────────────────────────────────────
//
// `[cmd]` **Die entscheidende Frage:** wieviele der 105 Muskeln
// bekommen aus DIESEN Daten einen eigenen Wert?
console.log('\n=== Wieviele Muskeln bekommen einen EIGENEN Wert? ===\n')
const knoten = await alle('training', 'muscle_groups', 'id,name,parent_id')
const uebungZuMuskel = {}
for (const z of zuordnung) (uebungZuMuskel[z.exercise_id] ??= []).push(z)

const proMuskel = {}
for (const satz of saetze) {
  const zu = uebungZuMuskel[satz.exercise_id] ?? []
  for (const z of zu) {
    (proMuskel[z.muscle_group_id] ??= { saetze: 0, sitzungen: new Set() })
    proMuskel[z.muscle_group_id].saetze += 1
    if (satz.session_id) proMuskel[z.muscle_group_id].sitzungen.add(satz.session_id)
  }
}
const mitDaten = Object.keys(proMuskel).length
console.log(`  Muskeln mit mindestens einem Satz:  ${mitDaten} von ${knoten.length}`)
console.log(`  (heute aus MUSCLE_STATE:            18)`)

const nachName = Object.fromEntries(knoten.map(k => [k.id, k.name]))
const top = Object.entries(proMuskel).sort((a, b) => b[1].saetze - a[1].saetze)
console.log('\n  die zehn haeufigsten:')
for (const [id, d] of top.slice(0, 10)) {
  console.log(`    ${(nachName[id] ?? id).padEnd(28)} ${String(d.saetze).padStart(4)} Saetze, ${d.sitzungen.size} Sitzungen`)
}
console.log('\n  die fuenf seltensten:')
for (const [id, d] of top.slice(-5)) {
  console.log(`    ${(nachName[id] ?? id).padEnd(28)} ${String(d.saetze).padStart(4)} Saetze, ${d.sitzungen.size} Sitzungen`)
}

// ── Die Bruecke: workout_exercises ──────────────────────────────
//
// `[cmd]` **`workout_sets` traegt `workout_exercise_id`, nicht
// `exercise_id`** - die erste Fassung verknuepfte ins Leere und
// meldete „0 von 105". `[read]` **Die Zwischentabelle finden, statt
// die Null zu glauben.**
console.log('\n\n=== Die Bruecke: workout_exercises ===\n')
const uebungen = await alle('training', 'workout_exercises', '*')
console.log(`  Zeilen: ${uebungen.length}`)
console.log(`  Spalten: ${Object.keys(uebungen[0] ?? {}).join(', ')}`)

// ── Die VOLLSTAENDIGE Kette, je Konto ───────────────────────────
//
//   workout_sets.workout_exercise_id
//     -> workout_exercises.exercise_id + .workout_session_id
//        -> exercise_muscles.muscle_group_id
//        -> workout_sessions.session_date + .user_id + .name
console.log('\n\n=== Je Muskel, je Konto — die echte Kette ===\n')
const ueNach = Object.fromEntries(uebungen.map(u => [u.id, u]))
const sitzNach = Object.fromEntries(sitzungen.map(z => [z.id, z]))

const proKonto = {}
for (const satz of saetze) {
  const ue = ueNach[satz.workout_exercise_id]
  if (!ue) continue
  const sitz = sitzNach[ue.workout_session_id]
  if (!sitz) continue
  const konto = sitz.user_id
  const muskeln = uebungZuMuskel[ue.exercise_id] ?? []
  for (const m of muskeln) {
    const k = ((proKonto[konto] ??= {})[m.muscle_group_id] ??=
      { saetze: 0, sitzungen: new Set(), letzte: null, name: null, rollen: {} })
    k.saetze += 1
    k.sitzungen.add(sitz.id)
    k.rollen[m.role] = (k.rollen[m.role] ?? 0) + 1
    const d = sitz.session_date
    if (d && (!k.letzte || d > k.letzte)) { k.letzte = d; k.name = sitz.name }
  }
}

for (const [konto, muskeln] of Object.entries(proKonto)) {
  const n = Object.keys(muskeln).length
  const sitzN = new Set(sitzungen.filter(z => z.user_id === konto).map(z => z.id)).size
  console.log(`  ${konto}`)
  console.log(`    ${n} von ${knoten.length} Muskeln mit Saetzen, ${sitzN} Sitzungen`)
  const top3 = Object.entries(muskeln).sort((a,b)=>b[1].saetze-a[1].saetze).slice(0,3)
  for (const [id, d] of top3) {
    console.log(`      ${(nachName[id] ?? id).padEnd(24)} ${String(d.saetze).padStart(3)} Saetze  letzte: ${d.letzte} „${d.name}"  ${JSON.stringify(d.rollen)}`)
  }
}

// ── Die Rollen insgesamt ────────────────────────────────────────
const rollen = {}
for (const z of zuordnung) rollen[z.role] = (rollen[z.role] ?? 0) + 1
console.log(`\n  exercise_muscles.role: ${JSON.stringify(rollen)}`)
console.log('  (Auftrag nennt primary 3.053, secondary 3.535)')

// ── WARUM nur 17? ───────────────────────────────────────────────
//
// `[read]` **17 von 105 ist kaum mehr als die 18 Attrappenzeilen.**
// `[cmd]` **Vor dem Bauen klaeren, WORAN es liegt** - sonst tauscht
// man eine Attrappe gegen eine ebenso leere Rechnung.
console.log('\n\n=== Warum nur 17 von 105? ===\n')
const konto = '10000000-0000-0000-0000-000000000101'
const meine = proKonto[konto] ?? {}
console.log('  Die 17 mit Saetzen:')
for (const [id, d] of Object.entries(meine).sort((a,b)=>b[1].saetze-a[1].saetze)) {
  const k = knoten.find(x => x.id === id)
  const kinder = knoten.filter(x => x.parent_id === id).length
  console.log(`    ${(k?.name ?? id).padEnd(26)} ${String(d.saetze).padStart(3)} Saetze  Kinder ${kinder}`)
}

// Wieviele VERSCHIEDENE Uebungen kommen ueberhaupt vor?
const genutzteUebungen = new Set()
for (const satz of saetze) {
  const ue = ueNach[satz.workout_exercise_id]
  if (!ue) continue
  const sitz = sitzNach[ue.workout_session_id]
  if (sitz?.user_id === konto) genutzteUebungen.add(ue.exercise_id)
}
console.log(`\n  verschiedene Uebungen in den Sitzungen: ${genutzteUebungen.size}`)
const alleUebungen = new Set(zuordnung.map(z => z.exercise_id))
console.log(`  Uebungen mit Muskelzuordnung insgesamt: ${alleUebungen.size}`)
console.log(`  -> die Seeds decken nur einen Bruchteil des Katalogs ab.`)

// Auf welcher EBENE haengen die 17?
console.log('\n  Auf welcher Ebene haengen sie?')
const tiefeVon = (id) => { let t = 1, cur = knoten.find(x => x.id === id)
  while (cur?.parent_id) { t += 1; cur = knoten.find(x => x.id === cur.parent_id) }
  return t }
const proTiefe = {}
for (const id of Object.keys(meine)) { const t = tiefeVon(id); proTiefe[t] = (proTiefe[t] ?? 0) + 1 }
console.log(`    ${JSON.stringify(proTiefe)}`)
const alleTiefe = {}
for (const k of knoten) { const t = tiefeVon(k.id); alleTiefe[t] = (alleTiefe[t] ?? 0) + 1 }
console.log(`    alle 105:  ${JSON.stringify(alleTiefe)}`)

// ── Welche der 17 sind GEZEICHNET? ──────────────────────────────
//
// `[read]` **Am Schirm zeigten nur 8 einen Wert** - die Rechnung
// liefert 17. `[cmd]` **Die Differenz liegt an `ebenen.ts`:** ein
// Muskel ohne Flaeche hat keine anzeigbare Zeile mit Wert.
console.log('\n\n=== Die 17: welche zeichnet die Karte? ===\n')
const ebenenRoh2 = fs.readFileSync(
  path.join(WURZEL, 'apps/web/src/lib/koerper/ebenen.ts'), 'utf8')
const gez = new Set()
for (const m of ebenenRoh2.matchAll(/name:\s*'([^']+)'/g)) gez.add(m[1].toLowerCase())
let ja = 0, nein = []
for (const id of Object.keys(meine)) {
  const nm = nachName[id]
  if (gez.has((nm ?? '').toLowerCase())) ja += 1
  else nein.push(nm)
}
console.log(`  gezeichnet:       ${ja}`)
console.log(`  NICHT gezeichnet: ${nein.length}`)
console.log(`    ${nein.join(', ')}`)
