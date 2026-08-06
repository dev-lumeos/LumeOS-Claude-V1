-- =============================================================
-- 052 — Diary-Grundlage (C-03 / WP-02)
-- Datum: 2026-08-06 · Anker: 676460c
-- Zweck: nutrition.meals + nutrition.meal_items anlegen, inkl.
--        Rechten, Zeilenschutz und Policies je Operation.
-- Entscheidung: ADR-0003 (EAV anschliessen, db/schema/nutrition.sql
--        verworfen). Hier wird gebaut, nicht entschieden.
-- Idempotent: CREATE TABLE IF NOT EXISTS, Indizes IF NOT EXISTS,
--        Policies per DROP POLICY IF EXISTS + CREATE (Muster 060).
-- Läuft NACH 051 und NACH 060 (060 vergibt die Grants der 11
--        Altbestandstabellen; die beiden neuen bringen ihre eigenen mit,
--        damit 060 unverändert bleiben kann — es ist seit 2026-08-02 live).
--
-- Quellen und Nachweise:
--   [read] SPEC_06_DATABASE_SCHEMA.md Abschnitt 10 als Referenz für
--          Namen und Zuschnitt — NICHT wörtlich übernommen, siehe
--          "Abweichungen von SPEC_06" unten.
--   [cmd]  2026-08-06: weder meals noch meal_items noch diary_days
--          existieren, in keinem Schema (information_schema.tables).
--   [cmd]  2026-08-06: nutrition.food_nutrients hat 698.092 Zeilen,
--          Primärschlüssel (food_id, nutrient_code), value numeric(12,5);
--          Einheit steht je Code in nutrient_defs.unit (138 Codes).
--
-- BEZUGSGRÖSSE — nirgends im Repo dokumentiert, deshalb hier:
--   [cmd]  2026-08-06 aus den Daten belegt: die Werte in food_nutrients
--          gelten je 100 g essbarem Anteil (BLS-Konvention). Beleg:
--          max(CHO) = max(FAT) = exakt 100.00000 g; Cornflakes gezuckert
--          (C515600) trägt CHO 88,35 / FAT 0,54 / PROT625 4,62.
--          Daraus die Rechenregel: wert_position = wert_je_100g * menge_g / 100.
--          Wer diese Zeile ändert, ändert jede Nährwertberechnung.
--
-- Abweichungen von SPEC_06 (bewusst, je mit Grund):
--   1. KEIN custom_food_id / foods_custom — [cmd] nutrition.foods_custom
--      existiert nicht (to_regclass IS NULL). Ein Fremdschlüssel auf eine
--      nicht existente Tabelle liesse die Kette scheitern. food_source
--      kennt 'custom' deshalb noch nicht; der Wert kommt mit der Tabelle.
--   2. Policies je Operation statt einer FOR-ALL-Policy. SPEC_06 schreibt
--      `USING (...)` ohne WITH CHECK — genau das INSERT-Leck, das 060 bei
--      den Preferences beseitigt hat (Kommentar 4c dort). Nicht kopieren.
--   3. meal_items trägt user_id denormalisiert. SPEC_06 prüft den
--      Eigentümer per EXISTS-Unterabfrage auf meals. Direkter Vergleich
--      auth.uid() = user_id ist billiger (kein Join je Zeile) und folgt
--      dem 060-Muster. Der Gleichlauf mit meals.user_id wird durch einen
--      Trigger erzwungen, nicht durch Hoffnung (siehe unten).
--   4. Kein ::text-Cast in den Policies. user_id ist uuid, auth.uid()
--      liefert uuid — 060 hat den Cast der Alt-Policies bewusst entfernt.
--
-- NICHT Teil dieses Schritts: der Aggregationsweg für Tagessummen
--   (Sicht, materialisierte Sicht oder Summentabelle) gehört zu C-04.
--   Vorentscheidung, die dieser Entwurf erzwingt: die Schnell-Makros
--   liegen als Spalten vor (nicht nur im JSONB), damit eine Tagessumme
--   ohne JSONB-Auswertung summieren kann. Welche Form die Summe bekommt,
--   ist damit NICHT vorweggenommen.
-- =============================================================

BEGIN;

