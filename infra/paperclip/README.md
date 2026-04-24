# Paperclip — WO Visualisierung

Paperclip ist das visuelle Frontend für die LumeOS Work Order Pipeline.

## Zweck

Paperclip liest aus der lokalen Supabase und zeigt an:
- Work Orders (Status, History, Timeline)
- Governance Artefakte
- Failure Events
- Execution Tokens / Audit Trail

## Was Paperclip NICHT ist

- Kein Agent Orchestrator
- Keine Logik-Schicht
- Keine Approval Gates
- Keine Heartbeats

Die gesamte Logik liegt in unserem System:
SAT-Check (9001) · Scheduler (9002) · Governance Compiler (9003) · Spark A/B

## Starten

```powershell
cd C:\Users\User\paperclip
pnpm dev
# UI: http://localhost:3100
```

## Bekannte Probleme

- embedded Postgres Startup Timing Bug → siehe docs/todos/paperclip-windows-fix.md
