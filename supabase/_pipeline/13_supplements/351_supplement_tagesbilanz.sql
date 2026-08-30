-- C-163/C-351/E-35: Supplemente bilanzieren ausschliesslich ihre eigenen
-- Einnahmelogs. Nicht zuordenbare Einnahmen bleiben als unbekannt gezaehlt.

CREATE OR REPLACE FUNCTION supplements.supplement_nutrient_intake_for_day(
  p_user_id UUID,
  p_entry_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  user_id UUID,
  entry_date DATE,
  nutrient_code TEXT,
  nutrient_unit TEXT,
  total_amount NUMERIC,
  taken_log_count INTEGER,
  skipped_log_count INTEGER,
  mapped_taken_log_count INTEGER,
  unmapped_taken_log_count INTEGER
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH logs AS (
    SELECT
      il.user_id,
      il.intake_date,
      il.status,
      COALESCE(il.actual_dose, il.dose_snapshot) AS dose_amount,
      COALESCE(il.actual_dose_unit, il.dose_unit_snapshot) AS dose_unit,
      si.supplement_id
    FROM supplements.intake_logs il
    JOIN supplements.stack_items si ON si.id = il.stack_item_id
    WHERE il.user_id = p_user_id
      AND il.intake_date = p_entry_date
  ),
  taken AS (
    SELECT *
    FROM logs
    WHERE status = 'taken'
  ),
  mapped AS (
    SELECT
      t.user_id,
      t.intake_date,
      n.nutrient_code,
      n.unit AS nutrient_unit,
      CASE
        WHEN t.dose_unit = n.unit AND t.dose_amount IS NOT NULL THEN t.dose_amount
        ELSE n.amount_per_serving
      END AS amount
    FROM taken t
    JOIN supplements.supplement_nutrients n ON n.supplement_id = t.supplement_id
    WHERE n.status = 'bekannt'
      AND n.amount_per_serving IS NOT NULL
  ),
  counts AS (
    SELECT
      count(*) FILTER (WHERE status = 'taken')::integer AS taken_count,
      count(*) FILTER (WHERE status = 'skipped')::integer AS skipped_count,
      count(*) FILTER (WHERE status = 'taken' AND EXISTS (
        SELECT 1
        FROM supplements.supplement_nutrients n
        WHERE n.supplement_id = logs.supplement_id
          AND n.status = 'bekannt'
          AND n.amount_per_serving IS NOT NULL
      ))::integer AS mapped_taken_count,
      count(*) FILTER (WHERE status = 'taken' AND NOT EXISTS (
        SELECT 1
        FROM supplements.supplement_nutrients n
        WHERE n.supplement_id = logs.supplement_id
          AND n.status = 'bekannt'
          AND n.amount_per_serving IS NOT NULL
      ))::integer AS unmapped_taken_count
    FROM logs
  ),
  totals AS (
    SELECT
      nutrient_code,
      nutrient_unit,
      sum(amount) AS total_amount
    FROM mapped
    GROUP BY nutrient_code, nutrient_unit
  )
  SELECT
    p_user_id,
    p_entry_date,
    t.nutrient_code,
    t.nutrient_unit,
    t.total_amount,
    c.taken_count,
    c.skipped_count,
    c.mapped_taken_count,
    c.unmapped_taken_count
  FROM totals t
  CROSS JOIN counts c

  UNION ALL

  -- Ohne belegten Betrag darf ein Tag nicht wie ein Tag ohne Einnahme wirken.
  SELECT
    p_user_id,
    p_entry_date,
    NULL::text,
    NULL::text,
    NULL::numeric,
    c.taken_count,
    c.skipped_count,
    c.mapped_taken_count,
    c.unmapped_taken_count
  FROM counts c
  WHERE NOT EXISTS (SELECT 1 FROM totals)

  ORDER BY nutrient_code NULLS LAST;
$$;

COMMENT ON FUNCTION supplements.supplement_nutrient_intake_for_day(UUID, DATE) IS
  'C-163/C-351/E-35: Tagesbilanz aus supplements.intake_logs und supplement_nutrients. NULL nutrient_code/total_amount bedeutet: Einnahmen vorhanden, aber keine belegte Nährstoffmenge; niemals Null.';
