# Lumeos Data Structure & Information Architecture

**Comprehensive data organization and information architecture for the Lumeos ecosystem**

---

## 🗂️ Information Architecture Overview

### Data Hierarchy
```
LUMEOS HEALTH DATA
├── USER PROFILE DATA
│   ├── Identity & Authentication
│   ├── Demographics & Goals
│   └── Preferences & Settings
├── HEALTH MODULES DATA
│   ├── Nutrition (Foods, Meals, Targets)
│   ├── Training (Workouts, Programs, Progress)
│   ├── Supplements (Stacks, Intake, Inventory)
│   ├── Recovery (Sleep, HRV, Scores)
│   ├── Medical (Labs, Meds, Symptoms)
│   └── Goals (Targets, Milestones, Progress)
├── AI & INTELLIGENCE DATA
│   ├── Coach Interactions & Insights
│   ├── Cross-Module Correlations
│   └── Predictive Analytics
├── SOCIAL & PROFESSIONAL DATA
│   ├── Human Coach Relationships
│   ├── Marketplace Transactions
│   └── Community Interactions
└── SYSTEM & META DATA
    ├── Audit Logs & Security
    ├── Performance Metrics
    └── Configuration Data
```

---

## 📊 Module Data Structures

### 1. User Profile & Authentication Data

#### Core User Entity
```typescript
interface User {
  // Identity
  id: string;
  email: string;
  username?: string;
  avatar?: string;
  
  // Authentication
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  lastLogin: Date;
  
  // Account Status
  status: 'active' | 'inactive' | 'suspended';
  accountType: 'free' | 'premium' | 'coach' | 'admin';
  subscriptionId?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

#### Extended User Profile
```typescript
interface UserProfile {
  userId: string;
  
  // Demographics
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  
  // Physical Characteristics
  height: number; // cm
  weight: number; // kg
  bodyFat?: number; // percentage
  
  // Health & Fitness
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'high' | 'extreme';
  fitnessExperience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  healthConditions: string[];
  medications: string[];
  allergies: string[];
  
  // Goals & Preferences
  primaryGoal: 'fat-loss' | 'muscle-gain' | 'performance' | 'health' | 'maintenance';
  dietaryRestrictions: string[];
  preferredUnits: 'metric' | 'imperial';
  timezone: string;
  language: string;
  
  // Privacy Settings
  dataSharing: {
    allowAnalytics: boolean;
    allowResearch: boolean;
    allowCoaching: boolean;
    publicProfile: boolean;
  };
}
```

### 2. Nutrition Module Data Structure

#### Food Database Schema
```typescript
interface Food {
  id: string;
  name: string;
  brand?: string;
  category: string;
  subcategory?: string;
  
  // Identification
  barcode?: string;
  fdcId?: string; // USDA ID
  blsId?: string; // BLS ID
  
  // Nutritional Data (per 100g)
  nutrition: {
    // Macronutrients
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    sugar: number;
    
    // Micronutrients (138 total from BLS 4.0)
    vitamins: {
      vitaminA: number; // μg
      vitaminC: number; // mg
      vitaminD: number; // μg
      vitaminE: number; // mg
      vitaminK: number; // μg
      thiamine: number; // mg
      riboflavin: number; // mg
      niacin: number; // mg
      vitaminB6: number; // mg
      folate: number; // μg
      vitaminB12: number; // μg
      biotin: number; // μg
      pantothenicAcid: number; // mg
    };
    
    minerals: {
      calcium: number; // mg
      iron: number; // mg
      magnesium: number; // mg
      phosphorus: number; // mg
      potassium: number; // mg
      sodium: number; // mg
      zinc: number; // mg
      copper: number; // mg
      manganese: number; // mg
      selenium: number; // μg
      iodine: number; // μg
      chromium: number; // μg
      molybdenum: number; // μg
    };
    
    aminoAcids: {
      histidine: number;
      isoleucine: number;
      leucine: number;
      lysine: number;
      methionine: number;
      phenylalanine: number;
      threonine: number;
      tryptophan: number;
      valine: number;
      // ... additional amino acids
    };
    
    fattyAcids: {
      saturated: number;
      monounsaturated: number;
      polyunsaturated: number;
      omega3: number;
      omega6: number;
      // ... specific fatty acids
    };
  };
  
  // Metadata
  source: 'BLS' | 'USDA' | 'OpenFoodFacts' | 'Custom';
  verified: boolean;
  lastUpdated: Date;
}
```

#### Meal Logging Data
```typescript
interface FoodEntry {
  id: string;
  userId: string;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  
  // Food Information
  foodId: string;
  foodName: string;
  brand?: string;
  
