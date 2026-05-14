# Model Registry V2 — LumeOS
# Status: Phase 2 LIVE — 29. April 2026

---

## Current Runtime Correction, 2026-05-14

DGX1 / Spark1 is now the verified `orchestrator-agent` and governance/reasoning runtime. See `docs/project/runtime/DGX1_SPARK1_ORCHESTRATOR_RUNTIME.md` for the current runtime proof and service flags.

Current Spark1 facts:

- Host: `edgexpert-1116`
- IP / endpoint: `192.168.0.128:8001` / `http://192.168.0.128:8001`
- Local endpoint on DGX1: `http://127.0.0.1:8001`
- Container/service: `vllm-qwen` / `vllm.service`
- Image: `vllm/vllm-openai:cu130-nightly`
- Model: `Qwen/Qwen3.6-35B-A3B-FP8`
- Served model: `qwen3.6-35b-fp8`
- Corrected flags: `--max-num-batched-tokens 8192`, `--reasoning-parser qwen3`, `--default-chat-template-kwargs '{"enable_thinking": false}'`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_xml`
- Startup fix: `block_size 2096 > max_num_batched_tokens 2048` is resolved by `--max-num-batched-tokens 8192`.
- Thinking-output fix: `enable_thinking=false` is enforced by the runtime chat-template configuration.

Commit `a0b3a20` proves `spark1_orchestrated` operator handoff in doctor/dry-run probes. No Codex fallback is used when Spark1 orchestration is requested.

Remaining gaps:

- DGX3 / Spark3 has migrated from Gemma4 to Nemotron Omni NVFP4. It is verified as a specialist / multimodal / visual-review / OCR / FoodCam candidate, not orchestrator and not production routing by default.
- MiniMax remains lab-only and is not productive governance routing.
- Codex remains bootstrap, senior worker/reviewer, and fallback, not the default orchestrator in `spark1_orchestrated` mode.

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

### Spark C - DGX3 Nemotron Specialist Candidate

| Parameter | Wert |
|---|---|
| IP | 192.168.0.99 |
| Port | 8001 |
| Hostname | edgexpert-509d |
| Service | `vllm.service` |
| Autostart | enabled |
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

Current correction: the Gemma4 values above are historical/retired for workflow routing. DGX3 now runs:

- Image: `vllm/vllm-openai:v0.20.0-aarch64-cu130-ubuntu2404`
- Model: `nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4`
- Local model path: `/root/.cache/huggingface/local-models/nvidia-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4`
- Endpoint: `http://192.168.0.99:8001`
- Local endpoint: `http://127.0.0.1:8001`
- `max_model_len: 65536`
- Smoke: `/v1/models` OK, reply-only `ok`, JSON-only `{"status":"ok"}`
- Wrapper rule: trim content, ignore separate `reasoning`, empty content invalid
- Observed throughput: about `58` completion tok/s single and about `162` aggregate completion tok/s at four parallel requests

Role: specialist / multimodal / visual-review / OCR / FoodCam candidate, not orchestrator. Gemma4 on DGX3 is not workflow-ready and must not be used in routing. Add a model-runtime route for Nemotron only after acceptance policy decides the exact role and output contract.

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
| Spark C | Nemotron Omni NVFP4 | ~58 | ~162 @ 4-par | TBD |
| Spark D | GPT-OSS 120B MXFP4 | ~59 | ~150 @ 4-par | 0.70 |
