# TODO — LumeOS

**Stand:** 2026-08-01 (dritte Aktualisierung — DB-Verifikation und Backup)
**Konvention:** `[ ]` offen · `[~]` in Arbeit · `[x]` erledigt · *Blocker kursiv*
**Herkunft:** fortgeführt aus `docs/_archive/ist-zustand/03-todo.md` (Stand 2026-07-30),
ergänzt um die Funde der Sitzungen 2026-08-01.

---

## A — Struktur & SSOT (laufend)

- [x] **A-01: SSOT-Ordner aufbauen** (`docs/ssot/`)
  1. [x] `00-INDEX.md` — Einstieg, Marker-Legende, Rangfolge
  2. [x] `10-workspace.md` — Inventar 59 Verzeichnisse, 17 lebend
     (2026-08-01 präzisiert: Entfernbarkeits-These um `system/`-Verbund eingeschränkt)
  3. [x] `11-zielarchitektur.md` — 5 Apps + Services aus den Specs abgeleitet
  4. [x] `20-apps-web-ist.md` — Routen, Fachlogik, Stack-Lücke
  5. [x] `30-datenbank.md` — Live-Schema vs. Diary-Entwurf
  6. [x] `40-spec-code-matrix.md` — je Modul Spec/Code/Delta + Bau-Reihenfolge
  7. [x] `50-governance-rest.md` — was physisch bleibt und was Entfernung kostet

- [ ] **A-02: `CLAUDE.md` ausdünnen** — nur Schreibregeln plus Verweis auf
  `docs/ssot/00-INDEX.md`. Alle Fakten raus. *Grund: der Satz „services/ ist leer"
  stand als Regel drin und war falsch.*
  *Vorher B-10 klären — das ijfw-Plugin schreibt selbsttätig hinein.*

- [ ] **A-03: Altlast archivieren** nach `docs/_archive/`:
  `docs/todos/` (11 Dateien, alle Spark/System), `docs/governance/`,
  Governance-Teil von `docs/project/`, `docs/ist-zustand/`.
  Hinweis 2026-08-01: `docs/ist-zustand/` liegt `[cmd]` noch am alten Ort,
  `docs/_archive/` ist leer; die Detailfehler der alten Bestandsaufnahme sind
  in `docs/ssot/20-apps-web-ist.md` dokumentiert.

- [ ] **A-04: `BrainstormDocs/_ARCHIVE_NOTICE.md` korrigieren** — verweist auf
  `SESSION_ONBOARDING.md`, `USER_MANUAL.md` und `system/memory/canonical/`
  als „aktuelle Referenzen". Alle drei sind Altlast.

- [ ] **A-05: Repo-Müll entfernen** (untracked): `temp/` (16,5 GB), `tmp/` (31 MB),
  `.wayland-core/`, `.wayland/`, `.ijfw/`, `ijfw/`, `_tmp_inventory/`,
  `backup_system.zip`, `services.zip`, `system.zip`, `nul`,
  `.codex-governance-ui.log`. *Vor Löschung `tmp/` prüfen — enthält evtl. SQL.*

---

## B — Entwicklungsumgebung & Absicherung

- [x] **B-01: Permission-Schicht aufgebaut** — `[cmd]` `.claude/settings.json`
  mit 14 Deny / 7 Ask / 13 Allow. Verifiziert: `git push --dry-run` wurde geblockt,
  `pnpm typecheck` lief ohne Nachfrage.

- [x] **B-02: `settings.local.json` bereinigt** — von 47 gewachsenen Allow-Regeln
  auf 0 zurückgesetzt, nur lean-ctx-Hooks bleiben. Sicherung:
  `.claude/settings.local.json.bak-2026-08-01`.
  *Kritisch war `Bash(powershell -Command:*)` — ein Generalschlüssel, der jede
  Deny-Regel umging, zusammen mit `git add *` und `git commit -m ' *`.*

- [ ] **B-03: `Bash(rm:*)`-Deny verifizieren** — ungetestet. Claude Code hat beim
  Test nicht `rm` versucht, sondern erst geprüft. Explizit provozieren.

- [ ] **B-04: PreToolUse-Hook neu bauen** — für Pfadschutz, den Muster nicht treffen:
  `supabase/migrations/`, `.env*`. Anforderungen: stdin-JSON lesen (nicht `param()`),
  Matcher `Write|Edit|Read`, **Exit-Code 2** (nicht 1), mit BOM geschrieben, ohne Emoji.
  *Nötig, weil verkettete Bash-Befehle (`&&`, `;`) die Deny-Muster umgehen — beim Test
  landete eine lange Kette bei „requires approval" statt bei Deny.*

