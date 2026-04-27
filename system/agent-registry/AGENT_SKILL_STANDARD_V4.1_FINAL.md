# LUMEOS Agent & Skill Definition Standard V4.1 — FINAL
# Erstellt: 25. April 2026
# Änderungen gegenüber V4:
#   - Mode Switching: drain → lock → activate → release präzisiert
#   - "Security-Fund" → "Security-Befund" überall
#   - DB-Spezialist: supabase migration list ergänzt
#   - Frontmatter runtime_compat ergänzt (V4.1)

---

## ZIEL

Alle Agenten und Skills auf maximale Präzision bringen.
Vollständig model-agnostisch — funktioniert mit Qwen3, GLM, DeepSeek, MiniMax.
Dieser Standard ist Runtime-fähig, nicht nur konzeptuell.

---

## TEIL 1 — AGENT DEFINITION STANDARD

### 1.1 Pflichtfelder pro Agent

```
# Agent: {Name}
## Identität
## Modell-Routing
## Aufgabe
## Workflow-Position
## Input-Spezifikation
## Output-Spezifikation
## Erlaubte Tools
## Verbotene Operationen
## Pre-Output Checks
## Error Handling
## Erlaubte MCP Tools
## Eskalationsbedingungen
## Validierung
```

### 1.1.1 Pflicht-Frontmatter (V4.1)

