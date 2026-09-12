// G-432 - stimmt JEDE Zeile in `ebenen.ts` mit der Datenbank?
//
// `[read]` **Die Datei ist eine Sammlung von Behauptungen ueber
// `training.muscle_groups`.** `[cmd]` **Eine abgeschriebene Tabelle
// altert still** - also wird sie gegen die laufende Instanz geprueft,
// Name fuer Name, Kind fuer Kind.
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
const vonName = new Map(mg.map(g => [g.name.toLowerCase(), g]))
const kinderVon = (id) => mg.filter(g => g.parent_id === id).map(g => g.name)
const pfadZu = (g) => {
  const aus = []
  let k = g, tiefe = 0
  while (k && tiefe < 10) { aus.unshift(k.name); k = k.parent_id ? nachId.get(k.parent_id) : null; tiefe += 1 }
  return aus
}

// `ebenen.ts` als Daten lesen - ohne TypeScript zu uebersetzen.
const quelle = fs.readFileSync(
  path.join(WURZEL, 'apps/web/src/lib/koerper/ebenen.ts'), 'utf8')
const blok = quelle.slice(quelle.indexOf('export const EBENEN'))

/** Je Eintrag: code, name, weg, art, kinder. */
function eintraege(text) {
  const aus = []
  const re = /\n  '?([a-z-]+)'?:\s*\{([\s\S]*?)\n  \},/g
  let m
  while ((m = re.exec(text)) !== null) {
    const r = m[2]
    const name = (r.match(/name:\s*(?:'([^']*)'|null)/) ?? [])[1] ?? null
    const wegRoh = (r.match(/weg:\s*\[([^\]]*)\]/) ?? [])[1] ?? ''
    const kinderRoh = (r.match(/kinder:\s*\[([^\]]*)\]/) ?? [])[1] ?? ''
    aus.push({
      code: m[1],
      name,
      weg: [...wegRoh.matchAll(/'([^']*)'/g)].map(x => x[1]),
      art: (r.match(/art:\s*'([a-z]+)'/) ?? [])[1] ?? '?',
      kinder: [...kinderRoh.matchAll(/'([^']*)'/g)].map(x => x[1]),
    })
  }
  return aus
}

const ist = eintraege(blok)
console.log(`\n=== ${ist.length} Eintraege in ebenen.ts, gegen die Datenbank ===\n`)
if (ist.length < 20) { console.log('FEHLER: zu wenige geparst — das Muster passt nicht'); process.exit(1) }

let fehler = 0
for (const e of ist) {
  const meldungen = []
  if (e.name === null) {
    // Behauptung: es gibt KEINEN Namen.
    if (vonName.has(e.code.toLowerCase())) {
      meldungen.push(`behauptet "kein Name", aber "${e.code}" steht in muscle_groups`)
    }
    if (e.art !== 'umriss' && e.kinder.length > 0) {
      meldungen.push('ohne Namen kann es keine Kinder geben')
    }
  } else {
    const g = vonName.get(e.name.toLowerCase())
    if (!g) meldungen.push(`"${e.name}" steht NICHT in muscle_groups`)
    else {
      const weg = pfadZu(g)
      if (weg.join('>') !== e.weg.join('>')) {
        meldungen.push(`Weg: ist "${weg.join(' > ')}", behauptet "${e.weg.join(' > ')}"`)
      }
      const k = kinderVon(g.id)
      const fehlt = k.filter(x => !e.kinder.some(y => y.toLowerCase() === x.toLowerCase()))
      const zuviel = e.kinder.filter(x => !k.some(y => y.toLowerCase() === x.toLowerCase()))
      if (fehlt.length) meldungen.push(`Kinder FEHLEN: ${fehlt.join(', ')}`)
      if (zuviel.length) meldungen.push(`Kinder ERFUNDEN: ${zuviel.join(', ')}`)
      // Die Art muss zu den Kindern passen.
      const erwartet = k.length > 0 ? 'gruppe' : 'muskel'
      if (e.art !== erwartet && e.art !== 'umriss') {
        meldungen.push(`art: ist "${e.art}", nach ${k.length} Kindern erwartet "${erwartet}"`)
      }
    }
  }
  if (meldungen.length) {
    fehler += 1
    console.log(`  ${e.code.padEnd(17)} ${meldungen.join('\n' + ' '.repeat(21))}`)
  }
}

