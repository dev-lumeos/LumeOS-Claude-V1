export type PreferenceMappingStatus = 'mapped' | 'unresolved' | 'deferred'
export type PreferenceTargetType = 'food' | 'category' | 'tag' | 'cuisine' | 'exclusion_preset' | 'catalog_item'
export type PreferenceStrength = 'hard_exclude' | 'strong_avoid' | 'soft_dislike' | 'neutral' | 'like' | 'boost'

export type PreferenceOption = {
  code: string
  label_de: string
  label_en: string
  subtitle_de?: string
  examples_de?: string[]
  strength?: PreferenceStrength
  target_type?: PreferenceTargetType
  mapped_target_type?: PreferenceTargetType
  mapped_codes?: string[]
  mapping_status?: PreferenceMappingStatus
  mapping_note?: string
}

export type PreferenceItem = {
  code: string
  label_de: string
  target_type: PreferenceTargetType
  mapping_status: PreferenceMappingStatus
  mapped_target_type?: PreferenceTargetType
  mapped_codes?: string[]
  mapping_note: string
}

export type PreferenceGroup = {
  code: string
  label_de: string
  target_type: PreferenceTargetType
  mapping_status: PreferenceMappingStatus
  mapped_target_type?: PreferenceTargetType
  mapped_codes?: string[]
  mapping_note: string
  items: PreferenceItem[]
}

export type NutritionPreferenceCatalog = {
  schema_version: 1
  source: 'old_platform_screenshots_and_current_specs'
  write_policy: 'read_only_catalog_no_user_persistence'
  diet_types: PreferenceOption[]
  allergies_intolerances: PreferenceOption[]
  general_exclusions: PreferenceOption[]
  cuisines: PreferenceOption[]
  meal_structure: {
    meals_per_day: number[]
    snacks_per_day: number[]
  }
  cooking_levels: PreferenceOption[]
  prep_time_minutes: number[]
  budget_levels: PreferenceOption[]
  preference_strengths: Array<{
    code: PreferenceStrength
    label_de: string
    smart_search_effect: string
  }>
  food_preference_groups: PreferenceGroup[]
  smart_search_boundary: string[]
}

function item(code: string, label_de: string, mappingNote = 'Specific food preference item requires curated mapping to a food, category, tag, or alias before Smart Search can use it.'): PreferenceItem {
  return {
    code,
    label_de,
    target_type: 'food',
    mapping_status: 'unresolved',
    mapping_note: mappingNote,
  }
}

function group(code: string, label_de: string, items: PreferenceItem[], mappedCodes: string[] = []): PreferenceGroup {
  return {
    code,
    label_de,
    target_type: 'catalog_item',
    mapping_status: mappedCodes.length > 0 ? 'mapped' : 'unresolved',
    mapped_target_type: mappedCodes.length > 0 ? 'category' : undefined,
    mapped_codes: mappedCodes,
    mapping_note: mappedCodes.length > 0
      ? 'Group-level mapping is deterministic to existing Human Layer category slug(s); item-level food mapping remains unresolved unless explicitly mapped.'
      : 'Group is a source-backed old-platform preference group, but it has no deterministic Human Layer target yet.',
    items,
  }
}

export const DIET_TYPES: PreferenceOption[] = [
  { code: 'omnivore', label_de: 'Omnivor', label_en: 'Omnivore', subtitle_de: 'Alles' },
  { code: 'pescatarian', label_de: 'Pescetarisch', label_en: 'Pescatarian', subtitle_de: 'Kein Fleisch' },
  { code: 'vegetarian', label_de: 'Vegetarisch', label_en: 'Vegetarian', subtitle_de: 'Kein Fleisch/Fisch' },
  { code: 'vegan', label_de: 'Vegan', label_en: 'Vegan', subtitle_de: 'Rein pflanzlich' },
  { code: 'keto', label_de: 'Keto', label_en: 'Keto', subtitle_de: 'Sehr low carb' },
  { code: 'paleo', label_de: 'Paleo', label_en: 'Paleo', subtitle_de: 'Keine Getreide' },
  { code: 'mediterranean', label_de: 'Mediterran', label_en: 'Mediterranean', subtitle_de: 'Fisch, Gemüse, Öl' },
  { code: 'custom', label_de: 'Individuell', label_en: 'Custom', subtitle_de: 'Selbst wählen' },
]

