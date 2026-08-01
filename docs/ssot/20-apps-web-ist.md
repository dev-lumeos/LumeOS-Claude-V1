# apps/web — Ist-Zustand

**Stand:** 2026-08-01
**Methode:** `[cmd]` Datei-Inventar über `src/app`, `src/lib`, `__tests__`, `e2e`;
Greps auf Importe, Schreibzugriffe, Runtime-Exports; `[read]` zitierte Stellen
selbst gelesen. Typecheck-Ergebnis übernommen aus `10-workspace.md`
(`[cmd]` dort, 2026-08-01: 17/17 grün).

---

## Kurzfassung

`apps/web` ist eine Next.js-14-Shell mit genau **einem echten Fachmodul-Ausschnitt**:
drei Nutrition-Seiten lesen read-only aus der lokalen Docker-DB. Alles andere ist
statische Attrappe — einschließlich des Nutrition-Diary-Einstiegs. Daneben lebt
eine Governance-Konsole, die Repo-Skripte unter `system/` ausführt.

---

## Routen-Inventar

`[cmd]` 2026-08-01: **24 Seiten** (`page.tsx`), **8 API-Routen** (`route.ts`),
**1 Layout** (`src/app/layout.tsx`). Keine dynamischen Segmente, kein
`loading.tsx`/`error.tsx`/`not-found.tsx`, keine Route Groups.

### Echt — Daten aus der lokalen DB (read-only)

| Route | Beleg |
|---|---|
| `/nutrition/foods` | `[read]` `foods/page.tsx:98` async, Z. 112–113 `getLocalFoodSearch()` + `getPreferenceSearchPreview()` |
| `/nutrition/curation` | `[read]` ruft `getNutritionCurationData()` (`lib/nutrition/curation.ts:310`) |
| `/nutrition/local-schema` | `[read]` ruft `getLocalNutritionSchemaDebug()` |
| 6 Nutrition-API-Routen | `[cmd]` alle mit `export const dynamic = 'force-dynamic'`; 5 davon zusätzlich `runtime = 'nodejs'` (nötig für `child_process`); `preferences/catalog` ohne runtime-Export (kein DB-Zugriff) |

`[cmd]` Grep 2026-08-01: **kein einziges `INSERT`/`UPDATE`/`DELETE`** in
`lib/nutrition` (außerhalb des Test-DDL) — Phase 1B read-only ist im Code belegt.

### Echt — aber Shell-Ausführung statt DB

| Route | Beleg |
|---|---|
| `/governance` + 9 Unterrouten (approvals, batches, doctor, dossiers, learning, promotion, runtime, settings, workorders) | `[read]` je 5-Zeilen-Wrapper um `GovernanceConsole`; die API-Route `command` führt via `command-runner.ts` (`spawn`, Z. 1) TS-Skripte unter `system/` aus — u. a. `system/workorders/cli/run-batch-operator.ts`, `system/control-plane/promotion-governance.ts` (Z. 50–90) |

### Mock / statisch

| Route | Beleg |
|---|---|
| `/` | `[annahme]` Re-Export des Dashboards (aus Agentenbericht, nicht einzeln geprüft) |
| `/dashboard` | `[read]` hartkodierte Arrays `focusRows`/`flowItems`, Badges `Demo / Mock`, `Read-only` (Z. 5–25) |
| `/nutrition` — **der Diary-Einstieg** | `[read]` hartkodiert: `macroStrip` alle `current: '0'`, `mealSlots` alle `state: 'leer'`, Badge `Nicht live` (Z. 5–38). Das Spec-Kernstück Diary ist reine Attrappe. |
| `/goals`, `/medical` | `[read]`/`[cmd]` hartkodierte Blöcke, 0 async/fetch/DB-Aufrufe |
| `/training`, `/recovery`, `/supplements`, `/coach`, `/settings` | `[read]` (training) + `[cmd]` (Grep): je 5 Zeilen `<PlaceholderPage />` |
| `/nutrition/preferences` | `[read]` nur `redirect('/nutrition/foods')` |

Auch die App-Shell zeigt Literale statt Daten: `[read]`
`app-shell.tsx:77` `'Nutrition · 117 Nährstoffe · BLS 10.840 · Candidate'`,
Z. 381 fest `Offline · 0 queued`.

---

## Die DB-Zugriffsmechanik — zentraler Befund

**Kein DB-Client.** `[cmd]` Grep 2026-08-01: null Importe von
`@supabase/supabase-js`, `@supabase/ssr`, `createClient`, `createBrowserClient`,
`createServerClient` in ganz `src/`. Beide Supabase-Dependencies sind tot.

Stattdessen: SQL-String bauen → `docker exec` auf den lokalen Container.
`[read]` `food-search.ts:653–656`:

```ts
await execFileAsync(
  'docker',
  ['exec', LOCAL_DB_CONTAINER, 'psql', '-U', 'postgres', '-d', 'postgres', '-At', '-c', sql],
  { maxBuffer: 1024 * 1024 * 10 },
)
```

`[cmd]` Die Konstante `LOCAL_DB_CONTAINER = 'supabase_db_LumeOS-Claude-V1'` ist
in 4 Dateien hartkodiert (`food-search.ts`, `curation.ts`, `local-schema-debug.ts`,
`preference-search-preview.ts`); `docker`-Aufrufe an 5 Stellen. Keine
`process.env`-Konfiguration, kein Pooling, keine Parametrisierung — Escaping
hängt an den `build*Sql`-Helfern.

