# Lumeos Platform Architecture — Systemweite Definitionen

**Date:** 2026-02-17
**Status:** Aligned mit LUMEOS_OVERVIEW.md

---

## 6-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│          Next.js 14 · TypeScript · Tailwind CSS · Zustand    │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                     AI Coach Layer                           │
│     Input: DashboardOverview | Output: Text + Actions        │
│                  KEIN direkter DB-Zugriff                    │
│     (3 Varianten dokumentiert: Rules-First / LLM / Hybrid)   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                    Rules Engine Layer                         │
│         ruleset.v1.json | Konsumiert Aggregates              │
│              Erzeugt: Alerts + Protocol Outputs              │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                  Aggregation Layer (Read)                     │
│       Scores (0-100) · Flags · Trends · Status               │
│              Pure Functions, Deterministic                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                    Actions Layer (Write)                      │
│       Einzige Stelle für DB-Writes · Validiert Input         │
│              Prüft Permissions · Audit Logged                │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                      Data Layer (DB)                         │
│            Supabase (PostgreSQL + Auth + Storage)             │
│                 RLS erzwingt user_id Scope                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Komponente | Technologie |
|------------|-------------|
| **Monorepo** | pnpm workspaces + Turborepo |
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **State (Client)** | Zustand |
| **State (Server)** | TanStack Query |
| **API** | Hono (TypeScript-native, Edge-ready) |
| **Datenbank** | Supabase (Postgres + Auth + Storage + RLS) |
| **Testing** | Vitest (Unit), Playwright (E2E) |
| **Vision AI** | Claude Vision API (MealCam) |
| **i18n** | DE / EN / TH |

---

## Monorepo-Struktur

```
LUMEOS/
├── apps/
│   ├── web/           # Marketing/Landing → :5000
│   ├── platform/      # User App → :5001
│   ├── admin/         # Admin Panel → :5002
│   └── api/           # Backend API (Hono) → :5100
│
├── packages/
│   ├── contracts/     # Shared TypeScript Types
│   ├── rules-engine/  # Regelprüfung (Pure Functions)
│   ├── scoring/       # Score-Berechnung (Pure Functions)
│   ├── evaluator/     # Orchestrator (AI Coach ↔ Rules ↔ Aggregation)
│   ├── db/            # Supabase Client + Types
│   └── ui/            # Shared UI Components
│
├── docs/              # Dokumentation
├── imports/           # Import-Daten (BLS, USDA, etc.)
├── supabase/          # Migrations, Seed, Config
├── tools/             # Development Tools
└── specs/             # Architektur-Specs
```

---

## API-Prinzipien

1. **Writes nur über Actions/Endpoints** — Keine direkten DB-Writes aus UI
2. **Alle Queries sind user-scoped** — RLS erzwingt Isolation
3. **Keine magischen Side Effects** — Explizite Operationen
4. **Audit Logged** — Jede Write-Action wird geloggt
5. **i18n-fähig** — DE/EN/TH Support

---

## Payment & Wallet System

**Kernprinzip: Abo = Wallet-Guthaben. Revenue = Transaktionsgebühren.**

Vollständiges Konzept: → `system/wallet-and-monetization.md`

```
User zahlt Abo → Guthaben im Wallet
User bezahlt ALLES über Wallet (Gym, Trainer, Supplements, AI, Marketplace)
Lumeos verdient an jeder Transaktion (% TBD)
AI-Features (MealCam, AI Coach) = Micro-Transactions aus Wallet
B2B zahlt Infrastruktur-Gebühr + Transaktionsgebühr
```

---

## B2B Supplement Vendor — Chargen & COA

```sql
-- Supplement Product Batches
CREATE TABLE vendor_product_batches (
  id UUID PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id),
  product_id UUID REFERENCES marketplace_products(id),
  batch_number TEXT NOT NULL,
  manufactured_at DATE,
  expires_at DATE,
  quantity INTEGER,
  status TEXT DEFAULT 'active', -- active, recalled, expired
  created_at TIMESTAMPTZ
);

-- Certificate of Analysis
CREATE TABLE vendor_coa_reports (
  id UUID PRIMARY KEY,
  batch_id UUID REFERENCES vendor_product_batches(id),
  lab_name TEXT NOT NULL,
  tested_at DATE,
  report_url TEXT,             -- Storage URL (Supabase Storage)
  results JSONB,               -- {heavy_metals: pass, microbial: pass, potency: {claimed: 500, actual: 487}}
  verified BOOLEAN DEFAULT false, -- Lumeos-verifiziert
  created_at TIMESTAMPTZ
);
```

---

## Module-Map (12 Module)

| # | Modul | Typ | Status (laut Overview) |
|---|-------|-----|----------------------|
| 1 | Nutrition 🍎 | Kern | MVP ✅ |
| 2 | Training 🏋️ | Kern | MVP ✅ |
| 3 | Supplements 💊 | Kern | MVP ✅ |
| 4 | Recovery 😴 | Kern | MVP ✅ |
| 5 | Medical 🩺 | Kern | v1 ✅ |
| 6 | Dashboard 📊 | System | MVP ✅ |
| 7 | AI Coach 🤖 | System | MVP ✅ (Daily Summary) |
| 8 | Coach 👨‍🏫 | B2C/B2B | v1 ✅ |
| 9 | Gym 🏢 | B2B | v1.5 🔄 |
| 10 | Marketplace 🛒 | B2B/B2C | v2 📋 |
| 11 | B2B Supplements 🏭 | B2B | v2 📋 |
| 12 | Goals 🎯 | System | Neu (Research-basiert) |
| 13 | Enhanced Supplements 💉 | Kern (Opt-in) | Eigenständig (Research-Entscheidung) |

**Hinweis:** Goals und Enhanced Supplements sind in der LUMEOS_OVERVIEW.md nicht als eigenständige Module geführt. Basierend auf Tom's Entscheidung bleiben beide als separate Module in der Research/Planung.

---

## Roadmap (aus Overview + Research)

| Phase | Status | Inhalt |
|-------|--------|--------|
| MVP | ✅ | Nutrition, Training, Supplements, Recovery, Dashboard, AI Coach Daily Summary |
| v1 | ✅ | Medical, Coach, Audit Logs, Permissions |
| v1.5 | 🔄 | Gym Tenant, Member Assignment, Program Distribution |
| v2 | 📋 | Marketplace, Vendor (B2B), Licensing, Payouts, Goals Module |
| v2.5 | 📋 | Full Tests, Performance, Observability, Enhanced Supplements |
| v3 | 📋 | Automation, Task Scheduling, Autopilot Proposals, Full AI Coach |

---

*Stand: 2026-02-17*
