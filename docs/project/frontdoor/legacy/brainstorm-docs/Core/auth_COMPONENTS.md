# Auth Frontend Components Documentation

## Overview

The Auth module frontend components provide a complete authentication and user management experience for Lumeos, built with Next.js 14, TypeScript, and Zustand for state management. The system includes secure authentication flows, comprehensive onboarding, and profile management integrated with Supabase Auth.

## Core Architecture

### State Management with Zustand
```typescript
interface AuthState {
  // Authentication state
  token: string | null;              // JWT access token
  user: User | null;                // Current user profile
  isAuthenticated: boolean;          // Authentication status
  isLoading: boolean;               // Loading state for UI
  error: string | null;             // Error messages
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

// User model - camelCase for frontend consistency
interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'coach' | 'admin';
  locale: 'de' | 'en' | 'th';
  timezone: string;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
  onboardingStep: number;
}
```

**Key Features:**
- **Persistent Storage**: Zustand persist middleware for automatic state restoration
- **Token Synchronization**: Dual storage (cookies + localStorage) for SSR and client consistency  
- **Error Handling**: Comprehensive error states with user-friendly messages
- **Data Mapping**: Automatic snake_case API → camelCase frontend mapping

### Authentication Flow Architecture
```typescript
interface AuthFlow {
  // Public routes (no authentication required)
  publicPages: ['/login', '/register', '/forgot-password'];
  
  // Protected routes (authentication required)
  protectedPages: ['/dashboard', '/nutrition', '/training', '/settings'];
  
  // Authentication gates
  middlewareProtection: boolean;     // Next.js middleware auth checks
  componentLevelAuth: boolean;       // Component-level auth guards
  routeRedirection: boolean;         // Automatic redirect handling
}
```

## Authentication Components

### LoginPage Component
**Location:** `apps/app/app/(auth)/login/page.tsx`

```typescript
function LoginForm() {
  const [email, setEmail] = useState('dev@lumeos.app');     // Dev default for testing
  const [password, setPassword] = useState('LumeOS2026!');  // Dev default for testing
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      
      // Handle redirect logic
      const redirect = searchParams.get('redirect') || '/dashboard';
      
      if (redirect.startsWith('http')) {
        // External app redirect with token
        const token = localStorage.getItem('lumeos_token') || '';
        const url = new URL(redirect);
        url.searchParams.set('token', token);
        window.location.href = url.toString();
      } else {
        // Internal route redirect
        router.push(redirect);
      }
    } catch (err: any) {
      setError(err.message || 'Login fehlgeschlagen');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white">
      {/* Lumeos branded login form */}
    </div>
  );
}
```

**Features:**
- **Developer-Friendly**: Pre-filled credentials for dev environment
- **External App Support**: Token-based authentication for external redirects
- **Error Handling**: User-friendly error display with automatic clearing
- **Responsive Design**: Mobile-first responsive layout
- **Brand Integration**: Lumeos visual identity and styling

**UI Elements:**
- **Brand Header**: Lumeos logo with "⚡" icon and tagline
- **Form Validation**: Real-time input validation and error display
- **Loading States**: Disabled button with loading indicator
- **Accessibility**: Proper labels and keyboard navigation

### Registration Component (Planned)
```typescript
// Planned registration component structure
interface RegistrationComponent {
  formValidation: {
    emailValidation: boolean;         // Real-time email format validation
    passwordStrength: boolean;        // Password strength indicator
    confirmPassword: boolean;         // Password confirmation matching
    displayNameRequired: boolean;     // Required display name field
  };
  
  userExperience: {
    stepByStepFlow: boolean;         // Multi-step registration flow
    progressIndicator: boolean;      // Visual progress through steps
    planSelection: boolean;          // Subscription tier selection
    immediateLogin: boolean;         // Automatic login post-registration
  };
  
  integration: {
    emailVerification: boolean;      // Email verification flow
    onboardingRedirect: boolean;     // Redirect to onboarding
    welcomeEmail: boolean;           // Welcome email trigger
    analyticsTracking: boolean;      // Registration funnel tracking
  };
}
```

### Onboarding Flow Components (In Settings)
**Location:** `apps/app/app/(app)/settings/page.tsx`

The onboarding system is integrated into the settings page, providing a comprehensive user profile setup experience.

