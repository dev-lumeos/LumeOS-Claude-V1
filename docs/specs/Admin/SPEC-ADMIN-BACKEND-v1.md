# SPEC: Admin Backend — LumeOS Operations System

**Version:** 1.0
**Erstellt:** 2026-03-06
**Status:** DRAFT
**Quellen:** ChatGPT-Analyse + Jarvis-Review + Mini-PC Packages

---

## 1. Vision

Das Admin-Backend ist kein "Panel" — es ist ein internes **Operations-System**.
Eigene App, eigene Rechte, eigene Audit-Trail. Kein `/admin`-Ordner in der Main-App.

**Prinzipien:**
- Kontrollierbar, nicht hübsch
- Revisionssicher, nicht schnell hingeklatscht
- Granulare Rechte, nicht God-Mode
- Domänen-zentriert, nicht Seiten-zentriert

---

## 2. Architektur

### 2.1 Deployment

```
lumeos.app          → User-App (Vite + React)
api.lumeos.app      → CRUD APIs (Hono, 10s timeout)
coach.lumeos.app    → Coach/Medical/MealCam (60s, LLM keys)
admin.lumeos.app    → Admin Operations System ← NEU
```

Bereits vorbereitet: `deploy/admin/vercel.json` (Platzhalter)

### 2.2 Tech Stack

| Komponente | Technologie | Begründung |
|---|---|---|
| Framework | Next.js 15 App Router | SSR, Server Actions, Route Groups |
| Auth | Supabase Auth SSR (`@supabase/ssr`) | Cookie-basierte Session, kein Client-Token |
| DB | Supabase PostgreSQL + RLS | Echte Sicherheit auf DB-Ebene |
| Styling | Tailwind CSS | Admin = Dichte + Klarheit, Tailwind passt hier |
| State | Zustand | Konsistenz mit Main-App |
| Tables | TanStack Table | Server-Side Filter, Sort, Pagination |
| Validation | Zod | Konsistenz mit bestehenden Contracts |

### 2.3 Monorepo-Integration

```
apps/
  admin/                  ← Neue Admin-App
    src/
      app/                ← Next.js App Router
      modules/            ← Domänen-Module
      lib/                ← Auth Guards, Audit, Helpers
    package.json

packages/                 ← Shared (existiert auf Mini-PC)
  contracts/              ← Domain-Typen + Zod Schemas
  rules-engine/           ← Rulesets (JSON, versioniert, SHA-256)
  scoring/                ← Formeln pro Modul
  ui/                     ← Shared UI Components
  db/                     ← DB Types + Queries
```

**Hinweis:** Mini-PC hat `packages/contracts`, `packages/rules-engine`, `packages/scoring` bereits mit Tests gebaut. Diese werden als Basis übernommen.

---

## 3. Rechte-Architektur (RBAC + Scopes)

### 3.1 Rollen (Phase 1 = 3, Phase 2+ = erweiterbar)

| Rolle | Beschreibung | Phase |
|---|---|---|
| `super_admin` | Vollzugriff, System-Config, gefährliche Aktionen | 1 |
| `support` | User-Verwaltung, Tickets, read-only Billing | 1 |
| `content_admin` | Exercises, Content, Supplements-Daten | 1 |
| `coach_admin` | Coach-Verwaltung, Pairings, Reviews | 2 |
| `medical_reviewer` | Lab-Interpretationen, Health-Flag Overrides | 2 |
| `finance_admin` | Billing, Refunds, Revenue Reports | 2 |
| `ops_admin` | System Health, Jobs, Queues, Logs | 2 |

### 3.2 Scopes

