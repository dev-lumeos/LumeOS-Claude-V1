-- =============================================================
-- 280 -- Supplements: Community-Anzeige-Sicht (C-280)
-- Datum: 2026-08-26
-- Zweck:
--   `wissen` bleibt bewusst nicht ueber PostgREST freigegeben.
--   Die Anzeige bekommt nur diese Sicht im Fachschema `supplements`.
--
-- Grenze:
--   Keine `raw`-Spalte. Keine Anleitungsfelder:
--   reported_mitigations, components, reported_reason_for_combination,
--   why_these_doses.
--
-- Sicherheitsform:
--   Die Sicht laeuft absichtlich NICHT als security_invoker. Das
--   darunterliegende Schema `wissen` ist service_role-only; mit
--   security_invoker saehe authenticated dort nichts. Die Grenze ist
--   deshalb die Spaltenprojektion dieser Sicht plus der Waechter in der
--   Schemapruefung.
-- =============================================================

\set ON_ERROR_STOP on

BEGIN;

CREATE OR REPLACE VIEW supplements.community_anzeige
WITH (security_barrier = true)
AS
WITH basis AS (
  SELECT
    r.dataset,
    r.record_key,
    r.evidence_class,
    r.raw
  FROM wissen.community_records r
  WHERE r.admin_only IS TRUE
    AND r.not_medical_recommendation IS TRUE
    AND r.dataset IN (
      'community_side_effect_patterns',
      'community_stack_patterns',
      'community_product_quality_signals',
      'community_terminology_terms',
      'community_science_delta',
      'community_usage_concepts'
    )
), sichtbar AS (
  SELECT
    b.dataset,
    b.record_key,
    CASE b.dataset
      WHEN 'community_side_effect_patterns' THEN 'nebenwirkung'
      WHEN 'community_stack_patterns' THEN 'stack_tradeoff'
      WHEN 'community_product_quality_signals' THEN 'produktqualitaet'
      WHEN 'community_terminology_terms' THEN 'begriff'
      WHEN 'community_science_delta' THEN 'mythos'
      WHEN 'community_usage_concepts' THEN 'konzept'
      ELSE b.dataset
    END AS anzeige_typ,
    b.evidence_class,
    COALESCE(
      CASE
        WHEN jsonb_typeof(b.raw->'substance_ids') = 'array' THEN (
          SELECT array_agg(value ORDER BY value)
          FROM jsonb_array_elements_text(b.raw->'substance_ids') AS ids(value)
          WHERE value LIKE 'sub_%'
        )
        ELSE NULL
      END,
      CASE
        WHEN NULLIF(b.raw->>'maps_to_substance_id', '') LIKE 'sub_%'
        THEN ARRAY[b.raw->>'maps_to_substance_id']
        ELSE ARRAY[]::text[]
      END
    ) AS substance_ids,
    NULLIF(b.raw->>'substance_class', '') AS substance_class,
    NULLIF(b.raw->>'product_class', '') AS product_class,
    NULLIF(b.raw->>'side_effect', '') AS side_effect,
    NULLIF(b.raw->>'community_attribution_note', '') AS community_attribution_note,
    NULLIF(b.raw->>'prevalence', '') AS prevalence,
    NULLIF(b.raw->>'onset_context', '') AS onset_context,
    NULLIF(b.raw->>'attribution_confidence', '') AS attribution_confidence,
    NULLIF(b.raw->>'community_consistency', '') AS community_consistency,
    NULLIF(b.raw->>'scientific_alignment', '') AS scientific_alignment,
    CASE
      WHEN jsonb_typeof(b.raw->'limitations') = 'array' THEN (
        SELECT array_agg(value ORDER BY ordinality)
        FROM jsonb_array_elements_text(b.raw->'limitations') WITH ORDINALITY AS lim(value, ordinality)
      )
      ELSE ARRAY[]::text[]
    END AS limitations,
    NULLIF(b.raw->>'community_evidence_grade', '') AS community_evidence_grade,
    NULLIF(b.raw->>'name', '') AS name,
    NULLIF(b.raw->>'expected_tradeoff', '') AS expected_tradeoff,
    COALESCE(
      NULLIF(b.raw->>'community_quality_signal', ''),
      NULLIF(b.raw->>'reported_signal', ''),
      NULLIF(b.raw->>'complaint_pattern', '')
    ) AS quality_signal,
    NULLIF(b.raw->>'claim', '') AS quality_claim,
    NULLIF(b.raw->>'independent_testing', '') AS independent_testing,
    COALESCE(
      CASE
        WHEN jsonb_typeof(b.raw->'sources') = 'array' THEN (
          SELECT array_agg(value ORDER BY ordinality)
          FROM jsonb_array_elements_text(b.raw->'sources') WITH ORDINALITY AS src(value, ordinality)
        )
        ELSE NULL
      END,
      CASE
        WHEN jsonb_typeof(b.raw->'source_ids') = 'array' THEN (
          SELECT array_agg(value ORDER BY ordinality)
          FROM jsonb_array_elements_text(b.raw->'source_ids') WITH ORDINALITY AS src(value, ordinality)
        )
        ELSE NULL
      END,
      CASE
        WHEN jsonb_typeof(b.raw->'community_source_ids') = 'array' THEN (
          SELECT array_agg(value ORDER BY ordinality)
          FROM jsonb_array_elements_text(b.raw->'community_source_ids') WITH ORDINALITY AS src(value, ordinality)
        )
        ELSE ARRAY[]::text[]
      END
    ) AS quality_sources,
    NULLIF(b.raw->>'term', '') AS term,
    NULLIF(b.raw->>'community_definition', '') AS community_definition,
    NULLIF(b.raw->>'community_claim', '') AS community_claim,
    COALESCE(
      NULLIF(b.raw->>'reason_for_difference', ''),
      NULLIF(b.raw->>'scientific_status', '')
    ) AS community_resolution,
    NULLIF(b.raw->>'concept', '') AS concept,
    NULLIF(b.raw->>'physiological_implications', '') AS physiological_implications
  FROM basis b
)
SELECT *
FROM sichtbar;

