# TODO — LumeOS

**Stand:** 2026-08-02 (siebte Aktualisierung — D-12/D-13/D-03/B-09 erledigt, Altmigrationen archiviert, kritischer Pfad)
**Konvention:** `[ ]` offen · `[~]` in Arbeit · `[x]` erledigt · *Blocker kursiv*
**Herkunft:** fortgeführt aus `docs/_archive/ist-zustand/03-todo.md` (Stand 2026-07-30),
ergänzt um die Funde der Sitzungen 2026-08-01.

---

## Kritischer Pfad

1. **M1 — Datenzugriffsschicht** (→ D-08 + O-2 Grants + C-07):
   `apps/web` greift per `docker exec psql` zu, es gibt keine Grants.
   Blockiert: Auth, Schreibpfade, Deployment, RLS.
2. **M2 — Frontend-Fundament** (→ C-01):
   10 von 13 deklarierten Bibliotheken fehlen.
3. **M3 — Erster Schreibpfad** (→ C-02) — braucht M1 und Toms Product Gate.
4. **M4 — Cloud-Deployment** (→ Sektion E) — braucht M1.

---

## A — Struktur & SSOT (laufend)

- [x] **A-01: SSOT-Ordner aufbauen** (`docs/ssot/`)
  1. [x] `00-INDEX.md` — Einstieg, Marker-Legende, Rangfolge
  2. [x] `10-workspace.md` — Inventar 59 Verzeichnisse, 17 lebend
     (2026-08-01 präzisiert: Entfernbarkeits-These um `system/`-Verbund eingeschränkt)
  3. [x] `11-zielarchitektur.md` — 5 Apps + Services aus den Specs abgeleitet
  4. [x] `20-apps-web-ist.md` — Routen, Fachlogik, Stack-Lücke
  5. [x] `30-datenbank.md` — zweite Fassung mit verifiziertem Container-Zustand
  6. [x] `40-spec-code-matrix.md` — je Modul Spec/Code/Delta + Bau-Reihenfolge
  7. [x] `50-governance-rest.md` — was physisch bleibt und was Entfernung kostet

- [ ] **A-02: `CLAUDE.md` ausdünnen** — nur Schreibregeln plus Verweis auf
  `docs/ssot/00-INDEX.md`. Alle Fakten raus. *Grund: der Satz „services/ ist leer"
  stand als Regel drin und war falsch.*
  *Vorher B-10 klären — das ijfw-Plugin schreibt selbsttätig hinein.*

- [ ] **A-03: Altlast archivieren** nach `docs/_archive/`:
  `docs/todos/` (11 Dateien, alle Spark/System), `docs/governance/`,
  Governance-Teil von `docs/project/`, `docs/ist-zustand/`.
  Hinweis: `docs/ist-zustand/` liegt `[cmd]` noch am alten Ort,
  `docs/_archive/` ist leer; Detailfehler der alten Bestandsaufnahme sind
  in `docs/ssot/20-apps-web-ist.md` dokumentiert.

- [ ] **A-04: `BrainstormDocs/_ARCHIVE_NOTICE.md` korrigieren** — verweist auf
  `SESSION_ONBOARDING.md`, `USER_MANUAL.md` und `system/memory/canonical/`
  als „aktuelle Referenzen". Alle drei sind Altlast.

- [ ] **A-05: Repo-Müll entfernen** (untracked) — **korrigiert 2026-08-02,
  dringend:** `tmp/` ist **KEIN Müll** und von der Löschliste ausgenommen.
  Unter `tmp/nutrition/p1-005-bls-local-import/` lagen die einzigen
  Quelldaten der Datenbank: `foods.csv` (7.140 Zeilen) und
  `food_nutrients.csv` (698.092 Zeilen), beide untracked.
  `[cmd]` Zeilenzahlen stimmen exakt mit dem Container überein.
  Seit Commit 399d9bc sind sie als `supabase/_data/bls_4_0_local_import.zip`
  versioniert. `tmp/` bleibt trotzdem stehen, bis ein Durchlauf aus `_data/`
  bewiesen ist (D-12).
  Übrige Löschliste bleibt: `temp/` (16,5 GB), `.wayland-core/`, `.wayland/`,
  `.ijfw/`, `ijfw/`, `_tmp_inventory/`, `backup_system.zip`, `services.zip`,
  `system.zip`, `nul`, `.codex-governance-ui.log`.
  *Regel daraus: jeder untracked Ordner wird vor Löschung inhaltlich geprüft,
  nicht nur dem Namen nach.*

