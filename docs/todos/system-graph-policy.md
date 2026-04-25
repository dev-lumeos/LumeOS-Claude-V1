# TODO: system/graph/ — Graph Core Policy

# Status: OFFEN — wartet auf Spark C+D

# Erstellt: 24. April 2026

## Was fehlt

`system/graph/` ist leer. Hier soll die Graph-Policy für den WO Dependency Graph liegen.

## Was rein soll

graph_policy_v1.md:

- Wie WOs voneinander abhängen
- Cycle Detection Regeln (packages/graph-core bereits implementiert)
- Readiness Calculation (wann ist ein WO bereit zum Dispatch)
- Graph Repair Policy (was passiert bei graph_repair_pending State)

## Prompt für Opus wenn bereit

```
Erstelle system/graph/graph_policy_v1.md.

Basis: packages/graph-core/src/ (cycle detection, readiness calculator)
       system/workorders/lifecycle/wo_lifecycle_v1.md

Dokumentiere:
1. WO Dependency Graph Struktur (phases, dependencies Felder)
2. Cycle Detection — wann wird ein WO abgelehnt
3. Readiness Calculation — alle Kriterien damit state→ready
4. Graph Repair Policy — was passiert bei graph_repair_pending
5. Phase-basiertes Scheduling (phase 1 vor phase 2 etc.)
```
