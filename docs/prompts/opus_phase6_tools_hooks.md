# LUMEOS — Opus Tool & Hook Integration Prompt
# Phase 6: Tool-Stack + Hooks + Memory + AGENT.md
# Ziel: Alle definierten Tools in den Prozess einbinden

---

Du hast heute die Control Plane implementiert (Phase 1-4, E2E 5/5).
Jetzt binden wir alle Tools ein die den Brain Layer produktiv machen.

## PHASE 6 — TOOL STACK INTEGRATION

---

### WO-6.1: Context7 MCP einrichten

Context7 gibt Claude Code Zugriff auf aktuelle Library-Dokumentation.

**Aufgabe:**
Erstelle `.claude/mcp.json` mit Context7 Konfiguration:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

Verifiziere dass diese Libraries verfügbar sind:
- hono (v4)
- @supabase/supabase-js (v2)
- next (v14)
- @noble/ed25519
- zod (v3)
- typescript (v5)

**Acceptance:**
- `.claude/mcp.json` existiert
- Context7 Server konfiguriert
- In CLAUDE.md dokumentiert: "Nutze /context7 für Library-Dokumentation"

---

### WO-6.2: Serena LSP Navigation einrichten

Serena gibt Claude Code Symbol-Suche, Go-to-Definition und Code-Navigation.

**Aufgabe:**
Prüfe ob Serena MCP bereits in `.claude/mcp.json` konfiguriert ist.
Falls nicht, füge hinzu:

```json
"serena": {
  "command": "uvx",
  "args": ["--from", "serena", "serena-mcp-server"],
  "env": {
    "PROJECT_ROOT": "${workspaceFolder}"
  }
}
```

Erstelle `tools/serena/serena.yml`:
```yaml
project_root: .
languages:
  - typescript
  - javascript
ignore_patterns:
  - node_modules
  - dist
  - .next
  - pnpm-lock.yaml
```

**Acceptance:**
- Serena konfiguriert in `.claude/mcp.json`
- `tools/serena/serena.yml` existiert

---

### WO-6.3: Memory Solution — Anthropic Native

Wir nutzen Anthropic native Memory (bereits in Claude Code integriert).

**Aufgabe:**
Erstelle `system/memory/canonical/session_protocol.md`:

```markdown
# Session Memory Protocol

## Session Start
1. Lies system/memory/canonical/lumeos_canonical.md
2. Lies docs/decisions/ (letzte 5 Einträge)
3. Lies system/workorders/batches/ (offene WOs)

## Session End
1. Update system/memory/canonical/lumeos_canonical.md
   → Neue Entscheidungen
   → Geänderte Architektur
   → Neue offene Punkte
2. Erstelle docs/decisions/ADR-{id}-{date}-{topic}.md
   für jede neue Architektur-Entscheidung
3. Commit: "memory: update canonical + ADR"
```

Erstelle `system/memory/canonical/adr_index.md` als Index aller ADRs.

**Acceptance:**
- Session Protocol existiert
- ADR Index existiert
- In CLAUDE.md referenziert

---

### WO-6.4: Claude Code Hooks einrichten

Hooks sind Pre/Post-Execution Scripts die bei jedem Tool-Call laufen.

**Aufgabe:**
Erstelle `.claude/hooks/` Verzeichnis und folgende Hooks:

**Pre-Tool Hook** `.claude/hooks/pre-tool.sh`:
```bash
#!/bin/bash
# Läuft vor jedem Tool-Call
# Prüft ob Scope-Grenzen eingehalten werden

TOOL=$1
FILE=$2

# Scope Guard: Verbiete Schreibzugriff auf kritische Dateien
FORBIDDEN_WRITES=(
  "supabase/migrations"
  "system/"
  ".claude/rules"
  "packages/wo-core/src/types.ts"
)

for forbidden in "${FORBIDDEN_WRITES[@]}"; do
  if [[ "$FILE" == *"$forbidden"* ]] && [[ "$TOOL" == "write"* ]]; then
    echo "SCOPE_GUARD: Schreibzugriff auf $FILE verweigert"
    echo "Erstelle einen WO für diese Änderung"
    exit 1
  fi
done
```

**Post-Tool Hook** `.claude/hooks/post-tool.sh`:
```bash
#!/bin/bash
# Läuft nach jedem Tool-Call
# Loggt Änderungen für Memory-Update

TOOL=$1
FILE=$2
STATUS=$3

if [[ "$TOOL" == "write_file" ]] && [[ "$STATUS" == "success" ]]; then
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) WRITE $FILE" >> .claude/hooks/session.log
fi
```

