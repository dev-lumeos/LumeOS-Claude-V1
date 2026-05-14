# Model Runtime Hardening

Date: 2026-05-05

## Purpose

This document defines the governance rules for Spark/vLLM/model runtime readiness before autonomous, night, large, or product-facing work runs.

The goal is to detect routing, endpoint, timeout, JSON-mode, and Qwen thinking-policy problems before they turn into approval loops, invalid JSON spikes, or stuck runtime state.

Codex CLI with GPT-5.5 is the productive senior engineering and repo-aware review runtime. DGX4/Spark D is removed from productive governance routing and is reserved for later DGX4/DGX5 lab work. Spark 4/5 remain local lab/premium model experiments and do not replace Codex production authority.

Current DGX1 / Spark1 correction, 2026-05-14: Spark1 is verified as the active `orchestrator-agent` and governance/reasoning runtime. The corrected runtime is documented in `docs/project/runtime/DGX1_SPARK1_ORCHESTRATOR_RUNTIME.md`.

## Runtime Source Of Truth

Routing and agent identity come from:

- `system/agent-registry/agents.json`
- `system/agent-registry/model_routing.json`
- `AGENTS.md`

The read-only runtime checker is:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\model-runtime-check.ts
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\model-runtime-check.ts --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\model-runtime-check.ts --agent db-migration-agent
```

Optional endpoint health:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\model-runtime-check.ts --check-endpoints --timeout-ms 1500
```

Default endpoint checks are short, read-only health checks against `/v1/models`. They must not send workorder prompts or expensive generation requests.

For governed execution preflight on endpoint-backed agents such as `docs-agent`, `/v1/models` is not sufficient proof of execution health. Governed execution must use a tiny `/v1/chat/completions` completion probe for the targeted agent before dispatch. If the completion probe returns HTTP 500, `EngineDeadError`, Triton/CUDA crash text, or empty assistant output, the batch must stop as `RUNTIME_UNHEALTHY` before the workorder is dispatched.

Runtime monitoring history is explicit and local:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\model-runtime-check.ts --check-endpoints --timeout-ms 1500 --record-history --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\model-runtime-check.ts --history-summary --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\model-runtime-check.ts --history-json --project lumeos
```

Default runtime checks remain read-only and do not write history. `--record-history` appends ignored local JSONL records under `system/reports/model-runtime-history/`.

The Codex Worker Bridge is documented separately:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workers\codex-worker.ts --workorder <workorder-file> --dry-run
```

It prepares non-interactive `codex exec` prompts for `senior-coding-agent`. Manual CLI use remains dry-run by default. Dispatcher execution is controlled-enabled for `senior-coding-agent` only, requires workorder `codex_worker: true`, and remains blocked for product work while `product_gate_open=false`.

## Endpoint Health

Expected Spark/vLLM routes currently include:

| Node | Endpoint | Role |
| --- | --- | --- |
| DGX1 / Spark1 / Spark A | `http://192.168.0.128:8001` | Qwen3.6 `orchestrator-agent` and governance/reasoning runtime |
| Spark B | `http://192.168.0.188:8001` | Qwen coder execution/docs/tests/i18n |
| DGX3 / Spark3 | `http://192.168.0.99:8001` | Nemotron specialist / multimodal / visual-review / OCR / FoodCam candidate; not orchestrator and not production routing by default |
| DGX4 / Spark D | `http://192.168.0.101:8001` | disabled for productive governance; future DGX4/DGX5 MiniMax lab |
| RTX 5090 | `http://localhost:8001` | MealCam vision |

Non-HTTP runtimes are represented explicitly:

| Runtime | Model | Healthcheck | Role |
| --- | --- | --- | --- |
| Codex CLI | `gpt-5.5` | config/manual | senior-coding-agent, senior-reviewer-agent, and final repo-aware escalation |

Codex CLI is not a vLLM/OpenAI-compatible HTTP endpoint and must not be checked with `/v1/models`. Missing endpoints are acceptable for `runtime_type: codex-cli` or other external/config-checked runtimes. Missing endpoints for required local Spark/vLLM routes are high findings.

`senior-reviewer-agent` is now a Codex/GPT-5.5 route for productive governance. Any DGX4/Spark D route must be represented only as lab/disabled metadata and must not be included as a required productive runtime route.

Codex worker execution uses `codex exec` through `system/workers/codex-worker.ts`. The bridge is not a broad automatic dispatcher replacement. `system/workers/codex-worker.config.json` enables the controlled senior-agent path while keeping the policy narrow: only `senior-coding-agent`, explicit `codex_worker: true`, complete source/scope/output metadata, no pending approval requirement, hard timeout, and product work blocked while `product_gate_open=false`.

MealCam/Vision is optional and on-demand. Its endpoint is not expected to be online during normal governance/operator work. An offline `mealcam-agent` endpoint is reported as informational unless a MealCam/Vision workorder, selected batch, or explicit Tom request requires that runtime.

