# TODO — LumeOS

**Stand:** 2026-08-06 (sechzehnte Aktualisierung — Block 12 geschlossen: B-21/C-04/B-22/D-04 erledigt. Das Gate erfasst jetzt alle Pakete, die Datenbankrechte sind wiederholbar prüfbar, die E2E-Frage ist entschieden. Tagessumme als Sicht mit `security_invoker` live; offener Redirect in `/auth/callback` gefunden und behoben. Werkzeugarbeit abgeschlossen, Reihenfolge auf die Diary-Oberfläche umgestellt)
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
   **Ausgebaut 2026-08-06 (Blöcke 11/12):** Das Diary hat jetzt eine
   vollständige Datenseite — `nutrition.meals` und `nutrition.meal_items`
   mit eingefrorenen Nährwerten (C-03, ADR-0003, Kettenschritt 052) und
   die Tagessumme als Sicht (C-04, Kettenschritt 053), beide live.
   **Was fehlt, ist ausschliesslich die Oberfläche** — UI und API-Route
   wurden bewusst zurückgestellt, bis der Aggregationsweg entschieden
   war. Er ist es.
4. **M4 — Cloud-Deployment** (→ Sektion E) — Registerlage bereinigt:
   D-17, D-19 und D-20 sind erledigt (Baseline, Register umgetragen,
   Gegenprobe `1|0|1`, README-Kette vollständig, Auth-Stub im
   Baseline-Kopf). **Offen als Voraussetzungen: B-13-Rest**
   (Produktions-`site_url`/Redirect-Liste je App und Umgebung) **und die
   Vorarbeiten E-01 bis E-03**.


## Bearbeitungsreihenfolge (Empfehlung, Stand 2026-08-06, nach Block 12)

**Die Werkzeug- und Prüfarbeit ist abgeschlossen.** Nach Block 12 sind
B-21, B-22 und D-04 erledigt; damit ist die Reihe abgearbeitet, die mit
B-18/B-19 begann. Konkret heisst das:

- Das Gate erfasst jetzt **alle** Pakete — `[cmd]` `nutrition-api` wurde
  vorher gar nicht geprüft und meldete trotzdem Erfolg (B-21).
- Die Datenbankrechte sind **wiederholbar** prüfbar, mit einem Befehl und
  Exit-Code (B-22) — die Lücke, durch die der Curation-Bug rutschte.
- Die E2E-Frage ist **entschieden statt offen** (D-04): kein Gerüst jetzt,
  Wiedervorlage benannt, und der Weg dorthin hat einen offenen Redirect
  gefunden und behoben.

**Damit steht die Modularbeit vorn — und diesmal ohne Vorbehalt.**

1. **Modularbeit: C-05 → C-06, dann die Oberfläche zu C-03/C-04.**
   Die Datenseite des Diary steht (C-03 Tabellen, C-04 Tagessumme, beide
   live). **Was fehlt, ist die Oberfläche**: UI und API-Route wurden in
   C-03 und C-04 bewusst nicht gebaut, weil erst der Aggregationsweg
   feststehen musste. Er steht jetzt. Das ist der nächste sichtbare
   Schritt — und der Punkt, an dem laut D-04 auch E2E wieder lohnt.
   Danach Water (C-05) und das erste echt gemachte Mock-Modul (C-06,
   Kandidat Goals — vorher die zwei Bugs aus
   `docs/specs/Goals/OPEN_ITEMS.md`).
2. **C-12, sobald der Preset-/Profil-Schreibpfad ansteht** — die
   partiellen Uniques für die fünf übrigen Zieltypen gehören **vor** den
   jeweiligen Schreibpfad, nicht danach (Begründung in ADR-0002).
3. **Audits, wenn sie den Weg kreuzen:** C-07-Rest (types), C-08
   (`nutrition-api` einordnen — durch B-21 wird er jetzt geprüft, die
   Einordnung bleibt offen), C-10, D-05.
4. **Entscheidungspunkte auf Zuruf (Tom):** A-05 (Löschlauf), A-10
   (Wurzel-Restaltlast), A-08, B-07-Rest, B-10-Rest
   (`/plugin uninstall ijfw@ijfw`).
5. **Umgebung:** B-20 (Codex-Pfadschutz — vorher die stdin-Frage
   klären; `[cmd]` von Block 12 nicht berührt), B-11, B-17 (niedrig).
6. **Deployment nach den Modulen:** B-13-Rest, E-01–E-03 (Dump als
   Vorstudie — Achtung: Dump vom 2026-03-05 ist älter als die
   2026-08-01-Messungen), dann E-04 ff.
7. **A-06** läuft parallel bei Tom; **B-12** wartet konzeptbedingt auf
   die zweite App; **C-14** (Kuration nach `apps/admin`) wartet auf die
   Admin-App.


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

- [x] **A-02: `CLAUDE.md` ausdünnen** — **erledigt 2026-08-06
  (Block 9):** `[cmd]` 122 → 60 Zeilen. Enthält bewusst keinen
  Repo-Zustand mehr — nur Rolle, Verweistabelle auf
  SSOT/TODO/Spezifikation/READMEs und Schreibregeln (ergänzt um Marker-
  und Wegwerf-DB-Regel). Der historische Fehlersatz „Keine Writes, kein
  Auth“ steht nur noch als zitierte Warnung, warum Zustandssätze dort
  verboten sind. ijfw-Restmarker entfernt (B-10), gstack auf zwei
  Verhaltensregeln gekürzt. D-07 ist damit für CLAUDE.md abgearbeitet.

- [x] **A-03: Altlast archivieren** — **erledigt (festgestellt im Audit
  2026-08-05):** `[cmd]` `docs/todos/`, `docs/governance/` und
  `docs/ist-zustand/` sind leer; `docs/_archive/` enthält governance/,
  ist-zustand/, project/, todos/ samt Löschliste. Der Governance-Teil von
  `docs/project/` ist verschoben; verblieben sind dort Produkt- und
  GSTACK-Dokumente.

- [x] **A-04: `BrainstormDocs/_ARCHIVE_NOTICE.md` korrigieren** — **erledigt
  (festgestellt im Audit 2026-08-05):** `[cmd]` die Notice verweist bereits
  auf `docs/ssot/00-INDEX.md`, `docs/spezifikation/00-INDEX.md` und
  `docs/todo/TODO.md`; die drei bemängelten Altlast-Verweise kommen nicht
  mehr vor (0 Treffer).

- [ ] **A-05: Repo-Müll entfernen** (untracked) — Stand Audit 2026-08-05:
  `[cmd]` alle 12 Bestände liegen noch (`temp/` 16,5 GB, `tmp/`,
  `.wayland-core/`, `.wayland/`, `.ijfw/`, `ijfw/`, `_tmp_inventory/`,
  `backup_system.zip`, `services.zip`, `system.zip`, `nul`,
  `.codex-governance-ui.log`).
  **Die tmp/-Rückhaltebedingung ist entfallen:** D-12 ist seit 2026-08-02
  bewiesen (Kette läuft vollständig aus dem `supabase/_data/`-Zip) —
  `tmp/` ist zur Löschung frei. `temp/lumeosold/` bleibt ausgenommen
  (Prod-Dumps der Vorgängerinstanz; ein Duplikat liegt als Zip unter
  `backup/legacy-v2/` — vor Löschung gegenprüfen).
  Dazu offen (Entscheidung Tom): `.gitignore`-Vorschlag `apps/web/.next*/`
  für beiseitegeschobene Build-Verzeichnisse.
  *Regel bleibt: jeder untracked Ordner wird vor Löschung inhaltlich
  geprüft, nicht nur dem Namen nach.*

