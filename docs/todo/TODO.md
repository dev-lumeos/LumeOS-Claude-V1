# TODO — LumeOS

**Stand:** 2026-08-05 (zehnte Aktualisierung — C-01-Reststand korrigiert, A-06 umgestuft, B-14 neu, Erledigt-Block 2026-08-05)
**Konvention:** `[ ]` offen · `[~]` in Arbeit · `[x]` erledigt · *Blocker kursiv*
**Herkunft:** fortgeführt aus `docs/_archive/ist-zustand/03-todo.md` (Stand 2026-07-30),
ergänzt um die Funde der Sitzungen 2026-08-01.

---

## Kritischer Pfad

1. **M1 — Datenzugriffsschicht** — **erledigt 2026-08-03.**
   `apps/web` liest über supabase-js und `rpc()`; Schema `nutrition` ausgesetzt,
   Rechte und Zeilenschutz produktiv (Kettenschritte 060/070). Siehe D-08, C-07.
2. **M2 — Frontend-Fundament** (→ C-01) — **Kern steht seit 2026-08-05:**
   Theming-System (Themes als Einzeldateien, Token-Vertrag, Cookie-SSR)
   und 10 von 13 Bibliotheken inkl. shadcn-Fundament; Rest je Feature
   (C-01), kein A-06-Blocker mehr.
3. **M3 — Erster Schreibpfad** (→ C-02) — **erledigt 2026-08-04** (C-02),
   Product Gate war offen, M1 erledigt.
4. **M4 — Cloud-Deployment** (→ Sektion E) — Voraussetzungen erfüllt.

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
  Neu 2026-08-05 (offen, Entscheidung Tom): `.gitignore`-Vorschlag
  `apps/web/.next*/` für beiseitegeschobene Build-Verzeichnisse — nicht
  gesetzt, nur vorgemerkt.

- [ ] **A-06: Design-System spezifizieren** — `docs/spezifikation/10-plattform/design-system/`
  ist leer. Quellen: `docs/design-system/` (DESIGN_CONCEPT, components, tokens),
  `packages/ui` (Gerüst), Altbestand-Specs mit OKLCH-Tokens.
  **Umgestuft 2026-08-05: kein Blocker mehr für M2** — das Design läuft
  parallel bei Tom, gearbeitet wird modulweise mit dem bestehenden
  Token-Satz; die elf Modul-Akzente bleiben unangetastet und weiterhin
  nicht in `tailwind.config.js` gespiegelt.
  A-06-Material (neu 2026-08-05): shadcn-Komponenten nutzen `rounded-md`
  (6 px fest) statt der Token-Radien `rounded-token*` — kein Fehler, aber
  ein Theme steuert die shadcn-Radien damit nicht; bei der
  Design-Entscheidung mitbehandeln.
  Betrifft alle sieben Apps, weil das Design-System das einzige ist, was
  sie sichtbar verbindet.

- [x] **A-07: ADR Servicelayer** — **erledigt 2026-08-04: Entscheidung
  getroffen.** `[cmd]` `docs/spezifikation/90-entscheidungen/ADR-0001-datenzugriff.md`
  existiert (Tom, parallel). Direkter Datenbankzugriff als Regel, Services als
  begründete Ausnahme — mit M1 Teil C real umgesetzt (supabase-js + rpc());
  die alte Neun-Services-Architektur ist mitsamt dem Governance-Cluster
  archiviert (`_archive/governance/`, Commit 59cb41e).
  Ursprungsbefund: zwei Architekturen lagen nebeneinander — Altbestand neun
  Hono-Services mit eigenen Ports und JWT-Middleware, gebaut war direkter
  Zugriff. RLS gilt für jeden Zugriffsweg, Middleware nur für den eigenen.

- [ ] **A-08: ADR Medienort** — `[read]` Training-Spec nennt Cloudflare R2,
  `[cmd]` der Bestand liegt in Supabase Storage (15 GB, Bucket `exercises`).
  Kostenfolge, und ein Wechsel würde einen Transfer bedeuten.

---

## B — Entwicklungsumgebung & Absicherung

