# Runtime History Refresh

Date: 2026-05-10

## Summary

Model runtime history was refreshed after routing cleanup and Operator Autonomy V2. The checker now separates current blocking readiness from historical failures.

## Finding

Runtime history still reported `RUNTIME_BLOCKED` because an old `senior-reviewer-agent` timeout from the previous DGX4/Spark D routing was counted as blocking even after senior review moved to Codex/GPT-5.5 and the latest route status was `external_ok`.

## Fix

History summary now:

- filters blocking readiness to active current routes
- uses the latest record for active required-route blocking decisions
- keeps old failures visible as historical counts
- treats removed/lab/disabled route history as historical, not blocking
- keeps optional MealCam offline as non-blocking degraded/info state

## Validation

- Current endpoint check: critical `0`, high `0`, medium `0`, info `1`.
- History after refresh: `RUNTIME_DEGRADED`, not `RUNTIME_BLOCKED`.
- Optional MealCam offline remains visible and non-blocking.
- Old senior-reviewer timeout remains visible as historical data.

## Durable Rule

Runtime history must not delete old failures to appear healthy. It must separate current active-route readiness from historical failure observability.
