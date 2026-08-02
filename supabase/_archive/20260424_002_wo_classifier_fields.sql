-- Migration: 20260424_002_wo_classifier_fields
-- Description: WO-Classifier (Port 9000) annotations on workorders.
--   Adds the per-WO routing metadata produced by services/wo-classifier so the
--   scheduler can pick the right Spark deterministically and audit can replay
--   the classification later.
-- Reference: docs/prompts/opus_pipeline_gaps.md (WO-Pipeline-2)

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

-- Helpful indexes for the scheduler / Grafana dashboards
CREATE INDEX IF NOT EXISTS idx_workorders_assigned_spark ON workorders(assigned_spark);
CREATE INDEX IF NOT EXISTS idx_workorders_wo_module      ON workorders(wo_module);
CREATE INDEX IF NOT EXISTS idx_workorders_wo_priority    ON workorders(wo_priority);