- [ ] **B-12: Lokale Umgebung produktionsnah nachbilden** (neu 2026-08-03)
  Sobald die zweite App entsteht. Hosts-Einträge `web.lumeos.local`,
  `buddy.lumeos.local` und weitere, dazu lokale Zertifikate (mkcert), damit
  das geteilte Cookie auf einer echten Domain liegt.
  *Grund:* Das app-übergreifende Weiterreichen der Session über `.lumeos.app`
  ist auf `localhost` nicht nachstellbar — dort gibt es keine Subdomains im
  Cookie-Sinn. Solange nur `web` läuft, testet der Aufwand etwas, das niemand
  nutzt; ab der zweiten App ist es die einzige Möglichkeit, SSO vor dem
  Deployment zu prüfen.
  `[read]` Die Cookie-Einstellungen selbst brauchen keinen Sonderweg:
  `Secure` gilt auch auf localhost, weil lokale Adressen als
  vertrauenswürdig zählen. Entschieden in
  `docs/spezifikation/30-module/core/login/00-modul-login.md`.

- [ ] **B-13: `site_url` und Rückleitadressen korrigieren** (neu 2026-08-03)
  `[cmd]` `supabase/config.toml`: `site_url = "http://127.0.0.1:3000"` und
  `additional_redirect_urls = ["https://127.0.0.1:3000"]` — die App läuft auf
  **3200**. Nach einer Anmeldung würde Supabase auf einen Port zurückleiten,
  auf dem nichts antwortet. *Blockiert jeden Anmeldeversuch.*
  Dazu klären, wo die Liste für sieben Apps und drei Umgebungen gepflegt wird.

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

- [x] **B-04: PreToolUse-Hook neu bauen** — **erledigt 2026-08-04.**
  `.claude/hooks/protect-paths.ps1` (86 Zeilen), eingehängt in `.claude/settings.json`
  mit zwei Matcher-Einträgen: `Write|Edit|Read` sowie zusätzlich `Bash` — ohne den
  Bash-Matcher wäre genau die Anlass-Lücke offen geblieben.
  Alle vier Anforderungen `[cmd]` belegt: stdin-JSON über `[Console]::In.ReadToEnd()`
  (kein `param()`, 0 Treffer), Exit-Code 2 bei Ablehnung, mit BOM geschrieben
  (`EF BB BF`), 0 Nicht-ASCII-Bytes nach dem BOM, 0 Parse-Fehler im PS-5.1-Parser.
  Regeln: `.env*` für Lesen und Schreiben dicht (Ausnahme `.env.example`),
  `supabase/migrations/` nur schreibgeschützt (Lesen bleibt Arbeitsalltag der
  Kettenläufe), Fail-open bei unlesbarem stdin-JSON.
  Provokation `[cmd]`, acht Fälle: `Read .env.local` → 2, `Write supabase/migrations/…`
  → 2, verkettete Bash-Zeile `echo … && grep -c SUPABASE apps/web/.env.local` → 2
  (genau die Form, die vorher durchkam); durchgelassen: `Read package.json`,
  `Read .env.example`, `Read supabase/migrations/…`, `Bash pnpm test`, kaputtes stdin.
  Ablehnungen werden nach `.claude/hooks/protect-paths.log` protokolliert.
  Die lean-ctx-PreToolUse-Kette in der Nutzer-`settings.json` blieb unangetastet.
  Nebenbefund: `.gitignore` listete `.claude/` im Wayland-Block — wirkungslos für die
  93 bereits getrackten Dateien, blockierte aber jede neue. Zeile herausgelöst, statt
  dessen nur `settings.local.json*` und `hooks/*.log` ignoriert.

- [x] **B-05: Tote Hooks entfernen** — **erledigt 2026-08-04: gegenstandslos.**
  Beide Hooks waren aus `settings.json` ausgehängt und liefen nie
  (`[cmd]` 2026-08-01: `pre-tool.ps1` 4 Parse-Fehler durch UTF-8 ohne BOM +
  Emoji ausserhalb der BMP; `post-tool.ps1` `param()`-Fehler); das Schreibziel
  `system/state/audit.jsonl` existiert seit der Governance-Archivierung nicht
  mehr — die Hooks sind zielos. Die Dateien liegen noch unter `.claude/hooks/`
  und gehen mit der `.claude`-Altlast-Folgerunde (`50-governance-rest.md`).

