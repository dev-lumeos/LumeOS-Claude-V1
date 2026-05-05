# Spark Runtime Hardening Summary

Date: 2026-05-05

## Purpose

Add read-only model runtime checks so Spark/vLLM routing, endpoint health, JSON-mode policy, Qwen thinking-off policy, and dispatcher timeout/retry behavior can be verified before autonomous work.

## Files Created

- `system/control-plane/model-runtime-check.ts`
- `system/control-plane/__tests__/model-runtime-check.test.ts`
- `docs/project/MODEL_RUNTIME_HARDENING.md`
- `docs/project/governance-learning/2026-05-05-spark-runtime-hardening-summary.md`

## Files Updated

- `system/control-plane/dispatcher.ts`
- `system/workorders/cli/operator-doctor.ts`
- `system/workorders/cli/__tests__/operator-doctor.test.ts`
- `docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md`
- `docs/project/CURRENT_GOVERNANCE_HANDOVER.md`
- `system/memory/canonical/lumeos_canonical.md`

## Runtime Rules Added

- Dispatcher model calls have a bounded timeout.
- Dispatcher retries model runtime failures at most once.
- Qwen3.6 routes must use `enable_thinking:false`.
- JSON-only runtime paths must request JSON object response mode where supported.
- Optional endpoint checks use short `/v1/models` health checks, not workorder prompts.
- Operator Doctor reports model-runtime blockers as a read-only diagnosis with one next action.

## Current Check Result

Static model-runtime check:

- critical: 0
- high: 0
- medium: 4

The remaining medium findings are registry/routing drift for reviewer routes that are present in `model_routing.json` but not yet mirrored in `agents.json`. They do not currently block operator/product gates but should be reconciled in a future registry cleanup.

Endpoint health was not run as part of commit validation because endpoint availability depends on local Spark service state.

## Product Work Gate

Product work remains conditionally open only for controlled planning/probe work.

Autonomous, night, large, or product-execution runs remain blocked until Tom explicitly opens the gate and runtime health is proven for the required endpoints.

## Follow-up

- Decide whether reviewer tier agents should be added to `agents.json` or documented as route-only review pipeline entries.
- Add model-runtime summaries to batch dossier output if deeper observability is needed.
