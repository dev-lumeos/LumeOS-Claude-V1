# LumeOS Canonical Memory

# Stand: 25. April 2026 — Stack Update

---

## System

**Architecture:** Brain / Law / Muscle

- Brain: Claude Code Opus 4.6 (planning, specs, WOs)
- Law: Deterministisches System (WO Classifier, Governance Compiler, SAT-Check, Scheduler, Ed25519)
- Muscle: DGX Sparks (vLLM Execution)

**Repo:** <https://github.com/dev-lumeos/LumeOS-Claude-V1>**Stack:** pnpm / Turborepo / Hono / Supabase / vLLM / TypeScript

---

## Hardware

### Phase 1 (AKTIV — 2 Sparks)

NodeIPModellStatusSpark 1192.168.0.128:8001Qwen3.6-35B-A3B-FP8✅ LIVESpark 2192.168.0.188:8001Qwen3-Coder-Next-FP8✅ LIVERTX 5090localhost:8010Qwen3-VL-30B-A3B-FP8✅ LIVE

### Phase 2 (PENDING — Sparks unterwegs)

NodeIPModellStatusSpark 3TBDMiniMax M2.7 NVFP4 ½ + DeepSeek-R1 70B NVFP4🔜 BestelltSpark 4TBDMiniMax M2.7 NVFP4 ½ + GLM-4.7-Flash + Qwen3.5 9B🔜 Bestellt

**Phase 2 Besonderheit:** MiniMax M2.7 läuft als TP=2 über Spark 3+4 gemeinsam. Mode 1 (Standard): DeepSeek + GLM + Qwen9B aktiv. Mode 2 (High Intelligence): MiniMax M2.7 aktiv, andere idle.

---

## Festgezogene Entscheidungen

### Pipeline

- WO Classifier: deterministisch, regelbasiert, kein LLM (Port 9000)
- Governance Compiler: Spark 1, GovernanceArtefaktV3 YAML
- SAT-Check: Threadripper, 3 Checks, kein LLM (Port 9001)
- Scheduler: 5s Loop, SlotManager, Priority Queue (Port 9002)
- Ed25519 Token: Sign/Verify, Nonce UNIQUE, 5min Expiry
- triple_hash: 3× identisch = PASS, Temp=0.0, Seed=42

### Modelle (Phase 2 Zielstack)

RolleModellNodeOrchestratorNemotron 3 Super NVFP4Spark 1Review / Pre+PostQwen3.6-35B FP8Spark 1Coding WorkerQwen3-Coder-Next FP8Spark 2High IntelligenceMiniMax M2.7 NVFP4 TP=2Spark 3+4Security/ReasoningDeepSeek-R1 Distill 70B NVFP4Spark 3Test/Tool CallingGLM-4.7-FlashSpark 4Fast SidekickQwen3.5 9BSpark 4MealCam VisionQwen3-VL 30B-A3B FP8RTX 5090

### Agent Workflow

```
Claude + Tom → Workorder
             → pre-review-agent   (Qwen3.6: Vollständigkeit)
             → orchestrator-agent (Dispatch + Monitor)
             → Executor Agent
             → post-review-agent  (Qwen3.6: Output validieren)
             → Approval Gate
             → Tom
```

### DB

- Control Plane: Lokal auf Threadripper (Supabase Port 54321)
- App-Daten: Supabase Cloud (später, wenn Nutrition/Training gebaut)
- Trennung: Control Plane NIEMALS in Cloud

### Tools

- Context7: Library Docs MCP
- Serena: LSP Code Navigation MCP
- claude-mem: Session Memory (Port 37777, Bun)
- LightRAG: Codebase Knowledge Graph (Port 9004, 170 Files)
- lean-ctx: Token Compression
- Grafana: WO Pipeline + Hardware Dashboard (Port 3001)
- Prometheus: Metrics (Port 9090)

---

## Services (laufend auf Threadripper)

```
Port 9000  wo-classifier       deterministisches Routing
Port 9001  sat-check           3 deterministische Checks
Port 9002  scheduler-api       5s Dispatch Loop
Port 9003  governance-compiler Spark 1 → GovernanceArtefaktV3
Port 9004  lightrag            Codebase Knowledge Graph
Port 9005  orchestrator        TODO — wartet auf Phase 2 (Nemotron)
Port 37777 claude-mem          Session Memory
Port 54321 supabase            Control Plane DB
Port 3001  grafana             Dashboards
Port 9090  prometheus          Metrics
```

---

## System Dokumente (V2)

- `system/model-tiers/model_registry_v2.md` — aktueller Stack
- `system/model-tiers/model_tiers_v2.md` — Tier-Definitionen + Mode Switching
- `system/agent-registry/agent_registry_v2.md` — alle Agenten

---

## Offene Punkte

- Spark 3+4: Lieferung + Konfiguration ausstehend
- Port 9005 Orchestrator: wartet auf Nemotron Deployment
- Nutrition-API: wartet auf Supabase Cloud
- CI Pipeline: wartet auf vollständige Tests
- Memory Layer Policies: wartet auf Orchestrator
- WO Batches Automatisierung: wartet auf Orchestrator
- KV-Cache Spark 3 prüfen nach Inbetriebnahme (\~28GB — falls zu knapp DeepSeek auslagern)
