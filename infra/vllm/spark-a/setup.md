# vLLM Setup — Offiziell NVIDIA DGX Spark
# Quelle: https://build.nvidia.com/spark/vllm/instructions
# Stand: April 2026

## Übersicht

Offizielle NVIDIA Methode: Docker Container von NGC Registry.
Image: nvcr.io/nvidia/vllm:{version}
Vorraussetzung: CUDA 13.0, SM12.1 (GB10 Blackwell)

---

## Schritt 1 — Docker Permissions

```bash
# Testen ob Docker ohne sudo läuft
docker ps

# Falls Permission Error:
sudo usermod -aG docker $USER
newgrp docker
```

---

## Schritt 2 — Container Image pullen

```bash
# Aktuelle Version von https://catalog.ngc.nvidia.com/orgs/nvidia/containers/vllm
export LATEST_VLLM_VERSION=26.03-py3

# Modell definieren
export HF_MODEL_HANDLE=Qwen/Qwen3.6-35B-A3B-FP8

# Image pullen
docker pull nvcr.io/nvidia/vllm:${LATEST_VLLM_VERSION}
```

> Für Gemma 4: `docker pull vllm/vllm-openai:gemma4-cu130`

---

## Schritt 3 — vLLM testen (quick test)

```bash
# Kurzer Test mit kleinem Modell
docker run -it --gpus all -p 8000:8000 \
  nvcr.io/nvidia/vllm:${LATEST_VLLM_VERSION} \
  vllm serve ${HF_MODEL_HANDLE}

# In zweitem Terminal testen:
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen3.6-35B-A3B-FP8",
    "messages": [{"role": "user", "content": "12*17"}],
    "max_tokens": 50
  }'
# Erwartete Antwort: 204
```

---

## Schritt 4 — Production Setup (LumeOS)

### Spark A — fp8_bulk (Port 8001)

```bash
mkdir -p ~/hf-cache

docker run -d \
  --name spark-a-bulk \
  --gpus all --ipc=host \
  --restart unless-stopped \
  -p 8001:8000 \
  -e VLLM_FLASHINFER_MOE_BACKEND=latency \
  -v ~/hf-cache:/root/.cache/huggingface \
  nvcr.io/nvidia/vllm:26.03-py3 \
  vllm serve Qwen/Qwen3.6-35B-A3B-FP8 \
  --served-model-name qwen3.6-35b-fp8 \
  --max-model-len 131072 \
  --gpu-memory-utilization 0.80 \
  --reasoning-parser qwen3 \
  --enable-auto-tool-choice \
  --tool-call-parser qwen3_coder \
  --enable-prefix-caching
```

### Spark A — fp4_light Gemma 4 4B (Port 8011)

```bash
docker run -d \
  --name spark-a-light-gemma \
  --gpus all --ipc=host \
  --restart unless-stopped \
  -p 8011:8000 \
  -v ~/hf-cache:/root/.cache/huggingface \
  vllm/vllm-openai:gemma4-cu130 \
  google/gemma-4-4b-it \
  --served-model-name gemma4-4b \
  --max-model-len 131072 \
  --gpu-memory-utilization 0.12
```

---

## Smoke Test von Threadripper (Windows)

```powershell
# Spark A bulk
curl http://192.168.0.128:8001/v1/models

# Spark A light
curl http://192.168.0.128:8011/v1/models
```

---

## Wichtige Hinweise GB10 (SM12.1)

- CUDA 13.x Pflicht — CUDA 12.x funktioniert NICHT auf GB10
- `VLLM_FLASHINFER_MOE_BACKEND=latency` setzen (throughput hat SM120 Bug)
- Warning "SM 12.1 > max supported 12.0" ist harmlos — ignorieren
- Unified Memory: 128GB geteilt zwischen CPU und GPU (kein separater VRAM)
- `nvidia-smi` zeigt keinen VRAM-Wert — das ist normal

## Ressourcen

- https://build.nvidia.com/spark/vllm
- https://catalog.ngc.nvidia.com/orgs/nvidia/containers/vllm
- https://forums.developer.nvidia.com/c/accelerated-computing/dgx-spark-gb10
