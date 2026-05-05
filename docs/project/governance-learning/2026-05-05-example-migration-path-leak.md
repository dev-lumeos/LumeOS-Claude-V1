# Incident: Example Migration Path Leak

## Metadata

- incident_id: GOV-20260505-002
- date: 2026-05-05
- layer: agent_contract
- severity: high
- status: fixed
- product_work_blocked: yes
- autonomous_operator_blocked: yes

## Summary

The db-migration-agent produced a real write approval for `supabase/migrations/20240101_001_example.sql`, a template-like path that was not the workorder target. Granting it would have allowed a wrong migration file write.

## Root Cause

Agent/contract examples used a concrete-looking example migration path. The dispatcher did not yet reject example/template filenames in real tool requests, and the workorder-derived migration suffix was not enforced strongly enough.

## Trigger

- command: Governance Operator approval stop
- workorder: `WO-nutrition-003`
- run_id: `RUN-20260504-3999`
- approval_id: `APP-20260504-271771`
- stop_rule:

## Fix

- commit: `1ef079b fix(governance): reject example migration tool paths`
- files:
  - `.claude/agents/db-migration-agent.md`
  - `system/prompts/orchestration/orchestrator_intent_contract.md`
  - `system/control-plane/dispatcher.ts`
  - `system/control-plane/__tests__/db-migration-agent-contract.test.ts`
- behavior changed: example migration paths are treated as REWRITE, db-migration examples use non-literal placeholders, and migration target paths must match the workorder-derived output stem.

## Regression Test

- test_file: `system/control-plane/__tests__/db-migration-agent-contract.test.ts`
- test_name: `agent spec does not present the example migration path as a usable targetPath`
- test_name: `rewrites real tool requests that leak example migration filenames`
- test_name: `passes WO-003 migration writes only when targetPath matches the workorder output stem`
- command: `cmd.exe /c node node_modules\tsx\dist\cli.mjs --test system\control-plane\__tests__\db-migration-agent-contract.test.ts`

## Durable Rule

- rule_file: `docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md`
- rule_text: Example/template paths such as `example.sql` must never become real tool targets.

## Memory Update

- handover_updated: yes
- canonical_memory_updated: yes
- agent_contract_updated: yes
- workorder_template_updated: no

## Recurrence Detector

Governance Batch 004 must add an agent-contract checker for example path leaks, JSON-only output contracts, and selected_agent drift.

## Follow-up

Implement Governance Batch 004 - Agent & Skill Contract Validation.

