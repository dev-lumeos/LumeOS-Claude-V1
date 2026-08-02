# LUMEOS — Platform Architecture
> Konsolidiert | 2026-04-14

---

## 1. System-Architektur (Überblick)

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  Next.js 15 (App Router) — 5 Apps — Vercel Deploy       │
│  app:8501  coach:8502  marketplace:8503  admin:8504      │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────┐
│                   Backend API Layer                      │
│  10 Hono.js Microservices — Node.js 22                   │
│  auth:4200  nutrition:5100  training:5200                │
│  supplements:5300  recovery:5400  coach:5500             │
│  human-coach:5600  marketplace:5700  medical:5800        │
│  goals:5900                                              │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    Data Layer                            │
│  Supabase PostgreSQL + RLS + Auth + Storage              │
│  200+ Tabellen | 80+ Migrationen                        │
│  DEV: owzytetarliewgpwtmpb | PROD: zgzikxaqcsbvmnvensmo │
└─────────────────────────────────────────────────────────┘
```

### Data Flow (Goal-centric)
```
Goals Module (5900) ← Zentraler Aggregation Point
    ↑
    ├── Nutrition API    → Tägliche Compliance, Makros
    ├── Training API     → Workout Adherence, Progress
    ├── Recovery API     → Recovery Readiness Score
    ├── Supplements API  → Stack Effectiveness
    └── Medical API      → Health Marker Improvements

Coach API (5500) ← Liest alle Module, schreibt nie direkt
    └── Gibt Empfehlungen, Actions, Summaries

Marketplace (5700) ← Monetarisierung
    └── Alle Käufe gehen durch Wallet ↔ Wallet
```

---

## 2. Tech Stack

| Layer | Technologie |
|---|---|
| **Monorepo** | pnpm workspaces + Turborepo |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS |
| **Client State** | Zustand |
| **Server State** | TanStack Query (React Query) |
| **Backend** | Hono.js (lightweight, Edge-ready) |
| **Database** | Supabase (PostgreSQL + Auth + Storage + RLS) |
| **Validation** | Zod |
| **Auth** | Supabase Auth SSR + JWT |
| **AI — Vision** | Claude Vision API (MealCam, Lab OCR) |
| **AI — Coach** | Z.AI GLM Models (GLM-5, GLM-4.5v) |
| **Testing** | Vitest (Unit), Playwright (E2E) |
| **Deployment** | Vercel (Frontends) |

---

## 3. Monorepo-Struktur

```
lumeos/
├── apps/
│   ├── web/           # Marketing/Landing → localhost:8500
│   ├── app/           # Main User App → localhost:8501  ← PRIMÄR
│   ├── coach/         # Coach Dashboard → localhost:8502
│   ├── marketplace/   # Marketplace → localhost:8503
│   └── admin/         # Admin Panel → localhost:8504
│
├── src/api/           # Backend APIs (Hono.js) ← AKTUELL AKTIV
│   ├── auth/          # Port 4200
│   ├── nutrition/     # Port 5100
│   ├── training/      # Port 5200
│   ├── supplements/   # Port 5300
│   ├── recovery/      # Port 5400
│   ├── coach/         # Port 5500
│   ├── human-coach/   # Port 5600
│   ├── marketplace/   # Port 5700
│   ├── medical/       # Port 5800
│   └── goals/         # Port 5900
│
├── packages/
│   ├── ui/            # Design System Primitives (Tailwind)
│   ├── supabase/      # Shared Supabase Clients (browser + server)
│   ├── auth/          # Auth Helpers + Session
│   ├── permissions/   # RBAC Roles + Scopes
│   ├── config/        # Env + API Config
│   ├── types/         # Shared TypeScript Types (API Contracts)
│   ├── contracts/     # API Contracts (Nutrition, Training, etc.)
│   ├── rules-engine/  # Rule Validation (Pure Functions)
│   ├── scoring/       # Score Calculation (Pure Functions)
│   └── utils/         # General Utilities
│
├── supabase/
│   └── migrations/    # 80+ SQL-Migrationen
│
└── docs/              # Diese Dokumentation
```

---

## 4. Architektur-Prinzipien

### Schichtenmodell
```
1. UI Layer         → Next.js — nur Rendering, kein Business Logic
2. AI Coach Layer   → Input: DashboardOverview | Output: Recommendations
                    → KEIN direkter DB-Zugriff
3. Rules Engine     → Konsumiert Aggregates, nutzt ruleset.v1.json
                    → Generiert Alerts + Protocol Outputs
