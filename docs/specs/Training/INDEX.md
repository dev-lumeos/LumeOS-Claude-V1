# Training Module — Spec Index
> LumeOS | Vollständige Spezifikation

---

## Dokument-Index

| Spec | Datei | Inhalt |
|---|---|---|
| — | `CONSOLIDATED_KNOWLEDGE.md` | Alle 12 Alt-Dokumente destilliert |
| 01 | `SPEC_01_MODULE_CONTRACT.md` | Zweck, Inputs/Outputs, Grenzen, Storage |
| 02 | `SPEC_02_ENTITIES.md` | 16 Core Entities (Exercise, Routine, Session, Set, PR, ...) |
| 03 | `SPEC_03_USER_FLOWS.md` | 13 User Flows (Library, Routine Builder, Live Workout, ...) |
| 04 | `SPEC_04_FEATURES.md` | 12 Features (Exercise Library, Progression Engine, ...) |
| 05 | `SPEC_05_EXERCISE_TAXONOMY.md` | Muscle Hierarchy, Equipment, Eval Scores, sort_weight |
| 06 | `SPEC_06_DATABASE_SCHEMA.md` | Vollständiges SQL (16 Tabellen, Trigger, Views, Grants) |
| 07 | `SPEC_07_API.md` | Alle API Endpoints mit Request/Response-Schemas |
| 08 | `SPEC_08_IMPORT_PIPELINE.md` | Excel → DB Import Pipeline (Python, SQL) |
| 09 | `SPEC_09_SCORING.md` | Scoring Engine (Training Score, 1RM, Progression, Balance) |
| 10 | `SPEC_10_COMPONENTS.md` | Frontend Components, Hooks, Stores, i18n |

---

## Kern-Entscheidungen (archiviert)

| Entscheidung | Begründung |
|---|---|
| **Keine Custom Exercises** | 1.200+ Übungen sind ausreichend für alle Gym-Use-Cases |
| **Speed-First Set-Logging** | Strong's #1 USP ist Speed — Logging in <3 Sekunden |
| **Unbegrenzte Routinen (Free)** | Strong's #1 Kritikpunkt: 3-Routine-Limit — direkte Differenzierung |
| **exercise_type + tracking_type** | Sauber trennen: was es ist vs. was geloggt wird |
| **Exercise Evaluation Scores** | Einzigartiges Feature (von Alpha Progression inspiriert) im Markt |
| **Feedback-Loop** | Pump/Soreness → personalisierte Volume Landmarks (von RP Hypertrophy) |
| **5 Progression-Modelle** | Linear (Beginner) bis DUP (Advanced) — für alle Niveaus |
| **Snapshot-Prinzip in WorkoutSet** | estimated_1rm/volume_kg beim Einfügen berechnet und eingefroren |
| **Weekly Volume Summary als VIEW** | Performance-kritische Abfrage immer via View, nicht ad-hoc |
| **3-sprachig (DE/EN/TH)** | 1.850/1.850 Instructions bereits übersetzt — TH fertig |
| **Schema `training` isoliert** | Kein anderes Modul schreibt direkt in das Schema |
| **4-Tab UX (Workouts/Routines/Exercises/Stats)** | Klare Trennung der 3 Archetypen + Analytics |
| **Routine Quellen unified** | user/coach/marketplace/buddy → identisches Schema |
| **Gym-Modul separat** | B2B-Gym-Management ist ein eigenes Modul, nicht Teil von Training |

---

## Kompetitiver Vorteil (Key Differentiators)

| Feature | Market | LumeOS |
|---|---|---|
| Exercise Library | 300–400 (Strong/Hevy) | **1.200+ mit Eval Scores** |
| Male + Female Bilder | ❌ überall | **✅ 4.645 Bilder** |
| DE/EN/TH Lokalisierung | ❌ | **✅ vollständig** |
| Unbegrenzte Routinen | ❌ Strong (3 max) | **✅ kostenlos** |
| Exercise Evaluation Scores | ❌ ausser Alpha | **✅** |
| Feedback-Loop (Pump/Soreness) | ❌ ausser RP | **✅** |
| Volume Landmarks (MV/MAV/MRV) | ❌ ausser RP | **✅** |
| Nutrition × Training Integration | ❌ | **✅ Deep** |
| Recovery × Training | ❌ | **✅** |
| Goals × Training | ❌ | **✅** |

---

## Offene Punkte

| # | Beschreibung | Priorität |
|---|---|---|
| 1 | Marketplace-Integration: Routine als Produkt kaufbar | 🟡 |
| 2 | Videos für restliche 10 Kategorien (Chest, Legs, etc.) | 🟡 |
| 3 | Drag & Drop Reorder im Routine Builder | 🟡 |
| 4 | Offline-Workout (SQLite-Cache + Service Worker) | 🟡 |
| 5 | Wave + DUP + RPE Modelle: API vorhanden, UI pending | 🟡 |
| 6 | Apple Watch Standalone-Logging | 🟢 |
| 7 | Community Routine Sharing | 🟢 |
| 8 | Wearable-Integration (HR, GPS) | 🟢 |
| 9 | 3D Exercise Models (Phase 3) | 🟢 |
| 10 | Form Check via Computer Vision | 🟢 |

---

## Technologie-Stack

| Layer | Tech |
|---|---|
| API | Hono.js, Port 5200, TypeScript |
| Database | Supabase PostgreSQL, Schema `training` |
| Auth | JWT via globalAuthMiddleware |
| Search | pg_trgm (Trigram-Index, <50ms) |
| Scoring | packages/scoring/src/training.ts (Pure Functions) |
| Contracts | packages/contracts/src/training/ |
| Frontend | Next.js 15, React, Zustand, TanStack Query |
| Media | Cloudflare R2 (~15 GB Images + Videos) |
| Live State | Redis (geplant, aktuell React Context) |
| i18n | DE/EN/TH (300+ Keys, TH vollständig) |
