# REVIEW-WO-GOVERNANCE-P1-006-dispatcher-fail-cleanup.md

> Review der Draft-Workorder `WO-GOVERNANCE-P1-006-dispatcher-fail-cleanup.md`
> Reviewer: Opus | Datum: 2026-05-02

---

## Verdict

**PASS_WITH_FIXES**

Schema-kompatibel, template-konform, Risk-Klassifikation und Approval-Anforderung korrekt, alle Bypass-Verbote (Preflight, Validator, runtime_state, JSONL) sauber gesetzt, Drei-Varianten-Architektur mit klarer Default-Empfehlung. **Eine wichtige Scope-Lücke** (Test-File-Pfad) und zwei Minor-Klarstellungen vor Batch-Übergabe.

---

## Findings

| Severity | Finding | Fix |
|---|---|---|
| Important | `scope_files` listet 3 Source-Files, aber der `<implement>`-Block fordert "Inline-Tests in `system/control-plane/__tests__/`". Test-File-Pfad ist nicht in `scope_files`. Worker müsste eine NEUE Test-Datei außerhalb `scope_files` erzeugen. WO-005 hatte das gleiche Muster und es funktionierte (Test-Datei wurde erfolgreich erzeugt) — vermutlich erkennt das Permission-Gateway Tests unter `__tests__/` als zulässig. Trotzdem ist die WO formal mehrdeutig: scope_files vs. Implementation-Anweisung divergieren. | `scope_files` um konkreten Test-File-Pfad oder Verzeichnis-Glob erweitern, z. B.:<br>`- "system/control-plane/__tests__/dispatcher-cleanup.test.ts"`<br>oder als Pattern:<br>`- "system/control-plane/__tests__/dispatcher-cleanup*.test.ts"`<br>Alternativ: `__tests__`-Verzeichnis explizit aus `files_blocked` herausnehmen, falls implizit-erlaubt. Konsistenz mit WO-005-Präzedenz ist akzeptabel, aber sauber wäre die Erweiterung. |
| Minor | `scope_files` enthält `system/state/state-manager.ts` und `system/state/audit-writer.ts`, aber `<constraints>` schränkt Edits stark ein: bei state-manager.ts "nur Kommentare/Idempotenz-Doku, keine Verhaltensänderung", bei audit-writer.ts "additiv ohne Signaturänderung". Kein Bug, aber Worker könnte ratlos sein, warum die Files in scope sind. | Optional: Im Notes-Block oder direkt im `<implement>`-Block klar zwischen "primary edit" (dispatcher.ts) und "secondary read+optional doc/additive" (state-manager.ts, audit-writer.ts) unterscheiden. Aktuell schon erwähnt im Notes-Block — könnte präziser sein. Nicht-blockierend. |
| Minor | Notes referenzieren "WO-007 (`risk_level`-Normalisierung)" als Folge-WO — diese WO existiert noch nicht. Forward-Reference im Spec-Dokument. Bei späterem Lesen könnte das Verwirrung stiften, falls die WO-Numerierung anders fortgeführt wird. | Optional: Reformulieren als "ein zukünftiger Folge-WO für `risk_level`-Normalisierung (analog zu WO-005)" ohne konkrete WO-Nummer. Nicht-blockierend. |
| OK | Schema-Compliance: `workorder_id: WO-governance-006` matched Regex, alle Pflichtfelder vorhanden, `negative_constraints = 17` (≥ 4), `acceptance_criteria = 15` (≥ 1), `risk_category: architecture` im Enum, kein `rollback_hint`-Pflicht. | — |
| OK | Template `template_implementation_medium.md` korrekt umgesetzt: `senior-coding-agent`, XML mit allen 4 Blöcken, `post_review_required: true` in `<constraints>` vermerkt, `required_skills: ["gsd-v2"]`. | — |
| OK | `risk_category: architecture` + `requires_approval: true` korrekt — der WO verändert Dispatcher-Verhalten (strukturelle Cleanup-Logik) und berührt state-manager + audit-writer (shared-core-Boundary). Per `CLAUDE.md` Cautious-Regel + High-Risk-Anforderung. | — |
| OK | Drei Lösungsvarianten (Try/Finally Default, Cleanup-Helper, State-Manager-Hook) sind sinnvoll, nicht überlappend, Default-Empfehlung mit klarer Begründung. ESCALATE-Pfade für die anderen sauber dokumentiert. | — |
| OK | Preflight-Bypass-Verbot mehrfach gesetzt: in `<constraints>`, in `negative_constraints`, in AC #10, plus `scheduler-preflight.ts` in `files_blocked`. | — |
| OK | Governance-Validator-Bypass-Verbot mehrfach gesetzt: in `<constraints>`, in `negative_constraints`, in AC #11, plus `governance-validator.ts` in `files_blocked`. | — |
| OK | `runtime_state.json` und alle JSONL-Logs in `files_blocked`; "NIEMALS direkt editieren" mehrfach in `negative_constraints`. Indirekte Mutation via state-manager.ts und audit-writer.ts (existing API) ist erlaubt — das ist der korrekte Pfad. | — |
| OK | Acceptance Criteria messbar: 15 konkrete Punkte, davon AC #14 mit explizit 5 FAIL-Pfaden (Validator FAIL, Validator BLOCKED, Tool-Auth Block, Files-Scope-Violation, Approval-Gate Block) + Lock-Release-Verifikation. | — |
| OK | Tests sind scope-bezogen: DispatcherDeps-Mocks für callModel/executeTool, keine echten Spark-Calls — analog `smoke-test.ts`-Muster. | — |
| OK | `releaseScopeLock` und `releaseDbMigrationLock` Idempotenz wird in der WO als bestehend angenommen. Bestätigt durch existierenden Code in dispatcher.ts (catch-Block ruft sie zuverlässig auf), also Annahme valide. | — |
| OK | `MAX_REWRITE_LOOPS`-Schutz explizit (negative_constraint + AC). | — |
| OK | Komplementarität zu WO-005: WO-005 fixt Pipeline-FAIL-Vermeidung, WO-006 fixt FAIL-Folge-Cleanup. Beide WOs zusammen entkoppeln den Bootstrap-Workflow von manuellem State-Cleanup. | — |
| OK | Files-Blocked deckt alle kritischen Out-of-Scope-Pfade ab: services/scheduler-api, batch-loader, runtime_state, JSONLs, validator, preflight, schema, package.json, supabase, env. | — |

