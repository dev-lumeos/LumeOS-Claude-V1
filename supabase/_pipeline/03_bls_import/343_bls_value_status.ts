#!/usr/bin/env node
// C-343/E-38: BLS-Wertzustand aus der Arbeitsmappe in die EAV-Tabelle heben.
// Keine Grenzwerte werden erfunden: nur zensierte <LOD>/<LOQ werden nach
// E-38 als Lower Bound 0 gespeichert; fehlend und Spuren bleiben NULL.
import { spawnSync } from 'node:child_process'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const XLSX = 'docs/BrainstormDocs/Nutrition/BLS_4_0_Daten_2025_DE.xlsx'
const SOURCE = 'bls_4_0_xlsx_status_import'

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

function runPsql(sql: string): void {
  const result = spawnSync('docker', [
    'exec', '-i', CONTAINER,
    'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB, '-f', '-',
  ], { input: sql, encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 })
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.status !== 0) process.exit(result.status ?? 1)
}

function readBlsCsv(): string {
  const python = String.raw`
import csv
import io
import sys
from pathlib import Path

import openpyxl

path = Path(sys.argv[1])
if not path.exists():
    print(f"BLS-XLSX fehlt: {path}", file=sys.stderr)
    sys.exit(1)

wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
ws = wb.active
headers = [cell.value for cell in next(ws.iter_rows(min_row=1, max_row=1))]
triples = []
for index, header in enumerate(headers):
    if isinstance(header, str) and header.endswith(' Datenherkunft'):
        code = header.removesuffix(' Datenherkunft').split(' ', 1)[0]
        triples.append((index - 1, index, code))

if len(triples) != 138:
    print(f"BLS: {len(triples)} statt 138 Herkunftsspalten", file=sys.stderr)
    sys.exit(1)

out = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', newline='')
writer = csv.writer(out, lineterminator='\n')
writer.writerow(['bls_code', 'nutrient_code', 'value', 'bls_value_status'])
for row in ws.iter_rows(min_row=2, values_only=True):
    bls_code = row[0]
    if not bls_code:
        continue
    for value_index, origin_index, nutrient_code in triples:
        value = row[value_index]
        origin = row[origin_index]
        if origin == 'Logische Null':
            if value != 0:
                print(f"{bls_code}/{nutrient_code}: Logische Null ohne 0", file=sys.stderr)
                sys.exit(1)
            status, numeric = 'logical_zero', 0
        elif origin == 'Spuren':
            status, numeric = 'trace', ''
        elif origin == '-' or value is None or value == '-':
            status, numeric = 'missing', ''
        elif isinstance(value, str) and value.strip().upper().startswith('<LO'):
            status, numeric = 'censored', 0
        elif isinstance(value, (int, float)):
            status, numeric = 'measured', value
        else:
            print(f"{bls_code}/{nutrient_code}: unbekannter BLS-Wert {value!r} ({origin!r})", file=sys.stderr)
            sys.exit(1)
        writer.writerow([bls_code, nutrient_code, numeric, status])
out.flush()
`
  const result = spawnSync('python', ['-c', python, XLSX], {
    encoding: 'utf8',
    maxBuffer: 512 * 1024 * 1024,
  })
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.status !== 0) process.exit(result.status ?? 1)
  return result.stdout
}