- [ ] **A-06: Design-System spezifizieren** — `docs/spezifikation/10-plattform/design-system/`
  ist leer. Quellen: `docs/design-system/` (DESIGN_CONCEPT, components, tokens),
  `packages/ui` (Gerüst), Altbestand-Specs mit OKLCH-Tokens.
  *Tom hat mehrere Ansätze — wird getrennt besprochen, nicht nebenbei geschrieben.*
  Betrifft alle sieben Apps, weil das Design-System das einzige ist, was sie
  sichtbar verbindet.

- [ ] **A-07: ADR Servicelayer** — die Grundsatzentscheidung aus
  `10-plattform/architektur`, Abschnitt 4. Zwei Architekturen liegen nebeneinander:
  der Altbestand sieht neun Hono-Services mit eigenen Ports und JWT-Middleware vor,
  `[cmd]` gebaut ist direkter Datenbankzugriff bei 17 leeren Service-Verzeichnissen.
  Empfehlung im Dokument: direkter Zugriff als Regel, Services als begründete
  Ausnahme — RLS gilt für jeden Zugriffsweg, Middleware nur für den eigenen.
  *Blockiert ab dem zweiten Modul. Danach ist die Frage teuer.*
  Nach `docs/spezifikation/90-entscheidungen/`.

- [ ] **A-08: ADR Medienort** — `[read]` Training-Spec nennt Cloudflare R2,
  `[cmd]` der Bestand liegt in Supabase Storage (15 GB, Bucket `exercises`).
  Kostenfolge, und ein Wechsel würde einen Transfer bedeuten.

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

- [x] **B-09: Encoding-Schäden** — entschärft, erledigt 2026-08-02.
  `[cmd]` `packages/shared/src/supabase/client.ts` ist sauber (Bytes `E2 80 94` =
  korrekter Geviertstrich; der Befund war ein Konsolen-Anzeigefehler).
  Echter Schaden nur in `20240522_002` (`k?se`, `n?sse` — literales 0x3F) —
  die Datei liegt jetzt in `supabase/_archive/` und wird nicht mehr
  ausgeführt. Folgenlos.

- [ ] **B-10: ijfw-Plugin entscheiden** — `[cmd]` das Plugin
  (`"ijfw@ijfw": true` in `~/.claude/settings.json`) schreibt selbsttätig in
  `CLAUDE.md` (3 Zeilen) und `AGENTS.md` (104 Zeilen), Block
  `IJFW-MEMORY-START (managed -- do not edit manually)`.
  *Blockiert A-02: eine ausgedünnte `CLAUDE.md` würde wieder befüllt, mit
  ungeprüftem Inhalt.*

- [ ] **B-11: Worktree-Regel für parallele Agenten** (neu 2026-08-01) —
  `[cmd]` Prozessliste zeigte gleichzeitig einen Codex-Prozess (seit 09:19),
  eine zweite Claude-Instanz (seit 10:58) und diese Sitzung, alle auf demselben
  Working Tree. *Die Permission-Schicht prüft einzelne Aufrufe, nicht
  Gleichzeitigkeit — genau die Konstellation, aus der der Big Bang entstand.*
  Regel festlegen: `claude --worktree` oder getrennte Branches je Agent.
  Zusatz: `desktop-commander` umgeht die Permission-Schicht vollständig;
  risikoreiche Schritte gehören in eine Claude-Code-Session.

---

## C — Produkt: apps/web

