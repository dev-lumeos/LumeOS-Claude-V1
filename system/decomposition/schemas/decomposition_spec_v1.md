# Decomposition Spec V1 — FINAL

---

## Zweck

Vorvertrag zwischen Planning Layer, Orchestrator und WO Factory.
WO Factory akzeptiert ausschließlich `decomposition_spec_v1`.

---

## Root Schema

```yaml
decomposition_spec_version: v1
feature_id: string                  # snake_case, eindeutig
title: string
module: string                      # genau ein primäres Modul
objective: [string]                 # 1-10 Zielbilder
constraints: [string]
non_goals: [string]
layers_affected: [string]           # types|service|ui|tests|docs|infra|config|db|meta
infra_override_approved: false
infra_override_actor: null
subtasks: [Subtask]
```

---

## Subtask Schema

```yaml
- id: string                        # eindeutig, snake_case
  layer: string                     # genau ein Layer
  intent: string                    # präzise Zielbeschreibung
  known_files: [string]
  known_file_groups: [string]       # nur Werte aus file_group_registry_v1
  contracts: [string]
  depends_on: [subtask_id]
  conflicts_with: [subtask_id]
  constraints: [string]
  non_goals: [string]
  acceptance_hint:
    auto_checks: [string]
    review_checks: [string]
    human_checks: [string]          # mind. eine Liste nicht leer
```

---

## Validierungsregeln

| Nr | Regel | Typ |
|----|-------|-----|
| R1 | version muss v1 sein | Error |
| R2 | module genau ein Wert | Error |
| R3 | layers_affected nur genutzte Layer | Warning |
| R4 | infra ohne Override | Error |
| R5 | infra_override braucht actor: human | Error |
| R6 | subtask.id eindeutig | Error |
| R7 | layer genau einer | Error |
| R8 | kein Layer-Mix | Error |
| R9 | known_files ODER known_file_groups gesetzt | Error |
| R10 | known_file_groups nur Registry-Werte | Error |
| R11 | depends_on nur bekannte IDs | Error |
| R12 | conflicts_with nur bekannte IDs | Error |
| R13 | keine Selbstreferenz | Error |
| R14 | keine Zyklen in depends_on | Error |
| R15 | kein Layer-Mix pro Subtask | Error |
| R16 | acceptance_hint mind. eine Liste | Error |
| R17 | gleiche known_files ohne conflicts_with | Error |
| R18 | kein vager intent (improve, refactor broadly) | Error |
| R19 | intent = konkretes Ziel | Error |
| R20 | leere known_files → depends_on auf Discovery-Subtask Pflicht | Error |

---

## Discovery-Subtask Pattern

```yaml
- id: discover_{scope}
  layer: service
  intent: "locate all usages of {symbol} in {scope}"
  known_file_groups:
    - services/{domain}-api
  acceptance_hint:
    auto_checks:
      - output contains file list
      - output contains reference map
```

## Ableitungsregeln für WO Factory

| Feld | Quelle |
|------|--------|
| `phase` | types→1, service/config/db→2, ui/tests/docs→3 |
| `blocked_by` | depends_on |
| `conflicts_with` | explizit + Dateiüberschneidung |
| `agent_type` | Layer → Agent Registry |
| `acceptance` | aus acceptance_hint |

## Wer erstellt die Spec?

| Phase | Actor |
|-------|-------|
| Entwurf | Du + gstack |
| Strukturierung | spec-analyst (Claude Code) |
| Freigabe | Du (manuell: spec_approved_for_decomposition) |
| WO-Generierung | wo-writer (Claude Code) → WO Factory |

**V1: Trigger immer manuell.**

---

## Beispiel

```yaml
decomposition_spec_version: v1
feature_id: nutrition_diary_restore_v1
title: Restore nutrition diary against new schema
module: nutrition
objective:
  - restore diary flow against new schema
  - replace legacy field usage
constraints:
  - no changes outside nutrition scope
non_goals:
  - no redesign of diary UX
layers_affected:
  - types
  - service
  - ui
subtasks:
  - id: types_diary_day
    layer: types
    intent: "update DiaryDay type to include entry_date and target_* fields"
    known_files:
      - packages/types/src/nutrition/diary.ts
    depends_on: []
    acceptance_hint:
      auto_checks:
        - type contains entry_date
        - type contains target_calories
```

---

*Decomposition Spec V1 — festgezogen*
