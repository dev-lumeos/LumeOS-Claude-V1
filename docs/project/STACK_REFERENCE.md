# LUMEOS — Stack & Architecture Reference
# Stand: April 2026 | Phase 1 AKTIV

---

## Hardware

| Node | IP | Port | Modell | Rolle | tok/s |
|---|---|---|---|---|---|
| Spark 1 | 192.168.0.128 | 8001 | Qwen3.6-35B-A3B FP8 | Orchestrator + Review | ~52 single / 107 parallel |
| Spark 2 | 192.168.0.188 | 8001 | Qwen3-Coder-Next FP8 | Coding Worker | ~47 |
| RTX 5090 | localhost | 8001 | Qwen3-VL 30B FP8 | MealCam Vision | TBD |
| Escalation | — | — | Claude Sonnet/Opus (Max 200) | Senior Coding | — |

**Phase 2 (PENDING):** Spark 3+4 unterwegs — DeepSeek R1 70B + GLM-4.7-Flash + Qwen3.5 9B

### Spark 1 Docker Start
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

### Spark 2 Docker Start
```bash
docker run -d --name spark-b-coder \
  --gpus all --ipc=host -p 8001:8000 \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  vllm/vllm-openai:cu130-nightly \
  --model Qwen/Qwen3-Coder-Next-FP8 \
  --served-model-name qwen3-coder-next-fp8 \
  --gpu-memory-utilization 0.80 \
  --max-model-len 131072 \
  --enable-auto-tool-choice \
  --tool-call-parser qwen3_coder \
  --enable-prefix-caching \
  --trust-remote-code
```

---

## Agent Routing

| Agent | Node | Modell | Zweck |
|---|---|---|---|
| orchestrator-agent | spark-a | qwen3.6-35b-fp8 | Dispatch + Monitor |
| pre-review-agent | spark-a | qwen3.6-35b-fp8 | Vollständigkeit prüfen |
| post-review-agent | spark-a | qwen3.6-35b-fp8 | Output validieren |
| review-agent | spark-a | qwen3.6-35b-fp8 | Validation |
| governance-compiler | spark-a | qwen3.6-35b-fp8 | Governance |
| security-specialist | spark-a | qwen3.6-35b-fp8 | Security Audits |
| db-migration-agent | spark-a | qwen3.6-35b-fp8 | Schema Changes |
| micro-executor | spark-b | qwen3-coder-next-fp8 | TypeScript Patches |
| test-agent | spark-b | qwen3-coder-next-fp8 | Tests |
| senior-coding-agent | claude_code | claude-opus-4-5 | Escalation only |

---

## Qwen3.6 Pflichtregeln

**JEDER Request muss enthalten:**
```json
{
  "chat_template_kwargs": { "enable_thinking": false },
  "temperature": 0.0
}
```
- `/no_think` funktioniert NICHT
- Nur `message.content` auswerten — `reasoning_content` ignorieren
- Leerer Content → FAIL

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

### REWRITE_LOOP
Max 2 Rewrites → dann FAIL

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
  → consumeApproval() + addWrittenFile()  (nur bei Erfolg)
  → auditLog + finalizeRun()
```

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

## Offene TODOs (Phase 2)

- Permission Gateway V0.3 (nach Spark 3+4 Ankunft)
- KV-Cache Spark 3 prüfen
- Tool-Calling Test Qwen3.6 (Reasoning Parser aus)
- Spark 3: Qwen3.6 + DeepSeek R1 70B
- Spark 4: GLM-4.7-Flash + Qwen3.5 9B
