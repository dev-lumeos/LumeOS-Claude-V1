# LUMEOS Spark systemd Services

Stand: 14 May 2026

This directory contains service templates and startup wrappers. Do not assume a
wrapper is active on a remote host without verifying the remote service file and
container first.

No service restart or deployment is authorized by this document.

## Current Verified Runtime State

| Service | Host | IP | Container | Model | Role | Status |
|---|---|---|---|---|---|---|
| Spark1 / DGX1 | `edgexpert-1116` | `192.168.0.128` | `vllm-qwen` | `qwen3.6-35b-fp8` | `orchestrator-agent` | workflow-ready |
| Spark2 / DGX2 | `edgexpert-5862` | `192.168.0.188` | `spark-b-coder` | `qwen3-coder-next-fp8` | coding/docs worker | workflow-ready |
| Spark3 / DGX3 | `edgexpert-509d` | `192.168.0.99` | `vllm_node` | Nemotron Omni NVFP4 | controlled reviewer/specialist candidate | verified; not default production routing |
| DGX4/5 | UNKLAR | UNKLAR | UNKLAR | MiniMax M2.7 NVFP4 lab/runtime | lab-only / Hermes-test | not production routing |

## Active Service Notes

- Spark1: see `infra/systemd/spark-a/start-spark-a.sh`.
- Spark2: see `infra/systemd/spark-b/start-spark-b.sh`.
- Spark3: current verified runtime is Nemotron via `vllm.service`; the repository
  `spark-c` wrapper has been updated to match that verified role.
- Spark4/GPT-OSS files are archived and must not be used as active production
  routing. DGX4/5 MiniMax lab startup remains UNKLAR until verified.

## Read-only Verification Commands

Use these only when live endpoint checks are explicitly authorized:

```bash
curl http://192.168.0.128:8001/v1/models
curl http://192.168.0.188:8001/v1/models
curl http://192.168.0.99:8001/v1/models
```

Expected current IDs:

```text
192.168.0.128: qwen3.6-35b-fp8
192.168.0.188: qwen3-coder-next-fp8
192.168.0.99: /root/.cache/huggingface/local-models/nvidia-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4
```

DGX4/5 MiniMax lab expected IDs are UNKLAR in this repository until a verified
lab runtime report is written.

## Operational Boundaries

- Do not deploy these files to remote machines without a separate runtime task.
- Do not restart services from documentation tasks.
- Do not add MiniMax to production routing.
- Do not revive Gemma4 or GPT-OSS routes without a new verification and routing
  decision.
- systemd only supervises process lifecycle. It does not prove completion health;
  governed workflow checks must use the model-runtime checker where appropriate.
