# Auth Module Migration Documentation

## Migration Overview

The Auth module migration represents the evolution from a basic authentication system to a comprehensive, fitness-focused user management platform that serves as the foundation for Lumeos' goal-centric Health & Performance OS. This migration encompasses the integration of Supabase Auth with extensive user profiling, subscription management, and cross-module authentication propagation.

## Authentication Architecture Evolution

### Legacy Authentication Limitations
```
Traditional App Authentication:
├── Basic email/password authentication
├── Simple user sessions
├── Minimal user profile data
├── No subscription management
└── Isolated authentication per service
```

### New Lumeos Auth Architecture
```
Lumeos Health & Performance Auth System:
                    ┌─────────────────┐
                    │  SUPABASE AUTH  │ ← Enterprise-grade security
                    │  (Core Identity) │
                    └─────────┬───────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼───┐           ┌─────▼──┐            ┌─────▼──┐
   │FITNESS │           │BILLING │            │WALLET  │
   │PROFILE │           │SYSTEM  │            │SYSTEM  │
   │        │           │        │            │        │
   └────┬───┘           └─────┬──┘            └─────┬──┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼───────┐
                    │  CROSS-MODULE   │
                    │  INTEGRATION    │
                    └─────────────────┘
```

### Business Model Integration
```typescript
// Legacy: Simple user accounts
interface LegacyAuthSystem {
  users: BasicUserAccount[];
  sessions: SimpleSession[];
  // No business model integration
}

// New: Health & Performance focused with integrated business model
interface LumeosAuthSystem {
  identity: SupabaseAuthIdentity;       // Enterprise auth foundation
  fitnessProfile: ComprehensiveProfile; // Detailed health/fitness data
  subscriptionTier: PlanManagement;     // Integrated billing
  voucherWallet: MonetizationSystem;    // Transaction-based revenue
  crossModuleAuth: UnifiedExperience;   // Single sign-on across modules
  goalAlignment: CentralizedGoals;      // Goal-centric user management
}
```

## Database Migration Strategy

### Phase 1: Foundation Migration
```sql
-- Migration: 001_auth_foundation.sql
-- Establish extended user profile system on top of Supabase Auth

-- Extended user profiles table
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
  training_duration INTEGER CHECK (training_duration >= 15 AND training_duration <= 300),
  primary_goal VARCHAR(50),
  
  -- Preferences
  dietary_preference VARCHAR(20) CHECK (dietary_preference IN (
    'omnivore', 'vegetarian', 'vegan', 'pescatarian', 
    'keto', 'paleo', 'mediterranean', 'custom'
  )),
  allergies TEXT[],
  unit_system VARCHAR(10) DEFAULT 'metric' CHECK (unit_system IN ('metric', 'imperial')),
  equipment_access TEXT,
  
  -- Profile tracking
  profile_completion_percentage INTEGER DEFAULT 0,
  last_active_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id),
  CHECK (birth_date <= CURRENT_DATE - INTERVAL '13 years'),
  CHECK (profile_completion_percentage >= 0 AND profile_completion_percentage <= 100)
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_experience_level ON user_profiles(experience_level);
CREATE INDEX idx_user_profiles_goal ON user_profiles(primary_goal);
CREATE INDEX idx_user_profiles_updated_at ON user_profiles(updated_at);
```

### Phase 2: Goal-Centric Integration
```sql
-- Migration: 002_goal_centric_nutrition.sql
-- Integrate with Goals module for nutrition targeting

CREATE TABLE user_nutrition_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Goal Definition
  goal_type VARCHAR(30) NOT NULL,
  goal_type_new VARCHAR(30),
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
  weekly_rate NUMERIC(4,2),
  max_duration_weeks INTEGER CHECK (max_duration_weeks >= 1 AND max_duration_weeks <= 52),
  
  -- User Context
  current_weight_kg NUMERIC(5,2),
  height_cm NUMERIC(5,2),
  age INTEGER,
  gender VARCHAR(10),
  activity_level VARCHAR(20),
  training_days_per_week INTEGER,
  
  -- Goal Management
  is_active BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN (
    'active', 'paused', 'completed', 'cancelled', 'replaced'
  )),
  
  -- Timeline
  started_at TIMESTAMPTZ DEFAULT NOW(),
  target_completion_date DATE,
  actual_completion_date DATE,
  
  -- Onboarding Integration
  onboarding_completed BOOLEAN DEFAULT false,
  created_from_onboarding BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, is_active) DEFERRABLE INITIALLY DEFERRED,
  CHECK (protein_target + carbs_target + fat_target > 0)
);

CREATE INDEX idx_user_nutrition_goals_user_active ON user_nutrition_goals(user_id, is_active);
CREATE UNIQUE INDEX idx_one_active_goal_per_user ON user_nutrition_goals(user_id) WHERE is_active = true;
```

