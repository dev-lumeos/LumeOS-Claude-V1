BEGIN;

-- C-543 keeps the 6,726 curated assignments as the only source of truth.
-- The view expands that truth through the canonical hierarchy in both
-- directions: children inherit ancestor assignments and parents collect
-- descendant assignments.
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
    mapping.faktor,
    mapping.source_id AS evidence_source_id,
    mapping.evidence_class
  FROM training.exercise_muscles AS mapping
  JOIN training.muscle_groups AS source_group
    ON source_group.id = mapping.muscle_group_id
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
    mapping.faktor,
    mapping.evidence_source_id,
    mapping.evidence_class,
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
      'faktor', contribution.faktor,
      'source_id', contribution.evidence_source_id,
      'evidence_class', contribution.evidence_class
    )
    ORDER BY contribution.distance,
             contribution.source_muscle_group_name,
             contribution.role,
             contribution.evidence_source_id
  ) AS contributions
FROM effective_contributions AS contribution
GROUP BY contribution.muscle_group_id, contribution.exercise_id;

REVOKE ALL ON TABLE training.muscle_exercises_effective
  FROM PUBLIC, anon, service_role;
GRANT SELECT ON TABLE training.muscle_exercises_effective
  TO authenticated, service_role;

COMMENT ON VIEW training.muscle_exercises_effective IS
  'C-543: Eine Zeile je kanonischem Zielmuskel und Uebung. Kinder erben Vorfahren-Zuordnungen, Eltern sammeln Nachfahren-Zuordnungen. Direkte Zuordnungen schlagen indirekte; alle Faktoren bleiben unveraendert und tragen ihre Herkunft in contributions.';

COMMENT ON COLUMN training.muscle_exercises_effective.contributions IS
  'Unveraenderte Quellzuordnungen mit Faktor, Evidenz, Hierarchiedistanz und relation_kind; inherited=true kennzeichnet jede nur aus der Hierarchie abgeleitete Aussage.';

COMMIT;
