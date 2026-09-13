BEGIN;

CREATE TEMP TABLE c491_root_resolution (
  exercise_id uuid NOT NULL,
  original_muscle_group_id uuid NOT NULL,
  role text NOT NULL,
  resolution text NOT NULL,
  resolved_muscle_group_ids uuid[] NOT NULL,
  source_id text NOT NULL,
  reason text NOT NULL,
  PRIMARY KEY (exercise_id, original_muscle_group_id, role)
) ON COMMIT DROP;

WITH root_links AS (
  SELECT em.exercise_id, em.muscle_group_id AS original_muscle_group_id,
         em.role, root.name AS root_name, e.name AS exercise_name,
         CASE WHEN em.role = 'primary' THEN ec.primary_activating_muscles
              ELSE ec.secondary_activating_muscles END AS raw
  FROM training.exercise_muscles em
  JOIN training.muscle_groups root ON root.id = em.muscle_group_id AND root.parent_id IS NULL
  JOIN training.exercises e ON e.id = em.exercise_id
  LEFT JOIN training.exercise_catalog_enrichment ec ON ec.exercise_id = e.id
), manual_rules(exercise_name, root_name, role, target_name) AS (
  VALUES
    ('Barbell Bench Press', 'Chest', 'primary', 'Pectoralis Major'),
    ('Barbell Bench Press', 'Shoulders', 'secondary', 'Front Shoulders'),
    ('Barbell bench press incline', 'Chest', 'primary', 'Pectoralis Major'),
    ('Barbell bench press incline', 'Shoulders', 'secondary', 'Front Shoulders')
), rules(root_name, pattern, target_name) AS (
  VALUES
    ('Arms','biceps|brachialis','Biceps'), ('Arms','triceps','Triceps'), ('Arms','forearm|brachioradialis|wrist|grip','Forearms'),
    ('Back','latissimus','latissimus dorsi'), ('Back','rhomboid|trapezius|upper back|teres major|levator scapulae','Upper Back'), ('Back','erector|lower back','Lower Back'),
    ('Chest','pectoralis|\\mpec\\M|chest','Pectoralis Major'),
    ('Core','rectus abdominis|abdominals|\\mabs\\M','Abdominals'), ('Core','oblique','Obliques'), ('Core','transverse','Transverse Abdominis'),
    ('Legs','quadriceps|rectus femoris|vastus','Quadriceps'), ('Legs','hamstring|biceps femoris|semitendinosus|semimembranosus','Hamstrings'), ('Legs','glute','Glutes'), ('Legs','calf|gastrocnemius|soleus','Calves'), ('Legs','hip flexor|iliopsoas','Hip Flexors'), ('Legs','adductor|inner thigh','Adductors'), ('Legs','abductor|outer thigh|tensor fasciae','Hip Abductors'), ('Legs','tibialis|perone|fibular|lower leg|foot','Lower Legs'),
    ('Shoulders','rear deltoid|posterior deltoid','Rear Deltoids'), ('Shoulders','front deltoid|anterior deltoid','Front Shoulders'), ('Shoulders','deltoid|shoulder','Deltoids'), ('Shoulders','rotator cuff|infraspinatus|subscapularis|teres minor','Rotator Cuff'), ('Shoulders','serratus','Serratus Anterior'),
    ('Neck Muscles','scalene','Scalenes'), ('Neck Muscles','sternocleidomastoid','Sternocleidomastoid'), ('Neck Muscles','splenius','splenius capitis'), ('Neck Muscles','posterior neck','Posterior Neck Muscles')
), matched AS (
  SELECT r.exercise_id, r.original_muscle_group_id, r.role, mr.target_name
  FROM root_links r
  JOIN manual_rules mr ON mr.exercise_name = r.exercise_name AND mr.root_name = r.root_name AND mr.role = r.role
  UNION
  SELECT r.exercise_id, r.original_muscle_group_id, r.role, rule.target_name
  FROM root_links r
  JOIN rules rule ON rule.root_name = r.root_name AND coalesce(r.raw, '') ~* rule.pattern
  WHERE NOT EXISTS (
    SELECT 1 FROM manual_rules mr
    WHERE mr.exercise_name = r.exercise_name AND mr.root_name = r.root_name AND mr.role = r.role
  )
), targets AS (
  SELECT m.exercise_id, m.original_muscle_group_id, m.role,
         array_agg(DISTINCT target.id ORDER BY target.id) AS ids
  FROM matched m
  JOIN training.muscle_groups target ON target.name = m.target_name
  GROUP BY m.exercise_id, m.original_muscle_group_id, m.role
)
INSERT INTO c491_root_resolution
SELECT r.exercise_id, r.original_muscle_group_id, r.role,
       CASE WHEN t.ids IS NULL THEN 'unresolved' ELSE 'resolved' END,
       coalesce(t.ids, '{}'::uuid[]),
       CASE WHEN t.ids IS NULL THEN 'exercise_catalog_enrichment_missing_or_conflicting'
            ELSE 'exercise_catalog_enrichment_c83' END,
       CASE WHEN t.ids IS NULL THEN 'Kein passender, rollenbezogener Muskelrohtext; Wurzel bleibt bis zur Einzelpruefung erhalten.'
            ELSE 'Vorhandener rollenbezogener Katalog-Rohtext benennt eine Untergruppe; E-82 ersetzt nur die Wurzel.' END
