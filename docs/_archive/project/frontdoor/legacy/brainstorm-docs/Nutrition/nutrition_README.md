# Nutrition Module

## Übersicht

Das Nutrition Module ist das Kern-Modul für Ernährungs-Tracking in Lumeos. Es bietet umfassendes Food-Logging, Makro-/Mikronährstoff-Tracking, AI-gestützte Meal-Erkennung und personalisierte Ernährungsempfehlungen.

## Architektur

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (Next.js App)                                  │
│  apps/app/app/(app)/nutrition/                           │
│  apps/app/modules/nutrition/                             │
│    ├── components/  (41 Components)                      │
│    ├── hooks/       (22 Custom Hooks)                    │
│    ├── stores/      (3 Zustand Stores)                   │
│    └── types/       (6 Type Definitions)                 │
├─────────────────────────────────────────────────────────┤
│  API Layer (Hono)                                        │
│  src/api/nutrition/                                      │
│    ├── server.ts    (Route mounting, CORS, Auth)         │
│    ├── index.ts     (Bootstrap, DB init)                 │
│    ├── db.ts        (Postgres via shared/create-db)      │
│    ├── store.ts     (In-memory fallback store)           │
│    └── routes/      (14 Route modules)                   │
├─────────────────────────────────────────────────────────┤
│  Shared Packages                                         │
│    ├── packages/contracts/src/nutrition/ (TypeScript)     │
│    └── packages/scoring/src/nutrition.ts (Score Calc)    │
├─────────────────────────────────────────────────────────┤
│  Database (PostgreSQL/Supabase)                          │
│    ├── Schema: nutrition.*                                │
│    ├── Compat Views: public.* → nutrition.*              │
│    └── 15+ Tables, 1 Materialized View                  │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technologie |
|-------|-------------|
| Frontend | Next.js 14, React, Zustand, TailwindCSS |
| API | Hono (Node.js), Port 5100 |
| Database | PostgreSQL (Supabase), `nutrition` Schema |
| Validierung | Zod |
| Auth | JWT via `globalAuthMiddleware` |
| Food-DB | BLS 4.0 (7140+ Foods, 98 Nährstoffe) |
| AI | Claude Vision (MealCam), Smart Search |
| Scoring | Custom weighted formula (packages/scoring) |

## Module-Dateien

| Pfad | Beschreibung |
|------|-------------|
| `src/api/nutrition/` | Backend API (14 Route-Module) |
| `apps/app/app/(app)/nutrition/` | Page Routes (3 Seiten) |
| `apps/app/modules/nutrition/` | Feature Module (41 Components, 22 Hooks) |
| `packages/contracts/src/nutrition/` | Shared TypeScript Contracts |
| `packages/scoring/src/nutrition.ts` | Score-Berechnung |
| `supabase/migrations/` | 15+ Nutrition-relevante Migrationen |

## Feature-Übersicht

- **Food Database** — 7140+ BLS 4.0 Lebensmittel, 98 Nährstoffe, Smart Search
- **Meal Tracking** — Mahlzeiten loggen mit Makro-/Mikronährstoff-Berechnung
- **MealCam** — AI-basierte Mahlzeit-Erkennung per Kamera/Foto
- **Water Tracking** — Tägliche Wasseraufnahme mit Quick-Add
- **Weight Tracking** — Gewichtsverlauf mit Trend-Analyse
- **Nutrition Targets** — TDEE-basierte Ziele mit Macro Cycling
- **Nutrition Score** — Gewichteter Score (0-100) pro Tag
- **Recipes** — Rezept-Builder mit Per-Serving Macros
- **Meal Plans** — Ghost-Meal-Entries, Confirm/Skip/Adjust
- **Custom Foods** — User-erstellte Lebensmittel + Barcode
- **Food Preferences** — Diät-Typ, Allergien, Likes/Dislikes
- **Smart Search** — Preference-aware Search mit DB-Level Scoring
- **Insights** — Trends, Heatmaps, Deficit Suggestions
- **Pre-Workout Optimizer** — AI-powered Trainingsmahlzeit-Empfehlungen

## Verwandte Dokumentation

- [API.md](./API.md) — Alle Endpoints
- [FEATURES.md](./FEATURES.md) — Feature-Details mit Code-Referenzen
- [COMPONENTS.md](./COMPONENTS.md) — Frontend Components
- [DATABASE.md](./DATABASE.md) — Schema + Relations
- [MIGRATION.md](./MIGRATION.md) — Alte Docs konsolidiert

## Status

- **Sprint 1:** ~95% fertig
- **API Port:** 5100
- **Food DB:** 7140+ Foods (BLS 4.0)
- **Schema:** `nutrition.*` (seit Migration 071)
- **Known Bugs:** Custom Foods 500-Bug (`:id` catches "custom"), Micro-Dashboard 0-values