- [ ] **B-06: Herkunft des `PowerShell`-Deny klären** — die Permissions-UI zeigt
  einen Eintrag, den keine gefundene Settings-Datei liefert. Per `/permissions`
  in der Session nachsehen, welche Datei ihn setzt.
  Hinweis 2026-08-04: `Bash(powershell:*)` steht inzwischen auf `ask`.

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

- [ ] **B-14: `pnpm build` ins Prüf-Gate aufnehmen** (neu 2026-08-05) —
  neben test und typecheck. Begründung `[cmd]`: der /dashboard-Bruch
  (typedRoutes; `app/page.tsx` importierte das Seitenmodul
  `./dashboard/page`) lag vor, während `pnpm test` und `pnpm typecheck`
  grün waren — unabhängig reproduziert in einem frischen Worktree auf
  7140829. Ein Gate ohne Build deckt genau die Fehlerklasse nicht ab, die
  beim Deployment zuerst auffällt; direkt relevant für M4.
  Einordnung in B: das Gate gehört zur Entwicklungsumgebung/Absicherung
  (wie B-01/B-04), kein Produktpunkt.

---

## C — Produkt: apps/web

- [ ] **C-11: Vor dem ersten Deployment auf Session-Client umstellen**
  (neu 2026-08-03) — `[cmd]` `nutrition-db.ts` nutzt den Service-Client, weil
  ohne Anmeldung (M3) jede Session `anon` wäre und kein `USAGE` auf `nutrition`
  hätte. Serverseitig, `service_role` erreicht den Browser nicht, im Code
  kommentiert.
  **Lokal in der Entwicklung unkritisch** — keine fremden Nutzerdaten vorhanden,
  Stammdaten sind ohnehin für alle lesbar.
  *Freigabebedingung, kein Entwicklungsblocker: Bevor die App eine fremde
  Umgebung erreicht oder echte Nutzerdaten entstehen, werden Stammdaten-Reads
  auf den Session-Client umgestellt — sonst laufen die 15 Policies aus 060 im
  Anwendungspfad ins Leere.* Gehört in die Deployment-Prüfliste
  (`10-plattform/ci-cd`).

- [ ] **C-01: Frontend-Stack-Lücke schliessen** — Reststand korrigiert
  2026-08-05: `[cmd]` **3 von 13 fehlen** (`@dnd-kit/core`, `zustand`,
  `next-pwa`); zehn vorhanden (lucide-react, recharts, framer-motion,
  @radix-ui/react-slot, @tanstack/react-query, react-hook-form, zod,
  date-fns, idb, @types/react-dom). Die alte Angabe „10 von 13 fehlen" ist
  überholt. **Entscheidung: je Feature nachziehen, nicht als Block** — alle
  drei hängen an konkreten Features (Drag-Reihenfolge, Client-State,
  Offline), nicht am Design.
  Dazugekommen 2026-08-05: shadcn-Fundament ohne `init` (components.json von
  Hand, Button als Probe), Abbildung ausschliesslich als Config-Aliase auf
  die bestehenden Tokens — null neue CSS-Variablen.

