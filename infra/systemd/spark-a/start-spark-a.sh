#!/bin/bash
#
# Spark A (192.168.0.128) — Qwen3.6-35B-A3B-FP8 Orchestrator
# Container: vllm-qwen
# Image: vllm/vllm-openai:cu130-nightly
#
# Wird vom systemd-Service spark-a aufgerufen. Cleanup + foreground docker run.
# Foreground = systemd kontrolliert Lifecycle. Wenn Container endet, Service endet.

set -e

CONTAINER_NAME="vllm-qwen"
IMAGE="vllm/vllm-openai:cu130-nightly"

# Cleanup any prior instance — idempotent
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

# Foreground run — systemd attached an stdout/stderr → journalctl
exec docker run --rm \
  --name "$CONTAINER_NAME" \
  --gpus all --ipc=host \
  -p 8001:8000 \
  -v "$HOME/.cache/huggingface:/root/.cache/huggingface" \
  "$IMAGE" \
  --model Qwen/Qwen3.6-35B-A3B-FP8 \
  --served-model-name qwen3.6-35b-fp8 \
  --host 0.0.0.0 --port 8000 \
  --dtype auto \
  --kv-cache-dtype fp8 \
  --tensor-parallel-size 1 \
  --gpu-memory-utilization 0.70 \
  --max-model-len 65536 \
  --trust-remote-code \
  --enable-chunked-prefill \
  --max-num-seqs 4
