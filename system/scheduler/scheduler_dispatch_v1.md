# Scheduler / Dispatch Spec V1

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
Orchestrator = Graph Owner + Retry Decider (Qwen3.5-122B lokal)
Claude       = Externer Akteur — NICHT Teil des Schedulers
```

Claude ist nicht scheduler-kontrolliert.
Scheduler arbeitet ausschließlich mit Execution Agents aus der Agent Registry.

---

## Node-Profil

| Node | Modell | Tier | Max Slots |
|------|--------|------|-----------|
| Spark A | Qwen3.6-35B-A3B FP8 + fp4_light | fp8_bulk + fp4_light | 8 |
| Spark B | Qwen3.5-122B-A10B NVFP4 + DeepSeek-R1 8B | quality + review | 3 |

Spark B Slot 3 ist immer für Orchestrator reserviert.

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

Optional Soft-Gate: phase_soft_gate.enabled: false (default)

---

## Dispatch-Algorithmus V1

```
LOOP alle 5s:
  1. Lade alle WOs State: ready
  2. Sortiere: Phase asc → fp4_light > fp8_bulk > quality > review → FIFO
  3. Für jede ready WO:
     a. Bestimme target_node via agent_type → model_tier → node_profile
     b. Prüfe: hat target_node freie Slots?
     c. Ja → dispatch (atomar: check + reserve + set dispatched)
     d. Nein → skip
  4. Warte 5s, repeat
```

**Atomares Dispatch:** check slot → reserve slot → set dispatched — alles in einem Schritt.

---

## Node-Routing

| Agent Tier | Target Node | Fallback |
|-----------|-------------|---------|
| `fp4_light` | Spark A | — |
| `fp8_bulk` | Spark A | Spark B nur bei node_override |
| `quality` | Spark B | OpenRouter wenn exhausted |
| `review` | Spark B | — |
| `escalation_remote` | OpenRouter | — |

## Slot Management

```yaml
spark_a:
  max_slots: 8
  available: max - current - reserved

spark_b:
  max_slots: 3          # Slot 3 immer für Orchestrator reserviert
  available: max - current - reserved
```

## Priorisierung

1. Phase (asc: 1→2→3)
2. Tier (fp4_light > fp8_bulk > quality > review)
3. FIFO
4. Retry-Versuch (Attempt 1 vor 2 vor 3)

## Retry Starvation Prevention

Nach 3 Loops ohne Dispatch → Retry-WO rückt vor normale FIFO.

## Conflicts-With Enforcement

```
Für jede WO die dispatcht werden soll:
  Wenn conflicts_with[i].state IN (dispatched, running):
    → NICHT dispatchen, bleibt ready
```

## Night Run

```yaml
night_run:
  max_spark_a_slots: 8
  max_spark_b_slots: 2      # 1 Slot für Orchestrator
  openrouter_budget: $5/night
  error_thresholds:
    global: 0.30
    per_agent: 0.50
    per_wo_type: 0.50
```

## Scheduler States

| State | Bedeutung |
|-------|-----------|
| `idle` | Keine WOs in Queue |
| `running` | Aktiv dispatching |
| `paused` | Manuell oder error_threshold |
| `night_run` | Automatischer Nacht-Batch |
| `draining` | Keine neuen dispatchen |

---

*Scheduler Dispatch V1 — festgezogen*