- [x] **C-02: WP-01 Preferences-Schreibpfad** — **erledigt 2026-08-04**
  (Sitzung C-02, Abnahme mit zwei echten Sessions; Duplikatschutz-Nachbesserung
  2026-08-05).
  1. [x] Migration/Aufbau der Tabellen — **Notiz von 2026-08-01 widerlegt
     2026-08-05:** `[cmd]` `050_preferences_foundation.sql` legt beide Tabellen
     an (CREATE TABLE IF NOT EXISTS, Z. 16 und 58), `060_zugriffsschicht.sql`
     setzt Rechte und die 4 Policies je Operation, `v050_preferences.sql`
     prüft. Die Behauptung „beide Tabellen existieren in keiner
     Migrationsdatei" stammte aus der Zeit vor der Pipeline-Bündelung (D-12)
     und ist überholt.
  2. [x] `src/lib/nutrition/preferences-write.ts` — Insert-zuerst gegen den
     UNIQUE-Index, 23505→409, 23503→400; reines Modell getrennt in
     `preferences-model.ts`
  3. [x] `preference-search-preview.ts` liest echte DB-Preferences
     (RLS-Session statt URL-Parameter; RPC um 3 Food-Level-Parameter erweitert)
  4. [x] API `GET/POST/DELETE /api/nutrition/preferences` (GET ergänzt —
     die Toggles brauchen den eigenen Bestand)
  5. [x] UI `foods/page.tsx`: Favorit-/Ausschluss-Toggles
     (react-hook-form + zod, TanStack Query, kein optimistisches Update)
  6. [x] Unit-Tests (7 neue in `preferences-model.test.ts`, gesamt 60/13/0)
  7. [x] Abnahme `[cmd]` 2026-08-04: Favorit gewichtet (Platz 11→1, score 80),
     Ausschluss entfernt (49→48), Zustand überlebt Container-Neustart,
     RLS mit zweiter echter Session dicht.
  **Duplikatschutz** `[cmd]` 2026-08-05: `uq_food_pref_items_user_food`
  (partiell, `WHERE food_id IS NOT NULL`) in 050 + live, 23505 nachgewiesen.
  *Offen bleiben:* Browser-E2E des Toggle-Flows (→ D-04),
  Preset-/Profil-Schreibpfad (Settings, → C-12).

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

- [ ] **C-08: `services/nutrition-api` einordnen** — angepasst 2026-08-04:
  Hono-Service, 4 Dateien, von niemandem importiert; seit der
  Governance-Archivierung einer von **vier** lebenden Workspace-Packages
  (`10-workspace.md`). `apps/web` greift inzwischen per supabase-js/rpc()
  direkt zu (M1 Teil C), nicht mehr per Docker-SQL.
  *Antwort Tom: Teil des Endausbaus.* Rahmen dafür jetzt in
  ADR-0001-datenzugriff (A-07): Services als begründete Ausnahme.

- [x] **C-09: Test-Runner einrichten** — **erledigt 2026-08-04.**
  `[cmd]` `apps/web` hat ein `test`-Script (`tsx --test` über die
  node:test-Dateien, kein vitest/jest — keine Datei umgeschrieben);
  `pnpm test` aus dem Root läuft über Turbo. Es sind **11** Testdateien
  (nicht 12 — der Governance-Test liegt seit 2026-08-03 im Archiv), seit C-02
  zwölf Dateien mit **60 Tests / 13 Suites / 0 Fehlschlägen**.
  `dependsOn ^build` der test-Task entfernt (Unit-Tests brauchen keine
  Buildartefakte); Cache-Kante zu `packages/shared` über
  `inputs: [$TURBO_DEFAULT$, $TURBO_ROOT$/packages/shared/src/**]`
  geschlossen und per Sonde belegt (Hit → shared-Änderung → Miss → Revert → Hit).

- [ ] **C-10: UI-Zahlen gegen DB prüfen** — die App-Shell zeigt
  „117 Nährstoffe · BLS 10.840" als Literale. `[cmd]` Tatsächlich in der DB:
  138 `nutrient_defs`, 7.140 `foods`. Zahlen korrigieren oder aus der DB lesen.

- [ ] **C-12: Duplikatschutz für die übrigen fünf target_types**
  (neu 2026-08-05) — `[cmd]` `uq_food_pref_items_user_food` sichert nur
  `target_type='food'` (partiell `WHERE food_id IS NOT NULL`). Für `category`,
  `tag`, `cuisine`, `exclusion_preset` und `catalog_item` fehlen die analogen
  partiellen UNIQUE-Indizes — sie gehören zum jeweiligen Schreibpfad, konkret
  **vor** den Preset-/Profil-Schreibpfad in Settings.
  **Tragende Begründung, hier festgehalten:** der CHECK
  `food_preference_items_exactly_one_target` erzwingt genau EIN gesetztes
  Zielfeld je Zeile — dadurch sind die partiellen Indizes trennscharf: jede
  Zeile fällt in genau einen Index, Überlappung ist konstruktiv ausgeschlossen.
  Bisher stand das nur als Kommentar in `050_preferences_foundation.sql`.

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

