#!/usr/bin/env node
import { csvJson, expectEqual, readJson, readJsonl, run } from './c273_helpers'

const warning = readJsonl('platform/warning_rules.jsonl')
const medication = readJsonl('platform/medication_rules.jsonl')
const gap = readJsonl('platform/nutrient_gap_rules.jsonl')
const fieldSpec = readJson('platform/module_field_spec.json')
const traitMapping = readJson('platform/rule_trait_mapping.json')

const rules = [
  ...warning.map((raw) => ({ source_file: 'warning_rules.jsonl', rule_type: 'warning', raw })),
  ...medication.map((raw) => ({ source_file: 'medication_rules.jsonl', rule_type: 'medication', raw })),
  ...gap.map((raw) => ({ source_file: 'nutrient_gap_rules.jsonl', rule_type: 'nutrient_gap', raw })),
]

const fieldRows: any[] = []
for (const [moduleKey, moduleSpec] of Object.entries(fieldSpec.modules ?? {})) {
  const fields = (moduleSpec as any).fields ?? moduleSpec
  for (const [fieldKey, raw] of Object.entries(fields as any)) {
    const fieldPath = String(fieldKey).includes('.') ? String(fieldKey) : `${moduleKey}.${fieldKey}`
    fieldRows.push({ module_key: moduleKey, field_path: fieldPath, raw })
  }
}

const traitRows: any[] = []
for (const [scope, entries] of Object.entries(traitMapping)) {
  if (!entries || typeof entries !== 'object' || Array.isArray(entries)) continue
  for (const [sourceKey, traits] of Object.entries(entries as any)) {
    if (Array.isArray(traits)) {
      for (const trait of traits) traitRows.push({ mapping_scope: scope, source_key: sourceKey, rule_trait: String(trait), raw: { traits } })
    } else {
      traitRows.push({ mapping_scope: scope, source_key: sourceKey, rule_trait: JSON.stringify(traits), raw: traits })
    }
  }
}

expectEqual('rules', rules.length, 64)
expectEqual('warning_rules', warning.length, 29)
expectEqual('medication_rules', medication.length, 20)
expectEqual('nutrient_gap_rules', gap.length, 15)

const payload = {
  rules,
  fieldRows,
  traitRows,
  expected: {
    rules: Number(process.env.C273_EXPECT_RULES ?? 64),
    fieldRows: fieldRows.length,
    traitRows: traitRows.length,
    matchingRuleCatalog: 64,
  },
}

run(`
\\set ON_ERROR_STOP on
BEGIN;

CREATE TEMP TABLE tmp_c273(payload jsonb);
COPY tmp_c273(payload) FROM stdin CSV QUOTE '"';
${csvJson([payload])}
\\.

DELETE FROM wissen.rule_engine_rules WHERE source = 'kimi:c273';
DELETE FROM wissen.rule_engine_field_specs WHERE source = 'kimi:c273';
DELETE FROM wissen.rule_trait_mappings WHERE source = 'kimi:c273';

WITH payload AS (SELECT payload FROM tmp_c273),
rows AS (
  SELECT value AS item
  FROM payload, jsonb_array_elements(payload->'rules') AS value
)
INSERT INTO wissen.rule_engine_rules(rule_id, rule_type, message_key, effect, condition_paths, substance_ids, source_file, raw)
SELECT
  coalesce(item->'raw'->>'rule_id', item->'raw'->>'id'),
  item->>'rule_type',
  coalesce(item->'raw'->>'message_key', item->'raw'->>'message_de'),
  coalesce(item->'raw'->>'effect', item->'raw'->>'action'),
  ARRAY(
    SELECT DISTINCT regexp_replace(match[1], '\\\\]$', '')
    FROM regexp_matches(item::text, '([a-z]+\\.[a-zA-Z0-9_\\.\\[\\]]+)', 'g') AS match
  ),
  ARRAY(
    SELECT DISTINCT value
    FROM jsonb_array_elements_text(coalesce(item->'raw'->'substance_ids', '[]'::jsonb)) AS value
  ),
  item->>'source_file',
  item->'raw'
FROM rows;

WITH payload AS (SELECT payload FROM tmp_c273),
rows AS (
  SELECT value AS item
  FROM payload, jsonb_array_elements(payload->'fieldRows') AS value
)
INSERT INTO wissen.rule_engine_field_specs(module_key, field_path, raw, source_file)
SELECT item->>'module_key', item->>'field_path', item->'raw', 'module_field_spec.json'
FROM rows;

WITH payload AS (SELECT payload FROM tmp_c273),
rows AS (
  SELECT value AS item
  FROM payload, jsonb_array_elements(payload->'traitRows') AS value
)
INSERT INTO wissen.rule_trait_mappings(mapping_scope, source_key, rule_trait, raw, source_file)
SELECT item->>'mapping_scope', item->>'source_key', item->>'rule_trait', item->'raw', 'rule_trait_mapping.json'
FROM rows;

DO $$
DECLARE
  e jsonb;
  v_rules int;
  v_fields int;
  v_traits int;
  v_matching int;
  v_missing_source int;
  v_missing_catalog int;
BEGIN
  SELECT payload->'expected' INTO e FROM tmp_c273;
  SELECT count(*) INTO v_rules FROM wissen.rule_engine_rules WHERE source = 'kimi:c273';
  SELECT count(*) INTO v_fields FROM wissen.rule_engine_field_specs WHERE source = 'kimi:c273';
  SELECT count(*) INTO v_traits FROM wissen.rule_trait_mappings WHERE source = 'kimi:c273';

  SELECT count(*) INTO v_matching
  FROM wissen.rule_engine_rules w
  JOIN supplements.rule_catalog s ON s.rule_id = w.rule_id
  WHERE w.source = 'kimi:c273';

  SELECT count(*) INTO v_missing_source
  FROM supplements.rule_catalog s
  WHERE NOT EXISTS (SELECT 1 FROM wissen.rule_engine_rules w WHERE w.rule_id = s.rule_id);

  SELECT count(*) INTO v_missing_catalog
  FROM wissen.rule_engine_rules w
  WHERE NOT EXISTS (SELECT 1 FROM supplements.rule_catalog s WHERE s.rule_id = w.rule_id);

  IF v_rules <> (e->>'rules')::int THEN RAISE EXCEPTION 'C-273 Block1 Regeln %, erwartet %', v_rules, e->>'rules'; END IF;
  IF v_fields <> (e->>'fieldRows')::int THEN RAISE EXCEPTION 'C-273 Block1 Feldpfade %, erwartet %', v_fields, e->>'fieldRows'; END IF;
  IF v_traits <> (e->>'traitRows')::int THEN RAISE EXCEPTION 'C-273 Block1 Traits %, erwartet %', v_traits, e->>'traitRows'; END IF;
  IF v_matching <> (e->>'matchingRuleCatalog')::int OR v_missing_source <> 0 OR v_missing_catalog <> 0 THEN
    RAISE EXCEPTION 'C-273 Block1 rule_catalog Abweichung: matching %, source-fehlt %, catalog-fehlt %', v_matching, v_missing_source, v_missing_catalog;
  END IF;

  RAISE NOTICE 'OK C-273 Block1 Regel-Engine: Regeln %, Feldpfade %, Traits %, rule_catalog identisch %', v_rules, v_fields, v_traits, v_matching;
END $$;

COMMIT;
`)
