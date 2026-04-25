---

## name: decomposition-to-workorders description: Generates a WO batch from a decomposition_spec_v1. Use to create the actual work orders that will be executed by the DGX agents.

# Skill: decomposition-to-workorders

## Aufgabe

Nimm eine `decomposition_spec_v1` und erzeuge einen WO Batch.

## Pflicht-Checks vor Start

1. Lies: `system/workorders/schemas/wo_factory_spec_v1.md`
2. Lies: `system/agent-registry/agent_registry_v1.md`
3. Lies: `system/policies/gsd-v2/gsd_v2.md`

## WO Erzeugung pro Subtask

Für jeden Subtask:
1. Bestimme: Micro oder Macro?
2. Weise Agent zu (via Layer → Agent Mapping)
3. Setze Phase (types=1, service/db=2, ui/tests=3)
4. Leite blocked_by aus depends_on ab
5. Leite conflicts_with aus conflicts_with + Dateiüberschneidung ab
6. Transformiere acceptance_hint → acceptance

## WO Naming

`WO-{feature_id}-{zero_padded_seq}`

## Output

```yaml
wo_batch:
  batch_id: string
  feature_id: string
  generated_at: timestamp
  workorders: [WorkOrder]
  validation_report:
    status: valid|invalid|valid_with_warnings
```

Speichere in: `system/workorders/batches/{feature_id}_batch.yaml`

## Wann nutzen

- Nach spec-to-decomposition
- Nur mit gültigem decomposition_spec_v1
