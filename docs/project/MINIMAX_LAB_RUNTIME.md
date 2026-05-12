# MiniMax Lab Runtime

STATUS: LAB / REFERENCE_ONLY

This document records the Spark4/Spark5 MiniMax M2.7 NVFP4 lab runtime baseline. It is not productive governance routing, it is not required for product work, and it does not authorize adding MiniMax to `system/agent-registry/model_routing.json`.

## Purpose

Spark4/Spark5 MiniMax Lab is a separate lab/test runtime for future evaluation. It is intended for senior-review, long-context, decomposition, old-repo salvage, and governance-analysis experiments.

Current productive governance runtime remains:

- DGX1 / Spark A: `192.168.0.128:8001` / `qwen3.6-35b-fp8`
- DGX2 / Spark B: `192.168.0.188:8001` / `qwen3-coder-next-fp8`
- DGX3 / Spark C: `192.168.0.99:8001` / `google/gemma-4-26B-A4B-it`
- Codex/GPT-5.5: productive senior-coding-agent and senior-reviewer-agent path

MiniMax is lab-only until reproducible benchmark evidence and a separate governance decision say otherwise.

## Hardware And Network

| Node | Role | LAN IP |
|---|---|---|
| Spark4 / DGX4 | MiniMax lab node | `192.168.0.101` |
| Spark5 / DGX5 | MiniMax lab node | `192.168.0.167` |

Lab interconnect:

| Node | Interface | Address |
|---|---|---|
| Spark4 | `enP2p1s0f0np0` | `10.200.0.4/30` |
| Spark5 | `enP2p1s0f0np0` | `10.200.0.5/30` |
| Spark4 | `enp1s0f1np1` | `10.201.0.4/30` |
| Spark5 | `enp1s0f1np1` | `10.201.0.5/30` |

Active MiniMax cluster interface: `enp1s0f1np1`.

Persistent NetworkManager connection names observed/expected for the 200G links:

- `minimax-200g`
- `minimax-200g-2`

200G link proof:

- Forward: about `111 Gbit/s`
- Reverse: about `111 Gbit/s`
- Retransmits: `0`

## Model And Runtime Baseline

| Field | Value |
|---|---|
| Image | `vllm-node-minimax` |
| Recipe | `/home/admin/spark-vllm-docker/recipes/minimax-m2.7-nvidia-nvfp4-cutlass-local.yaml` |
| Model | `nvidia/MiniMax-M2.7-NVFP4` |
| Host model source | `/home/admin/models/nvidia-MiniMax-M2.7-NVFP4-gitlfs` |
| Container-visible model path | `/root/.cache/huggingface/local-models/nvidia-MiniMax-M2.7-NVFP4` |
| Port | `8011` |
| Nodes | `10.201.0.4,10.201.0.5` |
| Backend | Ray |
| Tensor parallelism | `TP=2` |
| Max context | `max_model_len=16384` |
| GPU memory utilization | `0.62` |
| Max sequences | `max_num_seqs=1` |
| Local endpoint on Spark4 | `http://127.0.0.1:8011` |
| Remote LAN endpoint | `http://192.168.0.101:8011` |

Required environment:

```bash
VLLM_NVFP4_GEMM_BACKEND=cutlass
VLLM_USE_FLASHINFER_MOE_FP4=0
VLLM_ALLOW_LONG_MAX_MODEL_LEN=1
```

Required vLLM flags:

```text
--kv-cache-dtype fp8
--attention-backend TRITON_ATTN
```

Important model path rule:

- The container-visible `local-models` path must contain real hardlinked/copied files.
- Do not use a symlink from `/home/admin/.cache/huggingface/local-models/...` to `/home/admin/models/...`; `/home/admin/models` is not mounted inside the container, so the symlink target is invisible there.

Known stable proof:

