# TODO: Orchestrator Service — Automatischer WO Pipeline Loop
# Status: OFFEN — wartet auf Spark C+D
# Erstellt: 24. April 2026

---

## Idee

Der Orchestrator überwacht die workorders Tabelle in Supabase und steuert
den kompletten WO Lifecycle automatisch — ohne manuellen Eingriff von Tom.

Tom insertet einen WO → Rest passiert automatisch.

---

## Warum auf Spark C+D warten?

Spark C (122B Orchestrator) soll das intelligente Routing übernehmen.
Der Orchestrator Service wird dann das 122B Modell für komplexe
Routing-Entscheidungen nutzen die über die deterministischen Classifier-Regeln hinausgehen.

---

## Geplante Architektur

```
Tom / Brain erstellt WO und insertet in Supabase (state: wo_generated)
  ↓
Orchestrator Service (Port 9005) — Supabase Realtime Subscription
  ↓ prüft alle 5s auf state = 'wo_generated'
  ↓
  1. POST /classify (Port 9000) → routing.assigned_spark
  2. classifierOutputToWorkOrder() → Mapping
  3. POST /compile (Port 9003, Spark A) → GovernanceArtefaktV3
  4. POST /check (Port 9001) → SAT-Check
  5. createExecutionToken() → Ed25519
  6. Supabase UPDATE state = 'dispatched'
  7. vLLM Call auf assigned_spark
  8. triple_hash Verification
  9. Supabase UPDATE state = 'done'
  ↓
Grafana zeigt Status live
```

---

## Service Gerüst (bereits vorhanden)

`services/orchestrator-api/` existiert bereits im Repo — ist aber leer (Skeleton).

---

## Implementation wenn Spark C+D da sind

Sag Opus dann:

```
services/orchestrator-api/ implementieren als automatischer WO Pipeline Loop.

Stack: Hono, Port 9005, TypeScript
Supabase Realtime: subscribiert auf workorders WHERE state = 'wo_generated'

Für jede neue WO automatisch ausführen:
1. POST localhost:9000/classify
2. classifierOutputToWorkOrder() mapping
3. POST localhost:9003/compile (Spark A)
4. POST localhost:9001/check
5. createExecutionToken()
6. Supabase UPDATE state = dispatched
7. vLLM Call auf routing.assigned_spark
8. triple_hash verify
9. Supabase UPDATE state = done / failed

Spark C (122B) für komplexe Routing-Entscheidungen wenn
SPARK_C_AVAILABLE = true in services/wo-classifier/src/rules/index.ts

Startup Script: tools/scripts/start-orchestrator.ps1
CLAUDE.md updaten: Port 9005 unter Services
```

---

## Monitoring

Wenn Orchestrator läuft sieht man in Grafana WO Pipeline Dashboard:
- WOs fliessen automatisch durch alle States
- Timeline zeigt den Durchsatz
- Failure Rate wird aussagekräftig
