# Nutrition Module — Übersicht

Das Nutrition-Modul ist das Kern-Tracking-System für Ernährung in LumeOS. Es bietet umfassendes Food-Logging, Makro-/Mikronährstoff-Tracking, KI-gestützte Meal-Erkennung und personalisierte Ernährungsempfehlungen. Alle Scores und Empfehlungen sind auf das Goals-Modul ausgerichtet.

---

## Architektur

```
Frontend (Next.js)
  apps/app/app/(app)/nutrition/
    ├── page.tsx              # Hauptseite (5-Tab Layout)
    ├── water/page.tsx        # Water Tracking
    └── weight/page.tsx       # Weight Tracking
  apps/app/modules/nutrition/
    ├── components/  (41 Components)
    ├── hooks/       (22 Custom Hooks)
    ├── stores/      (3 Zustand Stores)
    ├── types/       (6 Type Definitions)
    └── data/        (nutrientDetails.ts — 42+ Mikros, 3 Sprachen)

API Layer (Hono, Port 5100)
  src/api/nutrition/
    ├── server.ts    (Route-Mounting, CORS, Auth)
    ├── index.ts     (Bootstrap, DB-Init)
    ├── db.ts        (Postgres, search_path: nutrition,public)
    ├── store.ts     (In-Memory Fallback für BLS Foods)
    └── routes/      (14 Route-Module)

Shared Packages
  packages/contracts/src/nutrition/   (TypeScript Interfaces)
  packages/scoring/src/nutrition.ts   (Score-Berechnung)

Database (PostgreSQL / Supabase)
  Schema:        nutrition.*
  Compat-Views:  public.* → nutrition.*
  Tabellen:      19+ Tabellen
  Key View:      daily_nutrition_summary (Materialized)
```

---

## Tech Stack

| Layer | Technologie |
|---|---|
| Frontend | Next.js 14, React, Zustand, TailwindCSS, TanStack Query |
| API | Hono (TypeScript-native), Port 5100 |
| Datenbank | PostgreSQL (Supabase), Schema `nutrition` |
| Validierung | Zod |
| Auth | JWT via `globalAuthMiddleware` |
| Food-DB | BLS 4.0 (7.140+ Foods, 138 Nährstoffe) |
| Suche | pg_trgm Trigram-Index (Postgres-native) |
| KI | Claude Vision API (MealCam) |
| Scoring | Custom weighted formula (packages/scoring) |

---

## Verbindungen zu anderen Modulen

| Modul | Datenfluss |
|---|---|
| **Goals** | Nutrition Score + Macro-Compliance fließen in Goal-Progress ein |
| **Coach (AI)** | Liest Daily Summary via `/api/nutrition/for-ai` für Empfehlungen |
| **Supplements** | Supplement-Nährstoffe ergänzen Mikronährstoff-Tracking (Gap-Analyse) |
| **Medical** | Nutrition-Daten für Biomarker-Korrelationen; Bloodwork → Deficiency Alerts |
| **Training** | Pre-Workout Optimizer; TDEE-Anpassung nach Training-Intensität |
| **Recovery** | Sleep/HRV → Nutrition-Timing-Empfehlungen (z.B. Magnesium abends) |

---

## Dokumentations-Index

| Datei | Inhalt |
|---|---|
| `FEATURES.md` | Alle Features mit Status und Code-Referenzen |
| `DATABASE.md` | Vollständiges DB-Schema (19+ Tabellen, Views, Trigger) |
| `API.md` | Alle 14 API-Route-Module mit Endpoints |
| `COMPONENTS.md` | Frontend: 41 Components, 22 Hooks, 3 Stores |
| `FOOD_DATABASE.md` | BLS 4.0 Architektur, Merge-Logik, Semantic Tags |
| `TDEE_SCORING.md` | TDEE-Formeln, Nutrition Score, Macro-Targets |
| `STRATEGY.md` | Marktanalyse, Personas, USPs, Monetisierung |
| `OPEN_ITEMS.md` | Bekannte Bugs, Features in Planung, offene Fragen |