- [ ] **A-06: Design-System spezifizieren** — Stand Audit 2026-08-05:
  `[cmd]` `docs/spezifikation/10-plattform/design-system/` ist **nicht mehr
  leer** — `00-diskussionsstand.md` liegt vor. Quellen weiterhin:
  `docs/design-system/` (DESIGN_CONCEPT, components, tokens), `packages/ui`
  (Gerüst), Altbestand-Specs mit OKLCH-Tokens.
  **Kein Blocker für M2** (umgestuft 2026-08-05) — Design läuft parallel
  bei Tom, gearbeitet wird modulweise mit dem bestehenden Token-Satz; die
  elf Modul-Akzente bleiben unangetastet und weiterhin nicht in
  `tailwind.config.js` gespiegelt.
  A-06-Material: shadcn-Komponenten nutzen `rounded-md` (6 px fest) statt
  der Token-Radien `rounded-token*` — ein Theme steuert die shadcn-Radien
  damit nicht; bei der Design-Entscheidung mitbehandeln.
  Betrifft alle sieben Apps.

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

- [x] **A-09: Root-README sanieren** — **erledigt 2026-08-06 (Block 9):**
  `[cmd]` 73 Zeilen, vollständig neu geschrieben: Produktbeschreibung mit
  ehrlichem Ist (echt vs. Attrappe), Loslegen-Sequenz für den frischen
  Klon, Strukturübersicht, Verweise auf SSOT/Konventionen. Spark-Tabelle,
  Brain/Law/Muscle und `system/`-Verweise restlos raus (0 Treffer).
  Gate-Sektion (B-14) inhaltlich geprüft und erhalten, ergänzt um den
  Hinweis auf den protect-paths-Hook samt gewolltem `.env`-Lese-Block.

- [ ] **A-10: Restaltlast im Wurzelverzeichnis** (neu 2026-08-06,
  Entscheidungspunkt Tom) — `[cmd]` `COMMANDS.md`: der Kernbefehl zeigt
  auf das archivierte `start-all.ps1`, drei Treffer auf gelöschte Hooks;
  die lebenden Befehle stehen inzwischen im README → Vorschlag: per
  `git mv` nach `_archive/governance/`. `.codex-governance-ui.log`
  (53 Zeilen Next-Startup-Log der alten Governance-UI) → gehört in den
  A-05-Löschlauf und steht dort schon. Bekannte Kandidaten derselben
  Runde: `AGENTS.md`, `STACK_REFERENCE.md`, `SESSION_ONBOARDING.md`
  (44 `system/`-Treffer) sowie `project.profile.json` (kein Leser im
  lebenden Code, Vorschlag aus Block 8: archivieren).

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

- [ ] **B-13: `site_url`/Rückleitadressen — Rest: Pflegeort und
  Produktions-URLs** — der Kern ist seit M3 erledigt: `[cmd]`
  `supabase/config.toml` steht auf `http://localhost:3200` +
  `/auth/callback`, die Anmeldung läuft; der frühere Zustand
  (127.0.0.1:3000, „blockiert jeden Anmeldeversuch") ist überholt.
  **Offen:** Produktions-`site_url` (Vercel-Adresse, später Domain) und wo
  die Redirect-Liste für sieben Apps und drei Umgebungen gepflegt wird.
  M4-Voraussetzung.

- [x] **B-01: Permission-Schicht aufgebaut** — `[cmd]` `.claude/settings.json`
  mit 14 Deny / 7 Ask / 13 Allow. Verifiziert: `git push --dry-run` wurde geblockt,
  `pnpm typecheck` lief ohne Nachfrage.

- [x] **B-02: `settings.local.json` bereinigt** — von 47 gewachsenen Allow-Regeln
  auf 0 zurückgesetzt, nur lean-ctx-Hooks bleiben. Sicherung:
  `.claude/settings.local.json.bak-2026-08-01`.
  *Kritisch war `Bash(powershell -Command:*)` — ein Generalschlüssel, der jede
  Deny-Regel umging, zusammen mit `git add *` und `git commit -m ' *`.*

- [x] **B-03: `Bash(rm:*)`-Deny verifizieren** — **erledigt 2026-08-05:
  explizit provoziert.** `[cmd]` `rm <pfad>` im Audit ausgeführt →
  „Permission … has been denied" — die Deny-Regel wirkt. (Zuvor am
  2026-08-04 bereits zweimal implizit ausgelöst.)

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

- [x] **B-06: Herkunft des `PowerShell`-Deny klären** — **erledigt (Audit
  2026-08-05): gegenstandslos.** `[cmd]` Die Nutzer-settings.json enthält
  keine PowerShell-Regel; der Eintrag liegt sichtbar als `ask` in
  `.claude/settings.json:40` (seit der Umstellung deny→ask am 2026-08-03).
  Das Rätsel „keine gefundene Datei liefert ihn" existiert nicht mehr.

- [ ] **B-07: `skipAutoPermissionPrompt` — Entscheidung steht aus** —
  Prüfteil erledigt (Audit 2026-08-05): `[cmd]` der Schlüssel steht in
  `~/.claude/settings.json` auf **true** — die vermutete Ursache für die
  47 unbemerkt gewachsenen Allow-Regeln ist real. **Offen: die
  Entscheidung** (Tom) — abschalten oder bewusst belassen. Es ist eine
  Sicherheitseinstellung der Nutzerkonfiguration: lesen ja, ändern nein.

- [x] **B-08: SessionEnd-Hook falsch verortet** — **erledigt 2026-08-06
  (Block 8):** `[cmd]` der Eintrag mit hartkodiertem Repo-Pfad ist aus
  `~/.claude/settings.json` entfernt (Sicherung
  `settings.json.bak-2026-08-06` daneben); beide
  lean-ctx-PreToolUse-Ketten nachweislich intakt. Der Hook selbst war
  ein Wrapper für das deaktivierte claude-mem-Plugin und ging mit dem
  alten Hook-Satz (B-15) — „in die Projekt-Settings“ war damit
  gegenstandslos, es blieb „weg“.

- [x] **B-09: Encoding-Schäden** — entschärft, erledigt 2026-08-02.
  `[cmd]` `packages/shared/src/supabase/client.ts` ist sauber (Bytes `E2 80 94` =
  korrekter Geviertstrich; der Befund war ein Konsolen-Anzeigefehler).
  Echter Schaden nur in `20240522_002` (`k?se`, `n?sse` — literales 0x3F) —
  die Datei liegt jetzt in `supabase/_archive/` und wird nicht mehr
  ausgeführt. Folgenlos.

- [ ] **B-10: ijfw-Plugin vollständig abschalten** — **2026-08-05 verfrüht
  auf erledigt gesetzt, am 2026-08-06 zurückgenommen.**
  Die damalige Abschaltung (`enabledPlugins: {"ijfw@ijfw": false}`,
  MCP-Server umbenannt auf `_disabled_ijfw-memory` in der
  Nutzer-`settings.json`) griff an genau einer von vier Stellen — und das
  war die wirkungsloseste. `[cmd]` Am 2026-08-06 schrieb das Plugin den
  IJFW-Block in `CLAUDE.md` (+6 Z.) und das ijfw-Frontmatter in
  `AGENTS.md` (+104 Z.) zurück und überschrieb damit das A-02-Ergebnis.
  Ursache: **das Plugin bringt seine Verdrahtung selbst mit.**
  `~/.ijfw/claude/.mcp.json` deklariert `ijfw-memory` eigenständig — das
  Umbenennen in der Nutzerkonfiguration entfernte nur eine redundante
  zweite Deklaration. `~/.ijfw/claude/hooks/hooks.json` deklariert sieben
  Hook-Punkte (SessionStart, Stop, PreCompact, UserPromptSubmit,
  PreToolUse ×4, PostToolUse). Zusätzlich lief es zweigleisig:
  `~/.codex/hooks.json` (7 ijfw-Hooks) und
  `~/.codex/config.toml` `[mcp_servers.ijfw-memory] enabled = true`.
  `[cmd]` Sechs Node-Prozesse liefen (2× `mcp-server/src/server.js`,
  4× `dashboard-server.js --daemon`), Port 37894 aktiv, gestartet 09:40 —
  also nach der Abschaltung.
  Am 2026-08-06 erledigt: Prozesse beendet, alle vier Ladequellen
  entschärft (Suffix `-disabled-2026-08-06`, `enabled = false`,
  Sicherung `config.toml.bak-2026-08-06-ijfw`), `CLAUDE.md`/`AGENTS.md`
  zurückgesetzt. Gegenprobe `[cmd]`: 0 ijfw-Prozesse, Port frei.
  **Offen bleibt:** `/plugin uninstall ijfw@ijfw` — der Eintrag steht noch
  in `installed_plugins.json`, ein Plugin-Update könnte die umbenannten
  Dateien neu anlegen. Erst danach ist der Punkt zu.
  **Prüfregel, die hieraus folgt:** Aus einer Konfigurationsdatei folgt
  nicht die Wirkung. Nach dem Abschalten eines Plugins gehören Prozessliste
  und offene Ports geprüft, und zwar für **jede** Werkzeugkette getrennt —
  Claude Code und Codex haben eigene Verdrahtung.