```typescript
type Scope =
  // Users
  | 'users.read' | 'users.write' | 'users.delete'
  // Content
  | 'exercises.read' | 'exercises.write' | 'exercises.publish'
  | 'supplements.read' | 'supplements.write'
  | 'content.read' | 'content.write' | 'content.publish'
  // Coaching
  | 'coaches.read' | 'coaches.write' | 'coaches.approve'
  | 'clients.read'
  // Medical
  | 'lab_reviews.read' | 'lab_reviews.write' | 'lab_reviews.approve'
  | 'health_flags.read' | 'health_flags.override'
  // Billing
  | 'billing.read' | 'billing.refund'
  | 'subscriptions.read' | 'subscriptions.write'
  | 'wallets.read' | 'wallets.adjust'
  // Marketplace
  | 'marketplace.read' | 'marketplace.write' | 'marketplace.approve'
  // System
  | 'rules.read' | 'rules.write' | 'rules.publish'
  | 'jobs.read' | 'jobs.manage'
  | 'audit.read'
  | 'flags.read' | 'flags.write'
  | 'system.read' | 'system.config';
```

### 3.3 Drei-Schichten-Sicherheit (NON-NEGOTIABLE)

```
┌─────────────────────────────────────┐
│  1. UI Guard                        │  → Menüs/Buttons ausblenden
│     useHasScope('users.write')      │  → UX, KEINE Sicherheit
├─────────────────────────────────────┤
│  2. Server Action / API Guard       │  → requireScope('users.write')
│     Wirft 403 wenn Scope fehlt      │  → Echte Prüfung
├─────────────────────────────────────┤
│  3. RLS Policy in PostgreSQL        │  → DB erlaubt nur was Rolle darf
│     admin_role_id → scope check     │  → Letzte Verteidigung
└─────────────────────────────────────┘
```

**Regel:** Ein versteckter Button ist keine Sicherheit. Ein Client-Check ist Dekoration. Die echte Regel sitzt in der DB.

---

## 4. Datenmodell

### 4.1 Admin-Tabellen

```sql
-- Rollen & Rechte
CREATE TABLE admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,          -- 'super_admin', 'support', etc.
  display_name TEXT NOT NULL,
  description TEXT,
  scopes TEXT[] NOT NULL DEFAULT '{}', -- Array von Scope-Strings
  is_system BOOLEAN DEFAULT false,     -- System-Rollen nicht löschbar
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE admin_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,             -- Optional: temporäre Rechte
  UNIQUE(user_id, role_id)
);

-- Audit Log (PFLICHT)
CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES users(id),
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,                -- 'user.deactivated', 'rule.published', etc.
  entity_type TEXT NOT NULL,           -- 'user', 'exercise', 'rule', etc.
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,                         -- Pflicht bei destruktiven Aktionen
  request_id TEXT,                     -- Korrelation
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index für Performance (RLS-Spalten MÜSSEN indexiert sein)
CREATE INDEX idx_audit_actor ON admin_audit_logs(actor_id);
CREATE INDEX idx_audit_entity ON admin_audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_action ON admin_audit_logs(action);
CREATE INDEX idx_audit_created ON admin_audit_logs(created_at DESC);

-- Feature Flags
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,            -- 'coach_buddy_v2', 'new_scoring'
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  rollout_pct INTEGER DEFAULT 0 CHECK (rollout_pct BETWEEN 0 AND 100),
  conditions JSONB DEFAULT '{}',       -- Zielgruppe, Region, etc.
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- System Jobs (Monitoring)
CREATE TABLE system_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'dead_letter')),
  payload JSONB,
  result JSONB,
  error TEXT,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rule Versions (für Scoring, Nutrition, Supplements etc.)
CREATE TABLE rule_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,                -- 'nutrition', 'training', 'supplements', etc.
  version INTEGER NOT NULL,
  rules JSONB NOT NULL,
  sha256 TEXT NOT NULL,                -- Integrity Check
  status TEXT NOT NULL CHECK (status IN ('draft', 'review', 'approved', 'active', 'archived')),
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(module, version)
);

-- Nur eine aktive Version pro Modul
CREATE UNIQUE INDEX idx_rule_active
  ON rule_versions(module)
  WHERE status = 'active';

-- RLS
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_versions ENABLE ROW LEVEL SECURITY;

-- Trigger
CREATE TRIGGER set_updated_at BEFORE UPDATE ON admin_roles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### 4.2 RLS Policies

```sql
-- Audit: Nur lesbar mit audit.read Scope
CREATE POLICY admin_audit_read ON admin_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_user_roles ur
      JOIN admin_roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND 'audit.read' = ANY(r.scopes)
    )
  );

