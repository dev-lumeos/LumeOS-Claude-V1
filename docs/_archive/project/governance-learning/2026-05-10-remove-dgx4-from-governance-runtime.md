# Remove DGX4 From Productive Governance Runtime

## Summary

DGX4/Spark D at `192.168.0.101:8001` was reachable by ping but not accepting TCP/HTTP connections on port `8001`. Because Codex/GPT-5.5 is the productive senior engineering and repo-aware review runtime, DGX4/Spark D was removed from productive governance routing instead of remaining a normal operator/runtime blocker.

## Decision

- `senior-reviewer-agent` now routes to Codex CLI / GPT-5.5.
- `senior-coding-agent` remains Codex CLI / GPT-5.5.
- DGX4/Spark D remains documented as lab-disabled metadata for later DGX4/DGX5 MiniMax or lab validation work.
- DGX4/Spark D is not required for normal governance/operator runtime checks.

## Safety

- No product work was opened.
- No Supabase commands or migrations were run.
- No approvals were granted.
- No runtime state or queue state was manually edited.
- MealCam remains optional/on-demand.

## Durable Rule

Required productive runtime routes must be routes that are expected to be online for normal governance/operator work. Lab or disabled routes may remain documented, but they must not appear as required endpoint-checked routes that block normal governance health checks.
