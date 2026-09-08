-- C-423 / E-73 -- Vorlagen haben zwei vollwertige Herkuenfte.
-- Kuratiert: zielbasierter Katalog. Nutzer: Eigentum des Nutzers, optional
-- oeffentlich geteilt. Eine Katalogannahme kopiert nur einen Snapshot und
-- veraendert nie den urspruenglichen Nutzerstack.

BEGIN;

ALTER TABLE supplements.stack_templates
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS origin_stack_id uuid REFERENCES supplements.user_stacks(id) ON DELETE SET NULL;

ALTER TABLE supplements.stack_templates
  DROP CONSTRAINT IF EXISTS stack_templates_source_check;
ALTER TABLE supplements.stack_templates
  ADD CONSTRAINT stack_templates_source_check
  CHECK (source IN ('system', 'coach', 'community', 'curated', 'user'));
ALTER TABLE supplements.stack_templates
  DROP CONSTRAINT IF EXISTS stack_templates_user_owner_check;
ALTER TABLE supplements.stack_templates
  ADD CONSTRAINT stack_templates_user_owner_check
  CHECK ((source = 'user') = (owner_id IS NOT NULL));
ALTER TABLE supplements.stack_templates
  DROP CONSTRAINT IF EXISTS stack_templates_user_origin_check;
ALTER TABLE supplements.stack_templates
  ADD CONSTRAINT stack_templates_user_origin_check
  CHECK (origin_stack_id IS NULL OR source = 'user');

CREATE UNIQUE INDEX IF NOT EXISTS stack_templates_user_origin_uidx
  ON supplements.stack_templates(origin_stack_id)
  WHERE origin_stack_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS stack_templates_owner_visibility_idx
  ON supplements.stack_templates(owner_id, is_public)
  WHERE source = 'user';

ALTER TABLE supplements.stack_template_items
  ALTER COLUMN supplement_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS custom_name text;
ALTER TABLE supplements.stack_template_items
  DROP CONSTRAINT IF EXISTS stack_template_items_identity_check;
ALTER TABLE supplements.stack_template_items
  ADD CONSTRAINT stack_template_items_identity_check
  CHECK (
    (supplement_id IS NOT NULL AND NULLIF(btrim(COALESCE(custom_name, '')), '') IS NULL)
    OR (supplement_id IS NULL AND NULLIF(btrim(COALESCE(custom_name, '')), '') IS NOT NULL)
  );

CREATE TABLE IF NOT EXISTS supplements.stack_curation_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_template_id uuid REFERENCES supplements.stack_templates(id) ON DELETE SET NULL,
  origin_stack_id uuid REFERENCES supplements.user_stacks(id) ON DELETE SET NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name_de text NOT NULL CHECK (length(btrim(name_de)) >= 2),
  description_de text,
  goal text NOT NULL,
  reason text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  withdrawn_at timestamptz
);

