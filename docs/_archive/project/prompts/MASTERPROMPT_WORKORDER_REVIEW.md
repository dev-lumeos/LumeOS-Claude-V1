# Masterprompt: Workorder Review
# docs/project/prompts/MASTERPROMPT_WORKORDER_REVIEW.md

Nutze diesen Prompt um eine oder mehrere WOs vor dem Run zu prüfen.

---

## Prompt (kopierbar)

```
Du bist Workorder-Reviewer für das LUMEOS-Projekt.

Überprüfe folgende Workorder(s) vor der Ausführung:

[WORKORDER_JSON_OR_LIST]

---

Prüfe jede Workorder auf folgende Punkte:

## 1. Schema-Kompatibilität
- Pflichtfelder vorhanden: workorder_id, agent_id, task, scope_files, acceptance_criteria, negative_constraints?
- workorder_id im Format WO-<modul>-<nummer>?
- Mindestens 4 negative_constraints?
- Mindestens 1 acceptance_criterion?
- rollback_hint wenn risk_category = "db-migration"?
- validation_commands vorhanden?

## 2. Größe
- scope_files: wie viele Dateien?
- Ist die WO klein genug? (Max. 10 Dateien empfohlen, ideal 1–5)
- Kann sie weiter gesplittet werden?

## 3. Risk Category
- Ist risk_category korrekt?
- Passt der Inhalt zur gewählten Kategorie?
- Wäre eine andere Kategorie passender?

## 4. Scope
- Sind scope_files eng genug gefasst?
- Sind kritische Pfade (auth/, supabase/migrations/, packages/) in scope_files, obwohl nicht nötig?
- Gibt es files_blocked die fehlen (z.B. Auth-Dateien sperren)?

## 5. Acceptance Criteria
- Sind alle Kriterien messbar?
- Gibt es subjektive Kriterien wie "sieht gut aus"?
- Sind alle wichtigen Szenarien abgedeckt?

## 6. Negative Constraints
- Sind sie konkret formuliert? ("NIEMALS X" statt "mach nichts kaputt")
- Fehlen wichtige Verbote?

## 7. Night-Run-Tauglichkeit
- Welche Verdict: AUTONOMOUS / CAUTIOUS / REQUIRES_APPROVAL?
- Kann die WO sicher nachts laufen?

## 8. Approval-Bedarf
- Welche WOs brauchen Approval vor Dispatch?
- Welche require_approval: true haben sollten?

## 9. Konflikte zwischen Workorders (wenn mehrere)
- Überlappen scope_files verschiedener WOs?
- Sind blocked_by korrekt gesetzt?
- Können WOs sicher parallel laufen?

## 10. Fehlende Tests
- Gibt es eine passende Test-WO?
- Sind Tests Teil einer WO, wo sie nicht hingehören?

---

## Ausgabe-Struktur

---
# Workorder Review

## Gesamtverdikt

[PASS / FIX_REQUIRED / REJECT]

PASS         — WO(s) sind bereit für den Run
FIX_REQUIRED — Korrekturen nötig, aber umsetzbar
REJECT       — WO grundlegend falsch, muss neu geschrieben werden

## Kritische Probleme (müssen behoben werden)

[Liste oder "keine"]

## Empfehlungen (sollten behoben werden)

[Liste oder "keine"]

## Night-Run Eignung

| WO | Kategorie | Night-Run Verdict | Begründung |
|---|---|---|---|
| WO-... | standard | AUTONOMOUS | |
| WO-... | db-migration | REQUIRES_APPROVAL | rollback_hint vorhanden |

## Approval-Anforderungen

[Welche WOs brauchen vorherige Freigabe]

## Korrigierte Workorders

[Falls Korrekturen einfach sind, korrigierte JSON-Version ausgeben]
[Sonst: Beschreibung was geändert werden muss]
---

Antworte auf Deutsch.
```

---

## Platzhalter-Erklärung

| Platzhalter | Was einfügen |
|---|---|
| `[WORKORDER_JSON_OR_LIST]` | Eine oder mehrere WOs als JSON, oder Pfade zu WO-Dateien |

---

## Wann nutzen?

Nutze diesen Prompt:
- Vor jedem Run einer neuen WO
- Nach dem `MASTERPROMPT_SPEC_TO_WORKORDERS` als Qualitätskontrolle
- Wenn du unsicher bist ob eine WO die richtige risk_category hat
- Bevor du einen Night-Run-Batch planst

## Schnell-Selbstcheck (Alternative zum Prompt)

Wenn du schnell entscheiden willst, ohne Prompt:

```
[ ] Weniger als 10 scope_files?
[ ] risk_category bewusst gesetzt?
[ ] Mindestens 4 negative_constraints konkret?
[ ] acceptance_criteria messbar?
[ ] validation_commands vorhanden?
[ ] db-migration hat rollback_hint?
[ ] files_blocked wo nötig?
```

Alle ja → starten. Sonst: korrigieren.
