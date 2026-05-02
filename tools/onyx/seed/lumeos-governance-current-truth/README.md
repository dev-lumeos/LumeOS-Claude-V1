# LumeOS — Claude V1

Deterministic AI Production Pipeline for LUMEOS.

## Architecture

**Brain** — Claude Code (planning, specs, workorders)
**Law** — Deterministic system (scheduler, governance, preflight, reports)
**Muscle** — DGX Sparks A+B+C+D (parallel WO execution)

## Stack

- pnpm / Turborepo monorepo
- Next.js (web frontend)
- Hono APIs (services)
- Supabase (database)
- vLLM on DGX Sparks A+B+C+D
- Claude Code as Brain (Max 200)

## Sparks

| Spark | IP | Model | Role |
|---|---|---|---|
| A | 192.168.0.128:8001 | Qwen3.6-35B FP8 | Orchestrator + Review |
| B | 192.168.0.188:8001 | Qwen3-Coder-Next FP8 | Coding Worker |
| C | 192.168.0.99:8001 | Gemma-4-26B FP8 | Fast Reviewer Tier 1 |
| D | 192.168.0.101:8001 | GPT-OSS-120B MXFP4 | Senior Reviewer Tier 2 |

## Structure

```
apps/        # Frontend surfaces
services/    # Hono API backends
packages/    # Shared runtime + system core
db/          # Migrations, schema, seeds
system/      # Governance system (WO, Scheduler, Agents, Reports, Memory)
infra/       # vLLM, Supabase, Docker, systemd
tools/       # Serena, Onyx, scripts
docs/        # Specs, decisions, architecture, project docs
.claude/     # Claude Code skills, rules, agents
```

## Key Docs

- `docs/project/USER_MANUAL.md` — Operator guide for Tom
- `docs/project/WORKORDER_CREATION_HANDBOOK.md` — WO creation process
- `STACK_REFERENCE.md` — Hardware, models, agent routing
- `SESSION_ONBOARDING.md` — Current system state
- `system/control-plane/` — Governance, preflight, risk categories
- `system/workorders/schemas/` — WO schema
- `system/approval/` — Approval queue
- `system/reports/` — Morning report, failed WO, model quality, dossiers
