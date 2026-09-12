-- C-484 / E-81: Koerperflaechen haben beliebige Tiefe ueber parent_id.
-- Struktur בלבד: Karten- und Katalogdaten stehen im Kettenschritt 484.
BEGIN;

-- Die E-1/E-2/E-3-Form und ihre Seitenschluessel werden durch parent_id
-- ersetzt. Die zugehoerigen Zeilen entfernt der Kettenschritt, nachdem
-- die Struktur deployt ist.
DROP INDEX IF EXISTS public.koerperflaechen_eltern_seite_uq;
DROP INDEX IF EXISTS public.koerperflaechen_ebene_idx;
ALTER TABLE public.koerperflaechen
  DROP CONSTRAINT IF EXISTS koerperflaechen_seite_ck,
  DROP CONSTRAINT IF EXISTS koerperflaechen_wurzel_ck,
  DROP CONSTRAINT IF EXISTS koerperflaechen_ebene_ck,
  DROP COLUMN IF EXISTS seite,
  DROP COLUMN IF EXISTS ebene;

ALTER TABLE public.koerperflaechen
  DROP CONSTRAINT IF EXISTS koerperflaechen_art_ck,
  DROP CONSTRAINT IF EXISTS koerperflaechen_umriss_ck,
  ADD CONSTRAINT koerperflaechen_art_ck
    CHECK (art IN ('wurzel', 'gruppe', 'muskel', 'umriss', 'kopf')),
  ADD CONSTRAINT koerperflaechen_umriss_ck
    CHECK (art NOT IN ('umriss', 'kopf') OR muscle_group_id IS NULL);

CREATE INDEX IF NOT EXISTS koerperflaechen_parent_sortierung_idx
  ON public.koerperflaechen(parent_id, sortierung);

COMMENT ON TABLE public.koerperflaechen IS
  'C-484/E-81: Kartenflaechen als Baum beliebiger Tiefe. parent_id traegt die Tiefe; art unterscheidet wurzel, gruppe, muskel, umriss und spaeter kopf. Seiten stehen am Messwert, nie als eigene Flaechenzeile.';
COMMENT ON COLUMN public.koerperflaechen.art IS
  'E-81: wurzel, gruppe, muskel, umriss; kopf ist fuer eine spaetere Verwendung bereits erlaubt.';

-- C-471/C-479 bleiben erforderlich: Default-ACLs schuetzen bestehende
-- Tabellen nicht rueckwirkend.
ALTER TABLE public.koerperflaechen ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.koerperflaechen FROM PUBLIC;
REVOKE ALL ON public.koerperflaechen FROM anon;
REVOKE ALL ON public.koerperflaechen FROM authenticated;
GRANT SELECT ON public.koerperflaechen TO authenticated;
GRANT ALL ON public.koerperflaechen TO service_role;
DROP POLICY IF EXISTS koerperflaechen_select ON public.koerperflaechen;
CREATE POLICY koerperflaechen_select ON public.koerperflaechen
  FOR SELECT TO authenticated USING (true);

-- E-81: Die Seite ist eine Eigenschaft der beobachteten bzw. gewaelten
-- Stelle. NULL bleibt fuer mittige und historische Werte zulaessig.
ALTER TABLE medical.user_injection_site_selections
  ADD COLUMN IF NOT EXISTS seite text;
ALTER TABLE medical.user_injection_site_selections
  DROP CONSTRAINT IF EXISTS user_injection_site_selections_unique,
  DROP CONSTRAINT IF EXISTS user_injection_site_selections_seite_ck,
  ADD CONSTRAINT user_injection_site_selections_seite_ck
    CHECK (seite IS NULL OR seite IN ('links', 'rechts')),
  ADD CONSTRAINT user_injection_site_selections_unique
    UNIQUE NULLS NOT DISTINCT (user_id, substance_id, route, body_area_code, seite);
COMMENT ON COLUMN medical.user_injection_site_selections.seite IS
  'C-484/E-81: gewaehlte Koerperseite; NULL fuer mittige oder historische Auswahl.';

ALTER TABLE medical.injection_logs
  ADD COLUMN IF NOT EXISTS seite text;
ALTER TABLE medical.injection_logs
  DROP CONSTRAINT IF EXISTS injection_logs_seite_ck,
  ADD CONSTRAINT injection_logs_seite_ck
    CHECK (seite IS NULL OR seite IN ('links', 'rechts'));
COMMENT ON COLUMN medical.injection_logs.seite IS
  'C-484/E-81: beobachtete Koerperseite; NULL fuer mittige oder historische Injektionen.';

-- Der Katalog medical.injection_sites bleibt bewusst unveraendert: seine
-- 16 IDs sind seitlich kodierte Fachkatalogorte, keine Messwerte.

DROP FUNCTION IF EXISTS medical.configured_injection_areas(uuid, text);
CREATE FUNCTION medical.configured_injection_areas(
  p_substance_id uuid,
  p_route text
)
RETURNS TABLE (
  body_area_code text,
  seite text,
  needle_gauge text,
  needle_length_in numeric,
  has_catalog_knowledge boolean
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    selection.body_area_code,
    selection.seite,
    selection.needle_gauge,
    selection.needle_length_in,
    EXISTS (
      SELECT 1
      FROM medical.injection_sites AS site
      WHERE site.body_area_code = selection.body_area_code
        AND ((p_route = 'injection_im' AND site.route = 'im')
          OR (p_route = 'injection_subq' AND site.route = 'sc'))
        AND site.is_active
    ) AS has_catalog_knowledge
  FROM medical.user_injection_site_selections AS selection
  WHERE selection.user_id = (SELECT auth.uid())
    AND selection.substance_id = p_substance_id
    AND selection.route = p_route
  ORDER BY selection.body_area_code, selection.seite NULLS FIRST;
$$;

DROP FUNCTION IF EXISTS medical.suggest_configured_injection_area(uuid, text);
CREATE FUNCTION medical.suggest_configured_injection_area(
  p_substance_id uuid,
  p_route text
)
RETURNS TABLE (
  body_area_code text,
  seite text,
  suggestion_reason text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH selected AS (
    SELECT selection.body_area_code, selection.seite
    FROM medical.user_injection_site_selections AS selection
    WHERE selection.user_id = (SELECT auth.uid())
      AND selection.substance_id = p_substance_id
      AND selection.route = p_route
  ), ranked AS (
    SELECT
      selected.body_area_code,
      selected.seite,
      max(log.injected_at) AS last_injected_at
    FROM selected
    LEFT JOIN medical.injection_logs AS log
      ON log.user_id = (SELECT auth.uid())
      AND log.substance_id = p_substance_id
      AND log.body_area_code = selected.body_area_code
      AND log.seite IS NOT DISTINCT FROM selected.seite
    GROUP BY selected.body_area_code, selected.seite
  )
  SELECT ranked.body_area_code, ranked.seite, 'configured_longest_rested'::text
  FROM ranked
  WHERE (SELECT count(*) FROM selected) > 1
  ORDER BY ranked.last_injected_at ASC NULLS FIRST, ranked.body_area_code,
    ranked.seite NULLS FIRST
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION medical.configured_injection_areas(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION medical.suggest_configured_injection_area(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION medical.configured_injection_areas(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION medical.suggest_configured_injection_area(uuid, text) TO authenticated, service_role;

COMMIT;
