# WO Template: Dokumentation
# Agent: docs-agent
# Checklist: #1 XML task ✅  #3 Think-before-write ✅  #5 Negative Constraints ✅  #9 Error Handling ✅

---

## Wann nutzen?
- JSDoc für neue Functions/APIs
- README Updates
- Architecture Decision Records (ADR)
- Changelog Einträge
- COMMANDS.md Ergänzungen

## Template (ausfüllen)

```yaml
workorder_id: "WO-docs-{NNN}"           # TODO
agent_id:     "docs-agent"
phase:        1
priority:     "low"
quality_critical: false

task: |
  <task>
    <analyze>
      Lies alle scope_files vollständig.
      Verstehe die API-Oberfläche und bestehende Dokumentation.
      Identifiziere was dokumentiert werden muss vs. was schon existiert.
    </analyze>

    <implement>
      TODO: Was dokumentiert wird in einem Imperativsatz.
      Dokumentiere nur was wirklich existiert — niemals erfinden.
      Schreibe präzise TSDoc / Markdown.
    </implement>

    <constraints>
      Nur docs/ und *.md Dateien schreiben.
      Kein Production Code ändern.
      Nur existierenden Code dokumentieren.
    </constraints>

    <on_error>
      Bei unklarer API-Semantik: {"status": "ESCALATE"}.
      Bei Production Code Änderung erkannt: {"status": "STOP"}.
      Bei scope_files nicht gefunden: {"status": "BLOCKED"}.
    </on_error>
  </task>

scope_files:
  - "TODO: production file(s) to document"

context_files: []

acceptance_criteria:
  - "TODO: Dokumentations-Kriterium"
  - "Markdown valide und lesbar"
  - "Kein Production Code geändert"

negative_constraints:
  - "NIEMALS Production Code ändern"
  - "NIEMALS system/ oder .claude/ Dateien ändern"
  - "NIEMALS Features dokumentieren die nicht existieren"
  - "NIEMALS Implementierungsdetails erfinden"

required_skills: []
optional_skills: []
blocked_by:      []
```

---

## ADR Template (in docs/decisions/)

```markdown
# ADR-{NNN}: {Titel}

**Datum:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated
**Entscheider:** Tom

## Kontext
{Warum diese Entscheidung nötig war.}

## Entscheidung
{Was entschieden wurde.}

## Konsequenzen

**Positiv:**
- ...

**Negativ:**
- ...
```

Pfad: `docs/decisions/ADR-{NNN}-{datum}-{slug}.md`
