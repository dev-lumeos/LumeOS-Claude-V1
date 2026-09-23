BEGIN;

-- C-530 bewahrt historische IDs als Aliaszeilen. Dieser Leseweg laesst sie
-- nicht mehr als eigenstaendige Muskeln im Baum erscheinen.
CREATE OR REPLACE VIEW training.muscle_group_tree
WITH (security_invoker = true) AS
SELECT
  mg.id,
  mg.name,
  mg.name_display_en,
  mg.parent_id,
  mg.body_region,
  mg.display_order,
  mg.created_at
FROM training.muscle_groups AS mg
WHERE mg.canonical_muscle_group_id IS NULL;

CREATE OR REPLACE FUNCTION training.search_muscle_groups(p_query text)
RETURNS TABLE (
  id uuid,
  name text,
  name_display_en text,
  matched_name text,
  matched_as_alias boolean
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
  WITH matches AS (
    SELECT
      canonical.id,
      canonical.name,
      canonical.name_display_en,
      candidate.name AS matched_name,
      (candidate.id <> canonical.id) AS matched_as_alias
    FROM training.muscle_groups AS candidate
    JOIN training.muscle_groups AS canonical
      ON canonical.id = coalesce(candidate.canonical_muscle_group_id, candidate.id)
    WHERE nullif(btrim(p_query), '') IS NOT NULL
      AND (
        lower(candidate.name) = lower(btrim(p_query))
        OR lower(coalesce(candidate.name_display_en, '')) = lower(btrim(p_query))
      )
  )
  SELECT DISTINCT ON (m.id)
    m.id, m.name, m.name_display_en, m.matched_name, m.matched_as_alias
  FROM matches AS m
  ORDER BY m.id, m.matched_as_alias DESC, m.matched_name;
$function$;

REVOKE ALL ON TABLE training.muscle_group_tree FROM PUBLIC, anon, service_role;
REVOKE ALL ON FUNCTION training.search_muscle_groups(text) FROM PUBLIC, anon;
GRANT SELECT ON TABLE training.muscle_group_tree TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION training.search_muscle_groups(text) TO authenticated, service_role;

COMMENT ON VIEW training.muscle_group_tree IS
  'C-531: Hierarchieleseweg nur fuer kanonische Muskelgruppen. C-530-Aliaszeilen bleiben fuer historische Fremdschluessel erhalten, erscheinen aber nicht als eigene Muskeln.';
COMMENT ON FUNCTION training.search_muscle_groups(text) IS
  'C-531: Exakte Namenssuche ueber kanonische Muskelgruppen und erhaltene C-530-Aliaszeilen; ein Alias liefert das kanonische Ziel mit matched_as_alias=true.';

COMMIT;
