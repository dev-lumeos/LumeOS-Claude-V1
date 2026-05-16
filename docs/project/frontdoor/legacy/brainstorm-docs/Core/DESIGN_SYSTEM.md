# LUMEOS Design System

**Complete UI/UX Design Guidelines for Lumeos Health & Performance OS**

---

## 🎨 Design Philosophy

### Core Principles
**"Clarity through Complexity"** — Lumeos handles complex health optimization, but the interface remains clean and intuitive.

1. **Performance-Focused:** Every element serves health optimization
2. **Module Identity:** Each module has distinct visual identity while maintaining system cohesion
3. **Data-Dense but Readable:** Complex health data presented clearly
4. **Professional Grade:** Suitable for both consumers and health professionals
5. **Mobile-First:** Designed for primary mobile usage with desktop enhancement

### Visual Language
- **Clean Minimalism:** Reduce visual noise to focus on data and actions
- **Purposeful Color:** Color conveys meaning (health status, module identity, alerts)
- **Typography Hierarchy:** Clear information hierarchy for complex health data
- **Intentional Animation:** Subtle animations for state changes and feedback
- **Consistent Iconography:** Unified icon system across all modules

---

## 🌈 Module Color System

### Primary Module Colors

Each module has a distinctive color identity while maintaining visual harmony:

```css
/* Nutrition Module - Green (Growth, Health) */
--nutrition-primary: #16a34a;      /* Green-600 */
--nutrition-light: #bbf7d0;        /* Green-200 */
--nutrition-dark: #15803d;         /* Green-700 */
--nutrition-bg: #f0fdf4;           /* Green-50 */

/* Training Module - Blue (Strength, Performance) */
--training-primary: #2563eb;       /* Blue-600 */
--training-light: #bfdbfe;         /* Blue-200 */
--training-dark: #1d4ed8;          /* Blue-700 */
--training-bg: #eff6ff;            /* Blue-50 */

/* Supplements Module - Purple (Enhancement, Optimization) */
--supplements-primary: #9333ea;    /* Purple-600 */
--supplements-light: #ddd6fe;      /* Purple-200 */
--supplements-dark: #7c3aed;       /* Purple-700 */
--supplements-bg: #faf5ff;         /* Purple-50 */

/* Recovery Module - Teal (Restoration, Balance) */
--recovery-primary: #0d9488;       /* Teal-600 */
--recovery-light: #99f6e4;         /* Teal-200 */
--recovery-dark: #0f766e;          /* Teal-700 */
--recovery-bg: #f0fdfa;            /* Teal-50 */

/* Medical Module - Red (Critical, Health Monitoring) */
--medical-primary: #dc2626;        /* Red-600 */
--medical-light: #fecaca;          /* Red-200 */
--medical-dark: #b91c1c;           /* Red-700 */
--medical-bg: #fef2f2;             /* Red-50 */

/* Goals Module - Orange (Motivation, Achievement) */
--goals-primary: #ea580c;          /* Orange-600 */
--goals-light: #fed7aa;            /* Orange-200 */
--goals-dark: #c2410c;             /* Orange-700 */
--goals-bg: #fff7ed;               /* Orange-50 */

/* Coach Module - Indigo (Guidance, Intelligence) */
--coach-primary: #4f46e5;          /* Indigo-600 */
--coach-light: #c7d2fe;            /* Indigo-200 */
--coach-dark: #4338ca;             /* Indigo-700 */
--coach-bg: #f0f9ff;               /* Indigo-50 */

/* Human Coach Module - Pink (Personal, Relationship) */
--human-coach-primary: #db2777;    /* Pink-600 */
--human-coach-light: #fbcfe8;      /* Pink-200 */
--human-coach-dark: #be185d;       /* Pink-700 */
--human-coach-bg: #fdf2f8;         /* Pink-50 */

/* Marketplace Module - Emerald (Commerce, Growth) */
--marketplace-primary: #059669;    /* Emerald-600 */
--marketplace-light: #a7f3d0;      /* Emerald-200 */
--marketplace-dark: #047857;       /* Emerald-700 */
--marketplace-bg: #ecfdf5;         /* Emerald-50 */

/* Auth Module - Slate (Foundation, Security) */
--auth-primary: #475569;           /* Slate-600 */
--auth-light: #cbd5e1;             /* Slate-300 */
--auth-dark: #334155;              /* Slate-700 */
--auth-bg: #f8fafc;                /* Slate-50 */
```

