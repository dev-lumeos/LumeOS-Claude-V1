# Grafana Dashboard Setup — LumeOS Work Order Pipeline
# Grafana läuft bereits auf http://localhost:3001
# Login: admin / lumeos2026

---

## Was du tun sollst

Richte ein vollständiges Grafana Dashboard ein das den LumeOS WO Pipeline Status
visuell darstellt. Grafana verbindet sich mit unserer lokalen Supabase Postgres DB.

---

## Schritt 1: Postgres Datasource konfigurieren

Nutze die Grafana HTTP API um die Datasource einzurichten:

```bash
curl -s -X POST http://admin:lumeos2026@localhost:3001/api/datasources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "LumeOS Supabase",
    "type": "postgres",
    "url": "host.docker.internal:54322",
    "database": "postgres",
    "user": "postgres",
    "secureJsonData": { "password": "postgres" },
    "jsonData": {
      "sslmode": "disable",
      "maxOpenConns": 5,
      "maxIdleConns": 5,
      "connMaxLifetime": 14400,
      "postgresVersion": 1500,
      "timescaledb": false
    }
  }'
```

---

## Schritt 2: Dashboard als JSON importieren

Erstelle das Dashboard via API. Das Dashboard soll folgende Panels enthalten:

### Panel 1 — WO Status Übersicht (Stat Panels, oben)
4 Stat Panels nebeneinander:
- Total WOs: `SELECT COUNT(*) FROM workorders`
- Pending: `SELECT COUNT(*) FROM workorders WHERE state = 'pending'`
- Running: `SELECT COUNT(*) FROM workorders WHERE state = 'running'`
- Failed: `SELECT COUNT(*) FROM workorders WHERE state = 'failed'`

### Panel 2 — WO Timeline (Time Series)
WOs erstellt über Zeit:
```sql
SELECT
  date_trunc('hour', created_at) as time,
  COUNT(*) as workorders
FROM workorders
GROUP BY 1
ORDER BY 1
```

### Panel 3 — Failure Events (Table)
Letzte 20 Failures:
```sql
SELECT
  wo_id,
  failure_class,
  attempt,
  node,
  timestamp
FROM wo_failure_events
ORDER BY timestamp DESC
LIMIT 20
```

### Panel 4 — Governance Artefakte (Stat)
```sql
SELECT COUNT(*) FROM governance_artefacts
```

### Panel 5 — WO Status Verteilung (Pie Chart)
```sql
SELECT state, COUNT(*) as count
FROM workorders
GROUP BY state
```

### Panel 6 — Letzte Work Orders (Table)
```sql
SELECT
  wo_id,
  state,
  agent_type,
  created_at,
  artefakt_hash
FROM workorders
ORDER BY created_at DESC
LIMIT 10
```

### Panel 7 — Execution Tokens (Stat)
```sql
SELECT COUNT(*) FROM execution_tokens
```

### Panel 8 — Failure Rate % (Gauge)
```sql
SELECT
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE state = 'failed') / NULLIF(COUNT(*), 0),
    1
  ) as failure_rate
FROM workorders
```

---

## Schritt 3: Dashboard via API erstellen

Erstelle `infra/grafana/dashboard.json` mit dem kompletten Dashboard JSON.
Dann importiere es:

```bash
curl -s -X POST http://admin:lumeos2026@localhost:3001/api/dashboards/db \
  -H "Content-Type: application/json" \
  -d @infra/grafana/dashboard.json
```

---

## Schritt 4: Dashboard als Default setzen

```bash
# Hole die Dashboard UID aus dem Import Response
# Dann setze es als Home Dashboard
curl -s -X PUT http://admin:lumeos2026@localhost:3001/api/org/preferences \
  -H "Content-Type: application/json" \
  -d '{"homeDashboardUID": "<UID_AUS_STEP_3>"}'
```

---

## Schritt 5: Auto-Refresh konfigurieren

Das Dashboard soll alle 10 Sekunden auto-refreshen.
In der Dashboard JSON: `"refresh": "10s"`

---

## Schritt 6: Startup Script

Erstelle `tools/scripts/start-grafana.ps1`:
```powershell
# Startet Grafana Docker Container
# UI: http://localhost:3001
# Login: admin / lumeos2026

$running = docker ps --filter "name=grafana" --format "{{.Names}}"
if ($running -eq 'grafana') {
    Write-Host 'Grafana already running on http://localhost:3001'
} else {
    docker start grafana 2>$null
    if ($LASTEXITCODE -ne 0) {
        docker run -d -p 3001:3000 `
            --name=grafana `
            --add-host=host.docker.internal:host-gateway `
            -e GF_SECURITY_ADMIN_PASSWORD=lumeos2026 `
            grafana/grafana
    }
    Write-Host 'Grafana started on http://localhost:3001'
}
```

---

## Schritt 7: Dokumentation updaten

Update `infra/grafana/README.md`:
```markdown
# Grafana — LumeOS WO Dashboard

UI: http://localhost:3001
Login: admin / lumeos2026

Zeigt: WO Status, Timeline, Failures, Artefakte, Execution Tokens

Starten: tools/scripts/start-grafana.ps1
```

---

## WICHTIG

- Grafana läuft in Docker → Supabase ist auf `host.docker.internal:54322` erreichbar
- Nicht `localhost` verwenden — das ist der Docker Container selbst
- Dashboard auto-refresh: 10 Sekunden
- Dark Mode ist bereits Grafana Standard
- Keine Logins in die UI nötig — alles via API konfigurieren

## Verificierung am Ende

```bash
# Prüfe ob Datasource verbunden ist
curl -s http://admin:lumeos2026@localhost:3001/api/datasources

# Prüfe ob Dashboard existiert
curl -s http://admin:lumeos2026@localhost:3001/api/dashboards/home
```

Dann öffne http://localhost:3001 und prüfe ob alle 8 Panels Daten zeigen.