export const ALLERGIES_INTOLERANCES: PreferenceOption[] = [
  { code: 'gluten_wheat', label_de: 'Gluten/Weizen', label_en: 'Gluten/wheat', strength: 'hard_exclude' },
  { code: 'milk_protein', label_de: 'Milcheiweiss', label_en: 'Milk protein', strength: 'hard_exclude' },
  { code: 'lactose', label_de: 'Laktose', label_en: 'Lactose', strength: 'hard_exclude' },
  { code: 'eggs', label_de: 'Eier', label_en: 'Eggs', strength: 'hard_exclude' },
  { code: 'fish', label_de: 'Fisch', label_en: 'Fish', strength: 'hard_exclude' },
  { code: 'crustaceans', label_de: 'Krebstiere', label_en: 'Crustaceans', strength: 'hard_exclude' },
  { code: 'molluscs', label_de: 'Weichtiere', label_en: 'Molluscs', strength: 'hard_exclude' },
  { code: 'peanuts', label_de: 'Erdnüsse', label_en: 'Peanuts', strength: 'hard_exclude' },
  { code: 'tree_nuts', label_de: 'Baumnüsse', label_en: 'Tree nuts', strength: 'hard_exclude' },
  { code: 'soy', label_de: 'Soja', label_en: 'Soy', strength: 'hard_exclude' },
  { code: 'celery', label_de: 'Sellerie', label_en: 'Celery', strength: 'hard_exclude' },
  { code: 'mustard', label_de: 'Senf', label_en: 'Mustard', strength: 'hard_exclude' },
  { code: 'sesame', label_de: 'Sesam', label_en: 'Sesame', strength: 'hard_exclude' },
  { code: 'sulfites', label_de: 'Sulfite', label_en: 'Sulphites', strength: 'hard_exclude' },
  { code: 'lupine', label_de: 'Lupine', label_en: 'Lupin', strength: 'hard_exclude' },
  { code: 'fructose', label_de: 'Fruktose', label_en: 'Fructose', strength: 'hard_exclude' },
  { code: 'histamine', label_de: 'Histamin', label_en: 'Histamine', strength: 'hard_exclude' },
  { code: 'sorbitol', label_de: 'Sorbit', label_en: 'Sorbitol', strength: 'hard_exclude' },
  { code: 'fodmap', label_de: 'FODMAP', label_en: 'FODMAP', strength: 'hard_exclude' },
  { code: 'nickel', label_de: 'Nickel', label_en: 'Nickel', strength: 'hard_exclude' },
]

