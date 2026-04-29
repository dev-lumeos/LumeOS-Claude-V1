# vLLM Setup â€” Spark B (Spark 2)
# Stand: 29. April 2026 | Phase 2 LIVE

**Hinweis:** Production-Setup laeuft via systemd unter `infra/systemd/spark-b/`.
Diese Datei dokumentiert den manuellen Docker-Start als Notbetriebs-Fallback.

---

## Hardware

- NVIDIA GB10 Grace Blackwell (DGX Spark)
- 128GB Unified Memory
- IP: 192.168.0.188
- Hostname: edgexpert-5862
- Port: 8001 (extern) -> 8000 (Container)

---

## Aktueller Stand

| Feld | Wert |
|---|---|
| Container | `spark-b-coder` |
| Image | `nvcr.io/nvidia/vllm:26.03-py3` (NVIDIA NGC) |
| Modell | `Qwen/Qwen3-Coder-Next-FP8` |
| Served-Model-Name | `qwen3-coder-next-fp8` |
| GPU-Util | 0.88 |
| max-model-len | 131072 |
| Tool-Calling | JA (`qwen3_coder` parser) |
| Reasoning | nicht relevant |
| Throughput | ~47 tok/s |
| Rolle | Coding Worker (micro-executor + test-agent) |

---

## Historie

- Frueherer Stack: Qwen3.5-122B-A10B-NVFP4 (Port 8002) + DeepSeek-R1-8B (Port 8013)
  -> abgeloest weil Coder-Next bessere Tool-Calling-Latency liefert und Speicher
  fuer einen einzigen MoE-Worker auf Spark B reserviert wird.
- Test-Phase: `spark-b-coder-test.sh` (historisch, Port 8001 gleich).
- `spark-b-start.sh` startet den alten Stack -> deprecated, NICHT mehr nutzen.

---

## Manueller Docker-Start (nur Fallback)

Im Normalbetrieb laeuft das via systemd:
`sudo systemctl start spark-b`

Falls systemd ausfaellt:

```bash
docker rm -f spark-b-coder 2>/dev/null

docker run -d \
  --name spark-b-coder \
  --gpus all --ipc=host \
  -p 8001:8000 \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  nvcr.io/nvidia/vllm:26.03-py3 \
  vllm serve Qwen/Qwen3-Coder-Next-FP8 \
  --served-model-name qwen3-coder-next-fp8 \
  --tensor-parallel-size 1 \
  --max-model-len 131072 \
  --gpu-memory-utilization 0.88 \
  --enable-auto-tool-choice \
  --tool-call-parser qwen3_coder \
  --enable-prefix-caching \
  --trust-remote-code
```

---

## Tool-Calling

Spark B nutzt Qwen's natives Tool-Calling:
- `--enable-auto-tool-choice` aktiviert die OpenAI-kompatible Tools-API
- `--tool-call-parser qwen3_coder` parst die `<tool_call>` Bloecke aus dem Output
- Reasoning ist hier nicht relevant -- Coder-Next erzeugt direkt Code

Im LumeOS-Adapter wird das Output-Parsing trotzdem global durch
`extractContentOnly()` abgesichert (siehe RULES.md Sektion 6).

---

## Smoke Test

```bash
# Vom Threadripper aus
curl http://192.168.0.188:8001/v1/models
```

Erwartete Antwort enthaelt `"id": "qwen3-coder-next-fp8"`.

---

## Speicher-Budget Spark B

```
Coder-Next FP8:        ~80GB
KV Cache + Overhead:   ~40GB
Reserved (System):      ~8GB
Total:                ~128GB OK
```

GPU-Util auf 0.88 ist live verifiziert. Hoeher waere riskant wegen KV-Cache-Spitzen.

---

## Wichtige Hinweise GB10 (SM12.1)

- CUDA 13.x Pflicht
- Warning "SM 12.1 > max supported 12.0" ist harmlos
- Unified Memory: 128GB geteilt zwischen CPU und GPU
- `nvidia-smi` zeigt keinen VRAM-Wert -- das ist normal

---

## Ressourcen

- https://catalog.ngc.nvidia.com/orgs/nvidia/containers/vllm
- https://huggingface.co/Qwen/Qwen3-Coder-Next-FP8
- https://forums.developer.nvidia.com/c/accelerated-computing/dgx-spark-gb10
