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
| Local model path | `/root/.cache/huggingface/local-models/nvidia-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4` |
| Endpoint | `http://192.168.0.99:8001` |
| Local endpoint | `http://127.0.0.1:8001` |
| max_model_len | `65536` |
| Role | specialist / multimodal / visual-review / OCR / FoodCam candidate, not orchestrator |

## Verified Smoke

- `/v1/models`: OK
- Reply-only smoke: `ok -> content.trim() = ok`
- JSON-only smoke: `content.trim() = {"status":"ok"}`
- Reasoning is emitted separately in the `reasoning` field.

Wrapper rule for normal workflow output:

- Trim `message.content`.
- Ignore `reasoning` for normal workflow output.
- Treat empty trimmed content as invalid.

## Observed Performance

- Single request: about `58` completion tokens/sec.
- Four parallel requests: about `162` aggregate completion tokens/sec.

## Routing Status

- Gemma4 on DGX3 is not workflow-ready and must not be used in routing.
- DGX3 / Nemotron is verified as a runtime, but is not production routing by default.
- Add a model-runtime route only after an acceptance policy decides the exact role and required output contract.
- DGX1 remains the orchestrator runtime.
- DGX2 remains the coding/docs worker runtime.
- MiniMax remains lab-only.

