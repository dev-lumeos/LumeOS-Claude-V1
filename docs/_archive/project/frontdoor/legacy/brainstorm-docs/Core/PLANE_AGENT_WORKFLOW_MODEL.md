# PLANE Agent Workflow Model
> Konvertiert aus PLANE_AGENT_WORKFLOW_MODEL.md.rtf

**Zweck:** Operatives Zielmodell für den Einsatz von AI-Agents innerhalb von Plane für den kontrollierten LumeOS-Rebuild.

**Oberste Regel:** Agents sind keine autonomen Produktmanager. Agents sind kontrollierte Systemarbeiter.

---

## 1. Die 4 Systemrollen

| Rolle | Wer | Aufgabe |
|---|---|---|
| **Human Control** | Du | Finale Entscheidungen, Freigaben, Scope-Kontrolle, Abnahmen. Nicht delegierbar. |
| **Plane Control Layer** | Plane selbst | Status, Zustandswechsel, Zuordnung, Priorisierung, Sichtbarkeit, Triggerpunkte |
| **Thinking Agents** | Claude Desktop, Claude via MCP | Analysieren, Strukturieren, Schreiben, Reviewen, Zerlegen |
| **Execution Agents** | Claude Code, Cursor, lokale Worker | Konkrete Work Orders bearbeiten, kleine Artefakte erzeugen |

---

## 2. Die 5 Agentenklassen

| Klasse | Aufgabe | Darf NICHT |
|---|---|---|
| **DECISION_SUPPORT_AGENT** | Optionen strukturieren, Vor-/Nachteile, Empfehlung formulieren | Final entscheiden, stillschweigend Annahmen setzen |
| **PRD_AGENT** | PRD-Entwürfe schreiben, Scope schärfen | Offene Entscheidungen überbauen, neue Produktlogik erfinden |
| **SPEC_AGENT** | Entities strukturieren, Inputs/Outputs definieren, State-Logik schärfen | PRD-Scope verändern, V1 erweitern |
| **WO_AGENT** | Kleine Work Orders ausführen, Artefakte schreiben | Ganze Module "bauen", Architektur frei verändern |
| **REVIEW_AGENT** | Lücken markieren, Widersprüche finden, Drift erkennen | Wahrheit überschreiben, stillschweigend korrigieren |

---

## 3. Welcher Agent welches Plane-Item bearbeiten darf

| Item-Typ | Erlaubte Agents |
|---|---|
| DECISION | DECISION_SUPPORT_AGENT, REVIEW_AGENT |
| PRD | PRD_AGENT, REVIEW_AGENT |
| SPEC | SPEC_AGENT, REVIEW_AGENT |
| WORK_ORDER | WO_AGENT, Execution Agents, REVIEW_AGENT |
| REVIEW | REVIEW_AGENT |
| RISK | REVIEW_AGENT, DECISION_SUPPORT_AGENT |

---

## 4. Agent-Ready Check

Ein Item ist nur agent-ready wenn:
- [ ] `artifact_level` gesetzt
- [ ] `workstream` gesetzt
- [ ] `source_of_truth_doc` vorhanden
- [ ] `v1_scope_status` gesetzt
- [ ] `artifact_status` sinnvoll
- [ ] Keine harte fehlende Entscheidung blockiert
- [ ] Auftrag klein genug

→ Wenn nicht erfüllt: **Agent nicht ansetzen**

---

## 5. Plane-States die Agents triggern sollten

| State | Sinnvoll für |
|---|---|
| `ANALYZING` | Decision Support, PRD Agent, Spec Agent |
| `IN_DEFINITION` | PRD Agent, Spec Agent, WO Agent |
| `READY_FOR_REVIEW` | Review Agent |
| `READY_FOR_BUILD` | WO Agent, Claude Code, Execution Agents |
| `UNDER_REVIEW` | Review Agent, Human Review |

**States die NICHT automatisch triggern:** OPEN, BLOCKED, REJECTED, DECISION_NEEDED

---

## 6. Die 3 Betriebsmodi

| Modus | Darf | Nicht | Ideal für |
|---|---|---|---|
| `READ_ONLY` | Lesen, analysieren, Empfehlungen geben | Schreiben, Status ändern | Decision Support, Reviews |
| `DRAFT_WRITE` | Drafts erzeugen, Artefakte vorbereiten | Final freigeben, Entscheidungen überschreiben | PRD Agent, Spec Agent, WO Agent |
| `CONTROLLED_EXECUTION` | Definierte Work Orders ausführen | Außerhalb des WO arbeiten, Produktlogik ändern | Claude Code, Worker |

---

## 7. Empfohlene Startzuordnung

**Claude Desktop:** DECISION_SUPPORT_AGENT + PRD_AGENT + SPEC_AGENT + REVIEW_AGENT
→ Denken, Strukturieren, Schreiben, Review, Zerlegung

**Claude Code:** WO_AGENT + SPEC_AGENT (begrenzt) + REVIEW_AGENT (auf Auftrag)
→ Kleine operative Ausführung, begrenzte technische Outputs

**Sicherster Startmodus:** Human-in-the-Loop — du weist Item bewusst einem Agent zu, Agent bearbeitet nur dieses eine definierte Item, danach Review.

---

## 8. Vollständiger Workflow mit Agents

```
DECISION FLOW:
Decision created → Human marks for analysis → Decision Support Agent
→ Human decides → Decision marked decided → dependent PRDs unblocked

PRD FLOW:
Decision decided → PRD item IN_DEFINITION → PRD Agent drafts
→ Review Agent checks → Human approves → PRD APPROVED

SPEC FLOW:
PRD approved → Spec item IN_DEFINITION → Spec Agent drafts
→ Review Agent checks → Human approves → Spec APPROVED

WORK ORDER FLOW:
Spec approved → WO item created → WO marked READY_FOR_BUILD
→ Claude Code executes → Output returned
→ Review Agent checks → Human accepts
```

---

## 9. Was Agents in diesem System niemals dürfen

1. Finale Decisions setzen
2. Scope erweitern
3. Unklare Punkte stillschweigend lösen
4. PRD / Spec / WO Reihenfolge überspringen
5. Items als "fertig" behandeln wenn Acceptance fehlt
6. Legacy-Wahrheit unbemerkt einschleusen
7. Mehrere Artefaktebenen in einem Auftrag vermischen

---

**Ein-Satz-Definition:** In LumeOS werden Agents in Plane nicht als autonome Denker oder Entscheider eingesetzt, sondern als kontrollierte, rollenbasierte Systemarbeiter innerhalb eines klaren Governance- und Artefakt-Workflows.

**Schlussregel:** Bevor ein Agent auf ein Plane-Item angesetzt wird: "Ist das Item agent-ready — und hat dieser Agent die Rolle um dieses Item sauber zu bearbeiten?"
