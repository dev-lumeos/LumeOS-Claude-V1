#!/bin/bash
# LumeOS — Spark B Coder Test
# Testet Qwen3-Coder-Next bevor finale Entscheidung
# Aufruf: bash spark-b-coder-test.sh

set -e

HF_CACHE=~/hf-cache
VLLM_IMAGE=nvcr.io/nvidia/vllm:26.03-py3

mkdir -p $HF_CACHE

echo "=== LumeOS Spark B — Qwen3-Coder-Next Test ==="
echo ""

# Stop existing
docker stop spark-b-coder-test 2>/dev/null || true
docker rm spark-b-coder-test 2>/dev/null || true

# Qwen3-Coder-Next (80B total / 3B aktiv)
echo "Starting Qwen3-Coder-Next on Port 8001..."
docker run -d \
  --name spark-b-coder-test \
  --gpus all --ipc=host \
  -p 8001:8000 \
  -e VLLM_FLASHINFER_MOE_BACKEND=latency \
  -v $HF_CACHE:/root/.cache/huggingface \
  $VLLM_IMAGE \
  vllm serve Qwen/Qwen3-Coder-Next \
  --served-model-name qwen3-coder-next \
  --max-model-len 131072 \
  --gpu-memory-utilization 0.80 \
  --enable-auto-tool-choice \
  --tool-call-parser qwen3_coder \
  --enable-prefix-caching

echo ""
echo "Modell laedt... (~40GB Download, 10-30min)"
echo "Monitor: docker logs -f spark-b-coder-test"
echo ""
echo "Wenn ready: curl http://\$(hostname -I | awk '{print \$1}'):8001/v1/models"
