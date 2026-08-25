-- =============================================================
-- 140 -- Supplements: Nutzertexte, FAQ und Sammelnamen (C-257/C-244)
-- Datum: 2026-08-23
-- Zweck:
--   Nutzerlesbare Substanztexte nach docs/spezifikation/
--   substanz-katalog-nutzertexte.md. Fakten ja, Anweisungen nein.
--
-- Bauform:
--   Lange Texte liegen in supplement_user_texts (1:1), nicht als 27+
--   Spalten im Katalogkern. Die Katalogtabelle behaelt nur die Felder,
--   die auf jedem Listenpfad gebraucht werden: parent_id, form_note_* und
--   die vorhandene Kurzbeschreibung.
--
-- C-244:
--   15 Sammelnamen gewinnen gegen 29 Kimi-Formen. Die Formen bleiben als
--   Unterformen erhalten, bekommen parent_id und form_note_*, sind aber
--   keine eigenen obersten Katalogeintraege mehr.
-- =============================================================

BEGIN;

CREATE OR REPLACE FUNCTION pg_temp.stable_uuid(p_key text)
RETURNS uuid
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (
    substr(md5(p_key), 1, 8) || '-' ||
    substr(md5(p_key), 9, 4) || '-' ||
    substr(md5(p_key), 13, 4) || '-' ||
    substr(md5(p_key), 17, 4) || '-' ||
    substr(md5(p_key), 21, 12)
  )::uuid;
$$;

ALTER TABLE supplements.supplements
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES supplements.supplements(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS form_note_de TEXT,
  ADD COLUMN IF NOT EXISTS form_note_en TEXT,
  ADD COLUMN IF NOT EXISTS form_note_th TEXT;

CREATE INDEX IF NOT EXISTS idx_supplements_parent_id
  ON supplements.supplements(parent_id)
  WHERE parent_id IS NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema='supplements'
      AND table_name='supplements'
      AND column_name='im_katalog'
  ) THEN
    ALTER TABLE supplements.supplements DROP COLUMN im_katalog;
  END IF;

  ALTER TABLE supplements.supplements
    ADD COLUMN im_katalog boolean GENERATED ALWAYS AS (
      parent_id IS NULL
      AND (
        NULLIF(btrim(COALESCE(description_de, '')), '') IS NOT NULL
        OR NULLIF(btrim(COALESCE(description_en, '')), '') IS NOT NULL
        OR evidence_grade IS NOT NULL
      )
    ) STORED;
END $$;

ALTER TABLE supplements.supplement_tags
  ADD COLUMN IF NOT EXISTS evidence_grade TEXT CHECK (
    evidence_grade IS NULL OR evidence_grade IN ('S','A','B','C','D','E','F')
  );

CREATE TABLE IF NOT EXISTS supplements.supplement_user_texts (
  supplement_id UUID PRIMARY KEY REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'bekannt' CHECK (status IN ('bekannt','unbekannt','nicht_zutreffend')),
  kurz_was_de TEXT NOT NULL CHECK (char_length(kurz_was_de) <= 140),
  kurz_was_en TEXT NOT NULL CHECK (char_length(kurz_was_en) <= 140),
  kurz_was_th TEXT,
  wofuer_de TEXT[] NOT NULL CHECK (array_length(wofuer_de, 1) BETWEEN 2 AND 4),
  wofuer_en TEXT[] NOT NULL CHECK (array_length(wofuer_en, 1) BETWEEN 2 AND 4),
  wofuer_th TEXT[],
  wie_wirkt_de TEXT NOT NULL,
  wie_wirkt_en TEXT NOT NULL,
  wie_wirkt_th TEXT,
  was_bringt_es_de TEXT NOT NULL,
  was_bringt_es_en TEXT NOT NULL,
  was_bringt_es_th TEXT,
  zu_viel_de TEXT NOT NULL,
  zu_viel_en TEXT NOT NULL,
  zu_viel_th TEXT,
  zu_wenig_de TEXT,
  zu_wenig_en TEXT,
  zu_wenig_th TEXT,
  wann_wie_de TEXT NOT NULL,
  wann_wie_en TEXT NOT NULL,
  wann_wie_th TEXT,
  wer_nicht_de TEXT[] NOT NULL,
  wer_nicht_en TEXT[] NOT NULL,
  wer_nicht_th TEXT[],
  mythen_de TEXT,
  mythen_en TEXT,
  mythen_th TEXT,
  irreversibel_de TEXT,
  irreversibel_en TEXT,
  irreversibel_th TEXT,
  ueberwachung_de TEXT,
  ueberwachung_en TEXT,
  ueberwachung_th TEXT,
  nicht_im_blut_de TEXT,
  nicht_im_blut_en TEXT,
  nicht_im_blut_th TEXT,
  reinheit_de TEXT,
  reinheit_en TEXT,
  reinheit_th TEXT,
  rechtslage_klartext_de TEXT,
  rechtslage_klartext_en TEXT,
  rechtslage_klartext_th TEXT,
  source TEXT NOT NULL DEFAULT 'c257_codex_research_2026-08-23',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.supplement_faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  frage_de TEXT NOT NULL CHECK (btrim(frage_de) <> ''),
  frage_en TEXT NOT NULL CHECK (btrim(frage_en) <> ''),
  frage_th TEXT,
  antwort_de TEXT NOT NULL CHECK (btrim(antwort_de) <> ''),
  antwort_en TEXT NOT NULL CHECK (btrim(antwort_en) <> ''),
  antwort_th TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'c257_codex_research_2026-08-23',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (supplement_id, sort_order)
);

CREATE INDEX IF NOT EXISTS idx_supplement_user_texts_status
  ON supplements.supplement_user_texts(status);
CREATE INDEX IF NOT EXISTS idx_supplement_faq_supplement
  ON supplements.supplement_faq(supplement_id, sort_order);

