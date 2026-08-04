#!/bin/bash
# start-nemotron-spark-a.sh
# Startet Nemotron 3 Super NVFP4 auf Spark A (192.168.0.128) Port 8002
# Qwen3.6 läuft bereits auf Port 8001
#
# Usage: ssh user@192.168.0.128 "bash /path/to/start-nemotron-spark-a.sh"
# Oder direkt auf Spark A ausführen.

set -e

MODEL="nvidia/Nemotron-Super-49B-v1"
PORT=8002
GPU_MEM=0.45          # ~45GB von 128GB — lässt Qwen3.6 (8001) 35GB
MAX_LEN=131072        # 128K Context
TP_SIZE=1             # DGX Spark = 1 GB10 GPU

echo "================================================"
echo "  Nemotron 3 Super NVFP4 — Spark A Port $PORT"
echo "================================================"
echo ""

# Prüfe ob bereits läuft
if curl -s --max-time 2 http://localhost:$PORT/v1/models > /dev/null 2>&1; then
  echo "✅ Nemotron läuft bereits auf Port $PORT"
  curl -s http://localhost:$PORT/v1/models | python3 -m json.tool
  exit 0
fi

echo "Starte vLLM Server..."
echo "  Modell:  $MODEL"
echo "  Port:    $PORT"
echo "  Context: $MAX_LEN tokens"
echo "  GPU Mem: $GPU_MEM (${GPU_MEM}% von 128GB = ~57GB ceiling)"
echo ""

vllm serve "$MODEL" \
  --port "$PORT" \
  --tensor-parallel-size "$TP_SIZE" \
  --quantization nvfp4 \
  --max-model-len "$MAX_LEN" \
  --gpu-memory-utilization "$GPU_MEM" \
  --trust-remote-code \
  --enable-prefix-caching \
  --reasoning-parser nemotron \
  --served-model-name "nemotron-super-49b-nvfp4" \
  2>&1

# Erreichbarkeit prüfen (wenn du im Vordergrund läuft + Ctrl+C drückst, wird das nicht erreicht)
echo ""
echo "Nemotron gestartet. Health Check:"
curl -s http://localhost:$PORT/v1/models | python3 -m json.tool
