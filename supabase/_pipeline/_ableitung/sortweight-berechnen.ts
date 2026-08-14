#!/usr/bin/env node
// C-38: sort_weight nach der Spec-Formel berechnen.
//
// `[read]` Grundlage: SPEC_05_FOOD_TAXONOMY.md, Abschnitt "Sort Weight
// System". Die Spec ist DATENQUELLE, kein Sollwert — wo sie etwas
// voraussetzt, das der Bestand nicht hergibt, steht das im Bericht
// (docs/ssot/51-sortweight-formel.md), nicht stillschweigend geloest.
//
// DIESES SKRIPT SCHREIBT NICHT. Es berechnet und legt das Ergebnis in
// einer TEMPORAEREN Tabelle ab (nutrition._sortweight_neu), damit
// verglichen werden kann. Kein UPDATE auf nutrition.foods.
//
// AUFRUF:
//   pnpm exec tsx supabase/_pipeline/_ableitung/sortweight-berechnen.ts
//   pnpm exec tsx supabase/_pipeline/_ableitung/sortweight-berechnen.ts --nur-rechnen
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

const F = JSON.parse(fs.readFileSync('supabase/_pipeline/daten/sortweight-formel.json', 'utf8'))
const CORE: Set<string> = new Set(
  Object.keys(F.core_liste).filter(k => !k.startsWith('_')))

const falte = (s: string) => s.toLowerCase()
  .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  .replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()

// ---- Grundmenge samt Naehrwerten ----
// Fehlende Naehrwerte kommen als NULL herein und werden NICHT zu 0:
// ein fehlender Wert darf keinen Bonus ausloesen.
const roh = sql(`
  SELECT f.bls_code,
         replace(coalesce(f.name_de,''), chr(1), ' '),
         coalesce(f.sort_weight,0)::text,
         coalesce(n.prot::text,''), coalesce(n.fat::text,''),
         coalesce(n.fibt::text,''), coalesce(n.n3::text,'')
  FROM nutrition.foods f
  LEFT JOIN LATERAL (
    SELECT MAX(value) FILTER (WHERE nutrient_code='PROT625') AS prot,
           MAX(value) FILTER (WHERE nutrient_code='FAT')     AS fat,
           MAX(value) FILTER (WHERE nutrient_code='FIBT')    AS fibt,
           MAX(value) FILTER (WHERE nutrient_code='FAPUN3')  AS n3
    FROM nutrition.food_nutrients fn WHERE fn.food_id = f.id
  ) n ON TRUE
  ORDER BY f.bls_code;`)

type Food = {
  code: string; name: string; alt: number
  prot: number | null; fat: number | null; fibt: number | null; n3: number | null
  wg: string; zub: string; gefaltet: string
}

const zahl = (s: string) => (s === '' ? null : Number(s))

const foods: Food[] = roh.map(r => ({
  code: r[0], name: r[1], alt: Number(r[2]),
  prot: zahl(r[3]), fat: zahl(r[4]), fibt: zahl(r[5]), n3: zahl(r[6]),
  wg: r[0][0], zub: r[0].slice(4, 7), gefaltet: falte(r[1]),
}))

// ---- Wortlisten fuer die namensbasierten Regeln ----
// `[cmd]` NOETIG, weil der Bestand keine Tags dafuer hat: es gibt nur
// low_carb, low_fat, high_protein, high_fiber. Die Spec verlangt
// `offal tag` und `liver tag` — beide existieren nicht.
const INNEREI = /\b(herz|herzen|niere|nieren|magen|kutteln|bries|zunge|euter)\b/
// `[cmd]` OHNE Wortgrenze am Ende: deutsche Komposita verstecken das
// Merkmal. "Rind Leberhack, roh" bekam sonst +500 statt des
// Innereien-Abzugs, weil \bleber\b auf "leberhack" nicht passt.
const LEBER = /\bleber/
const LEBER_AUSNAHME = /\b(leberkaese|leberwurst|leberpastete|leberknoedel|leberterrine)\b/
const GEHIRN = /\b(hirn|gehirn|lunge|milz)\b/
const BLUT = /\bblut/
const FETTGEWEBE = /\bfettgewebe\b/
const KNOCHENMARK = /\bknochenmark\b/
// Wie bei U_FETT: nur wenn die Schwarte das Erzeugnis ist.
const SCHWARTE = /^[a-z]+ schwarte\b|\bschwarten\b(?! und)/
const LABOR = /\bs (i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)\b/
const GESUESST = /\b(gesuesst|gezuckert|dragiert|kandiert)\b/
const KONSERVE = /\bkonserve\b/
const SPECIALTY = /\b(hummer|kaviar|trueffel)\b/
const TEIGWAREN = /\b(teigwaren|nudeln|spaetzle)\b/
// `[cmd]` "schwarte" NUR wenn das Stueck die Schwarte IST, nicht wenn
// der Name sie bloss erwaehnt: 8 Eintraege heissen "(mit|ohne) Fett und
// Schwarte" und beschreiben ein Bratenstueck, kein Fettgewebe. Vier
// davon fielen sonst von 480 auf 0.
const U_FETT = /\b(fettgewebe|speck|flomen|wamme)\b|^[a-z]+ schwarte\b/
const V_INNEREI = /\b(leber|herz|magen|niere)\b/

