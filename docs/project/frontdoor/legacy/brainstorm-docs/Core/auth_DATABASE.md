# Auth Database Schema Documentation

## Overview

The Auth module utilizes a hybrid architecture combining Supabase Auth for core authentication functionality with extended PostgreSQL tables for fitness-specific user profile data. This design provides enterprise-grade security while enabling the rich user profiling required for Lumeos' health and performance features.

## Database Architecture

### Hybrid Storage Strategy
```sql
-- Supabase Auth (managed service)
-- auth.users          → Core identity, email, password
-- auth.sessions       → JWT sessions, refresh tokens  
-- auth.user_metadata  → Basic profile (display_name, locale, role)

-- Lumeos Tables (custom schema)
-- public.user_profiles      → Extended fitness profile
-- public.user_nutrition_goals → Goal-based nutrition targets
-- public.user_food_preferences → Dietary preferences 
-- public.subscriptions      → Plan and billing
-- public.wallet_accounts    → Voucher system
```

### Integration Architecture
```typescript
interface AuthDatabaseArchitecture {
  supabaseAuth: {
    userIdentity: 'email_password_sessions';
    emailVerification: 'built_in_flows';
    passwordReset: 'secure_email_flows';
    sessionManagement: 'jwt_refresh_tokens';
    roleBasedAccess: 'user_metadata';
  };
  
  lumeosExtensions: {
    fitnessProfile: 'user_profiles';
    goalManagement: 'user_nutrition_goals';
    preferences: 'user_food_preferences';
    subscriptionData: 'subscriptions';
    walletSystem: 'wallet_accounts';
  };
  
  dataFlow: {
    registration: 'supabase_auth → lumeos_profile_creation';
    login: 'supabase_auth → lumeos_profile_hydration';
    profileUpdate: 'supabase_metadata + lumeos_tables';
    goalSetting: 'lumeos_tables → cross_module_integration';
  };
}
```

## Core User Management Tables

### Supabase Auth Users (Reference)
```sql
-- Managed by Supabase (read-only reference)
-- auth.users table structure
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  encrypted_password VARCHAR(255),
  email_confirmed_at TIMESTAMPTZ,
  invited_at TIMESTAMPTZ,
  confirmation_token VARCHAR(255),
  confirmation_sent_at TIMESTAMPTZ,
  recovery_token VARCHAR(255),
  recovery_sent_at TIMESTAMPTZ,
  email_change_token_new VARCHAR(255),
  email_change VARCHAR(255),
  email_change_sent_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  raw_app_meta_data JSONB,
  raw_user_meta_data JSONB,
  is_super_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  phone VARCHAR(15),
  phone_confirmed_at TIMESTAMPTZ,
  phone_change VARCHAR(15),
  phone_change_token VARCHAR(255),
  phone_change_sent_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
  email_change_token_current VARCHAR(255) DEFAULT '',
  email_change_confirm_status SMALLINT DEFAULT 0,
  banned_until TIMESTAMPTZ,
  reauthentication_token VARCHAR(255),
  reauthentication_sent_at TIMESTAMPTZ
);
```

**User Metadata Structure:**
```typescript
interface SupabaseUserMetadata {
  // Basic profile information
  display_name?: string;           // User's preferred display name
  locale?: 'de' | 'en' | 'th';    // Interface language preference
  timezone?: string;               // User's timezone
  avatar_url?: string;             // Profile picture URL
  
  // Onboarding tracking
  onboarding_completed?: boolean;  // Onboarding completion status
  onboarding_step?: number;        // Current step (0-7)
  
  // Role and permissions
  role?: 'user' | 'coach' | 'admin'; // User role for permissions
  
  // Account status
  is_active?: boolean;             // Account active status
  registration_source?: string;    // How user found Lumeos
}
```