export const GENERAL_EXCLUSIONS: PreferenceOption[] = [
  { code: 'no_offal', label_de: 'Keine Innereien', label_en: 'No offal', examples_de: ['Leber', 'Herz', 'Niere', 'Zunge'], strength: 'hard_exclude', target_type: 'exclusion_preset', mapped_target_type: 'category', mapped_codes: ['innereien'], mapping_status: 'mapped' },
  { code: 'no_processed_meat', label_de: 'Kein verarbeitetes Fleisch', label_en: 'No processed meat', examples_de: ['Wurst', 'Salami', 'Aufschnitt', 'Bacon'], strength: 'hard_exclude', target_type: 'exclusion_preset', mapped_target_type: 'category', mapped_codes: ['wurstwaren-aufschnitt'], mapping_status: 'mapped' },
  { code: 'no_raw_fish', label_de: 'Kein roher Fisch', label_en: 'No raw fish', examples_de: ['Sushi', 'Sashimi', 'Tatar'], strength: 'hard_exclude', target_type: 'exclusion_preset', mapping_status: 'unresolved', mapping_note: 'Requires preparation/raw-state metadata that is not deterministic in the local BLS slice.' },
  { code: 'no_shellfish', label_de: 'Keine Schalentiere', label_en: 'No shellfish', examples_de: ['Garnelen', 'Muscheln', 'Krabben', 'Hummer'], strength: 'hard_exclude', target_type: 'exclusion_preset', mapped_target_type: 'category', mapped_codes: ['schalentiere'], mapping_status: 'mapped' },
  { code: 'no_pork', label_de: 'Kein Schweinefleisch', label_en: 'No pork', examples_de: ['Speck', 'Schinken', 'Schweineschmalz'], strength: 'hard_exclude', target_type: 'exclusion_preset', mapped_target_type: 'category', mapped_codes: ['schweinefleisch'], mapping_status: 'mapped' },
  { code: 'no_red_meat', label_de: 'Kein rotes Fleisch', label_en: 'No red meat', examples_de: ['Rind', 'Schwein', 'Lamm', 'Wild'], strength: 'hard_exclude', target_type: 'exclusion_preset', mapped_target_type: 'category', mapped_codes: ['rindfleisch', 'schweinefleisch', 'lamm-schaf', 'wild'], mapping_status: 'mapped' },
  { code: 'no_dairy', label_de: 'Keine Milchprodukte', label_en: 'No dairy', examples_de: ['Milch', 'Käse', 'Joghurt', 'Quark', 'Butter', 'Sahne'], strength: 'hard_exclude', target_type: 'exclusion_preset', mapped_target_type: 'category', mapped_codes: ['milch-kaese'], mapping_status: 'mapped' },
  { code: 'no_gluten', label_de: 'Kein Gluten', label_en: 'No gluten', examples_de: ['Weizen', 'Roggen', 'Gerste', 'Dinkel', 'Pasta', 'Brot'], strength: 'hard_exclude', target_type: 'exclusion_preset', mapping_status: 'unresolved', mapping_note: 'Requires allergen_gluten or ingredient-level tags; current local V1 visible tags are not sufficient for hard exclusion.' },
]

export const CUISINES: PreferenceOption[] = [
  'german:Deutsch', 'swiss:Schweizerisch', 'italian:Italienisch', 'french:Französisch', 'spanish:Spanisch',
  'greek:Griechisch', 'turkish:Türkisch', 'scandinavian:Skandinavisch', 'british:Britisch', 'thai:Thai',
  'japanese:Japanisch', 'korean:Koreanisch', 'chinese:Chinesisch', 'vietnamese:Vietnamesisch', 'indian:Indisch',
  'indonesian:Indonesisch', 'mexican:Mexikanisch', 'american:Amerikanisch', 'brazilian:Brasilianisch',
  'peruvian:Peruanisch', 'mediterranean:Mediterran', 'middle_eastern:Nahöstlich', 'lebanese:Libanesisch',
  'moroccan:Marokkanisch', 'caribbean:Karibisch', 'african:Afrikanisch', 'fusion:Fusion',
].map(item => {
  const [code, label] = item.split(':')
  return { code: code ?? '', label_de: label ?? '', label_en: label ?? '', target_type: 'cuisine' as const, mapping_status: 'deferred' as const, mapping_note: 'Cuisine preference is catalogued, but not mapped to food_tags without explicit curated/source-backed cuisine rules.' }
})

export const COOKING_LEVELS: PreferenceOption[] = [
  { code: 'beginner', label_de: 'Einfach', label_en: 'Beginner', subtitle_de: 'Max. 5 Zutaten' },
  { code: 'intermediate', label_de: 'Normal', label_en: 'Intermediate', subtitle_de: 'Standard-Rezepte' },
  { code: 'advanced', label_de: 'Fortgeschritten', label_en: 'Advanced', subtitle_de: 'Komplexe Gerichte' },
]

export const BUDGET_LEVELS: PreferenceOption[] = [
  { code: 'low', label_de: 'Sparsam', label_en: 'Low' },
  { code: 'medium', label_de: 'Normal', label_en: 'Medium' },
  { code: 'high', label_de: 'Premium', label_en: 'High' },
  { code: 'no_limit', label_de: 'Egal', label_en: 'No limit' },
]

