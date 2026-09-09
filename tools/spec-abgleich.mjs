// `[cmd]` **2026-09-08.** Tom: *,,du fantasierst dich durch themen
// durch, die definiert sind ? und wenn nicht, fragst du mich."*
//
// **Fuenf Behauptungen an einem Tag, alle von Agenten berichtigt:**
//
//     `conditions`                 heisst `user_conditions`
//     `is_primary` gibt es nicht   gibt es, mit eigenem Index
//     `client_id` ist nullable     ist NOT NULL, zweifach
//     keine Spec nennt den Erzeuger  SPEC_08:163 und SPEC_07:10
//     `supplements.injection_*`    liegt in `medical`, fuenf Tabellen
//
// `[read]` **Das Muster ist immer dasselbe:** eine Tabelle oder
// Spalte aus dem Gedaechtnis benannt, statt nachgesehen.
//
// `[read]` **Dieses Werkzeug haelt die Spec gegen das Schema** ?
// **beide Richtungen, weil beide Luecken schaden:**
//
//     Spec nennt, Schema hat nicht   -> ungebaut oder umbenannt
//     Schema hat, Spec nennt nicht   -> undokumentiert
//
// `[read]` **Es ersetzt das Lesen nicht.** `[read]` **Aber es sagt,
// WO gelesen werden muss** ? **und das ist bei 159 Spec-Dateien der
// Unterschied.**

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { execFileSync } from 'node:child_process'

const DB = 'supabase_db_LumeOS-Claude-V1'
const SPECS = 'docs/specs'
const MODULE = ['nutrition', 'goals', 'supplements', 'medical',
                'recovery', 'training', 'coach', 'market', 'wissen']

