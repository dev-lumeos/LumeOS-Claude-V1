BEGIN;

CREATE TABLE training.muscle_role_volume_rules (
  role text PRIMARY KEY,
  weekly_volume_factor numeric(4,2) NOT NULL,
  source_id text NOT NULL,
  source_locator text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT muscle_role_volume_rules_role_check
    CHECK (role IN ('primary', 'secondary')),
  CONSTRAINT muscle_role_volume_rules_factor_check
    CHECK (weekly_volume_factor > 0 AND weekly_volume_factor <= 1),
  CONSTRAINT muscle_role_volume_rules_source_check
    CHECK (btrim(source_id) <> '' AND btrim(source_locator) <> '')
);

ALTER TABLE training.muscle_role_volume_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY muscle_role_volume_rules_select
  ON training.muscle_role_volume_rules
  FOR SELECT
  TO authenticated
  USING (true);

GRANT USAGE ON SCHEMA training TO authenticated, service_role;
REVOKE ALL ON TABLE training.muscle_role_volume_rules
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE training.muscle_role_volume_rules
  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE training.muscle_role_volume_rules
  TO service_role;

ALTER TABLE training.exercise_muscles
  RENAME COLUMN faktor TO activation_factor;
ALTER TABLE training.exercise_muscles
  RENAME COLUMN source_id TO activation_source_id;
ALTER TABLE training.exercise_muscles
  RENAME COLUMN evidence_class TO activation_evidence_class;

ALTER TABLE training.exercise_muscles
  DROP CONSTRAINT IF EXISTS exercise_muscles_faktor_positive,
  DROP CONSTRAINT IF EXISTS exercise_muscles_evidence_class_check;

ALTER TABLE training.exercise_muscles
  ADD CONSTRAINT exercise_muscles_activation_factor_positive
    CHECK (activation_factor IS NULL OR activation_factor > 0),
  ADD CONSTRAINT exercise_muscles_activation_evidence_class_check
    CHECK (
      activation_evidence_class IS NULL
      OR activation_evidence_class IN ('A', 'B')
    ) NOT VALID,
  ADD CONSTRAINT exercise_muscles_activation_measurement_complete
    CHECK (
      num_nonnulls(
        activation_factor,
        activation_source_id,
        activation_evidence_class
      ) IN (0, 3)
    ) NOT VALID;

COMMENT ON TABLE training.muscle_role_volume_rules IS
  'C-551: Rollenbasierte Rechenkonvention fuer woechentliches Satzvolumen. Sie ist keine Messung der Muskelaktivierung einer Uebung.';
COMMENT ON COLUMN training.muscle_role_volume_rules.weekly_volume_factor IS
  'C-551: primary 1.0 und secondary 0.5 nach der Pelland-Konvention fuer direkte und indirekte woechentliche Saetze.';
COMMENT ON COLUMN training.exercise_muscles.activation_factor IS
  'C-551: Gemessene Aktivierung dieser konkreten Uebung-Muskel-Zuordnung; NULL bedeutet nicht gemessen.';
COMMENT ON COLUMN training.exercise_muscles.activation_source_id IS
  'C-551: Stabile Kennung der konkreten Aktivierungsmessung; nie die Rollenregel.';
COMMENT ON COLUMN training.exercise_muscles.activation_evidence_class IS
  'C-551: Evidenzklasse der konkreten Aktivierungsmessung; NULL bedeutet nicht gemessen.';

