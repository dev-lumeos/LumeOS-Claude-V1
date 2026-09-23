// G-432/A1 - welche EBENE zeigt eine Flaeche?
//
// ══ DIE RICHTIGE FRAGE ══════════════════════════════════════════════
//
// `[read]` **Nicht** *,,ist das ein Muskel?"* **sondern** *,,welche
// Ebene der Hierarchie zeigt dieser Pfad?"*
//
// `[cmd]` **Der Pruefstein: fuehrt `training.muscle_groups` einen
// Namen dafuer?** **Wenn nein, wird zusammengelassen** - wie `abs`,
// wo die acht Segmente Sehnenzwischenstuecke ohne eigenen Namen sind.
//
// `[read]` **Diese Probe zeigt je Kartenflaeche den Baum darunter** -
// Gruppe, Kinder, Enkel, mit ihren echten Namen.
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const WURZEL = path.resolve(import.meta.dirname, '..')
const env = Object.fromEntries(
  fs.readFileSync(path.join(WURZEL, '.env'), 'utf8')
    .split('\n').filter(z => z.includes('=') && !z.trim().startsWith('#'))
    .map(z => [z.slice(0, z.indexOf('=')).trim(),
      z.slice(z.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')]))

const t = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SERVICE_ROLE,
  { auth: { persistSession: false } }).schema('training')

const { data: mg, error } = await t.from('muscle_groups').select('id,name,parent_id')
if (error) { console.log('FEHLER:', error.message); process.exit(1) }

const nachId = new Map(mg.map(g => [g.id, g]))
const kinderVon = (id) => mg.filter(g => g.parent_id === id)
const pfadZu = (g) => {
  const aus = []
  let k = g, tiefe = 0
  while (k && tiefe < 10) { aus.unshift(k.name); k = k.parent_id ? nachId.get(k.parent_id) : null; tiefe += 1 }
  return aus
}

console.log(`\n=== training.muscle_groups: ${mg.length} Namen ===\n`)

// ── Der Baum unter den Beinen und Armen, ganz ───────────────────
function zeige(g, ein = '') {
  const k = kinderVon(g.id)
  console.log(`${ein}${g.name}${k.length ? ` (${k.length})` : ''}`)
  for (const kind of k.sort((a, b) => a.name.localeCompare(b.name))) zeige(kind, ein + '  ')
}
for (const wurzel of mg.filter(g => !g.parent_id).sort((a, b) => a.name.localeCompare(b.name))) {
  zeige(wurzel)
}

// ── Je Kartenflaeche: was fuehrt die Datenbank? ─────────────────
//
// `[cmd]` **Die zwoelf aus G-431, plus die zwei schon geteilten.**
const FLAECHEN = [
  'quadriceps', 'calves', 'adductors', 'forearm', 'abs', 'neck',
  'triceps', 'obliques', 'knees', 'hands', 'ankles', 'feet',
  'biceps', 'chest', 'deltoids', 'trapezius', 'tibialis',
]

/**
 * Den Namen in `muscle_groups` suchen.
 *
 * `[cmd]` **Die erste Fassung fand `forearm` NICHT** - die Datenbank
 * schreibt `Forearms`, die Karte `forearm`. **Sie haette gemeldet
 * *,,kein Name"*, und das waere der Pruefstein fuer ZUSAMMENLASSEN
 * gewesen** - bei einer Gruppe mit acht Enkeln.
 *
 * `[read]` **Also Ein- und Mehrzahl in BEIDE Richtungen probieren**,
 * und die Treffer nennen, statt still den ersten zu nehmen.
 */
function finde(name) {
  const n = name.toLowerCase()
  const kandidaten = [n, n + 's', n.replace(/s$/, ''), n.replace(/s$/, '') + 'es']
  for (const k of kandidaten) {
    const g = mg.find(x => x.name.toLowerCase() === k)
    if (g) return g
  }
  return null
}

// ══ Die Karte heisst anders als die Datenbank ══════════════════
//
// `[cmd]` **Gemessen in `107_muscle_groups_hierarchy.sql`:** `abs`
// heisst dort `Abdominals` (Zeile 134), `neck` heisst `Neck Muscles`
// (Zeile 192). **Ohne diese Bruecke meldete die Probe *,,kein Name"*
// und damit den falschen Pruefstein.**
//
// `[read]` **Kein Name ist erfunden** - jeder steht in der Kettendatei.
const ANDERS = {
  abs: 'Abdominals',
  neck: 'Neck Muscles',
}

console.log(`\n\n=== Je Kartenflaeche: welche Ebene? ===\n`)
for (const f of FLAECHEN) {
  // Die Karte schreibt klein, `muscle_groups` gross.
  const g = (ANDERS[f] ? finde(ANDERS[f]) : null)
    ?? finde(f) ?? finde(f.replace(/s$/, '')) ?? null
  if (!g) { console.log(`  ${f.padEnd(12)} KEIN NAME in muscle_groups`); continue }
  const k = kinderVon(g.id)
  const weg = pfadZu(g)
  console.log(`  ${f.padEnd(12)} ${weg.join(' > ')}`)
  console.log(`  ${''.padEnd(12)} Ebene ${weg.length}`
    + `   ${k.length ? `KINDER: ${k.map(x => x.name).join(', ')}` : 'keine Kinder -> Blatt'}`)
}
