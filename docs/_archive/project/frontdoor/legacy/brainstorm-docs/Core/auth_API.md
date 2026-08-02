# Auth API Documentation

## Overview

The Auth API provides comprehensive authentication and user management services for Lumeos, built on Supabase Auth with extended profile management. The system handles user registration, authentication, onboarding, and profile management with a focus on health and fitness application requirements.

**Base URL:** `http://localhost:4200`  
**Authentication:** Bearer token (JWT from Supabase Auth)  
**Database:** Supabase Auth + PostgreSQL (user_profiles, nutrition goals, etc.)

## Core Authentication Architecture

### Dual Storage System
```typescript
interface AuthArchitecture {
  supabaseAuth: {
    userIdentity: boolean;          // Core auth (email, password, sessions)
    userMetadata: boolean;          // Basic profile (display_name, locale, etc.)
    emailVerification: boolean;     // Email confirmation system
    passwordReset: boolean;         // Password reset flows
  };
  
  lumeosTables: {
    userProfiles: boolean;          // Extended fitness profile data
    nutritionGoals: boolean;        // Fitness goals and targets
    subscriptions: boolean;         // Plan and billing information
    walletAccounts: boolean;        // Voucher and transaction system
  };
}
```

### Security Model
- **JWT Tokens**: Supabase-issued JWT tokens for stateless authentication
- **Row Level Security**: Database-level user isolation
- **Middleware Protection**: Route-level authentication middleware
- **Permission System**: Tier-based feature access control
- **Session Management**: Refresh token rotation and secure logout

## Authentication Endpoints

### POST /register
Create a new user account with Supabase Auth integration.

```typescript
interface RegisterRequest {
  email: string;                    // Valid email address
  password: string;                 // Minimum 8 characters
  displayName: string;              // User's display name
  locale?: string;                  // Language preference (default: 'en')
  plan?: 'free' | 'pro' | 'elite' | 'coach'; // Subscription plan (default: 'free')
}

interface RegisterResponse {
  ok: true;
  data: {
    token: string;                  // JWT access token
    user: UserProfile;              // User profile object
    emailVerification: 'sent';      // Email verification status
  };
}
```

**Implementation Details:**
- Creates user in Supabase Auth system
- Initializes user_profiles row
- Sets up default subscription plan
- Creates wallet account with 0 balance
- Automatically signs in user on successful registration
- Sends email verification through Supabase

**Error Handling:**
- `409 Conflict`: Email already registered
- `400 Bad Request`: Invalid email format or weak password
- `503 Service Unavailable`: Supabase Auth not configured

### POST /login
Authenticate existing user and return session token.

```typescript
interface LoginRequest {
  email: string;                    // User's email address
  password: string;                 // User's password
}

interface LoginResponse {
  ok: true;
  data: {
    token: string;                  // JWT access token
    refresh_token: string;          // Refresh token for session renewal
    expires_at: number;             // Token expiration timestamp
    user: UserProfile;              // Complete user profile
  };
}
```

**Features:**
- Integrates with Supabase Auth signin
- Fetches extended profile data from user_profiles
- Returns comprehensive user object with fitness profile
- Handles email verification status
- Provides refresh token for session management

### POST /refresh
Renew expired access token using refresh token.

```typescript
interface RefreshRequest {
  refresh_token: string;            // Valid refresh token
}

interface RefreshResponse {
  ok: true;
  data: {
    token: string;                  // New access token
    refresh_token: string;          // New refresh token
    expires_at: number;             // New expiration timestamp
  };
}
```

**Security Features:**
- Refresh token rotation (new token issued each refresh)
- Automatic session invalidation on token reuse
- Secure token storage recommendations

### GET /me
Retrieve current authenticated user's complete profile.

```typescript
interface MeResponse {
  ok: true;
  data: {
    user: UserProfile;              // Complete user profile
    activeGoal: NutritionGoal | null; // Current active nutrition goal
    nutritionTargets: NutritionTargets | null; // Legacy nutrition targets
  };
}

interface UserProfile {
  // Supabase Auth fields
  id: string;
  email: string;
  display_name: string;
  locale: string;
  role: 'user' | 'coach' | 'admin';
  avatar_url: string | null;
  timezone: string | null;
  onboarding_completed: boolean;
  onboarding_step: number;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string;
  
  // Extended profile fields (user_profiles table)
  gender?: 'male' | 'female' | 'other';
  birth_date?: string;
  height_cm?: number;
  weight_kg?: number;
  body_fat_pct?: number;
  experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  training_frequency?: number;
  training_duration?: number;
  primary_goal?: string;
  dietary_preference?: 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo' | 'mediterranean' | 'custom';
  allergies?: string[];
  unit_system?: 'metric' | 'imperial';
  equipment_access?: string;
}
```

