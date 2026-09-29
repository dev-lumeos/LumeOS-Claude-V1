-- G-514: taegliche Modulbeitraege je Ziel.
--
-- DATABASE.md Abschnitt 3 liefert die Grundform. Der in
-- packages/scoring/src/beitrag.ts abgenommene Vertrag ergaenzt die
-- entscheidende Unterscheidung: 0 ist ein Wert; NULL braucht einen Grund.

BEGIN;

CREATE TABLE goals.goal_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL,
  user_id uuid NOT NULL,
  contribution_date date NOT NULL,
  module text NOT NULL,
  contribution_score numeric(5,2),
  missing_reason text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT goal_contributions_goal_user_fk
    FOREIGN KEY (goal_id, user_id)
    REFERENCES goals.user_goals (id, user_id)
    ON DELETE CASCADE,
  CONSTRAINT goal_contributions_goal_module_date_uq
    UNIQUE (goal_id, module, contribution_date),
  CONSTRAINT goal_contributions_module_ck
    CHECK (module IN (
      'nutrition', 'training', 'recovery', 'supplements', 'medical'
    )),
  CONSTRAINT goal_contributions_score_ck
    CHECK (
      contribution_score IS NULL
      OR contribution_score BETWEEN 0 AND 100
    ),
  CONSTRAINT goal_contributions_missing_reason_ck
    CHECK (
      (
        contribution_score IS NULL
        AND NULLIF(btrim(missing_reason), '') IS NOT NULL
      )
      OR (
        contribution_score IS NOT NULL
        AND missing_reason IS NULL
      )
    ),
  CONSTRAINT goal_contributions_details_object_ck
    CHECK (jsonb_typeof(details) = 'object')
);

CREATE INDEX goal_contributions_goal_date_idx
  ON goals.goal_contributions (goal_id, contribution_date DESC);
CREATE INDEX goal_contributions_user_date_idx
  ON goals.goal_contributions (user_id, contribution_date DESC);

CREATE TRIGGER goal_contributions_touch_updated_at
  BEFORE UPDATE ON goals.goal_contributions
  FOR EACH ROW EXECUTE FUNCTION goals.touch_updated_at();

ALTER TABLE goals.goal_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY goal_contributions_select
  ON goals.goal_contributions
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

GRANT USAGE ON SCHEMA goals TO authenticated, service_role;
REVOKE ALL ON TABLE goals.goal_contributions
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE goals.goal_contributions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE goals.goal_contributions
  TO service_role;

COMMENT ON TABLE goals.goal_contributions IS
  'G-514: taeglicher Score eines Moduls fuer ein Ziel. Keine Zeile, Score 0 und Score NULL mit Grund sind drei verschiedene Zustaende.';
COMMENT ON COLUMN goals.goal_contributions.contribution_date IS
  'Lokaler Beitragstag. Schreibwege nehmen nur Tage bis einschliesslich ihres ausdruecklichen Stichtags.';
COMMENT ON COLUMN goals.goal_contributions.contribution_score IS
  'Modulscore 0 bis 100. NULL ist kein Wert und verlangt missing_reason.';
COMMENT ON COLUMN goals.goal_contributions.missing_reason IS
  'Pflichtgrund genau dann, wenn contribution_score NULL ist; bei einem echten Score einschliesslich 0 immer NULL.';
COMMENT ON COLUMN goals.goal_contributions.details IS
  'Quellnaher JSON-Snapshot des Moduls; immer ein Objekt, keine zweite Score-Rechnung.';

COMMIT;
