import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

import { findingsInFile } from './migration-datenlogik-pruefen.mjs'

test('G-458/C-537: das UPDATE im C-537-Triggerhelfer ist keine Migrations-Datenoperation', () => {
  const findings = findingsInFile(
    '20260923093000_c537_materialized_meal_plan_days_count.sql',
    fs.readFileSync('supabase/migrations/20260923093000_c537_materialized_meal_plan_days_count.sql', 'utf8'),
  )
  assert.deepEqual(findings, [])
})

test('G-458/C-537: ein top-level Backfill bleibt eine Datenoperation', () => {
  assert.deepEqual(
    findingsInFile('20990101000001_c537_backfill.sql', 'UPDATE nutrition.meal_plans SET days_count = 35;'),
    ['20990101000001_c537_backfill.sql: UPDATE'],
  )
})

test('C-538: die leere private Storage-Bucket-Deklaration ist Struktur, keine Katalogdaten', () => {
  const file = '20260924090000_c538_mealcam_memory.sql'
  assert.deepEqual(
    findingsInFile(file, fs.readFileSync(`supabase/migrations/${file}`, 'utf8')),
    [],
  )
})

test('C-538: ein beliebiges top-level Storage-INSERT bleibt weiterhin rot', () => {
  assert.deepEqual(
    findingsInFile(
      '20990101000002_c538_storage_data.sql',
      "INSERT INTO storage.buckets (id, name) VALUES ('other', 'other');",
    ),
    ['20990101000002_c538_storage_data.sql: INSERT'],
  )
})