export const PREFERENCE_STRENGTHS: NutritionPreferenceCatalog['preference_strengths'] = [
  { code: 'hard_exclude', label_de: 'Harter Ausschluss', smart_search_effect: 'Remove matching foods from Smart Search results.' },
  { code: 'strong_avoid', label_de: 'Stark vermeiden', smart_search_effect: 'Strong negative ranking signal unless no alternatives exist.' },
  { code: 'soft_dislike', label_de: 'Mag ich nicht', smart_search_effect: 'Lower ranking; does not remove by default.' },
  { code: 'neutral', label_de: 'Egal', smart_search_effect: 'No ranking adjustment.' },
  { code: 'like', label_de: 'Mag ich', smart_search_effect: 'Positive ranking boost.' },
  { code: 'boost', label_de: 'Bevorzugen', smart_search_effect: 'Strong positive ranking boost for explicit preference contexts.' },
]

export const FOOD_PREFERENCE_GROUPS: PreferenceGroup[] = [
  group('poultry', 'Geflügel', ['Hähnchenbrust', 'Hähnchenschenkel', 'Hähnchenflügel', 'Ganzes Hähnchen', 'Putenbrust', 'Putenschenkel', 'Putenhack', 'Ente'].map(v => item(v.toLowerCase().replace(/\s+/g, '_'), v)), ['gefluegel-haehnchen']),
  group('beef', 'Rind', ['Rinderfilet', 'Roastbeef/Sirloin', 'Ribeye', 'Rumpsteak', 'Rinderhack', 'Rinderbraten', 'Gulasch/Suppenfleisch', 'Tatar'].map(v => item(v.toLowerCase().replace(/[\/\s]+/g, '_'), v)), ['rindfleisch']),
  group('veal', 'Kalb', ['Kalbsschnitzel', 'Kalbsfilet', 'Kalbsbraten', 'Kalbshack', 'Ossobuco'].map(v => item(v.toLowerCase().replace(/\s+/g, '_'), v))),
  group('pork', 'Schwein', ['Schweinekotelett', 'Schweinefilet', 'Schweineschulter', 'Schweinebauch', 'Schweinehack', 'Spareribs', 'Speck/Bacon', 'Schinken gekocht', 'Rohschinken/Serrano'].map(v => item(v.toLowerCase().replace(/[\/\s]+/g, '_'), v)), ['schweinefleisch']),
  group('game_special', 'Wild & Spezial', ['Lammkotelett', 'Lammkeule', 'Lammhack', 'Reh/Hirsch', 'Wildschwein', 'Kaninchen', 'Bison'].map(v => item(v.toLowerCase().replace(/[\/\s]+/g, '_'), v)), ['lamm-schaf', 'wild']),
  group('offal', 'Innereien', ['Rinderleber', 'Geflügelleber', 'Schweineleber', 'Herz', 'Niere', 'Zunge', 'Sonstige Innereien'].map(v => item(v.toLowerCase().replace(/\s+/g, '_'), v)), ['innereien']),
  group('sausages_cold_cuts', 'Wurst & Aufschnitt', ['Bratwurst', 'Wiener/Frankfurter', 'Salami', 'Chorizo', 'Mortadella', 'Geflügelwurst', 'Putenaufschnitt'].map(v => item(v.toLowerCase().replace(/[\/\s]+/g, '_'), v)), ['wurstwaren-aufschnitt']),
  group('fish', 'Fisch', ['Lachs', 'Thunfisch frisch', 'Thunfisch Dose', 'Kabeljau/Dorsch', 'Wolfsbarsch', 'Forelle', 'Tilapia', 'Pangasius', 'Hering', 'Makrele', 'Sardinen', 'Räucherlachs', 'Sashimi/Sushi-Fisch'].map(v => item(v.toLowerCase().replace(/[\/\s]+/g, '_'), v)), ['fisch-meeresfruechte']),
  group('seafood', 'Meeresfrüchte', ['Garnelen/Shrimps', 'Riesengarnelen', 'Tintenfisch/Calamari', 'Oktopus', 'Muscheln', 'Krabben/Krebs', 'Jakobsmuscheln'].map(v => item(v.toLowerCase().replace(/[\/\s]+/g, '_'), v)), ['schalentiere']),
  group('dairy_cheese', 'Milch & Käse', ['Milch', 'Griech. Joghurt', 'Skyr', 'Magerquark', 'Hüttenkäse', 'Mozzarella', 'Parmesan', 'Gouda', 'Feta', 'Frischkäse', 'Ricotta', 'Butter', 'Sahne', 'Whey Protein', 'Casein Protein'].map(v => item(v.toLowerCase().replace(/[.\s]+/g, '_'), v)), ['milch-kaese']),
  group('eggs_plant_protein', 'Eier & pflanzl. Protein', ['Eier', 'Eiweiss/Eiklar', 'Tofu', 'Räuchertofu', 'Tempeh', 'Seitan', 'Edamame', 'Rote Linsen', 'Grüne Linsen', 'Kichererbsen', 'Kidneybohnen', 'Schwarze Bohnen', 'Weisse Bohnen', 'Erbsenprotein', 'Sojagranulat'].map(v => item(v.toLowerCase().replace(/[\/\s]+/g, '_'), v)), ['eier']),
  group('grains_sides', 'Getreide & Beilagen', ['Reis weiss', 'Reis braun', 'Basmatireis', 'Jasminreis', 'Haferflocken', 'Haferkleie', 'Pasta/Nudeln', 'Vollkornnudeln', 'Reisnudeln', 'Quinoa', 'Couscous', 'Bulgur', 'Amaranth', 'Hirse', 'Buchweizen', 'Polenta/Mais', 'Kartoffeln', 'Süßkartoffel'].map(v => item(v.toLowerCase().replace(/[\/\s]+/g, '_'), v)), ['getreide-brot-pasta']),
  group('bread_bakery', 'Brot & Backwaren', ['Vollkornbrot', 'Sauerteigbrot', 'Roggenbrot', 'Weissbrot', 'Toast', 'Bagel', 'Wrap/Tortilla', 'Pitabrot', 'Naan', 'Reiswaffeln', 'Knäckebrot', 'Croissant', 'Pancakes'].map(v => item(v.toLowerCase().replace(/[\/\s]+/g, '_'), v)), ['brot-kleingebaeck']),
  group('vegetables', 'Gemüse', ['Brokkoli', 'Spinat', 'Grünkohl', 'Paprika', 'Tomaten', 'Zucchini', 'Gurke', 'Spargel', 'Grüne Bohnen', 'Erbsen', 'Pilze/Champignons', 'Zwiebeln', 'Knoblauch', 'Karotten', 'Blumenkohl', 'Rosenkohl', 'Aubergine', 'Kohl/Weisskraut', 'Blattsalate', 'Mais', 'Rote Bete', 'Sellerie', 'Fenchel', 'Lauch', 'Radieschen/Rettich', 'Artischocke', 'Pak Choi', 'Bambussprossen', 'Sojasprossen'].map(v => item(v.toLowerCase().replace(/[\/\s]+/g, '_'), v)), ['gemuese']),
  group('fruit', 'Obst', ['Banane', 'Apfel', 'Blaubeeren', 'Erdbeeren', 'Himbeeren', 'Trauben', 'Orange', 'Mandarine', 'Grapefruit', 'Zitrone', 'Mango', 'Ananas', 'Papaya', 'Wassermelone', 'Honigmelone', 'Kiwi', 'Birne', 'Pfirsich', 'Pflaume', 'Kirschen', 'Granatapfel', 'Kokosnuss', 'Datteln', 'Feigen', 'Trockenfrüchte'].map(v => item(v.toLowerCase().replace(/\s+/g, '_'), v)), ['obst']),
  group('fats_oils', 'Fette & Öle', ['Olivenöl', 'Kokosöl', 'Avocadoöl', 'Sesamöl', 'Rapsöl', 'Leinöl', 'Avocado', 'Oliven'].map(v => item(v.toLowerCase().replace(/\s+/g, '_'), v)), ['fette-oele']),
  group('nuts_seeds', 'Nüsse & Samen', ['Mandeln', 'Walnüsse', 'Cashews', 'Pistazien', 'Haselnüsse', 'Macadamia', 'Paranüsse', 'Pekannüsse', 'Pinienkerne', 'Erdnüsse', 'Erdnussbutter', 'Mandelmus', 'Chiasamen', 'Leinsamen', 'Sonnenblumenkerne', 'Kürbiskerne', 'Sesam', 'Hanfsamen', 'Tahini', 'Studentenfutter'].map(v => item(v.toLowerCase().replace(/\s+/g, '_'), v)), ['huelsenfruechte-nuesse-samen']),
  group('sauces_extras', 'Saucen & Extras', ['Sojasauce', 'Scharfe Sauce', 'Ketchup', 'Senf', 'Mayonnaise', 'Hummus', 'Pesto', 'Honig', 'Ahornsirup', 'Essig', 'Kokosmilch', 'Hafermilch', 'Mandelmilch', 'Sojamilch', 'Dunkle Schokolade', 'Proteinriegel'].map(v => item(v.toLowerCase().replace(/\s+/g, '_'), v))),
]