## DGX3 / Spark3 Nemotron Runtime

DGX3 / Spark3 has been migrated from Gemma4 to Nemotron Omni NVFP4. Full runtime details are recorded in `docs/project/runtime/DGX3_SPARK3_NEMOTRON_RUNTIME.md`.

Verified DGX3 state:

- Host: `edgexpert-509d`
- IP: `192.168.0.99`
- Service: `vllm.service`
- Autostart: enabled
- Container: `vllm_node`
- Image: `vllm/vllm-openai:v0.20.0-aarch64-cu130-ubuntu2404`
- Model: `nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4`
- Local model path: `/root/.cache/huggingface/local-models/nvidia-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4`
- Endpoint: `http://192.168.0.99:8001`
- Local endpoint: `http://127.0.0.1:8001`
- `max_model_len: 65536`
- Role: specialist / multimodal / visual-review / OCR / FoodCam candidate, not orchestrator

Verified smoke:

- `/v1/models` OK
- Reply-only: `ok -> content.trim() = ok`
- JSON-only: `content.trim() = {"status":"ok"}`
- Reasoning is separate in the `reasoning` field.

Normal workflow wrapper rule:

- Trim content.
- Ignore `reasoning` for normal workflow output.
- Empty trimmed content is invalid.

Observed performance:

- About `58` completion tok/s single request.
- About `162` aggregate completion tok/s with four parallel requests.

Routing status:

- Gemma4 on DGX3 is not workflow-ready and must not be used in routing.
- DGX3 / Nemotron is not production routing by default.
- Add a model-runtime route only after an acceptance policy decides its role and output contract.

## DGX1 / Spark1 Corrected Runtime

Verified DGX1 state:

- Host: `edgexpert-1116`
- IP: `192.168.0.128`
- Container: `vllm-qwen`
- Service: `vllm.service`
- Image: `vllm/vllm-openai:cu130-nightly`
- Model: `Qwen/Qwen3.6-35B-A3B-FP8`
- Served model name: `qwen3.6-35b-fp8`
- Endpoint: `http://192.168.0.128:8001`
- Local endpoint: `http://127.0.0.1:8001`
- `max_model_len: 65536`
- Role: Spark1 / DGX1 `orchestrator-agent` and governance/reasoning runtime

The corrected `vllm.service` flags are:

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

Known fixes:

- Startup crash root cause was `block_size 2096 > max_num_batched_tokens 2048`; the corrected service uses `--max-num-batched-tokens 8192`.
- Visible thinking output is fixed by the Qwen3 reasoning setup and `enable_thinking=false` at the chat-template layer.
- Acceptance smoke results now pass: reply-only `ok -> ok`, JSON-only `{"status":"ok"}`, and `orchestrator-agent` model-runtime-check reports `HEALTHY`.

## Spark1 Orchestrated Handoff

Commit `a0b3a20` proves the Spark1 pre-dispatch handoff in operator probes.

For `--orchestration-mode spark1_orchestrated`:

- `--doctor` and `--dry-run` invoke Spark1 / `orchestrator-agent` handoff.
- The operator validates Spark1 routing intent and worker assignments deterministically.
- No Codex fallback is used when Spark1 is requested.
- Codex role must report `none` unless Spark1 explicitly assigns Codex as worker/reviewer/fallback.

The verified live doctor probe for `BATCH-NUTRITION-P1-005-LOCAL-DETAIL-PANEL.md` returned:

- `actual_orchestration_mode: spark1_orchestrated`
- `spark1_orchestrator_used: true`
- `codex_role: none`
- `worker_assignment_result: WO-nutrition-013->senior-coding-agent`
- `final_diagnosis: CLEAN_READY`

