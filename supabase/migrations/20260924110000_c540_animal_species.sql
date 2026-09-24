BEGIN;

-- C-540: A food can contain several explicitly named animal kinds. The
-- catalog keeps the canonical kind and its searchable synonyms separately
-- from food rows; unmentioned animals deliberately receive no relation.
CREATE TABLE nutrition.animal_species (
  code text PRIMARY KEY CHECK (code ~ '^[a-z][a-z0-9_]*$'),
  name_de text NOT NULL CHECK (btrim(name_de) <> ''),
  name_en text NOT NULL CHECK (btrim(name_en) <> ''),
  name_th text NOT NULL CHECK (btrim(name_th) <> ''),
  synonyms text[] NOT NULL CHECK (cardinality(synonyms) > 0)
);

CREATE TABLE nutrition.food_animal_species (
  food_id uuid NOT NULL REFERENCES nutrition.foods(id) ON DELETE CASCADE,
  animal_species_code text NOT NULL REFERENCES nutrition.animal_species(code) ON DELETE RESTRICT,
  source text NOT NULL DEFAULT 'name_explicit_c540'
    CHECK (source IN ('name_explicit_c540')),
  PRIMARY KEY (food_id, animal_species_code)
);

CREATE INDEX food_animal_species_code_idx
  ON nutrition.food_animal_species (animal_species_code, food_id);

ALTER TABLE nutrition.animal_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.food_animal_species ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS animal_species_select ON nutrition.animal_species;
CREATE POLICY animal_species_select ON nutrition.animal_species
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS food_animal_species_select ON nutrition.food_animal_species;
CREATE POLICY food_animal_species_select ON nutrition.food_animal_species
  FOR SELECT TO authenticated USING (true);

REVOKE ALL ON TABLE nutrition.animal_species, nutrition.food_animal_species
  FROM PUBLIC, anon;
GRANT SELECT ON TABLE nutrition.animal_species, nutrition.food_animal_species
  TO authenticated;
GRANT ALL ON TABLE nutrition.animal_species, nutrition.food_animal_species
  TO service_role;

COMMENT ON TABLE nutrition.animal_species IS
  'C-540: kanonische Tierarten mit kuratierten, gefalteten Namenssynonymen. Synonyme sind keine automatische Auswahl im Suchweg.';
COMMENT ON TABLE nutrition.food_animal_species IS
  'C-540: mehrwertige Zuordnung Food zu explizit im deutschen BLS-Namen genannter Tierart. Unbenannte Produkte bleiben absichtlich ohne Zeile.';
COMMENT ON COLUMN nutrition.food_animal_species.source IS
  'C-540: nur name_explicit_c540; keine Kategorierate oder Annahme aus Wurst- und Mischproduktnamen.';

COMMIT;