export function getNutritionPreferenceCatalog(): NutritionPreferenceCatalog {
  return {
    schema_version: 1,
    source: 'old_platform_screenshots_and_current_specs',
    write_policy: 'read_only_catalog_no_user_persistence',
    diet_types: DIET_TYPES,
    allergies_intolerances: ALLERGIES_INTOLERANCES,
    general_exclusions: GENERAL_EXCLUSIONS,
    cuisines: CUISINES,
    meal_structure: {
      meals_per_day: [2, 3, 4, 5, 6],
      snacks_per_day: [0, 1, 2, 3],
    },
    cooking_levels: COOKING_LEVELS,
    prep_time_minutes: [15, 20, 30, 45, 60],
    budget_levels: BUDGET_LEVELS,
    preference_strengths: PREFERENCE_STRENGTHS,
    food_preference_groups: FOOD_PREFERENCE_GROUPS,
    smart_search_boundary: [
      'Hard exclusions remove matching foods only after deterministic category/tag/food mappings exist.',
      'Likes boost ranking; dislikes lower ranking unless explicitly configured as hard exclusions.',
      'Preference priority is food > category > tag.',
      'Cuisine preferences remain catalog values until curated/source-backed cuisine mappings exist.',
      'No diary logging, MealItem creation, or persisted user preference writes are enabled in this slice.',
    ],
  }
}

