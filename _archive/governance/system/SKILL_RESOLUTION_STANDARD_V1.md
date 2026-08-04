# LUMEOS Skill Resolution Standard V1
# Wie Skills im Nemotron-Modus geladen werden
# Stand: 26. April 2026
# Status: IMPLEMENTIERT via system/control-plane/skill-loader.ts

---

## PRINZIP

Skills werden NICHT automatisch gesucht.
Deterministisch via Workorder (required_skills/optional_skills) oder Agent-Profil (always_load_skills).
Kein Modell entscheidet welche Skills relevant sind.

---

## SKILL-TYPEN

| Typ | Beispiele | Verhalten |
|---|---|---|
| Pipeline | wo-writer, chat-to-rawdata | Nur Claude Code Phase — blockiert im Dispatcher |
| Domain | supabase-specialist, nutrition-specialist | Nur wenn Workorder referenziert |
| Runtime | gsd-v2, typescript-specialist | Per Agent-Profil immer — mit Tokenbudget |

---

## LOADING PRIORITÄT

```
1. required_skills (Workorder)    → hard fail wenn fehlt
2. always_load_skills (Agent)     → skip wenn Budget überschritten
3. optional_skills (Workorder)    → skip wenn Budget überschritten
```

Tokenbudget pro Agent in agents.json (skill_token_budget).

---

## SKILL REGISTRY

system/agent-registry/skill_registry.json:
```json
{
  "gsd-v2": {
    "type": "runtime",
    "path": ".claude/skills/gsd-v2/SKILL.md",
    "max_tokens": 800,
    "pipeline_only": false,
    "allowed_agent_types": ["executor", "executor_senior", "reviewer", "db_specialist"]
  },
  "wo-writer": {
    "type": "pipeline",
    "pipeline_only": true,
    "allowed_agent_types": []
  }
}
```

---

## INJECTION FORMAT

```typescript
// system/control-plane/skill-loader.ts → buildSystemPrompt()
return `${agentSpec}\n\n<loaded_skills>\n${skillBlocks}\n</loaded_skills>`
```

Skills werden als XML-Tags injiziert:
```
<skill name="gsd-v2">
...SKILL.md Inhalt...
</skill>
```

---

## IMPLEMENTATION

system/control-plane/skill-loader.ts:
- loadSkills({ agentId, agentType, requiredSkills, optionalSkills, alwaysLoad, tokenBudget })
- Returns: { loaded, errors, blocked }
- required Skill fehlt → blocked: true, kein Dispatch
- Pipeline Skill in required → blocked: true