### Phase 3: Subscription and Monetization Integration
```sql
-- Migration: 003_subscription_system.sql
-- Implement Tom's voucher-based monetization system

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Subscription Details
  plan VARCHAR(20) NOT NULL CHECK (plan IN ('free', 'pro', 'elite', 'coach')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN (
    'active', 'cancelled', 'expired', 'suspended', 'pending'
  )),
  
  -- Billing Information
  billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly', 'lifetime')),
  price NUMERIC(8,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Timeline
  started_at TIMESTAMPTZ DEFAULT NOW(),
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Payment Integration
  stripe_subscription_id VARCHAR(100),
  stripe_customer_id VARCHAR(100),
  
  -- Trial Information
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  trial_used BOOLEAN DEFAULT false,
  
  -- Feature Limits
  ai_messages_used INTEGER DEFAULT 0,
  ai_messages_limit INTEGER,
  mealcam_scans_used INTEGER DEFAULT 0,
  mealcam_scans_limit INTEGER,
  
  -- Management
  auto_renew BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, status) DEFERRABLE INITIALLY DEFERRED,
  CHECK (current_period_end > current_period_start)
);

-- Tom's Voucher Wallet System
CREATE TABLE wallet_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Account Details
  account_type VARCHAR(20) DEFAULT 'voucher' CHECK (account_type IN ('voucher', 'revenue')),
  balance NUMERIC(10,2) DEFAULT 0 CHECK (balance >= 0),
  currency VARCHAR(3) DEFAULT 'EUR',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
  
  -- Voucher System (Tom's Core Business Model)
  monthly_voucher_amount NUMERIC(8,2) DEFAULT 0,
  voucher_last_credited TIMESTAMPTZ,
  voucher_expiration_date DATE,
  total_vouchers_received NUMERIC(10,2) DEFAULT 0,
  total_vouchers_spent NUMERIC(10,2) DEFAULT 0,
  
  -- Revenue Wallet (for coaches)
  is_revenue_wallet BOOLEAN DEFAULT false,
  revenue_withdrawable BOOLEAN DEFAULT false,
  minimum_withdrawal_amount NUMERIC(8,2) DEFAULT 50,
  
  -- Transaction Limits
  daily_spending_limit NUMERIC(8,2),
  monthly_spending_limit NUMERIC(8,2),
  transaction_fee_percentage NUMERIC(5,4) DEFAULT 0.029, -- 2.9% transaction fee
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, account_type)
);

-- Transaction History
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
  
  -- Balance Tracking
  balance_before NUMERIC(10,2) NOT NULL,
  balance_after NUMERIC(10,2) NOT NULL,
  
  -- Processing
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN (
    'pending', 'completed', 'failed', 'cancelled', 'refunded'
  )),
  processing_fee NUMERIC(8,2) DEFAULT 0,
  net_amount NUMERIC(10,2),
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CHECK (balance_after = balance_before + amount)
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_wallet_accounts_user_id ON wallet_accounts(user_id);
CREATE INDEX idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_account_id);
CREATE UNIQUE INDEX idx_one_active_subscription ON subscriptions(user_id) WHERE status = 'active';
```

### Phase 4: Food Preferences Integration
```sql
-- Migration: 004_food_preferences.sql
-- Detailed dietary preferences for nutrition module integration

CREATE TABLE user_food_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dietary Approach
  diet_type VARCHAR(30) DEFAULT 'omnivore' CHECK (diet_type IN (
    'omnivore', 'vegetarian', 'vegan', 'pescatarian',
    'keto', 'paleo', 'mediterranean', 'low_carb', 'low_fat',
    'intermittent_fasting', 'carnivore', 'custom'
  )),
  diet_restrictions TEXT[],
  
  -- Allergies and Medical Restrictions
  allergies TEXT[] DEFAULT '{}',
  intolerances TEXT[] DEFAULT '{}',
  medical_restrictions TEXT[],
  religious_restrictions TEXT[],
  
  -- Meal Structure Preferences
  meals_per_day INTEGER DEFAULT 3 CHECK (meals_per_day >= 1 AND meals_per_day <= 10),
  snacks_per_day INTEGER DEFAULT 1 CHECK (snacks_per_day >= 0 AND snacks_per_day <= 5),
  preferred_meal_times TIME[],
  
  -- Food Preferences
  liked_foods JSONB DEFAULT '[]',
  disliked_foods JSONB DEFAULT '[]',
  neutral_foods JSONB DEFAULT '[]',
  
  -- Cooking and Preparation
  cooking_skill_level VARCHAR(20) DEFAULT 'intermediate' CHECK (cooking_skill_level IN (
    'beginner', 'intermediate', 'advanced', 'expert'
  )),
  cooking_time_available INTEGER,
  meal_prep_preference BOOLEAN DEFAULT false,
  kitchen_equipment TEXT[],
  
  -- Budget and Shopping
  food_budget_monthly NUMERIC(8,2),
  organic_preference BOOLEAN DEFAULT false,
  local_preference BOOLEAN DEFAULT false,
  
  -- Hydration
  water_goal_ml INTEGER DEFAULT 2500,
  caffeine_limit_mg INTEGER DEFAULT 400,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id),
  CHECK (water_goal_ml >= 1000 AND water_goal_ml <= 5000)
);

CREATE INDEX idx_user_food_preferences_user_id ON user_food_preferences(user_id);
CREATE INDEX idx_user_food_preferences_diet_type ON user_food_preferences(diet_type);
CREATE INDEX idx_user_food_preferences_allergies ON user_food_preferences USING gin(allergies);
```

