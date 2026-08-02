# Recovery Module — Übersicht

Das Recovery-Modul monitort Erholung, Schlafqualität und Stress und gibt datenbasierte Empfehlungen für optimale Trainingsperformance. Es schützt vor Übertraining und maximiert Adaptation.

---

## Architektur

```
Frontend (Next.js)
  apps/app/app/(app)/recovery/
    └── page.tsx              # 4-Tab Layout
  apps/app/modules/recovery/
    ├── components/  (38 Components)
    ├── hooks/       (16 Custom Hooks)
    ├── stores/      (2 Zustand Stores)
    └── types/       (8 Type Definitions)

API Layer (Hono, Port 5400)
  src/api/recovery/
    ├── server.ts
    └── routes/
        ├── checkin.ts         (Morning Check-in, UPSERT)
        ├── score.ts           (Recovery Score, Trend)
        ├── muscle-map.ts      (Muscle Recovery Map)
        ├── hrv.ts             (HRV Logging, Baseline)
        ├── sleep.ts           (Sleep Data)
        ├── modalities.ts      (Recovery Activities)
        ├── insights.ts        (Trends, Patterns, 7d/30d)
        ├── alerts.ts          (Übertraining Alerts)
        ├── protocols.ts       (Recovery Protokolle)
        ├── training-load.ts   (Eingehend vom Training-Modul)
        ├── readiness.ts       (Ausgehend ans Training-Modul)
        └── for-ai.ts / for-goals.ts / pending-actions.ts

Shared Packages
  packages/contracts/src/recovery/
  packages/scoring/src/recovery.ts

Database (PostgreSQL / Supabase)
  Schema: recovery.*
  Tabellen: 10 Core-Tabellen
  VIEWs: weekly_recovery_stats (Materialized), muscle_readiness, modality_effectiveness
```

---

## Tech Stack

| Layer | Technologie |
|---|---|
| Frontend | Next.js 15, React, Zustand, TailwindCSS, TanStack Query |
| API | Hono (TypeScript), Port 5400 |
| Datenbank | PostgreSQL (Supabase), Schema `recovery` |
| Body Map | react-body-highlighter (SVG Silhouette, 18 Muskelgruppen) |
| Wearable | Apple HealthKit (iOS) + Google Health Connect (Android) — Tier 1 |
| HRV Phone | PPG via Camera (60s, scaffolded) |
| Scoring | Pure Functions in packages/scoring |
| i18n | DE/EN/TH (250+ Keys) |

---

## Score-Modi

| Modus | Verfügbarkeit | HRV-Gewicht |
|---|---|---|
| **manual** | Immer (MVP) | Kein HRV |
| **hrv** | Mit HRV-Messung | 25% |
| **wearable** | Mit Wearable-Daten | 25% + Sleep Stages |

Score verbessert sich mit mehr Daten — verschlechtert sich nie ohne.

---

## Verbindungen zu anderen Modulen

| Modul | Input | Output |
|---|---|---|
| **Training** | Training Load (POST /training-load) | Readiness Score + Muscle Map (GET /readiness) |
| **Nutrition** | Nutrition Compliance → Recovery Score | Recovery-Nutrition Insights |
| **Medical** | CRP, Cortisol, Testosteron → Score Modifier | Recovery Impact von Biomarkern |
| **Goals** | — | Recovery Compliance Score |
| **Buddy** | — | Recovery Status + Empfehlungen |
| **Supplements** | — | Recovery-Supplement Insights |

---

## Dokumentations-Index

| Datei | Inhalt |
|---|---|
| `FEATURES.md` | Alle Features mit Status und Code-Referenzen |
| `DATABASE.md` | Vollständiges DB-Schema (10 Tabellen, Trigger, Views, RLS) |
| `API.md` | Alle API-Endpoints |
| `COMPONENTS.md` | Frontend: 38 Components, 16 Hooks, 2 Stores |
| `METRICS.md` | Recovery Score Formel (3 Modi), Muscle Recovery Curve, HRV Baseline, ACWR |
| `STRATEGY.md` | Marktanalyse, Personas, USPs, Key Decisions |
| `OPEN_ITEMS.md` | Bugs, geplante Features, offene Fragen |
