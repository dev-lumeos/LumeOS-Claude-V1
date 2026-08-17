-- =============================================================
-- 120 -- Recovery Check-ins (C-67)
-- Datum: 2026-08-17
-- Zweck: recovery.checkins als erste Recovery-Usertabelle.
-- Idempotent: CREATE IF NOT EXISTS, Policies per DROP + CREATE.
--
-- Zuschnitt:
--   [read] SPEC_06 nennt recovery_checkins als taeglichen Morning
--          Check-in mit Schlaf, Stimmung, Stress, Soreness und optional
--          HRV/Wearable-Werten.
--   [read] SPEC_02: 1 Check-in/Tag, UPSERT, Score computed separat.
--   [cmd]  Im aktuellen Repo existiert vor diesem Schritt kein
--          recovery-Schema.
--
-- Bewusste Abweichungen:
--   1. Tabellenname recovery.checkins statt recovery.recovery_checkins:
--      der aktuelle Auftrag nennt recovery.checkins ausdruecklich.
--   2. Zeit wie bei nutrition.meals: lokaler Tag + lokale Uhrzeit,
--      nicht nur timestamptz. Kein DEFAULT now(), weil der Server UTC
--      laeuft und dadurch lokale Morgen-Check-ins verschieben wuerde.
--   3. Kein Score, keine HRV-Baseline, keine Schlaf-/Modality-Tabellen.
--      C-67 baut nur die manuelle Datengrundlage.
-- =============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS recovery;

CREATE OR REPLACE FUNCTION recovery.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS recovery.checkins (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL,
  entry_date             DATE NOT NULL,
  checkin_time           TIME,

  sleep_hours            NUMERIC(3,1) CHECK (sleep_hours IS NULL OR sleep_hours BETWEEN 0 AND 14),
  sleep_quality          SMALLINT CHECK (sleep_quality IS NULL OR sleep_quality BETWEEN 1 AND 10),
  sleep_start_time       TIME,
  sleep_end_time         TIME,

  subjective_feeling     SMALLINT CHECK (subjective_feeling IS NULL OR subjective_feeling BETWEEN 1 AND 10),
  mood                   TEXT NOT NULL DEFAULT 'neutral'
    CHECK (mood IN ('motivated','good','neutral','tired','sick')),
  energy_level           SMALLINT CHECK (energy_level IS NULL OR energy_level BETWEEN 1 AND 10),
  motivation             SMALLINT CHECK (motivation IS NULL OR motivation BETWEEN 1 AND 10),

  soreness               JSONB NOT NULL DEFAULT '{}'::jsonb,
  pain_areas             TEXT[] NOT NULL DEFAULT '{}',

  stress_level           SMALLINT CHECK (stress_level IS NULL OR stress_level BETWEEN 1 AND 10),
  work_stress            SMALLINT CHECK (work_stress IS NULL OR work_stress BETWEEN 1 AND 10),
  life_stress            SMALLINT CHECK (life_stress IS NULL OR life_stress BETWEEN 1 AND 10),

  alcohol_units          NUMERIC(3,1) CHECK (alcohol_units IS NULL OR alcohol_units >= 0),
  caffeine_mg            INTEGER CHECK (caffeine_mg IS NULL OR caffeine_mg >= 0),
  screen_time_before_bed INTEGER CHECK (screen_time_before_bed IS NULL OR screen_time_before_bed >= 0),

  resting_hr             INTEGER CHECK (resting_hr IS NULL OR resting_hr BETWEEN 25 AND 240),
  hrv_rmssd              NUMERIC(6,2) CHECK (hrv_rmssd IS NULL OR hrv_rmssd >= 0),
  spo2_pct               NUMERIC(4,1) CHECK (spo2_pct IS NULL OR spo2_pct BETWEEN 50 AND 100),
  respiratory_rate       NUMERIC(4,1) CHECK (respiratory_rate IS NULL OR respiratory_rate > 0),

  notes                  TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (user_id, entry_date),
  CHECK (jsonb_typeof(soreness) = 'object'),
  CHECK (checkin_time IS NULL OR EXTRACT(SECOND FROM checkin_time) = 0)
);

COMMENT ON TABLE recovery.checkins IS
  'Taeglicher Recovery-Check-in eines Nutzers (C-67). V1: ein Check-in je lokalem entry_date, per Upsert aenderbar.';

COMMENT ON COLUMN recovery.checkins.checkin_time IS
  'Lokale Uhrzeit des Check-ins zum entry_date. Kein DB-Default: die Anwendung setzt die lokale aktuelle Uhrzeit; der Server laeuft in UTC.';

CREATE INDEX IF NOT EXISTS idx_recovery_checkins_user_date
  ON recovery.checkins(user_id, entry_date DESC);

DROP TRIGGER IF EXISTS recovery_checkins_touch_updated_at ON recovery.checkins;
CREATE TRIGGER recovery_checkins_touch_updated_at
  BEFORE UPDATE ON recovery.checkins
  FOR EACH ROW EXECUTE FUNCTION recovery.touch_updated_at();

GRANT USAGE ON SCHEMA recovery TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON recovery.checkins TO authenticated;
GRANT ALL ON recovery.checkins TO service_role;

ALTER TABLE recovery.checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS recovery_checkins_select ON recovery.checkins;
DROP POLICY IF EXISTS recovery_checkins_insert ON recovery.checkins;
DROP POLICY IF EXISTS recovery_checkins_update ON recovery.checkins;
DROP POLICY IF EXISTS recovery_checkins_delete ON recovery.checkins;

CREATE POLICY recovery_checkins_select ON recovery.checkins
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY recovery_checkins_insert ON recovery.checkins
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY recovery_checkins_update ON recovery.checkins
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY recovery_checkins_delete ON recovery.checkins
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

COMMIT;