### Phase 5: Advanced Security and Session Management
```sql
-- Migration: 005_advanced_security.sql
-- Enhanced security features for enterprise-grade auth

CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Session Information
  session_token VARCHAR(255) UNIQUE NOT NULL,
  refresh_token_hash VARCHAR(255),
  device_fingerprint VARCHAR(255),
  
  -- Device and Location
  device_type VARCHAR(50),
  device_name VARCHAR(100),
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
  login_method VARCHAR(30),
  two_factor_verified BOOLEAN DEFAULT false,
  security_warnings INTEGER DEFAULT 0,
  suspicious_activity BOOLEAN DEFAULT false,
  
  CHECK (expires_at > created_at)
);

CREATE TABLE user_login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Login Attempt Details
  login_attempt_type VARCHAR(30) CHECK (login_attempt_type IN (
    'successful_login', 'failed_login', 'password_reset', 
    'account_locked', 'suspicious_activity'
  )),
  login_method VARCHAR(30),
  
  -- Device and Network Information
  ip_address INET NOT NULL,
  user_agent TEXT,
  device_fingerprint VARCHAR(255),
  location_data JSONB,
  
  -- Security Analysis
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_factors TEXT[],
  blocked_by_security BOOLEAN DEFAULT false,
  
  -- Failure Details
  failure_reason VARCHAR(100),
  password_attempts INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_login_history_user_id ON user_login_history(user_id);
CREATE INDEX idx_user_login_history_ip ON user_login_history(ip_address);
```

## Data Migration Procedures

### Migrating Legacy User Data
```sql
-- Migrate existing user data to new comprehensive profile system
INSERT INTO user_profiles (
  user_id, gender, birth_date, height_cm, weight_kg, 
  experience_level, primary_goal, unit_system, profile_completion_percentage
)
SELECT 
  au.id as user_id,
  COALESCE(au.raw_user_meta_data->>'gender', 'other') as gender,
  CASE 
    WHEN au.raw_user_meta_data->>'birth_date' IS NOT NULL 
    THEN (au.raw_user_meta_data->>'birth_date')::DATE
    ELSE NULL
  END as birth_date,
  COALESCE((au.raw_user_meta_data->>'height_cm')::NUMERIC, NULL) as height_cm,
  COALESCE((au.raw_user_meta_data->>'weight_kg')::NUMERIC, NULL) as weight_kg,
  COALESCE(au.raw_user_meta_data->>'experience_level', 'beginner') as experience_level,
  COALESCE(au.raw_user_meta_data->>'primary_goal', 'general_fitness') as primary_goal,
  COALESCE(au.raw_user_meta_data->>'unit_system', 'metric') as unit_system,
  CASE 
    WHEN au.raw_user_meta_data->>'onboarding_completed' = 'true' THEN 80
    ELSE 20
  END as profile_completion_percentage
FROM auth.users au
WHERE au.deleted_at IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Create default subscriptions for existing users
INSERT INTO subscriptions (user_id, plan, status)
SELECT 
  au.id as user_id,
  COALESCE(au.raw_user_meta_data->>'plan', 'free') as plan,
  'active' as status
FROM auth.users au
WHERE au.deleted_at IS NULL
ON CONFLICT (user_id, status) DO NOTHING;

-- Create wallet accounts for existing users
INSERT INTO wallet_accounts (user_id, account_type, monthly_voucher_amount)
SELECT 
  s.user_id,
  'voucher' as account_type,
  CASE s.plan
    WHEN 'pro' THEN 14.99
    WHEN 'elite' THEN 29.99
    WHEN 'coach' THEN 49.99
    ELSE 0
  END as monthly_voucher_amount
FROM subscriptions s
WHERE s.status = 'active'
ON CONFLICT (user_id, account_type) DO NOTHING;
```

