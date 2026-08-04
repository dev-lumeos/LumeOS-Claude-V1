# Failed WO Report

**Generiert:** 2026-04-30T02:09:56.085Z
**Seit:** 2026-04-29
**Total Runs:** 6

| Kategorie | Anzahl |
|-----------|--------|
| ❌ Failed | 2 |
| 🔒 Blocked (nicht Approval) | 0 |
| ⏳ Awaiting Approval | 1 |

---

## ⏳ RUN-20260429-1108

**WO:** WO-humanneeded-001 | **Agent:** micro-executor
**Status:** blocked | **Kind:** BLOCKED_APPROVAL
**Started:** 2026-04-29T08:56:11.108Z

**Fehler:** HUMAN_NEEDED: spark-d ESCALATE → Claude needed

**Action Required:**
```
npx tsx system/approval/approval-cli.ts list — Approval prüfen und entscheiden
```

---

## ❌ RUN-20260429-1032

**WO:** WO-rewrite-001 | **Agent:** micro-executor
**Status:** failed | **Kind:** FAILED
**Started:** 2026-04-29T08:56:11.033Z

**Fehler:** Run RUN-20260429-1032 failed (kein Audit-Event gefunden)

**Action Required:**
```
Fehler analysieren, WO anpassen, Re-Dispatch — Audit: system/state/audit.jsonl
```

---

## ❌ RUN-20260429-4615

**WO:** WO-realrun-001 | **Agent:** micro-executor
**Status:** failed | **Kind:** FAILED
**Started:** 2026-04-29T08:45:34.616Z

**Fehler:** Run RUN-20260429-4615 failed (kein Audit-Event gefunden)

**Action Required:**
```
Fehler analysieren, WO anpassen, Re-Dispatch — Audit: system/state/audit.jsonl
```
