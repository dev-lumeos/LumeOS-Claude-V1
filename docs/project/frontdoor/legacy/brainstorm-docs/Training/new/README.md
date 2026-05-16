# Training Module — Übersicht

Das Training-Modul ist das zentrale System für Workout-Management, Exercise-Datenbank, Progressive Overload und Analytics in LumeOS.

---

## Architektur

```
Frontend (Next.js)
  apps/app/app/(app)/training/
    ├── page.tsx              # 4-Tab Layout (Workouts/Routines/Exercises/Stats)
    └── exercises/[id]/page.tsx
  apps/app/modules/training/
    ├── components/  (38+ Components)
    ├── hooks/       (20 Custom Hooks)
    ├── stores/      (3 Zustand Stores)
    └── types/       (8 Type Definitions)

API Layer (Hono, Port 5200)
  src/api/training/
    ├── server.ts
    └── routes/
        ├── exercises.ts      (Search, Detail, Muscle Groups, Equipment)
        ├── routines.ts       (CRUD, Duplicate, Coach/Marketplace)
        ├── sessions.ts       (History, Detail)
        ├── sessions-live.ts  (Start, Log Sets, Complete)
        ├── sets.ts
        ├── progression.ts    (Suggestions, Config, ACWR)
        ├── records.ts        (Personal Records)
        ├── analytics.ts      (Volume, Balance, Landmarks)
        ├── schedule.ts       (Wochenplan)
        ├── feedback.ts       (Post-Workout)
        ├── landmarks.ts      (Volume Landmarks)
        └── for-ai.ts / for-goals.ts / for-recovery.ts

Shared Packages
  packages/contracts/src/training/
  packages/scoring/src/training.ts

Database (PostgreSQL / Supabase)
  Schema: training.*
  Tabellen: 16 Core-Tabellen
  VIEWs: weekly_volume_summary, muscle_readiness
```

---

## Tech Stack

| Layer | Technologie |
|---|---|
| Frontend | Next.js 15, React, Zustand, TailwindCSS, TanStack Query |
| API | Hono (TypeScript), Port 5200 |
| Datenbank | PostgreSQL (Supabase), Schema `training` |
| Search | pg_trgm Trigram-Index |
| Scoring | Pure Functions (packages/scoring) |
| Media | Cloudflare R2 (~15 GB, 4.645 Bilder + 2.363 Videos) |
| i18n | DE/EN/TH (300+ Keys) |

---

## Verbindungen zu anderen Modulen

| Modul | Datenfluss |
|---|---|
| **Goals** | Training Adherence + Strength Progress → Goal Contribution |
| **Recovery** | Training Load → Recovery Score; Readiness → Training Intensity |
| **Nutrition** | Workout-Datum + Volume → TDEE-Anpassung |
| **Supplements** | Workout-Typ → Pre/Post Stack |
| **Medical** | Biomarker-Warnungen → Training Restrictions |
| **Coach (AI)** | Session Data → Post-Workout Analysis |
| **Human Coach** | Coach-assigned Routines → Client |

---

## Dokumentations-Index

| Datei | Inhalt |
|---|---|
| `FEATURES.md` | Alle Features mit Status und Code-Referenzen |
| `DATABASE.md` | Vollständiges DB-Schema (16 Tabellen, Views, Trigger) |
| `API.md` | Alle API-Endpoints mit Request/Response |
| `COMPONENTS.md` | Frontend: 38 Components, 20 Hooks, 3 Stores |
| `EXERCISE_DATABASE.md` | Exercise-DB Architektur, Import-Pipeline, sort_weight |
| `SCORING.md` | Training Score, 1RM-Formeln, Progression Models, ACWR |
| `STRATEGY.md` | Marktanalyse, Personas, USPs, Key Decisions |
| `OPEN_ITEMS.md` | Bugs, geplante Features, offene Fragen |
