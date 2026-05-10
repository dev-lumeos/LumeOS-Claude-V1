# Spark D Runtime Diagnosis

## Date

2026-05-10

## Scope

Read-only diagnosis of the `senior-reviewer-agent` / Spark D endpoint after runtime history reported a blocking endpoint failure.

No product work, Supabase command, migration, approval action, service restart, process kill, routing change, runtime state edit, or queue edit was performed.

## Config Confirmed

| Item | Value |
| --- | --- |
| Agent | `senior-reviewer-agent` |
| Node | `spark-d` |
| Expected model | `openai/gpt-oss-120b` |
| Endpoint | `http://192.168.0.101:8001` |
| Role | Tier 2 senior reviewer |
| Required for normal route health | Yes |
| Endpoint checker default timeout | `1500ms` |
| Diagnosis checker timeout | `5000ms` |

Source files inspected:

- `system/agent-registry/model_routing.json`
- `system/agent-registry/agents.json`
- `docs/project/MODEL_RUNTIME_HARDENING.md`
- `system/control-plane/model-runtime-check.ts`
- `docs/project/CURRENT_GOVERNANCE_HANDOVER.md`

## Checks Run

| Check | Command | Result |
| --- | --- | --- |
| ICMP reachability | `cmd.exe /c ping -n 2 192.168.0.101` | Host reachable, 2/2 replies, 0% loss |
| OpenAI models endpoint | `cmd.exe /c curl.exe --max-time 5 -i http://192.168.0.101:8001/v1/models` | Failed to connect to port `8001` after about `2042ms` |
| Health endpoint | `cmd.exe /c curl.exe --max-time 5 -i http://192.168.0.101:8001/health` | Failed to connect to port `8001` after about `2035ms` |
| TCP port probe | `Test-NetConnection 192.168.0.101 -Port 8001` | `PingSucceeded=True`, `TcpTestSucceeded=False` |
| Runtime checker | `cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\model-runtime-check.ts --check-endpoints --timeout-ms 5000 --json` | `critical=0`, `high=1`, `info=1`; Spark D unreachable |

## Runtime Checker Summary

With `--timeout-ms 5000`, the checker still reported:

- `senior-reviewer-agent`: `endpoint_status=unreachable`
- `latency_ms=2045`
- `timed_out=false`
- finding: `model_runtime.endpoint_unreachable`
- severity: `high`

Other required Spark routes returned `ok` during the same check:

- Spark A: `http://192.168.0.128:8001`
- Spark B: `http://192.168.0.188:8001`
- Spark C: `http://192.168.0.99:8001`

MealCam remained optional/offline and non-blocking.

## Classification

`SPARK_D_ENDPOINT_DOWN`

Reason:

- The Spark D host `192.168.0.101` is reachable by ICMP.
- TCP connection to port `8001` fails.
- `/v1/models` and `/health` cannot connect.
- The 5 second runtime check did not show a slow timeout; it failed quickly as unreachable.
- The route configuration matches the documented Spark D endpoint and expected model, so there is no evidence of `ROUTING_CONFIG_WRONG`.
- The model list endpoint is unavailable, so `SPARK_D_MODEL_MISSING` cannot be evaluated until the HTTP service is reachable.

## Gate Impact

Autonomous, night, and large runs remain blocked while Spark D is unavailable, because the senior reviewer route is a required runtime route and the model runtime checker reports a high finding.

Product work remains closed unless Tom explicitly opens it. This diagnosis does not open the product gate.

## Recommended Next Safe Step

Tom should inspect or restart the Spark D vLLM/OpenAI-compatible service on `192.168.0.101:8001`, then rerun:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\model-runtime-check.ts --check-endpoints --timeout-ms 5000 --json
```