CREATE TABLE IF NOT EXISTS supplements.stack_curation_candidate_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES supplements.stack_curation_candidates(id) ON DELETE CASCADE,
  supplement_id uuid REFERENCES supplements.supplements(id) ON DELETE SET NULL,
  custom_name text,
  dose_amount numeric(12,4),
  dose_unit text,
  timing text,
  frequency text NOT NULL DEFAULT 'daily',
  tier text NOT NULL DEFAULT 'good' CHECK (tier IN ('must', 'good', 'nice')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT stack_curation_candidate_items_identity_check CHECK (
    (supplement_id IS NOT NULL AND NULLIF(btrim(COALESCE(custom_name, '')), '') IS NULL)
    OR (supplement_id IS NULL AND NULLIF(btrim(COALESCE(custom_name, '')), '') IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS supplements.stack_curation_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES supplements.stack_curation_candidates(id) ON DELETE CASCADE,
  decision text NOT NULL CHECK (decision IN ('accepted', 'rejected')),
  reviewer text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE supplements.stack_templates
  ADD COLUMN IF NOT EXISTS curation_candidate_id uuid
  REFERENCES supplements.stack_curation_candidates(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS stack_templates_curated_candidate_uidx
  ON supplements.stack_templates(curation_candidate_id)
  WHERE curation_candidate_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS stack_curation_candidates_owner_idx
  ON supplements.stack_curation_candidates(owner_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS stack_curation_candidate_items_candidate_idx
  ON supplements.stack_curation_candidate_items(candidate_id, sort_order, id);
CREATE INDEX IF NOT EXISTS stack_curation_decisions_candidate_idx
  ON supplements.stack_curation_decisions(candidate_id, created_at);

ALTER TABLE supplements.stack_curation_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements.stack_curation_candidate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements.stack_curation_decisions ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON supplements.stack_templates, supplements.stack_template_items,
  supplements.stack_curation_candidates, supplements.stack_curation_candidate_items,
  supplements.stack_curation_decisions TO authenticated;
GRANT ALL ON supplements.stack_templates, supplements.stack_template_items,
  supplements.stack_curation_candidates, supplements.stack_curation_candidate_items,
  supplements.stack_curation_decisions TO service_role;

DROP POLICY IF EXISTS stack_templates_select ON supplements.stack_templates;
CREATE POLICY stack_templates_select ON supplements.stack_templates
  FOR SELECT TO authenticated USING (
    source <> 'user' OR is_public OR owner_id = (SELECT auth.uid())
  );
DROP POLICY IF EXISTS stack_template_items_select ON supplements.stack_template_items;
CREATE POLICY stack_template_items_select ON supplements.stack_template_items
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM supplements.stack_templates t
      WHERE t.id = stack_template_items.template_id
        AND (t.source <> 'user' OR t.is_public OR t.owner_id = (SELECT auth.uid()))
    )
  );

CREATE POLICY stack_curation_candidates_select ON supplements.stack_curation_candidates
  FOR SELECT TO authenticated USING (owner_id = (SELECT auth.uid()) OR public.is_admin());
CREATE POLICY stack_curation_candidate_items_select ON supplements.stack_curation_candidate_items
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM supplements.stack_curation_candidates c
      WHERE c.id = stack_curation_candidate_items.candidate_id
        AND (c.owner_id = (SELECT auth.uid()) OR public.is_admin())
    )
  );
CREATE POLICY stack_curation_decisions_select ON supplements.stack_curation_decisions
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM supplements.stack_curation_candidates c
      WHERE c.id = stack_curation_decisions.candidate_id
        AND (c.owner_id = (SELECT auth.uid()) OR public.is_admin())
    )
  );

