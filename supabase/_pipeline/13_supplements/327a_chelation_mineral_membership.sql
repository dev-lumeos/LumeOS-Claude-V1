-- C-327: Die acht Mitgliedschaften werden aus der expliziten, weiterhin
-- importierten Kimi-Regel abgeleitet. Die neuere Regel verwendet dieselbe
-- fachliche Gruppe, nennt ihre Mitglieder aber nicht noch einmal.
BEGIN;

DELETE FROM supplements.substance_group_memberships
WHERE source = 'kimi:warning_rules/wr_chelation_timing';

WITH source_rule AS (
  SELECT substance_ids
  FROM supplements.rule_catalog
  WHERE rule_id = 'wr_chelation_timing'
), expected_members AS (
  SELECT unnest(substance_ids) AS substance_slug
  FROM source_rule
)
INSERT INTO supplements.substance_group_memberships(
  substance_group_id,
  supplement_id,
  source
)
SELECT
  'grp_chelating_minerals',
  s.id,
  'kimi:warning_rules/wr_chelation_timing'
FROM expected_members expected
JOIN supplements.supplements s ON s.slug = expected.substance_slug;

DO $$
DECLARE
  v_rule_members INTEGER;
  v_memberships INTEGER;
BEGIN
  SELECT cardinality(substance_ids)
    INTO v_rule_members
  FROM supplements.rule_catalog
  WHERE rule_id = 'wr_chelation_timing';

  SELECT count(*)
    INTO v_memberships
  FROM supplements.substance_group_memberships
  WHERE substance_group_id = 'grp_chelating_minerals'
    AND source = 'kimi:warning_rules/wr_chelation_timing';

  IF v_rule_members IS DISTINCT FROM 8 THEN
    RAISE EXCEPTION 'C-327: wr_chelation_timing has % members instead of 8', v_rule_members;
  END IF;

  IF v_memberships IS DISTINCT FROM v_rule_members THEN
    RAISE EXCEPTION 'C-327: chelating-mineral memberships % instead of %', v_memberships, v_rule_members;
  END IF;
END;
$$;

COMMIT;
