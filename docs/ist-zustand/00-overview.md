# Ist-Zustand: LumeOS-Claude-V1

**Stand:** 2026-07-30 (v0.4 – korrigiert: DB-Sektion. Live-Schema liegt in `supabase/migrations/` (EAV-Core, Aliase, Kategorie-Hierarchie); `db/schema/nutrition.sql` ist ein **nicht verdrahteter** Diary-Entwurf. `supabase/` und `docs/project/` fehlten im Inventar; die Fachlogik-Dateiliste war falsch)
**Methode:** Read-only Scan (Glob/Grep/Read). Keine Shell-Kommandos ausgeführt (Shell in der Scan-Session nicht verfügbar), daher keine Build-/Test-Verifikation.
**Ausschlüsse:** Governance-Daten und Governance-Systemteile werden nicht inventarisiert: `system/` (Dispatcher, Control-Plane, State, Approval, Reports, Workorders), `apps/web/src/app/governance/` (10 Seiten), `apps/web/src/lib/governance/`, `apps/web/src/components/governance/`, `playwright.governance.config.ts`.

---

## 1. Repo-Grundgerüst

- **Monorepo:** Turborepo + pnpm 9, Node >= 20 (`package.json`)
- **Workspace-Deklaration:** `pnpm-workspace.yaml:2-5` deklariert `apps/*`, `services/*`, `packages/*`, `tools`
- **Realität:** Nur `apps/web` enthält Code. `services/` und `packages/` sind leer oder nicht vorhanden. `tools/` existiert laut Root-Doku, Inhalt nicht inventarisiert.
- **Root-Doku vorhanden:** `README.md`, `SESSION_ONBOARDING.md`, `STACK_REFERENCE.md`, `COMMANDS.md`, `LEAN-CTX.md`, `AGENTS.md`, `CLAUDE.md`

## 2. apps/web (einzige lebende App)

**Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, `@supabase/supabase-js` als Dependency deklariert (`apps/web/package.json`).

**Phase laut `README.md`:** 1B – Shell sichtbar, Nutrition read-only gegen lokale DB, keine Writes, kein Auth, keine Live-Userdaten.

### Routen (`src/app/**/page.tsx`, flach, keine Route Groups)

| Route | Tiefe | Bemerkung |
|---|---|---|
| `/` | Shell | `src/app/page.tsx`, `layout.tsx`, `globals.css` |
| `/dashboard` | **Mock** | Status-/Flow-Karten, read-only (`dashboard/page.tsx:5-25`) |
| `/nutrition` | **Mock** | Diary-Übersicht, verlinkt auf Foods |
| `/nutrition/foods` | **Echt** | Suche gegen lokale DB, Server-Component (`foods/page.tsx:47-68`) |
| `/nutrition/curation` | **Echt** | Admin-Kuration Kategorien/Tags/Aliase |
| `/nutrition/preferences` | Redirect | → `/nutrition/foods` |
| `/nutrition/local-schema` | **Echt** | Schema-Debug |
| `/goals` | **Mock** | Zielkarten/Body-Metrics als Platzhalter (`goals/page.tsx:5-20`) |
| `/medical` | **Mock** | Bewusst read-only, „no advice, no live records" (`medical/page.tsx:14-18`) |
| `/coach` | **Mock** | via `placeholder-page.tsx` |
| `/supplements` | **Mock** | via `placeholder-page.tsx` |
| `/recovery` | **Mock** | via `placeholder-page.tsx` |
| `/training` | **Mock** | via `placeholder-page.tsx` |
| `/settings` | **Mock** | via `placeholder-page.tsx` |
| `/governance/*` (10) | – | **ausgenommen** |

### API-Routen (`src/app/**/route.ts`)

6 Endpoints, alle unter `/api/nutrition/` (foods, foods/smart-preview, foods/categories, curation, preferences/catalog, local-schema) plus Governance-API (ausgenommen). Keine API-Routen für andere Module. Details: `01-nutrition.md` §2.

### Komponenten (`src/components/`)