  // Quantity
  quantity: number;
  unit: 'g' | 'ml' | 'piece' | 'cup' | 'tbsp' | 'tsp';
  
  // Calculated Nutrition
  calculatedNutrition: Nutrition;
  
  // Entry Method
  entryMethod: 'manual' | 'barcode' | 'photo' | 'voice';
  confidence?: number; // for AI-assisted entries
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

interface DailyNutritionSummary {
  userId: string;
  date: Date;
  
  // Totals
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  
  // Targets vs Actual
  targets: NutritionTargets;
  compliance: {
    calories: number; // percentage
    protein: number;
    carbs: number;
    fat: number;
  };
  
  // Meal Distribution
  mealBreakdown: {
    breakfast: Nutrition;
    lunch: Nutrition;
    dinner: Nutrition;
    snacks: Nutrition;
  };
  
  // Scores
  nutritionScore: number; // 0-100
  micronutrientScore: number; // 0-100
  
  // Flags
  flags: string[]; // e.g., "low-protein", "high-sodium"
}
```

### 3. Training Module Data Structure

#### Exercise Database
```typescript
interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'sports';
  subcategory: string;
  
  // Muscle Targeting
  primaryMuscles: string[];
  secondaryMuscles: string[];
  muscleGroups: string[];
  
  // Exercise Details
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  tips: string[];
  
  // Media
  images: string[];
  videos: string[];
  demonstrations: string[];
  
  // Metadata
  verified: boolean;
  source: string;
  lastUpdated: Date;
}
```

#### Training Programs & Sessions
```typescript
interface TrainingProgram {
  id: string;
  userId: string;
  name: string;
  description: string;
  
  // Program Structure
  duration: number; // weeks
  daysPerWeek: number;
  programType: 'strength' | 'hypertrophy' | 'powerlifting' | 'general';
  
  // Training Days
  trainingDays: TrainingDay[];
  
  // Progress Tracking
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  
  // Metadata
  createdBy: 'user' | 'coach' | 'marketplace';
  creatorId?: string;
  isPublic: boolean;
}

interface WorkoutSession {
  id: string;
  userId: string;
  programId?: string;
  trainingDayId?: string;
  
  // Session Info
  date: Date;
  startTime: Date;
  endTime?: Date;
  duration?: number; // minutes
  
  // Location & Environment
  location: 'gym' | 'home' | 'outdoor';
  gymId?: string;
  
  // Exercises Performed
  exercises: SessionExercise[];
  
  // Session Metrics
  totalVolume: number; // kg
  averageRPE: number;
  totalReps: number;
  totalSets: number;
  
  // Subjective Measures
  energyLevel: 1 | 2 | 3 | 4 | 5;
  motivation: 1 | 2 | 3 | 4 | 5;
  pump: 1 | 2 | 3 | 4 | 5;
  soreness: 1 | 2 | 3 | 4 | 5;
  
  // Notes
  notes?: string;
  tags: string[];
  
  // Status
  status: 'planned' | 'in-progress' | 'completed' | 'skipped';
}

interface SessionExercise {
  exerciseId: string;
  exerciseName: string;
  
  // Sets Performed
  sets: ExerciseSet[];
  
  // Exercise Notes
  notes?: string;
  formNotes?: string;
  
  // Equipment Used
  equipment: string[];
  
  // Rest Time
  totalRestTime: number; // seconds
  averageRestTime: number;
}

interface ExerciseSet {
  setNumber: number;
  
  // Performance Data
  reps: number;
  weight: number; // kg
  distance?: number; // meters (for cardio)
  time?: number; // seconds (for timed exercises)
  
  // Intensity Measures
  rpe: number; // 1-10
  rir?: number; // reps in reserve
  
  // Set Type
  setType: 'working' | 'warmup' | 'dropset' | 'restpause' | 'failure';
  
  // Completion
  completed: boolean;
  restAfter: number; // seconds
}
```

### 4. Supplements Module Data Structure

#### Supplement Database
```typescript
interface Supplement {
  id: string;
  name: string;
  brand: string;
  category: string;
  
  // Product Information
  form: 'capsule' | 'tablet' | 'powder' | 'liquid' | 'gummy';
  servingSize: number;
  servingsPerContainer: number;
  
  // Active Ingredients
  ingredients: SupplementIngredient[];
  
  // Dosing Information
  recommendedDose: {
    amount: number;
    frequency: string;
    timing: string[];
  };
  
  // Safety & Interactions
  warnings: string[];
  sideEffects: string[];
  interactions: string[];
  
