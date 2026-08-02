# DGX3 / Nemotron Controlled Reviewer Integration Plan

Date: 2026-05-14

## Decision

DGX3 / Spark3 Nemotron Omni NVFP4 is accepted as a controlled on-demand reviewer/specialist candidate for workflow tests.

It is not accepted as:

- orchestrator
- coding worker
- production routing by default
- broad replacement for existing reviewer routes

## Runtime Basis

Source of truth: `docs/project/runtime/DGX3_SPARK3_NEMOTRON_RUNTIME.md`

Verified runtime:

- Host: `edgexpert-509d`
- Endpoint: `http://192.168.0.99:8001`
- Model: `nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4`
- `max_model_len`: `65536`
- Reasoning appears separately in `reasoning`
- Normal workflow output must use only `content.trim()`

## Controlled Route

Route id: `nemotron-review-agent`

Registry/config:

- `.claude/agents/nemotron-review-agent.md`
- `system/agent-registry/agents.json`
- `system/agent-registry/permissions.json`
- `system/agent-registry/model_routing.json`

Dispatcher selection is opt-in only:

```powershell
$env:LUMEOS_FAST_REVIEWER_ROUTE='nemotron-review-agent'
```

If this variable is not set, the dispatcher does not select the Nemotron reviewer route.

## Acceptance Criteria Before Route Use

- `/v1/models` OK
- completion probe OK
- JSON probe OK after `content.trim()`
- `content.trim()` is non-empty
- `reasoning` and `reasoning_content` are ignored for normal workflow output
- empty content is invalid / `OUTPUT_INCOMPLETE`
- harmless governed batch only, preferably local UI/docs/read-only Nutrition work

## Full Workflow Test Proposal

Use a harmless local Nutrition batch that already exercises Spark1 orchestration.

```powershell
$env:LUMEOS_FAST_REVIEWER_ROUTE='nemotron-review-agent'
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts system\workorders\nutrition\batches\BATCH-NUTRITION-P1-005-LOCAL-DETAIL-DEEPLINK.md --dry-run --project lumeos --orchestration-mode spark1_orchestrated
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts system\workorders\nutrition\batches\BATCH-NUTRITION-P1-005-LOCAL-DETAIL-DEEPLINK.md --doctor --json --project lumeos --orchestration-mode spark1_orchestrated
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts system\workorders\nutrition\batches\BATCH-NUTRITION-P1-005-LOCAL-DETAIL-DEEPLINK.md --continue --project lumeos --orchestration-mode spark1_orchestrated
Remove-Item Env:\LUMEOS_FAST_REVIEWER_ROUTE
```

Expected path:

Spark1 orchestrator -> assigned worker -> DGX3/Nemotron review step -> standard checks -> dossier.

## Stop Conditions

Stop and report if:

- Nemotron completion probe returns empty content
- JSON probe cannot be parsed after trimming content
- reasoning leaks into normal workflow output
- route attempts DB, Supabase, migration, BLS, seed, DEV, LIVE, production routing, or MiniMax production routing
- Spark1 orchestration is not used when `spark1_orchestrated` is requested
- reviewer output is invalid JSON or repeatedly escalates

## Remaining Boundaries

This plan does not authorize production routing. A separate acceptance decision is required before DGX3/Nemotron can become a default reviewer route.
