#!/usr/bin/env node
import { csvJson, expectEqual, readJson, readJsonl, run } from './c273_helpers'

const rows: any[] = []
function addJsonl(dataset: string, source_file: string, expected: number) {
  const items = readJsonl(source_file)
  expectEqual(dataset, items.length, expected)
  rows.push(...items.map((raw, index) => ({ dataset, source_file, index, raw })))
}
function addList(dataset: string, source_file: string, list: any[], expected: number) {
  expectEqual(dataset, list.length, expected)
  rows.push(...list.map((raw, index) => ({ dataset, source_file, index, raw })))
}

addJsonl('population_response_atlas', 'evidence/population_response_atlas.jsonl', 425)
addJsonl('population_response_synthesis', 'evidence/population_response_synthesis.jsonl', 277)
addJsonl('population_applicability_atlas', 'evidence/population_applicability_atlas.jsonl', 277)
addJsonl('response_confounder_graph', 'evidence/response_confounder_graph.jsonl', 799)
addJsonl('response_modifier_graph', 'evidence/response_modifier_graph.jsonl', 453)

const resolver = readJson('evidence/response_resolver_index.json')
addList('response_resolver_index', 'evidence/response_resolver_index.json', resolver.entries ?? [], 277)

const semantics = readJson('evidence/observation_comparison_semantics.json')
for (const [state, raw] of Object.entries(semantics.states ?? {})) {
  rows.push({ dataset: 'observation_comparison_semantics', source_file: 'evidence/observation_comparison_semantics.json', index: state, state_code: state, raw })
}
expectEqual('observation_comparison_semantics', Object.keys(semantics.states ?? {}).length, 14)

addList('observation_comparison_synthetic_examples', 'evidence/observation_comparison_synthetic_examples.json', readJson('evidence/observation_comparison_synthetic_examples.json'), 46)

const capability = readJson('evidence/buddy_capability_map.json')
addList('buddy_capability_map', 'evidence/buddy_capability_map.json', capability.capabilities ?? [], 23)

const graph = readJson('evidence/buddy_dependency_graph.json')
addList('buddy_dependency_nodes', 'evidence/buddy_dependency_graph.json', graph.nodes ?? [], 64)
addList('buddy_dependency_edges', 'evidence/buddy_dependency_graph.json', graph.edges ?? [], 140)

const readiness = readJson('evidence/personal_response_readiness_model.json')
addList('personal_response_readiness_model', 'evidence/personal_response_readiness_model.json', readiness.markers ?? [], 66)

const payload = {
  rows,
  expected: {
    populationNamedRows: 2508,
    semantics: 14,
    syntheticExamples: 46,
    capabilities: 23,
    dependencyNodes: 64,
    dependencyEdges: 140,
    readinessMarkers: 66,
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

DELETE FROM wissen.buddy_knowledge_records WHERE source = 'kimi:c273';

WITH payload AS (SELECT payload FROM tmp_c273),
rows AS (
  SELECT value AS item
  FROM payload, jsonb_array_elements(payload->'rows') AS value
)
INSERT INTO wissen.buddy_knowledge_records(dataset, record_key, state_code, allowed_buddy_language, forbidden_buddy_language, raw, source_file)
SELECT
  item->>'dataset',
  concat(item->>'index', ':', coalesce(item->'raw'->>'id', item->'raw'->>'entry_id', item->'raw'->>'capability_id', item->'raw'->>'node_id', item->'raw'->>'edge_id', item->'raw'->>'marker_id', 'record')),
  coalesce(item->>'state_code', item->'raw'->>'state'),
  coalesce(item->'raw'->'allowed_buddy_language', 'null'::jsonb),
  coalesce(item->'raw'->'forbidden_buddy_language', 'null'::jsonb),
  item->'raw',
  item->>'source_file'
FROM rows;

DO $$
DECLARE
  e jsonb;
  v_population int;
  v_semantics int;
  v_examples int;
  v_capabilities int;
  v_nodes int;
  v_edges int;
  v_readiness int;
  v_total int;
  v_language int;
BEGIN
  SELECT payload->'expected' INTO e FROM tmp_c273;
  SELECT
    count(*) FILTER (WHERE dataset IN ('population_response_atlas','population_response_synthesis','population_applicability_atlas','response_confounder_graph','response_modifier_graph','response_resolver_index')),
    count(*) FILTER (WHERE dataset = 'observation_comparison_semantics'),
    count(*) FILTER (WHERE dataset = 'observation_comparison_synthetic_examples'),
    count(*) FILTER (WHERE dataset = 'buddy_capability_map'),
    count(*) FILTER (WHERE dataset = 'buddy_dependency_nodes'),
    count(*) FILTER (WHERE dataset = 'buddy_dependency_edges'),
    count(*) FILTER (WHERE dataset = 'personal_response_readiness_model'),
    count(*),
    count(*) FILTER (WHERE dataset = 'observation_comparison_semantics' AND forbidden_buddy_language IS NOT NULL)
  INTO v_population, v_semantics, v_examples, v_capabilities, v_nodes, v_edges, v_readiness, v_total, v_language
  FROM wissen.buddy_knowledge_records
  WHERE source = 'kimi:c273';

  IF v_population <> (e->>'populationNamedRows')::int THEN RAISE EXCEPTION 'C-273 Block7 population %, erwartet %', v_population, e->>'populationNamedRows'; END IF;
  IF v_semantics <> (e->>'semantics')::int THEN RAISE EXCEPTION 'C-273 Block7 semantics %, erwartet %', v_semantics, e->>'semantics'; END IF;
  IF v_examples <> (e->>'syntheticExamples')::int THEN RAISE EXCEPTION 'C-273 Block7 examples %, erwartet %', v_examples, e->>'syntheticExamples'; END IF;
  IF v_capabilities <> (e->>'capabilities')::int THEN RAISE EXCEPTION 'C-273 Block7 capabilities %, erwartet %', v_capabilities, e->>'capabilities'; END IF;
  IF v_nodes <> (e->>'dependencyNodes')::int OR v_edges <> (e->>'dependencyEdges')::int THEN RAISE EXCEPTION 'C-273 Block7 graph nodes %, edges %', v_nodes, v_edges; END IF;
  IF v_readiness <> (e->>'readinessMarkers')::int THEN RAISE EXCEPTION 'C-273 Block7 readiness %, erwartet %', v_readiness, e->>'readinessMarkers'; END IF;
  IF v_total <> (e->>'total')::int THEN RAISE EXCEPTION 'C-273 Block7 total %, erwartet %', v_total, e->>'total'; END IF;
  IF v_language <> (e->>'semantics')::int THEN RAISE EXCEPTION 'C-273 Block7 Buddy-Sprachregeln %, erwartet %', v_language, e->>'semantics'; END IF;

  RAISE NOTICE 'OK C-273 Block7 Buddy: Population-Dateien %, Semantik %, Beispiele %, Capabilities %, Graph %/% und Readiness %', v_population, v_semantics, v_examples, v_capabilities, v_nodes, v_edges, v_readiness;
END $$;

COMMIT;
`)
