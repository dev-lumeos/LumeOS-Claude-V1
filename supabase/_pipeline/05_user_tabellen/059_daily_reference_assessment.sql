-- =============================================================
-- 059 — Tagesbilanz gegen Referenzwerte (C-47)
-- Zweck: nutrition.daily_reference_assessment(user_id, date) verbindet
--        daily_summary, public.profiles und nutrient_reference_values.
--
-- Bewusst als Funktion, nicht als breite Sicht:
--   * public.profiles liegt nicht in nutrition; SECURITY INVOKER laesst
--     RLS auf profiles, meals und meal_items greifen.
--   * Ein Naehrstoff kann mehrere passende Wertarten haben, z. B. PRI
--     und UL. Die Funktion gibt dann mehrere Zeilen aus, statt die
--     Bedeutung in eine Spalte zu quetschen.
--   * daily_summary bleibt unveraendert. Sie summiert; diese Funktion
--     bewertet numerisch, aber ohne Ampel oder Worturteil.
--
-- =============================================================
-- REFERENZWERTE WERDEN LIVE GELESEN — NICHT EINGEFROREN
-- =============================================================
-- `[read]` Das ist eine Entscheidung, keine Nachlaessigkeit, und sie
-- stand bis GO-00 Teil 2 nirgends geschrieben.
--
-- Die NAEHRWERTE einer Mahlzeit sind eingefroren (ADR-0003): was am
-- Dienstag gegessen wurde, bleibt am Freitag dieselbe Menge Eisen, auch
-- wenn der BLS-Wert inzwischen korrigiert wurde. Die Mahlzeit ist ein
-- Ereignis der Vergangenheit.
--
-- Der REFERENZWERT ist das Gegenteil: eine Aussage darueber, was DIESER
-- Mensch braucht. Er haengt an Alter, Geschlecht, Gewicht,
-- Schwangerschaft — alles Dinge, die sich aendern, und deren aktueller
-- Stand die richtige Grundlage ist. Wer 10 kg zunimmt, braucht mehr
-- Protein, auch rueckblickend betrachtet.
--
-- FOLGE, die niemanden ueberraschen soll: Ein Tagebucheintrag von
-- letzter Woche kann heute einen anderen Deckungsgrad zeigen als
-- gestern, ohne dass etwas kaputt ist. Die gegessene Menge steht fest;
-- der Massstab hat sich bewegt.
--
-- Wer das aendern will, muesste `nutrient_reference_values` je Tag
-- einfrieren — dann waere aber ein alter Eintrag gegen ein veraltetes
-- Profil bewertet, und das ist die schlechtere Aussage.
-- =============================================================

BEGIN;

