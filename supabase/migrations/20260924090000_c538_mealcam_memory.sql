BEGIN;

-- C-538: MealCam sammelt fruehe Lehrdaten, ohne aus ihnen bereits eine
-- Erkennung, Rangliste oder Nutzungsgewohnheit abzuleiten. Der Bild-Hash ist
-- der spaetere Bildschluessel; es gibt bewusst keine globale Eindeutigkeit
-- und keinen automatischen Rueckgriff auf eine fremde Deklaration.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'nutrition-mealcam-images',
  'nutrition-mealcam-images',
  false,
  20971520,
  ARRAY['image/jpeg', 'image/png', 'image/heic']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS nutrition_mealcam_images_select_own ON storage.objects;
DROP POLICY IF EXISTS nutrition_mealcam_images_insert_own ON storage.objects;
DROP POLICY IF EXISTS nutrition_mealcam_images_update_own ON storage.objects;
DROP POLICY IF EXISTS nutrition_mealcam_images_delete_own ON storage.objects;

CREATE POLICY nutrition_mealcam_images_select_own ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'nutrition-mealcam-images'
    AND owner_id = (SELECT auth.uid())::text
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
CREATE POLICY nutrition_mealcam_images_insert_own ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'nutrition-mealcam-images'
    AND owner_id = (SELECT auth.uid())::text
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
CREATE POLICY nutrition_mealcam_images_update_own ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'nutrition-mealcam-images'
    AND owner_id = (SELECT auth.uid())::text
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'nutrition-mealcam-images'
    AND owner_id = (SELECT auth.uid())::text
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
CREATE POLICY nutrition_mealcam_images_delete_own ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'nutrition-mealcam-images'
    AND owner_id = (SELECT auth.uid())::text
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE TABLE nutrition.mealcam_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_path text NOT NULL CHECK (btrim(image_path) <> ''),
  image_sha256 text NOT NULL CHECK (image_sha256 ~ '^[0-9a-f]{64}$'),
  vision_result jsonb NOT NULL CHECK (jsonb_typeof(vision_result) = 'object'),
  food_id uuid NOT NULL REFERENCES nutrition.foods(id) ON DELETE RESTRICT,
  food_name_snapshot text NOT NULL CHECK (btrim(food_name_snapshot) <> ''),
  portion_amount numeric NOT NULL CHECK (portion_amount > 0),
  portion_unit text NOT NULL CHECK (btrim(portion_unit) <> ''),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX mealcam_scans_user_created_idx
  ON nutrition.mealcam_scans (user_id, created_at DESC);
CREATE INDEX mealcam_scans_food_idx
  ON nutrition.mealcam_scans (food_id);
CREATE INDEX mealcam_scans_food_name_trgm_idx
  ON nutrition.mealcam_scans
  USING gin (nutrition.search_fold(food_name_snapshot) public.gin_trgm_ops);

CREATE TRIGGER mealcam_scans_touch_updated_at
  BEFORE UPDATE ON nutrition.mealcam_scans
  FOR EACH ROW EXECUTE FUNCTION nutrition.touch_updated_at();

-- Diese Funktion vergleicht genau die vom Aufrufer benannte Bild-Deklaration
-- mit genau einem Scan. Sie liest wegen SECURITY INVOKER/RLS keine fremden
-- Scans und enthaelt keine Suche, Rangfolge oder Vorschlagslogik.
CREATE FUNCTION nutrition.mealcam_scan_declaration_similarity(
  p_scan_id uuid,
  p_declaration_text text
)
RETURNS real
LANGUAGE sql
STABLE
STRICT
SECURITY INVOKER
SET search_path = ''
AS $function$
  SELECT public.similarity(
    nutrition.search_fold(scan_row.food_name_snapshot),
    nutrition.search_fold(p_declaration_text)
  )
  FROM nutrition.mealcam_scans AS scan_row
  WHERE scan_row.id = p_scan_id;
$function$;

ALTER TABLE nutrition.mealcam_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY mealcam_scans_select_own
  ON nutrition.mealcam_scans FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);
CREATE POLICY mealcam_scans_insert_own
  ON nutrition.mealcam_scans FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY mealcam_scans_update_own
  ON nutrition.mealcam_scans FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY mealcam_scans_delete_own
  ON nutrition.mealcam_scans FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

REVOKE ALL ON TABLE nutrition.mealcam_scans FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION nutrition.mealcam_scan_declaration_similarity(uuid, text)
  FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA nutrition TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE nutrition.mealcam_scans TO authenticated;
GRANT EXECUTE ON FUNCTION nutrition.mealcam_scan_declaration_similarity(uuid, text) TO authenticated;
GRANT ALL ON TABLE nutrition.mealcam_scans TO service_role;
GRANT ALL ON FUNCTION nutrition.mealcam_scan_declaration_similarity(uuid, text) TO service_role;

COMMENT ON TABLE nutrition.mealcam_scans IS
  'C-538: private MealCam-Lehrdaten je Aufnahme: Storage-Pfad, rohes Visionsergebnis und erklaerter BLS-Eintrag mit Portion. Kein Lern- oder Vorschlagsmodell.';
COMMENT ON COLUMN nutrition.mealcam_scans.image_path IS
  'Storage-Objektpfad im privaten nutrition-mealcam-images Bucket, kein oeffentlicher oder signierter Link.';
COMMENT ON COLUMN nutrition.mealcam_scans.image_sha256 IS
  'SHA-256 der Aufnahme als bildbezogener Schluessel fuer eine spaetere deterministische Bauform; keine globale Zuordnung in C-538.';
COMMENT ON COLUMN nutrition.mealcam_scans.vision_result IS
  'Unveraendertes Rohresultat des kuenftigen Vision-Layers. C-538 wertet es nicht aus.';
COMMENT ON FUNCTION nutrition.mealcam_scan_declaration_similarity(uuid, text) IS
  'C-538: pg_trgm-Vergleich einer konkreten Scan-Deklaration mit einem gegebenen Text; keine Suche, Rangfolge oder Nutzerhistorie.';

COMMIT;