type Beitrag = { name: string; wert: number }

function berechne(f: Food): { wert: number; basis: number; teile: Beitrag[] } {
  const teile: Beitrag[] = []

  // --- Basis nach Warengruppe, mit den drei Sonderfaellen der Spec ---
  let basis = F.basis_warengruppe[f.wg] ?? 400
  if (f.wg === 'E' && TEIGWAREN.test(f.gefaltet)) basis = 580
  else if (f.wg === 'U' && U_FETT.test(f.gefaltet)) basis = 100
  else if (f.wg === 'V' && V_INNEREI.test(f.gefaltet)) basis = 300

  // Grundform: Zubereitungscode 100 oder 000 — ABER der Name schlaegt
  // den Code. `[cmd]` 41 Eintraege tragen 000 und nennen im Namen eine
  // Zubereitung; "Schwein Schnitzel, paniert, gebraten ohne Fett"
  // (U952000) erreichte darueber die Obergrenze 1000. Der BLS benutzt
  // 000 sowohl fuer "einzige Form" als auch fuer "zubereitet, ohne
  // Variante" — der Code allein traegt die Unterscheidung nicht.
  const zubereitetLautName = /\b(gebraten|gekocht|gegrillt|paniert|geschmort|gebacken|frittiert|geduenstet|pochiert)\b/.test(f.gefaltet)
  // Zwei Begriffe, bewusst getrennt:
  //   grundformCode — was der BLS-Code sagt (100 oder 000)
  //   grundform     — dasselbe, aber der Name kann es widerlegen
  // whole_food haengt am CODE, weil die Warengruppe C/G/F/H/T dort
  // schon die Rohware kennzeichnet; der Grundform-Bonus haengt an der
  // strengeren Pruefung.
  const grundformCode = f.zub === '100' || f.zub === '000'
  const grundform = grundformCode && !zubereitetLautName

  // --- Zuschlaege ---
  if (CORE.has(f.code)) teile.push({ name: 'core_fitness', wert: 200 })
  if (f.prot !== null && f.prot >= 20) teile.push({ name: 'protein_20', wert: 80 })
  if (f.prot !== null && f.prot >= 30) teile.push({ name: 'protein_30', wert: 120 })
  if (f.prot !== null && f.fat !== null && f.prot >= 20 && f.fat <= 5) {
    teile.push({ name: 'lean_protein', wert: 50 })
  }
  if (f.n3 !== null && f.n3 >= 1) teile.push({ name: 'omega3_rich', wert: 40 })
  if (f.fibt !== null && f.fibt >= 6) teile.push({ name: 'high_fiber', wert: 30 })
  // FEHLER 2 der Spec, behoben 2026-08-16: der Bonus gilt auch fuer
  // Zubereitungscode 000.
  // `[read]` 44-bls-codestruktur.md: 000 heisst NICHT "roh", sondern
  // "keine Zubereitungsvariante" — Haferflocken, Skyr, Mozzarella,
  // Vollkornbrot, Olivenoel und Erdnussbutter tragen 000, weil sie
  // keine Rohform HABEN. nutrition.such_rang_zubereitung behandelt
  // beide seit Block 32 gleichrangig; Code schlaegt Spec.
  // `[cmd]` Der Beleg war die quinoa-Regression: beide Eintraege sind
  // roh, nur einer traegt 100, und der Bonus zog sie auseinander.
  if (grundformCode && ['C', 'G', 'F', 'H', 'T'].includes(f.wg)) {
    teile.push({ name: 'whole_food', wert: 60 })
  }
  if (SPECIALTY.test(f.gefaltet)) teile.push({ name: 'specialty', wert: 100 })

  // --- Zubereitung: NICHT aus der Spec, sondern aus Block 32 ---
  // Ohne diesen Zuschlag verliert die Rangfolge die Wirkung von
  // such_rang_zubereitung: "Banane roh" faellt hinter "Banane
  // getrocknet". Hoehe in Schritt 3 gemessen.
  if (grundform) teile.push({ name: 'grundform', wert: F.zubereitung.grundform_bonus })

  // --- Abzuege ---
  // ultra_processed entfaellt: `[cmd]` die Spalte ist durchgaengig 'raw'.
  //
  // FEHLER 1 der Spec, behoben 2026-08-16: die Abzuege
  // "Fertiggericht -300" (X/Y) und "Alkohol -300" (P) sind GESTRICHEN.
  // Doppelbestrafung — die Basis kodiert die Warengruppe bereits
  // (X 200, Y 240, P 180), der Abzug zog dieselbe Eigenschaft ein
  // zweites Mal ab. `[cmd]` Folge: alle 119 P-Eintraege auf 0 (eine
  // einzige Stufe), 1.114 von 1.165 X und 862 von 885 Y ebenfalls.
  // Innerhalb der Gerichte gab es damit keine Reihenfolge mehr.
  // Alle uebrigen Modifikatoren bleiben unveraendert.
  if (!grundform) teile.push({ name: 'zubereitet', wert: -150 })
  if (GESUESST.test(f.gefaltet)) teile.push({ name: 'gesuesst', wert: -100 })
  if (KONSERVE.test(f.gefaltet) && f.wg !== 'T') teile.push({ name: 'konserve', wert: -80 })
  if (INNEREI.test(f.gefaltet)) teile.push({ name: 'innereien', wert: -400 })
  if (LEBER.test(f.gefaltet) && !LEBER_AUSNAHME.test(f.gefaltet)) {
    teile.push({ name: 'leber', wert: -380 })
  }
  if (GEHIRN.test(f.gefaltet)) teile.push({ name: 'gehirn_lunge_milz', wert: -450 })
  if (BLUT.test(f.gefaltet)) teile.push({ name: 'blut', wert: -500 })
  if (FETTGEWEBE.test(f.gefaltet)) teile.push({ name: 'fettgewebe', wert: -500 })
  if (KNOCHENMARK.test(f.gefaltet)) teile.push({ name: 'knochenmark', wert: -450 })
  if (SCHWARTE.test(f.gefaltet)) teile.push({ name: 'schwarte', wert: -430 })
  if (LABOR.test(f.gefaltet)) teile.push({ name: 'laborschnitt', wert: -200 })
  // 'alkohol' (-300, Warengruppe P) gestrichen — siehe Fehler 1 oben.

  const summe = basis + teile.reduce((s, t) => s + t.wert, 0)
  return { wert: Math.max(0, Math.min(1000, summe)), basis, teile }
}

