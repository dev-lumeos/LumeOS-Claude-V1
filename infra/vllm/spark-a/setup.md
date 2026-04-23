# vLLM Setup — Spark A (Throughput Node)

## Hardware
- NVIDIA GB10 Grace Blackwell (DGX Spark)
- 128GB Unified Memory
- SM12.1 (Blackwell)
- vLLM: cu130-nightly (für GB10/SM12.1)

## Modelle

### fp8_bulk — Qwen3.6-35B-A3B FP8 (Port 8001)
```bash
docker run -d \
  --name qwen36-35b-fp8 \
  --restart unless-stopped \
  --gpus all \
  --ipc host \
  --shm-size 64gb \
  -p 8001:8000 \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  vllm/vllm-openai:cu130-nightly \
  Qwen/Qwen3.6-35B-A3B-FP8 \
  --served-model-name qwen3.6-35b-fp8 \
  --max-model-len 131072 \
  --gpu-memory-utilization 0.80 \
  --reasoning-parser qwen3 \
  --enable-auto-tool-choice \
  --tool-call-parser qwen3_coder \
  --enable-prefix-caching \
  --speculative-config '{"method": "mtp", "num_speculative_tokens": 2}'
```

### fp4_light — Gemma 4 4B NVFP4 (Port 8011)
```bash
docker run -d \
  --name gemma4-4b \
  --restart unless-stopped \
  --gpus all \
  --ipc host \
  --shm-size 16gb \
  -p 8011:8000 \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  vllm/vllm-openai:cu130-nightly \
  google/gemma-4-4b-it \
  --served-model-name gemma4-4b \
  --max-model-len 262144 \
  --gpu-memory-utilization 0.15
```

### fp4_light — Phi-4 Mini NVFP4 (Port 8012)
```bash
docker run -d \
  --name phi4-mini \
  --restart unless-stopped \
  --gpus all \
  --ipc host \
  --shm-size 16gb \
  -p 8012:8000 \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  vllm/vllm-openai:cu130-nightly \
  microsoft/phi-4-mini-instruct \
  --served-model-name phi4-mini \
  --max-model-len 131072 \
  --gpu-memory-utilization 0.10
```

## Smoke Test
```bash
curl http://localhost:8001/v1/models
curl http://localhost:8011/v1/models
curl http://localhost:8012/v1/models
```