### System Colors

```css
/* Status Colors */
--success: #16a34a;                /* Green-600 */
--warning: #ea580c;                /* Orange-600 */
--error: #dc2626;                  /* Red-600 */
--info: #2563eb;                   /* Blue-600 */

/* Health Status Colors */
--status-optimal: #16a34a;         /* Green-600 - 80+ score */
--status-good: #65a30d;            /* Lime-600 - 70-79 score */
--status-warning: #ea580c;         /* Orange-600 - 50-69 score */
--status-critical: #dc2626;        /* Red-600 - <50 score */

/* Neutral System Colors */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;

/* Background System */
--bg-primary: #ffffff;
--bg-secondary: #f9fafb;
--bg-tertiary: #f3f4f6;
--bg-elevated: #ffffff;

/* Border System */
--border-light: #e5e7eb;
--border-medium: #d1d5db;
--border-strong: #9ca3af;
```

---

## 📱 App-Specific Design Guidelines

### 1. Web App (Marketing/Landing) — Port 8500

#### Purpose
Marketing site, landing pages, public content, SEO-optimized

#### Visual Identity
- **Primary Colors:** Brand gradient (Blue → Teal)
- **Typography:** Large, bold headlines with clear hierarchy
- **Layout:** Full-width sections with centered content
- **Components:** Hero sections, feature grids, testimonials, CTAs

#### Key Components
```css
/* Hero Gradient */
background: linear-gradient(135deg, #2563eb 0%, #0d9488 100%);

/* Section Layout */
.hero-section { padding: 120px 0 80px; }
.feature-section { padding: 80px 0; }
.cta-section { padding: 60px 0; }

/* Typography Scale */
h1 { font-size: 3.75rem; font-weight: 800; } /* 60px */
h2 { font-size: 3rem; font-weight: 700; }    /* 48px */
h3 { font-size: 2.25rem; font-weight: 600; } /* 36px */
```

#### Page Structure
```
Header: Logo + Navigation + CTA Button
Hero: Headline + Subtext + Primary CTA + Hero Image/Video
Features: 3-4 key features with icons and descriptions
Social Proof: Testimonials or user metrics
Pricing: Clear pricing tiers (if applicable)
Footer: Links, legal, contact
```

### 2. Main App (User Interface) — Port 8501

#### Purpose
Primary user application, daily health tracking and optimization

#### Visual Identity
- **Adaptive Colors:** Module colors based on current section
- **Layout:** Bottom tab navigation + top module header
- **Data Density:** Optimized for frequent daily use

#### Core Layout Pattern
```
┌─────────────────────────────────┐
│ Module Header (Dynamic Color)    │ ← Module-specific color + name
├─────────────────────────────────┤
│                                 │
│        Module Content           │ ← Scrollable content area
│        (Tab Navigation)         │ ← Sub-navigation if needed
│                                 │
├─────────────────────────────────┤
│  Bottom Navigation (5 tabs)     │ ← Main module navigation
└─────────────────────────────────┘
```

#### Module Headers
Each module has consistent header pattern:
```jsx
<ModuleHeader 
  title="Nutrition" 
  color="nutrition"
  score={85}
  status="optimal"
  settingsAction={() => navigate('/settings')}
/>
```

#### Bottom Navigation
```jsx
const mainNavigation = [
  { id: 'nutrition', icon: 'Utensils', label: 'Nutrition' },
  { id: 'training', icon: 'Dumbbell', label: 'Training' },
  { id: 'recovery', icon: 'Moon', label: 'Recovery' },
  { id: 'coach', icon: 'Bot', label: 'Coach' },
  { id: 'more', icon: 'Grid3X3', label: 'More' }
];
```

### 3. Coach App (Coach Dashboard) — Port 8502

#### Purpose
Professional dashboard for health coaches managing multiple clients

#### Visual Identity
- **Primary Colors:** Indigo + Pink (Coach + Human Coach modules)
- **Layout:** Sidebar navigation + main dashboard
- **Data Focus:** Client overview, progress tracking, communication

#### Dashboard Layout
```
┌─────────┬───────────────────────────────┐
│         │ Client Overview Header        │
│ Client  ├───────────────────────────────┤
│ List    │                               │
│ (Side)  │     Client Dashboard          │
│         │     (Multi-module view)       │
│         │                               │
├─────────┼───────────────────────────────┤
│ Coach   │ Action Panel                  │
│ Tools   │ (Messages, Plans, Notes)      │
└─────────┴───────────────────────────────┘
```