const ergebnis = foods.map(f => ({ f, ...berechne(f) }))

// ---- Ablage in einer TEMPORAEREN Tabelle, nicht in nutrition.foods ----
if (!process.argv.includes('--nur-rechnen')) {
  // Ueber eine Datei, nicht ueber die Befehlszeile: `[cmd]` 7.140 Werte
  // als ein INSERT sprengen die Laengengrenze von spawnSync
  // (ENAMETOOLONG).
  const tmp = 'supabase/_pipeline/daten/_sortweight-neu.tsv'
  fs.writeFileSync(tmp, ergebnis.map(e => `${e.f.code}\t${e.wert}`).join('\n') + '\n',
    { encoding: 'utf8' })
  execFileSync('docker', ['cp', tmp, `${C}:/tmp/sw.tsv`], { encoding: 'utf8' })
  // `\copy` statt `COPY`: `[cmd]` serverseitiges COPY verlangt die Rolle
  // pg_read_server_files, die postgres hier nicht hat. `\copy` laeuft
  // im Client und braucht sie nicht.
  const skript = 'supabase/_pipeline/daten/_sortweight-laden.sql'
  fs.writeFileSync(skript,
    `DROP TABLE IF EXISTS nutrition._sortweight_neu;\n` +
    `CREATE TABLE nutrition._sortweight_neu (bls_code text PRIMARY KEY, neu integer);\n` +
    `\\copy nutrition._sortweight_neu (bls_code, neu) FROM '/tmp/sw.tsv';\n`,
    { encoding: 'utf8' })
  execFileSync('docker', ['cp', skript, `${C}:/tmp/sw.sql`], { encoding: 'utf8' })
  execFileSync('docker',
    ['exec', C, 'psql', '-U', 'postgres', '-d', DB, '-q', '-v', 'ON_ERROR_STOP=1', '-f', '/tmp/sw.sql'],
    { encoding: 'utf8' })
  fs.unlinkSync(skript)
  const n = sql(`SELECT count(*) FROM nutrition._sortweight_neu;`)[0][0]
  fs.unlinkSync(tmp)
  console.log(`nutrition._sortweight_neu geschrieben: ${n} Zeilen (Hilfstabelle, kein UPDATE auf foods)`)
}

