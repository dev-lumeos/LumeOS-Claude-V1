BEGIN;

CREATE TABLE supplements.supplement_preferences (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferred_brands text[] NOT NULL DEFAULT '{}'::text[],
  avoided_ingredients text[] NOT NULL DEFAULT '{}'::text[],
  only_on_market boolean NOT NULL DEFAULT true,
  preferred_forms text[] NOT NULL DEFAULT '{}'::text[],
  preferred_intake_times time[] NOT NULL DEFAULT '{}'::time[],
  note text NOT NULL DEFAULT '',
  field_sources jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT supplement_preferences_note_length_check CHECK (char_length(note) <= 2000),
  CONSTRAINT supplement_preferences_field_sources_object_check CHECK (jsonb_typeof(field_sources) = 'object')
);

COMMENT ON TABLE supplements.supplement_preferences IS
  'C-511: dauerhafte, modulbezogene Supplement-Vorlieben je Nutzer. Ansichtsfilter bleiben in public.user_display_preferences; Allergien bleiben ausschliesslich in public.user_allergies.';
COMMENT ON COLUMN supplements.supplement_preferences.preferred_brands IS
  'Vom Nutzer bevorzugte, aktuell On-Market-Marken. Dient der Vorauswahl, nicht als Produktsuchfilter.';
COMMENT ON COLUMN supplements.supplement_preferences.avoided_ingredients IS
  'Dauerhafte Meidestoffe fuer eine Markierung; sie ersetzen keine Allergie und entfernen Produkte nicht.';
COMMENT ON COLUMN supplements.supplement_preferences.only_on_market IS
  'Dauerhafte Standardhaltung. Der konkrete Produkttab-Filter bleibt ein Anzeigestatus.';
COMMENT ON COLUMN supplements.supplement_preferences.preferred_intake_times IS
  'Persoenliche Standardzeiten; keine konkrete Erinnerung und keine Dosierungsanweisung.';
COMMENT ON COLUMN supplements.supplement_preferences.field_sources IS
  'Letzte schreibende Flaeche je Feld. Sie verhindert keine Werte, belegt aber, dass mehrere Flaechen denselben Speicher partiell aktualisieren.';

CREATE TRIGGER supplement_preferences_touch_updated_at
  BEFORE UPDATE ON supplements.supplement_preferences
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE supplements.supplement_preferences ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE supplements.supplement_preferences FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE supplements.supplement_preferences TO authenticated;
GRANT ALL ON TABLE supplements.supplement_preferences TO service_role;

CREATE POLICY supplement_preferences_select_own
  ON supplements.supplement_preferences
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY supplement_preferences_insert_own
  ON supplements.supplement_preferences
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY supplement_preferences_update_own
  ON supplements.supplement_preferences
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY supplement_preferences_delete_own
  ON supplements.supplement_preferences
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE FUNCTION supplements.supplement_preferences_read(
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public, supplements
AS $$
  WITH own_preferences AS (
    SELECT
      p_user_id AS user_id,
      COALESCE(sp.preferred_brands, '{}'::text[]) AS preferred_brands,
      COALESCE(sp.avoided_ingredients, '{}'::text[]) AS avoided_ingredients,
      COALESCE(sp.only_on_market, true) AS only_on_market,
      COALESCE(sp.preferred_forms, '{}'::text[]) AS preferred_forms,
      COALESCE(sp.preferred_intake_times, '{}'::time[]) AS preferred_intake_times,
      COALESCE(sp.note, '') AS note,
      sp.updated_at
    FROM (SELECT p_user_id AS user_id) requested
    LEFT JOIN supplements.supplement_preferences sp ON sp.user_id = requested.user_id
    WHERE p_user_id = auth.uid()
  )
  SELECT jsonb_build_object(
    'user_id', op.user_id,
    'preferred_brands', to_jsonb(op.preferred_brands),
    'avoided_ingredients', to_jsonb(op.avoided_ingredients),
    'only_on_market', op.only_on_market,
    'preferred_forms', to_jsonb(op.preferred_forms),
    'preferred_intake_times', to_jsonb(op.preferred_intake_times),
    'note', op.note,
    'updated_at', op.updated_at,
    'supplement_allergies', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', ua.id,
        'stoff_code', ua.stoff_code,
        'stoff_text', ua.stoff_text,
        'art', ua.art,
        'schwere', ua.schwere
      ) ORDER BY ua.stoff_text)
      FROM public.user_allergies ua
      WHERE ua.user_id = op.user_id
        AND ua.art = 'supplement'
    ), '[]'::jsonb)
  )
  FROM own_preferences op;