#### Client Status Colors
```css
/* Client Health Status */
.client-optimal { border-left: 4px solid var(--success); }
.client-warning { border-left: 4px solid var(--warning); }
.client-critical { border-left: 4px solid var(--error); }
```

### 4. Marketplace App (Shopping) — Port 8503

#### Purpose
Digital marketplace for training programs, meal plans, supplements

#### Visual Identity
- **Primary Colors:** Emerald (commerce, growth)
- **Layout:** Product grid + categories + search
- **Commercial Focus:** Product showcase, pricing, reviews

#### Marketplace Layout
```
┌─────────────────────────────────┐
│ Search + Filters + Categories    │
├─────────────────────────────────┤
│                                 │
│     Product Grid                │
│     (Cards with images,         │
│      titles, prices, ratings)   │
│                                 │
├─────────────────────────────────┤
│ Shopping Cart + Checkout        │
└─────────────────────────────────┘
```

#### Product Card Design
```jsx
<ProductCard>
  <ProductImage src={product.image} />
  <ProductInfo>
    <Title>{product.title}</Title>
    <Creator>{product.creator}</Creator>
    <Price primary={product.price} />
    <Rating value={product.rating} />
  </ProductInfo>
  <ActionButton>Add to Cart</ActionButton>
</ProductCard>
```

### 5. Admin App (System Management) — Port 8504

#### Purpose
System administration, user management, analytics, content moderation

#### Visual Identity
- **Primary Colors:** Slate (neutral, professional)
- **Layout:** Full sidebar + main content area
- **Data Tables:** Comprehensive data views with filters and actions

#### Admin Layout
```
┌─────────┬───────────────────────────────┐
│         │ Page Header + Breadcrumbs     │
│ Admin   ├───────────────────────────────┤
│ Sidebar │                               │
│ (Full)  │     Main Admin Content        │
│         │     (Tables, Charts, Forms)   │
│         │                               │
│         │                               │
└─────────┴───────────────────────────────┘
```

#### Admin Components
- **Data Tables:** Sortable, filterable, paginated
- **Analytics Charts:** Health metrics, user engagement, revenue
- **User Management:** User details, permissions, actions
- **Content Moderation:** Review and approve user-generated content

---

## 🏗️ Component Architecture

### Universal Header Component
Every module page follows this header pattern:

```jsx
<ModuleHeader>
  <ModuleIcon color={moduleColor} />
  <ModuleTitle>{moduleName}</ModuleTitle>
  <HealthScore value={score} status={status} />
  <HeaderActions>
    <SettingsButton />
    <NotificationButton />
  </HeaderActions>
</ModuleHeader>
```

### Module Content Structure
```jsx
<ModuleContainer>
  <ModuleHeader {...headerProps} />
  <ModuleTabNavigation tabs={moduleTabs} />
  <ModuleContent>
    {/* Dynamic content based on active tab */}
  </ModuleContent>
</ModuleContainer>
```

### Health Score Component
```jsx
<HealthScore value={85} status="optimal">
  <ScoreCircle value={85} color="success" />
  <ScoreLabel>Excellent</ScoreLabel>
</HealthScore>
```

### Status Indicators
```jsx
const StatusBadge = ({ status, label }) => (
  <Badge 
    color={getStatusColor(status)} 
    variant="soft"
  >
    <StatusIcon status={status} />
    {label}
  </Badge>
);
```

---

## 📊 Data Visualization Standards

### Chart Color Palette
```css
/* Primary Data Colors */
--chart-1: #2563eb;  /* Blue */
--chart-2: #16a34a;  /* Green */
--chart-3: #ea580c;  /* Orange */
--chart-4: #9333ea;  /* Purple */
--chart-5: #0d9488;  /* Teal */
--chart-6: #dc2626;  /* Red */

/* Gradient Overlays */
--chart-gradient-1: linear-gradient(135deg, #2563eb, #1d4ed8);
--chart-gradient-2: linear-gradient(135deg, #16a34a, #15803d);
```

### Health Metric Visualizations

#### Score Circles (0-100)
```jsx
<ScoreCircle 
  value={85} 
  size="large"
  color="success"
  showLabel={true}
/>
```

#### Trend Lines
```jsx
<TrendChart
  data={nutritionTrends}
  timeframe="30d"
  metric="protein"
  color="nutrition"
/>
```

