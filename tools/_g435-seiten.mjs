// G-435/A3 - wo liest die Oberflaeche eine SEITENZEILE?
//
// ══ WAS C-483 AENDERT ═══════════════════════════════════════════════
//
// **Tom (C-483):** `parent_id` **fuer die Tiefe,** `art` **fuer die
// Bedeutung,** `seite` **als EIGENSCHAFT am Messwert.**
//
// `[read]` **Heute traegt `public.koerperflaechen` die Seite als
// EIGENE ZEILE** - `latissimus-l`, `latissimus-r`. **Nach dem Umbau
// gibt es den Latissimus EINMAL, und die Seite steht am Messwert.**
//
// `[cmd]` **Also wird gemessen, wo die Oberflaeche heute eine
// Seitenzeile liest** - jede Stelle muss danach Flaeche + Seite
// fuehren.
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

// ── 1. Was traegt die Tabelle heute? ────────────────────────────
const { data: zeilen, error } = await s
  .from('koerperflaechen').select('code,parent_id,ebene,seite,art')
if (error) { console.log('FEHLER:', error.message); process.exit(1) }

const mitSeite = zeilen.filter(z => z.seite)
const ohneSeite = zeilen.filter(z => !z.seite)
console.log(`\n=== public.koerperflaechen: ${zeilen.length} Zeilen ===\n`)
console.log(`  MIT seite (eigene Zeile):  ${mitSeite.length}`)
console.log(`  ohne seite:                ${ohneSeite.length}`)
const proSeite = {}
for (const z of mitSeite) (proSeite[z.seite] ??= []).push(z.code)
for (const [k, v] of Object.entries(proSeite)) {
  console.log(`    ${k.padEnd(8)} ${v.length}: ${v.slice(0, 5).join(', ')}${v.length > 5 ? ' …' : ''}`)
}

// ── 2. Wer liest sie in der Oberflaeche? ────────────────────────
//
// `[read]` **Gesucht wird die WIRKUNG, nicht das Wort** - also
// Stellen, die einen Code mit `-l`/`-r` bilden oder vergleichen.
const MUSTER = [
  ['Code mit -l/-r gebildet', /['"`]\$\{[^}]+\}-(l|r)['"`]|\+\s*['"`]-(l|r)['"`]/],
  ['Code auf -l/-r geprueft', /-(l|r)['"`]\s*(\)|,|\}|===)|\/-\(l\|r\)\$\//],
  ['seite als Feld gelesen', /\.seite\b|seite:\s*['"]links|seite:\s*['"]rechts/],
  ['Seitenwort im Code', /['"](links|rechts)['"]/],
]

function dateien(dir, aus = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.next') continue
      dateien(p, aus)
    } else if (/\.(ts|tsx)$/.test(e.name)) aus.push(p)
  }
  return aus
}

const treffer = []
for (const f of [
  ...dateien(path.join(WURZEL, 'apps/web/src')),
  ...dateien(path.join(WURZEL, 'packages/ui/src')),
]) {
  const inhalt = fs.readFileSync(f, 'utf8')
  const zeilenListe = inhalt.split('\n')
  for (const [was, re] of MUSTER) {
    zeilenListe.forEach((z, i) => {
      // Kommentarzeilen weg - sonst faende die Suche ihre eigene
      // Begruendung (die Lehre aus G-389).
      const t = z.trim()
      if (t.startsWith('//') || t.startsWith('*')) return
      if (re.test(z)) {
        treffer.push({
          datei: path.relative(WURZEL, f).replace(/\\/g, '/'),
          zeile: i + 1, was, text: z.trim().slice(0, 88),
        })
      }
    })
  }
}

console.log(`\n\n=== ${treffer.length} Stellen in der Oberflaeche ===\n`)
const proDatei = {}
for (const t of treffer) (proDatei[t.datei] ??= []).push(t)
for (const [datei, ts] of Object.entries(proDatei).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n  ${datei}  (${ts.length})`)
  for (const t of ts.slice(0, 6)) {
    console.log(`    :${String(t.zeile).padStart(4)}  ${t.was}`)
    console.log(`           ${t.text}`)
  }
  if (ts.length > 6) console.log(`    … und ${ts.length - 6} weitere`)
}

// ── 3. A4: was braucht die Oberflaeche nach dem Umbau? ──────────
//
// `[read]` **Die entscheidende Frage** - und sie ist NICHT „wo steht
// `-l`", sondern „WOHER kommt die Seite".
console.log('\n\n=== A4: woher kommt die Seite HEUTE? ===\n')

const karte = fs.readFileSync(
  path.join(WURZEL, 'packages/ui/src/koerperkarte.tsx'), 'utf8')
const ausX = /ersterX % VB_W\) < VB_W \/ 2 \? 'links' : 'rechts'/.test(karte)
console.log(`  Karte rechnet die Seite aus der x-Lage des PFADES:  ${ausX}`)
console.log(`    packages/ui/src/koerperkarte.tsx:343-346`)
console.log(`    -> sie liest KEINE Seitenzeile aus koerperflaechen`)

const wertHatSeite = /seite\?: 'links' \| 'rechts'/.test(karte)
console.log(`\n  Der MESSWERT traegt die Seite schon heute:         ${wertHatSeite}`)
console.log(`    MuskelWert.seite?: 'links' | 'rechts'`)
console.log(`    -> genau die Form, die C-483 herstellt`)

// Liest irgendwer die Ebene-3-Zeilen?
const leser = []
for (const f of dateien(path.join(WURZEL, 'apps/web/src/lib/koerper'))) {
  if (f.includes('__tests__')) continue
  const i = fs.readFileSync(f, 'utf8')
  if (/ebene\s*===\s*3|'-l'|"-l"|\.endsWith\('-l'\)/.test(i)) {
    leser.push(path.relative(WURZEL, f))
  }
}
console.log(`\n  Leser der Ebene-3-Zeilen (koerperflaechen):        ${leser.length}`)
if (leser.length) for (const l of leser) console.log(`    ${l}`)
else console.log('    KEINER — die 34 Seitenzeilen werden nicht gelesen.')
