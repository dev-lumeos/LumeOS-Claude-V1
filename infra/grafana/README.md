# Grafana — LumeOS WO Dashboard

**UI:** http://localhost:3001
**Login:** `admin` / `lumeos2026`

## Dashboard

`LumeOS — WO Pipeline` (UID `lumeos-wo-pipeline`) — set as org home.

Panels:
- **Stats (top row)**: Total / Pending (pre-dispatch) / Running / Failed WOs
- **Timeline**: WO creation per hour (last 24h, respects time filter)
- **Stats (right column)**: Governance Artefakte, Execution Tokens counts
- **Pie**: WO state distribution (donut, grouped by `wo_state` enum)
- **Gauge**: Failure rate % (thresholds: green <5, yellow 5–15, orange 15–30, red ≥30)
- **Table**: Last 20 failure events (color-coded by `failure_class`)
- **Table (bottom)**: Last 10 work orders with joined `artefakt_hash` from `execution_tokens`

Auto-refresh: 10s. Time range: last 24h.

## Datasource

`LumeOS Supabase` (UID `afk0u20la5ji8d`), type `grafana-postgresql-datasource`.
Connects via `host.docker.internal:54322` (Grafana is a Docker container; `localhost`
would resolve to the container itself, not the host).

## Schema Notes (adapted from prompt)

The prompt's SQL uses `state = 'pending'` and `'completed'` — our `wo_state` enum
has neither. Mappings:

| Prompt concept | Our enum states |
|---|---|
| Pending | `wo_generated`, `graph_validated`, `queue_released`, `blocked`, `ready`, `retry_scheduled`, `graph_repair_pending` |
| Running | `dispatched`, `running` |
| Done    | `done` |
| Failed  | `failed` |

Column name differences:
- `wo_failure_events.attempt` → `wo_failure_events.attempt_number`
- `workorders.artefakt_hash` does not exist → joined via `execution_tokens.artefakt_hash` on `execution_token_id`

## Starten

```powershell
pwsh tools/scripts/start-grafana.ps1
```

## Re-Import des Dashboards

```bash
curl -s -X POST "http://admin:lumeos2026@localhost:3001/api/dashboards/db" \
  -H "Content-Type: application/json" \
  --data-binary @infra/grafana/dashboard.json
```

Die Dashboard-JSON hat `overwrite: true`, also aktualisiert ein Re-Import die
bestehende Version (Versionsnummer inkrementiert automatisch).

## Verifikation

```bash
# Datasources
curl -s "http://admin:lumeos2026@localhost:3001/api/datasources" | jq

# Dashboard
curl -s "http://admin:lumeos2026@localhost:3001/api/dashboards/uid/lumeos-wo-pipeline" | jq '.dashboard.title, .meta.url'

# Home-Dashboard
curl -s "http://admin:lumeos2026@localhost:3001/api/org/preferences" | jq
```
