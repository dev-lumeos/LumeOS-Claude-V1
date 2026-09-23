// G-438/A1 - die 18 motor.ts-Schluessel gegen `muscle_groups`.
//
// ══ DIE FRAGE ═══════════════════════════════════════════════════
//
// **Tom:** *„arms triceps ist orange, zeigt aber keine werte in der
// liste."*
//
// `[cmd]` **Die Karte faerbt die drei KOEPFE, der Wert haengt am
// ELTERNTEIL `Triceps`, und die Uebersetzung fehlt.**
//
// `[read]` **Gesucht ist je Schluessel ein Gegenpart in
// `muscle_groups`** - und **wo es nicht eindeutig ist, wird das
// GEMELDET**, nicht geraten (der Auftrag sagt es ausdruecklich).
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

const { data: knoten, error } = await s.schema('training')
  .from('muscle_groups').select('id,name,parent_id')
if (error) { console.log('FEHLER:', error.message); process.exit(1) }

const kinderVon = {}
for (const k of knoten) (kinderVon[k.parent_id ?? '_'] ??= []).push(k)
const nachId = Object.fromEntries(knoten.map(k => [k.id, k]))

// Wieviele Uebungszuordnungen je Knoten? (PostgREST deckelt bei 1000.)
const zuord = []
for (let von = 0; ; von += 1000) {
  const t = await s.schema('training')
    .from('exercise_muscles').select('muscle_group_id').range(von, von + 999)
  if (t.error) break
  zuord.push(...t.data)
  if (t.data.length < 1000) break
}
const volumen = {}
for (const z of zuord) volumen[z.muscle_group_id] = (volumen[z.muscle_group_id] ?? 0) + 1

// ── Die 18 Schluessel aus motor.ts, gelesen statt getippt ───────
const motor = fs.readFileSync(
  path.join(WURZEL, 'apps/web/src/app/v2/recovery/motor.ts'), 'utf8')
const SCHLUESSEL = [...(/MUSCLE_GROUPS_BODYMAP = \[([\s\S]*?)\] as const/.exec(motor)?.[1] ?? '')
  .matchAll(/'([^']+)'/g)].map(m => m[1])

// Welche Flaechen faerbt ein Schluessel? -> aus muskel-zuordnung.ts
const zuo = fs.readFileSync(
  path.join(WURZEL, 'apps/web/src/app/v2/recovery/muskel-zuordnung.ts'), 'utf8')

// Welchen Muskel zeigt eine Flaeche? -> aus ebenen.ts
const ebenenRoh = fs.readFileSync(
  path.join(WURZEL, 'apps/web/src/lib/koerper/ebenen.ts'), 'utf8')
const flaecheZeigt = {}
for (const m of ebenenRoh.matchAll(/'([^']+)':\s*\{([\s\S]*?)\n  \}/g)) {
  const name = /name:\s*'([^']+)'/.exec(m[2])?.[1] ?? null
  flaecheZeigt[m[1]] = name
}

console.log('\n=== A1: die 18 Schluessel gegen training.muscle_groups ===\n')
console.log('  Schluessel        Gegenpart                  Vol.  Kinder  Befund')
console.log('  ' + '-'.repeat(78))

const ergebnis = []
for (const sch of SCHLUESSEL) {
  // Kandidaten: Name gleich, bis auf Unterstrich/Gross-Klein/Plural.
  const norm = (x) => x.toLowerCase().replace(/[_\s-]/g, '')
  const n = norm(sch)
  const treffer = knoten.filter(k => {
    const kn = norm(k.name)
    return kn === n || kn === n + 's' || n === kn + 's'
  })

  let befund, gegenpart = '', vol = '', kinder = ''
  if (treffer.length === 1) {
    const k = treffer[0]
    gegenpart = k.name
    vol = String(volumen[k.id] ?? 0)
    kinder = String((kinderVon[k.id] ?? []).length)
    befund = 'eindeutig'
  } else if (treffer.length === 0) {
    befund = 'MELDUNG: kein Name in muscle_groups'
  } else {
    gegenpart = treffer.map(t => t.name).join(' / ')
    befund = `MELDUNG: ${treffer.length} Kandidaten`
  }
  ergebnis.push({ sch, gegenpart, vol, kinder, befund, treffer })
  console.log(`  ${sch.padEnd(17)} ${gegenpart.padEnd(26)} ${vol.padStart(4)}  ${kinder.padStart(6)}  ${befund}`)
}

