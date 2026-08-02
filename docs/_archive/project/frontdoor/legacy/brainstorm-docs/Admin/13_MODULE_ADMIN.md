# LUMEOS — Modul: Admin + Operations System
> Neu | 2026-04-14
> API Port: 4100 (Admin API) | Status: ✅ Backend complete, UI in Progress

---

## 1. Vision

Das Admin-Panel ist kein "/admin-Ordner" — es ist ein eigenständiges
**Operations-System** mit eigener App, eigenen Rechten und eigenem Audit-Trail.

**Prinzipien:**
- Kontrollierbar, nicht hübsch
- Revisionssicher, nicht schnell hingeklatscht
- Granulare Rechte, nicht God-Mode
- Domänen-zentriert, nicht Seiten-zentriert

---

## 2. Architektur

### Deployment
```
lumeos.app         → User-App
api.lumeos.app     → CRUD APIs (Hono, 10s timeout)
coach.lumeos.app   → Coach/Medical/MealCam (60s, LLM keys)
admin.lumeos.app   → Admin Operations System ← eigene App
```

### Tech Stack
| Komponente | Technologie |
|---|---|
| Framework | Next.js 15 App Router (SSR, Server Actions) |
| Auth | Supabase Auth SSR (Cookie-basierte Session) |
| DB | Supabase PostgreSQL + RLS |
| Styling | Tailwind CSS |
| State | Zustand |
| Tables | TanStack Table (Server-Side Filter, Sort, Pagination) |
| Charts | Recharts (lightweight) |
| Validation | Zod |

### Monorepo-Integration
```
apps/admin/
  src/
    app/        → Next.js App Router
    modules/    → Domänen-Module
    lib/        → Auth Guards, Audit, Helpers
```

---

## 3. Rechte-Architektur (RBAC + Scopes)

### Rollen
| Rolle | Beschreibung | Phase |
|---|---|---|
| `super_admin` | Vollzugriff, System-Config | 1 |
| `support` | User-Verwaltung, Tickets, read-only Billing | 1 |
| `content_admin` | Exercises, Content, Supplements-Daten | 1 |
| `coach_admin` | Coach-Verwaltung, Pairings, Reviews | 2 |
| `medical_reviewer` | Lab-Interpretationen, Health-Flag Overrides | 2 |
| `finance_admin` | Billing, Refunds, Revenue Reports | 2 |
| `ops_admin` | System Health, Jobs, Queues, Logs | 2 |

### Scopes (vollständig)
```typescript
type Scope =
  | 'users.read' | 'users.write' | 'users.delete'
  | 'exercises.read' | 'exercises.write' | 'exercises.publish'
  | 'supplements.read' | 'supplements.write'
  | 'coaches.read' | 'coaches.write' | 'coaches.approve'
  | 'lab_reviews.read' | 'lab_reviews.write' | 'lab_reviews.approve'
  | 'health_flags.read' | 'health_flags.override'
  | 'billing.read' | 'billing.refund'
  | 'wallets.read' | 'wallets.adjust'
  | 'marketplace.read' | 'marketplace.write' | 'marketplace.approve'
  | 'rules.read' | 'rules.write' | 'rules.publish'
  | 'jobs.read' | 'jobs.manage'
  | 'audit.read'
  | 'flags.read' | 'flags.write'
  | 'system.read' | 'system.config';
```

### Drei-Schichten-Sicherheit (NON-NEGOTIABLE)
```
1. UI Guard         → useHasScope('users.write') → Menüs ausblenden (UX, KEINE Sicherheit)
2. Server Action    → requireScope('users.write') → 403 wenn Scope fehlt (echte Prüfung)
3. RLS (PostgreSQL) → admin_role_id → scope check (letzte Verteidigung)
```
**Regel:** Ein versteckter Button ist keine Sicherheit. Die echte Regel sitzt in der DB.

---

## 4. Datenmodell