// ---- Kennzahlen ----
const alt = ergebnis.map(e => e.f.alt)
const neu = ergebnis.map(e => e.wert)
const distinct = (a: number[]) => new Set(a).size
const schnitt = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length

console.log('')
console.log('=============================================================')
console.log('C-38 — sort_weight nach der Spec-Formel')
console.log('=============================================================')
console.log('')
console.log(`  Eintraege               : ${foods.length}`)
console.log(`  verschiedene Werte alt  : ${distinct(alt)}`)
console.log(`  verschiedene Werte neu  : ${distinct(neu)}`)
console.log(`  Mittelwert alt / neu    : ${schnitt(alt).toFixed(0)} / ${schnitt(neu).toFixed(0)}`)
console.log(`  an der Obergrenze (1000): ${neu.filter(x => x === 1000).length}`)
console.log(`  an der Untergrenze (0)  : ${neu.filter(x => x === 0).length}`)
console.log(`  unveraendert            : ${ergebnis.filter(e => e.wert === e.f.alt).length}`)

// ---- Die groessten Verschiebungen ----
const bewegt = [...ergebnis].sort((a, b) => (b.wert - b.f.alt) - (a.wert - a.f.alt))
console.log('')
console.log('=== Die 20 groessten Anstiege ===')
for (const e of bewegt.slice(0, 20)) {
  console.log(`  ${String(e.f.alt).padStart(4)} -> ${String(e.wert).padStart(4)}  ` +
    `(${(e.wert - e.f.alt >= 0 ? '+' : '') + (e.wert - e.f.alt)})`.padEnd(8) +
    `${e.f.code}  ${e.f.name.slice(0, 52)}`)
}
console.log('')
console.log('=== Die 20 groessten Abstiege ===')
for (const e of bewegt.slice(-20).reverse()) {
  console.log(`  ${String(e.f.alt).padStart(4)} -> ${String(e.wert).padStart(4)}  ` +
    `(${e.wert - e.f.alt})`.padEnd(8) +
    `${e.f.code}  ${e.f.name.slice(0, 52)}`)
}

// ---- Die beiden Spec-Beispiele ----
console.log('')
console.log('=== Spec-Beispiel "Hafer" (erwartet: Haferflocken ganz oben) ===')
const hafer = ergebnis.filter(e => /\bhafer/.test(e.f.gefaltet))
  .sort((a, b) => b.wert - a.wert).slice(0, 10)
for (const e of hafer) {
  console.log(`  neu ${String(e.wert).padStart(4)} (alt ${String(e.f.alt).padStart(3)})  ${e.f.name.slice(0, 56)}`)
}
console.log('')
console.log('=== Spec-Beispiel "Rind" (erwartet: Hackfleisch oben, Innereien tief) ===')
const rind = ergebnis.filter(e => /^rind\b/.test(e.f.gefaltet))
  .sort((a, b) => b.wert - a.wert)
console.log('  --- oben ---')
for (const e of rind.slice(0, 8)) {
  console.log(`  neu ${String(e.wert).padStart(4)} (alt ${String(e.f.alt).padStart(3)})  ${e.f.name.slice(0, 56)}`)
}
console.log('  --- unten ---')
for (const e of rind.slice(-8)) {
  console.log(`  neu ${String(e.wert).padStart(4)} (alt ${String(e.f.alt).padStart(3)})  ${e.f.name.slice(0, 56)}`)
}
