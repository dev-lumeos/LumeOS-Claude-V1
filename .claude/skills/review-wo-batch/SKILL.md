---
name: review-wo-batch
description: Reviews a generated WO batch for quality, consistency and completeness. Use after decomposition-to-workorders before releasing to queue.
---

# Skill: review-wo-batch

## Aufgabe

Prüfe einen WO Batch auf Qualität bevor er in die Queue freigegeben wird.

## Prüfungen

### Struktur
- [ ] Alle wo_id eindeutig
- [ ] Alle agent_type in Registry vorhanden
- [ ] scope_files max 3 pro WO
- [ ] Jede WO hat acceptance mit mind. einer Liste

### Dependencies
- [ ] Keine Zyklen in blocked_by
- [ ] Alle blocked_by referenzieren existierende WOs
- [ ] Phase-Logik korrekt (types=1, service=2, ui=3)

### Qualität
- [ ] Tasks konkret (kein "improve", "refactor broadly")
- [ ] Intent klar und messbar
- [ ] Keine Scope-Explosion

### Micro vs Macro
- [ ] Macro WOs haben Acceptance Check markiert
- [ ] Micro WOs max 3 Files

## Output

```yaml
review_result:
  batch_id: string
  status: approved|rejected|approved_with_warnings
  issues: [string]
  warnings: [string]
  approved_wo_count: int
  rejected_wo_ids: [string]
```

## Wann nutzen

- Nach decomposition-to-workorders
- Vor queue_released