- `shell/app-shell.tsx` – App-Shell
- `ui/` – `cards.tsx`, `page-header.tsx`, `status-badge.tsx`, `placeholder-page.tsx` (Mock-Renderer für coach, recovery, settings, supplements, training; definiert deren „coming"-Listen und Modul-Relationen, `placeholder-page.tsx:5-31`)
- `governance/GovernanceConsole.tsx` – **ausgenommen**

### Fachlogik (`src/lib/`)

- `nutrition/` – größter Codeblock (11 Fachlogik-Dateien + 12 Testdateien): Suche, Curation, Preferences (code-eingebetteter Katalog, keine DB-Persistenz), Nährstoff-Logik (Preview/Pin/Compare/Detail), Schema-Debug, Human-Layer-Gap-Analyse. DB-Zugriff über SQL gegen lokalen Docker-Container `supabase_db_LumeOS-Claude-V1` (`food-search.ts:6`), **nicht** über supabase-js. Details: `01-nutrition.md` §3.
- `governance/` – **ausgenommen**

### Tests

- Unit-Tests nur für Nutrition: `src/lib/nutrition/__tests__/` (12 Dateien)
- `playwright.config.ts` vorhanden, aber **kein** `e2e/`- oder `tests/`-Verzeichnis gefunden → E2E-Suite noch nicht befüllt

## 3. Datenbank

**Zwei parallele Schema-Stände – zentrale Befundlage:**

1. **Live-Schema (vom Code verwendet):** Schema `nutrition.*`, definiert in `supabase/migrations/`:
   - `20240522_001_nutrition_schema_foundation.sql`, `20240522_002_nutrition_food_core_tables.sql` (7 Tabellen: `nutrient_defs`, `food_categories` mit Hierarchie, `foods`, `food_nutrients` **EAV**, `food_aliases`, `tag_definitions`, `food_tags`)
   - Slices `20260513_001/002`, `20260514_001` (Erweiterungen, u.a. i18n th)
   - Control-Plane-Migrationen (20260423/20260424) = Governance, ausgenommen
   - Curation-Tabellen (`food_curation_candidates/decisions`, vom Code genutzt) sind in `supabase/migrations` **nicht** enthalten → Quelle offen
2. **Diary-Entwurf (NICHT verdrahtet):** `db/schema/nutrition.sql` + `db/migrations/20260423_001_nutrition_initial.sql` – eigenes Schema im `public`-Stil: `foods`, `food_portions`, `diary_days`, `meal_logs`, `meal_items`, `daily_nutrition_summaries`, **mit RLS und `auth.uid()`** (Supabase-typisch). Kein Code referenziert diese Tabellen.
3. `db/{local-dev,local-main,remote-dev,remote-main,contracts,seeds}` angelegt, bis auf `.gitkeep` leer.

**Befund:** Der Diary-Entwurf zeigt die Richtung (Supabase + RLS + Auth), steht aber isoliert neben dem Live-Core. Namens- und Strukturkonflikt: `foods` existiert in beiden Ständen mit unterschiedlichem Spaltenmodell (EAV vs. flache Makro-Spalten).

## 4. Spec ↔ Code

**Specs (`docs/specs`):** `00_MASTER_VISION.md`, Core-ADRs (AI Usage Wallet, Subscription Gates, Onboarding) und vollständige Spec-Pakete pro Modul (typisch SPEC_01 Module Contract bis SPEC_10 Components, teils plus Patches, ADRs, SQL).

| Modul | Spec | Code |
|---|---|---|
| Nutrition | **vollständig** (`Nutrition\01_current_specs\` SPEC_01–10, `02_patches\` 12 Patches, `03_sql\` Migration + Seed-Struktur, `04_adrs\` u.a. `ADR_BLS_ONLY.md`, BLS-Rohdaten unter `00_raw\`) | **echt** (read-only, Teilmenge der Spec). Detailabgleich: `01-nutrition.md` §6 |
| Goals | vorhanden (`Goals\` FEATURES, API, DATABASE, SCORING, PHASE_MODELS, OPEN_ITEMS, STRATEGY u.a.) | `/goals` nur Mock |
| BuddyandAICoach | vollständig (SPEC_01–10) | `/coach` nur Placeholder |
| Medical | vollständig (SPEC_01–10, inkl. Biomarker-Katalog SPEC_05) | `/medical` nur Mock |
| Marketplace | vollständig (SPEC_01–10, Wallet-Economics SPEC_05) | **keine Route** |
| HumanCoach | vollständig (SPEC_01–10, Coach-Workflows SPEC_05) | **keine Route** |
| Admin | mehrere Dokumente (`Admin\` u.a. `SPEC-ADMIN-BACKEND-v1.md`, UI-Design) | **keine App-Route** (nur Governance-Seiten, ausgenommen) |
| Dashboard | `Dashboard\dashmod.md` | `/dashboard` nur Mock |
| Supplements, Recovery, Training, Settings | keine Spec gefunden | Mocks |

**Kernbefund (korrigiert):** Nicht die Specs fehlen – der Code hinkt hinterher. 8 Module + Core sind spezifiziert; implementiert ist nur Nutrition, und dort nur eine Teilmenge (Search/Curation/Preferences ≈ SPEC_04/05/06-Basis). Spezifiziert, aber im Code nicht sichtbar: Scoring, Import-Pipeline, Custom Foods, Rezept-/Mealplan-Flows, Diary.

## 5. Diskrepanzen und offene Punkte

1. `pnpm-workspace.yaml` deklariert Bereiche, die nicht existieren (services, packages).
2. supabase-js deklariert, aber ungenutzt; Live-Code nutzt SQL gegen Docker-Container. Andererseits enthält der Diary-Entwurf (`db/schema/nutrition.sql`) RLS + `auth.uid()` – also Supabase-Zielbild. Pattern-Klärung hängt an der Architektur-Entscheidung.
3. Playwright-Config ohne E2E-Tests.
4. ~~Spec-Abdeckung asymmetrisch~~ → **korrigiert (v0.3):** Spec-Abdeckung ist breit; der Code hinkt hinterher. Offen bleibt der Code↔Spec-Detailabgleich für Nutrition.
5. ~~Umsetzungstiefe der Placeholder-Routen nicht geprüft~~ → **erledigt:** Alle 8 Nicht-Nutrition-Routen sind verifizierte Mocks (read-only, keine Live-Daten, keine Writes). Phase-1B-Aussage des README stimmt mit dem Code überein.
6. `tools/`, `infra/` nicht inventarisiert.

## 6. Nächste Schritte

- ~~`01-nutrition.md`~~ → erledigt.
- Weitere Moduldateien nach Bedarf (`02-goals.md` …) – da alle Nicht-Nutrition-Module Mock-Status haben, ist der Mehrwert gering; sinnvoller: Code↔Spec-Detailabgleich Nutrition oder erstes Modul von Mock auf echt heben.
- Build-/Test-Verifikation nachholen, sobald Shell verfügbar (`pnpm build`, `pnpm test`).
- Klären: supabase-js vs. Docker-Pattern (Entscheidung des Users).
