# vLLM Setup - Spark C / DGX3

Stand: 14 May 2026

## Current Status

DGX3 / Spark3 has migrated from Gemma4 to Nemotron Omni NVFP4.

Current verified state:

| Field | Value |
|---|---|
| Host | `edgexpert-509d` |
| IP | `192.168.0.99` |
| Service | `vllm.service` |
| Autostart | enabled |
| Container | `vllm_node` |
| Image | `vllm/vllm-openai:v0.20.0-aarch64-cu130-ubuntu2404` |
| Model | `nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4` |
| Local model path | `/root/.cache/huggingface/local-models/nvidia-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4` |
| Endpoint | `http://192.168.0.99:8001` |
| Local endpoint | `http://127.0.0.1:8001` |
| max_model_len | `65536` |
| Role | controlled `nemotron-review-agent` reviewer/specialist candidate |

Source of truth: `docs/project/runtime/DGX3_SPARK3_NEMOTRON_RUNTIME.md`.

## Active Runtime Rule

Use `content.trim()`, ignore `reasoning`, and treat empty content as invalid.
Nemotron is not an orchestrator, not a coding worker, and not production routing
by default.

## Archived / Do Not Use

The old Gemma4 launch path using:

```text
vllm serve google/gemma-4-26B-A4B-it
```

is retired. Do not use it for workflow routing or service recovery.

## Verification

Read-only endpoint verification is allowed only when explicitly authorized:

```bash
curl http://192.168.0.99:8001/v1/models
```

Expected active model id:

```text
/root/.cache/huggingface/local-models/nvidia-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4
```
