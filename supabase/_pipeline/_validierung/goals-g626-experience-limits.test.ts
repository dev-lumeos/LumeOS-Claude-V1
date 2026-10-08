// G-626: nur auf einer Wegwerf-Datenbank, Schreibproben mit ROLLBACK.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-626 braucht eine Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  const start = output.indexOf('{')
  if (start < 0) throw new Error(`G-626 Probe ohne JSON: ${output}`)
  return JSON.parse(output.slice(start)) as T
}

type Finding = { key: string; art: 'sperre' | 'warnung' }
function has(rows: Finding[], key: string, art: Finding['art']): boolean {
  return rows.some(row => row.key === key && row.art === art)
}

test('G-626: vier Datenzeilen, alter JSON-Mindestgrad entfernt, Coach-Pflicht erhalten', () => {
  const got = one<{ grades: string[]; legacyKeys: number; coachApproval: string; oldRateRules: number }>(`
    SELECT json_build_object(
      'grades', (SELECT json_agg(experience_level ORDER BY grade_rank)
        FROM goals.experience_goal_limits),
      'legacyKeys', (SELECT count(*) FROM goals.goal_strategies
        WHERE requirements ? 'min_experience'),
      'coachApproval', (SELECT requirements->>'coach_approval'
        FROM goals.goal_strategies WHERE code='contest_prep'),
      'oldRateRules', (SELECT count(*) FROM goals.phase_rate_rules)
    );
  `)
  assert.deepEqual(got.grades, ['beginner', 'advanced', 'pro', 'elite'])
  assert.equal(got.legacyKeys, 0)
  assert.equal(got.coachApproval, 'true')
  assert.equal(got.oldRateRules, 0)
})

test('G-626: die fuenf Gradfaelle aus dem Entwurf und Standard-Gegenprobe', () => {
  const got = one<Record<string, Finding[]>>(`
    WITH faelle(name, grad, richtung, start_kg, ziel_kg, bis, programm, eigen) AS (
      VALUES
        ('beginnerModerate', 'beginner', 'abnehmen', 85::numeric, 80::numeric,
          DATE '2026-12-31', 'moderate_cut', NULL::jsonb),
        ('advancedMini', 'advanced', 'abnehmen', 85::numeric, 82.5::numeric,
          DATE '2026-10-29', 'mini_cut', NULL::jsonb),
        ('advanced22Weeks', 'advanced', 'abnehmen', 85::numeric, 78::numeric,
          DATE '2027-03-11', 'lose', NULL::jsonb),
        ('proTwelveTenths', 'pro', 'abnehmen', 85::numeric, 80::numeric,
          DATE '2026-11-19', NULL::text,
          '{"tempo_pct_kg_woche":1.2,"protein_g_kg":2.2,"fett_g_kg":0.4}'::jsonb),
        ('wrongDirection', 'elite', 'abnehmen', 85::numeric, 90::numeric,
          DATE '2026-12-31', 'lose', NULL::jsonb),
        ('beginnerStandard', 'beginner', 'abnehmen', 85::numeric, 80::numeric,
          DATE '2026-12-31', 'lose', NULL::jsonb)
    )
    SELECT json_object_agg(name, finds) FROM (
      SELECT f.name, coalesce(json_agg(json_build_object('key', g.schluessel,
        'art', g.art) ORDER BY g.schluessel) FILTER (WHERE g.schluessel IS NOT NULL),
        '[]'::json) finds
      FROM faelle f
      LEFT JOIN LATERAL goals.ziel_grenzen_pruefen(f.grad, f.richtung,
        f.start_kg, f.ziel_kg, DATE '2026-10-08', f.bis,
        f.programm, f.eigen, 'male', 180, 2800) g ON true
      GROUP BY f.name
    ) x;
  `)
  assert.ok(has(got.beginnerModerate, 'programm_mindestgrad', 'sperre'))
  assert.ok(has(got.advancedMini, 'tempo', 'warnung'))
  assert.equal(got.advancedMini.filter(x => x.key.startsWith('programm_warnung_')).length, 2)
  assert.ok(!got.advancedMini.some(x => x.art === 'sperre'))
  assert.ok(has(got.advanced22Weeks, 'diaetdauer', 'sperre'))
  assert.ok(has(got.proTwelveTenths, 'tempo', 'warnung'))
  assert.ok(has(got.proTwelveTenths, 'fett_eigene_werte', 'warnung'))
  assert.ok(!got.proTwelveTenths.some(x => x.art === 'sperre'))
  assert.ok(has(got.wrongDirection, 'zielrichtung', 'sperre'))
  assert.deepEqual(got.beginnerStandard, [])
})

