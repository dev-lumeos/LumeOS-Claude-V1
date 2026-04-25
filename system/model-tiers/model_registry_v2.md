# Model Registry V2 — LumeOS
# Status: AKTIV — Phase 1 (2 Sparks)
# Erstellt: April 2026

---

## Deployment Phasen

```
Phase 1 (JETZT):   Spark 1 + Spark 2 — 2 Nodes aktiv
Phase 2 (PENDING): Spark 3 + Spark 4 — nach Lieferung + Konfiguration
```

Agenten-Definitionen sind phasen-agnostisch.
Nur Node-Zuweisung und Tier-Mapping ändert sich bei Phase 2.

---

## Phase 1 — Aktive Nodes (2 Sparks)

### Spark 1 — Governance + Review
```yaml
node_id: spark-1
phase: 1+2
ip: 192.168.0.128
role: governance_review
models:
  - id: qwen3.6-35b-fp8
    model: Qwen/Qwen3.6-35B-A3B-FP8
    port: 8001
    tier: review
    temp_governance: 0.7
    temp_execution: 0.0
    seed: 42
    thinking: ON
    max_model_len: 131072
    gpu_memory_utilization: 0.80
```

### Spark 2 — Coding Worker
```yaml
node_id: spark-2
phase: 1+2
ip: 192.168.0.188
role: coding_worker
models:
  - id: qwen3-coder-next-fp8
    model: Qwen/Qwen3-Coder-Next-FP8
    port: 8001
    tier: coding
    temp: 0.0
    seed: 42
    thinking: OFF
    max_model_len: 131072
    gpu_memory_utilization: 0.65
```

---

## Phase 2 — Neue Nodes (wenn verfügbar)

### Spark 1 — Orchestrator Node (UPGRADE)
```yaml
node_id: spark-1
phase: 2
ip: 192.168.0.128
role: orchestrator
models:
  - id: nemotron-super-nvfp4
    model: nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4
    port: 8001
    tier: orchestrator
    max_model_len: 1000000
    gpu_memory_utilization: 0.38
  - id: qwen3.6-35b-fp8
    model: Qwen/Qwen3.6-35B-A3B-FP8
    port: 8002
    tier: review
    max_model_len: 131072
    gpu_memory_utilization: 0.30
```

### Spark 2 — Coding Worker (UNVERÄNDERT)
```yaml
node_id: spark-2
phase: 2
ip: 192.168.0.188
role: coding_worker
models:
  - id: qwen3-coder-next-fp8
    model: Qwen/Qwen3-Coder-Next-FP8
    port: 8001
    tier: coding
    max_model_len: 256000
    gpu_memory_utilization: 0.65
```

### Spark 3 — Intelligence Node A (NEU)
```yaml
node_id: spark-3
phase: 2
ip: TBD
role: intelligence_a
models:
  - id: minimax-m27-nvfp4-shard-a
    model: lukealonso/MiniMax-M2.7-NVFP4
    port: 8001
    tier: intelligence
    tensor_parallel_partner: spark-4
    tp_size: 2
    max_model_len: 196608
    gpu_memory_utilization: 0.52
  - id: deepseek-r1-70b-nvfp4
    model: DeepSeek/DeepSeek-R1-Distill-70B-NVFP4
    port: 8002
    tier: reasoning
    max_model_len: 65536
    gpu_memory_utilization: 0.28
```

### Spark 4 — Intelligence Node B (NEU)
```yaml
node_id: spark-4
phase: 2
ip: TBD
role: intelligence_b
models:
  - id: minimax-m27-nvfp4-shard-b
    model: lukealonso/MiniMax-M2.7-NVFP4
    port: 8001
    tier: intelligence
    tensor_parallel_partner: spark-3
    tp_size: 2
    max_model_len: 196608
    gpu_memory_utilization: 0.52
  - id: glm-4-7-flash
    model: zai-org/GLM-4.7-Flash
    port: 8002
    tier: test_review
    max_model_len: 128000
    gpu_memory_utilization: 0.15
  - id: qwen3-5-9b
    model: Qwen/Qwen3.5-9B-NVFP4
    port: 8003
    tier: sidekick
    max_model_len: 32768
    gpu_memory_utilization: 0.05
```

### RTX 5090 — Vision Node (Threadripper)
```yaml
node_id: rtx-5090
phase: 1+2
ip: localhost
role: vision
models:
  - id: qwen3-vl-30b-fp8
    model: Qwen/Qwen3-VL-30B-A3B-Instruct-FP8
    port: 8010
    tier: vision
    max_model_len: 32768
    gpu_memory_utilization: 0.92
```

---

## Remote Fallback (OpenRouter)

Aktiv in Phase 1 für Rollen die noch keinen lokalen Node haben.
Werden in Phase 2 durch lokale Nodes ersetzt.

| Tier | Modell | Phase 1 Rolle | OpenRouter ID |
|------|--------|---------------|---------------|
| `orchestrator_remote` | Nemotron 3 Super | Orchestration Fallback | `nvidia/nemotron-3-super-120b-a12b:free` |
| `intelligence_remote` | MiniMax M2.7 | High Intelligence | `minimax/minimax-m2.7` |
| `reasoning_remote` | DeepSeek-R1 70B | Security/Reasoning | `deepseek/deepseek-r1` |
| `test_remote` | GLM-4.7-Flash | Test Generation | `zai-org/glm-4.7-flash` |
| `escalation_1` | Claude Opus 4.6 | Last Resort | `anthropic/claude-opus-4-6` |

---

*Model Registry V2 — Phase 1 aktiv, Phase 2 ready*
