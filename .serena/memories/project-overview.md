# LUMEOS-Claude-V1 — Project Overview

## Stack
- pnpm/Turborepo monorepo
- TypeScript throughout
- Hono APIs (services/)
- Next.js frontend (apps/)
- Supabase (PostgreSQL + RLS)
- Node.js 22+

## Key Directories
```
apps/                    → Next.js frontend
services/                → Hono API services (nutrition, training, scheduler, etc.)
packages/                → Shared packages (wo-core, types, supabase-clients, etc.)
system/                  → Agent registry, control plane, workorders
.claude/                 → Claude Code agents, skills, hooks, settings
supabase/migrations/     → DB migrations (DO NOT EDIT via Serena)
tools/scripts/           → Dev scripts, benchmarks, E2E tests
```

## Critical Services (Ports)
- scheduler-api:   9002
- sat-check:       9001
- wo-classifier:   9000
- governance-compiler: 9003

## Agent Stack
- 12 agents in .claude/agents/ (V4.1 standard)
- 41 skills in .claude/skills/
- Permission Gateway: system/agent-registry/authorize-tool-call.ts
- Dispatcher: system/control-plane/dispatcher.ts

## DB-Layer Rules (IMPORTANT)
- NEVER edit supabase/migrations/** via Serena
- Only db-migration-agent writes migrations
- All migrations need Human Approval + security-specialist review
- RLS mandatory on all tables

## Hardware (Phase 1)
- Spark A: 192.168.0.128 — qwen3.6-35b-fp8
- Spark B: 192.168.0.188 — qwen3-coder-next-fp8