test('G-626: BMI, Kalorien nach Geschlecht und Pro/Elite-Grenzen', () => {
  const got = one<{ advBmi: Finding[]; beginnerKcal: Finding[]; advKcal: Finding[]; proFemale: Finding[]; missingOwn: Finding[] }>(`
    SELECT json_build_object(
      'advBmi', (SELECT coalesce(json_agg(json_build_object('key', schluessel, 'art', art)), '[]'::json)
        FROM goals.ziel_grenzen_pruefen('advanced','abnehmen',60,52,
          DATE '2026-10-08',DATE '2026-12-31','lose',NULL,'male',175,2300)),
      'beginnerKcal', (SELECT coalesce(json_agg(json_build_object('key', schluessel, 'art', art)), '[]'::json)
        FROM goals.ziel_grenzen_pruefen('beginner','abnehmen',85,80,
          DATE '2026-10-08',DATE '2026-12-31','lose',NULL,'male',180,1800)),
      'advKcal', (SELECT coalesce(json_agg(json_build_object('key', schluessel, 'art', art)), '[]'::json)
        FROM goals.ziel_grenzen_pruefen('advanced','abnehmen',85,80,
          DATE '2026-10-08',DATE '2026-12-31','lose',NULL,'male',180,1800)),
      'proFemale', (SELECT coalesce(json_agg(json_build_object('key', schluessel, 'art', art)), '[]'::json)
        FROM goals.ziel_grenzen_pruefen('pro','abnehmen',85,80,
          DATE '2026-10-08',DATE '2026-12-31',NULL,
          '{"tempo_pct_kg_woche":0.5,"protein_g_kg":2.2,"fett_g_kg":0.6,"kcal":1100}'::jsonb,
          'female',180,NULL)),
      'missingOwn', (SELECT coalesce(json_agg(json_build_object('key', schluessel, 'art', art)), '[]'::json)
        FROM goals.ziel_grenzen_pruefen('pro','abnehmen',85,80,
          DATE '2026-10-08',DATE '2026-12-31',NULL,
          '{"tempo_pct_kg_woche":0.5,"protein_g_kg":2.2}'::jsonb,
          'male',180,2800))
    );
  `)
  assert.ok(has(got.advBmi, 'ziel_bmi', 'sperre'))
  assert.ok(has(got.beginnerKcal, 'kalorien', 'sperre'))
  assert.ok(has(got.advKcal, 'kalorien', 'warnung'))
  assert.ok(has(got.proFemale, 'kalorien', 'warnung'))
  assert.ok(!got.proFemale.some(x => x.art === 'sperre'))
  assert.ok(has(got.missingOwn, 'eigene_werte_fehlen', 'sperre'))
})

test('G-626: Zielgewicht gegen Abnehmen oder Aufbauen sperrt jeden Grad', () => {
  const got = one<{ blocked: number; cases: number }>(`
    WITH faelle AS (
      SELECT l.experience_level, r.richtung, r.ziel
      FROM goals.experience_goal_limits l
      CROSS JOIN (VALUES ('abnehmen',90::numeric),('aufbauen',80::numeric)) r(richtung,ziel)
    )
    SELECT json_build_object('cases', count(*), 'blocked', count(*) FILTER (
      WHERE EXISTS (
        SELECT 1 FROM goals.ziel_grenzen_pruefen(
          f.experience_level,f.richtung,85,f.ziel,DATE '2026-10-08',
          DATE '2026-12-31',CASE f.richtung WHEN 'abnehmen' THEN 'lose' ELSE 'gain' END,
          NULL,'male',180,2800)
        WHERE schluessel='zielrichtung' AND art='sperre'
      ))) FROM faelle f;
  `)
  assert.equal(got.cases, 8)
  assert.equal(got.blocked, 8)
})

