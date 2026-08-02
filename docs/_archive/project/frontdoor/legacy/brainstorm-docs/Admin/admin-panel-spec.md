# Lumeos Admin Panel — Spec

## Architektur
- **Eigenständige App** — Separater Vite/React Build, eigener Port (4000)
- **Shared DB** — Gleiche PostgreSQL, aber Admin-spezifische Views/Queries
- **Eigener API Server** — Hono auf Port 4100, Admin-only Endpoints
- **Tech Stack**: React 18, TypeScript, Tailwind CSS, shadcn/ui inspired components
- **Auth**: Admin-Token basiert (kein User-Auth wie Hauptapp)

## Pages & Features

### 1. 📊 Dashboard (Home)
- **KPI Cards**: Total Users, Active Users (7d), Total Workouts, Revenue (placeholder)
- **Charts**: User Growth (30d), Daily Active Users, Workouts/Day, Module Usage
- **System Health**: 9 API Status Cards (green/red), DB Size, Response Times
- **Recent Activity**: Last 20 actions across all users

### 2. 👥 User Management
- **User List**: Sortable/filterable table (name, email, role, last active, plan, created)
- **User Detail**: Profile, activity timeline, subscription, usage stats per module
- **User Actions**: Disable/Enable, Change Role (user/coach/admin), Reset Data
- **Coaches**: Separate view for coaches with client counts, revenue

### 3. 🏋️ Exercise Management
- **Exercise List**: All 1,850 exercises, filterable by category/muscle/equipment
- **Exercise Editor**: Edit name (DE/EN/TH), instructions, tips, muscles, equipment, media
- **Bulk Actions**: Assign muscles, update categories, import/export CSV
- **Data Quality**: Red flags for missing data (no muscles, no instructions, no media)
- **Media Browser**: Preview images/videos, check broken links

### 4. 📋 Routine & Template Management
- **All Routines**: List across all users (template + custom)
- **Template Editor**: Create/edit system templates
- **Popular Routines**: Analytics on most used/copied routines

### 5. 💰 Marketplace & Transactions
- **Listings**: All marketplace products, approval queue
- **Transactions**: Purchase history, revenue per seller
- **Pricing**: Adjust commission rates, featured listings

### 6. 📈 Analytics
- **Module Usage**: Which modules are most used, time spent per module
- **Exercise Popularity**: Most logged exercises, most searched
- **Retention**: Cohort analysis, churn indicators
- **Training Stats**: Avg workouts/week, avg duration, most popular splits
- **Nutrition Stats**: MealCam usage, avg calories tracked

### 7. 🔧 System Management
- **API Monitor**: Real-time status of all 9 APIs, restart buttons
- **Database**: Table sizes, row counts, recent migrations
- **Jobs**: Background job status, cron overview
- **Logs**: Error log viewer with filtering
- **Config**: Feature flags, system settings

### 8. 📝 Content Management
- **i18n Dashboard**: Translation coverage per language (DE/EN/TH)
- **Missing Translations**: List of untranslated strings with quick-edit
- **Exercise Content**: Instructions quality overview, review queue

### 9. 🔔 Notifications & Communications
- **Push Notifications**: Send to all/segment users
- **Coach Messages**: View coach-client conversations (support)
- **Feedback Review**: Exercise feedback from users, flagged items

### 10. 📋 Audit Log
- **All Admin Actions**: Who did what, when
- **Data Changes**: Track edits to exercises, routines, users
- **Filterable**: By admin, action type, date range

## Design Principles
- **Dark sidebar** + white content area (professional admin look)
- **Data-dense**: Tables with sortable columns, inline actions
- **Responsive**: Works on tablet+, not mobile-optimized (admin = desktop)
- **Fast**: Server-side pagination, debounced search
- **shadcn/ui style**: Clean, minimal, consistent spacing
- **Color scheme**: Slate sidebar, white content, green-600 accents (Lumeos brand)

## Tech Decisions
- shadcn/ui components (or similar Tailwind-based primitives)
- Recharts for charts (lightweight, React-native)
- TanStack Table for data tables
- React Router for navigation
- Zustand for state
- Separate `src/admin/` directory within Lumeos monorepo
- Separate Vite config (`vite.admin.config.ts`)