- [ ] **B-05: Tote Hooks entfernen** — `.claude/hooks/pre-tool.ps1` hat
  `[cmd]` 4 Parse-Fehler und lief nie (UTF-8 ohne BOM + Emoji ausserhalb der BMP
  zerbricht das String-Quoting unter PS 5.1). `post-tool.ps1` parst, hat aber
  denselben `param()`-Fehler und schreibt nach `system/state/audit.jsonl`.
  Beide sind aus `settings.json` ausgehängt, Dateien liegen noch.

- [ ] **B-06: Herkunft des `PowerShell`-Deny klären** — die Permissions-UI zeigt
  einen Eintrag, den keine gefundene Settings-Datei liefert. Per `/permissions`
  in der Session nachsehen, welche Datei ihn setzt.

- [ ] **B-07: `skipAutoPermissionPrompt: true`** in `~/.claude/settings.json` prüfen.
  *Vermutliche Ursache dafür, dass 47 Allow-Regeln unbemerkt wachsen konnten.*

- [ ] **B-08: SessionEnd-Hook falsch verortet** — steht in `~/.claude/settings.json`
  mit hartkodiertem Pfad auf dieses Repo. Gehört in die Projekt-Settings oder weg.

- [ ] **B-09: Encoding-Schäden suchen** — `packages/shared/src/supabase/client.ts`
  enthält Mojibake (`?"` statt Gedankenstrich). Repo-weit nach beschädigten
  UTF-8-Sequenzen suchen und beheben.

- [ ] **B-10: ijfw-Plugin entscheiden** (neu 2026-08-01) — `[cmd]` das Plugin
  (`"ijfw@ijfw": true` in `~/.claude/settings.json`) schreibt selbsttätig in
  `CLAUDE.md` (3 Zeilen) und `AGENTS.md` (104 Zeilen), Block
  `IJFW-MEMORY-START (managed -- do not edit manually)`.
  *Blockiert A-02: eine ausgedünnte `CLAUDE.md` würde wieder befüllt, mit
  ungeprüftem Inhalt. Genau der Mechanismus, der am 2026-07-30 einen falschen
  Satz zur Regel gemacht hat.*

---

## C — Produkt: apps/web

- [ ] **C-01: Frontend-Stack-Lücke schliessen** — `[cmd]` `apps/web/package.json`
  gegen `docs/specs/WebPlatform/INDEX.md`: 10 von 13 deklarierten Bibliotheken fehlen.
  Vorhanden: Next.js 14, React 18, Tailwind, Supabase SSR (deklariert, ungenutzt).
  Fehlt: shadcn/ui, lucide-react, Recharts, @dnd-kit, Zustand, TanStack Query,
  react-hook-form, zod, date-fns, idb/next-pwa, Framer Motion.
  Nebenfund 2026-08-01: `@types/react-dom` fehlt trotz `react-dom`.
  *Entscheidung nötig: alles auf einmal oder je Feature nachziehen.*

- [ ] **C-02: WP-01 Preferences-Schreibpfad** (übernommen aus 2026-07-30)
  1. [x] ~~Migration `nutrition.food_preferences` (+ `food_preference_items`)~~
     → **korrigiert 2026-08-01:** `[cmd]` beide Tabellen existieren bereits in der
     Live-DB (14 bzw. 13 Spalten, 0 Zeilen) — aber in **keiner** Migrationsdatei.
     ADR-002 (Tabellendesign) wurde faktisch in der Datenbank entschieden und
     nirgends dokumentiert. Neue Aufgabe: Design nachdokumentieren und als
     Migration nachziehen → siehe D-12.
  2. [ ] `src/lib/nutrition/preferences-write.ts`
  3. [ ] `preference-search-preview.ts` liest echte DB-Preferences
  4. [ ] API `POST/DELETE /api/nutrition/preferences`
  5. [ ] UI `foods/page.tsx`: Favorit/Ausschluss-Toggles
  6. [ ] Unit-Tests
  7. [ ] Abnahme: Favorit gewichtet Suche, Ausschluss entfernt Treffer,
     Zustand überlebt Container-Neustart
  *Blockiert durch das Nutrition Product Gate
  (`docs/ssot/40-spec-code-matrix.md`) — Tom muss es explizit öffnen.*

- [ ] **C-03: WP-02 Diary-Verdrahtung** — `db/schema/nutrition.sql` anschliessen
  oder verwerfen. *Blockiert durch ADR-003 (Modellkonflikt EAV vs. flach).*
  Nebenfund 2026-08-01 `[read]`: im Entwurf hat `meal_items` RLS ohne Policy —
  wäre für authenticated gesperrt; bei Übernahme korrigieren.
