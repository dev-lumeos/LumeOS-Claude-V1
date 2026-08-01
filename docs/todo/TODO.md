# TODO — LumeOS

**Stand:** 2026-08-01
**Konvention:** `[ ]` offen · `[~]` in Arbeit · `[x]` erledigt · *Blocker kursiv*
**Herkunft:** fortgeführt aus `docs/_archive/ist-zustand/03-todo.md` (Stand 2026-07-30),
ergänzt um die Funde der Sitzung 2026-08-01.

---

## A — Struktur & SSOT (laufend)

- [~] **A-01: SSOT-Ordner aufbauen** (`docs/ssot/`)
  1. [x] `00-INDEX.md` — Einstieg, Marker-Legende, Rangfolge
  2. [x] `10-workspace.md` — Inventar 59 Verzeichnisse, 17 lebend
  3. [ ] `11-zielarchitektur.md` — 5 Apps + Services aus den Specs ableiten
  4. [ ] `20-apps-web-ist.md` — Routen, Fachlogik, Stack-Lücke
  5. [ ] `30-datenbank.md` — Live-Schema vs. Diary-Entwurf
  6. [ ] `40-spec-code-matrix.md` — je Modul Spec/Code/Delta
  7. [ ] `50-governance-rest.md` — was physisch bleibt und warum

- [ ] **A-02: `CLAUDE.md` ausdünnen** — nur Schreibregeln plus Verweis auf
  `docs/ssot/00-INDEX.md`. Alle Fakten raus. *Grund: der Satz „services/ ist leer"
  stand als Regel drin und war falsch.*

- [ ] **A-03: Altlast archivieren** nach `docs/_archive/`:
  `docs/todos/` (11 Dateien, alle Spark/System), `docs/governance/`,
  Governance-Teil von `docs/project/`, `docs/ist-zustand/`

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

---

## C — Produkt: apps/web

- [ ] **C-01: Frontend-Stack-Lücke schliessen** — `[cmd]` `apps/web/package.json`
  gegen `docs/specs/WebPlatform/INDEX.md`: 10 von 13 deklarierten Bibliotheken fehlen.
  Vorhanden: Next.js 14, React 18, Tailwind, Supabase SSR.
  Fehlt: shadcn/ui, lucide-react, Recharts, @dnd-kit, Zustand, TanStack Query,
  react-hook-form, zod, date-fns, idb/next-pwa, Framer Motion.
  *Entscheidung nötig: alles auf einmal oder je Feature nachziehen.*

- [ ] **C-02: WP-01 Preferences-Schreibpfad** (übernommen aus 2026-07-30)
  1. [ ] Migration `nutrition.food_preferences` (+ `food_preference_items`)
     — *blockiert durch ADR-002 (Tabellendesign)*
  2. [ ] `src/lib/nutrition/preferences-write.ts`
  3. [ ] `preference-search-preview.ts` liest echte DB-Preferences
  4. [ ] API `POST/DELETE /api/nutrition/preferences`
  5. [ ] UI `foods/page.tsx`: Favorit/Ausschluss-Toggles
  6. [ ] Unit-Tests
  7. [ ] Abnahme: Favorit gewichtet Suche, Ausschluss entfernt Treffer,
     Zustand überlebt Container-Neustart

- [ ] **C-03: WP-02 Diary-Verdrahtung** — `db/schema/nutrition.sql` anschliessen
  oder verwerfen. *Blockiert durch ADR-003 (Modellkonflikt EAV vs. flach)*
- [ ] **C-04: WP-03 Daily Summary** — hängt an C-03
- [ ] **C-05: WP-04 Water Tracking** — `water_logs` fehlt komplett
- [ ] **C-06: WP-05 erstes Mock-Modul echt machen** — Kandidat Goals, Spec liegt bereit

- [ ] **C-07: `packages/shared` und `packages/types` verdrahten** — beide enthalten
  Produktcode (Supabase-Clients, Nutrition-Typen), werden von `apps/web` aber nicht
  importiert. Nutzen oder entfernen.

- [ ] **C-08: `services/nutrition-api` einordnen** — Hono-Service, 4 Dateien,
  von niemandem importiert, während `apps/web` direkt per SQL gegen Docker geht.
  Zielbild oder verwaister Versuch? *Antwort Tom: Teil des Endausbaus.*

---

## D — Datenbank & Specs

- [ ] **D-01: Quelle der Curation-Tabellen finden** —
  `nutrition.food_curation_candidates` und `.food_curation_decisions` werden vom Code
  genutzt, stehen aber in keiner Migration. `[annahme]` manuell angelegt. Nachweis offen.
- [ ] **D-02: Slice-Migrationen dokumentieren** — `20260513_001/002`, `20260514_001`
  enthalten keine `CREATE TABLE`. Inhalt festhalten.
- [ ] **D-03: `supabase/snippets/`** (3 unbenannte SQL-Dateien) einordnen oder löschen.
- [ ] **D-04: E2E-Basis anlegen** — `playwright.config.ts` existiert, kein Testverzeichnis.
- [ ] **D-05: Spec-Audit starten** — `docs/specs/` (13 Module, ~1,5 MB) auseinandernehmen,
  Diskrepanzen suchen, pro Modul offizielle Spec deklarieren. *Eigene Sitzung, Fable 5.*
- [ ] **D-06: ADRs nach `docs/decisions/` überführen** — Register liegt in
  `docs/_archive/ist-zustand/04-adr-liste.md`, Nutrition-ADRs in
  `docs/specs/Nutrition/04_adrs/` (12 Stück).
- [ ] **D-07: README „Phase 1B"** nach C-02 aktualisieren.
- [ ] **D-08: supabase-js vs. Docker-SQL klären** — `apps/web` deklariert
  `@supabase/supabase-js`, nutzt es aber nicht; `food-search.ts:6` geht per SQL
  gegen den lokalen Container. Der Diary-Entwurf zeigt dagegen RLS + `auth.uid()`.
  *Architekturentscheidung von Tom nötig.*

---

## Erledigt am 2026-08-01

- [x] `services/` und `packages/` sind deklariert, aber leer
  → **widerlegt.** `[cmd]` 17 Packages mit Code, 42 leere Gerüste als Endausbau deklariert.
- [x] Build-/Test-Verifikation nachholen, sobald Shell antwortet
  → **erledigt.** `[cmd]` `pnpm typecheck` 17/17 grün, 3,9 s.
- [x] Permission-Schicht gebaut und verifiziert (B-01)
- [x] `settings.local.json` bereinigt (B-02)
- [x] Secret-Prüfung: `.env*` nie committed, `.gitignore` deckt ab
- [x] SSOT-Ordner begonnen: `00-INDEX.md`, `10-workspace.md`

## Erledigt am 2026-07-30

- [x] Bestandsaufnahme Repo + `apps/web`
- [x] Modulakte Nutrition
- [x] Spec↔Code-Abgleich Nutrition
- [x] Todo- und ADR-Liste angelegt
