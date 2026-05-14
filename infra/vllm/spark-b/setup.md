# vLLM Setup - Spark B / DGX2

Stand: 14 May 2026

## Current Verified State

| Field | Value |
|---|---|
| Host | `edgexpert-5862` |
| IP | `192.168.0.188` |
| Service | `vllm.service` |
| Container | `spark-b-coder` |
| Image | `nvcr.io/nvidia/vllm:26.03-py3` |
| Model | `Qwen/Qwen3-Coder-Next-FP8` |
| Served model | `qwen3-coder-next-fp8` |
| max_model_len | `131072` |
| Tool parser | `qwen3_coder` |
| Role | coding/docs/test worker |

Spark2 is workflow-ready. Completion health is required before governed
runtime-dependent docs-agent dispatch; `/v1/models` alone is not enough for the
previous Spark2/vLLM crash class.

## Fallback Start

Use only in an authorized runtime task:

```bash
sudo systemctl start spark-b
```

Read-only verification, only when authorized:

```bash
curl http://192.168.0.188:8001/v1/models
```

Expected id: `qwen3-coder-next-fp8`.

## Archived Notes

The earlier Qwen3.5/DeepSeek multi-model Spark B stack and
`spark-b-start.sh` are deprecated and must not be used.
