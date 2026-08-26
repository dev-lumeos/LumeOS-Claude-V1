#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { BASE, csvJson, readJson, readJsonl, run } from './c273_helpers'

const adminDir = path.join(BASE, 'admin')
const rows: any[] = []

function add(dataset: string, source_file: string, rawRows: any[]) {
  rows.push(...rawRows.map((raw, index) => ({ dataset, source_file, index, raw })))
}

for (const file of fs.readdirSync(adminDir).sort()) {
  if (!file.endsWith('.json') && !file.endsWith('.jsonl')) continue
  const source_file = `admin/${file}`
  const dataset = file.replace(/\.(jsonl|json)$/, '')
  if (file.endsWith('.jsonl')) {
    add(dataset, source_file, readJsonl(source_file))
    continue
  }
  const data = readJson(source_file)
  if (Array.isArray(data)) {
    add(dataset, source_file, data)
  } else if (file === 'community_terminology.json') {
    add('community_terminology_terms', source_file, data.terms ?? [])
    add('community_terminology_aliases', source_file, data.aliases ?? [])
  } else if (file === 'community_usage_contexts.json') {
    add('community_usage_phase_rationales', source_file, data.phase_rationales ?? [])
    add('community_usage_concepts', source_file, data.community_concepts ?? [])
  } else if (file === 'community_intelligence_index.json') {
    add(dataset, source_file, Object.entries(data.index ?? {}).map(([key, value]) => ({ key, value })))
  } else if (file === 'community_intelligence_core_schema.json') {
    add('community_core_hard_boundaries', source_file, data.hard_boundaries ?? [])
    add('community_core_schema', source_file, [{ global_flags: data.global_flags, vocabularies: data.vocabularies, pattern_record_fields: data.pattern_record_fields }])
  } else {
    add(dataset, source_file, [data])
  }
}

const counts = {
  usagePatterns: rows.filter((row) => row.dataset === 'community_intelligence_patterns').length,
  exposurePatterns: rows.filter((row) => row.dataset === 'community_exposure_patterns').length,
  labPatterns: rows.filter((row) => row.dataset === 'community_lab_patterns').length,
  qualitySignals: rows.filter((row) => row.dataset === 'community_product_quality_signals').length,
  sideEffects: rows.filter((row) => row.dataset === 'community_side_effect_patterns').length,
  stackPatterns: rows.filter((row) => row.dataset === 'community_stack_patterns').length,
  scienceDelta: rows.filter((row) => row.dataset === 'community_science_delta').length,
  aliases: rows.filter((row) => row.dataset === 'community_terminology_aliases').length,
  sources: rows.filter((row) => row.dataset === 'community_sources').length,
}

const payload = {
  rows,
  expected: {
    usagePatterns: Number(process.env.C273_EXPECT_COMMUNITY_USAGE ?? 123),
    exposurePatterns: 86,
    labPatterns: 43,
    qualitySignals: 40,
    sideEffects: 37,
    stackPatterns: 31,
    scienceDelta: 30,
    aliases: 179,
    sources: 315,
    total: rows.length,
  },
}

