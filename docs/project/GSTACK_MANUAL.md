# gstack — Bedienungsanleitung (LumeOS-Kontext)

**Zielgruppe:** Du (Tom) und Teammates, die gstack im LumeOS-Umfeld täglich nutzen.
**Ergänzt:** `GSTACK.md` (Install/Uninstall) und `~/.claude/skills/gstack/README.md` (Upstream-Doku).
**Kontext:** LumeOS-Produkt-Repo — Turborepo + pnpm + Next.js in `apps/web`. Kein Workorder-Workflow, keine Governance-Pipeline mehr (Governance liegt in eigenem Repo).

---

## Inhalt

1. [Grundprinzip](#1-grundprinzip)
2. [First-Run — was beim ersten Skill-Aufruf passiert](#2-first-run--was-beim-ersten-skill-aufruf-passiert)
3. [Dein Alltag — konkrete Szenarien](#3-dein-alltag--konkrete-szenarien)
4. [Skill-Übersicht nach Kategorie](#4-skill-übersicht-nach-kategorie)
5. [Regeln fürs LumeOS-Repo](#5-regeln-fürs-lumeos-repo)
6. [Konflikte mit deinem ijfw-Stack](#6-konflikte-mit-deinem-ijfw-stack)
7. [Konfiguration & Zustand](#7-konfiguration--zustand)
8. [Troubleshooting](#8-troubleshooting)
9. [Deinstallation / Zurückrollen](#9-deinstallation--zurückrollen)

---

## 1. Grundprinzip

gstack ist ein Set aus 55 Slash-Commands, die Claude Code als **spezialisierte Rollen** aufrufen kann: CEO, Eng Manager, Designer, QA Lead, Debugger, Release Engineer, Security Officer. Jeder Skill hat eine Preamble (System-Check), einen strukturierten Workflow, und einen Report am Ende.

**Router:** Wenn du `/gstack` ohne Argument tippst, entscheidet der Router-Skill welcher Sub-Skill passt. Meistens rufst du direkt den Ziel-Skill auf, z.B. `/investigate` oder `/browse`.

**Trigger-Phrasen statt Slash:** Viele Skills feuern auch bei natürlicher Sprache — „debug this", „browse to X", „review my changes". Bei uns ist `PROACTIVE=false` gesetzt, d.h. Claude schlägt nichts ungefragt vor, sondern fragt vorher nach.

**LumeOS-Grundregel:** In diesem Repo arbeitest du **direkt** mit Tom. Deine `Schreibregeln` in CLAUDE.md gelten weiter:
- Keine Codeänderung ohne explizite Freigabe.
- Keine Commits oder Pushes ohne Tom.
- Ein logischer Change pro Commit.

Skills die diese Regeln verletzen würden (z.B. `/ship`, `/qa`, `/design-review` mit Auto-Commit) brauchen weiterhin dein explizites OK vor jedem Run.

---

## 2. First-Run — was beim ersten Skill-Aufruf passiert

Beim allerersten Skill-Aufruf fragt gstack **in dieser Reihenfolge**. Deine Antwort landet persistent in `~/.gstack/config.yaml` und `~/.gstack/.*-prompted`-Markern.

**Bei uns bereits erledigt** (siehe Abschnitt 7.3 für den aktuellen Config-Stand). Die Prompts kommen nicht mehr. Diese Sektion ist für Teammates und für den Fall, dass du `~/.gstack/` löschst und neu initialisierst.

### 2.1 Boil-the-Ocean-Intro

> *„gstack folgt dem Boil the Ocean-Prinzip — mach die vollständige Sache wenn AI die Grenzkosten fast Null macht. Willst du den Blog-Post öffnen?"*

**Empfohlene Antwort: Nein.** Marketing-Seite, keine Konfiguration. Marker wird trotzdem gesetzt.

### 2.2 Telemetrie

> *„Help gstack get better. Share usage data..."*

**Antwort: B — No thanks**, dann Folge-Prompt: **B — No thanks, fully off**.

Bei uns bereits per `~/.gstack/config.yaml` erzwungen (`telemetry: off`), die Wahl bestätigt es gegenüber gstack.

### 2.3 Proactive Suggestions

> *„Let gstack proactively suggest skills..."*

**Antwort: B — Turn it off.**

Grund: Du willst kontrollieren, wann welcher Skill läuft. gstack darf nicht ungefragt `/ship` vorschlagen. Skills bleiben per Slash-Command explizit aufrufbar.

Umschaltbar: `~/.claude/skills/gstack/bin/gstack-config set proactive true`.

### 2.4 CLAUDE.md Skill-Routing-Sektion

> *„gstack works best when your project's CLAUDE.md includes skill routing rules."*

**Antwort: B — No thanks.**

Grund: Deine LumeOS-CLAUDE.md ist bewusst schlank und projekt-spezifisch. Die von gstack vorgeschlagenen Routing-Regeln würden Skills wie `/office-hours` und `/plan-ceo-review` auf triggerbare Phrasen legen — Overkill für dieses Repo.

Umschaltbar: `gstack-config set routing_declined false`.

### 2.5 Continuous Checkpoint Mode

> *„Enable Continuous checkpoint auto-commits?"*

**Antwort: Ablehnen.**

Grund: `WIP:`-Auto-Commits verletzen „Keine Commits ohne Tom" und „Ein logischer Change pro Commit".

Umschaltbar: `gstack-config set checkpoint_mode continuous`.

### 2.6 Alle Prompts vorab überspringen (falls du `~/.gstack/` neu aufsetzt)

```bash
touch ~/.gstack/.completeness-intro-seen \
      ~/.gstack/.telemetry-prompted \
      ~/.gstack/.proactive-prompted \
      ~/.gstack/.activated \
      ~/.gstack/.first-loop-tip-shown
touch ~/.claude/skills/gstack/.feature-prompted-continuous-checkpoint \
      ~/.claude/skills/gstack/.feature-prompted-model-overlay
~/.claude/skills/gstack/bin/gstack-config set proactive false
~/.claude/skills/gstack/bin/gstack-config set routing_declined true
~/.claude/skills/gstack/bin/gstack-config set checkpoint_mode explicit
~/.claude/skills/gstack/bin/gstack-config set artifacts_sync_mode_prompted true
```

---

## 3. Dein Alltag — konkrete Szenarien

Alle Beispiele setzen voraus: `PROACTIVE=false`, du rufst explizit auf.

### 3.1 Browser / URL prüfen / QA / Screenshot

**→ `/browse <url-oder-frage>`**

Startet den headless-Chromium-Daemon (localhost, Playwright). Erster Aufruf ~5s (Daemon-Start), danach ~100ms pro Kommando. Für authentifizierte Seiten (Supabase-Login, Vercel-Preview mit Basic-Auth) einmal `/setup-browser-cookies` — importiert Cookies aus deinem Chrome/Edge.

**Ersetzt:** `mcp__claude-in-chrome__*`-Tools. Konsequent `/browse` benutzen.

**Daemon killen:** `$B disconnect`.

**Typische LumeOS-Nutzung:**
- „Prüf ob `/nutrition/foods` auf localhost:3000 lädt" → `/browse http://localhost:3000/nutrition/foods`
- „Screenshot vom Dashboard nach Layout-Änderung" → `/browse` + Screenshot-Kommando
- Vercel-Preview-URL vor dem Merge visuell abnehmen

### 3.2 Etwas ist kaputt in `apps/web`

**→ `/investigate <symptom>`**

Systematisches Root-Cause-Debugging mit Hypothesen-Log. „Iron Law: no fixes without investigation." Bricht nach 3 gescheiterten Fix-Versuchen ab und eskaliert an dich. Auto-freezt sich auf das Modul das er untersucht — verhindert Kollateralschäden in Nachbarcode.

**Typische Fälle in LumeOS:**
- „Warum liefert `/api/nutrition/foods` 500?" → `/investigate`
- „Nutrition-Diary rendert nicht — kein Console-Error"
- Type-Errors nach dem Merge einer Draft-Änderung

Achtung: Fix-Vorschläge brauchen dein OK vor dem Commit.

### 3.3 Ich hab Code geändert und will Second Opinion

**→ `/review`** (Claude schaut sich den Diff an) oder
**→ `/codex`** (delegiert an OpenAI Codex CLI, komplett anderes Modell)

`/codex` besonders wertvoll für kritische `apps/web`-Änderungen (Supabase-Queries, API-Routes, Auth-Flows). Drei Modi:
- **review** — pass/fail-Gate
- **challenge** — versucht aktiv, den Code kaputtzumachen
- **consult** — freier Dialog mit Session-Kontinuität

Bei Diff gegen `main` (dein Standard-Base-Branch) automatisch.

**LumeOS-Hinweis:** `/review` ist per Default fix-first — er versucht AUTO-FIX-Kandidaten direkt zu ändern. Für LumeOS-konformen Report-only-Modus rufst du mich einfach mit „review report only, no fixes" auf.

### 3.4 Security-Sicht auf apps/web

**→ `/cso`**

OWASP Top 10 + STRIDE Threat Model. Zero-Noise-Gate: 8/10 Confidence minimum, jede Finding kommt mit konkretem Exploit-Szenario.

**LumeOS-relevant:**
- Auth-Flow gegen Supabase — Session-Handling, RLS-Bypass-Checks
- API-Routes unter `apps/web/src/app/api/**` — Input-Validation
- Client-Side-Secret-Leaks in Next.js-Public-Env

### 3.5 Ich baue was Neues und will das Denken strukturieren

**→ `/office-hours <idee>`** — YC Office Hours, 6 forcing questions, challenged dein Framing
**→ `/spec <idee>`** — formaler 5-Phasen-Spec

Diese Skills schreiben ihre Design-Docs in `~/.gstack/projects/<slug>/` — nicht ins LumeOS-Repo. Rein zum Denken.

Für LumeOS-Feature-Planning ist `apps/web/`-Ist-Zustand in `docs/ist-zustand/` die verlässlichere Referenz — dort steht was heute im Code ist.

### 3.6 UI/Frontend-Änderung visuell prüfen

**→ `/qa-only <url>`** — findet Bugs, kein Auto-Fix, kein Commit. **Nutze das.**
**→ `/qa <url>`** — findet Bugs + fixt + committet. **Verletzt „Keine Commits ohne Tom".**
**→ `/design-review <url>`** — visuelle Konsistenz, Spacing, AI-Slop. **Fixt auch — mit Vorsicht.**

**Regel:** In LumeOS immer `/qa-only`. Die gefundenen Bugs klärst du mit mir, dann mach ich den Fix nach deinem OK.

**Praktisch:**
```
/qa-only http://localhost:3000/nutrition/curation
```
Läuft Playwright durch die Page, findet z.B. „500 bei Search mit leerem String", „Modal schließt bei Escape nicht", du bekommst Report.

### 3.7 Diagramm für Doku bauen

**→ `/diagram <englische-beschreibung>`**

Emittiert Triplet: Mermaid-Source, `.excalidraw` (im Browser editierbar), gerenderte SVG/PNG. Offline. Gut für `docs/ist-zustand/`-Ergänzungen oder Architektur-Skizzen die du in Markdown einbetten willst.

### 3.8 Markdown zu PDF

**→ `/make-pdf <pfad>`**

Publikationsqualität. `--to html` für Single-File-HTML, `--to docx` für Word. Rendert Mermaid- und Excalidraw-Fences als Vektorgrafiken.

**LumeOS-Nutzen:** `docs/ist-zustand/*.md` als PDF für externe Reviews.

### 3.9 Was hat gstack über dieses Repo gelernt

**→ `/learn`**

Zeigt/sucht/prunt Learnings die gstack cross-session gespeichert hat. Liegen in `~/.gstack/projects/<slug>/learnings.jsonl`.

Separates System vom Claude-Memory-Layer — die beiden kennen sich nicht. Nichts kritisches, kann man ignorieren.

### 3.10 Meta & Safety

- **`/careful`, `/freeze`, `/guard`, `/unfreeze`** — Safety-Locks. Beispiel: `/freeze apps/web/src/app/nutrition` → Claude darf nur noch dort schreiben, kein versehentlicher Änderungen in `system/` oder anderen Bereichen.
- **`/context-save`, `/context-restore`** → gstack-eigene Snapshots. **Nutze stattdessen `/ijfw:handoff`**, das ist in dein Memory-System integriert.
- **`/gstack-upgrade`** → manuell, da `auto_upgrade: false`.

---

## 4. Skill-Übersicht nach Kategorie

### Planning
| Slash | Was er tut |
|---|---|
| `/office-hours` | YC Office Hours, 6 forcing questions |
| `/spec` | Vage Idee → executable Spec in 5 Phasen |
| `/plan-ceo-review` | Strategie-Review, „was ist das 10× Produkt hier drin" |
| `/plan-eng-review` | Architektur-Lock, ASCII-Diagramme, Test-Matrix |
| `/plan-design-review` | Design-Kritik vor Implementation |
| `/plan-devex-review` | DX-Plan-Review |
| `/autoplan` | CEO + Design + Eng + DX sequenziell |

### Design
| Slash | Was er tut |
|---|---|
| `/design-consultation` | Komplettes Design-System from scratch |
| `/design-shotgun` | 4-6 AI-Mockup-Varianten, Vergleichs-Board |
| `/design-html` | Mockup → produktions-taugliches HTML/CSS |
| `/design-review` | Live-Design-Audit + Fix (Vorsicht: committet) |

### Review & Security
| Slash | Was er tut |
|---|---|
| `/review` | Pre-landing PR-Review (Fix-First, dein OK bei ASK-Items) |
| `/codex` | OpenAI Codex CLI: review / challenge / consult |
| `/cso` | OWASP + STRIDE Security-Audit |
| `/health` | Code-Quality-Dashboard, 0-10 composite score |

### Debug & QA
| Slash | Was er tut | LumeOS-Regel |
|---|---|---|
| `/investigate` | Systematisches Root-Cause-Debugging | ✅ nutzen |
| `/qa-only` | Report-only QA, kein Code-Change | ✅ nutzen |
| `/qa` | QA + auto-fix + atomic commits | ❌ verletzt „Keine Commits ohne Tom" |
| `/benchmark` | Page-Load + Core Web Vitals Baseline & Diff | ✅ nutzen |
| `/canary` | Post-Deploy-Monitoring | ⚠️ nur wenn du eh deployst |

### Ship (⚠️ mit Approval-Regel)
| Slash | Was er tut | LumeOS-Regel |
|---|---|---|
| `/ship` | Sync main, test, review, bump, push, PR | ⚠️ nur nach explizitem Tom-Approval |
| `/land-and-deploy` | Merge + CI-Wait + Deploy + Prod-Verify | ⚠️ nur nach explizitem Tom-Approval |
| `/setup-deploy` | Einmalige Deploy-Config für `/land-and-deploy` | ⚠️ nur wenn LumeOS-Deploys über gstack laufen sollen |
| `/document-release` | Post-Ship Doc-Update (README, ARCHITECTURE) | ✅ nutzen |
| `/document-generate` | Docs from scratch (Diataxis-Framework) | ✅ nutzen |
| `/retro` | Wochen-Retro, per-person breakdowns | ✅ nutzen |

### Browser & Extraktion
| Slash | Was er tut |
|---|---|
| `/browse` | Headless-Chromium, Screenshots, QA, ~100ms/Kommando |
| `/open-gstack-browser` | Sichtbares Chromium mit Sidebar-Extension |
| `/setup-browser-cookies` | Cookies aus Chrome/Edge/Brave importieren |
| `/pair-agent` | Anderen AI-Agent (Codex, OpenClaw) in gleicher Browser-Session |
| `/scrape` | Daten von Webseite extrahieren |
| `/skillify` | Erfolgreichen `/scrape`-Flow als permanenten Skill speichern |
| `/diagram` | English → Mermaid + Excalidraw + SVG |
| `/make-pdf` | Markdown → PDF/HTML/DOCX |

### Safety
| Slash | Was er tut |
|---|---|
| `/careful` | Warnt vor destruktiven Kommandos (rm -rf, DROP TABLE, force-push) |
| `/freeze <dir>` | Edit-Lock: nur noch `<dir>` schreibbar in dieser Session |
| `/guard` | `/careful` + `/freeze` in einem |
| `/unfreeze` | Freeze aufheben |

### Meta & Memory
| Slash | Was er tut | LumeOS-Regel |
|---|---|---|
| `/learn` | gstack-Learnings anzeigen/suchen/prunen | Sekundär zu Claude-Memory |
| `/context-save` | gstack-Session-Snapshot | ❌ nutze `/ijfw:handoff` |
| `/context-restore` | gstack-Snapshot laden | ❌ nutze `/ijfw:handoff resume` |
| `/plan-tune` | Question-Sensitivity anpassen | Optional |
| `/gstack-upgrade` | gstack aktualisieren | Manuell (auto_upgrade off) |

### GBrain (nicht installiert)
`/setup-gbrain`, `/sync-gbrain`, `/benchmark-models` — nur relevant wenn du gbrain als persistente Wissensbasis dazu willst. Aktuell nicht installiert, Empfehlung: nicht installieren.

### iOS-Toolkit (nicht relevant)
`/ios-qa`, `/ios-fix`, `/ios-design-review`, `/ios-clean`, `/ios-sync` — nur für iOS-Apps auf realer Hardware. Nicht relevant für LumeOS (Next.js Web).

---

## 5. Regeln fürs LumeOS-Repo

**Nicht ohne Tom-OK nutzen:**

| Skill | Grund |
|---|---|
| `/ship` | Auto-Commit + Auto-Push + PR |
| `/land-and-deploy` | Merge + Deploy in Prod |
| `/qa` | Auto-Fix + atomic commits |
| `/design-review` | Fixt visuelle Issues mit Commits |
| `/context-save` / `/context-restore` | Eigenes Snapshot-System — nutze `ijfw:handoff` |
| `/setup-gbrain` | Eigene Wissensbasis, kollidiert mit Claude-Memory |

**Nie einschalten:**

```bash
gstack-config set checkpoint_mode continuous    # ← nein (verletzt „Keine Commits")
gstack-config set auto_upgrade true              # ← nein (unerwartete Skill-Änderungen)
gstack-config set telemetry community            # ← nein (Egress an Supabase)
gstack-config set telemetry anonymous            # ← nein (gleiche Egress-Klasse)
gstack-config set artifacts_sync_mode full       # ← nein (Push in fremdes Repo)
```

**Nie das Setup mit `--team` erneut laufen lassen** — würde SessionStart-Hooks in `~/.claude/settings.json` schreiben, die bei jedem Session-Start `git pull` auf gstack machen.

**Nie gstack ins LumeOS-Repo vendoren** — das führt zu Auto-Migrate-Prompts und mischt gstack-Version mit LumeOS-Code-Reviews. gstack bleibt in `~/.claude/skills/gstack/`, nicht in `apps/`/`packages/`.

---

## 6. Konflikte mit deinem ijfw-Stack

ijfw ist in Claude-Sessions eingebaut und kennt dein Memory / Verify-Gate / Cross-Audit. gstack ist ein zusätzlicher Skill-Pool. Faustregel: **ijfw hat Vorrang, gstack ist zusätzliche Farbe.**

| gstack | ijfw-Äquivalent | Was tun |
|---|---|---|
| `/plan-ceo-review`, `/plan-eng-review`, `/autoplan` | `ijfw:ijfw-plan`, `ijfw:ijfw-plan-check` | ijfw für LumeOS-Planning |
| `/review` | `ijfw:ijfw-review`, `ijfw:ijfw-receiving-review` | ijfw zuerst, `/codex` für Second-Opinion |
| `/investigate` | `ijfw:ijfw-debug`, `debugging-strategies` | beide ok — `/investigate` ist strukturierter, `ijfw:ijfw-debug` besser integriert |
| `/context-save`, `/context-restore` | `ijfw:handoff` | ijfw immer |
| `/learn` | Claude-Memory-System, MEMORY.md | Claude-Memory als primär |
| `/retro` | `ijfw:ijfw-milestone-summary` | ijfw wenn Milestone; `/retro` für Wochen-Sicht |
| `/health` | keine direkte Entsprechung | gstack nutzen |
| `/cso` | keine direkte Entsprechung | gstack nutzen |
| `/browse` | keine (MCP-claude-in-chrome war Krücke) | **immer gstack** |
| `/spec` | keine (kein Workorder-Workflow in diesem Repo) | `/spec` optional zum Denken, nichts zwingt dich |

**Praktische Regel:** Wenn ein ijfw-Skill deine Aufgabe abdeckt, nutze ihn. Nutze gstack für Bereiche, die ijfw nicht abdeckt — vor allem **Browser** (`/browse`, `/design-shotgun`, `/qa-only`), **Security** (`/cso`), **PDF/Diagram-Output** (`/make-pdf`, `/diagram`), und **Cross-Model-Review** (`/codex`).

---

## 7. Konfiguration & Zustand

### 7.1 Wo liegt was

```
~/.gstack/                          ← Runtime-State
  config.yaml                       ← Deine Config (telemetry off etc.)
  .last-setup-version               ← Version-Marker
  .*-prompted                       ← First-Run-Prompt-Marker
  .activated                        ← Erste Skill-Nutzung markiert
  projects/<slug>/learnings.jsonl   ← Per-Projekt-Learnings
  analytics/                        ← Lokale Nutzungs-Logs (JSONL)
  sessions/                         ← Session-Tracking

~/.claude/skills/gstack/            ← gstack-Installation (git-Repo)
~/.claude/skills/<name>/            ← Kopie pro Skill (Windows: kein Symlink)

~/.claude/settings.json             ← unangetastet (kein --team)
```

### 7.2 Wichtige Config-Kommandos

```bash
# Aktuelle Config anzeigen
~/.claude/skills/gstack/bin/gstack-config list

# Einzelnen Wert setzen
~/.claude/skills/gstack/bin/gstack-config set <key> <value>

# Lokale Nutzungs-Analytics anzeigen (kein Netz)
~/.claude/skills/gstack/bin/gstack-analytics

# Timeline aller Skill-Runs
cat ~/.gstack/analytics/skill-usage.jsonl | tail -20
```

### 7.3 Ist-Zustand der Config (nach First-Run)

```yaml
telemetry:                    off       # keine Supabase-Pings
update_check:                 false     # keine Version-Pings bei Skill-Start
auto_upgrade:                 false     # kein git pull auf gstack ohne dein Zutun
checkpoint_mode:              explicit  # kein WIP-Auto-Commit-Prompt
checkpoint_push:              false     # kein Auto-Push von Checkpoints
artifacts_sync_mode:          off       # kein Sync deiner Artifacts in fremdes Repo
artifacts_sync_mode_prompted: true      # kein gbrain-Sync-Prompt mehr
proactive:                    false     # Claude schlägt keine Skills ungefragt vor
routing_declined:             true      # keine Auto-Injection in CLAUDE.md
```

Alle Werte oben sind **explizit gesetzt** (siehe `gstack-config list`). Defaults würden anders lauten (proactive=true, routing_declined=false).

---

## 8. Troubleshooting

### 8.1 „Skill wird nicht gefunden"

```bash
ls ~/.claude/skills/<skill-name>/SKILL.md
# Wenn leer/fehlt:
cd ~/.claude/skills/gstack && bash ./setup
```

Windows-spezifisch: nach jedem `git pull` im gstack-Repo `./setup` erneut laufen, weil Windows Datei-Kopien statt Symlinks nutzt.

### 8.2 `/browse` funktioniert nicht

```bash
cd ~/.claude/skills/gstack && bun install && bun run build
```

Wenn Chromium fehlt:
```bash
cd ~/.claude/skills/gstack && bunx playwright install chromium
```

Daemon-Reset:
```bash
pkill -f "gstack.*browse"
# Oder in gstack-Session:
$B disconnect
```

### 8.3 First-Run-Prompts kommen wieder

```bash
ls -la ~/.gstack/.*-prompted
```

Wenn Marker fehlt, gstack fragt wieder. Zum manuellen Setzen: siehe Abschnitt 2.6.

### 8.4 gstack schreibt in CLAUDE.md obwohl ich nein gesagt habe

Solange `routing_declined: true` gesetzt ist, sollte das nicht passieren. Prüfe:
```bash
grep -A2 "Skill routing" /d/github/LumeOS-Claude-V1/CLAUDE.md
gstack-config get routing_declined
```

Falls doch: `git restore CLAUDE.md` — die von uns gepflegte gstack-Sektion ist manuell dokumentiert, nicht auto-injiziert.

### 8.5 „UPGRADE_AVAILABLE" kommt bei jedem Skill

Sollte mit `update_check: false` nicht kommen. Falls doch:
```bash
gstack-config set update_check false
touch ~/.gstack/update-snoozed
```

### 8.6 gstack-Skill kollidiert mit Built-in / ijfw-Skill

Bei gleichem Namen zeigt Claude Code den zuletzt geladenen Skill. Wenn du einen bestimmten Skill erzwingen willst, nutze den `/gstack-` Präfix:

```bash
cd ~/.claude/skills/gstack && ./setup --prefix
```

Danach heißen alle gstack-Skills `/gstack-review`, `/gstack-qa`, `/gstack-ship` etc. Umkehrbar mit `./setup --no-prefix`.

---

## 9. Deinstallation / Zurückrollen

### 9.1 Nur gstack loswerden

```bash
~/.claude/skills/gstack/bin/gstack-uninstall
# Interaktiv, --force zum Skippen der Bestätigung
```

Entfernt:
- Alle `~/.claude/skills/<name>/` die auf gstack zeigen
- `~/.claude/skills/gstack/` selbst
- Browse-Daemons
- Temp-Files

**Behält:** `~/.gstack/` (mit `--keep-state`), Playwright-Cache in `~/Library/Caches/ms-playwright/` (könnte anderes brauchen).

### 9.2 Alles wegräumen inkl. State

```bash
~/.claude/skills/gstack/bin/gstack-uninstall
rm -rf ~/.gstack
```

### 9.3 LumeOS-CLAUDE.md-Sektion entfernen

Manuell die `## gstack`-Sektion aus `D:\github\LumeOS-Claude-V1\CLAUDE.md` entfernen.

### 9.4 Rollback über Backup

Falls was verkorkst ist:
```bash
cp /d/Audit/pre-gstack-install-backup-20260731-081135/settings.json ~/.claude/settings.json
cp /d/Audit/pre-gstack-install-backup-20260731-081135/LumeOS-CLAUDE.md /d/github/LumeOS-Claude-V1/CLAUDE.md
```

Setup-Log für Forensik: `/d/Audit/pre-gstack-install-backup-20260731-081135/setup-output.log`.

---

## Zusammenfassung — was du dir merken solltest

**Täglich nutzen:**
- `/browse` statt `mcp__claude-in-chrome__*`
- `/investigate` für unklare Bugs in `apps/web`
- `/codex` als Second-Opinion für kritische Änderungen
- `/qa-only` (**nicht** `/qa`) für UI-Prüfungen
- `/cso` für Security-Sweeps
- `/make-pdf`, `/diagram` für Doku-Output

**Nicht in LumeOS ohne Tom-OK:**
- `/ship`, `/land-and-deploy`, `/qa`, `/design-review` (Auto-Commit)
- `/context-save`, `/context-restore` (nutze `/ijfw:handoff`)

**Nie einschalten:**
- `checkpoint_mode: continuous`, `auto_upgrade: true`, `telemetry != off`, `./setup --team`

**Weiterhin gilt** (aus `CLAUDE.md`):
- Keine Codeänderung ohne explizite Freigabe.
- Keine Commits oder Pushes ohne Tom.
- Ein logischer Change pro Commit.
- Governance / Workorders liegen im separaten Governance-Repo — nicht hier.

gstack ist ein **Werkzeug-Zusatz für Claude Code**, keine Prozess-Ersetzung.
