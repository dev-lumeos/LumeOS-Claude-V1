#!/usr/bin/env node
// C-45: Reference values for all BLS nutrient codes.
//
// The table deliberately stores both quantified reference values and explicit
// "no reference" answers. That is the guard against an empty row being read as
// "not curated yet" instead of "no DRV exists for this nutrient form".
import { spawnSync } from 'node:child_process'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'

type ReferenceRow = {
  nutrient_code: string
  reference_kind: string
  population_group?: string
  age_min?: number | null
  age_max?: number | null
  sex?: 'male' | 'female' | 'both'
  is_pregnant?: boolean
  is_lactating?: boolean
  value_min?: number | null
  value_max?: number | null
  unit: string
  basis: string
  target_applies_to?: string[]
  applies_to_intake_sources?: Array<'foods' | 'fortified_foods' | 'supplements' | 'pharmacological'>
  source: string
  source_version: string
  source_locator: string
  source_url: string
  notes: string
}

type NutrientDef = {
  code: string
  unit: string
  group_de: string
  name_de: string
  formula: string | null
}

const EFSA_DRV = {
  source: 'EFSA Dietary Reference Values',
  source_version: 'DRV Summary Tables version 4, September 2017',
  source_url: 'https://www.efsa.europa.eu/sites/default/files/assets/DRV_Summary_tables_jan_17.pdf',
}

const EFSA_TOPIC = {
  source: 'EFSA Dietary Reference Values topic page',
  source_version: 'accessed 2026-08-15',
  source_url: 'https://www.efsa.europa.eu/en/topics/topic/dietary-reference-values',
}

const NAM_DRI = {
  source: 'National Academies Dietary Reference Intakes',
  source_version: 'DRI Reference Tables, NCBI Bookshelf Appendix J',
  source_url: 'https://www.ncbi.nlm.nih.gov/books/NBK208874/',
}

const WHO_AA = {
  source: 'WHO/FAO/UNU Protein and amino acid requirements in human nutrition',
  source_version: 'WHO Technical Report Series 935, 2007',
  source_url: 'https://iris.who.int/server/api/core/bitstreams/b7c5ec43-bc59-4b38-b702-3f0e96a06fa1/content',
}

function ref(row: ReferenceRow): ReferenceRow {
  return {
    population_group: 'adult',
    age_min: 18,
    age_max: null,
    sex: 'both',
    is_pregnant: false,
    is_lactating: false,
    value_min: null,
    value_max: null,
    target_applies_to: [row.nutrient_code],
    applies_to_intake_sources: ['foods', 'fortified_foods', 'supplements', 'pharmacological'],
    ...row,
  }
}