### user_profiles - Extended Fitness Profile
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  birth_date DATE,
  height_cm NUMERIC(5,2) CHECK (height_cm >= 100 AND height_cm <= 250),
  weight_kg NUMERIC(5,2) CHECK (weight_kg >= 30 AND weight_kg <= 200),
  body_fat_pct NUMERIC(4,2) CHECK (body_fat_pct >= 0 AND body_fat_pct <= 60),
  
  -- Fitness Profile
  experience_level VARCHAR(20) CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'elite')),
  training_frequency INTEGER CHECK (training_frequency >= 0 AND training_frequency <= 14),
  training_duration INTEGER CHECK (training_duration >= 15 AND training_duration <= 300), -- minutes
  primary_goal VARCHAR(50),
  
  -- Lifestyle and Preferences
  dietary_preference VARCHAR(20) CHECK (dietary_preference IN (
    'omnivore', 'vegetarian', 'vegan', 'pescatarian', 
    'keto', 'paleo', 'mediterranean', 'custom'
  )),
  allergies TEXT[], -- Array of food allergies/restrictions
  unit_system VARCHAR(10) DEFAULT 'metric' CHECK (unit_system IN ('metric', 'imperial')),
  equipment_access TEXT, -- Comma-separated list of available equipment
  
  -- Health Information
  medical_conditions TEXT[],
  medications TEXT[],
  injuries TEXT[],
  physical_limitations TEXT,
  
  -- Goal History Tracking
  initial_weight_kg NUMERIC(5,2), -- Weight at registration
  goal_weight_kg NUMERIC(5,2),    -- Target weight
  weight_loss_goal_kg NUMERIC(5,2), -- Total weight loss goal
  muscle_gain_goal_kg NUMERIC(5,2), -- Muscle gain goal
  body_fat_goal_pct NUMERIC(4,2),   -- Target body fat percentage
  
  -- Activity and Lifestyle
  activity_level VARCHAR(20) CHECK (activity_level IN (
    'sedentary', 'light', 'moderate', 'active', 'very_active'
  )),
  occupation VARCHAR(100),           -- Job type for activity estimation
  sleep_hours_target NUMERIC(3,1),  -- Target sleep per night
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  
  -- Preferences and Settings
  notification_preferences JSONB,    -- Notification settings
  privacy_settings JSONB,           -- Privacy preferences
  data_sharing_consent BOOLEAN DEFAULT false,
  marketing_consent BOOLEAN DEFAULT false,
  
  -- Tracking and Analytics
  profile_completion_percentage INTEGER DEFAULT 0,
  last_active_date DATE,
  profile_views INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id),
  CHECK (birth_date <= CURRENT_DATE - INTERVAL '13 years'), -- Minimum age 13
  CHECK (goal_weight_kg IS NULL OR goal_weight_kg > 0),
  CHECK (profile_completion_percentage >= 0 AND profile_completion_percentage <= 100)
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_experience_level ON user_profiles(experience_level);
CREATE INDEX idx_user_profiles_goal ON user_profiles(primary_goal);
CREATE INDEX idx_user_profiles_updated_at ON user_profiles(updated_at);
CREATE INDEX idx_user_profiles_active ON user_profiles(last_active_date) WHERE last_active_date IS NOT NULL;
```

### user_nutrition_goals - Goal-Based Nutrition System
```sql
CREATE TABLE user_nutrition_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Goal Definition
  goal_type VARCHAR(30) NOT NULL, -- Legacy goal type
  goal_type_new VARCHAR(30), -- New detailed goal type
  goal_description TEXT,
  
  -- TDEE and Calorie Calculation
  tdee_calculated INTEGER NOT NULL CHECK (tdee_calculated >= 1000 AND tdee_calculated <= 5000),
  tdee_modifier NUMERIC(4,3) DEFAULT 0 CHECK (tdee_modifier >= -0.5 AND tdee_modifier <= 0.5),
  calorie_target INTEGER NOT NULL CHECK (calorie_target >= 800 AND calorie_target <= 5000),
  
  -- Macronutrient Targets
  protein_target NUMERIC(6,2) NOT NULL CHECK (protein_target >= 50 AND protein_target <= 400),
  carbs_target NUMERIC(6,2) NOT NULL CHECK (carbs_target >= 50 AND carbs_target <= 800),
  fat_target NUMERIC(6,2) NOT NULL CHECK (fat_target >= 20 AND fat_target <= 300),
  fiber_target NUMERIC(5,2) DEFAULT 25 CHECK (fiber_target >= 15 AND fiber_target <= 80),
  
  -- Advanced Calculations
  protein_per_kg NUMERIC(3,1) DEFAULT 1.6 CHECK (protein_per_kg >= 0.8 AND protein_per_kg <= 3.5),
  weekly_rate NUMERIC(4,2), -- kg/week target rate (positive for gain, negative for loss)
  max_duration_weeks INTEGER CHECK (max_duration_weeks >= 1 AND max_duration_weeks <= 52),
  
  -- User Context at Goal Creation
  current_weight_kg NUMERIC(5,2),
  height_cm NUMERIC(5,2),
  age INTEGER,
  gender VARCHAR(10),
  activity_level VARCHAR(20),
  training_days_per_week INTEGER,
  
  -- Goal Timeline
  started_at TIMESTAMPTZ DEFAULT NOW(),
  target_completion_date DATE,
  actual_completion_date DATE,
  
  -- Goal Management
  is_active BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN (
    'active', 'paused', 'completed', 'cancelled', 'replaced'
  )),
  pause_reason TEXT,
  completion_notes TEXT,
  
  -- Onboarding Integration
  onboarding_completed BOOLEAN DEFAULT false,
  created_from_onboarding BOOLEAN DEFAULT false,
  
  -- Success Tracking
  adherence_rate NUMERIC(3,2), -- 0-1, calculated from food logs
  progress_percentage NUMERIC(5,2), -- 0-100, progress toward goal
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  
  -- AI and Optimization
  ai_generated BOOLEAN DEFAULT false,
  optimization_version INTEGER DEFAULT 1,
  last_optimized_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure only one active goal per user
  UNIQUE(user_id, is_active) DEFERRABLE INITIALLY DEFERRED,
  
  -- Validation constraints
  CHECK (protein_target + carbs_target + fat_target > 0),
  CHECK (target_completion_date IS NULL OR target_completion_date > started_at::date),
  CHECK (actual_completion_date IS NULL OR actual_completion_date >= started_at::date)
);