$$;

CREATE FUNCTION supplements.supplement_preferences_write(
  p_user_id uuid,
  p_source text,
  p_preferences jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog, public, supplements
AS $$
DECLARE
  v_preferred_brands text[];
  v_avoided_ingredients text[];
  v_preferred_forms text[];
  v_preferred_intake_times time[];
  v_only_on_market boolean;
  v_note text;
BEGIN
  IF auth.uid() IS NULL OR p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'supplement_preferences_write: nur eigene Vorlieben sind erlaubt'
      USING ERRCODE = '42501';
  END IF;
  IF p_preferences IS NULL OR jsonb_typeof(p_preferences) <> 'object' THEN
    RAISE EXCEPTION 'supplement_preferences_write: p_preferences muss ein Objekt sein';
  END IF;
  IF p_source NOT IN ('supplement_preferences', 'settings') THEN
    RAISE EXCEPTION 'supplement_preferences_write: unbekannte Schreibquelle';
  END IF;
  IF NOT (p_preferences ?| ARRAY['preferred_brands', 'avoided_ingredients', 'only_on_market', 'preferred_forms', 'preferred_intake_times', 'note']) THEN
    RAISE EXCEPTION 'supplement_preferences_write: keine bekannte Vorliebe uebergeben';
  END IF;
  IF (p_preferences ? 'preferred_brands' AND jsonb_typeof(p_preferences -> 'preferred_brands') <> 'array')
    OR (p_preferences ? 'avoided_ingredients' AND jsonb_typeof(p_preferences -> 'avoided_ingredients') <> 'array')
    OR (p_preferences ? 'preferred_forms' AND jsonb_typeof(p_preferences -> 'preferred_forms') <> 'array')
    OR (p_preferences ? 'preferred_intake_times' AND jsonb_typeof(p_preferences -> 'preferred_intake_times') <> 'array') THEN
    RAISE EXCEPTION 'supplement_preferences_write: Marken, Stoffe, Formen und Zeiten muessen Listen sein';
  END IF;

  IF p_preferences ? 'preferred_brands' THEN
    SELECT COALESCE(array_agg(value ORDER BY value), '{}'::text[])
    INTO v_preferred_brands
    FROM (
      SELECT DISTINCT btrim(entry.value) AS value
      FROM jsonb_array_elements_text(p_preferences -> 'preferred_brands') entry(value)
      WHERE btrim(entry.value) <> ''
    ) normalized;
  END IF;

  IF p_preferences ? 'avoided_ingredients' THEN
    SELECT COALESCE(array_agg(value ORDER BY value), '{}'::text[])
    INTO v_avoided_ingredients
    FROM (
      SELECT DISTINCT btrim(entry.value) AS value
      FROM jsonb_array_elements_text(p_preferences -> 'avoided_ingredients') entry(value)
      WHERE btrim(entry.value) <> ''
    ) normalized;
  END IF;

  IF p_preferences ? 'preferred_forms' THEN
    SELECT COALESCE(array_agg(value ORDER BY value), '{}'::text[])
    INTO v_preferred_forms
    FROM (
      SELECT DISTINCT btrim(entry.value) AS value
      FROM jsonb_array_elements_text(p_preferences -> 'preferred_forms') entry(value)
      WHERE btrim(entry.value) <> ''
    ) normalized;
  END IF;

  IF p_preferences ? 'preferred_intake_times' THEN
    SELECT COALESCE(array_agg(value ORDER BY value), '{}'::time[])
    INTO v_preferred_intake_times
    FROM (
      SELECT DISTINCT btrim(entry.value)::time AS value
      FROM jsonb_array_elements_text(p_preferences -> 'preferred_intake_times') entry(value)
      WHERE btrim(entry.value) <> ''
    ) normalized;
  END IF;

  IF v_preferred_brands IS NOT NULL AND EXISTS (
    SELECT 1
    FROM unnest(v_preferred_brands) AS preferred(marke)
    WHERE NOT EXISTS (
      SELECT 1
      FROM supplements.supplier_product_brands catalog
      WHERE catalog.marke = preferred.marke
    )
  ) THEN
    RAISE EXCEPTION 'supplement_preferences_write: Lieblingsmarke ist nicht On Market';
  END IF;

  IF p_preferences ? 'only_on_market' THEN
    v_only_on_market := (p_preferences ->> 'only_on_market')::boolean;
  END IF;
  IF p_preferences ? 'note' THEN
    v_note := COALESCE(p_preferences ->> 'note', '');
  END IF;
  IF v_note IS NOT NULL AND char_length(v_note) > 2000 THEN
    RAISE EXCEPTION 'supplement_preferences_write: Notiz ist zu lang';
  END IF;

  INSERT INTO supplements.supplement_preferences (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE supplements.supplement_preferences sp SET
    preferred_brands = COALESCE(v_preferred_brands, sp.preferred_brands),
    avoided_ingredients = COALESCE(v_avoided_ingredients, sp.avoided_ingredients),
    only_on_market = COALESCE(v_only_on_market, sp.only_on_market),
    preferred_forms = COALESCE(v_preferred_forms, sp.preferred_forms),
    preferred_intake_times = COALESCE(v_preferred_intake_times, sp.preferred_intake_times),
    note = COALESCE(v_note, sp.note),
    field_sources = sp.field_sources || jsonb_strip_nulls(jsonb_build_object(
      'preferred_brands', CASE WHEN p_preferences ? 'preferred_brands' THEN p_source END,
      'avoided_ingredients', CASE WHEN p_preferences ? 'avoided_ingredients' THEN p_source END,
      'only_on_market', CASE WHEN p_preferences ? 'only_on_market' THEN p_source END,
      'preferred_forms', CASE WHEN p_preferences ? 'preferred_forms' THEN p_source END,
      'preferred_intake_times', CASE WHEN p_preferences ? 'preferred_intake_times' THEN p_source END,
      'note', CASE WHEN p_preferences ? 'note' THEN p_source END
    ))
  WHERE sp.user_id = p_user_id;

  RETURN supplements.supplement_preferences_read(p_user_id);
END;
$$;

CREATE FUNCTION supplements.supplement_brand_options(
  p_user_id uuid DEFAULT auth.uid(),
  p_query text DEFAULT NULL,
  p_limit integer DEFAULT 25
)
RETURNS TABLE (
  marke text,
  product_count integer,
  is_preferred boolean,
  sort_position integer
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public, supplements
AS $$
  WITH authorized AS (
    SELECT p_user_id AS user_id
    WHERE p_user_id = auth.uid()
  ), preferred AS (
    SELECT DISTINCT preferred.marke
    FROM authorized a
    JOIN supplements.supplement_preferences sp ON sp.user_id = a.user_id
    CROSS JOIN LATERAL unnest(sp.preferred_brands) AS preferred(marke)
  ), catalog AS (
    SELECT b.marke, b.product_count
    FROM supplements.supplier_product_brands b
    CROSS JOIN authorized a
    WHERE NULLIF(btrim(p_query), '') IS NULL
       OR p_query <% b.marke
  ), ranked AS (
    SELECT
      c.marke,
      c.product_count,
      (p.marke IS NOT NULL) AS is_preferred,
      row_number() OVER (ORDER BY c.product_count DESC, c.marke) AS catalog_rank
    FROM catalog c
    LEFT JOIN preferred p ON p.marke = c.marke
  )
  SELECT
    r.marke,
    r.product_count,
    r.is_preferred,
    row_number() OVER (ORDER BY r.is_preferred DESC, r.product_count DESC, r.marke)::integer AS position
  FROM ranked r
  WHERE r.is_preferred
     OR r.catalog_rank <= LEAST(GREATEST(COALESCE(p_limit, 25), 1), 100)
  ORDER BY r.is_preferred DESC, r.product_count DESC, r.marke;
$$;

REVOKE ALL ON FUNCTION supplements.supplement_preferences_read(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION supplements.supplement_preferences_write(uuid, text, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION supplements.supplement_brand_options(uuid, text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION supplements.supplement_preferences_read(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION supplements.supplement_preferences_write(uuid, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION supplements.supplement_brand_options(uuid, text, integer) TO authenticated;

COMMIT;
