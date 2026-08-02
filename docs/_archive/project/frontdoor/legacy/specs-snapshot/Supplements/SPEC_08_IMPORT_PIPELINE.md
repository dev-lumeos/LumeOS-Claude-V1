# Supplements Module — Import Pipeline
> Spec Phase 8 | Seed-Daten Scripts für supplement_catalog + interactions

---

## Übersicht

Die Supplement-Daten sind **kuratiert** — keine automatisierte Übernahme aus
externen Datenbanken (NIH DSLD, Open Food Facts). Alle Einträge sind manuell
evidenz-geprüft und mit korrekten Evidence Grades versehen.

```
Schritt 1: Seed supplement_catalog (Standard Supplements)
Schritt 2: Seed enhanced_substances (~85 Compounds)
Schritt 3: Seed supplement_interactions (Conflicts + Synergies)
Schritt 4: Seed stack_templates (Goal-Based Presets)
Schritt 5: Verifikation
```

---

## Phase 1: supplement_catalog Seed

```sql
-- Evidence Tier S
INSERT INTO supplements.supplement_catalog
  (name, name_de, slug, category, evidence_grade, priority,
   typical_dose_min, typical_dose_max, dose_unit, timing_default,
   requires_food, absorption_notes, nutrients_provided, benefits)
VALUES
  (
    'Creatine Monohydrate', 'Kreatin Monohydrat', 'creatine-monohydrate',
    'Performance', 'S', 'essential',
    3, 5, 'g', 'morning',
    false, 'Timing spielt keine wesentliche Rolle (Saturationseffekt)',
    '{}',
    ARRAY['Kraft ↑', 'Muskelmasse ↑', 'Recovery ↑', 'ATP-Resynthese ↑']
  ),
  (
    'Vitamin D3', 'Vitamin D3 (Cholecalciferol)', 'vitamin-d3',
    'Vitamins', 'S', 'essential',
    2000, 5000, 'IU', 'morning',
    true, 'Mit fetthaltiger Mahlzeit für optimale Absorption',
    '{"VITD": {"amount": 1000, "unit": "IU"}}',
    ARRAY['Knochengesundheit', 'Immunsystem', 'Testosteron-Support', 'Stimmung']
  ),
  (
    'Caffeine', 'Koffein', 'caffeine',
    'Performance', 'S', 'top_needed',
    100, 400, 'mg', 'pre_workout',
    false, 'Peak nach 30–60min. Cutoff 14–16 Uhr um Schlaf nicht zu stören',
    '{}',
    ARRAY['Performance ↑', 'Ausdauer ↑', 'Fokus ↑', 'Fettverbrennung ↑']
  ),
  (
    'Whey Protein', 'Molkenprotein', 'whey-protein',
    'Amino Acids', 'S', 'top_needed',
    20, 40, 'g', 'post_workout',
    false, 'Schnelle Absorption, ideal Post-Workout oder als Proteinquelle',
    '{"PROT625": {"amount": 25, "unit": "g"}}',
    ARRAY['Muskelproteinsynthese ↑', 'Muskelmasse ↑', 'Recovery ↑']
  );

-- Evidence Tier A
INSERT INTO supplements.supplement_catalog
  (name, name_de, slug, category, evidence_grade, priority,
   typical_dose_min, typical_dose_max, dose_unit, timing_default,
   requires_food, absorption_notes, nutrients_provided, benefits)
VALUES
  (
    'Omega-3 (EPA+DHA)', 'Omega-3 Fettsäuren', 'omega-3',
    'Recovery', 'A', 'essential',
    1000, 3000, 'mg', 'morning',
    true, 'Mit Mahlzeit (Fett erhöht Absorption)',
    '{"FAPUN3": {"amount": 2000, "unit": "mg"}}',
    ARRAY['Anti-Inflammation', 'Recovery ↑', 'Herzgesundheit', 'Gehirnfunktion']
  ),
  (
    'Magnesium Glycinate', 'Magnesium Glycinat', 'magnesium-glycinate',
    'Minerals', 'A', 'essential',
    200, 400, 'mg', 'evening',
    false, 'Abends empfohlen (Relaxations-Effekt). Glycinat = beste Bioverfügbarkeit',
    '{"MG": {"amount": 200, "unit": "mg"}}',
    ARRAY['Sleep ↑', 'Recovery ↑', 'Muskelkrämpfe ↓', 'Stress ↓']
  ),
  (
    'Zinc Bisglycinate', 'Zink Bisglycinat', 'zinc-bisglycinate',
    'Minerals', 'A', 'top_needed',
    15, 30, 'mg', 'morning',
    true, 'Mit Mahlzeit (verhindert Übelkeit). Nicht nüchtern.',
    '{"ZN": {"amount": 15, "unit": "mg"}}',
    ARRAY['Testosteron', 'Immunsystem', 'Wundheilung', 'Zinkmangel-Korrektur']
  ),
  (
    'Beta-Alanine', 'Beta-Alanin', 'beta-alanine',
    'Performance', 'A', 'nice_to_have',
    3200, 6400, 'mg', 'morning',
    false, 'Über den Tag verteilen (reduziert Parästhesie/Kribbeln). Chronic Loading.',
    '{}',
    ARRAY['Ausdauer ↑', 'Carnosin-Spiegel ↑', 'Muskel-Azidose ↓']
  ),
  (
    'Citrulline Malate', 'Citrullin Malat', 'citrulline-malate',
    'Performance', 'A', 'nice_to_have',
    6000, 8000, 'mg', 'pre_workout',
    false, '30–60min vor dem Training',
    '{}',
    ARRAY['Pump ↑', 'Ausdauer ↑', 'Fatigue ↓', 'NO-Produktion ↑']
  ),
  (
    'Vitamin K2 (MK-7)', 'Vitamin K2 (MK-7)', 'vitamin-k2-mk7',
    'Vitamins', 'A', 'top_needed',
    100, 200, 'mcg', 'morning',
    true, 'Zusammen mit Vitamin D3 + fetthaltiger Mahlzeit',
    '{"VITK": {"amount": 100, "unit": "mcg"}}',
    ARRAY['Calcium-Routing zu Knochen', 'Arteriengesundheit', 'Synergist zu Vitamin D']
  );

-- Evidence Tier B
INSERT INTO supplements.supplement_catalog
  (name, name_de, slug, category, evidence_grade, priority,
   typical_dose_min, typical_dose_max, dose_unit, timing_default,
   requires_food, absorption_notes, benefits)
VALUES
  ('Ashwagandha KSM-66', 'Ashwagandha KSM-66', 'ashwagandha-ksm66',
   'Adaptogens', 'B', 'nice_to_have', 300, 600, 'mg', 'morning',
   true, 'Mit Mahlzeit (Magenverträglichkeit)',
   ARRAY['Cortisol ↓', 'Testosteron ↑', 'Stress ↓', 'Schlafqualität ↑']),
  ('Melatonin', 'Melatonin', 'melatonin',
   'Sleep', 'B', 'nice_to_have', 0.5, 3, 'mg', 'bedtime',
   false, '30–60min vor Schlaf. Niedrigste effektive Dosis (0.5mg) bevorzugen.',
   ARRAY['Sleep Onset ↑', 'Jet Lag', 'Schichtarbeit']),
  ('Probiotics (Multi-Strain)', 'Probiotika', 'probiotics',
   'Gut Health', 'B', 'top_needed', NULL, NULL, 'cfu', 'morning',
   false, 'Morgens nüchtern (pH-Optimum für Überleben)',
   ARRAY['Darmflora', 'Immunsystem', 'Verdauung']),
  ('Collagen Type I+III', 'Kollagen Typ I+III', 'collagen-i-iii',
   'Recovery', 'B', 'nice_to_have', 10000, 15000, 'mg', 'morning',
   false, 'Mit Vitamin C (fördert Kollagen-Synthese)',
   ARRAY['Gelenke', 'Sehnen', 'Haut', 'Knochen']),
  ('HMB (β-Hydroxy β-Methylbutyrat)', 'HMB', 'hmb',
   'Recovery', 'B', 'nice_to_have', 3000, 3000, 'mg', 'morning',
   false, 'Auf 3 Dosen à 1g über den Tag verteilen',
   ARRAY['Anti-Katabolismus', 'Muskelverlust ↓ bei Cut', 'Recovery ↑']),
  ('Berberine', 'Berberin', 'berberine',
   'Longevity', 'B', 'nice_to_have', 500, 1500, 'mg', 'morning',
   true, 'Vor Mahlzeiten (Blutzucker-Effekt)',
   ARRAY['Blutzucker ↓', 'Insulinsensitivität ↑', 'Lipide ↓', '"Natur-Metformin"']),
  ('CoQ10', 'Coenzym Q10', 'coq10',
   'Longevity', 'B', 'nice_to_have', 100, 300, 'mg', 'morning',
   true, 'Mit fetthaltiger Mahlzeit (fettlöslich)',
   ARRAY['Mitochondrien', 'Herzgesundheit', 'Energie', 'Antioxidant']),
  ('NAC (N-Acetyl Cysteine)', 'NAC (N-Acetyl Cystein)', 'nac',
   'Longevity', 'B', 'nice_to_have', 600, 1200, 'mg', 'morning',
   false, 'Mit oder ohne Mahlzeit',
   ARRAY['Glutathion ↑', 'Leber-Support', 'Antioxidant', 'Atemwege']);
```

