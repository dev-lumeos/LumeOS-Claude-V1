# Hardware Stack — Korrigierte Speicher-Schätzungen

## Gemessene/recherchierte Werte (Stand April 2026)

| Model | Format | Geplant | Realistisch | Status |
|---|---|---|---|---|
| Nemotron 3 Super 120B | NVFP4 | ~45 GB | **~70 GB** | Gemessen: 69.54 GiB vLLM |
| Qwen3.6-35B-A3B | FP8 | ~35 GB | **~35 GB** | Plausibel |
| Qwen3-Coder-Next | FP8 | 80.4 GB | **~75 GB** | Community DGX Spark ~75GB |
| DeepSeek-R1 70B | NVFP4 | ~35 GB | **~35-40 GB** | Plausibel |
| Qwen3-VL 30B-A3B | FP8 | ~30 GB | **~30 GB** | Plausibel |
| MiniMax M2.7 NVFP4 ½ | NVFP4 | ~65 GB | **TBD** | Kein Benchmark |

## Warum Nemotron so viel größer als erwartet
Mixed precision: NVFP4 für die meisten Layers, aber BF16/MXFP8 für:
- Latent Projections
- MTP (Multi-Token Prediction) Layers
- QKV/Attention Projections
- Embeddings
Dazu: Mamba SSM States in float32

NVIDIA gibt offiziell >= 80 GB VRAM für NVFP4 an.

## Aktueller Deployment-Stand

| Node | IP | Port | Modell | Status |
|---|---|---|---|---|
| Spark 1 | 192.168.0.128 | 8001 | Nemotron 3 Super NVFP4 (alleine, 0.90) | ✅ Running |
| Spark 2 | 192.168.0.188 | 8001 | Qwen3-Coder-Next FP8 (0.80) | 🔄 Lädt |
| Qwen3.6-35B | — | — | Offline | Placement: Spark 3 oder 4 |

## Spark 2 Empfehlung
--gpu-memory-utilization 0.80 (nicht 0.88/0.90) — Community berichtet OOM nach Stunden bei 0.90
~43 tok/s auf DGX Spark laut Community-Benchmarks
