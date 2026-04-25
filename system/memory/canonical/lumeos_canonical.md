# LumeOS Canonical Memory

# Stand: 25. April 2026

---

## System

**Architecture:** Brain / Law / Muscle

- Brain: Claude Code Opus 4.6 (planning, specs, WOs, orchestration)
- Law: Deterministisches System (WO Classifier, Governance Compiler, SAT-Check, Scheduler, Ed25519)
- Muscle: DGX Spark A+B (vLLM Execution)

**Repo:** <https://github.com/dev-lumeos/LumeOS-Claude-V1>**Stack:** pnpm / Turborepo / Hono / Supabase / vLLM / TypeScript

---

## Hardware (aktuell)

NodeIPModellStatusSpark A192.168.0.128:8001Qwen3.6-35B-A3B-FP8✅ LIVESpark B192.168.0.188:8001Qwen3-Coder-30B-A3B-FP8✅ LIVESpark CTBDQwen3.5-122B NVFP4🔜 BestelltSpark DTBDQwen3-Coder-Next🔜 Bestellt

---

## Festgezogene Entscheidungen

### Pipeline

- WO Classifier: deterministisch, regelbasiert, kein LLM (Port 9000)
- Governance Compiler: Spark A, GovernanceArtefaktV3 YAML
- SAT-Check: Threadripper, 3 Checks, kein LLM (Port 9001)
- Scheduler: 5s Loop, SlotManager, Priority Queue (Port 9002)
- Ed25519 Token: Sign/Verify, Nonce UNIQUE, 5min Expiry
- triple_hash: 3× identisch = PASS, Temp=0.0, Seed=42

### Modelle

- Spark A: Qwen3.6-35B-A3B FP8 (Governance)
- Spark B: Qwen3-Coder-30B-A3B FP8 (Execution, deterministisch)
- Spark C (coming): Qwen3.5-122B NVFP4 (Orchestrator)
- Spark D (coming): Qwen3-Coder-Next (Specialist/QA)

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
Port 9003  governance-compiler Spark A → GovernanceArtefaktV3
Port 9004  lightrag            Codebase Knowledge Graph
Port 9005  orchestrator        TODO — wartet auf Spark C
Port 37777 claude-mem          Session Memory
Port 54321 supabase            Control Plane DB
Port 3001  grafana             Dashboards
Port 9090  prometheus          Metrics
```

---

## Offene Punkte

- Spark C+D: Orchestrator, DB Gate, Acceptance Verifier, Eskalationskette
- Nutrition-API: wartet auf Supabase Cloud
- CI Pipeline: wartet auf vollständige Tests
- Memory Layer Policies: wartet auf Orchestrator
- WO Batches Automatisierung: wartet auf Orchestrator