### Legacy Nutrition Data Migration
```sql
-- Migrate existing nutrition targets to new goal-based system
INSERT INTO user_nutrition_goals (
  user_id, goal_type, goal_type_new, tdee_calculated, calorie_target,
  protein_target, carbs_target, fat_target, current_weight_kg,
  is_active, status, onboarding_completed, created_from_onboarding
)
SELECT 
  nt.user_id,
  up.primary_goal as goal_type,
  up.primary_goal as goal_type_new,
  -- Estimate TDEE from targets
  GREATEST(1200, nt.kcal_target + 200) as tdee_calculated,
  nt.kcal_target as calorie_target,
  nt.protein_g_target as protein_target,
  nt.carbs_g_target as carbs_target,
  nt.fat_g_target as fat_target,
  up.weight_kg as current_weight_kg,
  true as is_active,
  'active' as status,
  true as onboarding_completed,
  false as created_from_onboarding
FROM nutrition_targets nt
JOIN user_profiles up ON nt.user_id = up.user_id
WHERE nt.kcal_target > 0
ON CONFLICT (user_id, is_active) DO NOTHING;

-- Migrate food preferences
INSERT INTO user_food_preferences (
  user_id, diet_type, allergies, meals_per_day
)
SELECT 
  up.user_id,
  COALESCE(up.dietary_preference, 'omnivore') as diet_type,
  COALESCE(up.allergies, ARRAY[]::TEXT[]) as allergies,
  3 as meals_per_day -- Default
FROM user_profiles up
WHERE up.user_id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;
```

## API Migration and Integration

### Legacy Auth Endpoints → New Comprehensive System
```
Legacy Authentication Endpoints → New Lumeos Auth System
├── /auth/login → /api/auth/login (enhanced with profile hydration)
├── /auth/register → /api/auth/register (with immediate onboarding flow)
├── /auth/profile → /api/auth/me (comprehensive user profile)
├── [NEW] /api/auth/onboarding (complete fitness onboarding)
├── [NEW] /api/auth/permissions (tier-based permissions)
├── [NEW] /api/auth/tiers (subscription tier information)
└── [NEW] /api/auth/change-password (secure password management)
```

### Enhanced API Response Format
```typescript
// Legacy simple auth response
interface LegacyAuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

// New comprehensive Lumeos auth response
interface LumeosAuthResponse {
  ok: true;
  data: {
    token: string;
    refresh_token: string;
    expires_at: number;
    user: {
      // Core identity
      id: string;
      email: string;
      display_name: string;
      role: 'user' | 'coach' | 'admin';
      locale: 'de' | 'en' | 'th';
      
      // Onboarding status
      onboarding_completed: boolean;
      onboarding_step: number;
      
      // Fitness profile
      gender?: 'male' | 'female' | 'other';
      birth_date?: string;
      height_cm?: number;
      weight_kg?: number;
      experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'elite';
      primary_goal?: string;
      
      // Subscription and permissions
      subscription_tier: 'free' | 'pro' | 'elite' | 'coach';
      wallet_balance: number;
      
      // Profile completion
      profile_completion_percentage: number;
    };
    
    // Active goals and targets
    activeGoal?: NutritionGoal;
    nutritionTargets?: NutritionTargets;
    
    // Permissions based on subscription tier
    permissions: UserPermissions;
  };
}
```

### Cross-Module Authentication Integration
```typescript
// Authentication middleware for cross-module integration
interface CrossModuleAuthIntegration {
  // Token validation across all Lumeos modules
  tokenValidation: {
    centralizedValidation: boolean;    // Single validation service
    moduleSpecificPermissions: boolean; // Module-level permissions
    featureLevelAccess: boolean;       // Feature-specific access control
    subscriptionGating: boolean;       // Subscription-based feature access
  };
  
  // User context propagation
  contextPropagation: {
    userProfileSharing: boolean;       // Share profile across modules
    goalContextSharing: boolean;       // Share goal context
    preferenceSharing: boolean;        // Share user preferences
    progressSharing: boolean;          // Share progress data
  };
  
  // Session management
  sessionManagement: {
    unifiedSessions: boolean;          // Single session across modules
    automaticRefresh: boolean;         // Automatic token refresh
    gracefulExpiration: boolean;       // Smooth session expiration
    crossModuleLogout: boolean;        // Logout across all modules
  };
}
```

## Frontend Migration Strategy

### Authentication State Management Evolution
```typescript
// Legacy simple auth state
interface LegacyAuthState {
  isAuthenticated: boolean;
  user: BasicUser | null;
  token: string | null;
}

// New comprehensive Lumeos auth state
interface LumeosAuthState {
  // Authentication status
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // User data
  user: ComprehensiveUser | null;
  token: string | null;
  refreshToken: string | null;
  tokenExpiresAt: number | null;
  
  // User profile and goals
  activeGoal: NutritionGoal | null;
  subscriptionTier: SubscriptionTier;
  permissions: UserPermissions;
  walletBalance: number;
  
  // Onboarding state
  onboardingStatus: OnboardingStatus;
  profileCompletion: number;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  updateProfile: (data: ProfileUpdate) => Promise<void>;
}
```

