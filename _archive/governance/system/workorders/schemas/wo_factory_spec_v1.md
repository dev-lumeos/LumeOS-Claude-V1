# WO Factory Spec V1

---

## Zweck

Einzige Komponente die aus einer Decomposition Spec atomare Work Orders erzeugt.
Deterministisch, regelbasiert, nicht kreativ.

**Input:** decomposition_spec_v1 only — kein Roh-Spec, kein Freitext.

---

## Micro vs Macro WO Entscheidung

| Kriterium | Micro WO | Macro WO |
|-----------|----------|---------|
| Scope Files | 1-3 | 4+ oder unbekannt |
| Layer | ein Layer | mehrere Layer |
| Dependencies | klar/einfach | komplex/verschachtelt |
| Acceptance | auto-prüfbar | Review-abhängig |

**Micro WO** → DGX Agents (Spark A/B)
**Macro WO** → Kimi K2.6 (intern zerlegt, Acceptance Check danach Pflicht)

---

## Processing Pipeline

```
Input Validation (Stage 1)
      ↓
LLM Stage — Claude Code (Stage 2)
      ↓
Rule Engine (Stage 3)
      ↓
Graph Builder (Stage 4)
      ↓
Output Validation (Stage 5)
      ↓
WO Batch
```

---

## Stage 1: Input Validation

Pflichtprüfungen vor jedem LLM-Aufruf:

| Check | Fehler |
|-------|--------|
| version == v1 | Error |
| known_file_groups nur Registry-Werte | Error |
| infra ohne Override | Error |
| Subtask-IDs eindeutig | Error |
| depends_on/conflicts_with bekannte IDs | Error |
| Keine Zyklen | Error |
| Gleiche known_files ohne conflicts_with | Error |
| acceptance_hint mind. eine Liste | Error |

Bei Fehler: Abbruch, kein LLM-Aufruf.

---

## Stage 2: LLM Stage

**Primary:** Claude Code (wo-writer Skill)
**Fallback:** Qwen3.5-122B lokal

Aufgabe pro Subtask:
- `task` (präzise Anweisungen)
- `scope_files` (aus known_files, max 3)
- `agent_type` (erstes Mapping)
- `acceptance` (aus acceptance_hint)

**LLM Constraints:**
- Keine neuen Architekturentscheidungen
- Keine WOs außerhalb known_files
- Kein Layer-Mix
- Keine vagen task-Formulierungen
- scope_files max 3 — sonst split

---

## Stage 3: Rule Engine

### Scope Rules
- scope_files > 3 → split erzwingen
- Dateien außerhalb Subtask known_files → entfernen

### Agent Mapping
| Layer | Agent |
|-------|-------|
| types | ts-patch-agent |
| service | api-mapping-agent |
| ui | ui-restore-agent |
| tests | test-agent |
| docs | docs-agent |
| config | config-patch-agent |
| db | db-migration-agent |

### Phase Mapping
- types → Phase 1
- service / config / db → Phase 2
- ui / tests / docs → Phase 3

### Single-Concern Rule
Eine WO = ein primärer Änderungstyp = ein Agententyp

---

## Stage 4: Graph Builder

**blocked_by:**
```
subtask_B.depends_on enthält subtask_A.id
→ alle WOs aus B blocked_by alle WOs aus A
```

**conflicts_with (zwei Quellen):**
1. Explizit: subtask.conflicts_with
2. Dateiüberschneidung: scope_files Schnittmenge

---

## Stage 5: Output Validation

| Check | Fehler |
|-------|--------|
| Alle wo_id eindeutig | Error |
| blocked_by referenzieren existierende WOs | Error |
| Keine Zyklen in blocked_by | Error |
| Jede WO hat agent_type aus Registry | Error |
| scope_files max 3 | Error |
| acceptance mind. eine Liste | Error |

Batch mit `status: invalid` → nicht in Queue.

---

## WO Schema

```yaml
wo_id: WO-{feature_id}-{seq}
wo_type: micro | macro
agent_type: string
scope_files: [max 3]
task: [1-5 Anweisungen]
acceptance:
  auto_checks: [string]
  review_checks: [string]
  human_checks: [string]
dependencies:
  phase: 1|2|3
  blocked_by: [wo_id]
  conflicts_with: [wo_id]
retry_policy:
  max_attempts: 3
  attempt_2: {mode: same_agent_optimized}
  attempt_3: {mode: escalated_tier, primary: claude_code_opus}
  human_review_after: attempts_exhausted
source_subtask_id: string
```

---

## Retry Policy

```
Attempt 1: default_assignment
Attempt 2: same_agent + extended_context / alternate_node
Attempt 3: quality_coder lokal → Claude Code Opus
→ OpenRouter Backup
→ Human Review
```

---

## Discovery WO Pattern

Wenn known_files leer und keine passende Group:

```yaml
wo_id: WO-{feature_id}-{seq}-discovery
agent_type: context-builder-agent
task:
  - locate files matching intent
  - produce file list and reference map
acceptance:
  auto_checks:
    - output contains file list
    - output contains reference map
dependencies:
  phase: 1
```

---

*WO Factory Spec V1 — festgezogen*
