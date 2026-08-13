-- =============================================================
-- v031 — Nachtrag der Einzelfettsaeuren pruefen
-- Datum: 2026-08-14 · Laeuft NACH 031.
-- =============================================================
-- Jede Zeile: Bezeichnung | Istwert | Soll | bestanden
-- =============================================================
\pset format aligned

SELECT 'codes_mit_werten' AS pruefung,
       count(DISTINCT nutrient_code)::text AS ist, '138' AS soll,
       count(DISTINCT nutrient_code) = 138 AS ok
FROM nutrition.food_nutrients

UNION ALL SELECT 'codes_ohne_werte',
       count(*)::text, '0', count(*) = 0
FROM nutrition.nutrient_defs d
WHERE NOT EXISTS (SELECT 1 FROM nutrition.food_nutrients f WHERE f.nutrient_code = d.code)

UNION ALL SELECT 'nachgetragene_werte',
       count(*)::text, '171409', count(*) = 171409
FROM nutrition.food_nutrients WHERE data_source = 'bls_4_0_xlsx_nachtrag'

UNION ALL SELECT 'bestand_unangetastet',
       count(*)::text, '698092', count(*) = 698092
FROM nutrition.food_nutrients WHERE data_source = 'bls_4_0_local_import'

UNION ALL SELECT 'summe_gesamt',
       count(*)::text, '869501', count(*) = 869501
FROM nutrition.food_nutrients

-- Nur Codes mit Doppelpunkt duerfen dazugekommen sein.
UNION ALL SELECT 'nachtrag_nur_doppelpunkt',
       count(*)::text, '0', count(*) = 0
FROM nutrition.food_nutrients
WHERE data_source = 'bls_4_0_xlsx_nachtrag' AND position(':' IN nutrient_code) = 0

-- Keine Waisen: jeder Wert haengt an einem Lebensmittel und einer Definition.
UNION ALL SELECT 'waisen',
       count(*)::text, '0', count(*) = 0
FROM nutrition.food_nutrients n
LEFT JOIN nutrition.foods f ON f.id = n.food_id
LEFT JOIN nutrition.nutrient_defs d ON d.code = n.nutrient_code
WHERE f.id IS NULL OR d.code IS NULL

-- Kein Nachtragswert ist negativ oder unsinnig gross.
UNION ALL SELECT 'nachtrag_wertebereich',
       count(*)::text, '0', count(*) = 0
FROM nutrition.food_nutrients
WHERE data_source = 'bls_4_0_xlsx_nachtrag' AND (value < 0 OR value > 100)
;

\echo
\echo === Nachgetragene Codes mit Wertzahl ===
SELECT n.nutrient_code, d.name_de, count(*) AS werte
FROM nutrition.food_nutrients n
JOIN nutrition.nutrient_defs d ON d.code = n.nutrient_code
WHERE n.data_source = 'bls_4_0_xlsx_nachtrag'
GROUP BY 1, 2 ORDER BY 3 DESC;

\echo
\echo === Stichprobe: Hafer C131000, Fettsaeuren gegen die Quelle ===
\echo === Sollwerte aus der Arbeitsmappe: F14:0 0.04, F16:0 1.28, F18:0 0.11
SELECT n.nutrient_code, n.value
FROM nutrition.food_nutrients n
JOIN nutrition.foods f ON f.id = n.food_id
WHERE f.bls_code = 'C131000' AND n.nutrient_code IN ('F14:0','F16:0','F18:0')
ORDER BY 1;

\echo
\echo === SUMMENPROBE: FASAT gegen die Summe seiner dreizehn Einzelwerte ===
\echo === [read] BLS-Dokumentation 5.5. Eine Abweichung ist ein BEFUND
\echo === ueber die Quelle, kein Importfehler — FASAT gilt als
\echo === "immer berechnet" und kann aus anderen Quellen stammen.
WITH einzeln AS (
  SELECT n.food_id, round(sum(n.value), 3) AS summe
  FROM nutrition.food_nutrients n
  WHERE n.nutrient_code IN ('F4:0','F6:0','F8:0','F10:0','F12:0','F14:0','F15:0',
                            'F16:0','F17:0','F18:0','F20:0','F22:0','F24:0')
  GROUP BY 1
),
gesamt AS (
  SELECT food_id, round(value, 3) AS fasat
  FROM nutrition.food_nutrients WHERE nutrient_code = 'FASAT'
)
SELECT count(*) AS verglichen,
       count(*) FILTER (WHERE abs(e.summe - g.fasat) <= 0.05) AS stimmt,
       count(*) FILTER (WHERE abs(e.summe - g.fasat) > 0.05) AS weicht_ab,
       round(max(abs(e.summe - g.fasat)), 3) AS groesste_abweichung
FROM einzeln e JOIN gesamt g ON g.food_id = e.food_id;
