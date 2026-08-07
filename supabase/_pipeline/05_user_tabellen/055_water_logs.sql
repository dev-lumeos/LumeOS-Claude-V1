-- =============================================================
-- 055 — Water Tracking, Datenseite (C-05 / WP-04)
-- Datum: 2026-08-06 · Anker: a95fd14
-- Zweck: nutrition.water_logs — explizit getrunkenes Wasser je Nutzerin.
-- Idempotent: CREATE TABLE IF NOT EXISTS, Indizes IF NOT EXISTS,
--        Policies per DROP POLICY IF EXISTS + CREATE (Muster 060).
-- Laeuft NACH 052 (nutzt dieselben Trigger-Funktionen aus dem Diary).
--
-- Quellen und Nachweise:
--   [read] SPEC_06_DATABASE_SCHEMA.md Abschnitt 13 als Referenz.
--   [read] SPEC_04_FEATURES.md Feature 8 und
--          04_adrs/ADR_WATER_TOTAL_HYDRATION.md (Status: Final).
--   [cmd]  2026-08-06: water_logs existiert in KEINEM Schema.
--   [cmd]  2026-08-06: nutrition.meal_items traegt water_g, und
--          nutrition.daily_summary summiert es bereits (Spalten water_g
--          und water_g_missing) — die zweite Hydrationsquelle ist da.
--   [cmd]  2026-08-06: nutrition.nutrition_targets existiert NICHT.
--
-- =============================================================
-- DIE VIER ENTSCHEIDUNGEN
-- =============================================================
--
-- 1. EINZELEINTRAG je Trinkvorgang, kein hochgezaehlter Tagessatz.
--    Wie beim Diary (052), und aus demselben Grund: nur Einzelzeilen
--    erlauben, EINE Fehleingabe zurueckzunehmen. Bei einem Tagessatz
--    waere „ich habe versehentlich 1000 statt 100 eingetragen" nur durch
--    Nachrechnen von Hand zu heilen.
--    Zusaetzlich hier: [read] SPEC_04 Feature 8 nennt Quick-Add-Knoepfe
--    (250/500/750/1000 ml) — das sind mehrere Vorgaenge je Tag, per
--    Entwurf. Und die „Pending Action" (< 80 % nach 18:00 Uhr) braucht
--    den Zeitverlauf, nicht nur die Tagessumme.
--    Preis, benannt: jede Anzeige braucht eine Summe. Die ist billig
--    (ein SUM ueber wenige Zeilen je Tag) und liegt in 056.
--
-- 2. EINHEIT FEST MILLILITER, keine Einheitsspalte.
--    [read] SPEC_06 nennt die Spalte `amount_ml`, SPEC_04 die Quick-Add-
--    Mengen in ml. Eine Einheitsspalte laedt dazu ein, sie beim Summieren
--    zu vergessen — dann addiert jemand Liter und Milliliter. Umrechnung
--    gehoert in die Oberflaeche, nicht in die Ablage.
--    numeric(8,2) wie in SPEC_06: erlaubt Bruchteile (z. B. 33,3 ml je
--    Schluck-Schaetzung), begrenzt auf 999.999,99 ml.
--
-- 3. KEIN UNIQUE. Bewusst, mit Begruendung — nicht vergessen.
--    Zweimal 250 ml um 14:00 Uhr ist kein Fehler, sondern zwei Glaeser.
--    Es gibt keine Spaltenkombination, deren Wiederholung fachlich falsch
--    waere: nicht (user, tag), nicht (user, tag, menge), nicht
--    (user, zeitpunkt) — zwei Eintraege koennen dieselbe Sekunde tragen.
--    Ein UNIQUE hier waere ein erfundener Schutz, der echte Eingaben
--    ablehnt. C-12 hat Uniques ergaenzt, wo Wiederholung Widerspruch
--    bedeutet; hier bedeutet sie nichts dergleichen.
--    Die Wettlaufsituation aus C-02/C-12 gibt es hier nicht: es wird nie
--    „lesen, dann entscheiden ob insert oder update" — es wird immer
--    eingefuegt.
--
-- 4. TAGESZIEL GEHOERT NICHT HIERHER.
--    [read] ADR_WATER_TOTAL_HYDRATION (Final): Ziel kommt aus
--    `nutrition_targets.water_target`, geliefert von Goals.
--    [cmd] Diese Tabelle existiert nicht — sie gehoert zu C-06 (Goals)
--    und wird hier NICHT mitgebaut. Ein Ziel in water_logs waere je Zeile
--    wiederholt und beim ersten Zielwechsel widerspruechlich.
--    Benannt statt gebaut, damit klar ist, wo es fehlt.
--
-- =============================================================
-- WAS DIESE TABELLE NICHT ABDECKT
-- =============================================================
-- Die Gesamt-Hydration ist NICHT allein hier. [read] ADR_WATER_TOTAL_
-- HYDRATION: Gesamt = explizit getrunken + Wasser aus Nahrung.
-- Die zweite Quelle liegt bereits vor — [cmd] daily_summary.water_g
-- summiert meal_items.water_g. Die Zusammenfuehrung beider Quellen
-- macht die Sicht in 056, nicht diese Tabelle.
-- =============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS nutrition.water_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL,
  entry_date DATE NOT NULL,
  amount_ml  NUMERIC(8,2) NOT NULL CHECK (amount_ml > 0),
  source     TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual','quick_add')),
  logged_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Spaltenname `entry_date` statt SPEC_06 „date": `date` ist ein Typname