**Data Sources:**
- Supabase Auth user metadata
- user_profiles table (extended fitness data)
- user_nutrition_goals table (active goal)
- nutrition_targets table (legacy targets)

## Onboarding and Profile Management

### PUT /onboarding
Complete the comprehensive user onboarding process.

```typescript
interface OnboardingRequest {
  // Personal Information
  displayName: string;              // User's preferred display name
  language: 'de' | 'en' | 'th';    // Interface language
  unitSystem: 'metric' | 'imperial'; // Measurement units
  
  // Physical Profile
  gender: 'male' | 'female' | 'other';
  birthDate: string;                // Format: YYYY-MM-DD
  height: number;                   // In selected unit system
  weight: number;                   // In selected unit system
  bodyFat?: number;                 // Body fat percentage (0-100)
  
  // Fitness Profile
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  goal: GoalType;                   // Primary fitness goal
  trainingFrequency: number;        // Sessions per week (1-7)
  sessionDuration: number;          // Minutes per session
  equipment: EquipmentType[] | EquipmentType; // Available equipment
  
  // Nutrition Profile
  dietaryPreference: DietType;      // Dietary preference
  allergies: string[];              // Food allergies/restrictions
  mealsPerDay: number;              // Preferred meal frequency (1-10)
  snacksPerDay?: number;            // Snacks per day (0-5)
  favoritesFoods?: string[];        // Liked foods
  likedFoods?: string[];            // Alternative liked foods field
  dislikedFoods?: string[];         // Foods to avoid
  
  // Calculated Targets (from frontend calculations)
  tdee: number;                     // Total Daily Energy Expenditure
  targetCalories: number;           // Daily calorie target
  proteinG: number;                 // Daily protein target (grams)
  fatG: number;                     // Daily fat target (grams)
  carbsG: number;                   // Daily carbohydrate target (grams)
  
  // Optional Features
  suggestRoutine?: boolean;         // Generate training routine
}

type GoalType = 
  | 'bulk' | 'cut' | 'recomp' | 'maintain' | 'performance'
  | 'lean_bulk' | 'clean_bulk' | 'aggressive_bulk'
  | 'conservative_cut' | 'moderate_cut' | 'aggressive_cut' 
  | 'mini_cut' | 'contest_prep'
  | 'body_recomp' | 'reverse_diet';

type EquipmentType = 'home' | 'gym' | 'bodyweight' | 'bands' | 'kettlebell' | 'cables';

type DietType = 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo' | 'mediterranean' | 'custom';
```

**Goal-Specific Calculations:**
```typescript
interface GoalModifiers {
  lean_bulk: { tdee_modifier: 0.10, weekly_rate: 0.25, max_weeks: 20, protein_per_kg: 2.0 };
  clean_bulk: { tdee_modifier: 0.15, weekly_rate: 0.35, max_weeks: 16, protein_per_kg: 2.0 };
  aggressive_bulk: { tdee_modifier: 0.20, weekly_rate: 0.50, max_weeks: 12, protein_per_kg: 1.8 };
  conservative_cut: { tdee_modifier: -0.15, weekly_rate: -0.35, max_weeks: 16, protein_per_kg: 2.2 };
  moderate_cut: { tdee_modifier: -0.20, weekly_rate: -0.50, max_weeks: 12, protein_per_kg: 2.3 };
  aggressive_cut: { tdee_modifier: -0.25, weekly_rate: -0.75, max_weeks: 8, protein_per_kg: 2.5 };
  mini_cut: { tdee_modifier: -0.25, weekly_rate: -0.75, max_weeks: 6, protein_per_kg: 2.5 };
  contest_prep: { tdee_modifier: -0.20, weekly_rate: -0.50, max_weeks: 16, protein_per_kg: 2.5 };
  body_recomp: { tdee_modifier: 0, protein_per_kg: 2.2 };
  maintain: { tdee_modifier: 0, protein_per_kg: 1.8 };
  performance: { tdee_modifier: 0.10, protein_per_kg: 2.0 };
  reverse_diet: { tdee_modifier: 0.05, weekly_rate: 0.10, max_weeks: 12, protein_per_kg: 2.0 };
}
```

**Database Operations:**
1. **user_profiles**: Complete fitness profile data
2. **user_nutrition_goals**: Goal-specific nutrition targets with calculated modifiers
3. **user_food_preferences**: Dietary preferences and restrictions
4. **nutrition_targets**: Legacy targets table (maintained for compatibility)
5. **Supabase metadata**: Update onboarding completion status

**Unit System Handling:**
- Imperial → Metric conversion for database storage
- Height: feet → centimeters (* 30.48)
- Weight: pounds → kilograms (* 0.453592)
- All database values stored in metric system

