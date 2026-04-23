-- Nutrition Schema V1
-- db/schema/nutrition.sql

-- Foods (BLS Database)
CREATE TABLE IF NOT EXISTS foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bls_key VARCHAR(10) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_de TEXT,
  category TEXT,
  calories_per_100g DECIMAL(8,2),
  protein_g DECIMAL(8,2),
  fat_g DECIMAL(8,2),
  carbs_g DECIMAL(8,2),
  fiber_g DECIMAL(8,2),
  sugar_g DECIMAL(8,2),
  micronutrients JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Food Portions
CREATE TABLE IF NOT EXISTS food_portions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount_g DECIMAL(8,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Diary Days
CREATE TABLE IF NOT EXISTS diary_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  entry_date DATE NOT NULL,
  target_calories DECIMAL(8,2),
  target_protein_g DECIMAL(8,2),
  target_fat_g DECIMAL(8,2),
  target_carbs_g DECIMAL(8,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entry_date)
);

-- Meal Logs
CREATE TABLE IF NOT EXISTS meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  diary_day_id UUID REFERENCES diary_days(id) ON DELETE CASCADE,
  meal_type TEXT CHECK (meal_type IN ('breakfast','lunch','dinner','snack')) NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Meal Items
CREATE TABLE IF NOT EXISTS meal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_log_id UUID REFERENCES meal_logs(id) ON DELETE CASCADE,
  food_id UUID REFERENCES foods(id),
  amount_g DECIMAL(8,2) NOT NULL,
  calories DECIMAL(8,2),
  protein_g DECIMAL(8,2),
  fat_g DECIMAL(8,2),
  carbs_g DECIMAL(8,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Daily Nutrition Summaries (aggregated)
CREATE TABLE IF NOT EXISTS daily_nutrition_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  summary_date DATE NOT NULL,
  total_calories DECIMAL(8,2) DEFAULT 0,
  total_protein_g DECIMAL(8,2) DEFAULT 0,
  total_fat_g DECIMAL(8,2) DEFAULT 0,
  total_carbs_g DECIMAL(8,2) DEFAULT 0,
  total_fiber_g DECIMAL(8,2) DEFAULT 0,
  micronutrients JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, summary_date)
);

-- RLS Policies
ALTER TABLE diary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_nutrition_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_diary" ON diary_days
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_own_meal_logs" ON meal_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_own_summaries" ON daily_nutrition_summaries
  FOR ALL USING (auth.uid() = user_id);

-- Foods are public read
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "foods_public_read" ON foods
  FOR SELECT USING (true);
