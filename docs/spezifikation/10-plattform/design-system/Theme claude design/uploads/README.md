# Goals Module — Übersicht

Das Goals-Modul ist der **zentrale Aggregation Point** von LumeOS. Es ist kein weiteres Feature-Modul — es ist der Betriebssystem-Kern um den alle anderen Module rotieren.

---

## Architektur

```
Frontend (Next.js)
  apps/app/app/(app)/goals/
    └── page.tsx              # Multi-Tab Dashboard
  apps/app/modules/goals/
    ├── components/  (30+ Components)
    ├── hooks/       (18 Custom Hooks)
    ├── stores/      (2 Zustand Stores)
    └── types/       (8 Type Definitions)

API Layer (Hono, Port 5900)
  src/api/goals/
    ├── server.ts
    └── routes/
        ├── goals.ts           (CRUD Goals, Active Goals)
        ├── phases.ts          (Phase State Machine)
        ├── tdee.ts            (Adaptive TDEE)
        ├── progress.ts        (Cross-Module Progress)
        ├── contributions.ts   (Eingehend von anderen Modulen)
        ├── milestones.ts      (Meilensteine + Feiern)
        ├── predictions.ts     (Achievement Probability)
        ├── measurements.ts    (Body Composition Klassisch)
        ├── circumferences.ts  (Umfang-Messungen)
        ├── photos.ts          (Visual AI Progress)
        ├── adjustments.ts     (Auto-Adjustments)
        ├── weekly-report.ts   (Wöchentlicher Report)
        └── for-ai.ts / for-coach.ts

Shared Packages
  packages/contracts/src/goals/
  packages/scoring/src/goals.ts

Database (PostgreSQL / Supabase)
  Schema: goals.*
  Tabellen: 10 Core-Tabellen
  VIEWs: user_goal_dashboard, weekly_contributions_summary
```

---

## Tech Stack

| Layer | Technologie |
|---|---|
| Frontend | Next.js 15, React, Zustand, TailwindCSS, TanStack Query |
| API | Hono (TypeScript), Port 5900 |
| Datenbank | PostgreSQL (Supabase), Schema `goals` |
| TDEE | Adaptive Algorithmus (MacroFactor-inspiriert) |
| Phase Engine | TypeScript State Machine |
| Body Comp | react-body-highlighter, Charts (Recharts) |
| Visual AI | Claude Vision API (Pose-Analyse) |
| i18n | DE/EN/TH (320+ Keys) |

---

## Goals als Betriebssystem-Kern

```
Nutrition   ─┐
Training    ─┤  Contribution  ──→  Goals (5900)  ──→  Overall Progress
Recovery    ─┤  Scores             Aggregation        + Bottleneck
Supplements ─┤                     Engine             + Predictions
Medical     ─┘
                                        ↓
                              Buddy / Coach empfängt
                              Goal-Context für
                              alle Empfehlungen
```

---

## Verbindungen zu anderen Modulen

| Modul | Goals bekommt | Goals gibt |
|---|---|---|
| **Nutrition** | Daily Score, Macro Compliance | TDEE-Ziele, Phase-Macros |
| **Training** | Volume Progress, Strength Gains | Frequenz-Empfehlung, Deload |
| **Recovery** | Recovery Score, Readiness | Rest-Day-Empfehlung |
| **Supplements** | Compliance Score | Phase-Stack-Prioritäten |
| **Medical** | System Scores, Marker | Health Goal Targets |
| **Coach (Buddy)** | — | Goal-Status, Bottleneck, Trajectory |

---

## Dokumentations-Index

| Datei | Inhalt |
|---|---|
| `FEATURES.md` | Alle Features mit Status und Code-Referenzen |
| `DATABASE.md` | Vollständiges DB-Schema |
| `API.md` | Alle API-Endpoints |
| `COMPONENTS.md` | Frontend: 30 Components, 18 Hooks, 2 Stores |
| `PHASE_MODELS.md` | Goal Phase State Machine, alle 7 Phasen, Transition Logic |
| `SCORING.md` | Adaptive TDEE, Cross-Module Aggregation, Progress Score |
| `STRATEGY.md` | Marktanalyse, Personas, USPs, Key Decisions |
| `OPEN_ITEMS.md` | Bugs, geplante Features, offene Fragen |
