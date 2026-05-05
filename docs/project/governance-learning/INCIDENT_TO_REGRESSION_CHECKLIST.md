# Incident To Regression Checklist

Use this checklist before closing any governance incident.

- [ ] Incident has a stable incident ID.
- [ ] Affected governance layer is named.
- [ ] Severity is set to `critical`, `high`, `medium`, or `low`.
- [ ] Product work gate impact is stated.
- [ ] Autonomous operator impact is stated.
- [ ] Root cause is concrete and not just "model error".
- [ ] Trigger command, workorder, run, approval, or stop rule is listed where known.
- [ ] Fix commit is linked.
- [ ] Changed files are listed.
- [ ] Regression test file is linked.
- [ ] Regression test name or behavior is described.
- [ ] Durable rule file is linked.
- [ ] Memory/handover update status is recorded.
- [ ] Recurrence detector is named.
- [ ] If no recurrence detector exists, target governance batch is listed.
- [ ] Follow-up is assigned or explicitly `none`.

An incident is not closed if it has a fix but no regression test, unless Tom explicitly accepts the residual risk.