-- -------------------------------------------------------------
-- 1. meals — eine Mahlzeit je Nutzerin, Tag und Typ.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nutrition.meals (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL,
  entry_date DATE NOT NULL,
  meal_type  TEXT NOT NULL
    CHECK (meal_type IN ('breakfast','lunch','dinner','snack',
                         'pre_workout','post_workout','other')),
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Spaltenname entry_date statt SPEC_06 "date": `date` ist ein Typname
-- und in jeder Abfrage quotierungspflichtig. db/schema/nutrition.sql
-- nannte es ebenfalls entry_date.

CREATE INDEX IF NOT EXISTS idx_meals_user_date
  ON nutrition.meals(user_id, entry_date);

-- Duplikatschutz: genau EINE Mahlzeit je Nutzerin, Tag und Typ.
-- Ohne diesen Index ist "Frühstück von heute holen oder anlegen" ein
-- Select-vor-Insert und damit eine Race Condition — dieselbe Klasse,
-- die C-02 bei den Preferences als 23505 -> 409 aufgelöst hat.
-- Bewusst NICHT partiell: alle drei Spalten sind NOT NULL.
CREATE UNIQUE INDEX IF NOT EXISTS uq_meals_user_date_type
  ON nutrition.meals(user_id, entry_date, meal_type);

-- -------------------------------------------------------------
-- 2. meal_items — eine Position je Lebensmittel in einer Mahlzeit.
--    Die Nährwerte sind EINGEFROREN (ADR-0003).
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nutrition.meal_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id     UUID NOT NULL REFERENCES nutrition.meals(id) ON DELETE CASCADE,

  -- Denormalisiert, damit die Policies ohne Unterabfrage auskommen.
  -- Gleichlauf mit meals.user_id erzwingt der Trigger unter 3.
  user_id     UUID NOT NULL,

  -- Food-Referenz. ON DELETE RESTRICT, nicht CASCADE: ein Lebensmittel
  -- aus dem Stammdatenbestand zu löschen darf keine Tagebucheinträge
  -- vernichten. Stammdatenpflege muss den Konflikt sehen.
  food_id     UUID REFERENCES nutrition.foods(id) ON DELETE RESTRICT,
  food_source TEXT NOT NULL DEFAULT 'bls'
    CHECK (food_source IN ('bls','manual')),
  -- 'manual' = Schnelleintrag ohne Stammdatenbezug (Makros von Hand).
  -- 'custom'/'mealcam' aus SPEC_06 fehlen bewusst: die zugehörigen
  -- Tabellen bzw. Pfade existieren nicht ([cmd] foods_custom fehlt).

  -- Name zum Zeitpunkt der Erfassung, ebenfalls eingefroren: wird ein
  -- Lebensmittel später umbenannt, soll der Eintrag von damals lesbar
  -- bleiben wie damals.
  food_name   TEXT NOT NULL,
  amount_g    NUMERIC(10,2) NOT NULL CHECK (amount_g > 0),

  -- Schnell-Makros, eingefroren. Als Spalten, damit C-04 summieren kann,
  -- ohne JSONB auszuwerten. Neun Codes, [cmd] alle in nutrient_defs
  -- vorhanden (ENERCC, PROT625, FAT, CHO, FIBT, SUGAR, FASAT, NACL, WATER).
  enercc      NUMERIC(12,4),
  prot625     NUMERIC(12,4),
  fat         NUMERIC(12,4),
  cho         NUMERIC(12,4),
  fibt        NUMERIC(12,4),
  sugar       NUMERIC(12,4),
  fasat       NUMERIC(12,4),
  nacl        NUMERIC(12,4),
  water_g     NUMERIC(12,4),

  -- Vollständiger Schnappschuss aller vorhandenen Nährstoffe, bereits
  -- auf amount_g gerechnet. Format {"CODE": wert}. Fehlende Werte sind
  -- kein Schlüssel — ein fehlender Nährwert ist nicht 0.
  nutrients   JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- WANN eingefroren wurde. Ohne diesen Zeitpunkt lässt sich später nicht
  -- sagen, gegen welchen Stammdatenstand gerechnet wurde.
  frozen_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Eine Position ohne Stammdatenbezug muss ihren Namen selbst tragen;
  -- eine mit Bezug muss food_id haben.
  CONSTRAINT meal_items_source_target_check CHECK (
    (food_source = 'bls'    AND food_id IS NOT NULL) OR
    (food_source = 'manual' AND food_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_meal_items_meal ON nutrition.meal_items(meal_id);
CREATE INDEX IF NOT EXISTS idx_meal_items_user ON nutrition.meal_items(user_id);

-- KEIN UNIQUE auf (meal_id, food_id): dasselbe Lebensmittel zweimal in
-- einer Mahlzeit ist ein zulässiger Vorgang (zwei Portionen, getrennt
-- erfasst). Anders als bei den Preferences, wo zwei Zeilen je Food ein
-- widersprüchlicher Zustand wären. Der Duplikatschutz sitzt hier eine
-- Ebene höher, auf meals.

-- -------------------------------------------------------------
-- 3. Gleichlauf von meal_items.user_id mit meals.user_id.
--    Die denormalisierte Spalte ist nur dann sicher, wenn sie nicht
--    abweichen kann. Ohne diesen Trigger liesse sich eine Position mit
--    fremder user_id in die eigene Mahlzeit legen — oder umgekehrt eine
--    Position der eigenen user_id in eine fremde Mahlzeit, die dann für
--    die Eigentümerin der Mahlzeit unsichtbar wäre.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION nutrition.meal_items_owner_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $guard$
DECLARE
  owner UUID;
BEGIN
  SELECT m.user_id INTO owner FROM nutrition.meals m WHERE m.id = NEW.meal_id;
  IF owner IS NULL THEN
    RAISE EXCEPTION 'meal_items.meal_id % existiert nicht', NEW.meal_id
      USING ERRCODE = '23503';
  END IF;
  IF NEW.user_id <> owner THEN
    RAISE EXCEPTION
      'meal_items.user_id (%) weicht von meals.user_id (%) ab', NEW.user_id, owner
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$guard$;

DROP TRIGGER IF EXISTS meal_items_owner_guard_trg ON nutrition.meal_items;
CREATE TRIGGER meal_items_owner_guard_trg
  BEFORE INSERT OR UPDATE OF user_id, meal_id ON nutrition.meal_items
  FOR EACH ROW EXECUTE FUNCTION nutrition.meal_items_owner_guard();

-- -------------------------------------------------------------
-- 4. updated_at fortschreiben.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION nutrition.touch_updated_at()
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

DROP TRIGGER IF EXISTS meals_touch_updated_at ON nutrition.meals;
CREATE TRIGGER meals_touch_updated_at
  BEFORE UPDATE ON nutrition.meals
  FOR EACH ROW EXECUTE FUNCTION nutrition.touch_updated_at();

DROP TRIGGER IF EXISTS meal_items_touch_updated_at ON nutrition.meal_items;
CREATE TRIGGER meal_items_touch_updated_at
  BEFORE UPDATE ON nutrition.meal_items
  FOR EACH ROW EXECUTE FUNCTION nutrition.touch_updated_at();

-- WAS BEIM NACHTRÄGLICHEN ÄNDERN EINER POSITION PASSIERT:
-- Die eingefrorenen Werte werden NICHT automatisch nachgerechnet. Ändert
-- sich amount_g, muss der Schreibpfad alle Nährwerte und frozen_at neu
-- setzen — bewusst in der Anwendung, nicht in einem Trigger: die
-- Datenbank müsste dafür die Rechenregel ein zweites Mal führen, und
-- zwei Kopien derselben Regel driften (siehe supabase/README.md zu 020).
-- Ein UPDATE, das nur amount_g ändert und die Werte stehen lässt, ist
-- deshalb ein Anwendungsfehler, kein Datenbankfehler. Die Validierung
-- v052 prüft die Konsistenz stichprobenartig.

-- -------------------------------------------------------------
-- 5. Rechte. PostgREST prüft Tabellenrechte VOR RLS — ohne Grant ist
--    jede Policy toter Text (Begründung wörtlich aus 060, Abschnitt 3c).
-- -------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON
  nutrition.meals,
  nutrition.meal_items
TO authenticated;

GRANT ALL ON
  nutrition.meals,
  nutrition.meal_items
TO service_role;

-- -------------------------------------------------------------
-- 6. Zeilenschutz und Policies je Operation.
--    ACHTUNG: RLS ohne Policy sperrt die Tabelle vollständig. Genau
--    dieser Fehler stand in db/schema/nutrition.sql Z. 89 für
--    meal_items (RLS an, keine Policy) und ist in ADR-0003 benannt.
--    Deshalb hier: beide Tabellen, vier Policies je Tabelle.
-- -------------------------------------------------------------
ALTER TABLE nutrition.meals      ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.meal_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS meals_select ON nutrition.meals;
DROP POLICY IF EXISTS meals_insert ON nutrition.meals;
DROP POLICY IF EXISTS meals_update ON nutrition.meals;
DROP POLICY IF EXISTS meals_delete ON nutrition.meals;

CREATE POLICY meals_select ON nutrition.meals
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY meals_insert ON nutrition.meals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY meals_update ON nutrition.meals
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY meals_delete ON nutrition.meals
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS meal_items_select ON nutrition.meal_items;
DROP POLICY IF EXISTS meal_items_insert ON nutrition.meal_items;
DROP POLICY IF EXISTS meal_items_update ON nutrition.meal_items;
DROP POLICY IF EXISTS meal_items_delete ON nutrition.meal_items;

CREATE POLICY meal_items_select ON nutrition.meal_items
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY meal_items_insert ON nutrition.meal_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY meal_items_update ON nutrition.meal_items
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY meal_items_delete ON nutrition.meal_items
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

COMMIT;