- [ ] **C-01: Frontend-Stack-Lücke schliessen** — `[cmd]` `apps/web/package.json`
  gegen `docs/specs/WebPlatform/INDEX.md`: 10 von 13 deklarierten Bibliotheken fehlen.
  Vorhanden: Next.js 14, React 18, Tailwind, Supabase SSR (deklariert, ungenutzt).
  Fehlt: shadcn/ui, lucide-react, Recharts, @dnd-kit, Zustand, TanStack Query,
  react-hook-form, zod, date-fns, idb/next-pwa, Framer Motion.
  Nebenfund: `@types/react-dom` fehlt trotz `react-dom`.
  *Entscheidung nötig: alles auf einmal oder je Feature nachziehen.*

- [ ] **C-02: WP-01 Preferences-Schreibpfad** (übernommen aus 2026-07-30)
  1. [x] ~~Migration `nutrition.food_preferences` (+ `food_preference_items`)~~
     → **korrigiert 2026-08-01:** `[cmd]` beide Tabellen existieren bereits in der
     Live-DB (14 bzw. 13 Spalten, 0 Zeilen) — aber in **keiner** Migrationsdatei.
     Beide tragen `auth.uid()`-RLS. ADR-002 wurde faktisch in der Datenbank
     entschieden und nirgends dokumentiert. Neue Aufgabe: Design nachdokumentieren
     und als Migration nachziehen → siehe D-12.
  2. [ ] `src/lib/nutrition/preferences-write.ts`
  3. [ ] `preference-search-preview.ts` liest echte DB-Preferences
  4. [ ] API `POST/DELETE /api/nutrition/preferences`
  5. [ ] UI `foods/page.tsx`: Favorit/Ausschluss-Toggles
  6. [ ] Unit-Tests
  7. [ ] Abnahme: Favorit gewichtet Suche, Ausschluss entfernt Treffer,
     Zustand überlebt Container-Neustart
  *Blockiert durch das Nutrition Product Gate
  (`docs/ssot/40-spec-code-matrix.md`) — Tom muss es explizit öffnen.*
  *Zusätzlich blockiert durch D-08: die Tabellen erwarten `auth.uid()`,
  `apps/web` greift ohne Auth per `docker exec psql` zu.*

- [ ] **C-03: WP-02 Diary-Verdrahtung** — `db/schema/nutrition.sql` anschliessen
  oder verwerfen. *Blockiert durch ADR-003 (Modellkonflikt EAV vs. flach).*
  Nebenfund `[read]`: im Entwurf hat `meal_items` RLS ohne Policy —
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
  `apps/web`, aber kein vitest/jest im Repo, kein `test`-Script;
  `turbo run test` läuft ins Leere. Die Tests sind derzeit nicht ausführbar.

- [ ] **C-10: UI-Zahlen gegen DB prüfen** — die App-Shell zeigt
  „117 Nährstoffe · BLS 10.840" als Literale. `[cmd]` Tatsächlich in der DB:
  138 `nutrient_defs`, 7.140 `foods`. Zahlen korrigieren oder aus der DB lesen.

---

## D — Datenbank & Specs

### Reproduzierbarkeit — erledigt 2026-08-02

- [x] **D-12: Aufbaukette verifizieren** — **erledigt 2026-08-02**
  (`docs/ssot/33-pipeline-verifikation.md`).
  Ausgangsbefund war: `[cmd]` `supabase_migrations.schema_migrations` enthält
  **genau einen Eintrag** (`20260423120000_control_plane_tables`), während
  11 Nutrition-Tabellen mit rund 727.000 Zeilen existieren.
  **Aber: die Aufbaukette war nicht verloren.** Sie lag in
  `docs/project/p1-005/` und `tmp/` und ist seit Commit 399d9bc unter
  `supabase/_pipeline/` gebündelt: 010 Schema, 020/021 Human Layer inkl.
  Tag- und Alias-Ableitungen, 030 BLS-Import, 050/051 Nutzertabellen,
  plus 4 Validierungsskripte.
  **Verifikation:** `[cmd]` Zwei Läufe gegen frische Datenbanken, beide
  identisch zum Container: 105 Spalten, 31 Indizes, 2 Policies, alle
  11 Zeilenzahlen. Gesamtdauer 10,6 s. Der fehlende Nährstoff-Katalog wurde
  gefunden und nach `supabase/_pipeline/015_kataloge/` extrahiert.
  **Erledigt daraus — O-8 (Makro-Spalten/Auto-Tagging):** `[read]` die
  Tag-Ableitungen stehen in
  `supabase/_pipeline/02_human_layer/020_food_human_layer.sql`:
  `high_protein` PROT625>=20, `low_carb` CHO<=10, `low_fat` FAT<=3,
  `high_fiber` FIBT>=6, Konfidenz fest 1.0, aus `food_nutrients`.
  `[cmd]` Container: 1.400 / 4.659 / 2.648 / 558 Zeilen. Makro-Spalten auf
  `foods` und `auto_tag_food()` existieren nicht und werden nicht gebraucht —
  der EAV-Weg ist der reale.
  **Erledigt daraus — O-6 (Altdateien):** vier Dateien nach
  `supabase/_archive/` verschoben — `20240522_001`, `20240522_002` und beide
  Control-Plane-Migrationen. Governance ist in diesem Repo tot
  (Entscheidung Tom). `supabase/migrations/` enthält nur noch die drei Slices.
  Restfragen ausgelagert: → D-15 (Drafts), D-16 (021-Effekt), D-17 (Register).