CREATE OR REPLACE FUNCTION supplements.create_curated_stack_template(
  p_name_de text,
  p_goal text,
  p_description_de text,
  p_items jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = supplements, public, auth, pg_temp
AS $$
DECLARE
  v_template_id uuid;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'create_curated_stack_template: Admin-Rolle erforderlich' USING ERRCODE = '42501';
  END IF;
  IF length(btrim(COALESCE(p_name_de, ''))) < 2 OR length(btrim(COALESCE(p_goal, ''))) = 0 THEN
    RAISE EXCEPTION 'create_curated_stack_template: Name und Ziel sind Pflicht' USING ERRCODE = '22023';
  END IF;
  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'create_curated_stack_template: mindestens ein Katalog-Item ist Pflicht' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(p_items) AS i(supplement_id uuid, custom_name text)
    WHERE i.supplement_id IS NULL OR NULLIF(btrim(COALESCE(i.custom_name, '')), '') IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'create_curated_stack_template: kuratierte Vorlagen enthalten nur Katalog-Supplements' USING ERRCODE = '23514';
  END IF;

  INSERT INTO supplements.stack_templates (name_de, description_de, goal, source, is_public)
  VALUES (btrim(p_name_de), NULLIF(btrim(p_description_de), ''), btrim(p_goal), 'curated', true)
  RETURNING id INTO v_template_id;

  INSERT INTO supplements.stack_template_items (
    template_id, supplement_id, dose_amount, dose_unit, timing, frequency, tier, sort_order
  )
  SELECT v_template_id, i.supplement_id, i.dose_amount, i.dose_unit,
         i.timing, COALESCE(i.frequency, 'daily'), COALESCE(i.tier, 'good'), COALESCE(i.sort_order, 0)
  FROM jsonb_to_recordset(p_items) AS i(
    supplement_id uuid, dose_amount numeric, dose_unit text, timing text,
    frequency text, tier text, sort_order integer
  );
  RETURN v_template_id;
END;
$$;

CREATE OR REPLACE FUNCTION supplements.publish_stack_template(
  p_stack_id uuid,
  p_reason text DEFAULT ''
)
RETURNS TABLE(template_id uuid, candidate_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = supplements, public, auth, pg_temp
AS $$
DECLARE
  v_owner_id uuid := auth.uid();
  v_stack supplements.user_stacks%ROWTYPE;
  v_template_id uuid;
  v_candidate_id uuid;
BEGIN
  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'publish_stack_template: Anmeldung erforderlich' USING ERRCODE = '28000';
  END IF;
  SELECT * INTO v_stack FROM supplements.user_stacks
  WHERE id = p_stack_id AND user_id = v_owner_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'publish_stack_template: eigener Stack % nicht gefunden', p_stack_id USING ERRCODE = 'P0002';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM supplements.stack_items WHERE stack_id = p_stack_id AND is_active) THEN
    RAISE EXCEPTION 'publish_stack_template: ein teilbarer Stack braucht mindestens ein aktives Item' USING ERRCODE = '23514';
  END IF;

  SELECT id INTO v_template_id FROM supplements.stack_templates
  WHERE origin_stack_id = p_stack_id AND source = 'user';
  IF v_template_id IS NULL THEN
    INSERT INTO supplements.stack_templates (
      owner_id, origin_stack_id, name_de, description_de, goal, source, is_public
    ) VALUES (
      v_owner_id, p_stack_id, v_stack.name, v_stack.description, v_stack.goal, 'user', true
    ) RETURNING id INTO v_template_id;
  ELSE
    UPDATE supplements.stack_templates
    SET name_de = v_stack.name, description_de = v_stack.description, goal = v_stack.goal,
        is_public = true, updated_at = now()
    WHERE id = v_template_id AND owner_id = v_owner_id;
    DELETE FROM supplements.stack_template_items WHERE template_id = v_template_id;
  END IF;

  INSERT INTO supplements.stack_template_items (
    template_id, supplement_id, custom_name, dose_amount, dose_unit, timing, frequency, tier, sort_order
  )
  SELECT v_template_id, si.supplement_id, si.custom_name, si.dose, si.dose_unit,
         si.timing, si.frequency, 'good', si.sort_order
  FROM supplements.stack_items si
  WHERE si.stack_id = p_stack_id AND si.is_active
  ORDER BY si.sort_order, si.id;

  SELECT id INTO v_candidate_id
  FROM supplements.stack_curation_candidates
  WHERE source_template_id = v_template_id AND status = 'pending'
  ORDER BY created_at DESC LIMIT 1;
  IF v_candidate_id IS NULL THEN
    INSERT INTO supplements.stack_curation_candidates (
      source_template_id, origin_stack_id, owner_id, name_de, description_de, goal, reason
    ) VALUES (
      v_template_id, p_stack_id, v_owner_id, v_stack.name, v_stack.description, v_stack.goal,
      COALESCE(p_reason, '')
    ) RETURNING id INTO v_candidate_id;
    INSERT INTO supplements.stack_curation_candidate_items (
      candidate_id, supplement_id, custom_name, dose_amount, dose_unit, timing, frequency, tier, sort_order
    )
    SELECT v_candidate_id, ti.supplement_id, ti.custom_name, ti.dose_amount, ti.dose_unit,
           ti.timing, ti.frequency, ti.tier, ti.sort_order
    FROM supplements.stack_template_items ti
    WHERE ti.template_id = v_template_id
    ORDER BY ti.sort_order, ti.id;
  END IF;

  RETURN QUERY SELECT v_template_id, v_candidate_id;
END;
$$;

CREATE OR REPLACE FUNCTION supplements.withdraw_stack_template(p_stack_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = supplements, public, auth, pg_temp
AS $$
DECLARE
  v_owner_id uuid := auth.uid();
  v_template_id uuid;
BEGIN
  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'withdraw_stack_template: Anmeldung erforderlich' USING ERRCODE = '28000';
  END IF;
  UPDATE supplements.stack_templates
  SET is_public = false, updated_at = now()
  WHERE origin_stack_id = p_stack_id AND source = 'user' AND owner_id = v_owner_id
  RETURNING id INTO v_template_id;
  IF v_template_id IS NULL THEN
    RAISE EXCEPTION 'withdraw_stack_template: veroeffentlichter eigener Stack % nicht gefunden', p_stack_id USING ERRCODE = 'P0002';
  END IF;
  UPDATE supplements.stack_curation_candidates
  SET status = 'withdrawn', withdrawn_at = now(), updated_at = now()
  WHERE source_template_id = v_template_id AND status = 'pending';
  RETURN v_template_id;
END;
$$;

CREATE OR REPLACE FUNCTION supplements.decide_stack_curation_candidate(
  p_candidate_id uuid,
  p_decision text,
  p_reason text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = supplements, public, auth, pg_temp
AS $$
DECLARE
  v_candidate supplements.stack_curation_candidates%ROWTYPE;
  v_catalog_template_id uuid;
  v_reviewer text;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'decide_stack_curation_candidate: Admin-Rolle erforderlich' USING ERRCODE = '42501';
  END IF;
  IF p_decision NOT IN ('accepted', 'rejected') THEN
    RAISE EXCEPTION 'decide_stack_curation_candidate: Entscheidung muss accepted oder rejected sein' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_candidate FROM supplements.stack_curation_candidates WHERE id = p_candidate_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'decide_stack_curation_candidate: Kandidat % nicht gefunden', p_candidate_id USING ERRCODE = 'P0002';
  END IF;
  IF v_candidate.status <> 'pending' THEN
    RAISE EXCEPTION 'decide_stack_curation_candidate: Kandidat % ist bereits %', p_candidate_id, v_candidate.status USING ERRCODE = '55000';
  END IF;
  v_reviewer := COALESCE(NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub', current_user);

  IF p_decision = 'accepted' THEN
    IF NOT EXISTS (SELECT 1 FROM supplements.stack_curation_candidate_items WHERE candidate_id = p_candidate_id)
       OR EXISTS (
         SELECT 1 FROM supplements.stack_curation_candidate_items
         WHERE candidate_id = p_candidate_id
           AND (supplement_id IS NULL OR NULLIF(btrim(COALESCE(custom_name, '')), '') IS NOT NULL)
       ) THEN
      RAISE EXCEPTION 'decide_stack_curation_candidate: Annahme braucht nur vollstaendige Katalog-Supplements' USING ERRCODE = '23514';
    END IF;
    INSERT INTO supplements.stack_templates (
      name_de, description_de, goal, source, is_public, curation_candidate_id
    ) VALUES (
      v_candidate.name_de, v_candidate.description_de, v_candidate.goal,
      'curated', true, p_candidate_id
    ) RETURNING id INTO v_catalog_template_id;
    INSERT INTO supplements.stack_template_items (
      template_id, supplement_id, dose_amount, dose_unit, timing, frequency, tier, sort_order
    )
    SELECT v_catalog_template_id, supplement_id, dose_amount, dose_unit, timing, frequency, tier, sort_order
    FROM supplements.stack_curation_candidate_items
    WHERE candidate_id = p_candidate_id
    ORDER BY sort_order, id;
  END IF;

  UPDATE supplements.stack_curation_candidates
  SET status = p_decision, updated_at = now()
  WHERE id = p_candidate_id;
  INSERT INTO supplements.stack_curation_decisions (candidate_id, decision, reviewer, reason)
  VALUES (p_candidate_id, p_decision, v_reviewer, COALESCE(p_reason, ''));
  RETURN v_catalog_template_id;
END;
$$;

REVOKE ALL ON FUNCTION supplements.create_curated_stack_template(text, text, text, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION supplements.publish_stack_template(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION supplements.withdraw_stack_template(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION supplements.decide_stack_curation_candidate(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION supplements.create_curated_stack_template(text, text, text, jsonb),
  supplements.publish_stack_template(uuid, text), supplements.withdraw_stack_template(uuid),
  supplements.decide_stack_curation_candidate(uuid, text, text)
TO authenticated, service_role;

COMMENT ON TABLE supplements.stack_curation_candidates IS
  'C-423/E-73: Snapshot eines freiwillig veroeffentlichten Nutzerstacks fuer die Katalogpruefung; das Original bleibt Nutzer-Eigentum.';
COMMENT ON FUNCTION supplements.publish_stack_template(uuid, text) IS
  'C-423/E-73: veroeffentlicht genau einen eigenen Stack als source=user und legt zugleich einen unabhängigen Kurations-Snapshot an.';
COMMENT ON FUNCTION supplements.withdraw_stack_template(uuid) IS
  'C-423/E-73: nimmt nur die oeffentliche Nutzer-Vorlage zurueck und zieht offene Katalogkandidaturen zurueck; der Nutzerstack bleibt unveraendert.';
COMMENT ON FUNCTION supplements.decide_stack_curation_candidate(uuid, text, text) IS
  'C-423: C-411-artige Adminentscheidung. Annahme kopiert ausschliesslich Katalog-Supplements in eine neue source=curated Vorlage, nie in user_stacks.';

COMMIT;