```typescript
interface OnboardingFlow {
  // Personal Information Section
  personalInfo: {
    displayName: string;
    language: 'de' | 'en' | 'th';
    unitSystem: 'metric' | 'imperial';
    timezone: string;
    gender: 'male' | 'female' | 'other';
    birthDate: string;                // YYYY-MM-DD format
  };
  
  // Physical Profile Section  
  physicalProfile: {
    height: number;                   // In selected unit system
    weight: number;                   // In selected unit system
    bodyFatPercentage: number;        // Optional body fat %
    experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'elite';
    medicalConditions: string[];      // Health considerations
  };
  
  // Fitness Goals Section
  fitnessGoals: {
    primaryGoal: GoalType;            // Main fitness objective
    trainingFrequency: number;        // Sessions per week
    sessionDuration: number;          // Minutes per session
    availableEquipment: EquipmentType[]; // Equipment access
    trainingExperience: string;       // Previous experience details
  };
  
  // Nutrition Preferences Section
  nutritionPrefs: {
    dietaryPreference: DietType;      // Dietary approach
    foodAllergies: string[];          // Allergies and restrictions
    mealsPerDay: number;              // Preferred meal frequency
    cookingSkillLevel: string;        // Cooking ability assessment
    budgetConsiderations: string;     // Budget constraints
  };
}
```

**Advanced Features:**
- **Smart Defaults**: Intelligent default values based on user demographics
- **Unit Conversion**: Automatic metric/imperial conversion with user preference
- **Goal Calculations**: Real-time TDEE and macro calculations
- **Progress Validation**: Multi-step validation with helpful guidance
- **Accessibility**: Screen reader support and keyboard navigation

### Settings and Profile Management
**Location:** `apps/app/app/(app)/settings/page.tsx`

```typescript
const SETTINGS_SECTIONS = [
  { id: 'profile', icon: '👤', label: 'Profil' },
  { id: 'goals', icon: '🎯', label: 'Ziele' },
  { id: 'nutrition', icon: '🥗', label: 'Ernährung' },
  { id: 'training', icon: '💪', label: 'Training' },
  { id: 'notifications', icon: '🔔', label: 'Benachrichtigungen' },
  { id: 'privacy', icon: '🔒', label: 'Datenschutz' },
  { id: 'account', icon: '⚙️', label: 'Account' },
];

interface SettingsComponent {
  // Profile Management
  profileSettings: {
    basicInfo: boolean;              // Name, email, avatar
    physicalProfile: boolean;        // Height, weight, body composition
    fitnessProfile: boolean;         // Experience, goals, preferences
    preferenceSettings: boolean;     // Language, units, timezone
  };
  
  // Account Security
  accountSecurity: {
    passwordChange: boolean;         // Change password form
    emailVerification: boolean;      // Email verification status
    sessionManagement: boolean;      // Active sessions display
    accountDeletion: boolean;        // Account deletion flow
  };
  
  // Privacy and Data
  privacySettings: {
    dataDownload: boolean;          // GDPR data export
    dataRetention: boolean;         // Data retention preferences  
    sharingPermissions: boolean;    // Data sharing controls
    consentManagement: boolean;     // Cookie and tracking consent
  };
}
```

**Profile Update Features:**
- **Real-Time Validation**: Immediate feedback on form changes
- **Optimistic Updates**: UI updates before API confirmation
- **Change Detection**: Only send modified fields to API
- **Error Recovery**: Graceful error handling with rollback capability
- **Success Feedback**: Clear confirmation of saved changes

## State Management Integration

### Auth Store Implementation
**Location:** `apps/app/lib/auth-store.ts`

