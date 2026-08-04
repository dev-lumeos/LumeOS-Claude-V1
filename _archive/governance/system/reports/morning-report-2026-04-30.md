# Morning Report — 2026-04-30

**Generiert:** 2026-04-30T02:12:57.134Z
**Zeitraum:** seit 2026-04-29

## Zusammenfassung

| | |
|---|---|
| ✅ Completed | 3 |
| ❌ Failed | 2 |
| 🔒 Blocked | 1 |
| ⏳ Pending Approvals | 0 |
| 📊 Reviews gesamt | 2 |
| 📈 Pass-Rate | 50% |

## ❌ Failed / Blocked Runs (3)

- ⏳ `RUN-20260429-1108` — WO-humanneeded-001 | BLOCKED_APPROVAL
  HUMAN_NEEDED: spark-d ESCALATE → Claude needed
- ❌ `RUN-20260429-1032` — WO-rewrite-001 | FAILED
  Run RUN-20260429-1032 failed (kein Audit-Event gefunden)
- ❌ `RUN-20260429-4615` — WO-realrun-001 | FAILED
  Run RUN-20260429-4615 failed (kein Audit-Event gefunden)

Details: `npx tsx system/reports/failed-wo-report.ts`

## ✅ Completed Runs (3)

- `RUN-20260429-1066` — WO-realrun-001 (28ms)
- `RUN-20260429-6298` — WO-realrun-001 (6120ms) → tmp/review-pipeline-test/add.ts
- `RUN-20260429-9752` — WO-realrun-001 (2360ms) → tmp/review-pipeline-test/add.ts

## 📊 Pipeline Metrics

| Metrik | Wert |
|--------|------|
| Reviews gesamt | 2 |
| PASS | 1 |
| FAIL/REWRITE | 1 |
| Escalations | 1 |
| Pass-Rate | 50% |
| Ø Latenz | 3038ms |

## Next Actions

1. Failed Runs analysieren: `npx tsx system/reports/failed-wo-report.ts`