### Onboarding Flow Implementation
```typescript
// Multi-step onboarding component migration
interface OnboardingFlowMigration {
  // Step-by-step progression
  onboardingSteps: {
    personalInfo: PersonalInfoStep;      // Step 1: Basic info
    physicalProfile: PhysicalProfileStep; // Step 2: Body stats
    fitnessGoals: FitnessGoalsStep;      // Step 3: Goal setting
    nutritionPrefs: NutritionPrefsStep;   // Step 4: Dietary preferences
    trainingPrefs: TrainingPrefsStep;     // Step 5: Training preferences  
    goalCalculation: GoalCalculationStep; // Step 6: TDEE/macro calculation
    planSelection: PlanSelectionStep;     // Step 7: Subscription tier
  };
  
  // Smart defaults and validation
  intelligentDefaults: {
    ageBasedDefaults: boolean;           // Age-appropriate defaults
    genderSpecificDefaults: boolean;     // Gender-specific suggestions
    experienceBasedGuidance: boolean;    // Experience-level guidance
    goalSpecificCalculations: boolean;   // Goal-specific recommendations
  };
  
  // Progress tracking
  progressManagement: {
    stepValidation: boolean;             // Validate each step
    progressPersistence: boolean;        // Save progress between sessions
    backNavigation: boolean;             // Allow stepping backward
    skipOptionalSteps: boolean;          // Skip non-essential steps
  };
}
```

## Security Migration Implementation

### Enterprise-Grade Security Features
```typescript
interface SecurityMigrationFeatures {
  // Authentication security enhancements
  authenticationSecurity: {
    passwordPolicyEnforcement: {
      minimumLength: 8;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      preventCommonPasswords: boolean;
      preventPasswordReuse: boolean;
    };
    
    multiFactorAuthentication: {
      smsVerification: boolean;
      emailVerification: boolean;
      appBasedTOTP: boolean;
      biometricAuthentication: boolean;
      backupCodes: boolean;
    };
    
    sessionSecurity: {
      sessionTimeout: number;              // 7 days default
      concurrentSessionLimit: number;      // 5 sessions max
      deviceTracking: boolean;             // Track user devices
      geolocationVerification: boolean;    // Verify login locations
      suspiciousActivityDetection: boolean; // AI-powered threat detection
    };
  };
  
  // Data protection implementation
  dataProtection: {
    encryption: {
      sensitiveDataEncryption: boolean;    // Encrypt PII data
      passwordHashing: 'bcrypt';           // Secure password hashing
      tokenEncryption: boolean;            // Encrypt session tokens
      databaseEncryption: boolean;         // Encrypt database at rest
    };
    
    privacyControls: {
      dataMinimization: boolean;           // Collect only necessary data
      consentManagement: boolean;          // Granular consent controls
      dataRetentionPolicies: boolean;      // Automatic data cleanup
      rightToErasure: boolean;             // Complete data deletion
      dataPortability: boolean;            // Export user data
    };
  };
  
  // Compliance implementation
  complianceFeatures: {
    gdprCompliance: {
      dataProcessingBasis: boolean;        // Legal basis for processing
      consentTracking: boolean;            // Track user consent
      dataSubjectRights: boolean;          // Implement user rights
      privacyByDesign: boolean;            // Privacy-first architecture
      dataProtectionImpactAssessment: boolean; // DPIA compliance
    };
    
    auditingAndLogging: {
      accessLogging: boolean;              // Log data access
      changeTracking: boolean;             // Track data changes
      securityEventLogging: boolean;       // Log security events
      adminActionLogging: boolean;         // Log administrative actions
      complianceReporting: boolean;        // Generate compliance reports
    };
  };
}
```

### Security Monitoring and Incident Response
```typescript
interface SecurityMonitoring {
  // Threat detection
  threatDetection: {
    anomalyDetection: {
      loginPatternAnalysis: boolean;       // Detect unusual login patterns
      behaviorBasedDetection: boolean;     // Detect unusual user behavior
      geolocationAnomalies: boolean;       // Detect location-based anomalies
      deviceFingerprintingAnomalies: boolean; // Detect device anomalies
      transactionPatternAnalysis: boolean; // Detect unusual spending patterns
    };
    
    realTimeMonitoring: {
      loginAttemptMonitoring: boolean;     // Monitor failed login attempts
      sessionHijackingDetection: boolean;  // Detect session hijacking
      unauthorizedAccessDetection: boolean; // Detect unauthorized access
      dataExfiltrationDetection: boolean;  // Detect data theft attempts
      maliciousActivityDetection: boolean; // Detect malicious behavior
    };
  };
  
  // Incident response
  incidentResponse: {
    automaticResponse: {
      automaticAccountLocking: boolean;    // Lock compromised accounts
      automaticSessionTermination: boolean; // Terminate suspicious sessions
      automaticNotification: boolean;      // Notify users of security events
      automaticEscalation: boolean;        // Escalate high-risk events
      automaticForensicLogging: boolean;   // Log detailed forensic data
    };
    
    manualResponse: {
      securityTeamAlerts: boolean;         // Alert security team
      userCommunication: boolean;          // Communicate with affected users
      lawEnforcementCoordination: boolean; // Coordinate with law enforcement
      regulatoryNotification: boolean;     // Notify regulatory authorities
      publicDisclosure: boolean;           // Public breach notification
    };
  };
}
```

