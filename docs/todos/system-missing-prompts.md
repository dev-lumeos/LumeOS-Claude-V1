# TODO: system/prompts/ — Fehlende Prompt-Dateien

# Status: OFFEN — wartet auf Spark C+D

# Erstellt: 24. April 2026

## Was leer ist

```
system/prompts/gstack/        → GStack Prompts
system/prompts/orchestration/ → Orchestrator Prompts (Port 9005)
system/prompts/review/        → Review Agent Prompts
system/prompts/wo-factory/    → WO Factory Prompts (WO automatisch erstellen)
```

## Details

### prompts/orchestration/

Prompts für den Orchestrator Service (Port 9005, Spark C 122B):

- `orchestrator_main_prompt.md` — Haupt-Prompt für Orchestrator
- `wo_dispatch_prompt.md` — Entscheidung wann/wie WO dispatcht wird
- `health_check_prompt.md` — System Health Bewertung

### prompts/review/

Prompts für Review Agent (Spark D):

- `review_agent_prompt.md` — Code Review Prompt
- `acceptance_check_prompt.md` — Acceptance Criteria prüfen
- `db_check_prompt.md` — Schema/RLS Validation

### prompts/wo-factory/

Prompts damit Spark A/C automatisch neue WOs erstellen kann:

- `wo_factory_prompt.md` — WO aus Intent generieren
- `wo_decomposition_prompt.md` — Großes WO in kleine WOs aufteilen

### prompts/gstack/

GStack = Governance Stack Prompts:

- Prompts die alle Governance-Stufen koordinieren
- Aktuell noch nicht definiert — wird mit Orchestrator klarer

## Prompt für Opus wenn bereit

```
Spark C+D sind verfügbar, Orchestrator Service läuft (Port 9005).

Erstelle die fehlenden Prompts:

1. system/prompts/orchestration/orchestrator_main_prompt.md
   Basis: docs/todos/orchestrator-service.md
   Spark C (122B) als Orchestrator

2. system/prompts/review/review_agent_prompt.md
   Basis: .claude/agents/review-agent.md
   Spark D als Review Agent

3. system/prompts/wo-factory/wo_factory_prompt.md
   WO aus Intent erstellen gemäss WO_CLASSIFIER_V1.md Templates

4. system/prompts/wo-factory/wo_decomposition_prompt.md
   Macro-WO → mehrere Micro-WOs aufteilen
```
