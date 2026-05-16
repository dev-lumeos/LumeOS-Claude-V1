# Human Coach Module — Spec Index
> LumeOS | Vollständige Spezifikation

---

## Dokument-Index

| Spec | Datei | Inhalt |
|---|---|---|
| — | `CONSOLIDATED_KNOWLEDGE.md` | Alle 10 Alt-Dokumente destilliert |
| 01 | `SPEC_01_MODULE_CONTRACT.md` | Zweck, Permission-System, Inputs/Outputs, Grenzen |
| 02 | `SPEC_02_ENTITIES.md` | 10 Core Entities (CoachProfile, Client, Permissions, ...) |
| 03 | `SPEC_03_USER_FLOWS.md` | 10 User Flows (Onboarding, Daily Review, Rule Builder, ...) |
| 04 | `SPEC_04_FEATURES.md` | 10 Features mit Implementierungsdetails + Code |
| 05 | `SPEC_05_COACH_WORKFLOWS.md` | Typische Workflows (Standard, Prep, Nutrition, Strength) |
| 06 | `SPEC_06_DATABASE_SCHEMA.md` | Vollständiges SQL (10 Tabellen, Views, Permission Trigger) |
| 07 | `SPEC_07_API.md` | Alle Endpoints inkl. Client-seitiger API |
| 08 | `SPEC_08_IMPORT_PIPELINE.md` | Rule Templates Seed, Autonomy Constants, Onboarding Setup |
| 09 | `SPEC_09_SCORING.md` | Client Status, Risk Level, Adherence, Rule Engine, Performance |
| 10 | `SPEC_10_COMPONENTS.md` | Coach App + Client-View: 40+ Components, 14 Hooks, 2 Stores |

---

## Kern-Prinzipien (archiviert)

| Prinzip | Bedeutung |
|---|---|
| **Client-Ownership** | Alle Daten gehören dem Client. Coach liest nur mit Permission. |
| **Read-only Coach** | Coach schreibt keine User-Daten. Nur Vorschläge via Client-Confirmation. |
| **Permission-First** | Jeder API-Call prüft Permission. Keine Ausnahmen. Middleware. |
| **Medical = none by Default** | Sensitiv. Explizite Freigabe erforderlich. Kein Opt-out vergessen. |
| **Client App = Lumeos App** | Kein Doppel-Tracking. Game Changer vs. Trainerize. |
| **GDPR-konform** | Consent-Log aller Freigaben. Widerruf jederzeit möglich. |

---

## Permission Matrix

| Modul | Default | Upgrade durch | Bemerkung |
|---|---|---|---|
| training | full | — | Standard für alle Coaches |
| nutrition | full | — | Standard |
| recovery | summary | Client | Volle HRV-Daten sensitiv |
| supplements | full | — | Standard |
| **medical** | **none** | **Client (explizit)** | **Höchst sensitiv!** |
| goals | full | — | Standard |
| body_metrics | summary | Client | Fotos sehr sensitiv |

---

## Kompetitiver Vorteil

| Kriterium | Trainerize | TrueCoach | Everfit | PT Distinction | **LumeOS** |
|---|:---:|:---:|:---:|:---:|:---:|
| Training | ✅ | ✅ (Best) | ✅ | ✅ | ✅ |
| Nutrition (138 BLS) | ❌ | ❌ | 🟡 | 🟡 | **✅** |
| Recovery/HRV | ❌ | ❌ | ❌ | ❌ | **✅** |
| Supplements | ❌ | ❌ | ❌ | ❌ | **✅** |
| Bloodwork | ❌ | ❌ | ❌ | ❌ | **✅** |
| AI Clone | ❌ | ❌ | ❌ | ❌ | **✅** |
| Marketplace | ❌ | ❌ | ❌ | ❌ | **✅** |
| Kein Doppel-Tracking | ❌ | ❌ | ❌ | ❌ | **✅** |
| Preis (Coach/mo) | $5–25 | $19–99 | $15–50 | $25–75 | **$29–99** |

---

## Cron Jobs Übersicht

| Job | Zeitplan | Beschreibung |
|---|---|---|
| `daily-rule-processing` | Täglich 06:00 | Rules für alle Coach-Client-Paare auswerten |
| `daily-adherence-calc` | Täglich 23:30 | Adherence Summary aus Modul-APIs berechnen |
| `weekly-checkin-dispatch` | Mo 08:00 | Check-ins an Clients mit Autonomy 1–3 senden |
| `daily-alert-cleanup` | Täglich 03:00 | Abgelaufene Alerts archivieren |
| `dashboard-cache-refresh` | Alle 5 Min | `coach_dashboard_cache` Materialized View refreshen |

---

## Offene Punkte

| # | Beschreibung | Priorität |
|---|---|---|
| 1 | Voice Notes im Chat | 🟡 |
| 2 | Video Call Integration (Zoom/Meet Embed) | 🟡 |
| 3 | Auto-Reminders für Check-ins | 🟡 |
| 4 | AI Clone Engine (Coach-Methode als 24/7 AI) | 🟡 |
| 5 | Multi-Coach / Team Support | 🟡 |
| 6 | Client Onboarding Wizard | 🟡 |
| 7 | Coach Branding | 🟢 |
| 8 | Coach Directory | 🟢 |

---

## Technologie-Stack

| Layer | Tech |
|---|---|
| API | Hono.js, Port 5600, TypeScript |
| Database | Supabase PostgreSQL, Schema `coach` |
| Coach App | Next.js 15 (apps/coach/, Port 8502) |
| Client View | Integriert in apps/app/ |
| Permission Engine | Middleware + DB-Level RLS |
| Rule Engine | TypeScript (Rule Evaluation pure functions) |
| Auth | JWT — Coach-Role Check bei jedem Coach-Endpoint |
| Scoring | packages/scoring/src/human-coach.ts |
| Contracts | packages/contracts/src/human-coach/ |
| i18n | DE/EN/TH (280+ Keys) |
| Cron | 5 Jobs (Rule Processing, Adherence, Checkins, Cleanup, Cache) |