4. Aggregation Layer→ Berechnet Scores, Flags, Status, Trends (READ-ONLY)
5. Actions Layer    → Einziger Write-Point | Validiert Input | Prüft Permissions
6. Data Layer       → Supabase PostgreSQL | RLS erzwingt user_id-Scope
```

### Kern-Regeln
1. **Writes nur via Actions/Endpoints** — kein direktes DB-Write vom UI
2. **Alle Queries user-scoped** — RLS erzwingt Isolation
3. **Keine Magic Side Effects** — explizite Operationen
4. **No Cross-Tenant Access** — absolute Isolation
5. **AI Coach liest, schreibt nie direkt** — immer über User-Action
6. **Modular** — jedes Modul schreibt nur in seine eigenen Tabellen

---

## 5. Datenbank

### Supabase Umgebungen
| Umgebung | Projekt ID | Verwendung |
|---|---|---|
| Local | 127.0.0.1:54322/postgres | Development |
| DEV | owzytetarliewgpwtmpb | Integration Testing |
| PROD | zgzikxaqcsbvmnvensmo | Production |

### Schema-Strategie
- Jedes Modul hat sein eigenes Schema (z.B. `nutrition.*`, `training.*`)
- Backward-Compatibility Views: `public.*` → `nutrition.*`
- Row Level Security (RLS) auf allen User-Tabellen
- Audit Logging auf allen schreibenden Operationen

### Statistiken
- 200+ Tabellen gesamt
- 80+ Migrations
- BLS 4.0 Food-Datenbank: 7.140 Lebensmittel, 98 Nährstoffe
- Exercise-Datenbank: 1.448+ Übungen, 4.633+ Media-Files

---

## 6. Scoring System

Einheitliches **0-100 Score-System** pro Modul. Kein aggregierter Gesamt-Score.

| Modul | Score-Typ | Kern-Metrik | Thresholds (ok/warn/block) |
|---|---|---|---|
| Nutrition | Daily Score | Macro Compliance % | 80/50 |
| Training | Session Score | Session Score | 80/50 |
| Supplements | Daily Score | Safety + Compliance | 80/50 |
| Recovery | Daily Score | Recovery Score | 75/50 |
| Medical | System Scores (5×) | Niedrigster Score | 80/50 |

### Status-Mapping
| Score | Status | Bedeutung |
|---|---|---|
| ≥ 80 | `ok` | Grüner Bereich |
| 50-79 | `warn` | Aufmerksamkeit nötig |
| < 50 | `block` | Kritisch, Aktion nötig |

### User-adaptive Thresholds
| Level | Multiplikator |
|---|---|
| beginner | 0.75 |
| intermediate | 0.90 |
| advanced | 1.00 |
| elite | 1.10 |

---

## 7. Safety Order (Prioritäten bei Konflikten)

1. **Medical Blocks** — immer höchste Priorität
2. **Supplements Blocks** — Interaktions-Konflikte
3. **Recovery Rest** — Übertraining verhindern
4. **Protocols** — regelbasierte Empfehlungen
5. **Optimization** — Performance-Feintuning

---

## 8. API-Konventionen

- REST, JSON, Hono.js
- Auth via `globalAuthMiddleware` (JWT Bearer Token)
- Alle Responses: `{ ok: boolean, data?: T, error?: string }`
- i18n-fähig: DE/EN/TH
- Error Codes: standardisiert und dokumentiert
- Audit Log: alle schreibenden Aktionen werden geloggt

---

## 9. Externe Integrationen

| Service | Zweck |
|---|---|
| Stripe | Externe Payments (Wallet Top-up, Payouts) |
| Claude Vision API | MealCam, Lab-Result OCR |
| Z.AI GLM | Coach-Konversationen |
| OpenFoodFacts | Food-DB Erweiterung |
| Oura / Whoop / Apple Health | Recovery + Sleep Data (geplant) |

---

## 10. Deployment

### Frontend (Vercel)
| App | Domain |
|---|---|
| web | lumeos.app |
| app | app.lumeos.app |
| coach | coach.lumeos.app |
| marketplace | marketplace.lumeos.app |
| admin | admin.lumeos.app |

### Git-Workflow
```
feature/branch → dev → main
     ↓           ↓      ↓
  Develop     Testing  Production
```

### Migration Status (Stand: 2026-02-24)
- Phase 1 (Monorepo Foundation): ✅ komplett
- Phase 2 (Core Shell): 🟡 ~85% (Cookie-Auth + Error Boundaries fehlen)
- Phase 3 (Module Migration Next.js): 🔴 ~2% (nur Nutrition Proof-of-Concept)
- Phase 4 (Advanced Modules): 🔴 0%
- Phase 5 (Vite Cleanup): 🔴 0%

**Aktuell laufen alle APIs weiterhin als Vite/Hono-Setup. Next.js-Migration in Progress.**
