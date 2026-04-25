# Model Registry V2 — LumeOS

# Status: AKTUELL — 25. April 2026

# Vorherige Version: model_registry_v1.md (veraltet, falsche Modell-Zuweisungen)

---

## Live Stack (aktuell)

### Spark A — Governance Layer

ParameterWertIP192.168.0.128Port8001ModellQwen/Qwen3.6-35B-A3B-FP8served-model-nameqwen3.6-35b-fp8max_model_len131072gpu_memory_utilization0.75RolleGovernance Compiler (Port 9003)Temp0.3 (Governance) / 0.0 Seed=42 (Execution)Status✅ LIVE

### Spark B — Execution Layer

ParameterWertIP192.168.0.188Port8001ModellQwen/Qwen3-Coder-30B-A3B-Instruct-FP8served-model-nameqwen3-coder-30bmax_model_len100000gpu_memory_utilization0.55RolleMicro-Executor (Temp=0.0, Seed=42)Status✅ LIVE

### Spark C — Orchestrator / Bulk (COMING)

ParameterWertModellQwen3.5-122B-A10B NVFP4RolleOrchestrator (Port 9005) + Bulk ExecutionMax Slots8 parallelStatus🔜 Bestellt

### Spark D — Specialist / QA (COMING)

ParameterWertModellQwen3-Coder-NextRolleDB-Check, Acceptance Verifier, QAMax Slots4 parallelStatus🔜 Bestellt

---

## vLLM Start Commands

### Spark A

```bash
docker run -d \
  --name spark-a-governance \
  --gpus all --ipc=host \
  --restart unless-stopped \
  -p 8001:8000 \
  -e VLLM_FLASHINFER_MOE_BACKEND=latency \
  -v ~/hf-cache:/root/.cache/huggingface \
  nvcr.io/nvidia/vllm:26.03-py3 \
  vllm serve Qwen/Qwen3.6-35B-A3B-FP8 \
  --served-model-name qwen3.6-35b \
  --max-model-len 131072 \
  --gpu-memory-utilization 0.75 \
  --enable-prefix-caching
```

### Spark B

```bash
docker run -d \
  --name spark-b-coder \
  --gpus all --ipc=host \
  --restart unless-stopped \
  -p 8001:8000 \
  -e VLLM_FLASHINFER_MOE_BACKEND=latency \
  -v ~/hf-cache:/root/.cache/huggingface \
  nvcr.io/nvidia/vllm:26.03-py3 \
  vllm serve Qwen/Qwen3-Coder-30B-A3B-Instruct-FP8 \
  --served-model-name qwen3-coder-30b \
  --max-model-len 100000 \
  --gpu-memory-utilization 0.55 \
  --enable-auto-tool-choice \
  --tool-call-parser qwen3_coder \
  --enable-prefix-caching
```

---

## Performance (gemessen 23. April 2026)

MetrikSpark ASpark BSingle50.4 tok/s\~32 tok/s4× parallel116 tok/s\~55 tok/s10× paralleln/a101.4 tok/sGPU Temp (Last)68°C\~70°CPrefix Cache Hit65%65%

---

## Wichtige vLLM Hinweise

- `VLLM_FLASHINFER_MOE_BACKEND=latency` IMMER setzen — throughput hat SM120 Bug
- Warnung "SM 12.1 &gt; max supported 12.0" ist harmlos
- Spark B: `max_model_len 100000` (nicht 131072) — KV Cache zu knapp bei 131072
- Nach System-Update auf Spark: **Reboot nötig** damit CUDA Forward Compatibility aktiv wird