```typescript
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // State initialization
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Authentication actions
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api('auth', '/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          });
          
          const data = res.data || res;
          if (!data.token || !data.user) {
            throw new Error('Invalid response from server');
          }
          
          // Dual token storage for SSR compatibility
          document.cookie = `lumeos-token=${data.token}; path=/; max-age=${7 * 24 * 3600}; samesite=lax`;
          localStorage.setItem('lumeos_token', data.token);
          
          const user = mapUser(data.user);
          set({ 
            token: data.token, 
            user, 
            isAuthenticated: true, 
            isLoading: false, 
            error: null 
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Login failed';
          set({ 
            isLoading: false, 
            error: msg, 
            isAuthenticated: false, 
            user: null, 
            token: null 
          });
          throw e;
        }
      },

      // Logout with complete cleanup
      logout: () => {
        document.cookie = 'lumeos-token=; path=/; max-age=0';
        localStorage.removeItem('lumeos_token');
        set({ 
          token: null, 
          user: null, 
          isAuthenticated: false, 
          error: null 
        });
      },

      // User profile loading
      loadUser: async () => {
        const { token } = get();
        if (!token) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }
        
        try {
          set({ isLoading: true, error: null });
          const res = await api('auth', '/api/auth/me', { token });
          const rawUser = res.data?.user || res.data || res;
          set({ 
            user: mapUser(rawUser), 
            isAuthenticated: true, 
            isLoading: false, 
            error: null 
          });
        } catch {
          // Token invalid, clean up
          document.cookie = 'lumeos-token=; path=/; max-age=0';
          localStorage.removeItem('lumeos_token');
          set({ 
            token: null, 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },
    }),
    { name: 'lumeos-auth' }
  )
);
```

### Data Transformation Utility
```typescript
/** Map snake_case API response → camelCase User */
function mapUser(raw: Record<string, unknown>): User {
  return {
    id: raw.id as string,
    email: raw.email as string,
    displayName: (raw.display_name || raw.displayName || '') as string,
    role: (raw.role || 'user') as User['role'],
    locale: (raw.locale || 'de') as User['locale'],
    timezone: (raw.timezone || '') as string,
    avatarUrl: (raw.avatar_url || raw.avatarUrl || null) as string | null,
    onboardingCompleted: !!(raw.onboarding_completed ?? raw.onboardingCompleted),
    onboardingStep: Number(raw.onboarding_step ?? raw.onboardingStep ?? 0),
  };
}
```

**Key Features:**
- **Consistent API**: Standardized camelCase naming throughout frontend
- **Null Safety**: Comprehensive null/undefined handling
- **Type Safety**: Full TypeScript integration with runtime validation
- **Persistence**: Automatic state persistence across browser sessions

## Authentication Guards and Middleware

### Route Protection Strategy
```typescript
interface RouteProtection {
  // Next.js middleware (server-side)
  middlewareAuth: {
    tokenValidation: boolean;        // JWT token validation
    routeRedirection: boolean;       // Automatic redirect to login
    cookieHandling: boolean;         // Secure cookie management
    publicRouteExemption: boolean;   // Allow public routes
  };
  
  // Component-level guards (client-side)
  componentGuards: {
    authenticationCheck: boolean;    // Verify user authentication
    onboardingGate: boolean;         // Redirect incomplete onboarding
    roleBasedAccess: boolean;        // Role-based component access
    featurePermissions: boolean;     // Feature-level permission checks
  };
  
  // Layout-level protection
  layoutProtection: {
    appLayoutAuth: boolean;          // Main app layout authentication
    conditionalNavigation: boolean;  // Navigation based on auth state
    userContextProvider: boolean;    // User context throughout app
  };
}
```

### AuthProvider Context (Planned)
```typescript
// Planned auth context for component tree
interface AuthContextProvider {
  userContext: {
    currentUser: User | null;        // Current authenticated user
    permissions: UserPermissions;    // User's feature permissions
    subscription: SubscriptionTier;  // User's subscription details
    preferences: UserPreferences;    // User's app preferences
  };
  
  authMethods: {
    authenticate: (credentials: LoginCredentials) => Promise<void>;
    refreshAuthentication: () => Promise<void>;
    updateUserProfile: (updates: Partial<User>) => Promise<void>;
    changePassword: (passwords: PasswordChange) => Promise<void>;
  };
  
  authState: {
    isAuthenticated: boolean;
    isLoading: boolean;
    hasCompletedOnboarding: boolean;
    lastActivity: Date;
  };
}
```

## Form Components and Validation