- [ ] **B-11: Worktree-Regel für parallele Agenten** (neu 2026-08-01) —
  `[cmd]` Prozessliste zeigte gleichzeitig einen Codex-Prozess (seit 09:19),
  eine zweite Claude-Instanz (seit 10:58) und diese Sitzung, alle auf demselben
  Working Tree. *Die Permission-Schicht prüft einzelne Aufrufe, nicht
  Gleichzeitigkeit — genau die Konstellation, aus der der Big Bang entstand.*
  Regel festlegen: `claude --worktree` oder getrennte Branches je Agent.
  Zusatz: `desktop-commander` umgeht die Permission-Schicht vollständig;
  risikoreiche Schritte gehören in eine Claude-Code-Session.

- [x] **B-14: `pnpm build` ins Prüf-Gate aufnehmen** — **erledigt
  2026-08-05: Gate geschaffen, nicht erweitert.** `[cmd]` Vorher existierte
  KEIN automatisch auslösendes Gate: `core.hooksPath` ungesetzt, keine
  aktiven Hooks, CI seit 2026-04-23 deaktiviert. Gebaut: Root-Script
  `gate` (= `turbo run typecheck test build`), versionierter
  `.githooks/pre-commit` (Aktivierung `git config core.hooksPath .githooks`,
  im README dokumentiert), Build-Cache-Kante
  `$TURBO_ROOT$/packages/shared/src/**` in der build-Task.
  Zwei getrennte Nachweise: (a) `[cmd]` `pnpm gate` wird rot bei künstlich
  wiederhergestelltem Seitenmodul-Import — test/typecheck grün, nur build
  scheitert mit dem historischen /dashboard-Fehler; (b) `[cmd]` (Tom) der
  Hook blockt einen echten `git commit`: Typfehler-Datei gestaged,
  „[gate] ROT — Commit abgebrochen", Exit 1, HEAD unverändert a1a2804.
  Bekannte Einschränkung (bewusst, im README): der Hook prüft den Working
  Tree, nicht den Index — bei Scheiben-Commits kann ein Commit grün
  durchlaufen, der für sich allein nicht baut. Betriebsregel: `next dev`
  und Gate nicht gleichzeitig — geteiltes `.next`, sonst TS6053 auf
  `.next/types/**`. Ursprungsbegründung: der /dashboard-Bruch lag vor,
  während test und typecheck grün waren (Worktree-Repro auf 7140829).

- [x] **B-15: `system/` wird wieder beschrieben — Verursacher
  abgeschaltet** — **erledigt 2026-08-06 (Block 8):** Verursacher BELEGT
  statt vermutet: `.codex/hooks/post-tool.ps1`, verdrahtet über
  `.codex/hooks.json` aus der parallelen Codex-Sitzung. `[cmd]` Laborlauf
  einer Skriptkopie mit isoliertem Root erzeugte einen formatgleichen
  Eintrag; der hartkodierte `orchestration_mode: claude_code`-Marker im
  Log hätte in die falsche Richtung gewiesen. Danach der gesamte alte
  Hook-Satz entfernt (6 Dateien unter `.claude/hooks/` und
  `.codex/hooks/`, Konfigurationen zuerst bereinigt) und **`system/`
  ersatzlos entfernt** (Inventar vor Löschung: 1 Datei, 13 Zeilen).
  Folgepunkt: B-20 — Codex ist seither ohne Pfadschutz.
- [x] **B-16: B-04-Hook — Falsch-Positive auf Dokumentationstext
  eingegrenzt** — **erledigt 2026-08-06 (Block 8):** `protect-paths.ps1`
  prüft bei Bash nur noch Tokens in Befehlsposition je Segment plus
  Redirections; Heredoc-Körper werden vor der Analyse entfernt. Lücken
  benannt im Dateikopf (Heredocs an Interpreter, Variablen-Indirektion,
  endliche Befehlslisten); der gewollte `.env`-Lese-Block samt
  Demo-Key-Ausweg ist dort dokumentiert. `[cmd]` Toms unabhängige
  Testbatterie: zehn Fälle, alle korrekt — geblockt `cat .env.local`,
  verkettetes `sed` auf `.env.local`, `echo >`- und `cp`-Schreiben nach
  `supabase/migrations/`, `Read .env.local`; durchgelassen `echo` mit
  `.env` im Text, Heredoc über `migrations/` und `Bash(rm:*)`,
  `Read package.json`, `pnpm test`, das LESEN aus `migrations/`.
  **Korrektur der Zählung im Ursprungstext: es war EIN Falsch-Positiv**
  (Statuspflege-Heredoc); die beiden Block-7-Fälle waren
  Richtig-Positive (echtes Schreiben und `git mv` nach `migrations/`),
  denen der Lauf regelkonform per Skriptdatei auswich.
- [ ] **B-17: Pre-Commit-Gate prüft Working Tree, nicht Index**
  (neu 2026-08-06, niedrig) — bei Scheiben-Commits kann ein Commit grün
  durchlaufen, der für sich allein nicht baut (die Heilung liegt im
  Working Tree). Bewusst so belassen (Index-Checkout je Commit kostet
  Laufzeit und Komplexität), im README dokumentiert — hier als Vermerk,
  damit es als bekannte Eigenschaft geführt wird.
- [x] **B-18: Getrennter `distDir` fürs Gate** — **erledigt 2026-08-06
  (Block 10, Commit 8de0282). Zwei Ursachen, nicht eine.**
  Der Auftrag hiess „eigener `distDir`“ — das allein hat es **nicht**
  behoben. `[cmd]` Nach der Verzeichnistrennung trat TS6053 weiter auf,
  nur mit `.next-gate`-Pfaden: **3 von 5 Läufen rot.** Zweite Ursache war
  die Nebenläufigkeit *innerhalb* des Gates: turbo startete `typecheck`
  und `build` desselben Pakets gleichzeitig, der Build räumte
  `.next-gate/types` ab, während `tsc` daraus las.
  Gebaut: (a) `distDir` über `LUMEOS_DIST_DIR`, gesetzt in
  `apps/web/scripts/gate-build.js` (Node-Wrapper statt `cross-env` — kein
  neues Paket); Dev-Server bleibt ohne die Variable auf `.next`;
  tsconfig `include` listet **beide** types-Pfade. (b) `typecheck`
  hängt in `turbo.json` jetzt auch am **eigenen** `build`
  (`dependsOn: ["^build", "build"]`).
  Abnahme `[cmd]`: **6 von 6** `pnpm gate --force` grün, **während**
  `next dev` auf Port 3200 bediente (HTTP 200 vorher wie nachher) —
  derselbe Befehl, der vorher reproduzierbar rot wurde. Beide
  Verzeichnisse bestehen getrennt; `tsc --listFiles` zieht 24 Typdateien
  aus `.next-gate/types` und 3 aus `.next/types`, die Prüfung ist also
  mitgewandert, nicht verlorengegangen. Gegenprobe Schutznetz: künstlich
  falsche Route → TS2769, Exit 2 (die /dashboard-Fehlerklasse wird
  weiterhin erkannt), Datei per `git checkout` zurückgesetzt.
  Laufzeit: warm 0,8 s (FULL TURBO, unverändert), kalt 17–24 s.
  Die Betriebsregel aus B-14 ist damit **gegenstandslos** und im README
  entsprechend berichtigt (nicht nur gestrichen).