## Business Model Integration Migration

### Subscription Tier System Implementation
```typescript
interface SubscriptionSystemMigration {
  // Tom's 4-tier subscription model
  subscriptionTiers: {
    free: {
      price: 0;
      voucher: 0;
      features: [
        'nutrition_logging',
        'training_logging', 
        'supplement_tracking_basic',
        'recovery_basics',
        'max_1_goal'
      ];
      limitations: {
        mealcam_scans: 0;
        ai_coach_messages: 0;
        marketplace_access: false;
        client_management: false;
      };
    };
    
    pro: {
      price: 14.99;
      voucher: 14.99;
      features: [
        'all_free_features',
        'mealcam_ai_unlimited',
        'ai_coach_20_messages',
        'training_programs',
        'marketplace_access',
        'hrv_recovery',
        'max_3_goals',
        'wallet_voucher_14_99'
      ];
    };
    
    elite: {
      price: 29.99;
      voucher: 29.99;
      features: [
        'all_pro_features',
        'unlimited_ai_features',
        'ai_workout_generator',
        'lab_ocr_biomarkers',
        'supplement_gap_analysis',
        'full_recovery_map',
        'marketplace_selling',
        'unlimited_goals',
        'wallet_voucher_29_99'
      ];
    };
    
    coach: {
      price: 49.99;
      voucher: 49.99;
      features: [
        'all_elite_features',
        'client_management_50',
        'coach_builder_programs',
        'revenue_wallet_withdrawable',
        'kickback_client_purchases',
        'custom_ai_coach_persona',
        'wallet_voucher_49_99'
      ];
    };
  };
  
  // Voucher system (Tom's core monetization)
  voucherSystem: {
    monthlyCrediting: {
      automaticCrediting: boolean;         // Credit vouchers monthly
      subscriptionBasedAmount: boolean;    // Amount based on tier
      expirationManagement: boolean;       // 12-month expiration
      rolloverPolicy: boolean;             // Roll over unused vouchers
      maxAccumulation: number;             // Maximum voucher accumulation
    };
    
    transactionProcessing: {
      voucherFirst: boolean;               // Use vouchers before real money
      transactionFees: boolean;            // 2.9% transaction fees
      revenueSharing: boolean;             // Coach commission system
      refundHandling: boolean;             // Voucher refund policies
      fraudPrevention: boolean;            // Prevent voucher fraud
    };
  };
}
```

### Revenue Model Integration
```typescript
interface RevenueModelIntegration {
  // Transaction-based revenue (Tom's vision)
  transactionRevenue: {
    marketplaceTransactions: {
      supplementPurchases: boolean;        // Revenue from supplement sales
      coachingServices: boolean;           // Revenue from coaching
      customNutritionPlans: boolean;       // Revenue from meal plans
      trainingPrograms: boolean;           // Revenue from training programs
      premiumContent: boolean;             // Revenue from content
    };
    
    feeStructure: {
      baseTransactionFee: 2.9;             // Base transaction fee percentage
      coachCommission: 15;                 // Coach commission percentage
      platformFee: 5;                     // Platform fee percentage
      paymentProcessingFee: 2.9;          // Payment processing fee
      currencyConversionFee: 1.5;         // Currency conversion fee
    };
  };
  
  // Subscription revenue
  subscriptionRevenue: {
    recurringRevenue: {
      monthlySubscriptions: boolean;       // Monthly recurring revenue
      yearlySubscriptions: boolean;        // Annual subscriptions with discount
      familyPlans: boolean;                // Multi-user subscriptions
      corporateAccounts: boolean;          // Business subscriptions
      coachSubscriptions: boolean;         // Coach-specific subscriptions
    };
    
    retentionOptimization: {
      churnPrediction: boolean;            // Predict subscription cancellations
      winBackCampaigns: boolean;           // Re-engage cancelled users
      upgradeIncentives: boolean;          // Encourage tier upgrades
      loyaltyPrograms: boolean;            // Reward long-term subscribers
      referralPrograms: boolean;           // Referral-based growth
    };
  };
}
```

## Testing and Quality Assurance Migration

