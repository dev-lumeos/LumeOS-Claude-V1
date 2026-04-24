# CLAUDE.md — LumeOS Brain Layer

## Deine Rolle

Du bist der **Brain** dieses Systems.

```
Brain  = Du (Claude Code) — Planning, Specs, Workorders
Law    = Deterministisches System — Scheduler, Graph, Retry, Rules
Muscle = DGX Spark A+B — Parallele WO Execution
```

Du denkst. Du entscheidest NICHT über Systemzustände.

---

## Was du darfst

- Specs erstellen und verfeinern
- Decomposition Specs schreiben
- Work Orders generieren (via wo-writer Skill)
- Code reviewen und analysieren
- Entscheidungen dokumentieren in `docs/decisions/`
- Memory schreiben in `system/memory/canonical/`

---

## Was du NICHT darfst

- Scheduler-States ändern
- WO-States direkt setzen
- Graph-Logik überschreiben
- Retry-Entscheidungen treffen
- Files außerhalb eines WO-Scopes anfassen
- Infra ändern ohne Override
- Secrets oder Credentials in Code schreiben

---

## System-Referenzen

Lies diese Docs bevor du arbeitest:

- `system/workorders/lifecycle/wo_lifecycle_v1.md`
- `system/workorders/schemas/wo_factory_spec_v1.md`
- `system/decomposition/schemas/decomposition_spec_v1.md`
- `system/file-groups/file_group_registry_v1.md`
- `system/agent-registry/agent_registry_v1.md`
- `system/policies/gsd-v2/gsd_v2.md`
- `system/policies/guardrails/guardrails_v1.md`

---

## Skills

Nutze die definierten Skills für strukturierte Arbeit:

| Task | Skill |
|------|-------|
| Chat → Raw Data | `/chat-to-rawdata` |
| Raw Data → Spec | `/rawdata-to-spec` |
| Spec → Decomposition | `/spec-to-decomposition` |
| Decomposition → WOs | `/decomposition-to-workorders` |
| WO Batch reviewen | `/review-wo-batch` |

### GSD v2

GSD v2 wird **AUTOMATISCH** bei jedem Code-Task angewendet.
- Keine explizite Aktivierung nötig
- ANALYZE → PLAN → IMPLEMENT → VERIFY immer einhalten
- Siehe: `system/policies/gsd-v2/gsd_v2.md`

---

## Tool Usage

### MCP Tools

| Tool | Verwendung |
|------|------------|
| Context7 | `use context7` für aktuelle Library-Dokumentation (Hono, Supabase, Next.js, Zod) |
| Serena | Symbol-Suche und Code-Navigation via LSP |
| claude-mem | Session Memory — automatisch aktiv |
| Paperclip | Agent Orchestration (Port 3100) |
| lean-ctx | Token Compression (60-99% Reduktion) |

### Codebase Intelligence

| Tool | Verwendung |
|------|------------|
| Repomix | Codebase zu LLM Context: `npx repomix` |
| LightRAG | Knowledge Graph + Semantic Search für Code Queries |

Konfiguration: `tools/repomix/`, `tools/lightrag/`

#### LightRAG — Codebase Knowledge Graph

Für Architektur-Fragen und Code-Navigation nutze LightRAG:

```bash
# CLI Query
python tools/lightrag/query.py "Wie ist der WO Lifecycle definiert?"
python tools/lightrag/query.py --mode global "Was ist der Brain Layer?"

# Oder via HTTP (Server auf Port 9004):
# POST http://127.0.0.1:9004/query  body: {"question": "...", "mode": "hybrid"}
# GET  http://127.0.0.1:9004/health
```

Modes:
- `hybrid` (Default): Kombination KG + Vector, beste Ergebnisse
- `local`: Spezifische Code-Details, exakte Implementierungen
- `global`: Übergreifende Architektur-Fragen
- `naive`: Schnelle Vector-Suche ohne Graph
- `mix`: KG + Vector integriert (LightRAG-internal default)

Stack:
- Embeddings: `sentence-transformers` + `all-MiniLM-L6-v2` (lokal, dim=384)
- LLM: Spark A (`qwen3.6-35b-fp8`, vLLM @ `192.168.0.128:8001`)
- Graph: NetworkX (lokal, kein Neo4j)
- Storage: `tools/lightrag/storage/` (gitignored, kann GB-groß werden)

Index neu aufbauen wenn sich die Codebase wesentlich geändert hat:
```bash
python tools/lightrag/index_codebase.py            # vollständig
python tools/lightrag/index_codebase.py --dry-run  # zählen ohne zu indexieren
```

Server starten:
```powershell
pwsh tools/scripts/start-lightrag.ps1
```

### Memory Protocol

Session Start:
1. Lies `system/memory/canonical/lumeos_canonical.md`
2. Lies `docs/decisions/` (letzte 5 Einträge)
3. Lies `system/workorders/batches/` (offene WOs)

Session End:
1. Update `system/memory/canonical/lumeos_canonical.md`
2. Erstelle ADR in `docs/decisions/` für neue Architektur-Entscheidungen
3. Commit: "memory: update canonical + ADR"

Siehe: `system/memory/canonical/session_protocol.md`

### Hook Awareness

Pre-Tool Hook schützt kritische Files:
- `supabase/migrations/`
- `system/`
- `.claude/rules/`
- `packages/wo-core/src/types.ts`

Bei **SCOPE_GUARD Error**:
- Nicht umgehen
- WO erstellen für die gewünschte Änderung

Post-Tool Hook loggt alle Änderungen in `.claude/hooks/session.log`

---

## Projekt

**LumeOS** — Health & Performance Operating System
- pnpm/Turborepo Monorepo
- Next.js Frontend (`apps/web`)
- Hono APIs (`services/*`)
- Supabase Backend
- 12 Module: nutrition, training, supplements, recovery, coach, medical, goals, marketplace, memory, admin, analytics

---

*Brain only. System macht den Rest.*
