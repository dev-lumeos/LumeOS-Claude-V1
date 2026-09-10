// C-456: Zyklen bleiben nachvollziehbar, PCT-Vorlagen werden pro Nutzer
// kopiert, und die Tagesliste wird nur aus dessen Stack/Zyklus/Protokoll gebaut.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.LUMEOS_C456_DATABASE
if (!DB || DB === 'postgres') throw new Error('C-456-Test braucht LUMEOS_C456_DATABASE als Wegwerf-Datenbank, nie postgres.')

const OWNER = 'c4560000-0000-0000-0000-000000000001'
const OTHER = 'c4560000-0000-0000-0000-000000000002'

function sql<T>(statement: string): T {
  const output = execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', statement,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-456: atomare Zyklen, Vorlage und Tagesliste bleiben im Nutzer-Scope', () => {
  const result = sql<{
    templateCount: number
    templateItemCount: number
    protocolWeeks: Array<[number, number]>
    transitions: string[]
    cycleCountAfterFailure: number
    scheduleForDay: Array<{ source: string, timing: string | null, scheduleDate: string }>
    otherSeesCycles: number
    otherSeesSchedule: number
    otherCanChangeCycle: boolean
    functionAccess: Record<string, { anon: boolean, authenticated: boolean }>
    weeksColumns: string[]
    boundaryComment: string
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at)
    VALUES
      ('${OWNER}'::uuid, 'c456-owner@example.test', '{}'::jsonb, now()),
      ('${OTHER}'::uuid, 'c456-other@example.test', '{}'::jsonb, now());

    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '${OWNER}', true);

    CREATE TEMP TABLE c456_stack AS
    WITH inserted AS (
      INSERT INTO supplements.user_stacks (user_id, name, goal, source, is_active)
      VALUES ('${OWNER}'::uuid, 'C456 Stack', 'health', 'user', true)
      RETURNING id
    ) SELECT * FROM inserted;

    CREATE TEMP TABLE c456_supplements AS
    SELECT id, row_number() OVER (ORDER BY id) AS position
    FROM supplements.supplements WHERE is_active ORDER BY id LIMIT 2;

    CREATE TEMP TABLE c456_stack_item AS
    WITH inserted AS (
      INSERT INTO supplements.stack_items (
        stack_id, supplement_id, dose, dose_unit, timing, frequency, cycling
      )
      SELECT (SELECT id FROM c456_stack), id, position, 'mg',
             CASE WHEN position = 1 THEN 'morning' ELSE 'evening' END,
             CASE WHEN position = 1 THEN 'cycling' ELSE 'daily' END,
             CASE WHEN position = 1
               THEN '{"on_weeks":1,"off_weeks":0,"started_on":"2099-01-15","current_phase":"on"}'::jsonb
               ELSE NULL END
      FROM c456_supplements
          RETURNING id, supplement_id, cycling
    ) SELECT * FROM inserted;

    CREATE TEMP TABLE c456_cycle AS
    SELECT supplements.start_supplement_cycle(
      (SELECT supplement_id FROM c456_stack_item WHERE cycling IS NOT NULL),
      'confirmed_by_user', 'user_manual', 'C456 Test'
    ) AS id;
    SELECT supplements.set_supplement_cycle_status((SELECT id FROM c456_cycle), 'paused', 'C456 pause');
    SELECT supplements.set_supplement_cycle_status((SELECT id FROM c456_cycle), 'stopped', 'C456 stop');

    CREATE TEMP TABLE c456_failed AS SELECT false AS rejected;
    DO $$
    BEGIN
      BEGIN
        PERFORM supplements.create_supplement_protocol_from_template(
          'does-not-exist', (SELECT supplement_id FROM c456_stack_item WHERE cycling IS NOT NULL), DATE '2099-01-15'
        );
      EXCEPTION WHEN invalid_parameter_value THEN
        UPDATE c456_failed SET rejected = true;
      END;
    END $$;

    CREATE TEMP TABLE c456_protocol AS
    SELECT supplements.create_supplement_protocol_from_template(
      'standard_nolva_clomid', (SELECT supplement_id FROM c456_stack_item WHERE cycling IS NOT NULL), DATE '2099-01-15'
    ) AS id;

    CREATE TEMP TABLE c456_active_cycle AS
    SELECT supplements.start_supplement_cycle(
      (SELECT supplement_id FROM c456_stack_item WHERE cycling IS NOT NULL),
      'confirmed_by_user', 'user_manual', 'C456 schedule'
    ) AS id;
    SELECT supplements.refresh_intake_schedule(DATE '2099-01-15');

    CREATE TEMP TABLE c456_owner AS
    SELECT
      (SELECT count(*)::integer FROM supplements.supplement_protocol_templates) AS template_count,
      (SELECT count(*)::integer FROM supplements.supplement_protocol_template_items) AS template_item_count,
      (SELECT array_agg(ARRAY[weeks_start, weeks_end] ORDER BY sort_order)
       FROM supplements.supplement_protocol_items WHERE protocol_id = (SELECT id FROM c456_protocol)) AS protocol_weeks,
      (SELECT array_agg(event_type ORDER BY created_at)
       FROM supplements.supplement_cycle_events WHERE cycle_id = (SELECT id FROM c456_cycle)) AS transitions,
      (SELECT count(*)::integer FROM supplements.supplement_protocols
       WHERE user_id = '${OWNER}'::uuid AND source = 'legacy_cycleplanner_template') AS protocol_count_after_failure,
      (SELECT json_agg(json_build_object('source', source_kind, 'timing', timing, 'scheduleDate', schedule_date)
                       ORDER BY source_kind, timing NULLS LAST)
       FROM supplements.intake_schedule WHERE user_id = '${OWNER}'::uuid AND schedule_date = DATE '2099-01-15') AS schedule_for_day;

    SELECT set_config('request.jwt.claim.sub', '${OTHER}', true);
    CREATE TEMP TABLE c456_other AS
    SELECT
      (SELECT count(*)::integer FROM supplements.user_supplement_cycles) AS sees_cycles,
      (SELECT count(*)::integer FROM supplements.intake_schedule) AS sees_schedule;
    CREATE TEMP TABLE c456_change AS SELECT false AS changed;
    DO $$
    BEGIN
      BEGIN
        PERFORM supplements.set_supplement_cycle_status((SELECT id FROM c456_active_cycle), 'paused');
        UPDATE c456_change SET changed = true;
      EXCEPTION WHEN insufficient_privilege THEN
        UPDATE c456_change SET changed = false;
      END;
    END $$;

    RESET ROLE;
    SELECT json_build_object(
      'templateCount', (SELECT template_count FROM c456_owner),
      'templateItemCount', (SELECT template_item_count FROM c456_owner),
      'protocolWeeks', (SELECT protocol_weeks FROM c456_owner),
      'transitions', (SELECT transitions FROM c456_owner),
      'cycleCountAfterFailure', (SELECT protocol_count_after_failure FROM c456_owner),
      'scheduleForDay', (SELECT schedule_for_day FROM c456_owner),
      'otherSeesCycles', (SELECT sees_cycles FROM c456_other),
      'otherSeesSchedule', (SELECT sees_schedule FROM c456_other),
      'otherCanChangeCycle', (SELECT changed FROM c456_change),
      'functionAccess', json_build_object(
        'start', json_build_object(
          'anon', has_function_privilege('anon', 'supplements.start_supplement_cycle(uuid,text,text,text)'::regprocedure, 'EXECUTE'),
          'authenticated', has_function_privilege('authenticated', 'supplements.start_supplement_cycle(uuid,text,text,text)'::regprocedure, 'EXECUTE')
        ),
        'status', json_build_object(
          'anon', has_function_privilege('anon', 'supplements.set_supplement_cycle_status(uuid,text,text)'::regprocedure, 'EXECUTE'),
          'authenticated', has_function_privilege('authenticated', 'supplements.set_supplement_cycle_status(uuid,text,text)'::regprocedure, 'EXECUTE')
        ),
        'protocol', json_build_object(
          'anon', has_function_privilege('anon', 'supplements.create_supplement_protocol_from_template(text,uuid,date)'::regprocedure, 'EXECUTE'),
          'authenticated', has_function_privilege('authenticated', 'supplements.create_supplement_protocol_from_template(text,uuid,date)'::regprocedure, 'EXECUTE')
        ),
        'schedule', json_build_object(
          'anon', has_function_privilege('anon', 'supplements.refresh_intake_schedule(date)'::regprocedure, 'EXECUTE'),
          'authenticated', has_function_privilege('authenticated', 'supplements.refresh_intake_schedule(date)'::regprocedure, 'EXECUTE')
        )
      ),
      'weeksColumns', (SELECT array_agg(column_name ORDER BY column_name)
        FROM information_schema.columns WHERE table_schema = 'supplements' AND table_name = 'supplement_protocol_items'
          AND column_name IN ('weeks_start', 'weeks_end')),
      'boundaryComment', col_description('supplements.stack_items'::regclass,
        (SELECT attnum FROM pg_attribute WHERE attrelid = 'supplements.stack_items'::regclass AND attname = 'cycling'))
    );
    ROLLBACK;
  `)

  assert.equal(result.templateCount, 3)
  assert.equal(result.templateItemCount, 9)
  assert.deepEqual(result.protocolWeeks, [[1, 2], [3, 4], [1, 2], [3, 4]])
  assert.deepEqual(result.transitions, ['created', 'paused', 'stopped'])
  assert.equal(result.cycleCountAfterFailure, 1)
  assert.equal(result.scheduleForDay.length, 4)
  assert.deepEqual(new Set(result.scheduleForDay.map((row) => row.source)), new Set(['protocol', 'stack']))
  assert.equal(result.scheduleForDay.filter((row) => row.source === 'stack').length, 2)
  assert.equal(result.otherSeesCycles, 0)
  assert.equal(result.otherSeesSchedule, 0)
  assert.equal(result.otherCanChangeCycle, false)
  assert.deepEqual(result.functionAccess, {
    start: { anon: false, authenticated: true },
    status: { anon: false, authenticated: true },
    protocol: { anon: false, authenticated: true },
    schedule: { anon: false, authenticated: true },
  })
  assert.deepEqual(result.weeksColumns, ['weeks_end', 'weeks_start'])
  assert.match(result.boundaryComment, /laufende Zustand/i)
  assert.match(result.boundaryComment, /Verlauf mit Ereignissen/i)
})
