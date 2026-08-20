#!/usr/bin/env node
// C-131: Bruecke zwischen LumeOS-Supplementkatalog, F-05-Kandidaten
// und Kimi-Substanzen. Es wird kein Katalog zusammengefuehrt; gemeinsame
// Aliase machen nur messbar, welche Eintraege zueinander passen.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'

const KIMI_BASE = 'backup/kimi-research/Kimi_Agent/supplement_performance_database/data'
const KIMI_ALIASES = path.join(KIMI_BASE, 'indexes', 'aliases.json')
const KIMI_INDEX = path.join(KIMI_BASE, 'indexes', 'ingredient_index.json')
const LOCAL_CATALOG = 'supabase/_pipeline/daten/supplement-katalog.json'
const F05_CATALOG = 'supabase/_pipeline/daten/substanz-katalog.json'

type JsonObject = Record<string, unknown>
type AliasRow = {
  catalog: 'lumeos_supplement_catalog' | 'f05_substance_candidate' | 'kimi_substance'
  entity_id: string
  entity_label: string
  alias: string
  alias_folded?: string
  source: string
  source_ref: string
  raw: JsonObject
}

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

function readJson(file: string): JsonObject {
  if (!fs.existsSync(file)) fail(`${file} fehlt. C-131 braucht die vorhandenen Datenquellen.`)
  return JSON.parse(fs.readFileSync(file, 'utf8')) as JsonObject
}

