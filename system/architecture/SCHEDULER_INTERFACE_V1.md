# SCHEDULER_INTERFACE_V1.md — LUMEOS Workorder Scheduler Interface
# Version: 1.1 | Basis für Implementierung

# Vollständiger Inhalt: wurde als Upload bereitgestellt
# TODO Spark C+D: docs/todos/spark-cd-integration.md

## Kernkonzept
Scheduler empfängt klassifizierte WOs vom Classifier (routing.assigned_by = classifier).
Entscheidet: WANN, WELCHER SLOT, WAS BEI FEHLER.

## Queue-Struktur
pre.queue       — ungeclassifiziert, unbegrenzt
spark_a.queue   — max 10
spark_b.queue   — max 20
spark_c.queue   — max 100
spark_d.queue   — max 50

## Slots (Concurrency)
Spark A: 1 (sequenziell — Governance darf nicht parallel routen)
Spark B: 2
Spark C: 8 (Bulk)
Spark D: 4

## Execution Phase Split (DB WOs)
Phase 1 GENERATE  → Spark B generiert, schreibt in Staging (nicht committet)
Phase 2 HOLD      → Spark D DB-Checker prüft (120s Timeout)
Phase 3 COMMIT    → Spark B committet nach DB_CHECK_PASS

## Eskalationskette
Spark C FAIL ×2 → Spark B
Spark B FAIL ×2 → Spark A + Human Notification
Spark D DB_CHECK FAIL → BLOCKED + Human
Spark A FAIL → BLOCKED, Human Decision Required

## Timeouts
Spark A: 600s (max 1800s)
Spark B: 300s (max 900s)
Spark C: 120s (max 300s)
Spark D: 180s (max 600s)

## Acceptance Verifier
Spark D prüft nach GENERATED/COMPLETED alle acceptance_criteria.
Nur Spark D darf acceptance_verified=true setzen.
