# apps/web — Ist-Zustand

**Stand:** 2026-08-04 (neu erhoben nach Governance-Archivierung und M1 Teil C)
**Methode:** `[cmd]` Datei-Inventar über `src/app`, `src/lib`, `__tests__`, `e2e`;
Greps auf Importe, Schreibzugriffe, Runtime-Exports; `[read]` zitierte Stellen
selbst gelesen. Typecheck: `[cmd]` 2026-08-04 Exit 0 (4 Packages in scope).

---

## Kurzfassung

`apps/web` ist eine Next.js-14-Shell mit genau **einem echten Fachmodul-Ausschnitt**:
drei Nutrition-Seiten lesen read-only aus der lokalen Supabase — seit M1 Teil C
über **supabase-js und Postgres-Funktionen per rpc()**, nicht mehr über
`docker exec`. Alles andere ist statische Attrappe — einschließlich des
Nutrition-Diary-Einstiegs. Die Governance-Konsole ist seit 2026-08-03 aus der
App entfernt und liegt unter `_archive/governance/apps-web-governance/`.

---

## Routen-Inventar

`[cmd]` 2026-08-04: **14 Seiten** (`page.tsx`), **6 API-Routen** (`route.ts`),
**1 Layout** (`src/app/layout.tsx`). Keine dynamischen Segmente, kein
`loading.tsx`/`error.tsx`/`not-found.tsx`, keine Route Groups.
(Vorher 24 Seiten / 8 API-Routen — die Differenz sind exakt die 10
Governance-Seiten und 2 Governance-API-Routen im Archiv.)

### Echt — Daten aus der lokalen Supabase (read-only)

| Route | Beleg |
|---|---|
| `/nutrition/foods` | `[read]` (2026-08-01) `foods/page.tsx` async, ruft `getLocalFoodSearch()` + `getPreferenceSearchPreview()` |
| `/nutrition/curation` | `[read]` (2026-08-01) ruft `getNutritionCurationData()` |
| `/nutrition/local-schema` | `[read]` (2026-08-01) ruft `getLocalNutritionSchemaDebug()` |
| 6 Nutrition-API-Routen | `[cmd]` 2026-08-04: alle mit `export const dynamic = 'force-dynamic'`; 5 davon zusätzlich `runtime = 'nodejs'` (Service-Client läuft nur serverseitig); `preferences/catalog` ohne runtime-Export (kein DB-Zugriff) |

**Überholt seit M3 — berichtigt 2026-08-06 (D-07).** Hier stand:
„`[cmd]` Grep 2026-08-01 … kein `INSERT`/`UPDATE`/`DELETE` in
`lib/nutrition` — Phase 1B read-only." Das galt bis zum 2026-08-04 und
ist seither falsch.
`[cmd]` 2026-08-06: `lib/nutrition` enthält Schreiboperationen in
**zwei** Dateien — `preferences-write.ts` (C-02, Favoriten und
Ausschlüsse) und `diary-write.ts` (C-03, Mahlzeiten und Positionen mit
eingefrorenen Nährwerten). Beide laufen über den Session-Client mit
Zeilenschutz, nicht über den Service-Client.
Der Begriff „Phase 1B" wird nicht mehr verwendet; Stand und Grenzen
stehen in `docs/todo/TODO.md` und `docs/spezifikation/`.

### Mock / statisch