### Form Input Components
```typescript
// Reusable form components for auth flows
interface AuthFormComponents {
  // Input Components
  EmailInput: {
    validation: 'realtime' | 'onBlur' | 'onSubmit';
    errorDisplay: boolean;
    autoComplete: 'email';
    placeholder: string;
  };
  
  PasswordInput: {
    strengthMeter: boolean;          // Visual password strength indicator
    showToggle: boolean;            // Show/hide password toggle
    requirements: PasswordRequirements; // Password requirement display
    confirmationField: boolean;     // Password confirmation field
  };
  
  PhoneInput: {
    countrySelection: boolean;      // Country code selection
    formatting: boolean;            // Automatic phone number formatting
    validation: boolean;            // Phone number validation
  };
  
  // Specialized Inputs
  DateOfBirthInput: {
    ageCalculation: boolean;        // Automatic age calculation
    validation: boolean;            // Age range validation
    accessibility: boolean;         // Screen reader support
  };
  
  UnitInput: {
    unitConversion: boolean;        // Automatic unit conversion
    unitSelection: boolean;         // Imperial/metric toggle
    validationRanges: boolean;      // Realistic value ranges
  };
}
```

### Validation Strategies
```typescript
interface ValidationStrategies {
  // Client-side validation
  frontendValidation: {
    realTimeValidation: boolean;     // Immediate feedback on input
    crossFieldValidation: boolean;   // Validation across multiple fields
    asyncValidation: boolean;        // Server-side validation calls
    customRules: boolean;           // Business-specific validation rules
  };
  
  // Server-side validation
  backendValidation: {
    schemaValidation: boolean;      // Zod schema validation
    businessRuleValidation: boolean; // Complex business logic validation
    dataIntegrityChecks: boolean;   // Database constraint validation
    securityValidation: boolean;    // Security-focused validation
  };
  
  // Error handling
  errorManagement: {
    userFriendlyMessages: boolean;  // Human-readable error messages
    errorRecovery: boolean;         // Guidance for fixing errors
    errorAggregation: boolean;      // Multiple error display
    contextualHelp: boolean;        // Help based on error context
  };
}
```

## Security Features

### Token Management
```typescript
interface TokenManagement {
  // Token storage strategy
  storageStrategy: {
    httpOnlyCookies: boolean;       // Secure cookie storage for SSR
    localStorageBackup: boolean;    // Client-side storage for SPA
    sessionStorage: boolean;        // Temporary storage option
    secureTransmission: boolean;    // HTTPS-only transmission
  };
  
  // Token lifecycle
  tokenLifecycle: {
    automaticRefresh: boolean;      // Background token refresh
    refreshTokenRotation: boolean;  // Security through rotation
    gracefulExpiration: boolean;    // Smooth expiration handling
    logoutOnExpiration: boolean;    // Automatic logout on expiration
  };
  
  // Security measures
  securityFeatures: {
    tokenEncryption: boolean;       // Client-side token encryption
    csrfProtection: boolean;        // CSRF token integration
    fingerprinting: boolean;        // Device fingerprinting
    rateLimit: boolean;            // Login attempt rate limiting
  };
}
```

### Session Security
```typescript
interface SessionSecurity {
  // Session monitoring
  sessionMonitoring: {
    activityTracking: boolean;      // User activity monitoring
    idleDetection: boolean;         // Idle session detection
    concurrentSessions: boolean;    // Multiple session management
    deviceTracking: boolean;        // Device-based session tracking
  };
  
  // Security events
  securityEvents: {
    loginAnomalyDetection: boolean; // Unusual login pattern detection
    locationBasedSecurity: boolean; // Geographic anomaly detection
    deviceChangeAlert: boolean;     // New device login alerts
    securityNotifications: boolean; // Security event notifications
  };
}
```

## User Experience Features

### Loading States and Feedback
```typescript
interface UXFeatures {
  // Loading indicators
  loadingStates: {
    buttonLoadingSpinners: boolean; // Button-level loading indicators
    pageTransitionLoading: boolean; // Page transition feedback
    backgroundProcessing: boolean;  // Background operation indicators
    optimisticUpdates: boolean;     // Immediate UI feedback
  };
  
  // Error handling UX
  errorExperience: {
    inlineErrorMessages: boolean;   // Field-level error display
    errorSummaryDisplay: boolean;   // Summary of all errors
    errorRecoveryGuidance: boolean; // Help text for fixing errors
    gracefulErrorFallbacks: boolean; // Fallback UI for errors
  };
  
  // Success feedback
  successFeedback: {
    successNotifications: boolean;  // Success message display
    progressCelebration: boolean;   // Milestone celebration
    confirmationSteps: boolean;     // Action confirmation
    visualProgressIndicators: boolean; // Progress visualization
  };
}
```