FROM root_links r
LEFT JOIN targets t USING (exercise_id, original_muscle_group_id, role);

INSERT INTO training.exercise_muscle_resolution_notes
  (exercise_id, original_muscle_group_id, role, resolution, resolved_muscle_group_ids, source_id, reason)
SELECT exercise_id, original_muscle_group_id, role, resolution, resolved_muscle_group_ids, source_id, reason
FROM c491_root_resolution
ON CONFLICT (exercise_id, original_muscle_group_id, role) DO UPDATE
SET resolution = EXCLUDED.resolution,
    resolved_muscle_group_ids = EXCLUDED.resolved_muscle_group_ids,
    source_id = EXCLUDED.source_id,
    reason = EXCLUDED.reason,
    updated_at = now();

INSERT INTO training.exercise_muscles (exercise_id, muscle_group_id, role, faktor, source_id, evidence_class)
SELECT r.exercise_id, target_id, r.role, em.faktor, em.source_id, em.evidence_class
FROM c491_root_resolution r
JOIN training.exercise_muscles em
  ON em.exercise_id = r.exercise_id
 AND em.muscle_group_id = r.original_muscle_group_id
 AND em.role = r.role
CROSS JOIN LATERAL unnest(r.resolved_muscle_group_ids) AS target_id
WHERE r.resolution = 'resolved'
ON CONFLICT (exercise_id, muscle_group_id, role) DO UPDATE
SET faktor = CASE WHEN EXCLUDED.evidence_class = 'A' THEN EXCLUDED.faktor ELSE training.exercise_muscles.faktor END,
    source_id = CASE WHEN EXCLUDED.evidence_class = 'A' THEN EXCLUDED.source_id ELSE training.exercise_muscles.source_id END,
    evidence_class = CASE WHEN EXCLUDED.evidence_class = 'A' THEN EXCLUDED.evidence_class ELSE training.exercise_muscles.evidence_class END;

DELETE FROM training.exercise_muscles em
USING c491_root_resolution r
WHERE r.resolution = 'resolved'
  AND em.exercise_id = r.exercise_id
  AND em.muscle_group_id = r.original_muscle_group_id
  AND em.role = r.role;

-- The six exercised seed movements are reviewed individually. Heads remain
-- below the set-counting level; the row keeps its factor/source on its parent.
WITH seed_map(exercise_name, from_name, to_name) AS (
  VALUES
    ('Band Deadlift', 'Semimembranosus', 'Hamstrings'),
    ('Band Deadlift', 'Semitendinosus', 'Hamstrings'),
    ('band kneeling lat pulldown', 'Mid Back', 'latissimus dorsi'),
    ('band kneeling lat pulldown', 'Teres Major', 'Upper Back'),
    ('Barbell  squat back POV', 'Gluteus Medius', 'Glutes'),
    ('Barbell  squat back POV', 'Semimembranosus', 'Hamstrings'),
    ('Barbell  squat back POV', 'Semitendinosus', 'Hamstrings'),
    ('Barbell bench press incline', 'Clavicular Head', 'Pectoralis Major'),
    ('Barbell bent over row pronated grip', 'Mid Back', 'latissimus dorsi'),
    ('Barbell bent over row pronated grip', 'Rhomboids', 'Upper Back'),
    ('Barbell bent over row pronated grip', 'Teres Major', 'Upper Back')
), source_rows AS (
  SELECT em.exercise_id, em.muscle_group_id AS from_id, target.id AS to_id, em.role,
         em.faktor, em.source_id, em.evidence_class
  FROM seed_map map
  JOIN training.exercises e ON e.name = map.exercise_name
  JOIN training.muscle_groups source ON source.name = map.from_name
  JOIN training.muscle_groups target ON target.name = map.to_name
  JOIN training.exercise_muscles em ON em.exercise_id = e.id AND em.muscle_group_id = source.id
), deduplicated_source_rows AS (
  SELECT DISTINCT ON (exercise_id, to_id, role)
    exercise_id, to_id, role, faktor, source_id, evidence_class
  FROM source_rows
  ORDER BY exercise_id, to_id, role, (evidence_class = 'A') DESC, faktor DESC
)
INSERT INTO training.exercise_muscles (exercise_id, muscle_group_id, role, faktor, source_id, evidence_class)
SELECT exercise_id, to_id, role, faktor, source_id, evidence_class FROM deduplicated_source_rows
ON CONFLICT (exercise_id, muscle_group_id, role) DO UPDATE
SET faktor = CASE WHEN EXCLUDED.evidence_class = 'A' THEN EXCLUDED.faktor ELSE training.exercise_muscles.faktor END,
    source_id = CASE WHEN EXCLUDED.evidence_class = 'A' THEN EXCLUDED.source_id ELSE training.exercise_muscles.source_id END,
    evidence_class = CASE WHEN EXCLUDED.evidence_class = 'A' THEN EXCLUDED.evidence_class ELSE training.exercise_muscles.evidence_class END;