| Route | Beleg |
|---|---|
| `/` | `[annahme]` Re-Export des Dashboards (Agentenbericht, nicht einzeln geprüft) |
| `/dashboard` | `[read]` hartkodierte Arrays, Badges `Demo / Mock`; enthält weiterhin Governance-Prosa („Governance Boundary"-Chip, Boundary-Disclaimer) — Anzeige-Text ohne Kopplung |
| `/nutrition` — **der Diary-Einstieg** | `[read]` hartkodiert: `macroStrip` alle `current: '0'`, `mealSlots` alle `state: 'leer'`, Badge `Nicht live`. Das Spec-Kernstück Diary ist reine Attrappe. |
| `/goals`, `/medical` | `[read]`/`[cmd]` hartkodierte Blöcke, 0 async/fetch/DB-Aufrufe |
| `/training`, `/recovery`, `/supplements`, `/coach`, `/settings` | je 5 Zeilen `<PlaceholderPage />` |
| `/nutrition/preferences` | `[read]` nur `redirect('/nutrition/foods')` |

Auch die App-Shell zeigt Literale statt Daten. Der frühere
`/governance`-Early-Return in `app-shell.tsx` ist entfernt.

**Berichtigt 2026-08-06 (C-10):** Die hier zuvor zitierte Zeile
`'Nutrition · 117 Nährstoffe · BLS 10.840 · Candidate'` war **doppelt
falsch** — `[cmd]` in der Datenbank stehen **138** `nutrient_defs` und
**7.140** `foods`, nicht 117 und 10.840. Korrigiert auf die gemessenen
Werte und **bewusst weiterhin hart**: die App-Shell rendert auf jeder
Seite, eine Zählabfrage je Aufruf wäre Aufwand für eine Zahl, die sich
nur beim BLS-Import ändert. Der Kommentar an der Fundstelle nennt Herkunft
und Prüfdatum.
Ebenfalls berichtigt: die Shell behauptete „keine Diary Writes" — seit
C-03/C-04 falsch. `[cmd]` `lib/nutrition` enthält Schreibpfade in
`preferences-write.ts` und `diary-write.ts`; was fehlt, ist die
Diary-Oberfläche, nicht der Schreibpfad.
Unverändert hart und unbeanstandet: `Offline · 0 queued` — eine
Zustandsanzeige ohne Datenbezug, keine Bestandsbehauptung.

---

## Die DB-Zugriffsmechanik — seit M1 Teil C (2026-08-03)

**supabase-js statt `docker exec`.** `[cmd]` 2026-08-04: kein `child_process`,
kein `docker exec`, kein hartkodierter Containername mehr in `apps/web`
(nur noch zwei Erwähnungen in Kommentaren von `nutrition-db.ts`).

Zugang: `[read]` `nutrition-db.ts:11` —
`import { createServiceClient } from '@lumeos/shared'`;
`nutritionRpc()` liefert `createServiceClient().schema('nutrition')`.
Die fünf analytischen Abfragen (Suche, Kategoriebaum, Preference-Preview,
Kuration, Schema-Debug) leben als `LANGUAGE sql STABLE`-Funktionen im Schema
`nutrition` (Kettenschritt `supabase/_pipeline/07_lesefunktionen/`), aufgerufen
per `rpc()`. Tokenisierung und Katalog-Auflösung bleiben im TypeScript und
gehen als Parameter hinein — die frühere SQL-String-Interpolation samt
`escapeSql`-Helfern ist entfallen.

**Interimszustand:** Service-Client, weil die App noch keine Anmeldung hat
(M3); läuft ausschliesslich serverseitig. Benötigt
`NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in
`apps/web/.env.local`; ohne sie antwortet die App mit
`LOCAL_DB_UNAVAILABLE`-Fehlern. Details und Paritätsnachweise (49 = 49,
558 = 558): `docs/sessions/2026-08-02-m1c.md`.

---

## `src/lib` — 11 Dateien, alle `lib/nutrition`

`[cmd]` 2026-08-04. `lib/governance` existiert nicht mehr (Archiv).

| Datei | Tut | Zugriff |
|---|---|---|
| `nutrition-db.ts` (neu, M1 C) | Client-Zugang (`nutritionRpc()`), Fehlerklassifikation, `NUTRITION_DB_SOURCE = 'supabase_api:nutrition'` | supabase-js |
| `food-search.ts` | Tokens/RpcArgs bauen, `food_search`- und `food_categories_tree`-rpc, Parser | rpc() |
| `curation.ts` | `curation_overview`-rpc; historisches Curation-DDL bleibt als vom Test referenziertes Literal | rpc() |
| `local-schema-debug.ts` | `schema_debug`-rpc | rpc() |
| `preference-search-preview.ts` | `preference_search_preview`-rpc; `LABEL_POLICY` unverändert `preference_preview_local_only_not_production_smart_search` | rpc() |
| `preferences-catalog.ts` | Katalog als Code-Literal, read-only | keiner |
| `human-layer-gap-analysis.ts` | baut nur SQL-Strings; `[annahme]` von keiner Seite importiert | keiner |
| `nutrient-preview-filter.ts`, `nutrient-detail-selection.ts`, `nutrient-detail-link.ts`, `nutrient-pin-compare.ts` | reine Filter-/Link-/Vergleichshelfer | keiner |

---

## Dependencies und Stack-Lücke

`[read]` `apps/web/package.json`: dependencies `next ^14`, `react ^18`,
`react-dom ^18`, **`@lumeos/shared workspace:*`** (seit M1 C),
`@supabase/supabase-js ^2`, `@supabase/ssr ^0.1` (beide via `@lumeos/shared`
tatsächlich in Nutzung — der frühere Befund „beide Dependencies tot" ist
überholt). **Kein `test`-Script.** `@types/react-dom` fehlt weiterhin.
`[read]` `next.config.js`: `transpilePackages: ['@lumeos/shared']`;
`tsconfig.json` mit `paths`-Eintrag für `@lumeos/shared`.

Gegen den deklarierten Stack in `docs/specs/WebPlatform/INDEX.md` unverändert:
shadcn/ui, lucide-react, Recharts, @dnd-kit, idb + next-pwa, Zustand,
TanStack Query, react-hook-form + zod, date-fns, Framer Motion — **alles
fehlt** (→ TODO C-01). Supabase Auth SSR: Paket vorhanden, Anmeldung fehlt (M3).

---

## Tests

- `[cmd]` 2026-08-04: **11 Unit-Test-Dateien**, alle in
  `lib/nutrition/__tests__/` (der Governance-Test ist mit `lib/governance`
  im Archiv). 3 davon in M1 C auf die RpcArgs-Bauweise angepasst.
- **Kein Test-Runner** (unverändert): kein `vitest`/`jest` im Repo, kein
  `test`-Script in `apps/web`. Die Unit-Tests sind nicht ausführbar (TODO C-09).
- `[cmd]` 2026-08-04: **`apps/web/e2e/` ist leer** — die einzige Spec war der
  Governance-Smoke, jetzt im Archiv samt `playwright.governance.config.ts`.
  **Null E2E-Abdeckung** (TODO D-04).

---

## Korrekturen an älteren Bestandsaufnahmen

Gegenüber `docs/ist-zustand/` (2026-07-30) bereits 2026-08-01 korrigiert:
Seitenzahl, Testliste, Funktionsnamen (Details: Git-Historie dieser Datei).
Gegenüber der Vorfassung dieser Datei (2026-08-01) heute überholt:
Governance-Konsole und `system/`-Kopplung (archiviert), `docker exec`-Mechanik
(ersetzt durch supabase-js/rpc), „Supabase-Dependencies tot" (in Nutzung),
24→14 Seiten, 12→11 Testdateien.