### PUT /me
Update user profile information.

```typescript
interface UpdateProfileRequest {
  // Supabase user_metadata fields
  display_name?: string;
  locale?: string;
  timezone?: string;
  avatar_url?: string;
  
  // user_profiles table fields
  gender?: 'male' | 'female' | 'other';
  birth_date?: string;              // YYYY-MM-DD format
  height_cm?: number;
  weight_kg?: number;
  body_fat_pct?: number;
  experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  training_frequency?: number;
  training_duration?: number;
  primary_goal?: string;
  dietary_preference?: DietType;
  allergies?: string[];
  unit_system?: 'metric' | 'imperial';
  equipment_access?: string;
}
```

**Update Strategy:**
- Selective field updates (only provided fields are updated)
- Dual storage update (Supabase metadata + local tables)
- Immediate response with updated user data
- No impact on existing nutrition goals

## Password and Security Management

### PUT /change-password
Change user password with current password verification.

```typescript
interface ChangePasswordRequest {
  currentPassword: string;          // Current password for verification
  newPassword: string;              // New password (minimum 8 characters)
}

interface ChangePasswordResponse {
  ok: true;
  message: 'Password changed successfully';
}
```

**Security Process:**
1. Verify current password by attempting sign-in
2. Update password via Supabase Admin API
3. Current sessions remain valid
4. User not required to re-authenticate

### POST /forgot-password
Initiate password reset process via email.

```typescript
interface ForgotPasswordRequest {
  email: string;                    // User's email address
}

interface ForgotPasswordResponse {
  ok: true;
  message: 'If the email exists, a reset link has been sent.';
}
```