function frage(sql) {
  const roh = execFileSync('docker',
    ['exec', DB, 'psql', '-U', 'postgres', '-d', 'postgres',
     '-t', '-A', '-F', '\t', '-c', sql],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  return roh.split('\n').filter(z => z.trim()).map(z => z.split('\t'))
}

// `[read]` **Nur BASE TABLE** ? **eine Sicht ist keine eigene
// Sache** (G-383).
const liste = MODULE.map(m => "'" + m + "'").join(', ')
const imSchema = new Map()
for (const [schema, name] of frage(`
    SELECT table_schema, table_name FROM information_schema.tables
     WHERE table_schema IN (${liste}) AND table_type = 'BASE TABLE'`)) {
  if (!imSchema.has(name)) imSchema.set(name, [])
  imSchema.get(name).push(schema)
}

function dateien(wurzel) {
  const raus = []
  for (const e of readdirSync(wurzel, { withFileTypes: true })) {
    const p = join(wurzel, e.name)
    if (e.isDirectory()) raus.push(...dateien(p))
    else if (e.name.endsWith('.md')) raus.push(p)
  }
  return raus
}

// `[read]` **Die Form ist die Eichung** ? **eine lose Wortsuche gab
// in G-385 zweiundneunzig Treffer, davon vier echte.**
//
// `[cmd]` **Erste Fassung fing `coach.bio`, `coach.athleteCount`,
// `coach.certifications`** ? **das sind FELDER eines Objekts, keine
// Tabellen.** `[read]` **`schema.wort` allein reicht nicht: in
// TypeScript-Beispielen heisst eine Variable auch `coach`.**
//
// **Drei Bedingungen, alle drei noetig:**
//
//     Unterstrich im Namen    Tabellen heissen `client_permissions`,
//                             Felder heissen `bio`
//     kein camelCase          `athleteCount` ist ein Feld
//     in Backticks ODER
//     nach FROM/JOIN/TABLE    so schreibt man ueber eine Tabelle
const NAME = '([a-z][a-z0-9]*(?:_[a-z0-9]+)+)'
const SCHEMA = '(' + MODULE.join('|') + ')'
const MUSTER = new RegExp(
  '`' + SCHEMA + '\\.' + NAME + '`' + '|' +
  '(?:FROM|JOIN|TABLE|REFERENCES|INTO|UPDATE)\\s+' + SCHEMA + '\\.' + NAME,
  'gi')

const inSpec = new Map()
for (const datei of dateien(SPECS)) {
  const text = readFileSync(datei, 'utf8')
  const zeilen = text.split('\n')
  zeilen.forEach((zeile, nr) => {
    for (const m of zeile.matchAll(MUSTER)) {
      const schema = (m[1] ?? m[3])?.toLowerCase()
      const name = (m[2] ?? m[4])?.toLowerCase()
      if (!schema || !name) continue
      const schluessel = schema + '.' + name
      if (!inSpec.has(schluessel)) inSpec.set(schluessel, [])
      inSpec.get(schluessel).push(relative('.', datei) + ':' + (nr + 1))
    }
  })
}

const fehlt = []   // Spec nennt, Schema hat nicht
for (const [schluessel, stellen] of inSpec) {
  const [schema, name] = schluessel.split('.')
  const wo = imSchema.get(name)
  if (!wo) fehlt.push({ schluessel, stellen, art: 'ungebaut' })
  else if (!wo.includes(schema)) {
    fehlt.push({ schluessel, stellen, art: 'anderes Schema: ' + wo.join(', ') })
  }
}

const genannt = new Set([...inSpec.keys()].map(s => s.split('.')[1]))
const stumm = []   // Schema hat, Spec nennt nicht
for (const [name, schemas] of imSchema) {
  if (!genannt.has(name)) stumm.push(schemas[0] + '.' + name)
}

const heute = new Date().toISOString().slice(0, 10)
const z = [
  '# Spec gegen Schema',
  '',
  '**Erzeugt von `tools/spec-abgleich.mjs`.** `[read]` **Nicht von',
  'Hand aendern.**',
  '',
  '`[read]` **Es ersetzt das Lesen nicht** ? **es sagt, WO gelesen',
  'werden muss.**',
  '',
  '`[cmd]` **Stand ' + heute + ': ' + imSchema.size + ' Tabellen, '
    + inSpec.size + ' in Specs genannt, ' + fehlt.length
    + ' ohne Entsprechung, ' + stumm.length + ' ohne Erwaehnung.**',
  '',
  '## Die Spec nennt, das Schema hat nicht',
  '',
  '`[read]` **Entweder ungebaut, oder umbenannt** ? **der zweite Fall',
  'ist der gefaehrliche, weil der Name plausibel bleibt.**',
  '',
  '| Genannt | Art | Fundstelle |',
  '|---|---|---|',
]
for (const f of fehlt.sort((a, b) => a.schluessel.localeCompare(b.schluessel))) {
  z.push('| `' + f.schluessel + '` | ' + f.art + ' | ' + f.stellen[0]
    + (f.stellen.length > 1 ? ' (+' + (f.stellen.length - 1) + ')' : '') + ' |')
}
z.push('', '## Das Schema hat, keine Spec nennt es', '',
  '`[read]` **Undokumentiert** ? **oder unter anderem Namen',
  'beschrieben.**', '')
for (const s of stumm.sort()) z.push('- `' + s + '`')
z.push('')

if (process.argv.includes('--schreiben')) {
  writeFileSync('docs/ssot/00-SPEC-ABGLEICH.md', z.join('\n'), 'utf8')
  console.log('[spec-abgleich] ' + fehlt.length + ' ohne Entsprechung, '
    + stumm.length + ' ohne Erwaehnung -> docs/ssot/00-SPEC-ABGLEICH.md')
} else {
  console.log('[spec-abgleich] ' + imSchema.size + ' Tabellen, '
    + inSpec.size + ' genannt, ' + fehlt.length + ' ohne Entsprechung, '
    + stumm.length + ' ohne Erwaehnung (--schreiben zum Ablegen)')
}
