# Wurzel-Altlast — archiviert 2026-08-06 und 2026-08-13 (A-10)

Sechs Dateien, die im Wurzelverzeichnis lagen und dort als Sollwert
missverstanden werden konnten. Per `git mv` verschoben, die Historie
bleibt erhalten; `git revert` holt sie zurück.

**Archiv darf veraltet sein — das ist sein Zweck.** Nichts hier ist
Current Truth. Der Ist-Zustand steht in `docs/ssot/00-INDEX.md`.

---

## Was hier liegt und warum

| Datei | Zeilen | Warum archiviert (`[cmd]` 2026-08-06) |
|---|---|---|
| `COMMANDS.md` | 230 | Der Kernbefehl zeigt auf `start-all.ps1` — die Datei existiert nur noch unter `_archive/governance/tools-scripts/`. Verweise auf `.claude/hooks/pre-tool.ps1` (mit B-15 gelöscht) und auf `system/architecture/`, `system/prompts/governance/` (mit B-15 ersatzlos entfernt). Die lebenden Befehle stehen seit A-09 im Root-`README.md`. |
| `SESSION_ONBOARDING.md` | 295 | **44 Treffer auf `system/`** — ein Verzeichnis, das es seit B-15 nicht mehr gibt. Beschreibt den Workorder-Ablauf der Governance-Ära. |
| `STACK_REFERENCE.md` | 190 | Stack-Beschreibung aus derselben Ära, 1 Treffer auf `system/`. Der reale Stack steht im Root-`README.md` und in `docs/ssot/10-workspace.md`. |
| `CLAUDE.md.v1.bak` | 190 | Sicherungskopie der `CLAUDE.md` **vor** dem A-02-Umbau. Enthält die alte Brain/Law/Muscle-Rollenbeschreibung und Verweise auf `docs/decisions/` (mit D-06 aufgelöst). |

### Nachtrag 2026-08-13 (Block 23, A-10)

| Datei | Grösse | Warum archiviert (`[cmd]` 2026-08-13) |
|---|---|---|
| `artefakt.json` | 2.677 B | **Testausgabe des Governance-Compilers vom 2026-04-23**, kein Konfigurationsfile: `wo_id: "test-001"`, `compiled_by: qwen3.6-35b-governance-compiler`. Zielt auf `packages/agent-core/src/registry.ts` — `[cmd]` dieses Paket existiert nicht mehr. Alle Leser (`governance-compiler`, `sat-check`, `wo-core`) liegen seit 2026-08-03 in `_archive/`. |
| `.cursorrules` | 734 B | Editor-Konfiguration für Cursor mit dem lean-ctx-Block. `[cmd]` Inhaltlich eine **ältere Teilkopie** von `.claude/rules/lean-ctx.md` (dort 10 Lesemodi und die proaktiven Befehle, hier nur die Werkzeugtabelle). Cursor wird in diesem Repo nicht benutzt; die Datei konnte nur noch auseinanderdriften. |

---

## Was NICHT hierher kam

`AGENTS.md` bleibt im Wurzelverzeichnis. `[cmd]` 2026-08-06 geprüft: die
Datei ist **keine Altlast mehr**, sondern der aktuelle Einstiegspunkt für
Agenten-Werkzeuge — sie trägt den lean-ctx-Block, verweist auf das
vorhandene `LEAN-CTX.md` und auf `CLAUDE.md`. Das ijfw-Frontmatter, das
sie zur Altlast machte, ist mit B-10 entfernt worden.

Mehrere Werkzeuge lesen `AGENTS.md` von sich aus; ein Verschieben hätte
funktionierende Konfiguration abgeschaltet, um Ordnung zu schaffen.
Stattdessen **saniert**: die dortige Behauptung „`services/` und
`packages/` sind leer oder nicht vorhanden" war `[cmd]` falsch
(`packages/shared` und `services/nutrition-api` tragen Code) und wurde
berichtigt.
