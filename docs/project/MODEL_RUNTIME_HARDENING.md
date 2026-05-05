# Model Runtime Hardening

Date: 2026-05-05

## Purpose

This document defines the governance rules for Spark/vLLM/model runtime readiness before autonomous, night, large, or product-facing work runs.

The goal is to detect routing, endpoint, timeout, JSON-mode, and Qwen thinking-policy problems before they turn into approval loops, invalid JSON spikes, or stuck runtime state.

## Runtime Source Of Truth

Routing and agent identity come from:

- `system/agent-registry/agents.json`
- `system/agent-registry/model_routing.json`
- `AGENTS.md`

The read-only runtime checker is:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\model-runtime-check.ts
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\model-runtime-check.ts --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\model-runtime-check.ts --agent db-migration-agent
```

Optional endpoint health:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\model-runtime-check.ts --check-endpoints --timeout-ms 1500
```

Endpoint checks are short, read-only health checks against `/v1/models`. They must not send workorder prompts or expensive generation requests.

## Endpoint Health

Expected Spark/vLLM routes currently include:

| Node | Endpoint | Role |
| --- | --- | --- |
| Spark A | `http://192.168.0.128:8001` | Qwen3.6 orchestration/review/db/security |
| Spark B | `http://192.168.0.188:8001` | Qwen coder execution/docs/tests/i18n |
| Spark C | `http://192.168.0.99:8001` | fast reviewer |
| Spark D | `http://192.168.0.101:8001` | senior reviewer |
| RTX 5090 | `http://localhost:8001` | MealCam vision |

Missing endpoints are configuration warnings for non-local/external routes such as Claude Code. Missing endpoints for routed local Spark models must be reported.

## Timeout Policy

Dispatcher model calls must have a bounded timeout.

Current dispatcher policy:

- `MODEL_CALL_TIMEOUT_MS = 30_000`
- each attempt uses `AbortController`
- fetch requests pass `signal`
- unavailable endpoints stop cleanly with a model-runtime error

Timeouts are model-runtime failures, not governance validation failures.

## Retry Policy

Dispatcher model calls may retry bounded runtime failures once.

Current dispatcher policy:

- `MODEL_CALL_MAX_ATTEMPTS = 2`
- retry is only for model-call runtime failures such as network failure, timeout, or transient 5xx response
- 4xx responses are not retried
- invalid JSON, selected-agent drift, approval failures, scope violations, and migration guard failures are governance/model-output failures and must not become endless runtime retries

## JSON Mode

Runtime-facing agents that produce `OrchestratorIntent` or otherwise require JSON-only output must use JSON object response mode where the API supports it.

The checker verifies that dispatcher code requests:

```ts
response_format = { type: 'json_object' }
```

for JSON-only Qwen3.6 runtime paths.

## Qwen Thinking-Off Policy

Qwen3.6 routes must disable thinking through API options. Prompt text such as `/no_think` is not enough.

The required policy is:

```json
{
  "enable_thinking": false,
  "temperature": 0.0
}
```

The checker verifies both routing documentation and dispatcher enforcement.

## Failure Classification

| Failure | Classification | Expected Behavior |
| --- | --- | --- |
| endpoint unreachable | model runtime | stop operator cleanly; report endpoint |
| endpoint timeout | model runtime | retry once, then stop cleanly |
| 5xx response | model runtime | retry once, then stop cleanly |
| 4xx response | config/request error | stop; do not retry blindly |
| invalid JSON | model-output/governance | use rewrite/stop-rule path, not runtime retry |
| selected_agent mismatch | governance validator | rewrite/fail according to validator |
| approval needed | approval lifecycle | stop for Tom; never auto-grant |
| migration guard failure | safety guard | stop/fix; do not execute SQL |

## Operator Behavior

Operator Doctor includes model-runtime status and can report:

- `MODEL_RUNTIME_BLOCKED`
- `MODEL_CONFIG_WARNING`
- `MODEL_ENDPOINT_UNREACHABLE`
- `MODEL_MISSING`
- `JSON_MODE_POLICY_MISSING`
- `QWEN_THINKING_POLICY_MISSING`

Doctor remains read-only and produces exactly one next action.

## Product Work Gate

Product work remains conditionally open only for controlled planning/probe work.

Autonomous, night, large, or product-execution runs remain blocked until:

- model runtime checker has no critical/high findings
- endpoint health is proven when runtime execution is needed
- invariant checker is clean
- agent-contract checker is clean
- spec-source-chain checker passes for the target batch/workorder
- governance-learning-check is clean
- Tom explicitly opens or waives the relevant gate

## No Product Execution

This hardening layer does not run product batches, execute migrations, import BLS data, grant approvals, or run Supabase `db push`/`db reset`.
