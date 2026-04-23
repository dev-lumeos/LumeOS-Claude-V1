#!/bin/bash
# LumeOS — Spark B Startup Script
# Modelle: quality (Port 8002) + review (Port 8013)
# Aufruf: bash spark-b-start.sh

set -e

HF_CACHE=~/hf-cache
VLLM_IMAGE=nvcr.io/nvidia/vllm:26.03-py3

mkdir -p $HF_CACHE

echo "=== LumeOS Spark B Startup ==="
echo "HF Cache: $HF_CACHE"
echo ""

# Stop existing containers if running
echo "[1/3] Stopping existing containers..."
docker stop spark-b-quality spark-b-review 2>/dev/null || true
docker rm spark-b-quality spark-b-review 2>/dev/null || true

# quality — Qwen3.5-122B-A10B NVFP4 (Port 8002) — Orchestrator Node
echo "[2/3] Starting quality: Qwen3.5-122B-A10B on Port 8002..."
docker run -d \
  --name spark-b-quality \
  --gpus all --ipc=host \
  --restart unless-stopped \
  -p 8002:8000 \
  -e VLLM_FLASHINFER_MOE_BACKEND=latency \
  -v $HF_CACHE:/root/.cache/huggingface \
  $VLLM_IMAGE \
  vllm serve RedHatAI/Qwen3.5-122B-A10B-NVFP4 \
  --served-model-name qwen35-122b-quality \
  --max-model-len 131072 \
  --gpu-memory-utilization 0.65 \
  --reasoning-parser qwen3 \
  --enable-auto-tool-choice \
  --tool-call-parser qwen3_coder \
  --enable-prefix-caching

echo "  → spark-b-quality started (Orchestrator — Slot 3 reserviert)"
echo ""

# review — DeepSeek-R1 8B distill (Port 8013)
echo "[3/3] Starting review: DeepSeek-R1-8B on Port 8013..."
docker run -d \
  --name spark-b-review \
  --gpus all --ipc=host \
  --restart unless-stopped \
  -p 8013:8000 \
  -e VLLM_FLASHINFER_MOE_BACKEND=latency \
  -v $HF_CACHE:/root/.cache/huggingface \
  $VLLM_IMAGE \
  vllm serve deepseek-ai/DeepSeek-R1-Distill-Qwen-8B \
  --served-model-name deepseek-r1-8b-review \
  --max-model-len 131072 \
  --gpu-memory-utilization 0.10 \
  --reasoning-parser deepseek_r1

echo "  → spark-b-review started"
echo ""

echo "=== Spark B Startup Complete ==="
echo ""
echo "Endpoints:"
echo "  quality: http://$(hostname -I | awk '{print $1}'):8002/v1/models"
echo "  review:  http://$(hostname -I | awk '{print $1}'):8013/v1/models"
echo ""
echo "WICHTIG: Spark B Slot 3 ist fuer Orchestrator reserviert!"
echo "         Max 2 Worker-WOs parallel auf Spark B."
echo ""
echo "Monitor logs:"
echo "  docker logs -f spark-b-quality"
echo "  docker logs -f spark-b-review"
