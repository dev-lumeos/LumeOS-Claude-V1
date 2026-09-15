BEGIN;

CREATE SCHEMA IF NOT EXISTS coach;

CREATE TABLE public.user_allergies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stoff_code text,
  stoff_text text NOT NULL CHECK (btrim(stoff_text) <> ''),
  art text NOT NULL CHECK (art IN ('nahrung', 'supplement', 'medikament', 'umwelt', 'sonstiges')),
  schwere text NOT NULL CHECK (schwere IN ('unvertraeglichkeit', 'allergie', 'anaphylaxie')),
  quelle text NOT NULL CHECK (btrim(quelle) <> ''),
  seit date,
  notiz text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX user_allergies_user_art_idx ON public.user_allergies (user_id, art);
CREATE UNIQUE INDEX user_allergies_user_code_art_uq
  ON public.user_allergies (user_id, stoff_code, art)
  WHERE stoff_code IS NOT NULL;

CREATE TABLE public.allergen_aliases (
  stoff_code text NOT NULL,
  alias_text text NOT NULL,
  source_id text NOT NULL CHECK (btrim(source_id) <> ''),
  evidence_class text NOT NULL CHECK (evidence_class IN ('A', 'B', 'C')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (stoff_code, alias_text)
);

INSERT INTO public.allergen_aliases (stoff_code, alias_text, source_id, evidence_class) VALUES
  ('magnesium_stearate', 'Magnesium Stearate', 'dsld_product_contents', 'A'),
  ('magnesium_stearate', 'Magnesium Stearate (Mg Stearate)', 'dsld_product_contents', 'A'),
  ('magnesium_stearate', 'Vegetable Magnesium Stearate', 'dsld_product_contents', 'A')
ON CONFLICT (stoff_code, alias_text) DO NOTHING;

CREATE TABLE coach.allergy_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visibility text NOT NULL DEFAULT 'none' CHECK (visibility IN ('none', 'full')),
  expires_at timestamptz,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT allergy_permissions_pair_uq UNIQUE (coach_id, client_id),
  CONSTRAINT allergy_permissions_not_self_ck CHECK (coach_id <> client_id)
);

CREATE TABLE coach.allergy_permission_change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_id uuid REFERENCES coach.allergy_permissions(id) ON DELETE SET NULL,
  coach_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  change_kind text NOT NULL CHECK (change_kind IN ('insert', 'update', 'delete')),
  old_value jsonb,
  new_value jsonb
);

CREATE INDEX allergy_permissions_client_idx ON coach.allergy_permissions (client_id);
CREATE INDEX allergy_permission_change_log_pair_idx
  ON coach.allergy_permission_change_log (coach_id, client_id, changed_at DESC);

CREATE OR REPLACE FUNCTION public.touch_user_allergy_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION coach.touch_allergy_permission_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog
AS $$
BEGIN
  NEW.updated_at := now();
  NEW.changed_by := COALESCE(auth.uid(), NEW.changed_by);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION coach.log_allergy_permission_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, coach
AS $$
BEGIN
  INSERT INTO coach.allergy_permission_change_log (
    permission_id, coach_id, client_id, changed_by, change_kind, old_value, new_value
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    COALESCE(NEW.coach_id, OLD.coach_id),
    COALESCE(NEW.client_id, OLD.client_id),
    COALESCE(auth.uid(), NEW.changed_by, OLD.changed_by),
    lower(TG_OP),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS user_allergies_touch_updated_at ON public.user_allergies;
CREATE TRIGGER user_allergies_touch_updated_at
  BEFORE UPDATE ON public.user_allergies
  FOR EACH ROW EXECUTE FUNCTION public.touch_user_allergy_updated_at();

DROP TRIGGER IF EXISTS allergy_permissions_touch_updated_at ON coach.allergy_permissions;
CREATE TRIGGER allergy_permissions_touch_updated_at
  BEFORE INSERT OR UPDATE ON coach.allergy_permissions
  FOR EACH ROW EXECUTE FUNCTION coach.touch_allergy_permission_updated_at();

DROP TRIGGER IF EXISTS allergy_permissions_change_log ON coach.allergy_permissions;
CREATE TRIGGER allergy_permissions_change_log
  AFTER INSERT OR UPDATE OR DELETE ON coach.allergy_permissions
  FOR EACH ROW EXECUTE FUNCTION coach.log_allergy_permission_change();

CREATE OR REPLACE FUNCTION coach.hat_allergie_sicht(p_client uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, coach
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM coach.allergy_permissions p
    WHERE p.coach_id = auth.uid()
      AND p.client_id = p_client
      AND p.visibility = 'full'
      AND (p.expires_at IS NULL OR p.expires_at > now())
  );
$$;

CREATE OR REPLACE FUNCTION public.user_allergy_codes(p_user_id uuid)
RETURNS text[]
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
  SELECT COALESCE(array_agg(ua.stoff_code ORDER BY ua.stoff_code), '{}'::text[])
  FROM public.user_allergies ua
  WHERE ua.user_id = p_user_id
    AND ua.art = 'nahrung'
    AND ua.stoff_code IS NOT NULL;
$$;

ALTER TABLE public.user_allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allergen_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach.allergy_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach.allergy_permission_change_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_allergies_select ON public.user_allergies
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR coach.hat_allergie_sicht(user_id));
CREATE POLICY user_allergies_insert ON public.user_allergies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_allergies_update ON public.user_allergies
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_allergies_delete ON public.user_allergies
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY allergen_aliases_select ON public.allergen_aliases
  FOR SELECT TO authenticated USING (true);