- [x] **D-13: Warum liefen die „DO NOT EXECUTE"-Slices?** — **erledigt
  2026-08-02:** Die drei Slices **sind** die Schema-Stufe der Kette.
  `[cmd]` Kein Transaktionsrahmen, idempotent über `to_regclass`-Guards,
  laufen fehlerfrei. Der Statuskopf war Governance-Zeremonie.
  Ursprungsbefund: `[cmd]` `name_th` existiert in `food_categories`, `foods`
  (plus `name_display_th`) und `nutrient_defs` (plus `group_th`) — genau der
  Inhalt von `20260513_002`, das im Kopf
  `EXECUTION_CANDIDATE_REVIEW_ONLY / DO NOT EXECUTE` trägt.

- [ ] **D-14: RLS im Container prüfen und entscheiden** (neu 2026-08-01) —
  `[cmd]` Ist-Zustand weicht von der Migration ab:

  | Tabelle | RLS an | Policies |
  |---|---|---|
  | `food_preferences` | ja | 1 (`auth.uid()`) |
  | `food_preference_items` | ja | 1 (`auth.uid()`) |
  | alle übrigen 9 | **nein** | 0 |

  Die Migration `20240522_002` beschreibt RLS auf allen 7 EAV-Tabellen
  (`FOR SELECT TO authenticated`). Im Container ist davon nichts vorhanden.
  *Zwei Fragen: Ist der offene Zugriff auf die EAV-Tabellen gewollt (Stammdaten)
  oder ein Versehen? Und: die einzigen zwei Policies nutzen `auth.uid()` —
  damit ist ADR-003 faktisch schon in Richtung Supabase-Auth entschieden,
  ohne Dokumentation. Hängt an D-08 und C-03.*

- [x] **D-11: Restore-Test** — erledigt 2026-08-01.
  `[cmd]` Restore von `backup/data/2026-08-01_nutrition_full.dump` in eine leere
  Datenbank: **4,7 s**, alle 11 Tabellen, alle Zeilenzahlen exakt identisch.
  **Aber:** 2 von 2 RLS-Policies gingen verloren (`ERROR: schema "auth" does not
  exist`); `pg_restore` meldet das nur als Warnung. Der Dump ist damit nur in
  eine echte Supabase-Instanz vollständig zurückspielbar. Testdatenbank verworfen.

### Übrige DB-Punkte

- [x] **D-01: Quelle der Curation-Tabellen** — geklärt 2026-08-01.
  `[cmd]` Beide Tabellen existieren im Container, leer. DDL-Quelle:
  `docs/project/p1-005/P1-005-local-curation-persistence-foundation.sql`;
  die Inline-Kopie in `curation.ts:156` wird nur vom Unit-Test aufgerufen.
  Der genaue Anlageweg bleibt `[annahme]`. → geht in D-12 auf.

- [x] **D-02: Slice-Migrationen dokumentieren** — erledigt, Befund korrigiert:
  `[cmd]` `20260513_001` und `20260514_001` enthalten sehr wohl `CREATE TABLE`
  (kleingeschrieben, in `do $$`-Blöcken hinter `to_regclass`-Guards);
  nur `20260513_002` ist reines `ALTER TABLE`.