-- Indexes
CREATE INDEX idx_user_nutrition_goals_user_active ON user_nutrition_goals(user_id, is_active);
CREATE INDEX idx_user_nutrition_goals_status ON user_nutrition_goals(status);
CREATE INDEX idx_user_nutrition_goals_goal_type ON user_nutrition_goals(goal_type_new);
CREATE INDEX idx_user_nutrition_goals_started_at ON user_nutrition_goals(started_at);
CREATE UNIQUE INDEX idx_one_active_goal_per_user ON user_nutrition_goals(user_id) WHERE is_active = true;
```

### user_food_preferences - Dietary Preferences
```sql
CREATE TABLE user_food_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dietary Approach
  diet_type VARCHAR(30) DEFAULT 'omnivore' CHECK (diet_type IN (
    'omnivore', 'vegetarian', 'vegan', 'pescatarian',
    'keto', 'paleo', 'mediterranean', 'low_carb', 'low_fat',
    'intermittent_fasting', 'carnivore', 'custom'
  )),
  diet_restrictions TEXT[], -- Additional restrictions beyond main type
  
  -- Allergies and Medical Restrictions
  allergies TEXT[] DEFAULT '{}', -- Food allergies
  intolerances TEXT[] DEFAULT '{}', -- Food intolerances (lactose, gluten, etc.)
  medical_restrictions TEXT[], -- Medically required restrictions
  religious_restrictions TEXT[], -- Religious dietary restrictions
  
  -- Meal Structure Preferences
  meals_per_day INTEGER DEFAULT 3 CHECK (meals_per_day >= 1 AND meals_per_day <= 10),
  snacks_per_day INTEGER DEFAULT 1 CHECK (snacks_per_day >= 0 AND snacks_per_day <= 5),
  preferred_meal_times TIME[], -- Preferred times for main meals
  
  -- Food Preferences
  liked_foods JSONB DEFAULT '[]', -- Foods user enjoys
  disliked_foods JSONB DEFAULT '[]', -- Foods user wants to avoid
  neutral_foods JSONB DEFAULT '[]', -- Foods user is indifferent about
  
  -- Cooking and Preparation
  cooking_skill_level VARCHAR(20) DEFAULT 'intermediate' CHECK (cooking_skill_level IN (
    'beginner', 'intermediate', 'advanced', 'expert'
  )),
  cooking_time_available INTEGER, -- Minutes per day available for cooking
  meal_prep_preference BOOLEAN DEFAULT false, -- Prefers meal prepping
  kitchen_equipment TEXT[], -- Available cooking equipment
  
  -- Budget and Shopping
  food_budget_monthly NUMERIC(8,2), -- Monthly food budget
  shopping_frequency VARCHAR(20), -- How often user shops for groceries
  preferred_stores TEXT[], -- Preferred grocery stores
  organic_preference BOOLEAN DEFAULT false,
  local_preference BOOLEAN DEFAULT false,
  
  -- Cultural and Personal Preferences
  cuisine_preferences TEXT[], -- Preferred cuisines (italian, asian, etc.)
  spice_tolerance VARCHAR(20) DEFAULT 'medium' CHECK (spice_tolerance IN (
    'none', 'mild', 'medium', 'hot', 'very_hot'
  )),
  texture_preferences TEXT[], -- Preferred food textures
  flavor_preferences TEXT[], -- Preferred flavors (sweet, savory, etc.)
  
  -- Hydration Preferences
  water_goal_ml INTEGER DEFAULT 2500,
  preferred_beverages TEXT[],
  caffeine_limit_mg INTEGER DEFAULT 400,
  alcohol_consumption VARCHAR(20) DEFAULT 'occasional',
  
  -- Special Considerations
  pregnancy_status BOOLEAN DEFAULT false,
  breastfeeding_status BOOLEAN DEFAULT false,
  eating_disorder_history BOOLEAN DEFAULT false,
  medication_interactions TEXT[],
  
  -- Tracking and Analytics
  preference_confidence_score NUMERIC(3,2) DEFAULT 0.5, -- How confident we are in preferences
  preference_learning_enabled BOOLEAN DEFAULT true,
  last_preference_update TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id),
  CHECK (water_goal_ml >= 1000 AND water_goal_ml <= 5000),
  CHECK (preference_confidence_score >= 0 AND preference_confidence_score <= 1)
);