- [x] **B-19: Ignore-Regeln gegen den Index prüfen** — **erledigt
  2026-08-06 (Block 10, Commit 0f30263).** `[cmd]`
  `git ls-files -i -c --exclude-standard` **von 28 auf 0**.
  Vier Fälle, einzeln bewertet statt pauschal aufgelöst:
  1. `.codex/` — **war entgegen der Annahme NICHT eingegrenzt**, stand
     noch pauschal im Wayland-Block; `hooks.json` (lean-ctx-Hooks, echte
     Projektkonfiguration) darunter getrackt. Pauschalregel raus, statt
     dessen gezielt `.codex/*.log` und `.codex/settings.local.json`.
  2. `_archive/.../reports/runs/` (20) und `.../dossiers/` (4) — Regeln
     entfernt: `[cmd]` 20/20 bzw. 4/4 getrackt, keine untrackte Datei
     daneben; das Archiv ist seit 2026-08-04 eingefroren, dort entsteht
     nichts mehr.
  3. `_archive/.../state/pipeline-metrics.jsonl` (1) — Regel entfernt,
     gleiche Lage.
  4. `_archive/governance/onyx-seed/` — **eingegrenzt statt aufgelöst:**
     `[cmd]` 107 Dateien auf Platte, davon 2 getrackt (der Bericht zur
     Archivierung). Die übrigen 105 bleiben ignoriert.
  Der Rest des Blocks bleibt stehen — `[cmd]` jene Pfade sind
  nachweislich untrackt und weiterhin lokale Laufzeitreste.
  Gegenprobe `[cmd]`: je aufgelöstem Ort eine neue Datei angelegt — alle
  vier erschienen im Status, die onyx-seed-Sonde blieb korrekt ignoriert,
  beide Ausnahme-Dokumente sichtbar; danach alle fünf Sonden entfernt.
  **Nebenbefund, der Zeit spart:** Ein Verzeichnis-Pauschalmuster
  (`ordner/`) lässt keine Ausnahme darin zu — git steigt in ein so
  ausgeschlossenes Verzeichnis gar nicht erst ab. Es braucht Dateimuster
  (`ordner/*`) je Ebene plus `!`-Ausnahmen.
- [ ] **B-20: Codex-Pfadschutz wiederherstellen** (neu 2026-08-06) —
  seit dem Aufräumen (B-15) hat Codex keinen Pfadschutz; vorher einen,
  der bei jedem Aufruf am Parser scheiterte — Wirkung null, die Absicht
  bestand. Vorlage aus Block 8: `protect-paths.ps1` in
  `.codex/hooks.json` einhängen, Matcher `Write|Edit|MultiEdit` und
  `Bash`. **Zuerst zu klären:** `[annahme]` ob Codex stdin-JSON
  liefert — die alte Verdrahtung übergab per `param()`; liefert Codex
  kein stdin-JSON, liest der Hook Leere und ist fail-open, also erneut
  wirkungslos; dann braucht es einen kleinen Wrapper param→stdin.
  Dazu die drei Pfade, die der alte Hook abdeckte und protect-paths
  nicht: `supabase/config.toml`, `db/migrations/`, `.claude/rules/`.