export function summarizePreferenceCatalog(catalog = getNutritionPreferenceCatalog()) {
  const foodPreferenceItems = catalog.food_preference_groups.reduce((sum, group) => sum + group.items.length, 0)
  const mappedExclusions = catalog.general_exclusions.filter(item => item.mapping_status === 'mapped').length
  const unresolvedExclusions = catalog.general_exclusions.filter(item => item.mapping_status !== 'mapped').length
  const mappedGroups = catalog.food_preference_groups.filter(group => group.mapping_status === 'mapped').length
  const unresolvedGroups = catalog.food_preference_groups.length - mappedGroups
  return {
    diet_types: catalog.diet_types.length,
    allergies_intolerances: catalog.allergies_intolerances.length,
    general_exclusions: catalog.general_exclusions.length,
    mapped_general_exclusions: mappedExclusions,
    unresolved_general_exclusions: unresolvedExclusions,
    cuisines: catalog.cuisines.length,
    cooking_levels: catalog.cooking_levels.length,
    budget_levels: catalog.budget_levels.length,
    preference_strengths: catalog.preference_strengths.length,
    food_preference_groups: catalog.food_preference_groups.length,
    food_preference_items: foodPreferenceItems,
    mapped_food_preference_groups: mappedGroups,
    unresolved_food_preference_groups: unresolvedGroups,
  }
}
