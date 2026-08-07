-- =============================================================
-- 100 — Schema `training`: Stammdaten (E-05 Vorarbeit)
-- Datum: 2026-08-07 · Anker: b2b488e
-- Zweck: Uebungen, Muskelgruppen, Geraete und Zuordnung als
--        gemeinsamer Bestand — nach dem Muster von `nutrition`.
-- Idempotent: CREATE ... IF NOT EXISTS, Policies per DROP + CREATE.
-- Laeuft unabhaengig von der Nutrition-Kette; braucht nur pg_trgm.
--
-- NUR STAMMDATEN. Die 12 uebrigen Tabellen aus SPEC_06 (routines,
-- workout_sessions, workout_sets, personal_records, …) sind Nutzerdaten
-- und gehoeren in einen eigenen Schritt, wenn das Modul gebaut wird.
--
-- =============================================================
-- WARUM DAS ALTE SCHEMA NICHT UEBERNOMMEN WIRD
-- =============================================================
-- [read] SPEC_06_DATABASE_SCHEMA.md Abschnitte 2-5 als Referenz.
-- Abweichungen davon und vom Altbestand, je mit gemessenem Grund:
--
-- 1. KEINE text[]-Spalten fuer Muskeln. Der Altbestand fuehrt dieselbe
--    Tatsache doppelt: `exercises.primary_muscles` als Array UND
--    `exercise_muscles` als Zuordnungstabelle.
--    [cmd] Die Tabelle ist unvollstaendig gepflegt — primary Array 3.138
--    gegen Tabelle 2.972, secondary 3.658 gegen 3.426; 398 Zuordnungen
--    stehen nur im Array, kein einziger Widerspruch andersherum.
--    Folge: die ARRAYS sind die Quelle, die TABELLE ist die Struktur.
--    Der Seed (101) befuellt die Tabelle aus den Arrays.
--
-- 2. ECHTE FREMDSCHLUESSEL. [cmd] Der Altbestand hat KEINE — weder auf
--    equipment noch zwischen exercise_muscles und den beiden Zielen.
--    `equipment_id` war 1.448/1.448 gefuellt und 0 Waisen: stimmig aus
--    Disziplin, nicht aus Struktur. Hier erzwungen.
--
-- 3. KEINE name_de/name_th-Spalten auf den Stammdaten.
--    [cmd] Im Altbestand sind beide in ALLEN vier Tabellen durchgehend
--    NULL. [read] SPEC_06 sieht sie vor und nennt „3-sprachig,
--    1.850/1.850 uebersetzt" — das ist Zielbild, kein Bestand.
--    Entscheidung: Spalten NICHT aufnehmen, solange es nichts zu
--    speichern gibt. Ein leeres Versprechen im Schema ist schlechter als
--    eine spaetere Migration, die ehrlich sagt, wann die Uebersetzungen
--    kamen. Wenn Mehrsprachigkeit gebaut wird, gehoert sie ohnehin als
--    eigene Tabelle (Sprache × Feld) statt als Spaltenpaar je Text.
--
-- 4. MEDIENPFADE RELATIV (E-06). Statt fuenf TEXT-Spalten mit absoluten
--    URLs: `media_paths jsonb` mit relativen Objektpfaden. Der Ort steht
--    in der Konfiguration, nicht in 1.448 Zeilen.
--    [cmd] Gegenprobe: alle 3.753 Verweise lassen sich verlustfrei
--    zerlegen und wieder zusammensetzen, 0 Ziel-Abweichungen.
--
-- 5. `body_region` OHNE den Wert 'other'. [read] SPEC_06 laesst nur
--    chest/back/shoulders/arms/core/legs/full_body zu; [cmd] der
--    Altbestand nutzt 65x 'other', das dort nicht vorgesehen ist.
--    Loesung: Spalte NULLABLE statt Pseudo-Wert. NULL heisst „nicht
--    zugeordnet" und ist ehrlich; 'other' behauptet eine Zuordnung.
--
-- 6. `category` normalisiert. [cmd] Der Altbestand fuehrt 'Bodyweight'
--    (531) UND 'bodyweight' (22) — derselbe Wert, zwei Schreibweisen.
--    Der CHECK laesst nur die Schreibweise aus SPEC_06 zu; der Seed
--    vereinheitlicht.
--
-- 7. FELDER, DIE IM BESTAND LEER SIND, kommen NICHT mit:
--    [cmd] description, score_hypertrophy, score_strength, score_sfr,
--    common_mistakes, aliases sind 0 von 1.448 befuellt.
--    [read] SPEC_06 nennt an ihrer Stelle einen „Science Layer"
--    (evaluation_score, sfr_rating, stretch_position,
--    mechanical_tension) — andere Namen, andere Bedeutung. Die
--    Overload-Engine (SPEC_04 Feature 4) rechnet auf Sets und Verlauf,
--    nicht auf diesen Feldern. Sie kommen mit dem Modul, nicht mit den
--    Stammdaten. Wer sie jetzt anlegt, legt leere Spalten an.
-- =============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS training;

