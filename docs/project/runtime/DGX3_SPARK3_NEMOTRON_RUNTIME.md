# DGX3 / Spark3 Nemotron Runtime

Date: 2026-05-14

## Current Verified Runtime

DGX3 / Spark3 has been migrated from Gemma4 to Nemotron Omni NVFP4.

| Field | Value |
| --- | --- |
| Host | `edgexpert-509d` |
| IP | `192.168.0.99` |
| Service | `vllm.service` |
| Autostart | enabled |
| Container | `vllm_node` |
| Image | `vllm/vllm-openai:v0.20.0-aarch64-cu130-ubuntu2404` |
| Model | `nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4` |
| Served model id | `/root/.cache/huggingface/local-models/nvidia-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4` |
| Local model path | `/root/.cache/huggingface/local-models/nvidia-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4` |
| Endpoint | `http://192.168.0.99:8001` |
| Local endpoint | `http://127.0.0.1:8001` |
| max_model_len | `65536` |
| Role | specialist / multimodal / visual-review / OCR / FoodCam candidate, not orchestrator |

## Verified Smoke

- `/v1/models`: OK
- The OpenAI-compatible `model` field must use the served model id above, not the Hugging Face repo id.
- Reply-only smoke: `ok -> content.trim() = ok`
- JSON-only smoke: `content.trim() = {"status":"ok"}`
- Long-context smoke: `46858` prompt tokens and `160` completion tokens completed in `8.12` seconds with `finish_reason=stop`, `content={"status":"ok","context":"long"}`, and `reasoning_len=694`.
- Reasoning is emitted separately in the `reasoning` field.

Wrapper rule for normal workflow output:

- Trim `message.content`.
- Ignore `reasoning` for normal workflow output.
- Treat empty trimmed content as invalid.
- Reserve enough `max_tokens` for governed review prompts because reasoning can consume output budget even when normal workflow output ignores the `reasoning` field. Current controlled reviewer floor is 4096 tokens; the health probe uses a 512-token floor.

## Observed Performance

- 500-token single request: about `57.99` completion tokens/sec.
- 1322-token single request: about `58.37` completion tokens/sec.
- Four parallel requests: about `162.64` aggregate completion tokens/sec.

## Routing Status

- Gemma4 on DGX3 is not workflow-ready and must not be used in routing.
- DGX3 / Nemotron is integrated as `nemotron-review-agent`, a controlled on-demand reviewer/specialist candidate for explicit workflow tests.
- It is not production routing by default.
- Use it only after the acceptance gates pass for the exact run.
- DGX1 remains the orchestrator runtime.
- DGX2 remains the coding/docs worker runtime.
- MiniMax remains lab-only.

## Controlled Reviewer Acceptance Policy

Before a governed workflow may route a review step through `nemotron-review-agent`, the run owner must prove:

- `/v1/models` returns OK for `http://192.168.0.99:8001`.
- A tiny completion probe returns non-empty `content.trim()`.
- A JSON-only completion probe returns parseable JSON after `content.trim()`.
- The workflow wrapper ignores `reasoning` and `reasoning_content` for normal output.
- Empty trimmed content is treated as invalid / `OUTPUT_INCOMPLETE`.
- The batch is harmless and governed, such as local UI/docs/read-only Nutrition work.

Controlled workflow route:

```powershell
$env:LUMEOS_FAST_REVIEWER_ROUTE='nemotron-review-agent'
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts system\workorders\nutrition\batches\BATCH-NUTRITION-P1-005-LOCAL-DETAIL-DEEPLINK.md --continue --project lumeos --orchestration-mode spark1_orchestrated
Remove-Item Env:\LUMEOS_FAST_REVIEWER_ROUTE
```

This route tests: Spark1 orchestrator -> assigned worker -> DGX3/Nemotron review step -> checks -> dossier. It does not authorize DB, Supabase, migration, BLS, seed, DEV, LIVE, or production routing work.
