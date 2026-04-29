# Model Tiers V2 — LumeOS
# Status: Phase 2 LIVE — 29. April 2026

---

## Aktuelle Tier-Zuweisung

| Tier | Modell | Node | Format | Rolle |
|---|---|---|---|---|
| `orchestrator` | Qwen3.6-35B-A3B | Spark A | FP8 | Orchestrator + WO-Validator |
| `micro_executor` | Qwen3-Coder-Next | Spark B | FP8 | Coding Worker (TypeScript Patches) |
| `fast_reviewer` | google/gemma-4-26B-A4B-it | Spark C | FP8 (instanttensor) | Pipeline Tier 1 Reviewer |
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

### Spark C + D (Reviewer)
- Reasoning-Output via `extractContentOnly()` strikt verwerfen
- Nur `choices[].message.content` auswerten

---

## Review-Pipeline Routing

```
Worker (Spark B) → Spark C (Gemma 4 Fast)
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
| `callGemmaReviewer()` | Spark C | Gemma 4 26B |
| `callGPTOSSReviewer()` | Spark D | GPT-OSS 120B |

Alle gehen durch `extractContentOnly()` — reasoning/reasoning_content wird global gefiltert.

---

## Throughput-Referenz (live verifiziert)

| Node | Modell | Single tok/s | Parallel tok/s |
|---|---|---|---|
| Spark A | Qwen3.6-35B FP8 | ~50 | ~116 @ 4-par |
| Spark B | Qwen3-Coder-Next FP8 | ~47 | — |
| Spark C | Gemma 4 26B FP8 | ~35 | ~180 @ 8-par |
| Spark D | GPT-OSS 120B MXFP4 | ~59 | ~150 @ 4-par |
