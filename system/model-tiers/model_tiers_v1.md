# Model Tiers V1

---

## Lokal (DGX Spark — Open Weights)

TierModellNodeFormattok/s`fp8_bulk`Qwen3.6-35B-A3BSpark AFP8\~43`fp4_light`Gemma 4 4BSpark ANVFP4\~85+`fp4_light`Phi-4 MiniSpark ANVFP4\~100+`quality`Qwen3.5-122B-A10BSpark BNVFP4\~55`review`DeepSeek-R1 8B distillSpark BNVFP4\~80+

> fp8_bulk → fp4_bulk sobald NVFP4-Quant für Qwen3.6-35B verfügbar (Community-Quant erwartet)

---

## Remote (OpenRouter / API)

TierModellRolleKosten`escalation_1`Claude Code OpusPrimary EscalationMax Plan`escalation_2`Qwen3.6-PlusAPI only — kein Open Weightgünstig`escalation_3`MiniMax M2.580.2% SWE-bench$0.30/$1.20`escalation_4`Gemini 3.1 Pro78.8% SWE-bench$2/$12`escalation_5`Claude Opus 4.6Last Resort$15/$75`macro_executor`Kimi K2.6Macro WO + Agent Swarm$0.60/$2.50

---

## Node Konfiguration

### Spark A — Throughput (Port 8001)

```yaml
node_id: spark-a
role: bulk_execution
max_slots: 8
models:
  - id: qwen3.6-35b-fp8
    tier: fp8_bulk
    port: 8001
  - id: gemma4-4b-nvfp4
    tier: fp4_light
    port: 8011
  - id: phi4-mini-nvfp4
    tier: fp4_light
    port: 8012
```
### Spark B — Quality (Port 8002)
```yaml
node_id: spark-b
role: quality_orchestration
max_slots: 3          # Slot 3 = Orchestrator reserviert
models:
  - id: qwen3.5-122b-nvfp4
    tier: quality
    port: 8002
  - id: deepseek-r1-8b-nvfp4
    tier: review
    port: 8013
```

---

*Model Tiers V1 — festgezogen*