Example:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts system\workorders\nutrition\batches\BATCH-NUTRITION-P1-005-LOCAL-DETAIL-PANEL.md --continue --project lumeos --orchestration-mode spark1_orchestrated
```

## Runtime History

Runtime history records one local JSONL row per route per explicit recorded check.

Ignored local files:

- `system/reports/model-runtime-history/history.jsonl`
- `system/reports/model-runtime-history/latest.json`

Record fields include timestamp, project id, route id/agent, model, runtime type, endpoint, required/optional state, endpoint status, latency, timeout flag, severity, finding ids, and product gate state.

History summaries report:

- total records and checks
- time range
- explicit V2 status: `HEALTHY`, `DEGRADED_OPTIONAL`, `BLOCKED_REQUIRED_FAILURE`, `STALE_HISTORY`, `PLANNED_MAINTENANCE`, `RECHECK_REQUIRED`, or `UNKNOWN_NOT_CHECKED`
- freshness metadata: `last_checked_at`, `age_minutes`, `age_ms`, `freshness_status`, and `stale_after_minutes`
- blocking impact and next required action
- last route status
- failure and timeout counts
- average and max latency
- last ok and last failure timestamps
- overall readiness: `RUNTIME_HEALTHY`, `RUNTIME_DEGRADED`, `RUNTIME_BLOCKED`, or `UNKNOWN`

History readiness is based on the latest fresh record for active required productive routes. Older failures remain visible as historical failure and timeout counts, but stale records from removed, disabled, or lab-only routes must not keep current governance readiness blocked. A stale history record must not be interpreted as current health; it returns `STALE_HISTORY` and requires a fresh endpoint check before runtime-dependent autonomous, night, or large runs.

Current planned maintenance is represented by `system/control-plane/runtime-maintenance.json`. The 2026-05-11 rack-installation maintenance window is historical and was cleared by later runtime proof. New endpoint failures must be classified against current route readiness, not against stale planned-maintenance state.

Codex CLI routes record `runtime_type=codex-cli`, `endpoint_status=external_ok`, and `latency_ms=null`.

MealCam optional offline records as informational degraded history, not a high blocker for normal governance work.

## Timeout Policy

Dispatcher model calls must have a bounded timeout.

Current dispatcher policy:

- `MODEL_CALL_TIMEOUT_MS = 30_000`
- each attempt uses `AbortController`
- fetch requests pass `signal`
- unavailable endpoints stop cleanly with a model-runtime error

Timeouts are model-runtime failures, not governance validation failures.

## Retry Policy

Dispatcher model calls may retry bounded runtime failures once.

Current dispatcher policy:

- `MODEL_CALL_MAX_ATTEMPTS = 2`
- retry is only for model-call runtime failures such as network failure, timeout, or transient 5xx response
- 4xx responses are not retried
- invalid JSON, selected-agent drift, approval failures, scope violations, and migration guard failures are governance/model-output failures and must not become endless runtime retries

## JSON Mode

Runtime-facing agents that produce `OrchestratorIntent` or otherwise require JSON-only output must use JSON object response mode where the API supports it.

The checker verifies that dispatcher code requests:

```ts
response_format = { type: 'json_object' }
```

for JSON-only Qwen3.6 runtime paths.

## Qwen Thinking-Off Policy

Qwen3.6 routes must disable thinking through API options. Prompt text such as `/no_think` is not enough.

The required policy is:

```json
{
  "enable_thinking": false,
  "temperature": 0.0
}
```

The checker verifies both routing documentation and dispatcher enforcement.

## Failure Classification

| Failure | Classification | Expected Behavior |
| --- | --- | --- |
| endpoint unreachable | model runtime | stop operator cleanly; report endpoint |
| endpoint timeout | model runtime | retry once, then stop cleanly |
| 5xx response | model runtime | retry once, then stop cleanly |
| completion probe 500 / EngineDeadError / Triton CUDA crash | docs-agent or route runtime crash | classify as `RUNTIME_UNHEALTHY`; restart affected Spark/vLLM service, re-check tiny completion probe, run safe cleanup, retry only after health proof |
| 4xx response | config/request error | stop; do not retry blindly |
| invalid JSON | model-output/governance | use rewrite/stop-rule path, not runtime retry |
| selected_agent mismatch | governance validator | rewrite/fail according to validator |
| approval needed | approval lifecycle | stop for Tom; never auto-grant |
| migration guard failure | safety guard | stop/fix; do not execute SQL |

## Operator Behavior

Operator Doctor includes model-runtime status and can report:

- `MODEL_RUNTIME_BLOCKED`
- `MODEL_CONFIG_WARNING`
- `MODEL_ENDPOINT_UNREACHABLE`
- `MODEL_MISSING`
- `JSON_MODE_POLICY_MISSING`
- `QWEN_THINKING_POLICY_MISSING`

Doctor remains read-only and produces exactly one next action.

If the latest governed execution for a batch failed with a runtime-crash signature such as `vLLM runtime unavailable`, `EngineDeadError`, or `Triton Error [CUDA]: operation not permitted`, Doctor must report `RUNTIME_UNHEALTHY` instead of reducing the issue to a generic product/workorder failure.

## Product Work Gate

Product work remains conditionally open only for controlled planning/probe work.

Autonomous, night, large, or product-execution runs remain blocked until:

- model runtime checker has no critical/high findings
- endpoint health is proven when runtime execution is needed
- optional/on-demand runtimes required by the target batch are online
- invariant checker is clean
- agent-contract checker is clean
- spec-source-chain checker passes for the target batch/workorder
- governance-learning-check is clean
- Tom explicitly opens or waives the relevant gate

## No Product Execution

This hardening layer does not run product batches, execute migrations, import BLS data, grant approvals, or run Supabase `db push`/`db reset`.

## Remaining Runtime Gaps

- DGX3 / Spark3 Nemotron is verified as a specialist runtime but is not production routing by default; Gemma4 on DGX3 is retired/not workflow-ready.
- MiniMax remains lab-only and is not productive governance routing.
- Codex remains bootstrap, senior worker/reviewer, and fallback. Codex is not the default orchestrator when `spark1_orchestrated` is requested.