-- Audit: Niemand darf löschen oder updaten
-- (kein INSERT Policy nötig — Server schreibt mit service_role)

-- Feature Flags: Lesbar für alle Admins, schreibbar nur mit flags.write
CREATE POLICY flags_read ON feature_flags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_user_roles ur
      JOIN admin_roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
    )
  );

CREATE POLICY flags_write ON feature_flags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_user_roles ur
      JOIN admin_roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND 'flags.write' = ANY(r.scopes)
    )
  );
```

---

## 5. Module (Domänen-basiert)

### 5.1 Phase 1 — MVP

| Modul | Funktionen | Scopes |
|---|---|---|
| **Dashboard** | KPIs, User-Wachstum, API Health, Active Sessions, Revenue | `system.read` |
| **Users** | Liste, Suche, Detail, Deaktivieren, Rollen zuweisen | `users.*` |
| **Exercises** | CRUD, Instructions bearbeiten (100 fehlende!), Media verwalten | `exercises.*` |
| **Content** | Supplements-DB, Food-DB Korrekturen, Education Content | `content.*` |
| **Audit Log** | Timeline, Filter nach Actor/Entity/Action, Export | `audit.read` |
| **Feature Flags** | Toggle, Rollout %, Conditions | `flags.*` |
| **System** | API Status (10 Ports), DB Stats, Job Queue, Healthcheck | `system.*` |

### 5.2 Phase 2

| Modul | Funktionen | Scopes |
|---|---|---|
| **Coaches** | Approve/Reject, Pairings, Revenue Dashboard | `coaches.*` |
| **Medical** | Lab Reviews, Health Flag Overrides, Safety Gate Logs | `lab_reviews.*`, `health_flags.*` |
| **Billing** | Subscriptions, Wallets, Refunds, Revenue Reports | `billing.*`, `wallets.*` |
| **Marketplace** | Product Approvals, Vendor Management | `marketplace.*` |
| **Rules Editor** | Versionierte Rulesets bearbeiten, Preview, Diff, Publish | `rules.*` |

### 5.3 Phase 3

| Modul | Funktionen |
|---|---|
| **Support Tools** | User Timeline, Ticket System, Impersonation (mit Audit) |
| **Analytics** | Custom Reports, Cohort Analysis, Retention |
| **Monitoring** | Failed Jobs, Webhook Failures, Dead Letters, Orphaned Records |
| **Bulk Operations** | Batch User Updates, Mass Notifications, Data Exports |

---

## 6. UI Patterns

### 6.1 Grundregeln

Admin ist keine Marketing-Site. Es geht um **Dichte, Klarheit, Geschwindigkeit**.

- **Tabellen** mit Server-Side Filter, Sort, Pagination (TanStack Table)
- **Side Panels** statt dauernde Page-Navigation
- **Detail Drawer** für Quick-View
- **Inline Status Changes** nur bei unkritischen Feldern
- **Harte Confirm-Flows** bei destruktiven Aktionen (Re-Auth + Reason)
- **Gespeicherte Filter** pro User
- **Bulk Actions** mit Confirmation Count

### 6.2 LumeOS-spezifische Komponenten

| Komponente | Beschreibung |
|---|---|
| **User Timeline** | Chronologische Ansicht aller User-Aktionen (Meals, Workouts, Labs, Coach-Chats) |
| **Health Event Timeline** | Medical Markers + Safety Gate Violations |
| **Rule Diff Viewer** | Side-by-Side Vergleich von Ruleset-Versionen |
| **API Health Dashboard** | Live-Status aller 10 APIs mit Response Times |
| **Coach-Client Viewer** | Relationship Graph, Revenue Flow |
| **Exercise Editor** | Inline Markdown für Instructions, Media Upload, i18n (DE/EN/TH) |

### 6.3 Aktions-Modi

| Modus | Verhalten | Beispiel |
|---|---|---|
| **Read** | Keine Bestätigung nötig | User-Profil ansehen |
| **Edit** | Speichern-Button + Audit | Exercise Instructions ändern |
| **Approve** | Review + Confirm + Audit | Regel freigeben |
| **Dangerous** | Re-Auth + Reason + Confirm + Audit | User löschen, Refund |

---

## 7. Audit-Log Spec

Jede kritische Admin-Aktion erzeugt einen Audit-Eintrag:

```typescript
interface AuditEntry {
  actor_id: string;        // Wer
  actor_role: string;      // Mit welcher Rolle
  action: string;          // Was (z.B. 'user.deactivated')
  entity_type: string;     // Welche Entität
  entity_id: string;       // Welche ID
  old_value: unknown;      // Alter Wert
  new_value: unknown;      // Neuer Wert
  reason: string;          // Warum (Pflicht bei destructive)
  request_id: string;      // Korrelation
}
```

### Auditierte Aktionen

- User deaktiviert/reaktiviert/gelöscht
- Rolle zugewiesen/entzogen
- Exercise erstellt/geändert/gelöscht
- Content publiziert/depubliziert
- Feature Flag geändert
- Ruleset approved/activated/rolled back
- Wallet-Balance manuell angepasst
- Subscription geändert/storniert
- Health Flag überschrieben
- Lab-Interpretation freigegeben
- Coach approved/suspended
- Refund ausgelöst

---

## 8. Daten-Schutz

### 8.1 Sensible Daten

Bei Health-Daten, Labs, Coach-Notizen, Supplements:

- **Standardmässig maskiert** anzeigen
- **Gezielt entsperren** (Click-to-Reveal + Audit)
- **Zugriff loggen** (wer hat wann welche Daten eingesehen)
- **Export beschränkt** (nur `super_admin` + Reason)

### 8.2 Soft Deletes

Keine Hard-Deletes für Business-Daten. Stattdessen:

```sql
-- Pattern für alle Business-Tabellen
deleted_at TIMESTAMPTZ,              -- NULL = aktiv
deleted_by UUID REFERENCES users(id),
deletion_reason TEXT
```

---

## 9. Rule Engine Integration

### 9.1 Prinzip: Engine decides, Admin configures

Der Admin editiert **Regel-Definitionen**, nicht Runtime-Logik.

### 9.2 Workflow

```
Draft → Review → Approved → Active
  ↑                           ↓
  └──── Rollback ────────────←┘
