# Model Quality Report

**Generiert:** 2026-04-30T02:15:52.294Z

**Gesamtstatistik:** 5 Reviews | Pass-Rate: 20% | Human Needed: 0

## Tier-Übersicht

| Tier | Reviews | PASS | REWRITE | ESCALATE | invalid_json | Pass-Rate | Esc-Rate | Ø Latenz |
|------|---------|------|---------|----------|-------------|-----------|----------|----------|
| spark-c | 3 | 0 (0%) | 1 (33%) | 1 (67%) | 1 (33%) | **0%** | 67% | 2888ms |
| spark-d | 2 | 1 (50%) | 0 (0%) | 1 (50%) | — | **50%** | 50% | 3187ms |

## Latenz-Detail

| Tier | Ø Latenz | P95 Latenz |
|------|----------|------------|
| spark-c | 2888ms | 2888ms |
| spark-d | 3187ms | 3187ms |

## Confidence-Verteilung

| Tier | Ø Confidence | Min | Max |
|------|-------------|-----|-----|
| spark-c | 0.9 | 0.9 | 0.9 |
| spark-d | 0.97 | 0.95 | 0.99 |

## Escalation Chains

- **spark-c → spark-d:** 2 Escalations (67% der spark-c-Reviews)

## spark-c — Detail

| Kennzahl | Wert |
|----------|------|
| Reviews gesamt | 3 |
| PASS | 0 (0%) |
| FAIL | 0 |
| REWRITE | 1 (33%) |
| ESCALATE | 1 (67%) |
| invalid_json | 1 (33%) |
| Ø Latenz | 2888ms |
| P95 Latenz | 2888ms |
| Ø Confidence | 0.9 |
| Confidence Min/Max | 0.9 / 0.9 |

## spark-d — Detail

| Kennzahl | Wert |
|----------|------|
| Reviews gesamt | 2 |
| PASS | 1 (50%) |
| FAIL | 0 |
| REWRITE | 0 (0%) |
| ESCALATE | 1 (50%) |
| Ø Latenz | 3187ms |
| P95 Latenz | 3187ms |
| Ø Confidence | 0.97 |
| Confidence Min/Max | 0.95 / 0.99 |