- [x] **D-09: Migrationsstand des Containers verifizieren** — erledigt 2026-08-01.
  `[cmd]` Bestand: 7.140 `foods`, 698.092 `food_nutrients`, 21.420 `food_aliases`,
  9.265 `food_tags`, 518 `food_categories`, 138 `nutrient_defs`,
  16 `tag_definitions`; `food_preferences`, `food_preference_items`,
  `food_curation_*` je 0 Zeilen; 4 `workorders` in `public`.
  Ergebnis führte zu D-11 bis D-14 und zur Korrektur von C-02.1.

- [x] **D-03: `supabase/snippets/`** — **erledigt 2026-08-02.**
  `[cmd]` 3 Dateien, `[read]` reine Introspektions-Queries über
  `nutrient_defs` (Studio-Reste vom 2026-05-13). Als
  POST-APPLY VALIDATION QUERIES der Slice-Migrationen belegt — ein Beleg für
  D-13: die „DO NOT EXECUTE"-Slices wurden im Studio ausgeführt und von Hand
  kontrolliert. In `supabase/_snippets/` gesichert. Original löschbar.

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
  *Neu dazu: ADR-002 nachdokumentieren (C-02.1), ADR-003 im Licht von D-14.*

- [ ] **D-07: README „Phase 1B"** nach C-02 aktualisieren.

- [ ] **D-08: supabase-js vs. Docker-SQL klären** — `apps/web` deklariert
  `@supabase/supabase-js`, nutzt es aber nicht (`[cmd]` 0 Importe);
  4 lib-Dateien gehen per `docker exec … psql` gegen den lokalen Container
  (Containername hartkodiert). *Architekturentscheidung von Tom nötig —
  neues Argument aus D-14: der Container trägt bereits `auth.uid()`-Policies,
  die ohne Supabase-Auth nie greifen können.*

- [ ] **D-10: Port-Kollision im Governance-Rest** — `[cmd]` `orchestrator-api`
  und `wo-classifier` haben beide Default-Port 9000. Bei Entfernung hinfällig.

- [ ] **D-15: `supabase/migrations-draft/` einordnen** (neu 2026-08-02) —
  durch beide Verifikationsläufe überholt. Verwerfen oder als Referenz behalten.

- [ ] **D-16: `021_wild_category_apply.sql` klären** (neu 2026-08-02) —
  läuft ohne sichtbaren Effekt. `[annahme]` durch 020 abgedeckt, ungeprüft.

- [ ] **D-17: Migrationsregister-Strategie** (neu 2026-08-02) — das Register
  ist nach der Archivierung faktisch leer. Entscheiden: Kette in reguläre
  Migrationen überführen oder als dokumentierter Ablauf belassen.

---

## E — Legacy-Cloud-Instanz (LumeOS-V2)

*Keine Priorität. Erst nach D-12.*
*Nächster Schritt: read-only Prüfung und Vorgehen definieren.*

**Ausgangslage:** Supabase-Cloud-Instanz `LumeOS-V2` (Org `dev-lumeos`, **Pro-Plan,
wird bezahlt**, Branch `main` = Production, erreichbar). Testprojekt mit Dummydaten
aus einer früheren LumeOS-Version. Entweder wir nutzen sie oder sie wird gelöscht —
Entscheidung Tom: nutzen und passend konfigurieren.

**Bestand, `[cmd]` gemessen 2026-08-01:**

| Posten | Wert |
|---|---|
| Storage-Bucket `exercises` | 10.776 Objekte, **15 GB**, `public: true` |
| `public.exercises` | 1.448 Zeilen |
| `public.exercise_muscles` | 6.398 Zuordnungen über 1.362 Übungen, 149 Muskelgruppen |
| `public.equipment` | 61 Einträge, **kein** `equipment_id` NULL |

**Medienabdeckung je Übung:**

| Feld | Vorhanden | Anteil |
|---|---|---|
| `instructions` | 1.448 | **100 %** |
| `tips` | 1.444 | 99,7 % |
| `image_male_start` | 1.370 | 95 % |
| `video_url` | 1.274 | 88 % |
| `image_male_end` | 737 | 51 % |
| `image_female_start` / `_end` | 186 | **13 %** |
| ganz ohne Medien | 40 | 2,8 % |
| ohne Muskelzuordnung | 86 | 5,9 % |