-- Indexes
CREATE INDEX idx_user_food_preferences_user_id ON user_food_preferences(user_id);
CREATE INDEX idx_user_food_preferences_diet_type ON user_food_preferences(diet_type);
CREATE INDEX idx_user_food_preferences_allergies ON user_food_preferences USING gin(allergies);
CREATE INDEX idx_user_food_preferences_liked_foods ON user_food_preferences USING gin(liked_foods);
```

## Subscription and Billing Tables

### subscriptions - User Plan Management
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Subscription Details
  plan VARCHAR(20) NOT NULL CHECK (plan IN ('free', 'pro', 'elite', 'coach')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN (
    'active', 'cancelled', 'expired', 'suspended', 'pending'
  )),
  
  -- Billing Information
  billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN (
    'monthly', 'yearly', 'lifetime'
  )),
  price NUMERIC(8,2), -- Price paid for this subscription
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Subscription Timeline
  started_at TIMESTAMPTZ DEFAULT NOW(),
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancelled_reason TEXT,
  
  -- Payment Integration
  stripe_subscription_id VARCHAR(100),
  stripe_customer_id VARCHAR(100),
  payment_method_type VARCHAR(50),
  last_payment_date TIMESTAMPTZ,
  next_payment_date TIMESTAMPTZ,
  
  -- Trial Information
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  trial_used BOOLEAN DEFAULT false,
  
  -- Plan Features Snapshot
  features_snapshot JSONB, -- Features available at subscription time
  plan_limits JSONB, -- Specific limits for this plan
  
  -- Discounts and Promotions
  discount_code VARCHAR(50),
  discount_percentage NUMERIC(5,2),
  discount_amount NUMERIC(8,2),
  promotional_pricing BOOLEAN DEFAULT false,
  
  -- Usage Tracking
  ai_messages_used INTEGER DEFAULT 0,
  ai_messages_limit INTEGER,
  mealcam_scans_used INTEGER DEFAULT 0,
  mealcam_scans_limit INTEGER,
  
  -- Billing History
  total_paid NUMERIC(10,2) DEFAULT 0,
  payments_count INTEGER DEFAULT 0,
  failed_payments_count INTEGER DEFAULT 0,
  last_failed_payment_date TIMESTAMPTZ,
  
  -- Account Management
  auto_renew BOOLEAN DEFAULT true,
  renewal_reminder_sent BOOLEAN DEFAULT false,
  upgrade_requested BOOLEAN DEFAULT false,
  downgrade_at_period_end BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one active subscription per user
  UNIQUE(user_id, status) DEFERRABLE INITIALLY DEFERRED,
  
  CHECK (current_period_end > current_period_start),
  CHECK (price >= 0),
  CHECK (ai_messages_used >= 0),
  CHECK (mealcam_scans_used >= 0)
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_renewal ON subscriptions(next_payment_date) WHERE status = 'active';
CREATE UNIQUE INDEX idx_one_active_subscription ON subscriptions(user_id) WHERE status = 'active';
```

