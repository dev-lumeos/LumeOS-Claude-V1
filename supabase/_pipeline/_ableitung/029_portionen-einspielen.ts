#!/usr/bin/env node
// C-50: curated household portions from supabase/_pipeline/daten/portionen.json.
//
// The data file owns the gram values and the food selectors. This step only
// resolves those selectors against nutrition.foods and inserts the resulting
// read-only BLS portion rows.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const INPUT = 'supabase/_pipeline/daten/portionen.json'
const SOURCE = 'legacy_household'

type Selector = {
  bls_prefixes?: string[]
  bls_code_prefixes?: string[]
  name_includes_any?: string[]
  name_excludes_any?: string[]
}

type Portion = {
  name_de: string
  name_en?: string
  amount_g: number
  sort_order?: number
  is_default?: boolean
}

type PortionSet = {
  id: string
  begruendung: string
  selector: Selector
  portions: Portion[]
}

type DataFile = {
  version: number
  portion_sets: PortionSet[]
}

type Food = {
  bls_code: string
  name_de: string
  name_display_de: string
}

type OutputRow = {
  bls_code: string
  name_de: string
  name_en: string
  amount_g: number
  sort_order: number
  is_default: boolean
  selector_id: string
  source_note: string
}

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

function runDockerPsql(args: string[], input?: string): string {
  const result = spawnSync(
    'docker',
    ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', DB, ...args],
    { input, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 },
  )
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.status !== 0) process.exit(result.status ?? 1)
  return result.stdout
}

function readData(): DataFile {
  const parsed = JSON.parse(fs.readFileSync(INPUT, 'utf8')) as DataFile
  if (parsed.version !== 1) fail(`${INPUT}: version muss 1 sein`)
  if (!Array.isArray(parsed.portion_sets) || parsed.portion_sets.length === 0) {
    fail(`${INPUT}: portion_sets fehlt oder ist leer`)
  }
  const ids = new Set<string>()
  for (const [index, set] of parsed.portion_sets.entries()) {
    if (!set.id || ids.has(set.id)) fail(`${INPUT}: portion_sets[${index}].id fehlt oder ist doppelt`)
    ids.add(set.id)
    if (!set.begruendung) fail(`${INPUT}: ${set.id}: begruendung fehlt`)
    if (!set.selector) fail(`${INPUT}: ${set.id}: selector fehlt`)
    if (!Array.isArray(set.portions) || set.portions.length === 0) fail(`${INPUT}: ${set.id}: portions fehlt`)
    for (const portion of set.portions) {
      if (!portion.name_de) fail(`${INPUT}: ${set.id}: portion.name_de fehlt`)
      if (!Number.isFinite(portion.amount_g) || portion.amount_g <= 0) {
        fail(`${INPUT}: ${set.id}: ${portion.name_de}: amount_g ungueltig`)
      }
    }
  }
  return parsed
}

function readFoods(): Food[] {
  const out = runDockerPsql([
    '-t',
    '-A',
    '-F',
    '\u0001',
    '-c',
    `SELECT bls_code, name_de, COALESCE(name_display_de, '')
     FROM nutrition.foods
     ORDER BY bls_code;`,
  ])
  return out
    .split('\n')
    .map(line => line.trimEnd())
    .filter(Boolean)
    .map(line => {
      const [bls_code, name_de, name_display_de] = line.split('\u0001')
      return { bls_code, name_de, name_display_de }
    })
}

function folded(value: string): string {
  return value.toLocaleLowerCase('de-DE')
}

function matches(food: Food, selector: Selector): boolean {
  if (selector.bls_prefixes?.length && !selector.bls_prefixes.includes(food.bls_code.slice(0, 1))) {
    return false
  }
  if (selector.bls_code_prefixes?.length &&
      !selector.bls_code_prefixes.some(prefix => food.bls_code.startsWith(prefix))) {
    return false
  }

  const haystack = folded(`${food.name_de} ${food.name_display_de}`)
  if (selector.name_includes_any?.length &&
      !selector.name_includes_any.some(term => haystack.includes(folded(term)))) {
    return false
  }
  if (selector.name_excludes_any?.length &&
      selector.name_excludes_any.some(term => haystack.includes(folded(term)))) {
    return false
  }
  return true
}

