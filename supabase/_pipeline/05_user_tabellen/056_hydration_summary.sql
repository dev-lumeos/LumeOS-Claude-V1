-- =============================================================
-- 056 — Gesamt-Hydration je Tag (C-05 / WP-04)
-- Datum: 2026-08-06 · Anker: a95fd14
-- Zweck: nutrition.hydration_summary — getrunkenes Wasser plus Wasser
--        aus Nahrung, je Nutzerin und Tag.
-- Idempotent: CREATE OR REPLACE VIEW.
-- Laeuft NACH 053 (daily_summary) und 055 (water_logs).
--
-- =============================================================
-- WARUM ES DIESE SICHT GIBT
-- =============================================================
-- [read] ADR_WATER_TOTAL_HYDRATION.md (Status: Final): Der WaterTracker
-- zeigt Gesamt-Hydration = explizit geloggtes Wasser + Wasser aus
-- Lebensmitteln, beide Quellen separat ausgewiesen.
-- [cmd] 2026-08-06: Die zweite Quelle liegt bereits vor —
-- nutrition.daily_summary summiert meal_items.water_g (Spalten water_g
-- und water_g_missing). Diese Sicht fuehrt nur zusammen, was da ist.
--
-- Sicht, nicht materialisierte Sicht und nicht Summentabelle — dieselbe
-- Begruendung wie bei 053 (C-04): eine materialisierte Sicht braucht
-- einen Aktualisierungsweg bei jedem Schreibvorgang, den jemand vergisst;
-- eine Summentabelle waere eine zweite Wahrheit. Die Summe ist billig.
--
-- =============================================================
-- EINHEITEN — die Falle dieser Sicht
-- =============================================================
-- water_logs.amount_ml ist MILLILITER.
-- meal_items.water_g ist GRAMM (Naehrstoffcode WATER, [cmd] unit = 'g'
-- in nutrition.nutrient_defs).
-- Fuer Wasser gilt 1 g = 1 ml (Dichte 1 g/cm3 bei Raumtemperatur); die
-- Umrechnung ist deshalb der Faktor 1 und steht hier ausdruecklich als
-- Rechnung, nicht stillschweigend als „passt schon". Wer das aendert,
-- muss wissen, dass er eine physikalische Annahme aendert.
--
-- =============================================================
-- FEHLENDER WERT BLEIBT FEHLEND (verbindlich, wie C-03/C-04)
-- =============================================================
-- `food_ml` ist NULL, wenn fuer den Tag KEINE Position einen Wasserwert
-- trug — nicht 0. „Nicht gemessen" ist nicht „null Milliliter".
-- `food_ml_missing` traegt die Zahl der Positionen ohne Wasserwert; ist
-- sie > 0, ist food_ml eine Untergrenze.
-- `total_ml` addiert deshalb mit COALESCE, ABER `total_complete` sagt,
-- ob die Summe belastbar ist. Ohne dieses Feld saehe eine unvollstaendige
-- Gesamtsumme aus wie eine vollstaendige — genau der Fehler, den C-04
-- vermeidet.
-- =============================================================

BEGIN;

-- security_invoker: die Sicht laeuft mit den Rechten der Abfragenden.
-- [cmd] 2026-08-06 bei 053 belegt: OHNE diese Option sah die zweite
-- Sitzung die Zeilen der ersten — der Zeilenschutz der darunterliegenden
-- Tabellen greift bei einer Sicht NICHT automatisch.
CREATE OR REPLACE VIEW nutrition.hydration_summary
WITH (security_invoker = true) AS
WITH getrunken AS (
  SELECT
    w.user_id,
    w.entry_date,
    SUM(w.amount_ml)              AS logged_ml,
    COUNT(*)                      AS log_count
  FROM nutrition.water_logs w
  GROUP BY w.user_id, w.entry_date
),
aus_nahrung AS (
  SELECT
    d.user_id,
    d.entry_date,
    -- 1 g Wasser = 1 ml (siehe Kopf). Faktor 1, ausdruecklich.
    d.water_g                     AS food_ml,
    d.water_g_missing             AS food_ml_missing,
    d.item_count
  FROM nutrition.daily_summary d
)
SELECT
  COALESCE(g.user_id, n.user_id)       AS user_id,
  COALESCE(g.entry_date, n.entry_date) AS entry_date,

  g.logged_ml,
  COALESCE(g.log_count, 0)             AS log_count,

  n.food_ml,
  COALESCE(n.food_ml_missing, 0)       AS food_ml_missing,

  -- Gesamt: beide Quellen. NULL nur, wenn BEIDE nichts liefern —
  -- dann wurde nichts erfasst, und 0 waere eine Behauptung.
  CASE
    WHEN g.logged_ml IS NULL AND n.food_ml IS NULL THEN NULL
    ELSE COALESCE(g.logged_ml, 0) + COALESCE(n.food_ml, 0)
  END                                   AS total_ml,

  -- Ist die Gesamtsumme belastbar? Nur wenn kein Nahrungswasser fehlt.
  -- Getrunkenes Wasser kann nicht „fehlen" — was nicht eingetragen ist,
  -- wurde nicht getrunken; das ist eine Aussage, keine Luecke.
  (COALESCE(n.food_ml_missing, 0) = 0)  AS total_complete
FROM getrunken g
FULL OUTER JOIN aus_nahrung n
  ON n.user_id = g.user_id AND n.entry_date = g.entry_date;

-- FULL OUTER JOIN, nicht LEFT: ein Tag kann nur Getrunkenes haben (Wasser
-- geloggt, nichts gegessen) ODER nur Nahrungswasser (gegessen, nichts
-- geloggt). Beide muessen erscheinen.

COMMENT ON VIEW nutrition.hydration_summary IS
  'Gesamt-Hydration je Nutzerin und Tag (C-05, 2026-08-06): getrunkenes '
  'Wasser aus water_logs plus Wasser aus Nahrung aus daily_summary.water_g. '
  '1 g Wasser = 1 ml. security_invoker=true, damit die RLS-Policies von '
  'water_logs/meals/meal_items greifen. total_complete sagt, ob die '
  'Gesamtsumme belastbar ist; food_ml_missing > 0 macht sie zur Untergrenze. '
  'Das Tagesziel steht NICHT hier — es kommt laut ADR_WATER_TOTAL_HYDRATION '
  'aus nutrition_targets (Goals, C-06), und diese Tabelle existiert noch nicht.';

GRANT SELECT ON nutrition.hydration_summary TO authenticated, service_role;

COMMIT;
