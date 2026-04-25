# Model Tiers V2 — LumeOS

# Status: AKTUELL — 25. April 2026

# Vorherige Version: model_tiers_v1.md (veraltet)

---

## Aktuelle Tier-Zuweisung

TierModellNodeFormatRolle`governance`Qwen3.6-35B-A3BSpark AFP8Governance Compiler`micro_executor`Qwen3-Coder-30B-A3BSpark BFP8Deterministischer Code`orchestrator`Qwen3.5-122B-A10BSpark CNVFP4**COMING**`specialist`Qwen3-Coder-NextSpark DTBD**COMING**

---

## Deterministik-Parameter (Spark B)

```
temperature: 0.0
seed:        42
top_p:       1.0
top_k:       1
```

Diese Parameter sind UNVERÄNDERLICH für Micro-Executor. triple_hash verifiziert identischen Output bei 3 aufeinanderfolgenden Calls.

---

## Remote Escalation (nur wenn lokal nicht lösbar)

TierModellWann`escalation_1`Claude Code Opus 4.6Primäre Eskalation`macro_executor`Kimi K2.6 via OpenRouterKomplexe Macro-WOs

---

## Spark C+D Modelle (wenn Hardware da)

Spark C laden:

```bash
vllm serve Qwen/Qwen3.5-122B-A10B-Instruct-NVFP4 \
  --served-model-name qwen3.5-122b \
  --max-model-len 65536 \
  --gpu-memory-utilization 0.85
```

Spark D laden:

```bash
# Qwen3-Coder-Next sobald verfügbar
vllm serve Qwen/Qwen3-Coder-Next \
  --served-model-name qwen3-coder-next \
  --max-model-len 65536 \
  --gpu-memory-utilization 0.80
```

Danach in `services/wo-classifier/src/rules/index.ts`:

```typescript
const SPARK_C_AVAILABLE = true   // war: false
const SPARK_D_AVAILABLE = true   // war: false
```
