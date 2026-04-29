#!/bin/bash
#
# Spark C (192.168.0.99) — google/gemma-4-26B-A4B-it Fast Reviewer
# Container: vllm_node (managed by launch-cluster.sh)
# Image: vllm-node (lokal gebaut aus eugr/spark-vllm-docker)
#
# Wird vom systemd-Service spark-c aufgerufen. Pre-cleanup + foreground exec.
# launch-cluster.sh exec blockt solange vLLM läuft.

set -e

REPO_DIR="/home/admin/spark-vllm-docker"

cd "$REPO_DIR"

# Cleanup any prior instance — idempotent
./launch-cluster.sh stop 2>/dev/null || true

# Foreground exec — systemd attached an stdout/stderr → journalctl
# Wenn vLLM crashes, exec returnt → systemd Restart=always greift
exec ./launch-cluster.sh --solo exec \
  vllm serve google/gemma-4-26B-A4B-it \
  --port 8001 \
  --host 0.0.0.0 \
  --gpu-memory-utilization 0.7 \
  --load-format instanttensor \
  --quantization fp8 \
  --kv-cache-dtype fp8 \
  --max-model-len 65536 \
  --max-num-batched-tokens 8192 \
  --enable-prefix-caching \
  --enable-auto-tool-choice \
  --tool-call-parser gemma4 \
  --reasoning-parser gemma4
