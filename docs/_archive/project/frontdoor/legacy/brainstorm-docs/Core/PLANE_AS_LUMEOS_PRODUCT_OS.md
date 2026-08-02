# PLANE als LumeOS Product OS
> Konvertiert aus PLANE_AS_LUMEOS_PRODUCT_OS.md.rtf

**Zweck:** Wie Plane als visuelle Produkt-, Governance- und Delivery-Welt für den kontrollierten LumeOS-Rebuild verwendet wird.

**Oberste Regel:**
- Plane ist NICHT die Wahrheit. Plane ist die visuelle Steuerwelt.
- Die eigentliche Wahrheit liegt in den kontrollierten Kern-Dokumenten, Decisions, PRDs, Specs, Work Orders, dem Repo-Zustand.
- **Plane ist Control Plane, nicht Source of Truth.**

---

## Was Plane in diesem Setup leisten soll (5 Ziele)

1. **Visuelle Produktwelt** — wo steht das Projekt, welche Phase, welche Workstreams, was ist blockiert, was kommt als Nächstes
2. **Decision Control** — keine Kernfragen vergessen, überspringen oder implizit entscheiden
3. **Artifact Pipeline Management** — klarer Status jedes Artefakts (Decision → PRD → Spec → WO → Build → Review → Accept)
4. **Governance Visibility** — Scope Drift, Rework-Risiken, Pipeline-Verstöße sichtbar machen
5. **Execution Readiness** — jederzeit operative, kleine, ausführbare Arbeitseinheiten erzeugen

**Was Plane NICHT sein soll:** Brainstorming-Chaos, schnelle Ticket-Spielplatz, Ersatz für echte Produktdokumente, Ort an dem Wahrheit ohne Artefakte geändert wird.

---

## Empfohlene Plane-Projekte (5)

| Projekt | Zweck |
|---|---|
| **LUMEOS_CORE_FOUNDATION** | Kontrollierte Rekonstruktion, V1 Scope, Workstreams, aktive Kernarbeit. Das Hauptprojekt. |
| **LUMEOS_DECISIONS** | Alle produkt- und systemkritischen Entscheidungen |
| **LUMEOS_PRDS** | Alle freigegebenen oder in Arbeit befindlichen PRDs |
| **LUMEOS_SPECS** | Alle konkreten technischen/fachlichen Spezifikationen |
| **LUMEOS_WORKORDERS** | Kleine, ausführbare Arbeitspakete |

---

## 6 Issue-Typen

| Typ | Bedeutung | Beispiele |
|---|---|---|
| **DECISION** | Noch zu klärende Kernfrage | Finaler Auth-Ansatz, Portion Scope V1 |
| **PRD** | Freigegebener Produkt-/Workstream-Vertrag | PRD Identity, PRD Nutrition Logging |
| **SPEC** | Konkrete fachliche/technische Spezifikation | Goal Entity Spec, Food Search Spec |
| **WORK_ORDER** | Kleines ausführbares Arbeitspaket | "Define minimal goal object schema" |
| **REVIEW** | Dedizierte Prüf-/Abnahmerunde | Review PRD Nutrition Foundation |
| **RISK** | Identifiziertes Risiko oder Governance-Problem | Scope Drift in Training Module |

---

## 8 Pflicht-Custom-Fields

| Field | Typ | Werte |
|---|---|---|
| **artifact_level** | Single Select | decision / prd / spec / work_order / review / risk |
| **workstream** | Single Select | A_identity_user / B_nutrition_data / C_nutrition_logging / D_training / E_recovery / F_state_access / G_v1_experience / cross_foundation |
| **v1_scope_status** | Single Select | in_v1_now / later_planned / delayed_by_design / parking_only |
| **decision_state** | Single Select | not_needed / open / directionally_clear / decided / blocked_by_decision |
| **source_of_truth_doc** | Text | z.B. "15_V1_SYSTEM_CONTRACT.md" |
| **artifact_status** | Single Select | draft / in_review / approved / blocked / obsolete / accepted |
| **build_readiness** | Single Select | not_buildable / needs_prd / needs_spec / needs_split / worker_ready / under_build / built / reviewed |
| **governance_flag** | Multi Select | scope_drift / legacy_contamination / undefined_state / weak_acceptance / missing_decision / too_large / invalid_sequence / duplicate_logic |

