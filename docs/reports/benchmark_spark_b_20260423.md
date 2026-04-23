# Benchmark Results — Spark B
# Datum: 23. April 2026
# Hardware: NVIDIA DGX Spark (GB10, SM12.1, 128GB Unified Memory)
# Modell: Qwen/Qwen3-Coder-30B-A3B-Instruct-FP8
# vLLM: 0.17.1 (nvcr.io/nvidia/vllm:26.03-py3)

---

## System Info

| Parameter | Wert |
|-----------|------|
| Hardware | NVIDIA DGX Spark, GB10 Grace Blackwell |
| Unified Memory | 128GB LPDDR5x |
| CUDA | 13.0 |
| Modell | Qwen/Qwen3-Coder-30B-A3B-Instruct-FP8 |
| gpu_memory_utilization | 0.55 |
| max_model_len | 100000 |

---

## Memory Usage (mit geladenem Modell)

| Ressource | Wert |
|-----------|------|
| RAM gesamt | 121 GB |
| Modell Gewichte (FP8) | ~30 GB |
| KV Cache + Overhead | ~37 GB |
| Verfügbar | ~54 GB |

---

## Test — Parallel (10 concurrent requests)

| Metrik | Wert |
|--------|------|
| Gleichzeitige Requests | 10 |
| Tokens pro Request | 200 |
| Total Tokens | 1979 |
| Wall Time | 19.51s |
| **Aggregate Throughput** | **101.4 tok/s** |
| Throughput pro Request | ~10.6 tok/s |
| Erfolgsrate | 10/10 |

```
Request 1:  200 tok / 18.81s = 10.6 tok/s  BMI Berechnung TypeScript
Request 2:  200 tok / 18.80s = 10.6 tok/s  Zod Schema MealLog
Request 3:  200 tok / 18.72s = 10.7 tok/s  Hono Route GET /diary/:date
Request 4:  200 tok / 18.70s = 10.7 tok/s  Macro Aggregation
Request 5:  200 tok / 18.63s = 10.7 tok/s  SQL Daily Nutrition Summary
Request 6:  179 tok / 17.13s = 10.4 tok/s  NutritionTarget Interface
Request 7:  200 tok / 18.64s = 10.7 tok/s  Supabase JWT Middleware
Request 8:  200 tok / 18.60s = 10.8 tok/s  Macro Percentages
Request 9:  200 tok / 18.56s = 10.8 tok/s  PostgreSQL RLS Policy
Request 10: 200 tok / 18.48s = 10.8 tok/s  Food → Nutrition Conversion
```

---

## Vergleich Spark A vs Spark B

| Metrik | Spark A (Qwen3.6-35B FP8) | Spark B (Coder-30B FP8) |
|--------|--------------------------|------------------------|
| Single tok/s | 50.4 | ~32 |
| 4x parallel tok/s | 116 | ~55 |
| 10x parallel tok/s | n/a | 101.4 |
| Rolle | Governance-Compiler | Micro-Executor |
| Speicher belegt | ~104GB | ~67GB |
| Speicher frei | ~16GB | ~54GB |

---

## Fazit

Spark B mit Qwen3-Coder-30B-FP8 ist **production-ready**.
- FP8 statt BF16: ~37GB weniger Speicher → 54GB frei für KV-Cache
- 101 tok/s aggregiert bei 10 parallelen Coding-Tasks
- Alle 10 Requests erfolgreich, keine Fehler
- Qualität: TypeScript, Zod, Hono, SQL, RLS — domänenspezifisch korrekt