**Der eigentliche Wert sind die Texte, nicht die Dateien.** `instructions` und
`tips` sind ausformulierte, mehrschrittige Anleitungen mit 100 % Abdeckung —
der Posten, der bei Neuerzeugung am teuersten wäre. Danach kommen die 6.398
Muskelzuordnungen (Fachwissen, normalisiert) und erst dann die 15 GB Medien.

`[read]` Medien-URLs sind absolut und öffentlich:
`https://<ref>.supabase.co/storage/v1/object/public/exercises/videos/<Kategorie>/<datei>.mp4`

`[read]` Die Muskelzuordnung ist normalisiert in `public.exercise_muscles`
(`exercise_id`, `muscle_group_id` UUID-FK, `role` primary/secondary).
Die `text[]`-Spalten `primary_muscles`/`secondary_muscles` in `exercises` sind
ein veraltetes Duplikat mit uneinheitlichen Strings — **nicht als Quelle nutzen.**

### Was Supabase-Branching nicht kann

`[read]` Offizielle Doku, geprüft 2026-08-01. Drei Punkte, die das Vorgehen bestimmen:

1. **`main` bleibt Produktion, unwiderruflich.** Welcher Branch als
   Produktions-Branch dient, lässt sich nicht ändern — das Basis-Projekt bleibt
   immer Produktion. „Dev bauen und daraus `main` generieren" ist nicht möglich.
   Die Richtung ist fest: Branch → Merge → Migrationen laufen auf `main`.
2. **Branches enthalten keine Daten.** Ein Branch ist eine Kopie des Projekts
   abzüglich der Daten; befüllt wird über `seed.sql`.
3. **Branches haben eigenen Storage.** Jede Branch-Instanz enthält alle
   Supabase-Dienste isoliert — **ein Dev-Branch hätte kein `exercises`-Bucket.**
   Gegen die 15 GB liesse sich dort nicht testen.

**Kosten:** Preview-Branches werden auf Pro stundenweise abgerechnet. Ein
dauerhaft laufender Dev-Branch kostet laufend; ein Branch je Pull Request,
der wieder verschwindet, kostet fast nichts.

### Vorgehen

`main` wird **umgebaut, nicht ersetzt** — die 15 GB und die 1.448 Übungen sind
der Grund, das Projekt zu behalten. Was „dev neu bauen" wäre, passiert lokal:
dort gibt es `supabase db reset`, kostenlos und beliebig oft.

- [ ] **E-01: Read-only Prüfung der Instanz** — vollständige Tabellenliste in
  `public` mit Zeilenzahlen, Storage-Policies, `auth.users`-Anzahl,
  Postgres-Version, Branch-Konfiguration. Ergebnis nach
  `docs/ssot/60-legacy-cloud.md`. *Nichts schreiben, kein `supabase link`,
  kein `db push`/`db pull`.*

- [ ] **E-02: Tote Verweise verifizieren** — erste Messung ergab 27/27/9/9/28
  tote Verweise je Medienfeld (2–4,8 %). Die Konstanz deutet auf ein
  Kodierungsartefakt der Prüfquery hin (URLs sind prozentkodiert, Dateinamen
  enthalten Leerzeichen vor der Endung). `[annahme]` Vor Eintrag als Datenverlust
  eine betroffene URL im Browser öffnen.

- [ ] **E-03: Abhängigkeiten prüfen, bevor `public` angefasst wird** —
  Fremdschlüssel oder Trigger nach `storage.objects`; Storage-Policies, die auf
  `public`-Tabellen verweisen; Views und Funktionen auf `public.<tabelle>`.
  *`ALTER TABLE … SET SCHEMA` ist billig und reversibel, kann aber genau diese
  brechen. Vorher Dump ziehen.*

- [ ] **E-04: Alte `public`-Tabellen nach `legacy` verschieben** — nicht löschen.
  Kostet nichts, macht `public` frei für unsere Schemas, und die Daten bleiben
  greifbar. Bucket und `auth` bleiben unangetastet.

