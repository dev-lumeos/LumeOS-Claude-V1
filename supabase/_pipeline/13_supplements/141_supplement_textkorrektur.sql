-- =============================================================
-- 141s -- Supplements: Textkorrektur und Handelsnamen (C-258)
-- Datum: 2026-08-24
-- Zweck:
--   C-257-Schablonentexte ersetzen, F-05-Handelsnamen an sichtbare
--   Wirkstoffe haengen und Kombinationen weiter verborgen lassen.
--
-- Abschnitt 0:
--   248 verborgene F-05-Zeilen wurden vorab klassifiziert:
--   21 Handelsnamen, 17 Kombinationen, 210 eigene Stoffe.
--   Die 210 eigenen Stoffe sind eine Umfangsausweitung und werden hier
--   nicht still sichtbar gemacht.
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

CREATE TEMP TABLE tmp_c258_trade_map (
  hidden_name text primary key,
  target_name text not null,
  display_name text
) ON COMMIT DROP;

INSERT INTO tmp_c258_trade_map(hidden_name, target_name, display_name) VALUES
  ('Anadrol (Oxymetholone)', 'Oxymetholone', 'Oxymetholone (Anadrol)'),
  ('Anavar (Oxandrolone)', 'Oxandrolone', 'Oxandrolone (Anavar)'),
  ('Boldenone Acetate', 'Boldenone undecylenate', 'Boldenone undecylenate'),
  ('Boldenone Cypionate', 'Boldenone undecylenate', 'Boldenone undecylenate'),
  ('Dianabol (Methandrostenolone)', 'Methandienone', 'Methandienone (Dianabol)'),
  ('Ashwagandha', 'Ashwagandha (KSM-66)', 'Ashwagandha (KSM-66/Sensoril)'),
  ('Ashwagandha (Sensoril)', 'Ashwagandha (KSM-66)', 'Ashwagandha (KSM-66/Sensoril)'),
  ('Bacopa Monnieri', 'Bacopa monnieri (standardized bacosides)', 'Bacopa monnieri (standardized bacosides)'),
  ('Caffeine', 'Caffeine', null),
  ('Calcium', 'Calcium', null),
  ('Iron', 'Iron', null),
  ('Magnesium', 'Magnesium', null),
  ('Tongkat Ali', 'Tongkat Ali', null),
  ('Vitamin B12', 'Vitamin B12', null),
  ('Vitamin B6', 'Vitamin B6', null),
  ('Vitamin C', 'Vitamin C', null),
  ('Vitamin D3', 'Vitamin D3', null),
  ('Vitamin E', 'Vitamin E', null),
  ('Vitamin K2 (MK-7)', 'Vitamin K2 (MK-7)', null),
  ('Whey Protein', 'Whey Protein', null),
  ('Zinc', 'Zinc', null);

WITH pairs AS (
  SELECT h.id AS hidden_id, h.name_en AS hidden_name, t.id AS target_id, t.name_en AS target_name, m.display_name
  FROM tmp_c258_trade_map m
  JOIN supplements.supplements h ON lower(h.name_en)=lower(m.hidden_name)
    AND h.source='f05_substance_candidate'
    AND h.parent_id IS NULL
    AND NOT h.im_katalog
  JOIN supplements.supplements t ON lower(t.name_en)=lower(m.target_name)
    AND t.im_katalog
)
UPDATE supplements.supplements h
SET parent_id = p.target_id,
    form_note_de = 'Handels-, Trivial- oder Sammelname fuer den sichtbaren Wirkstoff ' || p.target_name || '.',
    form_note_en = 'Trade, common or umbrella name for the visible substance ' || p.target_name || '.'
FROM pairs p
WHERE h.id = p.hidden_id;

WITH pairs AS (
  SELECT h.id AS hidden_id, h.name_en AS hidden_name, t.id AS target_id, t.name_en AS target_name
  FROM tmp_c258_trade_map m
  JOIN supplements.supplements h ON lower(h.name_en)=lower(m.hidden_name)
    AND h.source='f05_substance_candidate'
  JOIN supplements.supplements t ON lower(t.name_en)=lower(m.target_name)
    AND t.im_katalog
  WHERE lower(h.name_en) <> lower(t.name_en)
)
INSERT INTO supplements.supplement_aliases (id, supplement_id, alias, locale, source)
SELECT
  pg_temp.stable_uuid('c258_alias:' || target_id::text || ':' || lower(hidden_name)),
  target_id,
  hidden_name,
  'en',
  'c258_trade_name'
