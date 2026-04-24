cd D:\GitHub\LumeOS-Claude-V1

$sql = @"
INSERT INTO workorders (id, wo_id, state, agent_type, created_at, artefakt_hash) VALUES
  (gen_random_uuid(), 'WO-fresh-001', 'pending', 'micro_executor', now(), 'sha256:aabb'),
  (gen_random_uuid(), 'WO-fresh-002', 'running', 'micro_executor', now(), 'sha256:ccdd'),
  (gen_random_uuid(), 'WO-fresh-003', 'done', 'micro_executor', now(), 'sha256:eeff'),
  (gen_random_uuid(), 'WO-fresh-004', 'failed', 'governance_compiler', now(), 'sha256:1122'),
  (gen_random_uuid(), 'WO-fresh-005', 'pending', 'micro_executor', now(), 'sha256:3344');

INSERT INTO wo_failure_events (id, wo_id, failure_class, attempt, node, timestamp) VALUES
  (gen_random_uuid(), 'WO-fresh-004', 'execution_error', 1, 'spark-b', now()),
  (gen_random_uuid(), 'WO-fresh-004', 'triple_hash_mismatch', 2, 'spark-b', now());

INSERT INTO governance_artefacts (id, artefakt_hash, wo_id, compiled_by, compiled_at, artefakt_json) VALUES
  (gen_random_uuid(), 'sha256:aabb', 'WO-fresh-001', 'governance-compiler', now(), '{}'),
  (gen_random_uuid(), 'sha256:ccdd', 'WO-fresh-002', 'governance-compiler', now(), '{}');
"@

$sql | supabase db execute --local
Write-Host 'Done'
