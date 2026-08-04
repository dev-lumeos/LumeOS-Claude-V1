# Agent Registry V2 — LumeOS
# Status: AKTUELL — 25. April 2026
# Vorherige Version: agent_registry_v1.md (veraltet, falsche Spark-Zuweisungen)

---

## Aktive Agenten (Live)

| Agent | Spark | Modell | Rolle | Temp |
|-------|-------|--------|-------|------|
| governance-compiler | Spark A | Qwen3.6-35B-FP8 | Macro-WO → ArtefaktV3 | 0.3 |
| micro-executor | Spark B | Qwen3-Coder-30B-FP8 | Code Execution | 0.0 |
| review-agent | Spark B | Qwen3-Coder-30B-FP8 | Read-only Review | 0.0 |
| context-builder | Spark B | Qwen3-Coder-30B-FP8 | File Discovery | 0.0 |
| security-specialist | Spark B | Qwen3-Coder-30B-FP8 | Security Review | 0.0 |

Agent Configs: `.claude/agents/*.md`

---

## Geplante Agenten (Spark C+D)

| Agent | Spark | Modell | Rolle |
|-------|-------|--------|-------|
| orchestrator | Spark C | Qwen3.5-122B NVFP4 | WO Loop, Routing, Monitoring |
| bulk-executor | Spark C | Qwen3.5-122B NVFP4 | Low/Medium WOs parallel |
| db-checker | Spark D | Qwen3-Coder-Next | Schema Validation, RLS |
| acceptance-verifier | Spark D | Qwen3-Coder-Next | Acceptance Criteria Check |

---

## Node Profile (aktuell in packages/agent-core/src/registry.ts)

```typescript
NODE_PROFILES = {
  'spark-a': {
    endpoint: 'http://192.168.0.128:8001',
    model: 'qwen3.6-35b',
    max_slots: 4
  },
  'spark-b': {
    endpoint: 'http://192.168.0.188:8001',
    model: 'qwen3-coder-30b',
    max_slots: 10
  }
  // spark-c und spark-d: kommen mit Hardware
}
```

---

## WO Classifier Routing (aktuell)

```
type=governance/planning        → spark_a (Spark A)
type=implementation, high risk  → spark_b (Spark B)
type=migration                  → spark_b + needs_db_check
type=implementation, low risk   → spark_b (Fallback für spark_c)
type=test/review domain         → spark_b (Fallback für spark_d)
```

Flag in `services/wo-classifier/src/rules/index.ts`:
```typescript
const SPARK_C_AVAILABLE = false  // → true wenn Spark C bereit
const SPARK_D_AVAILABLE = false  // → true wenn Spark D bereit
```

---

## Remote Escalation

| Tier | Modell | Wann nutzen |
|------|--------|-------------|
| escalation_1 | Claude Code Opus 4.6 | Primäre Eskalation nach lokalem Fail |
| macro_executor | Kimi K2.6 (OpenRouter) | Komplexe Macro-WOs (noch nicht implementiert) |
