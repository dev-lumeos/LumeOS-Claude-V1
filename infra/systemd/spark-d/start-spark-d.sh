#!/bin/bash
#
# Spark D (192.168.0.101) — openai/gpt-oss-120b Senior Reviewer
# Container: vllm_node (managed by launch-cluster.sh)
# Image: vllm-node (lokal gebaut aus eugr/spark-vllm-docker, MXFP4-Build)
#
# Wird vom systemd-Service spark-d aufgerufen. Pre-cleanup + foreground exec.

set -e

REPO_DIR="/home/admin/spark-vllm-docker"

cd "$REPO_DIR"

# Cleanup any prior instance — idempotent
./launch-cluster.sh stop 2>/dev/null || true

# Foreground exec — systemd attached an stdout/stderr → journalctl
# GPT-OSS 120B mit MXFP4 + FlashInfer + CUTLASS Backend
exec ./launch-cluster.sh --solo exec \
  vllm serve openai/gpt-oss-120b \
  --tool-call-parser openai \
  --reasoning-parser openai_gptoss \
  --enable-auto-tool-choice \
  --gpu-memory-utilization 0.70 \
  --enable-prefix-caching \
  --load-format fastsafetensors \
  --quantization mxfp4 \
  --mxfp4-backend CUTLASS \
  --mxfp4-layers moe,qkv,o,lm_head \
  --attention-backend FLASHINFER \
  --kv-cache-dtype fp8 \
  --max-num-batched-tokens 8192 \
  --host 0.0.0.0 \
  --port 8001