### Admin-Tabellen
```sql
-- Rollen & Rechte
CREATE TABLE admin_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  scopes      TEXT[] NOT NULL DEFAULT '{}',
  is_system   BOOLEAN DEFAULT false,    -- System-Rollen nicht löschbar
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE admin_user_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id     UUID NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
  granted_by  UUID REFERENCES users(id),
  granted_at  TIMESTAMPTZ DEFAULT now(),
  expires_at  TIMESTAMPTZ,              -- Optional: temporäre Rechte
  UNIQUE(user_id, role_id)
);

-- Audit Log (PFLICHT für alle Admin-Aktionen)
CREATE TABLE admin_audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID NOT NULL REFERENCES users(id),
  actor_role  TEXT NOT NULL,
  action      TEXT NOT NULL,            -- 'user.deactivated', 'rule.published'
  entity_type TEXT NOT NULL,            -- 'user', 'exercise', 'rule'
  entity_id   UUID,
  old_value   JSONB,
  new_value   JSONB,
  reason      TEXT,                     -- Pflicht bei destruktiven Aktionen
  request_id  TEXT,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_actor   ON admin_audit_logs(actor_id);
CREATE INDEX idx_audit_entity  ON admin_audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_action  ON admin_audit_logs(action);
CREATE INDEX idx_audit_created ON admin_audit_logs(created_at DESC);

-- Feature Flags
CREATE TABLE feature_flags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT NOT NULL UNIQUE,     -- 'coach_buddy_v2', 'new_scoring'
  description TEXT,
  enabled     BOOLEAN DEFAULT false,
  rollout_pct INTEGER DEFAULT 0 CHECK (rollout_pct BETWEEN 0 AND 100),
  conditions  JSONB DEFAULT '{}',
  updated_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
```

---

## 5. Pages & Features

### 1. Dashboard (Home)
- **KPI Cards:** Total Users, Active Users (7d), Total Workouts, Revenue (placeholder)
- **Charts:** User Growth (30d), Daily Active Users, Workouts/Day, Module Usage
- **System Health:** 10 API Status Cards (green/red), DB Size, Response Times
- **Recent Activity:** Last 20 Actions across all users

### 2. User Management
- **User List:** Sortable/filterable Table (name, email, role, last active, plan, created)
- **User Detail:** Profile, Activity Timeline, Subscription, Usage Stats per Module
- **User Actions:** Disable/Enable, Change Role, Reset Data
- **Coaches:** Separate View mit Client Count, Revenue

### 3. Exercise Management
- **Exercise List:** 1.850 Exercises, filterbar nach Kategorie/Muskel/Equipment
- **Exercise Editor:** Name (DE/EN/TH), Instructions, Tips, Muscles, Equipment, Media
- **Bulk Actions:** Muscles zuweisen, Categories updaten, CSV Import/Export
- **Data Quality:** Red Flags für missing data (keine Muscles, keine Instructions, kein Media)
- **Media Browser:** Images/Videos Preview, Broken Links Check

### 4. Routine & Template Management
- **All Routines:** List across all users (Templates + Custom)
- **Template Editor:** System-Templates erstellen/bearbeiten
- **Popular Routines:** Analytics (most used/copied)

### 5. Marketplace & Transactions
- **Listings:** Alle Marketplace-Produkte, Approval Queue
- **Transactions:** Purchase History, Revenue per Seller
- **Pricing:** Commission Rates, Featured Listings

### 6. Analytics
- **Module Usage:** Welche Module am meisten genutzt, Time spent
- **Exercise Popularity:** Most logged, most searched
- **Retention:** Cohort Analysis, Churn Indicators
- **Training Stats:** Avg Workouts/Week, Duration, Popular Splits
- **Nutrition Stats:** MealCam Usage, Avg Calories tracked

### 7. System Management
- **API Monitor:** Real-time Status aller 10 APIs (grün/rot), Restart-Buttons
- **Database:** Table Sizes, Row Counts, Recent Migrations
- **Jobs:** Background Job Status, Cron Overview
- **Logs:** Error Log Viewer mit Filtering
- **Config:** Feature Flags, System Settings

