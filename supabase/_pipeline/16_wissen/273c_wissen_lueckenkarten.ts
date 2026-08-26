#!/usr/bin/env node
import { csvJson, expectEqual, readJson, readJsonl, registryRows, run } from './c273_helpers'

const resolved = readJsonl('evidence/knowledge_gap_resolution.jsonl').map((raw, index) => ({ dataset: 'knowledge_gap_resolution', source_file: 'knowledge_gap_resolution.jsonl', index, raw }))
const deps = readJsonl('evidence/knowledge_gap_dependency_map.jsonl').map((raw, index) => ({ dataset: 'knowledge_gap_dependency_map', source_file: 'knowledge_gap_dependency_map.jsonl', index, raw }))
const holds = registryRows(readJson('evidence/research_hold_registry.json')).map((raw, index) => ({ dataset: 'research_hold_registry', source_file: 'research_hold_registry.json', index, raw }))
const rows = [...resolved, ...deps, ...holds]

expectEqual('knowledge_gap_resolution', resolved.length, 56)
expectEqual('knowledge_gap_dependency_map', deps.length, 46)
expectEqual('research_hold_registry', holds.length, 305)

const payload = {
  rows,
  expected: {
    resolved: Number(process.env.C273_EXPECT_GAP_RESOLVED ?? 56),
    dependencies: 46,
    holds: 305,
    total: 407,
  },
}

run(`
\\set ON_ERROR_STOP on
BEGIN;

CREATE TEMP TABLE tmp_c273(payload jsonb);
COPY tmp_c273(payload) FROM stdin CSV QUOTE '"';
${csvJson([payload])}
\\.

DELETE FROM wissen.knowledge_gap_records WHERE source = 'kimi:c273';

WITH payload AS (SELECT payload FROM tmp_c273),
rows AS (
  SELECT value AS item
  FROM payload, jsonb_array_elements(payload->'rows') AS value
)
INSERT INTO wissen.knowledge_gap_records(dataset, record_key, gap_id, field_path, terminal_status, hold_category, raw, source_file)
SELECT
  item->>'dataset',
  (item->>'index') || ':' || coalesce(item->'raw'->>'gap_id', item->'raw'->>'dependency_id', item->'raw'->>'hold_id', item->'raw'->>'id', ''),
  coalesce(item->'raw'->>'gap_id', item->'raw'->>'id'),
  coalesce(item->'raw'->>'field', item->'raw'->>'field_path', item->'raw'->>'path'),
  coalesce(item->'raw'->>'terminal_status', item->'raw'->>'status'),
  coalesce(item->'raw'->>'hold_category', item->'raw'->>'category', item->'raw'->>'reason_type'),
  item->'raw',
  item->>'source_file'
FROM rows;

DO $$
DECLARE
  e jsonb;
  v_resolved int;
  v_deps int;
  v_holds int;
  v_total int;
  v_named_gap int;
BEGIN
  SELECT payload->'expected' INTO e FROM tmp_c273;
  SELECT
    count(*) FILTER (WHERE dataset = 'knowledge_gap_resolution'),
    count(*) FILTER (WHERE dataset = 'knowledge_gap_dependency_map'),
    count(*) FILTER (WHERE dataset = 'research_hold_registry'),
    count(*),
    count(*) FILTER (WHERE gap_id = 'kgap_852572baac')
  INTO v_resolved, v_deps, v_holds, v_total, v_named_gap
  FROM wissen.knowledge_gap_records
  WHERE source = 'kimi:c273';

  IF v_resolved <> (e->>'resolved')::int THEN RAISE EXCEPTION 'C-273 Block3 resolved %, erwartet %', v_resolved, e->>'resolved'; END IF;
  IF v_deps <> (e->>'dependencies')::int THEN RAISE EXCEPTION 'C-273 Block3 dependencies %, erwartet %', v_deps, e->>'dependencies'; END IF;
  IF v_holds <> (e->>'holds')::int THEN RAISE EXCEPTION 'C-273 Block3 holds %, erwartet %', v_holds, e->>'holds'; END IF;
  IF v_total <> (e->>'total')::int THEN RAISE EXCEPTION 'C-273 Block3 total %, erwartet %', v_total, e->>'total'; END IF;
  IF v_named_gap < 1 THEN RAISE EXCEPTION 'C-273 Block3 kgap_852572baac fehlt.'; END IF;

  RAISE NOTICE 'OK C-273 Block3 Lueckenkarten: resolved %, dependencies %, holds %, kgap_852572baac vorhanden', v_resolved, v_deps, v_holds;
END $$;

COMMIT;
`)