**Konsequenzen:** Die App läuft nur auf einer Maschine mit laufendem Docker und
exakt diesem Container-Namen. Ein Deployment ist strukturell unmöglich.
Architekturfrage dazu: TODO D-08.

---

## `src/lib` — 16 Dateien

### `lib/nutrition` (10)

| Datei | Tut | Zugriff |
|---|---|---|
| `food-search.ts` | Such-SQL über `foods`, `food_categories` (rekursiv), `food_tags`, `food_nutrients`; `getLocalFoodSearch()` (Z. 645), `getLocalFoodCategories()` | Docker/psql |
| `curation.ts` | Kurations-Daten; Lese-SQL mit `to_regclass`-Guards (Z. 284–288); enthält zusätzlich das Curation-DDL inline (Z. 156, nur vom Test aufgerufen — siehe `30-datenbank.md`) | Docker/psql |
| `local-schema-debug.ts` | Schema-Introspektion (Spalten, Indizes, Row-Counts) | Docker/psql |
| `preference-search-preview.ts` | präferenzgewichtete Such-Preview; markiert sich selbst: `[read]` Z. 8 `LABEL_POLICY = 'preference_preview_local_only_not_production_smart_search'` | Docker/psql |
| `preferences-catalog.ts` | Katalog als Code-Literal; `[read]` Z. 42–43 `source: 'old_platform_screenshots_and_current_specs'`, `write_policy: 'read_only_catalog_no_user_persistence'` | keiner |
| `human-layer-gap-analysis.ts` | baut nur SQL-Strings; `[annahme]` von keiner Seite/Route importiert (Agentenbefund, nicht selbst gegrept) | keiner |
| `nutrient-preview-filter.ts`, `nutrient-detail-selection.ts`, `nutrient-detail-link.ts`, `nutrient-pin-compare.ts` | reine Filter-/Link-/Vergleichshelfer | keiner |

### `lib/governance` (6)

`command-runner.ts` (spawnt `process.execPath` auf `system/`-Skripte),
`command-allowlist.ts` (erlaubte Actions + Verbotsliste), `snapshot.ts`,
`status.ts`, `redact.ts`, `repo-root.ts`.

**Kopplung an `system/`:** `[read]` `snapshot.ts:8` —
`import { getProjectProfile } from '../../../../../system/project-profiles/project-profile-loader'`.
Das ist ein **statischer TS-Import über die App-Grenze hinweg**: ohne `system/`
bricht der Typecheck von `apps/web`. Details und Konsequenzen:
`50-governance-rest.md`.

---

## Dependencies und Stack-Lücke

`[read]` `apps/web/package.json` vollständig:
dependencies `next ^14`, `react ^18`, `react-dom ^18`, `@supabase/supabase-js ^2`,
`@supabase/ssr ^0.1` — devDependencies `typescript`, `@types/react`, `@types/node`,
`tailwindcss`, `autoprefixer`, `postcss`. **Kein `test`-Script.**
Auffällig: `@types/react-dom` fehlt trotz `react-dom`.

Gegen den deklarierten Stack in `[read]` `docs/specs/WebPlatform/INDEX.md`
(Tabelle Z. 64–78):

| Spec verlangt | Vorhanden? |
|---|---|
| Next.js 14+ App Router, Tailwind | ja |
| Supabase Auth SSR | deklariert, **nicht verwendet** |
| shadcn/ui, lucide-react, Recharts, @dnd-kit, idb + next-pwa, Zustand, TanStack Query, react-hook-form + zod, date-fns, Framer Motion | **alles fehlt** |

→ TODO C-01. `[read]` `next.config.js`: `transpilePackages: []`,
`experimental.typedRoutes: true`. `[annahme]` kein Pfad-Alias in tsconfig
(erklärt die relativen Tiefimporte; Agentenbefund).

---

## Tests

- `[cmd]` **12 Unit-Test-Dateien**: 11 in `lib/nutrition/__tests__/`, 1 in
  `lib/governance/__tests__/`.
- `[cmd]` **Kein Test-Runner**: keine `vitest.config.*`/`jest.config.*` im Repo,
  weder `vitest` noch `jest` in Root- oder App-`package.json`, kein
  `test`-Script in `apps/web`. Das Root-`test`-Script (`turbo run test`) läuft
  für `apps/web` ins Leere. **Die Unit-Tests sind derzeit nicht ausführbar.**
- `[cmd]` **E2E**: `apps/web/e2e/` enthält genau eine Spec
  (`governance-ui.browser-smoke.spec.ts`, nur Governance-Routen), gefahren über
  Root-Script `governance:ui:smoke` mit `playwright.governance.config.ts`.
  Keine E2E-Abdeckung für irgendein Produktmodul.

---

## Korrekturen an `docs/ist-zustand/` (Bestandsaufnahme 2026-07-30)

Selbst nachgeprüfte Abweichungen — die Scan-Session lief ohne Shell:

1. `[cmd]` Es sind **24** Seiten, nicht 21 wie teils berichtet.
2. `[cmd]` Testliste: `curation-scan.test.ts` und `test-fixtures.ts` existieren
   nicht; `nutrient-rda-availability-filter.test.ts` fehlt in der alten Liste.
3. `[read]` Die Suchfunktion heißt `getLocalFoodSearch` (`food-search.ts:645`),
   nicht `searchFoods`; der Datenabruf in `foods/page.tsx` steht bei Z. 112–113,
   nicht Z. 47–68.

Korrekt bestätigt aus der alten Bestandsaufnahme: Docker-statt-supabase-js,
read-only ohne Schreibpfad, code-eingebetteter Preference-Katalog,
`/nutrition` als Mock, `/nutrition/preferences` als Redirect.
