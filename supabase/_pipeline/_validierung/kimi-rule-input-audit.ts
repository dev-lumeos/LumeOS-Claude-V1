#!/usr/bin/env node
// C-132: misst die Auswertbarkeit der Kimi-Regeln gegen den aktuellen
// LumeOS-Feldvertrag. Importiert keine Regeln.
import fs from 'node:fs'
import path from 'node:path'

const BASE = 'backup/kimi-research/Kimi_Agent/supplement_performance_database/data/platform'
const FILES = ['warning_rules.jsonl', 'nutrient_gap_rules.jsonl', 'medication_rules.jsonl'] as const

type JsonObject = Record<string, unknown>
type Rule = JsonObject & {
  id: string
  conditions?: JsonObject[]
  gap_condition?: string
  file: string
}

type Status = 'auswertbar' | 'teilweise' | 'blockiert'
type InputStatus = 'available' | 'partial' | 'missing'

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

function readJsonl(file: string): Rule[] {
  const full = path.join(BASE, file)
  if (!fs.existsSync(full)) fail(`${full} fehlt`)
  return fs.readFileSync(full, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      try {
        return { ...(JSON.parse(line) as JsonObject), file } as Rule
      } catch (error) {
        fail(`${full}:${index + 1}: JSON ungueltig (${String(error)})`)
      }
    })
}

const available = new Set([
  'medical.medications',
  'medical.medications[].drug_class',
  'medical.medications[].cyp_profile',
  'medical.conditions',
  'medical.labs',
  'supplements.stack',
  'supplements.stack_item.substance_id',
  'supplements.daily_totals',
  'nutrition.protein_intake_g_per_kg',
  'nutrition.daily.protein_g',
  'training.resistance_sessions_per_week',
  'training.load_spike',
  'profile.age',
  'profile.sex',
  'profile.pregnancy_planned',
])

const partial = new Set([
  'nutrition.d_vitamin_dietary_low',
  'nutrition.magnesium_dietary_low',
  'nutrition.caffeine_mg_day',
])

const missingAliases = new Map([
  ['medical.symptoms', 'medical.symptoms'],
  ['medical.lab_draw_scheduled_within_days', 'medical.lab_draw_scheduled_within_days'],
  ['medical.labs[].analyte', 'medical.labs[].analyte'],
  ['medical.glucose_meter_user', 'medical.glucose_meter_user'],
  ['medical.$ANY', 'medical.$ANY'],
  ['supplements.daily_total_mg', 'supplements.daily_total_mg'],
  ['supplements.computed.stimulant_load_mg_caffeine_equiv', 'supplements.computed.stimulant_load_mg_caffeine_equiv'],
  ['nutrition.fish_servings_per_week', 'nutrition.daily.fish_servings_week'],
  ['nutrition.dairy_servings_day', 'nutrition.daily.dairy_servings_day'],
  ['location.low_sun', 'location.low_sun'],
  ['lifestyle.indoor_dominant', 'profile.indoor_dominant'],
  ['profile.indoor_dominant', 'profile.indoor_dominant'],
  ['profile.athlete_tested_pool', 'profile.athlete_tested_pool'],
  ['sleep.sleep_latency_min', 'sleep.sleep_latency_min'],
  ['sleep.quality_score', 'sleep.quality_score'],
  ['sleep.tracked_nights', 'sleep.tracked_nights'],
])

function conditionInputs(rule: Rule): string[] {
  const out = new Set<string>()
  for (const c of rule.conditions ?? []) {
    const module = String(c.module ?? '')
    const field = String(c.field ?? '')
    if (field === '(see gap_condition)' && typeof rule.gap_condition === 'string') {
      for (const token of rule.gap_condition.match(/[a-z]+(?:\.[a-z0-9_]+)+/gi) ?? []) {
        out.add(token)
      }
    } else {
      out.add(`${module}.${field}`)
    }
  }
  return [...out]
}

function inputStatus(input: string): InputStatus {
  if (available.has(input)) return 'available'
  if (partial.has(input)) return 'partial'
  if (missingAliases.has(input)) return 'missing'
  return 'missing'
}

function ruleStatus(rule: Rule): Status {
  const inputs = conditionInputs(rule)
  const statuses = inputs.map(inputStatus)
  if (statuses.length > 0 && statuses.every(status => status === 'available')) return 'auswertbar'
  if (statuses.some(status => status === 'available' || status === 'partial')) return 'teilweise'
  return 'blockiert'
}

const rules = FILES.flatMap(file => readJsonl(file))
if (rules.length !== 64) fail(`Kimi-Regeln: ${rules.length}, erwartet 64`)

const byFile = new Map<string, Record<Status, number>>()
const perRule: Array<{ file: string; id: string; status: Status; missing: string[] }> = []
for (const rule of rules) {
  const status = ruleStatus(rule)
  const inputs = conditionInputs(rule)
  const missing = inputs
    .filter(input => inputStatus(input) === 'missing')
    .map(input => missingAliases.get(input) ?? input)
  if (!byFile.has(rule.file)) byFile.set(rule.file, { auswertbar: 0, teilweise: 0, blockiert: 0 })
  byFile.get(rule.file)![status]++
  perRule.push({ file: rule.file, id: rule.id, status, missing })
}

console.log('C-132 Kimi-Regel-Eingaenge nach C-130/C-131')
for (const file of FILES) {
  const counts = byFile.get(file) ?? { auswertbar: 0, teilweise: 0, blockiert: 0 }
  console.log(`  ${file}: ${counts.auswertbar} auswertbar, ${counts.teilweise} teilweise, ${counts.blockiert} blockiert`)
}
const total = [...byFile.values()].reduce((acc, row) => ({
  auswertbar: acc.auswertbar + row.auswertbar,
  teilweise: acc.teilweise + row.teilweise,
  blockiert: acc.blockiert + row.blockiert,
}), { auswertbar: 0, teilweise: 0, blockiert: 0 })
console.log(`  Gesamt: ${total.auswertbar} auswertbar, ${total.teilweise} teilweise, ${total.blockiert} blockiert`)

const example = perRule.find(row => row.missing.includes('sleep.sleep_latency_min'))
  ?? perRule.find(row => row.missing.length > 0)
if (example) {
  console.log(`  missing_input Beispiel: ${example.id} -> ${example.missing.join(', ')}`)
}

if (total.auswertbar < 22) fail(`Auswertbare Regeln ${total.auswertbar}, erwartet mindestens 22`)
