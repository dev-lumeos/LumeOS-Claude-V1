#!/bin/bash
#
# Spark C / DGX3 (192.168.0.99) - Nemotron reviewer/specialist candidate
# Host: edgexpert-509d
# Container: vllm_node
# Image: vllm/vllm-openai:v0.20.0-aarch64-cu130-ubuntu2404
# Model: nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4
#
# WARNING:
# This repository copy is a reference wrapper. Verify the remote
# /etc/systemd/system/vllm.service and actual container before deploying.
# Do not use the retired Gemma4 launch path.

set -e

MODEL_PATH="/root/.cache/huggingface/local-models/nvidia-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4"
IMAGE="vllm/vllm-openai:v0.20.0-aarch64-cu130-ubuntu2404"
CONTAINER_NAME="vllm_node"

docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

exec docker run --rm \
  --name "$CONTAINER_NAME" \
  --gpus all \
  --ipc=host \
  --network host \
  -v /root/.cache/huggingface:/root/.cache/huggingface \
  "$IMAGE" \
  --model "$MODEL_PATH" \
  --host 0.0.0.0 \
  --port 8001 \
  --max-model-len 65536 \
  --gpu-memory-utilization 0.70 \
  --enable-prefix-caching \
  --trust-remote-code
