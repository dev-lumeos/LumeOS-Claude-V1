# Guardrails V1

---

## Harte Grenzen (nie überschreitbar)

### Scope Guard
- Agent darf nur Files in scope_files ändern
- Jede andere File-Änderung → guardrail_violation
- Kein implizites "während ich schon dabei bin"

### Schema Guard
- Keine destructiven DB-Operationen ohne expliziten Task
- Kein DROP, DELETE ohne requires_rollback_plan
- Migration muss reversibel sein

### Infra Guard
- infra Layer gesperrt ohne infra_override_approved: true
- infra_override_actor muss human sein

### Secrets Guard
- Keine Secrets, API Keys, Credentials in Code
- Kein .env Inhalt in Commits
- Kein console.log mit sensiblen Daten

### Dependency Guard
- Keine neuen npm/pnpm Packages ohne expliziten Task
- Keine Major Version Upgrades ohne expliziten Task

---

## Guardrail Violation → Sofort Human Review

Bei guardrail_violation:
- Kein Auto-Retry
- Kein Model-Escalation
- Direkt reviewed → Human entscheidet

---

## Review Gates

| Situation | Gate |
|-----------|------|
| DB Migration | security-specialist Review Pflicht |
| infra Änderung | Human Approval Pflicht |
| Neue Dependency | Human Approval Pflicht |
| guardrail_violation | Human Review Pflicht |
| 3x failed | Human Review Pflicht |

---

*Guardrails V1 — festgezogen*
