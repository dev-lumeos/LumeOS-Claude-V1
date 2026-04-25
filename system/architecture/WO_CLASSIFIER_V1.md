# WO_CLASSIFIER_V1.md — LUMEOS Workorder Classifier & Pre-Router
# Version: 1.0 | Basis für Implementierung

# Vollständiger Inhalt: wurde als Upload bereitgestellt
# Implementierungs-Prompt: docs/prompts/opus_wo_classifier.md
# TODO Spark C+D: docs/todos/spark-cd-integration.md

## Kernkonzept
Deterministischer Pre-Router VOR dem Scheduler. Regelbasiert, kein LLM. Port 9000.

## Spark Routing
- Spark A (spark_a): Governance, Planning, High-Risk Analysis, Eskalation
- Spark B (spark_b): Precision, Migration, Auth, DB Write/High-Risk
- Spark C (spark_c): Bulk Execution, Low/Medium Implementation — kommt mit Hardware
- Spark D (spark_d): Specialist, QA, DB-Check, Acceptance Verifier — kommt mit Hardware

## Pflichtfelder jeder WO
id, title, type, module, complexity, risk, requires_reasoning,
requires_schema_change, db_access, files_allowed, acceptance_criteria, created_by

## Reject-Regeln
- Pflichtfelder fehlen
- files_allowed enthält nur "*"
- requires_schema_change=true AND created_by != 'human'
- Duplicate WO (gleicher wo_id in letzten 24h)

## WO Types
implementation | review | migration | docs | test | analysis | planning | governance

## WO Modules
nutrition | training | coach | supplement | medical | auth | infra | marketplace | cross

## Priority
0=CRITICAL, 1=HIGH (risk=high), 2=NORMAL, 3=LOW (docs/i18n)
