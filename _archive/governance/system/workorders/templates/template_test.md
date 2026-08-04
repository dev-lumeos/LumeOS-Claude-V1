# WO Template: Tests
# Agent: test-agent
# Checklist: #1 XML task ✅  #3 Think-before-write ✅  #5 Negative Constraints ✅  #9 Error Handling ✅

---

## Wann nutzen?
- Unit Tests für neue oder geänderte Functions
- Integration Tests für API Endpoints
- Edge Cases für kritische Business Logic

## Template (ausfüllen)

```yaml
workorder_id: "WO-{module}-{NNN}"       # TODO
agent_id:     "test-agent"
phase:        1
priority:     "normal"
quality_critical: false

task: |
  <task>
    <analyze>
      Lies alle scope_files (Production Code) sorgfältig.
      Verstehe die Funktion/API vollständig bevor du Tests schreibst.
      Identifiziere: Happy Path, Edge Cases, Error Cases.
      Prüfe ob bestehende Tests erweitert oder neue Files erstellt werden.
    </analyze>

    <implement>
      TODO: Was getestet wird in einem Imperativsatz.
      Schreibe Tests nach Vitest-Konventionen.
      Teste Behavior, nicht Implementation Details.
      Jeden Acceptance Criterion durch mindestens einen Test abdecken.
    </implement>

    <constraints>
      Kein Production Code ändern.
      Nur Test-Files schreiben (__tests__/ oder *.test.ts).
      Keine neuen Dependencies.
      Echten Code testen wo möglich — Mocks nur wenn nötig.
    </constraints>

    <on_error>
      Bei rotem Test: {"status": "FAIL", "issues": ["test: X failed at line Y"]}.
      Bei Production Code Änderung erkannt: {"status": "STOP"}.
      Bei Test-Infrastruktur Änderung nötig: {"status": "ESCALATE"}.
      Bei fehlendem Kontext: {"status": "BLOCKED"}.
    </on_error>
  </task>

scope_files:
  - "TODO: production code file(s) to test"

context_files:
  - "TODO: related types or interfaces"

acceptance_criteria:
  - "TODO: Jeder Acceptance Criterion durch einen Test abgedeckt"
  - "Alle neuen Tests grün (pnpm test)"
  - "Bestehende Tests grün"
  - "Kein Production Code geändert"

negative_constraints:
  - "NIEMALS Production Code ändern"
  - "NIEMALS außerhalb __tests__/ oder *.test.ts schreiben"
  - "NIEMALS neue Dependencies hinzufügen"
  - "NIEMALS Tests skippen (xtest, xit, skip)"

required_skills: ["gsd-v2"]
optional_skills: ["test-driven-development"]
blocked_by:      []
```

---

## Ausgefülltes Beispiel

```yaml
workorder_id: "WO-scheduler-003"
agent_id:     "test-agent"
phase:        1
priority:     "normal"
quality_critical: false

task: |
  <task>
    <analyze>
      Lies services/scheduler-api/src/workorder-repository.ts.
      Verstehe fetchReadyWOs(), markDispatched(), markCompleted().
      Identifiziere: Error Cases (Supabase fehlt), Happy Path, State Transitions.
    </analyze>

    <implement>
      Schreibe Unit Tests für workorder-repository.ts.
      Mocke @lumeos/supabase-clients (getServiceClient).
      Teste: fetchReadyWOs gibt leeres Array bei DB-Fehler zurück.
      Teste: markDispatched setzt state='dispatched' + assigned_node.
      Teste: markCompleted setzt state='done'|'failed' + completed_at.
    </implement>

    <constraints>
      Nur Test-File erstellen. Repository-Code nicht ändern.
      Supabase via Mock testen — kein echter DB-Aufruf.
    </constraints>

    <on_error>
      Bei rotem Test: FAIL mit Fehlerstelle.
      Bei Production Code Änderung: STOP.
    </on_error>
  </task>

scope_files:
  - "services/scheduler-api/src/workorder-repository.ts"

context_files:
  - "packages/wo-core/src/schema.ts"
  - "packages/supabase-clients/src/index.ts"

acceptance_criteria:
  - "fetchReadyWOs(): gibt [] bei DB-Fehler"
  - "fetchReadyWOs(): sortiert phase→priority→created_at korrekt"
  - "markDispatched(): state='dispatched' + assigned_node gesetzt"
  - "markCompleted(): state='done' bei success=true"
  - "markCompleted(): state='failed' + failure_class bei success=false"
  - "Alle Tests grün"
  - "Kein Production Code geändert"

negative_constraints:
  - "NIEMALS workorder-repository.ts ändern"
  - "NIEMALS echte Supabase-Verbindung aufbauen"
  - "NIEMALS neue Dependencies hinzufügen"
  - "NIEMALS Tests skippen"

required_skills: ["gsd-v2", "test-driven-development"]
optional_skills: []
blocked_by:      []
```