### Comprehensive Testing Strategy
```typescript
interface TestingMigration {
  // Authentication flow testing
  authenticationTesting: {
    unitTesting: {
      authenticationLogic: boolean;        // Test auth functions
      tokenManagement: boolean;            // Test token handling
      passwordSecurity: boolean;           // Test password policies
      sessionManagement: boolean;          // Test session handling
      permissionSystem: boolean;           // Test permission logic
    };
    
    integrationTesting: {
      supabaseIntegration: boolean;        // Test Supabase auth integration
      crossModuleAuth: boolean;            // Test auth across modules
      subscriptionIntegration: boolean;    // Test subscription system
      walletIntegration: boolean;          // Test wallet system
      onboardingFlow: boolean;             // Test complete onboarding
    };
    
    endToEndTesting: {
      completeUserJourney: boolean;        // Test full user lifecycle
      subscriptionUpgrade: boolean;        // Test upgrade flows
      paymentProcessing: boolean;          // Test payment handling
      securityScenarios: boolean;         // Test security measures
      performanceUnderLoad: boolean;       // Test system performance
    };
  };
  
  // Security testing
  securityTesting: {
    vulnerabilityTesting: {
      penetrationTesting: boolean;         // Professional penetration testing
      sqlInjectionTesting: boolean;        // Test SQL injection prevention
      xssProtectionTesting: boolean;       // Test XSS protection
      csrfProtectionTesting: boolean;      // Test CSRF protection
      authenticationBypassTesting: boolean; // Test auth bypass attempts
    };
    
    complianceTesting: {
      gdprComplianceTesting: boolean;      // Test GDPR compliance
      dataEncryptionTesting: boolean;      // Test data encryption
      accessControlTesting: boolean;       // Test access controls
      auditTrailTesting: boolean;          // Test audit logging
      dataRetentionTesting: boolean;       // Test data retention policies
    };
  };
}
```

## Performance and Scalability Migration

### Database Performance Optimization
```sql
-- Performance optimization for auth tables
CREATE INDEX CONCURRENTLY idx_user_profiles_active_users 
ON user_profiles(user_id, last_active_date DESC) 
WHERE last_active_date > NOW() - INTERVAL '30 days';

CREATE INDEX CONCURRENTLY idx_subscriptions_billing_cycle 
ON subscriptions(current_period_end, auto_renew) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY idx_wallet_transactions_recent 
ON wallet_transactions(user_id, created_at DESC, transaction_type)
WHERE created_at > NOW() - INTERVAL '3 months';

-- Partitioning for large tables
CREATE TABLE user_login_history_2026 PARTITION OF user_login_history
FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

CREATE TABLE wallet_transactions_2026 PARTITION OF wallet_transactions
FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

### Caching Strategy Implementation
```typescript
interface CachingStrategy {
  // User data caching
  userDataCaching: {
    profileCaching: {
      redisProfileCache: boolean;          // Cache user profiles
      sessionBasedCaching: boolean;        // Cache for session duration
      invalidationOnUpdate: boolean;       // Invalidate on profile updates
      distributedCaching: boolean;         // Multi-server cache sync
    };
    
    permissionsCaching: {
      roleBasedCaching: boolean;           // Cache user permissions
      subscriptionBasedCaching: boolean;   // Cache tier-based permissions
      featureFlagCaching: boolean;         // Cache feature flags
      crossModuleCaching: boolean;         // Cache across modules
    };
  };
  
  // Authentication caching
  authenticationCaching: {
    tokenValidationCaching: {
      jwtValidationCache: boolean;         // Cache JWT validation results
      supabaseResponseCache: boolean;      // Cache Supabase responses
      sessionInfoCache: boolean;           // Cache session information
      deviceFingerprintCache: boolean;     // Cache device fingerprints
    };
    
    securityDataCaching: {
      riskScoreCache: boolean;             // Cache security risk scores
      loginHistoryCache: boolean;          // Cache recent login history
      suspiciousActivityCache: boolean;    // Cache threat detection results
      geoLocationCache: boolean;           // Cache location data
    };
  };
}
```

## Post-Migration Validation and Monitoring

### Migration Success Validation
```sql
-- Validate migration completeness
SELECT 
  'user_migration_validation' as metric,
  COUNT(DISTINCT au.id) as total_auth_users,
  COUNT(DISTINCT up.user_id) as total_profile_users,
  COUNT(DISTINCT s.user_id) as total_subscription_users,
  COUNT(DISTINCT wa.user_id) as total_wallet_users,
  ROUND(
    COUNT(DISTINCT up.user_id)::NUMERIC / 
    NULLIF(COUNT(DISTINCT au.id), 0) * 100, 2
  ) as profile_migration_percentage
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
LEFT JOIN subscriptions s ON au.id = s.user_id
LEFT JOIN wallet_accounts wa ON au.id = wa.user_id
WHERE au.deleted_at IS NULL;

