#!/usr/bin/env node
// Prueft kuratierte Gruppenbeschriftungen auf dieselbe fachliche Gruppe
// mit verschiedener Schreibweise. Encoding-Pruefung reicht hier nicht:
// "Geraete & Baenke" ist gueltiges UTF-8, aber neben derselben
// gefalteten Form eine falsche Umschrift derselben Anzeigegruppe.
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = process.cwd()
const PRUEFUNGEN = [
  {
    name: 'training.equipment.equipment_group_de',
    file: 'supabase/_pipeline/10_training/109a_equipment_groups_disciplines.sql',
    pattern: /\(\s*'[^']+'\s*,\s*'[^']+'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'[^']+'\s*\)/g,
    keyIndex: 1,
    labelIndex: 2,
  },
  {
    name: 'training.equipment.equipment_group_en',
    file: 'supabase/_pipeline/10_training/109a_equipment_groups_disciplines.sql',
    pattern: /\(\s*'[^']+'\s*,\s*'[^']+'\s*,\s*'([^']+)'\s*,\s*'[^']+'\s*,\s*'([^']+)'\s*\)/g,
    keyIndex: 1,
    labelIndex: 2,
  },
]

function deutschFalten(text) {
  return text
    .replace(/\u00c4/g, 'Ae')
    .replace(/\u00d6/g, 'Oe')
    .replace(/\u00dc/g, 'Ue')
    .replace(/\u00e4/g, 'ae')
    .replace(/\u00f6/g, 'oe')
    .replace(/\u00fc/g, 'ue')
    .replace(/\u1e9e/g, 'SS')
    .replace(/\u00df/g, 'ss')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function zeile(text, index) {
  return text.slice(0, index).split('\n').length
}

const befunde = []
let gruppen = 0
let labels = 0

for (const pruefung of PRUEFUNGEN) {
  const abs = path.join(WURZEL, pruefung.file)
  const text = fs.readFileSync(abs, 'utf8')
  const jeGruppe = new Map()
  let match
  while ((match = pruefung.pattern.exec(text)) !== null) {
    const key = match[pruefung.keyIndex]
    const label = match[pruefung.labelIndex]
    const folded = deutschFalten(label)
    const id = `${key}\u0000${folded}`
    if (!jeGruppe.has(id)) {
      jeGruppe.set(id, { key, folded, labels: new Map() })
      gruppen++
    }
    const eintrag = jeGruppe.get(id)
    if (!eintrag.labels.has(label)) eintrag.labels.set(label, [])
    eintrag.labels.get(label).push(zeile(text, match.index))
    labels++
  }

  for (const eintrag of jeGruppe.values()) {
    if (eintrag.labels.size <= 1) continue
    befunde.push({
      pruefung: pruefung.name,
      key: eintrag.key,
      folded: eintrag.folded,
      labels: [...eintrag.labels.entries()].map(([label, lines]) => ({ label, lines })),
    })
  }
}

if (befunde.length) {
  console.error(`[gruppenlabel] FEHLER: ${befunde.length} uneinheitliche Gruppenbeschriftung(en)`)
  for (const b of befunde) {
    console.error(`  ${b.pruefung}: ${b.key} / ${b.folded}`)
    for (const label of b.labels) {
      console.error(`    "${label.label}" in Zeile(n) ${label.lines.join(', ')}`)
    }
  }
  process.exit(1)
}

console.log(`[gruppenlabel] ${labels} Labels in ${gruppen} Gruppen/Faltungen geprueft, sauber.`)
