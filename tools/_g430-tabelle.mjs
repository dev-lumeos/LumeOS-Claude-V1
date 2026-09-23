// G-430/A3 - was traegt `public.koerperflaechen` WIRKLICH?
//
// `[read]` **Der Auftrag nennt 59 Zeilen, drei Ebenen, `parent_id`,
// `art`, `muscle_group_id`.** `[cmd]` **Bevor vier Module darauf
// umgestellt werden, wird die Tabelle SELBST gelesen** - eine
// Auftragszahl ist eine Ausgangsvermutung.
//
// `[cmd]` **Und die Gegenfrage:** liefert die Tabelle, was die fuenf
// Listen heute liefern? **Eine Umstellung auf eine Quelle, die
// weniger traegt, waere ein Verlust.**
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

// ── Was traegt die Tabelle? ─────────────────────────────────────
const { data: zeilen, error, count } = await s
  .from('koerperflaechen').select('*', { count: 'exact' })
  .order('code')

if (error) { console.log('FEHLER:', error.message); process.exit(1) }

console.log(`\n=== public.koerperflaechen: ${count} Zeilen ===\n`)
console.log('Spalten:', Object.keys(zeilen[0] ?? {}).join(', '))

// ── Die Ebenen ──────────────────────────────────────────────────
const nachId = new Map(zeilen.map(z => [z.id, z]))
function tiefe(z) {
  let t = 1, p = z.parent_id
  while (p) { t += 1; p = nachId.get(p)?.parent_id ?? null }
  return t
}
const proEbene = {}
for (const z of zeilen) {
  const t = tiefe(z)
  ;(proEbene[t] ??= []).push(z.code)
}
console.log('\nEbenen:')
for (const [t, codes] of Object.entries(proEbene)) {
  console.log(`  Ebene ${t}: ${codes.length} — ${codes.slice(0, 12).join(', ')}${codes.length > 12 ? ' …' : ''}`)
}

// ── Die Arten ───────────────────────────────────────────────────
const proArt = {}
for (const z of zeilen) (proArt[z.art ?? '(null)'] ??= []).push(z.code)
console.log('\nArten:')
for (const [a, codes] of Object.entries(proArt)) {
  console.log(`  ${a.padEnd(14)} ${String(codes.length).padStart(3)} — ${codes.slice(0, 10).join(', ')}${codes.length > 10 ? ' …' : ''}`)
}

// ── muscle_group_id: wieviele haengen an training.muscle_groups? ─
const mitGruppe = zeilen.filter(z => z.muscle_group_id)
console.log(`\nmuscle_group_id gesetzt: ${mitGruppe.length} von ${count}`)

// ── Der Baum, ganz ──────────────────────────────────────────────
console.log('\n=== Der Baum ===\n')
const wurzeln = zeilen.filter(z => !z.parent_id)
function zeige(z, ein = '') {
  const kinder = zeilen.filter(k => k.parent_id === z.id)
  console.log(`${ein}${z.code.padEnd(26 - ein.length)} `
    + `art=${String(z.art).padEnd(12)} `
    + `mg=${z.muscle_group_id ? 'ja' : '– '} `
    + `${kinder.length ? `(${kinder.length} Kinder)` : ''}`)
  for (const k of kinder.sort((a, b) => a.code.localeCompare(b.code))) {
    zeige(k, ein + '  ')
  }
}
for (const w of wurzeln.sort((a, b) => a.code.localeCompare(b.code))) zeige(w)