Jede .claude/agents/*.md Datei MUSS dieses Frontmatter haben:

```yaml
---
agent_id: {agent-id}         # muss mit agents.json übereinstimmen
runtime_compat:
  claude_code: true
  nemotron: true
prompt_template: true        # Nemotron kann diese Datei als System-Prompt injizieren
requires_registry_permissions: true  # Permissions kommen aus permissions.json
---
```

### 1.2 Identität — Wie eine Stellenanzeige

FALSCH:
```
Du bist ein erfahrener Entwickler der hilft.
```

RICHTIG:
```
TypeScript Engineer, spezialisiert auf Hono APIs und Supabase.
Expertise: pnpm/Turborepo Monorepos, Zod Validation, RLS Policies.
Priorität: sub-200ms Endpoints, Zero Breaking Changes, minimaler Diff.
Arbeitsweise: ANALYZE → PLAN → EXECUTE → VERIFY
```

### 1.3 Modell-Routing — Feste Node-Referenzen

```yaml
spark1:
  default_models:
    - nemotron-3-super-nvfp4         # Orchestration, Dispatch, Monitoring
    - qwen3.6-35b-a3b-fp8            # Review, Spec Refinement

spark2:
  default_models:
    - qwen3-coder-next-fp8           # Main Coding Worker
  parallelism:
    mode: scheduler_controlled
    initial_max_slots: 6
    scale_after_benchmark: true

spark3:
  mode_1_models:
    - deepseek-r1-distill-70b-nvfp4  # Security, Deep Reasoning

spark4:
  mode_1_models:
    - glm-4.7-flash                  # Review, Test Generation, Tool Calling
    - qwen3.5-9b                     # Fast Sidekick, i18n, Validation

spark3+spark4:
  mode_2_models:
    - minimax-m2.7-nvfp4-tp2
  constraint: >
    Bindet Spark 3 und Spark 4 gemeinsam.
    Kein unabhängiger Einzelbetrieb von MiniMax.
    Aktivierung via drain → lock → activate Sequenz.

rtx5090:
  default_models:
    - qwen3-vl-30b-a3b-fp8
  role: mealcam_vision
```

### 1.3.1 Mode Switching — drain → lock → activate → release

```
Mode 1 → Mode 2:
  1. drain   — keine neuen Jobs für DeepSeek/GLM/Qwen3.5
  2. lock    — spark3 + spark4 auf: locked_for_minimax
  3. activate — MiniMax M2.7 TP=2 aktiv

Mode 2 → Mode 1:
  1. drain   — keine neuen MiniMax Jobs
  2. release — spark3 + spark4 auf: available

Trigger: quality_critical=true | 2× failed review | orchestrator flag
```

### 1.4 Output-Format Standard

```json
{
  "status": "PASS|FAIL|BLOCKED|ESCALATE|STOP",
  "approved": true,
  "issues": [],
  "changed_files": [],
  "validation_commands": ["pnpm tsc --noEmit"],
  "escalation_required": false
}
```

### 1.5 Negative Constraints — Mindestens 6 pro Agent

```
## Verbotene Operationen
- NIEMALS außerhalb scope_files lesen oder schreiben
- NIEMALS ENV-Dateien lesen oder schreiben
- NIEMALS Dependencies hinzufügen ohne expliziten Task
- NIEMALS DB-Migrationen erzeugen (→ db-migration-agent)
- NIEMALS bei fehlendem Kontext raten → BLOCKED melden
- NIEMALS Output außerhalb des definierten JSON-Schemas erzeugen
```

### 1.6 Pre-Output Checks — Kein CoT Output

```
## Pre-Output Checks
Führe diese Prüfungen intern durch. Gib KEINE Chain-of-Thought aus.
- Sind alle required_fields im Input vorhanden?
- Werden scope_files eingehalten?
- Sind Negative Constraints verletzt?
- Ist BLOCKED statt PASS/FAIL nötig?
- Muss eskaliert werden?
Nur finalen JSON Output ausgeben.
```

### 1.7 Error Handling

```
- Fehlende Pflichtfelder       → {"status": "BLOCKED", "missing": [...]}
- Widersprüchliche Constraints → {"status": "ESCALATE", "reason": "..."}
- Scope-Verletzung             → {"status": "STOP", "violation": "..."}
- Testfehler                   → {"status": "FAIL", "error": "...", "location": "..."}
- Security-relevanter Befund   → security-specialist Pflicht, kein Auto-Deploy
```

---

## TEIL 2 — SKILL DEFINITION STANDARD

### 2.1 Frontmatter

```yaml
---
name: skill-name
description: |
  Was dieser Skill tut.
  Use WHENEVER [TRIGGER_1], [TRIGGER_2].
  Do NOT use when [FALSCHE_SITUATION].
disable-model-invocation: true|false
user-invocable: true|false
allowed-tools: "Read(.claude/**), Bash(pnpm tsc --noEmit)"
---
```

### 2.2 disable-model-invocation

```
true  → Pipeline Skills (manuell triggern):
  chat-to-rawdata, rawdata-to-spec, spec-to-decomposition,
  decomposition-to-workorders, wo-writer, review-wo-batch

false → Domain/Tech Specialists (automatisch laden wenn relevant):
  alle *-specialist Skills, gsd-v2
```

---

## TEIL 3 — CHECKLISTE PRO AGENT

- [ ] Frontmatter V4.1 (agent_id, runtime_compat, prompt_template)
- [ ] Identität als Job-Posting (Frameworks, Tools, Prioritäten)
- [ ] Modell-Routing (default / fallback / premium)
- [ ] Input-Spezifikation mit required_fields
- [ ] Output-Schema JSON mit Beispiel
- [ ] Status-Codes (PASS/FAIL/BLOCKED/ESCALATE/STOP)
- [ ] Minimum 6 Negative Constraints
- [ ] Pre-Output Checks (intern, kein CoT Output)
- [ ] Error Handling für 5 Szenarien
- [ ] Workflow-Position
- [ ] MCP Tool Rechte (true/false)
- [ ] Eskalationsbedingungen

## TEIL 4 — CHECKLISTE PRO SKILL

- [ ] Frontmatter vollständig
- [ ] Description pushy mit "Use WHENEVER..."
- [ ] allowed-tools String (kein YAML-Listen-Format, kein Wildcard Bash)
- [ ] Step-by-Step Prozess
- [ ] Output Format JSON
- [ ] Negative Constraints
- [ ] Pre-Output Checks (intern)
- [ ] Error Handling
- [ ] Wann nutzen / Wann NICHT nutzen
- [ ] max 200 Zeilen

---

## AUSFÜHRUNGSPLAN FÜR AGENTS

| Agent | Priorität | Hauptlücke |
|---|---|---|
| orchestrator-agent | HOCH | Modell-Routing (spark1: Nemotron), Frontmatter |
| review-agent | HOCH | JSON Output Schema, Frontmatter |
| micro-executor | HOCH | Identität, Modell-Routing (spark2), Frontmatter |
| senior-coding-agent | HOCH | Modell-Routing (premium: MiniMax), Frontmatter |
| security-specialist | MITTEL | JSON Output Schema, Modell-Routing (spark3) |
| db-migration-agent | MITTEL | Rollback-Schema, supabase migration list |
| context-builder | MITTEL | JSON Output Schema, Frontmatter |
| governance-compiler | MITTEL | Identität, Validation-Kommandos |
| test-agent | NIEDRIG | Coverage-Definitionen, Modell-Routing (spark4: GLM) |
| mealcam-agent | NIEDRIG | Confidence-Schema, Modell-Routing (rtx5090) |
| i18n-agent | NIEDRIG | Modell-Routing (spark4: Qwen3.5) |
| docs-agent | NIEDRIG | Modell-Routing (spark4: Qwen3.5) |
