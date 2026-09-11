-- C-463: Progress-Fotos sind keine Koerpermessung und keine Medical-Originale.
-- SPEC Goals DATABASE:310-340 beschreibt ihre Pose-Metadaten; der Draft
-- GoalsPosesView nennt die drei Posen-Sets. Die Dateien bleiben privat und
-- bekommen deshalb einen eigenen, pfadgebundenen Storage-Bucket ohne Coach-Leser.
BEGIN;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'goals-progress-photos',
  'goals-progress-photos',
  false,
  20971520,
  ARRAY['image/jpeg', 'image/png', 'image/heic']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS goals_progress_photos_select_own ON storage.objects;
DROP POLICY IF EXISTS goals_progress_photos_insert_own ON storage.objects;
DROP POLICY IF EXISTS goals_progress_photos_update_own ON storage.objects;
DROP POLICY IF EXISTS goals_progress_photos_delete_own ON storage.objects;

CREATE POLICY goals_progress_photos_select_own ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'goals-progress-photos'
    AND owner_id = (SELECT auth.uid())::text
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
CREATE POLICY goals_progress_photos_insert_own ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'goals-progress-photos'
    AND owner_id = (SELECT auth.uid())::text
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
CREATE POLICY goals_progress_photos_update_own ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'goals-progress-photos'
    AND owner_id = (SELECT auth.uid())::text
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'goals-progress-photos'
    AND owner_id = (SELECT auth.uid())::text
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
CREATE POLICY goals_progress_photos_delete_own ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'goals-progress-photos'
    AND owner_id = (SELECT auth.uid())::text
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE TABLE IF NOT EXISTS goals.progress_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date date NOT NULL,
  pose_type text NOT NULL CHECK (pose_type IN ('mandatory_8', 'quarter_turns', 'detail', 'custom')),
  pose_name text NOT NULL CHECK (btrim(pose_name) <> ''),
  pose_number integer,
  photo_url text NOT NULL CHECK (btrim(photo_url) <> ''),
  thumbnail_url text,
  ai_analysis jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(ai_analysis) = 'object'),
  ai_analyzed_at timestamptz,
  notes text,
  is_private boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_progress_photos_user_date
  ON goals.progress_photos (user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_progress_photos_user_pose
  ON goals.progress_photos (user_id, pose_name);

COMMENT ON TABLE goals.progress_photos IS
  'C-463/SPEC Goals DATABASE:310: private Fortschrittsfoto-Metadaten; die Bytes liegen nur im privaten goals-progress-photos Bucket.';
COMMENT ON COLUMN goals.progress_photos.photo_url IS
  'Storage-Objektpfad im privaten goals-progress-photos Bucket, kein oeffentlicher Link.';
COMMENT ON COLUMN goals.progress_photos.is_private IS
  'SPEC Goals OPEN_ITEMS:64 und Draft LogPhotoModal: standardmaessig privat; C-463 erteilt keinen Coach-Lesepfad.';

ALTER TABLE goals.progress_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS progress_photos_select_own ON goals.progress_photos;
DROP POLICY IF EXISTS progress_photos_insert_own ON goals.progress_photos;
DROP POLICY IF EXISTS progress_photos_update_own ON goals.progress_photos;
DROP POLICY IF EXISTS progress_photos_delete_own ON goals.progress_photos;

CREATE POLICY progress_photos_select_own ON goals.progress_photos
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY progress_photos_insert_own ON goals.progress_photos
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY progress_photos_update_own ON goals.progress_photos
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY progress_photos_delete_own ON goals.progress_photos
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

GRANT USAGE ON SCHEMA goals TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON goals.progress_photos TO authenticated;
GRANT ALL ON goals.progress_photos TO service_role;

DO $$
DECLARE
  v_columns integer;
  v_policies integer;
BEGIN
  SELECT count(*) INTO v_columns
  FROM information_schema.columns
  WHERE table_schema = 'goals' AND table_name = 'progress_photos';
  IF v_columns <> 13 THEN
    RAISE EXCEPTION 'C-463: progress_photos hat % statt 13 Spalten', v_columns;
  END IF;

  SELECT count(*) INTO v_policies
  FROM pg_policies
  WHERE schemaname = 'goals' AND tablename = 'progress_photos';
  IF v_policies <> 4 THEN
    RAISE EXCEPTION 'C-463: progress_photos hat % statt 4 Owner-Policies', v_policies;
  END IF;
END $$;

COMMIT;
