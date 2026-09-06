// C-419: Geld wird als eine atomare Buchung behandelt: beide Wallets und das
// Journal aendern sich zusammen; Voucher wird vor Revenue ausgegeben.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE
if (!DB || DB === 'postgres') throw new Error('C-419-Test braucht eine explizite Wegwerf-Datenbank, nie postgres.')

const BUYER = '41900000-0000-0000-0000-000000000001'
const SELLER = '41900000-0000-0000-0000-000000000002'
const OTHER = '41900000-0000-0000-0000-000000000003'
const BUYER_WALLET = '41900000-0000-0000-0000-000000000011'
const SELLER_WALLET = '41900000-0000-0000-0000-000000000012'
const OTHER_WALLET = '41900000-0000-0000-0000-000000000013'

function one<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-U', 'postgres', '-d', DB, '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()) as T
}

function psql(sql: string) {
  return spawnSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-q', '-U', 'postgres', '-d', DB, '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
}

function setupSql() {
  return `
    INSERT INTO auth.users (id, email) VALUES
      ('${BUYER}', 'c419-buyer@lumeos.local'), ('${SELLER}', 'c419-seller@lumeos.local'), ('${OTHER}', 'c419-other@lumeos.local');
    INSERT INTO marketplace.wallets (id, owner_id, owner_type, voucher_balance_cents, revenue_balance_cents, can_payout) VALUES
      ('${BUYER_WALLET}', '${BUYER}', 'creator', 500, 700, true),
      ('${SELLER_WALLET}', '${SELLER}', 'creator', 0, 0, true),
      ('${OTHER_WALLET}', '${OTHER}', 'user', 0, 0, false);
  `
}

test('C-419: alle SPEC-06-Tabellen, zwei Guthaben, neun Buchungsarten und die Preis-/Gebuehrenkataloge existieren', () => {
  const result = one<{
    tables: string[]
    transactionTypeCheck: string
    plans: Array<{ name: string; credit: number; ai: number }>
    feeRows: number
    promotionRows: number
    rls: Record<string, boolean>
  }>(`
    SELECT json_build_object(
      'tables', (SELECT json_agg(table_name ORDER BY table_name) FROM information_schema.tables WHERE table_schema = 'marketplace' AND table_type = 'BASE TABLE'),
      'transactionTypeCheck', (SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'marketplace.wallet_transactions'::regclass AND conname = 'wallet_transactions_type_check'),
      'plans', (SELECT json_agg(json_build_object('name', name, 'credit', wallet_credit_cents, 'ai', ai_credits_included) ORDER BY sort_order) FROM marketplace.subscription_plans),
      'feeRows', (SELECT count(*) FROM marketplace.fee_schedules),
      'promotionRows', (SELECT count(*) FROM marketplace.promotion_slot_catalog),
      'rls', (SELECT json_object_agg(relname, relrowsecurity) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'marketplace' AND c.relkind = 'r')
    );
  `)

  assert.deepEqual(result.tables, [
    'creators', 'fee_schedules', 'order_items', 'orders', 'product_bundles', 'product_licenses',
    'product_reviews', 'products', 'promotion_slot_catalog', 'promotion_slots', 'subscription_plans',
    'wallet_transactions', 'wallets',
  ])
  assert.equal(result.feeRows, 7)
  assert.equal(result.promotionRows, 4)
  for (const kind of ['subscription_credit', 'topup', 'purchase', 'payout', 'bonus', 'refund', 'ai_usage', 'promotion_payment', 'revenue_credit']) {
    assert.match(result.transactionTypeCheck, new RegExp(kind))
  }
  assert.deepEqual(result.plans, [
    { name: 'Lumeos Basic', credit: 999, ai: 20 },
    { name: 'Lumeos Plus', credit: 1999, ai: 50 },
    { name: 'Lumeos Pro', credit: 2999, ai: 100 },
  ])
  assert.ok(Object.values(result.rls).every(Boolean), 'jede Marketplace-Tabelle hat RLS')
})

