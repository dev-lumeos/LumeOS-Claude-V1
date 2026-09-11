import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.LUMEOS_C465_DATABASE
if (!DB || DB === 'postgres') throw new Error('C-465-Test braucht eine Wegwerf-Datenbank, nie postgres.')
const BUYER = 'c4650000-0000-0000-0000-000000000001'
const CREATOR = 'c4650000-0000-0000-0000-000000000002'
const OTHER = 'c4650000-0000-0000-0000-000000000003'

function one<T>(sql: string): T {
  const out = execFileSync('docker', ['exec', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB, '-t', '-A', '-c', sql], { encoding: 'utf8' }).trim()
  return JSON.parse(out.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-465: Kauf liefert genau eine referenzielle Training-Zuweisung und Widerruf beendet sie', () => {
  const r = one<any>(`BEGIN;
    INSERT INTO auth.users(id,email) VALUES ('${BUYER}','buyer@test'),('${CREATOR}','creator@test'),('${OTHER}','other@test');
    INSERT INTO marketplace.creators(id,user_id,creator_type,display_name) VALUES ('c4650000-0000-0000-0000-000000000010','${CREATOR}','coach','Creator');
    INSERT INTO marketplace.products(id,creator_id,product_type,title,price_cents,duration_weeks,is_active,content) VALUES ('c4650000-0000-0000-0000-000000000020','c4650000-0000-0000-0000-000000000010','training_program','PPL',900,8,true,'{"routine":{"name":"Push","days_per_week":3}}');
    SELECT * INTO TEMP c465_purchase FROM marketplace.create_training_program_purchase('${BUYER}','c4650000-0000-0000-0000-000000000020',180);
    SELECT * INTO TEMP c465_first FROM marketplace.deliver_training_program((SELECT license_id FROM c465_purchase));
    SELECT * INTO TEMP c465_second FROM marketplace.deliver_training_program((SELECT license_id FROM c465_purchase));
    CREATE TEMP TABLE c465_visibility(subject text PRIMARY KEY, row_count integer NOT NULL) ON COMMIT DROP;
    GRANT SELECT, INSERT ON c465_visibility TO authenticated;
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub','${OTHER}',true);
    INSERT INTO c465_visibility VALUES ('other',(SELECT count(*) FROM marketplace.delivery_results));
    SELECT set_config('request.jwt.claim.sub','${BUYER}',true);
    INSERT INTO c465_visibility VALUES ('owner',(SELECT count(*) FROM marketplace.delivery_results));
    RESET ROLE;
    SELECT marketplace.revoke_training_program_license((SELECT license_id FROM c465_purchase));
    SELECT json_build_object(
      'orders',(SELECT count(*) FROM marketplace.orders), 'items',(SELECT count(*) FROM marketplace.order_items), 'licenses',(SELECT count(*) FROM marketplace.product_licenses),
      'assignments',(SELECT count(*) FROM training.program_assignments), 'same',(SELECT assignment_id FROM c465_first)=(SELECT assignment_id FROM c465_second),
      'reference',(SELECT program_assignment_id FROM marketplace.delivery_results)=(SELECT assignment_id FROM c465_first),
      'licenseActive',(SELECT is_active FROM marketplace.product_licenses), 'assignmentStatus',(SELECT status FROM training.program_assignments),
      'sessions',(SELECT count(*) FROM training.workout_sessions),
      'walletTransactions',(SELECT count(*) FROM marketplace.wallet_transactions),
      'walletCall',position('book_wallet_purchase' IN pg_get_functiondef('marketplace.create_training_program_purchase(uuid,uuid,integer)'::regprocedure)) > 0,
      'anonExec',has_function_privilege('anon','marketplace.deliver_training_program(uuid)','EXECUTE'),
      'otherRows',(SELECT row_count FROM c465_visibility WHERE subject='other'),
      'ownerRows',(SELECT row_count FROM c465_visibility WHERE subject='owner')
    ); ROLLBACK;`)
  assert.equal(r.orders,1); assert.equal(r.items,1); assert.equal(r.licenses,1); assert.equal(r.assignments,1)
  assert.equal(r.same,true); assert.equal(r.reference,true); assert.equal(r.licenseActive,false); assert.equal(r.assignmentStatus,'ended'); assert.equal(r.sessions,0)
  assert.equal(r.walletTransactions,0); assert.equal(r.walletCall,false)
  assert.equal(r.anonExec,false); assert.equal(r.otherRows,0); assert.equal(r.ownerRows,1)
})
