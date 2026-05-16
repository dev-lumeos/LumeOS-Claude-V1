# CLAUDE Code Task Protocol
> Konvertiert aus CLAUDE_CODE_TASK_PROTOCOL.md.rtf

**Zweck:** Verbindliches Auftragsprotokoll zwischen Plane → Repo → Claude Desktop / Claude Code.

**Kernregel:** Kein Plane-Item darf direkt "einfach so" an Claude Code übergeben werden. Erst ins Protokoll übersetzen.

**Grundlogik:**
```
Plane Item → Task Translation → Claude Code Task Payload
→ Claude Code Output → Review / Acceptance → Status Update in Plane
```

---

## 1. Welche Plane-Items an Claude Code dürfen

**Erlaubt:** WORK_ORDER, SPEC (als Schreib-/Analyseauftrag), REVIEW

**Nicht direkt:** DECISION (erst menschlich klären), PRD (nicht blind als Build-Task), RISK (Kontrollobjekte, keine Build-Tasks)

---

## 2. Vorbedingungen für einen gültigen Auftrag

1. `artifact_level` ist work_order / spec / review
2. Workstream klar gesetzt (A–G)
3. `source_of_truth_doc` vorhanden — ohne Source of Truth kein Auftrag
4. Alle relevanten Decisions sind entschieden — wenn `decision_state != decided`: Auftrag stoppen
5. Scope ist klein genug — zu breit = nicht übergeben, erst zerteilen
6. Acceptance-Kriterium definiert

---

## 3. Verbindlicher Task-Aufbau (18 Felder)

**TASK HEADER:**
1. `TASK TYPE` — WORK_ORDER / SPEC_DRAFT / SPEC_REVIEW / REVIEW / ANALYSIS
2. `TITLE` — kurzer eindeutiger Titel
3. `PLANE ITEM REFERENCE` — z.B. WO-014
4. `WORKSTREAM` — A_identity_user / B_nutrition_data / C_nutrition_logging / D_training / E_recovery / F_state_access / G_v1_experience / cross_foundation
5. `CURRENT PHASE` — z.B. "V1 Decision Phase"

**TASK CONTEXT:**
6. `SOURCE OF TRUTH` — Pflichtliste aller relevanten Artefakte
7. `TASK PURPOSE` — warum gibt es diesen Auftrag?
8. `OBJECTIVE` — was genau soll erzeugt / geprüft werden?
9. `IN SCOPE` — klare Liste was erlaubt ist
10. `OUT OF SCOPE` — Pflicht. Was NICHT Teil des Auftrags ist.

**EXECUTION RULES:**
11. `REQUIRED OUTPUT` — was genau am Ende vorliegen muss
12. `OUTPUT FORMAT` — wie das Ergebnis aussehen muss
13. `STOP RULES` — wann Claude stoppen darf (offene Entscheidung, Scope unklar, Source widersprüchlich, zu groß, Annahmen zu hoch)
14. `ACCEPTANCE` — woran das Ergebnis gemessen wird

**RETURN SECTION:**
15. `RESULT SUMMARY`
16. `FILES CREATED OR CHANGED`
17. `RISKS / OPEN POINTS`
18. `RECOMMENDED NEXT STEP`

---

## 4. Verbindliche Mindestregeln für den Inhalt

1. **Keine Scope-Erweiterung** — Claude darf nicht stillschweigend neue Layer/Features/Zusatzlogik einführen
2. **Keine Legacy-Annahmen ohne Prüfung** — alte Code-/Architektur-Reste sind nicht automatisch Wahrheit
3. **Keine offenen Entscheidungen überbauen** — Claude darf fehlende Entscheidungen nicht "praktisch lösen" durch Annahmen
4. **V1-Minimalismus** — bei mehreren sinnvollen Varianten: kleinere, klarere, V1-konformere bevorzugen
5. **Unknown ist erlaubt** — wenn etwas nicht ableitbar ist, markieren, nicht kaschieren

---

## 5. Standard-Stoppmechanismus

Claude muss abbrechen wenn:
1. Relevante Entscheidung fehlt
2. Source of Truth ist widersprüchlich
3. Auftrag ist zu groß oder unscharf
4. Auftrag würde in späteren Layer hineinragen
5. Akzeptanz ist nicht sinnvoll prüfbar
6. Notwendige Annahmen wären zu hoch

**Rückgabe bei Stopp:** `BLOCKED` + warum blockiert + welche Entscheidung fehlt + welcher kleinere nächste Schritt möglich wäre

---

## 6. Task-Typen

| Typ | Zweck | Output |
|---|---|---|
| WORK_ORDER | Kleine ausführbare Einheit | Kleine Spec, Teilstruktur, Änderungsvorschlag |
| SPEC_DRAFT | Spezifikation entwerfen | Scope/Non-Scope, Entities, Inputs/Outputs |
| SPEC_REVIEW | Bestehende Spec prüfen | Mängelliste, Widersprüche, Verbesserungsvorschläge |
| REVIEW | Fachliche Prüfung | Pass/Fail, Befunde, Freigabeempfehlung |
| ANALYSIS | Zerlegen, klassifizieren | Klare Analyse, keine Build-Illusion |

---

## 7. Standard-Template

```
TASK TYPE:
TITLE:
PLANE ITEM REFERENCE:
WORKSTREAM:
CURRENT PHASE:

SOURCE OF TRUTH:
- [Dokument 1]

TASK PURPOSE:
OBJECTIVE:

IN SCOPE:
- ...

OUT OF SCOPE:
- ...

REQUIRED OUTPUT:
- ...

OUTPUT FORMAT:
STOP RULES:
- ...

ACCEPTANCE:
- ...

RETURN FORMAT:
1. Result summary
2. Files created or changed
3. Risks / open points
4. Recommended next step
```

---

## 8. Beispiel — Guter Auftrag

```
TASK TYPE: SPEC_DRAFT
TITLE: Define minimal V1 goal object schema
PLANE ITEM REFERENCE: WO-014
WORKSTREAM: A_identity_user
CURRENT PHASE: V1 Decision Phase

SOURCE OF TRUTH:
- 07_V1_FOUNDATION_SCOPE.md
- 15_V1_SYSTEM_CONTRACT.md

TASK PURPOSE:
Create the minimal V1 goal object spec so identity/user foundation
can move into PRD/spec readiness.

OBJECTIVE:
Draft a minimal V1-compatible goal object spec.

IN SCOPE:
- main goal
- optional simple subgoal support if decided
- required vs optional fields
- minimal validation rules

OUT OF SCOPE:
- recommendation logic
- coaching logic
- advanced goal hierarchies

REQUIRED OUTPUT:
- one markdown spec draft

STOP RULES:
- stop if goal model decision is not actually decided
- stop if source docs conflict on subgoals

ACCEPTANCE:
- minimal V1 only
- no later-layer contamination
- V1 System Contract compatible
```

## 9. Beispiel — Schlechter Auftrag

```
Build the user system and goals and make it future-proof with buddy integration.
```
Warum schlecht: zu groß, unklar, keine Source of Truth, keine Stop-Regeln, Scope explodiert, Buddy zu früh.

---

## 10. Wann ein Plane-Item "Claude-ready" ist

Pflichtcheckliste:
- [ ] `artifact_level` gültig (work_order / spec / review)
- [ ] `workstream` gesetzt
- [ ] `source_of_truth_doc` vorhanden
- [ ] Relevante decisions entschieden
- [ ] Scope klein genug
- [ ] `acceptance` definiert
- [ ] Kein harter `governance_flag` blockiert

Wenn eines fehlt → Item nicht an Claude Code geben.
