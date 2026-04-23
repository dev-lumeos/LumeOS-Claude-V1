# LumeOS Codebase Instructions

Du analysierst die LumeOS Codebase — ein Health & Performance Operating System.

## Architektur

- **Brain**: Claude Code (Planning, Specs, Workorders)
- **Law**: Scheduler, Graph, SAT-Check (Deterministische Execution)
- **Muscle**: DGX Spark A+B (Parallele WO Execution)

## Module

12 Domain-Module: nutrition, training, supplements, recovery, coach, medical, goals, marketplace, memory, admin, analytics

## Tech Stack

- pnpm/Turborepo Monorepo
- Next.js 14 (Frontend)
- Hono (API Services)
- Supabase (Backend)
- vLLM (LLM Inference)

## Konventionen

- TypeScript strict mode
- Zod Validation
- Conventional Commits
- RLS auf allen Tabellen
