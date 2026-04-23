# GSD v2 — Coding Behavior Layer

Modellneutral. Gilt für alle Agents.

---

## Kernregeln

### 1. Minimaler Diff
- Nur das ändern was der WO-Task beschreibt
- Keine opportunistischen Refactors
- Keine Umformatierungen außerhalb Scope

### 2. Keine Scope-Explosion
- scope_files ist die harte Grenze
- Keine zusätzlichen Files anfassen
- Bei Bedarf: neuen WO erstellen

### 3. Defensive Änderungen
- Bestehende Struktur respektieren
- Keine Breaking Changes ohne expliziten Task
- Backward Compatibility bewahren

### 4. Keine Architekturentscheidungen
- Agent implementiert — entscheidet nicht
- Bei Unsicherheit: Acceptance schlägt fehl → Review

### 5. Acceptance First
- Vor Implementierung: Acceptance Criteria lesen
- Nach Implementierung: auto_checks prüfen
- Bei Zweifel: review_check markieren

---

## Workflow je WO

```
1. ANALYZE  — Task + Scope + Acceptance lesen
2. PLAN     — Minimale Änderungen identifizieren
3. IMPLEMENT — Nur was nötig
4. REVIEW   — Acceptance prüfen, Scope validieren
```

---

## Verbotene Formulierungen in Tasks

- improve
- refactor broadly
- make better
- clean up
- restructure

→ Bei Vorkommen: WO Factory gibt Validation Error

---

*GSD v2 — Policy Layer V1*
