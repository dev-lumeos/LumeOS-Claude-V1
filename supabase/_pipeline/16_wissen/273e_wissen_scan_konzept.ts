#!/usr/bin/env node
import { csvJson, expectEqual, readJson, run } from './c273_helpers'

const files = [
  'evidence/supplement_cam_contract.json',
  'evidence/medication_cam_contract.json',
  'evidence/peptide_cam_contract.json',
  'evidence/prescription_vision_contract.json',
  'evidence/vision_learning_example_schema.json',
  'evidence/vision_product_match_signals.json',
  'evidence/product_media_rights_registry.json',
]

const rows: any[] = []
for (const source_file of files) {
  const raw = readJson(source_file)
  const contract_name = source_file.split('/').pop()!.replace(/\.json$/, '')
  rows.push({ contract_name, contract_key: '__root__', source_file, raw })
  const candidates = raw.rights_matrix ?? raw.states ?? raw.rights_states ?? raw.media_rights_states ?? raw.signals ?? raw.fields
  if (Array.isArray(candidates)) {
    candidates.forEach((value, index) => rows.push({ contract_name, contract_key: value.rights_state ?? value.state ?? String(index), source_file, raw: value }))
    continue
  }
  if (candidates && typeof candidates === 'object' && !Array.isArray(candidates)) {
    for (const [key, value] of Object.entries(candidates)) {
      rows.push({ contract_name, contract_key: key, source_file, raw: value })
    }
  }
}

const schemaOnly = files
  .slice(0, 4)
  .filter((file) => {
    const raw = readJson(file)
    const text = JSON.stringify(raw)
    return text.includes('schema_only_no_implementation') || raw.synthetic_schema_only === true
  })
  .length

expectEqual('scan_contracts', files.length, 7)
expectEqual('schema_only_no_implementation_contracts', schemaOnly, 4)

const payload = {
  rows,
  expected: {
    rootContracts: 7,
    schemaOnly,
    rows: rows.length,
    mediaRightsStatesMin: 8,
  },
}

run(`
\\set ON_ERROR_STOP on
BEGIN;

CREATE TEMP TABLE tmp_c273(payload jsonb);
COPY tmp_c273(payload) FROM stdin CSV QUOTE '"';
${csvJson([payload])}
\\.

DELETE FROM wissen.vision_contract_records WHERE source = 'kimi:c273';

WITH payload AS (SELECT payload FROM tmp_c273),
rows AS (
  SELECT value AS item
  FROM payload, jsonb_array_elements(payload->'rows') AS value
)
INSERT INTO wissen.vision_contract_records(contract_name, contract_key, status, can_display, can_store, can_train, raw, source_file)
SELECT
  item->>'contract_name',
  item->>'contract_key',
  coalesce(item->'raw'->>'status', item->'raw'->>'implementation_status'),
  nullif(item->'raw'->>'can_display', '')::boolean,
  nullif(item->'raw'->>'can_store', '')::boolean,
  nullif(item->'raw'->>'can_train', '')::boolean,
  item->'raw',
  item->>'source_file'
FROM rows;

DO $$
DECLARE
  e jsonb;
  v_roots int;
  v_schema_only int;
  v_rows int;
  v_media_rights int;
BEGIN
  SELECT payload->'expected' INTO e FROM tmp_c273;
  SELECT
    count(*) FILTER (WHERE contract_key = '__root__'),
    count(*) FILTER (WHERE contract_key = '__root__' AND (raw::text LIKE '%schema_only_no_implementation%' OR raw->>'synthetic_schema_only' = 'true')),
    count(*),
    count(*) FILTER (WHERE contract_name = 'product_media_rights_registry' AND contract_key <> '__root__')
  INTO v_roots, v_schema_only, v_rows, v_media_rights
  FROM wissen.vision_contract_records
  WHERE source = 'kimi:c273';

  IF v_roots <> (e->>'rootContracts')::int THEN RAISE EXCEPTION 'C-273 Block5 root contracts %, erwartet %', v_roots, e->>'rootContracts'; END IF;
  IF v_schema_only <> (e->>'schemaOnly')::int THEN RAISE EXCEPTION 'C-273 Block5 schema_only %, erwartet %', v_schema_only, e->>'schemaOnly'; END IF;
  IF v_rows <> (e->>'rows')::int THEN RAISE EXCEPTION 'C-273 Block5 rows %, erwartet %', v_rows, e->>'rows'; END IF;
  IF v_media_rights < (e->>'mediaRightsStatesMin')::int THEN RAISE EXCEPTION 'C-273 Block5 media rights states %, erwartet mindestens %', v_media_rights, e->>'mediaRightsStatesMin'; END IF;

  RAISE NOTICE 'OK C-273 Block5 Scan-Konzept: Roots %, schema_only %, Records %, Medienrechte-Stati %', v_roots, v_schema_only, v_rows, v_media_rights;
END $$;

COMMIT;
`)
