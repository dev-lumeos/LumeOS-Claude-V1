#!/usr/bin/env node
// C-158: maschinenlesbare Bruecke Supplement/Substanz -> BLS-Naehrstoffcode.
// Nur belegte Portionsmengen werden eingespielt; offene IU/DFE-Faelle bleiben
// in der Datendatei dokumentiert und werden nicht geraten.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const INPUT = 'supabase/_pipeline/daten/supplement-naehrstoffcodes.json'

type Mapping = {
  id: string
  supplement_slug: string
  substance_id: string
  nutrient_code: string
  amount_original: number
  unit_original: string
  amount_nutrient_unit: number
  nutrient_unit: string
  conversion_status: string
  conversion_factor: number
  conversion_source_id?: string
  source: string
  notes?: string
}

type DataFile = {
  version: number
  unit_sources: Array<{ id: string }>
  open_unit_collisions: unknown[]
  mappings: Mapping[]
}

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function readData(): DataFile {
  if (!fs.existsSync(INPUT)) fail(`${INPUT} fehlt`)
  const data = JSON.parse(fs.readFileSync(INPUT, 'utf8')) as DataFile
  if (data.version !== 1) fail(`${INPUT}: version muss 1 sein`)
  if (!Array.isArray(data.unit_sources) || data.unit_sources.length === 0) fail(`${INPUT}: unit_sources fehlen`)
  if (!Array.isArray(data.open_unit_collisions)) fail(`${INPUT}: open_unit_collisions fehlt`)
  if (!Array.isArray(data.mappings) || data.mappings.length === 0) fail(`${INPUT}: mappings fehlen`)

  const unitSources = new Set(data.unit_sources.map(s => s.id))
  const ids = new Set<string>()
  for (const row of data.mappings) {
    if (!row.id || ids.has(row.id)) fail(`${INPUT}: id fehlt oder doppelt (${row.id})`)
    ids.add(row.id)
    if (!row.supplement_slug) fail(`${INPUT}:${row.id}: supplement_slug fehlt`)
    if (!row.substance_id) fail(`${INPUT}:${row.id}: substance_id fehlt`)
    if (!row.nutrient_code) fail(`${INPUT}:${row.id}: nutrient_code fehlt`)
    if (!Number.isFinite(row.amount_original) || row.amount_original <= 0) fail(`${INPUT}:${row.id}: amount_original ungueltig`)
    if (!Number.isFinite(row.amount_nutrient_unit) || row.amount_nutrient_unit <= 0) fail(`${INPUT}:${row.id}: amount_nutrient_unit ungueltig`)
    if (!row.unit_original || !row.nutrient_unit) fail(`${INPUT}:${row.id}: Einheit fehlt`)
    if (!row.source) fail(`${INPUT}:${row.id}: source fehlt`)
    if (row.conversion_status === 'source_converted' && !unitSources.has(String(row.conversion_source_id ?? ''))) {
      fail(`${INPUT}:${row.id}: conversion_source_id fehlt oder ist unbekannt`)
    }
  }
  return data
}

