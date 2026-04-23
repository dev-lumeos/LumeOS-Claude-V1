# LumeOS — Claude V1

Deterministic AI Production Pipeline for LUMEOS.

## Architecture

**Brain** — Claude Code (planning, specs, workorders)
**Law** — Deterministic system (scheduler, graph, retry, rules)
**Muscle** — DGX Spark A+B (parallel WO execution)

## Stack

- pnpm / Turborepo monorepo
- Next.js (web frontend)
- Hono APIs (services)
- Supabase (database)
- vLLM on DGX Spark A+B
- Claude Code as Brain (Max 200)
- Kimi K2.6 (macro executor + escalation)

## Structure

```
apps/        # Frontend surfaces
services/    # Hono API backends
packages/    # Shared runtime + system core
db/          # Migrations, schema, seeds
system/      # Canonical system definitions (WO, Graph, Scheduler, Agents, Memory)
infra/       # vLLM, Qdrant, Paperclip, Supabase, Docker
tools/       # Serena, RTK, gstack, scripts
docs/        # Specs, decisions, architecture
.claude/     # Claude Code skills, rules, agents
```

## Key Docs

- `system/workorders/` — WO Lifecycle V1
- `system/agent-registry/` — Agent Registry V2
- `system/file-groups/` — File Group Registry V1
- `system/decomposition/` — Decomposition Spec V1
- `system/scheduler/` — Scheduler Dispatch V1
- `system/policies/` — GSD v2, Retry, Guardrails