### 8. Content Management (i18n)
- **i18n Dashboard:** Translation Coverage per Language (DE/EN/TH)
- **Missing Translations:** Liste + Quick-Edit
- **Exercise Content:** Instructions Quality Overview, Review Queue

### 9. Rules Engine Management
- **Rulesets:** Versionierte JSON Rulesets (SHA-256 Hash)
- **Rule Editor:** Regeln bearbeiten + testen
- **Publish/Rollback:** Sicheres Deployment von Regeländerungen
- **Audit:** Wer hat welche Regel wann geändert

### 10. Audit Log
- **All Admin Actions:** Wer, Was, Wann
- **Data Changes:** Edits zu Exercises, Routines, Users
- **Filterable:** By Admin, Action Type, Date Range

---

## 6. Design-Prinzipien

- **Dark Sidebar** + white Content Area (Professional Admin Look)
- **Data-dense:** Tables mit sortierbaren Spalten, Inline Actions
- **Responsive:** Tablet+, nicht Mobile-optimiert (Admin = Desktop)
- **Fast:** Server-side Pagination, Debounced Search
- **Color Scheme:** Slate Sidebar, White Content, Green-600 Accents (Lumeos Brand)

---

## 7. API-Endpunkte (Port 4100)

```
GET  /api/admin/health          → System Health Overview
GET  /api/admin/kpis            → KPI Dashboard Data
GET  /api/admin/users           → Paginated User List
GET  /api/admin/users/:id       → User Detail + Stats
PUT  /api/admin/users/:id/role  → Change Role
PUT  /api/admin/users/:id/status → Activate/Deactivate

GET  /api/admin/exercises       → Exercise List (paginated, filtered)
PUT  /api/admin/exercises/:id   → Update Exercise
POST /api/admin/exercises/bulk  → Bulk Updates

GET  /api/admin/analytics/usage    → Module Usage
GET  /api/admin/analytics/retention → Cohort Analysis
GET  /api/admin/analytics/exercises → Exercise Analytics

GET  /api/admin/system/apis     → API Status all services
GET  /api/admin/system/db       → DB Stats
GET  /api/admin/audit           → Audit Log (paginated, filtered)
GET  /api/admin/feature-flags   → All Feature Flags
PUT  /api/admin/feature-flags/:key → Toggle Flag / Set Rollout %
```

---

## 8. Verbindungen zu allen Modulen

Admin ist Read-Only für User-Daten (außer destruktiven Admin-Aktionen).
Schreibt in: `admin_roles`, `admin_user_roles`, `admin_audit_logs`, `feature_flags`.
Liest von: allen Modulen für Analytics + System Health.

---

## 9. Status

| Komponente | Status |
|---|---|
| Admin API (Port 4100) Backend | ✅ Komplett (KPIs, Quality Report, API Health, DB Stats, Analytics) |
| Admin Dashboard UI | 🔄 In Progress (Agent läuft) |
| RBAC + Scopes DB-Schema | ⏳ Geplant |
| Exercise Editor | ⏳ Geplant |
| Rules Engine Management | ⏳ Geplant (Phase 2) |

---

## 10. Offene Punkte

| # | Typ | Beschreibung | Priorität |
|---|---|---|---|
| TODO | 🔴 | Admin Dashboard UI fertigstellen | 🔴 HOCH |
| TODO | 🔴 | RBAC Tabellen + RLS Policies | 🔴 HOCH |
| TODO | 🟡 | Exercise Editor im Admin | 🟡 MITTEL |
| TODO | 🟡 | i18n Missing Translations UI | 🟡 MITTEL |
| TODO | 🟡 | Marketplace Approval Queue | 🟡 MITTEL |
| TODO | 🟢 | Rules Engine Management (Phase 2) | 🟢 NIEDRIG |
| TODO | 🟢 | Medical Reviewer Role (Phase 2) | 🟢 NIEDRIG |
