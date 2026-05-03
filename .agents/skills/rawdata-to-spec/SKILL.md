---
name: rawdata-to-spec
description: Converts structured raw data into a formal feature spec. Use after chat-to-rawdata to create a proper spec document.
---

# Skill: rawdata-to-spec

## Aufgabe

Nimm Raw Data (v1) und erzeuge eine formale Feature Spec.

## Output Format

```yaml
spec_version: v1
feature_id: string          # snake_case
title: string
module: string
status: draft
created: {date}
objective: [string]
constraints: [string]
non_goals: [string]
open_questions: [string]
affected_modules: [string]
estimated_complexity: low|medium|high
notes: string
```

## Regeln

- objective = Was erreicht werden soll (kein Wie)
- constraints = harte Grenzen
- non_goals = explizit was NICHT gemacht wird
- Spec bleibt auf Feature-Ebene — keine Subtasks hier

## Speichern

Output in: `docs/specs/{feature_id}_spec.md`
Entscheidungen in: `docs/decisions/`

## Wann nutzen

- Nach chat-to-rawdata
- Vor spec-to-decomposition
