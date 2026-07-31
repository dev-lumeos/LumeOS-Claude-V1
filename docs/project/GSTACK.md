# gstack in LumeOS

**Status:** Locally installed on maintainer machine, not a project dependency.
**Repo:** https://github.com/garrytan/gstack
**Version installed:** v1.60.1.0 (2026-07-31)
**Full audit report:** `D:\Audit\gstack-audit-report.md` (local, not in repo)

---

## Was gstack ist

Ein Framework aus ~55 Skills für Claude Code — Fokus auf Planning-Review-Cycles, Design-Iteration, QA, Ship-Workflow, headless-Browser (`/browse` via Playwright/Chromium-Daemon). Optional dazu ein Update-/Telemetrie-System und `--team`-Modus mit SessionStart-Hooks.

**Nicht Teil des LumeOS-Governance-Systems.** gstack ersetzt weder WO-State-Machine noch Risk-Categories noch die Masterprompt-Kette. Es ist ein zusätzlicher Skill-Pool für Design-, Browse-, und Review-Aufgaben.

## Governance-Kompatibilität

Kompatibel mit LumeOS-`Schreibregeln`, **wenn** so installiert wie unten beschrieben (ohne `--team`, mit Telemetrie hart aus).

Konflikte, wenn falsch installiert:
- `--team` → SessionStart-Hook macht `git pull` in gstack-Repo bei jedem Session-Start (kein Konflikt mit LumeOS-Code, aber ungeplantes Auto-Verhalten).
- `checkpoint_mode: continuous` → würde Skill-Aufrufe zu Auto-Commit-Aufforderungen machen, umgeht WO-State-Machine.
- gstack-Skills `/ship` und `/land-and-deploy` machen Git-Operations (commit, push, PR). **Diese brauchen weiterhin explizite Tom-Approval** — gstack override die LumeOS-Regel „Keine Commits oder Pushes ohne Tom" nicht automatisch.

## Install-Anleitung für Teammates

**Voraussetzungen:**
- Bun installiert (`https://bun.sh/install`)
- Node ≥ 20
- Bash (unter Windows: Git Bash oder WSL)

**Schritte (in dieser Reihenfolge):**

```bash
# 1. Telemetrie hart abschalten VOR dem Setup
mkdir -p ~/.gstack
cat > ~/.gstack/config.yaml <<'EOF'
telemetry: off
update_check: false
auto_upgrade: false
checkpoint_mode: explicit
checkpoint_push: false
artifacts_sync_mode: off
EOF

# 2. Clone in Claude-Skills-Verzeichnis
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack

# 3. Setup OHNE --team (keine SessionStart-Hooks in ~/.claude/settings.json)
cd ~/.claude/skills/gstack
GSTACK_SKIP_FONTS=1 bash ./setup

# 4. Verify
ls ~/.claude/skills/ | grep -v gstack   # sollte nur eigene Skills + lean-ctx zeigen
diff ~/.claude/settings.json.bak-latest ~/.claude/settings.json   # sollte leer sein
```

**Nach dem Setup:**
- Alle gstack-Skills sind global unter `~/.claude/skills/` verfügbar
- `browse`-Daemon startet lazy bei erster `/browse`-Nutzung (Playwright/Chromium, localhost 127.0.0.1)
- Kein Auto-Update, kein Telemetrie-Egress, keine Hook-Modifikation

## Uninstall

```bash
cd ~/.claude/skills/gstack
bash bin/gstack-uninstall
# Danach:
rm -rf ~/.claude/skills/gstack ~/.gstack
# Alle verlinkten Skills (autoplan, browse, ship, ...) unter ~/.claude/skills/ manuell entfernen
```

## Was NICHT tun

- **Nicht** `./setup --team` verwenden — installiert SessionStart-Hook den wir nicht wollen.
- **Nicht** `gstack-config set checkpoint_mode continuous` — verletzt LumeOS-WO-State-Machine.
- **Nicht** `gstack-config set auto_upgrade true` — auto-git-pull ist ungewollt.
- **Nicht** `gstack-config set telemetry community` oder `anonymous` — Skill-Nutzung an Supabase-Endpoint.
- **Nicht** `/ship` oder `/land-and-deploy` ohne Tom-Approval — bleibt LumeOS-Governance-Regel.

## Skill-Referenz (Auszug)

Browsing → `/browse` (Playwright-Daemon, das eigentliche USP)
Design → `/design-consultation`, `/design-shotgun`, `/design-html`, `/design-review`
Planning → `/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/autoplan`
QA → `/qa`, `/qa-only`, `/investigate`
Ship (mit Approval-Regel) → `/ship`, `/land-and-deploy`, `/canary`, `/document-release`
Meta → `/retro`, `/learn`, `/gstack-upgrade`

Vollständige Liste: `~/.claude/skills/gstack/SKILL.md`.

## Warum wir gstack nicht in package.json / repo committen

- gstack lebt in `~/.claude/skills/`, nicht im Repo — es ist eine Claude-Runtime-Erweiterung, kein LumeOS-Code.
- gstack-Skills werden von Claude Code über SKILL-Discovery entdeckt, brauchen keine Repo-Integration.
- Kein Vendoring vermeidet Update-Konflikte und hält den LumeOS-Repo schlank.

## Audit-Nachweis

Vor dem Install wurde ein Read-Only-Audit durchgeführt. Kernbefunde:
- Kein Touch auf `~/.claude/CLAUDE.md` durch Setup.
- Telemetrie per Default `off`, Endpoint hardcoded auf Supabase — vor Setup deaktivierbar (siehe Schritt 1 oben).
- Kein `curl | bash` im User-Pfad (nur in CI).
- SessionStart-/PostToolUse-Hooks nur bei `--team` bzw. `--plan-tune-hooks` — beide ausgeschaltet.
- Browse-Daemon startet lazy, nur localhost, kill via `browse stop`.

Report: `D:\Audit\gstack-audit-report.md` (auf Anfrage teilen).