```

1. Content/Rules Admin erstellt Draft (neues Ruleset oder Änderung)
2. Diff-Ansicht zeigt Änderungen zum aktiven Ruleset
3. Dry-Run/Preview zeigt Impact auf Sample-Daten
4. Approver gibt frei → Status `approved`
5. Publisher aktiviert → Status `active`, alte Version → `archived`
6. Rollback jederzeit auf vorherige Version möglich

### 9.3 Basis vom Mini-PC

Die `packages/rules-engine` hat bereits:
- JSON-basierte Rulesets mit SHA-256 Hashing
- Evaluator + Trigger-Matcher
- Scoring-Formeln für alle 5 Module
- Tests

Diese werden in den Rule Editor integriert — Rulesets editieren, versionieren, deployen.

---

## 10. System Health Panel

### 10.1 API Monitoring

```typescript
const APIS = [
  { name: 'Auth',        port: 4200 },
  { name: 'Nutrition',   port: 5100 },
  { name: 'Training',    port: 5200 },
  { name: 'Supplements', port: 5300 },
  { name: 'Recovery',    port: 5400 },
  { name: 'Coach',       port: 5500 },
  { name: 'Human Coach', port: 5600 },
  { name: 'Marketplace', port: 5700 },
  { name: 'Medical',     port: 5800 },
  { name: 'Goals',       port: 5900 },
];
```

Anzeige pro API: Status (UP/DOWN), Response Time, Last Restart, Error Count (24h)

### 10.2 DB Stats

- Tabellen-Count (aktuell 142)
- Row Counts für Key-Tabellen
- Connection Pool Status
- Migration Version
- Disk Usage

### 10.3 Job Queue

- Pending / Running / Failed / Dead Letter
- Retry-Management
- Dead Letter Inspector

---

## 11. Vercel Deployment

```
deploy/admin/
  vercel.json              ← admin.lumeos.app
  api/
    [...route].ts          ← Catch-all Server Actions
  package.json