const csv = readBlsCsv()
const sql = `\\set ON_ERROR_STOP on
BEGIN;

CREATE TEMP TABLE stage_bls_value_status (
  bls_code text NOT NULL,
  nutrient_code text NOT NULL,
  value numeric(12,5),
  bls_value_status text NOT NULL CHECK (bls_value_status IN ('measured', 'censored', 'missing', 'logical_zero', 'trace'))
) ON COMMIT DROP;

COPY stage_bls_value_status (bls_code, nutrient_code, value, bls_value_status) FROM STDIN WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');
${csv}\\.

DO $$
DECLARE
  v_rows integer;
  v_foods integer;
  v_codes integer;
  v_bad_values integer;
  v_unknown_foods integer;
  v_unknown_codes integer;
BEGIN
  SELECT count(*), count(DISTINCT bls_code), count(DISTINCT nutrient_code)
    INTO v_rows, v_foods, v_codes
  FROM stage_bls_value_status;
  IF v_rows <> 985320 OR v_foods <> 7140 OR v_codes <> 138 THEN
    RAISE EXCEPTION 'C-343: BLS-Matrix % Zeilen, % Lebensmittel, % Codes; erwartet 985320/7140/138', v_rows, v_foods, v_codes;
  END IF;

  SELECT count(*) INTO v_bad_values
  FROM stage_bls_value_status
  WHERE (bls_value_status = 'censored' AND value <> 0)
     OR (bls_value_status IN ('missing', 'trace') AND value IS NOT NULL)
     OR (bls_value_status = 'logical_zero' AND value <> 0);
  IF v_bad_values <> 0 THEN
    RAISE EXCEPTION 'C-343: % Statuswerte verletzen Lower-Bound/Null-Regel', v_bad_values;
  END IF;

  SELECT count(*) INTO v_unknown_foods
  FROM stage_bls_value_status s LEFT JOIN nutrition.foods f ON f.bls_code = s.bls_code
  WHERE f.id IS NULL;
  SELECT count(*) INTO v_unknown_codes
  FROM stage_bls_value_status s LEFT JOIN nutrition.nutrient_defs d ON d.code = s.nutrient_code
  WHERE d.code IS NULL;
  IF v_unknown_foods <> 0 OR v_unknown_codes <> 0 THEN
    RAISE EXCEPTION 'C-343: % unbekannte Lebensmittel, % unbekannte Naehrstoffcodes', v_unknown_foods, v_unknown_codes;
  END IF;
END $$;

INSERT INTO nutrition.food_nutrients (food_id, nutrient_code, value, data_source, bls_value_status)
SELECT f.id, s.nutrient_code, s.value, '${SOURCE}', s.bls_value_status
FROM stage_bls_value_status s
JOIN nutrition.foods f ON f.bls_code = s.bls_code
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value,
  bls_value_status = EXCLUDED.bls_value_status;

-- Eingefrorene Mahlzeiten bleiben sonst beim alten JSON: nur die von E-38
-- entschiedenen Zensurwerte werden nachgetragen. Echte Luecken und Spuren
-- bekommen absichtlich keinen Schluessel und bleiben fuer C-48 unvollstaendig.
WITH censored_per_food AS (
  SELECT food_id, jsonb_object_agg(nutrient_code, 0::numeric) AS nutrients
  FROM nutrition.food_nutrients
  WHERE bls_value_status = 'censored'
  GROUP BY food_id
)
UPDATE nutrition.meal_items mi
SET nutrients = mi.nutrients || c.nutrients
FROM censored_per_food c
WHERE mi.food_source = 'bls'
  AND mi.food_id = c.food_id
  AND NOT mi.nutrients @> c.nutrients;

-- Die breite Tagesbilanz liest FIBT aus dem eingefrorenen Flachwert,
-- nicht aus dem JSON-Snapshot. E-38 gilt auch dort: die zensierte
-- BLS-Angabe ist Lower Bound 0, keine fehlende Position.
WITH censored_fiber_foods AS (
  SELECT food_id
  FROM nutrition.food_nutrients
  WHERE nutrient_code = 'FIBT'
    AND bls_value_status = 'censored'
)
UPDATE nutrition.meal_items mi
SET fibt = 0
FROM censored_fiber_foods c
WHERE mi.food_source = 'bls'
  AND mi.food_id = c.food_id
  AND mi.fibt IS NULL;

DO $$
DECLARE
  v_rows integer;
  v_measured integer;
  v_censored integer;
  v_missing integer;
  v_logical_zero integer;
  v_trace integer;
BEGIN
  SELECT
    count(*),
    count(*) FILTER (WHERE bls_value_status = 'measured'),
    count(*) FILTER (WHERE bls_value_status = 'censored'),
    count(*) FILTER (WHERE bls_value_status = 'missing'),
    count(*) FILTER (WHERE bls_value_status = 'logical_zero'),
    count(*) FILTER (WHERE bls_value_status = 'trace')
  INTO v_rows, v_measured, v_censored, v_missing, v_logical_zero, v_trace
  FROM nutrition.food_nutrients;
  IF (v_rows, v_measured, v_censored, v_missing, v_logical_zero, v_trace)
     <> (985320, 850896, 3870, 110188, 18566, 1800) THEN
    RAISE EXCEPTION 'C-343: unerwartete Statusmatrix %/%/%/%/%/%', v_rows, v_measured, v_censored, v_missing, v_logical_zero, v_trace;
  END IF;
END $$;

ANALYZE nutrition.food_nutrients;
COMMIT;
`

runPsql(sql)
console.log('C-343 OK: 985320 BLS-Wertzustande, 3870 Lower-Bound-Zensurwerte, 110188 echte Luecken, 1800 Spuren.')
