# Workorder Templates — README

# Stand: 26. April 2026

---

## Template-Auswahl

TemplateWannAgent`template_implementation_low.md`&lt; 3 Files, kein DBmicro-executor`template_implementation_medium.md`3-15 Files, komplexsenior-coding-agent`template_migration.md`DB Schema Changesdb-migration-agent`template_test.md`Tests für geänderten Codetest-agent`template_docs.md`Dokumentationdocs-agent

---

## Prompt-Checkliste (pflichtmäßig)

Vor jedem WO-Submit prüfen:

- \[ \] **#1 XML statt Markdown** — `task` verwendet XML-Tags (`<task>`, `<analyze>`, `<constraints>`)
- \[ \] **#3 Think-before-write** — `<analyze>` Block VOR `<implement>` im task
- \[ \] **#5 Negative Constraints** — `negative_constraints` Array mit min 3 NIEMALS-Regeln
- \[ \] **#9 Error Handling** — `<on_error>` Block im task definiert

---

## Pflichtfelder (Dispatcher Interface)

```
workorder_id:         WO-{module}-{NNN}   — lowercase module, 3-stellig
agent_id:             aus agents.json
task:                 XML-strukturiert (siehe Templates)
scope_files:          konkrete Pfade, kein Glob für single files
context_files:        read-only Referenz-Files (Types, Interfaces)
acceptance_criteria:  min 2, immer: "TypeScript kompiliert ohne Fehler"
negative_constraints: min 3, immer: NIEMALS ENV, NIEMALS außerhalb scope
```

---

## Workorder ID Konvention

```
WO-{module}-{NNN}

module: nutrition | training | recovery | supplements | medical |
        coach | auth | infra | scheduler | agent | docs | i18n

Beispiele:
  WO-nutrition-001
  WO-infra-042
  WO-agent-007
```
