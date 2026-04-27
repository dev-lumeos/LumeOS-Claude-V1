# Permission Gateway — Roadmap V0.3
# authorize-tool-call.ts — aktueller Stand: V0.2.1
# Stand: 26. April 2026

---

## Aktueller Stand V0.2.1

✅ Agent Registry Check
✅ ENV global blockiert
✅ Path Traversal blockiert (micromatch + normalizeRepoPath)
✅ Windows Absolute Paths blockiert
✅ Bash Exact Match
✅ max_write_files Enforcement
✅ Migration Guard (nur db-migration-agent)
✅ Dependency Guard (package.json)
✅ MiniMax Mode Guard (BLOCKED_IN_MODE2 / REQUIRES_MODE2)
✅ write_allowed / supabase_allowed aus Tool-Profilen hart enforced
✅ Dynamic Registry Load (CWD-relativ, funktioniert in Tests + Production)

---

## Offene Punkte für V0.3

### 1. MCP Operation-Level
mcpTool wird geprüft, aber nicht die Operation darauf.

Ziel: mcpOperation: 'read' | 'write' | 'delete' | 'query'

Regeln:
  filesystem:read   → erlaubt wenn Agent lesen darf
  filesystem:write  → nur wenn write_allowed
  filesystem:delete → grundsätzlich blockiert
  supabase:query    → nur db-migration-agent + security-specialist (read-only)

### 2. network_allowed Enforcement
Im Tool-Profil vorhanden, aber noch nicht geprüft.

Neuer Tool-Typ nötig: 'network'
Analog zu bash_allowed.

### 3. SQL Guard: AST statt Regex
V0.2.1 nutzt Regex — reicht für erste Runs.
Langfristig: node-sql-parser, AST-basierte Klassifikation.

### 4. senior-coding-agent Mode-Check verfeinern
Phase 1: Senior kann über OpenRouter MiniMax laufen — kein Mode 2 nötig.
Phase 2: Mode 2 required wenn node === spark3+spark4.

---

## Hard Rule (immer gültig)

  No direct filesystem.
  No direct bash.
  No direct MCP.
  No bypass around authorizeToolCall().
