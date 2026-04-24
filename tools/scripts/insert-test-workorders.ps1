$creds = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes('admin:lumeos2026'))
$headers = @{ Authorization = "Basic $creds"; 'Content-Type' = 'application/json' }

# Insert fresh test data into Supabase
$sql = @'
INSERT INTO workorders (id, wo_id, state, agent_type, created_at, artefakt_hash)
VALUES 
  (gen_random_uuid(), 'WO-test-001', 'pending', 'micro_executor', now(), 'sha256:aabbcc'),
  (gen_random_uuid(), 'WO-test-002', 'running', 'micro_executor', now() - interval '5 minutes', 'sha256:ddeeff'),
  (gen_random_uuid(), 'WO-test-003', 'done', 'micro_executor', now() - interval '1 hour', 'sha256:112233'),
  (gen_random_uuid(), 'WO-test-004', 'failed', 'governance_compiler', now() - interval '2 hours', 'sha256:445566'),
  (gen_random_uuid(), 'WO-test-005', 'pending', 'micro_executor', now() - interval '30 minutes', 'sha256:778899');

INSERT INTO wo_failure_events (id, wo_id, failure_class, attempt, node, timestamp)
VALUES
  (gen_random_uuid(), 'WO-test-004', 'execution_error', 1, 'spark-b', now() - interval '2 hours'),
  (gen_random_uuid(), 'WO-test-004', 'triple_hash_mismatch', 2, 'spark-b', now() - interval '1 hour 55 minutes');

INSERT INTO governance_artefacts (id, artefakt_hash, wo_id, compiled_by, compiled_at, artefakt_json)
VALUES
  (gen_random_uuid(), 'sha256:aabbcc', 'WO-test-001', 'governance-compiler', now(), '{}'),
  (gen_random_uuid(), 'sha256:ddeeff', 'WO-test-002', 'governance-compiler', now() - interval '5 minutes', '{}');
'@

$body = @{ query = $sql } | ConvertTo-Json
$result = Invoke-RestMethod -Method POST `
  -Uri 'http://localhost:54321/rest/v1/rpc/execute_sql' `
  -Headers @{ 
    Authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hj04zWl196z2-SBe0'
    'Content-Type' = 'application/json'
    'apikey' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hj04zWl196z2-SBe0'
  } `
  -Body $body `
  -ErrorAction SilentlyContinue

Write-Host "Done — check Grafana at http://localhost:3001"
