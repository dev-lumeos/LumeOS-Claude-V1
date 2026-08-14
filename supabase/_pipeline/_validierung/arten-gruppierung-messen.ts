#!/usr/bin/env node
// ARTENGRUPPIERUNG: Traegt der BLS-Code die Art?
//
// ANLASS (C-28): `[cmd]` Die Anfrage `lachs` trifft 132 Eintraege. Was
// sie sind, steht nicht im Namen, sondern im Code — "Alaska-Seelachs"
// heisst aus Handelsgruenden so, nicht aus Sachgruenden. Die ersten vier
// Stellen des BLS-Codes kodieren die Art, die Stellen 5-7 die
// Zubereitung (44-bls-codestruktur.md).
//
// DIES IST EINE MESSUNG, KEIN BAU. Nur lesende Abfragen. Es entsteht
// kein Schema, keine Migration, keine Aenderung an nutrition.foods oder
// food_search.
//
// DIE VERMUTUNG IST ZU PRUEFEN, NICHT ZU BESTAETIGEN. Ein Ergebnis
// unter der Abnahmeschwelle ist ein gueltiges Ergebnis ("Modell traegt
// nicht") und wird gemeldet, wie es ist — nicht nachgebessert, bis die
// Zahl gefaellt.
//
// AUFRUF: pnpm exec tsx supabase/_pipeline/_validierung/arten-gruppierung-messen.ts
import { execFileSync } from 'node:child_process'

const C = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'

/** Trennzeichen, das in keinem Lebensmittelnamen vorkommt. */
const SEP = ''