- [ ] **C-04: WP-03 Daily Summary** — hängt an C-03
- [ ] **C-05: WP-04 Water Tracking** — `water_logs` fehlt komplett
- [ ] **C-06: WP-05 erstes Mock-Modul echt machen** — Kandidat Goals.
  *Vorher die 2 kritischen Bugs aus `docs/specs/Goals/OPEN_ITEMS.md` klären
  (Adaptive-TDEE Cross-Schema, Contribution-Timing).*

- [ ] **C-07: `packages/shared` und `packages/types` verdrahten** — beide enthalten
  Produktcode (Supabase-Clients, Nutrition-Typen), werden von `apps/web` aber nicht
  importiert. Nutzen oder entfernen.

- [ ] **C-08: `services/nutrition-api` einordnen** — Hono-Service, 4 Dateien,
  von niemandem importiert, während `apps/web` direkt per SQL gegen Docker geht.
  *Antwort Tom: Teil des Endausbaus.*

- [ ] **C-09: Test-Runner einrichten** — `[cmd]` 12 Unit-Test-Dateien in
  `apps/web`, aber kein vitest/jest im Repo, kein `test`-Script; `turbo run test`
  läuft ins Leere. Die Tests sind derzeit nicht ausführbar.
  *Neue Dependency → braucht expliziten Task laut `code-quality.md`.*

- [ ] **C-10: UI-Zahlen gegen DB prüfen** (neu 2026-08-01) — die App-Shell zeigt
  „117 Nährstoffe · BLS 10.840" als Literale. `[cmd]` Tatsächlich in der DB:
  138 `nutrient_defs`, 7.140 `foods`. Zahlen korrigieren oder aus der DB lesen.

---

## D — Datenbank & Specs

### Dringend: die DB ist nicht reproduzierbar

- [ ] **D-12: Migrationen rückbauen** (neu 2026-08-01, **höchste Priorität**) —
  `[cmd]` `supabase_migrations.schema_migrations` enthält **genau einen Eintrag**
  (`20260423120000_control_plane_tables`), während 11 Nutrition-Tabellen mit
  rund 727.000 Zeilen existieren. Das gesamte Live-Schema ist ausserhalb der
  Migrationspipeline entstanden.
  Vier Tabellen stehen in **keiner** Migrationsdatei: `food_preferences`,
  `food_preference_items`, `food_curation_candidates`, `food_curation_decisions`.
  DDL gesichert unter `backup/rescue/2026-08-01_verwaiste_tabellen.sql`.
  **Ziel:** Migrationsdateien so ergänzen, dass `supabase db reset` denselben
  Zustand herstellt. *Voraussetzung für jede lokal→dev→main-Pipeline.*

- [ ] **D-11: Restore-Test** (neu 2026-08-01) — `backup/data/2026-08-01_nutrition_full.dump`
  (5,8 MB) ist `[cmd]` per `pg_restore --list` lesbar, aber **nie zurückgespielt**.
  In eine leere Datenbank restaurieren, Zeilenzahlen vergleichen, Dauer messen.
  *Ein Dump ohne Restore-Test ist eine Datei, kein Backup.*

- [ ] **D-13: Warum liefen die „DO NOT EXECUTE"-Slices?** (neu 2026-08-01) —
  `[cmd]` `name_th` existiert in `food_categories`, `foods` (plus `name_display_th`)
  und `nutrient_defs` (plus `group_th`) — genau der Inhalt von `20260513_002`,
  das im Kopf `EXECUTION_CANDIDATE_REVIEW_ONLY / DO NOT EXECUTE` trägt.
  Klären, wie es angewendet wurde, und den Statuskopf korrigieren.

### Übrige DB-Punkte

- [x] **D-01: Quelle der Curation-Tabellen** — geklärt 2026-08-01.
  `[cmd]` `food_curation_candidates` (12 Spalten) und `food_curation_decisions`
  (6 Spalten) existieren in der DB, beide leer. DDL-Quelle:
  `docs/project/p1-005/P1-005-local-curation-persistence-foundation.sql`;
  die Inline-Kopie in `curation.ts:156` wird nur vom Unit-Test aufgerufen.
  Der genaue Anlageweg bleibt `[annahme]` (manuell ausgeführt). → geht in D-12 auf.

- [x] **D-02: Slice-Migrationen dokumentieren** — erledigt, Befund korrigiert:
  `[cmd]` `20260513_001` und `20260514_001` enthalten sehr wohl `CREATE TABLE`
  (kleingeschrieben, in `do $$`-Blöcken hinter `to_regclass`-Guards);
  nur `20260513_002` ist reines `ALTER TABLE`.

