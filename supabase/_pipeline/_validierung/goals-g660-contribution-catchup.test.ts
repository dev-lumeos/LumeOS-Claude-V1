import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-660 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'

function sql(body: string): string {
  return execFileSync('docker', ['exec', container, 'psql', '-X', '-q',
    '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db, '-t', '-A', '-c', body],
  { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
}

test('G-660: nur service_role darf alle Konten nachholen', () => {
  for (const role of ['postgres', 'authenticated', 'anon']) {
    assert.throws(() => sql(`BEGIN; SET LOCAL ROLE ${role};
      SELECT goals.run_goal_contribution_catchup(CURRENT_DATE-1); ROLLBACK;`),
    /G660_BLOCK|permission denied/)
  }
  const grants = sql(`SELECT json_build_object(
    'service',has_function_privilege('service_role',
      'goals.run_goal_contribution_catchup(date,uuid[])','EXECUTE'),
    'authenticated',has_function_privilege('authenticated',
      'goals.run_goal_contribution_catchup(date,uuid[])','EXECUTE'),
    'anon',has_function_privilege('anon',
      'goals.run_goal_contribution_catchup(date,uuid[])','EXECUTE'))`)
  assert.deepEqual(JSON.parse(grants),
    { service: true, authenticated: false, anon: false })
})

test('G-660: Ausfall nachholen, zweiter Lauf unveraendert, Nachtrag uebernommen', () => {
  const output = sql(`
    BEGIN;
    SET LOCAL ROLE service_role;
    DO $probe$
    DECLARE
      v_first jsonb;
      v_second jsonb;
      v_repeat jsonb;
      v_late jsonb;
      v_count integer;
      v_old numeric;
      v_new numeric;
      v_hash_before text;
      v_hash_after text;
      v_state_before text;
      v_state_after text;
    BEGIN
      SELECT count(*) INTO v_count FROM public.profiles;
      v_first := goals.run_goal_contribution_catchup(CURRENT_DATE-4);
      IF (v_first->>'konten')::integer<>v_count OR
        (SELECT count(*) FROM goals.goal_contribution_run_state)<>v_count THEN
        RAISE EXCEPTION 'G660_TEST_MISSED_ACCOUNTS';
      END IF;
      v_second := goals.run_goal_contribution_catchup(CURRENT_DATE-1);
      IF (SELECT count(*) FROM goals.goal_contributions
          WHERE details->>'writer'='G-522'
            AND contribution_date=CURRENT_DATE-1)=0
        OR (SELECT count(*) FROM goals.goal_contribution_run_state
          WHERE successful_through=CURRENT_DATE-1)<>v_count THEN
        RAISE EXCEPTION 'G660_TEST_MISSED_DAYS';
      END IF;

      SELECT md5(coalesce(string_agg(to_jsonb(c)::text,'' ORDER BY
        c.goal_id,c.contribution_date,c.module),'')) INTO v_hash_before
      FROM goals.goal_contributions c WHERE c.details->>'writer'='G-522';
      SELECT md5(coalesce(string_agg(to_jsonb(s)::text,'' ORDER BY
        s.user_id),'')) INTO v_state_before
      FROM goals.goal_contribution_run_state s;
      v_repeat := goals.run_goal_contribution_catchup(CURRENT_DATE-1);
      SELECT md5(coalesce(string_agg(to_jsonb(c)::text,'' ORDER BY
        c.goal_id,c.contribution_date,c.module),'')) INTO v_hash_after
      FROM goals.goal_contributions c WHERE c.details->>'writer'='G-522';
      SELECT md5(coalesce(string_agg(to_jsonb(s)::text,'' ORDER BY
        s.user_id),'')) INTO v_state_after
      FROM goals.goal_contribution_run_state s;
      IF (v_repeat->>'geschriebene_zeilen')::integer<>0
        OR v_hash_before<>v_hash_after OR v_state_before<>v_state_after THEN
        RAISE EXCEPTION 'G660_TEST_NOT_IDEMPOTENT';
      END IF;

      SELECT c.contribution_score INTO v_old
      FROM goals.goal_contributions c
      WHERE c.user_id='20000000-0000-0000-0000-000000000901'
        AND c.contribution_date=CURRENT_DATE-2
        AND c.module='supplements' AND c.details->>'writer'='G-522'
      LIMIT 1;
      IF v_old IS NULL THEN RAISE EXCEPTION 'G660_TEST_SOURCE_MISSING'; END IF;
      UPDATE supplements.intake_logs SET status='skipped',actual_dose=NULL,
        actual_dose_unit=NULL
      WHERE id=(SELECT id FROM supplements.intake_logs
        WHERE user_id='20000000-0000-0000-0000-000000000901'
          AND intake_date=CURRENT_DATE-2 AND status='taken'
          AND source_detail='G-652 Einnahmeverlauf' ORDER BY id LIMIT 1);
      IF NOT FOUND THEN RAISE EXCEPTION 'G660_TEST_LATE_LOG_MISSING'; END IF;
      v_late := goals.run_goal_contribution_catchup(CURRENT_DATE-1);
      SELECT c.contribution_score INTO v_new
      FROM goals.goal_contributions c
      WHERE c.user_id='20000000-0000-0000-0000-000000000901'
        AND c.contribution_date=CURRENT_DATE-2
        AND c.module='supplements' AND c.details->>'writer'='G-522'
      LIMIT 1;
      IF v_new IS NOT DISTINCT FROM v_old
        OR (v_late->>'geschriebene_zeilen')::integer=0 THEN
        RAISE EXCEPTION 'G660_TEST_LATE_LOG_IGNORED: % -> %',v_old,v_new;
      END IF;
      IF EXISTS (SELECT 1 FROM goals.goal_contributions c
        JOIN LATERAL goals.goal_state_at(c.goal_id,c.contribution_date) s ON true
        WHERE c.details->>'writer'='G-522' AND s.state='eingefroren'
          AND c.contribution_date>s.frozen_on) THEN
        RAISE EXCEPTION 'G660_TEST_AFTER_FREEZE';
      END IF;
      RAISE NOTICE 'G660_TEST accounts %, missed rows %, late score % -> %',
        v_count,v_second->>'geschriebene_zeilen',v_old,v_new;
    END $probe$;
    SELECT 'ok';
    ROLLBACK;
  `)
  assert.match(output, /ok/)
})
