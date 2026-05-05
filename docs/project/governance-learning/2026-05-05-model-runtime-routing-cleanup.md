# Model Runtime Routing Cleanup

Date: 2026-05-05

## Purpose

Resolve model-runtime endpoint health findings without starting product work or requiring optional MealCam/Vision runtime to be online during normal governance operations.

## Changes

- Added missing reviewer route entries to `system/agent-registry/agents.json`:
  - `pre-review-agent`
  - `post-review-agent`
  - `fast-reviewer-agent`
  - `senior-reviewer-agent`
- Marked `mealcam-agent` routing as optional/on-demand in `system/agent-registry/model_routing.json`.
- Updated `model-runtime-check` so optional runtime endpoint failures are info-level unless that runtime is explicitly targeted.
- Added regression tests for optional runtime downgrade, explicit target blocking, and reviewer registry alignment.

## Classification

### MealCam / Vision Runtime

`mealcam-agent` is optional and on-demand.

It is not required for normal governance/operator work and is only required when:

- a MealCam/Vision workorder is active,
- a selected batch requires `mealcam-agent`,
- or Tom explicitly requests a MealCam/Vision run.

When not required, an offline MealCam endpoint is reported as:

`model_runtime.optional_endpoint_offline`

Severity: `info`.

### Reviewer Routes

Reviewer routes are valid and preserved.

The drift was registry metadata mismatch, not stale routing. The missing reviewer agent entries were added to `agents.json` with read-only reviewer metadata.

## Validation Result

Static model-runtime check:

- critical: 0
- high: 0
- medium: 0
- low: 0
- info: 0

Endpoint-health model-runtime check:

- critical: 0
- high: 0
- medium: 0
- low: 0
- info: 1

The one info finding is optional MealCam/Vision endpoint offline and does not block current governance work.

## Product Work Gate

Product work remains blocked unless Tom explicitly opens it.

Autonomous, night, and large runs still require endpoint health for all required runtimes in the target batch.
