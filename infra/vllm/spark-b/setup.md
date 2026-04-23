# vLLM Setup — Spark B (Quality / Orchestrator Node)

## Hardware
- NVIDIA GB10 Grace Blackwell (DGX Spark)
- 128GB Unified Memory
- Slot 3 immer für Orchestrator reserviert (max_slots: 3)

## Modelle

### quality — Qwen3.5-122B-A10B NVFP4 (Port 8002)
```bash
docker run -d \
  --name qwen35-122b-nvfp4 \
  --restart unless-stopped \
  --gpus all \
  --ipc host \
  --shm-size 64gb \
  -p 8002:8000 \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  vllm/vllm-openai:cu130-nightly \
  RedHatAI/Qwen3.5-122B-A10B-NVFP4 \
  --served-model-name qwen35-122b-quality \
  --max-model-len 131072 \
  --gpu-memory-utilization 0.65 \
  --reasoning-parser qwen3 \
  --enable-auto-tool-choice \
  --tool-call-parser qwen3_coder \
  --enable-prefix-caching
```

### review — DeepSeek-R1 8B distill NVFP4 (Port 8013)
```bash
docker run -d \
  --name deepseek-r1-8b \
  --restart unless-stopped \
  --gpus all \
  --ipc host \
  --shm-size 16gb \
  -p 8013:8000 \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  vllm/vllm-openai:cu130-nightly \
  deepseek-ai/DeepSeek-R1-Distill-Qwen-8B \
  --served-model-name deepseek-r1-8b-review \
  --max-model-len 131072 \
  --gpu-memory-utilization 0.10 \
  --reasoning-parser deepseek_r1
```

## Speicher-Budget Spark B
```
Qwen3.5-122B NVFP4:  ~75GB
DeepSeek-R1 8B:       ~8GB
KV Cache + Overhead: ~45GB
Total:               ~128GB ✅
```

## Smoke Test
```bash
curl http://localhost:8002/v1/models
curl http://localhost:8013/v1/models
```

## Wichtig
Slot 3 auf Spark B ist permanent für den Orchestrator (qwen35-122b-quality) reserviert.
Nie alle 3 Slots für Worker-WOs verwenden.