function buildRows(data: DataFile, foods: Food[]): OutputRow[] {
  const rows: OutputRow[] = []
  const seen = new Set<string>()
  const defaults = new Map<string, number>()

  for (const set of data.portion_sets) {
    const matched = foods.filter(food => matches(food, set.selector))
    if (matched.length === 0) fail(`${INPUT}: ${set.id}: Selektor trifft kein Food`)

    for (const food of matched) {
      for (const portion of set.portions) {
        const key = `${food.bls_code}\u0000${portion.name_de}\u0000${portion.amount_g}`
        if (seen.has(key)) continue
        seen.add(key)
        const isDefault = portion.is_default === true
        if (isDefault) defaults.set(food.bls_code, (defaults.get(food.bls_code) ?? 0) + 1)
        rows.push({
          bls_code: food.bls_code,
          name_de: portion.name_de,
          name_en: portion.name_en ?? '',
          amount_g: portion.amount_g,
          sort_order: portion.sort_order ?? 0,
          is_default: isDefault,
          selector_id: set.id,
          source_note: set.begruendung,
        })
      }
    }
  }

  const tooManyDefaults = [...defaults.entries()].filter(([, count]) => count > 1)
  if (tooManyDefaults.length) {
    fail(`Mehr als eine Default-Portion fuer ${tooManyDefaults.length} Foods, Beispiel ${tooManyDefaults[0][0]}`)
  }
  return rows.sort((a, b) =>
    a.bls_code.localeCompare(b.bls_code) ||
    a.sort_order - b.sort_order ||
    a.name_de.localeCompare(b.name_de, 'de-DE'))
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function insertRows(rows: OutputRow[]): void {
  const payload = rows.map(row => csvCell(JSON.stringify(row))).join('\n')
  const sql = `\\set ON_ERROR_STOP on
BEGIN;

CREATE TABLE IF NOT EXISTS nutrition.foods_portions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id uuid NOT NULL REFERENCES nutrition.foods(id) ON DELETE CASCADE,
  name_de text NOT NULL,
  name_en text NOT NULL DEFAULT '',
  name_th text NOT NULL DEFAULT '',
  amount_g numeric(8,2) NOT NULL CHECK (amount_g > 0),
  sort_order integer NOT NULL DEFAULT 0,
  is_default boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT '${SOURCE}',
  source_note text NOT NULL DEFAULT '',
  selector_id text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE nutrition.foods_portions
  ADD COLUMN IF NOT EXISTS name_th text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS source_note text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS selector_id text NOT NULL DEFAULT '';

CREATE UNIQUE INDEX IF NOT EXISTS foods_portions_food_name_amount_uq
  ON nutrition.foods_portions(food_id, name_de, amount_g);
CREATE UNIQUE INDEX IF NOT EXISTS foods_portions_one_default_per_food_uq
  ON nutrition.foods_portions(food_id)
  WHERE is_default;
CREATE INDEX IF NOT EXISTS foods_portions_food_id_idx
  ON nutrition.foods_portions(food_id);

ALTER TABLE nutrition.foods_portions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS foods_portions_select ON nutrition.foods_portions;
CREATE POLICY foods_portions_select
  ON nutrition.foods_portions
  FOR SELECT
  TO authenticated
  USING (true);

GRANT SELECT ON nutrition.foods_portions TO authenticated;
GRANT ALL ON nutrition.foods_portions TO service_role;

CREATE TEMP TABLE tmp_foods_portions (
  payload text NOT NULL
) ON COMMIT DROP;

COPY tmp_foods_portions (payload) FROM STDIN WITH (FORMAT csv);
${payload}
\\.

TRUNCATE nutrition.foods_portions;

WITH parsed AS (
  SELECT payload::jsonb AS p
  FROM tmp_foods_portions
),
joined AS (
  SELECT f.id AS food_id,
         p->>'name_de' AS name_de,
         COALESCE(p->>'name_en', '') AS name_en,
         (p->>'amount_g')::numeric AS amount_g,
         (p->>'sort_order')::integer AS sort_order,
         (p->>'is_default')::boolean AS is_default,
         p->>'selector_id' AS selector_id,
         p->>'source_note' AS source_note
  FROM parsed
  JOIN nutrition.foods f ON f.bls_code = p->>'bls_code'
)
INSERT INTO nutrition.foods_portions
  (food_id, name_de, name_en, amount_g, sort_order, is_default, source, selector_id, source_note)
SELECT food_id, name_de, name_en, amount_g, sort_order, is_default, '${SOURCE}', selector_id, source_note
FROM joined
ON CONFLICT (food_id, name_de, amount_g) DO NOTHING;

DO $$
DECLARE
  v_input int;
  v_inserted int;
  v_foods int;
  v_without int;
  v_multi_default int;
BEGIN
  SELECT COUNT(*) INTO v_input FROM tmp_foods_portions;
  SELECT COUNT(*) INTO v_inserted FROM nutrition.foods_portions;
  IF v_inserted <> v_input THEN
    RAISE EXCEPTION 'portionen.json: % Portionen eingefuegt, erwartet %', v_inserted, v_input;
  END IF;

  SELECT COUNT(DISTINCT food_id) INTO v_foods FROM nutrition.foods_portions;
  SELECT COUNT(*)
  INTO v_without
  FROM nutrition.foods f
  WHERE NOT EXISTS (
    SELECT 1 FROM nutrition.foods_portions p WHERE p.food_id = f.id
  );

  SELECT COUNT(*)
  INTO v_multi_default
  FROM (
    SELECT food_id
    FROM nutrition.foods_portions
    WHERE is_default
    GROUP BY food_id
    HAVING COUNT(*) > 1
  ) d;
  IF v_multi_default <> 0 THEN
    RAISE EXCEPTION 'foods_portions: % Foods mit mehr als einer Default-Portion', v_multi_default;
  END IF;

  RAISE NOTICE 'OK: % Portionszeilen fuer % Foods; % Foods ohne Portion', v_inserted, v_foods, v_without;
END $$;

COMMENT ON TABLE nutrition.foods_portions IS
  'C-50: Kuratierte Portionsgroessen fuer BLS-Lebensmittel. Gramm bleibt kanonisch; diese Tabelle ist nur Eingabehilfe.';
COMMENT ON COLUMN nutrition.foods_portions.amount_g IS
  'Gramm-Aequivalent der Portion. Quelle: Vorgaengerrepo/haushaltsuebliche Schaetzung, nicht BLS-geprueft.';
COMMENT ON COLUMN nutrition.foods_portions.source IS
  'legacy_household = aus referenz/lumeos-2026/scripts/seed-portions.py uebernommen und gegen aktuelle BLS-Gruppen selektiert.';

COMMIT;
`

  const result = spawnSync(
    'docker',
    ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', DB, '-f', '-'],
    { input: sql, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 },
  )
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.status !== 0) process.exit(result.status ?? 1)
}

const data = readData()
const foods = readFoods()
if (foods.length !== 7140) fail(`nutrition.foods: ${foods.length} Zeilen, erwartet 7140`)
const rows = buildRows(data, foods)
const foodsWithPortions = new Set(rows.map(row => row.bls_code)).size
console.log(`${INPUT}: ${data.portion_sets.length} Sets, ${rows.length} Portionszeilen fuer ${foodsWithPortions} Foods`)
insertRows(rows)
