# Model Registry V2 — LumeOS
# Status: Phase 2 LIVE — 29. April 2026

---

## Live Stack

### Spark A — Orchestrator

| Parameter | Wert |
|---|---|
| IP | 192.168.0.128 |
| Port | 8001 |
| Hostname | edgexpert-1116 |
| Container | `vllm-qwen` |
| Image | `vllm/vllm-openai:cu130-nightly` |
| Modell | `Qwen/Qwen3.6-35B-A3B-FP8` |
| served-model-name | `qwen3.6-35b-fp8` |
| gpu_memory_utilization | 0.70 |
| max_model_len | 65536 |
| kv-cache-dtype | fp8 |
| max-num-seqs | 4 |
| Rolle | Orchestrator + WO-Validator |
| Status | ✅ LIVE |

**Pflicht:** `chat_template_kwargs: { enable_thinking: false }` + `temperature: 0.0` bei JEDEM Request.
Adapter: `callQwen36Orchestrator()` in `services/scheduler-api/src/vllm-adapter.ts`.

---

### Spark B — Coding Worker

| Parameter | Wert |
|---|---|
| IP | 192.168.0.188 |
| Port | 8001 |
| Hostname | edgexpert-5862 |
| Container | `spark-b-coder` |
| Image | `nvcr.io/nvidia/vllm:26.03-py3` |
| Modell | `Qwen/Qwen3-Coder-Next-FP8` |
| served-model-name | `qwen3-coder-next-fp8` |
| gpu_memory_utilization | 0.88 |
| max_model_len | 131072 |
| tool-call-parser | `qwen3_coder` |
| Rolle | micro-executor + test-agent |
| Status | ✅ LIVE |

Adapter: `callCoderNext()` in `services/scheduler-api/src/vllm-adapter.ts`.

---

### Spark C — Fast Reviewer (Pipeline Tier 1)

| Parameter | Wert |
|---|---|
| IP | 192.168.0.99 |
| Port | 8001 |
| Hostname | edgexpert-509d |
| Container | `vllm_node` (launch-cluster.sh) |
| Image | `vllm-node` (lokal, eugr/spark-vllm-docker) |
| Modell | `google/gemma-4-26B-A4B-it` |
| gpu_memory_utilization | 0.70 |
| max_model_len | 65536 |
| load-format | `instanttensor` |
| quantization | `fp8` |
| tool-call-parser | `gemma4` |
| reasoning-parser | `gemma4` (Output via extractContentOnly() verworfen) |
| Throughput | ~35 tok/s single / ~180 tok/s @ 8-par |
| Rolle | Review-Pipeline Tier 1 |
| Status | ✅ LIVE |

Adapter: `callGemmaReviewer()` in `services/scheduler-api/src/vllm-adapter.ts`.

---

### Spark D — Senior Reviewer (Pipeline Tier 2)

| Parameter | Wert |
|---|---|
| IP | 192.168.0.101 |
| Port | 8001 |
| Hostname | edgexpert-0dc8 |
| Container | `vllm_node` (launch-cluster.sh, MXFP4-Build) |
| Image | `vllm-node` (lokal, eugr/spark-vllm-docker MXFP4) |
| Modell | `openai/gpt-oss-120b` |
| quantization | `mxfp4` |
| mxfp4-backend | `CUTLASS` |
| mxfp4-layers | `moe,qkv,o,lm_head` |
| gpu_memory_utilization | 0.70 |
| attention-backend | `FLASHINFER` |
| tool-call-parser | `openai` |
| reasoning-parser | `openai_gptoss` (Output via extractContentOnly() verworfen) |
| Throughput | ~59 tok/s single / ~150 tok/s @ 4-par |
| Rolle | Review-Pipeline Tier 2 (High-Risk mandatory) |
| Status | ✅ LIVE |

Adapter: `callGPTOSSReviewer()` in `services/scheduler-api/src/vllm-adapter.ts`.

---

### Escalation — Claude Sonnet/Opus

| Parameter | Wert |
|---|---|
| Zugang | Claude Code Max 200 |
| Agent | `senior-coding-agent` |
| Wann | ESCALATE aus Spark D / HUMAN_NEEDED nicht lösbar |
| Status | ✅ AKTIV |

---

## Reasoning-Filter (global)

`extractContentOnly()` in `services/scheduler-api/src/vllm-adapter.ts` filtert bei allen Modellen:
- `choices[].message.reasoning` → droppen
- `choices[].message.reasoning_content` → droppen
- Nur `choices[].message.content` verwenden

---

## Performance (live verifiziert 29. April 2026)

| Node | Modell | Single tok/s | Par tok/s | GPU-Util |
|---|---|---|---|---|
| Spark A | Qwen3.6-35B FP8 | ~50 | ~116 @ 4-par | 0.70 |
| Spark B | Qwen3-Coder-Next FP8 | ~47 | — | 0.88 |
| Spark C | Gemma 4 26B FP8 | ~35 | ~180 @ 8-par | 0.70 |
| Spark D | GPT-OSS 120B MXFP4 | ~59 | ~150 @ 4-par | 0.70 |
