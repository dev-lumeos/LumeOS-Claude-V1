export type ProcessingLevel =
  | 'raw'
  | 'minimally_processed'
  | 'processed'
  | 'ultra_processed'
  | 'cooked'
  | 'fermented'
  | 'smoked'
  | 'dried'
  | 'canned'
  | 'fortified'

export type TagType =
  | 'ingredient'
  | 'diet'
  | 'allergen'
  | 'fitness'
  | 'gym'
  | 'processing'

export type FoodAliasSource = 'editorial' | 'ai_generated' | 'user'

export type V1FoodTagCode =
  | 'high_protein'
  | 'low_carb'
  | 'low_fat'
  | 'high_fiber'
  | 'vegan'
  | 'vegetarian'
  | 'gluten_free'
  | 'lactose_free'
  | 'nut_free'
  | 'halal'
  | 'kosher'
  | 'spicy'
  | 'thai_food'
  | 'mediterranean'
  | 'processed_food'
  | 'ultra_processed'

export interface NutrientDef {
  code: string
  name_de: string
  name_en: string
  unit: string
  group_de: string
  group_en: string
  sort_index: number
  display_tier: 1 | 2 | 3
  is_always_computed: boolean
  is_partly_computed: boolean
  formula: string | null
  rda_male: number | null
  rda_female: number | null
  rda_unit: string | null
}

export interface FoodCategory {
  id: string
  slug: string
  name_de: string
  name_en: string
  name_th: string | null
  parent_id: string | null
  level: 1 | 2 | 3 | 4
  icon: string | null
  sort_order: number | null
  bls_hint: string | null
}

export interface NutritionFood {
  id: string
  bls_code: string
  name_de: string
  name_en: string | null
  name_display: string | null
  name_display_en: string | null
  category_id: string | null
  sort_weight: number
  processing_level: ProcessingLevel | null
  is_prepared_dish: boolean
  enercc: number | null
  enercj: number | null
  water_g: number | null
  prot625: number | null
  fat: number | null
  cho: number | null
  fibt: number | null
  sugar: number | null
  fasat: number | null
  nacl: number | null
  alc: number | null
  created_at: string
  updated_at: string
}

export interface FoodNutrient {
  food_id: string
  nutrient_code: string
  value: number
  data_source: string
}

export interface FoodAlias {
  food_id: string
  alias: string
  locale: string
  source: FoodAliasSource
}

export interface TagDefinition {
  code: string
  name_de: string
  name_en: string
  tag_type: TagType
  is_exclusion_relevant: boolean
  icon: string | null
  sort_order: number | null
  requires_macro_check: boolean | null
  macro_rule: Record<string, unknown> | null
}

export interface FoodTag {
  food_id: string
  tag_code: V1FoodTagCode | string
  confidence: number
}
