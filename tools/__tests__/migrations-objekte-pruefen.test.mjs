import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildExistenceSql,
  extractCreatedObjects,
  parsePsqlBoolean,
} from '../migrations-objekte-pruefen.mjs'

test('C-554: nur DDL-Klauseln liefern Objekte, keine alias.spalte-Treffer', () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS goals.real_table (id uuid);
    CREATE OR REPLACE VIEW goals.real_view AS
      SELECT bm.user_id, gp.id, p.id FROM goals.body_measurements bm
      JOIN goals.goal_phases gp ON gp.user_id = bm.user_id
      JOIN public.profiles p ON p.id = gp.user_id;
    CREATE FUNCTION goals.real_function() RETURNS void LANGUAGE plpgsql AS $$
    BEGIN
      PERFORM ds.user_id FROM nutrition.daily_summary ds;
    END;
    $$;
    CREATE TYPE goals.real_type AS ENUM ('one');
    DO $$
    BEGIN
      ALTER TABLE goals.real_table
        ADD COLUMN IF NOT EXISTS first_value numeric,
        ADD second_value text,
        ADD CONSTRAINT positive_value CHECK (first_value > 0);
    END $$;
  `

  assert.deepEqual(extractCreatedObjects(sql), [
    { kind: 'table', schema: 'goals', name: 'real_table' },
    { kind: 'view', schema: 'goals', name: 'real_view' },
    { kind: 'function', schema: 'goals', name: 'real_function' },
    { kind: 'type', schema: 'goals', name: 'real_type' },
    { kind: 'column', schema: 'goals', name: 'real_table', column: 'first_value' },
    { kind: 'column', schema: 'goals', name: 'real_table', column: 'second_value' },
  ])
})

test('C-554: quoted identifiers und materialisierte Sichten bleiben messbar', () => {
  const sql = `
    CREATE MATERIALIZED VIEW "Odd Schema"."Some View" AS SELECT 1;
    ALTER TABLE ONLY "Odd Schema"."Some Table"
      ADD COLUMN "Mixed Case" text;
  `

  assert.deepEqual(extractCreatedObjects(sql), [
    { kind: 'materialized_view', schema: 'Odd Schema', name: 'Some View' },
    { kind: 'column', schema: 'Odd Schema', name: 'Some Table', column: 'Mixed Case' },
  ])
})

test('C-554: psql-Boolesche Werte werden in beiden Ausgabeformen erkannt', () => {
  assert.equal(parsePsqlBoolean('t'), true)
  assert.equal(parsePsqlBoolean('true'), true)
  assert.equal(parsePsqlBoolean('f'), false)
  assert.equal(parsePsqlBoolean('false'), false)
})

test('C-554: die Existenzabfrage qualifiziert Objekt- und Katalogspalten', () => {
  const sql = buildExistenceSql([
    { kind: 'column', schema: 'goals', name: 'goal_phases', column: 'erfunden' },
  ])

  assert.match(sql, /c\.column_name = o\.column_name/)
  assert.match(sql, /c\.table_name = o\.object_name/)
  assert.match(sql, /CASE o\.kind/)
})