  // Quality & Certification
  thirdPartyTested: boolean;
  certifications: string[];
  
  // Commercial Info
  barcode?: string;
  price?: number;
  currency?: string;
}

interface SupplementStack {
  id: string;
  userId: string;
  name: string;
  description?: string;
  
  // Stack Composition
  supplements: StackSupplement[];
  
  // Scheduling
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  
  // Cycling
  isCyclic: boolean;
  cyclePattern?: {
    onWeeks: number;
    offWeeks: number;
  };
  
  // Goals & Rationale
  goals: string[];
  rationale?: string;
  
  // Metadata
  createdBy: 'user' | 'coach' | 'ai';
  creatorId?: string;
}

interface StackSupplement {
  supplementId: string;
  supplementName: string;
  
  // Dosing Schedule
  dosing: {
    amount: number;
    unit: string;
    timings: SupplementTiming[];
  };
  
  // Duration
  startDate: Date;
  endDate?: Date;
  
  // Notes
  purpose: string;
  notes?: string;
}

interface SupplementTiming {
  time: 'morning' | 'midday' | 'evening' | 'pre-workout' | 'post-workout' | 'bedtime';
  withFood: boolean;
  specificTime?: string; // HH:MM
  daysOfWeek: string[]; // ['mon', 'tue', ...]
}
```

### 5. Recovery Module Data Structure

#### Sleep & Recovery Data
```typescript
interface SleepEntry {
  id: string;
  userId: string;
  date: Date;
  
  // Sleep Times
  bedTime: Date;
  sleepTime?: Date;
  wakeTime: Date;
  getUpTime?: Date;
  
  // Sleep Metrics
  totalTimeInBed: number; // minutes
  totalSleepTime: number; // minutes
  sleepEfficiency: number; // percentage
  
  // Sleep Stages (if available from wearable)
  sleepStages?: {
    light: number; // minutes
    deep: number; // minutes
    rem: number; // minutes
    awake: number; // minutes
  };
  
  // Subjective Measures
  sleepQuality: 1 | 2 | 3 | 4 | 5;
  morningSleepiness: 1 | 2 | 3 | 4 | 5;
  timeToFallAsleep: number; // minutes
  nightWakings: number;
  
  // External Factors
  caffeine: boolean;
  alcohol: boolean;
  screenTime: boolean;
  stress: 1 | 2 | 3 | 4 | 5;
  
  // Data Source
  source: 'manual' | 'apple-health' | 'google-fit' | 'whoop' | 'oura' | 'garmin';
  deviceData?: any; // raw device data
}

interface RecoveryScore {
  id: string;
  userId: string;
  date: Date;
  
  // Composite Score
  overallScore: number; // 0-100
  
  // Component Scores
  sleepScore: number; // 0-100
  hrvScore?: number; // 0-100 (if available)
  subjectiveScore: number; // 0-100
  stressScore: number; // 0-100
  
  // HRV Data (if available)
  hrv?: {
    rmssd: number;
    baselineDeviation: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  };
  
  // Subjective Measures
  subjective: {
    energy: 1 | 2 | 3 | 4 | 5;
    motivation: 1 | 2 | 3 | 4 | 5;
    soreness: 1 | 2 | 3 | 4 | 5;
    stress: 1 | 2 | 3 | 4 | 5;
    mood: 1 | 2 | 3 | 4 | 5;
  };
  
  // Training Readiness
  trainingReadiness: 'optimal' | 'good' | 'caution' | 'rest';
  recommendations: string[];
}
```

### 6. Medical Module Data Structure

#### Lab Results & Biomarkers
```typescript
interface LabPanel {
  id: string;
  userId: string;
  
  // Panel Information
  panelName: string;
  orderingProvider: string;
  lab: string;
  
  // Dates
  orderDate: Date;
  collectionDate: Date;
  resultDate: Date;
  
  // Results
  biomarkers: Biomarker[];
  
  // Clinical Context
  clinicalNotes?: string;
  followUpRequired?: boolean;
  
  // File Attachments
  pdfReport?: string;
  additionalFiles?: string[];
}

interface Biomarker {
  id: string;
  
  // Biomarker Identification
  name: string;
  loincCode?: string; // standardized lab code
  category: string;
  
  // Results
  value: number;
  unit: string;
  
  // Reference Ranges
  referenceRange: {
    min: number;
    max: number;
    optimal?: {
      min: number;
      max: number;
    };
  };
  
  // Status
  status: 'low' | 'normal' | 'high' | 'critical';
  flag?: 'L' | 'H' | 'LL' | 'HH';
  
