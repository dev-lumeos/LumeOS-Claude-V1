#!/usr/bin/env node
// Curated micronutrient overview data and read functions.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE
const A95_LIVE = process.argv.includes('--a95-live')
if (!DB || (DB === 'postgres' && !A95_LIVE)) {
  throw new Error('A-88: 030_mikro-uebersicht.ts braucht PGDATABASE als Wegwerf-Datenbank; postgres nur mit --a95-live.')
}
if (A95_LIVE && DB !== 'postgres') {
  throw new Error('--a95-live ist ausschliesslich fuer die freigegebene laufende Datenbank.')
}
const INPUT = 'supabase/_pipeline/daten/mikro-uebersicht.json'

type OverviewEntry = {
  code: string
  label_de: string
  label_en: string
  order: number
  source: 'daily_reference_assessment' | 'tdee_alpha_linolenic_acid'
  begruendung: string
}

type DataFile = {
  version: number
  eintraege: OverviewEntry[]
}

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function readEntries(): OverviewEntry[] {
  const data = JSON.parse(fs.readFileSync(INPUT, 'utf8')) as DataFile
  if (!Array.isArray(data.eintraege)) fail(`${INPUT}: eintraege fehlt`)
  if (data.eintraege.length !== 8) fail(`${INPUT}: ${data.eintraege.length} Eintraege, erwartet 8`)

  const seenCodes = new Set<string>()
  const seenOrders = new Set<number>()
  for (const [index, entry] of data.eintraege.entries()) {
    if (typeof entry.code !== 'string' || !entry.code.trim()) fail(`${INPUT}: eintraege[${index}].code fehlt`)
    if (typeof entry.label_de !== 'string' || !entry.label_de.trim()) fail(`${INPUT}: eintraege[${index}].label_de fehlt`)
    if (typeof entry.label_en !== 'string' || !entry.label_en.trim()) fail(`${INPUT}: eintraege[${index}].label_en fehlt`)
    if (!Number.isInteger(entry.order) || entry.order < 1) fail(`${INPUT}: eintraege[${index}].order ungueltig`)
    if (!['daily_reference_assessment', 'tdee_alpha_linolenic_acid'].includes(entry.source)) {
      fail(`${INPUT}: eintraege[${index}].source ungueltig`)
    }
    if (typeof entry.begruendung !== 'string' || !entry.begruendung.trim()) fail(`${INPUT}: eintraege[${index}].begruendung fehlt`)
    if (seenCodes.has(entry.code)) fail(`${INPUT}: doppelter code ${entry.code}`)
    if (seenOrders.has(entry.order)) fail(`${INPUT}: doppelte order ${entry.order}`)
    seenCodes.add(entry.code)
    seenOrders.add(entry.order)
  }
  return data.eintraege
}

