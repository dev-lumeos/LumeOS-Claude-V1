// Nutrition Types V1
// packages/types/src/nutrition/index.ts

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface Food {
  id: string
  bls_key: string
  name: string
  name_de?: string
  category?: string
  calories_per_100g: number
  protein_g: number
  fat_g: number
  carbs_g: number
  fiber_g: number
  sugar_g: number
  micronutrients: Record<string, number>
  created_at: string
  updated_at: string
}

export interface FoodPortion {
  id: string
  food_id: string
  description: string
  amount_g: number
}

export interface DiaryDay {
  id: string
  user_id: string
  entry_date: string
  target_calories?: number
  target_protein_g?: number
  target_fat_g?: number
  target_carbs_g?: number
  notes?: string
  created_at: string
  updated_at: string
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface MealLog {
  id: string
  user_id: string
  diary_day_id: string
  meal_type: MealType
  logged_at: string
  created_at: string
  deleted_at?: string
  items?: MealItem[]
}

export interface MealItem {
  id: string
  meal_log_id: string
  food_id: string
  amount_g: number
  calories: number
  protein_g: number
  fat_g: number
  carbs_g: number
  created_at: string
  deleted_at?: string
}

export interface DailyNutritionSummary {
  id: string
  user_id: string
  summary_date: string
  total_calories: number
  total_protein_g: number
  total_fat_g: number
  total_carbs_g: number
  total_fiber_g: number
  micronutrients: Record<string, number>
  updated_at: string
}

export interface MacroTarget {
  calories: number
  protein_g: number
  fat_g: number
  carbs_g: number
}