### wallet_accounts - Voucher and Transaction System
```sql
CREATE TABLE wallet_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Account Details
  account_type VARCHAR(20) DEFAULT 'voucher' CHECK (account_type IN ('voucher', 'revenue')),
  balance NUMERIC(10,2) DEFAULT 0 CHECK (balance >= 0),
  currency VARCHAR(3) DEFAULT 'EUR',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
  
  -- Voucher System (for regular users)
  monthly_voucher_amount NUMERIC(8,2) DEFAULT 0, -- Monthly voucher allocation
  voucher_last_credited TIMESTAMPTZ,
  voucher_expiration_date DATE, -- When unused vouchers expire
  total_vouchers_received NUMERIC(10,2) DEFAULT 0,
  total_vouchers_spent NUMERIC(10,2) DEFAULT 0,
  
  -- Revenue Wallet (for coaches)
  is_revenue_wallet BOOLEAN DEFAULT false,
  revenue_withdrawable BOOLEAN DEFAULT false, -- Can withdraw revenue to bank
  minimum_withdrawal_amount NUMERIC(8,2) DEFAULT 50,
  last_withdrawal_date TIMESTAMPTZ,
  total_withdrawals NUMERIC(10,2) DEFAULT 0,
  
  -- Transaction Limits
  daily_spending_limit NUMERIC(8,2),
  monthly_spending_limit NUMERIC(8,2),
  transaction_fee_percentage NUMERIC(5,4) DEFAULT 0.029, -- 2.9% default
  
  -- Banking Information (for revenue wallets)
  bank_account_verified BOOLEAN DEFAULT false,
  bank_verification_date TIMESTAMPTZ,
  payout_method VARCHAR(30) CHECK (payout_method IN ('bank_transfer', 'paypal', 'stripe')),
  
  -- Account Security
  pin_hash VARCHAR(255), -- For transaction authorization
  pin_attempts INTEGER DEFAULT 0,
  pin_locked_until TIMESTAMPTZ,
  two_factor_enabled BOOLEAN DEFAULT false,
  
  -- Analytics
  total_transactions INTEGER DEFAULT 0,
  average_transaction_amount NUMERIC(8,2) DEFAULT 0,
  largest_transaction_amount NUMERIC(8,2) DEFAULT 0,
  last_transaction_date TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, account_type),
  CHECK (balance >= 0),
  CHECK (monthly_voucher_amount >= 0),
  CHECK (minimum_withdrawal_amount >= 0)
);

-- Indexes
CREATE INDEX idx_wallet_accounts_user_id ON wallet_accounts(user_id);
CREATE INDEX idx_wallet_accounts_type ON wallet_accounts(account_type);
CREATE INDEX idx_wallet_accounts_balance ON wallet_accounts(balance) WHERE balance > 0;
CREATE INDEX idx_wallet_accounts_voucher_expiry ON wallet_accounts(voucher_expiration_date) WHERE voucher_expiration_date IS NOT NULL;
```

