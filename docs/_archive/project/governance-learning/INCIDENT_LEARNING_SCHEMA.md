# Incident Learning Schema

Use this schema for every governance incident learning record.

## Markdown Template

```markdown
# Incident: <short title>

## Metadata

- incident_id: GOV-YYYYMMDD-###
- date: YYYY-MM-DD
- layer:
- severity: critical | high | medium | low
- status: open | fixed | monitored | accepted-risk
- product_work_blocked: yes | no
- autonomous_operator_blocked: yes | no

## Summary

One paragraph describing what happened and why it mattered.

## Root Cause

Concrete cause. Avoid vague labels like "model error" unless the model contract failure is described.

## Trigger

What exposed the incident:

- command:
- workorder:
- run_id:
- approval_id:
- stop_rule:

## Fix

- commit:
- files:
- behavior changed:

## Regression Test

- test_file:
- test_name:
- command:

If no regression test exists, explain why and mark `status: open`.

## Durable Rule

- rule_file:
- rule_text:

## Memory Update

- handover_updated: yes | no
- canonical_memory_updated: yes | no
- agent_contract_updated: yes | no
- workorder_template_updated: yes | no

## Recurrence Detector

Describe how the system will catch this class next time.

If no detector exists, state the missing checker and target governance batch.

## Follow-up

Exact next follow-up or "none".
```

## Machine-Readable Shape

Future tooling should be able to emit this JSON shape:

```json
{
  "incident_id": "GOV-YYYYMMDD-001",
  "date": "YYYY-MM-DD",
  "layer": "approval_lifecycle",
  "severity": "high",
  "status": "fixed",
  "product_work_blocked": true,
  "autonomous_operator_blocked": true,
  "summary": "",
  "root_cause": "",
  "trigger": {
    "command": "",
    "workorder_id": "",
    "run_id": "",
    "approval_id": "",
    "stop_rule": ""
  },
  "fix": {
    "commit": "",
    "files": [],
    "behavior_changed": ""
  },
  "regression_test": {
    "test_file": "",
    "test_name": "",
    "command": ""
  },
  "durable_rule": {
    "rule_file": "",
    "rule_text": ""
  },
  "memory_update": {
    "handover_updated": false,
    "canonical_memory_updated": false,
    "agent_contract_updated": false,
    "workorder_template_updated": false
  },
  "recurrence_detector": "",
  "follow_up": ""
}
```

## Severity Guidance

- critical: can bypass governance, corrupt production, or make Tom manually repair lifecycle state.
- high: blocks operator autonomy or can recur during normal batch execution.
- medium: causes extra manual review or merge risk without bypassing safety.
- low: documentation or ergonomics gap with limited operational impact.

