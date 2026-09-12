// G-435 - der Stand NACH C-484.
//
// `[read]` **Der Auftrag nennt Zahlen** - 51 Zeilen, 8 Wurzeln, 43
// Flaechen, `ebene` und `seite` weg. `[cmd]` **Die werden gemessen,
// nicht geglaubt** (die Lehre aus `auftragszahl-selbst-nachzaehlen`).
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

console.log('\n=== public.koerperflaechen nach C-484 ===\n')
const { data, error } = await s
  .from('koerperflaechen').select('code,parent_id,art,name_de,muscle_group_id')
if (error) { console.log('FEHLER:', error.message); process.exit(1) }

const wurzeln = data.filter(z => !z.parent_id)
const arten = {}
for (const z of data) arten[z.art] = (arten[z.art] ?? 0) + 1
console.log(`  Zeilen          ${data.length}   (Auftrag nennt 51)`)
console.log(`  Wurzeln         ${wurzeln.length}   (Auftrag nennt 8)`)
console.log(`  Arten           ${JSON.stringify(arten)}`)
console.log(`  ohne Wurzeln    ${data.length - wurzeln.length}   (Auftrag nennt 43 Flaechen)`)

// ── Sind die Spalten wirklich weg? ──────────────────────────────
//
// `[read]` **Ein `select` auf eine fehlende Spalte ist ein Fehler**
// - genau das braucht der Nachweis.
console.log('')
for (const sp of ['ebene', 'seite']) {
  const r = await s.from('koerperflaechen').select(sp).limit(1)
  console.log(`  Spalte ${sp.padEnd(6)}  ${r.error ? 'WEG' : 'EXISTIERT NOCH'}`)
}

// ── Gibt es noch -l/-r-Zeilen? ──────────────────────────────────
const seitenZeilen = data.filter(z => /-(l|r)$/.test(z.code))
console.log(`\n  Codes auf -l/-r  ${seitenZeilen.length}`)
if (seitenZeilen.length) {
  console.log(`    ${seitenZeilen.slice(0, 8).map(z => z.code).join(', ')}`)
}

// ── Der Leseweg von Recovery: geht er ueberhaupt noch? ──────────
//
// `[cmd]` **Genau die Spaltenliste aus `hierarchie-read.ts:59`.**
console.log('\n=== der Leseweg, wie er heute im Code steht ===\n')
const alt = await s.from('koerperflaechen')
  .select('id,parent_id,code,name_de,name_en,ebene,art,seite,muscle_group_id')
console.log(`  mit ebene+seite:  ${alt.error ? 'FAELLT — ' + alt.error.message.slice(0, 60) : 'geht'}`)
const neu = await s.from('koerperflaechen')
  .select('id,parent_id,code,name_de,name_en,art,muscle_group_id')
console.log(`  ohne ebene+seite: ${neu.error ? 'FAELLT — ' + neu.error.message.slice(0, 60) : 'geht, ' + neu.data.length + ' Zeilen'}`)

const g = await s.schema('training').from('muscle_groups').select('name')
console.log(`\n  training.muscle_groups: ${g.error ? g.error.message : g.data.length + ' Namen'}`)

// ── A4: traegt checkins eine Seite? ─────────────────────────────
//
// `[read]` **C-462 hat gemessen, dass die Katerwerte dort stehen.**
// **Der Auftrag sagt: melden, nicht bauen.**
console.log('\n=== A4: hat checkins eine Seite? ===\n')
// `[cmd]` **`checkins` liegt in `recovery`, nicht in `public`** -
// gemessen, nicht geraten.
const ck = await s.schema('recovery').from('checkins')
  .select('soreness,pain_areas').not('soreness', 'is', null).limit(3)
if (ck.error) {
  console.log('  FEHLER:', ck.error.message)
} else {
  console.log(`  Zeilen mit soreness: ${ck.data.length}`)
  for (const z of ck.data) {
    console.log(`    soreness   ${JSON.stringify(z.soreness)?.slice(0, 110)}`)
    console.log(`    pain_areas ${JSON.stringify(z.pain_areas)?.slice(0, 110)}`)
  }
}
for (const sp of ['seite', 'side']) {
  const r = await s.schema('recovery').from('checkins').select(sp).limit(1)
  console.log(`  Spalte ${sp.padEnd(6)} ${r.error ? 'GIBT ES NICHT' : 'existiert'}`)
}

// ── Gibt es `sortierung` noch? ──────────────────────────────────
//
// `[read]` **Der Leseweg ordnet danach** - faellt die Spalte, faellt
// er weiter, auch wenn `ebene`/`seite` raus sind.
const so = await s.from('koerperflaechen').select('code').order('sortierung').limit(1)
console.log(`\n  .order('sortierung')  ${so.error ? 'FAELLT — ' + so.error.message.slice(0, 50) : 'geht'}`)

// ── Welche `art`-Werte erlaubt der CHECK? ───────────────────────
//
// `[read]` **Die Lehre `auswahlliste-ist-eine-zusage`: Werte aus dem
// CHECK holen, nie aus dem Kopf.** Der Auftrag nennt `kopf` —
// gemessen wird, ob er erlaubt UND ob er benutzt ist.
const probe = await s.from('koerperflaechen').select('art')
const benutzt = [...new Set((probe.data ?? []).map(z => z.art))].sort()
console.log(`\n  art benutzt:  ${benutzt.join(', ')}`)