### wallet_transactions - Transaction History
```sql
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_account_id UUID NOT NULL REFERENCES wallet_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Transaction Details
  transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN (
    'voucher_credit', 'purchase', 'refund', 'withdrawal', 
    'commission', 'bonus', 'penalty', 'adjustment'
  )),
  amount NUMERIC(10,2) NOT NULL CHECK (amount != 0),
  currency VARCHAR(3) DEFAULT 'EUR',
  description TEXT NOT NULL,
  
  -- Related Entities
  related_order_id UUID, -- Link to marketplace orders
  related_subscription_id UUID, -- Link to subscription payments
  related_product_id UUID, -- Link to purchased products
  
  -- Transaction Processing
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN (
    'pending', 'completed', 'failed', 'cancelled', 'refunded'
  )),
  processing_fee NUMERIC(8,2) DEFAULT 0,
  net_amount NUMERIC(10,2), -- Amount after fees
  
  -- Balance Tracking
  balance_before NUMERIC(10,2) NOT NULL,
  balance_after NUMERIC(10,2) NOT NULL,
  
  -- Payment Information
  payment_method VARCHAR(50),
  payment_reference VARCHAR(100), -- External payment system reference
  payment_gateway VARCHAR(30),
  
  -- Verification and Security
  verified_by VARCHAR(50), -- System or admin that verified transaction
  verification_date TIMESTAMPTZ,
  ip_address INET, -- IP address of transaction origin
  user_agent TEXT, -- Browser/app information
  
  -- Metadata
  metadata JSONB, -- Additional transaction-specific data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CHECK (balance_after = balance_before + amount),
  CHECK (net_amount <= amount)
);

-- Indexes
CREATE INDEX idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_account_id);
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(transaction_type);
CREATE INDEX idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX idx_wallet_transactions_date ON wallet_transactions(created_at);
CREATE INDEX idx_wallet_transactions_amount ON wallet_transactions(amount);
```

## Authentication and Session Tables

### user_sessions - Extended Session Management
```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Session Information
  session_token VARCHAR(255) UNIQUE NOT NULL,
  refresh_token_hash VARCHAR(255), -- Hashed refresh token
  device_fingerprint VARCHAR(255),
  
  -- Device and Location
  device_type VARCHAR(50), -- mobile, desktop, tablet
  device_name VARCHAR(100), -- User-agent or device name
  operating_system VARCHAR(50),
  browser VARCHAR(50),
  ip_address INET,
  location_city VARCHAR(100),
  location_country VARCHAR(100),
  
  -- Session Lifecycle
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  -- Security Tracking
  login_method VARCHAR(30), -- password, social, magic_link
  two_factor_verified BOOLEAN DEFAULT false,
  security_warnings INTEGER DEFAULT 0,
  suspicious_activity BOOLEAN DEFAULT false,
  
  -- Session Metadata
  app_version VARCHAR(20),
  api_version VARCHAR(10),
  features_accessed TEXT[],
  
  CHECK (expires_at > created_at),
  CHECK (last_activity_at >= created_at)
);

-- Indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON user_sessions(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_user_sessions_expiry ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_activity ON user_sessions(last_activity_at);
```

### user_login_history - Security Audit Log
```sql
CREATE TABLE user_login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Login Attempt Details
  login_attempt_type VARCHAR(30) CHECK (login_attempt_type IN (
    'successful_login', 'failed_login', 'password_reset', 
    'account_locked', 'suspicious_activity'
  )),
  login_method VARCHAR(30), -- password, google, facebook, apple
  
  -- Device and Network Information
  ip_address INET NOT NULL,
  user_agent TEXT,
  device_fingerprint VARCHAR(255),
  location_data JSONB, -- Geographic location data
  
  -- Security Analysis
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_factors TEXT[], -- List of risk factors detected
  blocked_by_security BOOLEAN DEFAULT false,
  security_action_taken VARCHAR(100),
  
  -- Failure Details (for failed attempts)
  failure_reason VARCHAR(100),
  password_attempts INTEGER DEFAULT 0,
  
  -- Success Details (for successful logins)
  session_id UUID REFERENCES user_sessions(id),
  session_duration INTEGER, -- Session length in seconds
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CHECK (password_attempts >= 0)
);

-- Indexes
CREATE INDEX idx_user_login_history_user_id ON user_login_history(user_id);
CREATE INDEX idx_user_login_history_type ON user_login_history(login_attempt_type);
CREATE INDEX idx_user_login_history_ip ON user_login_history(ip_address);
CREATE INDEX idx_user_login_history_date ON user_login_history(created_at);
CREATE INDEX idx_user_login_history_risk ON user_login_history(risk_score) WHERE risk_score > 50;
```

## Row Level Security (RLS)