console.log(`\n${fehler === 0 ? 'ALLE EINTRAEGE STIMMEN.' : `${fehler} Eintraege weichen ab.`}`)

// ══ A3: der Abgleich in BEIDE Richtungen ═══════════════════════
//
// `[read]` **Der Auftrag verlangt beides:** *,,Grafik ohne
// muscle_groups-Namen: melden. muscle_groups ohne Grafik: auch
// melden. Nichts erfinden, in beide Richtungen."*
const pfadQuelle = fs.readFileSync(
  path.join(WURZEL, 'apps/web/src/lib/koerper/pfadnamen.ts'), 'utf8')
const genannt = new Set()
for (const m of pfadQuelle.matchAll(/name:\s*'([^']+)'/g)) genannt.add(m[1].toLowerCase())

console.log('\n\n=== A3: Grafik gegen muscle_groups ===\n')

// Richtung 1: die Grafik zeigt etwas, das keinen Namen hat.
const ohneNamen = []
for (const m of pfadQuelle.matchAll(/flaeche:\s*'([a-z-]+)',\s*ansicht:\s*'(front|back)',\s*pfade:\s*(\d+),\s*art:\s*'(\w+)',\s*\n?\s*name:\s*(?:'([^']*)'|null)/g)) {
  if (m[4] === 'umriss') continue
  if (!m[5]) ohneNamen.push(`${m[1]}/${m[2]} (${m[3]} Pfade, art=${m[4]})`)
}
console.log(`Grafik OHNE muscle_groups-Namen: ${ohneNamen.length}`)
for (const z of ohneNamen) console.log(`  ${z}`)

// Richtung 2: muscle_groups fuehrt einen Namen, den die Grafik
// nicht zeigt.
const gezeichnet = new Set([...genannt])
const ohneGrafik = mg
  .filter(g => !gezeichnet.has(g.name.toLowerCase()))
  .map(g => ({ name: g.name, eltern: g.parent_id ? nachId.get(g.parent_id)?.name : '—' }))
console.log(`\nmuscle_groups OHNE Grafik: ${ohneGrafik.length} von ${mg.length}`)
// Nach Elternteil gruppieren - das macht die Luecken lesbar.
const proEltern = {}
for (const g of ohneGrafik) (proEltern[g.eltern ?? '—'] ??= []).push(g.name)
for (const [e, kinder] of Object.entries(proEltern).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${String(e).padEnd(20)} ${kinder.length}: ${kinder.slice(0, 6).join(', ')}${kinder.length > 6 ? ' …' : ''}`)
}

// ══ A7: braucht `koerperflaechen` eine VIERTE Ebene? ════════════
//
// `[read]` **Der Auftrag sagt: melden, nicht bauen.** `[cmd]` **Also
// wird gemessen, WIEVIELE Flaechen sie braeuchten.**
const ebenenQuelle = fs.readFileSync(
  path.join(WURZEL, 'apps/web/src/lib/koerper/ebenen.ts'), 'utf8')
console.log('\n\n=== A7: braucht koerperflaechen eine vierte Ebene? ===\n')
const tief = []
for (const e of eintraege(ebenenQuelle.slice(ebenenQuelle.indexOf('export const EBENEN')))) {
  if (!e.name) continue
  // Wie tief steht der Name in muscle_groups?
  const g = vonName.get(e.name.toLowerCase())
  if (!g) continue
  const t = pfadZu(g).length
  if (t >= 3) tief.push(`${e.code.padEnd(17)} Ebene ${t}: ${pfadZu(g).join(' > ')}`)
}
console.log(`Gezeichnete Flaechen auf muscle_groups-Ebene 3 oder tiefer: ${tief.length}`)
for (const z of tief) console.log(`  ${z}`)
console.log('\nkoerperflaechen hat heute DREI Ebenen (Wurzel, Flaeche, Seite).')
console.log('Eine Gruppe zwischen Wurzel und Flaeche waere die vierte.')
