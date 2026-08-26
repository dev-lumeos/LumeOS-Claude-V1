#!/usr/bin/env node
import { csvJson, expectEqual, readJson, registryRows, run } from './c273_helpers'

const files = [
  'evidence/constant_evidence_registry.json',
  'evidence/formula_evidence_registry.json',
  'evidence/recovery_modality_evidence.json',
  'evidence/fatigue_signal_evidence.json',
  'evidence/training_structure_registry.json',
]

const rows = files.flatMap((source_file) => {
  const registry_name = source_file.split('/').pop()!.replace(/\.json$/, '')
  return registryRows(readJson(source_file)).map((raw, index) => ({ registry_name, source_file, index, raw }))
})

expectEqual('register_rows', rows.length, 265)
expectEqual('current_value_null', rows.filter((row) => row.raw?.current_value === null).length, 265)

const payload = {
  rows,
  expected: {
    rows: Number(process.env.C273_EXPECT_REGISTER_ROWS ?? 265),
    currentValueNull: 265,
  },
}

run(`
\\set ON_ERROR_STOP on
BEGIN;

CREATE TEMP TABLE tmp_c273(payload jsonb);
COPY tmp_c273(payload) FROM stdin CSV QUOTE '"';
${csvJson([payload])}
\\.

DELETE FROM wissen.evidence_register_entries WHERE source = 'kimi:c273';

WITH payload AS (SELECT payload FROM tmp_c273),
rows AS (
  SELECT value AS item
  FROM payload, jsonb_array_elements(payload->'rows') AS value
)
INSERT INTO wissen.evidence_register_entries(registry_name, entry_key, current_value, raw, source_file)
SELECT
  item->>'registry_name',
  coalesce(item->'raw'->>'id', item->'raw'->>'key', item->'raw'->>'constant_id', item->'raw'->>'formula_id', item->>'index'),
  item->'raw'->'current_value',
  item->'raw',
  item->>'source_file'
FROM rows;

DO $$
DECLARE
  e jsonb;
  v_rows int;
  v_null int;
BEGIN
  SELECT payload->'expected' INTO e FROM tmp_c273;
  SELECT count(*), count(*) FILTER (WHERE current_value = 'null'::jsonb)
    INTO v_rows, v_null
  FROM wissen.evidence_register_entries
  WHERE source = 'kimi:c273';

  IF v_rows <> (e->>'rows')::int THEN RAISE EXCEPTION 'C-273 Block2 Register %, erwartet %', v_rows, e->>'rows'; END IF;
  IF v_null <> (e->>'currentValueNull')::int THEN RAISE EXCEPTION 'C-273 Block2 current_value null %, erwartet %', v_null, e->>'currentValueNull'; END IF;

  RAISE NOTICE 'OK C-273 Block2 Register: % Eintraege, % current_value null', v_rows, v_null;
END $$;

COMMIT;
`)
