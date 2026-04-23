# WO Lifecycle V1 — State Machine (FINAL)

---

## States

### Spec Layer
| State | Bedeutung |
|-------|-----------|
| `spec_draft` | Spec existiert, nicht freigegeben |
| `spec_approved_for_decomposition` | Manuell freigegeben für WO Factory |
| `spec_cancelled` | Spec zurückgezogen |

### WO Graph / Queue Layer
| State | Bedeutung |
|-------|-----------|
| `wo_generated` | WO Factory hat WO erzeugt inkl. phase / blocked_by / conflicts_with |
| `graph_validated` | Orchestrator hat Graph geprüft: Zyklen, Konsistenz, Readiness |
| `queue_released` | Subgraph freigegeben für Execution |

### WO Execution Readiness
| State | Bedeutung |
|-------|-----------|
| `blocked` | Logisch nicht ausführbar — offene blocked_by oder conflicts_with |
| `ready` | Logisch ausführbar — alle Blocker done/closed, keine Konflikte aktiv |
| `dispatched` | Scheduler hat Slot + Agent/Node zugewiesen |
| `running` | Worker hat WO begonnen |

### WO Outcome
| State | Bedeutung |
|-------|-----------|
| `done` | Worker meldet technisch erfolgreich — noch kein operativer Abschluss |
| `failed` | Worker konnte WO nicht abschließen — Failure Class wird gesetzt |

### WO Decision Layer
| State | Bedeutung |
|-------|-----------|
| `reviewed` | Human/Board/Review Layer hat Ergebnis bewertet |
| `retry_scheduled` | WO wird neu versucht — mit Retry Context Annotations |
| `closed` | Operativ abgeschlossen — keine weitere Aktion |
| `cancelled` | Bewusst abgebrochen — nicht mehr relevant, kein normaler Abschluss |

### Special Repair State
| State | Bedeutung |
|-------|-----------|
| `graph_repair_pending` | WO hat ungültigen Graph-Kontext — Orchestrator repariert Einordnung |

---

## Erlaubte Transitionen

```
spec_draft                        → spec_approved_for_decomposition  [Human]
spec_draft                        → spec_cancelled                    [Human]
spec_approved_for_decomposition   → wo_generated                      [WO Factory]
wo_generated                      → graph_validated                   [Orchestrator]
graph_validated                   → queue_released                    [Orchestrator/Human]
queue_released                    → blocked                           [Scheduler]
queue_released                    → ready                             [Scheduler]
blocked                           → ready                             [Scheduler — deterministisch]
blocked                           → cancelled                         [Human]
ready                             → dispatched                        [Scheduler]
ready                             → cancelled                         [Human]
dispatched                        → running                           [Worker]
dispatched                        → cancelled                         [Human]
dispatched                        → failed                            [Worker — pre-start failure]
running                           → done                              [Worker]
running                           → failed                            [Worker]
running                           → cancelled                         [Human]
done                              → reviewed                          [Human / Review Layer]
done                              → closed                            [Orchestrator — trivial WOs]
failed                            → retry_scheduled                   [Orchestrator — technical_transient / technical_persistent]
failed                            → reviewed                          [Review Layer — semantic_output / scope_violation / guardrail_violation]
failed                            → graph_repair_pending              [Orchestrator — dependency_invalid]
reviewed                          → retry_scheduled                   [Human / Review Layer]
reviewed                          → closed                            [Human / Review Layer]
retry_scheduled                   → ready                             [Scheduler]
graph_repair_pending              → graph_validated                   [Orchestrator]
```

---

## Trigger: blocked → ready
- **Actor:** Scheduler (deterministisch — NICHT Orchestrator)
- **Trigger:** Alle `blocked_by` WOs sind `done` oder `closed` + kein aktives `conflicts_with` + Phase freigegeben

## Trigger: graph_repair_pending → graph_validated
- **Actor:** Orchestrator
- **Trigger:** Dependency Graph repariert, WO neu eingehängt

---

## Failure Classes

| Class | Auto-Retry | Modell-Eskalation | Human |
|-------|-----------|-------------------|-------|
| `technical_transient` | ✅ | ❌ erst Attempt 3 | ❌ erst nach max |
| `technical_persistent` | ✅ node_override | ❌ | ❌ erst nach max |
| `semantic_output` | ✅ | ✅ Attempt 3 | ❌ erst nach max |
| `scope_violation` | ✅ stricter_scope | ⚠️ optional | ❌ erst nach max |
| `dependency_invalid` | ❌ | ❌ | → graph_repair_pending |
| `guardrail_violation` | ❌ | ❌ | ✅ sofort |

---

## Wichtige Distinktionen
- `done` ≠ `closed` — done = technisch fertig, closed = operativ abgeschlossen
- `cancelled` ≠ `closed` — cancelled = bewusst abgebrochen
- `promoted` ist KEIN WO-State — gehört zum Learning/Memory System
- `graph_repair_pending` — einziger Rücksprung-Pfad, geht zurück auf `graph_validated`

---

*WO Lifecycle V1 — festgezogen*
