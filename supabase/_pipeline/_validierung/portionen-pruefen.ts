#!/usr/bin/env node
import { execFileSync } from 'node:child_process'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const SEP = '\u0001'

function sql(query: string): string[][] {
  return execFileSync(
    'docker',
    ['exec', CONTAINER, 'psql', '-U', 'postgres', '-d', DB, '-t', '-A', '-F', SEP, '-c', query],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  )
    .split('\n')
    .map(line => line.trimEnd())
    .filter(Boolean)
    .map(line => line.split(SEP))
}

function sqlLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

function countScalar(query: string): number {
  return Number(sql(query)[0]?.[0] ?? 0)
}

function hasPortion(code: string, nameDe: string, mustBeDefault = false): boolean {
  const rows = sql(`
    SELECT EXISTS (
      SELECT 1
      FROM nutrition.foods f
      JOIN nutrition.foods_portions p ON p.food_id = f.id
      WHERE f.bls_code = ${sqlLiteral(code)}
        AND p.name_de = ${sqlLiteral(nameDe)}
        ${mustBeDefault ? 'AND p.is_default' : ''}
    )::text;`)
  return rows[0]?.[0] === 'true'
}

const errors: string[] = []

const expectedPresent: [string, string, string][] = [
  ['B101000', '1 Scheibe', 'Vollkornbrot'],
  ['Q120000', '1 EL', 'Oliven\u00f6l'],
  ['X912033', '100 g', 'Fertiggericht/Pizza Margherita'],
  ['E111100', '1 Ei (Gr\u00f6\u00dfe M)', 'H\u00fchnerei roh'],
  ['C352000', '1 Portion roh', 'Reis poliert, roh'],
]

for (const [code, portion, label] of expectedPresent) {
  if (!hasPortion(code, portion)) {
    errors.push(`Soll fehlt: ${code} ${label} muss Portion "${portion}" tragen`)
  }
}

const expectedDefaults: [string, string, string][] = [
  ['B101000', '1 Scheibe', 'Vollkornbrot'],
  ['Q120000', '1 EL', 'Oliven\u00f6l'],
  ['E111100', '1 Ei (Gr\u00f6\u00dfe M)', 'H\u00fchnerei roh'],
  ['F503100', '1 St\u00fcck (mittel)', 'Banane'],
]

for (const [code, portion, label] of expectedDefaults) {
  if (!hasPortion(code, portion, true)) {
    errors.push(`Vorgabe falsch: ${code} ${label} muss "${portion}" als Default tragen`)
  }
}

const multiDefault = countScalar(`
  SELECT COUNT(*)
  FROM (
    SELECT food_id
    FROM nutrition.foods_portions
    WHERE is_default
    GROUP BY food_id
    HAVING COUNT(*) > 1
  ) d;`)
if (multiDefault !== 0) errors.push(`${multiDefault} Foods tragen mehr als eine Vorgabeportion`)

const missingDefault = countScalar(`
  SELECT COUNT(*)
  FROM (
    SELECT food_id
    FROM nutrition.foods_portions
    GROUP BY food_id
    HAVING COUNT(*) FILTER (WHERE is_default) = 0
  ) d;`)
if (missingDefault !== 0) errors.push(`${missingDefault} Foods tragen Portionen, aber keine Vorgabeportion`)

const badAmounts = countScalar(`SELECT COUNT(*) FROM nutrition.foods_portions WHERE amount_g <= 0;`)
if (badAmounts !== 0) errors.push(`${badAmounts} Portionen haben amount_g <= 0`)

const orphaned = countScalar(`
  SELECT COUNT(*)
  FROM nutrition.foods_portions p
  LEFT JOIN nutrition.foods f ON f.id = p.food_id
  WHERE f.id IS NULL;`)
if (orphaned !== 0) errors.push(`${orphaned} Portionen zeigen auf kein Food`)

const total = countScalar(`SELECT COUNT(*) FROM nutrition.foods_portions;`)
const foodsWith = countScalar(`SELECT COUNT(DISTINCT food_id) FROM nutrition.foods_portions;`)
const foodsWithout = countScalar(`
  SELECT COUNT(*)
  FROM nutrition.foods f
  WHERE NOT EXISTS (SELECT 1 FROM nutrition.foods_portions p WHERE p.food_id = f.id);`)
const non100Defaults = countScalar(`
  SELECT COUNT(DISTINCT food_id)
  FROM nutrition.foods_portions
  WHERE is_default
    AND name_de <> '100 g';`)
const default100 = countScalar(`
  SELECT COUNT(DISTINCT food_id)
  FROM nutrition.foods_portions
  WHERE is_default
    AND name_de = '100 g';`)

console.log('Portionen-Pruefung')
console.log(`  Portionszeilen: ${total}`)
console.log(`  Foods mit Portion: ${foodsWith}`)
console.log(`  Foods ohne Portion: ${foodsWithout}`)
console.log(`  Vorgabe ungleich 100 g: ${non100Defaults}`)
console.log(`  Vorgabe 100 g: ${default100}`)
console.log(`  Mehrfach-Defaults: ${multiDefault}`)
console.log(`  Fehlende Defaults: ${missingDefault}`)

if (errors.length) {
  console.error('')
  console.error(`FEHLER: ${errors.length}`)
  for (const error of errors) console.error(`  ${error}`)
  process.exit(1)
}

console.log('OK: Pflichtfaelle und Struktur stimmen.')