ALTER TABLE supplements.supplement_user_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements.supplement_faq ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON supplements.supplement_user_texts TO authenticated;
GRANT SELECT ON supplements.supplement_faq TO authenticated;
GRANT ALL ON supplements.supplement_user_texts TO service_role;
GRANT ALL ON supplements.supplement_faq TO service_role;

DROP POLICY IF EXISTS supplement_user_texts_select ON supplements.supplement_user_texts;
CREATE POLICY supplement_user_texts_select ON supplements.supplement_user_texts
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS supplement_faq_select ON supplements.supplement_faq;
CREATE POLICY supplement_faq_select ON supplements.supplement_faq
  FOR SELECT TO authenticated USING (true);

DROP TRIGGER IF EXISTS supplement_user_texts_updated_at ON supplements.supplement_user_texts;
CREATE TRIGGER supplement_user_texts_updated_at
BEFORE UPDATE ON supplements.supplement_user_texts
FOR EACH ROW EXECUTE FUNCTION supplements.touch_updated_at();

DROP TRIGGER IF EXISTS supplement_faq_updated_at ON supplements.supplement_faq;
CREATE TRIGGER supplement_faq_updated_at
BEFORE UPDATE ON supplements.supplement_faq
FOR EACH ROW EXECUTE FUNCTION supplements.touch_updated_at();

CREATE TEMP TABLE tmp_c257_slug_map(old_slug TEXT PRIMARY KEY, new_slug TEXT NOT NULL) ON COMMIT DROP;
INSERT INTO tmp_c257_slug_map(old_slug, new_slug) VALUES
  ('local_ashwagandha_ksm66', 'ashwagandha-ksm66'),
  ('local_bcaas', 'bcaas'),
  ('local_biotin', 'biotin'),
  ('local_caffeine', 'caffeine'),
  ('local_calcium', 'calcium'),
  ('local_collagen', 'collagen'),
  ('local_curcumin_turmeric', 'curcumin-turmeric'),
  ('local_electrolytes', 'electrolytes'),
  ('local_fiber_psyllium_husk', 'fiber-psyllium-husk'),
  ('local_folate_b9', 'folate-b9'),
  ('local_glucosamine', 'glucosamine'),
  ('local_iron', 'iron'),
  ('local_lions_mane', 'lions-mane'),
  ('local_magnesium', 'magnesium'),
  ('local_nac', 'nac'),
  ('local_probiotics', 'probiotics'),
  ('local_spirulina', 'spirulina'),
  ('local_tongkat_ali', 'tongkat-ali'),
  ('local_turkesterone', 'turkesterone'),
  ('local_vitamin_a', 'vitamin-a'),
  ('local_vitamin_b12', 'vitamin-b12'),
  ('local_vitamin_b6', 'vitamin-b6'),
  ('local_vitamin_c', 'vitamin-c'),
  ('local_vitamin_d3', 'vitamin-d3'),
  ('local_vitamin_e', 'vitamin-e'),
  ('local_vitamin_k2_mk7', 'vitamin-k2-mk7'),
  ('local_whey_protein', 'whey-protein'),
  ('local_zinc', 'zinc');

UPDATE supplements.supplements s
SET slug = m.new_slug
FROM tmp_c257_slug_map m
WHERE s.slug = m.old_slug
  AND NOT EXISTS (
    SELECT 1 FROM supplements.supplements other WHERE other.slug = m.new_slug
  );

CREATE TEMP TABLE tmp_c257_parent_map(
  parent_slug TEXT NOT NULL,
  child_slug TEXT PRIMARY KEY,
  form_note_de TEXT NOT NULL,
  form_note_en TEXT NOT NULL
) ON COMMIT DROP;

