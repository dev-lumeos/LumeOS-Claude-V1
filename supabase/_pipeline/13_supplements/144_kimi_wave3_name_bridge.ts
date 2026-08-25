#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const BASE = 'backup/kimi-research/Kimi_Agent/supplement_performance_database/data'

function run(sql: string): void {
  const result = spawnSync('docker', ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', DB, '-v', 'ON_ERROR_STOP=1', '-f', '-'], {
    input: sql,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  })
  if (result.status !== 0) {
    process.stderr.write(result.stdout)
    process.stderr.write(result.stderr)
    process.exit(result.status ?? 1)
  }
  process.stdout.write(result.stdout)
  process.stderr.write(result.stderr)
}
function csvJson(rows: any[]): string {
  return rows.map((row) => `"${JSON.stringify(row).replace(/"/g, '""')}"`).join('\n')
}

const lookup = JSON.parse(fs.readFileSync(path.join(BASE, 'admin/_canonical_id_lookup.json'), 'utf8'))

const sql = `\\set ON_ERROR_STOP on
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE supplements.supplements
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES supplements.supplements(id) ON DELETE SET NULL;

DROP TABLE IF EXISTS tmp_c262_lookup;
CREATE TEMP TABLE tmp_c262_lookup (payload jsonb NOT NULL);
\\copy tmp_c262_lookup(payload) FROM STDIN WITH (FORMAT csv)
${csvJson([lookup])}
\\.

CREATE TEMP TABLE tmp_c262_names AS
SELECT key AS alias, value::text AS target_id
FROM tmp_c262_lookup, jsonb_each_text(payload);

DELETE FROM supplements.supplement_aliases WHERE source IN ('kimi:_canonical_id_lookup', 'kimi:f05_parent_resolution');

INSERT INTO supplements.supplement_aliases(supplement_id, alias, locale, source, confidence)
SELECT DISTINCT s.id, n.alias, 'und', 'kimi:_canonical_id_lookup', 1.0
FROM tmp_c262_names n
JOIN supplements.supplements s ON s.slug = n.target_id
WHERE n.target_id LIKE 'sub_%'
  AND n.alias <> ''
  AND lower(n.alias) <> lower(coalesce(s.name_en, s.name_de, ''));

WITH f05 AS (
  SELECT s.id, s.name_en, s.name_de, lower(coalesce(s.name_en, s.name_de, s.slug)) AS lookup_name
  FROM supplements.supplements s
  WHERE s.source = 'f05_substance_candidate'
), resolved AS (
  SELECT f05.id AS child_id, parent.id AS parent_id, f05.name_en AS child_name_en, f05.name_de AS child_name_de
  FROM f05
  JOIN tmp_c262_names n ON lower(n.alias) = f05.lookup_name
  JOIN supplements.supplements parent ON parent.slug = n.target_id
  WHERE parent.id <> f05.id
)
UPDATE supplements.supplements child
SET parent_id = resolved.parent_id,
    updated_at = now()
FROM resolved
WHERE child.id = resolved.child_id;

WITH resolved AS (
  SELECT child.id AS child_id, parent.id AS parent_id, coalesce(child.name_en, child.name_de) AS alias
  FROM supplements.supplements child
  JOIN supplements.supplements parent ON parent.id = child.parent_id
  WHERE child.source = 'f05_substance_candidate'
)
INSERT INTO supplements.supplement_aliases(supplement_id, alias, locale, source, confidence)
SELECT DISTINCT parent_id, alias, 'und', 'kimi:f05_parent_resolution', 1.0
FROM resolved
WHERE alias IS NOT NULL AND alias <> ''
ON CONFLICT DO NOTHING;

-- C-262: Unterformen sind fachlicher Inhalt. Sie bleiben Kinder, aber
-- im_katalog darf parent_id nicht als Sichtbarkeits-Ausschluss nutzen.
ALTER TABLE supplements.supplements DROP COLUMN IF EXISTS im_katalog;
ALTER TABLE supplements.supplements ADD COLUMN im_katalog boolean GENERATED ALWAYS AS (
  coalesce(description_en,'') <> ''
  OR coalesce(description_de,'') <> ''
  OR evidence_grade IS NOT NULL
) STORED;

COMMIT;
`

run(sql)
