# REVIEW-WO-GOVERNANCE-P1-005-orchestrator-intent-contract.md

> Review der Draft-Workorder `WO-GOVERNANCE-P1-005-orchestrator-intent-contract.md`
> Reviewer: Opus | Datum: 2026-05-02

---

## Verdict

**PASS_WITH_FIXES**

Schema-kompatibel, template-konform, Risk-Klassifikation korrekt (`architecture`/`requires_approval: true`), Validator-Bypass und `MAX_REWRITE_LOOPS`-Manipulation sauber verboten, drei Lösungsvarianten konsistent dokumentiert. **Eine wichtige Scope-Lücke** in Variante A (Default) und drei Minor-Klarstellungen vor Batch-Übergabe.

---

## Findings

| Severity | Finding | Fix |
|---|---|---|
| Important | Variante A (Default) listet drei Mapping-Quellen, aber **zwei davon liegen außerhalb `scope_files`**: (1) `system/agent-registry/agents.json` (in `context_files`, also read-only) für `validator_target_agent`-Feld, (2) `system/control-plane/agent-validator-map.json` (gar nicht in scope_files). Worker müsste entweder ESCALATE anstoßen, agents.json schreiben (Constraint-Verletzung), eine neue Datei außerhalb scope erzeugen, oder auf die hardcoded Default-Map zurückfallen. Letzteres ist die einzige im aktuellen Scope umsetzbare Option — was Variante A zu "nur Hardcoded" reduziert und die "explizite, dokumentierte Mapping-Schicht" der AC nur teilweise erfüllt. | Eine von drei Optionen: (a) `system/agent-registry/agents.json` und `system/control-plane/agent-validator-map.json` zu `scope_files` hinzufügen + zu `files_blocked` anpassen; (b) im Task explizit deklarieren "V1 nutzt nur Hardcoded Default-Map; agents.json-Erweiterung und separate Map-Datei sind Phase 2 / eigene WO"; (c) eine separate Mapping-Datei nur im Dispatcher-Modul ablegen, z. B. `system/control-plane/agent-validator-map.ts` (TypeScript Modul, fällt unter dispatcher.ts-Scope wenn als Helper importiert — aber technisch nicht im scope_files-Liste). Empfehlung: Option (b), klarste Variante. |
| Minor | `scope_files` enthält `system/prompts/orchestration/orchestrator_main_prompt.md`. Falls die Datei nicht existiert oder nicht vom Dispatcher geladen wird, hat die WO trotz on_error ESCALATE einen mehrdeutigen scope_files-Eintrag. Worker könnte versucht sein, die Datei "vorsichtshalber" zu erzeugen. | Optional: scope_files-Entry mit Inline-Kommentar präzisieren oder den Pfad nur in `context_files` listen, bis Variante B/C explizit gewählt wird. Nicht-blockierend, aber sauberer wäre er aus scope_files entfernt — Worker bei Variante B/C eskaliert ohnehin, dann kann der Pfad nachträglich freigegeben werden. |
| Minor | Acceptance Criterion "Audit-Trail (`system/state/pipeline-audit.jsonl`) zeigt Mapping-Events nachvollziehbar" ist messbar, aber `system/state/**` ist in `files_blocked`. Der Worker schreibt nicht direkt in die JSONL, sondern via `system/state/audit-writer.ts` (bereits vom Dispatcher importiert). Das ist OK — Audit-Events laufen über bestehende Infrastruktur. Sollte trotzdem im Task-Body explizit erwähnt werden, damit Worker nicht versucht, JSONL direkt zu öffnen. | Im `<implement>`-Block ergänzen: "Audit-Events ausschließlich über `system/state/audit-writer.ts` schreiben, nicht direkt in `pipeline-audit.jsonl`." Nicht-blockierend. |
| Minor | `validation_commands` enthält `pnpm test` zusätzlich zu `pnpm tsc --noEmit`. Bei einem `architecture`-Risk-WO lange Test-Laufzeit möglich (turbo run test über alle Packages). Der Schema-Default ist nur `pnpm tsc --noEmit`. Gewollt, aber sicherheitshalber prüfen. | Akzeptabel wie ist; alternativ auf gezielte Test-Specs einschränken (z. B. `pnpm test -- system/control-plane/__tests__/`). Nicht-blockierend. |
| OK | Schema-Compliance: `workorder_id` matched Regex, alle Pflichtfelder vorhanden, `negative_constraints = 12` (≥ 4), `acceptance_criteria = 13` (≥ 1), `risk_category: architecture` im Enum, kein `rollback_hint`-Pflicht (nicht `db-migration`). | — |
| OK | Template `template_implementation_medium.md` korrekt: `senior-coding-agent`, XML mit allen 4 Blöcken, `post_review_required: true` in `<constraints>` vermerkt. | — |
| OK | Risk-Klassifikation `architecture` ist passend — der WO verändert Dispatcher- und Validator-Verhalten (strukturelle Änderung, betrifft alle Folge-Workflows). `requires_approval: true` Pflicht per `CLAUDE.md` Cautious + High-Risk-Regel. | — |
| OK | Validator-Bypass strikt verboten in `<constraints>` ("validateOrchestratorIntent bleibt unverändert"), in `negative_constraints` ("NIEMALS validateOrchestratorIntent() umgehen"), und in AC ("Ungültiger selected_agent ... löst weiterhin REWRITE oder FAIL aus — kein Bypass"). | — |
| OK | `MAX_REWRITE_LOOPS`-Manipulation explizit verboten in `negative_constraints` ("NIEMALS MAX_REWRITE_LOOPS erhöhen als Fix") und in AC ("MAX_REWRITE_LOOPS bleibt unverändert (2)"). | — |
| OK | Drei Lösungsvarianten (A/B/C) sind sinnvoll, nicht überlappend, mit klarer Default-Empfehlung (Variante A) und expliziten ESCALATE-Pfaden für B/C. Die Varianten reflektieren echte Architektur-Optionen, nicht Scope-Aufweichung. | — |
| OK | Variante A "Mapping-Layer" ist konkret beschrieben mit: Funktion `normalizeOrchestratorIntent`, Helper `mapAgentToValidatorTarget`, drei Mapping-Quellen mit Reihenfolge, Hardcoded-Default-Liste mit allen 11 Mappings. Worker hat genug Detail um implementieren zu können — vorbehaltlich des Scope-Findings oben. | — |
| OK | `files_blocked` schließt korrekt aus: `services/scheduler-api/`, `system/workorders/cli/`, `system/state/`, `system/approval/`, `apps/`, `supabase/`, `.env*`, `package.json`, `system/workorders/schemas/workorder.schema.json`. WO-Schema-Vertrag bleibt unverändert. | — |
| OK | Bezug zu Bootstrap-Geschichte (`WO-NUTRITION-P1-001`) im Notes-Block dokumentiert; Cleanup-Pfad nach diesem WO ist als separate Folge-WO markiert (kein Scope Creep). | — |

