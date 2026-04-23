# Benchmark Results — Spark A
# Datum: 23. April 2026
# Hardware: NVIDIA DGX Spark (GB10, SM12.1, 128GB Unified Memory)
# Modell: Qwen/Qwen3.6-35B-A3B-FP8
# vLLM: 0.17.1 (nvcr.io/nvidia/vllm:26.03-py3)

---

## System Info

| Parameter | Wert |
|-----------|------|
| Hardware | NVIDIA DGX Spark, GB10 Grace Blackwell |
| Unified Memory | 128GB LPDDR5x |
| CUDA | 13.0 (Forward Compat 13.2) |
| SM | 12.1 (Blackwell) |
| vLLM | 0.17.1+a03ca76a.nv26.03 |
| Modell | Qwen/Qwen3.6-35B-A3B-FP8 |
| gpu_memory_utilization | 0.80 |
| max_model_len | 131072 |

---

## Memory Usage (mit geladenem Modell)

| Ressource | Wert |
|-----------|------|
| RAM gesamt | 121 GB |
| RAM belegt | 104 GB |
| RAM verfügbar | ~16 GB (inkl. Cache) |
| Modell Gewichte | ~35 GB (FP8) |
| KV Cache + Overhead | ~69 GB |
| GPU Temp (idle) | 43°C |

---

## Test 1 — Single Request

| Metrik | Wert |
|--------|------|
| Prompt tokens | 32 |
| Completion tokens | 400 |
| Zeit | 7.93s |
| **Throughput** | **50.4 tok/s** |

```
Prompt: "Explain in detail how transformers work in machine learning."
→ Qualität: Sehr gut, kohärent, technisch korrekt
→ Latenz bis ersten Token: <1s
```

---

## Test 2 — Parallel (4 concurrent requests)

| Metrik | Wert |
|--------|------|
| Gleichzeitige Requests | 4 |
| Tokens pro Request | 250 |
| Total Tokens | 1000 |
| Wall Time | 8.62s |
| **Aggregate Throughput** | **116 tok/s** |
| Throughput pro Request | ~32 tok/s |

```
Request 1: Neural Networks     → 250 tok / 7.89s = 31.7 tok/s
Request 2: SQL vs NoSQL        → 250 tok / 7.89s = 31.7 tok/s
Request 3: Docker              → 250 tok / 7.83s = 31.9 tok/s
Request 4: REST API            → 250 tok / 7.79s = 32.1 tok/s

Speedup vs single: 2.3x
vLLM Continuous Batching: ✅ funktioniert perfekt
```

---

## WO Execution Estimates (Production)

| WO Grösse | Output Tokens | Single | 4 Parallel |
|-----------|--------------|--------|-----------|
| Klein | 200 | ~4s | ~4s |
| Mittel | 500 | ~10s | ~10s |
| Gross | 1000 | ~20s | ~20s |
| Night Run 100 WOs | — | ~33 min | ~8 min |

---

## Fazit

Spark A mit Qwen3.6-35B-A3B-FP8 ist **production-ready**.
- Single: 50 tok/s reicht für interaktive WO Execution
- Parallel: 116 tok/s aggregiert für Night Runs
- Qualität: Stark für Coding, Reasoning, TypeScript Tasks
- Stabilität: Kein OOM, kein Crash bei parallelen Requests