### Security Policies
```sql
-- Enable RLS on all user tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_food_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_login_history ENABLE ROW LEVEL SECURITY;

-- User can only access their own data
CREATE POLICY user_profiles_policy ON user_profiles
FOR ALL TO authenticated
USING (user_id = auth.uid());

CREATE POLICY user_nutrition_goals_policy ON user_nutrition_goals
FOR ALL TO authenticated
USING (user_id = auth.uid());

CREATE POLICY user_food_preferences_policy ON user_food_preferences
FOR ALL TO authenticated
USING (user_id = auth.uid());

CREATE POLICY subscriptions_policy ON subscriptions
FOR ALL TO authenticated
USING (user_id = auth.uid());

CREATE POLICY wallet_accounts_policy ON wallet_accounts
FOR ALL TO authenticated
USING (user_id = auth.uid());

CREATE POLICY wallet_transactions_policy ON wallet_transactions
FOR ALL TO authenticated
USING (user_id = auth.uid());

CREATE POLICY user_sessions_policy ON user_sessions
FOR ALL TO authenticated
USING (user_id = auth.uid());

CREATE POLICY user_login_history_policy ON user_login_history
FOR ALL TO authenticated
USING (user_id = auth.uid());

-- Admin access policies
CREATE POLICY admin_full_access ON user_profiles
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- Coach access to client data (when implemented)
CREATE POLICY coach_client_access ON user_profiles
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM coach_client_relationships ccr
    WHERE ccr.coach_user_id = auth.uid()
    AND ccr.client_user_id = user_profiles.user_id
    AND ccr.status = 'active'
  )
);
```

## Database Functions and Triggers

### User Profile Management Functions
```sql
-- Function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  completion_score INTEGER := 0;
  profile_record user_profiles%ROWTYPE;
BEGIN
  SELECT * INTO profile_record FROM user_profiles WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Basic info (40 points)
  IF profile_record.gender IS NOT NULL THEN completion_score := completion_score + 5; END IF;
  IF profile_record.birth_date IS NOT NULL THEN completion_score := completion_score + 5; END IF;
  IF profile_record.height_cm IS NOT NULL THEN completion_score := completion_score + 10; END IF;
  IF profile_record.weight_kg IS NOT NULL THEN completion_score := completion_score + 10; END IF;
  IF profile_record.experience_level IS NOT NULL THEN completion_score := completion_score + 10; END IF;
  
  -- Fitness profile (30 points)
  IF profile_record.primary_goal IS NOT NULL THEN completion_score := completion_score + 10; END IF;
  IF profile_record.training_frequency IS NOT NULL THEN completion_score := completion_score + 5; END IF;
  IF profile_record.training_duration IS NOT NULL THEN completion_score := completion_score + 5; END IF;
  IF profile_record.equipment_access IS NOT NULL THEN completion_score := completion_score + 10; END IF;
  
  -- Nutrition profile (20 points)
  IF profile_record.dietary_preference IS NOT NULL THEN completion_score := completion_score + 10; END IF;
  IF profile_record.allergies IS NOT NULL AND array_length(profile_record.allergies, 1) > 0 THEN 
    completion_score := completion_score + 5; 
  END IF;
  IF EXISTS (SELECT 1 FROM user_food_preferences WHERE user_id = p_user_id) THEN
    completion_score := completion_score + 5;
  END IF;
  
  -- Additional details (10 points)
  IF profile_record.body_fat_pct IS NOT NULL THEN completion_score := completion_score + 5; END IF;
  IF profile_record.activity_level IS NOT NULL THEN completion_score := completion_score + 5; END IF;
  
  RETURN completion_score;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update profile completion on changes
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completion_percentage := calculate_profile_completion(NEW.user_id);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profile_completion
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();
```