- [ ] **D-04: E2E- und Testbasis klären** — angepasst 2026-08-04: `[cmd]`
  `apps/web/e2e/` ist **leer** — die einzige Spec (Governance-Smoke) und
  `playwright.governance.config.ts` liegen seit 2026-08-03 in
  `_archive/governance/`; im Repo existiert damit gar keine Playwright-Config
  mehr, `@playwright/test` steht noch in den Root-devDependencies.
  Offen (unverändert): E2E für Produktrouten — jetzt konkret auch der
  Toggle-Flow aus C-02. Der Unit-Runner ist seit C-09 da.

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

- [x] **D-08: supabase-js vs. Docker-SQL** — **entschieden und umgesetzt 2026-08-03.**
  `[cmd]` `apps/web` liest über supabase-js; kein `docker exec`, kein
  `child_process`, kein Containername im Code. Die fünf gewachsenen Abfragen
  wurden zu Postgres-Funktionen (Kettenschritt 070), die String-Interpolation
  der alten SQL-Builder ist damit entfallen. Grundsatz in
  `docs/spezifikation/90-entscheidungen/ADR-0001-datenzugriff.md` — direkter
  Zugriff für jetzt, eigene Modul-APIs als Zielbild.

- [x] **D-10: Port-Kollision im Governance-Rest** — **erledigt 2026-08-04:
  hinfällig.** Der im Punkt vorgesehene Fall („bei Entfernung hinfällig") ist
  eingetreten: `orchestrator-api` und `wo-classifier` liegen seit 2026-08-03
  in `_archive/governance/services/` (`[cmd]` 476 Umbenennungen per `git mv`,
  Commit 59cb41e).

- [ ] **D-15: `supabase/migrations-draft/` einordnen** (neu 2026-08-02) —
  durch beide Verifikationsläufe überholt. Verwerfen oder als Referenz behalten.

- [ ] **D-16: `021_wild_category_apply.sql` klären** (neu 2026-08-02) —
  läuft ohne sichtbaren Effekt. `[annahme]` durch 020 abgedeckt, ungeprüft.

- [ ] **D-17: Migrationsregister-Strategie** (neu 2026-08-02) — das Register
  ist nach der Archivierung faktisch leer. Entscheiden: Kette in reguläre
  Migrationen überführen oder als dokumentierter Ablauf belassen.

- [x] **D-18: Die vier Control-Plane-Tabellen in `public` entfernen** — **erledigt 2026-08-03**
  (neu 2026-08-04) — `workorders`, `governance_artefacts`, `execution_tokens`,
  `wo_failure_events` samt der vier April-Workorders sind der letzte lebende
  Rest des Governance-Clusters (Code archiviert, die beiden Migrationen seit
  2026-08-02 in `supabase/_archive/`). **Tom arbeitet parallel daran**;
  Sicherung liegt bereit (`[cmd]` 2026-08-04: untracked
  `backup/schema/2026-08-03_public_vor_drop.sql`).
  *Datenbankeingriff — nicht nebenbei ausführen.*

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

## Erledigt am 2026-08-05

- [x] Theming tragfähig (Block 4 B): Themes als Einzeldateien mit Registry und
  Token-Vertrag (Konstantenliste + Vertragstest im pnpm-test-Gate); neues
  Theme = genau zwei Dateien, per Probe belegt; `data-theme`/`data-mode`
  server-gerendert aus Cookies (kein Aufblitzen), Umschalter in der Topbar;
  42 tote gov-Festfarben entfernt — `globals.css` farbwertfrei (0 hex/rgba)
- [x] Vorbestehenden Build-Bruch behoben: `/dashboard` fiel aus den
  typedRoutes, weil `app/page.tsx` das Seitenmodul importierte —
  `dashboard-view.tsx` extrahiert, `pnpm build` grün (24 Routen)
- [x] Vier Bibliotheken (Block 4 A): shadcn/ui-Fundament, lucide-react,
  Recharts, Framer Motion — Versionen und Abbildung siehe C-01

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
