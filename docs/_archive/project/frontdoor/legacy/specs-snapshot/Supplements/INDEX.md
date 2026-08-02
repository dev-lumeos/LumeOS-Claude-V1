# Supplements Module — Spec Index
> LumeOS | Vollständige Spezifikation

---

## Dokument-Index

| Spec | Datei | Inhalt |
|---|---|---|
| — | `CONSOLIDATED_KNOWLEDGE.md` | Alle 22 Alt-Dokumente destilliert |
| 01 | `SPEC_01_MODULE_CONTRACT.md` | Zweck, Inputs/Outputs, Modul-Grenzen, Enhanced Mode Sicherheit |
| 02 | `SPEC_02_ENTITIES.md` | 9 Core Entities (Supplement, EnhancedSubstance, UserStack, StackItem, IntakeLog, ...) |
| 03 | `SPEC_03_USER_FLOWS.md` | 10 User Flows (Suchen, Stack, Daily Intake, Interactions, Gap Analysis, Enhanced) |
| 04 | `SPEC_04_FEATURES.md` | 10 Features (Catalog, Intelligence Engine, Interaction Checker, Scoring, ...) |
| 05 | `SPEC_05_CATALOG_EVIDENCE.md` | Evidence-Grades, Seed-Daten S/A/B/C/D, Goal Templates, Timing-Regeln, Nutrient Mapping |
| 06 | `SPEC_06_DATABASE_SCHEMA.md` | Vollständiges SQL (10 Tabellen, Trigger, View, RLS, Grants) |
| 07 | `SPEC_07_API.md` | Alle API Endpoints mit Request/Response-Schemas |
| 08 | `SPEC_08_IMPORT_PIPELINE.md` | Seed Scripts (SQL): Catalog, Enhanced, Interactions, Templates |
| 09 | `SPEC_09_SCORING.md` | Scoring Engine: Evidence-weighted Compliance, Gap Score, Interaction Risk, Cycling |
| 10 | `SPEC_10_COMPONENTS.md` | Frontend Components, Hooks, Stores, i18n |

---

## Kern-Entscheidungen (archiviert)

| Entscheidung | Begründung |
|---|---|
| **Kuratierte DB (nicht NIH DSLD)** | Kontrolle über Evidence Grades, kein Datenmüll, rechtlich einfacher |
| **Evidence Grade S-F** | Transparenz für User — nicht alle Supplements sind gleich. Differenzierung vs. Mitbewerber. |
| **Evidence-gewichteter Score** | Vergessenes Creatine (S) = mehr Malus als vergessenes Glutamin (D). Realer Wert. |
| **Nur 1 aktiver Stack** | Vereinfacht Daily Tracking massiv. User weiß immer was heute fällig ist. |
| **Standard/Enhanced Hard-Separated** | Rechtliche Absicherung. Enhanced nie als Default. Kein versehentliches Sehen. |
| **Interaction Checker regelbasiert** | Kein AI-Feeling. Deterministische Regeln. Critical = BLOCK. Sicherheit über alles. |
| **nutrients_provided mit BLS-Codes** | Echte Mikronährstoff-Summierung mit Nutrition-Modul. Basis für Gap Analysis. |
| **Gap Analysis aus echtem Food Log** | USP: Statt Quiz-Schätzung (Mitbewerber) → echte 138 BLS-Mikronährstoffe. 10× besser. |
| **Training-Aware Timing** | Einziges Modul im Markt das Training-Typ kennt → Pre/Post Stack automatisch. |
| **Cycling via JSONB** | Flexibles On/Off Schema, keine komplexe State Machine. Deterministisch berechnet. |

---

## Intelligence Engine (USP-Übersicht)

| Feature | Mitbewerber | LumeOS |
|---|---|---|
| Gap Analysis | Quiz-Schätzung | **Echte BLS-Daten (138 Mikros)** |
| Redundancy Detection | ❌ | **✅ Ingredient Overlap** |
| Training-Aware Timing | ❌ | **✅ Leg Day → anderer Stack** |
| Meal-Based Timing | Geschätzt | **✅ Echte Meal-Zeiten** |
| Effectiveness Tracking | ❌ | **✅ via Medical Bloodwork** |
| Cost Optimizer | ❌ | **✅ Redundancy Savings** |

---

## Offene Punkte

| # | Beschreibung | Priorität |
|---|---|---|
| 1 | Barcode-Scanner für Inventory (Produkt einscannen) | 🟡 |
| 2 | Supplement-Food Interactions (Eisen + Kaffee, Vitamin D + Milch) | 🟡 |
| 3 | Marketplace-Integration (Supplement-Produkte direkt kaufen) | 🟡 |
| 4 | Ablaufdatum-Tracking mit Erinnerung | 🟡 |
| 5 | Effectiveness Tracking (Medical Integration komplett) | 🟡 |
| 6 | Supplement Brand DB (spezifische Produkte mit COA) | 🟢 |
| 7 | Community Stack-Sharing | 🟢 |
| 8 | AI Supplement Advisor (Smart Empfehlungen via Buddy) | 🟢 |

---

## Technologie-Stack

| Layer | Tech |
|---|---|
| API | Hono.js, Port 5300, TypeScript |
| Database | Supabase PostgreSQL, Schema `supplements` |
| Auth | JWT via globalAuthMiddleware |
| Search | pg_trgm (Trigram-Index, <100ms) |
| Scoring | packages/scoring/src/supplements.ts (Pure Functions) |
| Contracts | packages/contracts/src/supplements/ |
| Frontend | Next.js 15, React, Zustand, TanStack Query |
| i18n | DE/EN/TH (350+ Keys) |
| Enhanced | Strikte RLS-Policy: enhanced_mode = true erforderlich |
