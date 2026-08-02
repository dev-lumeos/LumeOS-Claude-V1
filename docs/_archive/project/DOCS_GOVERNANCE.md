# LUMEOS Docs-Governance V1
# system + docs Konsistenz-Regeln

**Stand:** April 2026 | **Autor:** Tom + Claude | **Status:** AKTIV

---

## 1. Warum Docs-Governance?

Das System hat drei Wissensschichten:

```
Code + Schema         →  Runtime-Wahrheit (was läuft wirklich)
System-Docs           →  Referenz für Mensch + Agent (was soll laufen)
Brainstorm/Specs      →  Design-Entscheidungen (warum so)
```

Wenn Code und System-Docs auseinanderlaufen, entsteht Docs-Drift.
Docs-Drift macht Agents falsche Entscheidungen, weil sie aus veralteten Quellen lesen.

---

## 2. Single Source of Truth (SSOT)

Diese Dateien sind **kanonische Quellen**. Ihre Inhalte gelten als definitiv.
Widersprüche werden immer zugunsten des Code gelöst.

| SSOT-Datei | Für was autoritativ |
|---|---|
| `system/control-plane/risk-categories.ts` | Risk-Kategorien-Liste, Routing-Regeln |
| `system/control-plane/stop-rules.ts` | Automatische Stop-Schwellwerte |
| `system/control-plane/night-run-policy.ts` | Night-Run-Kategorien, Policy-Defaults |
| `system/workorders/schemas/workorder.schema.json` | WO-Felder, Validierung, Pflichtfelder |
| `system/agent-registry/agents.json` | Agent-Definitionen, Capabilities |
| `system/agent-registry/model_routing.json` | Agent → Spark-Mapping |
| `system/agent-registry/tool_profiles.json` | Erlaubte Tools pro Agent |
| `system/state/state-manager.ts` | WO-Status-Übergänge (WO_TRANSITIONS) |
| `STACK_REFERENCE.md` (root) | Hardware-Tabelle, Port-Liste, Stack |
| `SESSION_ONBOARDING.md` (root) | Aktueller Session-Stand |

---

## 3. Abhängigkeits-Matrix: Code-Änderung → Docs-Update

### 3a. BLOCKING — muss im selben Commit oder direkt danach aktualisiert werden

| Code-Datei geändert | Docs die aktualisiert werden MÜSSEN |
|---|---|
| `risk-categories.ts` (neue Kategorie) | `STACK_REFERENCE.md` § Risk-Kategorien, `SESSION_ONBOARDING.md` § Governance |
| `model_routing.json` (neuer Agent/Node) | `STACK_REFERENCE.md` § Agent Routing, `docs/project/STACK_REFERENCE.md` |
| `workorder.schema.json` (neues Pflichtfeld) | `SESSION_ONBOARDING.md` § Workorder Format, `docs/project/SESSION_ONBOARDING.md` |
| `agents.json` (neuer Agent) | `AGENTS.md`, `system/agent-registry/agent_registry_v2.md` |
| `stop-rules.ts` (neuer Threshold) | `SESSION_ONBOARDING.md` § Stop-Regeln (nächste Session) |
| `night-run-policy.ts` (Kategorie-Liste) | `SESSION_ONBOARDING.md` § Night-Run-Policy |
| Neuer Service + Port | `STACK_REFERENCE.md` § Services |
| Neues Spark-Node hinzugefügt | `STACK_REFERENCE.md` § Hardware, `docs/project/STACK_REFERENCE.md` |

### 3b. SOFT — sollte zeitnah aktualisiert werden, blockiert nicht

| Was geändert | Empfohlenes Docs-Update |
|---|---|
| `WO_TRANSITIONS` (State-Machine) | `SESSION_ONBOARDING.md` § Dispatcher Regeln |
| `DEFAULT_POLICY` (Night-Run) | `SESSION_ONBOARDING.md` § Night-Run |
| Neues Report-Format | `SESSION_ONBOARDING.md` § Reports |
| Neuer Risk-Score in pipeline | `docs/reports/` + Morning Report |
| `authorize-tool-call.ts` (neue Logik) | `system/control-plane/RULES.md` |
| Preflight: neuer Check | `SESSION_ONBOARDING.md` § Preflight |

### 3c. ARCHIV — kein Update nötig (absichtliche Drift erlaubt)

```
docs/BrainstormDocs/**   →  historische Designdokumente, kein Maintenance
docs/prompts/**          →  einmalige Prompts, kein Maintenance
docs/todos/**            →  TODO-Tracker, wird bei Bedarf aktualisiert
```

---

## 4. Docs-Drift-Klassifikation

### DRIFT_BLOCKING
Der Drift macht das System falsch oder gefährlich.

Beispiele:
- `STACK_REFERENCE.md` nennt andere Model-Namen als `model_routing.json`
- `SESSION_ONBOARDING.md` nennt andere Agents als `agents.json`
- WO-Schema-Felder in `SESSION_ONBOARDING.md` stimmen nicht mit `workorder.schema.json`

**Konsequenz:** Agents lesen falsches SSOT → falsche Routing-Entscheidungen

### DRIFT_WARNING
Drift macht das System suboptimal aber nicht falsch.

Beispiele:
- `SESSION_ONBOARDING.md` noch nicht auf letzten Commit-Stand
- `STACK_REFERENCE.md` Port-Tabelle noch nicht aktualisiert
- `AGENTS.md` zeigt nicht alle neuen Agents

**Konsequenz:** Mensch bekommt veraltete Infos, Agent-Decisions bleiben korrekt

### DRIFT_INFO
Drift ist erwartbar und akzeptabel.

Beispiele:
- `BrainstormDocs` nicht auf Stand (war nie Maintenance-Ziel)
- `docs/todos/` nicht aktuell
- Ältere `benchmark_*.md` in `docs/reports/`

---

## 5. Session-Onboarding Pflichtfelder

`SESSION_ONBOARDING.md` und `STACK_REFERENCE.md` müssen nach **jeder Session** diese Felder korrekt halten:

```
[ ] Aktueller Spark-Status (Nodes, IPs, Modelle)
[ ] Agent-Routing-Tabelle aktuell
[ ] Offene TODOs korrekt (abgeschlossene entfernt)
[ ] Phase-Status korrekt (Phase 1 AKTIV vs PENDING)
[ ] Neuester Commit-Hash wenn relevant
```

---

## 6. Checker-Tool

```bash
# Docs-Drift prüfen (ohne System-Stop auszulösen)
npx tsx system/control-plane/docs-drift-checker.ts

# Mit --blocking-only: Nur kritische Drifts zeigen
npx tsx system/control-plane/docs-drift-checker.ts --blocking-only
```

Der Checker gibt zurück:
- `DRIFT_BLOCKING` — muss sofort korrigiert werden
- `DRIFT_WARNING` — sollte zeitnah korrigiert werden
- `OK` — kein Problem

---

## 7. Warum diese Regeln?

**Agents lesen Docs-Dateien als Kontext.** Wenn `SESSION_ONBOARDING.md` veraltete Risk-Kategorien enthält, kann ein Agent eine WO falsch klassifizieren. Wenn `STACK_REFERENCE.md` den falschen Port für einen Service nennt, kann ein Agent den falschen Endpoint ansprechen.

**Brainstorm-Docs sind Wissensarchiv, keine Runtime-Referenz.** Sie werden von Agents NICHT als autoritativer Kontext verwendet. Drift dort ist keine Gefahr.

**Blocking-Drift wird erkannt, nicht automatisch behoben.** Der Checker meldet, Tom entscheidet und behebt. Kein autonomes Doc-Update durch Agents.