- [x] **B-21: `nutrition-api#build` erzeugt keine Outputs — turbo warnt bei
  jedem Lauf** (neu 2026-08-06, klein, vorbestehend) — `[cmd]` Jeder
  `pnpm gate`-Lauf endet mit
  „`WARNING no output files found for task @lumeos/nutrition-api#build.
  Please check your outputs key in turbo.json`". Ursache `[cmd]` gefunden,
  nicht vermutet: `services/nutrition-api/` hat **keine eigene
  `tsconfig.json`**; das Skript `build` ruft schlicht `tsc`, das daraufhin
  die Wurzel-`tsconfig.json` auflöst — und die trägt `noEmit: true`.
  Der Build kann also konstruktionsbedingt nichts erzeugen, während
  `turbo.json` für die build-Task `dist/**` als Output erwartet.
  **Der ernstere Teil ist nicht die Warnung:** `[cmd]`
  `tsc --showConfig` listet ausschliesslich Dateien aus `packages/shared`
  und `packages/types` — **0 Treffer auf `nutrition-api`**. Die vier
  eigenen Quelldateien des Dienstes werden von seinem eigenen `build` und
  `typecheck` **gar nicht geprüft**; beide melden Erfolg, ohne den Dienst
  anzufassen. Das Gate ist an dieser Stelle blind.
  Optionen: eigene `tsconfig.json` mit `outDir: dist` ergänzen (dann prüft
  und baut der Dienst wirklich), oder — falls der Dienst unverdrahtet
  bleibt (C-08: „Teil des Endausbaus") — `build`/`typecheck` bis dahin
  entfernen, statt Erfolg vorzutäuschen. Entscheidung gehört zu C-08.
  **Erledigt 2026-08-06 (Block 12), Weg (a) gewählt: prüfen.**
  Begründung: C-08 führt den Dienst als Teil des Endausbaus, ADR-0001
  rahmt Services als begründete Ausnahme. Ein Dienst, der bleibt, gehört
  geprüft; Weg (b) hätte die Prüfung dauerhaft abgeschaltet.
  **Präzisierung des Befunds:** Die Wurzel-`tsconfig.json` trägt nicht
  nur `noEmit: true`, sondern auch `include: ["packages/*/src/**/*"]` —
  `services/` fehlte dort schlicht. Deshalb 0 Treffer.
  Gebaut: eigene `services/nutrition-api/tsconfig.json` mit `outDir: dist`
  (ohne `noEmit`, damit `dist/**` wirklich entsteht und die
  `outputs`-Angabe in `turbo.json` gedeckt ist).
  **Eigener Befund, gemeldet statt stillschweigend behoben:** Die vier
  Dateien typechecken **nicht** fehlerfrei — aber nur wegen einer
  Ursache, `[cmd]` `error TS2580: Cannot find name 'process'`.
  `@types/node` liegt im Workspace, war aus dem Paket aber nicht
  auflösbar (pnpm-Isolation). Als devDependency ergänzt — reines
  Typpaket, ohne Laufzeitwirkung; ohne das kann der Dienst nicht
  typechecken. Danach **0 Fehler**: der Quellcode selbst war sauber.
  Abnahme `[cmd]`: `tsc --listFiles` erfasst **4 von 4** Dateien
  (vorher 0). **Gegenprobe:** absichtlicher Typfehler → Gate **ROT,
  Exit 2, TS2322**; danach zurückgenommen, Gate wieder Exit 0. Die
  turbo-Warnung ist weg, weil `dist/**` jetzt entsteht.

- [x] **B-22: Datenbankrechte wiederholbar prüfen — das Gate kann es
  nicht** (neu 2026-08-06, aus dem Curation-Bug) — `[cmd]` `pnpm gate`
  prüft Typen, reine Funktionen und den Build; **keiner davon berührt die
  Datenbank.** Der Curation-Bug (`permission denied for table
  food_curation_candidates`) war deshalb für das Gate unsichtbar und fiel
  erst im Browser auf. Der C-11-Nachweis lief über Lebensmittelsuche und
  Nährstoffansicht — nicht über die Curation-Seite.
  **Die Prüfart existiert bereits und hat funktioniert** (Block 11 Teil D,
  2026-08-06): erst erheben, welche Tabellen und Funktionen `apps/web`
  liest (`git grep` auf `.from('` und `.rpc('`), dann bei den
  `SECURITY INVOKER`-Funktionen zusätzlich, welche Tabellen sie **intern**
  lesen — genau dort versteckte sich der Fehler —, dann als echte
  `authenticated`-Sitzung **wirklich lesen** statt der Grant-Tabelle zu
  glauben. Ergebnis damals: 13 Tabellen und 5 RPCs geprüft, **genau zwei
  kaputte Stellen, beide die bekannten**, keine weiteren.
  Aufgabe: diese Prüfung als Skript ablegen (Kandidat:
  `supabase/_pipeline/_validierung/`), damit sie nach jedem
  Zugriffsschicht-Eingriff wiederholbar ist statt einmalig.
  **Bezug:** D-04 (E2E fehlt — ein Browser-Durchlauf hätte es auch
  gefunden), C-08. Kein Ersatz für D-04, sondern die billigere Hälfte:
  Rechte prüfen kostet Sekunden, ein E2E-Aufbau kostet eine Sitzung.
  **Erledigt 2026-08-06 (Block 12):**
  `supabase/_pipeline/_validierung/zugriffsrechte-pruefen.mjs` — ein
  Befehl, ein Exit-Code. **Bewusst NICHT im `pnpm gate`:** das Gate muss
  ohne Datenbank laufen (frischer Klon, CI ohne Docker), diese Prüfung
  braucht zwingend eine laufende Instanz.
  **Sessions ohne Zugangsdaten im Repo:** das Skript legt sich zwei
  Wegwerf-Konten per Signup selbst an und entfernt sie am Ende wieder.
  Der Service-Schlüssel ist nur optional (zum Löschen der Konten).
  **DER WICHTIGSTE FUND — eine Prüfung darf ihre Sollliste nicht vom
  Prüfling erzeugen lassen:** Die erste Fassung zog die Objektliste aus
  der OpenAPI-Beschreibung von PostgREST. `[cmd]` Entzieht man
  `authenticated` das SELECT auf `food_tags`, **verschwindet die Tabelle
  aus der Beschreibung** — die Prüfung hätte sie nicht als unlesbar
  gemeldet, sondern gar nicht mehr gekannt. Ein stiller blinder Fleck
  genau an der Stelle, für die die Prüfung gebaut ist; dieselbe
  Fehlerklasse wie „Gate meldet Erfolg, ohne den Dienst anzufassen"
  (B-21), nur subtiler. Deshalb **062**: die Liste kommt aus dem
  Systemkatalog über `nutrition.pruef_objektliste()` (SECURITY DEFINER,
  `search_path=''`, gibt nur Namen und Art zurück, niemals Inhalte).
  **Zweiter Fund:** Die erste Fassung gab die Aufräum-Befehle nur aus.
  `[cmd]` Nach zwei Läufen lagen drei Nutzer und eine verwaiste Mahlzeit
  auf live. Jetzt räumt sie selbst auf; auch der Abbruchpfad räumt auf
  und liefert **Exit 1** statt falschem Grün.
  **Zwei Gegenproben belegt** `[cmd]`: `security_invoker` abgeschaltet →
  **rot**; Grant auf `food_tags` entzogen → **rot**, gefunden über
  `rpc food_search` — also über den indirekten Weg, den auch der
  Curation-Bug nahm.
  **Gegen live:** Exit 0, **14 Objekte** aus dem Katalog (davon 1 Sicht),
  **18 grün / 3 übersprungen / 0 rot**.
  **Die drei Übersprungenen, einzeln begründet** — übersprungen heisst
  hier nicht „ungeprüft":
  1. `food_curation_candidates` — nur für Admins (C-14); die Tabelle hat
     **keine `user_id`**, es sind Entscheidungen über den gemeinsamen
     Bestand. Seit 061: SELECT-Grant vorhanden, Policy
     `USING (public.is_admin())`. `[cmd]` mit einer echten Zeile
     nachgemessen: **Nicht-Admin sieht 0, Admin sieht 1.**
  2. `food_curation_decisions` — dieselbe Policy, derselbe Beleg.
  3. `rpc curation_overview` — liefert für Nicht-Admins **HTTP 200 mit
     Zählern 0**. Das ist kein Widerspruch: seit 061 **filtert RLS,
     statt zu sperren**. Die Seite blendet für Nicht-Admins ab (C.3),
     damit aus „0 Kandidaten" nicht „alles erledigt" gelesen wird.

---

## C — Produkt: apps/web

- [x] **C-11: Stammdaten-Reads auf den Session-Client** — **erledigt: war
  faktisch seit M3 (2026-08-04) erfüllt, der Punkt beschrieb einen
  veralteten Stand.** Prüfung 2026-08-05 statt Übernahme der Prämisse:
  `[cmd]` `createServiceClient` hat null Aufrufer (nur die Definition in
  `packages/shared`), `nutrition-db.ts` nutzt `createSessionClient`,
  `anon` hat weder USAGE noch SELECT auf `nutrition`, und keine
  öffentliche Seite (`/`, `/login`, `/auth/callback`) liest Stammdaten.
  Keine Grant-Änderung nötig, kein SQL vorgelegt.
  Wirknachweise `[cmd]` mit zwei echten Sessions: anon erhält harten
  `42501` statt stiller Leerliste; zweite Session sieht Stammdaten
  (49 Treffer), aber `food_preference_items = []` bei existierender
  Fremdzeile (postgres count 1); `/nutrition/foods` ohne Session →
  307 auf `/login?redirect=…`; Suchbaselines unverändert
  (kuerbis 49, high_fiber 558).

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

- [ ] **C-03: WP-02 Diary-Verdrahtung** — **nicht mehr blockiert**
  (2026-08-06, Block 10): ADR-0003 ist geschrieben
  (`docs/spezifikation/90-entscheidungen/ADR-0003-diary-naehrstoffmodell.md`).
  **Entschieden: EAV anschliessen, `db/schema/nutrition.sql` ist
  verworfen** — die Datei bleibt als Referenz liegen, ist aber kein
  Sollwert. Was bleibt, ist Bau, keine Entscheidung: Diary-Tabellen im
  Schema `nutrition` anlegen, an `food_nutrients` rechnen, die
  Ergebniswerte je Mahlzeitposition **einfrieren** (sonst ändern sich
  vergangene Tage rückwirkend, wenn ein BLS-Wert korrigiert wird).
  Jede neue Tabelle bekommt Zeilenschutz **und** Policies je Operation,
  dem Muster aus 060 folgend.
  Nebenfund `[read]`, im ADR festgehalten: der verworfene Entwurf schaltet
  für `meal_items` RLS ein, vergibt aber keine Policy — für
  `authenticated` wäre die Tabelle gesperrt gewesen. Beim Neuaufbau nicht
  wiederholen.
  Der Aggregationsweg für Tagessummen (Sicht, materialisierte Sicht oder
  Summentabelle) ist noch offen und gehört zu C-04.

- [x] **C-04: WP-03 Daily Summary** — **erledigt 2026-08-06 (Block 12).**
  Hier fiel die Entscheidung, die C-03 ausdrücklich offengelassen hatte.
  **Gewählt: SICHT** (`nutrition.daily_summary`, Kettenschritt 053,
  live seit 2026-08-06, v053 **11/11 grün**).
  **Nicht materialisierte Sicht:** die braucht einen Aktualisierungsweg
  bei **jedem** Schreibvorgang (Insert/Update/Delete auf `meal_items`,
  Delete auf `meals` mit CASCADE). Wer einen vergisst, bekommt keinen
  Fehler, sondern einen **stillen Falschstand** — die Summe sieht richtig
  aus und ist es nicht. PostgreSQL kennt zudem kein inkrementelles
  REFRESH; jede Aktualisierung rechnete alle Nutzerinnen neu.
  **Nicht Summentabelle:** zweite Wahrheit neben `meal_items`; bei
  Abweichung nicht entscheidbar, welche recht hat.
  **Warum die Sicht trägt:** Die Summe ist deterministisch, weil
  `meal_items` **eingefrorene** Werte trägt (ADR-0003) — die Sicht
  summiert nur und rechnet nicht gegen `food_nutrients`. Die neun
  Schnell-Makros liegen als Spalten vor, also ohne JSONB-Auswertung.
  **Was die Sicht NICHT kann** (benannt, nicht verschwiegen): keine
  Wochen- oder Monatsschnitte; keine Zielwerte (die gehören zum Profil);
  keine Summe über den JSONB-Schnappschuss, nur über die neun Makros;
  nicht schneller als die Abfrage darunter — bei vielen Positionen je Tag
  linear langsamer (`[annahme]`, nicht gemessen, es gibt noch keine Daten).
  **Fehlender Wert bleibt fehlend:** `SUM()` ignoriert NULL und machte
  die Summe still zu niedrig. Deshalb je Makro **zwei** Angaben — die
  Summe und `<makro>_missing` (Zahl der Positionen ohne Wert). Hat keine
  Position einen Wert, ist die Summe **NULL statt 0**: nichts gemessen
  ist nicht null Gramm.
  **DER TRAGENDE BELEG — `security_invoker` ist keine Formalie:**
  `[cmd]` Mit `security_invoker = false` sah der zweite Nutzer
  **2 Zeilen** des ersten. Mit `true`: **0**. Der Zeilenschutz der
  darunterliegenden Tabellen greift bei einer Sicht **NICHT automatisch** —
  ohne diese Option wäre `daily_summary` ein Datenleck über alle Nutzer
  gewesen. Geprüft, nicht angenommen.
  Abnahme `[cmd]` gegen live mit zwei echten Sessions: Tagessumme gegen
  Handrechnung (CHO 309,2250 · FAT 1,8900 · PROT625 16,1700, meal_count 2,
  item_count 3); `fibt` NULL mit `fibt_missing 3`; B sieht `[]`;
  BLS-Wert 88,35 → 999,00 änderte die Tagessumme **nicht**; leere
  Mahlzeit bleibt sichtbar mit Summen NULL.
  Anwendungspfad: `diary-summary.ts` (rein) und `diary-summary-read.ts`
  (I/O, Session-Client), 9 Unit-Tests. **UI und API-Route bewusst nicht** —
  Entscheidung Tom: sie kommen mit der Oberfläche, nicht vorher.
- [ ] **C-05: WP-04 Water Tracking** — `water_logs` fehlt komplett
- [ ] **C-06: WP-05 erstes Mock-Modul echt machen** — Kandidat Goals.
  *Vorher die 2 kritischen Bugs aus `docs/specs/Goals/OPEN_ITEMS.md` klären
  (Adaptive-TDEE Cross-Schema, Contribution-Timing).*

- [ ] **C-07: `packages/types` verdrahten oder entfernen** — Rest von
  ursprünglich zwei Paketen (Audit 2026-08-05): `[cmd]` `@lumeos/shared`
  ist seit M1 Teil C verdrahtet (workspace-Dependency; Importe u. a. in
  nutrition-db, Auth-Callback, Login-Form) — **`@lumeos/types` hat
  weiterhin 0 Importe.** Nutzen oder entfernen.

- [ ] **C-08: `services/nutrition-api` einordnen** — angepasst 2026-08-04:
  Hono-Service, 4 Dateien, von niemandem importiert; seit der
  Governance-Archivierung einer von **vier** lebenden Workspace-Packages
  (`10-workspace.md`). `apps/web` greift inzwischen per supabase-js/rpc()
  direkt zu (M1 Teil C), nicht mehr per Docker-SQL.
  *Antwort Tom: Teil des Endausbaus.* Rahmen dafür jetzt in
  ADR-0001-datenzugriff (A-07): Services als begründete Ausnahme.
  **Stand nach B-21 (2026-08-06) — der Punkt bleibt offen, aber die
  Ausgangslage hat sich geändert:** Die Wahl aus B-21 lautete „prüfen
  oder Skripte entfernen"; gewählt wurde **prüfen**, gerade weil C-08 den
  Dienst als Teil des Endausbaus führt. `[cmd]` Der Dienst typecheckt und
  baut jetzt wirklich (4 von 4 Dateien, vorher 0). Die Prämisse dieses
  Punktes hält unverändert: `[cmd]` `git grep` auf `nutrition-api` über
  `apps/` und `packages/` liefert **0 Importe**. Zu entscheiden bleibt
  also die Einordnung (verdrahten oder verwerfen), nicht mehr die Frage,
  ob das Gate ihn erfasst.

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

- [ ] **C-14: Kuration gehört nach `apps/admin` — die Rollenabstufung in
  `apps/web` ist ein bewusster Zwischenschritt** (neu 2026-08-06, aus C.3)
  **Diese Ausnahme widerspricht der Spezifikation und muss als Ausnahme
  sichtbar bleiben, sonst gilt sie irgendwann als Regel.**
  `[read]` `docs/spezifikation/20-apps/web/00-app-web.md:65–69` sagt
  ausdrücklich: „`web` kennt genau eine Rolle: die angemeldete Nutzerin,
  die ihre eigenen Daten sieht. Es gibt hier **keine Rollenabstufung**.
  Wer Coach ist, arbeitet in `coach`; **wer verwaltet, in `admin`**."
  Seit C.3 (2026-08-06) gibt es in `apps/web` genau das: eine
  Admin-Prüfung vor `/nutrition/curation` und der zugehörigen API-Route.
  **Warum trotzdem so gebaut:** Die Seite lief in einen rohen
  Datenbankfehler; die Alternativen waren, sie für jede Nutzerin zu öffnen
  (falsch — `[cmd]` beide Curation-Tabellen haben **keine `user_id`**,
  es sind systemweite Entscheidungen über den Lebensmittelbestand) oder
  sie sofort umzuziehen (`[cmd]` `apps/admin/` ist ein leeres Gerüst,
  1 Datei `.gitkeep` — das wäre ein eigener Block gewesen).
  `061_rollen_admin.sql` ist die **Brücke, nicht das Ziel**.
  Aufgabe beim Umzug: Seite und API-Route nach `apps/admin`, danach die
  Admin-Prüfung aus `apps/web` **entfernen** — nicht liegen lassen. Die
  Rollenprüfung selbst (`public.is_admin()`, 061) bleibt und wird dort
  gebraucht.
  **Von Block 12 NICHT berührt** (nachgesehen, nicht angenommen):
  `[cmd]` `apps/admin/` ist weiterhin ein leeres Gerüst (1 Datei). 062
  legt nur `nutrition.pruef_objektliste()` an — eine Objektliste für die
  Rechteprüfung, ohne Bezug zur Kuration. Der Punkt steht unverändert.

- [x] **C-13: Tote „Keine Writes“-Copy in ausgelieferter Oberfläche** —
  **erledigt 2026-08-06 (Block 9):** die fünf Systemaussagen berichtigt —
  `dashboard-view.tsx` (Flow-Karte „Klarer Rahmen“, Karte „Was echt ist,
  was Attrappe“, drei Badges mock/candidate/readonly), `app-shell.tsx`
  (Context-Aktion → „Favoriten und Ausschlüsse setzen“),
  `placeholder-page.tsx` (Badge → „Platzhalter ohne Funktion“); der
  Diary-Header ist als Selbstaussage gefasst („Diese Diary-Seite schreibt
  nichts“). Nur vorhandene Badge-Töne verwendet. `[cmd]` Suche über
  Quellcode und Wurzeldateien: 0 verbliebene Systembehauptungen.
  **Bewusst geblieben:** „This page still performs no writes“
  (curation/page.tsx) und „never applies migrations“
  (local-schema/page.tsx) — Selbstaussagen der jeweiligen Seite und
  `[cmd]` wahr: keine der beiden Seiten enthält eine Schreiboperation.

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

- [x] **D-14: RLS im Container prüfen und entscheiden** — **erledigt
  (Audit 2026-08-05, von Tom nachgeprüft):** `[cmd]` live heute **11/11
  Tabellen mit RLS, 15 Policies** — der am 2026-08-01 beschriebene Zustand
  (2 von 11) ist seit 060-Live weg. Beide Fragen entschieden: der offene
  EAV-Zugriff war ein Versehen und ist durch die Datenklassen aus 060
  behoben; die Auth-Frage ist seit M3 real (Supabase-Auth produktiv).
  Doku-Rest erledigt 2026-08-06 über D-06.
  **Berichtigung 2026-08-06:** Der Satz „ADR-003 ist seit M3 real
  (Supabase-Auth)" verwechselte die Nummern. `[read]` ADR-003 ist laut
  Register das **Diary-Nährstoffmodell**; die Auth-/Zugriffsfrage war
  ADR-004 und ging in ADR-0001 auf. Beides ist jetzt dokumentiert
  (ADR-0003 bzw. ADR-0001).

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

- [x] **D-04: E2E- und Testbasis klären** — **erledigt 2026-08-06
  (Block 12): Entscheidung getroffen, kein Gerüst gebaut.**
  Ergebnis in `docs/ssot/36-testbasis.md` (drei Prüfebenen, was jede
  leistet und was ausdrücklich **keine** leistet).
  **Entscheidung: KEIN Playwright-Gerüst jetzt.** `@playwright/test`
  bleibt in den Root-devDependencies (`[cmd]` installiert, Browser
  vorhanden, kostet im Betrieb nichts) — aber `36-testbasis.md` hält
  fest, dass es `[cmd]` **0 Spec-Dateien und keine Konfiguration** gibt,
  damit niemand aus der blossen Anwesenheit von Playwright auf
  E2E-Abdeckung schliesst. Genau diese falsche Sicherheit war der Grund,
  den Punkt überhaupt zu stellen.
  **Was E2E leisten würde und die anderen Ebenen nicht:** den Weg durch
  Next.js selbst — Middleware, Cookie-Handhabung, Server Components, die
  Admin-Prüfung aus C.3, den Anmeldefluss. B-22 spricht direkt mit
  PostgREST und überspringt das alles. Ein kaputter Redirect nach dem
  Anmelden wäre kein Rechteproblem und bliebe von B-22 unentdeckt. Die
  Antwort ist also **nicht dünn** — trotzdem fällt die Entscheidung gegen
  das Gerüst, und zwar aus diesem Grund:
  **Die Prüfung der Frage hat sofort einen echten Fehler gefunden, ohne
  einen einzigen E2E-Test — einen OFFENEN REDIRECT.**
  `[cmd]` Gegen den laufenden Dev-Server:
  `GET /auth/callback?redirect=%2F%2Fevil.com` → `Location: http://evil.com/`.
  Die Prüfung stand **zweimal inline** als `raw.startsWith('/')`
  (`login/page.tsx:15`, `auth/callback/route.ts:12`), beide Male mit
  einem Kommentar, der ausdrücklich behauptete, offene Redirects seien
  ausgeschlossen. `//evil.com` beginnt mit `/`, ist aber
  protokollrelativ — der Browser liest es als fremden Host. Der Kommentar
  behauptete, was der Code nicht tat. Ein offener Redirect ist die halbe
  Miete jedes Phishing-Versuchs: der Link zeigt auf die echte Domain.
  **Behoben als reine Funktion** `apps/web/src/lib/auth/safe-redirect.ts`
  (eine Stelle statt zwei) mit 6 Tests. Gegenprobe `[cmd]` am laufenden
  Server nach der Korrektur: `//evil.com`, `/\evil.com`,
  `https://evil.com` und `///evil.com` landen alle auf `/dashboard`,
  `/nutrition/foods` geht unverändert durch.
  **Daraus die Lehre für die Entscheidung:** Der wertvollste Teil dieser
  Fehlerklasse ist als reine Funktion billiger, schneller und **im Gate**
  prüfbar. Ein Playwright-Gerüst hätte denselben Fehler gefunden — aber
  erst nach Aufbau von Konfiguration, Testnutzerverwaltung, Serverstart
  und CI-Anbindung, und danach dauerhaft zu pflegen.
  **Wiedervorlage, benannt statt offengelassen:** sobald der erste
  Modul-Schreibpfad eine Oberfläche bekommt, die bleiben soll (C-04-UI
  oder C-06). E2E gegen eine Oberfläche, die mit A-06 und C-14 noch
  umzieht, wäre Wegwerfarbeit.
  **Was weiterhin ungeprüft bleibt** (in `36-testbasis.md` benannt):
  kein Browser läuft; der Anmeldefluss ist nur von Hand belegt; die
  Middleware-Umleitung ist `[cmd]` einmalig belegt
  (`/nutrition/foods?q=test` → `/login?redirect=%2Fnutrition%2Ffoods%3Fq%3Dtest`),
  aber nichts hält sie fest.

- [ ] **D-05: Spec-Audit starten** — `docs/specs/` (13 Module) auseinandernehmen,
  Diskrepanzen suchen, pro Modul offizielle Spec deklarieren. *Eigene Sitzung.*
  Vorbefunde in `docs/ssot/40-spec-code-matrix.md` und `11-zielarchitektur.md`:
  tote `CONSOLIDATED_KNOWLEDGE`-Verweise in 7 INDEX-Dateien; Buddy-INDEX zeigt
  auf nicht existente `spec/`-Pfade; Modulzählung 10 vs. 11 vs. 7 vs. 13
  unversöhnt; Next.js 14+ vs. 15; Goals/Admin-Specs deklarieren Vorgänger-Code
  als „implementiert"; `apps/mobile`/`apps/staff` und 4 Service-Gerüste ohne Spec;
  Specs referenzieren `packages/scoring`, wofür kein Gerüst existiert;
  `apps/marketplace` in Specs, aber ohne Gerüst.

- [x] **D-06: ADRs konsolidieren** — **erledigt 2026-08-06 (Block 10).**
  **Zielort entschieden: `docs/spezifikation/90-entscheidungen/`.**
  Begründung aus dem Bestand, nicht aus Geschmack: `[cmd]` der Ort ist in
  der lebenden Spezifikationsstruktur verankert (`spezifikation/00-INDEX.md`,
  `10-plattform/architektur/00-systemarchitektur.md` an zwei Stellen,
  `_vorlagen/modul.md`), während **sämtliche** Verweise auf
  `docs/decisions/` aus totem Bestand stammen: archivierte
  Governance-Skills (`.claude/skills/`, `.agents/skills/`),
  `CLAUDE.md.v1.bak`, `_archive/governance/`, `docs/prompts/`, der
  Repomix-Abzug, die Obsidian-Spiegelung. `[cmd]` `docs/decisions/` hatte
  als einzige getrackte Datei `.gitkeep` — der Ordner wurde nie befüllt.
  Aufgelöst mit `docs/decisions/README.md` (Wegweiser samt
  Nummern-Zuordnung); der Ordner selbst bleibt vorerst stehen, damit der
  Verweis auffindbar ist — Entfernung entscheidet Tom (A-05-Nachbarschaft).
  **Die zwei offenen ADRs sind geschrieben:**
  - `ADR-0002-preferences-tabellendesign.md` — Set-Design nach SPEC_06
    (zwei Tabellen) gegen Single-Row. `[cmd]` live belegt: `user_id` als
    Primärschlüssel in `food_preferences`, CHECK
    `food_preference_items_exactly_one_target`, je vier Policies pro
    Operation auf beiden Tabellen.
  - `ADR-0003-diary-naehrstoffmodell.md` — EAV anschliessen, flachen
    Entwurf verwerfen. `[cmd]` 698.092 Zeilen in `food_nutrients`;
    **0 von 5** flachen Makrospalten auf `nutrition.foods`; `meal_items`,
    `meal_logs`, `diary_days` existieren weder in `nutrition` noch in
    `public`. Der Entwurf hätte den `meal_items`-Fehler mitgebracht
    (RLS an, keine Policy → für `authenticated` gesperrt).
  **Nummern-Drift berichtigt:** Die TODO führte ADR-003 als
  „Supabase-Auth". `[read]` Laut Register
  (`docs/_archive/ist-zustand/04-adr-liste.md`, Z. 11) ist ADR-003 das
  **Diary-Nährstoffmodell** und blockiert WP-02 = C-03 — was zur Rolle als
  C-03-Blocker passt. Die Auth-/Zugriffsfrage war ADR-004 (Z. 12) und ist
  mit ADR-0001 und M3 erledigt.
  Nebenkorrektur: `docs/ssot/00-INDEX.md` zeigte noch auf `docs/decisions/`
  — auf den realen Ort umgestellt.

- [ ] **D-07: „Phase 1B"-Aussagen aktualisieren** — überarbeitet
  2026-08-05: `[cmd]` ein „README Phase 1B" existiert nirgends; die
  Phase-1B-Behauptungen leben in `CLAUDE.md` (Z. 24–25), `AGENTS.md`
  (Altlast) und der Produkt-Copy. **Geht in A-02/A-09 und C-13 auf** —
  hier nur als Marker, keine eigene Arbeit planen.

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

- [x] **D-15: `supabase/migrations-draft/` einordnen** — **erledigt (Audit
  2026-08-05, von Tom nachgeprüft):** `[cmd]` liegt nicht mehr am alten Ort, sondern unter `supabase/_archive/` — die
  Einordnung (Archiv-Referenz statt aktiver Bestand) ist faktisch gefallen.

- [x] **D-16: `021_wild_category_apply.sql` klären** — **erledigt
  2026-08-02, der Haken fehlte:** die `[annahme]` „durch 020 abgedeckt"
  ist widerlegt — `[cmd]` 021 ist notwendig (`affected_rows = 49`;
  Kettenläufe 2026-08-04/05 liefern erneut 49; dokumentiert in
  `supabase/README.md`).

- [x] **D-17: Migrationsregister** — **erledigt 2026-08-05/06 (Weg B,
  Baseline).** `[cmd]` `migrations/` enthält als einzige Datei
  `20260805120000_baseline_structure.sql`; die drei Slices liegen in
  `supabase/_archive/`; das Register ist umgetragen — Gegenprobe
  `1|0|1` (baseline_da 1, geist_weg 0, gesamt 1).
  Strukturgleichheit doppelt belegt: Wegwerf-DB-Diff der Sitzung
  (0 Abweichungen, 1.984 = 1.984 Zeilen) und Toms unabhängige Nachprüfung
  `[cmd]`: Baseline in eigener Wegwerf-DB, Namensdiff über Tabellen,
  Indizes, Policies und Funktionssignaturen = 104 Objekte, 0 Abweichungen;
  dreizehn Merkmalszahlen identisch (12 Tabellen, 108 Spalten, 35 Indizes,
  114 Constraints, 38 Funktionen, 19 Policies, 12 RLS, 1 Trigger, anon
  ohne USAGE, 0/18 Grants, pg_trgm); der 090-Trigger legt beim Insert in
  auth.users genau ein Profil an. Rollenteilung dokumentiert:
  migrations/ = deploybare Struktur, _pipeline/ = lokale Wahrheit inkl.
  Daten (supabase/README.md, vierte Fassung). Folgepunkt: D-20.

- [x] **D-18: Die vier Control-Plane-Tabellen in `public` entfernen** — **erledigt 2026-08-03**
  (neu 2026-08-04) — `workorders`, `governance_artefacts`, `execution_tokens`,
  `wo_failure_events` samt der vier April-Workorders sind der letzte lebende
  Rest des Governance-Clusters (Code archiviert, die beiden Migrationen seit
  2026-08-02 in `supabase/_archive/`). **Tom arbeitet parallel daran**;
  Sicherung liegt bereit (`[cmd]` 2026-08-04: untracked
  `backup/schema/2026-08-03_public_vor_drop.sql`).
  *Datenbankeingriff — nicht nebenbei ausführen.*

- [x] **D-19: supabase/README-Kette unvollständig** — **erledigt
  2026-08-05:** `[cmd]` README 150 → 201 Zeilen (vierte Fassung); die
  Reihenfolge-Tabelle ist vollständig inkl. **070 und 090**
  (090 = `profiles` + Anmelde-Trigger), die Rollenteilung `migrations/`
  gegen `_pipeline/` steht als eigene Sektion ganz oben.

- [x] **D-20: Baseline-Voraussetzung im Dateikopf nennen** — **erledigt
  2026-08-06 (Block 10, Commit 27a7f64): +23/−0 Zeilen, nur der Kopf
  wuchs.** Der Stub steht jetzt als kopierbares SQL im Dateikopf von
  `supabase/migrations/20260805120000_baseline_structure.sql`.
  **Drei Korrekturen am ursprünglichen Wortlaut dieses Punktes**, alle
  `[cmd]` gegen eine Wegwerf-DB (PostgreSQL 17.6, danach verworfen;
  laufende Instanz unberührt — 12 Tabellen, Datenbankliste wie vorher):
  1. Der **erste** Abbruch ist nicht `function auth.uid() does not exist`,
     sondern `schema "auth" does not exist` bei Z. ~1604
     (`profiles_id_fkey` → `auth.users(id)`). `auth.uid()` kommt erst
     danach bei Z. ~1668 (erste RLS-Policy) — der erste Abbruch verdeckte
     den zweiten.
  2. `auth.role()` und `raw_user_meta_data` werden von der Baseline
     **gar nicht** verwendet (`[cmd]` 0 Treffer; der 090-Trigger liest nur
     `NEW.id`) — im Stub nicht erforderlich.
  3. **Zusätzlich nötig, ursprünglich nicht genannt:** die Rollen `anon`,
     `authenticated`, `service_role` für die GRANTs. Sie sind clusterweit,
     nicht pro Datenbank — deshalb im Supabase-Cluster unsichtbar, gegen
     blankes Postgres aber fehlend.
  `[cmd]` Mit vollständigem Stub läuft die Datei fehlerfrei durch
  (`psql -v ON_ERROR_STOP=1`, Exit 0).

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

- [ ] **E-08: Deployment nach `main`** — Wartebedingung korrigiert
  2026-08-05: „erst wenn D-12 abgeschlossen" ist seit 2026-08-02 erfüllt
  und damit hinfällig. **Reale Voraussetzungen: D-17 (Blocker vor jedem
  Cloud-Kontakt inkl. `supabase link`, mitsamt D-19) und der B-13-Rest**
  (Produktions-`site_url`/Redirect-Liste).
  *Die Warnung bleibt: vor einem `link` müssen die Migrationsdateien den
  lokalen Zustand abbilden, sonst entsteht ein dritter Drift-Zustand — in
  einer Instanz, für die bezahlt wird.*

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
- [x] B-14: Prüf-Gate geschaffen — `pnpm gate` (typecheck + test + build),
  versionierter `.githooks/pre-commit`, Build-Cache-Kante auf
  `packages/shared/src/**`; Wirksamkeit doppelt nachgewiesen
  (rotes Gate bei künstlichem Bruch + geblockter echter Commit)
- [x] C-11: als seit M3 erfüllt festgestellt — Prämisse geprüft statt
  übernommen — und mit vier Wirknachweisen belegt; Gate-Doku im README

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