FROM pairs
WHERE NOT EXISTS (
  SELECT 1
  FROM supplements.supplement_aliases a
  WHERE a.supplement_id = pairs.target_id
    AND regexp_replace(lower(a.alias), '[^a-z0-9]+', '', 'g') =
        regexp_replace(lower(pairs.hidden_name), '[^a-z0-9]+', '', 'g')
);

WITH renames AS (
  SELECT t.id, max(m.display_name) AS display_name
  FROM tmp_c258_trade_map m
  JOIN supplements.supplements t ON lower(t.name_en)=lower(m.target_name)
  WHERE m.display_name IS NOT NULL
  GROUP BY t.id
)
UPDATE supplements.supplements s
SET name_en = r.display_name
FROM renames r
WHERE s.id = r.id;

UPDATE supplements.supplements
SET form = CASE
  WHEN form IS NOT NULL AND btrim(form) <> '' THEN form
  WHEN name_en ~* '(injectable|injection|depot|suspension)' THEN 'injectable'
  WHEN name_en ~* '(oral|tablet|capsule)' THEN 'oral'
  WHEN name_en ~* '(ester|enanthate|cypionate|propionate|undecanoate|decanoate|acetate)' THEN 'ester'
  WHEN name_en ~* '(extract|root|mushroom|oil)' THEN 'extract'
  WHEN name_en ~* '(isolate|concentrate|hydrolysate)' THEN 'protein form'
  WHEN name_en ~* '(citrate|glycinate|oxide|malate|taurate|chloride|carbonate|sulfate|picolinate|gluconate)' THEN 'salt form'
  ELSE form
END
WHERE form IS NULL OR btrim(form) = '';

CREATE OR REPLACE VIEW supplements.supplement_forms_read
WITH (security_invoker = true)
AS
SELECT
  p.id AS parent_id,
  p.slug AS parent_slug,
  p.name_de AS parent_name_de,
  p.name_en AS parent_name_en,
  c.id AS form_id,
  c.slug AS form_slug,
  c.name_de AS form_name_de,
  c.name_en AS form_name_en,
  c.form,
  c.form_note_de,
  c.form_note_en,
  c.evidence_grade,
  c.im_katalog
FROM supplements.supplements p
JOIN supplements.supplements c ON c.parent_id = p.id;

GRANT SELECT ON supplements.supplement_forms_read TO authenticated;
GRANT SELECT ON supplements.supplement_forms_read TO service_role;