Erstelle `.claude/settings.json`:
```json
{
  "hooks": {
    "preToolUse": ".claude/hooks/pre-tool.sh",
    "postToolUse": ".claude/hooks/post-tool.sh"
  }
}
```

**Acceptance:**
- Hooks existieren und sind executable
- settings.json konfiguriert
- Session log wird geschrieben

---

### WO-6.5: AGENT.md Files erstellen

Jeder Agent bekommt seine eigene Konfigurationsdatei.

**Aufgabe:**
Erstelle `.claude/agents/` AGENT.md für folgende Agenten:

1. `governance-compiler.md` — Qwen3.6-35B, Spark A, Governance Tasks
2. `micro-executor.md` — Qwen3-Coder-30B, Spark B, Temp 0.0
3. `review-agent.md` — Read-only, Acceptance Checks
4. `context-builder.md` — Discovery, File Location
5. `security-specialist.md` — Read-only, Security Review

Jede AGENT.md enthält:
```markdown
# Agent: {name}

## Modell
endpoint: http://spark-x:8001
model: {model-name}
temperature: {temp}
seed: {seed wenn deterministisch}

## Aufgabe
{eine klare Aufgabenbeschreibung}

## Erlaubte Tools
- Read: [Pfade]
- Write: [Pfade]  
- Bash: [Erlaubte Commands]

## Verboten
- [Explicit verbotene Aktionen]

## Erlaubte MCP Tools
- context7: ja/nein
- serena: ja/nein
- supabase: ja/nein
```

**Acceptance:**
- 5 AGENT.md Files existieren
- Alle Tools klar definiert

---

### WO-6.6: Obsidian Vault Setup

Obsidian wird als Human-facing Memory Interface genutzt.

**Aufgabe:**
Erstelle `tools/obsidian/` Vault-Struktur:

```
tools/obsidian/
  .obsidian/
    app.json
  00-Index/
    README.md
  01-Architecture/
    (symlink oder copy von docs/architecture/)
  02-Decisions/
    (symlink oder copy von docs/decisions/)
  03-WO-Batches/
    (symlink oder copy von system/workorders/batches/)
  04-Memory/
    (symlink oder copy von system/memory/canonical/)
  05-Benchmarks/
    (symlink oder copy von docs/reports/)
```

Erstelle `tools/obsidian/.obsidian/app.json`:
```json
{
  "alwaysUpdateLinks": true,
  "newFileLocation": "current",
  "newLinkFormat": "relative"
}
```

**Acceptance:**
- Obsidian Vault Struktur existiert
- Alle wichtigen Docs erreichbar

---

### WO-6.7: GSD v2 in CLAUDE.md verankern

GSD v2 ist bereits als SKILL.md da — jetzt in den Haupt-Workflow verankern.

**Aufgabe:**
Update `CLAUDE.md`:

1. Füge unter "Skills" hinzu:
   - GSD v2 wird AUTOMATISCH bei jedem Code-Task angewendet
   - Keine explizite Aktivierung nötig
   - ANALYZE → PLAN → IMPLEMENT → VERIFY immer einhalten

2. Füge "Tool Usage" Sektion hinzu:
   - Context7: `use context7` für Library-Fragen
   - Serena: Für Symbol-Suche und Code-Navigation
   - Memory: Session Start/End Protokoll einhalten

3. Füge "Hook Awareness" hinzu:
   - Pre-Tool Hook schützt kritische Files
   - Post-Tool Hook loggt alle Änderungen
   - Bei SCOPE_GUARD Error: WO erstellen statt umgehen

**Acceptance:**
- CLAUDE.md aktualisiert
- GSD v2 als Standard dokumentiert
- Tool Usage Sektion vorhanden

---

## REIHENFOLGE

```
WO-6.1: Context7 MCP         ← zuerst (sofort nützlich)
WO-6.2: Serena LSP           ← zweites (Code Navigation)
WO-6.3: Memory Protocol      ← drittes (Session Kontinuität)
WO-6.4: Hooks                ← viertes (Governance)
WO-6.5: AGENT.md Files       ← fünftes (Agent Boundaries)
WO-6.6: Obsidian Vault       ← sechstes (Human Interface)
WO-6.7: CLAUDE.md Update     ← letztes (alles zusammenführen)
```

## WICHTIG

- Hooks müssen auf Windows (PowerShell) funktionieren — keine bash-only Syntax
- Context7 und Serena sind MCP Tools — prüfe ob npx/uvx verfügbar ist
- Memory Protocol ist dokumentarisch — kein Code, nur Markdown
- AGENT.md Files sind für Claude Code lesbar — klare, kurze Beschreibungen

Starte mit WO-6.1 und frage wenn unklar.