CREATE OR REPLACE FUNCTION nutrition.daily_reference_assessment(
  p_user_id UUID,
  p_entry_date DATE
)
RETURNS TABLE (
  user_id UUID,
  entry_date DATE,
  nutrient_code TEXT,
  nutrient_name_de TEXT,
  nutrient_unit TEXT,
  actual_value NUMERIC,
  missing_count INTEGER,
  value_complete BOOLEAN,
  reference_kind TEXT,
  reference_direction TEXT,
  reference_value_min NUMERIC,
  reference_value_max NUMERIC,
  reference_unit TEXT,
  reference_basis TEXT,
  reference_pct NUMERIC,
  reference_pct_min NUMERIC,
  reference_pct_max NUMERIC,
  reference_status TEXT,
  profile_age_years INTEGER,
  profile_biological_sex TEXT,
  profile_is_pregnant BOOLEAN,
  profile_is_lactating BOOLEAN,
  source TEXT,
  source_locator TEXT,
  notes TEXT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
WITH profile AS (
  SELECT
    p_user_id AS user_id,
    p_entry_date AS entry_date,
    p.birth_date,
    p.biological_sex,
    -- GO-00 Teil 2: fuer Referenzwerte je Kilogramm Koerpergewicht.
    -- Live gelesen, nicht in den Seed gerechnet — beim Gewichtswechsel
    -- aendert sich der Wert damit mit, statt zu veralten.
    p.body_weight_kg,
    CASE
      WHEN p.birth_date IS NULL THEN NULL
      ELSE EXTRACT(YEAR FROM age(p_entry_date, p.birth_date))::INTEGER
    END AS age_years,
    (
      p.pregnancy_started_on IS NOT NULL
      AND p_entry_date >= p.pregnancy_started_on
      AND (p.pregnancy_ended_on IS NULL OR p_entry_date <= p.pregnancy_ended_on)
    ) AS is_pregnant,
    (
      p.lactation_started_on IS NOT NULL
      AND p_entry_date >= p.lactation_started_on
      AND (p.lactation_ended_on IS NULL OR p_entry_date <= p.lactation_ended_on)
    ) AS is_lactating
  FROM public.profiles p
  WHERE p.id = p_user_id
),
profile_one AS (
  SELECT
    p_user_id AS user_id,
    p_entry_date AS entry_date,
    pr.birth_date,
    pr.biological_sex,
    pr.body_weight_kg,
    pr.age_years,
    COALESCE(pr.is_pregnant, false) AS is_pregnant,
    COALESCE(pr.is_lactating, false) AS is_lactating,
    (pr.birth_date IS NOT NULL AND pr.biological_sex IS NOT NULL) AS profile_complete
  FROM (SELECT 1) seed
  LEFT JOIN profile pr ON true
),
day_values AS (
  SELECT v.nutrient_code, v.actual_value, v.missing_count
  FROM nutrition.daily_summary ds
  CROSS JOIN LATERAL (VALUES
    ('ENERCC', ds.enercc, ds.enercc_missing),
    ('PROT625', ds.prot625, ds.prot625_missing),
    ('FAT', ds.fat, ds.fat_missing),
    ('CHO', ds.cho, ds.cho_missing),
    ('FIBT', ds.fibt, ds.fibt_missing),
    ('SUGAR', ds.sugar, ds.sugar_missing),
    ('FASAT', ds.fasat, ds.fasat_missing),
    ('NACL', ds.nacl, ds.nacl_missing),
    ('WATER', ds.water_g, ds.water_g_missing),
    ('VITA', ds.vita, ds.vita_missing),
    ('VITD', ds.vitd, ds.vitd_missing),
    ('VITE', ds.vite, ds.vite_missing),
    ('VITK', ds.vitk, ds.vitk_missing),
    ('THIA', ds.thia, ds.thia_missing),
    ('RIBF', ds.ribf, ds.ribf_missing),
    ('NIA', ds.nia, ds.nia_missing),
    ('VITB6', ds.vitb6, ds.vitb6_missing),
    ('FOL', ds.fol, ds.fol_missing),
    ('VITB12', ds.vitb12, ds.vitb12_missing),
    ('VITC', ds.vitc, ds.vitc_missing),
    ('NA', ds.na, ds.na_missing),
    ('K', ds.k, ds.k_missing),
    ('CA', ds.ca, ds.ca_missing),
    ('MG', ds.mg, ds.mg_missing),
    ('P', ds.p, ds.p_missing),
    ('FE', ds.fe, ds.fe_missing),
    ('ZN', ds.zn, ds.zn_missing),
    ('ID', ds.iodid, ds.iodid_missing),
    ('CHORL', ds.chorl, ds.chorl_missing),
    ('FAPUN3', ds.fapun3, ds.fapun3_missing),
    ('FAPUN6', ds.fapun6, ds.fapun6_missing),
    ('AAE9', ds.aae9, ds.aae9_missing),
    ('LEU', ds.leu, ds.leu_missing),
    ('F18:2CN6', ds.f18_2cn6, ds.f18_2cn6_missing),
    ('F18:3CN3', ds.f18_3cn3, ds.f18_3cn3_missing)
  ) AS v(nutrient_code, actual_value, missing_count)
  WHERE ds.user_id = p_user_id
    AND ds.entry_date = p_entry_date
),
reference_candidates AS (
  SELECT
    dv.nutrient_code,
    r.reference_kind,
    r.value_min,
    r.value_max,
    r.unit,
    r.basis,
    r.source,
    r.source_locator,
    r.notes,
    CASE
      WHEN r.reference_kind IN ('UL', 'ALAP') THEN 'upper_limit'
      WHEN r.reference_kind = 'RI' THEN 'range'
      WHEN r.reference_kind IN ('NO_REFERENCE', 'NO_STANDALONE_REFERENCE') THEN 'not_applicable'
      ELSE 'target'
    END AS reference_direction,
    ROW_NUMBER() OVER (
      PARTITION BY dv.nutrient_code, r.reference_kind
      ORDER BY
        CASE
          WHEN r.is_pregnant = p.is_pregnant AND r.is_lactating = p.is_lactating THEN 2
          WHEN NOT r.is_pregnant AND NOT r.is_lactating THEN 1
          ELSE 0
        END DESC,
        CASE WHEN r.sex = p.biological_sex THEN 1 ELSE 0 END DESC,
        COALESCE(r.age_max - r.age_min, 999) ASC
    ) AS rn
  FROM day_values dv
  CROSS JOIN profile_one p
  JOIN nutrition.nutrient_reference_values r
    ON r.nutrient_code = dv.nutrient_code
   AND p.profile_complete
   AND (r.age_min IS NULL OR p.age_years >= r.age_min)
   AND (r.age_max IS NULL OR p.age_years <= r.age_max)
   AND (r.sex = 'both' OR r.sex = p.biological_sex)
   AND (
     (r.is_pregnant = p.is_pregnant AND r.is_lactating = p.is_lactating)
     OR (NOT r.is_pregnant AND NOT r.is_lactating)
   )
),
-- =============================================================
-- GO-00 Teil 2: die Bezugsgroesse aufloesen
-- =============================================================
-- `[cmd]` 16 der 109 Referenzzeilen stehen nicht je Tag, sondern je
-- Kilogramm Koerpergewicht (10), als Energieanteil (4) oder je
-- Megajoule (2). Vorher hat die Funktion sie behandelt, als staenden
-- sie je Tag — Protein zeigte 1.593 % statt rund 20 %, weil 13,22 g
-- durch 0,83 geteilt wurde statt durch 0,83 x 78,4 kg.
--
-- WARUM HIER UND NICHT IM SEED:
-- `[read]` 0,83 g/kg bleibt 0,83 g/kg — so schreibt es die EFSA, und
-- der Seed bildet die Quelle ab. Ein Wert je Kilogramm laesst sich
-- ausserdem gar nicht vorab ausrechnen: er haengt am Gewicht der
-- Nutzerin, und das aendert sich. Umgerechnet wird beim Lesen.
--
-- WARUM ABSOLUT ANGEZEIGT WIRD:
-- `[read]` Entscheidung Tom, 2026-08-15, nach einer Erhebung, wie
-- etablierte Ernaehrungs-Apps es halten: keine zeigt eine Einheit je
-- Kilogramm. MyFitnessPal nennt 1,2 g/kg als Zielsetzung in den
-- Einstellungen; im Tagebuch stehen 120 g.
--
-- OHNE GEWICHT KEIN PROZENTWERT. Kein Standardgewicht, kein
-- Ruecktritt — dieselbe Regel wie bei fehlendem Alter oder Geschlecht.
-- `[read]` Ein erfundener Nenner waere schlimmer als keine Zahl: er
-- sieht aus wie eine Messung.
aufgeloeste_referenzen AS (
  SELECT
    rc.*,
    p.body_weight_kg,
    CASE
      -- Je Kilogramm Koerpergewicht: mit dem Gewicht multiplizieren.
      -- `[cmd]` Neun der zehn Zeilen stehen in mg/kg, waehrend der
      -- Naehrstoff selbst in g gefuehrt wird (die Aminosaeuren) —
      -- deshalb zusaetzlich durch 1000. Protein steht in g/kg und
      -- braucht nur die Multiplikation.
      WHEN rc.basis = 'per_kg_bw_per_day' AND p.body_weight_kg IS NOT NULL THEN
        rc.value_min * p.body_weight_kg
        / CASE WHEN rc.unit LIKE 'mg/kg%' THEN 1000 ELSE 1 END
      WHEN rc.basis = 'per_day' THEN rc.value_min
      ELSE NULL
    END AS abs_value_min,
    CASE
      WHEN rc.basis = 'per_kg_bw_per_day' AND p.body_weight_kg IS NOT NULL THEN
        rc.value_max * p.body_weight_kg
        / CASE WHEN rc.unit LIKE 'mg/kg%' THEN 1000 ELSE 1 END
      WHEN rc.basis = 'per_day' THEN rc.value_max
      ELSE NULL
    END AS abs_value_max,
    -- Warum ein Wert NICHT als Prozent erscheint. NULL heisst: er darf.
    CASE
      WHEN rc.basis = 'per_kg_bw_per_day' AND p.body_weight_kg IS NULL
        THEN 'missing_weight'
      -- `[read]` E% ist keine Naehrstoffempfehlung, sondern eine
      -- Aussage ueber die Energieverteilung ("Fett soll 20-35 % der
      -- Tagesenergie ausmachen"). Genau das rechnet GO-02 beim
      -- Zielwert; hier ein zweites Mal zu rechnen hiesse zwei
      -- Wahrheiten zu fuehren.
      WHEN rc.basis IN ('energy_percent', 'as_low_as_possible')
        THEN 'energy_share'
      -- `[read]` Je Megajoule ist ein Fachmass fuer Naehrstoffdichte.
      -- Es sagt nichts darueber, ob heute genug gegessen wurde.
      WHEN rc.basis = 'per_mj' THEN 'nutrient_density'
      ELSE NULL
    END AS basis_hindernis
  FROM reference_candidates rc
  CROSS JOIN profile_one p
),
selected_references AS (
  SELECT *
  FROM aufgeloeste_referenzen
  WHERE rn = 1
)
SELECT
  p.user_id,
  p.entry_date,
  dv.nutrient_code,
  nd.name_de AS nutrient_name_de,
  nd.unit AS nutrient_unit,
  dv.actual_value,
  dv.missing_count::INTEGER,
  (dv.missing_count = 0 AND dv.actual_value IS NOT NULL) AS value_complete,
  sr.reference_kind,
  sr.reference_direction,
  -- GO-00 Teil 2: der AUFGELOESTE Wert, in der Einheit des
  -- Naehrstoffs. Sonst staende bei Protein "0,83" als Referenz, und
  -- niemand koennte die 20 % nachrechnen.
  -- Ist die Bezugsgroesse nicht aufloesbar (E%, je MJ, Gewicht fehlt),
  -- steht hier NULL — der Rohwert waere irrefuehrend.
  ROUND(sr.abs_value_min, 3) AS reference_value_min,
  ROUND(sr.abs_value_max, 3) AS reference_value_max,
  -- Ebenso die Einheit: nach der Aufloesung gilt die des Naehrstoffs.
  CASE
    WHEN sr.abs_value_min IS NULL AND sr.abs_value_max IS NULL THEN sr.unit
    ELSE nd.unit
  END AS reference_unit,
  sr.basis AS reference_basis,
  -- GO-00 Teil 2: gerechnet wird gegen den AUFGELOESTEN Wert
  -- (abs_value_*), nicht gegen die rohe Zahl aus der Tabelle.
  -- Steht ein basis_hindernis, gibt es keinen Prozentwert.
  CASE
    WHEN dv.missing_count > 0 OR dv.actual_value IS NULL THEN NULL
    WHEN sr.reference_kind IN ('NO_REFERENCE', 'NO_STANDALONE_REFERENCE') THEN NULL
    WHEN sr.basis_hindernis IS NOT NULL THEN NULL
    WHEN COALESCE(sr.abs_value_min, sr.abs_value_max) IS NULL
      OR COALESCE(sr.abs_value_min, sr.abs_value_max) = 0 THEN NULL
    ELSE ROUND(dv.actual_value / COALESCE(sr.abs_value_min, sr.abs_value_max) * 100, 1)
  END AS reference_pct,
  CASE
    WHEN dv.missing_count > 0 OR dv.actual_value IS NULL THEN NULL
    WHEN sr.basis_hindernis IS NOT NULL THEN NULL
    WHEN sr.abs_value_min IS NULL OR sr.abs_value_min = 0 THEN NULL
    ELSE ROUND(dv.actual_value / sr.abs_value_min * 100, 1)
  END AS reference_pct_min,
  CASE
    WHEN dv.missing_count > 0 OR dv.actual_value IS NULL THEN NULL
    WHEN sr.basis_hindernis IS NOT NULL THEN NULL
    WHEN sr.abs_value_max IS NULL OR sr.abs_value_max = 0 THEN NULL
    ELSE ROUND(dv.actual_value / sr.abs_value_max * 100, 1)
  END AS reference_pct_max,
  CASE
    WHEN NOT p.profile_complete THEN 'missing_profile'
    WHEN sr.reference_kind IS NULL THEN 'no_applicable_reference'
    WHEN dv.missing_count > 0 THEN 'incomplete'
    WHEN dv.actual_value IS NULL THEN 'no_value'
    WHEN sr.reference_kind IN ('NO_REFERENCE', 'NO_STANDALONE_REFERENCE') THEN 'not_applicable'
    -- Drei neue Zustaende, je mit eigenem Grund. `[read]` Sie treten an
    -- die Stelle eines falschen Prozentwerts, nicht an die Stelle von
    -- 'complete' — die Zeile bleibt sichtbar, nur ohne Balken.
    WHEN sr.basis_hindernis = 'missing_weight' THEN 'missing_weight'
    WHEN sr.basis_hindernis = 'energy_share' THEN 'energy_share'
    WHEN sr.basis_hindernis = 'nutrient_density' THEN 'nutrient_density'
    ELSE 'complete'
  END AS reference_status,
  p.age_years AS profile_age_years,
  p.biological_sex AS profile_biological_sex,
  p.is_pregnant AS profile_is_pregnant,
  p.is_lactating AS profile_is_lactating,
  sr.source,
  sr.source_locator,
  sr.notes
FROM day_values dv
CROSS JOIN profile_one p
JOIN nutrition.nutrient_defs nd ON nd.code = dv.nutrient_code
LEFT JOIN selected_references sr ON sr.nutrient_code = dv.nutrient_code
ORDER BY nd.display_tier, nd.sort_index, sr.reference_kind NULLS LAST;
$$;

COMMENT ON FUNCTION nutrition.daily_reference_assessment(UUID, DATE) IS
  'C-47: Numerischer Vergleich von daily_summary mit nutrient_reference_values anhand public.profiles. '
  'Fuehrt reference_kind und reference_direction mit; keine Ampel, kein Score, keine Wortbewertung. '
  'Bei *_missing > 0 bleibt reference_pct NULL, damit eine unvollstaendige Summe nicht als Deckung erscheint.';

GRANT EXECUTE ON FUNCTION nutrition.daily_reference_assessment(UUID, DATE)
  TO authenticated, service_role;

COMMIT;