// ── Die Gegenprobe: deckt die Tabelle die fuenf Listen? ─────────
const KARTE = (() => {
  const t = fs.readFileSync(path.join(WURZEL, 'packages/ui/src/koerperkarte-pfade.ts'), 'utf8')
  const blok = t.slice(t.indexOf('export const MUSKELN'), t.indexOf('export const UMRISS_VORNE'))
  // `[cmd]` **VIER Leerzeichen, nicht zwei** - die erste Fassung
  // dieser Probe zaehlte 0 Flaechen und haette gemeldet, die Karte
  // sei leer. **Eine Suche wird am bekannten Fall geeicht.**
  const re = /\n {4}'?([a-z_-]+)'?:\s*\{/g
  const aus = []
  let m
  while ((m = re.exec(blok)) !== null) aus.push(m[1])
  if (aus.length === 0) throw new Error('Karte: 0 Flaechen geparst — das Muster passt nicht.')
  return aus
})()

const codes = new Set(zeilen.map(z => z.code))
console.log(`\n=== Karte gegen Tabelle ===\n`)
console.log(`Karte: ${KARTE.length} Flaechen`)
const fehlt = KARTE.filter(k => !codes.has(k))
console.log(`nur in der Karte (${fehlt.length}): ${fehlt.join(', ') || '—'}`)
const nurTabelle = [...codes].filter(c => !KARTE.includes(c))
console.log(`nur in der Tabelle (${nurTabelle.length}): ${nurTabelle.join(', ')}`)

// ── Gibt es die Flaechen, die Teil 1 verlangt? ──────────────────
//
// `[cmd]` **Der Auftrag sagt: "je Flaeche eine koerperflaechen.id".**
// **Also wird gefragt, ob es sie gibt** - bevor gebaut wird.
console.log('\n=== Die Flaechen der Teil-1-Aufteilung ===\n')
for (const g of ['latissimus', 'teres_major', 'teres_minor', 'erector_spinae',
  'flanke', 'teres-major', 'teres-minor', 'erector-spinae', 'rhomboids',
  'soleus', 'obliquus_internus', 'obliquus-internus']) {
  const t = zeilen.find(z => z.code === g)
  console.log(`  ${g.padEnd(20)} ${t ? 'DA' : 'FEHLT'}`)
}
console.log('\n=== Was die Ruecken-Flaechen heute tragen ===\n')
for (const d of zeilen.filter(x => /back|trapez/.test(x.code))) {
  console.log(`  ${d.code.padEnd(16)} de=${String(d.name_de).padEnd(24)}`
    + ` en=${String(d.name_en).padEnd(22)} seite=${d.seite ?? '–'}`)
}

// ── Woran haengen die Ruecken-Flaechen in training.muscle_groups? ─
//
// `[read]` **Die Muskeln der Aufteilung gibt es** - aber als
// `muscle_groups`, nicht als `koerperflaechen`. **Die Frage ist,
// ob die Verbindung schon steht.**
const t = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SERVICE_ROLE,
  { auth: { persistSession: false } }).schema('training')
const { data: mg, error: mgF } = await t
  .from('muscle_groups').select('id,name,parent_id')
if (mgF) { console.log('\nmuscle_groups FEHLER:', mgF.message) }
else {
  const mgId = new Map(mg.map(g => [g.id, g]))
  console.log(`\n=== training.muscle_groups: ${mg.length} Zeilen ===\n`)
  for (const d of zeilen.filter(x => /back|trapez|obliques/.test(x.code) && !/-[lr]$/.test(x.code))) {
    const g = d.muscle_group_id ? mgId.get(d.muscle_group_id) : null
    const kinder = g ? mg.filter(k => k.parent_id === g.id) : []
    console.log(`  ${d.code.padEnd(14)} -> muscle_group "${g?.name ?? '–'}"`)
    console.log(`     Kinder dort: ${kinder.map(k => k.name).join(', ') || '—'}`)
  }
  // Und: gibt es die gesuchten Muskeln dort?
  console.log('\n=== Die gesuchten Muskeln in muscle_groups ===\n')
  for (const n of ['Latissimus dorsi', 'Teres major', 'Teres minor',
    'Erector spinae', 'Rhomboids', 'Soleus', 'Internal oblique']) {
    const g = mg.find(x => x.name.toLowerCase() === n.toLowerCase())
    const el = g?.parent_id ? mgId.get(g.parent_id) : null
    console.log(`  ${n.padEnd(18)} ${g ? `DA (Elternteil: ${el?.name ?? '—'})` : 'FEHLT'}`)
  }
}