run(`
\\set ON_ERROR_STOP on
BEGIN;

CREATE TEMP TABLE tmp_c273(payload jsonb);
COPY tmp_c273(payload) FROM stdin CSV QUOTE '"';
${csvJson([payload])}
\\.

DELETE FROM wissen.community_records WHERE source = 'kimi:c273';

WITH payload AS (SELECT payload FROM tmp_c273),
rows AS (
  SELECT value AS item
  FROM payload, jsonb_array_elements(payload->'rows') AS value
)
INSERT INTO wissen.community_records(dataset, record_key, admin_only, not_medical_recommendation, evidence_class, raw, source_file)
SELECT
  item->>'dataset',
  coalesce(item->'raw'->>'id', item->'raw'->>'pattern_id', item->'raw'->>'alias_id', item->'raw'->>'source_id', item->'raw'->>'key', item->>'index'),
  true,
  true,
  'E',
  item->'raw',
  item->>'source_file'
FROM rows;

DO $$
DECLARE
  e jsonb;
  v_usage int;
  v_exposure int;
  v_lab int;
  v_quality int;
  v_side int;
  v_stack int;
  v_delta int;
  v_aliases int;
  v_sources int;
  v_total int;
  v_admin int;
  v_not_med int;
  v_e int;
BEGIN
  SELECT payload->'expected' INTO e FROM tmp_c273;
  SELECT
    count(*) FILTER (WHERE dataset = 'community_intelligence_patterns'),
    count(*) FILTER (WHERE dataset = 'community_exposure_patterns'),
    count(*) FILTER (WHERE dataset = 'community_lab_patterns'),
    count(*) FILTER (WHERE dataset = 'community_product_quality_signals'),
    count(*) FILTER (WHERE dataset = 'community_side_effect_patterns'),
    count(*) FILTER (WHERE dataset = 'community_stack_patterns'),
    count(*) FILTER (WHERE dataset = 'community_science_delta'),
    count(*) FILTER (WHERE dataset = 'community_terminology_aliases'),
    count(*) FILTER (WHERE dataset = 'community_sources'),
    count(*),
    count(*) FILTER (WHERE admin_only),
    count(*) FILTER (WHERE not_medical_recommendation),
    count(*) FILTER (WHERE evidence_class = 'E')
  INTO v_usage, v_exposure, v_lab, v_quality, v_side, v_stack, v_delta, v_aliases, v_sources, v_total, v_admin, v_not_med, v_e
  FROM wissen.community_records
  WHERE source = 'kimi:c273';

  IF v_usage <> (e->>'usagePatterns')::int THEN RAISE EXCEPTION 'C-273 Block8 usage %, erwartet %', v_usage, e->>'usagePatterns'; END IF;
  IF v_exposure <> (e->>'exposurePatterns')::int THEN RAISE EXCEPTION 'C-273 Block8 exposure %, erwartet %', v_exposure, e->>'exposurePatterns'; END IF;
  IF v_lab <> (e->>'labPatterns')::int THEN RAISE EXCEPTION 'C-273 Block8 lab %, erwartet %', v_lab, e->>'labPatterns'; END IF;
  IF v_quality <> (e->>'qualitySignals')::int THEN RAISE EXCEPTION 'C-273 Block8 quality %, erwartet %', v_quality, e->>'qualitySignals'; END IF;
  IF v_side <> (e->>'sideEffects')::int THEN RAISE EXCEPTION 'C-273 Block8 side %, erwartet %', v_side, e->>'sideEffects'; END IF;
  IF v_stack <> (e->>'stackPatterns')::int THEN RAISE EXCEPTION 'C-273 Block8 stack %, erwartet %', v_stack, e->>'stackPatterns'; END IF;
  IF v_delta <> (e->>'scienceDelta')::int THEN RAISE EXCEPTION 'C-273 Block8 delta %, erwartet %', v_delta, e->>'scienceDelta'; END IF;
  IF v_aliases <> (e->>'aliases')::int THEN RAISE EXCEPTION 'C-273 Block8 aliases %, erwartet %', v_aliases, e->>'aliases'; END IF;
  IF v_sources <> (e->>'sources')::int THEN RAISE EXCEPTION 'C-273 Block8 sources %, erwartet %', v_sources, e->>'sources'; END IF;
  IF v_total <> (e->>'total')::int THEN RAISE EXCEPTION 'C-273 Block8 total %, erwartet %', v_total, e->>'total'; END IF;
  IF v_admin <> v_total OR v_not_med <> v_total OR v_e <> v_total THEN
    RAISE EXCEPTION 'C-273 Block8 Pflichtmarken verloren: total %, admin %, not_med %, E %', v_total, v_admin, v_not_med, v_e;
  END IF;

  RAISE NOTICE 'OK C-273 Block8 Community: total %, usage %, exposure %, lab %, quality %, side %, stack %, delta %, aliases %, sources %, alle admin_only/not_medical/E', v_total, v_usage, v_exposure, v_lab, v_quality, v_side, v_stack, v_delta, v_aliases, v_sources;
END $$;

COMMIT;
`)
