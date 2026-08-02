-- STATUS: DRAFT — NICHT ANWENDEN (Job D-12, Rückbau 2026-08-02)
-- Inhaltlich identisch mit der einzigen registrierten Migration
-- 20260423120000_control_plane_tables.sql. Hier übernommen, damit die
-- Draft-Sequenz für sich allein den Gesamtzustand reproduziert.
-- Governance-Altlast (siehe docs/ssot/50-governance-rest.md) — ob diese
-- Tabellen überhaupt erhalten bleiben, ist offene Frage O-7. Der Container
-- hat sie heute; RLS an, 0 Policies (Service-Role only) am 2026-08-02
-- verifiziert.

-- UP

CREATE TABLE IF NOT EXISTS governance_artefacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artefakt_hash VARCHAR(72) UNIQUE NOT NULL,
  wo_id VARCHAR(100) NOT NULL,
  source_macro VARCHAR(255),
  compiled_by VARCHAR(100) NOT NULL,
  compiled_at TIMESTAMPTZ NOT NULL,
  artefakt_json JSONB NOT NULL,
  sat_check_result VARCHAR(10) CHECK (sat_check_result IN ('pass', 'reject')),
  sat_check_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_governance_artefacts_wo_id ON governance_artefacts(wo_id);
CREATE INDEX idx_governance_artefacts_compiled_at ON governance_artefacts(compiled_at);

CREATE TABLE IF NOT EXISTS wo_failure_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_id VARCHAR(100) NOT NULL,
  batch_id VARCHAR(100),
  failure_class VARCHAR(50) NOT NULL CHECK (failure_class IN (
    'technical_transient',
    'technical_persistent',
    'semantic_output',
    'scope_violation',
    'dependency_invalid',
    'guardrail_violation'
  )),
  attempt_number INTEGER NOT NULL DEFAULT 1,
  node VARCHAR(20) CHECK (node IN ('spark-a', 'spark-b', 'openrouter', 'external')),
  agent_type VARCHAR(50),
  error_message TEXT,
  error_details JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wo_failure_events_wo_id ON wo_failure_events(wo_id);
CREATE INDEX idx_wo_failure_events_failure_class ON wo_failure_events(failure_class);
CREATE INDEX idx_wo_failure_events_timestamp ON wo_failure_events(timestamp);

CREATE TYPE wo_type AS ENUM ('micro', 'macro');
CREATE TYPE wo_state AS ENUM (
  'wo_generated',
  'graph_validated',
  'queue_released',
  'blocked',
  'ready',
  'dispatched',
  'running',
  'done',
  'failed',
  'reviewed',
  'retry_scheduled',
  'closed',
  'cancelled',
  'graph_repair_pending'
);
CREATE TYPE wo_phase AS ENUM ('1', '2', '3');

CREATE TABLE IF NOT EXISTS workorders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_id VARCHAR(100) UNIQUE NOT NULL,
  batch_id VARCHAR(100) NOT NULL,
  wo_type wo_type NOT NULL,
  agent_type VARCHAR(50) NOT NULL,
  state wo_state NOT NULL DEFAULT 'wo_generated',
  phase wo_phase NOT NULL,
  scope_files TEXT[] NOT NULL,
  task TEXT[] NOT NULL,
  blocked_by TEXT[] DEFAULT '{}',
  conflicts_with TEXT[] DEFAULT '{}',
  acceptance_auto_checks TEXT[] DEFAULT '{}',
  acceptance_review_checks TEXT[] DEFAULT '{}',
  acceptance_human_checks TEXT[] DEFAULT '{}',
  retry_max_attempts INTEGER DEFAULT 3,
  retry_attempt_number INTEGER DEFAULT 0,
  retry_context JSONB,
  failure_class VARCHAR(50),
  assigned_node VARCHAR(20),
  execution_token_id UUID,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  source_subtask_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workorders_batch_id ON workorders(batch_id);
CREATE INDEX idx_workorders_state ON workorders(state);
CREATE INDEX idx_workorders_phase ON workorders(phase);
CREATE INDEX idx_workorders_agent_type ON workorders(agent_type);

CREATE TABLE IF NOT EXISTS execution_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID UNIQUE NOT NULL,
  wo_id VARCHAR(100) NOT NULL,
  artefakt_hash VARCHAR(72) NOT NULL,
  nonce VARCHAR(64) UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  issuer_key_id VARCHAR(32) NOT NULL,
  sat_check_results JSONB NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_execution_tokens_wo_id ON execution_tokens(wo_id);
CREATE INDEX idx_execution_tokens_nonce ON execution_tokens(nonce);
CREATE INDEX idx_execution_tokens_expires_at ON execution_tokens(expires_at);

ALTER TABLE governance_artefacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wo_failure_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE workorders ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_tokens ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workorders_updated_at
  BEFORE UPDATE ON workorders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- DOWN (Rollback)
-- DROP TRIGGER IF EXISTS workorders_updated_at ON workorders;
-- DROP FUNCTION IF EXISTS update_updated_at();
-- DROP TABLE IF EXISTS execution_tokens;
-- DROP TABLE IF EXISTS workorders;
-- DROP TABLE IF EXISTS wo_failure_events;
-- DROP TABLE IF EXISTS governance_artefacts;
-- DROP TYPE IF EXISTS wo_phase;
-- DROP TYPE IF EXISTS wo_state;
-- DROP TYPE IF EXISTS wo_type;
