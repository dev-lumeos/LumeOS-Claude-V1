import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const DB = process.env.LUMEOS_C459_DATABASE
if (!DB || DB === 'postgres') throw new Error('C-459 braucht LUMEOS_C459_DATABASE als Wegwerf-Datenbank.')
function sql<T>(s: string): T {
  const out = execFileSync('docker', ['exec', 'supabase_db_LumeOS-Claude-V1', 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB, '-t', '-A', '-c', s], { encoding: 'utf8' }).trim()
  return JSON.parse(out.slice(out.indexOf('{'))) as T
}
test('C-459: eigener Coach erzeugt einen faktischen Alarm nur einmal je 24 Stunden', () => {
  const r = sql<{ inserted: number; duplicate: number; foreignDenied: boolean; medicalDenied: boolean; anonExec: number }>(`
    BEGIN;
    INSERT INTO auth.users(id,email,raw_app_meta_data,created_at) VALUES
      ('c4590000-0000-0000-0000-000000000001','coach@example.test','{}',now()),
      ('c4590000-0000-0000-0000-000000000002','client@example.test','{}',now()),
      ('c4590000-0000-0000-0000-000000000003','other@example.test','{}',now());
    INSERT INTO coach.relationships(coach_id,client_id,status,started_at) VALUES ('c4590000-0000-0000-0000-000000000001','c4590000-0000-0000-0000-000000000002','active',now());
    SET LOCAL ROLE authenticated; SELECT set_config('request.jwt.claim.sub','c4590000-0000-0000-0000-000000000001',true);
    SELECT coach.raise_alert('c4590000-0000-0000-0000-000000000002','checkin_overdue','medium','Check-in ueberfaellig','Fakt: Faelligkeitsdatum ueberschritten','{"days":2}'::jsonb);
    SELECT coach.raise_alert('c4590000-0000-0000-0000-000000000002','checkin_overdue','medium','Check-in ueberfaellig','Fakt: Faelligkeitsdatum ueberschritten','{"days":2}'::jsonb);
    SELECT set_config('request.jwt.claim.sub','c4590000-0000-0000-0000-000000000003',true);
    CREATE TEMP TABLE x(v boolean default false); INSERT INTO x default values; GRANT UPDATE,SELECT ON x TO authenticated;
    DO $$ BEGIN BEGIN PERFORM coach.raise_alert('c4590000-0000-0000-0000-000000000002','checkin_overdue','medium','x','x','{}'); EXCEPTION WHEN insufficient_privilege THEN UPDATE x SET v=true; END; END $$;
    SELECT set_config('request.jwt.claim.sub','c4590000-0000-0000-0000-000000000001',true);
    CREATE TEMP TABLE y(v boolean default false); INSERT INTO y default values; GRANT UPDATE,SELECT ON y TO authenticated;
    DO $$ BEGIN BEGIN PERFORM coach.raise_alert('c4590000-0000-0000-0000-000000000002','medical','critical','x','x','{}'); EXCEPTION WHEN check_violation THEN UPDATE y SET v=true; END; END $$;
    RESET ROLE;
    SELECT json_build_object('inserted',(SELECT count(*) FROM coach.alerts WHERE coach_id='c4590000-0000-0000-0000-000000000001'),'duplicate',(SELECT count(*) FROM coach.alerts WHERE coach_id='c4590000-0000-0000-0000-000000000001' AND kind='checkin_overdue'),'foreignDenied',(SELECT v FROM x),'medicalDenied',(SELECT v FROM y),'anonExec',(SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='coach' AND p.proname='raise_alert' AND has_function_privilege('anon',p.oid,'EXECUTE')));
    ROLLBACK;
  `)
  assert.equal(r.inserted, 1); assert.equal(r.duplicate, 1); assert.equal(r.foreignDenied, true); assert.equal(r.medicalDenied, true); assert.equal(r.anonExec, 0)
})