  // Trends
  previousValue?: number;
  trend?: 'improving' | 'stable' | 'worsening';
}

interface MedicalAlert {
  id: string;
  userId: string;
  
  // Alert Details
  type: 'biomarker' | 'medication' | 'interaction' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  
  // Context
  relatedBiomarkers?: string[];
  relatedMedications?: string[];
  
  // Actions
  recommendations: string[];
  requiresAttention: boolean;
  
  // Status
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}
```

### 7. Goals Module Data Structure

#### Goal Management
```typescript
interface Goal {
  id: string;
  userId: string;
  
  // Goal Definition
  title: string;
  description: string;
  category: 'body-composition' | 'performance' | 'health' | 'lifestyle';
  
  // Goal Type
  goalType: 'fat-loss' | 'muscle-gain' | 'strength' | 'endurance' | 'health-marker' | 'habit';
  
  // Target & Timeline
  target: {
    metric: string;
    currentValue: number;
    targetValue: number;
    unit: string;
  };
  
  startDate: Date;
  targetDate: Date;
  
  // Progress Tracking
  milestones: GoalMilestone[];
  currentProgress: number; // percentage
  
  // Strategies
  strategies: string[];
  keyBehaviors: string[];
  
  // Status
  status: 'active' | 'achieved' | 'paused' | 'discontinued';
  priority: 'high' | 'medium' | 'low';
  
  // Adaptation
  lastReview: Date;
  adaptations: GoalAdaptation[];
}

interface GoalMilestone {
  id: string;
  
  // Milestone Details
  title: string;
  description?: string;
  
  // Target
  targetValue: number;
  targetDate: Date;
  
  // Achievement
  achieved: boolean;
  achievedDate?: Date;
  actualValue?: number;
  
  // Celebration
  celebrated: boolean;
  reward?: string;
}

interface GoalAdaptation {
  id: string;
  date: Date;
  
  // Adaptation Type
  type: 'timeline' | 'target' | 'strategy' | 'behavior';
  
  // Changes Made
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
    reason: string;
  }[];
  
  // Context
  trigger: string;
  rationale: string;
}
```

---

## 🤖 AI & Intelligence Data

### AI Coach Interactions
```typescript
interface CoachInteraction {
  id: string;
  userId: string;
  
  // Conversation Context
  sessionId: string;
  messageType: 'user-question' | 'ai-response' | 'ai-insight' | 'ai-recommendation';
  
  // Content
  content: string;
  context: {
    modules: string[]; // which modules' data was used
    timeframe: string; // data timeframe considered
    confidence: number; // AI confidence in response
  };
  
  // User Feedback
  helpful?: boolean;
  userRating?: 1 | 2 | 3 | 4 | 5;
  feedback?: string;
  
  // Metadata
  timestamp: Date;
  aiModel: string;
  tokenCount: number;
}

interface CrossModuleInsight {
  id: string;
  userId: string;
  
  // Insight Details
  type: 'correlation' | 'optimization' | 'alert' | 'prediction';
  title: string;
  description: string;
  
  // Data Relationships
  involvedModules: string[];
  dataPoints: string[];
  
  // Findings
  correlationStrength?: number;
  predictedOutcome?: string;
  recommendedAction: string;
  
  // Confidence & Validation
  confidence: number;
  evidenceStrength: 'weak' | 'moderate' | 'strong';
  
  // User Interaction
  viewed: boolean;
  actedUpon?: boolean;
  userFeedback?: string;
  
  // Metadata
  generatedAt: Date;
  expiresAt?: Date;
}
```

---

## 🔗 Data Relationships & Connections

### Cross-Module Data Flow
```typescript
// Example: How nutrition affects training performance
interface NutritionTrainingCorrelation {
  userId: string;
  
  // Nutrition Factors
  nutritionFactors: {
    proteinIntake: number;
    carbIntake: number;
    calorieDeficit: number;
    hydration: number;
  };
  
  // Training Outcomes
  trainingOutcomes: {
    workoutVolume: number;
    averageRPE: number;
    strengthProgress: number;
    recoveryTime: number;
  };
  
  // Correlation Analysis
  correlations: {
    proteinVsRecovery: number;
    carbsVsEnergy: number;
    caloriesVsStrength: number;
  };
  
  // Time Period
  analysisStartDate: Date;
  analysisEndDate: Date;
  dataPoints: number;
}
```

### Data Aggregation Patterns
```typescript
interface UserHealthDashboard {
  userId: string;
  date: Date;
  
  // Module Scores
  moduleScores: {
    nutrition: number;
    training: number;
    supplements: number;
    recovery: number;
    medical: number;
  };
  
