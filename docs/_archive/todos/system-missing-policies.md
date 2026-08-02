# TODO: system/policies/ — Fehlende Policies

# Status: OFFEN

# Erstellt: 24. April 2026

## Was leer ist

```
system/policies/promotion/   → WO Promotion Policy (wann eskaliert ein WO)
system/policies/review/      → Review Policy (wann braucht ein WO Review)
```

## Warum warten

- Promotion: braucht Eskalationskette (Spark C→B→A) — kommt mit Spark C+D
- Review: braucht Review-Agent auf Spark D — kommt mit Spark D

## Was rein soll

### policies/promotion/promotion_policy_v1.md

Wann wird ein WO von Spark C→B oder B→A eskaliert:

- FAIL nach X Attempts → Eskalation
- triple_hash FAIL → sofort Spark A
- Acceptance FAIL → Spark D Review
- DB_CHECK FAIL → BLOCKED + Human

### policies/review/review_policy_v1.md

Wann braucht ein WO einen Review vor dem Commit:

- type=migration → immer Review
- risk=high → immer Review
- requires_schema_change → immer Review
- Cross-Module changes → immer Review
- docs/test → optional Review

## Prompt für Opus wenn bereit

```
Spark C+D sind verfügbar. Erstelle:

1. system/policies/promotion/promotion_policy_v1.md
   Eskalationskette: C→B→A, wann + warum
   Basis: SCHEDULER_INTERFACE_V1.md (Retry/Eskalation Sektion)

2. system/policies/review/review_policy_v1.md
   Wann Review nötig, welcher Agent reviewt, Acceptance Criteria
   Basis: WO_CLASSIFIER_V1.md (Spark D Review Rules)
```
