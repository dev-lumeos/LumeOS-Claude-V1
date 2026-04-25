# TODO: system/memory/ — Memory Layer Policies

# Status: OFFEN — wartet auf Spark C+D + Orchestrator

# Erstellt: 24. April 2026

## Was leer ist

```
system/memory/events/      → Memory Event Schema
system/memory/execution/   → Execution Memory (was hat Spark X getan)
system/memory/learning/    → Learning/Feedback Loop
system/memory/promotions/  → Memory Promotion Rules (short→long term)
system/memory/retrieval/   → Retrieval Policy
```

## Warum warten

Memory Layer macht erst Sinn wenn:

- Orchestrator Service läuft (Port 9005)
- Spark C/D verfügbar sind
- claude-mem vollständig aktiv ist (Session Hooks)

## Was rein soll (wenn bereit)

### memory/events/

Schema für Memory Events:

- WO_COMPLETED — was wurde gebaut
- WO_FAILED — was ist schiefgelaufen + warum
- PATTERN_DETECTED — wiederkehrendes Problem erkannt

### memory/execution/

Pro Spark: welche WOs wurden ausgeführt, mit welchem Erfolg. Basis für Routing-Optimierung (Spark B ist besser für X als Y).

### memory/learning/

Feedback Loop:

- acceptance_verified=false → was war das Problem
- triple_hash FAIL → welches Modell war instabil
- Automatische Anpassung der Routing-Regeln

### memory/promotions/

Wann wird eine Session-Memory zu Langzeit-Memory promoted:

- Nach N erfolgreichen WOs gleichen Typs
- Nach manueller Bestätigung durch Tom

### memory/retrieval/

Wie sucht der Orchestrator in der Memory:

- Semantic Search via LightRAG
- Filter nach Spark, Module, Type
- Recency vs Relevance Weighting

## Prompt für Opus wenn bereit

```
Lies system/memory/canonical/memory_schemas_v1.md
und claude-mem Dokumentation (http://localhost:37777).

Erstelle die 5 Memory Policy Dokumente in system/memory/:
- events/memory_events_v1.md
- execution/execution_memory_v1.md
- learning/learning_policy_v1.md
- promotions/promotion_rules_v1.md
- retrieval/retrieval_policy_v1.md

Basis: claude-mem als Storage Backend, LightRAG für Semantic Search.
```
