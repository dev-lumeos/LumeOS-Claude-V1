# vLLM Setup — Spark A (Spark 1)
# Stand: 29. April 2026 | Phase 2 LIVE

**Hinweis:** Production-Setup läuft via systemd unter `infra/systemd/spark-a/`.
Diese Datei dokumentiert den manuellen Docker-Start als Notbetriebs-Fallback.

---

## Hardware

- NVIDIA GB10 Grace Blackwell (DGX Spark)
- 128GB Unified Memory (kein separater VRAM, `nvidia-smi` zeigt keinen VRAM-Wert)
- IP: 192.168.0.128
- Hostname: edgexpert-1116
- Port: 8001 (extern) → 8000 (Container)

---

## Aktueller Stand

| Feld | Wert |
|---|---|
| Container | `vllm-qwen` |
| Image | `vllm/vllm-openai:cu130-nightly` (Community Nightly) |
| Modell | `Qwen/Qwen3.6-35B-A3B-FP8` |
| Served-Model-Name | `qwen3.6-35b-fp8` |
| GPU-Util | 0.70 |
| max-model-len | 65536 |
| KV-Cache dtype | fp8 |
| Tool-Calling | NEIN (kein Parser) |
| Reasoning | Aus via `enable_thinking=false` (Pflicht) |
| Throughput | ~50 tok/s single, ~116 tok/s @ 4-par |
| Rolle | Orchestrator + WO-Validator |

---

## Manueller Docker-Start (nur Fallback)

Im Normalbetrieb läuft das via systemd:
`sudo systemctl start spark-a`

Falls systemd ausfällt oder Recovery nötig ist:

```bash
docker rm -f vllm-qwen 2>/dev/null

docker run -d \
  --name vllm-qwen \
  --gpus all --ipc=host \
  -p 8001:8000 \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  vllm/vllm-openai:cu130-nightly \
  --model Qwen/Qwen3.6-35B-A3B-FP8 \
  --served-model-name qwen3.6-35b-fp8 \
  --dtype auto \
  --kv-cache-dtype fp8 \
  --tensor-parallel-size 1 \
  --gpu-memory-utilization 0.70 \
  --max-model-len 65536 \
  --trust-remote-code \
  --enable-chunked-prefill \
  --max-num-seqs 4
```

---

## Qwen3.6 Pflichtregeln (siehe RULES.md Sektion 6)

JEDER Request an diesen Spark muss enthalten:

```json
{
  "chat_template_kwargs": { "enable_thinking": false },
  "temperature": 0.0
}
```

- `/no_think` im Prompt funktioniert NICHT — nur `chat_template_kwargs` wirkt
- Nur `message.content` auswerten — `reasoning_content` strikt ignorieren
- Leerer Content → FAIL

Implementiert in: `services/scheduler-api/src/vllm-adapter.ts` →
`callQwen36Orchestrator()`.

---

## Smoke Test

```bash
# Vom Threadripper aus
curl http://192.168.0.128:8001/v1/models
```

Erwartete Antwort enthält `"id": "qwen3.6-35b-fp8"`.

---

## Wichtige Hinweise GB10 (SM12.1)

- CUDA 13.x Pflicht — CUDA 12.x funktioniert NICHT auf GB10
- Warning "SM 12.1 > max supported 12.0" ist harmlos — ignorieren
- Unified Memory: 128GB geteilt zwischen CPU und GPU
- `nvidia-smi` zeigt keinen VRAM-Wert — das ist normal

---

## Ressourcen

- https://build.nvidia.com/spark/vllm
- https://catalog.ngc.nvidia.com/orgs/nvidia/containers/vllm
- https://forums.developer.nvidia.com/c/accelerated-computing/dgx-spark-gb10
