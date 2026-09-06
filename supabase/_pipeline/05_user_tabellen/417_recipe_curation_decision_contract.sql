-- 417 -- Atomare Admin-Entscheidung fuer MealCam-Rezeptkandidaten (C-31)
--
-- Ein akzeptierter Vorschlag wird ein global lesbarer, unveraenderlicher
-- Rezeptkatalog-Snapshot. Er wird bewusst nicht in nutrition.recipes kopiert:
-- diese Tabelle beschreibt private Nutzerrezepte mit user_id und eigener RLS.
-- Katalogmaterial muss davon getrennt bleiben und darf keine privaten Custom
-- Foods enthalten. Deshalb sind bei Annahme nur vollstaendige BLS-Zutaten
-- zulaessig.

\set ON_ERROR_STOP on

BEGIN;

CREATE TABLE IF NOT EXISTS nutrition.recipe_curation_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL UNIQUE
    REFERENCES nutrition.recipe_curation_candidates(id) ON DELETE RESTRICT,
  name_de text NOT NULL CHECK (length(btrim(name_de)) >= 2),
  description text,
  instructions text,
  cuisine_code text,
  cooking_skill text,
  prep_time_min integer CHECK (prep_time_min IS NULL OR prep_time_min >= 0),
  cook_time_min integer CHECK (cook_time_min IS NULL OR cook_time_min >= 0),
  servings numeric(8,3) NOT NULL CHECK (servings > 0),
  tags text[] NOT NULL DEFAULT '{}'::text[],
  source text NOT NULL DEFAULT 'mealcam_curation'
    CHECK (source = 'mealcam_curation'),
  approved_by text NOT NULL,
  approved_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS recipe_curation_catalog_approved_idx
  ON nutrition.recipe_curation_catalog(approved_at DESC);

CREATE TABLE IF NOT EXISTS nutrition.recipe_curation_catalog_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_recipe_id uuid NOT NULL
    REFERENCES nutrition.recipe_curation_catalog(id) ON DELETE CASCADE,
  sort_order integer NOT NULL CHECK (sort_order >= 0),
  food_id uuid NOT NULL REFERENCES nutrition.foods(id) ON DELETE RESTRICT,
  food_name_snapshot text NOT NULL CHECK (length(btrim(food_name_snapshot)) > 0),
  amount_g numeric(10,2) NOT NULL CHECK (amount_g > 0),
  portion_name text,
  portion_quantity numeric(10,3),
  portion_amount_g numeric(10,2),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT recipe_curation_catalog_ingredients_portion_check CHECK (
    (portion_name IS NULL AND portion_quantity IS NULL AND portion_amount_g IS NULL)
    OR (
      portion_name IS NOT NULL AND length(btrim(portion_name)) > 0
      AND portion_quantity IS NOT NULL AND portion_quantity > 0
      AND portion_amount_g IS NOT NULL AND portion_amount_g > 0
      AND abs(amount_g - (portion_quantity * portion_amount_g)) <= 0.01
    )
  )
);

CREATE INDEX IF NOT EXISTS recipe_curation_catalog_ingredients_recipe_idx
  ON nutrition.recipe_curation_catalog_ingredients(catalog_recipe_id, sort_order, id);

ALTER TABLE nutrition.recipe_curation_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.recipe_curation_catalog_ingredients ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON
  nutrition.recipe_curation_catalog,
  nutrition.recipe_curation_catalog_ingredients
TO authenticated;

GRANT ALL ON
  nutrition.recipe_curation_catalog,
  nutrition.recipe_curation_catalog_ingredients
TO service_role;

DROP POLICY IF EXISTS recipe_curation_catalog_select ON nutrition.recipe_curation_catalog;
CREATE POLICY recipe_curation_catalog_select
  ON nutrition.recipe_curation_catalog
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS recipe_curation_catalog_ingredients_select
  ON nutrition.recipe_curation_catalog_ingredients;
