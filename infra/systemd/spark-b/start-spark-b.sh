#!/bin/bash
#
# Spark B (192.168.0.188) — Qwen3-Coder-Next-FP8 Worker
# Container: spark-b-coder
# Image: nvcr.io/nvidia/vllm:26.03-py3
#
# Wird vom systemd-Service spark-b aufgerufen. Cleanup + foreground docker run.
# Foreground = systemd kontrolliert Lifecycle.

set -e

CONTAINER_NAME="spark-b-coder"
IMAGE="nvcr.io/nvidia/vllm:26.03-py3"

# Cleanup any prior instance — idempotent
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

# Foreground run — systemd attached an stdout/stderr → journalctl
exec docker run --rm \
  --name "$CONTAINER_NAME" \
  --gpus all --ipc=host \
  -p 8001:8000 \
  -v "$HOME/.cache/huggingface:/root/.cache/huggingface" \
  "$IMAGE" \
  vllm serve Qwen/Qwen3-Coder-Next-FP8 \
  --served-model-name qwen3-coder-next-fp8 \
  --host 0.0.0.0 --port 8000 \
  --tensor-parallel-size 1 \
  --max-model-len 131072 \
  --gpu-memory-utilization 0.88 \
  --enable-auto-tool-choice \
  --tool-call-parser qwen3_coder \
  --enable-prefix-caching \
  --trust-remote-code