const references: ReferenceRow[] = [
  ref({
    nutrient_code: 'ENERCJ',
    reference_kind: 'FORMULA',
    unit: 'kJ',
    basis: 'profile_calculated',
    ...EFSA_DRV,
    source_locator: 'Table 1: energy AR depends on age, sex and PAL',
    notes: 'No fixed daily reference value; energy target is calculated from profile and activity level.',
  }),
  ref({
    nutrient_code: 'ENERCC',
    reference_kind: 'FORMULA',
    unit: 'kcal',
    basis: 'profile_calculated',
    ...EFSA_DRV,
    source_locator: 'Table 1 and note (a): 1 MJ = 238.83 kcal',
    notes: 'No fixed daily reference value; kcal is the converted form of the profile-based energy target.',
  }),
  ref({
    nutrient_code: 'PROT625',
    reference_kind: 'PRI',
    value_min: 0.83,
    value_max: 0.83,
    unit: 'g/kg bw/day',
    basis: 'per_kg_bw_per_day',
    ...EFSA_DRV,
    source_locator: 'Table 2: adults 18-59 and >=60 y, PRI 0.83 g/kg bw per day',
    notes: 'Population reference intake for healthy adults; athletic targets may be higher and are not EFSA DRVs.',
  }),
  ref({
    nutrient_code: 'FAT',
    reference_kind: 'RI',
    value_min: 20,
    value_max: 35,
    unit: 'E%',
    basis: 'energy_percent',
    ...EFSA_DRV,
    source_locator: 'Table 3: adults >=18 y, total fat 20-35 E%',
    notes: 'Reference intake range, not a fixed gram target.',
  }),
  ref({
    nutrient_code: 'FASAT',
    reference_kind: 'ALAP',
    unit: 'E%',
    basis: 'as_low_as_possible',
    ...EFSA_DRV,
    source_locator: 'Table 3: SFA as low as possible',
    notes: 'EFSA gives no numeric target; saturated fatty acids should be as low as possible within an adequate diet.',
  }),
  ref({
    nutrient_code: 'CHO',
    reference_kind: 'RI',
    value_min: 45,
    value_max: 60,
    unit: 'E%',
    basis: 'energy_percent',
    ...EFSA_DRV,
    source_locator: 'Table 3: adults >=18 y, total carbohydrates 45-60 E%',
    notes: 'Reference intake range, not a fixed gram target.',
  }),
  ref({
    nutrient_code: 'FIBT',
    reference_kind: 'AI',
    value_min: 25,
    value_max: 25,
    unit: 'g/day',
    basis: 'per_day',
    ...EFSA_DRV,
    source_locator: 'Table 3: adults >=18 y, dietary fibre 25 g/day',
    notes: 'Applies to total dietary fibre; BLS fibre fractions have no separate DRVs.',
  }),
  ref({
    nutrient_code: 'WATER',
    reference_kind: 'AI',
    sex: 'male',
    value_min: 2.5,
    value_max: 2.5,
    unit: 'L/day',
    basis: 'per_day',
    ...EFSA_DRV,
    source_locator: 'Table 3: adults >=18 y, water male 2.5 L/day',
    notes: 'Includes water from beverages and food moisture.',
  }),
  ref({
    nutrient_code: 'WATER',
    reference_kind: 'AI',
    sex: 'female',
    value_min: 2.0,
    value_max: 2.0,
    unit: 'L/day',
    basis: 'per_day',
    ...EFSA_DRV,
    source_locator: 'Table 3: adults >=18 y, water female 2.0 L/day',
    notes: 'Includes water from beverages and food moisture.',
  }),
  ref({
    nutrient_code: 'F18:2CN6',
    reference_kind: 'AI',
    value_min: 4,
    value_max: 4,
    unit: 'E%',
    basis: 'energy_percent',
    ...EFSA_DRV,
    source_locator: 'Table 3: adults >=18 y, linoleic acid 4 E%',
    notes: 'Adequate intake for linoleic acid, not for every omega-6 fatty acid.',
  }),
  ref({
    nutrient_code: 'F18:3CN3',
    reference_kind: 'AI',
    value_min: 0.5,
    value_max: 0.5,
    unit: 'E%',
    basis: 'energy_percent',
    ...EFSA_DRV,
    source_locator: 'Table 3: adults >=18 y, alpha-linolenic acid 0.5 E%',
    notes: 'Adequate intake for alpha-linolenic acid, not for every omega-3 fatty acid.',
  }),
  ref({
    nutrient_code: 'F20:5CN3',
    reference_kind: 'AI_COMBINED',
    value_min: 250,
    value_max: 250,
    unit: 'mg/day',
    basis: 'per_day',
    target_applies_to: ['F20:5CN3', 'F22:6CN3'],
    ...EFSA_DRV,
    source_locator: 'Table 3: adults >=18 y, EPA+DHA 250 mg/day',
    notes: 'Combined adequate intake for EPA plus DHA; not a standalone EPA target.',
  }),
  ref({
    nutrient_code: 'F22:6CN3',
    reference_kind: 'NO_STANDALONE_REFERENCE',
    unit: 'g',
    basis: 'not_applicable',
    target_applies_to: ['F20:5CN3', 'F22:6CN3'],
    ...EFSA_DRV,
    source_locator: 'Table 3: adults >=18 y, EPA+DHA 250 mg/day',
    notes: 'DHA is covered by the combined EPA+DHA AI; EFSA summary gives no separate adult DHA target.',
  }),

  // Vitamins, EFSA adult rows. Values that EFSA gives per MJ are stored as per-MJ values.
  ...sexRows('VITE', 'AI', 13, 11, 'mg/day', 'per_day', 'Table 9/11: adults >=18 y, alpha-tocopherol 13 mg men, 11 mg women', 'EFSA adult AI for alpha-tocopherol.'),
  ref({ nutrient_code: 'BIOT', reference_kind: 'AI', value_min: 40, value_max: 40, unit: 'ug/day', basis: 'per_day', ...EFSA_DRV, source_locator: 'Table 9/11: adults >=18 y, biotin 40 ug/day', notes: 'Adequate intake.' }),
  ref({ nutrient_code: 'VITB12', reference_kind: 'AI', value_min: 4, value_max: 4, unit: 'ug/day', basis: 'per_day', ...EFSA_DRV, source_locator: 'Table 9/11: adults >=18 y, cobalamin 4.0 ug/day', notes: 'Adequate intake.' }),
  ref({ nutrient_code: 'FOL', reference_kind: 'PRI', value_min: 330, value_max: 330, unit: 'ug DFE/day', basis: 'per_day', ...EFSA_DRV, source_locator: 'Table 9/11: adults >=18 y, folate 330 ug DFE/day', notes: 'Dietary folate equivalents: food folate plus 1.7 times synthetic folic acid.' }),
  ref({ nutrient_code: 'NIAEQ', reference_kind: 'PRI', value_min: 1.6, value_max: 1.6, unit: 'mg NE/MJ', basis: 'per_mj', ...EFSA_DRV, source_locator: 'Table 9/11: adults >=18 y, niacin 1.6 mg NE/MJ', notes: 'Niacin equivalent is energy-dependent; NIA alone has no separate EFSA adult target in this table.' }),
  ref({ nutrient_code: 'NIA', reference_kind: 'NO_STANDALONE_REFERENCE', unit: 'mg', basis: 'not_applicable', target_applies_to: ['NIAEQ'], ...EFSA_DRV, source_locator: 'Table 9/11: adults >=18 y, niacin is expressed as niacin equivalents', notes: 'Use NIAEQ for the intake target. NIA keeps a UL row because synthetic niacin has an upper limit.' }),
  ref({ nutrient_code: 'PANTAC', reference_kind: 'AI', value_min: 5, value_max: 5, unit: 'mg/day', basis: 'per_day', ...EFSA_DRV, source_locator: 'Table 9/11: adults >=18 y, pantothenic acid 5 mg/day', notes: 'Adequate intake.' }),
  ref({ nutrient_code: 'RIBF', reference_kind: 'PRI', value_min: 1.6, value_max: 1.6, unit: 'mg/day', basis: 'per_day', ...EFSA_DRV, source_locator: 'Table 9/11: adults >=18 y, riboflavin 1.6 mg/day', notes: 'Population reference intake.' }),
  ref({ nutrient_code: 'THIA', reference_kind: 'AI', value_min: 0.1, value_max: 0.1, unit: 'mg/MJ', basis: 'per_mj', ...EFSA_DRV, source_locator: 'Table 9/11: adults >=18 y, thiamin 0.1 mg/MJ', notes: 'Energy-dependent adequate intake.' }),
  ...sexRows('VITA', 'PRI', 750, 650, 'ug RE/day', 'per_day', 'Table 9/11: adults >=18 y, vitamin A 750 ug RE men, 650 ug RE women', 'Population reference intake; RE conversion follows EFSA table notes.'),
  ...sexRows('VITB6', 'PRI', 1.7, 1.6, 'mg/day', 'per_day', 'Table 9/11: adults >=18 y, vitamin B6 1.7 mg men, 1.6 mg women', 'Population reference intake.'),
  ...sexRows('VITC', 'PRI', 110, 95, 'mg/day', 'per_day', 'Table 9/11: adults >=18 y, vitamin C 110 mg men, 95 mg women', 'Population reference intake.'),
  ref({ nutrient_code: 'VITD', reference_kind: 'AI', value_min: 15, value_max: 15, unit: 'ug/day', basis: 'per_day', ...EFSA_DRV, source_locator: 'Table 9/11: adults >=18 y, vitamin D 15 ug/day', notes: 'Assumes minimal cutaneous vitamin D synthesis; EFSA differs from sources using 20 ug.' }),
  ref({ nutrient_code: 'VITK', reference_kind: 'AI', value_min: 70, value_max: 70, unit: 'ug/day', basis: 'per_day', ...EFSA_DRV, source_locator: 'Table 9/11: adults >=18 y, vitamin K 70 ug/day', notes: 'Based on phylloquinone only; no UL established.' }),

  // Minerals, EFSA adult rows.
  ref({ nutrient_code: 'CA', reference_kind: 'PRI', age_min: 18, age_max: 24, value_min: 1000, value_max: 1000, unit: 'mg/day', basis: 'per_day', ...EFSA_DRV, source_locator: 'Table 5/7: age 18-24 y, calcium 1000 mg/day', notes: 'Population reference intake.' }),
  ref({ nutrient_code: 'CA', reference_kind: 'PRI', age_min: 25, age_max: null, value_min: 950, value_max: 950, unit: 'mg/day', basis: 'per_day', ...EFSA_DRV, source_locator: 'Table 5/7: age >=25 y, calcium 950 mg/day', notes: 'Population reference intake.' }),
  ...sexRows('CU', 'AI', 1.6, 1.3, 'mg/day', 'per_day', 'EFSA copper opinion: adults 1.6 mg men, 1.3 mg women', 'Adequate intake; BLS stores copper in ug, conversion is needed in scoring.'),
  ref({ nutrient_code: 'ID', reference_kind: 'AI', value_min: 150, value_max: 150, unit: 'ug/day', basis: 'per_day', ...EFSA_DRV, source_locator: 'Table 5/7: adults >=18 y, iodine 150 ug/day', notes: 'Adequate intake.' }),
  ...sexRows('FE', 'PRI', 11, 16, 'mg/day', 'per_day', 'Table 5/7: adults, iron 11 mg men and 16 mg premenopausal women', 'Female value is for premenopausal women; postmenopausal women use 11 mg/day.'),
  ...sexRows('MG', 'AI', 350, 300, 'mg/day', 'per_day', 'EFSA magnesium opinion: adults 350 mg men, 300 mg women', 'Adequate intake; UL for magnesium from supplements is separate.'),
  ref({ nutrient_code: 'MN', reference_kind: 'AI', value_min: 3, value_max: 3, unit: 'mg/day', basis: 'per_day', ...EFSA_DRV, source_locator: 'Table 5/7: adults >=18 y, manganese 3.0 mg/day', notes: 'Adequate intake.' }),
  ref({ nutrient_code: 'MO', reference_kind: 'AI', value_min: 65, value_max: 65, unit: 'ug/day', basis: 'per_day', ...EFSA_DRV, source_locator: 'Table 5/7: adults >=18 y, molybdenum 65 ug/day', notes: 'Adequate intake.' }),
  ref({ nutrient_code: 'P', reference_kind: 'AI', value_min: 550, value_max: 550, unit: 'mg/day', basis: 'per_day', ...EFSA_DRV, source_locator: 'Table 5/7: adults >=18 y, phosphorus 550 mg/day', notes: 'Adequate intake.' }),
  ref({ nutrient_code: 'K', reference_kind: 'AI', value_min: 3500, value_max: 3500, unit: 'mg/day', basis: 'per_day', ...EFSA_DRV, source_locator: 'Table 5/7: adults >=18 y, potassium 3500 mg/day', notes: 'Adequate intake.' }),
  ref({ nutrient_code: 'SE', reference_kind: 'AI', value_min: 70, value_max: 70, unit: 'ug/day', basis: 'per_day', ...EFSA_DRV, source_locator: 'Table 5/7: adults >=18 y, selenium 70 ug/day', notes: 'Adequate intake. BLS has no selenium code, so this row is inserted only if nutrient_defs contains SE.' }),
  ref({ nutrient_code: 'FD', reference_kind: 'AI', value_min: 2.9, value_max: 2.9, unit: 'mg/day', basis: 'per_day', ...EFSA_DRV, source_locator: 'Table 5/7: adults >=18 y, fluoride 2.9 mg/day', notes: 'Adequate intake.' }),
  ref({ nutrient_code: 'ZN', reference_kind: 'PRI', value_min: 7.5, value_max: 16.3, unit: 'mg/day', basis: 'per_day', ...EFSA_DRV, source_locator: 'Table 5/7: adults >=18 y, zinc range by phytate intake', notes: 'EFSA zinc PRI depends on phytate intake. Store range rather than choose a diet pattern.' }),
  ref({ nutrient_code: 'NA', reference_kind: 'AI', value_min: 2000, value_max: 2000, unit: 'mg/day', basis: 'per_day', source: 'EFSA Dietary Reference Values for sodium', source_version: 'EFSA Journal 2019;17(9):5778', source_url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2019.5778', source_locator: 'Abstract/conclusion: adults 2.0 g sodium/day safe and adequate intake', notes: 'Safe and adequate intake, not a deficiency RDA and not a laboratory sodium range.' }),
  ref({ nutrient_code: 'CLD', reference_kind: 'AI', value_min: 3100, value_max: 3100, unit: 'mg/day', basis: 'per_day', source: 'EFSA Dietary Reference Values for chloride', source_version: 'EFSA Journal 2019;17(9):5779', source_url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2019.5779', source_locator: 'Abstract/summary: adults 3.1 g chloride/day safe and adequate intake', notes: 'Safe and adequate intake, set equimolar to sodium reference values.' }),
  ref({ nutrient_code: 'NACL', reference_kind: 'FORMULA', value_min: 5, value_max: 5, unit: 'g/day', basis: 'per_day', target_applies_to: ['NA', 'NACL'], source: 'EFSA Dietary Reference Values for sodium', source_version: 'EFSA Journal 2019;17(9):5778', source_url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2019.5778', source_locator: '2.0 g sodium/day equals about 5 g salt/day', notes: 'Salt target is derived from sodium; BLS NACL is computed as NA*2.5.' }),
  ref({ nutrient_code: 'CR', reference_kind: 'NO_REFERENCE', unit: 'ug', basis: 'not_applicable', ...EFSA_DRV, source_locator: 'Table 5/7 footnote: setting an AI or PRI for chromium was considered not appropriate', notes: 'Explicit EFSA no-reference decision.' }),

  // UL rows. EFSA is used when recent public page gives the adult UL; NAM fills older DRI ULs.
  ref({ nutrient_code: 'VITD', reference_kind: 'UL', value_min: 100, value_max: 100, unit: 'ug/day', basis: 'per_day', ...EFSA_TOPIC, source_locator: 'Topic page: EFSA maintains UL for vitamin D at 100 ug/day for adults', notes: 'Upper limit for total chronic intake.' }),
  ref({ nutrient_code: 'VITA', reference_kind: 'UL', value_min: 3000, value_max: 3000, unit: 'ug RE/day', basis: 'per_day', ...EFSA_TOPIC, source_locator: '2024 preformed vitamin A UL opinion summary: retain adult UL 3000 ug RE/day', notes: 'Applies to preformed vitamin A; teratogenicity risk in pregnancy.' }),
  ref({ nutrient_code: 'VITC', reference_kind: 'UL', value_min: 2000, value_max: 2000, unit: 'mg/day', basis: 'per_day', ...NAM_DRI, source_locator: 'Table C-6: adults 19-70 y and >70 y, vitamin C UL 2000 mg/day', notes: 'NAM DRI UL; EFSA has no numeric vitamin C UL in the 2017 summary table.' }),
  ref({ nutrient_code: 'VITE', reference_kind: 'UL', value_min: 300, value_max: 300, unit: 'mg/day', basis: 'per_day', source: 'EFSA tolerable upper intake level for vitamin E', source_version: 'EFSA Journal 2024;22(8):8953', source_url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2024.8953', source_locator: 'Abstract: adult UL 300 mg/day including pregnancy and lactation', notes: 'Upper limit from all dietary sources; differs from NAM DRI 1000 mg/day and EFSA is primary for LumeOS.' }),
  ref({ nutrient_code: 'NIA', reference_kind: 'UL', value_min: 35, value_max: 35, unit: 'mg/day', basis: 'per_day', applies_to_intake_sources: ['fortified_foods', 'supplements'], ...NAM_DRI, source_locator: 'Table C-6: adults 19-70 y and >70 y, niacin UL 35 mg/day', notes: 'Applies to synthetic niacin from supplements or fortified foods.' }),
  ref({ nutrient_code: 'VITB6', reference_kind: 'UL', value_min: 12, value_max: 12, unit: 'mg/day', basis: 'per_day', source: 'EFSA tolerable upper intake level for vitamin B6', source_version: 'EFSA Journal 2023;21(5):8006', source_url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2023.8006', source_locator: 'Abstract: adult UL 12 mg/day including pregnancy and lactation', notes: 'EFSA updated UL; differs materially from NAM DRI 100 mg/day.' }),
  ref({ nutrient_code: 'FOLAC', reference_kind: 'UL', value_min: 1000, value_max: 1000, unit: 'ug/day', basis: 'per_day', applies_to_intake_sources: ['supplements'], ...EFSA_TOPIC, source_locator: 'Topic page: existing folate ULs remain unchanged, adults 1000 ug/day', notes: 'Applies to supplemental folic acid and related synthetic forms, not food folate.' }),
  ref({ nutrient_code: 'CA', reference_kind: 'UL', age_min: 18, age_max: 70, value_min: 2.5, value_max: 2.5, unit: 'g/day', basis: 'per_day', ...NAM_DRI, source_locator: 'Table C-7: adults 19-70 y, calcium UL 2.5 g/day', notes: 'NAM DRI UL.' }),
  ref({ nutrient_code: 'CA', reference_kind: 'UL', age_min: 71, age_max: null, value_min: 2.0, value_max: 2.0, unit: 'g/day', basis: 'per_day', ...NAM_DRI, source_locator: 'Table C-7: adults >70 y, calcium UL 2.0 g/day', notes: 'NAM DRI UL.' }),
  ref({ nutrient_code: 'CU', reference_kind: 'UL', value_min: 5000, value_max: 5000, unit: 'ug/day', basis: 'per_day', source: 'EFSA re-evaluation of copper health-based guidance values', source_version: 'EFSA Journal 2023;21(1):7728', source_url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2023.7728', source_locator: 'EFSA news/opinion summary: no copper retention expected up to 5 mg/day', notes: 'EFSA safe level; differs from NAM DRI 10000 ug/day and EFSA is primary for LumeOS.' }),
  ref({ nutrient_code: 'ID', reference_kind: 'UL', value_min: 1100, value_max: 1100, unit: 'ug/day', basis: 'per_day', ...NAM_DRI, source_locator: 'Table C-7: adults 19-70 y and >70 y, iodine UL 1100 ug/day', notes: 'NAM DRI UL.' }),
  ref({ nutrient_code: 'FE', reference_kind: 'UL', value_min: 45, value_max: 45, unit: 'mg/day', basis: 'per_day', ...NAM_DRI, source_locator: 'Table C-7: adults 19-70 y and >70 y, iron UL 45 mg/day', notes: 'UL does not diagnose iron status; ferritin belongs to biomarkers.' }),
  ref({ nutrient_code: 'MG', reference_kind: 'UL', value_min: 350, value_max: 350, unit: 'mg/day', basis: 'per_day', applies_to_intake_sources: ['supplements', 'pharmacological'], ...NAM_DRI, source_locator: 'Table C-7: adults 19-70 y and >70 y, magnesium UL 350 mg/day', notes: 'Applies to pharmacological/supplemental magnesium only, not magnesium naturally present in foods.' }),
  ref({ nutrient_code: 'MN', reference_kind: 'UL', value_min: 11, value_max: 11, unit: 'mg/day', basis: 'per_day', ...NAM_DRI, source_locator: 'Table C-7: adults 19-70 y and >70 y, manganese UL 11 mg/day', notes: 'NAM DRI UL.' }),
  ref({ nutrient_code: 'MO', reference_kind: 'UL', value_min: 2000, value_max: 2000, unit: 'ug/day', basis: 'per_day', ...NAM_DRI, source_locator: 'Table C-7: adults 19-70 y and >70 y, molybdenum UL 2000 ug/day', notes: 'NAM DRI UL.' }),
  ref({ nutrient_code: 'P', reference_kind: 'UL', age_min: 18, age_max: 70, value_min: 4, value_max: 4, unit: 'g/day', basis: 'per_day', ...NAM_DRI, source_locator: 'Table C-7: adults 19-70 y, phosphorus UL 4 g/day', notes: 'NAM DRI UL.' }),
  ref({ nutrient_code: 'P', reference_kind: 'UL', age_min: 71, age_max: null, value_min: 3, value_max: 3, unit: 'g/day', basis: 'per_day', ...NAM_DRI, source_locator: 'Table C-7: adults >70 y, phosphorus UL 3 g/day', notes: 'NAM DRI UL.' }),
  ref({ nutrient_code: 'FD', reference_kind: 'UL', value_min: 10, value_max: 10, unit: 'mg/day', basis: 'per_day', ...NAM_DRI, source_locator: 'Table C-7: adults 19-70 y and >70 y, fluoride UL 10 mg/day', notes: 'NAM DRI UL.' }),
  ref({ nutrient_code: 'ZN', reference_kind: 'UL', value_min: 40, value_max: 40, unit: 'mg/day', basis: 'per_day', ...NAM_DRI, source_locator: 'Table C-7: adults 19-70 y and >70 y, zinc UL 40 mg/day', notes: 'NAM DRI UL.' }),

  // Indispensable amino acids, WHO/FAO/UNU adult scoring pattern.
  ...aaRows(),
]

function sexRows(
  nutrient_code: string,
  reference_kind: string,
  male: number,
  female: number,
  unit: string,
  basis: string,
  source_locator: string,
  notes: string,
): ReferenceRow[] {
  return [
    ref({ nutrient_code, reference_kind, sex: 'male', value_min: male, value_max: male, unit, basis, ...EFSA_DRV, source_locator, notes }),
    ref({ nutrient_code, reference_kind, sex: 'female', value_min: female, value_max: female, unit, basis, ...EFSA_DRV, source_locator, notes }),
  ]
}

function aaRows(): ReferenceRow[] {
  const values: Array<[string, number, string]> = [
    ['HIS', 10, 'Histidine'],
    ['ILE', 20, 'Isoleucine'],
    ['LEU', 39, 'Leucine'],
    ['LYS', 30, 'Lysine'],
    ['THR', 15, 'Threonine'],
    ['TRP', 4, 'Tryptophan'],
    ['VAL', 26, 'Valine'],
  ]
  const rows = values.map(([nutrient_code, value, name]) => ref({
    nutrient_code,
    reference_kind: 'PRI',
    value_min: value,
    value_max: value,
    unit: 'mg/kg bw/day',
    basis: 'per_kg_bw_per_day',
    ...WHO_AA,
    source_locator: 'Table 49: adult indispensable amino acid requirements',
    notes: `${name} adult requirement pattern. Values are per kg body weight per day.`,
  }))
  rows.push(ref({
    nutrient_code: 'MET',
    reference_kind: 'PRI_COMBINED',
    value_min: 15,
    value_max: 15,
    unit: 'mg/kg bw/day',
    basis: 'per_kg_bw_per_day',
    target_applies_to: ['MET', 'CYSTE'],
    ...WHO_AA,
    source_locator: 'Table 49: adult methionine+cysteine requirement',
    notes: 'Combined sulfur amino acid requirement; no standalone methionine target.',
  }))
  rows.push(ref({
    nutrient_code: 'CYSTE',
    reference_kind: 'NO_STANDALONE_REFERENCE',
    unit: 'g',
    basis: 'not_applicable',
    target_applies_to: ['MET', 'CYSTE'],
    ...WHO_AA,
    source_locator: 'Table 49: adult methionine+cysteine requirement',
    notes: 'Covered by the combined methionine+cysteine requirement; no standalone cysteine target.',
  }))
  rows.push(ref({
    nutrient_code: 'PHE',
    reference_kind: 'PRI_COMBINED',
    value_min: 25,
    value_max: 25,
    unit: 'mg/kg bw/day',
    basis: 'per_kg_bw_per_day',
    target_applies_to: ['PHE', 'TYR'],
    ...WHO_AA,
    source_locator: 'Table 49: adult phenylalanine+tyrosine requirement',
    notes: 'Combined aromatic amino acid requirement; no standalone phenylalanine target.',
  }))
  rows.push(ref({
    nutrient_code: 'TYR',
    reference_kind: 'NO_STANDALONE_REFERENCE',
    unit: 'g',
    basis: 'not_applicable',
    target_applies_to: ['PHE', 'TYR'],
    ...WHO_AA,
    source_locator: 'Table 49: adult phenylalanine+tyrosine requirement',
    notes: 'Covered by the combined phenylalanine+tyrosine requirement; no standalone tyrosine target.',
  }))
  rows.push(ref({
    nutrient_code: 'AAE9',
    reference_kind: 'FORMULA',
    unit: 'g',
    basis: 'not_applicable',
    target_applies_to: ['HIS', 'ILE', 'LEU', 'LYS', 'MET', 'CYSTE', 'PHE', 'TYR', 'THR', 'TRP', 'VAL'],
    ...WHO_AA,
    source_locator: 'Table 49 plus BLS formula AAE9',
    notes: 'BLS AAE9 is a sum. Requirements apply to indispensable amino acids and sulfur/aromatic pairs, not to the sum as a separate nutrient.',
  }))
  return rows
}

function noReferenceRow(def: NutrientDef): ReferenceRow {
  const reason = noReferenceReason(def)
  return ref({
    nutrient_code: def.code,
    reference_kind: reason.kind,
    unit: def.unit,
    basis: 'not_applicable',
    source: reason.source,
    source_version: reason.source_version,
    source_url: reason.source_url,
    source_locator: reason.locator,
    notes: reason.notes,
  })
}

function noReferenceReason(def: NutrientDef): { kind: string; source: string; source_version: string; source_url: string; locator: string; notes: string } {
  if (def.formula) {
    return {
      kind: 'FORMULA',
      ...EFSA_DRV,
      locator: 'BLS nutrient_defs formula column plus EFSA DRV summary',
      notes: 'Computed BLS aggregate; no independent dietary reference value was identified for this computed form.',
    }
  }
  if (def.group_de.includes('Organische') || ['ACEAC', 'CITAC', 'LACAC', 'MALAC', 'TARAC'].includes(def.code)) {
    return {
      kind: 'NO_REFERENCE',
      ...EFSA_DRV,
      locator: 'EFSA DRV summary tables cover energy, macronutrients, water, vitamins and minerals; no organic-acid DRVs',
      notes: 'No dietary requirement reference for this food-composition organic acid.',
    }
  }
  if (def.group_de.includes('Zuckeralkohole') || ['MANTL', 'SORTL', 'XYLTL', 'POLYL'].includes(def.code)) {
    return {
      kind: 'NO_REFERENCE',
      ...EFSA_DRV,
      locator: 'EFSA DRV summary carbohydrate table; no polyol requirement',
      notes: 'No requirement reference for individual sugar alcohols; they are energy-contributing food constituents, not required nutrients.',
    }
  }
  if (def.group_de.includes('Fetts')) {
    return {
      kind: 'NO_STANDALONE_REFERENCE',
      ...EFSA_DRV,
      locator: 'Table 3 gives LA, ALA and combined EPA+DHA only',
      notes: 'No standalone DRV for this individual fatty acid or fatty-acid aggregate.',
    }
  }
  if (def.group_de.includes('Aminos')) {
    return {
      kind: 'NO_REFERENCE',
      ...WHO_AA,
      locator: 'Table 49 covers indispensable amino acids and selected pairs only',
      notes: 'No adult requirement reference for this non-essential amino acid as a standalone nutrient.',
    }
  }
  if (def.group_de.includes('Ballast')) {
    return {
      kind: 'NO_STANDALONE_REFERENCE',
      ...EFSA_DRV,
      locator: 'Table 3 gives total dietary fibre only',
      notes: 'No separate DRV for this fibre fraction; total fibre is covered by FIBT.',
    }
  }
  if (def.group_de.includes('Kohlenhydrate')) {
    return {
      kind: 'NO_STANDALONE_REFERENCE',
      ...EFSA_DRV,
      locator: 'Table 3 gives total carbohydrates 45-60 E%; no DRVs for mono-/disaccharide fractions',
      notes: 'No standalone DRV for this carbohydrate fraction; total carbohydrate is covered by CHO.',
    }
  }
  if (def.group_de.includes('Vitamin')) {
    return {
      kind: 'NO_STANDALONE_REFERENCE',
      ...EFSA_DRV,
      locator: 'Tables 8-11 cover vitamin equivalents or main vitamin forms; individual vitamers mostly have no standalone DRV',
      notes: 'No standalone DRV for this vitamer; use the vitamin equivalent where available.',
    }
  }
  if (def.group_de.includes('Elemente')) {
    return {
      kind: 'NO_REFERENCE',
      ...EFSA_DRV,
      locator: 'Tables 4-7 plus footnotes; no adult DRV for this element in the EFSA summary',
      notes: 'No quantified adult dietary reference value identified for this element in the selected sources.',
    }
  }
  return {
    kind: 'NO_REFERENCE',
    ...EFSA_DRV,
    locator: 'EFSA DRV summary scope check',
    notes: 'No dietary intake reference value identified for this BLS nutrient code.',
  }
}

function withConvertedValue(row: ReferenceRow, def: NutrientDef): ReferenceRow {
  if (row.value_min == null && row.value_max == null) return row

  const convertValues = (factor: number, unit: string): ReferenceRow => ({
    ...row,
    value_min: row.value_min == null ? row.value_min : row.value_min * factor,
    value_max: row.value_max == null ? row.value_max : row.value_max * factor,
    unit,
  })

  if (row.basis === 'per_day') {
    if (def.unit === 'µg') {
      if (row.unit === 'mg/day') return convertValues(1000, 'µg')
      if (row.unit === 'ug/day' || row.unit === 'ug RE/day' || row.unit === 'ug DFE/day') {
        return convertValues(1, 'µg')
      }
    }
    if (def.unit === 'mg') {
      if (row.unit === 'g/day') return convertValues(1000, 'mg')
      if (row.unit === 'mg/day') return convertValues(1, 'mg')
    }
    if (def.unit === 'g') {
      if (row.unit === 'mg/day') return convertValues(0.001, 'g')
      if (row.unit === 'g/day') return convertValues(1, 'g')
      if (row.unit === 'L/day' && row.nutrient_code === 'WATER') return convertValues(1000, 'g')
    }
  }

  if (['per_kg_bw_per_day', 'energy_percent', 'per_mj'].includes(row.basis)) {
    return {
      ...row,
      notes: row.notes.includes('GO-00')
        ? row.notes
        : `${row.notes} GO-00: Bewusst abweichende Bezugseinheit; nicht ohne Profilgewicht oder Tagesenergie als Prozentwert interpretieren.`,
    }
  }

  return row
}

function runDockerPsql(args: string[], input?: string): string {
  const result = spawnSync('docker', ['exec', ...(input ? ['-i'] : []), CONTAINER, 'psql', '-U', 'postgres', '-d', DB, ...args], {
    input,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  })
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout)
    process.exit(result.status ?? 1)
  }
  return result.stdout
}

function queryNutrients(): NutrientDef[] {
  const out = runDockerPsql(['-t', '-A', '-F', '\u0001', '-c', `
    SELECT code, unit, group_de, name_de, COALESCE(formula, '')
    FROM nutrition.nutrient_defs
    ORDER BY sort_index, code;
  `])
  return out.split('\n').map(line => line.trimEnd()).filter(Boolean).map(line => {
    const [code, unit, group_de, name_de, formula] = line.split('\u0001')
    return { code, unit, group_de, name_de, formula: formula || null }
  })
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function seed(rows: ReferenceRow[], expectedCodes: number): void {
  const payload = rows.map(row => csvCell(JSON.stringify(row))).join('\n')
  const sql = `\\set ON_ERROR_STOP on
BEGIN;

CREATE TABLE IF NOT EXISTS nutrition.nutrient_reference_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nutrient_code text NOT NULL REFERENCES nutrition.nutrient_defs(code) ON DELETE RESTRICT,
  reference_kind text NOT NULL CHECK (reference_kind IN (
    'AR','PRI','AI','RI','UL','ALAP','FORMULA','NO_REFERENCE',
    'NO_STANDALONE_REFERENCE','AI_COMBINED','PRI_COMBINED'
  )),
  population_group text NOT NULL DEFAULT 'adult',
  age_min integer,
  age_max integer,
  sex text NOT NULL DEFAULT 'both' CHECK (sex IN ('male','female','both')),
  is_pregnant boolean NOT NULL DEFAULT false,
  is_lactating boolean NOT NULL DEFAULT false,
  value_min numeric(12,4),
  value_max numeric(12,4),
  unit text NOT NULL,
  basis text NOT NULL CHECK (basis IN (
    'per_day','per_kg_bw_per_day','energy_percent','per_mj',
    'profile_calculated','as_low_as_possible','not_applicable'
  )),
  target_applies_to text[] NOT NULL DEFAULT '{}',
  applies_to_intake_sources text[] NOT NULL DEFAULT ARRAY['foods', 'fortified_foods', 'supplements', 'pharmacological'],
  source_priority smallint NOT NULL DEFAULT 0 CHECK (source_priority >= 0),
  source text NOT NULL,
  source_version text NOT NULL,
  source_locator text NOT NULL,
  source_url text NOT NULL,
  notes text NOT NULL,
  effective_from date NOT NULL DEFAULT '2020-01-01',
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (age_max IS NULL OR age_min IS NULL OR age_min <= age_max),
  CHECK (
    reference_kind IN ('NO_REFERENCE','NO_STANDALONE_REFERENCE','FORMULA','ALAP')
    OR (value_min IS NOT NULL AND value_max IS NOT NULL)
  ),
  CHECK (
    cardinality(applies_to_intake_sources) > 0
    AND applies_to_intake_sources <@ ARRAY['foods', 'fortified_foods', 'supplements', 'pharmacological']
  ),
  CHECK (value_max IS NULL OR value_min IS NULL OR value_min <= value_max)
);

ALTER TABLE nutrition.nutrient_reference_values
  ADD COLUMN IF NOT EXISTS applies_to_intake_sources text[] NOT NULL
    DEFAULT ARRAY['foods', 'fortified_foods', 'supplements', 'pharmacological'];

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'nutrition.nutrient_reference_values'::regclass
      AND conname = 'nutrient_reference_values_applies_to_intake_sources_check'
  ) THEN
    ALTER TABLE nutrition.nutrient_reference_values
      ADD CONSTRAINT nutrient_reference_values_applies_to_intake_sources_check
      CHECK (
        cardinality(applies_to_intake_sources) > 0
        AND applies_to_intake_sources <@ ARRAY['foods', 'fortified_foods', 'supplements', 'pharmacological']
      );
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_nutrient_reference_values_scope
  ON nutrition.nutrient_reference_values (
    nutrient_code,
    reference_kind,
    population_group,
    COALESCE(age_min, -1),
    COALESCE(age_max, -1),
    sex,
    is_pregnant,
    is_lactating,
    basis,
    source
  );

CREATE TEMP TABLE tmp_nutrient_reference_values (
  payload jsonb NOT NULL
) ON COMMIT DROP;

COPY tmp_nutrient_reference_values (payload) FROM STDIN WITH (FORMAT csv);
${payload}
\\.

TRUNCATE nutrition.nutrient_reference_values;

INSERT INTO nutrition.nutrient_reference_values (
  nutrient_code,
  reference_kind,
  population_group,
  age_min,
  age_max,
  sex,
  is_pregnant,
  is_lactating,
  value_min,
  value_max,
  unit,
  basis,
  target_applies_to,
  applies_to_intake_sources,
  source,
  source_version,
  source_locator,
  source_url,
  notes,
  effective_from
)
SELECT
  payload->>'nutrient_code',
  payload->>'reference_kind',
  COALESCE(payload->>'population_group', 'adult'),
  NULLIF(payload->>'age_min', '')::integer,
  NULLIF(payload->>'age_max', '')::integer,
  COALESCE(payload->>'sex', 'both'),
  COALESCE((payload->>'is_pregnant')::boolean, false),
  COALESCE((payload->>'is_lactating')::boolean, false),
  NULLIF(payload->>'value_min', '')::numeric,
  NULLIF(payload->>'value_max', '')::numeric,
  payload->>'unit',
  payload->>'basis',
  ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'target_applies_to', '[]'::jsonb))),
  ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'applies_to_intake_sources', '["foods", "fortified_foods", "supplements", "pharmacological"]'::jsonb))),
  payload->>'source',
  payload->>'source_version',
  payload->>'source_locator',
  payload->>'source_url',
  payload->>'notes',
  COALESCE(NULLIF(payload->>'effective_from', '')::date, '2020-01-01'::date)
FROM tmp_nutrient_reference_values;

ALTER TABLE nutrition.nutrient_reference_values ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS nutrient_reference_values_select ON nutrition.nutrient_reference_values;
CREATE POLICY nutrient_reference_values_select ON nutrition.nutrient_reference_values
  FOR SELECT TO authenticated USING (true);

GRANT SELECT ON nutrition.nutrient_reference_values TO authenticated;
GRANT ALL ON nutrition.nutrient_reference_values TO service_role;

COMMENT ON TABLE nutrition.nutrient_reference_values IS
  'C-45: Referenzwert-Antworten fuer alle BLS-Naehrstoffcodes. NO_REFERENCE ist ein kuratiertes Ergebnis, keine Leerstelle.';
COMMENT ON COLUMN nutrition.nutrient_reference_values.reference_kind IS
  'Wertart: AR, PRI, AI, RI, UL, ALAP, FORMULA oder ausdruecklich NO_REFERENCE/NO_STANDALONE_REFERENCE.';
COMMENT ON COLUMN nutrition.nutrient_reference_values.applies_to_intake_sources IS
  'C-344: Zulaessige Quellen der aufgenommenen Naehrstoffmenge fuer diesen Referenzwert. foods meint natuerlich vorkommende Lebensmittelnaehrstoffe; fortified_foods, supplements und pharmacological sind getrennt, damit eine quellbeschraenkte UL nicht aus Freitext erraten werden muss.';
COMMENT ON COLUMN nutrition.nutrient_reference_values.source_priority IS
  'C-350: Auswahlprioritaet nur bei sonst gleich passenden Referenzzeilen. 0 ist der Normalfall; ein hoeherer Wert waehlt die fachlich entschiedene Quelle, ohne die andere Quelle zu loeschen.';
COMMENT ON COLUMN nutrition.nutrient_reference_values.source_locator IS
  'Fundstelle innerhalb der Quelle; jede Zahl und jede NO_REFERENCE-Antwort muss eine Fundstelle tragen.';

COMMENT ON COLUMN nutrition.nutrient_defs.rda_male IS
  'UEBERHOLT durch nutrition.nutrient_reference_values (C-45). Nicht mehr fuer neue Referenzwert-Logik nutzen.';
COMMENT ON COLUMN nutrition.nutrient_defs.rda_female IS
  'UEBERHOLT durch nutrition.nutrient_reference_values (C-45). Nicht mehr fuer neue Referenzwert-Logik nutzen.';
COMMENT ON COLUMN nutrition.nutrient_defs.rda_unit IS
  'UEBERHOLT durch nutrition.nutrient_reference_values (C-45). Nicht mehr fuer neue Referenzwert-Logik nutzen.';

DO $$
DECLARE
  v_rows int;
  v_codes int;
  v_missing int;
BEGIN
  SELECT COUNT(*) INTO v_rows FROM nutrition.nutrient_reference_values;
  SELECT COUNT(DISTINCT nutrient_code) INTO v_codes FROM nutrition.nutrient_reference_values;
  SELECT COUNT(*) INTO v_missing
  FROM nutrition.nutrient_defs d
  WHERE NOT EXISTS (
    SELECT 1 FROM nutrition.nutrient_reference_values r
    WHERE r.nutrient_code = d.code
  );

  IF v_codes <> ${expectedCodes} THEN
    RAISE EXCEPTION 'nutrient_reference_values covers % codes, expected ${expectedCodes}', v_codes;
  END IF;
  IF v_missing <> 0 THEN
    RAISE EXCEPTION 'nutrient_reference_values misses % nutrient_defs rows', v_missing;
  END IF;
  IF v_rows < ${expectedCodes} THEN
    RAISE EXCEPTION 'nutrient_reference_values has only % rows, expected at least ${expectedCodes}', v_rows;
  END IF;

  RAISE NOTICE 'OK: % reference rows cover % nutrient codes', v_rows, v_codes;
END $$;

COMMIT;
`
  const out = runDockerPsql(['-f', '-'], sql)
  process.stdout.write(out)
}

const nutrientDefs = queryNutrients()
const defsByCode = new Map(nutrientDefs.map(def => [def.code, def]))
const explicit = references.filter(row => defsByCode.has(row.nutrient_code))
const covered = new Set(explicit.map(row => row.nutrient_code))
const answerRows = [
  ...explicit,
  ...nutrientDefs.filter(def => !covered.has(def.code)).map(noReferenceRow),
].map(row => withConvertedValue(row, defsByCode.get(row.nutrient_code)!))

const duplicateCheck = new Set<string>()
for (const row of answerRows) {
  const key = JSON.stringify([
    row.nutrient_code,
    row.reference_kind,
    row.population_group,
    row.age_min,
    row.age_max,
    row.sex,
    row.is_pregnant,
    row.is_lactating,
    row.basis,
    row.source,
  ])
  if (duplicateCheck.has(key)) {
    console.error(`Duplicate nutrient_reference_values seed scope: ${key}`)
    process.exit(1)
  }
  duplicateCheck.add(key)
}

console.log(`nutrient_reference_values: ${answerRows.length} rows for ${nutrientDefs.length} nutrient codes`)
seed(answerRows, nutrientDefs.length)