const eindeutig = ergebnis.filter(e => e.befund === 'eindeutig')
console.log(`\n  eindeutig ${eindeutig.length} von ${SCHLUESSEL.length}`)

// ══ Der Kern: faerbt der Schluessel Flaechen, die einen ANDEREN
//    Muskel zeigen als seinen Gegenpart? ════════════════════════
console.log('\n\n=== Der Widerspruch: Karte faerbt X, Wert haengt an Y ===\n')
for (const e of eindeutig) {
  // Welche Flaechen faerbt dieser Schluessel? Aus RECOVERY_ZU_KARTE.
  const block = new RegExp(`'${e.sch}':\\s*(\\[[^\\]]*\\]|'[^']*'|null)`).exec(zuo)
  if (!block) continue
  const flaechen = [...block[1].matchAll(/'([^']+)'/g)].map(m => m[1])
  if (flaechen.length === 0) continue
  const zeigen = flaechen.map(f => flaecheZeigt[f] ?? null)
  const andere = zeigen.filter(z => z && z !== e.gegenpart)
  if (andere.length > 0) {
    const kinderNamen = (kinderVon[e.treffer[0].id] ?? []).map(k => k.name)
    const sindKinder = andere.every(a => kinderNamen.includes(a))
    console.log(`  ${e.sch}  ->  Wert am Elternteil "${e.gegenpart}"`)
    console.log(`    Karte faerbt: ${flaechen.join(', ')}`)
    console.log(`    die zeigen  : ${andere.join(', ')}`)
    console.log(`    sind das Kinder von "${e.gegenpart}"? ${sindKinder ? 'JA' : 'NEIN'}`)
    console.log('')
  }
}

// ── Die fuenf Meldungen: gibt es sie unter anderem Namen? ───────
//
// `[read]` **„Kein Name" kann heissen: anders benannt.** `[cmd]`
// **Erst suchen, dann melden** (die Lehre `werkzeug-meldet-fehlend-
// pruefe-umbenannt`).
console.log('\n\n=== Die Meldungen: anders benannt? ===\n')
const OFFEN = ['front_deltoids', 'back_deltoids', 'abs', 'gluteal', 'neck']
for (const o of OFFEN) {
  const stamm = o.replace(/^(front|back)_/, '').replace(/s$/, '')
  const nah = knoten.filter(k => {
    const n = k.name.toLowerCase()
    return n.includes(stamm) || stamm.includes(n.split(' ')[0])
  })
  console.log(`  ${o}`)
  if (nah.length === 0) console.log('    nichts Aehnliches in muscle_groups')
  for (const k of nah.slice(0, 6)) {
    const kinder = (kinderVon[k.id] ?? []).length
    const el = k.parent_id ? nachId[k.parent_id]?.name : '—'
    console.log(`    "${k.name}"  Vol ${String(volumen[k.id] ?? 0).padStart(4)}  Kinder ${kinder}  unter: ${el}`)
  }
}

// `gluteal`: was faerbt es, und wie heisst das im Baum?
console.log('\n  gluteal — was faerbt der Schluessel?')
for (const k of knoten.filter(x => /glut/i.test(x.name))) {
  const el = k.parent_id ? nachId[k.parent_id]?.name : '—'
  console.log(`    "${k.name}"  Vol ${String(volumen[k.id] ?? 0).padStart(4)}  Kinder ${(kinderVon[k.id] ?? []).length}  unter: ${el}`)
}
console.log('\n  Deltoids-Kinder:')
const delt = knoten.find(k => k.name === 'Deltoids')
for (const k of kinderVon[delt?.id] ?? []) {
  console.log(`    "${k.name}"  Vol ${volumen[k.id] ?? 0}`)
}

