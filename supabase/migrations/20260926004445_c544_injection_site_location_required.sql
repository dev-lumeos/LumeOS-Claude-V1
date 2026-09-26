-- =============================================================
-- C-544 - Jede Injektionsstelle braucht einen Koerperort
-- Datum: 2026-09-26
-- =============================================================
--
-- Diese Abschlussmigration steht nach dem Seed in der Aufbaukette.
-- So kann die Struktur zuerst den nullable Fremdschluessel anlegen,
-- der Seed alle 16 Bestandszeilen kuratieren und erst danach die
-- dauerhafte NOT-NULL-Invariante greifen.

BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM medical.injection_sites
    WHERE koerperort_id IS NULL
  ) THEN
    RAISE EXCEPTION
      'C-544: koerperort_id kann nicht verpflichtend werden; mindestens eine Injektionsstelle ist unzugeordnet.';
  END IF;
END;
$$;

ALTER TABLE medical.injection_sites
  ALTER COLUMN koerperort_id SET NOT NULL;

COMMIT;
