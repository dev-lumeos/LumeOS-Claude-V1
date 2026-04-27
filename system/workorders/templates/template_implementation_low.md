# WO Template: Implementation Low Complexity

# Agent: micro-executor (max 3 Files)

# Checklist: #1 XML task ✅ #3 Think-before-write ✅ #5 Negative Constraints ✅ #9 Error Handling ✅

---

## Wann nutzen?

- Kleine Änderung (&lt; 50 Zeilen, max 3 Files)
- Kein DB-Zugriff
- Kein Cross-Module Impact

## Template (ausfüllen)

```yaml
workorder_id: "WO-{module}-{NNN}"       # TODO: z.B. WO-nutrition-001
agent_id:     "micro-executor"
phase:        1
priority:     "normal"                   # low | normal | high | critical
quality_critical: false

task: |
  <task>
    <analyze>
      Lies zuerst alle scope_files und verstehe den bestehenden Code.
      Identifiziere den minimalen Änderungsbedarf für das Ziel.
      Plane den Diff bevor du schreibst.
    </analyze>

    <implement>
      TODO: Ziel in einem klaren Imperativsatz.
      TODO: 2-3 konkrete Detail-Punkte falls nötig.
    </implement>

    <constraints>
      Halte dich strikt an negative_constraints.
      Max 3 Files. Kein Scope Creep.
    </constraints>

    <on_error>
      Bei TypeScript-Fehler: {"status": "FAIL", "issues": ["tsc: ..."]}.
      Bei fehlendem Kontext: {"status": "BLOCKED", "issues": ["missing: ..."]}.
      Bei Scope > 3 Files: {"status": "ESCALATE"}.
    </on_error>
  </task>

scope_files:
  - "TODO: services/oder/packages/pfad/file.ts"   # max 3 Files

context_files:
  - "TODO: packages/types/src/index.ts"            # read-only Referenz (optional)

acceptance_criteria:
  - "TODO: Konkretes Kriterium 1"
  - "TypeScript kompiliert ohne Fehler (pnpm tsc --noEmit)"
  - "Keine bestehenden Tests brechen (pnpm test)"

negative_constraints:
  - "NIEMALS außerhalb scope_files schreiben"
  - "NIEMALS ENV-Dateien lesen oder schreiben"
  - "NIEMALS neue Dependencies hinzufügen (package.json)"

required_skills: []
optional_skills: []
blocked_by:      []
```

---

## Ausgefülltes Beispiel

```yaml
workorder_id: "WO-infra-001"
agent_id:     "micro-executor"
phase:        1
priority:     "normal"
quality_critical: false

task: |
  <task>
    <analyze>
      Lies packages/agent-core/src/registry.ts.
      Identifiziere wo NODE_PROFILES definiert ist.
      Plane minimalen Diff: hardcoded IPs → process.env.
    </analyze>

    <implement>
      Ersetze hardcoded IPs in NODE_PROFILES durch Env Vars.
      spark-a: process.env.SPARK_A_ENDPOINT ?? 'http://192.168.0.128:8001'
      spark-b: process.env.SPARK_B_ENDPOINT ?? 'http://192.168.0.188:8001'
    </implement>

    <constraints>
      Nur registry.ts ändern. Kein Refactoring drumherum.
    </constraints>

    <on_error>
      Bei tsc-Fehler: FAIL mit konkreter Fehlerstelle.
      Bei fehlendem Export: BLOCKED.
    </on_error>
  </task>

scope_files:
  - "packages/agent-core/src/registry.ts"

context_files:
  - "packages/agent-core/src/index.ts"

acceptance_criteria:
  - "NODE_PROFILES.spark-a.endpoint nutzt SPARK_A_ENDPOINT mit Fallback"
  - "NODE_PROFILES.spark-b.endpoint nutzt SPARK_B_ENDPOINT mit Fallback"
  - "TypeScript kompiliert ohne Fehler"
  - "Bestehende Tests grün"

negative_constraints:
  - "NIEMALS außerhalb packages/agent-core/src/ schreiben"
  - "NIEMALS ENV-Dateien lesen oder schreiben"
  - "NIEMALS neue Dependencies hinzufügen"

required_skills: ["gsd-v2"]
optional_skills: []
blocked_by:      []
```