test('C-419: eine Kaufbuchung verbraucht Voucher vor Revenue und schreibt die drei Werte atomar', () => {
  const result = one<{
    booking: { voucher: number; revenue: number; fee: number; sellerRevenue: number }
    buyer: { voucher: number; revenue: number }
    seller: number
    journal: Array<{ source: string; gross: number; fee: number; net: number }>
    noDirectAuthenticatedWrite: boolean
  }>(`
    BEGIN;
    ${setupSql()}
    CREATE TEMP TABLE c419_booking ON COMMIT DROP AS
      SELECT * FROM marketplace.book_wallet_purchase('${BUYER_WALLET}', '${SELLER_WALLET}', 900, 'digital', 'discovery', 'product');
    SELECT json_build_object(
      'booking', (SELECT json_build_object('voucher', voucher_debit_cents, 'revenue', revenue_debit_cents, 'fee', fee_cents, 'sellerRevenue', seller_revenue_cents) FROM c419_booking),
      'buyer', (SELECT json_build_object('voucher', voucher_balance_cents, 'revenue', revenue_balance_cents) FROM marketplace.wallets WHERE id = '${BUYER_WALLET}'),
      'seller', (SELECT revenue_balance_cents FROM marketplace.wallets WHERE id = '${SELLER_WALLET}'),
      'journal', (SELECT json_agg(json_build_object('source', from_balance_type, 'gross', gross_amount_cents, 'fee', fee_cents, 'net', net_amount_cents) ORDER BY created_at, id) FROM marketplace.wallet_transactions),
      'noDirectAuthenticatedWrite', (SELECT NOT has_table_privilege('authenticated', 'marketplace.wallets', 'INSERT') AND NOT has_table_privilege('authenticated', 'marketplace.wallet_transactions', 'INSERT'))
    );
    ROLLBACK;
  `)

  assert.deepEqual(result.booking, { voucher: 500, revenue: 400, fee: 180, sellerRevenue: 720 })
  assert.deepEqual(result.buyer, { voucher: 0, revenue: 300 })
  assert.equal(result.seller, 720)
  assert.deepEqual(result.journal, [
    { source: 'voucher', gross: 500, fee: 100, net: 400 },
    { source: 'revenue', gross: 400, fee: 80, net: 320 },
  ])
  assert.equal(result.noDirectAuthenticatedWrite, true)
})

test('C-419: eine abgewiesene Buchung hinterlaesst weder Teilabzug noch Journalzeile', () => {
  const result = one<{ failed: boolean; buyer: { voucher: number; revenue: number }; sellerRevenue: number; journalRows: number }>(`
    BEGIN;
    ${setupSql()}
    CREATE TEMP TABLE c419_failed ON COMMIT DROP AS SELECT false AS value;
    DO $$
    BEGIN
      PERFORM marketplace.book_wallet_purchase('${BUYER_WALLET}', '${SELLER_WALLET}', 1201, 'digital', 'discovery');
    EXCEPTION WHEN SQLSTATE '22003' THEN
      UPDATE c419_failed SET value = true;
    END $$;
    SELECT json_build_object(
      'failed', (SELECT value FROM c419_failed),
      'buyer', (SELECT json_build_object('voucher', voucher_balance_cents, 'revenue', revenue_balance_cents) FROM marketplace.wallets WHERE id = '${BUYER_WALLET}'),
      'sellerRevenue', (SELECT revenue_balance_cents FROM marketplace.wallets WHERE id = '${SELLER_WALLET}'),
      'journalRows', (SELECT count(*) FROM marketplace.wallet_transactions)
    );
    ROLLBACK;
  `)
  assert.deepEqual(result, { failed: true, buyer: { voucher: 500, revenue: 700 }, sellerRevenue: 0, journalRows: 0 })
})

test('C-419: RLS laesst eine eigene Wallet lesen und versteckt fremde Wallet und Journal in beide Richtungen', () => {
  const readProbe = psql(`
    BEGIN;
    ${setupSql()}
    INSERT INTO marketplace.wallet_transactions (transaction_group_id, from_wallet_id, to_wallet_id, gross_amount_cents, fee_cents, net_amount_cents, from_balance_type, to_balance_type, type)
    VALUES (gen_random_uuid(), '${BUYER_WALLET}', '${SELLER_WALLET}', 100, 20, 80, 'voucher', 'revenue', 'purchase');
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '${BUYER}', true);
    SELECT count(*) AS buyer_wallets FROM marketplace.wallets;
    SELECT count(*) AS buyer_journal FROM marketplace.wallet_transactions;
    SELECT set_config('request.jwt.claim.sub', '${OTHER}', true);
    SELECT count(*) AS other_wallets FROM marketplace.wallets;
    SELECT count(*) AS other_journal FROM marketplace.wallet_transactions;
    ROLLBACK;
  `)
  assert.equal(readProbe.status, 0, readProbe.stderr)
  assert.match(readProbe.stdout, /buyer_wallets\s*\n-+\n\s*1/)
  assert.match(readProbe.stdout, /buyer_journal\s*\n-+\n\s*1/)
  assert.match(readProbe.stdout, /other_wallets\s*\n-+\n\s*1/)
  assert.match(readProbe.stdout, /other_journal\s*\n-+\n\s*0/)

  const directWrite = psql(`
    BEGIN;
    ${setupSql()}
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '${BUYER}', true);
    INSERT INTO marketplace.wallets (owner_id, owner_type) VALUES ('41900000-0000-0000-0000-000000000099', 'user');
    ROLLBACK;
  `)
  assert.notEqual(directWrite.status, 0, 'Browser-Rolle darf keine Wallet direkt anlegen')
})