-- und in jeder Abfrage quotierungspflichtig. 052 nennt es ebenso —
-- zwei Namen fuer dasselbe im selben Schema waeren Drift.
--
-- `logged_at` zusaetzlich zu `entry_date`: die Pending-Action-Regel aus
-- SPEC_04 („< 80 % nach 18:00 Uhr") braucht die Uhrzeit. `created_at`
-- allein taugt dafuer nicht — es ist der Zeitpunkt der ERFASSUNG, nicht
-- des Trinkens. Wer um 20:00 Uhr nachtraegt, was er um 14:00 getrunken
-- hat, soll das eintragen koennen.
--
-- CHECK amount_ml > 0: 0 ml ist kein Trinkvorgang, negative Mengen sind
-- keine Korrektur (dafuer gibt es DELETE).

CREATE INDEX IF NOT EXISTS idx_water_logs_user_date
  ON nutrition.water_logs(user_id, entry_date);

-- KEIN UNIQUE — siehe Entscheidung 3 im Kopf.

-- -------------------------------------------------------------
-- updated_at fortschreiben. Nutzt die Funktion aus 052; sie ist
-- generisch und existiert bereits.
-- -------------------------------------------------------------
DROP TRIGGER IF EXISTS water_logs_touch_updated_at ON nutrition.water_logs;
CREATE TRIGGER water_logs_touch_updated_at
  BEFORE UPDATE ON nutrition.water_logs
  FOR EACH ROW EXECUTE FUNCTION nutrition.touch_updated_at();

-- -------------------------------------------------------------
-- Rechte. PostgREST prueft Tabellenrechte VOR RLS — ohne Grant ist
-- jede Policy toter Text (Begruendung woertlich aus 060, Abschnitt 3c).
-- -------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON nutrition.water_logs TO authenticated;
GRANT ALL ON nutrition.water_logs TO service_role;

-- -------------------------------------------------------------
-- Zeilenschutz und Policies je Operation.
-- ACHTUNG: RLS ohne Policy sperrt die Tabelle vollstaendig. Genau
-- dieser Fehler stand in db/schema/nutrition.sql fuer meal_items und
-- ist in ADR-0003 benannt. SPEC_06 Abschnitt 13 wiederholt ihn zur
-- Haelfte: dort steht EINE FOR-ALL-Policy mit USING, ohne WITH CHECK —
-- ein INSERT-Leck, weil USING allein INSERTs nicht prueft (060, 4c).
-- Deshalb hier vier Policies, und der ::text-Cast aus SPEC_06 entfaellt:
-- user_id ist uuid, auth.uid() liefert uuid.
-- -------------------------------------------------------------
ALTER TABLE nutrition.water_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS water_logs_select ON nutrition.water_logs;
DROP POLICY IF EXISTS water_logs_insert ON nutrition.water_logs;
DROP POLICY IF EXISTS water_logs_update ON nutrition.water_logs;
DROP POLICY IF EXISTS water_logs_delete ON nutrition.water_logs;

CREATE POLICY water_logs_select ON nutrition.water_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY water_logs_insert ON nutrition.water_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY water_logs_update ON nutrition.water_logs
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY water_logs_delete ON nutrition.water_logs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

COMMIT;
