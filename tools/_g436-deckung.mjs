// G-436 - welcher Baumknoten kann ueberhaupt einen Wert tragen?
//
// ══ DIE FRAGE VOR DEM BAUEN ═════════════════════════════════════
//
// **Tom:** *„drei zustaende, nicht zwei"* - Wert / `--` / grau.
// `[cmd]` **Also muss VORHER feststehen, wieviele Knoten in welchen
// Zustand fallen** - sonst baue ich eine Ansicht, die zu 90 %
// Striche zeigt, und merke es am Schirm.
//
// `[read]` **Die Lehre `umfang-messen-bevor-man-baut`.**
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

// ── 1. Der Baum ────────────────────────────────────────────────
const { data: knoten, error } = await s.schema('training')
  .from('muscle_groups').select('id,name,parent_id')
if (error) { console.log('FEHLER:', error.message); process.exit(1) }

const kinderVon = {}
for (const k of knoten) (kinderVon[k.parent_id ?? '_'] ??= []).push(k)
const blatt = knoten.filter(k => !kinderVon[k.id])
console.log(`\n=== training.muscle_groups ===\n`)
console.log(`  Knoten gesamt   ${knoten.length}`)
console.log(`  Blaetter        ${blatt.length}`)
console.log(`  mit Kindern     ${knoten.length - blatt.length}`)

// Tiefe je Knoten
const tiefe = {}
function setzeTiefe(k, t) {
  tiefe[k.id] = t
  for (const c of kinderVon[k.id] ?? []) setzeTiefe(c, t + 1)
}
for (const w of kinderVon['_'] ?? []) setzeTiefe(w, 1)
const proTiefe = {}
for (const k of knoten) proTiefe[tiefe[k.id] ?? '?'] = (proTiefe[tiefe[k.id] ?? '?'] ?? 0) + 1
console.log(`  je Ebene        ${JSON.stringify(proTiefe)}`)

// ── 2. Was zeichnet die Karte? ──────────────────────────────────
//
// `[cmd]` **`EBENEN` nennt je Flaeche den Muskel, den sie WIRKLICH
// zeigt** - nicht `MUSKEL_ZU_FLAECHE` (die Lehre aus G-432).
const ebenenRoh = fs.readFileSync(
  path.join(WURZEL, 'apps/web/src/lib/koerper/ebenen.ts'), 'utf8')
const gezeichnet = new Set()
for (const m of ebenenRoh.matchAll(/name:\s*'([^']+)'/g)) {
  gezeichnet.add(m[1].toLowerCase())
}
console.log(`\n  gezeichnet (ebenen.ts)  ${gezeichnet.size} Namen`)

// ── 3. Wer hat ein VOLUMEN? ─────────────────────────────────────
//
// `[read]` **Der Auftrag nennt die Zahlen** - 6.588 Zuordnungen,
// davon 2.152 auf Blattebene. `[cmd]` **Nachgezaehlt**, nicht
// geglaubt (`auftragszahl-selbst-nachzaehlen`).
// `[cmd]` **PostgREST deckelt bei 1.000** — die erste Fassung las
// genau 1000 und meldete 301/525/174. `[read]` **Blattweise holen,
// sonst zaehlt man den Deckel.**
const zuord = []
for (let von = 0; ; von += 1000) {
  const t = await s.schema('training')
    .from('exercise_muscles').select('muscle_group_id').range(von, von + 999)
  if (t.error) { console.log('FEHLER:', t.error.message); break }
  zuord.push(...t.data)
  if (t.data.length < 1000) break
}
const zErr = null
if (zErr) {
  console.log(`\n  exercise_muscles: ${zErr.message}`)
} else {
  const mitVolumen = new Set(zuord.map(z => z.muscle_group_id))
  console.log(`\n=== training.exercise_muscles ===\n`)
  console.log(`  Zuordnungen     ${zuord.length}   (Auftrag nennt 6.588)`)
  console.log(`  verschiedene Muskelgruppen  ${mitVolumen.size}`)
  const nachEbene = { blatt: 0, gruppe: 0, wurzel: 0 }
  for (const z of zuord) {
    const k = knoten.find(x => x.id === z.muscle_group_id)
    if (!k) continue
    if (!k.parent_id) nachEbene.wurzel += 1
    else if (kinderVon[k.id]) nachEbene.gruppe += 1
    else nachEbene.blatt += 1
  }
  console.log(`    auf Blatt     ${nachEbene.blatt}   (Auftrag nennt 2.152)`)
  console.log(`    auf Gruppe    ${nachEbene.gruppe}   (Auftrag nennt 3.331)`)
  console.log(`    auf Wurzel    ${nachEbene.wurzel}   (Auftrag nennt 1.105)`)

  // ══ DIE ENTSCHEIDENDE ZAHL ════════════════════════════════════
  //
  // `[read]` **Ein Muskel ohne Volumenzuordnung KANN keinen Wert
  // haben** - das steht im Auftrag. **Wieviele sind das?**
  console.log(`\n=== die drei Zustaende, VORHER gezaehlt ===\n`)
  let mitWert = 0, ohneVolumen = 0, nichtGez = 0
  for (const k of knoten) {
    const gez = gezeichnet.has(k.name.toLowerCase())
    const vol = mitVolumen.has(k.id)
    if (!gez) nichtGez += 1
    else if (!vol) ohneVolumen += 1
    else mitWert += 1
  }
  console.log(`  gezeichnet UND Volumen    ${mitWert}`)
  console.log(`  gezeichnet, kein Volumen  ${ohneVolumen}   -> „--"`)
  console.log(`  nicht gezeichnet          ${nichtGez}   -> grau`)
}

