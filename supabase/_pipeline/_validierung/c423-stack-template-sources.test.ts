// C-423/E-73: Katalogvorlagen und geteilte Nutzerstacks sind zwei Herkuenfte.
// Der Test verlangt eine Wegwerf-DB; er schreibt nie in postgres/dev.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE
if (!DB || DB === 'postgres') throw new Error('C-423-Test braucht eine explizite Wegwerf-Datenbank, nie postgres.')

const OWNER = '20000000-0000-0000-0000-000000000901'
const STRANGER = '20000000-0000-0000-0000-000000000902'
const ADMIN = '20000000-0000-0000-0000-000000000903'

function one<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim().split(/\r?\n/).at(-1)!) as T
}

function psql(sql: string) {
  return spawnSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB,
    '-c', sql,
  ], { encoding: 'utf8' })
}

test('C-423: kuratierte Schreibfunktion erzeugt eine oeffentliche Zielvorlage mit Items', () => {
  const result = one<{ source: string, visible: boolean, items: number }>(`
    BEGIN;
    SELECT set_config('request.jwt.claims', '{"sub":"${ADMIN}","app_metadata":{"role":"admin"}}', true);
    CREATE TEMP TABLE c423_curated ON COMMIT DROP AS
      SELECT supplements.create_curated_stack_template(
        'C423 Kuratiert', 'health', 'Katalogweg',
        jsonb_build_array(jsonb_build_object(
          'supplement_id', (SELECT id FROM supplements.supplements WHERE is_active ORDER BY id LIMIT 1),
          'dose_amount', 1, 'dose_unit', 'mg', 'timing', 'morning', 'frequency', 'daily', 'tier', 'good'
        ))
      ) AS id;
    SELECT json_build_object(
      'source', (SELECT source FROM supplements.stack_templates WHERE id = (SELECT id FROM c423_curated)),
      'visible', (SELECT is_public FROM supplements.stack_templates WHERE id = (SELECT id FROM c423_curated)),
      'items', (SELECT count(*)::integer FROM supplements.stack_template_items WHERE template_id = (SELECT id FROM c423_curated))
    );
    ROLLBACK;
  `)
  assert.deepEqual(result, { source: 'curated', visible: true, items: 1 })
})

