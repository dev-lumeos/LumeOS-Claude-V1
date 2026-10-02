import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('C-467 braucht eine Wegwerf-Datenbank.')
function one<T>(sql: string): T {
  const out = execFileSync('docker', ['exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db, '-t', '-A', '-c', sql], { encoding: 'utf8' }).trim()
  return JSON.parse(out.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-467: Produkt schreibt bekannte Inhalte, meldet unbekannte und schützt den Katalog', () => {
  const r = one<any>(`BEGIN;
    SELECT supplements.create_supplier_product('Supplier Test','DE','Testprodukt','capsule','120','capsules','4006381333931','SKU-467','2','capsules',
      jsonb_build_array(
        jsonb_build_object('supplement_id',(SELECT id FROM supplements.supplements LIMIT 1),'amount_per_serving',100,'unit','mg','conversion_factor',1,'ist_wirkstoff',true),
        jsonb_build_object('supplement_id',(SELECT id FROM supplements.supplements OFFSET 1 LIMIT 1),'amount_per_serving',20,'unit','mg','conversion_factor',1,'ist_wirkstoff',true),
        jsonb_build_object('ingredient_name','C467 unbekannt','amount_per_serving',5,'unit','mg','ist_wirkstoff',true)), 'agent:c467') INTO TEMP c467_product;
    GRANT SELECT ON c467_product TO authenticated;
    -- A-87/A-86: LIMIT 1 ueber den gesamten befuellten Katalog ist kein
    -- Testanker. Nur ein Inhalt des gerade erzeugten Produkts darf gewinnen.
    INSERT INTO supplements.supplement_nutrients(supplement_id,status,nutrient_code,amount_per_serving,unit,conversion_factor,source)
    VALUES ((SELECT supplement_id FROM supplements.product_contents
             WHERE product_id=(SELECT create_supplier_product FROM c467_product)
               AND supplement_id IS NOT NULL AND amount_per_serving=100
             ORDER BY supplement_id LIMIT 1),
            'bekannt',(SELECT code FROM nutrition.nutrient_defs ORDER BY code LIMIT 1),10,'mg',2,'agent:c467-test');
    CREATE TEMP TABLE c467_seen(subject text primary key, rows integer) ON COMMIT DROP; GRANT SELECT, INSERT ON c467_seen TO authenticated;
    SET LOCAL ROLE authenticated; SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000467',true);
    INSERT INTO c467_seen VALUES ('auth',(SELECT count(*) FROM supplements.supplier_products
      WHERE id=(SELECT create_supplier_product FROM c467_product))); RESET ROLE;
    SELECT json_build_object(
      'products',(SELECT count(*) FROM supplements.supplier_products WHERE id=(SELECT create_supplier_product FROM c467_product)),
      'contents',(SELECT count(*) FROM supplements.product_contents WHERE product_id=(SELECT create_supplier_product FROM c467_product)),
      'candidates',(SELECT count(*) FROM supplements.product_content_candidates WHERE product_id=(SELECT create_supplier_product FROM c467_product)),
      'bridge',(SELECT pc.amount_per_serving * pc.conversion_factor * sn.amount_per_serving * sn.conversion_factor FROM supplements.product_contents pc JOIN supplements.supplement_nutrients sn ON sn.supplement_id=pc.supplement_id WHERE pc.product_id=(SELECT create_supplier_product FROM c467_product) AND sn.source='agent:c467-test'),
      'authRows',(SELECT rows FROM c467_seen),'anonExec',has_function_privilege('anon','supplements.create_supplier_product(text,text,text,text,text,text,text,text,text,text,jsonb,text)','EXECUTE'));
    ROLLBACK;`)
  assert.equal(r.products, 1); assert.equal(r.contents, 2); assert.equal(r.candidates, 1); assert.equal(Number(r.bridge), 2000)
  assert.equal(r.authRows, 1); assert.equal(r.anonExec, false)
})