// ── A3: kann die Tabelle MUSKEL_ZU_FLAECHE ersetzen? ────────────
//
// `[read]` **Die entscheidende Frage von Teil 2.** `[cmd]` **96
// Muskelnamen zeigen heute auf 23 Flaechen - liefert der Weg
// `muscle_groups -> koerperflaechen.muscle_group_id` dasselbe?**
if (!mgF) {
  const mgId2 = new Map(mg.map(g => [g.id, g]))
  // Je koerperflaeche: welche muscle_group haengt dran?
  const flaecheVonMg = new Map()
  for (const z of zeilen) {
    if (z.muscle_group_id) flaecheVonMg.set(z.muscle_group_id, z.code)
  }
  // Und jeder Muskel erbt die Flaeche seines naechsten Vorfahren.
  function flaecheFuer(g) {
    let k = g, tiefe = 0
    while (k && tiefe < 10) {
      if (flaecheVonMg.has(k.id)) return flaecheVonMg.get(k.id)
      k = k.parent_id ? mgId2.get(k.parent_id) : null
      tiefe += 1
    }
    return null
  }
  let mit = 0, ohne = []
  for (const g of mg) {
    const f = flaecheFuer(g)
    if (f) mit += 1; else ohne.push(g.name)
  }
  console.log(`\n=== A3: Muskel -> Flaeche ueber die Tabelle ===\n`)
  console.log(`  ${mg.length} muscle_groups`)
  console.log(`  ${mit} erreichen eine koerperflaeche`)
  console.log(`  ${ohne.length} nicht: ${ohne.slice(0, 25).join(', ')}${ohne.length > 25 ? ' …' : ''}`)
}

// ── Die Gegenprobe zu A3: was GENAU ginge verloren? ─────────────
//
// `[read]` **Eine Umstellung auf eine Quelle, die weniger traegt,
// ist ein Verlust - auch wenn sie "eine Quelle" ist.**
if (!mgF) {
  const hand = fs.readFileSync(path.join(WURZEL,
    'apps/web/src/app/v2/recovery/muskel-ebenen.ts'), 'utf8')
  const blockHand = hand.slice(hand.indexOf('MUSKEL_ZU_FLAECHE'), hand.indexOf('OHNE_FARBE'))
  const re2 = /^\s*'?([A-Za-z][A-Za-z ]*?)'?:\s*'([a-z-]+)',/gm
  const vonHand = {}
  let m2
  while ((m2 = re2.exec(blockHand)) !== null) vonHand[m2[1]] = m2[2]
  console.log(`\n=== Handliste gegen Tabelle ===\n`)
  console.log(`  muskel-ebenen.ts fuehrt ${Object.keys(vonHand).length} Namen`)
  const mgId3 = new Map(mg.map(g => [g.id, g]))
  const flaecheVonMg2 = new Map()
  for (const z of zeilen) if (z.muscle_group_id) flaecheVonMg2.set(z.muscle_group_id, z.code)
  function ff(g) {
    let k = g, t = 0
    while (k && t < 10) {
      if (flaecheVonMg2.has(k.id)) return flaecheVonMg2.get(k.id)
      k = k.parent_id ? mgId3.get(k.parent_id) : null; t += 1
    }
    return null
  }
  const verloren = []
  for (const [name, flaeche] of Object.entries(vonHand)) {
    const g = mg.find(x => x.name.toLowerCase() === name.toLowerCase())
    const ausTabelle = g ? ff(g) : null
    if (!ausTabelle) verloren.push(`${name} (heute -> ${flaeche})`)
  }
  console.log(`  davon ueber die Tabelle NICHT erreichbar: ${verloren.length}`)
  for (const v of verloren) console.log(`    ${v}`)
}

// ── Darf ein ANGEMELDETER Nutzer die Tabelle lesen? ─────────────
//
// `[cmd]` **Die Messungen oben laufen mit dem Service-Schluessel** -
// der sieht alles. **Die Anwendung liest mit der Nutzeridentitaet.**
const anon = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } })
const { data: aData, error: aErr, count: aCount } = await anon
  .from('koerperflaechen').select('code', { count: 'exact' }).limit(3)
console.log('\n=== Leserecht mit dem anon-Schluessel ===\n')
console.log(`  Fehler: ${aErr ? aErr.message : 'keiner'}`)
console.log(`  Zeilen: ${aCount ?? (aData?.length ?? 0)}`)