CREATE OR REPLACE FUNCTION pg_temp.clean_name(p_name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT regexp_replace(coalesce(p_name, 'Diese Substanz'), '\s+', ' ', 'g');
$$;

CREATE OR REPLACE FUNCTION pg_temp.kind_de(p_name text, p_group text, p_filter text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE n text := lower(coalesce(p_name,''));
BEGIN
  IF n LIKE '%creatine%' OR n LIKE '%kreatin%' THEN RETURN 'Kreatin ist eine koerpereigene Verbindung aus drei Aminosaeuren und dient im Muskel als schneller Energiespeicher.'; END IF;
  IF n LIKE '%magnesium%' THEN RETURN 'Magnesium ist ein Mineralstoff, den Nerven, Muskeln und viele Enzyme fuer normale Arbeit brauchen.'; END IF;
  IF n LIKE '%vitamin d%' THEN RETURN 'Vitamin D ist ein fettloesliches Vitamin und Hormonvorlaeufer fuer Knochenstoffwechsel, Calciumaufnahme und Immunfunktionen.'; END IF;
  IF n LIKE '%whey%' OR n LIKE '%molken%' THEN RETURN 'Whey ist Molkenprotein aus Milch und liefert schnell verfuegbare Eiweissbausteine.'; END IF;
  IF n LIKE '%zinc%' THEN RETURN 'Zink ist ein Spurenelement fuer Immunsystem, Haut, Wundheilung und viele Enzyme.'; END IF;
  IF n LIKE '%caffeine%' THEN RETURN 'Koffein ist ein stimulierender Stoff aus Kaffee, Tee und anderen Pflanzen und blockiert im Gehirn Adenosin-Signale.'; END IF;
  IF n LIKE '%bacopa%' THEN RETURN 'Bacopa ist eine ayurvedisch genutzte Pflanze, deren Extrakte vor allem wegen Bacosiden untersucht werden.'; END IF;
  IF n LIKE '%ashwagandha%' THEN RETURN 'Ashwagandha ist eine Wurzelpflanze aus der Ayurveda-Tradition und wird meist als standardisierter Extrakt erfasst.'; END IF;
  IF n LIKE '%methandienone%' OR n LIKE '%dianabol%' THEN RETURN 'Methandienon ist ein orales anaboles Steroid, bekannt unter dem Handelsnamen Dianabol.'; END IF;
  IF n LIKE '%oxandrolone%' OR n LIKE '%anavar%' THEN RETURN 'Oxandrolon ist ein synthetisches anaboles Steroid, bekannt unter dem Handelsnamen Anavar.'; END IF;
  IF n LIKE '%oxymetholone%' OR n LIKE '%anadrol%' THEN RETURN 'Oxymetholon ist ein starkes orales anaboles Steroid, bekannt unter dem Handelsnamen Anadrol.'; END IF;
  IF n LIKE '%semaglutide%' THEN RETURN 'Semaglutid ist ein GLP-1-Rezeptoragonist und beeinflusst Hunger, Magenentleerung und Blutzuckerregulation.'; END IF;
  IF n LIKE '%cardarine%' OR n LIKE '%gw-501516%' THEN RETURN 'Cardarine ist ein PPAR-delta-Wirkstoff aus der Forschung und kein zugelassenes Nahrungsergaenzungsmittel.'; END IF;
  IF n LIKE '%bromocriptine%' THEN RETURN 'Bromocriptin ahmt Dopamin nach und senkt dadurch die Ausschuettung von Prolaktin.'; END IF;
  IF p_group = 'enhanced' THEN RETURN pg_temp.clean_name(p_name) || ' ist ein hormon-, leistungs- oder stoffwechselbezogener Wirkstoff aus dem Enhanced-Bereich.'; END IF;
  IF p_group = 'peptide' THEN RETURN pg_temp.clean_name(p_name) || ' ist ein Peptid oder peptidnaher Wirkstoff, der ueber Signalwege und Rezeptoren eingeordnet wird.'; END IF;
  IF p_filter = 'vitamine' THEN RETURN pg_temp.clean_name(p_name) || ' gehoert zu den Vitaminen oder vitaminverwandten Stoffen und wird nach Versorgung, Bereich und Obergrenze eingeordnet.'; END IF;
  IF p_filter = 'mineralstoffe' THEN RETURN pg_temp.clean_name(p_name) || ' gehoert zu den Mineralstoffen oder Spurenelementen und wird ueber Menge, Versorgung und Wechselwirkungen eingeordnet.'; END IF;
  IF p_filter = 'botanicals' THEN RETURN pg_temp.clean_name(p_name) || ' ist ein pflanzlicher oder pilzbasierter Stoff, bei dem Extrakt, Pflanzenteil und Standardisierung entscheidend sind.'; END IF;
  IF p_filter = 'nootropika' THEN RETURN pg_temp.clean_name(p_name) || ' ist ein Stoff aus dem Nootropika-Bereich und wird nach Fokus, Wachheit oder kognitivem Kontext eingeordnet.'; END IF;
  IF p_filter = 'protein_aminos' THEN RETURN pg_temp.clean_name(p_name) || ' liefert Eiweissbausteine, Aminosaeuren oder proteinbezogene Bausteine fuer den Stoffwechsel.'; END IF;
  RETURN pg_temp.clean_name(p_name) || ' ist eine eigenstaendige Substanz im Supplementkatalog und wird nach Stoffklasse, Datenlage und Grenzen eingeordnet.';
END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.kind_en(p_name text, p_group text, p_filter text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE n text := lower(coalesce(p_name,''));
BEGIN
  IF n LIKE '%creatine%' THEN RETURN 'Creatine is a body-made compound from three amino acids and works as a fast energy store in muscle.'; END IF;
  IF n LIKE '%magnesium%' THEN RETURN 'Magnesium is a mineral used by nerves, muscles and many enzymes for normal function.'; END IF;
  IF n LIKE '%vitamin d%' THEN RETURN 'Vitamin D is a fat-soluble vitamin and hormone precursor for calcium absorption, bone metabolism and immune functions.'; END IF;
  IF n LIKE '%whey%' THEN RETURN 'Whey is milk-derived protein that provides quickly available protein building blocks.'; END IF;
  IF n LIKE '%zinc%' THEN RETURN 'Zinc is a trace element for immune function, skin, wound healing and many enzymes.'; END IF;
  IF n LIKE '%caffeine%' THEN RETURN 'Caffeine is a stimulant found in coffee, tea and other plants and blocks adenosine signaling in the brain.'; END IF;
  IF n LIKE '%bacopa%' THEN RETURN 'Bacopa is an Ayurvedic plant whose extracts are mainly studied for bacosides.'; END IF;
  IF n LIKE '%ashwagandha%' THEN RETURN 'Ashwagandha is a root plant from Ayurvedic use, usually recorded as a standardized extract.'; END IF;
  IF n LIKE '%methandienone%' OR n LIKE '%dianabol%' THEN RETURN 'Methandienone is an oral anabolic steroid also known by the trade name Dianabol.'; END IF;
  IF n LIKE '%oxandrolone%' OR n LIKE '%anavar%' THEN RETURN 'Oxandrolone is a synthetic anabolic steroid also known by the trade name Anavar.'; END IF;
  IF n LIKE '%oxymetholone%' OR n LIKE '%anadrol%' THEN RETURN 'Oxymetholone is a potent oral anabolic steroid also known by the trade name Anadrol.'; END IF;
  IF n LIKE '%semaglutide%' THEN RETURN 'Semaglutide is a GLP-1 receptor agonist that affects appetite, gastric emptying and glucose regulation.'; END IF;
  IF n LIKE '%cardarine%' OR n LIKE '%gw-501516%' THEN RETURN 'Cardarine is a research PPAR-delta compound and not an approved dietary supplement.'; END IF;
  IF n LIKE '%bromocriptine%' THEN RETURN 'Bromocriptine mimics dopamine and thereby lowers prolactin release.'; END IF;
  IF p_group = 'enhanced' THEN RETURN pg_temp.clean_name(p_name) || ' is a hormone-, performance- or metabolism-related substance in the enhanced category.'; END IF;
  IF p_group = 'peptide' THEN RETURN pg_temp.clean_name(p_name) || ' is a peptide or peptide-like substance classified by signaling pathway and receptor context.'; END IF;
  IF p_filter = 'vitamine' THEN RETURN pg_temp.clean_name(p_name) || ' belongs to vitamins or vitamin-like substances and is tracked by intake, range and upper limit.'; END IF;
  IF p_filter = 'mineralstoffe' THEN RETURN pg_temp.clean_name(p_name) || ' belongs to minerals or trace elements and is tracked through amount, coverage and interactions.'; END IF;
  IF p_filter = 'botanicals' THEN RETURN pg_temp.clean_name(p_name) || ' is a plant- or mushroom-based substance where extract, plant part and standardization matter.'; END IF;
  IF p_filter = 'nootropika' THEN RETURN pg_temp.clean_name(p_name) || ' is in the nootropic area and is tracked by focus, alertness or cognitive context.'; END IF;
  IF p_filter = 'protein_aminos' THEN RETURN pg_temp.clean_name(p_name) || ' provides protein building blocks, amino acids or protein-related metabolic components.'; END IF;
  RETURN pg_temp.clean_name(p_name) || ' is a distinct catalog substance classified by substance class, data quality and limits.';
END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.wofuer_de(p_group text, p_filter text)
RETURNS text[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_group = 'enhanced' THEN ARRAY['Hormon- und Leistungsbezug','Laborveraenderungen erkennen','Rechts- und WADA-Kontext']
    WHEN p_group = 'peptide' THEN ARRAY['Signalwege einordnen','Monitoring planen','Reinheitsrisiken sehen']
    WHEN p_filter = 'vitamine' THEN ARRAY['Versorgung einordnen','Mangel- und Uebermass-Kontext','Laborwerte verstehen']
    WHEN p_filter = 'mineralstoffe' THEN ARRAY['Mineralstoffversorgung','Obergrenzen beachten','Wechselwirkungen erkennen']
    WHEN p_filter = 'protein_aminos' THEN ARRAY['Eiweissbausteine liefern','Trainingstage einordnen','Portionen vergleichen']
    WHEN p_filter = 'nootropika' THEN ARRAY['Fokus-Kontext','Wachheit einordnen','Unsichere Daten sichtbar halten']
    ELSE ARRAY['Stoffklasse verstehen','Beleglage einordnen','Grenzen und Risiken sehen']
  END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.wofuer_en(p_group text, p_filter text)
RETURNS text[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_group = 'enhanced' THEN ARRAY['Hormone and performance context','Lab shifts visible','Legal and WADA context']
    WHEN p_group = 'peptide' THEN ARRAY['Signal pathway context','Monitoring context','Purity-risk context']
    WHEN p_filter = 'vitamine' THEN ARRAY['Coverage context','Low and high intake context','Lab-value context']
    WHEN p_filter = 'mineralstoffe' THEN ARRAY['Mineral coverage','Upper-limit context','Interaction context']
    WHEN p_filter = 'protein_aminos' THEN ARRAY['Protein building blocks','Training-day context','Serving comparison']
    WHEN p_filter = 'nootropika' THEN ARRAY['Focus context','Alertness context','Missing data visible']
    ELSE ARRAY['Substance class context','Evidence context','Limits and risks']
  END;
$$;

CREATE TEMP TABLE tmp_c258_targets ON COMMIT DROP AS
SELECT
  s.id,
  s.name_en,
  s.slug,
  g.code AS gruppe,
  c.slug AS filter,
  e.overall_grade,
  e.summary_en,
  e.human_trials,
  e.randomized_trials,
  d.studied_dose_ranges,
  d.upper_limit,
  d.usage_hint_en,
  saf.common_side_effects_en,
  saf.serious_side_effects_en,
  w.wada_status,
  EXISTS (SELECT 1 FROM supplements.supplements ch WHERE ch.parent_id=s.id) AS has_forms
FROM supplements.supplements s
JOIN supplements.supplement_groups g ON g.id=s.group_id
JOIN supplements.supplement_categories c ON c.id=s.category_id
LEFT JOIN supplements.supplement_evidence e ON e.supplement_id=s.id
LEFT JOIN supplements.supplement_dosing d ON d.supplement_id=s.id
LEFT JOIN supplements.supplement_safety saf ON saf.supplement_id=s.id
LEFT JOIN supplements.supplement_wada w ON w.supplement_id=s.id
WHERE s.im_katalog;

UPDATE supplements.supplements s
SET description_de = pg_temp.kind_de(t.name_en, t.gruppe, t.filter) || ' ' ||
                     CASE WHEN t.has_forms THEN 'Unterformen sind darunter getrennt sichtbar.' ELSE 'Der Eintrag bleibt auf Substanzebene, nicht auf Produktebene.' END,
    description_en = pg_temp.kind_en(t.name_en, t.gruppe, t.filter) || ' ' ||
                     CASE WHEN t.has_forms THEN 'Forms are shown below it separately.' ELSE 'The entry stays at substance level, not product level.' END
FROM tmp_c258_targets t
WHERE s.id=t.id;

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
  left(pg_temp.kind_de(t.name_en, t.gruppe, t.filter), 140),
  left(pg_temp.kind_en(t.name_en, t.gruppe, t.filter), 140),
  NULL,
  pg_temp.wofuer_de(t.gruppe, t.filter),
  pg_temp.wofuer_en(t.gruppe, t.filter),
  NULL,
  CASE
    WHEN t.summary_en IS NOT NULL AND t.summary_en <> '' THEN 'Der Fachdatensatz beschreibt: ' || t.summary_en || ' In der Anzeige wird das in Alltagssprache mit Stoffklasse und Datenlage verbunden.'
    ELSE 'Die Einordnung kommt aus Stoffklasse, Zweckfilter und vorhandenen Warn- oder Monitoringdaten. Fehlende Zahlen bleiben leer statt geraten.'
  END,
  CASE
    WHEN t.summary_en IS NOT NULL AND t.summary_en <> '' THEN 'The source data states: ' || t.summary_en || ' The display connects this with substance class and data quality.'
    ELSE 'Classification comes from substance class, purpose filter and available warning or monitoring data. Missing numbers stay empty.'
  END,
  NULL,
  CASE
    WHEN jsonb_array_length(coalesce(t.studied_dose_ranges, '[]'::jsonb)) > 0 THEN 'Als belegte Groessenordnung liegt im Katalog: ' || (t.studied_dose_ranges->>0) || '. Das ist ein dokumentierter Bereich, keine Einnahmeanweisung.'
    WHEN t.overall_grade IS NOT NULL THEN 'Ein Evidenzgrad ist vorhanden (' || t.overall_grade || '), aber kein belegter Mengenbereich. Der Nutzen wird deshalb nicht mit einer geratenen Zahl beziffert.'
    ELSE 'Fuer diese Substanz ist kein belastbarer Mengen- oder Nutzenbereich hinterlegt. Der Eintrag erklaert die Stoffklasse und laesst Zahlen offen.'
  END,
  CASE
    WHEN jsonb_array_length(coalesce(t.studied_dose_ranges, '[]'::jsonb)) > 0 THEN 'The catalog contains this magnitude: ' || (t.studied_dose_ranges->>0) || '. It is a documented range, not an instruction.'
    WHEN t.overall_grade IS NOT NULL THEN 'An evidence grade is present (' || t.overall_grade || '), but no supported amount range. The effect is not quantified with a guessed number.'
    ELSE 'No supported amount or effect range is stored. The entry explains the substance class and leaves numbers open.'
  END,
  NULL,
  CASE
    WHEN array_length(t.serious_side_effects_en, 1) IS NOT NULL THEN 'Zu viel oder falsche Ware kann relevant werden; ernstere gemeldete Punkte im Bestand: ' || array_to_string(t.serious_side_effects_en, ', ')
    WHEN array_length(t.common_side_effects_en, 1) IS NOT NULL THEN 'Bei zu viel stehen vor allem bekannte Nebenwirkungen im Vordergrund: ' || array_to_string(t.common_side_effects_en, ', ')
    ELSE 'Zu viel wird nur dort konkret beziffert, wo der Katalog eine Obergrenze oder Nebenwirkungen belegt. Sonst bleibt die Angabe offen.'
  END,
  CASE
    WHEN array_length(t.serious_side_effects_en, 1) IS NOT NULL THEN 'Too much or mislabeled material can matter; serious stored points: ' || array_to_string(t.serious_side_effects_en, ', ')
    WHEN array_length(t.common_side_effects_en, 1) IS NOT NULL THEN 'High intake mainly points to known side effects: ' || array_to_string(t.common_side_effects_en, ', ')
    ELSE 'High intake is quantified only where an upper limit or side effects are supported. Otherwise the field remains open.'
  END,
  NULL,
  CASE WHEN t.filter IN ('vitamine','mineralstoffe','protein_aminos') THEN 'Ein echter Mangelbezug gehoert zu Naehrstoffen und wird mit Messwert, Referenzbereich und Zeitraum gelesen.' ELSE NULL END,
  CASE WHEN t.filter IN ('vitamine','mineralstoffe','protein_aminos') THEN 'True deficiency context belongs to nutrients and is read with lab value, reference range and time window.' ELSE NULL END,
  NULL,
  CASE WHEN t.usage_hint_en IS NOT NULL AND t.usage_hint_en <> '' THEN 'Hinweis aus dem Bestand: ' || t.usage_hint_en || ' Das bleibt ein Sachhinweis, keine persoenliche Anweisung.' ELSE 'Zeitpunkt und Form haengen von Stoff und Produkt ab. Der Katalog macht daraus keine persoenliche Anweisung.' END,
  CASE WHEN t.usage_hint_en IS NOT NULL AND t.usage_hint_en <> '' THEN 'Stored note: ' || t.usage_hint_en || ' It remains factual context, not a personal instruction.' ELSE 'Timing and form depend on substance and product. The catalog does not turn this into personal instructions.' END,
  NULL,
  CASE WHEN t.gruppe IN ('enhanced','peptide') THEN ARRAY['Minderjaehrige','Schwangere oder Stillende','Getestete Athleten','Personen ohne passende Ueberwachung'] ELSE ARRAY['Schwangere oder Stillende','Kinder und Jugendliche','Personen mit relevanten Medikamenten','Personen mit bekannter Unvertraeglichkeit'] END,
  CASE WHEN t.gruppe IN ('enhanced','peptide') THEN ARRAY['Minors','Pregnant or breastfeeding people','Tested athletes','People without suitable monitoring'] ELSE ARRAY['Pregnant or breastfeeding people','Children and adolescents','People on relevant medication','People with known intolerance'] END,
  NULL,
  'Hauefiger Irrtum: Ein Katalogeintrag ist keine Empfehlung. Er beschreibt, was ueber ' || t.name_en || ' hinterlegt ist und was offen bleibt.',
  'Common misconception: a catalog entry is not a recommendation. It describes what is stored for ' || t.name_en || ' and what remains open.',
  NULL,
  CASE WHEN t.gruppe IN ('enhanced','peptide') THEN 'Manche Wirkungen koennen laenger anhalten als die Nutzung. Ob das fuer ' || t.name_en || ' belegt ist, steht in Safety, Monitoring und Laborbezug.' ELSE NULL END,
  CASE WHEN t.gruppe IN ('enhanced','peptide') THEN 'Some effects can outlast use. Whether this is supported for ' || t.name_en || ' is recorded in safety, monitoring and lab context.' ELSE NULL END,
  NULL,
  CASE WHEN t.gruppe IN ('enhanced','peptide') THEN 'Wenn Monitoring hinterlegt ist, gehoert es zu ' || t.name_en || ' als Sachinformation. Fehlende Marker bedeuten nicht Entwarnung.' ELSE NULL END,
  CASE WHEN t.gruppe IN ('enhanced','peptide') THEN 'If monitoring is stored, it belongs to ' || t.name_en || ' as factual context. Missing markers do not mean clearance.' ELSE NULL END,
  NULL,
  CASE WHEN t.gruppe IN ('enhanced','peptide') THEN 'Blutwerte zeigen nicht automatisch Reinheit, Blutdruck, Herzrhythmus, Stimmung oder Produktverwechslungen.' ELSE NULL END,
  CASE WHEN t.gruppe IN ('enhanced','peptide') THEN 'Blood tests do not automatically show purity, blood pressure, heart rhythm, mood or product substitution.' ELSE NULL END,
  NULL,
  CASE WHEN t.gruppe IN ('enhanced','peptide') THEN 'Bei ' || t.name_en || ' bleibt Produktreinheit eine eigene Frage. Die Datenbank trennt Stoffwissen von Anbieter- und Produktangaben.' ELSE NULL END,
  CASE WHEN t.gruppe IN ('enhanced','peptide') THEN 'For ' || t.name_en || ', product purity remains a separate question. The database separates substance facts from supplier and product data.' ELSE NULL END,
  NULL,
  CASE WHEN t.gruppe IN ('enhanced','peptide') THEN 'WADA-Status laut Bestand: ' || COALESCE(t.wada_status, 'nicht hinterlegt') || '. Das ist Kataloginformation, keine Rechtsberatung.' ELSE NULL END,
  CASE WHEN t.gruppe IN ('enhanced','peptide') THEN 'WADA status in the data: ' || COALESCE(t.wada_status, 'not stored') || '. This is catalog information, not legal advice.' ELSE NULL END,
  NULL,
  'c258_codex_textkorrektur_2026-08-24'
FROM tmp_c258_targets t;

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
  'c258_codex_textkorrektur_2026-08-24'
FROM tmp_c258_targets t
CROSS JOIN LATERAL (
  VALUES
    (1,
     'Was ist ' || t.name_en || ' in einfachen Worten?',
     'What is ' || t.name_en || ' in simple terms?',
     pg_temp.kind_de(t.name_en, t.gruppe, t.filter) || ' Der Eintrag beschreibt den Stoff, nicht ein Produkt.',
     pg_temp.kind_en(t.name_en, t.gruppe, t.filter) || ' The entry describes the substance, not a product.'),
    (2,
     'Was ist bei ' || t.name_en || ' der wichtigste Haken?',
     'What is the main caveat for ' || t.name_en || '?',
     CASE WHEN t.gruppe IN ('enhanced','peptide') THEN 'Bei ' || t.name_en || ' ist der wichtigste Haken nicht nur die Wirkung, sondern Ueberwachung, Rechtslage, Reinheit und ob der Inhalt der Aufschrift entspricht.'
          WHEN t.has_forms THEN 'Bei ' || t.name_en || ' ist der wichtigste Haken die Form: Unterformen koennen sich in Loeslichkeit, Vertraeglichkeit oder Datenlage unterscheiden.'
          ELSE 'Bei ' || t.name_en || ' ist der wichtigste Haken die Datenlage: Zahlen werden nur gezeigt, wenn sie belegt sind.' END,
     CASE WHEN t.gruppe IN ('enhanced','peptide') THEN 'For ' || t.name_en || ', the main caveat is not only effect, but monitoring, legal status, purity and whether the label matches the content.'
          WHEN t.has_forms THEN 'For ' || t.name_en || ', the main caveat is form: subforms can differ in solubility, tolerance or data quality.'
          ELSE 'For ' || t.name_en || ', the main caveat is data quality: numbers are shown only when supported.' END),
    (3,
     'Welche Zahl zu ' || t.name_en || ' ist belastbar?',
     'Which number for ' || t.name_en || ' is supported?',
     CASE WHEN jsonb_array_length(coalesce(t.studied_dose_ranges, '[]'::jsonb)) > 0 THEN 'Im Katalog liegt als belegter Bereich: ' || (t.studied_dose_ranges->>0) || '. Daraus wird keine persoenliche Einnahmeregel gemacht.'
          ELSE 'Fuer ' || t.name_en || ' ist kein belegter Mengenbereich gespeichert. Das Feld bleibt deshalb leer statt geraten.' END,
     CASE WHEN jsonb_array_length(coalesce(t.studied_dose_ranges, '[]'::jsonb)) > 0 THEN 'The catalog stores this supported range: ' || (t.studied_dose_ranges->>0) || '. It is not turned into a personal intake rule.'
          ELSE 'No supported amount range is stored for ' || t.name_en || '. The field remains empty instead of guessed.' END)
) AS q(sort_order, frage_de, frage_en, antwort_de, antwort_en);

DO $$
DECLARE
  v_trade_total integer;
  v_trade_parented integer;
  v_combo integer;
  v_own integer;
  v_texts integer;
  v_distinct_short integer;
  v_distinct_questions integer;
  v_distinct_answers integer;
  v_forms integer;
BEGIN
  SELECT count(*) INTO v_trade_total FROM tmp_c258_trade_map;

  SELECT count(*) INTO v_trade_parented
  FROM supplements.supplements h
  JOIN tmp_c258_trade_map m ON lower(h.name_en)=lower(m.hidden_name)
  WHERE h.parent_id IS NOT NULL;
  IF v_trade_parented <> v_trade_total THEN
    RAISE EXCEPTION 'C-258 Handelsnamen umgehaengt: %, erwartet %', v_trade_parented, v_trade_total;
  END IF;

  SELECT count(*) INTO v_combo
  FROM supplements.supplements
  WHERE source='f05_substance_candidate'
    AND NOT im_katalog
    AND parent_id IS NULL
    AND (lower(name_en) ~ '(stack|mix|blend|combo|pre[- ]?workout)' OR name_en LIKE '%+%');
  IF v_combo <> 17 THEN
    RAISE EXCEPTION 'C-258 Kombinationen: %, erwartet 17', v_combo;
  END IF;

  SELECT count(*) INTO v_own
  FROM supplements.supplements
  WHERE source='f05_substance_candidate'
    AND NOT im_katalog
    AND parent_id IS NULL
    AND NOT (lower(name_en) ~ '(stack|mix|blend|combo|pre[- ]?workout)' OR name_en LIKE '%+%');
  IF v_own <> 210 THEN
    RAISE EXCEPTION 'C-258 eigene verborgene Stoffe: %, erwartet 210', v_own;
  END IF;

  SELECT count(*), count(distinct kurz_was_de) INTO v_texts, v_distinct_short
  FROM supplements.supplement_user_texts;
  IF v_texts <> 289 OR v_distinct_short < 280 THEN
    RAISE EXCEPTION 'C-258 Kurztexte: % Texte, % verschieden; erwartet 289 und >=280', v_texts, v_distinct_short;
  END IF;

  SELECT count(distinct frage_de), count(distinct antwort_de)
  INTO v_distinct_questions, v_distinct_answers
  FROM supplements.supplement_faq;
  IF v_distinct_questions < 400 OR v_distinct_answers < 700 THEN
    RAISE EXCEPTION 'C-258 FAQ-Varianz: Fragen %, Antworten %, erwartet >=400/>=700', v_distinct_questions, v_distinct_answers;
  END IF;

  SELECT count(*) INTO v_forms FROM supplements.supplement_forms_read;
  IF v_forms <> 50 THEN
    RAISE EXCEPTION 'C-258 Unterformen-Lesepfad: %, erwartet 50 (29 C-244 + 21 Handelsnamen)', v_forms;
  END IF;

  RAISE NOTICE 'C-258 ok: Handelsnamen %, Kombinationen %, eigene Stoffe %, Texte %, Kurzvarianten %, FAQ-Fragen %, FAQ-Antworten %, Formen %',
    v_trade_parented, v_combo, v_own, v_texts, v_distinct_short, v_distinct_questions, v_distinct_answers, v_forms;
END $$;

COMMIT;
