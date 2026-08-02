# TODO: Spark C+D Integration (WO_CLASSIFIER_V1 + SCHEDULER_INTERFACE_V1)
# Status: OFFEN — wartet auf Hardware
# Erstellt: 24. April 2026
# Basis: WO_CLASSIFIER_V1.md + SCHEDULER_INTERFACE_V1.md

---

## Wann aktivieren?

Wenn Spark C und D physisch ankommen und vLLM läuft.

---

## Spark Rollen (FESTGEZOGEN)

| Spark | Hardware | Modell | Rolle |
|-------|---------|--------|-------|
| Spark A | 192.168.0.128 | Qwen3.6-35B-FP8 | Governance / Orchestration |
| Spark B | 192.168.0.188 | Qwen3-Coder-30B-FP8 | Precision Execution |
| Spark C | TBD | Qwen3.5-122B NVFP4 | Bulk Execution (max 8 parallel) |
| Spark D | TBD | Qwen3-Coder-Next | Specialist / QA / DB-Check |

---

## WO Classifier — Spark C/D Fallback entfernen

Aktuell leitet der Classifier spark_c → spark_b und spark_d → spark_b.

Wenn C+D verfügbar:
1. `services/wo-classifier/src/rules/spark_c.ts` — echte Spark C IP eintragen
2. `services/wo-classifier/src/rules/spark_d.ts` — echte Spark D IP eintragen
3. Fallback in `classify.ts` entfernen
4. `packages/agent-core/src/registry.ts` — NODE_PROFILES für Spark C+D eintragen

---

## Scheduler — Spark-spezifische Queues

Aktuell: 1 generische Queue
Ziel: 4 Queues, eine pro Spark

```
queues/
  pre.queue        # ungeclassifiziert, unbegrenzt
  spark_a.queue    # max depth: 10
  spark_b.queue    # max depth: 20
  spark_c.queue    # max depth: 100
  spark_d.queue    # max depth: 50
```

Änderungen in `services/scheduler-api/src/`:
- `dispatch-loop.ts` — Queue-Auswahl nach routing.assigned_spark
- `slot-manager.ts` — Slots pro Spark konfigurierbar

---

## DB Gate (Phase 1/2/3 für Schema WOs)

Wenn `needs_db_check: true` in routing:

```
Phase 1 — GENERATE
  Spark B generiert Code/Migration
  Output → Staging Area (nicht committet)
  Status: GENERATED

Phase 2 — HOLD
  Spark D DB-Checker prüft Staging Output
  Status: AWAITING_DB_CHECK (120s Timeout)
  
  DB_CHECK_PASS  → Phase 3
  DB_CHECK_FAIL  → BLOCKED + Human Notification
  TIMEOUT        → BLOCKED + Human Notification

Phase 3 — COMMIT
  Spark B committet Output
  Status: COMMITTED → COMPLETED
```

Neuer Service oder Erweiterung von `services/scheduler-api/`:
- `src/db-gate.ts` — Staging Area Management
- Spark D DB-Checker Agent: `.claude/agents/db-checker.md`

---

## Acceptance Verifier (Spark D)

Nach GENERATED/COMPLETED sendet Scheduler an Spark D:
```
WO + Output + acceptance_criteria
→ Spark D prüft jeden Criterion
→ ACCEPTANCE_PASS → status: COMPLETED, acceptance_verified: true
→ ACCEPTANCE_FAIL → status: FAILED, reason: [...]
```

Nur Spark D darf `acceptance_verified: true` setzen.

Agent Config: `.claude/agents/acceptance-verifier.md`

---

## Eskalationskette

```
Spark C FAIL × 2 → escalate to Spark B
Spark B FAIL × 2 → escalate to Spark A + Human Notification
Spark D DB_CHECK FAIL → BLOCKED + Human Notification
Spark A FAIL → BLOCKED, Human Decision Required
```

Änderungen in `services/scheduler-api/src/workers.ts`:
- `escalate(wo, from, to)` Funktion
- Attempt counter per WO

---

## Agent Registry V2

Neue Agenten für `.claude/agents/`:
- `bulk-executor.md` — Spark C, Qwen3.5-122B, max 8 concurrent
- `db-checker.md` — Spark D, schema validation
- `acceptance-verifier.md` — Spark D, acceptance criteria check
- `orchestrator.md` — Spark C 122B als Orchestrator

Update `packages/agent-core/src/registry.ts`:
- NODE_PROFILES für Spark C und D
- TIER_PRIORITY update

---

## WO State ENUM erweitern

Aktuell (14 States): wo_generated → ... → closed

Brainstorm zusätzlich definiert:
- GENERATED (Output in Staging, nicht committet)
- AWAITING_DB_CHECK
- COMMITTED

Migration: `supabase/migrations/20260424_002_wo_state_extension.sql`

---

## Smoke Test

Wenn alles implementiert ist, führe aus:
```bash
python tools/scripts/minimal_scheduler_stub.py
```

5 WOs durch kompletten Flow:
1. implementation low/low → Spark C
2. migration schema_change → Spark B + DB Gate
3. governance → Spark A
4. Missing fields → REJECT
5. Spark C FAIL → Eskalation → Spark B

---

## Prompt für Opus wenn bereit

```
Lies WO_CLASSIFIER_V1.md und SCHEDULER_INTERFACE_V1.md im Ordner
system/architecture/ (oder docs/architecture/).

Spark C und D sind jetzt verfügbar:
  Spark C: http://192.168.0.XXX:8001 (Qwen3.5-122B NVFP4)
  Spark D: http://192.168.0.XXX:8001 (Qwen3-Coder-Next)

Aufgaben:
1. Classifier Fallback entfernen — echte Spark C/D IPs eintragen
2. Spark-spezifische Queues im Scheduler
3. DB Gate für schema WOs
4. Acceptance Verifier Agent
5. Eskalationskette
6. Agent Registry V2
7. WO State ENUM erweitern
8. Smoke Test ausführen (minimal_scheduler_stub.py)
```
