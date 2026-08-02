-- STATUS: DRAFT — NICHT ANWENDEN (Job D-12, Rückbau 2026-08-02)
-- Inhaltlich identisch mit 20260424_002_wo_classifier_fields.sql.
-- Befund 2026-08-02: Diese Migration ist im Container ANGEWENDET
-- (workorders hat 37 Spalten = 25 Basis + 12 Classifier), steht aber NICHT
-- im Migrations-Register — dort ist nur 20260423120000 verzeichnet.
-- Zweite am Register vorbei gelaufene Datei neben den Slices (Frage O-6).

-- UP

ALTER TABLE workorders
  ADD COLUMN IF NOT EXISTS wo_category            TEXT,
  ADD COLUMN IF NOT EXISTS wo_module              TEXT,
  ADD COLUMN IF NOT EXISTS wo_complexity          TEXT CHECK (wo_complexity IN ('low', 'medium', 'high')),
  ADD COLUMN IF NOT EXISTS wo_risk                TEXT CHECK (wo_risk IN ('low', 'medium', 'high')),
  ADD COLUMN IF NOT EXISTS db_access              TEXT CHECK (db_access IN ('none', 'read', 'write', 'migration')),
  ADD COLUMN IF NOT EXISTS files_allowed          TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS files_blocked          TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS assigned_spark         TEXT,
  ADD COLUMN IF NOT EXISTS routing_reason         TEXT,
  ADD COLUMN IF NOT EXISTS needs_db_check         BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS requires_schema_change BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS wo_priority            INTEGER DEFAULT 2;

CREATE INDEX IF NOT EXISTS idx_workorders_assigned_spark ON workorders(assigned_spark);
CREATE INDEX IF NOT EXISTS idx_workorders_wo_module      ON workorders(wo_module);
CREATE INDEX IF NOT EXISTS idx_workorders_wo_priority    ON workorders(wo_priority);

-- DOWN (Rollback)
-- DROP INDEX IF EXISTS idx_workorders_wo_priority;
-- DROP INDEX IF EXISTS idx_workorders_wo_module;
-- DROP INDEX IF EXISTS idx_workorders_assigned_spark;
-- ALTER TABLE workorders
--   DROP COLUMN IF EXISTS wo_priority,
--   DROP COLUMN IF EXISTS requires_schema_change,
--   DROP COLUMN IF EXISTS needs_db_check,
--   DROP COLUMN IF EXISTS routing_reason,
--   DROP COLUMN IF EXISTS assigned_spark,
--   DROP COLUMN IF EXISTS files_blocked,
--   DROP COLUMN IF EXISTS files_allowed,
--   DROP COLUMN IF EXISTS db_access,
--   DROP COLUMN IF EXISTS wo_risk,
--   DROP COLUMN IF EXISTS wo_complexity,
--   DROP COLUMN IF EXISTS wo_module,
--   DROP COLUMN IF EXISTS wo_category;
