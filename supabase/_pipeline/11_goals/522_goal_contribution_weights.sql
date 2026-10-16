-- G-522: die vier Gewichtungsreihen aus Goals/SCORING.md, Abschnitte 2-3.
BEGIN;

CREATE TABLE goals.contribution_weights (
  goal_kind text NOT NULL CHECK (goal_kind IN (
    'body_composition_loss','body_composition_gain',
    'performance_strength','health')),
  module text NOT NULL CHECK (module IN (
    'nutrition','training','recovery','supplements','medical')),
  weight numeric(4,2) NOT NULL CHECK (weight BETWEEN 0 AND 1),
  PRIMARY KEY (goal_kind,module)
);
INSERT INTO goals.contribution_weights(goal_kind,module,weight) VALUES
  ('body_composition_loss','nutrition',0.40),
  ('body_composition_loss','training',0.25),
  ('body_composition_loss','recovery',0.20),
  ('body_composition_loss','supplements',0.10),
  ('body_composition_loss','medical',0.05),
  ('body_composition_gain','nutrition',0.30),
  ('body_composition_gain','training',0.35),
  ('body_composition_gain','recovery',0.20),
  ('body_composition_gain','supplements',0.10),
  ('body_composition_gain','medical',0.05),
  ('performance_strength','nutrition',0.25),
  ('performance_strength','training',0.40),
  ('performance_strength','recovery',0.20),
  ('performance_strength','supplements',0.10),
  ('performance_strength','medical',0.05),
  ('health','nutrition',0.25),
  ('health','training',0.20),
  ('health','recovery',0.20),
  ('health','supplements',0.15),
  ('health','medical',0.20);
ALTER TABLE goals.contribution_weights ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON goals.contribution_weights FROM PUBLIC,anon,authenticated;
GRANT SELECT ON goals.contribution_weights TO authenticated,service_role;
CREATE POLICY contribution_weights_read ON goals.contribution_weights
  FOR SELECT TO authenticated USING (true);

-- Fehlende Module werden nicht als 0 in den Engpass eingespeist.
CREATE FUNCTION goals.goal_bottleneck(p_goal_kind text,p_scores jsonb)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  WITH available AS (
    SELECT w.module,w.weight,(p_scores->>w.module)::numeric AS score
    FROM goals.contribution_weights w
    WHERE w.goal_kind=p_goal_kind
      AND jsonb_typeof(p_scores->w.module)='number'
  ), average AS (
    SELECT avg(score) AS score FROM available
  ), ranked AS (
    SELECT a.module,a.score,av.score AS average_score,
      (av.score-a.score)*a.weight AS gap
    FROM available a CROSS JOIN average av
    ORDER BY gap DESC,a.module LIMIT 1
  )
  SELECT CASE WHEN gap>=5 THEN jsonb_build_object(
    'module',module,'current_score',round(score,1),
    'avg_score',round(average_score,1),'gap',round(gap,2),
    'improvement_potential_pct',round(gap)) END
  FROM ranked;
$$;
REVOKE ALL ON FUNCTION goals.goal_bottleneck(text,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_bottleneck(text,jsonb)
  TO authenticated,service_role;
COMMENT ON FUNCTION goals.goal_bottleneck(text,jsonb) IS
  'G-522: SCORING.md findBottleneck, groesster gewichteter negativer Abstand; unter 5 kein Engpass, NULL-Module bleiben ausser Betracht.';

COMMIT;