#### Progress Bars
```jsx
<ProgressBar
  current={1850}
  target={2200}
  unit="kcal"
  color="nutrition"
  showPercentage={true}
/>
```

### Data Display Patterns

#### KPI Cards
```jsx
<KPICard>
  <KPIValue>2,145</KPIValue>
  <KPILabel>Calories Today</KPILabel>
  <KPITrend direction="up" value={"+5%" />
  <KPITarget>Target: 2,200</KPITarget>
</KPICard>
```

#### Health Status Grid
```jsx
<StatusGrid>
  {modules.map(module => (
    <StatusCard 
      key={module.id}
      title={module.name}
      score={module.score}
      status={module.status}
      color={module.color}
    />
  ))}
</StatusGrid>
```

---

## 🎭 Interactive States

### Button States
```css
/* Primary Button */
.btn-primary {
  background: var(--primary);
  color: white;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0,0,0,0.12);
}
```

### Card Interactions
```css
.card {
  transition: all 0.3s ease;
  border: 1px solid var(--border-light);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  border-color: var(--border-medium);
}
```

### Loading States
```jsx
<SkeletonLoader>
  <SkeletonText lines={3} />
  <SkeletonChart height="200px" />
  <SkeletonButton />
</SkeletonLoader>
```

---

## 📐 Spacing & Typography

### Spacing System (8pt Grid)
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-20: 5rem;    /* 80px */
```

### Typography Scale
```css
/* Font Family */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Font Sizes */
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.25rem;   /* 20px */
--text-2xl: 1.5rem;   /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem;  /* 36px */
--text-5xl: 3rem;     /* 48px */

/* Font Weights */
--weight-normal: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
--weight-extrabold: 800;
```

### Content Hierarchy
```jsx
<ContentSection>
  <SectionHeader>
    <Title level="h2">Nutrition Overview</Title>
    <Subtitle>Today's nutritional status</Subtitle>
  </SectionHeader>
  <SectionContent>
    {/* Main content */}
  </SectionContent>
</ContentSection>
```

---

## 📱 Responsive Design

### Breakpoints
```css
--screen-sm: 640px;   /* Small devices */
--screen-md: 768px;   /* Medium devices */
--screen-lg: 1024px;  /* Large devices */
--screen-xl: 1280px;  /* Extra large */
--screen-2xl: 1536px; /* 2x Extra large */
```

### Mobile-First Patterns
```css
/* Mobile first approach */
.component {
  /* Mobile styles (default) */
  padding: var(--space-4);
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .component {
    /* Tablet styles */
    padding: var(--space-6);
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1024px) {
  .component {
    /* Desktop styles */
    padding: var(--space-8);
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Navigation Adaptations
```jsx
/* Mobile: Bottom tabs */
<MobileNavigation position="bottom" tabs={5} />

/* Tablet: Side navigation */
<TabletNavigation position="side" collapsed={true} />

/* Desktop: Full sidebar */
<DesktopNavigation position="side" expanded={true} />
```

---

## 🎨 Design Tokens

### Shadow System
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

### Border Radius
```css
--radius-sm: 0.125rem;  /* 2px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
--radius-2xl: 1rem;     /* 16px */
--radius-full: 9999px;  /* Full circle */
```

### Animation Timing
```css
--duration-fast: 0.15s;
--duration-normal: 0.3s;
--duration-slow: 0.5s;
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
```

---

## 🧩 Component Library Structure

### Core Components
```
/components
├── /ui               # Base UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   └── Badge.tsx
├── /layout           # Layout components
│   ├── ModuleHeader.tsx
│   ├── Navigation.tsx
│   └── Container.tsx
├── /data             # Data visualization
│   ├── Chart.tsx
│   ├── ProgressBar.tsx
│   └── ScoreCircle.tsx
└── /module           # Module-specific
    ├── NutritionCard.tsx
    ├── TrainingCard.tsx
    └── RecoveryCard.tsx
```

### Design System Export
```typescript
export const LumeosDesignSystem = {
  colors: moduleColors,
  typography: typographyScale,
  spacing: spacingSystem,
  components: componentLibrary,
  tokens: designTokens
};
```

---

**This design system provides the complete foundation for building consistent, beautiful, and functional interfaces across the entire Lumeos ecosystem.**

**Last Updated:** 2026-03-25  
**Created By:** Jarvis AI Orchestrator  
**Source:** Comprehensive analysis of existing UI patterns + Tom's design requirements