---

## Batch Readiness

**Ready** (nach Important-Fix).

WO ist als eigener Single-WO-Batch `BATCH-GOVERNANCE-P1-002-orchestrator-intent-contract` empfohlen — analog zum Pattern von `BATCH-GOVERNANCE-P1-001` für den Batch-Loader-Bootstrap. Nicht in den Nutrition-DB-Foundation-Batch integrierbar, da `governance-005` operative Vorbedingung für den **erfolgreichen End-to-End-Run** des Nutrition-Batches ist.

---

## Required Fixes

Echter Fix vor Batch-Übergabe (nicht optional):

1. **Scope-Lücke in Variante A schließen** (Important Finding 1). Empfehlung Option (b): Im `<implement>`-Block für Variante A explizit deklarieren:
   ```
   V1-Mapping-Quelle ist ausschließlich die Hardcoded Default-Map in dispatcher.ts oder
   governance-validator.ts. Erweiterung um agents.json[validator_target_agent] oder eine
   separate agent-validator-map.json/.ts ist Phase 2 / eigene WO.
   ```
   Plus: AC #4 entsprechend anpassen ("explizite Hardcoded Mapping-Schicht in dispatcher.ts oder governance-validator.ts mit Tests" statt "agents.json oder agent-validator-map.json").

Optional (Minor — nicht batch-blockierend):

2. `scope_files` für `orchestrator_main_prompt.md` aus scope_files entfernen oder mit Inline-Kommentar als "nur bei Variante B/C, sonst nicht anfassen" markieren.
3. `<implement>`-Block um expliziten Audit-Pfad ergänzen ("Audit via `system/state/audit-writer.ts`, nicht direkt JSONL").
4. `validation_commands` Test-Scope einschränken oder akzeptieren wie ist.

---

## Recommended Next Step

**Fix-Pass für Draft-WO** (Important Finding 1 schließen, optional Minor-Findings adressieren). Anschließend:

1. Single-WO-Batch `BATCH-GOVERNANCE-P1-002-orchestrator-intent-contract.md` erzeugen mit Status `ready_for_approval` (Pattern wie `BATCH-GOVERNANCE-P1-001`).
2. Tom approved den Batch.
3. WO wird über den existierenden Batch-Loader CLI dispatcht (Library-Pfad ist nach WO-governance-004 betriebsbereit).
4. Nach `closed`: Nutrition Batch 001 `--run` erneut testen — sollte den Validator passieren und beim db-migration HUMAN_NEEDED-Gate für WO-002 sauber pausieren.
5. Folge-WO planen: Cleanup von `WO-NUTRITION-P1-001` Bootstrap-Workaround (`agent_id: micro-executor` → zurück auf `docs-agent`) und WO-Notes-Bereinigung.

---

*Review erzeugt: 2026-05-02 — gemäß `template_implementation_medium.md`, `workorder.schema.json`, `wo_lifecycle_v1.md`, Diagnose "Governance Validator Diagnosis — Unknown Agent undefined".*
