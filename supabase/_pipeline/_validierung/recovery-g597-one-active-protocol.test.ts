import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE

if (!db || db === 'postgres') {
  throw new Error('G-597 braucht eine Wegwerf-Datenbank, nie postgres.')
}

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()

  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('G-597: Regel und Probe folgen als eigene Schritte direkt auf C-421', () => {
  const manifest = JSON.parse(readFileSync('supabase/_pipeline/kette.json', 'utf8')) as {
    steps: Array<{ id: string; path: string; kind: string; depends_on: string[] }>
  }
  const schemaIndex = manifest.steps.findIndex(step => step.id === '421_schema')
  const ruleIndex = manifest.steps.findIndex(step => step.id === '597_one_active_protocol')
  const probeIndex = manifest.steps.findIndex(step => step.id === '597_one_active_protocol_probe')

  assert.ok(schemaIndex >= 0)
  assert.equal(ruleIndex, schemaIndex + 1)
  assert.deepEqual(manifest.steps[ruleIndex], {
    id: '597_one_active_protocol',
    path: 'supabase/_pipeline/12_recovery/597_one_active_protocol.sql',
    kind: 'sql',
    creates: 'G-597: hoechstens ein aktives Recovery-Protokoll je Nutzer',
    depends_on: ['421_schema'],
  })
  assert.equal(probeIndex, ruleIndex + 1)
  assert.deepEqual(manifest.steps[probeIndex], {
    id: '597_one_active_protocol_probe',
    path: 'supabase/_pipeline/_validierung/recovery-g597-one-active-protocol.test.ts',
    kind: 'tsx',
    creates: 'G-597: 23505 fuer ein zweites aktives Protokoll, Historie und zwei Nutzer bleiben erlaubt',
    depends_on: ['597_one_active_protocol'],
  })
})

test('G-597: je Nutzer ist nur ein aktives Recovery-Protokoll erlaubt', () => {
  const result = one<{
    indexDefinition: string | null
    secondActive: string
    completedForSameUser: number
    usersWithActive: number
    maxActivePerUser: number
  }>(`
    BEGIN;
    CREATE TEMP TABLE g597_result (
      fall text PRIMARY KEY,
      wert text NOT NULL
    ) ON COMMIT DROP;

    INSERT INTO recovery.recovery_protocols (
      user_id, protocol_key, name, target_condition, started_on, duration_days, status
    ) VALUES (
      '59700000-0000-0000-0000-000000000001',
      'active_recovery_week', 'G-597 aktiv eins', 'probe', DATE '2099-01-01', 7, 'active'
    );

    DO $probe$
    DECLARE
      v_constraint text;
    BEGIN
      BEGIN
        INSERT INTO recovery.recovery_protocols (
          user_id, protocol_key, name, target_condition, started_on, duration_days, status
        ) VALUES (
          '59700000-0000-0000-0000-000000000001',
          'sleep_optimization', 'G-597 aktiv zwei', 'probe', DATE '2099-01-02', 7, 'active'
        );
        INSERT INTO g597_result VALUES ('second_active', 'angenommen');
      EXCEPTION WHEN unique_violation THEN
        GET STACKED DIAGNOSTICS v_constraint = CONSTRAINT_NAME;
        INSERT INTO g597_result VALUES ('second_active', SQLSTATE || ':' || v_constraint);
      END;
    END
    $probe$;

    INSERT INTO recovery.recovery_protocols (
      user_id, protocol_key, name, target_condition, started_on, duration_days, status
    ) VALUES
      ('59700000-0000-0000-0000-000000000001',
       'passive_deload', 'G-597 abgeschlossen eins', 'probe', DATE '2099-01-03', 7, 'completed'),
      ('59700000-0000-0000-0000-000000000001',
       'injury_protocol', 'G-597 abgeschlossen zwei', 'probe', DATE '2099-01-04', 7, 'completed'),
      ('59700000-0000-0000-0000-000000000002',
       'active_recovery_week', 'G-597 anderer Nutzer', 'probe', DATE '2099-01-05', 7, 'active');

    SELECT json_build_object(
      'indexDefinition', (
        SELECT indexdef FROM pg_indexes
        WHERE schemaname = 'recovery'
          AND tablename = 'recovery_protocols'
          AND indexname = 'uq_recovery_protocols_one_active'
      ),
      'secondActive', (
        SELECT wert FROM g597_result WHERE fall = 'second_active'
      ),
      'completedForSameUser', (
        SELECT count(*)::integer
        FROM recovery.recovery_protocols
        WHERE user_id = '59700000-0000-0000-0000-000000000001'
          AND status = 'completed'
      ),
      'usersWithActive', (
        SELECT count(DISTINCT user_id)::integer
        FROM recovery.recovery_protocols
        WHERE user_id IN (
          '59700000-0000-0000-0000-000000000001',
          '59700000-0000-0000-0000-000000000002'
        ) AND status = 'active'
      ),
      'maxActivePerUser', (
        SELECT max(active_count)::integer
        FROM (
          SELECT count(*) AS active_count
          FROM recovery.recovery_protocols
          WHERE user_id IN (
            '59700000-0000-0000-0000-000000000001',
            '59700000-0000-0000-0000-000000000002'
          ) AND status = 'active'
          GROUP BY user_id
        ) AS per_user
      )
    );
    ROLLBACK;
  `)

  assert.equal(result.secondActive, '23505:uq_recovery_protocols_one_active')
  assert.match(
    result.indexDefinition ?? '',
    /UNIQUE INDEX.+\(user_id\).+WHERE \(status = 'active'::text\)/i,
  )
  assert.equal(result.completedForSameUser, 2)
  assert.equal(result.usersWithActive, 2)
  assert.equal(result.maxActivePerUser, 1)
})