function runPsql(data: DataFile): void {
  const payload = data.mappings.map(row => csvCell(JSON.stringify(row))).join('\n')
  const expectedRows = data.mappings.length
  const expectedOpen = data.open_unit_collisions.length

  const sql = `\\set ON_ERROR_STOP on
BEGIN;

CREATE TABLE IF NOT EXISTS supplements.supplement_nutrient_mappings (
  id                    TEXT PRIMARY KEY,
  supplement_id         UUID NOT NULL REFERENCES supplements.supplement_catalog(id) ON DELETE CASCADE,
  supplement_slug       TEXT NOT NULL,
  substance_id          TEXT NOT NULL REFERENCES supplements.substance_catalog(id) ON DELETE CASCADE,
  nutrient_code         TEXT NOT NULL REFERENCES nutrition.nutrient_defs(code),
  amount_original       NUMERIC NOT NULL CHECK (amount_original > 0),
  unit_original         TEXT NOT NULL,
  amount_nutrient_unit  NUMERIC NOT NULL CHECK (amount_nutrient_unit > 0),
  nutrient_unit         TEXT NOT NULL,
  conversion_status     TEXT NOT NULL CHECK (conversion_status IN (
                          'same_unit', 'si_converted', 'source_converted'
                        )),
  conversion_factor     NUMERIC NOT NULL CHECK (conversion_factor > 0),
  conversion_source_id  TEXT,
  source                TEXT NOT NULL,
  notes                 TEXT,
  raw                   JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (supplement_id, nutrient_code),
  UNIQUE (substance_id, nutrient_code)
);

CREATE INDEX IF NOT EXISTS supplement_nutrient_mappings_supplement_idx
  ON supplements.supplement_nutrient_mappings(supplement_id);
CREATE INDEX IF NOT EXISTS supplement_nutrient_mappings_substance_idx
  ON supplements.supplement_nutrient_mappings(substance_id);
CREATE INDEX IF NOT EXISTS supplement_nutrient_mappings_nutrient_idx
  ON supplements.supplement_nutrient_mappings(nutrient_code);

DROP TRIGGER IF EXISTS supplement_nutrient_mappings_touch_updated_at
  ON supplements.supplement_nutrient_mappings;
CREATE TRIGGER supplement_nutrient_mappings_touch_updated_at
  BEFORE UPDATE ON supplements.supplement_nutrient_mappings
  FOR EACH ROW EXECUTE FUNCTION supplements.touch_updated_at();

ALTER TABLE supplements.supplement_nutrient_mappings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS supplement_nutrient_mappings_select
  ON supplements.supplement_nutrient_mappings;
CREATE POLICY supplement_nutrient_mappings_select
  ON supplements.supplement_nutrient_mappings
  FOR SELECT TO authenticated USING (true);

GRANT SELECT ON supplements.supplement_nutrient_mappings TO authenticated;
GRANT ALL ON supplements.supplement_nutrient_mappings TO service_role;

CREATE TEMP TABLE tmp_supplement_nutrient_mappings (
  payload TEXT NOT NULL
) ON COMMIT DROP;

COPY tmp_supplement_nutrient_mappings(payload) FROM STDIN WITH (FORMAT csv);
${payload}
\\.

DELETE FROM supplements.supplement_nutrient_mappings;

WITH parsed AS (
  SELECT payload::jsonb AS p
  FROM tmp_supplement_nutrient_mappings
),
resolved AS (
  SELECT
    p,
    sc.id AS supplement_id,
    s.id AS substance_id,
    nd.code AS nutrient_code,
    nd.unit AS nutrient_unit
  FROM parsed
  JOIN supplements.supplement_catalog sc ON sc.slug = p->>'supplement_slug'
  JOIN supplements.substance_catalog s ON s.id = p->>'substance_id'
  JOIN nutrition.nutrient_defs nd ON nd.code = p->>'nutrient_code'
)
INSERT INTO supplements.supplement_nutrient_mappings (
  id, supplement_id, supplement_slug, substance_id, nutrient_code,
  amount_original, unit_original, amount_nutrient_unit, nutrient_unit,
  conversion_status, conversion_factor, conversion_source_id, source, notes, raw
)
SELECT
  p->>'id',
  supplement_id,
  p->>'supplement_slug',
  substance_id,
  nutrient_code,
  (p->>'amount_original')::numeric,
  p->>'unit_original',
  (p->>'amount_nutrient_unit')::numeric,
  nutrient_unit,
  p->>'conversion_status',
  (p->>'conversion_factor')::numeric,
  NULLIF(p->>'conversion_source_id', ''),
  p->>'source',
  NULLIF(p->>'notes', ''),
  p
FROM resolved;

WITH supplement_payload AS (
  SELECT
    supplement_id,
    jsonb_object_agg(
      nutrient_code,
      jsonb_build_object(
        'amount', amount_nutrient_unit,
        'unit', nutrient_unit,
        'source', source,
        'mapping_id', id,
        'conversion_status', conversion_status
      )
      ORDER BY nutrient_code
    ) AS nutrients
  FROM supplements.supplement_nutrient_mappings
  GROUP BY supplement_id
)
UPDATE supplements.supplement_catalog c
SET nutrients_provided = p.nutrients
FROM supplement_payload p
WHERE p.supplement_id = c.id;

WITH substance_payload AS (
  SELECT
    substance_id,
    jsonb_object_agg(
      nutrient_code,
      jsonb_build_object(
        'amount', amount_nutrient_unit,
        'unit', nutrient_unit,
        'source', source,
        'mapping_id', id,
        'conversion_status', conversion_status
      )
      ORDER BY nutrient_code
    ) AS nutrients
  FROM supplements.supplement_nutrient_mappings
  GROUP BY substance_id
)
UPDATE supplements.substance_catalog s
SET
  nutrients_provided = p.nutrients,
  nutrient_mapping_status = 'c158_supplement_nutrient_mapping'
FROM substance_payload p
WHERE p.substance_id = s.id;

CREATE OR REPLACE FUNCTION supplements.supplement_nutrient_intake_for_day(
  p_user_id UUID,
  p_entry_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  user_id UUID,
  intake_date DATE,
  nutrient_code TEXT,
  nutrient_unit TEXT,
  total_amount NUMERIC,
  taken_log_count INTEGER,
  skipped_log_count INTEGER,
  mapped_taken_log_count INTEGER,
  unmapped_taken_log_count INTEGER
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH logs AS (
    SELECT
      il.user_id,
      il.intake_date,
      il.status,
      COALESCE(il.actual_dose, il.dose_snapshot) AS dose_amount,
      COALESCE(il.actual_dose_unit, il.dose_unit_snapshot) AS dose_unit,
      si.supplement_id,
      c.serving_size,
      c.serving_unit
    FROM supplements.intake_logs il
    JOIN supplements.stack_items si ON si.id = il.stack_item_id
    JOIN supplements.supplement_catalog c ON c.id = si.supplement_id
    WHERE il.user_id = p_user_id
      AND il.intake_date = p_entry_date
  ),
  taken AS (
    SELECT *
    FROM logs
    WHERE status = 'taken'
  ),
  mapped AS (
    SELECT
      t.user_id,
      t.intake_date,
      m.nutrient_code,
      m.nutrient_unit,
      (t.dose_amount / NULLIF(t.serving_size, 0)) * m.amount_nutrient_unit AS amount
    FROM taken t
    JOIN supplements.supplement_nutrient_mappings m ON m.supplement_id = t.supplement_id
    WHERE t.dose_unit = t.serving_unit
      AND t.serving_size IS NOT NULL
      AND t.dose_amount IS NOT NULL
  ),
  counts AS (
    SELECT
      count(*) FILTER (WHERE status = 'taken')::integer AS taken_count,
      count(*) FILTER (WHERE status = 'skipped')::integer AS skipped_count,
      count(*) FILTER (WHERE status = 'taken' AND EXISTS (
        SELECT 1 FROM supplements.supplement_nutrient_mappings m
        WHERE m.supplement_id = logs.supplement_id
      ))::integer AS mapped_taken_count,
      count(*) FILTER (WHERE status = 'taken' AND NOT EXISTS (
        SELECT 1 FROM supplements.supplement_nutrient_mappings m
        WHERE m.supplement_id = logs.supplement_id
      ))::integer AS unmapped_taken_count
    FROM logs
  )
  SELECT
    p_user_id,
    p_entry_date,
    m.nutrient_code,
    m.nutrient_unit,
    sum(m.amount) AS total_amount,
    c.taken_count,
    c.skipped_count,
    c.mapped_taken_count,
    c.unmapped_taken_count
  FROM mapped m
  CROSS JOIN counts c
  GROUP BY m.nutrient_code, m.nutrient_unit, c.taken_count, c.skipped_count,
           c.mapped_taken_count, c.unmapped_taken_count
  ORDER BY m.nutrient_code;
$$;

COMMENT ON TABLE supplements.supplement_nutrient_mappings IS
  'C-158: Kuratierte Bruecke von Standard-Supplements/Substanzen auf BLS-Naehrstoffcodes. Menge je Katalogportion, keine Dosierungsempfehlung.';
COMMENT ON FUNCTION supplements.supplement_nutrient_intake_for_day(UUID, DATE) IS
  'C-158: Summiert tatsaechlich genommene Supplement-Naehrstoffe eines Tages aus intake_logs und supplement_nutrient_mappings; keine Bewertung.';

REVOKE ALL ON FUNCTION supplements.supplement_nutrient_intake_for_day(UUID, DATE) FROM PUBLIC;
REVOKE ALL ON FUNCTION supplements.supplement_nutrient_intake_for_day(UUID, DATE) FROM anon;
GRANT EXECUTE ON FUNCTION supplements.supplement_nutrient_intake_for_day(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION supplements.supplement_nutrient_intake_for_day(UUID, DATE) TO service_role;

DO $$
DECLARE
  v_rows integer;
  v_supplements integer;
  v_substances integer;
  v_open integer := ${expectedOpen};
BEGIN
  SELECT count(*) INTO v_rows FROM supplements.supplement_nutrient_mappings;
  SELECT count(*) INTO v_supplements FROM supplements.supplement_catalog WHERE nutrients_provided <> '{}'::jsonb;
  SELECT count(*) INTO v_substances FROM supplements.substance_catalog WHERE nutrients_provided <> '{}'::jsonb;

  IF v_rows <> ${expectedRows} THEN
    RAISE EXCEPTION 'supplement_nutrient_mappings: %, erwartet ${expectedRows}', v_rows;
  END IF;
  IF v_supplements <> ${expectedRows} THEN
    RAISE EXCEPTION 'supplement_catalog.nutrients_provided: %, erwartet ${expectedRows}', v_supplements;
  END IF;
  IF v_substances <> ${expectedRows} THEN
    RAISE EXCEPTION 'substance_catalog.nutrients_provided: %, erwartet ${expectedRows}', v_substances;
  END IF;
  IF v_open <> 3 THEN
    RAISE EXCEPTION 'C-158 offene Einheitenkollisionen: %, erwartet 3', v_open;
  END IF;

  RAISE NOTICE 'OK C-158: % Supplement-Naehrstoffzuordnungen, % offene Einheitenkollisionen',
    v_rows, v_open;
END $$;

COMMIT;
`

  const result = spawnSync(
    'docker',
    ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', DB, '-v', 'ON_ERROR_STOP=1', '-f', '-'],
    { input: sql, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] },
  )
  if (result.status !== 0) {
    process.stderr.write(result.stderr)
    process.stdout.write(result.stdout)
    fail(`psql fehlgeschlagen (${result.status})`)
  }
  process.stdout.write(result.stdout)
  process.stderr.write(result.stderr)
}

runPsql(readData())
