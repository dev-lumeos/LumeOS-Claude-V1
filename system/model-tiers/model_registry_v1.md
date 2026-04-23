# Model Registry V1 — LumeOS
# Status: FESTGEZOGEN — 23. April 2026

---

## Finale Modell-Entscheidung

Zwei Modelle. Zwei Sparks. Jedes bedient alle Agenten seines Tiers parallel via vLLM Continuous Batching.

---

## Spark A — Governance Layer

| Parameter | Wert |
|-----------|------|
| IP | 192.168.0.128 |
| Port | 8001 |
| Modell | Qwen/Qwen3.6-35B-A3B-FP8 |
| served-model-name | qwen3.6-35b-fp8 |
| Rolle | Governance-Compiler, Security, DB-Review, Context-Builder |
| Temp (Governance) | 0.7, Thinking ON |
| Temp (Execution) | 0.0, Thinking OFF, Seed 42 |
| max_model_len | 131072 |
| gpu_memory_utilization | 0.80 |

**Warum Qwen3.6 statt 3.5:**
Explizite Verbesserungen bei Agentic Coding und Repository-Level-Reasoning in 3.6.
MoE Architektur: 35B total / 3B aktiv → effizient bei hohem Throughput.

**Bedient alle Governance-Agenten:**
- Governance-Compiler (Macro-WO → Artefakt)
- Security Specialist
- DB Migration Agent
- Context-Builder Agent
- Review Agent (bei Bedarf, Temp 0.0 Thinking ON)

---

## Spark B — Execution Layer

| Parameter | Wert |
|-----------|------|
| IP | 192.168.0.188 |
| Port | 8001 |
| Modell | Qwen/Qwen3-Coder-30B-A3B-Instruct-FP8 |
| served-model-name | qwen3-coder-30b |
| Rolle | Micro-Executor, Test, Docs, i18n, alle Code-Tasks |
| Temp | 0.0, Seed 42 (deterministisch) |
| max_model_len | 131072 |
| gpu_memory_utilization | 0.35 |

**Warum Qwen3-Coder statt Generalist:**
Speziell auf Agentic Coding trainiert. Tool Calling nativ.
FP8 statt BF16: ~30GB statt ~60GB → 85GB für KV-Cache frei.

**Bedient alle Execution-Agenten:**
- Micro-Executor (TypeScript, Hono, Next.js)
- Test Specialist
- Docs Agent
- i18n Agent
- Config Agent
- Boilerplate Agent

---

## Prinzip

Ein Modell = 100 parallele Requests via vLLM Continuous Batching.
Separate Instanzen nur wenn unterschiedliche Qualitätsstufen oder Spezialisierungen nötig.
Erweiterungen (Review-Modell, kleine Spezialisten) werden bei Bedarf hinzugefügt.

---

## Offen für spätere Erweiterung

| Kandidat | Größe | Mögliche Rolle |
|----------|-------|---------------|
| DeepSeek-R1 8B NVFP4 | ~8GB | Dedicated Review Agent (CoT) |
| Phi-4 Mini NVFP4 | ~5GB | Triviale Tasks bei hoher Last |
| Qwen3.5-122B NVFP4 | ~75GB | Orchestrator (wenn 2. Spark frei) |

*Model Registry V1 — FESTGEZOGEN*
