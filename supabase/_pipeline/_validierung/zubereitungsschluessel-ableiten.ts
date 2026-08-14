#!/usr/bin/env node
// SCHRITT 1 von C-33: Kreuztabelle Warengruppe x Stellen 5-7, mit Beleg.
//
// ANLASS: `[cmd]` C-28 ist gefallen (39 von 100 gegen eine Abnahme von
// 95). Die Ursache: die Stellen 5-7 tragen Information, die der
// vierstellige Code nicht traegt — "F201600" ist Aprikosensaft, nicht
// Aprikose. Und der Schluessel ist NICHT global: `600` heisst bei Obst
// Saft, bei Fisch geraeuchert, bei Nuessen geroestet.
//
// `[read]` Die amtliche Dokumentation (BLS_4_0_Dokumentation_DE.pdf,
// Abschnitt 2.4) enthaelt keine Schluesselliste fuer die Stellen 5-7.
// Das Nachsehen ist erledigt und negativ. Die Klassifikation muss
// deshalb aus dem Bestand ABGELEITET werden — und weil sie abgeleitet
// ist, traegt jede Zeile einen Beleg.
//
// DER BELEG ist ein gemeinsames Merkmal der Namen einer Zelle: ein
// gemeinsames Wort oder ein gemeinsames Suffix. `F`+`600`: alle 53
// Namen enden auf "saft". Wo sich nichts findet, steht "ungeklaert" —
// es wird keine Bedeutung erfunden, um eine Zelle zu fuellen.
//
// DIES IST EINE MESSUNG, KEIN BAU. Nur lesende Abfragen.
//
// AUFRUF: pnpm exec tsx supabase/_pipeline/_validierung/zubereitungsschluessel-ableiten.ts
import { execFileSync } from 'node:child_process'

const C = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const SEP = ''

