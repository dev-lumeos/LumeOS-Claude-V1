#!/usr/bin/env node
// Curated micronutrient overview data and read functions.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const INPUT = 'supabase/_pipeline/daten/mikro-uebersicht.json'

type OverviewEntry = {
  code: string
  label_de: string
  label_en: string
  order: number
  source: 'daily_reference_assessment' | 'goals_alpha_linolenic_acid'
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
    if (!['daily_reference_assessment', 'goals_alpha_linolenic_acid'].includes(entry.source)) {
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
  value_source TEXT NOT NULL CHECK (value_source IN ('daily_reference_assessment','goals_alpha_linolenic_acid')),
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
WITH goals_target AS (
  SELECT
    COALESCE(z.alpha_linolenic_acid_g, b.alpha_linolenic_acid_g) AS alpha_linolenic_acid_g
  FROM (SELECT 1) seed
  LEFT JOIN LATERAL goals.zielwerte_am(p_user_id, p_entry_date) z ON true
  LEFT JOIN LATERAL goals.berechne_zielwerte(p_user_id, p_entry_date) b ON true
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
    WHEN i.value_source = 'goals_alpha_linolenic_acid' THEN g.alpha_linolenic_acid_g
    ELSE a.reference_value_min
  END AS reference_value,
  CASE
    WHEN i.value_source = 'goals_alpha_linolenic_acid' THEN
      CASE
        WHEN a.actual_value IS NULL OR a.missing_count > 0 OR g.alpha_linolenic_acid_g IS NULL OR g.alpha_linolenic_acid_g = 0 THEN NULL
        ELSE ROUND(a.actual_value / g.alpha_linolenic_acid_g * 100, 1)
      END
    ELSE a.reference_pct
  END AS reference_pct,
  CASE
    WHEN i.value_source = 'goals_alpha_linolenic_acid' THEN 'GOAL'
    ELSE a.reference_kind
  END AS reference_kind,
  CASE
    WHEN i.value_source = 'goals_alpha_linolenic_acid' THEN
      CASE
        WHEN a.missing_count > 0 THEN 'incomplete'
        WHEN a.actual_value IS NULL THEN 'no_value'
        WHEN g.alpha_linolenic_acid_g IS NULL THEN 'missing_goal'
        ELSE 'complete'
      END
    ELSE a.reference_status
  END AS reference_status,
  i.value_source,
  i.source_note
FROM nutrition.micronutrient_overview_items i
JOIN nutrition.nutrient_defs nd ON nd.code = i.nutrient_code
LEFT JOIN assessment a ON a.nutrient_code = i.nutrient_code AND a.rn = 1
CROSS JOIN goals_target g
ORDER BY i.display_order;
$function$;

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
    a.nutrient_code,
    a.nutrient_name_de,
    a.nutrient_unit,
    a.actual_value,
    a.reference_value_min,
    a.reference_pct,
    a.reference_kind,
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
    AND a.reference_status = 'complete'
    AND a.reference_pct IS NOT NULL
),
selected AS (
  SELECT *
  FROM assessed
  WHERE rn = 1
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

COMMENT ON FUNCTION nutrition.micronutrient_snapshot(UUID, DATE) IS
  'Acht kuratierte Naehrstoffe fuer das Micronutrient-Snapshot-Netzdiagramm. Omega-3 wird als ALA gegen Goals-Zielwert gerechnet; Gesamt-Omega-3, EPA und DHA werden nicht ungestuetzt addiert.';
COMMENT ON FUNCTION nutrition.micronutrient_below_threshold(UUID, DATE, NUMERIC) IS
  'Sortierliste der vollstaendig bewerteten target-Referenzen unter einer Prozent-Schwelle. Keine Warnung und keine Wortbewertung.';

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
  RAISE NOTICE 'OK: % Micronutrient-Overview-Eintraege und 2 Lesefunktionen', v_count;
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
