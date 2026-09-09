-- C-445: Ein Injektionsprotokoll bewahrt die bei der Injektion beobachteten
-- Werte. Die Spalten sind vor dem noch nicht gebauten API-Schreibweg nullable:
-- bestehende bzw. unvollstaendige Logzeilen werden weder erfunden noch blockiert.
BEGIN;

ALTER TABLE medical.injection_logs
  ADD COLUMN volume_ml NUMERIC(4,2),
  ADD COLUMN substance_name TEXT,
  ADD COLUMN route TEXT,
  ADD COLUMN pain_score SMALLINT,
  ADD COLUMN complication TEXT[],
  ADD COLUMN override_reason TEXT;

ALTER TABLE medical.injection_logs
  ADD CONSTRAINT injection_logs_volume_ml_positive_check
    CHECK (volume_ml IS NULL OR volume_ml > 0),
  ADD CONSTRAINT injection_logs_substance_name_not_blank_check
    CHECK (substance_name IS NULL OR btrim(substance_name) <> ''),
  -- C-385 kodiert die subkutane Route als `sc`; das Protokoll folgt diesem
  -- bestehenden Datenvertrag statt eine zweite Route-Schreibweise einzufuehren.
  ADD CONSTRAINT injection_logs_route_check
    CHECK (route IS NULL OR route IN ('im', 'sc')),
  ADD CONSTRAINT injection_logs_pain_score_check
    CHECK (pain_score IS NULL OR pain_score BETWEEN 0 AND 3),
  ADD CONSTRAINT injection_logs_complication_values_check
    CHECK (
      complication IS NULL
      OR complication <@ ARRAY[
        'none', 'bleeding', 'lump', 'swelling', 'redness', 'leakage', 'nerve_sensation'
      ]::TEXT[]
    ),
  ADD CONSTRAINT injection_logs_override_reason_not_blank_check
    CHECK (override_reason IS NULL OR btrim(override_reason) <> '');

COMMENT ON COLUMN medical.injection_logs.override_reason IS
  'C-445: nichtleere Begruendung, wenn eine blockierende Planner-Regel uebergangen wurde; sonst NULL.';
COMMENT ON COLUMN medical.injection_logs.complication IS
  'C-445: mehrere beobachtete Werte nur aus der Planner-Werteliste; keine Diagnose.';

COMMIT;