function sql(text: string): string[][] {
  return execFileSync('docker',
    ['exec', C, 'psql', '-U', 'postgres', '-d', DB, '-t', '-A', '-F', SEP, '-c', text],
    { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
    .split('\n').map(z => z.trimEnd()).filter(Boolean).map(z => z.split(SEP))
}

const MINDEST = 10

const roh = sql(`
  SELECT left(bls_code,1), substr(bls_code,5,3), bls_code,
         replace(coalesce(name_de,''), chr(1), ' ')
  FROM nutrition.foods ORDER BY bls_code;`)

type Zeile = { wg: string; z: string; code: string; name: string }
const eintraege: Zeile[] = roh.map(r => ({ wg: r[0], z: r[1], code: r[2], name: r[3] }))

const zellen = new Map<string, Zeile[]>()
for (const e of eintraege) {
  const k = e.wg + e.z
  const v = zellen.get(k)
  if (v) v.push(e); else zellen.set(k, [e])
}

const falte = (s: string) => s.toLowerCase()
  .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  .replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()

/**
 * Das gemeinsame Merkmal einer Zelle — der BELEG.
 *
 * Drei Kandidaten, in dieser Reihenfolge geprueft:
 *   1. gemeinsames SUFFIX aller Namen (mindestens 3 Zeichen):
 *      "Apfelsaft", "Orangensaft" -> "saft"
 *   2. gemeinsames WORT in allen Namen: "roh", "getrocknet"
 *   3. gemeinsames Wort in mindestens 80 % der Namen — schwaecher, wird
 *      als solcher ausgewiesen.
 *
 * Erst wenn alle drei leer ausgehen, gilt die Zelle als ungeklaert.
 */
type Beleg = {
  art: 'suffix' | 'wort' | 'mehrheit' | 'wortteil' | 'ungeklaert'
  merkmal: string
  anteil: number
}

/**
 * Wortbausteine, die als gemeinsames Merkmal in Frage kommen.
 *
 * `[cmd]` Noetig, weil deutsche Komposita das Merkmal VERSTECKEN:
 * F+600 heisst "Apfelsaft", "Traubensaft", "Mehrfruchtsaft" — drei
 * verschiedene Woerter, gemeinsames Merkmal "saft". Kein Wort erreicht
 * dort 80 %, das haeufigste ist "mit" mit 7 von 53.
 *
 * Die Liste ist bewusst KURZ und nennt nur Bausteine, die ein Erzeugnis
 * oder eine Behandlung bezeichnen. Sie wird NICHT aus den Daten
 * erraten — sonst belegt sich jede Zelle selbst.
 */
const BAUSTEINE = [
  'saft', 'nektar', 'mehl', 'pulver', 'staerke', 'kleie', 'flocken',
  'gries', 'schrot', 'kern', 'drink', 'creme', 'mus', 'mark',
  'getrocknet', 'geraeuchert', 'geroestet', 'gesalzen', 'gezuckert',
  'gekocht', 'gebraten', 'gegrillt', 'gebacken', 'geduenstet',
  'geschmort', 'tiefgefroren', 'konserve', 'roh',
]

function belege(liste: Zeile[]): Beleg {
  const namen = liste.map(e => falte(e.name)).filter(Boolean)
  if (!namen.length) return { art: 'ungeklaert', merkmal: '', anteil: 0 }

  // 1. Gemeinsames WORTSUFFIX.
  //
  // Zwei Korrekturen gegenueber dem ersten Anlauf, beide gemessen:
  //   a) Nur an Wortgrenzen schneiden. `[cmd]` Sonst entstehen Merkmale
  //      wie "ne fett pfanne" oder "rve abgetropft" — Fragmente, die
  //      nichts belegen.
  //   b) Nicht das Ende des ganzen NAMENS pruefen, sondern das Ende des
  //      ERSTEN Wortes. `[cmd]` Sonst faellt F+600 durch, obwohl alle 53
  //      Namen auf "saft" enden: "Mehrfruchtsaft angereichert mit
  //      Vitaminen" endet auf "vitaminen", der Kopf aber auf "saft".
  const koepfe = namen.map(n => n.split(' ')[0]).filter(Boolean)
  const kuerzesterKopf = koepfe.reduce((a, b) => (a.length <= b.length ? a : b), koepfe[0] ?? '')
  for (let n = Math.min(kuerzesterKopf.length, 12); n >= 3; n--) {
    const kand = kuerzesterKopf.slice(-n)
    if (/^\d+$/.test(kand)) continue
    if (koepfe.every(x => x.endsWith(kand))) {
      return { art: 'suffix', merkmal: kand, anteil: 1 }
    }
  }

  // 2./3. Gemeinsames Wort. Zaehlen, in wievielen Namen es vorkommt.
  const zaehler = new Map<string, number>()
  for (const n of namen) {
    for (const w of new Set(n.split(' '))) {
      if (w.length < 3) continue
      if (/^\d+$/.test(w)) continue
      zaehler.set(w, (zaehler.get(w) ?? 0) + 1)
    }
  }
  // Fuellwoerter belegen nichts: "mit" ist in jedem zweiten Brotnamen.
  const FUELL = new Set(['mit', 'ohne', 'und', 'oder', 'aus', 'der', 'die', 'das',
                         'vom', 'zum', 'art', 'ganzes'])
  const sortiert = [...zaehler.entries()]
    .filter(([w]) => !FUELL.has(w))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  if (sortiert.length) {
    const [wort, n] = sortiert[0]
    const anteil = n / namen.length
    if (anteil === 1) return { art: 'wort', merkmal: wort, anteil }
    if (anteil >= 0.8) return { art: 'mehrheit', merkmal: wort, anteil }
  }

  // 4. Gemeinsamer WORTBAUSTEIN, nur aus der festen Liste oben.
  //    Schwaechster Beleg, wird als eigene Art ausgewiesen.
  let bester: [string, number] | null = null
  for (const b of BAUSTEINE) {
    const n = namen.filter(x => x.includes(b)).length
    if (n / namen.length >= 0.8 && (!bester || n > bester[1])) bester = [b, n]
  }
  if (bester) {
    return { art: 'wortteil', merkmal: bester[0], anteil: bester[1] / namen.length }
  }

  return { art: 'ungeklaert', merkmal: '', anteil: 0 }
}

const gross = [...zellen.entries()]
  .filter(([, v]) => v.length >= MINDEST)
  .sort((a, b) => a[0].localeCompare(b[0]))

console.log('=============================================================')
console.log('SCHRITT 1 — Kreuztabelle Warengruppe x Stellen 5-7, mit Beleg')
console.log('=============================================================')
console.log('')
console.log(`Kombinationen gesamt          : ${zellen.size}`)
console.log(`davon mit >= ${MINDEST} Eintraegen    : ${gross.length}`)
console.log(`von diesen abgedeckte Eintraege: ${gross.reduce((s, [, v]) => s + v.length, 0)}`)
console.log('')

let nSuffix = 0, nWort = 0, nMehrheit = 0, nTeil = 0, nOffen = 0
const offen: string[] = []

console.log('WG  Code  Anz  Beleg                          Beispiele')
console.log('-'.repeat(118))
for (const [k, liste] of gross) {
  const b = belege(liste)
  if (b.art === 'suffix') nSuffix++
  else if (b.art === 'wort') nWort++
  else if (b.art === 'mehrheit') nMehrheit++
  else if (b.art === 'wortteil') nTeil++
  else { nOffen++; offen.push(k) }

  const merk = b.art === 'ungeklaert'
    ? 'ungeklaert'
    : `${b.art}:${b.merkmal}` + (b.anteil < 1 ? ` (${Math.round(b.anteil * 100)}%)` : '')
  const bsp = liste.slice(0, 3).map(e => e.name.slice(0, 26)).join(' | ')
  console.log(
    k[0].padEnd(4) + k.slice(1).padEnd(6) + String(liste.length).padStart(4) + '  ' +
    merk.padEnd(31) + bsp)
}

console.log('')
console.log(`  Suffix belegt   : ${nSuffix}`)
console.log(`  Wort belegt     : ${nWort}`)
console.log(`  Mehrheit (>=80%): ${nMehrheit}`)
console.log(`  Wortbaustein    : ${nTeil}`)
console.log(`  ungeklaert      : ${nOffen}${nOffen ? '   ' + offen.join(', ') : ''}`)
