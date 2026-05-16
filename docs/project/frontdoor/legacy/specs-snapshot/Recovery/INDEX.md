# Recovery Module — Spec Index
> LumeOS | Vollständige Spezifikation

---

## Dokument-Index

| Spec | Datei | Inhalt |
|---|---|---|
| — | `CONSOLIDATED_KNOWLEDGE.md` | Alle 12 Alt-Dokumente destilliert |
| 01 | `SPEC_01_MODULE_CONTRACT.md` | Zweck, Inputs/Outputs, Modul-Grenzen, Wearable-Tiers |
| 02 | `SPEC_02_ENTITIES.md` | 10 Core Entities (Checkin, Score, HRV, Sleep, Modality, ...) |
| 03 | `SPEC_03_USER_FLOWS.md` | 10 User Flows (Check-in, Score, Muscle Map, HRV, Deload, ...) |
| 04 | `SPEC_04_FEATURES.md` | 10 Features mit Regeln und Implementierungsdetails |
| 05 | `SPEC_05_METRICS_ALGORITHMS.md` | Score-Formel (3 Modi), Muscle Recovery Curve, HRV Baseline, ACWR |
| 06 | `SPEC_06_DATABASE_SCHEMA.md` | Vollständiges SQL (10 Tabellen, Trigger, Views, RLS) |
| 07 | `SPEC_07_API.md` | Alle API Endpoints mit Request/Response-Schemas |
| 08 | `SPEC_08_IMPORT_PIPELINE.md` | Seed Scripts: Protokolle, Muscle Params, Wearable Config |
| 09 | `SPEC_09_SCORING.md` | Scoring Engine: Pure Functions, Muscle Recovery, Übertraining |
| 10 | `SPEC_10_COMPONENTS.md` | Frontend: Pages, Components (38), Hooks (16), Stores, i18n |

---

## Kern-Entscheidungen (archiviert)

| Entscheidung | Begründung |
|---|---|
| **Morning Check-in <30s** | Tägliche Compliance nur machbar wenn extrem schnell |
| **Kein Wearable als Pflicht** | 90%+ der User haben keines. Self-Report + Cross-Module reicht für sinnvollen Score |
| **3 Score-Modi (manual/hrv/wearable)** | Progressive Enhancement — Score wird besser mit mehr Daten, nie schlechter ohne |
| **Muscle-Specific Recovery** | Einzigartiges Feature — kein Competitor. Training-Modul liefert die Daten. |
| **ACWR für Training Load Score** | Industry Standard (Banister Model), evidenzbasiert |
| **Trigger: Score nach Checkin berechnen** | Score immer aktuell nach Eingabe — kein manuelles Refreshing |
| **Modality Bonus capped bei 5** | Verhindert Score-Manipulation durch excessive Logging |
| **Übertraining: Signal-Kombination** | Einzelne Signale = normal, Kombination = Problem. Robuster als Einzel-Threshold |
| **Apple HealthKit + Google Health first** | 2 Integrationen decken ~90% der Wearable-User |
| **Schema `recovery` isoliert** | Kein direktes Cross-Schema-Join — alles via API |

---

## Kompetitiver Vorteil

| Feature | WHOOP | Oura | Garmin | HRV4Training | **LumeOS** |
|---|:---:|:---:|:---:|:---:|:---:|
| Recovery Score | ✅ | ✅ (Readiness) | ✅ (Body Battery) | 🟡 | ✅ |
| Sleep Tracking | ✅ | ✅ (Best) | ✅ | ❌ | ✅ |
| HRV | ✅ | ✅ | ✅ | ✅ | ✅ (Phone!) |
| **Muscle-Specific Recovery** | ❌ | ❌ | ❌ | ❌ | **✅** |
| **Training Integration** | 🟡 Strain | ❌ | 🟡 | ❌ | **✅ Deep** |
| **Nutrition Integration** | ❌ | ❌ | ❌ | ❌ | **✅** |
| Bloodwork Integration | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Kein Wearable nötig** | ❌ | ❌ | ❌ | ✅ | **✅** |
| Preis | $30/mo + Band | $6/mo + Ring $299 | $0 + $300 Watch | $10/yr | **$9.99/mo** |

---

## Offene Punkte

| # | Beschreibung | Priorität |
|---|---|---|
| 1 | Phone Camera HRV gescaffolded — vollständig implementieren | 🟡 |
| 2 | WHOOP Direct API + Oura Direct API (Phase 2) | 🟡 |
| 3 | Recovery Protocol Templates Library ausbauen | 🟡 |
| 4 | Sleep Quality Auto-Detection via Wearable vollständig | 🟡 |
| 5 | Community Recovery Insights (anonymisiert) | 🟢 |
| 6 | Garmin Body Battery Sync | 🟢 |
| 7 | Coach-Access: Coach sieht Recovery-Trends des Clients | 🟡 |

---

## Technologie-Stack

| Layer | Tech |
|---|---|
| API | Hono.js, Port 5400, TypeScript |
| Database | Supabase PostgreSQL, Schema `recovery` |
| Auth | JWT via globalAuthMiddleware |
| Scoring | packages/scoring/src/recovery.ts (Pure Functions, 3 Modi) |
| Contracts | packages/contracts/src/recovery/ |
| Frontend | Next.js 15, React, Zustand, TanStack Query |
| Body Map | react-body-highlighter (SVG Silhouette, 18 Muskelgruppen) |
| Wearable | Apple HealthKit (iOS) + Google Health Connect (Android) |
| HRV Phone | PPG via Camera API (60s Messung) |
| i18n | DE/EN/TH (250+ Keys) |