- [x] **D-09: Migrationsstand des Containers verifizieren** — erledigt 2026-08-01.
  `[cmd]` Container `supabase_db_LumeOS-Claude-V1` läuft (healthy).
  Bestand: 7.140 `foods`, 698.092 `food_nutrients`, 21.420 `food_aliases`,
  518 `food_categories`, 138 `nutrient_defs`; `food_preferences`,
  `food_preference_items`, `food_curation_*` je 0 Zeilen; 4 `workorders` in `public`.
  Ergebnis führte zu D-11, D-12, D-13 und zur Korrektur von C-02.1.

- [ ] **D-03: `supabase/snippets/`** — `[cmd]` 3 Dateien, `[read]` reine
  Introspektions-Queries über `nutrient_defs` (Studio-Reste vom 2026-05-13).
  Löschen oder behalten entscheiden.

- [ ] **D-04: E2E- und Testbasis klären** — `[cmd]` keine Root-`playwright.config.ts`
  (nur `playwright.governance.config.ts`), `apps/web/e2e/` enthält nur den
  Governance-Smoke. Offen: E2E für Produktrouten. Hängt mit C-09 zusammen.

- [ ] **D-05: Spec-Audit starten** — `docs/specs/` (13 Module) auseinandernehmen,
  Diskrepanzen suchen, pro Modul offizielle Spec deklarieren. *Eigene Sitzung.*
  Vorbefunde in `docs/ssot/40-spec-code-matrix.md` und `11-zielarchitektur.md`:
  tote `CONSOLIDATED_KNOWLEDGE`-Verweise in 7 INDEX-Dateien; Buddy-INDEX zeigt
  auf nicht existente `spec/`-Pfade; Modulzählung 10 vs. 11 vs. 7 vs. 13
  unversöhnt; Next.js 14+ vs. 15; Goals/Admin-Specs deklarieren Vorgänger-Code
  als „implementiert"; `apps/mobile`/`apps/staff` und 4 Service-Gerüste ohne Spec;
  Specs referenzieren `packages/scoring`, wofür kein Gerüst existiert;
  `apps/marketplace` in Specs, aber ohne Gerüst.

- [ ] **D-06: ADRs nach `docs/decisions/` überführen** — `[cmd]` leer (nur `.gitkeep`).
  Register in `docs/ist-zustand/04-adr-liste.md`, Nutrition-ADRs `[cmd]` in
  `docs/specs/Nutrition/04_adrs/` (12 Stück).
  *Neu dazu: ADR-002 nachdokumentieren (siehe C-02.1).*

- [ ] **D-07: README „Phase 1B"** nach C-02 aktualisieren.

- [ ] **D-08: supabase-js vs. Docker-SQL klären** — `apps/web` deklariert
  `@supabase/supabase-js`, nutzt es aber nicht (`[cmd]` 0 Importe);
  4 lib-Dateien gehen per `docker exec … psql` gegen den lokalen Container
  (Containername hartkodiert). *Architekturentscheidung von Tom nötig.*

- [ ] **D-10: Port-Kollision im Governance-Rest** — `[cmd]` `orchestrator-api`
  und `wo-classifier` haben beide Default-Port 9000. Bei Entfernung hinfällig.

---

## Erledigt am 2026-08-01

- [x] Permission-Schicht gebaut und verifiziert (B-01)
- [x] `settings.local.json` bereinigt: 47 Allow-Regeln auf 0 (B-02)
- [x] Secret-Prüfung: `.env*` nie committed, `.gitignore` deckt ab
- [x] SSOT-Ordner vollständig: `00-INDEX`, `10-workspace`, `11-zielarchitektur`,
  `20-apps-web-ist`, `30-datenbank`, `40-spec-code-matrix`, `50-governance-rest` (A-01)
- [x] `10-workspace.md` präzisiert: Governance-Entfernbarkeit gilt nur für
  Packages/Services, nicht für `system/` (Verbund mit `apps/web` und `scheduler-api`)
- [x] **`backup/` angelegt und befüllt** — Schema-, Daten- und Rescue-Dumps,
  Integrität per `pg_restore --list` geprüft. Siehe `backup/README.md`.
- [x] D-01 geklärt, D-02 geklärt und korrigiert, D-09 erledigt
- [x] `services/` und `packages/` sind deklariert, aber leer
  → **widerlegt.** `[cmd]` 17 Packages mit Code, 42 leere Gerüste als Endausbau deklariert.
- [x] Build-Verifikation nachgeholt: `[cmd]` `pnpm typecheck` 17/17 grün, 3,9 s

## Erledigt am 2026-07-30

- [x] Bestandsaufnahme Repo + `apps/web`
- [x] Modulakte Nutrition
- [x] Spec↔Code-Abgleich Nutrition
- [x] Todo- und ADR-Liste angelegt
