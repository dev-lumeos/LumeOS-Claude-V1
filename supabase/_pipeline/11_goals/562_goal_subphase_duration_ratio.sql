-- G-562/E-85: Die historischen Fenster 0-4 / 4-12 / 12-18 Wochen
-- (Dokument A 3.1 und C, siehe E-85) liefern nur das Verhaeltnis 4:8:6.
-- Absolute Wochen werden erst im editierbaren Nutzerprogramm berechnet.
BEGIN;

UPDATE goals.goal_strategies gs
SET sub_phases = (
  SELECT jsonb_agg(
    (part - 'duration_ratio_pct') || jsonb_build_object(
      'dauer_anteil',
      CASE part ->> 'name'
        WHEN 'early' THEN 4
        WHEN 'mid' THEN 8
        WHEN 'late' THEN 6
      END
    ) ORDER BY ordinality
  )
  FROM jsonb_array_elements(gs.sub_phases)
    WITH ORDINALITY AS p(part, ordinality)
)
WHERE gs.code = 'contest_prep'
  AND jsonb_array_length(gs.sub_phases) = 3
  AND (SELECT array_agg(part ->> 'name' ORDER BY ordinality)
       FROM jsonb_array_elements(gs.sub_phases)
         WITH ORDINALITY AS p(part, ordinality)) = ARRAY['early', 'mid', 'late'];

DO $g562$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM goals.goal_strategies
    WHERE code = 'contest_prep'
      AND sub_phases @> '[{"name":"early","dauer_anteil":4},{"name":"mid","dauer_anteil":8},{"name":"late","dauer_anteil":6}]'::jsonb
  ) OR EXISTS (
    SELECT 1
    FROM goals.goal_strategies gs
    CROSS JOIN LATERAL jsonb_array_elements(gs.sub_phases) AS p(part)
    WHERE part ? 'weeks' OR part ? 'duration_ratio_pct'
  ) THEN
    RAISE EXCEPTION 'G-562: Teilphasen brauchen 4:8:6 ohne feste Wochen oder Prozentnäherung';
  END IF;
END
$g562$;

COMMIT;
