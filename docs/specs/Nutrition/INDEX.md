# Nutrition Module — Spec Index
> LumeOS | Vollständige Spezifikation

---

## Dokument-Index

| Spec | Datei | Inhalt |
|---|---|---|
| 01 | `SPEC_01_MODULE_CONTRACT.md` | Zweck, Inputs/Outputs, Modul-Grenzen, Sprachen, API-Übersicht |
| 02 | `SPEC_02_ENTITIES.md` | 21 Core Entities, DB-Schema-Übersicht, Snapshot-Prinzip |
| 03 | `SPEC_03_USER_FLOWS.md` | 14 User Flows inkl. Food Search, Ghost Entry, MealPlan Lifecycle |
| 04 | `SPEC_04_FEATURES.md` | 15 Features mit Regeln und Implementierungsdetails |
| 05 | `SPEC_05_FOOD_TAXONOMY.md` | Kategorie-Baum (4 Ebenen), Semantic Tags (~100), sort_weight, Canonical Names |
| 06 | `SPEC_06_DATABASE_SCHEMA.md` | Vollständiges SQL — alle Tabellen, Indexes, Triggers, RLS, Grants |
| 07 | `SPEC_07_API.md` | Alle API Endpoints mit Request/Response-Schemas |
| 08 | `SPEC_08_IMPORT_PIPELINE.md` | BLS 4.0 Import: Python-Skripte, Parsing, sort_weight, Canonical Names |
| 09 | `SPEC_09_SCORING.md` | Scoring Engine: TypeScript Pure Functions, Edge Cases, Unit Tests |
| 10 | `SPEC_10_COMPONENTS.md` | Frontend: Pages, Components, Hooks, Stores, Types, i18n |

---

## Kern-Entscheidungen (archiviert)

| Entscheidung | Begründung |
|---|---|
| **Nur BLS 4.0** als Food-Datenquelle | Beste Datenqualität (138 Nährstoffe), CC BY 4.0, kein Merge-Overhead |
| **EAV-Hybrid** für Nährstoffe | `foods` flat (Search), `food_nutrients` EAV (volle Tiefe), `meal_items` Snapshot |
| **Snapshot-Prinzip** in meal_items | Vollständige Nährstoffe eingefroren — historische Daten bleiben korrekt |
| **Kein automatisches Ghost-Entry-Expiry** | User entscheidet jederzeit — auch retroaktiv |
| **Weight Logs → Goals** (nicht Nutrition) | Körpergewicht ist ein Goal-Datenpunkt |
| **Water Target → Goals** | Goals berechnet wissenschaftlich aus allen Modulen |
| **MealPlan universelles Schema** | user/coach/marketplace/buddy — identische Tabelle |
| **Shopping Lists** in Nutrition | Direkt aus Rezept-Zutaten generiert |
| **3-sprachig** (DE/EN/TH) | TH initial NULL, später befüllbar |
| **Custom Foods getrennt** von BLS | Keine Durchmischung, eigene Tabelle |
| **sort_weight 0–1000** | Einmalig beim Import, deterministisch |

---

## Offene Punkte (für spätere Phasen)

| # | Thema | Beschreibung |
|---|---|---|
| 1 | SPEC_06 Fixes | name_th in food_categories, openfoodfacts aus foods_custom.source entfernen, Shopping Lists SQL |
| 2 | MealCam Real | Claude Vision API anschliessen (aktuell: Spec definiert, Implementierung offen) |
| 3 | Buddy MealPlan Builder | Buddy erstellt Pläne auf User-Anweisung (source: 'buddy') |
| 4 | Barcode Scanner | Kamera-Scan für Custom Food Erstellung |
| 5 | BLS Update Mechanismus | Wenn BLS 5.0 erscheint — Migration-Strategie |
| 6 | TH Übersetzungen | Thai-Texte initial leer, Phase 2 |
| 7 | Marketplace Rezepte | Rezepte kaufen und als Quelle zuweisen |
| 8 | Recipe Sharing | is_public Flag vorhanden, UI/API noch nicht spezifiziert |
| 9 | Semantic Tags Phase 2+3 | gluten/nuts/soy, halal/kosher |
| 10 | Smart Scale Integration | Gewicht-Sync (in Goals, nicht Nutrition) |

---

## Technologie-Stack

| Layer | Tech |
|---|---|
| API | Hono.js, Port 5100, TypeScript |
| Database | Supabase PostgreSQL, Schema `nutrition` |
| Auth | JWT via globalAuthMiddleware |
| Search | pg_trgm (Trigram-Index, <100ms) |
| Scoring | packages/scoring (Pure Functions, testbar) |
| Contracts | packages/contracts/src/nutrition/ |
| Frontend | Next.js 15, React, Zustand, TanStack Query |
| AI | Claude Vision API (MealCam) |
| i18n | DE/EN/TH (400+ Keys) |
