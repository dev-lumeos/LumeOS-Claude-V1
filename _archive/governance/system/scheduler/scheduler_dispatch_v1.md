# Scheduler / Dispatch Spec V1
# Status: AKTUALISIERT — 25. April 2026

---

## Zweck

Der Scheduler entscheidet:
- welche WOs jetzt ausführbar sind
- auf welchem Node sie laufen
- wie viele parallel dispatched werden
- wann Retry-WOs wieder eingereiht werden

## Kernprinzip

```
Scheduler    = State Reader + Dispatch Engine
Orchestrator = kommt mit Spark C (Qwen3.5-122B NVFP4) — noch nicht verfügbar
Claude       = Externer Akteur — NICHT Teil des Schedulers
```

Claude ist nicht scheduler-kontrolliert.
Scheduler arbeitet ausschließlich mit Execution Agents aus der Agent Registry.

---

## Node-Profil (aktuell)

| Node | Modell | Rolle | Max Slots |
|------|--------|-------|-----------|
| Spark A | Qwen3.6-35B-A3B-FP8 | Governance Compiler | 4 |
| Spark B | Qwen3-Coder-30B-A3B-FP8 | Micro-Executor (Temp=0.0) | 10 |
| Spark C | Qwen3.5-122B NVFP4 (coming) | Orchestrator + Bulk | 8 |
| Spark D | Qwen3-Coder-Next (coming) | Specialist / QA | 4 |

Routing via `services/scheduler-api/src/routing.ts` — nutzt `routing.assigned_spark` aus WO Classifier.
WO Classifier gibt `spark_a` / `spark_b` / `spark_c` / `spark_d` zurück.
Spark C/D fallen heute auf Spark B zurück (SPARK_C_AVAILABLE = false).

---

## WO Readiness Logik

blocked → ready wenn:
1. Alle WOs in blocked_by: done oder closed
2. Kein aktives conflicts_with (running/dispatched)
3. Eigene Dependencies erfüllt (NICHT globales Phase-Gating)

**Actor:** Scheduler — deterministisch, NICHT Orchestrator

---

## Phase-Freigabe

Phase ist Sortier- und Sicherheitsmechanismus — kein globaler Blocker.

```
WO ist ready wenn eigene blocked_by Dependencies erfüllt.
NICHT wenn alle Phase-N-1 WOs global done sind.
```

---

## Dispatch-Algorithmus V1

```
LOOP alle 5s:
  1. Lade alle WOs State: ready
  2. classifyIfNeeded(wo) → routing.assigned_spark setzen falls fehlt
  3. Sortiere: Phase asc → Priority asc → FIFO
  4. Für jede ready WO:
     a. resolveNodeFromRouting(wo) → target_node
     b. Prüfe: hat target_node freie Slots?
     c. Ja → dispatch (atomar: check + reserve + set dispatched)
     d. Nein → skip
  5. Warte 5s, repeat
```

---

## Slot Management

```yaml
spark_a: max_slots: 4
spark_b: max_slots: 10
spark_c: max_slots: 8  (coming)
spark_d: max_slots: 4  (coming)
```

---

## Priorisierung

1. Phase (asc: 1→2→3)
2. WO Priority (0=CRITICAL, 1=HIGH, 2=NORMAL, 3=LOW)
3. FIFO (created_at)

---

## Scheduler States

| State | Bedeutung |
|-------|-----------|
| idle | Keine WOs in Queue |
| running | Aktiv dispatching |
| paused | Manuell pausiert |
| draining | Keine neuen dispatchen |

---

*Scheduler Dispatch Spec V1 — aktualisiert 25. April 2026*