function fold(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function add(rows: AliasRow[], row: AliasRow): void {
  const aliasFolded = fold(row.alias)
  if (!row.entity_id || !row.alias || !aliasFolded) return
  rows.push({ ...row, alias_folded: aliasFolded })
}

const local = readJson(LOCAL_CATALOG) as JsonObject & { supplements?: JsonObject[] }
const f05 = readJson(F05_CATALOG) as JsonObject & { substances?: JsonObject[] }
const kimiAliases = readJson(KIMI_ALIASES) as Record<string, string>
const kimiIndex = readJson(KIMI_INDEX) as Record<string, JsonObject>

if (!Array.isArray(local.supplements) || local.supplements.length !== 44) {
  fail(`${LOCAL_CATALOG}: 44 Supplements erwartet`)
}
if (!Array.isArray(f05.substances) || f05.substances.length !== 320) {
  fail(`${F05_CATALOG}: 320 Substanzkandidaten erwartet`)
}
if (Object.keys(kimiIndex).length !== 237) {
  fail(`${KIMI_INDEX}: 237 Kimi-Substanzen erwartet`)
}

const rows: AliasRow[] = []

for (const item of local.supplements) {
  const slug = String(item.slug ?? '')
  const label = String(item.name ?? slug)
  for (const alias of [item.slug, item.name, item.name_de, item.name_en]) {
    if (alias) {
      add(rows, {
        catalog: 'lumeos_supplement_catalog',
        entity_id: slug,
        entity_label: label,
        alias: String(alias),
        source: 'lumeos_supplement_catalog',
        source_ref: `${LOCAL_CATALOG}#${slug}`,
        raw: item,
      })
    }
  }
}

for (const item of f05.substances) {
  const name = String(item.name ?? '')
  add(rows, {
    catalog: 'f05_substance_candidate',
    entity_id: name,
    entity_label: name,
    alias: name,
    source: 'f05_substance_catalog',
    source_ref: `${F05_CATALOG}#${name}`,
    raw: item,
  })
}

for (const [id, item] of Object.entries(kimiIndex)) {
  const label = String(item.name ?? id)
  add(rows, {
    catalog: 'kimi_substance',
    entity_id: id,
    entity_label: label,
    alias: label,
    source: 'kimi_ingredient_index',
    source_ref: `${KIMI_INDEX}#${id}`,
    raw: item,
  })
}

for (const [alias, id] of Object.entries(kimiAliases)) {
  const item = kimiIndex[id] ?? {}
  add(rows, {
    catalog: 'kimi_substance',
    entity_id: id,
    entity_label: String(item.name ?? id),
    alias,
    source: 'kimi_aliases',
    source_ref: `${KIMI_ALIASES}#${alias}`,
    raw: { alias, target_id: id },
  })
}

const seen = new Set<string>()
const unique = rows.filter(row => {
  const key = [row.catalog, row.entity_id, fold(row.alias), row.source_ref].join('|')
  if (seen.has(key)) return false
  seen.add(key)
  return true
})

const payload = unique.map(row => csvCell(JSON.stringify(row))).join('\n')
const sql = `
BEGIN;

CREATE TABLE IF NOT EXISTS supplements.substance_aliases (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog        TEXT NOT NULL CHECK (catalog IN (
                   'lumeos_supplement_catalog',
                   'f05_substance_candidate',
                   'kimi_substance'
                 )),
  entity_id      TEXT NOT NULL CHECK (btrim(entity_id) <> ''),
  entity_label   TEXT NOT NULL CHECK (btrim(entity_label) <> ''),
  alias          TEXT NOT NULL CHECK (btrim(alias) <> ''),
  alias_folded   TEXT NOT NULL CHECK (btrim(alias_folded) <> ''),
  source         TEXT NOT NULL CHECK (btrim(source) <> ''),
  source_ref     TEXT NOT NULL CHECK (btrim(source_ref) <> ''),
  raw            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (catalog, entity_id, alias_folded, source_ref)
);

CREATE INDEX IF NOT EXISTS substance_aliases_folded_idx
  ON supplements.substance_aliases(alias_folded);
CREATE INDEX IF NOT EXISTS substance_aliases_entity_idx
  ON supplements.substance_aliases(catalog, entity_id);

DROP TRIGGER IF EXISTS substance_aliases_touch_updated_at
  ON supplements.substance_aliases;
CREATE TRIGGER substance_aliases_touch_updated_at
  BEFORE UPDATE ON supplements.substance_aliases
  FOR EACH ROW EXECUTE FUNCTION supplements.touch_updated_at();

ALTER TABLE supplements.substance_aliases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS substance_aliases_select ON supplements.substance_aliases;
CREATE POLICY substance_aliases_select
  ON supplements.substance_aliases FOR SELECT TO authenticated USING (true);

GRANT SELECT ON supplements.substance_aliases TO authenticated;
GRANT ALL ON supplements.substance_aliases TO service_role;

CREATE TEMP TABLE tmp_substance_aliases (
  payload JSONB NOT NULL
) ON COMMIT DROP;

\\copy tmp_substance_aliases(payload) FROM STDIN WITH (FORMAT csv)
${payload}
\\.

DELETE FROM supplements.substance_aliases
WHERE source IN ('lumeos_supplement_catalog', 'f05_substance_catalog', 'kimi_ingredient_index', 'kimi_aliases');

INSERT INTO supplements.substance_aliases (
  catalog, entity_id, entity_label, alias, alias_folded, source, source_ref, raw
)
SELECT
  payload->>'catalog',
  payload->>'entity_id',
  payload->>'entity_label',
  payload->>'alias',
  payload->>'alias_folded',
  payload->>'source',
  payload->>'source_ref',
  payload->'raw'
FROM tmp_substance_aliases
ON CONFLICT (catalog, entity_id, alias_folded, source_ref) DO UPDATE SET
  entity_label = EXCLUDED.entity_label,
  alias = EXCLUDED.alias,
  source = EXCLUDED.source,
  raw = EXCLUDED.raw,
  updated_at = now();

CREATE OR REPLACE VIEW supplements.substance_alias_matches
WITH (security_invoker = true)
AS
SELECT DISTINCT
  LEAST(a.catalog, b.catalog) AS catalog_a,
  CASE WHEN a.catalog <= b.catalog THEN a.entity_id ELSE b.entity_id END AS entity_id_a,
  CASE WHEN a.catalog <= b.catalog THEN a.entity_label ELSE b.entity_label END AS entity_label_a,
  GREATEST(a.catalog, b.catalog) AS catalog_b,
  CASE WHEN a.catalog <= b.catalog THEN b.entity_id ELSE a.entity_id END AS entity_id_b,
  CASE WHEN a.catalog <= b.catalog THEN b.entity_label ELSE a.entity_label END AS entity_label_b,
  a.alias_folded,
  CASE WHEN a.catalog <= b.catalog THEN a.alias ELSE b.alias END AS alias_a,
  CASE WHEN a.catalog <= b.catalog THEN b.alias ELSE a.alias END AS alias_b
FROM supplements.substance_aliases a
JOIN supplements.substance_aliases b
  ON b.alias_folded = a.alias_folded
 AND b.catalog <> a.catalog
 AND (a.catalog, a.entity_id) < (b.catalog, b.entity_id);

GRANT SELECT ON supplements.substance_alias_matches TO authenticated;
GRANT ALL ON supplements.substance_alias_matches TO service_role;

CREATE OR REPLACE VIEW supplements.stack_item_substance_matches
WITH (security_invoker = true)
AS
SELECT DISTINCT
  us.user_id,
  si.id AS stack_item_id,
  si.is_active,
  sc.slug AS supplement_slug,
  sc.name AS supplement_name,
  CASE
    WHEN m.catalog_a = 'kimi_substance' THEN m.entity_id_a
    ELSE m.entity_id_b
  END AS kimi_substance_id,
  CASE
    WHEN m.catalog_a = 'kimi_substance' THEN m.entity_label_a
    ELSE m.entity_label_b
  END AS kimi_substance_name,
  m.alias_folded,
  CASE
    WHEN m.catalog_a = 'lumeos_supplement_catalog' THEN m.alias_a
    ELSE m.alias_b
  END AS local_alias,
  CASE
    WHEN m.catalog_a = 'kimi_substance' THEN m.alias_a
    ELSE m.alias_b
  END AS kimi_alias
FROM supplements.user_stacks us
JOIN supplements.stack_items si ON si.stack_id = us.id
JOIN supplements.supplement_catalog sc ON sc.id = si.supplement_id
JOIN supplements.substance_alias_matches m
  ON (
    m.catalog_a = 'lumeos_supplement_catalog'
    AND m.catalog_b = 'kimi_substance'
    AND m.entity_id_a = sc.slug
  ) OR (
    m.catalog_a = 'kimi_substance'
    AND m.catalog_b = 'lumeos_supplement_catalog'
    AND m.entity_id_b = sc.slug
  );

GRANT SELECT ON supplements.stack_item_substance_matches TO authenticated;
GRANT ALL ON supplements.stack_item_substance_matches TO service_role;

DO $$
DECLARE
  v_aliases integer;
  v_kimi integer;
  v_local_kimi integer;
  v_f05_kimi integer;
  v_local_f05 integer;
BEGIN
  SELECT count(*) INTO v_aliases FROM supplements.substance_aliases;
  SELECT count(DISTINCT entity_id) INTO v_kimi
  FROM supplements.substance_aliases
  WHERE catalog = 'kimi_substance';
  SELECT count(*) INTO v_local_kimi
  FROM supplements.substance_alias_matches
  WHERE (catalog_a = 'kimi_substance' AND catalog_b = 'lumeos_supplement_catalog')
     OR (catalog_a = 'lumeos_supplement_catalog' AND catalog_b = 'kimi_substance');
  SELECT count(*) INTO v_f05_kimi
  FROM supplements.substance_alias_matches
  WHERE (catalog_a = 'f05_substance_candidate' AND catalog_b = 'kimi_substance')
     OR (catalog_a = 'kimi_substance' AND catalog_b = 'f05_substance_candidate');
  SELECT count(*) INTO v_local_f05
  FROM supplements.substance_alias_matches
  WHERE (catalog_a = 'f05_substance_candidate' AND catalog_b = 'lumeos_supplement_catalog')
     OR (catalog_a = 'lumeos_supplement_catalog' AND catalog_b = 'f05_substance_candidate');

  IF v_aliases <> ${unique.length} THEN
    RAISE EXCEPTION 'substance_aliases: % Zeilen, erwartet ${unique.length}', v_aliases;
  END IF;
  IF v_kimi <> 237 THEN
    RAISE EXCEPTION 'substance_aliases: % Kimi-Substanzen, erwartet 237', v_kimi;
  END IF;
  IF v_local_kimi < 16 THEN
    RAISE EXCEPTION 'substance_alias_matches: nur % LumeOS-Kimi-Treffer, erwartet mindestens 16', v_local_kimi;
  END IF;
  IF v_f05_kimi < 53 THEN
    RAISE EXCEPTION 'substance_alias_matches: nur % F05-Kimi-Treffer, erwartet mindestens 53', v_f05_kimi;
  END IF;

  RAISE NOTICE 'OK C-131: % Aliase; Treffer LumeOS-Kimi %, F05-Kimi %, LumeOS-F05 %',
    v_aliases, v_local_kimi, v_f05_kimi, v_local_f05;
END $$;

COMMIT;
`

const result = spawnSync(
  'docker',
  ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', DB, '-v', 'ON_ERROR_STOP=1', '-f', '-'],
  { input: sql, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 },
)
if (result.stdout) process.stdout.write(result.stdout)
if (result.stderr) process.stderr.write(result.stderr)
if (result.status !== 0) process.exit(result.status ?? 1)

console.log(`C-131: ${unique.length} Aliaszeilen aus 44 + 320 + 237 Eintraegen`)