-- -------------------------------------------------------------
-- 1. muscle_groups — Katalog
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS training.muscle_groups (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  body_region   TEXT
    CHECK (body_region IS NULL OR body_region IN
      ('chest','back','shoulders','arms','core','legs','full_body')),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- UNIQUE auf name ist moeglich: [cmd] nach Zusammenfuehrung der 21
-- Klammerpaare bleiben 136 eindeutige Namen (vorher 157 mit Dubletten
-- wie "Triceps" und "Triceps)").

CREATE INDEX IF NOT EXISTS idx_muscle_groups_region
  ON training.muscle_groups(body_region);

-- -------------------------------------------------------------
-- 2. equipment — Katalog
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS training.equipment (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- KEINE `category`-Spalte: [cmd] im Altbestand stehen ALLE 61 Zeilen auf
-- 'general' — die Spalte traegt null Information. Sie kommt zurueck,
-- wenn es etwas zu unterscheiden gibt.

-- -------------------------------------------------------------
-- 3. exercises — der eigentliche Bestand
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS training.exercises (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,

  category      TEXT NOT NULL
    CHECK (category IN ('Bodyweight','Free Weights','Resistance','Cardio','Stretching')),
  exercise_type TEXT NOT NULL DEFAULT 'strength'
    CHECK (exercise_type IN ('strength','cardio','stretching','yoga','calisthenics','plyometric')),
  tracking_type TEXT NOT NULL DEFAULT 'weight_reps'
    CHECK (tracking_type IN ('weight_reps','reps_only','duration','distance_duration')),
  difficulty    TEXT NOT NULL DEFAULT 'intermediate'
    CHECK (difficulty IN ('beginner','intermediate','advanced')),

  equipment_id  UUID REFERENCES training.equipment(id) ON DELETE RESTRICT,

  instructions  TEXT,
  tips          TEXT,

  -- E-06: relative Objektpfade, KEINE absoluten URLs.
  -- Form: {"video_url":"videos/Back/pull up wide grip .mp4", ...}
  -- Der Ort (Host, Bucket) steht in der Konfiguration.
  media_paths   JSONB NOT NULL DEFAULT '{}'::jsonb,

  sort_weight   INTEGER NOT NULL DEFAULT 500
    CHECK (sort_weight BETWEEN 0 AND 1000),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  source        TEXT NOT NULL DEFAULT 'exercise_animatic',

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ON DELETE RESTRICT auf equipment: ein Geraet zu loeschen, auf das
-- Uebungen zeigen, muss auffallen — nicht stillschweigend Uebungen
-- entwerten. Dieselbe Linie wie bei meal_items -> foods (052).

CREATE INDEX IF NOT EXISTS idx_exercises_category
  ON training.exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment
  ON training.exercises(equipment_id);
CREATE INDEX IF NOT EXISTS idx_exercises_sort_weight
  ON training.exercises(sort_weight DESC);
CREATE INDEX IF NOT EXISTS idx_exercises_name_trgm
  ON training.exercises USING GIN (name gin_trgm_ops);

-- -------------------------------------------------------------
-- 4. exercise_muscles — die Struktur, die der Altbestand haette sein
--    sollen. Befuellt aus den Arrays (Schritt 101).
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS training.exercise_muscles (
  exercise_id     UUID NOT NULL REFERENCES training.exercises(id) ON DELETE CASCADE,
  muscle_group_id UUID NOT NULL REFERENCES training.muscle_groups(id) ON DELETE RESTRICT,
  role            TEXT NOT NULL CHECK (role IN ('primary','secondary','stabilizer')),
  PRIMARY KEY (exercise_id, muscle_group_id, role)
);

-- Der Primaerschluessel ersetzt einen eigenen UNIQUE: dieselbe Uebung
-- kann denselben Muskel nicht zweimal in derselben Rolle fuehren.
-- 'stabilizer' ist aus SPEC_06 uebernommen, obwohl [cmd] der Bestand nur
-- primary und secondary kennt — die Rolle ist fachlich vorgesehen und
-- kostet als CHECK-Eintrag nichts.

CREATE INDEX IF NOT EXISTS idx_exercise_muscles_muscle
  ON training.exercise_muscles(muscle_group_id);

-- -------------------------------------------------------------
-- 5. updated_at fortschreiben (eigene Funktion, damit `training`
--    nicht an der Nutrition-Kette haengt).
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION training.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $touch$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$touch$;

DROP TRIGGER IF EXISTS exercises_touch_updated_at ON training.exercises;
CREATE TRIGGER exercises_touch_updated_at
  BEFORE UPDATE ON training.exercises
  FOR EACH ROW EXECUTE FUNCTION training.touch_updated_at();

-- =============================================================
-- 6. RECHTE — Stammdaten, keine Nutzerdaten
-- =============================================================
-- Uebungen sind gemeinsamer Bestand wie die BLS-Lebensmittel, nicht
-- Eigentum einer Nutzerin. Deshalb dieselbe Linie wie 060 fuer
-- nutrition.foods: LESEN fuer authenticated, SCHREIBEN nur fuer
-- Verwaltung.
--
-- Konkret: authenticated bekommt NUR SELECT. Schreib-Policies gibt es
-- fuer Admins (public.is_admin(), seit 061) — damit ein spaeterer
-- Kurationspfad in apps/admin existiert, ohne dass jede Nutzerin den
-- gemeinsamen Bestand aendern kann. service_role arbeitet fuer die
-- Importe per bypassrls daran vorbei.
-- =============================================================
GRANT USAGE ON SCHEMA training TO authenticated, service_role;

-- ACHTUNG, hier steckt die Falle, die 060 §3c beschreibt und in die
-- dieser Schritt beim ersten Anlauf selbst gelaufen ist:
-- Zuerst stand hier nur GRANT SELECT — mit der Absicht „schreiben darf
-- nur der Admin". Die Admin-Policies unten waren damit TOTER TEXT:
-- [cmd] 2026-08-07 in der Wegwerf-DB belegt, ein Admin bekam
-- „permission denied for table exercises", obwohl die Policy existierte.
-- PostgREST und Postgres pruefen das Tabellenrecht VOR RLS. Ein Recht,
-- das der Grant nicht gibt, kann keine Policy zurueckholen.
--
-- Richtig ist die Linie aus 060 §3c: DML-Grant fuer `authenticated`
-- geben und die EINGRENZUNG den Policies ueberlassen. Der Grant sagt
-- „diese Operation ist moeglich", die Policy sagt „fuer wen".
-- Ohne die Admin-Policies unten waere das ein Loch — mit ihnen ist es
-- die einzige Form, in der die Absicht ueberhaupt wirken kann.
GRANT SELECT, INSERT, UPDATE, DELETE ON
  training.muscle_groups,
  training.equipment,
  training.exercises,
  training.exercise_muscles
TO authenticated;

GRANT ALL ON
  training.muscle_groups,
  training.equipment,
  training.exercises,
  training.exercise_muscles
TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA training GRANT SELECT ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA training GRANT ALL ON TABLES TO service_role;

-- -------------------------------------------------------------
-- 7. Zeilenschutz und Policies je Operation.
--    ACHTUNG: RLS ohne Policy sperrt die Tabelle vollstaendig — der
--    Fehler des verworfenen Diary-Entwurfs (ADR-0003). Jede Tabelle
--    bekommt deshalb eine SELECT-Policy, und die Schreib-Policies
--    tragen WITH CHECK (USING allein prueft INSERTs nicht, 060 §4c).
-- -------------------------------------------------------------
ALTER TABLE training.muscle_groups    ENABLE ROW LEVEL SECURITY;
ALTER TABLE training.equipment        ENABLE ROW LEVEL SECURITY;
ALTER TABLE training.exercises        ENABLE ROW LEVEL SECURITY;
ALTER TABLE training.exercise_muscles ENABLE ROW LEVEL SECURITY;

-- Lesen: alle Angemeldeten. `exercises` zusaetzlich auf is_active
-- eingegrenzt (SPEC_06), Admins sehen auch die inaktiven.
DROP POLICY IF EXISTS muscle_groups_select ON training.muscle_groups;
CREATE POLICY muscle_groups_select ON training.muscle_groups
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS equipment_select ON training.equipment;
CREATE POLICY equipment_select ON training.equipment
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS exercises_select ON training.exercises;
CREATE POLICY exercises_select ON training.exercises
  FOR SELECT TO authenticated USING (is_active OR public.is_admin());

DROP POLICY IF EXISTS exercise_muscles_select ON training.exercise_muscles;
CREATE POLICY exercise_muscles_select ON training.exercise_muscles
  FOR SELECT TO authenticated USING (true);

-- Schreiben: nur Verwaltung.
DROP POLICY IF EXISTS muscle_groups_admin_insert ON training.muscle_groups;
DROP POLICY IF EXISTS muscle_groups_admin_update ON training.muscle_groups;
DROP POLICY IF EXISTS muscle_groups_admin_delete ON training.muscle_groups;
CREATE POLICY muscle_groups_admin_insert ON training.muscle_groups
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY muscle_groups_admin_update ON training.muscle_groups
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY muscle_groups_admin_delete ON training.muscle_groups
  FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS equipment_admin_insert ON training.equipment;
DROP POLICY IF EXISTS equipment_admin_update ON training.equipment;
DROP POLICY IF EXISTS equipment_admin_delete ON training.equipment;
CREATE POLICY equipment_admin_insert ON training.equipment
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY equipment_admin_update ON training.equipment
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY equipment_admin_delete ON training.equipment
  FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS exercises_admin_insert ON training.exercises;
DROP POLICY IF EXISTS exercises_admin_update ON training.exercises;
DROP POLICY IF EXISTS exercises_admin_delete ON training.exercises;
CREATE POLICY exercises_admin_insert ON training.exercises
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY exercises_admin_update ON training.exercises
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY exercises_admin_delete ON training.exercises
  FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS exercise_muscles_admin_insert ON training.exercise_muscles;
DROP POLICY IF EXISTS exercise_muscles_admin_update ON training.exercise_muscles;
DROP POLICY IF EXISTS exercise_muscles_admin_delete ON training.exercise_muscles;
CREATE POLICY exercise_muscles_admin_insert ON training.exercise_muscles
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY exercise_muscles_admin_update ON training.exercise_muscles
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY exercise_muscles_admin_delete ON training.exercise_muscles
  FOR DELETE TO authenticated USING (public.is_admin());

COMMIT;