INSERT INTO tmp_c257_parent_map(parent_slug, child_slug, form_note_de, form_note_en) VALUES
  ('magnesium','sub_c325e8c0b7','Chloridform; unterscheidet sich vor allem in Salzform und Vertraeglichkeit.','Chloride form; mainly differs by salt form and tolerance.'),
  ('magnesium','sub_5e6fa4949b','Citrat; haeufig als gut loesliche Magnesiumform genutzt.','Citrate; commonly used as a soluble magnesium form.'),
  ('magnesium','sub_10b90cdfbe','Glycinat/Bisglycinat; Aminosaeure-gebundene Form.','Glycinate/bisglycinate; amino-acid-bound form.'),
  ('magnesium','sub_a95493c88a','L-Threonat; eigene Form, oft wegen Gehirn-/Nervenbezug gelistet.','L-threonate; distinct form often listed for brain or nerve context.'),
  ('magnesium','sub_8bca2ecf0b','Malat; Magnesiumsalz der Apfelsaeure.','Malate; magnesium salt of malic acid.'),
  ('magnesium','sub_9545536b73','Oxid; hohe Elementmenge, aber andere Loeslichkeit als Chelate.','Oxide; high elemental amount, different solubility than chelates.'),
  ('magnesium','sub_6081959ec8','Taurat; Magnesiumform mit Taurinbezug.','Taurate; magnesium form linked to taurine.'),
  ('whey-protein','sub_bed5ac227a','Konzentrat; enthaelt mehr Begleitstoffe als Isolat.','Concentrate; contains more non-protein fractions than isolate.'),
  ('whey-protein','sub_15240614a6','Hydrolysat; vorverdautes Whey mit anderer Verarbeitung.','Hydrolysate; pre-hydrolyzed whey with different processing.'),
  ('whey-protein','sub_43b1e64b52','Isolat; staerker auf Protein konzentriert.','Isolate; more concentrated toward protein.'),
  ('zinc','sub_28b365f4e1','Gluconat; organische Zinkform.','Gluconate; organic zinc form.'),
  ('zinc','sub_7eec2628a4','Picolinat; Zinkform mit Picolinsaeure.','Picolinate; zinc form bound to picolinic acid.'),
  ('zinc','sub_a11e729d29','Spezial-/Querverweis im Bestand; kein eigener Sammelname.','Special cross-reference in the data; not a separate headline item.'),
  ('caffeine','sub_2c308411e9','Wasserfreie Form; Koffein ohne Kristallwasser.','Anhydrous form; caffeine without crystal water.'),
  ('caffeine','sub_98d523f968','Kontextzeile fuer Fettverlust; kein eigener Sammelname.','Fat-loss context row; not a separate headline item.'),
  ('calcium','sub_7f400b189e','Carbonat; Calciumform mit Carbonat.','Carbonate; calcium form with carbonate.'),
  ('calcium','sub_4aff89287a','Citrat; Calciumform mit Citrat.','Citrate; calcium form with citrate.'),
  ('iron','sub_96dc337b14','Bisglycinat; chelatierte Eisenform.','Bisglycinate; chelated iron form.'),
  ('iron','sub_1b98d69c9a','Sulfat; klassische Eisenform.','Sulfate; common iron form.'),
  ('vitamin-b12','sub_72b40a8c12','Cyanocobalamin; eine B12-Form.','Cyanocobalamin; one B12 form.'),
  ('vitamin-b12','sub_471f5dcf68','Methylcobalamin; eine B12-Form.','Methylcobalamin; one B12 form.'),
  ('collagen','sub_d1c6dda3a4','Hydrolysierte Kollagenpeptide; aufgespaltene Kollagenform.','Hydrolyzed collagen peptides; broken-down collagen form.'),
  ('lions-mane','sub_ca8d1dd406','Pilz-/Extraktform von Hericium erinaceus.','Mushroom or extract form of Hericium erinaceus.'),
  ('tongkat-ali','sub_73c6284113','Eurycoma-longifolia-Form im Kimi-Bestand.','Eurycoma longifolia form in the Kimi data.'),
  ('vitamin-a','sub_d370f8f2d6','Retinol; direkte Vitamin-A-Form.','Retinol; direct vitamin A form.'),
  ('vitamin-b6','sub_df4b1c61d9','Pyridoxin/P5P; B6-Formen im Bestand.','Pyridoxine/P5P; B6 forms in the data.'),
  ('vitamin-c','sub_d0c44bc87d','Ascorbinsaeure; klassische Vitamin-C-Form.','Ascorbic acid; classic vitamin C form.'),
  ('vitamin-d3','sub_479964998b','Cholecalciferol; Vitamin-D3-Form.','Cholecalciferol; vitamin D3 form.'),
  ('vitamin-e','sub_adb0d25fb4','Alpha-Tocopherol; Vitamin-E-Form im Bestand.','Alpha-tocopherol; vitamin E form in the data.');

UPDATE supplements.supplements child
SET parent_id = parent.id,
    form_note_de = m.form_note_de,
    form_note_en = m.form_note_en,
    form_note_th = NULL
FROM tmp_c257_parent_map m
JOIN supplements.supplements parent ON parent.slug = m.parent_slug
WHERE child.slug = m.child_slug;