CREATE OR REPLACE VIEW training.muscle_exercises_effective
WITH (security_invoker = true) AS
WITH RECURSIVE canonical_groups AS (
  SELECT mg.id, mg.name, mg.parent_id
  FROM training.muscle_groups AS mg
  WHERE mg.canonical_muscle_group_id IS NULL
),
descendant_relations AS (
  SELECT group_row.id AS target_muscle_group_id,
         group_row.id AS source_muscle_group_id,
         0 AS distance
  FROM canonical_groups AS group_row

  UNION ALL

  SELECT relation.target_muscle_group_id,
         child.id,
         relation.distance + 1
  FROM descendant_relations AS relation
  JOIN canonical_groups AS child
    ON child.parent_id = relation.source_muscle_group_id
),
ancestor_relations AS (
  SELECT group_row.id AS target_muscle_group_id,
         group_row.id AS source_muscle_group_id,
         0 AS distance
  FROM canonical_groups AS group_row

  UNION ALL

  SELECT relation.target_muscle_group_id,
         parent.id,
         relation.distance + 1
  FROM ancestor_relations AS relation
  JOIN canonical_groups AS current_group
    ON current_group.id = relation.source_muscle_group_id
  JOIN canonical_groups AS parent
    ON parent.id = current_group.parent_id
),
hierarchy_relations AS (
  SELECT
    relation.target_muscle_group_id,
    relation.source_muscle_group_id,
    min(relation.distance) AS distance,
    CASE
      WHEN relation.target_muscle_group_id = relation.source_muscle_group_id
        THEN 'direct'
      ELSE 'collected_descendant'
    END AS relation_kind
  FROM descendant_relations AS relation
  GROUP BY relation.target_muscle_group_id, relation.source_muscle_group_id

  UNION ALL

  SELECT
    relation.target_muscle_group_id,
    relation.source_muscle_group_id,
    min(relation.distance) AS distance,
    'inherited_ancestor' AS relation_kind
  FROM ancestor_relations AS relation
  WHERE relation.target_muscle_group_id <> relation.source_muscle_group_id
  GROUP BY relation.target_muscle_group_id, relation.source_muscle_group_id
),
canonical_mappings AS (
  SELECT DISTINCT
    mapping.exercise_id,
    coalesce(source_group.canonical_muscle_group_id, source_group.id) AS source_muscle_group_id,
    mapping.role,
    role_rule.weekly_volume_factor,
    role_rule.source_id AS weekly_volume_source_id,
    mapping.activation_factor,
    mapping.activation_source_id,
    mapping.activation_evidence_class
  FROM training.exercise_muscles AS mapping
  JOIN training.muscle_groups AS source_group
    ON source_group.id = mapping.muscle_group_id
  LEFT JOIN training.muscle_role_volume_rules AS role_rule
    ON role_rule.role = mapping.role
),
candidates AS (
  SELECT
    relation.target_muscle_group_id AS muscle_group_id,
    mapping.exercise_id,
    relation.source_muscle_group_id,
    source_group.name AS source_muscle_group_name,
    relation.relation_kind,
    relation.distance,
    mapping.role,
    mapping.weekly_volume_factor,
    mapping.weekly_volume_source_id,
    mapping.activation_factor,
    mapping.activation_source_id,
    mapping.activation_evidence_class,
    bool_or(relation.relation_kind = 'direct') OVER (
      PARTITION BY relation.target_muscle_group_id, mapping.exercise_id
    ) AS has_direct_mapping
  FROM hierarchy_relations AS relation
  JOIN canonical_mappings AS mapping
    ON mapping.source_muscle_group_id = relation.source_muscle_group_id
  JOIN canonical_groups AS source_group
    ON source_group.id = relation.source_muscle_group_id
),
effective_contributions AS (
  SELECT candidate.*
  FROM candidates AS candidate
  WHERE NOT candidate.has_direct_mapping
     OR candidate.relation_kind = 'direct'
)
SELECT
  contribution.muscle_group_id,
  contribution.exercise_id,
  bool_or(contribution.relation_kind = 'direct') AS is_direct,
  bool_or(contribution.relation_kind = 'inherited_ancestor') AS is_inherited,
  bool_or(contribution.relation_kind = 'collected_descendant') AS is_collected,
  min(contribution.distance) AS nearest_distance,
  count(*)::integer AS contribution_count,
  jsonb_agg(
    jsonb_build_object(
      'source_muscle_group_id', contribution.source_muscle_group_id,
      'source_muscle_group_name', contribution.source_muscle_group_name,
      'relation_kind', contribution.relation_kind,
      'distance', contribution.distance,
      'inherited', contribution.relation_kind <> 'direct',
      'role', contribution.role,
      'weekly_volume_factor', contribution.weekly_volume_factor,
      'weekly_volume_source_id', contribution.weekly_volume_source_id,
      'activation_factor', contribution.activation_factor,
      'activation_source_id', contribution.activation_source_id,
      'activation_evidence_class', contribution.activation_evidence_class
    )
    ORDER BY contribution.distance,
             contribution.source_muscle_group_name,
             contribution.role,
             contribution.activation_source_id
  ) AS contributions
FROM effective_contributions AS contribution
GROUP BY contribution.muscle_group_id, contribution.exercise_id;

REVOKE ALL ON TABLE training.muscle_exercises_effective
  FROM PUBLIC, anon, service_role;
GRANT SELECT ON TABLE training.muscle_exercises_effective
  TO authenticated, service_role;

COMMENT ON VIEW training.muscle_exercises_effective IS
  'C-543/C-551: Eine Zeile je kanonischem Zielmuskel und Uebung. Hierarchische Herkunft, Rollenregel und konkrete Aktivierungsmessung bleiben getrennt.';
COMMENT ON COLUMN training.muscle_exercises_effective.contributions IS
  'C-551: Quellzuordnung mit unveraenderter Hierarchie, woechentlicher Rollenregel und optionaler konkreter Aktivierungsmessung.';

COMMIT;