### Wallet Management Functions
```sql
-- Function to credit monthly vouchers
CREATE OR REPLACE FUNCTION credit_monthly_vouchers()
RETURNS INTEGER AS $$
DECLARE
  wallet_record wallet_accounts%ROWTYPE;
  credit_amount NUMERIC(8,2);
  credited_count INTEGER := 0;
BEGIN
  FOR wallet_record IN 
    SELECT * FROM wallet_accounts 
    WHERE account_type = 'voucher' 
    AND status = 'active'
    AND (voucher_last_credited IS NULL OR voucher_last_credited < date_trunc('month', CURRENT_DATE))
  LOOP
    -- Get voucher amount from subscription
    SELECT 
      CASE s.plan
        WHEN 'pro' THEN 14.99
        WHEN 'elite' THEN 29.99
        WHEN 'coach' THEN 49.99
        ELSE 0
      END
    INTO credit_amount
    FROM subscriptions s
    WHERE s.user_id = wallet_record.user_id
    AND s.status = 'active';
    
    IF credit_amount > 0 THEN
      -- Update wallet balance
      UPDATE wallet_accounts 
      SET 
        balance = balance + credit_amount,
        voucher_last_credited = CURRENT_DATE,
        total_vouchers_received = total_vouchers_received + credit_amount,
        voucher_expiration_date = CURRENT_DATE + INTERVAL '12 months',
        updated_at = NOW()
      WHERE id = wallet_record.id;
      
      -- Record transaction
      INSERT INTO wallet_transactions (
        wallet_account_id, user_id, transaction_type, amount, 
        description, balance_before, balance_after
      ) VALUES (
        wallet_record.id, wallet_record.user_id, 'voucher_credit', credit_amount,
        'Monthly subscription voucher credit',
        wallet_record.balance, wallet_record.balance + credit_amount
      );
      
      credited_count := credited_count + 1;
    END IF;
  END LOOP;
  
  RETURN credited_count;
END;
$$ LANGUAGE plpgsql;
```

### Analytics Functions
```sql
-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_auth_stats()
RETURNS TABLE(
  metric_name TEXT,
  metric_value BIGINT,
  metric_description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'total_users'::TEXT,
    COUNT(*)::BIGINT,
    'Total registered users'::TEXT
  FROM auth.users
  WHERE deleted_at IS NULL
  
  UNION ALL
  
  SELECT 
    'active_users_30_days'::TEXT,
    COUNT(DISTINCT user_id)::BIGINT,
    'Users active in last 30 days'::TEXT
  FROM user_sessions
  WHERE last_activity_at > NOW() - INTERVAL '30 days'
  
  UNION ALL
  
  SELECT 
    'completed_profiles'::TEXT,
    COUNT(*)::BIGINT,
    'Users with completed profiles (>80%)'::TEXT
  FROM user_profiles
  WHERE profile_completion_percentage > 80
  
  UNION ALL
  
  SELECT 
    'paid_subscriptions'::TEXT,
    COUNT(*)::BIGINT,
    'Users with paid subscriptions'::TEXT
  FROM subscriptions
  WHERE status = 'active' AND plan != 'free';
END;
$$ LANGUAGE plpgsql;
```

## Performance Optimization

### Database Indexes Strategy
```sql
-- Composite indexes for common queries
CREATE INDEX idx_user_profiles_goals_active ON user_profiles(primary_goal, experience_level) 
WHERE primary_goal IS NOT NULL;

CREATE INDEX idx_nutrition_goals_user_date ON user_nutrition_goals(user_id, created_at DESC)
WHERE is_active = true;

CREATE INDEX idx_wallet_transactions_user_type_date ON wallet_transactions(user_id, transaction_type, created_at DESC);

CREATE INDEX idx_sessions_user_active_activity ON user_sessions(user_id, is_active, last_activity_at DESC)
WHERE is_active = true;

-- Partial indexes for performance
CREATE INDEX idx_active_subscriptions ON subscriptions(user_id, plan, current_period_end)
WHERE status = 'active';

CREATE INDEX idx_recent_login_history ON user_login_history(user_id, created_at DESC, login_attempt_type)
WHERE created_at > NOW() - INTERVAL '90 days';
```

### Maintenance and Cleanup
```sql
-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_sessions 
  WHERE expires_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to archive old login history
CREATE OR REPLACE FUNCTION archive_old_login_history()
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- Archive login history older than 2 years to separate table
  INSERT INTO user_login_history_archive 
  SELECT * FROM user_login_history 
  WHERE created_at < NOW() - INTERVAL '2 years';
  
  DELETE FROM user_login_history 
  WHERE created_at < NOW() - INTERVAL '2 years';
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;
```

The Auth database schema provides a robust, secure, and scalable foundation for Lumeos' authentication and user management system, seamlessly integrating Supabase Auth with comprehensive fitness-focused user profiling and subscription management capabilities.