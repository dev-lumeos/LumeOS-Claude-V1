# LUMEOS - Stack & Runtime Reference

Stand: 14 May 2026

This is the operational stack SSOT for current runtime roles. Historical launch
blocks are explicitly marked archived. Do not use archived commands for routing
or service changes.

---

## Current Runtime Map

| Node | Host | IP | Service | Container | Model | Role | Status |
|---|---|---|---|---|---|---|---|
| DGX1 / Spark1 | `edgexpert-1116` | `192.168.0.128` | `vllm.service` | `vllm-qwen` | `qwen3.6-35b-fp8` | `orchestrator-agent`, governance/reasoning | workflow-ready; Spark1 handoff proven |
| DGX2 / Spark2 | `edgexpert-5862` | `192.168.0.188` | `vllm.service` | `spark-b-coder` | `qwen3-coder-next-fp8` | coding/docs worker | workflow-ready |
| DGX3 / Spark3 | `edgexpert-509d` | `192.168.0.99` | `vllm.service` | `vllm_node` | `nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4` | controlled reviewer/specialist candidate | verified; not default production routing |
| DGX4 | `edgexpert-0dc8` | `192.168.0.101` | UNKLAR service/autostart | `vllm_node` | `nvidia-MiniMax-M2.7-NVFP4` | MiniMax lab / Hermes-test | verified lab-only; not production routing |
| DGX5 | `edgexpert-e5e3` | UNKLAR current LAN IP | UNKLAR service/autostart | UNKLAR | MiniMax worker/lab node | MiniMax lab worker only | not standalone production route |
| Codex | local/API | n/a | n/a | n/a | GPT-5.x / Claude Code bridge as configured | bootstrap/senior/fallback | not default orchestrator in Spark1 mode |

UNKLAR verification command for DGX4/5 service/autostart and full lab state:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\model-runtime-check.ts --check-endpoints --json --project lumeos
```

Do not run live endpoint checks during documentation-only tasks unless explicitly
authorized.

---

## Spark1 / DGX1

Source of truth: `docs/project/runtime/DGX1_SPARK1_ORCHESTRATOR_RUNTIME.md`.

Verified facts:

- Host: `edgexpert-1116`
- Endpoint: `http://192.168.0.128:8001`
- Local endpoint on DGX1: `http://127.0.0.1:8001`
- Service/container: `vllm.service` / `vllm-qwen`
- Image: `vllm/vllm-openai:cu130-nightly`
- Model: `Qwen/Qwen3.6-35B-A3B-FP8`
- Served model: `qwen3.6-35b-fp8`
- `max_model_len`: `65536`
- Role: Spark1 `orchestrator-agent`

Correct service flags include:

```text
--kv-cache-dtype fp8
--gpu-memory-utilization 0.70
--max-model-len 65536
--enable-chunked-prefill
--enable-prefix-caching
--max-num-seqs 4
--max-num-batched-tokens 8192
--reasoning-parser qwen3
--default-chat-template-kwargs '{"enable_thinking": false}'
--enable-auto-tool-choice
--tool-call-parser qwen3_xml
```

The startup crash root cause was `block_size 2096 > max_num_batched_tokens 2048`;
the correction is `--max-num-batched-tokens 8192`.

Spark1 handoff is proven. `spark1_orchestrated` dry-run/doctor uses Spark1 for
pre-dispatch worker assignment and must not silently fall back to Codex.

---

## Spark2 / DGX2

Verified facts:

- Host: `edgexpert-5862`
- Endpoint: `http://192.168.0.188:8001`
- Service/container: `vllm.service` / `spark-b-coder`
- Model: `qwen3-coder-next-fp8`
- Role: coding/docs worker
- Status: workflow-ready

Spark2 completion health, not only `/v1/models`, is required before governed
docs-agent dispatch because the previous vLLM/Triton crash class could pass
model-list checks while completions failed.

---

## Spark3 / DGX3

