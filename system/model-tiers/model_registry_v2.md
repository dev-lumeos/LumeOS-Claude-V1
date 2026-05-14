# Model Registry V2 - LumeOS

Status: current as of 14 May 2026.

This registry documents active workflow roles. Historical Gemma4/GPT-OSS routes
are not active routing.

## Active / Controlled Routes

| Route | Node | Host | Endpoint | Model | Role | Status |
|---|---|---|---|---|---|---|
| `orchestrator-agent` | DGX1 / Spark1 | `edgexpert-1116` | `http://192.168.0.128:8001` | `qwen3.6-35b-fp8` | Spark1 orchestration and governance/reasoning | workflow-ready; handoff proven |
| `context-builder`, `governance-compiler`, `review-agent`, `pre-review-agent`, `post-review-agent`, `security-specialist`, `db-migration-agent` | DGX1 / Spark1 | `edgexpert-1116` | `http://192.168.0.128:8001` | `qwen3.6-35b-fp8` | governance/reasoning agents | workflow-ready |
| `micro-executor`, `test-agent`, `i18n-agent`, `docs-agent` | DGX2 / Spark2 | `edgexpert-5862` | `http://192.168.0.188:8001` | `qwen3-coder-next-fp8` | coding/docs/test workers | workflow-ready |
| `nemotron-review-agent` | DGX3 / Spark3 | `edgexpert-509d` | `http://192.168.0.99:8001` | `nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4` | controlled reviewer/specialist candidate | explicit workflow tests only |
| Codex bridge | local/API | n/a | n/a | configured GPT/Claude bridge | bootstrap/senior/fallback | not default orchestrator in Spark1 mode |

## Spark1 Details

Source: `docs/project/runtime/DGX1_SPARK1_ORCHESTRATOR_RUNTIME.md`.

- Service/container: `vllm.service` / `vllm-qwen`
- Image: `vllm/vllm-openai:cu130-nightly`
- Served model: `qwen3.6-35b-fp8`
- Required flags include `--max-num-batched-tokens 8192`,
  `--reasoning-parser qwen3`,
  `--default-chat-template-kwargs '{"enable_thinking": false}'`,
  `--enable-auto-tool-choice`, and `--tool-call-parser qwen3_xml`.

## Spark2 Details

- Service/container: `vllm.service` / `spark-b-coder`
- Served model: `qwen3-coder-next-fp8`
- Role: coding/docs/test worker.
- Completion health is required for docs-agent dispatch; `/v1/models` alone is
  insufficient for the previous Spark2/vLLM crash class.

## Spark3 Details

Source: `docs/project/runtime/DGX3_SPARK3_NEMOTRON_RUNTIME.md`.

- Service/container: `vllm.service` / `vllm_node`
- Image: `vllm/vllm-openai:v0.20.0-aarch64-cu130-ubuntu2404`
- Model: `nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4`
- Served model id:
  `/root/.cache/huggingface/local-models/nvidia-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4`
- Wrapper rule: `content.trim()`, ignore `reasoning`, empty content invalid.
- Full Spark1 -> worker -> Nemotron proof passed with `review_completed`
  `PASS`, confidence `0.95`.

Gemma4 on DGX3 is retired and must not be used.

## DGX4/5 Lab

MiniMax M2.7 NVFP4 is lab-only / Hermes-test only and not production routing.

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

Still UNKLAR: exact service/autostart state, repository wrapper parity, and
complete Hermes 65k evidence.

GPT-OSS / Spark D is historical only and must not be documented as active.

## Archived Routes

| Archived route | Status |
|---|---|
| DGX3 Gemma4 / `fast-reviewer-agent` | retired; do not use |
| DGX4 GPT-OSS / Spark D senior reviewer | historical; do not use as active route |
