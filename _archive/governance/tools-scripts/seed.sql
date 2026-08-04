INSERT INTO workorders (id, wo_id, state, agent_type, created_at) VALUES
  (gen_random_uuid(), 'WO-fresh-001', 'ready', 'micro_executor', now()),
  (gen_random_uuid(), 'WO-fresh-002', 'running', 'micro_executor', now()),
  (gen_random_uuid(), 'WO-fresh-003', 'done', 'micro_executor', now()),
  (gen_random_uuid(), 'WO-fresh-004', 'failed', 'governance_compiler', now()),
  (gen_random_uuid(), 'WO-fresh-005', 'ready', 'micro_executor', now()),
  (gen_random_uuid(), 'WO-fresh-006', 'dispatched', 'micro_executor', now()),
  (gen_random_uuid(), 'WO-fresh-007', 'done', 'micro_executor', now());

INSERT INTO wo_failure_events (id, wo_id, failure_class, node, timestamp) VALUES
  (gen_random_uuid(), 'WO-fresh-004', 'execution_error', 'spark-b', now()),
  (gen_random_uuid(), 'WO-fresh-004', 'triple_hash_mismatch', 'spark-b', now());