function sql(text: string): string[][] {
  const aus = execFileSync('docker',
    ['exec', C, 'psql', '-U', 'postgres', '-d', DB, '-t', '-A', '-F', SEP, '-c', text],
    { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
  return aus.split('\n').map(z => z.trimEnd()).filter(Boolean).map(z => z.split(SEP))
}

// =============================================================
// Grundmenge
// =============================================================
// Je Eintrag: Kuerzel (Stellen 1-4), Zubereitungscode (5-7), Name,
// sort_weight. Ein einziger Durchlauf, alles Weitere rechnet in JS —
// so bleibt nachvollziehbar, welche Regel wo greift.
type Eintrag = {
  kuerzel: string
  zub: string
  code: string
  name: string
  gewicht: number
}

const roh = sql(`
  SELECT left(bls_code,4), substr(bls_code,5,3), bls_code,
         replace(coalesce(name_de,''), chr(1), ' '),
         coalesce(sort_weight,0)::text
  FROM nutrition.foods
  ORDER BY bls_code;`)

const eintraege: Eintrag[] = roh.map(z => ({
  kuerzel: z[0], zub: z[1], code: z[2], name: z[3], gewicht: Number(z[4]),
}))

const gruppen = new Map<string, Eintrag[]>()
for (const e of eintraege) {
  const g = gruppen.get(e.kuerzel)
  if (g) g.push(e); else gruppen.set(e.kuerzel, [e])
}

// Zubereitungsmuster aus der Datenbank holen — NICHT hier nachbauen.
// Sie stehen in nutrition.preparation_kinds mit ihrer Herkunft; eine
// zweite Kopie liefe stumm auseinander (der Fehler aus Block 29).
const muster = sql(`SELECT code, name_pattern FROM nutrition.preparation_kinds
                    WHERE name_pattern IS NOT NULL ORDER BY sort_order;`)

/**
 * Faltung wie nutrition.search_fold.
 *
 * `[cmd]` Die Muster in preparation_kinds treffen NUR auf gefalteten
 * Text: `\mgeduenstet\M` findet 353 Eintraege gefaltet und 0 ungefaltet,
 * weil der Bestand "gedünstet" schreibt.
 */
function falte(s: string): string {
  return s.toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()
}

/** `\m` und `\M` sind Postgres-Wortgrenzen; in JS ist das `\b`. */
const regeln = muster.map(([code, pat]) => ({
  code,
  re: new RegExp(pat.replace(/\\m/g, '\\b').replace(/\\M/g, '\\b'), 'g'),
}))

/**
 * Zusatzangaben, die preparation_kinds NICHT kennt.
 *
 * `[cmd]` Ohne sie zaehlt der Massstab 20 der 100 Stichprobengruppen zu
 * Unrecht als uneinheitlich: "Rotkohl" gegen "Rotkohl ohne Fett
 * (Pfanne)", "Morchel" gegen "Morchel ohne Fett (Pfanne)". Das sind
 * Zubereitungsangaben, die in der Tabelle fehlen, keine anderen Arten.
 *
 * Aufgenommen wird nur, was am Bestand belegbar ist und die ART nicht
 * veraendert. `gezuckert`, `mariniert` und `paniert` bezeichnen eine
 * Behandlung desselben Lebensmittels; `saft` oder `nektar` gerade
 * NICHT — die stehen bewusst nicht in dieser Liste, weil sie ein
 * anderes Erzeugnis benennen.
 */
const ZUSATZ = [
  /\bohne fett\b/g, /\bmit fett\b/g, /\bpfanne\b/g, /\bofen\b/g,
  /\bgezuckert\b/g, /\bungezuckert\b/g, /\bmariniert\b/g, /\bpaniert\b/g,
  /\bmehliert\b/g, /\babgetropft\b/g, /\bkuechenfertig\b/g, /\bgesalzen\b/g,
  /\breif\b/g, /\bunreif\b/g, /\bfrittiert\b/g, /\bpochiert\b/g,
  /\bgegart\b/g, /\bgedaempft\b/g, /\bdruckgedaempft\b/g, /\bblanchiert\b/g,
]

/**
 * Der Rest eines Namens, wenn man die Zubereitung abzieht.
 *
 * Drei Schritte:
 *   1. alles ab dem ersten Komma entfaellt ("Pute Brust, ohne Haut, roh"
 *      -> "Pute Brust"),
 *   2. die elf Muster aus preparation_kinds werden entfernt,
 *   3. die Zusatzangaben oben.
 * Verglichen wird der gefaltete Rest, damit "Broccoli"/"Brokkoli" nicht
 * an der Schreibweise scheitern.
 *
 * Schritt 3 ist eine Erweiterung MEINES Massstabs, nicht des Modells.
 * Der Bericht nennt deshalb beide Zahlen — mit und ohne —, damit
 * sichtbar bleibt, wieviel davon die Regel und wieviel der Bestand ist.
 */
function artkern(name: string, mitZusatz = true): string {
  const vorKomma = name.split(',')[0]
  let s = falte(vorKomma)
  for (const r of regeln) s = s.replace(r.re, ' ')
  if (mitZusatz) for (const r of ZUSATZ) s = s.replace(r, ' ')
  return s.replace(/\s+/g, ' ').trim()
}

// =============================================================
// FRAGE 1 — Ist eine Gruppe wirklich eine Art?
// =============================================================
console.log('=============================================================')
console.log('FRAGE 1 — Ist eine Gruppe wirklich eine Art?')
console.log('=============================================================')
console.log('')
console.log(`Eintraege gesamt        : ${eintraege.length}`)
console.log(`Gruppen (left(code,4))  : ${gruppen.size}`)

const mehrfach = [...gruppen.entries()]
  .filter(([, v]) => v.length >= 2)
  .sort((a, b) => a[0].localeCompare(b[0]))
console.log(`davon mit >= 2 Eintraegen: ${mehrfach.length}`)

// Deterministische Stichprobe: jede n-te Gruppe nach Kuerzel sortiert.
// Kein Zufall — die Messung muss wiederholbar sein.
const ZIEL = 100
const schritt = Math.floor(mehrfach.length / ZIEL)
const stichprobe = schritt < 1
  ? mehrfach.slice(0, ZIEL)
  : Array.from({ length: ZIEL }, (_, i) => mehrfach[i * schritt]).filter(Boolean)

console.log(`Stichprobe              : jede ${schritt}. Gruppe, ${stichprobe.length} Stueck`)
console.log('')

// Beide Massstaebe werden gerechnet, damit sichtbar bleibt, welcher
// Anteil auf die Regel und welcher auf den Bestand entfaellt.
let nurTabelle = 0
for (const [, liste] of stichprobe) {
  if (new Set(liste.map(e => artkern(e.name, false))).size === 1) nurTabelle++
}

const uneinheitlich: Array<[string, Eintrag[], string[]]> = []
let einheitlich = 0
for (const [kuerzel, liste] of stichprobe) {
  const kerne = [...new Set(liste.map(e => artkern(e.name)))]
  if (kerne.length === 1) einheitlich++
  else uneinheitlich.push([kuerzel, liste, kerne])
}

console.log(`  einheitlich, nur preparation_kinds : ${nurTabelle} von ${stichprobe.length}`)
console.log(`  einheitlich, mit Zusatzangaben     : ${einheitlich} von ${stichprobe.length}`)
console.log(`  uneinheitlich                      : ${uneinheitlich.length}`)
console.log(`  Abnahme (>=95)                     : ${einheitlich >= 95 ? 'ERREICHT' : 'NICHT ERREICHT'}`)
console.log('')

if (uneinheitlich.length) {
  console.log('Die uneinheitlichen Gruppen vollstaendig — sie sagen, wo das Modell bricht:')
  for (const [kuerzel, liste, kerne] of uneinheitlich) {
    console.log(`  ${kuerzel} (${liste.length} Eintraege, ${kerne.length} Kerne)`)
    for (const e of liste) console.log(`      ${e.code}  ${e.name}`)
    console.log(`      Kerne: ${kerne.map(k => `"${k}"`).join(' | ')}`)
  }
  console.log('')
}

// =============================================================
// FRAGE 2 — Wer vertritt die Art?
// =============================================================
// Die Regel steht bereits in nutrition.such_rang_zubereitung: Rohform
// 100 und Grundform 000 sind GLEICHRANGIG, danach entscheidet
// sort_weight. Sie wird hier nachvollzogen, nicht neu erfunden.
console.log('=============================================================')
console.log('FRAGE 2 — Wer vertritt die Art?')
console.log('=============================================================')
console.log('')

const istGrundform = (e: Eintrag) => e.zub === '100' || e.zub === '000'

type Vertretung = { kuerzel: string; vertreter: Eintrag | null; gleichrangig: number }
const vertretungen: Vertretung[] = []

for (const [kuerzel, liste] of gruppen) {
  const kandidaten = liste.filter(istGrundform)
  if (!kandidaten.length) {
    vertretungen.push({ kuerzel, vertreter: null, gleichrangig: 0 })
    continue
  }
  const maxGewicht = Math.max(...kandidaten.map(k => k.gewicht))
  const spitze = kandidaten.filter(k => k.gewicht === maxGewicht)
  vertretungen.push({
    kuerzel,
    vertreter: spitze[0],
    gleichrangig: spitze.length,
  })
}

const eindeutig = vertretungen.filter(v => v.vertreter && v.gleichrangig === 1)
const mehrdeutig = vertretungen.filter(v => v.vertreter && v.gleichrangig > 1)
const ohne = vertretungen.filter(v => !v.vertreter)

console.log(`  genau ein Vertreter     : ${eindeutig.length}`)
console.log(`  mehrere gleichrangige   : ${mehrdeutig.length}`)
console.log(`  kein Vertreter (kein 100/000): ${ohne.length}`)
console.log(`  Summe                   : ${vertretungen.length}`)
console.log('')
console.log('  Beispiele mehrerer gleichrangiger (erste 10):')
for (const v of mehrdeutig.slice(0, 10)) {
  const liste = gruppen.get(v.kuerzel)!.filter(istGrundform)
    .filter(e => e.gewicht === v.vertreter!.gewicht)
  console.log(`    ${v.kuerzel}  sw=${v.vertreter!.gewicht}  ${liste.map(e => e.code + ' ' + e.name).join('  |  ')}`)
}
console.log('')
console.log('  Beispiele ohne Vertreter (erste 10):')
for (const v of ohne.slice(0, 10)) {
  const liste = gruppen.get(v.kuerzel)!
  console.log(`    ${v.kuerzel}  ${liste.slice(0, 2).map(e => e.zub + ' ' + e.name).join('  |  ')}`)
}
console.log('')

// =============================================================
// FRAGE 3 — Wie viele Gattungsnamen taugen?
// =============================================================
// Der Gattungsname ist der Name des Vertreters ohne Zubereitungsangabe.
//
// WICHTIG: geprueft wird der ROHE Name, nicht der gefaltete. `[cmd]`
// nutrition.search_fold entfernt Schraegstrich, Klammern und Prozent —
// genau die Merkmale, um die es hier geht ("Koehler/Seelachs" wird zu
// "koehler seelachs"). Auf gefaltetem Text waere die Zahl systematisch
// zu niedrig.
console.log('=============================================================')
console.log('FRAGE 3 — Wie viele Gattungsnamen taugen?')
console.log('=============================================================')
console.log('')

/** Roher Gattungsname: alles vor dem ersten Komma, Zubereitung entfernt. */
function gattungsname(name: string): string {
  let s = name.split(',')[0]
  // Dieselben elf Muster, aber auf dem rohen Text: dafuer wird je Muster
  // eine umlautfeste Fassung gebaut, sonst bliebe "gedünstet" stehen.
  for (const r of regeln) {
    const roh = r.re.source
      .replace(/ae/g, '(?:ae|ä)').replace(/oe/g, '(?:oe|ö)')
      .replace(/ue/g, '(?:ue|ü)').replace(/ss/g, '(?:ss|ß)')
    s = s.replace(new RegExp(roh, 'gi'), ' ')
  }
  return s.replace(/\s+/g, ' ').trim()
}

const MENGE = /[<>]\s*\d|\d+\s*%|\bmind\.|\bmax\.|\bi\.\s*Tr\./i

type Befund = { kuerzel: string; code: string; name: string; gattung: string; gruende: string[] }

function pruefe(v: Vertretung): Befund | null {
  if (!v.vertreter) return null
  const g = gattungsname(v.vertreter.name)
  const gruende: string[] = []
  if (g.includes('/')) gruende.push('Schraegstrich')
  if (/[()\[\]]/.test(g)) gruende.push('Klammer')
  if (MENGE.test(g)) gruende.push('Mengenangabe')
  if (g.split(/\s+/).filter(Boolean).length > 5) gruende.push('mehr als fuenf Woerter')
  return { kuerzel: v.kuerzel, code: v.vertreter.code, name: v.vertreter.name, gattung: g, gruende }
}

const alleBefunde = vertretungen.map(pruefe).filter((b): b is Befund => b !== null)
const ohneGerichte = alleBefunde.filter(b => !['X', 'Y'].includes(b.kuerzel[0]))

function bericht(titel: string, menge: Befund[]) {
  const schlecht = menge.filter(b => b.gruende.length > 0)
  console.log(`--- ${titel} ---`)
  console.log(`  Gruppen mit Vertreter    : ${menge.length}`)
  console.log(`  Gattungsname unbrauchbar : ${schlecht.length}` +
    ` (${menge.length ? (100 * schlecht.length / menge.length).toFixed(1) : '0'} %)`)
  console.log(`  brauchbar                : ${menge.length - schlecht.length}`)
  for (const kat of ['Schraegstrich', 'Klammer', 'Mengenangabe', 'mehr als fuenf Woerter']) {
    console.log(`     davon ${kat.padEnd(24)}: ${menge.filter(b => b.gruende.includes(kat)).length}`)
  }
  console.log('')
  return schlecht
}

const schlechtGesamt = bericht('GESAMTBESTAND', alleBefunde)
const schlechtOhne = bericht('NICHT-GERICHTE (Code beginnt nicht mit X oder Y)', ohneGerichte)

console.log('Die ersten 50 Faelle je Kategorie (Nicht-Gerichte):')
for (const kat of ['Schraegstrich', 'Klammer', 'Mengenangabe', 'mehr als fuenf Woerter']) {
  const f = schlechtOhne.filter(b => b.gruende.includes(kat))
  console.log('')
  console.log(`  === ${kat} (${f.length}) ===`)
  for (const b of f.slice(0, 50)) console.log(`    ${b.code}  ${b.gattung}`)
  if (f.length > 50) console.log(`    ... und ${f.length - 50} weitere`)
}

console.log('')
console.log('=============================================================')
console.log('ZUSAMMENFASSUNG')
console.log('=============================================================')
console.log(`  F1  einheitliche Gruppen      : ${einheitlich} von ${stichprobe.length}` +
  `  (Abnahme >=95: ${einheitlich >= 95 ? 'erreicht' : 'NICHT erreicht'})`)
console.log(`  F2  eindeutiger Vertreter     : ${eindeutig.length} von ${vertretungen.length}`)
console.log(`  F3  Kurationsaufwand gesamt   : ${schlechtGesamt.length}`)
console.log(`  F3  Kurationsaufwand o. X/Y   : ${schlechtOhne.length}`)
