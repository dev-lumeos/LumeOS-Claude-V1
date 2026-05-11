# Runtime History V2 Maintenance Semantics

Date: 2026-05-11

## Summary

Runtime history now separates current readiness from stale history and planned hardware maintenance. DGX/Spark endpoint downtime during rack installation is classified as `planned_hardware_maintenance`, not as a routing defect.

## Durable Rule

Do not change Spark/DGX routing because endpoints are unreachable during a declared hardware-maintenance window. Runtime-dependent autonomous, night, and large runs remain blocked until maintenance ends and a fresh endpoint check is recorded.

## Regression Coverage

- Fresh required endpoint failure returns `BLOCKED_REQUIRED_FAILURE`.
- Stale history returns `STALE_HISTORY` and requires recheck.
- Planned DGX/Spark maintenance returns `PLANNED_MAINTENANCE` and avoids routing-fix guidance.
- Optional MealCam offline remains `DEGRADED_OPTIONAL`.

## Product Gate

Product work remains closed unless Tom explicitly opens it.