```

- **Region:** sin1 (Singapore)
- **Auth:** Supabase SSR, Cookie-based
- **DB:** `DATABASE_POOLED` (pgBouncer, port 6543)
- **Keine LLM Keys** nötig (Admin braucht kein AI)
- **Timeout:** 10s (standard CRUD)

---

## 12. Acceptance Criteria

### Phase 1 MVP — PASS wenn:

- [ ] `apps/admin` existiert als eigenständige Next.js App
- [ ] Login nur für User mit Admin-Rolle möglich
- [ ] 3 Rollen (`super_admin`, `support`, `content_admin`) seed-bar
- [ ] Dashboard zeigt: User Count, API Status, letzte Audit-Einträge
- [ ] User-Liste mit Search, Filter, Pagination (Server-Side)
- [ ] User-Detail mit Deaktivieren + Reason (Audit)
- [ ] Exercise-Editor: Instructions bearbeiten, Media hochladen
- [ ] Audit-Log: Timeline mit Filter nach Actor/Entity/Action
- [ ] Feature Flags: Toggle + Rollout %
- [ ] System Panel: Alle 10 APIs Status
- [ ] Kein `service_role` Key im Browser
- [ ] RLS auf allen Admin-Tabellen aktiv
- [ ] Jede schreibende Aktion erzeugt Audit-Eintrag
- [ ] `pnpm typecheck` PASS
- [ ] `pnpm test` PASS (min. 20 Tests)

### Verify Commands

```bash
pnpm typecheck
pnpm test
# Manual: Login als super_admin → Dashboard sichtbar
# Manual: Login als support → kein Zugriff auf System/Rules
# Manual: User deaktivieren → Audit-Eintrag vorhanden
# Manual: Exercise Instructions editieren → gespeichert + Audit
```

---

## 13. Was wir NICHT machen

- ❌ BFF-Layer (Server Actions + RLS reichen)
- ❌ Impersonation (Phase 3)
- ❌ Four-Eyes Principle (Phase 3)
- ❌ Policy Simulator (Phase 3)
- ❌ 15 Rollen von Anfang an (3 reichen)
- ❌ Hard Deletes
- ❌ `service_role` im Client
- ❌ Admin als `/admin` Route in der Main-App
- ❌ Live-Edit von Regeln ohne Versionierung

---

## 14. Abhängigkeiten

| Abhängigkeit | Status |
|---|---|
| Supabase Auth SSR | ✅ Verfügbar |
| `packages/contracts` (Mini-PC) | ✅ Gebaut, muss integriert werden |
| `packages/rules-engine` (Mini-PC) | ✅ Gebaut, muss integriert werden |
| Vercel Deploy Structure | ✅ `deploy/admin/` existiert |
| Feature Branches merged | ⏳ Wartet auf Tom |
| Supabase PROD Migrations 043-049 | ⏳ Nur lokal |

---

*Spec erstellt aus ChatGPT-Analyse (16 Punkte) + Jarvis-Review + Mini-PC Package-Analyse.*
*Übertriebenes entfernt, Pragmatisches behalten, LumeOS-Kontext eingearbeitet.*