CREATE POLICY recipe_curation_catalog_ingredients_select
  ON nutrition.recipe_curation_catalog_ingredients
  FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION nutrition.decide_recipe_curation_candidate(
  p_candidate_id uuid,
  p_decision text,
  p_reason text DEFAULT ''
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_status text;
  v_catalog_id uuid;
  v_reviewer text;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'decide_recipe_curation_candidate: Adminrolle erforderlich'
      USING ERRCODE = '42501';
  END IF;

  IF p_decision IS NULL OR p_decision NOT IN ('accepted', 'rejected', 'superseded') THEN
    RAISE EXCEPTION 'decide_recipe_curation_candidate: ungueltige Entscheidung %', p_decision
      USING ERRCODE = '22023';
  END IF;

  SELECT status INTO v_status
  FROM nutrition.recipe_curation_candidates
  WHERE id = p_candidate_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'decide_recipe_curation_candidate: Kandidat % nicht gefunden', p_candidate_id
      USING ERRCODE = 'P0002';
  END IF;

  IF v_status <> 'pending' THEN
    RAISE EXCEPTION 'decide_recipe_curation_candidate: Kandidat % ist bereits %',
      p_candidate_id, v_status USING ERRCODE = '55000';
  END IF;

  v_reviewer := COALESCE(
    NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub',
    current_user
  );

  IF p_decision = 'accepted' THEN
    IF NOT EXISTS (
      SELECT 1
      FROM nutrition.recipe_curation_candidate_ingredients
      WHERE candidate_id = p_candidate_id
    ) THEN
      RAISE EXCEPTION 'decide_recipe_curation_candidate: Annahme braucht mindestens eine BLS-Zutat'
        USING ERRCODE = '23514';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM nutrition.recipe_curation_candidate_ingredients
      WHERE candidate_id = p_candidate_id
        AND (food_source <> 'bls' OR food_id IS NULL OR custom_food_id IS NOT NULL)
    ) THEN
      RAISE EXCEPTION 'decide_recipe_curation_candidate: Annahme erlaubt nur vollstaendige BLS-Zutaten'
        USING ERRCODE = '23514';
    END IF;

    INSERT INTO nutrition.recipe_curation_catalog (
      candidate_id, name_de, description, instructions, cuisine_code,
      cooking_skill, prep_time_min, cook_time_min, servings, tags, approved_by
    )
    SELECT
      id, name_de, description, instructions, cuisine_code,
      cooking_skill, prep_time_min, cook_time_min, servings, tags, v_reviewer
    FROM nutrition.recipe_curation_candidates
    WHERE id = p_candidate_id
    RETURNING id INTO v_catalog_id;

    INSERT INTO nutrition.recipe_curation_catalog_ingredients (
      catalog_recipe_id, sort_order, food_id, food_name_snapshot, amount_g,
      portion_name, portion_quantity, portion_amount_g, notes
    )
    SELECT
      v_catalog_id, sort_order, food_id, food_name_snapshot, amount_g,
      portion_name, portion_quantity, portion_amount_g, notes
    FROM nutrition.recipe_curation_candidate_ingredients
    WHERE candidate_id = p_candidate_id
    ORDER BY sort_order, id;
  END IF;

  UPDATE nutrition.recipe_curation_candidates
  SET status = p_decision
  WHERE id = p_candidate_id;

  INSERT INTO nutrition.recipe_curation_decisions (
    candidate_id, decision, reviewer, reason
  ) VALUES (
    p_candidate_id, p_decision, v_reviewer, COALESCE(p_reason, '')
  );

  RETURN v_catalog_id;
END;
$function$;

REVOKE ALL ON FUNCTION nutrition.decide_recipe_curation_candidate(uuid, text, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION nutrition.decide_recipe_curation_candidate(uuid, text, text)
  TO authenticated, service_role;

COMMENT ON TABLE nutrition.recipe_curation_catalog IS
  'C-417/C-31: von Admin angenommene MealCam-Rezept-Snapshots als Katalogmaterial; getrennt von privaten nutrition.recipes.';
COMMENT ON TABLE nutrition.recipe_curation_catalog_ingredients IS
  'C-417/C-31: nur bei Annahme kopierte BLS-Zutaten eines kuratierten Katalogrezepts; Custom Foods bleiben privat und sind nicht katalogtauglich.';
COMMENT ON FUNCTION nutrition.decide_recipe_curation_candidate(uuid, text, text) IS
  'C-417/C-31: admin-autorisierte, atomare Annahme/Ablehnung eines Rezeptkandidaten. Annahme kopiert nur vollstaendige BLS-Zutaten in den Katalog und erzeugt kein Nutzerrezept.';

COMMIT;
