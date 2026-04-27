# WORKORDER: .claude/agents/*.md auf V4.1 Standard updaten
# WO-ID: WO-agents-v41-001
# Agent: Claude Code
# Priorität: MITTEL — Runtime läuft auch ohne, aber Nemotron-Mode braucht es

---

## ZIEL

Alle 12 Agent-Definitionen in .claude/agents/*.md auf den V4.1 Standard bringen.
Standard-Referenz: system/agent-registry/AGENT_SKILL_STANDARD_V4.1_FINAL.md

Die wichtigste Änderung: **Frontmatter hinzufügen** damit Nemotron die Files
als System-Prompt Templates parsen kann.

---

## AUFGABE

Füge zu JEDER der folgenden Dateien folgendes Frontmatter am Dateianfang ein
(exakt dieser Inhalt, kein anderer):

### orchestrator-agent.md
```yaml
---
agent_id: orchestrator-agent
runtime_compat:
  claude_code: true
  nemotron: true
prompt_template: true
requires_registry_permissions: true
---
```

### review-agent.md
```yaml
---
agent_id: review-agent
runtime_compat:
  claude_code: true
  nemotron: true
prompt_template: true
requires_registry_permissions: true
---
```

### micro-executor.md
```yaml
---
agent_id: micro-executor
runtime_compat:
  claude_code: true
  nemotron: true
prompt_template: true
requires_registry_permissions: true
---
```

### senior-coding-agent.md
```yaml
---
agent_id: senior-coding-agent
runtime_compat:
  claude_code: true
  nemotron: true
prompt_template: true
requires_registry_permissions: true
---
```

### context-builder.md
```yaml
---
agent_id: context-builder
runtime_compat:
  claude_code: true
  nemotron: true
prompt_template: true
requires_registry_permissions: true
---
```

### governance-compiler.md
```yaml
---
agent_id: governance-compiler
runtime_compat:
  claude_code: true
  nemotron: true
prompt_template: true
requires_registry_permissions: true
---
```

### security-specialist.md
```yaml
---
agent_id: security-specialist
runtime_compat:
  claude_code: true
  nemotron: true
prompt_template: true
requires_registry_permissions: true
---
```

### db-migration-agent.md
```yaml
---
agent_id: db-migration-agent
runtime_compat:
  claude_code: true
  nemotron: true
prompt_template: true
requires_registry_permissions: true
---
```

### test-agent.md
```yaml
---
agent_id: test-agent
runtime_compat:
  claude_code: true
  nemotron: true
prompt_template: true
requires_registry_permissions: true
---
```

### i18n-agent.md
```yaml
---
agent_id: i18n-agent
runtime_compat:
  claude_code: true
  nemotron: true
prompt_template: true
requires_registry_permissions: true
---
```

### docs-agent.md
```yaml
---
agent_id: docs-agent
runtime_compat:
  claude_code: true
  nemotron: true
prompt_template: true
requires_registry_permissions: true
---
```

### mealcam-agent.md
```yaml
---
agent_id: mealcam-agent
runtime_compat:
  claude_code: true
  nemotron: true
prompt_template: true
requires_registry_permissions: true
---
```

---

## SCOPE FILES

- .claude/agents/orchestrator-agent.md
- .claude/agents/review-agent.md
- .claude/agents/micro-executor.md
- .claude/agents/senior-coding-agent.md
- .claude/agents/context-builder.md
- .claude/agents/governance-compiler.md
- .claude/agents/security-specialist.md
- .claude/agents/db-migration-agent.md
- .claude/agents/test-agent.md
- .claude/agents/i18n-agent.md
- .claude/agents/docs-agent.md
- .claude/agents/mealcam-agent.md

---

## NICHT ANFASSEN

- Keinen bestehenden Inhalt der Dateien ändern
- Nur Frontmatter am Anfang jeder Datei PREPENDEN
- Keine anderen Files im Repo anfassen

---

## NEGATIVE CONSTRAINTS

- NIEMALS bestehenden Inhalt der Agent-Files löschen oder ändern
- NIEMALS Frontmatter am Ende statt am Anfang einfügen
- NIEMALS andere Felder als die oben definierten ins Frontmatter
- NIEMALS system/ oder services/ Dateien anfassen

---

## ACCEPTANCE CRITERIA

1. Alle 12 .claude/agents/*.md Dateien haben Frontmatter am Anfang
2. Frontmatter hat exakt: agent_id, runtime_compat (claude_code+nemotron), prompt_template, requires_registry_permissions
3. Bestehender Inhalt jeder Datei ist unverändert (nur Frontmatter prepended)
4. Validierung: grep -c "agent_id:" .claude/agents/*.md → alle zeigen 1