test('G-626: Phasenschreibweg sperrt und verlangt genau die Warnschluessel der Vorschau', () => {
  const got = one<{ events: Array<{ name: string; message: string }>; phases: number; role: string; confirmed: string[] }>(`
    BEGIN;
    INSERT INTO auth.users (id,email,raw_app_meta_data,created_at)
    VALUES ('62600000-0000-0000-0000-000000000001','g626@example.test','{}'::jsonb,now());
    INSERT INTO public.profiles (id,birth_date,biological_sex,height_cm,
      body_weight_kg,activity_level,experience_level)
    VALUES ('62600000-0000-0000-0000-000000000001',DATE '1990-01-01',
      'male',180,85,'light','advanced')
    ON CONFLICT (id) DO UPDATE SET birth_date=excluded.birth_date,
      biological_sex=excluded.biological_sex,height_cm=excluded.height_cm,
      body_weight_kg=excluded.body_weight_kg,activity_level=excluded.activity_level,
      experience_level=excluded.experience_level;
    INSERT INTO goals.user_goals (id,user_id,goal_type,subtype,title,
      target_value,target_unit,start_value,gueltig_ab,target_date,status,priority)
    VALUES ('62600000-0000-0000-0000-000000000101',
      '62600000-0000-0000-0000-000000000001','body_composition','cut',
      'Mini Cut',82.5,'kg',85,DATE '2026-10-08',DATE '2026-10-29','active',1);
    SELECT set_config('request.jwt.claim.sub',
      '62600000-0000-0000-0000-000000000001', true);
    CREATE TEMP TABLE g626_events (name text, message text) ON COMMIT DROP;
    GRANT SELECT, INSERT ON g626_events TO authenticated;
    SET LOCAL ROLE authenticated;
    DO $probe$
    DECLARE v_warnings jsonb;
    BEGIN
      BEGIN
        PERFORM goals.goal_phase_start('mini_cut',
          '62600000-0000-0000-0000-000000000101',
          DATE '2026-10-08',DATE '2026-10-29',NULL,'{}'::jsonb,-1,'mini_cut');
        INSERT INTO g626_events VALUES ('without_confirmation','angenommen');
      EXCEPTION WHEN check_violation THEN
        INSERT INTO g626_events VALUES ('without_confirmation',SQLERRM);
      END;
      SELECT coalesce(jsonb_agg(schluessel ORDER BY schluessel), '[]'::jsonb)
      INTO v_warnings
      FROM goals.ziel_grenzen_pruefen('advanced','abnehmen',85,82.5,
        DATE '2026-10-08',DATE '2026-10-29','mini_cut',NULL,'male',180,
        (SELECT tdee FROM goals.tdee_basis_am(
          '62600000-0000-0000-0000-000000000001',DATE '2026-10-08')),-1)
      WHERE art='warnung';
      PERFORM goals.goal_phase_start('mini_cut',
        '62600000-0000-0000-0000-000000000101',
        DATE '2026-10-08',DATE '2026-10-29',NULL,
        jsonb_build_object('g626_confirmed_warnings',v_warnings),-1,'mini_cut');
      INSERT INTO g626_events VALUES ('confirmed','angenommen');
      BEGIN
        UPDATE goals.goal_phases SET parameters='{}'::jsonb
        WHERE goal_id='62600000-0000-0000-0000-000000000101';
        INSERT INTO g626_events VALUES ('removed_confirmation','angenommen');
      EXCEPTION WHEN check_violation THEN
        INSERT INTO g626_events VALUES ('removed_confirmation',SQLERRM);
      END;
      BEGIN
        UPDATE goals.goal_phases SET zielrate_pct_kg_woche=-1.2
        WHERE goal_id='62600000-0000-0000-0000-000000000101';
        INSERT INTO g626_events VALUES ('too_fast','angenommen');
      EXCEPTION WHEN check_violation THEN
        INSERT INTO g626_events VALUES ('too_fast',SQLERRM);
      END;
      BEGIN
        UPDATE goals.user_goals SET target_value=90
        WHERE id='62600000-0000-0000-0000-000000000101';
        INSERT INTO g626_events VALUES ('wrong_target_update','angenommen');
      EXCEPTION WHEN check_violation THEN
        INSERT INTO g626_events VALUES ('wrong_target_update',SQLERRM);
      END;
    END $probe$;
    SELECT json_build_object(
      'events', (SELECT json_agg(json_build_object('name',name,'message',message)
        ORDER BY name) FROM g626_events),
      'phases', (SELECT count(*) FROM goals.goal_phases
        WHERE goal_id='62600000-0000-0000-0000-000000000101'),
      'role', (SELECT goal_role FROM goals.user_goals
        WHERE id='62600000-0000-0000-0000-000000000101'),
      'confirmed', (SELECT jsonb_agg(value ORDER BY value)
        FROM goals.goal_phases gp,
        jsonb_array_elements_text(gp.parameters->'g626_confirmed_warnings') value
        WHERE gp.goal_id='62600000-0000-0000-0000-000000000101')
    );
    ROLLBACK;
  `)
  const events = Object.fromEntries(got.events.map(e => [e.name, e.message]))
  assert.match(events.without_confirmation, /^G626_CONFIRM:/)
  assert.equal(events.confirmed, 'angenommen')
  assert.match(events.removed_confirmation, /^G626_CONFIRM:/)
  assert.match(events.too_fast, /^G626_BLOCK:/)
  assert.match(events.wrong_target_update, /^G626_BLOCK:.*zielrichtung/)
  assert.equal(got.phases, 1)
  assert.equal(got.role, 'controlling')
  assert.equal(got.confirmed.length, 3)
})
