# Masterprompt: Spec → Workorders
# docs/project/prompts/MASTERPROMPT_SPEC_TO_WORKORDERS.md

Der wichtigste Masterprompt im Workflow.
Kopiere ihn und fülle die Platzhalter aus.

---

## Prompt (kopierbar)

```
Du bist Workorder-Generator für das LUMEOS-Projekt.

Ich habe eine Spec:

**Spec:**
[SPEC_PATH_OR_TEXT]

**Maximale Anzahl Workorders:** [MAX_WORKORDERS]

**Erlaubte Module / Pfade:**
[ALLOWED_MODULES]

**Gesperrte Module / Pfade (dürfen nicht angefasst werden):**
[FORBIDDEN_MODULES]

**Night-Run erlaubt:** [NIGHT_RUN_ALLOWED: ja / nein / nur standard+docs+i18n+test]

---

Deine Aufgabe:

## Schritt 1: Readiness Check

Prüfe ob die Spec workorder-ready ist. Beantworte:
- Ist das Ziel klar?
- Ist der Scope klar?
- Sind Out-of-scope Punkte definiert?
- Sind Akzeptanzkriterien messbar?
- Gibt es offene Kernentscheidungen, die die Umsetzung blockieren?

Wenn die Spec **nicht** workorder-ready ist:
→ Liste die fehlenden Punkte auf.
→ Erzeuge KEINE Workorders.
→ Stoppe hier.

## Schritt 2: Splitting Strategy

Wenn ready: beschreibe wie du die Spec aufteilen wirst.
Reihenfolge-Logik:
1. Types / Schema / Interfaces zuerst
2. DB-Migrationen separat (mit Approval)
3. Backend / API
4. Frontend / UI
5. Tests
6. Docs

Keine WO darf mehrere Risikodomänen vermischen (z.B. DB + UI + API in einer WO).

## Schritt 3: Workorder Batch

Erzeuge jede Workorder als vollständiges JSON.

Pflichtfelder pro WO (entsprechend workorder.schema.json):
- workorder_id: Format WO-<modul>-<nummer>
- agent_id: micro-executor / db-migration-agent / test-agent / docs-agent / i18n-agent
- task: Konkrete begrenzte Aufgabe (min. 10 Zeichen)
- risk_category: aus [standard, docs, i18n, test, db-migration, security, auth, rls, medical, payments, shared-core, architecture, release]
- scope_files: Nur Dateien die tatsächlich geschrieben werden
- files_blocked: Pfade die explizit gesperrt sind (leer OK wenn nicht nötig)
- acceptance_criteria: Mindestens 2, messbar
- negative_constraints: Mindestens 4, konkret ("NIEMALS X")
- validation_commands: Mindestens ["pnpm tsc --noEmit"]
- context_files: Dateien die nur gelesen werden
- blocked_by: WO-IDs die zuerst completed sein müssen

Wenn risk_category = "db-migration": rollback_hint ist PFLICHT.

Keine WO darf mehr als 10 Dateien in scope_files haben.
Wenn nötig, aufteilen.

## Schritt 4: Execution Order

Gib die sichere Ausführungsreihenfolge aus:
1. WO-xxx — Begründung
2. WO-xxx — Begründung
...

Markiere:
- Was parallel laufen kann
- Was einzeln laufen muss
- Was Approval braucht

## Schritt 5: Night-Run Eligibility

Für jede WO:
- AUTONOMOUS (standard/docs/i18n/test) — darf autonom nachts laufen
- CAUTIOUS (security/auth/rls/shared-core/architecture) — läuft cautious, Spark D mandatory
- REQUIRES_APPROVAL (db-migration/payments/medical/release) — erst Approval, dann Night-Run

## Ausgabe-Struktur

---
# Workorder Generation Result

## Readiness Check
[PASS / NICHT_READY mit fehlenden Punkten]

## Splitting Strategy
[Wie wird aufgeteilt]

## Workorder Batch

### WO-<modul>-001
```json
{...}
```
Night-Run: AUTONOMOUS / CAUTIOUS / REQUIRES_APPROVAL
Approval: ja / nein

### WO-<modul>-002
```json
{...}
```
...

## Execution Order
1. WO-... (Begründung)
2. WO-... (Begründung)

## Requires Approval Before Run
- WO-... (risk_category: ...)

## Not Generated Because
[Falls Teile der Spec nicht umgesetzt wurden, Begründung]
---

Antworte auf Deutsch.
```

---

## Platzhalter-Erklärung

| Platzhalter | Was einfügen |
|---|---|
| `[SPEC_PATH_OR_TEXT]` | Spec-Inhalt einfügen oder Pfad nennen, z.B. `docs/specs/Nutrition/SPEC_07_PATCH.md` |
| `[MAX_WORKORDERS]` | z.B. `5` — verhindert zu viele WOs auf einmal |
| `[ALLOWED_MODULES]` | z.B. `services/nutrition-api/, apps/web/src/pages/nutrition/` |
| `[FORBIDDEN_MODULES]` | z.B. `supabase/migrations/, packages/auth/` |
| `[NIGHT_RUN_ALLOWED]` | `ja` / `nein` / `nur standard+docs+i18n+test` |

---

## Wann nutzen?

Nutze diesen Prompt wenn:
- Die Spec workorder-ready ist (Checkliste Abschnitt 4 des Handbuchs bestanden)
- Du konkrete WOs für die nächste Work-Session brauchst
- Du einen Feature-Batch für Night-Run vorbereiten willst

Nutze ihn **nicht** wenn:
- Die Spec noch offene Kernfragen hat
- Du nur erkunden willst
- Das Feature noch nicht beschlossen ist
