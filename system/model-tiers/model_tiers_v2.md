# Model Tiers V2 — LumeOS
# Status: AKTIV
# Erstellt: April 2026

---

## Tier Übersicht

| Tier ID | Phase 1 Modell | Phase 2 Modell | Rolle |
|---------|----------------|----------------|-------|
| `orchestrator` | *(remote fallback)* | Nemotron NVFP4 | Runtime Dispatch + Monitoring |
| `review` | Qwen3.6-35B FP8 | Qwen3.6-35B FP8 | Pre/Post Review, Governance |
| `coding` | Qwen3-Coder-Next FP8 | Qwen3-Coder-Next FP8 | Coding Worker |
| `intelligence` | *(remote fallback)* | MiniMax M2.7 NVFP4 | High Intelligence Mode |
| `reasoning` | *(remote fallback)* | DeepSeek-R1 70B NVFP4 | Security + Deep Reasoning |
| `test_review` | Qwen3.6-35B FP8 | GLM-4.7-Flash | Test Gen + Tool Calling |
| `sidekick` | Qwen3-Coder-Next FP8 | Qwen3.5 9B | Fast Validation + i18n |
| `vision` | Qwen3-VL 30B FP8 | Qwen3-VL 30B FP8 | MealCam Vision |
| `escalation` | Claude Opus 4.6 | Claude Opus 4.6 | Last Resort |

---

## Phase 1 Node-Tier Mapping

```
Spark 1 (192.168.0.128:8001) — qwen3.6-35b-fp8
  → review        (Pre/Post Review, Governance, Security, Context-Builder)
  → test_review   (Test Generation, Tool Calling — Qwen3.6 übernimmt)
  → orchestrator  (Runtime Dispatch in Phase 1 — Qwen3.6 übernimmt)

Spark 2 (192.168.0.188:8001) — qwen3-coder-next-fp8
  → coding        (Coding Worker, 20-30 parallele Jobs)
  → sidekick      (Fast Tasks, i18n, Validation — Coder übernimmt)

RTX 5090 (localhost:8010) — qwen3-vl-30b-fp8
  → vision        (MealCam, Food Recognition)

Remote (OpenRouter)
  → intelligence_remote  → minimax/minimax-m2.7
  → reasoning_remote     → deepseek/deepseek-r1
  → escalation           → anthropic/claude-opus-4-6
```

---

## Phase 2 Node-Tier Mapping

```
Spark 1 (192.168.0.128)
  :8001 nemotron-super-nvfp4     → orchestrator
  :8002 qwen3.6-35b-fp8         → review

Spark 2 (192.168.0.188)
  :8001 qwen3-coder-next-fp8    → coding

Spark 3 (TBD)
  :8001 minimax-m27-nvfp4 [TP] → intelligence (Mode 2)
  :8002 deepseek-r1-70b-nvfp4  → reasoning

Spark 4 (TBD)
  :8001 minimax-m27-nvfp4 [TP] → intelligence (Mode 2)
  :8002 glm-4-7-flash          → test_review
  :8003 qwen3-5-9b             → sidekick

RTX 5090 (localhost:8010)
  → vision (unverändert)

Remote (OpenRouter)
  → escalation   → anthropic/claude-opus-4-6 (Last Resort bleibt)
```

---

## Mode Switching (Phase 2)

### Mode 1 — High Throughput (Standard)
```
Spark 3: DeepSeek-R1 70B aktiv
Spark 4: GLM-4.7-Flash + Qwen3.5 9B aktiv
MiniMax: geladen, idle
```

### Mode 2 — High Intelligence
```
Spark 3+4: MiniMax M2.7 TP=2 aktiv
DeepSeek / GLM / Qwen9B: geladen, keine neuen Jobs
Aktivierung: Nemotron-Orchestrator via Routing-Rule
```

**Switching-Regel:**
```
IF task.requires_intelligence OR task.quality_tier == "premium":
    → activate Mode 2
    → block new Mode 1 jobs during session
ELSE:
    → Mode 1 (default)
```

---

## Tier Parameter

### `orchestrator`
```yaml
temperature: 0.6
thinking: ON
max_tokens: 8192
tool_calling: true
context_window: 1000000  # Phase 2 / 131072 Phase 1
```

### `review`
```yaml
temperature: 0.0
seed: 42
thinking: ON
max_tokens: 4096
tool_calling: false
mode: read_only
```

### `coding`
```yaml
temperature: 0.0
seed: 42
thinking: OFF
max_tokens: 16384
tool_calling: true
tool_call_parser: qwen3_coder
```

### `intelligence`
```yaml
temperature: 1.0
top_p: 0.95
top_k: 40
thinking: ON
max_tokens: 8192
tool_calling: true
tool_call_parser: minimax_m2
```

### `reasoning`
```yaml
temperature: 0.6
thinking: ON
max_tokens: 8192
tool_calling: false
mode: read_only
```

### `test_review`
```yaml
temperature: 0.0
seed: 42
thinking: ON
max_tokens: 4096
tool_calling: true
```

### `sidekick`
```yaml
temperature: 0.0
seed: 42
thinking: OFF
max_tokens: 2048
tool_calling: false
```

### `vision`
```yaml
temperature: 0.2
max_tokens: 1024
output_format: json
```

---

*Model Tiers V2 — Phase 1 aktiv*
