# gstack — Bedienungsanleitung (LumeOS-Kontext)

**Zielgruppe:** Du (Tom) und Teammates, die gstack im LumeOS-Umfeld täglich nutzen wollen.
**Ergänzt:** `GSTACK.md` (Install/Uninstall) und `~/.claude/skills/gstack/README.md` (Upstream-Doku).
**Ausrichtung:** Governance-verträglich — gstack ersetzt weder LumeOS-Workorder-System noch Ship-Regeln.

---

## Inhalt

1. [Grundprinzip](#1-grundprinzip)
2. [First-Run — was beim ersten Skill-Aufruf passiert](#2-first-run--was-beim-ersten-skill-aufruf-passiert)
3. [Dein Alltag — konkrete Szenarien](#3-dein-alltag--konkrete-szenarien)
4. [Skill-Übersicht nach Kategorie](#4-skill-übersicht-nach-kategorie)
5. [Verbotszone — Skills die LumeOS-Governance verletzen würden](#5-verbotszone--skills-die-lumeos-governance-verletzen-würden)
6. [Konflikte mit deinem ijfw-Stack](#6-konflikte-mit-deinem-ijfw-stack)
7. [Konfiguration & Zustand](#7-konfiguration--zustand)
8. [Troubleshooting](#8-troubleshooting)
9. [Deinstallation / Zurückrollen](#9-deinstallation--zurückrollen)

---

## 1. Grundprinzip

gstack ist ein Set aus 55 Slash-Commands, die Claude Code als **spezialisierte Rollen** aufrufen kann: CEO, Eng Manager, Designer, QA Lead, Debugger, Release Engineer, Security Officer. Jeder Skill hat eine Preamble (System-Check), einen strukturierten Workflow, und einen Report am Ende.

**Router:** Wenn du `/gstack` ohne Argument tippst, entscheidet der Router-Skill (`~/.claude/skills/gstack/SKILL.md`) welcher Sub-Skill passt. Meistens rufst du aber direkt den Ziel-Skill auf, z.B. `/investigate` oder `/browse`.

**Trigger-Phrasen statt Slash:** Viele Skills feuern auch bei natürlicher Sprache — „debug this", „browse to X", „review my changes". Dein `PROACTIVE`-Flag (siehe Abschnitt 2) steuert, ob Claude von sich aus vorschlagen darf.

**LumeOS-Grundregel:** gstack ergänzt Claude Code, ersetzt aber **nicht** deinen `Brainstorm → Spec → Workorders → Batch → Run → Reports`-Workflow. Für Governance-relevantes Arbeiten bleibt dein ijfw-/LumeOS-Stack führend.

---

## 2. First-Run — was beim ersten Skill-Aufruf passiert

Beim allerersten `/gstack`- oder `/browse`- oder anderem Skill-Aufruf fragt gstack **in dieser Reihenfolge**. Deine Antwort wird persistent in `~/.gstack/config.yaml` und `~/.gstack/.*-prompted`-Markern gespeichert.

### 2.1 Boil-the-Ocean-Intro

> *„gstack folgt dem Boil the Ocean-Prinzip — mach die vollständige Sache wenn AI die Grenzkosten fast Null macht. Willst du den Blog-Post öffnen?"*

**Empfohlene Antwort: Nein.** Ist eine Marketing-Seite, keine Konfiguration. Der Marker wird trotzdem gesetzt.

### 2.2 Telemetrie

> *„Help gstack get better. Share usage data only: skill, duration, crashes, stable device ID. No code or file paths."*

**Empfohlene Antwort: B — No thanks.**
Folge-Prompt:
> *„Anonymous mode sends only aggregate usage, no unique ID."*

**Empfohlene Antwort: B — No thanks, fully off.**

Grund: In `~/.gstack/config.yaml` steht bei uns bereits `telemetry: off`. Diese Wahl bestätigt es endgültig gegenüber gstack.

### 2.3 Proactive Suggestions

> *„Let gstack proactively suggest skills, like /qa for 'does this work?' or /investigate for bugs?"*

**Empfohlene Antwort: B — Turn it off.**

Grund: In LumeOS willst du kontrollieren, wann welcher Skill läuft. gstack darf nicht ungefragt `/spec` oder `/ship` vorschlagen, weil das mit deinem Masterprompt-Workflow (`Spec erstellen:`) kollidiert. Du kannst gstack-Skills weiterhin explizit per Slash-Command aufrufen.

Später umschaltbar: `~/.claude/skills/gstack/bin/gstack-config set proactive true`.

### 2.4 CLAUDE.md Skill-Routing-Sektion

> *„gstack works best when your project's CLAUDE.md includes skill routing rules. Add?"*

**Empfohlene Antwort: B — No thanks, I'll invoke skills manually.**

Grund: Deine LumeOS-CLAUDE.md hat bereits einen kuratierten Governance-Workflow. Die von gstack vorgeschlagene Routing-Sektion würde Regeln wie „User asks about strategy → invoke `/plan-ceo-review`" einführen, die mit deinem Masterprompt-System kollidieren.

Später umschaltbar: `gstack-config set routing_declined false`.

### 2.5 Continuous Checkpoint Mode

> *„Enable Continuous checkpoint auto-commits?"*

**Empfohlene Antwort: Ablehnen (Enter drücken oder Nein).**

Grund: Verletzt deine LumeOS-Regel „Keine Commits oder Pushes ohne Tom". Continuous Mode würde Claude auffordern, nach jedem logischen Fortschritt `WIP: `-Commits anzulegen — das umgeht deine WO-State-Machine.

Später umschaltbar: `gstack-config set checkpoint_mode continuous`.

### 2.6 Artifacts Sync (nur wenn gbrain installiert)

Kommt nur, falls du später `/setup-gbrain` ausführst. Empfehlung dann: **C — Decline, keep everything local**.

### 2.7 Optional: alle Prompts vorab überspringen

Falls du die First-Run-Fragen komplett unterdrücken willst:

```bash
touch ~/.gstack/.completeness-intro-seen \
      ~/.gstack/.telemetry-prompted \
      ~/.gstack/.proactive-prompted \
      ~/.gstack/.activated \
      ~/.gstack/.first-loop-tip-shown
~/.claude/skills/gstack/bin/gstack-config set proactive false
~/.claude/skills/gstack/bin/gstack-config set routing_declined true
~/.claude/skills/gstack/bin/gstack-config set checkpoint_mode explicit
```

---

## 3. Dein Alltag — konkrete Szenarien

Alle Beispiele setzen voraus: `PROACTIVE=false`, du rufst explizit auf.

### 3.1 Ich brauche einen Screenshot / muss eine URL prüfen / QA im Browser

**→ `/browse <url-oder-frage>`**

Startet den headless-Chromium-Daemon (localhost, Playwright). Erster Aufruf dauert ~5s (Daemon-Start), danach ~100ms pro Kommando. Für authentifizierte Seiten vorher einmal `/setup-browser-cookies` laufen lassen — importiert Cookies aus deinem echten Chrome/Edge.

**Ersetzt:** `mcp__claude-in-chrome__*`-Tools. Nutze `/browse` konsequent, damit die MCP-Variante aus deinem Workflow verschwindet.

**Daemon killen:** `$B disconnect` oder Session beenden. Der Daemon läuft sonst persistent.

### 3.2 Etwas ist kaputt und ich weiß nicht warum

**→ `/investigate <symptom>`**

Systematisches Root-Cause-Debugging mit Hypothesen-Log. „Iron Law: no fixes without investigation." Bricht nach 3 gescheiterten Fix-Versuchen ab und eskaliert an dich. Auto-freezt sich auf das Modul das er untersucht, damit er nicht versehentlich Nachbarcode ändert.

**LumeOS-Nutzen:** Für Governance-Bugs (WO-State-Machine, Scheduler-Preflight, Approval-Queue) oft schneller als per Hand durch die Layer zu greppen. Aber: die Fix-Vorschläge braucht dein normales Approval, kein Auto-Merge.

### 3.3 Ich hab Code geändert und will Second Opinion

**→ `/review`** (Claude schaut sich den Diff an) oder
**→ `/codex`** (delegiert an OpenAI Codex CLI, komplett anderes Modell)

`/codex` ist besonders wertvoll weil du eh Codex/GPT-5.5 als Senior-Review-Runtime nutzt. Drei Modi:
- **review** — pass/fail-Gate
- **challenge** — versucht aktiv, den Code kaputtzumachen
- **consult** — freier Dialog mit Session-Kontinuität

Wenn beide (`/review` + `/codex`) auf dem gleichen Branch gelaufen sind, gibt es einen Cross-Model-Vergleich.

### 3.4 Ich brauche eine schnelle Sicht auf Security

**→ `/cso`**

OWASP Top 10 + STRIDE Threat Model. Zero-Noise-Gate: 8/10 Confidence minimum, 17 False-Positive-Exclusions, jede Finding kommt mit konkretem Exploit-Szenario.

**LumeOS-Nutzen:** Vor einem Codex-Senior-Review kann `/cso` bereits die offensichtlichen Vulns filtern, damit dein senior review sich auf Architektur konzentriert.

### 3.5 Ich baue was Neues und will das Denken strukturieren

**→ `/office-hours <idee>`** (YC Office Hours — hinterfragt dein Framing)
**→ `/spec <idee>`** (formaler 5-Phasen-Spec mit Codex-Quality-Gate)

**Wichtig für LumeOS:** Diese Skills schreiben **eigene** Design-Docs und Specs, **nicht** in dein `docs/project/prompts/`-Masterprompt-System. Sie ersetzen also nicht deinen Workflow „Spec erstellen: …", sondern sind eine Denk-Hilfe **vor** oder **neben** dem LumeOS-Prozess.

Wenn du eine LumeOS-Spec willst → nutze weiter „Spec erstellen:" mit deiner Masterprompt-Kette. Wenn du eine reine Denk-Session willst → `/office-hours`.

### 3.6 Ich will eine UI/Frontend-Änderung visuell prüfen

**→ `/qa <url>`** (findet Bugs UND fixed sie mit atomic commits + Regression-Tests)
**→ `/qa-only <url>`** (nur Report, kein Code-Change — das ist die LumeOS-konforme Variante!)
**→ `/design-review <url>`** (visuelle Konsistenz, Spacing, AI-Slop)

**Governance-Regel:** In LumeOS immer `/qa-only` benutzen, nicht `/qa`. `/qa` macht selbständige Commits — das verletzt „Keine Commits ohne Tom". Die von `/qa-only` gefundenen Bugs kannst du dann als Workorder anlegen.

### 3.7 Ich muss ein Diagramm für Doku bauen

**→ `/diagram <englische-beschreibung>`**

Emittiert ein Triplet: Mermaid-Source, `.excalidraw`-Datei (im Browser editierbar), gerenderte SVG/PNG. Offline. Passt gut zu deinen `docs/project/GOVERNANCE_*.md`-Dokumenten.

### 3.8 Ich brauche eine PDF-Version einer Markdown-Doku

**→ `/make-pdf <pfad-zu-markdown>`**

Publikationsqualität. Rendert Mermaid- und Excalidraw-Fences als Vektorgrafiken. `--to html` für Single-File-HTML, `--to docx` für Word. Offline.

**LumeOS-Nutzen:** Deine `docs/project/*.md` zu PDF für externe Stakeholder.

### 3.9 Ich will wissen, was gstack über mein Projekt gelernt hat

**→ `/learn`**

Zeigt/sucht/exportiert Learnings die gstack cross-session gespeichert hat. Liegen in `~/.gstack/projects/<slug>/learnings.jsonl`.

**Achtung:** gstack legt eigene Learnings an — separate von deinem ijfw-Memory-System (`~/.claude/CLAUDE.md`-Blöcke, IJFW-MEMORY-Block in LumeOS-CLAUDE.md). Die beiden Systeme kennen sich nicht.

### 3.10 Rest ist Meta

- **`/gstack-upgrade`** → gstack aktualisieren. Da wir `update_check: false` und `auto_upgrade: false` haben, musst du das manuell fahren wenn du willst.
- **`/careful`, `/freeze`, `/guard`, `/unfreeze`** → Safety-Locks für Claude im aktuellen Turn.
- **`/context-save`, `/context-restore`** → gstack-eigene Snapshots. **Nutze stattdessen `/ijfw:handoff`**, das ist in dein Memory-System integriert.
- **`/retro`, `/health`** → Wochen-Retro und Code-Quality-Dashboard. Nice-to-have.

---

## 4. Skill-Übersicht nach Kategorie

Tabelle als Referenz. Nur Kern-Skills. Trigger-Phrasen kommen aus den `SKILL.md`-Frontmattern.

### Planning
| Slash | Was er tut | Trigger |
|---|---|---|
| `/office-hours` | YC Office Hours, hinterfragt dein Framing, 6 forcing questions | „brainstorm", „help me think through" |
| `/spec` | Vage Idee → executable Spec in 5 Phasen, mit Codex-Quality-Gate | „spec this out", „file an issue" |
| `/plan-ceo-review` | Strategie-Review, „was ist das 10× Produkt hier drin" | „think bigger", „strategy review" |
| `/plan-eng-review` | Architektur-Lock, ASCII-Diagramme, Test-Matrix | „review architecture", „check plan" |
| `/plan-design-review` | Design-Kritik vor Implementation | „design plan review" |
| `/plan-devex-review` | DX-Plan-Review, TTHW-Benchmark gegen Competitors | „dx plan review" |
| `/autoplan` | CEO + Design + Eng + DX sequenziell, auto-decisions | „run all reviews" |

### Design
| Slash | Was er tut | Trigger |
|---|---|---|
| `/design-consultation` | Komplettes Design-System from scratch, `DESIGN.md` | „design system" |
| `/design-shotgun` | 4-6 AI-Mockup-Varianten, Vergleichs-Board, Iteration | „show me design options" |
| `/design-html` | Mockup → produktions-taugliches HTML/CSS (Pretext-basiert) | „build the design" |
| `/design-review` | Live-Design-Audit + Fix mit atomic commits | „design qa" |

### Review & Security
| Slash | Was er tut | Trigger |
|---|---|---|
| `/review` | Pre-landing PR-Review, findet Bugs die CI übersieht | „review this pr" |
| `/codex` | OpenAI Codex CLI: review / challenge / consult | „codex review", „second opinion" |
| `/cso` | OWASP + STRIDE Security-Audit, high-confidence findings | „security audit" |
| `/health` | Code-Quality-Dashboard, 0-10 composite score | „code health" |

### Debug & QA
| Slash | Was er tut | LumeOS-Regel |
|---|---|---|
| `/investigate` | Systematisches Root-Cause-Debugging | ✅ nutzen |
| `/qa-only` | Report-only QA, kein Code-Change | ✅ nutzen |
| `/qa` | QA + auto-fix + auto-commit + Regression-Test | ❌ verletzt „Keine Commits ohne Tom" |
| `/benchmark` | Page-Load + Core Web Vitals Baseline & Diff | ✅ nutzen |
| `/canary` | Post-Deploy-Monitoring | ⚠️ nur wenn du eh deployst |

### Ship (⚠️ mit LumeOS-Approval-Regel)
| Slash | Was er tut | LumeOS-Regel |
|---|---|---|
| `/ship` | Sync main, test, review, bump, push, PR | ⚠️ nur nach explizitem Tom-Approval |
| `/land-and-deploy` | Merge + CI-Wait + Deploy + Prod-Verify | ⚠️ nur nach explizitem Tom-Approval |
| `/setup-deploy` | Einmalige Deploy-Config für `/land-and-deploy` | ⚠️ nicht für LumeOS-Repo |
| `/document-release` | Post-Ship Doc-Update (README, ARCHITECTURE, CHANGELOG) | ✅ nutzen |
| `/document-generate` | Docs from scratch (Diataxis-Framework) | ✅ nutzen |
| `/retro` | Wochen-Retro, per-person breakdowns | ✅ nutzen |

### Browser & Extraktion
| Slash | Was er tut |
|---|---|
| `/browse` | Headless-Chromium, Screenshots, QA, ~100ms/Kommando |
| `/open-gstack-browser` | Sichtbares Chromium mit Sidebar-Extension |
| `/setup-browser-cookies` | Cookies aus Chrome/Edge/Brave importieren |
| `/pair-agent` | Anderen AI-Agent (Codex, OpenClaw, Hermes) in gleicher Browser-Session |
| `/scrape` | Daten von Webseite extrahieren |
| `/skillify` | Erfolgreichen `/scrape`-Flow als permanenten Skill speichern |
| `/diagram` | English → Mermaid + Excalidraw + SVG |
| `/make-pdf` | Markdown → PDF/HTML/DOCX, publikationstauglich |

### Safety
| Slash | Was er tut |
|---|---|
| `/careful` | Warnt vor destruktiven Kommandos (rm -rf, DROP TABLE, force-push) |
| `/freeze <dir>` | Edit-Lock: nur noch `<dir>` schreibbar in dieser Session |
| `/guard` | `/careful` + `/freeze` in einem |
| `/unfreeze` | Freeze aufheben |

### Meta & Memory
| Slash | Was er tut | Nutzen für dich |
|---|---|---|
| `/learn` | gstack-Learnings anzeigen/suchen/prunen | Sekundär zu deinem ijfw-Memory |
| `/context-save` | gstack-Session-Snapshot | ❌ nutze stattdessen `/ijfw:handoff` |
| `/context-restore` | gstack-Snapshot laden | ❌ nutze stattdessen `/ijfw:handoff resume` |
| `/plan-tune` | Question-Sensitivity anpassen („stop asking me that") | Optional |
| `/gstack-upgrade` | gstack aktualisieren | Manuell, da auto_upgrade off |

### GBrain (nicht installiert)
`/setup-gbrain`, `/sync-gbrain`, `/benchmark-models` — nur relevant wenn du gbrain als persistente Wissensbasis dazu willst. Aktuell nicht installiert (Empfehlung: nicht installieren, dein LumeOS-System und ijfw-Memory decken das ab).

### iOS-Toolkit (nicht relevant)
`/ios-qa`, `/ios-fix`, `/ios-design-review`, `/ios-clean`, `/ios-sync` — nur für iOS-Apps auf realer Hardware. Nicht relevant für LumeOS.

---

## 5. Verbotszone — Skills die LumeOS-Governance verletzen würden

**Nicht in LumeOS-Repo nutzen ohne explizites Tom-OK:**

| Skill | Grund |
|---|---|
| `/ship` | macht Auto-Commit + Auto-Push + PR — verletzt „Keine Commits oder Pushes ohne Tom" |
| `/land-and-deploy` | dito, plus deployt |
| `/qa` | macht Auto-Fix + atomic commits + Regression-Tests |
| `/design-review` | ähnlich, fixt visuelle Issues mit Commits |
| `/context-save` / `/context-restore` | eigenes Snapshot-System — nutze stattdessen `ijfw:handoff` |
| `/setup-gbrain` | eigene Wissensbasis, kollidiert mit deinem Memory-Layer |

**Nie einschalten:**

```bash
gstack-config set checkpoint_mode continuous   # ← nein
gstack-config set auto_upgrade true             # ← nein
gstack-config set telemetry community           # ← nein
gstack-config set artifacts_sync_mode full      # ← nein
```

**Nie das Setup mit `--team` erneut laufen lassen** — das würde SessionStart-Hooks in `~/.claude/settings.json` schreiben.

---

## 6. Konflikte mit deinem ijfw-Stack

Es gibt semantische Doppelungen. Faustregel: **ijfw hat Vorrang, gstack ist zusätzliche Farbe.**

| gstack | ijfw-Äquivalent | Was tun |
|---|---|---|
| `/spec` | Masterprompt „Spec erstellen:" | ijfw für LumeOS-Workorders; `/spec` nur für externe Ideen |
| `/plan-ceo-review`, `/plan-eng-review`, `/autoplan` | `ijfw:ijfw-plan`, `ijfw:ijfw-plan-check` | ijfw für LumeOS-Planning |
| `/review` | `ijfw:ijfw-review`, `ijfw:ijfw-receiving-review` | ijfw zuerst, `/codex` für Second-Opinion |
| `/investigate` | `ijfw:ijfw-debug`, `debugging-strategies` | beide ok — `/investigate` ist strukturierter, `ijfw:ijfw-debug` besser integriert |
| `/context-save`, `/context-restore` | `ijfw:handoff` | ijfw immer |
| `/learn` | ijfw-Memory, `~/.claude/CLAUDE.md`-Blöcke | ijfw als primär |
| `/retro` | `ijfw:ijfw-milestone-summary` | ijfw wenn Milestone; `/retro` für Wochen-Sicht |
| `/health` | keine direkte Entsprechung | gstack nutzen |
| `/cso` | keine direkte Entsprechung | gstack nutzen |
| `/browse` | keine (MCP-claude-in-chrome war Krücke) | **immer gstack** |

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
~/.claude/skills/<name>/            ← Symlink/Copy pro Skill

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

### 7.3 Empfohlene Config (Ist-Zustand)

```yaml
telemetry: off              # keine Supabase-Pings
update_check: false         # keine Version-Pings bei Skill-Start
auto_upgrade: false         # kein git pull auf gstack ohne dein Zutun
checkpoint_mode: explicit   # kein WIP-Auto-Commit-Prompt
checkpoint_push: false      # kein Auto-Push von Checkpoints
artifacts_sync_mode: off    # kein Sync deiner Artifacts in fremdes Repo
```

Zusätzlich (per gstack-config, nach First-Run):
```bash
gstack-config set proactive false        # nach First-Run gesetzt
gstack-config set routing_declined true  # keine CLAUDE.md-Injection
```

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
# Wenn Marker fehlt, gstack fragt wieder. Zum manuellen Setzen:
touch ~/.gstack/.telemetry-prompted ~/.gstack/.proactive-prompted
```

### 8.4 gstack schreibt in CLAUDE.md obwohl ich nein gesagt habe

Solange `routing_declined: true` (siehe Abschnitt 7.3) gesetzt ist, sollte das nicht passieren. Prüfe:
```bash
grep -A2 "Skill routing" /d/github/LumeOS-Claude-V1/CLAUDE.md
gstack-config get routing_declined
```

Falls doch: `git restore CLAUDE.md` — die von uns gepflegte gstack-Sektion ist manuell dokumentiert, nicht auto-injiziert.

### 8.5 „UPGRADE_AVAILABLE" kommt bei jedem Skill

Erwartet, weil wir `update_check: false` haben — sollte eigentlich nicht kommen. Falls doch:
```bash
gstack-config set update_check false
touch ~/.gstack/update-snoozed
```

### 8.6 gstack-Skill kollidiert mit Built-in / ijfw-Skill

Bei gleichem Namen wird Claude Code den zuletzt geladenen Skill zeigen. Wenn du einen bestimmten Skill erzwingen willst, nutze den `/gstack-` Präfix:

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

Manuell die `## gstack`-Sektion und `## Skill routing`-Sektion (falls doch injiziert wurde) aus `D:\github\LumeOS-Claude-V1\CLAUDE.md` entfernen.

### 9.4 Rollback über Backup

Falls was verkorkst ist:
```bash
cp /d/Audit/pre-gstack-install-backup-20260731-081135/settings.json ~/.claude/settings.json
cp /d/Audit/pre-gstack-install-backup-20260731-081135/LumeOS-CLAUDE.md /d/github/LumeOS-Claude-V1/CLAUDE.md
```

Das komplette Setup-Log für Forensik: `/d/Audit/pre-gstack-install-backup-20260731-081135/setup-output.log`.

---

## Zusammenfassung — was du dir merken solltest

**Täglich nutzen:**
- `/browse` statt `mcp__claude-in-chrome__*`
- `/investigate` für unklare Bugs
- `/codex` als Second-Opinion neben deinem Codex/GPT-5.5-Senior-Review
- `/qa-only` (**nicht** `/qa`) für UI-Prüfungen
- `/cso` für Security-Sweeps
- `/make-pdf`, `/diagram` für Doku-Output

**Nicht in LumeOS nutzen ohne Tom-OK:**
- `/ship`, `/land-and-deploy`, `/qa`, `/design-review` (Auto-Commit)
- `/context-save`, `/context-restore` (nutze `/ijfw:handoff`)

**Nie einschalten:**
- `checkpoint_mode: continuous`, `auto_upgrade: true`, `telemetry != off`, `./setup --team`

**Für Governance-Arbeiten weiterhin:**
- Deine Masterprompt-Kette `Brainstorm → Spec → Workorders → Batch → Run → Reports`
- Deine ijfw-Skills (`ijfw:ijfw-plan`, `ijfw:ijfw-review`, `ijfw:handoff`)

gstack ist ein **Werkzeug-Zusatz**, keine Prozess-Ersetzung.