---

## Phase 2: enhanced_substances Seed (Auswahl)

```sql
-- Testosterone Enanthate
INSERT INTO supplements.enhanced_substances
  (name, aliases, category, route, typical_dose_min, typical_dose_max, dose_unit,
   frequency, half_life_hours, hepatotoxicity_level, cardiovascular_risk,
   androgenic_rating, anabolic_rating, requires_ai, aromatization,
   warnings, legal_status)
VALUES
  (
    'Testosterone Enanthate',
    ARRAY['Test E', 'Testosteron Enantat', 'Test Enan'],
    'AAS', 'injection_im', 200, 500, 'mg', 'weekly',
    108, 'none', 'moderate', 100, 100, true, 'moderate',
    ARRAY['Hematokrit-Monitoring', 'Lipid-Panel erforderlich', 'PCT nach Cycle'],
    '{"de": "verschreibungspflichtig", "us": "schedule III", "th": "illegal"}'
  );

-- Ostarine (MK-2866)
INSERT INTO supplements.enhanced_substances
  (name, aliases, category, route, typical_dose_min, typical_dose_max, dose_unit,
   frequency, half_life_hours, hepatotoxicity_level, cardiovascular_risk,
   requires_pct, aromatization, warnings, legal_status)
VALUES
  (
    'Ostarine (MK-2866)',
    ARRAY['MK-2866', 'Enobosarm', 'GTx-024'],
    'SARM', 'oral', 10, 25, 'mg', 'daily',
    24, 'low', 'low', true, 'none',
    ARRAY['Noch nicht für Menschen zugelassen', 'Mild suppressive', 'PCT bei längeren Cycles'],
    '{"de": "nicht für Menschen zugelassen", "us": "not scheduled but grey market"}'
  );

-- BPC-157
INSERT INTO supplements.enhanced_substances
  (name, aliases, category, route, typical_dose_min, typical_dose_max, dose_unit,
   frequency, half_life_hours, hepatotoxicity_level, cardiovascular_risk,
   warnings)
VALUES
  (
    'BPC-157',
    ARRAY['Body Protection Compound 157', 'PL 14736'],
    'Peptide', 'injection_subq', 200, 500, 'mcg', 'daily',
    4, 'none', 'none',
    ARRAY['Noch in klinischen Studien', 'Oral und SubQ verfügbar', 'Nicht für Menschen zugelassen']
  );

-- Semaglutide
INSERT INTO supplements.enhanced_substances
  (name, aliases, category, route, typical_dose_min, typical_dose_max, dose_unit,
   frequency, half_life_hours, hepatotoxicity_level, cardiovascular_risk,
   warnings)
VALUES
  (
    'Semaglutide',
    ARRAY['Ozempic', 'Wegovy', 'Rybelsus'],
    'GLP1', 'injection_subq', 0.25, 2.4, 'mg', 'weekly',
    168, 'none', 'low',
    ARRAY['FDA-zugelassen für Diabetes/Adipositas', 'Off-label für Körperkomposition', 'Übelkeit häufig', 'HbA1c-Monitoring']
  );
```