- `/v1/models` local OK.
- `/v1/models` remote OK.
- `/v1/chat/completions` OK.
- Speed sample: `446` completion tokens in `16.95` seconds, about `26.32 tok/s`, `finish_reason: stop`.

## Start Command

Reference command only. This is not an automatic production startup command.

```bash
cd /home/admin/spark-vllm-docker
PATH="/home/admin/.local/bin:$PATH" ./run-recipe.sh minimax-m2.7-nvidia-nvfp4-cutlass-local \
  -n 10.201.0.4,10.201.0.5 \
  --eth-if enp1s0f1np1 \
  --port 8011
```

## Verification Commands

Run these only when explicitly validating the lab runtime. Do not wire them into LumeOS productive governance health checks.

Local Spark4 model list:

```bash
curl http://127.0.0.1:8011/v1/models
```

Remote LAN model list from Windows:

```powershell
curl.exe http://192.168.0.101:8011/v1/models
```

Simple chat completion:

```bash
curl http://127.0.0.1:8011/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "nvidia/MiniMax-M2.7-NVFP4",
    "messages": [
      { "role": "user", "content": "Summarize the lab runtime boundary in one sentence." }
    ],
    "temperature": 0,
    "max_tokens": 256
  }'
```

MiniMax may emit reasoning-style text inside `content`. Stable client-side postprocessing is to use only the text after `</think>` when present:

```python
def strip_minimax_reasoning(content: str) -> str:
    marker = "</think>"
    if marker in content:
        return content.split(marker, 1)[1].strip()
    return content.strip()
```

This is a lab wrapper/client concern, not a production routing issue.

## Known Issues And Lessons Learned

- Old AWQ recipes using `cyankiwi/MiniMax-M2.5-AWQ-4bit` and `cyankiwi/MiniMax-M2.7-AWQ` hung during engine/model initialization.
- `saricles/MiniMax-M2.7-NVFP4-GB10` download repeatedly failed with Hugging Face/Xet range and resume errors.
- The NVIDIA model was downloaded successfully with Git LFS:

```bash
GIT_LFS_SKIP_SMUDGE=1 git clone https://huggingface.co/nvidia/MiniMax-M2.7-NVFP4 nvidia-MiniMax-M2.7-NVFP4-gitlfs
git lfs pull
```

- The local model had `15` safetensor shards.
- The HF cache symlink approach failed inside the container because `/home/admin/models` was not mounted there.
- Correct fix: hardlink/copy actual model files into `/home/admin/.cache/huggingface/local-models/nvidia-MiniMax-M2.7-NVFP4` on both nodes.
- The old `vllm-node` image hung. The stable image is `vllm-node-minimax`, built from current vLLM/FlashInfer with `--tf5`.
- Image transfer through `/tmp` failed due disk space. Use streaming transfer or verify enough disk first.
- On Spark4, `/tmp`, `/home`, and `/` share the same partition.
- Spark4 disk cleanup freed space by deleting old broken `saricles` and AWQ attempts.
- KV-cache constraints led to the current stable context setting: `max_model_len=16384`.
- Output can contain reasoning in `content`; client postprocessing should strip text through `</think>` for downstream comparison.

## Future Evaluation Plan

MiniMax Lab evaluation remains non-production. Candidate experiments:

- Compare MiniMax against Codex/GPT-5.5, Qwen3.6, Qwen Coder, and Gemma4 on real governance tasks.
- Review batch dossiers.
- Review decomposition plans before workorder generation.
- Analyze old-repo salvage candidates.
- Run long-context governance drift analysis.
- Consider optional soft-gate or reviewer integration only after reproducible benchmarks and an explicit governance decision.

## Production Boundary

- Do not add MiniMax to `system/agent-registry/model_routing.json` yet.
- Do not use MiniMax for productive governance routing.
- Do not use MiniMax for product work.
- Do not make MiniMax required for operator, doctor, runtime, promotion, or product gates.
- Treat Spark4/Spark5 MiniMax as lab runtime only.

