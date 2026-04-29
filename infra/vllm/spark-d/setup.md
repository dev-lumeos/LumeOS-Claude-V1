# vLLM Setup -- Spark D (Spark 4)
# Stand: 29. April 2026 | Phase 2 LIVE

**Hinweis:** Production-Setup laeuft via systemd unter `infra/systemd/spark-d/`.
Diese Datei dokumentiert den manuellen launch-cluster-Aufruf als Fallback.

---

## Hardware

- NVIDIA GB10 Grace Blackwell (DGX Spark)
- 128GB Unified Memory
- IP: 192.168.0.101
- Hostname: edgexpert-0dc8
- Port: 8001 (Container ist network=host)

---

## Aktueller Stand

| Feld | Wert |
|---|---|
| Container | `vllm_node` (managed by launch-cluster.sh) |
| Image | `vllm-node` (lokal, eugr/spark-vllm-docker MXFP4-Build) |
| Modell | `openai/gpt-oss-120b` |
| Quantization | MXFP4 (CUTLASS backend, FlashInfer attention) |
| GPU-Util | 0.70 |
| max-model-len | (Default des Modells) |
| Tool-Calling | JA (`--tool-call-parser openai`) |
| Reasoning | Aktiv aber gefiltert (`--reasoning-parser openai_gptoss`) |
| Throughput | ~59 tok/s single, ~150 tok/s @ 4-par |
| Rolle | Pipeline-Tier 2 (Senior Reviewer) |

---

## Image-Source

Custom Build aus `eugr/spark-vllm-docker`. Variante mit MXFP4-Support.
Lokal als `vllm-node-mxfp4` gebaut, dann via `docker tag` umbenannt zu
`vllm-node` damit `launch-cluster.sh` ihn findet.

```bash
# So wurde der Tag gesetzt (einmalig):
docker tag vllm-node-mxfp4 vllm-node
```

Container-Mechanik wie Spark C: `sleep infinity` Wrapper, vLLM via
`docker exec`.

---

## Manueller Start (Fallback)

Im Normalbetrieb laeuft das via systemd:
`sudo systemctl start spark-d`

Falls systemd ausfaellt:

```bash
cd /home/admin/spark-vllm-docker
./launch-cluster.sh stop 2>/dev/null

./launch-cluster.sh --solo exec \
  vllm serve openai/gpt-oss-120b \
  --tool-call-parser openai \
  --reasoning-parser openai_gptoss \
  --enable-auto-tool-choice \
  --gpu-memory-utilization 0.70 \
  --enable-prefix-caching \
  --load-format fastsafetensors \
  --quantization mxfp4 \
  --mxfp4-backend CUTLASS \
  --mxfp4-layers moe,qkv,o,lm_head \
  --attention-backend FLASHINFER \
  --kv-cache-dtype fp8 \
  --max-num-batched-tokens 8192 \
  --host 0.0.0.0 --port 8001
```

---

## MXFP4 Notes

- **Backend CUTLASS**: schneller als TRITON-Backend auf SM12.1
- **Layers moe,qkv,o,lm_head**: aggressivste Quantization, alle Hot-Layer
- **load-format fastsafetensors**: parallel-load, ~30s schneller als Default
- **attention-backend FLASHINFER**: Optimum fuer MoE-Modelle auf Blackwell

Erste Starts brauchen 90-120s wegen MXFP4 JIT + FlashInfer-Init.
Service-Timeout in systemd ist auf 600s gesetzt -- kein Problem.

---

## Reasoning-Filter (Pflicht)

GPT-OSS produziert Reasoning-Output. Im LumeOS-Adapter wird das via
`extractContentOnly()` strikt verworfen:

- `choices[].message.reasoning` -> droppen
- `choices[].message.reasoning_content` -> droppen
- Nur `choices[].message.content`

Implementiert in: `services/scheduler-api/src/vllm-adapter.ts` ->
`callGPTOSSReviewer()`. Vollregeln: `system/control-plane/RULES.md` Sektion 6.

---

## Smoke Test

```bash
# Vom Threadripper aus
curl http://192.168.0.101:8001/v1/models
```

Erwartete Antwort enthaelt `"id": "openai/gpt-oss-120b"`.

---

## Pipeline-Rolle

Spark D ist **Tier 2** der Review-Pipeline:

```
Spark C eskaliert -> Spark D (GPT-OSS)
  PASS / confidence>=0.75 -> done
  REWRITE                  -> caller re-runs worker
  ESCALATE / FAIL / invalid JSON / cannot decide -> Claude (oder HUMAN_NEEDED in V1)
```

Bei high-risk WOs (auth/rls/migration/security) **mandatory blocking** --
Spark D laeuft auch wenn Spark C PASS gegeben hat.

Vollstaendige Routing-Regeln: `system/control-plane/RULES.md` Sektion 2 + 3.

---

## TP=1 Hinweis

Aktuell laeuft Spark D mit `--tensor-parallel-size 1` (Default).
Multi-Spark TP (z.B. ueber Spark C+D) ist im eugr-Build vorbereitet
(NCCL_IB_DISABLE=0) aber fuer V1 nicht aktiviert -- Latenz-Tradeoff bei
Review-Workload nicht wert.
