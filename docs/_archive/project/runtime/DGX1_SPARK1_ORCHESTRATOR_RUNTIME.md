# DGX1 / Spark1 Orchestrator Runtime

Date: 2026-05-14

## Current Verified Runtime

DGX1 / Spark1 is the active orchestrator-agent and governance/reasoning runtime.

| Field | Value |
| --- | --- |
| Host | `edgexpert-1116` |
| IP | `192.168.0.128` |
| Container | `vllm-qwen` |
| Service | `vllm.service` |
| Image | `vllm/vllm-openai:cu130-nightly` |
| Model | `Qwen/Qwen3.6-35B-A3B-FP8` |
| Served model name | `qwen3.6-35b-fp8` |
| Endpoint | `http://192.168.0.128:8001` |
| Local endpoint | `http://127.0.0.1:8001` |
| max_model_len | `65536` |
| Role | Spark1 / DGX1 `orchestrator-agent` and governance/reasoning runtime |

## Correct `vllm.service` Flags

The current working service configuration must include:

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

`enable_thinking=false` is mandatory. Prompt-only `/no_think` is not sufficient for Qwen3.6 runtime governance paths.

## Corrected Failure Modes

- Startup crash root cause: `block_size 2096 > max_num_batched_tokens 2048`.
- Fix: raise `--max-num-batched-tokens` to `8192`.
- Visible thinking output root cause: Qwen3.6 reasoning was not disabled at the runtime/chat-template layer.
- Fix: use Qwen3 reasoning setup plus `--default-chat-template-kwargs '{"enable_thinking": false}'`.

## Acceptance Smoke Results

The corrected runtime was verified with:

- Reply-only smoke: `ok -> ok`
- JSON-only smoke: `{"status":"ok"}`
- `orchestrator-agent` `model-runtime-check`: `HEALTHY`

These results are documented facts from the corrected DGX1 runtime proof. Do not treat them as permission to run live endpoint tests in unrelated documentation-only tasks.

## Spark1 Handoff Proof

Commit `a0b3a20` proves Spark1 handoff in operator probes.

`--doctor` and `--dry-run` now invoke Spark1 / `orchestrator-agent` handoff for `spark1_orchestrated`. The live doctor probe for `system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-LOCAL-DETAIL-PANEL.md` succeeded with:

- `actual_orchestration_mode: spark1_orchestrated`
- `spark1_orchestrator_used: true`
- `codex_role: none`
- `worker_assignment_result: WO-nutrition-013->senior-coding-agent`
- `final_diagnosis: CLEAN_READY`

No Codex fallback is used when `spark1_orchestrated` is requested. Spark1 intent and worker assignments are validated deterministically before worker dispatch.

Example Spark1 execution command:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts system\workorders\nutrition\batches\BATCH-NUTRITION-P1-005-LOCAL-DETAIL-PANEL.md --continue --project lumeos --orchestration-mode spark1_orchestrated
```

## Remaining Runtime Gaps

- DGX3 / Spark3 has migrated from Gemma4 to Nemotron Omni NVFP4. It is verified as a specialist / multimodal / visual-review / OCR / FoodCam candidate, not orchestrator and not production routing by default.
- MiniMax remains lab-only and must not be added to productive routing without future benchmark evidence and an explicit governance decision.
- Codex remains bootstrap, senior worker/reviewer, and fallback. Codex is not the default orchestrator when `spark1_orchestrated` is requested.
