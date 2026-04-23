# vLLM Profiles — LumeOS
# Stand: 23. April 2026 — nach Governance Architecture V1

## Node Übersicht

| Node | IP | Rolle | Max Slots |
|------|-----|-------|-----------|
| Spark A | 192.168.0.128 | Governance-Compiler (DGX A) | 8 |
| Spark B | 192.168.0.188 | Micro-Executor (DGX B) | TBD nach Benchmark |

---

## Spark A — Governance-Compiler

| Tier | Modell | Port | Funktion |
|------|--------|------|---------|
| `governance` | Qwen3.5-35B-A3B (TBD: 35B oder 122B) | 8001 | Macro-WO → Governance-Artefakt |

---

## Spark B — Micro-Executor

| Tier | Modell | Port | Funktion |
|------|--------|------|---------|
| `executor` | Qwen3-Coder-30B-A3B | 8001 | Deterministisch Temp=0.0 Seed=42 |

---

## Agent → Endpoint Mapping

```yaml
agent_endpoints:
  # Governance-Compiler (DGX A)
  governance-compiler: http://192.168.0.128:8001

  # Micro-Executor (DGX B)
  micro-executor:      http://192.168.0.188:8001

  # Fallback / Escalation (OpenRouter)
  macro-layer:
    primary:    claude-opus-4-6
    secondary:  qwen/qwen3.6-plus-preview
    tertiary:   moonshot/kimi-k2.6
```

---

## Execution Token Flow

```
Threadripper (Control Plane)
  → SAT-Check
  → Ed25519-signed Token
  → DGX B (192.168.0.188:8001)
```

---

## Offen bis Benchmark

- DGX A: Qwen3.5-35B oder 122B? → Test nach Benchmark
- DGX B Batch-Size: 1/2/4 parallel? → Load-Test
- KV-Cache Budget → Durchsatz-Messung

*Routing Profile V2 — aktualisiert nach Governance Architecture V1*