---

## Phase 3: supplement_interactions Seed

```sql
-- Konflikte
INSERT INTO supplements.supplement_interactions
  (supplement1_name, supplement2_name, interaction_type, severity,
   description_en, description_de, recommendation_en, recommendation_de,
   timing_recommendation, evidence_level, blocks_intake)
VALUES
  ('Calcium', 'Iron', 'absorption', 'warning',
   'Calcium blocks iron absorption by competing for the same transporter',
   'Calcium blockiert die Eisenaufnahme durch Konkurrenz um denselben Transporter',
   'Take at least 2 hours apart',
   'Mindestens 2 Stunden Abstand einhalten',
   'separate_2h', 'high', false),

  ('Zinc', 'Copper', 'absorption', 'caution',
   'High zinc intake depletes copper stores over time',
   'Hohe Zinkzufuhr erschöpft die Kupferreserven',
   'If taking high-dose zinc long-term, add a small copper supplement',
   'Bei langfristiger Hochdosis-Zinkeinnahme Kupfer supplementieren',
   NULL, 'moderate', false),

  ('Zinc', 'Iron', 'absorption', 'caution',
   'Zinc and iron compete for absorption when taken together',
   'Zink und Eisen konkurrieren bei gleichzeitiger Einnahme um die Absorption',
   'Take at different times',
   'Zu verschiedenen Zeiten einnehmen',
   'separate_2h', 'moderate', false),

  ('Caffeine', 'Melatonin', 'conflict', 'warning',
   'Caffeine counteracts the sleep-inducing effects of melatonin',
   'Koffein hebt die schlaffördernde Wirkung von Melatonin auf',
   'Minimum 8 hours between caffeine and melatonin',
   'Mindestens 8 Stunden Abstand zwischen Koffein und Melatonin',
   'separate_8h', 'high', false),

  ('St. John''s Wort', 'SSRIs', 'contraindication', 'critical',
   'Combination can cause serotonin syndrome — a potentially life-threatening condition',
   'Kombination kann das Serotonin-Syndrom auslösen — potenziell lebensbedrohlich',
   'Do not combine under any circumstances',
   'Unter keinen Umständen kombinieren',
   'avoid', 'high', true),

  ('St. John''s Wort', 'Birth Control Pills', 'contraindication', 'critical',
   'St. John''s Wort significantly reduces the efficacy of hormonal contraceptives',
   'Johanniskraut reduziert die Wirksamkeit hormoneller Verhütungsmittel erheblich',
   'Do not combine — risk of unintended pregnancy',
   'Nicht kombinieren — Risiko ungewollter Schwangerschaft',
   'avoid', 'high', true),

  ('Warfarin', 'Omega-3', 'contraindication', 'critical',
   'Omega-3 increases bleeding risk when combined with anticoagulants',
   'Omega-3 erhöht in Kombination mit Gerinnungshemmern das Blutungsrisiko',
   'Consult physician before combining',
   'Arzt konsultieren vor Kombination',
   'avoid', 'high', true),

  ('Warfarin', 'Vitamin K2', 'contraindication', 'critical',
   'Vitamin K directly counteracts the anticoagulant effect of warfarin',
   'Vitamin K hebt die gerinnungshemmende Wirkung von Warfarin direkt auf',
   'Do not combine without physician supervision',
   'Nicht ohne ärztliche Aufsicht kombinieren',
   'avoid', 'high', true);

-- Synergien
INSERT INTO supplements.supplement_interactions
  (supplement1_name, supplement2_name, interaction_type, severity,
   description_en, description_de, recommendation_en, recommendation_de,
   timing_recommendation, evidence_level)
VALUES
  ('Vitamin D3', 'Vitamin K2', 'synergy', 'info',
   'K2 directs calcium mobilized by Vitamin D into bones rather than arteries',
   'K2 leitet das durch Vitamin D mobilisierte Calcium in die Knochen statt in die Arterien',
   'Take together with a fatty meal',
   'Gemeinsam mit fetthaltiger Mahlzeit einnehmen',
   'take_together', 'high'),

  ('Vitamin C', 'Iron', 'synergy', 'info',
   'Vitamin C increases non-heme iron absorption 2–3 fold',
   'Vitamin C erhöht die Aufnahme von Nicht-Häm-Eisen um das 2–3-Fache',
   'Take together for best iron absorption',
   'Gemeinsam für optimale Eisenaufnahme einnehmen',
   'take_together', 'high'),

  ('Creatine', 'Beta-Alanine', 'synergy', 'info',
   'Complementary mechanisms: creatine for power, beta-alanine for endurance',
   'Ergänzende Mechanismen: Kreatin für Kraft, Beta-Alanin für Ausdauer',
   'Can be combined freely',
   'Können frei kombiniert werden',
   NULL, 'moderate'),

  ('Magnesium', 'Vitamin D3', 'synergy', 'info',
   'Magnesium is a cofactor required to activate Vitamin D',
   'Magnesium ist ein Kofaktor der zur Aktivierung von Vitamin D benötigt wird',
   'Ensure adequate magnesium when supplementing Vitamin D',
   'Bei Vitamin-D-Supplementation auf ausreichend Magnesium achten',
   NULL, 'moderate');
```

