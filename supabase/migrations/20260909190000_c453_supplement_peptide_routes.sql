-- C-453: Der Injection Planner liest genau einen kanonischen Weg je Substanz.
-- Die Rohquelle kann Mehrwege nennen (z.B. BPC-157 SubQ/Oral, Selank Nasal/SubQ).
-- Eine zweite Route-Spalte wird bewusst nicht vorgebaut: Der offene Mehrwegefall
-- braucht einen eigenen Modellentscheid. Fuer die Planner-Familie ist bei
-- Peptiden der durch SPEC_08 vorgegebene Primärweg injection_subq.
BEGIN;

-- Erst Daten bereinigen, dann den CHECK setzen. Der Import serialisierte
-- canonical_routes bislang mit Komma in eine skalare Route-Spalte.
-- Elf Peptide hatten noch gar keine Pharmacology-Huelle. Nur fuer sie ist
-- die fehlende Zeile durch die Peptidregel belegt; alle anderen Luecken
-- bleiben unangetastet und damit ehrlich unbekannt.
INSERT INTO supplements.supplement_pharmacology (
  supplement_id, status, route, source
)
SELECT
  s.id, 'bekannt', 'injection_subq', 'c453_peptide_group_rule'
FROM supplements.supplements AS s
JOIN supplements.supplement_groups AS g ON g.id = s.group_id
LEFT JOIN supplements.supplement_pharmacology AS p ON p.supplement_id = s.id
WHERE g.code = 'peptide'
  AND p.id IS NULL;

UPDATE supplements.supplement_pharmacology AS p
SET route = CASE
  WHEN g.code = 'peptide' THEN 'injection_subq'
  WHEN p.route = 'intramuscular' THEN 'injection_im'
  ELSE p.route
END,
updated_at = now()
FROM supplements.supplements AS s
JOIN supplements.supplement_groups AS g ON g.id = s.group_id
WHERE p.supplement_id = s.id
  AND (g.code = 'peptide' OR p.route = 'intramuscular');

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM supplements.supplement_pharmacology
    WHERE route IS NOT NULL
      AND route NOT IN ('oral', 'injection_im', 'injection_subq', 'topical', 'nasal', 'sublingual')
  ) THEN
    RAISE EXCEPTION 'C-453: nicht erlaubter Route-Wert nach Bereinigung';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM supplements.supplements AS s
    JOIN supplements.supplement_groups AS g ON g.id = s.group_id
    LEFT JOIN supplements.supplement_pharmacology AS p ON p.supplement_id = s.id
    WHERE g.code = 'peptide'
      AND p.route IS DISTINCT FROM 'injection_subq'
  ) THEN
    RAISE EXCEPTION 'C-453: Peptid ohne kanonischen injection_subq-Weg';
  END IF;
END;
$$;

ALTER TABLE supplements.supplement_pharmacology
  DROP CONSTRAINT IF EXISTS supplement_pharmacology_route_check;

ALTER TABLE supplements.supplement_pharmacology
  ADD CONSTRAINT supplement_pharmacology_route_check
  CHECK (
    route IS NULL
    OR route IN ('oral', 'injection_im', 'injection_subq', 'topical', 'nasal', 'sublingual')
  );

COMMENT ON COLUMN supplements.supplement_pharmacology.route IS
  'C-453: ein kanonischer Planner-Weg nach SPEC_06; NULL bleibt ehrlicher unbekannter Weg. Mehrwegequellen werden nicht als Kommawert gespeichert und brauchen einen eigenen Modellentscheid.';

COMMIT;
