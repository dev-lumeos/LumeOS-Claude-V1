# Governance Artefakt Schema V3.0 — LumeOS
# Status: FESTGEZOGEN — 23. April 2026

---

## Übersicht

Das Governance-Artefakt ist das zentrale Protokoll zwischen DGX A und DGX B.
Es ist immutable — jede Änderung erzwingt einen neuen Compile-Durchlauf.

---

## Schema

```yaml
# META — Immutable Header
meta:
  schema_version: "3.0.0"
  wo_id: "WO-nutrition-diary-001"
  source_macro: "opus-4.6-20260423-uuid"
  compiled_by: "qwen3.5-35b-a3b-dgx-a"
  compiled_at: "2026-04-23T11:06:00Z"
  artefakt_hash: "sha256:7f83b165..."   # Über alle Felder außer diesem Hash

# EXECUTION CONTEXT
execution_context:
  target_files:
    - path: "services/nutrition-api/src/routes/diary.ts"
      max_lines_changed: 50
      must_exist: true
      checksum_before: "sha256:abc..."   # Deterministischer Patch

  forbidden_patterns:
    imports: ["axios", "fetch", "lodash"]
    functions: ["eval", "exec", "Function constructor"]
    regex: ["\/\/\sHACK", "TODO\\s\\(urgent\\)"]

  required_types:
    - name: "DiaryDay"
      fields: ["entry_date: ISO8601Date", "meals: MealLog[]"]
      immutability: true

  interface_contracts:
    - function: "getDiaryDay"
      inputs: ["userId: UUID", "date: ISO8601Date"]
      outputs: ["DiaryDay | null"]
      side_effects: "none"
      max_cyclomatic: 5

# DETERMINISM — Kein Spielraum
determinism:
  temperature: 0.0
  seed: 42
  top_p: 1.0
  top_k: 1
  repetition_penalty: 1.0

# ACCEPTANCE GATES
acceptance_gates:
  static:
    - type: "ast_parse"
      must_pass: true
    - type: "typecheck"
      command: "tsc --noEmit"
      must_pass: true

  dynamic:
    - type: "unit_test"
      test_file: "tests/diary_day.spec.ts"
      coverage_min: 80
    - type: "property_test"
      invariant: "response.status === 200 && response.body.entry_date exists"
      iterations: 1000

  determinism:
    - type: "triple_hash"
      description: "Generiere 3x mit identischem Seed, vergleiche AST-Hash"
      variance_tolerance: 0   # Identisch oder Reject

# FAILURE HANDLING
failure_handling:
  on_acceptance_fail: "reject_and_recompile"
  max_recompile_attempts: 3
  pattern_detection:
    same_failure_3x:
      action: "recompile_with_tighter_constraints"
      target: "dgx_a"
    mixed_failures_3x:
      action: "escalate_to_macro_layer"
      target: "opus_sonnet_kimi"
  on_max_exceeded: "escalate_to_human"
```

---

## Regeln

- artefakt_hash ist SHA-256 über alle Felder außer artefakt_hash selbst
- Jede Änderung am Artefakt = neuer Hash = neuer Compile-Durchlauf
- checksum_before verhindert blinde Überschreibungen
- triple_hash: variance_tolerance: 0 bedeutet bitidentisch oder Reject

*Governance Artefakt Schema V3.0 — FESTGEZOGEN*
