# LumeOS — Canonical Memory

Stand: April 2026

---

## System

**Architecture:** Brain / Law / Muscle
- Brain: Claude Code (planning, specs, WOs)
- Law: Deterministic System (scheduler, graph, retry)
- Muscle: DGX Spark A+B (parallel execution)

**Repo:** https://github.com/dev-lumeos/LumeOS-Claude-V1

**Stack:** pnpm / Turborepo / Next.js / Hono / Supabase / vLLM

---

## Festgezogene Entscheidungen

### Architektur
- WO Factory: Claude Code primary (wo-writer skill), Qwen Fallback
- Orchestrator: Qwen3.5-122B lokal (Spark B) — kein Planning
- Macro Executor: Kimi K2.6 via API
- Escalation: Claude Opus → OpenRouter Chain

### Modelle
- Spark A: Qwen3.6-35B-A3B FP8 (fp8_bulk), Gemma 4 4B + Phi-4 Mini (fp4_light)
- Spark B: Qwen3.5-122B NVFP4 (quality/orchestrator), DeepSeek-R1 8B (review)

### WO System
- Micro WO: 1-3 Files, ein Layer, DGX Agents
- Macro WO: 4+ Files, multi-layer, Kimi K2.6
- Lifecycle: spec_draft → ... → closed (festgezogen)
- Phase: types=1, service/db=2, ui/tests=3

### DB Environments
- coding/* ↔ local-dev
- dev ↔ remote-dev
- main ↔ remote-main

---

## Offene Entscheidungen

- Qwen3.6-35B NVFP4-Quant: warten auf Community-Release
- Memory Layer Tool: Anthropic nativ vs mcp-memory-service vs yuvalsuede
- Scheduler Implementation: packages/scheduler-core (noch nicht gebaut)

---

## Module Status

| Modul | Status |
|-------|--------|
| nutrition | In Progress (erster Fokus) |
| training | Geplant |
| recovery | Geplant |
| coach | Geplant |
| medical | Geplant |
| marketplace | Geplant |
