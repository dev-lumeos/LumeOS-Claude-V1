# Retry Policy V1

---

## Retry Escalation

```
Attempt 1: default_assignment (Standard Agent + Modell)
Attempt 2: same_agent_optimized
  - extended_context
  - alternate_node
  - stricter_scope_mode
Attempt 3: escalated_tier
  - quality_coder (Spark B)
  - primary_escalation: claude_code_opus
  - fallback: openrouter
→ Human Review (zwingend nach max_attempts)
```

---

## Failure Class Routing

ClassPfad`technical_transient`auto_retry → attempt2 → attempt3 → reviewed`technical_persistent`node_override → attempt2 → reviewed`semantic_output`attempt2 + extended_context → attempt3 stronger_model → reviewed`scope_violation`attempt2 stricter_scope → reviewed`dependency_invalid`→ graph_repair_pending (kein Model-Retry)`guardrail_violation`→ sofort reviewed (kein Auto-Retry)

---

## Starvation Prevention

Nach 3 Scheduler-Loops ohne Dispatch: → Retry-WO rückt vor normale FIFO desselben Tiers

---

## Retry Context Annotations

```yaml
retry_context:
  attempt_number: 2
  reason: technical_persistent
  node_override: true
  previous_node: spark-a
  next_node: spark-b
```
  model_tier_override: false
  extended_context: false
  stricter_scope_mode: false
```

---

*Retry Policy V1 — festgezogen*
