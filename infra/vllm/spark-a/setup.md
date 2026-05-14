# vLLM Setup - Spark A / DGX1

Stand: 14 May 2026

Current source of truth: `docs/project/runtime/DGX1_SPARK1_ORCHESTRATOR_RUNTIME.md`.

## Current Verified State

| Field | Value |
|---|---|
| Host | `edgexpert-1116` |
| IP | `192.168.0.128` |
| Service | `vllm.service` |
| Container | `vllm-qwen` |
| Image | `vllm/vllm-openai:cu130-nightly` |
| Model | `Qwen/Qwen3.6-35B-A3B-FP8` |
| Served model | `qwen3.6-35b-fp8` |
| max_model_len | `65536` |
| Role | Spark1 orchestrator-agent and governance/reasoning runtime |

## Correct Service Flags

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

The startup crash root cause was `block_size 2096 > max_num_batched_tokens 2048`.
The fix is `--max-num-batched-tokens 8192`.

## Fallback Start

Use only in an authorized runtime task:

```bash
sudo systemctl start spark-a
```

Read-only verification, only when authorized:

```bash
curl http://192.168.0.128:8001/v1/models
```

Expected id: `qwen3.6-35b-fp8`.