**Security Features:**
- Always returns success (doesn't reveal if email exists)
- Supabase handles secure email delivery
- Redirect URL configurable via environment
- Reset tokens have built-in expiration

## Session and Authentication Management

### POST /logout
Invalidate user session and refresh token.

```typescript
interface LogoutResponse {
  ok: true;
}
```

**Logout Process:**
- Server-side session invalidation via Supabase
- Refresh token revocation
- Graceful error handling for invalid tokens
- Client responsible for clearing local storage

### POST /resend-verification
Resend email verification for unverified accounts.

```typescript
interface ResendVerificationRequest {
  email: string;                    // User's email address
}

interface ResendVerificationResponse {
  ok: true;
  message: 'Verification email sent';
}
```

## Authorization and Permissions

### GET /permissions
Retrieve user's feature permissions based on subscription tier.

```typescript
interface PermissionsResponse {
  ok: true;
  data: TierPermissions;
}

interface TierPermissions {
  // Core features
  nutrition_logging: boolean;
  training_logging: boolean;
  supplement_tracking: boolean;
  recovery_tracking: boolean;
  
  // AI features
  mealcam_ai: boolean;
  ai_coach_messages_limit: number;  // Monthly message limit
  ai_workout_generation: boolean;
  lab_ocr: boolean;
  
  // Advanced features
  marketplace_access: boolean;
  marketplace_selling: boolean;
  client_management: boolean;
  max_clients: number;
  
  // Goal management
  max_active_goals: number;
  adaptive_goals: boolean;
  
  // Wallet system
  wallet_voucher_amount: number;    // Monthly voucher in EUR
  revenue_wallet_access: boolean;   // Auszahlbare revenue wallet (coaches)
}
```

**Permission Tiers:**
- **Free**: Basic logging, 1 goal, no AI features
- **Pro**: MealCam AI, AI Coach (20 msgs), 3 goals, €14.99 voucher
- **Elite**: Unlimited AI, advanced analytics, unlimited goals, €29.99 voucher
- **Coach**: Client management, revenue wallet, custom AI, €49.99 voucher

### GET /tiers
Public endpoint returning available subscription tiers.

```typescript
interface TiersResponse {
  ok: true;
  data: SubscriptionTier[];
}

interface SubscriptionTier {
  id: 'free' | 'pro' | 'elite' | 'coach';
  name: string;
  price: number;                    // Monthly price in EUR
  currency: 'EUR';
  interval: 'month';
  voucher: number;                  // Monthly wallet voucher amount
  popular?: boolean;                // Featured tier
  tagline: string;                  // Marketing tagline
  highlights: string[];             // Feature list for display
  cta: string;                      // Call-to-action text
}
```

## Error Handling

### Standard Error Response
```typescript
interface AuthErrorResponse {
  ok: false;
  error: string;                    // Human-readable error message
  code?: string;                    // Error code for programmatic handling
  details?: Record<string, any>;    // Additional error context
}
```

### Common Error Codes
- `AUTH_001`: Invalid credentials
- `AUTH_002`: Email already registered
- `AUTH_003`: Email not verified
- `AUTH_004`: Password too weak
- `AUTH_005`: Session expired
- `AUTH_006`: Refresh token invalid
- `AUTH_007`: User not found
- `AUTH_008`: Permission denied
- `AUTH_009`: Service unavailable
- `AUTH_010`: Validation failed

### Error Response Examples

**Invalid Login (401):**
```json
{
  "ok": false,
  "error": "Invalid email or password",
  "code": "AUTH_001"
}
```

**Email Already Exists (409):**
```json
{
  "ok": false,
  "error": "Email already registered",
  "code": "AUTH_002"
}
```

**Validation Error (400):**
```json
{
  "ok": false,
  "error": "Password must be at least 8 characters",
  "code": "AUTH_010",
  "details": {
    "field": "password",
    "requirement": "min_length_8"
  }
}
```

## Middleware and Security

### Authentication Middleware
```typescript
// Applied to protected routes
const getAuthMiddleware = () => {
  return async (c: Context, next: Next) => {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return c.json({ ok: false, error: 'Authentication required' }, 401);
    }
    
    // Verify JWT with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return c.json({ ok: false, error: 'Invalid or expired token' }, 401);
    }
    
    c.set('userId', user.id);
    c.set('userRole', user.app_metadata?.role || 'user');
    
    await next();
  };
};
```

### Permission Middleware
```typescript
// Role-based route protection
const requireRole = (requiredRole: string) => {
  return async (c: Context, next: Next) => {
    const userRole = c.get('userRole');
    
    if (userRole !== requiredRole && userRole !== 'admin') {
      return c.json({ ok: false, error: 'Insufficient permissions' }, 403);
    }
    
    await next();
  };
};
```

## Integration Points

### Supabase Integration
```typescript
interface SupabaseIntegration {
  authOperations: {
    createUser: boolean;              // Admin user creation
    signIn: boolean;                  // Password authentication
    refreshSession: boolean;          // Token refresh
    resetPassword: boolean;           // Password reset email
    verifyToken: boolean;             # JWT verification
    updateUser: boolean;              // User metadata updates
  };
  
  emailServices: {
    verificationEmail: boolean;       // Account verification
    passwordResetEmail: boolean;      // Password reset
    resendVerification: boolean;      // Verification resend
  };
  
  sessionManagement: {
    tokenGeneration: boolean;         // JWT token creation
    refreshTokenRotation: boolean;    // Secure refresh
    sessionInvalidation: boolean;     // Logout handling
  };
}
```

### Database Integration
```typescript
interface DatabaseIntegration {
  userTables: {
    user_profiles: 'extended_fitness_data';
    user_nutrition_goals: 'goal_based_targets';
    user_food_preferences: 'dietary_preferences';
    nutrition_targets: 'legacy_targets';
    subscriptions: 'plan_management';
    wallet_accounts: 'voucher_system';
  };
  
  crossModuleData: {
    goalAlignment: boolean;           // Goals module integration
    nutritionSync: boolean;           // Nutrition module sync
    trainingProfile: boolean;         // Training module profile
    marketplacePermissions: boolean;  // Marketplace access control
  };
}
```

## Development and Testing

### Health Check
```bash
# Auth API health status
curl http://localhost:4200/health

# Expected Response
{
  "ok": true,
  "status": "healthy",
  "auth": "supabase"
}
```

### Environment Configuration
```bash
# Required environment variables
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
APP_URL=http://localhost:8501
DATABASE_URL=postgresql://postgres:password@localhost:54322/postgres
```

### Testing Authentication Flow
```typescript
// Complete authentication test flow
describe('Auth Flow Integration', () => {
  it('should complete full user lifecycle', async () => {
    // 1. Register new user
    const registerResponse = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'secure123',
        displayName: 'Test User'
      })
    });
    
    const { data: { token, user } } = await registerResponse.json();
    expect(user.onboarding_completed).toBe(false);
    
    // 2. Complete onboarding
    const onboardingResponse = await fetch('/api/auth/onboarding', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(onboardingData)
    });
    
    expect(onboardingResponse.ok).toBe(true);
    
    // 3. Verify profile data
    const profileResponse = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const { data: { user: updatedUser } } = await profileResponse.json();
    expect(updatedUser.onboarding_completed).toBe(true);
    expect(updatedUser.primary_goal).toBeDefined();
    
    // 4. Test permissions
    const permissionsResponse = await fetch('/api/auth/permissions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const { data: permissions } = await permissionsResponse.json();
    expect(permissions.max_active_goals).toBe(1); // Free tier
  });
});
```

The Auth API provides a comprehensive authentication and user management system that seamlessly integrates Supabase Auth with Lumeos' fitness-focused user profile requirements, supporting the full user lifecycle from registration through advanced feature access control.