BEGIN;

-- C-540: Synonyms are intentionally folded ASCII stems. The matching rule is
-- word-start only (`\m`): Rind -> Rinder..., but not Kochschinken -> Ochs.
-- A term is present only where the food name itself carries the animal kind.
INSERT INTO nutrition.animal_species (code, name_de, name_en, name_th, synonyms) VALUES
  ('beef',        'Rind',       'Cattle / beef',   'โค',              ARRAY['rind','ochs']),
  ('veal',        'Kalb',       'Veal',            'ลูกวัว',          ARRAY['kalb']),
  ('pork',        'Schwein',    'Pig / pork',      'หมู',             ARRAY['schwein','speck']),
  ('sheep',       'Schaf',      'Sheep / lamb',    'แกะ',             ARRAY['lamm','schaf','widder','hammel']),
  ('goat',        'Ziege',      'Goat',            'แพะ',             ARRAY['ziege']),
  ('horse',       'Pferd',      'Horse',           'ม้า',             ARRAY['pferd']),
  ('rabbit',      'Kaninchen',  'Rabbit',          'กระต่าย',         ARRAY['kaninchen','wildkaninchen']),
  ('hare',        'Hase',       'Hare',            'กระต่ายป่า',      ARRAY['hase']),
  ('chicken',     'Huhn',       'Chicken',         'ไก่',             ARRAY['huhn','huehn','haehnchen','poulet','chicken','suppenhuhn','poularde']),
  ('turkey',      'Pute',       'Turkey',          'ไก่งวง',          ARRAY['pute','truthahn','turkey']),
  ('duck',        'Ente',       'Duck',            'เป็ด',            ARRAY['ente']),
  ('goose',       'Gans',       'Goose',           'ห่าน',            ARRAY['gans']),
  ('guinea_fowl', 'Perlhuhn',   'Guinea fowl',     'ไก่ต๊อก',         ARRAY['perlhuhn']),
  ('quail',       'Wachtel',    'Quail',           'นกกระทา',        ARRAY['wachtel']),
  ('pigeon',      'Taube',      'Pigeon',          'นกพิราบ',         ARRAY['taube']),
  ('ostrich',     'Strauss',    'Ostrich',         'นกกระจอกเทศ',    ARRAY['strauss']),
  ('pheasant',    'Fasan',      'Pheasant',        'ไก่ฟ้า',          ARRAY['fasan']),
  ('red_deer',    'Hirsch',     'Red deer',        'กวางแดง',         ARRAY['hirsch']),
  ('roe_deer',    'Reh',        'Roe deer',        'กวางโร',          ARRAY['reh']),
  ('reindeer',    'Rentier',    'Reindeer',        'กวางเรนเดียร์',  ARRAY['rentier']),
  ('wild_boar',   'Wildschwein','Wild boar',      'หมูป่า',          ARRAY['wildschwein'])
ON CONFLICT (code) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  synonyms = EXCLUDED.synonyms;

DELETE FROM nutrition.food_animal_species
WHERE source = 'name_explicit_c540';

WITH explicit_names AS (
  SELECT DISTINCT f.id AS food_id, species.code AS animal_species_code
  FROM nutrition.foods f
  JOIN nutrition.animal_species species ON true
  CROSS JOIN LATERAL unnest(species.synonyms) AS synonym(value)
  WHERE CASE synonym.value
    -- `\mhase` would also match Haselnuss. The listed forms cover the
    -- explicit hare names in BLS without turning a food ingredient into meat.
    WHEN 'hase' THEN nutrition.search_fold(f.name_de)
      ~ '\mhasen?(fleisch|braten|ragout|pfeffer)?\M'
    ELSE nutrition.search_fold(f.name_de) ~ ('\m' || synonym.value)
  END
)
INSERT INTO nutrition.food_animal_species (food_id, animal_species_code, source)
SELECT food_id, animal_species_code, 'name_explicit_c540'
FROM explicit_names
ORDER BY food_id, animal_species_code;

DO $$
DECLARE
  v_scope integer;
  v_assigned integer;
  v_multi integer;
  v_triple integer;
  v_chicken text;
  v_poulet text;
  v_turkey text;
BEGIN
  WITH RECURSIVE category_tree AS (
    SELECT id FROM nutrition.food_categories WHERE slug = 'fleisch-gefluegel'
    UNION ALL
    SELECT child.id
    FROM nutrition.food_categories child
    JOIN category_tree parent ON child.parent_id = parent.id
  )
  SELECT count(*) INTO v_scope
  FROM nutrition.foods f JOIN category_tree category ON category.id = f.category_id;

  WITH RECURSIVE category_tree AS (
    SELECT id FROM nutrition.food_categories WHERE slug = 'fleisch-gefluegel'
    UNION ALL
    SELECT child.id
    FROM nutrition.food_categories child
    JOIN category_tree parent ON child.parent_id = parent.id
  )
  SELECT count(DISTINCT relation.food_id) INTO v_assigned
  FROM nutrition.food_animal_species relation
  JOIN nutrition.foods f ON f.id = relation.food_id
  JOIN category_tree category ON category.id = f.category_id;
  SELECT count(*) INTO v_multi
  FROM (SELECT food_id FROM nutrition.food_animal_species GROUP BY food_id HAVING count(*) >= 2) multi;
  SELECT count(*) INTO v_triple
  FROM (SELECT food_id FROM nutrition.food_animal_species GROUP BY food_id HAVING count(*) = 3) triple;
  SELECT code INTO v_chicken FROM nutrition.animal_species WHERE 'huhn' = ANY(synonyms);
  SELECT code INTO v_poulet FROM nutrition.animal_species WHERE 'poulet' = ANY(synonyms);
  SELECT code INTO v_turkey FROM nutrition.animal_species WHERE 'pute' = ANY(synonyms);

  IF v_scope <> 1449 THEN
    RAISE EXCEPTION 'C-540 erwartet 1449 Foods im Fleisch-/Gefluegelbaum, nicht %', v_scope;
  END IF;
  IF v_assigned = 0 OR v_assigned >= v_scope THEN
    RAISE EXCEPTION 'C-540: sichere Zuordnungen % von % unglaubwuerdig', v_assigned, v_scope;
  END IF;
  IF v_multi < 53 OR v_triple <> 1 THEN
    RAISE EXCEPTION 'C-540: Mehrfachzuordnung unvollstaendig (% mindestens zwei, % genau drei)', v_multi, v_triple;
  END IF;
  IF v_chicken IS DISTINCT FROM v_poulet OR v_chicken = v_turkey THEN
    RAISE EXCEPTION 'C-540: Huhn/Poulet und Pute sind nicht wie entschieden getrennt';
  END IF;
  RAISE NOTICE 'C-540 OK: % von % sicher zugeordnet, % mehrwertig, % dreifach',
    v_assigned, v_scope, v_multi, v_triple;
END $$;

COMMIT;
