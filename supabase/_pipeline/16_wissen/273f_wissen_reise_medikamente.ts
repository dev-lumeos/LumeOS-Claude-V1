#!/usr/bin/env node
import { csvJson, expectEqual, readJson, run } from './c273_helpers'

const travel = readJson('evidence/travel_medication_requirement_schema.json')
const glossary = readJson('evidence/thai_legal_glossary.json')
const examples = travel.example_records ?? []
const terms = glossary.glossary ?? []

expectEqual('travel_example_records', examples.length, 7)
expectEqual('thai_legal_glossary', terms.length, 19)

const rows = [
  { dataset: 'travel_medication_requirement_schema', record_key: '__schema__', source_file: 'travel_medication_requirement_schema.json', raw: travel },
  ...examples.map((raw: any, index: number) => ({
    dataset: 'travel_medication_requirement',
    record_key: `${String(index).padStart(3, '0')}:${raw.requirement_id ?? raw.country ?? 'record'}`,
    country: raw.country,
    substance_id: raw.substance_id,
    source_file: 'travel_medication_requirement_schema.json',
    raw,
  })),
  ...terms.map((raw: any, index: number) => ({
    dataset: 'thai_legal_glossary',
    record_key: raw.term_id ?? raw.thai ?? raw.term_en ?? String(index),
    source_file: 'thai_legal_glossary.json',
    raw,
  })),
]

const payload = {
  rows,
  expected: {
    examples: Number(process.env.C273_EXPECT_TRAVEL_EXAMPLES ?? 7),
    terms: 19,
    rows: rows.length,
  },
}

run(`
\\set ON_ERROR_STOP on
BEGIN;

CREATE TEMP TABLE tmp_c273(payload jsonb);
COPY tmp_c273(payload) FROM stdin CSV QUOTE '"';
${csvJson([payload])}
\\.

DELETE FROM wissen.travel_medication_records WHERE source = 'kimi:c273';

WITH payload AS (SELECT payload FROM tmp_c273),
rows AS (
  SELECT value AS item
  FROM payload, jsonb_array_elements(payload->'rows') AS value
)
INSERT INTO wissen.travel_medication_records(dataset, record_key, country, substance_id, raw, source_file)
SELECT
  item->>'dataset',
  item->>'record_key',
  item->>'country',
  item->>'substance_id',
  item->'raw',
  item->>'source_file'
FROM rows;

DO $$
DECLARE
  e jsonb;
  v_examples int;
  v_terms int;
  v_rows int;
BEGIN
  SELECT payload->'expected' INTO e FROM tmp_c273;
  SELECT
    count(*) FILTER (WHERE dataset = 'travel_medication_requirement'),
    count(*) FILTER (WHERE dataset = 'thai_legal_glossary'),
    count(*)
  INTO v_examples, v_terms, v_rows
  FROM wissen.travel_medication_records
  WHERE source = 'kimi:c273';

  IF v_examples <> (e->>'examples')::int THEN RAISE EXCEPTION 'C-273 Block6 examples %, erwartet %', v_examples, e->>'examples'; END IF;
  IF v_terms <> (e->>'terms')::int THEN RAISE EXCEPTION 'C-273 Block6 glossary %, erwartet %', v_terms, e->>'terms'; END IF;
  IF v_rows <> (e->>'rows')::int THEN RAISE EXCEPTION 'C-273 Block6 rows %, erwartet %', v_rows, e->>'rows'; END IF;

  RAISE NOTICE 'OK C-273 Block6 Reise mit Medikamenten: Laenderbeispiele %, Thai-Glossar %', v_examples, v_terms;
END $$;

COMMIT;
`)
