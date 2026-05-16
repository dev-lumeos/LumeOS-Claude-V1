# Medical Module — Übersicht

Das Medical-Modul ist ein regelbasiertes Monitoring-System für Gesundheitsmarker, Blutwerte und Biomarker in LumeOS. Es verbindet Bloodwork mit Nutrition, Supplements, Training und Recovery.

**Medical ist KEIN Arzt.** Keine Diagnosen, keine Therapiepläne, keine Dosierungsempfehlungen.

---

## Architektur

```
Frontend (Next.js)
  apps/app/app/(app)/medical/
    └── page.tsx              # 5-Tab Layout
  apps/app/modules/medical/
    ├── components/  (32+ Components)
    ├── hooks/       (16 Custom Hooks)
    ├── stores/      (2 Zustand Stores)
    └── types/       (8 Type Definitions)

API Layer (Hono, Port 5800)
  src/api/medical/
    ├── server.ts
    └── routes/
        ├── biomarkers.ts      (Katalog, Detail, History)
        ├── lab-results.ts     (CRUD, OCR Import)
        ├── health-metrics.ts  (System Scores)
        ├── symptoms.ts        (Symptom Tracking)
        ├── medications.ts     (Rx + OTC + Monitoring)
        ├── insights.ts        (Cross-Module Insights)
        ├── trends.ts          (Statistik, Korrelationen)
        ├── reports.ts         (Doctor Export PDF)
        ├── alerts.ts          (Medical Alerts)
        └── for-ai.ts / for-goals.ts

Shared Packages
  packages/contracts/src/medical/
  packages/scoring/src/medical.ts

Database (PostgreSQL / Supabase)
  Schema: medical.*
  Tabellen: 10 Core-Tabellen
  VIEWs: user_latest_biomarkers (Materialized), user_health_dashboard_summary
```

---

## Tech Stack

| Layer | Technologie |
|---|---|
| Frontend | Next.js 15, React, Zustand, TailwindCSS, TanStack Query |
| API | Hono (TypeScript), Port 5800 |
| Datenbank | PostgreSQL (Supabase), Schema `medical` |
| OCR | Claude Vision API (PDF + Foto → Biomarker-Werte) |
| Standards | LOINC, RxNorm, FHIR R4, OpenFDA |
| Reporting | PDF Generation (Doctor Export) |
| i18n | DE/EN/TH (280+ Keys) |

---

## Privacy-Architektur (Medical = sensitivste Daten)

| Tier | Default? | Beschreibung |
|---|---|---|
| Local-First | ✅ Default | SQLite on device, kein Cloud-Sync, Zero-Knowledge |
| E2E Cloud | Opt-in | User hält Schlüssel, Lumeos sieht keine Daten |
| Provider Sharing | Opt-in | Zeitbegrenzte Tokens, selektiv per Biomarker-Kategorie |

---

## Verbindungen zu anderen Modulen

| Modul | Datenfluss |
|---|---|
| **Nutrition** | Deficiency Alerts → Food-Empfehlungen (Ferritin → Eisen-reiche Foods) |
| **Supplements** | Biomarker-Verlauf → Supplement Effectiveness Tracking |
| **Training** | CRP ↑ → Trainingsvolumen-Warnung; Cortisol ↑ → Overtraining |
| **Recovery** | Cortisol, CRP → Recovery Score Modifier |
| **Goals** | System Scores (Cardio, Metabolic, ...) → Goal Progress |
| **Buddy** | Biomarker-Kontext für evidenzbasierte Erklärungen |
| **Enhanced Supps** | Pflicht-Bloodwork-Panel (30+ Marker Pre/Mid/Post Cycle) |

---

## Dokumentations-Index

| Datei | Inhalt |
|---|---|
| `FEATURES.md` | Alle Features mit Status und Code-Referenzen |
| `DATABASE.md` | Vollständiges DB-Schema (10 Tabellen, Views, Funktionen) |
| `API.md` | Alle API-Endpoints |
| `COMPONENTS.md` | Frontend: 32 Components, 16 Hooks, 2 Stores |
| `BIOMARKER_DATABASE.md` | Biomarker-Katalog, 9 Kategorien, Optimal Ranges, Seed-Daten |
| `SCORING.md` | System Scores, Alerting, Trend-Algorithmen |
| `STRATEGY.md` | Marktanalyse, Personas, USPs, Key Decisions |
| `OPEN_ITEMS.md` | Bugs, geplante Features, offene Fragen |
