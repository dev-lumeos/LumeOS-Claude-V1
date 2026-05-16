# Human Coach Module — Übersicht

Das Human Coach Module ist die B2B/B2C-Seite von LumeOS — ein professionelles Dashboard für Personal Trainer und Coaches mit vollständiger Integration aller Client-Daten.

**Kern-Innovation:** Client nutzt die normale Lumeos App. Coach bekommt ein Dashboard-Overlay. Kein Doppel-Tracking.

---

## Architektur

```
Frontend
  apps/coach/                   # Separates Coach-Frontend (Next.js, Port 8502)
  apps/app/modules/human-coach/ # Client-seitige Ansicht (Permissions + Chat)

API Layer (Hono, Port 5600)
  src/api/human-coach/
    └── routes/
        ├── dashboard.ts     (Summary, Clients, Activity Feed, Metrics)
        ├── clients.ts       (Client Management, Full Profile)
        ├── alerts.ts        (Alert Lifecycle, Bulk Actions)
        ├── rules.ts         (Rule Builder, Test, Templates)
        ├── autonomy.ts      (Level Management, History)
        ├── adherence.ts     (Analytics, Trends, Predictions)
        ├── permissions.ts   (Client Permission Management)
        ├── programs.ts      (Training + Nutrition Program Builder)
        ├── messages.ts      (In-App Chat)
        ├── checkins.ts      (Check-in Templates, Auto-Checkins)
        └── for-client.ts    (Client-seitige Ansicht)

Database (PostgreSQL)
  Schema: coach.*
  Tabellen: 14 Core-Tabellen
  VIEWs: coach_dashboard_summary, client_risk_assessment
  Materialized: coach_dashboard_cache
```

---

## Tech Stack

| Layer | Technologie |
|---|---|
| Frontend (Coach) | Next.js 15, React, Zustand, TailwindCSS, TanStack Query |
| Frontend (Client) | Integriert in Lumeos App |
| API | Hono (TypeScript), Port 5600 |
| Datenbank | PostgreSQL (Supabase), Schema `coach` |
| Permissions | RLS + Permission Tables |
| i18n | DE/EN/TH (280+ Keys) |

---

## Permission System (Kern-Sicherheit)

```typescript
interface CoachPermissions {
  client: UserId;
  coach: CoachId;
  access: {
    training:    'full' | 'summary' | 'none';
    nutrition:   'full' | 'summary' | 'none';
    recovery:    'full' | 'summary' | 'none';
    supplements: 'full' | 'summary' | 'none';
    medical:     'full' | 'summary' | 'none';  // Sensitiv!
    goals:       'full' | 'summary' | 'none';
    bodyMetrics: 'full' | 'summary' | 'none';
  };
  expiresAt?: Date;  // Time-limited Access Tokens möglich
}
```

---

## Verbindungen zu anderen Modulen

| Modul | Coach liest (mit Permission) | Coach schreibt |
|---|---|---|
| **Nutrition** | Food Log, Macros, 138 Mikronährstoffe, Adherence | Nutrition Plan → Client |
| **Training** | Sessions, Volume, PRs, Balance | Routine → Client |
| **Recovery** | Recovery Score, HRV, Sleep | Recovery Guidelines |
| **Supplements** | Stack, Compliance, Interactions | Supplement Protocol |
| **Medical** | Bloodwork Trends, Meds (sensitiv) | — (kein Schreiben) |
| **Goals** | Phase, TDEE, Progress, Trajectory | Goal-Adjustments via Client |

**Regel:** Coach liest niemals direkt aus anderen Modul-Schemata. Immer über Permission-API.

---

## Dokumentations-Index

| Datei | Inhalt |
|---|---|
| `FEATURES.md` | Alle Features mit Status und Code-Referenzen |
| `DATABASE.md` | Vollständiges DB-Schema |
| `API.md` | Alle API-Endpoints |
| `COMPONENTS.md` | Frontend: Coach Dashboard + Client-View Components |
| `SCORING.md` | Adherence-Algorithmen, Autonomy-Scores, Risk Assessment |
| `STRATEGY.md` | Marktanalyse, Personas, USPs, Business Model |
| `OPEN_ITEMS.md` | Bugs, geplante Features, offene Fragen |