WITH seed_map(exercise_name, from_name, to_name) AS (
  VALUES
    ('Band Deadlift', 'Semimembranosus', 'Hamstrings'), ('Band Deadlift', 'Semitendinosus', 'Hamstrings'),
    ('band kneeling lat pulldown', 'Mid Back', 'latissimus dorsi'), ('band kneeling lat pulldown', 'Teres Major', 'Upper Back'),
    ('Barbell  squat back POV', 'Gluteus Medius', 'Glutes'), ('Barbell  squat back POV', 'Semimembranosus', 'Hamstrings'), ('Barbell  squat back POV', 'Semitendinosus', 'Hamstrings'),
    ('Barbell bench press incline', 'Clavicular Head', 'Pectoralis Major'),
    ('Barbell bent over row pronated grip', 'Mid Back', 'latissimus dorsi'), ('Barbell bent over row pronated grip', 'Rhomboids', 'Upper Back'), ('Barbell bent over row pronated grip', 'Teres Major', 'Upper Back')
)
DELETE FROM training.exercise_muscles em
USING seed_map map, training.exercises e, training.muscle_groups source
WHERE e.name = map.exercise_name
  AND source.name = map.from_name
  AND em.exercise_id = e.id
  AND em.muscle_group_id = source.id;

INSERT INTO training.muscle_group_level_decisions (muscle_group_id, decision, source_id, reason)
SELECT mg.id,
       CASE WHEN mg.name = 'Lower Back' THEN 'map_to_child' ELSE 'keep_group' END,
       'e82_set_counting_scope',
       CASE WHEN mg.name = 'Lower Back' THEN 'Erector spinae ist der einzige modellierte Muskel unter Lower Back; die Sammelbezeichnung liefert keine zusaetzliche Satzebene.'
            ELSE 'E-82: Kinder dieser Sammelgruppe sind ohne bewegungsspezifische Messung nicht getrennt zaehlbar; die Gruppe bleibt die tiefste Satzebene.' END
FROM training.muscle_groups mg
WHERE mg.parent_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM training.muscle_groups child WHERE child.parent_id = mg.id)
ON CONFLICT (muscle_group_id) DO UPDATE
SET decision = EXCLUDED.decision, source_id = EXCLUDED.source_id, reason = EXCLUDED.reason, updated_at = now();

INSERT INTO training.exercise_muscles (exercise_id, muscle_group_id, role, faktor, source_id, evidence_class)
SELECT em.exercise_id, erector.id, em.role, em.faktor, em.source_id, em.evidence_class
FROM training.exercise_muscles em
JOIN training.muscle_groups lower_back ON lower_back.id = em.muscle_group_id AND lower_back.name = 'Lower Back'
JOIN training.muscle_groups erector ON erector.name = 'erector spinae'
ON CONFLICT (exercise_id, muscle_group_id, role) DO NOTHING;

DELETE FROM training.exercise_muscles em
USING training.muscle_groups lower_back
WHERE lower_back.id = em.muscle_group_id
  AND lower_back.name = 'Lower Back';

DO $$
DECLARE
  v_notes integer;
  v_resolved integer;
  v_unresolved integer;
  v_roots integer;
  v_unnoted integer;
  v_missing integer;
  v_decisions integer;
BEGIN
  SELECT count(*), count(*) FILTER (WHERE resolution = 'resolved'), count(*) FILTER (WHERE resolution = 'unresolved')
  INTO v_notes, v_resolved, v_unresolved
  FROM training.exercise_muscle_resolution_notes;
  SELECT count(*) INTO v_roots
  FROM training.exercise_muscles em JOIN training.muscle_groups mg ON mg.id = em.muscle_group_id
  WHERE mg.parent_id IS NULL;
  SELECT count(*) INTO v_unnoted
  FROM training.exercise_muscles em
  JOIN training.muscle_groups mg ON mg.id = em.muscle_group_id AND mg.parent_id IS NULL
  LEFT JOIN training.exercise_muscle_resolution_notes n
    ON n.exercise_id = em.exercise_id AND n.original_muscle_group_id = em.muscle_group_id AND n.role = em.role
  WHERE n.resolution <> 'unresolved' OR n.exercise_id IS NULL;
  SELECT count(*) INTO v_missing FROM training.exercise_muscles
  WHERE faktor IS NULL OR source_id IS NULL OR evidence_class IS NULL;
  SELECT count(*) INTO v_decisions FROM training.muscle_group_level_decisions;

  IF v_notes <> 1105 OR v_resolved <> 1101 OR v_unresolved <> 4
     OR v_roots <> 4 OR v_unnoted <> 0 OR v_missing <> 0 OR v_decisions <> 22 THEN
    RAISE EXCEPTION 'C-491: notes %/%/%, roots %, unnoted %, missing %, decisions %',
      v_notes, v_resolved, v_unresolved, v_roots, v_unnoted, v_missing, v_decisions;
  END IF;
END $$;

COMMIT;