-- Validate data integrity
SELECT 
  'data_integrity_check' as metric,
  COUNT(*) FILTER (WHERE profile_completion_percentage BETWEEN 0 AND 100) as valid_completion_scores,
  COUNT(*) FILTER (WHERE profile_completion_percentage < 0 OR profile_completion_percentage > 100) as invalid_completion_scores,
  AVG(profile_completion_percentage) as average_completion
FROM user_profiles;

-- Validate subscription system
SELECT 
  'subscription_system_validation' as metric,
  COUNT(*) as total_subscriptions,
  COUNT(*) FILTER (WHERE status = 'active') as active_subscriptions,
  COUNT(*) FILTER (WHERE plan = 'free') as free_users,
  COUNT(*) FILTER (WHERE plan = 'pro') as pro_users,
  COUNT(*) FILTER (WHERE plan = 'elite') as elite_users,
  COUNT(*) FILTER (WHERE plan = 'coach') as coach_users
FROM subscriptions;
```

### Continuous Monitoring Setup
```typescript
interface ContinuousMonitoring {
  // Performance monitoring
  performanceMonitoring: {
    authenticationLatency: {
      loginResponseTime: boolean;          // Monitor login performance
      tokenValidationTime: boolean;        // Monitor token validation speed
      profileLoadingTime: boolean;         // Monitor profile loading performance
      onboardingFlowTime: boolean;         // Monitor onboarding completion time
    };
    
    databasePerformance: {
      queryExecutionTime: boolean;         // Monitor database query performance
      connectionPoolHealth: boolean;       // Monitor database connections
      indexEfficiency: boolean;            // Monitor index usage
      lockContention: boolean;             // Monitor database locks
    };
  };
  
  // Business metrics monitoring
  businessMetricsMonitoring: {
    userEngagement: {
      registrationRate: boolean;           // Monitor user registrations
      onboardingCompletion: boolean;       // Monitor onboarding success
      subscriptionUpgrades: boolean;       // Monitor subscription upgrades
      churnRate: boolean;                  // Monitor user churn
    };
    
    revenueMetrics: {
      subscriptionRevenue: boolean;        // Monitor subscription income
      transactionRevenue: boolean;         // Monitor transaction fees
      voucherUtilization: boolean;         // Monitor voucher usage
      coachCommissions: boolean;           // Monitor coach earnings
    };
  };
  
  // Security monitoring
  securityMonitoring: {
    threatDetection: {
      failedLoginAttempts: boolean;        // Monitor failed logins
      suspiciousActivity: boolean;         // Monitor security threats
      dataAccessPatterns: boolean;         // Monitor data access
      complianceViolations: boolean;       // Monitor compliance issues
    };
    
    systemSecurity: {
      vulnerabilityScanning: boolean;      // Regular security scans
      securityPatchStatus: boolean;        // Monitor security updates
      accessControlAudits: boolean;        // Regular access reviews
      dataEncryptionStatus: boolean;       // Monitor encryption status
    };
  };
}
```

## Migration Timeline and Success Criteria

### Phased Migration Timeline
- **Phase 1 (Week 1)**: Foundation setup and basic profile migration
- **Phase 2 (Week 2)**: Goal-centric integration and nutrition system
- **Phase 3 (Week 3)**: Subscription and monetization system implementation
- **Phase 4 (Week 4)**: Advanced security and session management
- **Phase 5 (Week 5)**: Frontend integration and onboarding flow
- **Phase 6 (Week 6)**: Testing, optimization, and monitoring setup

### Success Criteria
```typescript
interface MigrationSuccessCriteria {
  // Technical success metrics
  technicalSuccess: {
    dataIntegrity: 99.9;                   // 99.9% data integrity maintained
    performanceImprovement: 25;            // 25% performance improvement
    securityCompliance: 100;               // 100% security compliance achieved
    availabilityTarget: 99.9;              // 99.9% system availability
  };
  
  // Business success metrics
  businessSuccess: {
    userSatisfaction: 4.5;                 // 4.5/5 user satisfaction score
    onboardingCompletion: 75;              // 75% onboarding completion rate
    subscriptionUptake: 35;                // 35% paid subscription rate
    revenueGrowth: 40;                     // 40% revenue growth post-migration
  };
  
  // User experience metrics
  userExperienceSuccess: {
    authenticationSpeed: 2;                // <2 second authentication
    onboardingTime: 10;                    // <10 minute onboarding
    profileCompletion: 80;                 // 80% average profile completion
    errorRate: 0.1;                        // <0.1% error rate
  };
}
```

The Auth module migration represents a comprehensive transformation from basic authentication to a sophisticated, health-focused user management system that serves as the secure foundation for Lumeos' goal-centric Health & Performance OS, integrating Tom's voucher-based monetization model while maintaining enterprise-grade security and privacy standards.