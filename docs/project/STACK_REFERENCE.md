# LUMEOS — Stack & Architecture Reference
# Stand: 29. April 2026 | Phase 2 LIVE (alle 4 Sparks aktiv)

---

## Hardware

| Node | IP | Port | Modell | Rolle | Throughput | Status |
|---|---|---|---|---|---|---|
| Spark 1 (A) | 192.168.0.128 | 8001 | Qwen3.6-35B-A3B FP8 | Orchestrator + WO-Validator | ~50 single / 116 par-4 tok/s | LIVE |
| Spark 2 (B) | 192.168.0.188 | 8001 | Qwen3-Coder-Next FP8 | Coding Worker | ~47 tok/s | LIVE |
| Spark 3 (C) | 192.168.0.99 | 8001 | google/gemma-4-26B-A4B-it | Fast Reviewer (Pipeline-Tier 1) | ~35 single / 180 par-8 tok/s | LIVE |
| Spark 4 (D) | 192.168.0.101 | 8001 | openai/gpt-oss-120b MXFP4 | Senior Reviewer (Pipeline-Tier 2) | ~59 single / 150 par-4 tok/s | LIVE |
| RTX 5090 | localhost | 8001 | Qwen3-VL 30B FP8 | MealCam Vision | TBD | geplant |
| Escalation | — | — | Claude Sonnet/Opus (Max 200) | Senior Coding (selten) | — | aktiv |

---

## Image-Sources (Inkonsistenz dokumentiert)

| Spark | Image | Quelle | Hinweis |
|---|---|---|---|
| Spark 1 | `vllm/vllm-openai:cu130-nightly` | Community Nightly | Stable für Qwen3.6 |
| Spark 2 | `nvcr.io/nvidia/vllm:26.03-py3` | NVIDIA NGC | Stable, qwen3_coder Tool-Parser |
| Spark 3 | `vllm-node` (lokal) | eugr/spark-vllm-docker Custom Build | `--load-format instanttensor` |
| Spark 4 | `vllm-node` (lokal, MXFP4-Build) | eugr/spark-vllm-docker Custom Build | MXFP4 + FlashInfer + CUTLASS |

---

## Tool-Calling Status pro Spark

| Spark | Tool-Calling | Reasoning | Parser / Notes |
|---|---|---|---|
| Spark 1 (Qwen3.6) | NEIN | Aus (`enable_thinking: false` Pflicht) | Reines Output-Parsing |
| Spark 2 (Coder-Next) | JA | — | `--tool-call-parser qwen3_coder` |
| Spark 3 (Gemma 4) | JA | Aktiv aber gefiltert | `--tool-call-parser gemma4 --reasoning-parser gemma4` |
| Spark 4 (GPT-OSS) | JA | Aktiv aber gefiltert | `--tool-call-parser openai --reasoning-parser openai_gptoss` |

---

## Spark Configs

Persistente Setups via systemd unter `infra/systemd/spark-{a,b,c,d}/`. Die manuellen
Befehle hier sind als Notbetriebs-Fallback dokumentiert.

### Spark 1 (Spark A) — Docker Start

```bash
docker run -d --name vllm-qwen \
  --gpus all --ipc=host -p 8001:8000 \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  vllm/vllm-openai:cu130-nightly \
  --model Qwen/Qwen3.6-35B-A3B-FP8 \
  --served-model-name qwen3.6-35b-fp8 \
  --dtype auto --kv-cache-dtype fp8 \
  --gpu-memory-utilization 0.70 \
  --max-model-len 65536 \
  --trust-remote-code \
  --enable-chunked-prefill --max-num-seqs 4
```

### Spark 2 (Spark B) — Docker Start

```bash
docker run -d --name spark-b-coder \
  --gpus all --ipc=host -p 8001:8000 \
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

### Spark 3 (Spark C) — launch-cluster.sh

Custom Build (eugr/spark-vllm-docker). Container `vllm_node` ist `sleep infinity`
Wrapper, vLLM läuft als `docker exec` Subprocess innen.

```bash
cd /home/admin/spark-vllm-docker
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

### Spark 4 (Spark D) — launch-cluster.sh

Wie Spark 3, aber MXFP4-Build (`vllm-node-mxfp4` getagged zu `vllm-node`).