---

## Batch Readiness

**Ready** (nach Important-Fix).

Empfohlen als eigener Single-WO-Batch `BATCH-GOVERNANCE-P1-003-dispatcher-fail-cleanup.md` analog zum Pattern von `BATCH-GOVERNANCE-P1-001` (Batch-Loader) und `BATCH-GOVERNANCE-P1-002` (OrchestratorIntent). Nicht in den Nutrition-DB-Batch integrierbar, da WO-006 operativer Vorgänger für den End-to-End-Run ist (verhindert manuelles State-Cleanup nach jedem FAIL).

---

## Required Fixes

Echter Fix vor Batch-Übergabe (nicht optional):

1. **Test-File-Pfad in `scope_files` ergänzen** (Important Finding):
   - Konkreten Pfad oder Pattern hinzufügen, z. B.:
     ```yaml
     scope_files:
       - "system/control-plane/dispatcher.ts"
       - "system/state/state-manager.ts"
       - "system/state/audit-writer.ts"
       - "system/control-plane/__tests__/dispatcher-cleanup.test.ts"
     ```
   - Damit ist die Implementation eindeutig autorisiert die Test-Datei zu erzeugen, ohne sich auf WO-005-Präzedenz zu verlassen.

Optionale Klarstellungen (Minor, nicht batch-blockierend):

2. Notes-Block: präzisere Trennung "primary edit (dispatcher.ts)" vs. "secondary additive (state-manager.ts comments only, audit-writer.ts additive events only)".
3. Notes-Block: Forward-Reference auf `WO-007 (risk_level)` durch generische Beschreibung ersetzen.

---

## Recommended Next Step

**Fix-Pass für Draft-WO** (Important Finding 1 schließen, optional Minor-Findings adressieren). Anschließend:

1. Single-WO-Batch `BATCH-GOVERNANCE-P1-003-dispatcher-fail-cleanup.md` erzeugen mit Status `ready_for_approval` (Pattern wie `BATCH-GOVERNANCE-P1-002`).
2. Tom approved den Batch.
3. WO über den existierenden Batch-Loader-CLI dispatchen (Library-Pfad ist seit `WO-governance-004` betriebsbereit).
4. Nach `closed`: Nutrition Batch 001 `--run` erneut testen — sollte ohne stale Locks durchlaufen, am Validator-Stage 2 (`risk_level` undefined) abbrechen — was wiederum zu einem **WO-007** für `risk_level`-Normalisierung führt (analoges Pattern zu WO-005, kein Cleanup-Problem mehr dank dieser WO).

---

*Review erzeugt: 2026-05-02 — gemäß `template_implementation_medium.md`, `workorder.schema.json`, `wo_lifecycle_v1.md`, Workflow-Test-Befunde, und WO-GOVERNANCE-P1-005 als Pattern-Vorlage.*