---

## Phase 4: Stack Templates Seed

```sql
INSERT INTO supplements.stack_templates (name, name_de, description, goal, source)
VALUES
  ('Muscle Building Starter', 'Muskelaufbau Starter', 'Evidence-basierter Einsteiger-Stack für Muskelaufbau', 'muscle_building', 'system'),
  ('Daily Health Basics', 'Gesundheits-Basics täglich', 'Essentielle Supplements für allgemeine Gesundheit', 'health', 'system'),
  ('Fat Loss Stack', 'Fettabbau Stack', 'Stack für die Cut-Phase', 'fat_loss', 'system'),
  ('Recovery & Sleep', 'Recovery & Schlaf', 'Fokus auf Erholung und Schlafqualität', 'recovery_sleep', 'system'),
  ('Longevity Stack', 'Longevity Stack', 'Anti-Aging und Langlebigkeits-Supplements', 'longevity', 'system');

-- Template Items: Muscle Building Starter
INSERT INTO supplements.stack_template_items
  (template_id, supplement_id, dose, dose_unit, timing, frequency, tier, sort_order)
SELECT
  (SELECT id FROM supplements.stack_templates WHERE goal = 'muscle_building'),
  id, 5, 'g', 'morning', 'daily', 'must', 1
FROM supplements.supplement_catalog WHERE slug = 'creatine-monohydrate';

INSERT INTO supplements.stack_template_items
  (template_id, supplement_id, dose, dose_unit, timing, frequency, tier, sort_order)
SELECT
  (SELECT id FROM supplements.stack_templates WHERE goal = 'muscle_building'),
  id, 3000, 'IU', 'morning', 'daily', 'must', 2
FROM supplements.supplement_catalog WHERE slug = 'vitamin-d3';

INSERT INTO supplements.stack_template_items
  (template_id, supplement_id, dose, dose_unit, timing, frequency, tier, sort_order)
SELECT
  (SELECT id FROM supplements.stack_templates WHERE goal = 'muscle_building'),
  id, 2000, 'mg', 'morning', 'daily', 'must', 3
FROM supplements.supplement_catalog WHERE slug = 'omega-3';

INSERT INTO supplements.stack_template_items
  (template_id, supplement_id, dose, dose_unit, timing, frequency, tier, sort_order)
SELECT
  (SELECT id FROM supplements.stack_templates WHERE goal = 'muscle_building'),
  id, 400, 'mg', 'evening', 'daily', 'must', 4
FROM supplements.supplement_catalog WHERE slug = 'magnesium-glycinate';
```

