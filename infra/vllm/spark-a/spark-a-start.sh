#!/bin/bash
# LumeOS — Spark A Startup Script
# Modelle: fp8_bulk (Port 8001) + fp4_light Gemma (Port 8011) + fp4_light Phi (Port 8012)
# Aufruf: bash spark-a-start.sh

set -e

HF_CACHE=~/hf-cache
VLLM_IMAGE=nvcr.io/nvidia/vllm:26.03-py3
GEMMA_IMAGE=vllm/vllm-openai:gemma4-cu130

mkdir -p $HF_CACHE

echo "=== LumeOS Spark A Startup ==="
echo "HF Cache: $HF_CACHE"
echo ""

# Stop existing containers if running
echo "[1/3] Stopping existing containers..."
docker stop spark-a-bulk spark-a-light-gemma spark-a-light-phi 2>/dev/null || true
docker rm spark-a-bulk spark-a-light-gemma spark-a-light-phi 2>/dev/null || true

# fp8_bulk — Qwen3.6-35B-A3B-FP8 (Port 8001)
echo "[2/3] Starting fp8_bulk: Qwen3.6-35B-A3B-FP8 on Port 8001..."
docker run -d \
  --name spark-a-bulk \
  --gpus all --ipc=host \
  --restart unless-stopped \
  -p 8001:8000 \
  -e VLLM_FLASHINFER_MOE_BACKEND=latency \
  -v $HF_CACHE:/root/.cache/huggingface \
  $VLLM_IMAGE \
  vllm serve Qwen/Qwen3.6-35B-A3B-FP8 \
  --served-model-name qwen3.6-35b-fp8 \
  --max-model-len 131072 \
  --gpu-memory-utilization 0.80 \
  --reasoning-parser qwen3 \
  --enable-auto-tool-choice \
  --tool-call-parser qwen3_coder \
  --enable-prefix-caching

echo "  → spark-a-bulk started (download may take 10-30min first run)"
echo ""

echo "[3/3] Spark A startup complete."
echo ""
echo "Endpoints:"
echo "  fp8_bulk:   http://$(hostname -I | awk '{print $1}'):8001/v1/models"
echo ""
echo "Monitor logs:"
echo "  docker logs -f spark-a-bulk"