test('C-423: Veroeffentlichen macht einen Nutzerstack teilbar und legt einen unabhaengigen Katalogkandidaten an', () => {
  const result = one<{
    templateSource: string, owner: string, publicVisible: boolean, candidateStatus: string,
    strangerPublic: number, strangerPrivate: number, withdrawn: boolean, withdrawnCandidates: number,
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at) VALUES
      ('${OWNER}'::uuid, 'test-user@lumeos.local', '{"provider":"email"}'::jsonb, now()),
      ('${STRANGER}'::uuid, 'c423-fremd@lumeos.local', '{"provider":"email"}'::jsonb, now())
    ON CONFLICT (id) DO NOTHING;
    CREATE TEMP TABLE c423_ctx ON COMMIT DROP AS
      WITH stack AS (
        INSERT INTO supplements.user_stacks (user_id, name, goal, source)
        VALUES ('${OWNER}'::uuid, 'C423 Nutzerstack', 'health', 'user') RETURNING id
      ), item AS (
        INSERT INTO supplements.stack_items (stack_id, supplement_id, dose, dose_unit, timing, frequency)
        SELECT id, (SELECT id FROM supplements.supplements WHERE is_active ORDER BY id LIMIT 1), 2, 'mg', 'morning', 'daily'
        FROM stack
      ) SELECT id AS stack_id FROM stack;
    SELECT set_config('request.jwt.claims', '{"sub":"${OWNER}"}', true);
    SELECT set_config('request.jwt.claim.sub', '${OWNER}', true);
    CREATE TEMP TABLE c423_publish ON COMMIT DROP AS
      SELECT * FROM supplements.publish_stack_template((SELECT stack_id FROM c423_ctx), 'C423 Gegenprobe');
    GRANT SELECT ON c423_publish TO authenticated;
    CREATE TEMP TABLE c423_private ON COMMIT DROP AS
      WITH inserted AS (
        INSERT INTO supplements.stack_templates (owner_id, name_de, goal, source, is_public)
        VALUES ('${OWNER}'::uuid, 'C423 Privat', 'health', 'user', false) RETURNING id
      ) SELECT id FROM inserted;
    GRANT SELECT ON c423_private TO authenticated;
    CREATE TEMP TABLE c423_before ON COMMIT DROP AS
      SELECT
        (SELECT is_public FROM supplements.stack_templates WHERE id = (SELECT template_id FROM c423_publish)) AS public_visible,
        (SELECT status FROM supplements.stack_curation_candidates WHERE id = (SELECT candidate_id FROM c423_publish)) AS candidate_status;
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claims', '{"sub":"${STRANGER}"}', true);
    SELECT set_config('request.jwt.claim.sub', '${STRANGER}', true);
    CREATE TEMP TABLE c423_seen ON COMMIT DROP AS
      SELECT
        (SELECT count(*)::integer FROM supplements.stack_templates WHERE id = (SELECT template_id FROM c423_publish)) AS public_rows,
            (SELECT count(*)::integer FROM supplements.stack_templates WHERE id = (SELECT id FROM c423_private)) AS private_rows;
    RESET ROLE;
    SELECT set_config('request.jwt.claims', '{"sub":"${OWNER}"}', true);
    SELECT set_config('request.jwt.claim.sub', '${OWNER}', true);
    CREATE TEMP TABLE c423_withdraw ON COMMIT DROP AS
      SELECT supplements.withdraw_stack_template((SELECT stack_id FROM c423_ctx)) AS template_id;
    SELECT json_build_object(
      'templateSource', (SELECT source FROM supplements.stack_templates WHERE id = (SELECT template_id FROM c423_publish)),
      'owner', (SELECT owner_id::text FROM supplements.stack_templates WHERE id = (SELECT template_id FROM c423_publish)),
      'publicVisible', (SELECT public_visible FROM c423_before),
      'candidateStatus', (SELECT candidate_status FROM c423_before),
      'strangerPublic', (SELECT public_rows FROM c423_seen),
      'strangerPrivate', (SELECT private_rows FROM c423_seen),
      'withdrawn', NOT (SELECT is_public FROM supplements.stack_templates WHERE id = (SELECT template_id FROM c423_withdraw)),
      'withdrawnCandidates', (SELECT count(*)::integer FROM supplements.stack_curation_candidates WHERE source_template_id = (SELECT template_id FROM c423_withdraw) AND status = 'withdrawn')
    );
    ROLLBACK;
  `)
  assert.deepEqual(result, {
    templateSource: 'user', owner: OWNER, publicVisible: true, candidateStatus: 'pending',
    strangerPublic: 1, strangerPrivate: 0, withdrawn: true, withdrawnCandidates: 1,
  })
})

test('C-423: eine Annahme erzeugt eine getrennte kuratierte Kopie, nie einen fremden Nutzerstack', () => {
  const result = one<{ candidate: string, curated: string, originalOwner: string, copies: number }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at)
    VALUES ('${OWNER}'::uuid, 'test-user@lumeos.local', '{"provider":"email"}'::jsonb, now())
    ON CONFLICT (id) DO NOTHING;
    CREATE TEMP TABLE c423_stack ON COMMIT DROP AS
      WITH inserted AS (
        INSERT INTO supplements.user_stacks (user_id, name, goal, source)
        VALUES ('${OWNER}'::uuid, 'C423 Kuration', 'health', 'user') RETURNING id
      ) SELECT id FROM inserted;
    INSERT INTO supplements.stack_items (stack_id, supplement_id, dose, dose_unit, timing, frequency)
    SELECT id, (SELECT id FROM supplements.supplements WHERE is_active ORDER BY id LIMIT 1), 1, 'mg', 'morning', 'daily'
    FROM c423_stack;
    SELECT set_config('request.jwt.claims', '{"sub":"${OWNER}"}', true);
    SELECT set_config('request.jwt.claim.sub', '${OWNER}', true);
    CREATE TEMP TABLE c423_publish ON COMMIT DROP AS
      SELECT template_id, candidate_id
      FROM supplements.publish_stack_template((SELECT id FROM c423_stack), 'Katalogpruefung');
    SELECT set_config('request.jwt.claims', '{"sub":"${ADMIN}","app_metadata":{"role":"admin"}}', true);
    CREATE TEMP TABLE c423_decision ON COMMIT DROP AS
      SELECT supplements.decide_stack_curation_candidate((SELECT candidate_id FROM c423_publish), 'accepted', 'fachlich geprueft') AS id;
    SELECT json_build_object(
      'candidate', (SELECT status FROM supplements.stack_curation_candidates WHERE id = (SELECT candidate_id FROM c423_publish)),
      'curated', (SELECT source FROM supplements.stack_templates WHERE id = (SELECT id FROM c423_decision)),
      'originalOwner', (SELECT user_id::text FROM supplements.user_stacks WHERE id = (SELECT id FROM c423_stack)),
      'copies', (SELECT count(*)::integer FROM supplements.stack_template_items WHERE template_id = (SELECT id FROM c423_decision))
    );
    ROLLBACK;
  `)
  assert.deepEqual(result, { candidate: 'accepted', curated: 'curated', originalOwner: OWNER, copies: 1 })
})