Source of truth: `docs/project/runtime/DGX3_SPARK3_NEMOTRON_RUNTIME.md`.

Verified facts:

- Host: `edgexpert-509d`
- Endpoint: `http://192.168.0.99:8001`
- Local endpoint on DGX3: `http://127.0.0.1:8001`
- Service: `vllm.service`
- Autostart: enabled
- Container: `vllm_node`
- Image: `vllm/vllm-openai:v0.20.0-aarch64-cu130-ubuntu2404`
- Model: `nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4`
- Served model id: `/root/.cache/huggingface/local-models/nvidia-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4`
- `max_model_len`: `65536`
- Role: controlled `nemotron-review-agent` reviewer/specialist candidate

Wrapper rule:

- Use `content.trim()`.
- Ignore `reasoning` for normal workflow output.
- Empty content is invalid / `OUTPUT_INCOMPLETE`.
- Long-context prompts need enough `max_tokens` because reasoning can consume
  budget.

Verified smoke:

- `/v1/models` OK
- reply-only `ok -> ok`
- JSON-only `{"status":"ok"}`
- 46k long-context prompt OK
- Full Spark1 -> worker -> Nemotron review proof passed with review confidence
  `0.95` and dossier output.

Gemma4 on DGX3 is retired and must not be used.

---

## DGX4/5 MiniMax Lab

MiniMax M2.7 NVFP4 is lab-only / Hermes-test only. It is not production routing,
not a Spark1 orchestrator replacement, and not a default reviewer route.

Verified lab facts:

- DGX4 host/IP: `edgexpert-0dc8` / `192.168.0.101`.
- DGX4 container/image/model: `vllm_node` / `vllm-node-minimax` /
  `nvidia-MiniMax-M2.7-NVFP4`.
- DGX4 `/v1/models` showed `max_model_len=65536`.
- DGX4 completion produced `content.trim() = ok` and JSON after trim.
- DGX4 and DGX5 both showed `RayWorkerProc` with about `98006 MiB` reserved
  and about `50C` idle.
- DGX5 host: `edgexpert-e5e3`; role is MiniMax worker/lab node, not standalone
  production route.

Still UNKLAR:

- DGX4/DGX5 exact service file, autostart state, and repository wrapper parity.
- Complete Hermes 65k evidence.

Do not document GPT-OSS as active unless it is re-verified and explicitly
accepted again. Historical GPT-OSS/Spark D files are archive references only.

---

## Agent Routing Summary

| Agent | Current route | Role |
|---|---|---|
| `orchestrator-agent` | Spark1 / `qwen3.6-35b-fp8` | dispatch planning and worker assignment |
| `context-builder`, `governance-compiler`, `review-agent`, `pre-review-agent`, `post-review-agent`, `security-specialist`, `db-migration-agent` | Spark1 / `qwen3.6-35b-fp8` | governance/reasoning tasks |
| `micro-executor`, `test-agent`, `i18n-agent`, `docs-agent` | Spark2 / `qwen3-coder-next-fp8` | coding/docs/test worker tasks |
| `nemotron-review-agent` | Spark3 / Nemotron Omni NVFP4 | explicit controlled review tests only |
| `fast-reviewer-agent` | retired legacy route | do not use until route is redesigned |
| `senior-coding-agent`, `senior-reviewer-agent` | Codex bridge as configured | senior/fallback execution and review |
| `mealcam-agent` | planned vision runtime | not part of current Nutrition local workflow |

---

## Archived / Do Not Use

The following historical routes and launch blocks are retained only as evidence
in older docs or infra files:

- DGX3 / Spark3 Gemma4 (`google/gemma-4-26B-A4B-it`) launch path.
- DGX4 / Spark D GPT-OSS (`openai/gpt-oss-120b`) senior-reviewer path.
- Any `launch-cluster.sh` recipe that contradicts the current runtime map above.

Before using any archived runtime, create a new verification record and update
this SSOT.