// ── Welche Flaechen tragen `name: null`, obwohl es den Namen gibt? ─
//
// `[cmd]` **Der Vermerk in `ebenen.ts` kann veraltet sein** — C-482
// hat zehn Namen geliefert, die dort als „gibt es nicht" stehen.
// `[read]` **Die Lehre `vermerk-behauptet-mangel-den-es-nicht-gibt`.**
console.log('\n\n=== Flaechen mit name: null — gibt es den Namen inzwischen? ===\n')
const namen = new Set(knoten.map(k => k.name.toLowerCase()))
let n = 0
for (const [code, m] of Object.entries(flaecheZeigt)) {
  if (m) continue
  // Aus dem Code einen Kandidatennamen raten und gegen die DB halten.
  const teile = code.split('-')
  const kand = knoten.filter(k => {
    const kn = k.name.toLowerCase()
    return teile.every(t => kn.includes(t)) || kn.replace(/[^a-z]/g, '') === code.replace(/[^a-z]/g, '')
  })
  if (kand.length) {
    n += 1
    console.log(`  ${code.padEnd(30)} -> "${kand[0].name}"  (Vol ${volumen[kand[0].id] ?? 0})`)
  }
}
console.log(`\n  ${n} Flaechen tragen name: null, obwohl muscle_groups den Namen fuehrt.`)

console.log('\n  Die C-482-Namen, einzeln gegen ebenen.ts:')
const C482 = ['Triceps Brachii Long Head','Triceps Brachii Lateral Head','Triceps Brachii Medial Head',
  'Vastus Lateralis','Vastus Medialis','Gastrocnemius Lateral Head','Gastrocnemius Medial Head',
  'Serratus Anterior','External Oblique','Posterior Neck Muscles']
for (const nm of C482) {
  const inDb = namen.has(nm.toLowerCase())
  const inEbenen = Object.values(flaecheZeigt).some(x => x && x.toLowerCase() === nm.toLowerCase())
  console.log(`    ${nm.padEnd(30)} DB ${inDb ? 'JA ' : 'nein'}  ebenen.ts ${inEbenen ? 'JA' : 'NEIN'}`)
}

console.log('\n  Die 11 name:null-Flaechen, je Kandidat:')
for (const code of ['vastus-lateralis','vastus-medialis','gastrocnemius-lateralis','gastrocnemius-medialis',
  'tendinous-inscriptions','serratus-anterior','external-oblique','triceps-longum','triceps-lateralis',
  'triceps-mediale','forearm-extensors-ulnar']) {
  const w = code.split('-')
  const tref = knoten.filter(k => {
    const n = k.name.toLowerCase()
    if (code.startsWith('triceps-')) {
      const teil = { longum:'long', lateralis:'lateral', mediale:'medial' }[w[1]]
      return n.startsWith('triceps brachii') && n.includes(teil)
    }
    if (code.startsWith('gastrocnemius-')) {
      const teil = w[1] === 'lateralis' ? 'lateral' : 'medial'
      return n.startsWith('gastrocnemius') && n.includes(teil)
    }
    return n === w.join(' ')
  })
  console.log(`    ${code.padEnd(26)} ${tref.length ? '"'+tref[0].name+'"  Vol '+(volumen[tref[0].id]??0) : 'KEIN Kandidat'}`)
}

console.log('\n  Der ECHTE Elternteil je Name (fuer `weg`):')
for (const nm of ['Vastus Lateralis','Vastus Medialis','Gastrocnemius Lateral Head',
  'Gastrocnemius Medial Head','Serratus Anterior','External Oblique',
  'Triceps Brachii Long Head','Triceps Brachii Lateral Head','Triceps Brachii Medial Head']) {
  const k = knoten.find(x => x.name === nm)
  if (!k) { console.log(`    ${nm}: NICHT in der DB`); continue }
  const kette = []
  let cur = k
  while (cur) { kette.unshift(cur.name); cur = cur.parent_id ? nachId[cur.parent_id] : null }
  console.log(`    ${nm.padEnd(30)} ${kette.join(' > ')}`)
}

console.log('\n  Die Wurzeln in muscle_groups:')
const wz = knoten.filter(k => !k.parent_id).sort((a,b)=>a.name.localeCompare(b.name))
for (const w of wz) console.log(`    ${w.name.padEnd(16)} Kinder ${(kinderVon[w.id] ?? []).length}`)
console.log(`  -> ${wz.length} Wurzeln`)
