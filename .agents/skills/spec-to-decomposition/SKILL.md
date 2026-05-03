---

## name: spec-to-decomposition description: Converts a feature spec into a decomposition_spec_v1. Use when ready to break down a spec into implementable subtasks for the WO Factory.

# Skill: spec-to-decomposition

## Aufgabe

Nimm eine Feature Spec und erzeuge eine `decomposition_spec_v1`.

## Pflicht-Checks vor Start

1. Lies: `system/decomposition/schemas/decomposition_spec_v1.md`
2. Lies: `system/file-groups/file_group_registry_v1.md`
3. Lies: `system/agent-registry/agent_registry_v2.md`
4. Lies: `system/model-tiers/model_tiers_v2.md`

## Entscheidung: Micro oder Macro?

Prüfe jeden Subtask:

- Scope &gt; 3 Files → Macro WO Kandidat
- Mehrere Layer → Macro WO Kandidat
- Tight coupling → Macro WO Kandidat
- Sonst → Micro WO

## Regeln

- Ein Subtask = ein Layer
- known_file_groups nur aus Registry
- Intent muss konkret sein (kein "improve", "refactor")
- acceptance_hint Pflicht
- Discovery-Subtask wenn known_files leer

## Output

Validiere gegen Regeln R1-R20 aus der Decomposition Spec. Speichere in: `system/decomposition/specs/{feature_id}_decomp.yaml`

## Wann nutzen

- Nach rawdata-to-spec
- Vor decomposition-to-workorders