// ── 4. Die Bruecke zur Karte ────────────────────────────────────
//
// **A6:** *„Klick auf Karte und in Liste zeigen dasselbe."*
const { data: fl, error: fErr } = await s
  .from('koerperflaechen').select('code,muscle_group_id,art')
if (!fErr) {
  const mitBruecke = fl.filter(f => f.muscle_group_id)
  console.log(`\n=== die Bruecke koerperflaechen -> muscle_groups ===\n`)
  console.log(`  Flaechen gesamt            ${fl.length}`)
  console.log(`  davon mit muscle_group_id  ${mitBruecke.length}`)
  const ohne = fl.filter(f => !f.muscle_group_id && f.art !== 'wurzel' && f.art !== 'umriss')
  console.log(`  ohne Bruecke (ohne Wurzel/Umriss)  ${ohne.length}`)
  if (ohne.length) console.log(`    ${ohne.map(f => f.code).slice(0, 10).join(', ')}`)
}

// ── 5. Was rechnet die Kachel WIRKLICH? ─────────────────────────
//
// `[read]` **`exercise_muscles` sagt, welche Uebung welchen Muskel
// trifft** - das ist NICHT die Quelle des Prozentwerts. **Die
// Kachel rechnet aus `MUSCLE_STATE`** (Entwurf, 18 Kuerzel).
// `[cmd]` **Also ist die Frage: welcher Baumknoten faellt auf eines
// der 18 Kuerzel?**
const motor = fs.readFileSync(
  path.join(WURZEL, 'apps/web/src/app/v2/recovery/motor.ts'), 'utf8')
const kuerzel = [...(/MUSCLE_GROUPS_BODYMAP = \[([\s\S]*?)\]/.exec(motor)?.[1] ?? '')
  .matchAll(/'([^']+)'/g)].map(m => m[1])
const mitStand = [...(/MUSCLE_STATE: Record<string, MuscleState> = \{([\s\S]*?)\n\}/.exec(motor)?.[1] ?? '')
  .matchAll(/^\s{2}(\w+):/gm)].map(m => m[1])
console.log(`\n=== die WIRKLICHE Wertquelle ===\n`)
console.log(`  MUSCLE_GROUPS_BODYMAP   ${kuerzel.length} Kuerzel`)
console.log(`  MUSCLE_STATE            ${mitStand.length} davon mit Entwurfswert`)
const ohneStand = kuerzel.filter(k => !mitStand.includes(k))
console.log(`  ohne Entwurfswert       ${ohneStand.length}: ${ohneStand.join(', ')}`)

// Welche Flaeche faellt auf welches Kuerzel? -> KARTE_ZU_RECOVERY
const zuo = fs.readFileSync(
  path.join(WURZEL, 'apps/web/src/app/v2/recovery/muskel-zuordnung.ts'), 'utf8')
const karteZu = {}
for (const m of (/KARTE_ZU_RECOVERY[^=]*=\s*\{([\s\S]*?)\n\}/.exec(zuo)?.[1] ?? '')
  .matchAll(/'([^']+)':\s*'([^']+)'/g)) karteZu[m[1]] = m[2]
console.log(`\n  KARTE_ZU_RECOVERY       ${Object.keys(karteZu).length} Flaechen -> Kuerzel`)

// ══ Die Zahl, die die Ansicht bestimmt ════════════════════════
let wert = 0, strich = 0, grau = 0
const beispiele = { wert: [], strich: [], grau: [] }
for (const k of knoten) {
  const code = [...Object.entries(JSON.parse(JSON.stringify(
    Object.fromEntries([...ebenenRoh.matchAll(/'([^']+)':\s*\{[^}]*?name:\s*'([^']+)'/g)]
      .map(m => [m[2].toLowerCase(), m[1]])))))]
    .find(([n]) => n === k.name.toLowerCase())?.[1]
  if (!code) { grau += 1; if (beispiele.grau.length < 3) beispiele.grau.push(k.name); continue }
  const slug = karteZu[code]
  if (slug && mitStand.includes(slug)) {
    wert += 1; if (beispiele.wert.length < 3) beispiele.wert.push(`${k.name} (${slug})`)
  } else {
    strich += 1; if (beispiele.strich.length < 3) beispiele.strich.push(`${k.name} (${code})`)
  }
}
console.log(`\n=== die drei Zustaende NACH DER WERTQUELLE ===\n`)
console.log(`  Wert       ${wert}   ${beispiele.wert.join(', ')}`)
console.log(`  „--"       ${strich}   ${beispiele.strich.join(', ')}`)
console.log(`  grau       ${grau}   ${beispiele.grau.join(', ')}`)