function runPsql(entries: OverviewEntry[]): void {
  const payload = entries.map(row => csvCell(JSON.stringify(row))).join('\n')
  const sql = `\\set ON_ERROR_STOP on
BEGIN;

CREATE TABLE IF NOT EXISTS nutrition.micronutrient_overview_items (
  nutrient_code TEXT PRIMARY KEY REFERENCES nutrition.nutrient_defs(code) ON DELETE RESTRICT,
  label_de TEXT NOT NULL,
  label_en TEXT NOT NULL,
  display_order INTEGER NOT NULL UNIQUE CHECK (display_order > 0),
  value_source TEXT NOT NULL CHECK (value_source IN ('daily_reference_assessment','tdee_alpha_linolenic_acid')),
  source_note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE nutrition.micronutrient_overview_items IS
  'Kuratierte Auswahl der acht Naehrstoffe fuer das Micronutrient-Snapshot-Netzdiagramm.';

ALTER TABLE nutrition.micronutrient_overview_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS micronutrient_overview_items_select ON nutrition.micronutrient_overview_items;
CREATE POLICY micronutrient_overview_items_select ON nutrition.micronutrient_overview_items
  FOR SELECT TO authenticated USING (true);

REVOKE ALL ON nutrition.micronutrient_overview_items FROM anon, authenticated, service_role;
GRANT SELECT ON nutrition.micronutrient_overview_items TO authenticated;
GRANT ALL ON nutrition.micronutrient_overview_items TO service_role;

CREATE TEMP TABLE tmp_mikro_uebersicht (
  payload text NOT NULL
) ON COMMIT DROP;

COPY tmp_mikro_uebersicht (payload) FROM STDIN WITH (FORMAT csv);
${payload}
\\.

DO $$
DECLARE
  v_input int;
  v_missing int;
BEGIN
  SELECT COUNT(*) INTO v_input FROM tmp_mikro_uebersicht;
  IF v_input <> ${entries.length} THEN
    RAISE EXCEPTION 'mikro-uebersicht: % Zeilen, erwartet ${entries.length}', v_input;
  END IF;

  WITH parsed AS (
    SELECT payload::jsonb->>'code' AS nutrient_code
    FROM tmp_mikro_uebersicht
  )
  SELECT COUNT(*) INTO v_missing
  FROM parsed p
  LEFT JOIN nutrition.nutrient_defs nd ON nd.code = p.nutrient_code
  WHERE nd.code IS NULL;
  IF v_missing <> 0 THEN
    RAISE EXCEPTION 'mikro-uebersicht: % Naehrstoffcodes fehlen in nutrient_defs', v_missing;
  END IF;
END $$;

TRUNCATE nutrition.micronutrient_overview_items;

ALTER TABLE nutrition.micronutrient_overview_items
  DROP CONSTRAINT IF EXISTS micronutrient_overview_items_value_source_check;
ALTER TABLE nutrition.micronutrient_overview_items
  ADD CONSTRAINT micronutrient_overview_items_value_source_check
  CHECK (value_source IN ('daily_reference_assessment','tdee_alpha_linolenic_acid'));

INSERT INTO nutrition.micronutrient_overview_items (
  nutrient_code, label_de, label_en, display_order, value_source, source_note
)
SELECT
  payload::jsonb->>'code',
  payload::jsonb->>'label_de',
  payload::jsonb->>'label_en',
  (payload::jsonb->>'order')::integer,
  payload::jsonb->>'source',
  payload::jsonb->>'begruendung'
FROM tmp_mikro_uebersicht
ORDER BY (payload::jsonb->>'order')::integer;

DROP FUNCTION IF EXISTS nutrition.micronutrient_snapshot(UUID, DATE);
CREATE FUNCTION nutrition.micronutrient_snapshot(
  p_user_id UUID,
  p_entry_date DATE
)
RETURNS TABLE (
  display_order INTEGER,
  nutrient_code TEXT,
  label_de TEXT,
  label_en TEXT,
  nutrient_name_de TEXT,
  unit TEXT,
  actual_value NUMERIC,
  reference_value NUMERIC,
  reference_pct NUMERIC,
  reference_kind TEXT,
  reference_status TEXT,
  value_source TEXT,
  source_note TEXT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
WITH tdee_basis AS (
  SELECT b.tdee
  FROM (SELECT 1) seed
  LEFT JOIN LATERAL goals.tdee_basis_am(p_user_id, p_entry_date) b ON true
),
assessment AS (
  SELECT
    a.*,
    ROW_NUMBER() OVER (
      PARTITION BY a.nutrient_code
      ORDER BY CASE a.reference_kind
        WHEN 'PRI' THEN 1
        WHEN 'AI' THEN 2
        WHEN 'FORMULA' THEN 3
        WHEN 'RI' THEN 4
        ELSE 9
      END
    ) AS rn
  FROM nutrition.daily_reference_assessment(p_user_id, p_entry_date) a
  WHERE a.reference_direction = 'target'
)
SELECT
  i.display_order,
  i.nutrient_code,
  i.label_de,
  i.label_en,
  nd.name_de AS nutrient_name_de,
  nd.unit,
  a.actual_value,
  CASE
    WHEN i.value_source = 'tdee_alpha_linolenic_acid' THEN ROUND(t.tdee * 0.005 / 9, 1)
    ELSE a.reference_value_min
  END AS reference_value,
  CASE
    WHEN i.value_source = 'tdee_alpha_linolenic_acid' THEN
      CASE
        WHEN a.actual_value IS NULL OR a.missing_count > 0 OR t.tdee IS NULL OR t.tdee = 0 THEN NULL
        ELSE ROUND(a.actual_value / ROUND(t.tdee * 0.005 / 9, 1) * 100, 1)
      END
    ELSE a.reference_pct
  END AS reference_pct,
  CASE
    WHEN i.value_source = 'tdee_alpha_linolenic_acid' THEN 'AI'
    ELSE a.reference_kind
  END AS reference_kind,
  CASE
    WHEN i.value_source = 'tdee_alpha_linolenic_acid' THEN
      CASE
        WHEN a.missing_count > 0 THEN 'incomplete'
        WHEN a.actual_value IS NULL THEN 'no_value'
        WHEN t.tdee IS NULL THEN 'missing_profile'
        ELSE 'complete'
      END
    ELSE a.reference_status
  END AS reference_status,
  i.value_source,
  i.source_note
FROM nutrition.micronutrient_overview_items i
JOIN nutrition.nutrient_defs nd ON nd.code = i.nutrient_code
LEFT JOIN assessment a ON a.nutrient_code = i.nutrient_code AND a.rn = 1
CROSS JOIN tdee_basis t
ORDER BY i.display_order;
$function$;

-- C-466/C-513 legen die Supplement-Aufschluesselung spaeter in der Kette
-- an. Der fruehe 059a-Lauf baut deshalb nur die Grundfunktion; der
-- G-567-Nachzug nach C-513 bindet auch diese Fassung an dieselbe Referenz.
DO $g567$
BEGIN
  IF to_regprocedure(
    'nutrition.nutrient_intake_source_breakdown_for_day(uuid,date)'
  ) IS NOT NULL THEN
    EXECUTE $definition$
      CREATE OR REPLACE FUNCTION nutrition.micronutrient_snapshot_with_supplements(
        p_user_id uuid,
        p_entry_date date
      )
      RETURNS TABLE (
        display_order integer,
        nutrient_code text,
        label_de text,
        label_en text,
        nutrient_name_de text,
        unit text,
        food_amount numeric,
        supplement_amount numeric,
        reference_value numeric,
        reference_pct numeric,
        reference_kind text,
        reference_status text,
        supplement_status text,
        source_note text
      )
      LANGUAGE sql
      STABLE
      SECURITY INVOKER
      SET search_path = ''
      AS $function$
        WITH base AS (
          SELECT *
          FROM nutrition.micronutrient_snapshot(p_user_id, p_entry_date)
        ),
        totals AS (
          SELECT *
          FROM nutrition.nutrient_intake_source_breakdown_for_day(
            p_user_id, p_entry_date
          )
        )
        SELECT
          b.display_order,
          b.nutrient_code,
          b.label_de,
          b.label_en,
          b.nutrient_name_de,
          b.unit,
          t.food_amount,
          t.supplement_amount,
          b.reference_value,
          CASE
            WHEN b.reference_status = 'complete'
              AND t.stack_unmapped_taken_log_count = 0
              AND t.meal_supplement_missing_count = 0
            THEN round(
              (t.food_amount + coalesce(t.supplement_amount, 0))
              / nullif(b.reference_value, 0) * 100,
              1
            )
            ELSE NULL
          END AS reference_pct,
          b.reference_kind,
          CASE
            WHEN b.reference_status IS DISTINCT FROM 'complete'
              THEN coalesce(b.reference_status, 'no_food_value')
            WHEN t.stack_unmapped_taken_log_count > 0
              OR t.meal_supplement_missing_count > 0
              THEN 'incomplete_supplements'
            ELSE 'complete'
          END AS reference_status,
          CASE
            WHEN t.stack_taken_log_count = 0
              AND t.meal_supplement_item_count = 0
              THEN 'no_intake'
            WHEN t.stack_unmapped_taken_log_count > 0
              OR t.meal_supplement_missing_count > 0
              THEN 'incomplete'
            WHEN t.supplement_amount IS NULL
              THEN 'no_mapping_for_nutrient'
            ELSE 'complete'
          END AS supplement_status,
          b.source_note
        FROM base b
        JOIN totals t ON t.nutrient_code = b.nutrient_code
        ORDER BY b.display_order
      $function$
    $definition$;
  END IF;
END
$g567$;

DROP FUNCTION IF EXISTS nutrition.micronutrient_below_threshold(UUID, DATE, NUMERIC);
CREATE FUNCTION nutrition.micronutrient_below_threshold(
  p_user_id UUID,
  p_entry_date DATE,
  p_threshold_pct NUMERIC DEFAULT 75
)
RETURNS TABLE (
  threshold_pct NUMERIC,
  total_assessed INTEGER,
  below_count INTEGER,
  items JSONB
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
WITH assessed AS (
  SELECT
    s.nutrient_code,
    s.nutrient_name_de,
    s.unit AS nutrient_unit,
    s.actual_value,
    s.reference_value AS reference_value_min,
    s.reference_pct,
    s.reference_kind
  FROM nutrition.micronutrient_snapshot(p_user_id, p_entry_date) s
  WHERE s.reference_status = 'complete'
    AND s.reference_pct IS NOT NULL
),
selected AS (
  SELECT * FROM assessed
),
below AS (
  SELECT *
  FROM selected
  WHERE reference_pct < p_threshold_pct
)
SELECT
  p_threshold_pct AS threshold_pct,
  (SELECT COUNT(*)::INTEGER FROM selected) AS total_assessed,
  (SELECT COUNT(*)::INTEGER FROM below) AS below_count,
  COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'nutrient_code', nutrient_code,
      'name_de', nutrient_name_de,
      'actual_value', actual_value,
      'reference_value', reference_value_min,
      'unit', nutrient_unit,
      'reference_pct', reference_pct,
      'reference_kind', reference_kind
    ) ORDER BY reference_pct ASC, nutrient_name_de)
    FROM below
  ), '[]'::jsonb) AS items;
$function$;

-- G-595: HIER STAND EIN DROP, UND ER WAR FALSCH.
-- A-95 hat goals.berechne_zielwerte(UUID, DATE) hier geloescht, weil der
-- Auftrag sie fuer einen Ueberrest hielt. Sie ist keiner:
-- 11_goals/563_target_scoped_calculation.sql legt sie bewusst als Mantel
-- neben die dreiparametrige Fassung, und getZielwertVorschlag ruft genau
-- sie, wo der Aufrufer KEIN Ziel kennt (G-568/A2, "kein geratenes Ziel").
-- Ohne sie faellt die Goals-Seite mit PGRST202 aus - am 2026-10-03 belegt.
-- Dieser Schritt laeuft NACH 563; ein DROP hier loescht, was dort
-- absichtlich entsteht.

COMMENT ON FUNCTION nutrition.micronutrient_snapshot(UUID, DATE) IS
  'Acht kuratierte Naehrstoffe fuer das Micronutrient-Snapshot-Netzdiagramm. G-567: ALA folgt zielfrei dem TDEE-Bedarf mit EFSA 0,5 E%; Gesamt-Omega-3, EPA und DHA werden nicht ungestuetzt addiert.';
COMMENT ON FUNCTION nutrition.micronutrient_below_threshold(UUID, DATE, NUMERIC) IS
  'G-567: Sortierliste der vollstaendig bewerteten zielfreien Snapshot-Referenzen unter einer Prozent-Schwelle. Keine Warnung und keine Wortbewertung.';

REVOKE ALL ON FUNCTION nutrition.micronutrient_snapshot(UUID, DATE) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION nutrition.micronutrient_below_threshold(UUID, DATE, NUMERIC) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION nutrition.micronutrient_snapshot(UUID, DATE) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION nutrition.micronutrient_below_threshold(UUID, DATE, NUMERIC) TO authenticated, service_role;

DO $$
DECLARE
  v_count int;
BEGIN
  SELECT COUNT(*) INTO v_count FROM nutrition.micronutrient_overview_items;
  IF v_count <> ${entries.length} THEN
    RAISE EXCEPTION 'micronutrient_overview_items: % Zeilen, erwartet ${entries.length}', v_count;
  END IF;
  RAISE NOTICE 'OK: % Micronutrient-Overview-Eintraege und 3 zielfreie Lesefunktionen', v_count;
END $$;

COMMIT;
`

  const result = spawnSync(
    'docker',
    ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', DB, '-f', '-'],
    { input: sql, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 },
  )
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.status !== 0) process.exit(result.status ?? 1)
}

const entries = readEntries()
console.log(`${INPUT}: ${entries.length} kuratierte Micronutrient-Overview-Eintraege`)
runPsql(entries)
