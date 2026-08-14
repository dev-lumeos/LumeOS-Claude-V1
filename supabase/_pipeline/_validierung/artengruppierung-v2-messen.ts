#!/usr/bin/env node
// SCHRITT 3+4+5 von C-33: Die Gruppierung neu bilden und DIESELBE
// Messung wie in C-28 wiederholen.
//
// NEUE GRUPPE = vier Stellen PLUS Erzeugnisklasse.
// `[cmd]` Aprikose (F201100) und Aprikosensaft (F201600) trennen sich,
// Lachs roh (T410100) und Lachs geraeuchert (T410600) bleiben zusammen.
//
// Die Messung ist UNVERAENDERT uebernommen aus
// arten-gruppierung-messen.ts: gleiche Stichprobenregel (jede n-te
// Gruppe, deterministisch), gleiches Einheitlichkeitsmerkmal, gleiche
// Abnahme (95 von 100). preparation_kinds wird NICHT weiter ergaenzt,
// die Zusatzliste NICHT erweitert — sonst misst der Vergleich die
// Regelaenderung statt die Gruppierung.
//
// AUFRUF: pnpm exec tsx supabase/_pipeline/_validierung/artengruppierung-v2-messen.ts
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'

const C = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const SEP = ''

function sql(text: string): string[][] {
  return execFileSync('docker',
    ['exec', C, 'psql', '-U', 'postgres', '-d', DB, '-t', '-A', '-F', SEP, '-c', text],
    { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
    .split('\n').map(z => z.trimEnd()).filter(Boolean).map(z => z.split(SEP))
}

// ---- Die Klassifikation aus der Datendatei, nicht aus Code ----
const KLASS = JSON.parse(
  fs.readFileSync('supabase/_pipeline/daten/zubereitungsschluessel.json', 'utf8'))
const klasseVon = new Map<string, string>()
for (const z of KLASS.zellen) klasseVon.set(z.warengruppe + z.code, z.klasse)

type Eintrag = { kuerzel: string; zub: string; code: string; name: string; gewicht: number; wg: string }
const roh = sql(`
  SELECT left(bls_code,4), substr(bls_code,5,3), bls_code,
         replace(coalesce(name_de,''), chr(1), ' '), coalesce(sort_weight,0)::text,
         left(bls_code,1)
  FROM nutrition.foods ORDER BY bls_code;`)
const eintraege: Eintrag[] = roh.map(r => ({
  kuerzel: r[0], zub: r[1], code: r[2], name: r[3], gewicht: Number(r[4]), wg: r[5],
}))

/**
 * Der Gruppenschluessel der NEUEN Gruppierung.
 *
 * Vier Stellen, plus die Erzeugnisklasse, falls die Zelle als
 * `erzeugnis` eingestuft ist. `[cmd]` F201 wird damit zu "F201" fuer
 * Aprikose roh/getrocknet und zu "F201/600" fuer den Aprikosensaft.
 *
 * Zellen mit `zubereitung`, `ungeklaert` oder ohne Eintrag bleiben beim
 * blossen Kuerzel — die Regel greift NUR dort, wo ein Erzeugnis belegt
 * ist. Alles andere waere geraten.
 */
function gruppenschluessel(e: Eintrag): string {
  const k = klasseVon.get(e.wg + e.zub)
  return k === 'erzeugnis' ? `${e.kuerzel}/${e.zub}` : e.kuerzel
}

const alt = new Map<string, Eintrag[]>()
const neu = new Map<string, Eintrag[]>()
for (const e of eintraege) {
  const a = alt.get(e.kuerzel); if (a) a.push(e); else alt.set(e.kuerzel, [e])
  const s = gruppenschluessel(e)
  const n = neu.get(s); if (n) n.push(e); else neu.set(s, [e])
}

// ---- Das Einheitlichkeitsmerkmal, UNVERAENDERT aus C-28 ----
const muster = sql(`SELECT code, name_pattern FROM nutrition.preparation_kinds
                    WHERE name_pattern IS NOT NULL ORDER BY sort_order;`)
const regeln = muster.map(([, pat]) =>
  new RegExp(pat.replace(/\\m/g, '\\b').replace(/\\M/g, '\\b'), 'g'))
const ZUSATZ = [
  /\bohne fett\b/g, /\bmit fett\b/g, /\bpfanne\b/g, /\bofen\b/g,
  /\bgezuckert\b/g, /\bungezuckert\b/g, /\bmariniert\b/g, /\bpaniert\b/g,
  /\bmehliert\b/g, /\babgetropft\b/g, /\bkuechenfertig\b/g, /\bgesalzen\b/g,
  /\breif\b/g, /\bunreif\b/g, /\bfrittiert\b/g, /\bpochiert\b/g,
  /\bgegart\b/g, /\bgedaempft\b/g, /\bdruckgedaempft\b/g, /\bblanchiert\b/g,
]
const falte = (s: string) => s.toLowerCase()
  .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  .replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()
function artkern(name: string): string {
  let s = falte(name.split(',')[0])
  for (const r of regeln) s = s.replace(r, ' ')
  for (const r of ZUSATZ) s = s.replace(r, ' ')
  return s.replace(/\s+/g, ' ').trim()
}

/** Stichprobe: jede n-te Gruppe mit >=2 Eintraegen, nach Schluessel sortiert. */
function stichprobe(m: Map<string, Eintrag[]>, nurNichtGerichte = false) {
  let alleG = [...m.entries()].filter(([, v]) => v.length >= 2)
  if (nurNichtGerichte) alleG = alleG.filter(([k]) => !['X', 'Y'].includes(k[0]))
  alleG.sort((a, b) => a[0].localeCompare(b[0]))
  const schritt = Math.floor(alleG.length / 100)
  const probe = schritt < 1 ? alleG.slice(0, 100)
    : Array.from({ length: 100 }, (_, i) => alleG[i * schritt]).filter(Boolean)
  let ok = 0
  const schlecht: Array<[string, Eintrag[], string[]]> = []
  for (const [k, liste] of probe) {
    const kerne = [...new Set(liste.map(e => artkern(e.name)))]
    if (kerne.length === 1) ok++; else schlecht.push([k, liste, kerne])
  }
  return { grundmenge: alleG.length, probe: probe.length, ok, schlecht }
}

console.log('=============================================================')
console.log('SCHRITT 3 — Neue Gruppierung, dieselbe Messung')
console.log('=============================================================')
console.log('')
console.log(`Gruppen alt (nur vier Stellen)     : ${alt.size}`)
console.log(`Gruppen neu (+ Erzeugnisklasse)    : ${neu.size}`)
console.log(`durch Erzeugnisklasse abgespalten  : ${neu.size - alt.size}`)
console.log('')

const mAlt = stichprobe(alt)
const mNeu = stichprobe(neu)
const mNeuOhne = stichprobe(neu, true)

console.log('                              Grundmenge  Stichprobe  einheitlich')
console.log('-'.repeat(66))
console.log(`  alt  (C-28, vier Stellen)   ${String(mAlt.grundmenge).padStart(10)}  ${String(mAlt.probe).padStart(10)}  ${String(mAlt.ok).padStart(11)}`)
console.log(`  neu  (+ Erzeugnisklasse)    ${String(mNeu.grundmenge).padStart(10)}  ${String(mNeu.probe).padStart(10)}  ${String(mNeu.ok).padStart(11)}`)
console.log(`  neu, ohne Gerichte (X/Y)    ${String(mNeuOhne.grundmenge).padStart(10)}  ${String(mNeuOhne.probe).padStart(10)}  ${String(mNeuOhne.ok).padStart(11)}`)
console.log('')
console.log(`  Abnahme (>=95): ${mNeu.ok >= 95 ? 'ERREICHT' : 'NICHT ERREICHT'}`)
console.log('')

// =============================================================
// SCHRITT 4 — Was loest die neue Gruppierung von den echten Mischungen?
// =============================================================
// Die 50 echten Mischungen aus 48-… sind die Gruppen, deren Kerne sich
// nicht als Praefix ineinander schieben lassen. Hier wird geprueft, wie
// viele davon jetzt zerfallen.
console.log('=============================================================')
console.log('SCHRITT 4 — Die echten Mischungen aus C-28')
console.log('=============================================================')
console.log('')

const altProbe = (() => {
  const alleG = [...alt.entries()].filter(([, v]) => v.length >= 2)
    .sort((a, b) => a[0].localeCompare(b[0]))
  const schritt = Math.floor(alleG.length / 100)
  return Array.from({ length: 100 }, (_, i) => alleG[i * schritt]).filter(Boolean)
})()

const echteMischungen: Array<[string, Eintrag[]]> = []
for (const [k, liste] of altProbe) {
  const kerne = [...new Set(liste.map(e => artkern(e.name)))]
  if (kerne.length === 1) continue
  const sortiert = [...kerne].sort((a, b) => a.length - b.length)
  if (sortiert.every(x => x.startsWith(sortiert[0]))) continue   // Praefix = Massstab
  echteMischungen.push([k, liste])
}

let geloest = 0
const ungeloest: Array<[string, Eintrag[]]> = []
for (const [k, liste] of echteMischungen) {
  // Zerfaellt die Gruppe jetzt, UND ist jeder Teil fuer sich einheitlich?
  const teile = new Map<string, Eintrag[]>()
  for (const e of liste) {
    const s = gruppenschluessel(e)
    const t = teile.get(s); if (t) t.push(e); else teile.set(s, [e])
  }
  const alleEinheitlich = [...teile.values()]
    .every(t => new Set(t.map(e => artkern(e.name))).size === 1)
  if (teile.size > 1 && alleEinheitlich) geloest++
  else ungeloest.push([k, liste])
}

console.log(`  echte Mischungen in der Stichprobe : ${echteMischungen.length}`)
console.log(`  davon durch die neue Regel geloest : ${geloest}`)
console.log(`  weiterhin ungeloest                : ${ungeloest.length}`)
console.log('')
console.log('  Die ungeloesten einzeln — das ist Kuration, kein Fehler der Regel:')
for (const [k, liste] of ungeloest) {
  console.log(`    ${k}`)
  for (const e of liste) console.log(`        ${e.code}  ${e.name}`)
}
console.log('')

// =============================================================
// SCHRITT 5 — Vertreter, dritter Fall
// =============================================================
console.log('=============================================================')
console.log('SCHRITT 5 — Vertreter mit drittem Fall')
console.log('=============================================================')
console.log('')

function vertreter(m: Map<string, Eintrag[]>, mitDrittem: boolean) {
  let eindeutig = 0, mehrere = 0, ohne = 0
  for (const [, liste] of m) {
    let kandidaten = liste.filter(e => e.zub === '100' || e.zub === '000')
    if (!kandidaten.length) {
      if (!mitDrittem) { ohne++; continue }
      kandidaten = liste                      // dritter Fall: die ganze Gruppe
    }
    const max = Math.max(...kandidaten.map(k => k.gewicht))
    const spitze = kandidaten.filter(k => k.gewicht === max)
    if (spitze.length === 1) eindeutig++; else mehrere++
  }
  return { eindeutig, mehrere, ohne }
}

for (const [titel, m] of [['alte Gruppierung', alt], ['neue Gruppierung', neu]] as const) {
  const a = vertreter(m, false)
  const b = vertreter(m, true)
  console.log(`  ${titel} (${m.size} Gruppen)`)
  console.log(`    ohne dritten Fall : eindeutig ${a.eindeutig}, mehrere ${a.mehrere}, ohne ${a.ohne}`)
  console.log(`    mit drittem Fall  : eindeutig ${b.eindeutig}, mehrere ${b.mehrere}, ohne ${b.ohne}`)
}