  // Overall Health Score
  overallHealthScore: number;
  
  // Trending Data
  trends: {
    sevenDay: ModuleTrends;
    thirtyDay: ModuleTrends;
    ninetyDay: ModuleTrends;
  };
  
  // Active Alerts
  alerts: HealthAlert[];
  
  // Recommendations
  aiRecommendations: string[];
  
  // Goal Progress
  goalProgress: {
    primary: number;
    secondary: number[];
  };
}
```

---

## 📱 App-Specific Data Views

### Main App Data Organization
```typescript
// Home screen data structure
interface HomeScreenData {
  // Quick Health Overview
  todayOverview: {
    date: Date;
    overallScore: number;
    moduleStatuses: ModuleStatus[];
    quickStats: QuickStat[];
  };
  
  // Priority Items
  priorityItems: {
    urgentAlerts: Alert[];
    todayTasks: Task[];
    upcomingGoals: Milestone[];
  };
  
  // Recent Activity
  recentActivity: ActivityItem[];
  
  // AI Insights
  dailyInsights: Insight[];
}

// Module-specific data views
interface NutritionModuleData {
  // Today's Summary
  todaySummary: DailyNutritionSummary;
  
  // Quick Actions
  quickLogOptions: QuickFoodItem[];
  
  // Progress Charts
  weeklyTrends: NutritionTrend[];
  
  // Recommendations
  aiRecommendations: NutritionRecommendation[];
  
  // Alerts
  nutritionAlerts: NutritionAlert[];
}
```

### Coach App Data Views
```typescript
interface CoachDashboardData {
  // Coach Overview
  coachSummary: {
    totalClients: number;
    activeClients: number;
    clientsNeedingAttention: number;
    todaySchedule: CoachEvent[];
  };
  
  // Client Portfolio
  clients: {
    id: string;
    name: string;
    overallStatus: 'excellent' | 'good' | 'needs-attention' | 'critical';
    moduleStatuses: ClientModuleStatus[];
    lastActivity: Date;
    alerts: ClientAlert[];
  }[];
  
  // Performance Analytics
  coachAnalytics: {
    clientSuccessRate: number;
    averageGoalAchievement: number;
    clientRetention: number;
    revenueMetrics: RevenueData;
  };
}
```

### Marketplace App Data Structure
```typescript
interface MarketplaceData {
  // Product Catalog
  products: {
    id: string;
    title: string;
    creator: Creator;
    category: string;
    price: number;
    rating: number;
    reviewCount: number;
    image: string;
    tags: string[];
  }[];
  
  // User Context
  userPreferences: {
    goals: string[];
    experience: string;
    interests: string[];
    purchaseHistory: Purchase[];
  };
  
  // Personalized Recommendations
  recommendations: ProductRecommendation[];
  
  // Shopping Context
  cart: CartItem[];
  wishlist: WishlistItem[];
  purchases: Purchase[];
}
```

---

## 🔐 Data Security & Privacy

### Data Classification
```typescript
enum DataSensitivity {
  PUBLIC = 'public',          // Non-sensitive, shareable
  PERSONAL = 'personal',      // Personal but not health-related
  HEALTH = 'health',         // Health data requiring special protection
  MEDICAL = 'medical',       // Medical data requiring highest protection
  FINANCIAL = 'financial'    // Payment and financial information
}

interface DataGovernance {
  classification: DataSensitivity;
  retention: {
    period: number; // days
    policy: 'auto-delete' | 'archive' | 'user-controlled';
  };
  access: {
    userControl: boolean;
    coachAccess: boolean;
    aiProcessing: boolean;
    researchConsent: boolean;
  };
  encryption: {
    atRest: boolean;
    inTransit: boolean;
    clientSide: boolean;
  };
}
```

### Audit Trail
```typescript
interface DataAuditLog {
  id: string;
  userId: string;
  
  // Action Details
  action: 'create' | 'read' | 'update' | 'delete' | 'share';
  dataType: string;
  dataId: string;
  
  // Context
  source: 'user' | 'ai' | 'coach' | 'system';
  sourceId?: string;
  ipAddress: string;
  userAgent: string;
  
  // Changes (for update actions)
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  
  // Timestamp
  timestamp: Date;
  
  // Compliance
  legalBasis?: string;
  consentId?: string;
}
```

---

**This comprehensive data structure documentation provides the foundation for implementing consistent, scalable, and secure data management across the entire Lumeos ecosystem.**

**Last Updated:** 2026-03-25  
**Created By:** Jarvis AI Orchestrator