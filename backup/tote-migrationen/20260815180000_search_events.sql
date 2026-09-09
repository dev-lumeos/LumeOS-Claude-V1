-- C-18: Suchprotokoll ohne Nutzerkennung.

CREATE TABLE IF NOT EXISTS nutrition.search_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL CHECK (length(trim(session_id)) >= 16),
  query TEXT NOT NULL,
  normalized_query TEXT NOT NULL,
  searched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  result_count INTEGER NOT NULL CHECK (result_count >= 0),
  selected_food_id UUID REFERENCES nutrition.foods(id) ON DELETE SET NULL,
  selected_bls_code TEXT,
  selected_rank INTEGER CHECK (selected_rank IS NULL OR selected_rank > 0)
);

CREATE INDEX IF NOT EXISTS idx_search_events_session_time
  ON nutrition.search_events(session_id, searched_at);

CREATE INDEX IF NOT EXISTS idx_search_events_query
  ON nutrition.search_events(normalized_query, searched_at DESC);

CREATE INDEX IF NOT EXISTS idx_search_events_selected_rank
  ON nutrition.search_events(selected_rank)
  WHERE selected_rank IS NOT NULL;

COMMENT ON TABLE nutrition.search_events IS
  'C-18: Suchanfragen und Auswahlpositionen, sitzungsbezogen ohne Nutzerkennung.';

COMMENT ON COLUMN nutrition.search_events.session_id IS
  'Nicht personenbezogene Sitzungskennung; keine user_id und kein Fremdschluessel auf auth.users.';

REVOKE ALL ON nutrition.search_events FROM anon, authenticated, service_role;
GRANT INSERT ON nutrition.search_events TO authenticated;
GRANT ALL ON nutrition.search_events TO service_role;

ALTER TABLE nutrition.search_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS search_events_insert ON nutrition.search_events;
CREATE POLICY search_events_insert ON nutrition.search_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE OR REPLACE FUNCTION nutrition.search_events_report()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
WITH no_results AS (
  SELECT normalized_query, min(query) AS example_query, count(*)::int AS searches
  FROM nutrition.search_events
  WHERE result_count = 0
  GROUP BY normalized_query
  ORDER BY count(*) DESC, normalized_query
  LIMIT 50
),
no_selection AS (
  SELECT normalized_query, min(query) AS example_query, count(*)::int AS searches
  FROM nutrition.search_events
  WHERE result_count > 0 AND selected_food_id IS NULL
  GROUP BY normalized_query
  ORDER BY count(*) DESC, normalized_query
  LIMIT 50
),
not_rank_one AS (
  SELECT
    normalized_query,
    min(query) AS example_query,
    count(*)::int AS selections,
    round(avg(selected_rank)::numeric, 2) AS avg_selected_rank
  FROM nutrition.search_events
  WHERE selected_rank IS NOT NULL AND selected_rank > 1
  GROUP BY normalized_query
  ORDER BY count(*) DESC, avg(selected_rank) DESC, normalized_query
  LIMIT 50
),
session_pairs AS (
  SELECT
    session_id,
    query AS first_query,
    lead(query) OVER (PARTITION BY session_id ORDER BY searched_at, id) AS second_query,
    searched_at AS first_at,
    lead(searched_at) OVER (PARTITION BY session_id ORDER BY searched_at, id) AS second_at
  FROM nutrition.search_events
),
quick_pairs AS (
  SELECT
    session_id,
    first_query,
    second_query,
    first_at,
    second_at,
    extract(epoch from (second_at - first_at))::int AS seconds_between
  FROM session_pairs
  WHERE second_query IS NOT NULL
    AND second_at <= first_at + interval '60 seconds'
  ORDER BY first_at DESC
  LIMIT 100
)
SELECT jsonb_build_object(
  'no_results', COALESCE((SELECT jsonb_agg(to_jsonb(no_results)) FROM no_results), '[]'::jsonb),
  'with_results_no_selection', COALESCE((SELECT jsonb_agg(to_jsonb(no_selection)) FROM no_selection), '[]'::jsonb),
  'selected_not_rank_one', COALESCE((SELECT jsonb_agg(to_jsonb(not_rank_one)) FROM not_rank_one), '[]'::jsonb),
  'session_query_pairs_60s', COALESCE((SELECT jsonb_agg(to_jsonb(quick_pairs)) FROM quick_pairs), '[]'::jsonb)
);
$function$;

COMMENT ON FUNCTION nutrition.search_events_report() IS
  'C-18: Auswertung Suchprotokoll fuer service_role: Nulltreffer, Treffer ohne Auswahl, Auswahl nicht Platz 1, schnelle Sitzungsfolgen.';

REVOKE ALL ON FUNCTION nutrition.search_events_report() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION nutrition.search_events_report() TO service_role;
