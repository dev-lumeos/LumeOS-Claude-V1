# vLLM Setup -- Spark C (Spark 3)
# Stand: 29. April 2026 | Phase 2 LIVE

**Hinweis:** Production-Setup laeuft via systemd unter `infra/systemd/spark-c/`.
Diese Datei dokumentiert den manuellen launch-cluster-Aufruf als Fallback.

---

## Hardware

- NVIDIA GB10 Grace Blackwell (DGX Spark)
- 128GB Unified Memory
- IP: 192.168.0.99
- Hostname: edgexpert-509d
- Port: 8001 (Container ist network=host)

---

## Aktueller Stand

| Feld | Wert |
|---|---|
| Container | `vllm_node` (managed by launch-cluster.sh) |
| Image | `vllm-node` (lokal, eugr/spark-vllm-docker Custom Build) |
| Modell | `google/gemma-4-26B-A4B-it` |
| GPU-Util | 0.7 |
| max-model-len | 65536 |
| Tool-Calling | JA (`--tool-call-parser gemma4`) |
| Reasoning | Aktiv aber gefiltert (`--reasoning-parser gemma4`) |
| Throughput | ~35 tok/s single, ~180 tok/s @ 8-par |
| Rolle | Pipeline-Tier 1 (Fast Reviewer) |

---

## Image-Source

Custom Build aus `eugr/spark-vllm-docker`. Lokal getaggt als `vllm-node`.
Der Container ist ein `sleep infinity` Wrapper -- vLLM laeuft via
`docker exec vllm_node bash -c "vllm serve ..."`.

Das ist die Konsequenz aus dem `launch-cluster.sh --solo exec` Aufruf:
1. Container `vllm_node` startet (sleep infinity)
2. `docker exec` in den Container, `vllm serve ...` als Foreground-Prozess
3. Wenn vLLM endet, returnt `docker exec` -> Container-Cleanup via `--rm`

Das Repo liegt auf dem Spark unter `/home/admin/spark-vllm-docker/`.

---

## Manueller Start (Fallback)

Im Normalbetrieb laeuft das via systemd:
`sudo systemctl start spark-c`

Falls systemd ausfaellt:

```bash
cd /home/admin/spark-vllm-docker
./launch-cluster.sh stop 2>/dev/null

./launch-cluster.sh --solo exec \
  vllm serve google/gemma-4-26B-A4B-it \
  --port 8001 --host 0.0.0.0 \
  --gpu-memory-utilization 0.7 \
  --load-format instanttensor \
  --quantization fp8 \
  --kv-cache-dtype fp8 \
  --max-model-len 65536 \
  --max-num-batched-tokens 8192 \
  --enable-prefix-caching \
  --enable-auto-tool-choice \
  --tool-call-parser gemma4 \
  --reasoning-parser gemma4
```

---

## Reasoning-Filter (Pflicht)

Gemma 4 produziert Reasoning-Output. Im LumeOS-Adapter wird das via
`extractContentOnly()` strikt verworfen:

- `choices[].message.reasoning` -> droppen
- `choices[].message.reasoning_content` -> droppen
- Nur `choices[].message.content`

Implementiert in: `services/scheduler-api/src/vllm-adapter.ts` ->
`callGemmaReviewer()`. Vollregeln: `system/control-plane/RULES.md` Sektion 6.

---

## Smoke Test

```bash
# Vom Threadripper aus
curl http://192.168.0.99:8001/v1/models
```

Erwartete Antwort enthaelt `"id": "google/gemma-4-26B-A4B-it"`.

---

## Pipeline-Rolle

Spark C ist **Tier 1** der Review-Pipeline:

```
Worker-Output -> Spark C (Gemma 4)
  PASS / confidence>=0.75 -> done
  REWRITE                  -> caller re-runs worker
  ESCALATE / confidence<0.75 / invalid JSON -> Spark D (Tier 2)
  high-risk category       -> non-blocking, Spark D laeuft trotzdem
```

Vollstaendige Routing-Regeln: `system/control-plane/RULES.md` Sektion 2.

---

## Wichtige Hinweise

- launch-cluster.sh Repo (eugr) hat eigenen vLLM-Build mit FlashInfer-Patches
  und MoE-spezifischen Optimierungen. NICHT durch den NGC-Container ersetzbar.
- Erste Starts brauchen 60-90s wegen JIT-Compile und FlashInfer-Init
- Bei Container-Crash: `docker rm -f vllm_node` vor Restart