**Pflicht-Regel:** Kein Item darf "frei schweben". Jedes Item braucht mindestens: artifact_level, workstream, source_of_truth_doc, artifact_status, v1_scope_status.

---

## 12 Empfohlene States

| State | Bedeutung |
|---|---|
| OPEN | Noch nicht aktiv bearbeitet |
| ANALYZING | Wird gerade zerlegt / geprüft |
| DECISION_NEEDED | Kann nicht weiterlaufen ohne Entscheidung |
| IN_DEFINITION | Wird als PRD / Spec / WO konkretisiert |
| READY_FOR_REVIEW | Definition oder Artefakt ist prüfbar |
| APPROVED | Artefakt fachlich freigegeben |
| READY_FOR_BUILD | Kann als WO / Umsetzung verwendet werden |
| IN_BUILD | Wird aktiv umgesetzt |
| UNDER_REVIEW | Wird fachlich / technisch geprüft |
| ACCEPTED | Sauber abgeschlossen |
| BLOCKED | Kann aktuell nicht weiterlaufen |
| REJECTED | War unbrauchbar / falsch |

---

## 5 Wichtige Views

| View | Filter/Gruppierung | Zweck |
|---|---|---|
| **V1 DECISION BOARD** | artifact_level=decision, v1_scope_status=in_v1_now, gruppiert nach decision_state | Tägliches Decision-Cockpit |
| **WORKSTREAM CONTROL** | v1_scope_status=in_v1_now, gruppiert nach workstream | V1-Landkarten-View |
| **ARTIFACT PIPELINE** | gruppiert nach artifact_level, sortiert nach artifact_status | Produktionsband-View |
| **BUILD READY QUEUE** | build_readiness=worker_ready, artifact_level=work_order | Echte Execution Queue |
| **GOVERNANCE RISK VIEW** | governance_flag is not empty | Drift- und Fehlerwarnsystem |

---

## Kernlogik des Systems

```
Decision → PRD → Spec → Work Order → Build → Review → Accept
```

Nichts soll diese Reihenfolge stillschweigend überspringen.

**Wichtigste Governance-Regeln:**
- Erst wenn `decision_state = decided` dürfen abhängige PRDs/Specs auf "approved / ready for build" gehen
- Kein PRD darf freigegeben werden wenn relevante Decisions noch offen sind
- Jede Spec muss genau EINEM PRD oder PRD-Bereich zuordenbar sein
- Wenn ein Work Order in einem Satz zu groß klingt, ist er zu groß

---

## Richtige Arbeitslogik (8 Schritte)

1. Offene Entscheidung identifizieren
2. Decision in Plane sichtbar machen
3. Decision sauber klären
4. PRD daraus ableiten
5. PRD in Specs zerlegen
6. Specs in kleine WOs zerlegen
7. Nur worker_ready WOs bauen
8. Review und Acceptance

---

## Wie Claude mit Plane zusammenspielen soll

**Claude hilft bei:** Decision-Vorlagen, PRD-Drafts, Spec-Drafts, WO-Zerlegung, Review/Gap Detection, Governance-Prüfung, Missing-Artifact-Erkennung

**Claude tut NICHT:** Wahrheit direkt in Plane "erfinden", Entscheidungen stillschweigend treffen, unklare Dinge direkt operationalisieren, Governance ignorieren

---

**Ein-Satz-Definition:** Plane wird für LumeOS nicht als gewöhnliches Task-Tool genutzt, sondern als visuelle Control Plane für Decisions, Artefakte, Governance, Delivery und operative Build-Bereitschaft.