COMMENT ON VIEW supplements.community_anzeige IS
  'C-280: Anzeigegrenze fuer Community-Wissen aus wissen.community_records. Nur sechs erlaubte Datasets, keine raw-Spalte und keine Anleitungsfelder.';

REVOKE ALL ON supplements.community_anzeige FROM anon, authenticated, service_role;
GRANT SELECT ON supplements.community_anzeige TO authenticated;
GRANT ALL ON supplements.community_anzeige TO service_role;

DO $$
DECLARE
  v_rows integer;
  v_side integer;
  v_raw_cols integer;
  v_forbidden_cols integer;
  v_forbidden_def integer;
  v_nandrolone integer;
  v_sarm integer;
  v_vitamin integer;
BEGIN
  SELECT count(*) INTO v_rows FROM supplements.community_anzeige;
  SELECT count(*) INTO v_side FROM supplements.community_anzeige WHERE dataset = 'community_side_effect_patterns';

  SELECT count(*) INTO v_raw_cols
  FROM information_schema.columns
  WHERE table_schema = 'supplements'
    AND table_name = 'community_anzeige'
    AND column_name = 'raw';

  SELECT count(*) INTO v_forbidden_cols
  FROM information_schema.columns
  WHERE table_schema = 'supplements'
    AND table_name = 'community_anzeige'
    AND column_name IN (
      'reported_mitigations',
      'components',
      'reported_reason_for_combination',
      'why_these_doses'
    );

  SELECT count(*) INTO v_forbidden_def
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'supplements'
    AND c.relname = 'community_anzeige'
    AND pg_get_viewdef(c.oid) ~
      '(reported_mitigations|components|reported_reason_for_combination|why_these_doses)';

  SELECT count(*) INTO v_nandrolone
  FROM supplements.community_anzeige
  WHERE 'sub_77b68a4df6' = ANY(substance_ids)
    AND side_effect ILIKE '%Deca%';

  SELECT count(*) INTO v_sarm
  FROM supplements.community_anzeige
  WHERE 'sub_a407e3597e' = ANY(substance_ids)
    AND quality_claim ILIKE '%52%';

  SELECT count(*) INTO v_vitamin
  FROM supplements.community_anzeige
  WHERE 'vitamin-d3' = ANY(substance_ids)
     OR 'sub_479964998b' = ANY(substance_ids);

  IF v_rows <> 212 THEN
    RAISE EXCEPTION 'C-280 community_anzeige Zeilen %, erwartet 212', v_rows;
  END IF;
  IF v_side <> 37 THEN
    RAISE EXCEPTION 'C-280 Nebenwirkungen %, erwartet 37', v_side;
  END IF;
  IF v_raw_cols <> 0 THEN
    RAISE EXCEPTION 'C-280 community_anzeige darf keine raw-Spalte tragen';
  END IF;
  IF v_forbidden_cols <> 0 THEN
    RAISE EXCEPTION 'C-280 community_anzeige enthaelt verbotene Anleitungs-Spalten';
  END IF;
  IF v_forbidden_def <> 0 THEN
    RAISE EXCEPTION 'C-280 community_anzeige liest ein verbotenes Anleitungsfeld';
  END IF;
  IF v_nandrolone < 1 THEN
    RAISE EXCEPTION 'C-280 Nandrolone Deca-dick-Gegenprobe fehlt';
  END IF;
  IF v_sarm < 1 THEN
    RAISE EXCEPTION 'C-280 SARM/JAMA-Qualitaets-Gegenprobe fehlt';
  END IF;
  IF v_vitamin <> 0 THEN
    RAISE EXCEPTION 'C-280 Vitamin-D3-Gegenprobe muss leer sein, gefunden %', v_vitamin;
  END IF;

  RAISE NOTICE 'OK C-280 community_anzeige: 212 Zeilen, 37 Nebenwirkungen, keine raw-/Anleitungsfelder';
END $$;

COMMIT;
