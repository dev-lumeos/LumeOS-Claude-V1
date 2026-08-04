# WO Template: Implementation Medium/High Complexity

# Agent: senior-coding-agent (bis 15 Files)

# Checklist: #1 XML task ✅ #3 Think-before-write ✅ #5 Negative Constraints ✅ #9 Error Handling ✅

---

## Wann nutzen?

- Komplexe Änderung (3-15 Files)
- Möglicher DB-Read (kein Write)
- Cross-Module Impact möglich
- Architektonische Entscheidungen nötig

## Template (ausfüllen)

```yaml
workorder_id: "WO-{module}-{NNN}"       # TODO
agent_id:     "senior-coding-agent"
phase:        1
priority:     "normal"                   # low | normal | high | critical
quality_critical: false                  # true → MiniMax Mode 2

task: |
  <task>
    <analyze>
      Lies zuerst alle scope_files und context_files.
      Verstehe die bestehende Architektur und Abhängigkeiten.
      Identifiziere alle Stellen die geändert werden müssen.
      Erkenne potenzielle Breaking Changes bevor du schreibst.
      Schreibe architecture_notes mit deiner Entscheidung.
    </analyze>

    <implement>
      TODO: Ziel in einem klaren Imperativsatz.
      TODO: Architektonische Anforderungen.
      TODO: Konkrete Änderungen pro File/Modul.
    </implement>

    <constraints>
      Kein Scope Creep. Nur was im Task steht.
      Breaking Changes nur wenn im Task explizit erlaubt.
      post_review_required: true immer setzen.
    </constraints>

    <on_error>
      Bei TypeScript-Fehler: {"status": "FAIL", "issues": ["tsc: TS2345 at ..."]}.
      Bei Breaking Change erkannt ohne Task: {"status": "ESCALATE"}.
      Bei Security-Befund: {"status": "STOP"}.
      Bei Migration nötig: {"status": "ESCALATE", "issues": ["route to db-migration-agent"]}.
      Bei fehlendem Kontext: {"status": "BLOCKED"}.
    </on_error>
  </task>

scope_files:
  - "TODO: services/pfad/**"
  - "TODO: packages/pfad/**"

context_files:
  - "TODO: packages/types/src/**"    # read-only Referenz

acceptance_criteria:
  - "TODO: Konkretes Kriterium 1"
  - "TODO: Konkretes Kriterium 2"
  - "TypeScript kompiliert ohne Fehler (pnpm tsc --noEmit)"
  - "Alle bestehenden Tests grün (pnpm test)"
  - "Keine unerwarteten Breaking Changes in shared packages"

negative_constraints:
  - "NIEMALS außerhalb scope_files schreiben"
  - "NIEMALS ENV-Dateien lesen oder schreiben"
  - "NIEMALS Schema oder Migration Changes (→ db-migration-agent)"
  - "NIEMALS Breaking Changes in shared packages ohne expliziten Task"
  - "NIEMALS Auth Flow ändern ohne security-specialist Review"
  - "NIEMALS output außerhalb des JSON-Schemas"

required_skills: ["gsd-v2"]
optional_skills: ["typescript-pro"]
blocked_by:      []
```

---

## Ausgefülltes Beispiel

```yaml
workorder_id: "WO-scheduler-002"
agent_id:     "senior-coding-agent"
phase:        1
priority:     "high"
quality_critical: false

task: |
  <task>
    <analyze>
      Lies dispatch-loop.ts, workorder-repository.ts und wo-adapter.ts.
      Verstehe wie onDispatch aktuell funktioniert.
      Identifiziere: Slot wird nach failed release nicht korrekt.
      Prüfe ob SlotManager.release() idempotent ist.
    </analyze>

    <implement>
      Fixe Slot-Release in onDispatch: immer slotManager.release() aufrufen,
      auch wenn dispatchWorkorder() wirft.
      Wrap onDispatch body in try/finally.
    </implement>

    <constraints>
      Nur index.ts ändern. Kein Refactoring von dispatch-loop.ts.
      Keine neuen Felder in SlotManager.
    </constraints>

    <on_error>
      Bei tsc-Fehler: FAIL.
      Bei Änderung von dispatch-loop.ts: STOP.
    </on_error>
  </task>

scope_files:
  - "services/scheduler-api/src/index.ts"

context_files:
  - "services/scheduler-api/src/dispatch-loop.ts"
  - "packages/scheduler-core/src/slot-manager.ts"

acceptance_criteria:
  - "slotManager.release() wird in try/finally aufgerufen"
  - "Slot wird auch bei Dispatcher-Fehler freigegeben"
  - "TypeScript kompiliert ohne Fehler"
  - "Bestehende Tests grün"

negative_constraints:
  - "NIEMALS dispatch-loop.ts ändern"
  - "NIEMALS ENV-Dateien lesen oder schreiben"
  - "NIEMALS Schema oder Migration Changes"
  - "NIEMALS SlotManager Interface ändern"
  - "NIEMALS neue Dependencies hinzufügen"
  - "NIEMALS Breaking Changes in scheduler-core"

required_skills: ["gsd-v2"]
optional_skills: ["debugging-strategies"]
blocked_by:      []
```