CREATE OR REPLACE FUNCTION pg_temp.text_name(p_name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(NULLIF(btrim(p_name), ''), 'Diese Substanz');
$$;

CREATE OR REPLACE FUNCTION pg_temp.kurz_de(p_gruppe text, p_filter text, p_name text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_gruppe = 'enhanced' THEN
    RETURN left(pg_temp.text_name(p_name) || ' ist ein leistungs- oder hormonbezogener Wirkstoff; der Katalog beschreibt Fakten, keine Anwendung.', 140);
  ELSIF p_gruppe = 'peptide' THEN
    RETURN left(pg_temp.text_name(p_name) || ' ist ein Peptid oder peptidnaher Wirkstoff mit klarer Signalwirkung im Koerper.', 140);
  ELSIF p_filter = 'mineralstoffe' THEN
    RETURN left(pg_temp.text_name(p_name) || ' ist ein Mineralstoff oder Spurenelement fuer normale Koerperfunktionen.', 140);
  ELSIF p_filter = 'vitamine' THEN
    RETURN left(pg_temp.text_name(p_name) || ' ist ein Vitamin oder vitaminnahe Substanz fuer normale Stoffwechselwege.', 140);
  ELSIF p_filter = 'protein_aminos' THEN
    RETURN left(pg_temp.text_name(p_name) || ' liefert Eiweissbausteine oder ergaenzt die Proteinversorgung.', 140);
  ELSE
    RETURN left(pg_temp.text_name(p_name) || ' ist eine Supplement-Substanz mit eigener Beleglage und eigenen Grenzen.', 140);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.kurz_en(p_gruppe text, p_filter text, p_name text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_gruppe = 'enhanced' THEN
    RETURN left(pg_temp.text_name(p_name) || ' is a performance- or hormone-related substance; the catalog states facts, not use instructions.', 140);
  ELSIF p_gruppe = 'peptide' THEN
    RETURN left(pg_temp.text_name(p_name) || ' is a peptide or peptide-like substance with targeted signaling in the body.', 140);
  ELSIF p_filter = 'mineralstoffe' THEN
    RETURN left(pg_temp.text_name(p_name) || ' is a mineral or trace element used in normal body functions.', 140);
  ELSIF p_filter = 'vitamine' THEN
    RETURN left(pg_temp.text_name(p_name) || ' is a vitamin or vitamin-like substance used in normal metabolism.', 140);
  ELSIF p_filter = 'protein_aminos' THEN
    RETURN left(pg_temp.text_name(p_name) || ' provides protein building blocks or supports protein intake.', 140);
  ELSE
    RETURN left(pg_temp.text_name(p_name) || ' is a supplement substance with its own evidence and limits.', 140);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.wofuer_de(p_gruppe text, p_filter text)
RETURNS text[]
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_gruppe = 'enhanced' THEN
    RETURN ARRAY['Leistungs- oder Koerperkompositionskontext','Labor- und Nebenwirkungsbezug','Rechts- und Wettkampfstatus'];
  ELSIF p_gruppe = 'peptide' THEN
    RETURN ARRAY['Signalwege im Koerper','Monitoring und Laborbezug','Reinheits- und Rechtsfragen'];
  ELSIF p_filter = 'mineralstoffe' THEN
    RETURN ARRAY['Mineralstoffversorgung','Mangel- oder Mehrzufuhr einordnen','Interaktionen sichtbar machen'];
  ELSIF p_filter = 'vitamine' THEN
    RETURN ARRAY['Vitaminversorgung','Bereiche und Obergrenzen einordnen','Laborwerte im Kontext sehen'];
  ELSIF p_filter = 'protein_aminos' THEN
    RETURN ARRAY['Proteinversorgung','Trainingstage einordnen','Portionsgroessen vergleichen'];
  ELSIF p_filter = 'sportnahrung' THEN
    RETURN ARRAY['Training und Alltag','Wirkungsgroesse einordnen','Grenzen sichtbar machen'];
  ELSE
    RETURN ARRAY['Katalogeinordnung','Beleglage vergleichen','Risiken sichtbar machen'];
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.wofuer_en(p_gruppe text, p_filter text)
RETURNS text[]
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_gruppe = 'enhanced' THEN
    RETURN ARRAY['Performance or body-composition context','Lab and side-effect context','Legal and sport status'];
  ELSIF p_gruppe = 'peptide' THEN
    RETURN ARRAY['Body signaling pathways','Monitoring and lab context','Purity and legal questions'];
  ELSIF p_filter = 'mineralstoffe' THEN
    RETURN ARRAY['Mineral intake context','Low or high intake context','Interaction visibility'];
  ELSIF p_filter = 'vitamine' THEN
    RETURN ARRAY['Vitamin intake context','Ranges and upper limits','Lab-value context'];
  ELSIF p_filter = 'protein_aminos' THEN
    RETURN ARRAY['Protein intake context','Training-day context','Serving-size comparison'];
  ELSIF p_filter = 'sportnahrung' THEN
    RETURN ARRAY['Training and everyday use','Effect-size context','Limit visibility'];
  ELSE
    RETURN ARRAY['Catalog context','Evidence comparison','Risk visibility'];
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.first_studied(p_json jsonb)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT value
  FROM jsonb_array_elements_text(COALESCE(p_json, '[]'::jsonb)) AS x(value)
  WHERE btrim(value) <> ''
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION pg_temp.wie_de(p_gruppe text, p_filter text, p_name text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_gruppe = 'enhanced' THEN
    RETURN 'Der Bestand ordnet den Wirkstoff nach Klasse, Rechtslage, WADA-Status, Laborbezug und Warnungen ein. Das ist keine Anleitung und keine Bewertung einer Person.';
  ELSIF p_gruppe = 'peptide' THEN
    RETURN 'Peptide wirken ueber Rezeptoren oder Signalwege. Der Katalog haelt fest, welche Richtung bekannt ist und welche Daten fehlen.';
  ELSIF p_filter IN ('vitamine','mineralstoffe') THEN
    RETURN 'Der Koerper nutzt den Stoff in normalen Stoffwechselwegen. Entscheidend sind Form, Menge, bestehende Versorgung und moegliche Wechselwirkungen.';
  ELSE
    RETURN 'Der Stoff wird ueber bekannte Inhalts- oder Wirkgruppen eingeordnet. Wirkung, Groesse und Sicherheit haengen von Substanz, Form und Datenlage ab.';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.wie_en(p_gruppe text, p_filter text, p_name text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_gruppe = 'enhanced' THEN
    RETURN 'The data classifies the substance by class, legal status, WADA status, lab context and warnings. It is not a use guide or a judgment about a person.';
  ELSIF p_gruppe = 'peptide' THEN
    RETURN 'Peptides act through receptors or signaling pathways. The catalog records known direction and missing data.';
  ELSIF p_filter IN ('vitamine','mineralstoffe') THEN
    RETURN 'The body uses this substance in normal metabolic pathways. Form, amount, current intake and interactions matter.';
  ELSE
    RETURN 'The substance is classified by ingredient or effect group. Effect, size and safety depend on the substance, form and data quality.';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.bringt_de(p_grade text, p_studied text, p_is_parent boolean)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_is_parent THEN
    RETURN 'Dieser Sammelname fasst Formen zusammen. Ein gemeinsamer Dosisbereich oder Evidenzgrad wird nicht still aus einer einzelnen Form uebernommen.';
  ELSIF p_studied IS NOT NULL THEN
    RETURN 'Als Groessenordnung ist im Katalog hinterlegt: ' || p_studied || '. Das ist ein untersuchter Bereich, keine Einnahmeanweisung. Evidenzgrad: ' || COALESCE(p_grade, 'nicht gesetzt') || '.';
  ELSE
    RETURN 'Fuer diese Substanz steht kein belastbarer Mengenbereich im Katalog. Sichtbar bleibt die Belegklasse: ' || COALESCE(p_grade, 'nicht gesetzt') || '.';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.bringt_en(p_grade text, p_studied text, p_is_parent boolean)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_is_parent THEN
    RETURN 'This headline item groups several forms. No shared dose range or evidence grade is silently copied from one form.';
  ELSIF p_studied IS NOT NULL THEN
    RETURN 'The catalog contains this magnitude: ' || p_studied || '. It is a studied range, not an instruction. Evidence grade: ' || COALESCE(p_grade, 'not set') || '.';
  ELSE
    RETURN 'No supported amount range is stored for this substance. The visible evidence class is: ' || COALESCE(p_grade, 'not set') || '.';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.zu_viel_de(p_gruppe text, p_filter text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_gruppe = 'enhanced' THEN
    RETURN 'Zu viel oder falsch deklarierte Ware kann Laborwerte, Blutdruck, Blutfette, Leberwerte oder die Hormonachse verschieben. Konkrete Marker stehen im Laborblock, wenn sie belegt sind.';
  ELSIF p_gruppe = 'peptide' THEN
    RETURN 'Zu viel, falsche Reinheit oder falsche Deklaration kann den gemessenen Effekt unklar machen. Bei fehlenden Daten bleibt der Status unbekannt.';
  ELSIF p_filter = 'mineralstoffe' THEN
    RETURN 'Zu viel aus Supplementen kann Magen-Darm-Beschwerden, Wechselwirkungen oder Obergrenzen betreffen. Lebensmittel und Supplemente sind dabei getrennt zu sehen.';
  ELSIF p_filter = 'vitamine' THEN
    RETURN 'Zu viel ist vor allem bei fettloeslichen Vitaminen und belegten Obergrenzen relevant. Ohne belegte Grenze bleibt das Feld bewusst offen.';
  ELSE
    RETURN 'Zu viel kann bekannte Nebenwirkungen oder Wechselwirkungen wahrscheinlicher machen. Der Katalog zeigt nur belegte Grenzen.';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.zu_viel_en(p_gruppe text, p_filter text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_gruppe = 'enhanced' THEN
    RETURN 'Too much or mislabeled material can shift labs, blood pressure, lipids, liver markers or hormones. Specific markers appear only when supported.';
  ELSIF p_gruppe = 'peptide' THEN
    RETURN 'Too much, poor purity or wrong labeling can make the measured effect unclear. Missing data remains marked as unknown.';
  ELSIF p_filter = 'mineralstoffe' THEN
    RETURN 'High supplemental intake can affect gut tolerance, interactions or upper limits. Food and supplement intake are separate contexts.';
  ELSIF p_filter = 'vitamine' THEN
    RETURN 'High intake matters especially for fat-soluble vitamins and documented upper limits. If no limit is supported, the field stays open.';
  ELSE
    RETURN 'High intake can make known side effects or interactions more likely. The catalog shows only supported limits.';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.zu_wenig_de(p_filter text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_filter IN ('vitamine','mineralstoffe','protein_aminos')
      THEN 'Ein Mangelbild wird nur bei Naehrstoffen gezeigt und haengt von Messwerten, Referenzbereich und Zeitraum ab.'
    ELSE NULL
  END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.zu_wenig_en(p_filter text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_filter IN ('vitamine','mineralstoffe','protein_aminos')
      THEN 'Deficiency context is shown only for nutrients and depends on lab values, reference range and time window.'
    ELSE NULL
  END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.wann_de(p_gruppe text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_gruppe IN ('enhanced','peptide')
      THEN 'Zeitpunkt, Form und Kombination sind nicht als Anleitung hinterlegt. Der Katalog nennt nur dokumentierte Fakten und Warnpfade.'
    ELSE 'Zeitpunkt und Einnahmeform sind produkt- und stoffabhaengig. Der Katalog macht daraus keine persoenliche Einnahmeanweisung.'
  END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.wann_en(p_gruppe text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_gruppe IN ('enhanced','peptide')
      THEN 'Timing, form and combinations are not stored as instructions. The catalog states documented facts and warning paths only.'
    ELSE 'Timing and form depend on product and substance. The catalog does not turn that into a personal intake instruction.'
  END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.wer_nicht_de(p_gruppe text)
RETURNS text[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_gruppe = 'enhanced'
      THEN ARRAY['Minderjaehrige','Schwangere oder Stillende','Getestete Athleten','Personen mit Herz-, Leber- oder Nierenproblemen']
    WHEN p_gruppe = 'peptide'
      THEN ARRAY['Schwangere oder Stillende','Minderjaehrige','Personen ohne klares Monitoring','Getestete Athleten']
    ELSE ARRAY['Schwangere oder Stillende','Kinder und Jugendliche','Personen mit relevanten Medikamenten','Personen mit bekannten Unvertraeglichkeiten']
  END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.wer_nicht_en(p_gruppe text)
RETURNS text[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_gruppe = 'enhanced'
      THEN ARRAY['Minors','Pregnant or breastfeeding people','Tested athletes','People with heart, liver or kidney issues']
    WHEN p_gruppe = 'peptide'
      THEN ARRAY['Pregnant or breastfeeding people','Minors','People without clear monitoring','Tested athletes']
    ELSE ARRAY['Pregnant or breastfeeding people','Children and adolescents','People on relevant medications','People with known intolerance']
  END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.extra_recht_de(p_wada text, p_rx boolean)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 'WADA-Status: ' || COALESCE(NULLIF(p_wada,''), 'nicht hinterlegt') ||
         '. Verschreibungspflicht laut Bestand: ' || CASE WHEN p_rx THEN 'ja' ELSE 'nein oder unbekannt' END ||
         '. Das ist keine Rechtsberatung.';
$$;

CREATE OR REPLACE FUNCTION pg_temp.extra_recht_en(p_wada text, p_rx boolean)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 'WADA status: ' || COALESCE(NULLIF(p_wada,''), 'not stored') ||
         '. Prescription flag in data: ' || CASE WHEN p_rx THEN 'yes' ELSE 'no or unknown' END ||
         '. This is not legal advice.';
$$;

CREATE TEMP TABLE tmp_c257_targets ON COMMIT DROP AS
SELECT
  s.id,
  s.name_en,
  s.parent_id,
  g.code AS gruppe,
  c.slug AS filter,
  d.studied_dose_ranges,
  pg_temp.first_studied(d.studied_dose_ranges) AS studied_first,
  e.overall_grade,
  w.wada_status,
  r.prescription_required,
  EXISTS (SELECT 1 FROM tmp_c257_slug_map sm WHERE sm.new_slug = s.slug) AS is_local_parent
FROM supplements.supplements s
JOIN supplements.supplement_groups g ON g.id = s.group_id
JOIN supplements.supplement_categories c ON c.id = s.category_id
LEFT JOIN supplements.supplement_dosing d ON d.supplement_id = s.id
LEFT JOIN supplements.supplement_evidence e ON e.supplement_id = s.id
LEFT JOIN supplements.supplement_wada w ON w.supplement_id = s.id
LEFT JOIN supplements.supplement_regulatory r ON r.supplement_id = s.id AND r.jurisdiction = 'usa'
WHERE s.parent_id IS NULL
  AND (
    s.source IN ('kimi_supplement','kimi_peptide','kimi_performance')
    OR s.source = 'lumeos_supplement_catalog'
  );

UPDATE supplements.supplements s
SET description_de = pg_temp.kurz_de(t.gruppe, t.filter, t.name_en),
    description_en = pg_temp.kurz_en(t.gruppe, t.filter, t.name_en),
    description_th = NULL
FROM tmp_c257_targets t
WHERE t.id = s.id;

DELETE FROM supplements.supplement_user_texts;

INSERT INTO supplements.supplement_user_texts (
  supplement_id, status,
  kurz_was_de, kurz_was_en, kurz_was_th,
  wofuer_de, wofuer_en, wofuer_th,
  wie_wirkt_de, wie_wirkt_en, wie_wirkt_th,
  was_bringt_es_de, was_bringt_es_en, was_bringt_es_th,
  zu_viel_de, zu_viel_en, zu_viel_th,
  zu_wenig_de, zu_wenig_en, zu_wenig_th,
  wann_wie_de, wann_wie_en, wann_wie_th,
  wer_nicht_de, wer_nicht_en, wer_nicht_th,
  mythen_de, mythen_en, mythen_th,
  irreversibel_de, irreversibel_en, irreversibel_th,
  ueberwachung_de, ueberwachung_en, ueberwachung_th,
  nicht_im_blut_de, nicht_im_blut_en, nicht_im_blut_th,
  reinheit_de, reinheit_en, reinheit_th,
  rechtslage_klartext_de, rechtslage_klartext_en, rechtslage_klartext_th,
  source
)
SELECT
  t.id,
  'bekannt',
  pg_temp.kurz_de(t.gruppe, t.filter, t.name_en),
  pg_temp.kurz_en(t.gruppe, t.filter, t.name_en),
  NULL,
  pg_temp.wofuer_de(t.gruppe, t.filter),
  pg_temp.wofuer_en(t.gruppe, t.filter),
  NULL,
  pg_temp.wie_de(t.gruppe, t.filter, t.name_en),
  pg_temp.wie_en(t.gruppe, t.filter, t.name_en),
  NULL,
  pg_temp.bringt_de(t.overall_grade, t.studied_first, t.is_local_parent),
  pg_temp.bringt_en(t.overall_grade, t.studied_first, t.is_local_parent),
  NULL,
  pg_temp.zu_viel_de(t.gruppe, t.filter),
  pg_temp.zu_viel_en(t.gruppe, t.filter),
  NULL,
  pg_temp.zu_wenig_de(t.filter),
  pg_temp.zu_wenig_en(t.filter),
  NULL,
  pg_temp.wann_de(t.gruppe),
  pg_temp.wann_en(t.gruppe),
  NULL,
  pg_temp.wer_nicht_de(t.gruppe),
  pg_temp.wer_nicht_en(t.gruppe),
  NULL,
  CASE
    WHEN t.gruppe IN ('enhanced','peptide')
      THEN 'Mehr ist hier nicht automatisch mehr Wirkung; Datenluecken bleiben als Datenluecken sichtbar.'
    ELSE 'Ein Supplement ersetzt keine Messung und keine erfasste Ernaehrung. Der Katalog trennt Fakt von persoenlicher Entscheidung.'
  END,
  CASE
    WHEN t.gruppe IN ('enhanced','peptide')
      THEN 'More does not automatically mean more effect here; missing data remains visible as missing data.'
    ELSE 'A supplement does not replace measurement or logged nutrition. The catalog separates facts from personal decisions.'
  END,
  NULL,
  CASE WHEN t.gruppe IN ('enhanced','peptide') THEN 'Einzelne Effekte koennen laenger anhalten als der Einnahmezeitraum. Ob das hier belegt ist, steht in Safety, Warnungen und Laborbezug.' ELSE NULL END,
  CASE WHEN t.gruppe IN ('enhanced','peptide') THEN 'Some effects can outlast the intake period. Whether that is supported here is recorded in safety, warnings and lab context.' ELSE NULL END,
  NULL,
  CASE WHEN t.gruppe IN ('enhanced','peptide') THEN 'Labor- und Monitoringdaten zeigen nur, was im Katalog belegt ist. Fehlende Marker bedeuten nicht Entwarnung.' ELSE NULL END,
  CASE WHEN t.gruppe IN ('enhanced','peptide') THEN 'Lab and monitoring data show only what is supported in the catalog. Missing markers do not mean clearance.' ELSE NULL END,
  NULL,
  CASE WHEN t.gruppe IN ('enhanced','peptide') THEN 'Blutwerte zeigen nicht automatisch Produktreinheit, Blutdruck, Herzrhythmus, Stimmung oder Nebenwirkungen.' ELSE NULL END,
  CASE WHEN t.gruppe IN ('enhanced','peptide') THEN 'Blood tests do not automatically show product purity, blood pressure, heart rhythm, mood or side effects.' ELSE NULL END,
  NULL,
  CASE WHEN t.gruppe IN ('enhanced','peptide') THEN 'Reinheit und Deklaration sind eigene Risiken. Der Katalog nennt nur Daten, die als Quelle vorliegen.' ELSE NULL END,
  CASE WHEN t.gruppe IN ('enhanced','peptide') THEN 'Purity and labeling are separate risks. The catalog only states data that has a source.' ELSE NULL END,
  NULL,
  CASE WHEN t.gruppe IN ('enhanced','peptide') THEN pg_temp.extra_recht_de(t.wada_status, COALESCE(t.prescription_required, false)) ELSE NULL END,
  CASE WHEN t.gruppe IN ('enhanced','peptide') THEN pg_temp.extra_recht_en(t.wada_status, COALESCE(t.prescription_required, false)) ELSE NULL END,
  NULL,
  'c257_codex_research_2026-08-23'
FROM tmp_c257_targets t;

DELETE FROM supplements.supplement_faq;

INSERT INTO supplements.supplement_faq (
  supplement_id, frage_de, frage_en, frage_th, antwort_de, antwort_en, antwort_th, sort_order, source
)
SELECT
  t.id,
  q.frage_de,
  q.frage_en,
  NULL,
  q.antwort_de,
  q.antwort_en,
  NULL,
  q.sort_order,
  'c257_codex_research_2026-08-23'
FROM tmp_c257_targets t
CROSS JOIN LATERAL (
  VALUES
    (1,
     'Ist ' || t.name_en || ' eine Empfehlung?',
     'Is ' || t.name_en || ' a recommendation?',
     'Nein. Der Eintrag erklaert den Bestand, die Beleglage und Grenzen. Er sagt nicht, dass du es nehmen sollst.',
     'No. The entry explains the data, evidence and limits. It does not say that you should take it.'),
    (2,
     'Warum steht hier manchmal keine Menge?',
     'Why is there sometimes no amount?',
     'Weil kein belegter Bereich im Katalog liegt oder Formen sich unterscheiden. Dann bleibt die Menge leer statt geraten.',
     'Because no supported range is stored or forms differ. The amount stays empty instead of being guessed.'),
    (3,
     'Was ist bei Blutwerten wichtig?',
     'What matters for lab values?',
     'Wenn Laborbezug hinterlegt ist, zeigt der Katalog Richtung und Marker. Das ist Information, keine Diagnose.',
     'If lab context is stored, the catalog shows direction and markers. That is information, not a diagnosis.')
) AS q(sort_order, frage_de, frage_en, antwort_de, antwort_en);

INSERT INTO supplements.supplement_tag_definitions (
  code, name_de, name_en, name_th, tag_type, is_exclusion_relevant, icon, sort_order
) VALUES
  ('zweck_versorgung', 'Versorgung', 'Nutrient coverage', NULL, 'zweck', false, NULL, 10),
  ('zweck_training', 'Training', 'Training', NULL, 'zweck', false, NULL, 20),
  ('zweck_fokus', 'Fokus', 'Focus', NULL, 'zweck', false, NULL, 30),
  ('zweck_stoffwechsel', 'Stoffwechsel', 'Metabolism', NULL, 'zweck', false, NULL, 40),
  ('zweck_erholung', 'Erholung', 'Recovery', NULL, 'zweck', false, NULL, 50),
  ('zweck_hormon_labor', 'Hormon/Labor', 'Hormone/lab context', NULL, 'zweck', false, NULL, 60),
  ('zweck_recht_wada', 'Recht/WADA', 'Legal/WADA', NULL, 'zweck', false, NULL, 70)
ON CONFLICT (code) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  tag_type = EXCLUDED.tag_type,
  is_exclusion_relevant = EXCLUDED.is_exclusion_relevant,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;

DELETE FROM supplements.supplement_tags WHERE source = 'c257_codex_research_2026-08-23';

INSERT INTO supplements.supplement_tags (supplement_id, tag_code, confidence, source, evidence_grade)
SELECT t.id, tag_code, confidence, 'c257_codex_research_2026-08-23', t.overall_grade
FROM tmp_c257_targets t
CROSS JOIN LATERAL (
  SELECT CASE
    WHEN t.gruppe = 'enhanced' THEN 'zweck_hormon_labor'
    WHEN t.gruppe = 'peptide' THEN 'zweck_hormon_labor'
    WHEN t.filter IN ('vitamine','mineralstoffe') THEN 'zweck_versorgung'
    WHEN t.filter IN ('protein_aminos','sportnahrung') THEN 'zweck_training'
    WHEN t.filter = 'nootropika' THEN 'zweck_fokus'
    WHEN t.filter IN ('adaptogene','longevity') THEN 'zweck_erholung'
    ELSE 'zweck_stoffwechsel'
  END AS tag_code,
  0.75::numeric AS confidence
) x
ON CONFLICT (supplement_id, tag_code) DO UPDATE SET
  confidence = EXCLUDED.confidence,
  source = EXCLUDED.source,
  evidence_grade = EXCLUDED.evidence_grade;

INSERT INTO supplements.supplement_tags (supplement_id, tag_code, confidence, source, evidence_grade)
SELECT t.id, 'zweck_recht_wada', 0.90, 'c257_codex_research_2026-08-23', t.overall_grade
FROM tmp_c257_targets t
WHERE t.gruppe IN ('enhanced','peptide')
ON CONFLICT (supplement_id, tag_code) DO UPDATE SET
  confidence = EXCLUDED.confidence,
  source = EXCLUDED.source,
  evidence_grade = EXCLUDED.evidence_grade;

WITH parsed AS (
  SELECT
    s.id AS supplement_id,
    (regexp_match(pg_temp.first_studied(d.studied_dose_ranges), '([0-9]+(?:[.,][0-9]+)?)\s*(mg|mcg|ug|µg|g|IU|iu)')) AS m
  FROM supplements.supplements s
  JOIN supplements.supplement_dosing d ON d.supplement_id = s.id
  WHERE pg_temp.first_studied(d.studied_dose_ranges) IS NOT NULL
),
usable AS (
  SELECT
    supplement_id,
    replace(m[1], ',', '.')::numeric AS amount,
    CASE WHEN lower(m[2]) IN ('ug','µg') THEN 'mcg' ELSE m[2] END AS unit
  FROM parsed
  WHERE m IS NOT NULL
)
INSERT INTO supplements.supplement_portions (
  id, supplement_id, name_de, name_en, name_th, amount, unit, is_default, source
)
SELECT
  pg_temp.stable_uuid('c257_portion:' || supplement_id::text),
  supplement_id,
  'Belegte Studiengroesse',
  'Supported study amount',
  NULL,
  amount,
  unit,
  false,
  'c257_from_studied_dose_ranges'
FROM usable
ON CONFLICT (id) DO UPDATE SET
  amount = EXCLUDED.amount,
  unit = EXCLUDED.unit,
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  source = EXCLUDED.source;

WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY supplement_id, regexp_replace(lower(alias), '[^a-z0-9]+', '', 'g')
      ORDER BY
        CASE source
          WHEN 'kimi_crawl_027' THEN 1
          WHEN 'kimi_aliases' THEN 2
          WHEN 'lumeos_supplement_catalog' THEN 3
          WHEN 'f05_substance_catalog' THEN 4
          ELSE 9
        END,
        char_length(alias),
        id
    ) AS rn
  FROM supplements.supplement_aliases
)
DELETE FROM supplements.supplement_aliases a
USING ranked r
WHERE a.id = r.id
  AND r.rn > 1;

DO $$
DECLARE
  v_children INTEGER;
  v_targets INTEGER;
  v_supplement INTEGER;
  v_peptide INTEGER;
  v_enhanced INTEGER;
  v_faq INTEGER;
  v_alias_extra INTEGER;
  v_short_bad INTEGER;
  v_jargon_bad INTEGER;
  v_generated_error TEXT;
BEGIN
  SELECT count(*) INTO v_children FROM supplements.supplements WHERE parent_id IS NOT NULL;
  IF v_children <> 29 THEN
    RAISE EXCEPTION 'C-257/C-244 Unterformen: %, erwartet 29', v_children;
  END IF;

  SELECT count(*) INTO v_targets FROM supplements.supplement_user_texts;
  IF v_targets <> 289 THEN
    RAISE EXCEPTION 'C-257 Nutzertexte: %, erwartet 289', v_targets;
  END IF;

  SELECT count(*) INTO v_supplement
  FROM supplements.supplement_user_texts t
  JOIN supplements.supplements s ON s.id=t.supplement_id
  JOIN supplements.supplement_groups g ON g.id=s.group_id
  WHERE g.code='supplement';
  SELECT count(*) INTO v_peptide
  FROM supplements.supplement_user_texts t
  JOIN supplements.supplements s ON s.id=t.supplement_id
  JOIN supplements.supplement_groups g ON g.id=s.group_id
  WHERE g.code='peptide';
  SELECT count(*) INTO v_enhanced
  FROM supplements.supplement_user_texts t
  JOIN supplements.supplements s ON s.id=t.supplement_id
  JOIN supplements.supplement_groups g ON g.id=s.group_id
  WHERE g.code='enhanced';
  IF v_supplement <> 153 OR v_peptide <> 61 OR v_enhanced <> 75 THEN
    RAISE EXCEPTION 'C-257 Textgruppen supplement/peptide/enhanced: %/%/%, erwartet 153/61/75',
      v_supplement, v_peptide, v_enhanced;
  END IF;

  SELECT count(*) INTO v_faq FROM supplements.supplement_faq;
  IF v_faq <> 867 THEN
    RAISE EXCEPTION 'C-257 FAQ: %, erwartet 867', v_faq;
  END IF;

  WITH folded AS (
    SELECT supplement_id, regexp_replace(lower(alias), '[^a-z0-9]+', '', 'g') AS folded, count(*) AS n
    FROM supplements.supplement_aliases
    GROUP BY supplement_id, regexp_replace(lower(alias), '[^a-z0-9]+', '', 'g')
  )
  SELECT COALESCE(sum(n - 1) FILTER (WHERE n > 1), 0)::integer INTO v_alias_extra FROM folded;
  IF v_alias_extra <> 0 THEN
    RAISE EXCEPTION 'C-257 Alias-Dubletten: %, erwartet 0', v_alias_extra;
  END IF;

  SELECT count(*) INTO v_short_bad
  FROM supplements.supplement_user_texts
  WHERE char_length(kurz_was_de) > 140 OR char_length(kurz_was_en) > 140;
  IF v_short_bad <> 0 THEN
    RAISE EXCEPTION 'C-257 Kurztexte ueber 140 Zeichen: %', v_short_bad;
  END IF;

  SELECT count(*) INTO v_jargon_bad
  FROM supplements.supplement_user_texts
  WHERE kurz_was_de ~* '(MPS|Bioverfuegbarkeit|Halbwertszeit|Rezeptoragonist|hepatisch)'
     OR kurz_was_en ~* '(MPS|bioavailability|half-life|receptor agonist|hepatic)';
  IF v_jargon_bad <> 0 THEN
    RAISE EXCEPTION 'C-257 Fachwort im kurz_was: %', v_jargon_bad;
  END IF;

  BEGIN
    UPDATE supplements.supplements
    SET im_katalog = true
    WHERE id = (SELECT id FROM supplements.supplements WHERE parent_id IS NOT NULL LIMIT 1);
  EXCEPTION WHEN generated_always THEN
    v_generated_error := 'generated';
  WHEN others THEN
    IF SQLSTATE = '428C9' THEN
      v_generated_error := 'generated';
    ELSE
      RAISE;
    END IF;
  END;
  IF v_generated_error <> 'generated' THEN
    RAISE EXCEPTION 'C-257 im_katalog-Generiert-Gegenprobe schlug nicht an: %', COALESCE(v_generated_error, 'kein Fehler');
  END IF;

  RAISE NOTICE 'C-257 Nutzertexte: supplement %, peptide %, enhanced %, FAQ %, Unterformen %, Alias-Dubletten %',
    v_supplement, v_peptide, v_enhanced, v_faq, v_children, v_alias_extra;
END $$;

COMMIT;
