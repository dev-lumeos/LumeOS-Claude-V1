// G-430/A5 - rechnet `elternteilVon` ueberhaupt?
//
// `[read]` **Der Block rendert nicht, die Daten sind aber da** - also
// wird die Rechnung selbst befragt, nicht der Schirm.
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const WURZEL = path.resolve(import.meta.dirname, '..')
const env = Object.fromEntries(
  fs.readFileSync(path.join(WURZEL, '.env'), 'utf8')
    .split('\n').filter(z => z.includes('=') && !z.trim().startsWith('#'))
    .map(z => [z.slice(0, z.indexOf('=')).trim(),
      z.slice(z.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')]))

const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SERVICE_ROLE,
  { auth: { persistSession: false } })

const { data: baum } = await s.from('koerperflaechen')
  .select('id,parent_id,code,name_de,name_en,ebene,art,seite,muscle_group_id')

function elternteilVon(flaechen, code) {
  const f = flaechen.find(x => x.code === code)
  if (!f?.parent_id) return null
  return flaechen.find(x => x.id === f.parent_id) ?? null
}

console.log(`\n=== Elternteil je NEUER Flaeche ===\n`)
for (const code of ['latissimus', 'teres-major', 'teres-minor',
  'erector-spinae', 'flanke', 'trapezius', 'chest']) {
  const e = elternteilVon(baum, code)
  const selbst = baum.find(x => x.code === code)
  console.log(`  ${code.padEnd(16)} in Tabelle: ${selbst ? 'JA' : 'NEIN'}`
    + `   Elternteil: ${e ? e.code : '—'}`)
}
