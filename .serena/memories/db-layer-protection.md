# DB-Layer Protection Rules

## Protected Paths (never edit via Serena)
- supabase/migrations/**       → db-migration-agent only
- supabase/config.toml         → manual DB admin only
- db/migrations/**             → db-migration-agent only
- system/state/audit.jsonl     → runtime-generated, append-only
- system/state/runtime_state.* → runtime-generated

## Allowed Read (context only)
- packages/types/src/**        → DB types for TypeScript context
- supabase/migrations/**       → READ for schema context only

## Serena Write Scope
- apps/**, services/**, packages/**, .claude/**, tools/**
- Exclude: */generated/**, supabase/**, db/migrations/**

## Migration Agent
Agent: db-migration-agent
Gates: security-specialist review (mandatory) + Human Approval (always)
Tool: supabase db diff (validation), NOT push --linked