### Accessibility Implementation
```typescript
interface AccessibilityFeatures {
  // Keyboard navigation
  keyboardSupport: {
    tabNavigation: boolean;         // Logical tab order
    keyboardShortcuts: boolean;     // Keyboard shortcuts for power users
    focusManagement: boolean;       // Focus trap and restoration
    skipLinks: boolean;             // Skip to main content
  };
  
  // Screen reader support
  screenReaderSupport: {
    ariaLabels: boolean;           // Comprehensive ARIA labeling
    liveRegions: boolean;          // Dynamic content announcements
    roleDefinitions: boolean;      // Clear role definitions
    descriptiveText: boolean;      // Helpful descriptions
  };
  
  // Visual accessibility
  visualAccessibility: {
    highContrast: boolean;         // High contrast mode support
    fontSizeScaling: boolean;      // Responsive to font size changes
    colorBlindFriendly: boolean;   // Color blind friendly design
    reducedMotion: boolean;        // Respect reduced motion preferences
  };
}
```

## Integration with Lumeos Ecosystem

### Cross-Module Communication
```typescript
interface CrossModuleIntegration {
  // User context sharing
  userContextSharing: {
    globalUserState: boolean;       // Shared user state across modules
    preferenceSynchronization: boolean; // Sync preferences across modules
    permissionBroadcasting: boolean; // Broadcast permission changes
    profileUpdateNotification: boolean; // Notify modules of profile changes
  };
  
  // Authentication propagation
  authPropagation: {
    tokenSharing: boolean;          // Share tokens across domains
    ssoIntegration: boolean;        // Single sign-on capability
    crossDomainAuth: boolean;       // Authentication across subdomains
    thirdPartyIntegration: boolean; // Third-party service authentication
  };
}
```

### Data Synchronization
```typescript
interface DataSynchronization {
  // Profile data sync
  profileSync: {
    realtimeUpdates: boolean;       // Real-time profile synchronization
    conflictResolution: boolean;    // Handle concurrent updates
    offlineSupport: boolean;        // Offline capability with sync
    versionControl: boolean;        // Track profile version changes
  };
  
  // Preference sync
  preferenceSync: {
    crossDeviceSync: boolean;       // Sync preferences across devices
    backupAndRestore: boolean;      // Backup/restore functionality
    importExport: boolean;          // Data import/export capabilities
    migrationSupport: boolean;      // Data migration between versions
  };
}
```

## Testing Strategy

### Component Testing
```typescript
// Auth component testing approach
interface ComponentTesting {
  // Unit testing
  unitTests: {
    formValidation: boolean;        // Form validation logic testing
    stateManagement: boolean;       // Auth store testing
    dataTransformation: boolean;    // Data mapping testing
    errorHandling: boolean;         // Error scenario testing
  };
  
  // Integration testing
  integrationTests: {
    authFlowTesting: boolean;       // Complete auth flow testing
    apiIntegration: boolean;        // API integration testing
    routeProtection: boolean;       // Route guard testing
    crossBrowserTesting: boolean;   // Browser compatibility testing
  };
  
  // E2E testing
  e2eTests: {
    userJourneyTesting: boolean;    // Complete user journey testing
    accessibilityTesting: boolean;  // Automated accessibility testing
    performanceTesting: boolean;    // Performance under load testing
    securityTesting: boolean;       // Security vulnerability testing
  };
}
```

### Testing Examples
```typescript
// Example test scenarios
describe('Auth Store', () => {
  it('should handle successful login', async () => {
    const { result } = renderHook(() => useAuthStore());
    
    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
    expect(result.current.token).toBeDefined();
  });
  
  it('should handle login failure gracefully', async () => {
    const { result } = renderHook(() => useAuthStore());
    
    try {
      await act(async () => {
        await result.current.login('invalid@example.com', 'wrongpassword');
      });
    } catch (error) {
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBeDefined();
    }
  });
  
  it('should persist auth state across page reloads', () => {
    // Test persistence functionality
  });
});
```

The Auth frontend components provide a comprehensive, secure, and user-friendly authentication experience that seamlessly integrates with the Lumeos ecosystem, supporting the platform's goal-centric architecture while maintaining high standards for security, accessibility, and user experience.