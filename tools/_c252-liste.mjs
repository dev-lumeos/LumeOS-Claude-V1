// C-252: die Katalogliste GEGEN DIE LAUFENDE DATENBANK zaehlen.
//
// `[read]` Typecheck sagt nichts ueber PostgREST — eine falsche
// Einbettung faellt erst zur Laufzeit auf. Deshalb wird hier dieselbe
// Abfrage gestellt, die `ladeSubstanzListe` stellt.
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('apps/web/.env.local', 'utf8')
    .split('\n')
    .filter(z => z.includes('=') && !z.trim().startsWith('#'))
    .map(z => {
      const i = z.indexOf('=')
      return [z.slice(0, i).trim(), z.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    }))

const url = env.NEXT_PUBLIC_SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SERVICE_ROLE
const s = createClient(url, key, { auth: { persistSession: false } }).schema('supplements')

const AUSWAHL = 'id, slug, name_de, name_en, description_de, description_en, form,'
  + ' evidence_grade, source,'
  + ' supplement_categories(name_de, name_en),'
  + ' supplement_groups(code, label_de, label_en)'

// ── MIT Filter: die Erwartung ist 290 ──────────────────────────────
const mit = await s.from('supplements').select(AUSWAHL, { count: 'exact' })
  .eq('im_katalog', true).order('sort_order').order('name_en')
if (mit.error) { console.error('FEHLER (mit Filter):', mit.error.message); process.exit(1) }
console.log(`MIT  .eq('im_katalog', true) : ${mit.count} Eintraege   (erwartet 290)`)

// ── OHNE Filter: die Negativprobe, Erwartung 566 ───────────────────
const ohne = await s.from('supplements').select(AUSWAHL, { count: 'exact' })
  .order('sort_order').order('name_en')
if (ohne.error) { console.error('FEHLER (ohne Filter):', ohne.error.message); process.exit(1) }
console.log(`OHNE Filter                  : ${ohne.count} Eintraege   (erwartet 566)`)

// ── Die Gegenprobe, namentlich ─────────────────────────────────────
const namen = new Set((mit.data ?? []).map(r => r.slug))
console.log()
console.log('Gegenprobe, namentlich:')
console.log(`  sub_9f9bb8c160 (Creatine monohydrate, Grad A) in der Liste: `
  + `${namen.has('sub_9f9bb8c160') ? 'JA  (richtig)' : 'NEIN (FEHLER)'}`)
console.log(`  f05_7_keto_dhea (7-Keto DHEA, ohne Beschreibung)  in der Liste: `
  + `${namen.has('f05_7_keto_dhea') ? 'JA  (FEHLER)' : 'NEIN (richtig)'}`)

// ── Kommen die eingebetteten Tabellen wirklich an? ─────────────────
const p = (mit.data ?? []).find(r => r.slug === 'sub_9f9bb8c160')
console.log()
console.log('Ein Eintrag, wie ihn die Liste liefert:')
console.log(`  name_de=${JSON.stringify(p?.name_de)}  name_en=${JSON.stringify(p?.name_en)}`)
console.log(`  Kategorie=${JSON.stringify(p?.supplement_categories)}`)
console.log(`  Gruppe=${JSON.stringify(p?.supplement_groups)}`)
console.log(`  Grad=${p?.evidence_grade}  form=${JSON.stringify(p?.form)}`)

// ── Wieviele traegen nach der Umsetzung wirklich einen Namen? ──────
const ohneName = (mit.data ?? []).filter(r => !r.name_de && !r.name_en).length
const ohneBeschr = (mit.data ?? []).filter(r => !r.description_de && !r.description_en).length
const ohneGruppe = (mit.data ?? []).filter(r => !r.supplement_groups?.code).length
console.log()
console.log(`Von den ${mit.count}: ohne Namen ${ohneName} · ohne Beschreibung `
  + `${ohneBeschr} · ohne Gruppe ${ohneGruppe}   (jeweils erwartet 0)`)
