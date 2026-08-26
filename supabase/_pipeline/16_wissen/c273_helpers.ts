import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

export type Json = Record<string, any>

export const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
export const DB = process.env.PGDATABASE ?? 'postgres'
export const BASE = 'docs/kimi_research/supplement_performance_database/data'

export function readJson(file: string): any {
  return JSON.parse(fs.readFileSync(path.join(BASE, file), 'utf8'))
}

export function readJsonl(file: string): Json[] {
  return fs.readFileSync(path.join(BASE, file), 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line))
}

export function registryRows(data: any): Json[] {
  if (Array.isArray(data)) return data
  if (!data || typeof data !== 'object') return []
  for (const key of ['records', 'items', 'entries', 'constants', 'formulas', 'modalities', 'signals', 'structures']) {
    if (Array.isArray(data[key])) return data[key]
  }
  return Object.values(data).filter((value) => value && typeof value === 'object' && !Array.isArray(value)) as Json[]
}

export function csvJson(rows: Json[]): string {
  return rows.map((row) => `"${JSON.stringify(row).replace(/"/g, '""')}"`).join('\n')
}

export function run(sql: string): void {
  const result = spawnSync('docker', ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', DB, '-v', 'ON_ERROR_STOP=1', '-f', '-'], {
    input: sql,
    encoding: 'utf8',
    maxBuffer: 512 * 1024 * 1024,
  })
  process.stdout.write(result.stdout)
  process.stderr.write(result.stderr)
  if (result.status !== 0) process.exit(result.status ?? 1)
}

export function expectEqual(name: string, value: number, expected: number): void {
  if (value !== expected) throw new Error(`${name}: ${value}, erwartet ${expected}`)
}

export function scalarCount(data: any, key: string): number {
  const value = data?.[key]
  if (Array.isArray(value)) return value.length
  if (value && typeof value === 'object') return Object.keys(value).length
  return value == null ? 0 : 1
}