- [ ] **E-05: Übernahmekandidaten exportieren und mappen** — sicher:
  `exercises`, `exercise_muscles`, `equipment`, Muskelgruppen-Katalog.
  Als JSON-Dump (wenige MB), dann Mapping gegen
  `docs/specs/Training/SPEC_02_ENTITIES.md` und `SPEC_06_DATABASE_SCHEMA.md`,
  Einspielung in ein sauberes `training.`-Schema.
  *Inhalt vor Struktur: die Daten werden übernommen, die alte Struktur ist
  verhandelbar.*

- [ ] **E-06: Medienpfade relativ speichern** — Zielstruktur hält Bucket +
  relativen Objektpfad, nicht die absolute URL. Basis-URL kommt aus der
  Konfiguration. *Sonst steckt die Projekt-Ref in jeder Zeile.*

- [ ] **E-07: Lücke weibliche Darstellungen entscheiden** — 186 von 1.448
  Übungen (13 %). Bewusster Verzicht oder Produktionsauftrag über 1.262 Übungen?
  *Gehört in die Produktentscheidung, nicht in eine Fussnote.*

- [ ] **E-08: Deployment nach `main`** — erst wenn D-12 abgeschlossen ist.
  *Vor einem `supabase link` müssen die Migrationsdateien den lokalen Zustand
  abbilden, sonst entsteht ein dritter Drift-Zustand — diesmal in einer
  Instanz, für die bezahlt wird.*

- [ ] **E-09: Preview-Branches erst danach** — und dann als das, wofür sie
  gedacht sind: kurzlebige Testumgebungen je Änderung, kein dauerhaftes Dev.

- [ ] **E-10: RLS neu bewerten, sobald `main` produktiv wird** — viele
  Legacy-Tabellen sind `UNRESTRICTED`. Bei Dummydaten unkritisch (Entscheidung
  Tom), bei echten Nutzerdaten nicht. *Vgl. D-14 — derselbe Befund lokal:
  9 von 11 `nutrition`-Tabellen ohne RLS, obwohl die Migration es beschreibt.
  Das Muster wiederholt sich über zwei unabhängige Instanzen.*

---

## Erledigt am 2026-08-01

- [x] Permission-Schicht gebaut und verifiziert (B-01)
- [x] `settings.local.json` bereinigt: 47 Allow-Regeln auf 0 (B-02)
- [x] Secret-Prüfung: `.env*` nie committed, `.gitignore` deckt ab
- [x] SSOT-Ordner vollständig: `00-INDEX`, `10-workspace`, `11-zielarchitektur`,
  `20-apps-web-ist`, `30-datenbank`, `40-spec-code-matrix`, `50-governance-rest` (A-01)
- [x] `10-workspace.md` präzisiert: Governance-Entfernbarkeit gilt nur für
  Packages/Services, nicht für `system/`
- [x] `30-datenbank.md` zweite Fassung: Container-Ist-Zustand ergänzt,
  RLS-Behauptung korrigiert (Datei sagte RLS auf 7 Tabellen, Container hat 2)
- [x] `backup/` angelegt und befüllt — Schema-, Daten- und Rescue-Dumps,
  Integrität per `pg_restore --list` geprüft, Restore getestet (D-11)
- [x] D-01, D-02, D-09, D-11 erledigt
- [x] Legacy-Cloud-Instanz `LumeOS-V2` vermessen — Bestand, Medienabdeckung,
  Storage-Volumen, Branching-Grenzen geklärt (Sektion E)
- [x] `services/` und `packages/` sind deklariert, aber leer
  → **widerlegt.** `[cmd]` 17 Packages mit Code, 42 leere Gerüste als Endausbau deklariert.
- [x] Build-Verifikation nachgeholt: `[cmd]` `pnpm typecheck` 17/17 grün, 3,9 s

## Erledigt am 2026-07-30

- [x] Bestandsaufnahme Repo + `apps/web`
- [x] Modulakte Nutrition
- [x] Spec↔Code-Abgleich Nutrition
- [x] Todo- und ADR-Liste angelegt
