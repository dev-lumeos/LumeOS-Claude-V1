# Model Tiers V2 — LumeOS
# Status: Phase 2 LIVE — 29. April 2026

---

## Current Runtime Correction, 2026-05-14

DGX1 / Spark1 is the verified `orchestrator-agent` and governance/reasoning runtime. The current runtime details and corrected `vllm.service` flags are recorded in `docs/project/runtime/DGX1_SPARK1_ORCHESTRATOR_RUNTIME.md`.

Current orchestration truth:

- `spark1_orchestrated` operator mode uses Spark1 / `orchestrator-agent` for pre-dispatch worker assignment.
- Commit `a0b3a20` proves doctor/dry-run handoff with `spark1_orchestrator_used: true`, `codex_role: none`, and `worker_assignment_result: WO-nutrition-013->senior-coding-agent`.
- Codex remains bootstrap, senior worker/reviewer, and fallback. It is not the default orchestrator when Spark1 mode is requested.
- DGX3 / Spark3 has migrated from Gemma4 to Nemotron Omni NVFP4. It is verified as a specialist / multimodal / visual-review / OCR / FoodCam candidate, not orchestrator and not production routing by default.
- MiniMax remains lab-only and not productive governance routing.

---

## Aktuelle Tier-Zuweisung

| Tier | Modell | Node | Format | Rolle |
|---|---|---|---|---|
| `orchestrator` | Qwen3.6-35B-A3B | Spark A | FP8 | Orchestrator + WO-Validator |
| `micro_executor` | Qwen3-Coder-Next | Spark B | FP8 | Coding Worker (TypeScript Patches) |
| `specialist_candidate` | nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4 | Spark C / DGX3 | NVFP4 | Specialist / multimodal / visual-review / OCR / FoodCam candidate |
| `senior_reviewer` | openai/gpt-oss-120b | Spark D | MXFP4 | Pipeline Tier 2 Reviewer |
| `escalation` | Claude Sonnet/Opus | Claude Code Max 200 | — | Senior Coding (Escalation only) |

---

## Deterministik-Parameter

### Spark A (Orchestrator)
```json
{
  "chat_template_kwargs": { "enable_thinking": false },
  "temperature": 0.0
}
```
- `/no_think` funktioniert NICHT — nur `chat_template_kwargs` wirkt
- Nur `message.content` auswerten — `reasoning_content` strikt ignorieren

### Spark B (Coding Worker)
```
temperature: 0.0
seed:        42
top_p:       1.0
top_k:       1
```

### Spark C / DGX3 (Nemotron)
- Reasoning appears separately in the `reasoning` field.
- Normal workflow wrappers must trim `choices[].message.content`, ignore `reasoning`, and treat empty content as invalid.
- Gemma4 on DGX3 is retired/not workflow-ready and must not be used in routing.
- Nemotron is not production routing by default; add a route only after acceptance policy decides the role.

### Spark D / Lab Review
- Productive senior review remains Codex/GPT-5.5 unless a future governance decision changes routing.

---

## Review-Pipeline Routing

Current note: the Spark C Gemma4 fast-review route below is historical/retired for DGX3. Do not use it until Nemotron acceptance policy defines a replacement route.

```
Worker (Spark B) -> Spark C legacy Gemma4 fast route (retired; do not use)
  PASS (confidence>=0.75)  → done
  REWRITE                  → run.failed + WO.review status='failed'
  ESCALATE / low-confidence → Spark D

Spark D (GPT-OSS Senior)
  PASS (confidence>=0.75)  → done
  REWRITE                  → run.failed + WO.review status='failed'
  ESCALATE / cannot decide  → HUMAN_NEEDED (status='blocked')
```

High-Risk WOs (auth/rls/migration/security): Spark D läuft mandatory blocking
auch wenn Spark C PASS gegeben hat.

---

## Adapter-Funktionen (vllm-adapter.ts)

| Funktion | Node | Modell |
|---|---|---|
| `callQwen36Orchestrator()` | Spark A | Qwen3.6-35B |
| `callCoderNext()` | Spark B | Qwen3-Coder-Next |
| `callGemmaReviewer()` | Spark C | legacy Gemma4 adapter; do not use for DGX3 Nemotron routing |
| `callGPTOSSReviewer()` | Spark D | GPT-OSS 120B |

Alle gehen durch `extractContentOnly()` — reasoning/reasoning_content wird global gefiltert.

---

## Throughput-Referenz (live verifiziert)

| Node | Modell | Single tok/s | Parallel tok/s |
|---|---|---|---|
| Spark A | Qwen3.6-35B FP8 | ~50 | ~116 @ 4-par |
| Spark B | Qwen3-Coder-Next FP8 | ~47 | — |
| Spark C | Nemotron Omni NVFP4 | ~58 | ~162 @ 4-par |
| Spark D | GPT-OSS 120B MXFP4 | ~59 | ~150 @ 4-par |