```bash
cd /home/admin/spark-vllm-docker
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

## Agent Routing

| Agent | Node | Modell | Zweck |
|---|---|---|---|
| orchestrator-agent | spark-a | qwen3.6-35b-fp8 | Dispatch + Monitor |
| pre-review-agent | spark-a | qwen3.6-35b-fp8 | Vollständigkeit prüfen |
| post-review-agent | spark-a | qwen3.6-35b-fp8 | Output validieren |
| review-agent | spark-a | qwen3.6-35b-fp8 | Governance Validation |
| governance-compiler | spark-a | qwen3.6-35b-fp8 | Macro-WO → Artefakt |
| security-specialist | spark-a | qwen3.6-35b-fp8 | Security Audits |
| db-migration-agent | spark-a | qwen3.6-35b-fp8 | Schema Changes |
| micro-executor | spark-b | qwen3-coder-next-fp8 | TypeScript Patches |
| test-agent | spark-b | qwen3-coder-next-fp8 | Tests |
| fast-reviewer-agent | spark-c | google/gemma-4-26B-A4B-it | Pipeline-Tier 1 (Quality) |
| senior-reviewer-agent | spark-d | openai/gpt-oss-120b | Pipeline-Tier 2 (Senior) |
| senior-coding-agent | claude_code | claude-opus-4-5 / claude-sonnet | Escalation only (selten) |
| mealcam-agent | rtx5090 | qwen3-vl-30b-a3b-fp8 | Vision (geplant) |

---

## Qwen3.6 Pflichtregeln (Spark 1)

JEDER Request muss enthalten:
```json
{
  "chat_template_kwargs": { "enable_thinking": false },
  "temperature": 0.0
}
```

- `/no_think` im Prompt funktioniert NICHT — nur das `chat_template_kwargs` Feld wirkt
- Nur `message.content` auswerten — `reasoning_content` ignorieren
- Leerer Content → FAIL

Implementiert in: `services/scheduler-api/src/vllm-adapter.ts` → `callQwen36Orchestrator()`

---

## GPT-OSS / Gemma 4 / Qwen3.6 — Reasoning-Filter (HARTE REGEL)

Alle Reasoning-fähigen Modelle (Qwen3.6, Gemma 4, GPT-OSS) werden via globalem
`extractContentOnly()` gefiltert:

```ts
function extractContentOnly(response: any): string {
  const msg = response?.choices?.[0]?.message
  if (!msg) return ''
  return (msg.content ?? '').trim()
}
```

- `choices[].message.reasoning` strikt droppen
- `choices[].message.reasoning_content` strikt droppen
- Nur `choices[].message.content` nutzen
- Leerer Content → upstream Error (kein Fallback)

Implementiert in: `services/scheduler-api/src/vllm-adapter.ts` →
`extractContentOnly()`, `callQwen36Orchestrator()`, `callGemmaReviewer()`,
`callGPTOSSReviewer()`.

Vollständige Regeln: `system/control-plane/RULES.md` Sektion 6.

---

## Governance Validator

Datei: `system/control-plane/governance-validator.ts`

### Erlaubte Enums
- **selected_agent:** micro-executor | db-migration-agent | security-specialist | review-agent
- **risk_level:** low | medium | high
- **gates:** db-migration-gate | rollback-gate | typecheck-gate | test-gate | review-gate | human-approval-gate | files-scope-gate | security-gate

### Stop-Conditions Regel
NIEMALS positive Zustände: `approved`, `passed`, `granted`, `success`, `completed`
Stop-Conditions müssen negativ/blockierend sein: `*_failed`, `*_missing`, `*_violation`

### DB-Migration Pflicht-Gates
`db-migration-gate`, `rollback-gate`, `typecheck-gate`, `test-gate`, `review-gate`, `files-scope-gate`

### Security-WO Pflicht-Gates
`security-gate`, `review-gate`, `test-gate`, `files-scope-gate`

### Production-Block
`approval_token_present=false` → KEIN production/prod/live/deploy/release in `execution_order`
→ `human-approval-gate` Pflicht
→ stop_condition `production_execution_without_approval_token` Pflicht

### REWRITE_LOOP (Governance, separat von Pipeline-Tier-Counter)
Max 2 Rewrites → dann FAIL

### Review Pipeline (separater Layer, orthogonal zur Governance)
Output-State Enum für Spark 3 / Spark 4 / Claude:
`PASS` | `REWRITE` | `ESCALATE` | `FAIL`

Reviewer-Risk-Casing UPPERCASE (`LOW` | `MEDIUM` | `HIGH`) — separate Domäne von
Orchestrator-`risk_level` (lowercase).

Vollständige Regeln: `system/control-plane/RULES.md`

---

## Dispatcher Flow

```
Workorder
  → validateWorkorder() (JSON Schema)
  → startRun() + auditJobStarted()
  → loadAgent() + loadSkills()
  → callModel() [Qwen3.6, enable_thinking=false]
  → parseOrchestratorIntent()
  → validateOrchestratorIntent()     ← Governance Validator
      PASS     → weiter
      REWRITE  → max 2x neu an Qwen3.6
      FAIL     → sofort stoppen + auditLog
      BLOCKED  → sofort stoppen + auditLog (kein Rewrite)
  → parseToolRequest()
  → approvalGate()
  → authorizeToolCall()
  → executeTool()
  → ─────────────────────────────────────────────────────────────
    │  Review Pipeline Gate  (NUR bei tool=write && success)     │
    │  → runReviewPipeline()                                      │
    │      Spark 3 (Gemma 4):                                     │
    │        PASS         → done                                  │
    │        REWRITE      → run.failed + WO.review                │
    │        ESCALATE     → Spark 4                               │
    │      Spark 4 (GPT-OSS):                                     │
    │        PASS         → done                                  │
    │        REWRITE      → run.failed + WO.review                │
    │        ESCALATE     → run.blocked + WO.awaiting_approval    │
    │                       (Claude in V1 nicht auto-invoked)     │
    ─────────────────────────────────────────────────────────────
  → consumeApproval() + addWrittenFile()  (nur bei Pipeline PASS)
  → auditLog (zwei Ebenen: audit.jsonl + pipeline-audit.jsonl)
  → finalizeRun()
```

Vollständige Pipeline-Regeln: `system/control-plane/RULES.md`
Implementierung: `system/control-plane/review-pipeline.ts`

---

## Services (Threadripper lokal)

| Service | Port | Zweck |
|---|---|---|
| WO-Classifier | 9000 | Deterministischer Pre-Router |
| SAT-Check | 9001 | Pre-Execution Gate |
| Scheduler | 9002 | WO Queue + Spark-Dispatch |
| Governance Compiler | 9003 | Macro-WO → GovernanceArtefakt |
| LightRAG | 9004 | Codebase Knowledge Graph |

---

## Offene Items

Vollständige Liste: `docs/project/OPEN_TODOS.md`

Höchste Priorität:
- Block 1 — systemd Deployment auf alle 4 Sparks (sonst Reboot-Verlust)
- Block 3 — Pre-existing Tech-Debt (3 TS-Fehler + 3 failing Smoke-Tests)