CREATE POLICY allergy_permissions_select ON coach.allergy_permissions
  FOR SELECT TO authenticated USING (auth.uid() IN (coach_id, client_id));
CREATE POLICY allergy_permissions_insert ON coach.allergy_permissions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);
CREATE POLICY allergy_permissions_update ON coach.allergy_permissions
  FOR UPDATE TO authenticated USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);
CREATE POLICY allergy_permissions_delete ON coach.allergy_permissions
  FOR DELETE TO authenticated USING (auth.uid() = client_id);
CREATE POLICY allergy_permission_change_log_select ON coach.allergy_permission_change_log
  FOR SELECT TO authenticated USING (auth.uid() IN (coach_id, client_id));
CREATE POLICY allergy_permission_change_log_insert ON coach.allergy_permission_change_log
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = changed_by AND auth.uid() IN (coach_id, client_id));

REVOKE ALL ON TABLE public.user_allergies FROM PUBLIC, anon;
REVOKE ALL ON TABLE public.allergen_aliases FROM PUBLIC, anon;
REVOKE ALL ON TABLE coach.allergy_permissions FROM PUBLIC, anon;
REVOKE ALL ON TABLE coach.allergy_permission_change_log FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.touch_user_allergy_updated_at() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION coach.touch_allergy_permission_updated_at() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION coach.log_allergy_permission_change() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION coach.hat_allergie_sicht(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.user_allergy_codes(uuid) FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_allergies TO authenticated;
GRANT SELECT ON TABLE public.allergen_aliases TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE coach.allergy_permissions TO authenticated;
GRANT SELECT ON TABLE coach.allergy_permission_change_log TO authenticated;
GRANT EXECUTE ON FUNCTION coach.hat_allergie_sicht(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_allergy_codes(uuid) TO authenticated;
GRANT ALL ON TABLE public.user_allergies, public.allergen_aliases TO service_role;
GRANT ALL ON TABLE coach.allergy_permissions, coach.allergy_permission_change_log TO service_role;

INSERT INTO public.user_allergies (user_id, stoff_code, stoff_text, art, schwere, quelle)
SELECT
  fp.user_id,
  lower(btrim(allergy.stoff_code)),
  replace(lower(btrim(allergy.stoff_code)), '_', ' '),
  'nahrung',
  'allergie',
  'nutrition_preferences'
FROM nutrition.food_preferences fp
CROSS JOIN LATERAL unnest(COALESCE(fp.allergies, '{}'::text[])) AS allergy(stoff_code)
WHERE btrim(allergy.stoff_code) <> ''
ON CONFLICT (user_id, stoff_code, art) WHERE stoff_code IS NOT NULL DO NOTHING;

ALTER TABLE nutrition.food_preferences DROP COLUMN allergies;

COMMENT ON TABLE public.user_allergies IS
  'C-498: globale, vom Nutzer gepflegte Allergien fuer alle Module. Coach-Lesen braucht die eigene Freigabe in coach.allergy_permissions.';
COMMENT ON TABLE coach.allergy_permissions IS
  'C-498: eigene, vom Klienten gesetzte Coach-Freigabe fuer Allergiedaten; nicht Teil einer Modul-Pauschalfreigabe.';
COMMENT ON TABLE coach.allergy_permission_change_log IS
  'C-498: append-only Protokoll jeder Allergie-Freigabe, Aenderung und jedes Widerrufs.';

COMMIT;
