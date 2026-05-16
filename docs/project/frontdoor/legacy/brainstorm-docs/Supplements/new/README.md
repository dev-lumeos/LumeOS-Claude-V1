# Supplements Module — Übersicht

Das Supplements-Modul verwaltet Supplement-Stacks, Intake-Tracking, Interaction-Checking und zielbasierte Empfehlungen in LumeOS.

---

## Architektur

```
Frontend (Next.js)
  apps/app/app/(app)/supplements/
    └── page.tsx              # 5-Tab Layout + Enhanced Mode
  apps/app/modules/supplements/
    ├── components/  (35+ Components)
    ├── hooks/       (18 Custom Hooks)
    ├── stores/      (2 Zustand Stores)
    └── types/       (8 Type Definitions)

API Layer (Hono, Port 5300)
  src/api/supplements/
    ├── server.ts
    └── routes/
        ├── catalog.ts        (Supplement-DB Search, Detail)
        ├── enhanced.ts       (PED-DB — Enhanced Mode only)
        ├── stacks.ts         (CRUD, Activate)
        ├── items.ts          (Items in Stack)
        ├── intake.ts         (Daily Logging, Generate, Compliance)
        ├── interactions.ts   (Interaction Checker)
        ├── inventory.ts      (Bestand, Low-Stock)
        ├── intelligence.ts   (Gap Analysis, Redundancy, Timing, Cost)
        ├── analytics.ts      (Compliance History, Kosten)
        └── for-ai.ts / for-goals.ts

Shared Packages
  packages/contracts/src/supplements/
  packages/scoring/src/supplements.ts

Database (PostgreSQL / Supabase)
  Schema: supplements.*
  Tabellen: 10 Core-Tabellen
  View: daily_intake_summary
```

---

## Tech Stack

| Layer | Technologie |
|---|---|
| Frontend | Next.js 15, React, Zustand, TailwindCSS, TanStack Query |
| API | Hono (TypeScript), Port 5300 |
| Datenbank | PostgreSQL (Supabase), Schema `supplements` |
| Search | pg_trgm Trigram-Index |
| Scoring | Pure Functions (packages/scoring) — Evidence-gewichtet |
| i18n | DE/EN/TH (350+ Keys) |

---

## Zwei Modi

| Modus | Aktivierung | Datensatz |
|---|---|---|
| **Standard** | Default | `supplements.supplement_catalog` |
| **Enhanced** | Explizites Opt-In + Age Check | `supplements.enhanced_substances` |

Enhanced Mode ist First-Class, aber strikt getrennt — nie in Standard-Flows gemischt.

---

## Verbindungen zu anderen Modulen

| Modul | Datenfluss |
|---|---|
| **Nutrition** | nutrients_provided JSONB → Mikronährstoff-Summierung; Food Log → Gap Analysis |
| **Goals** | Compliance Score → Goal Progress |
| **Training** | Workout-Typ → Training-Aware Stack (Pre/Post) |
| **Medical** | Supplement-Logs → Biomarker-Korrelationen (Effectiveness Tracking) |
| **Marketplace** | Supplement-Produkte kaufbar, Affiliate-Links |
| **Coach (Buddy)** | Stack-Analyse, Defizit-Empfehlungen, Timing-Reminders |

---

## Dokumentations-Index

| Datei | Inhalt |
|---|---|
| `FEATURES.md` | Alle Features mit Status und Code-Referenzen |
| `DATABASE.md` | Vollständiges DB-Schema (10 Tabellen, Trigger, View, RLS) |
| `API.md` | Alle API-Endpoints |
| `COMPONENTS.md` | Frontend: 35 Components, 18 Hooks, 2 Stores |
| `SUPPLEMENT_DATABASE.md` | Catalog Architektur, Evidence-System, Enhanced Taxonomy |
| `SCORING.md` | Evidence-gewichteter Score, Interaction Risk, Cycling |
| `STRATEGY.md` | Marktanalyse, Personas, USPs, Key Decisions |
| `OPEN_ITEMS.md` | Bugs, geplante Features, offene Fragen |
