#!/usr/bin/env node
import { csvJson, expectEqual, readJson, readJsonl, run } from './c273_helpers'

const products = readJsonl('products/products.jsonl').map((raw, index) => ({ entity_type: 'product', source_file: 'products.jsonl', index, raw }))
const brands = readJsonl('companies/brands.jsonl').map((raw, index) => ({ entity_type: 'brand', source_file: 'brands.jsonl', index, raw }))
const manufacturers = readJsonl('companies/manufacturers.jsonl').map((raw, index) => ({ entity_type: 'manufacturer', source_file: 'manufacturers.jsonl', index, raw }))
const brandIndexRaw = readJson('indexes/brand_index.json')
const brandIndex = Object.entries(brandIndexRaw).map(([key, raw], index) => ({ entity_type: 'brand_index', source_file: 'brand_index.json', index, key, raw }))
const rows = [...products, ...brands, ...manufacturers, ...brandIndex]

expectEqual('products', products.length, 50)
expectEqual('brands', brands.length, 120)
expectEqual('manufacturers', manufacturers.length, 63)
expectEqual('brand_index', brandIndex.length, 120)

const payload = {
  rows,
  expected: {
    products: Number(process.env.C273_EXPECT_PRODUCTS ?? 50),
    brands: 120,
    manufacturers: 63,
    brandIndex: 120,
    total: 353,
  },
}

run(`
\\set ON_ERROR_STOP on
BEGIN;

CREATE TEMP TABLE tmp_c273(payload jsonb);
COPY tmp_c273(payload) FROM stdin CSV QUOTE '"';
${csvJson([payload])}
\\.

DELETE FROM wissen.product_entities WHERE source = 'kimi:c273';

WITH payload AS (SELECT payload FROM tmp_c273),
rows AS (
  SELECT value AS item
  FROM payload, jsonb_array_elements(payload->'rows') AS value
)
INSERT INTO wissen.product_entities(entity_type, external_id, name, ingredient_ids, brand_id, manufacturer_id, pricing, raw, source_file)
SELECT
  item->>'entity_type',
  coalesce(item->>'key', item->'raw'->>'product_id', item->'raw'->>'brand_id', item->'raw'->>'manufacturer_id', item->'raw'->>'id', item->>'index'),
  coalesce(item->'raw'->>'name', item->'raw'->>'canonical_name', item->'raw'->>'brand_name', item->'raw'->>'manufacturer_name'),
  ARRAY(
    SELECT DISTINCT ingredient->>'ingredient_id'
    FROM jsonb_array_elements(coalesce(item->'raw'->'ingredients', '[]'::jsonb)) AS ingredient
    WHERE ingredient->>'ingredient_id' LIKE 'sub_%'
  ),
  coalesce(item->'raw'->>'brand_id', item->'raw'->>'brand'),
  coalesce(item->'raw'->>'manufacturer_id', item->'raw'->>'manufacturer'),
  coalesce(item->'raw'->'pricing', '{}'::jsonb),
  item->'raw',
  item->>'source_file'
FROM rows;

DO $$
DECLARE
  e jsonb;
  v_products int;
  v_brands int;
  v_manufacturers int;
  v_brand_index int;
  v_total int;
  v_prd int;
  v_missing_ingredients int;
BEGIN
  SELECT payload->'expected' INTO e FROM tmp_c273;
  SELECT
    count(*) FILTER (WHERE entity_type = 'product'),
    count(*) FILTER (WHERE entity_type = 'brand'),
    count(*) FILTER (WHERE entity_type = 'manufacturer'),
    count(*) FILTER (WHERE entity_type = 'brand_index'),
    count(*)
  INTO v_products, v_brands, v_manufacturers, v_brand_index, v_total
  FROM wissen.product_entities
  WHERE source = 'kimi:c273';

  SELECT count(*) INTO v_prd
  FROM wissen.product_entities
  WHERE entity_type = 'product'
    AND external_id = 'prd_882416d5'
    AND cardinality(ingredient_ids) > 0;

  WITH ingredients AS (
    SELECT unnest(ingredient_ids) AS slug
    FROM wissen.product_entities
    WHERE entity_type = 'product'
      AND external_id = 'prd_882416d5'
  )
  SELECT count(*) INTO v_missing_ingredients
  FROM ingredients i
  WHERE NOT EXISTS (SELECT 1 FROM supplements.supplements s WHERE s.slug = i.slug);

  IF v_products <> (e->>'products')::int THEN RAISE EXCEPTION 'C-273 Block4 products %, erwartet %', v_products, e->>'products'; END IF;
  IF v_brands <> (e->>'brands')::int THEN RAISE EXCEPTION 'C-273 Block4 brands %, erwartet %', v_brands, e->>'brands'; END IF;
  IF v_manufacturers <> (e->>'manufacturers')::int THEN RAISE EXCEPTION 'C-273 Block4 manufacturers %, erwartet %', v_manufacturers, e->>'manufacturers'; END IF;
  IF v_brand_index <> (e->>'brandIndex')::int THEN RAISE EXCEPTION 'C-273 Block4 brand_index %, erwartet %', v_brand_index, e->>'brandIndex'; END IF;
  IF v_total <> (e->>'total')::int THEN RAISE EXCEPTION 'C-273 Block4 total %, erwartet %', v_total, e->>'total'; END IF;
  IF v_prd <> 1 OR v_missing_ingredients <> 0 THEN RAISE EXCEPTION 'C-273 Block4 prd_882416d5 pruefung fehlgeschlagen, prd %, fehlende Zutaten %', v_prd, v_missing_ingredients; END IF;

  RAISE NOTICE 'OK C-273 Block4 Produktebene: Produkte %, Marken %, Hersteller %, Brand-Index %, prd_882416d5 Zutaten verknuepft', v_products, v_brands, v_manufacturers, v_brand_index;
END $$;

COMMIT;
`)