---

## Phase 5: Verifikation

```sql
-- Gesamt-Überblick
SELECT 'supplement_catalog' AS t, COUNT(*) FROM supplements.supplement_catalog
UNION ALL
SELECT 'enhanced_substances', COUNT(*) FROM supplements.enhanced_substances
UNION ALL
SELECT 'supplement_interactions', COUNT(*) FROM supplements.supplement_interactions
UNION ALL
SELECT 'stack_templates', COUNT(*) FROM supplements.stack_templates
UNION ALL
SELECT 'stack_template_items', COUNT(*) FROM supplements.stack_template_items;

-- Evidence Distribution
SELECT evidence_grade, COUNT(*) as count
FROM supplements.supplement_catalog
GROUP BY evidence_grade ORDER BY evidence_grade;

-- Interaction Severity Distribution
SELECT severity, interaction_type, COUNT(*)
FROM supplements.supplement_interactions
GROUP BY severity, interaction_type
ORDER BY CASE severity WHEN 'critical' THEN 0 WHEN 'warning' THEN 1 WHEN 'caution' THEN 2 ELSE 3 END;

-- nutrients_provided Coverage
SELECT COUNT(*) as supplements_with_nutrients
FROM supplements.supplement_catalog
WHERE nutrients_provided != '{}';

-- Suchtest
SELECT name, name_de, evidence_grade, priority
FROM supplements.supplement_catalog
WHERE similarity(name, 'vitamin d') > 0.2
   OR name_de ILIKE '%vitamin d%'
ORDER BY evidence_grade ASC, priority DESC
LIMIT 5;
```

---

## Dateistruktur

```
src/import/supplements/
  01_seed_catalog.sql          Phase 1: Standard Supplements
  02_seed_enhanced.sql         Phase 2: Enhanced Substances (~85)
  03_seed_interactions.sql     Phase 3: Interactions + Synergies
  04_seed_templates.sql        Phase 4: Goal-Based Templates
  05_verify.sql                Phase 5: Verifikation
  run_all.sh                   Reihenfolge-Script
```
