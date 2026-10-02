// G-558: Der atomare Phasenstart traegt die gewaehlte Strategie und leitet
// deren Rate ab. Diese Gegenprobe wird als eigener Schritt aus kette.json
// ausgefuehrt; sie ist damit nicht nur eine abgelegte _validierung-Datei.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE

if (!db || db === 'postgres') {
  throw new Error('G-558 braucht eine Wegwerf-Datenbank, nie postgres.')
}

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()

  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('G-558 A1/A2: Strategie, Katalograte und persoenlicher Override kommen atomar an', () => {
  const result = one<{
    arguments: string
    catalogCode: string
    catalogRate: number
    overrideCode: string
    overrideRate: number
    overrideKcal: number
    catalogKcal: number
    jsonFactorKcal: number
    overrideVsCatalogKcal: number
    overrideVsJsonFactorKcal: number
    unknownCodeMessage: string
  }>(`
    BEGIN;

    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at)
    VALUES (
      '55800000-0000-0000-0000-000000000001',
      'g558-probe@lumeos.local',
      '{"provider":"email","providers":["email"]}'::jsonb,
      now()
    );

    INSERT INTO public.profiles (
      id, birth_date, biological_sex, height_cm, body_weight_kg,
      activity_level, experience_level
    ) VALUES (
      '55800000-0000-0000-0000-000000000001',
      DATE '1990-05-17', 'male', 182, 81.4, 'moderate', 'pro'
    )
    ON CONFLICT (id) DO UPDATE SET
      birth_date = EXCLUDED.birth_date,
      biological_sex = EXCLUDED.biological_sex,
      height_cm = EXCLUDED.height_cm,
      body_weight_kg = EXCLUDED.body_weight_kg,
      activity_level = EXCLUDED.activity_level,
      experience_level = EXCLUDED.experience_level;

    INSERT INTO goals.user_goals (
      id, user_id, goal_type, title, gueltig_ab, priority
    ) VALUES
      ('55800000-0000-0000-0000-000000000101',
       '55800000-0000-0000-0000-000000000001',
       'body_composition', 'G-558 Katalograte', DATE '2099-01-01', 1),
      ('55800000-0000-0000-0000-000000000102',
       '55800000-0000-0000-0000-000000000001',
       'body_composition', 'G-558 Override', DATE '2099-02-01', 2),
      ('55800000-0000-0000-0000-000000000103',
       '55800000-0000-0000-0000-000000000001',
       'body_composition', 'G-558 unbekannt', DATE '2099-03-01', 3);

    INSERT INTO goals.body_measurements (
      user_id, measurement_date, measurement_time, weight_kg
    ) VALUES (
      '55800000-0000-0000-0000-000000000001',
      DATE '2099-02-01', TIME '08:00', 83.74
    );

    CREATE TEMP TABLE g558_result (
      fall text PRIMARY KEY,
      wert text NOT NULL
    ) ON COMMIT DROP;
    GRANT SELECT, INSERT ON g558_result TO authenticated;

    SELECT set_config(
      'request.jwt.claims',
      jsonb_build_object(
        'sub', '55800000-0000-0000-0000-000000000001',
        'role', 'authenticated'
      )::text,
      true
    );
    SET LOCAL ROLE authenticated;

    SELECT goals.goal_phase_start(
      p_phase_type := 'lean_bulk',
      p_goal_id := '55800000-0000-0000-0000-000000000101',
      p_gueltig_ab := DATE '2099-01-01',
      p_strategie_code := 'lean_bulk'
    );

    SELECT goals.goal_phase_start(
      p_phase_type := 'lean_bulk',
      p_goal_id := '55800000-0000-0000-0000-000000000102',
      p_gueltig_ab := DATE '2099-02-01',
      p_parameters := '{"tdee_modifier":0.20}'::jsonb,
      p_zielrate_pct_kg_woche := 0.40,
      p_strategie_code := 'lean_bulk'
    );

    DO $probe$
    BEGIN
      BEGIN
        PERFORM goals.goal_phase_start(
          p_phase_type := 'lean_bulk',
          p_goal_id := '55800000-0000-0000-0000-000000000103',
          p_gueltig_ab := DATE '2099-03-01',
          p_zielrate_pct_kg_woche := 0.25,
          p_strategie_code := 'erfundene_strategie'
        );
        INSERT INTO g558_result VALUES ('unknown_code', 'angenommen');
      EXCEPTION WHEN foreign_key_violation THEN
        INSERT INTO g558_result VALUES ('unknown_code', SQLERRM);
      END;
    END
    $probe$;

    RESET ROLE;

    -- Beide Zielphasen sind am Stichtag aktiv. G-558 prueft bewusst den
    -- persoenlichen Override des zweiten Ziels ueber den zielbezogenen Vertrag.
    WITH calculated AS (
      SELECT z.*
      FROM goals.berechne_zielwerte(
        '55800000-0000-0000-0000-000000000001',
        '55800000-0000-0000-0000-000000000102',
        DATE '2099-02-15'
      ) z
    ), phases AS (
      SELECT
        max(strategie_code) FILTER (
          WHERE goal_id = '55800000-0000-0000-0000-000000000101'
        ) AS catalog_code,
        max(zielrate_pct_kg_woche) FILTER (
          WHERE goal_id = '55800000-0000-0000-0000-000000000101'
        ) AS catalog_rate,
        max(strategie_code) FILTER (
          WHERE goal_id = '55800000-0000-0000-0000-000000000102'
        ) AS override_code,
        max(zielrate_pct_kg_woche) FILTER (
          WHERE goal_id = '55800000-0000-0000-0000-000000000102'
        ) AS override_rate
      FROM goals.goal_phases
      WHERE user_id = '55800000-0000-0000-0000-000000000001'
    )
    SELECT json_build_object(
      'arguments', pg_get_function_arguments(
        'goals.goal_phase_start(text,uuid,date,date,text,jsonb,numeric,text)'::regprocedure
      ),
      'catalogCode', phases.catalog_code,
      'catalogRate', phases.catalog_rate,
      'overrideCode', phases.override_code,
      'overrideRate', phases.override_rate,
      'overrideKcal', calculated.kcal,
      'catalogKcal', round(calculated.tdee + goals.kcal_delta_aus_zielrate(0.25, 83.74), 1),
      'jsonFactorKcal', round(calculated.tdee * 1.20, 1),
      'overrideVsCatalogKcal', round(
        calculated.kcal - (calculated.tdee + goals.kcal_delta_aus_zielrate(0.25, 83.74)),
        1
      ),
      'overrideVsJsonFactorKcal', round(abs(calculated.kcal - calculated.tdee * 1.20), 1),
      'unknownCodeMessage', (
        SELECT wert FROM g558_result WHERE fall = 'unknown_code'
      )
    )
    FROM calculated CROSS JOIN phases;

    ROLLBACK;
  `)

  assert.match(result.arguments, /p_strategie_code text DEFAULT NULL::text$/)
  assert.equal(result.catalogCode, 'lean_bulk')
  assert.equal(result.catalogRate, 0.25)
  assert.equal(result.overrideCode, 'lean_bulk')
  assert.equal(result.overrideRate, 0.4)
  assert.equal(result.overrideKcal, 2600.3)
  assert.equal(result.catalogKcal, 2462.1)
  assert.equal(result.jsonFactorKcal, 2678.2)
  assert.equal(result.overrideVsCatalogKcal, 138.2)
  assert.equal(result.overrideVsJsonFactorKcal, 77.9)
  assert.equal(
    result.unknownCodeMessage,
    'insert or update on table "goal_phases" violates foreign key constraint "goal_phases_strategie_code_fkey"',
  )
})
