# Workorder Creation Handbook
# Stand: April 2026

Dieses Handbuch erklärt, wie aus Brainstorming-Ideen und Specs korrekte, kleine, sichere Workorders entstehen.

---

## 1. Ziel dieses Handbuchs

Eine Workorder ist kein Wunschzettel.  
Eine Workorder ist ein **kleiner, ausführbarer, begrenzter Auftrag** mit:
- konkreten Dateien
- messbaren Akzeptanzkriterien
- klarer Validierung
- bekanntem Risiko

Das System (Dispatcher, Preflight, Files Enforcement, Review-Pipeline) führt Workorders deterministisch aus. Es macht nur was du ihm sagst — genau so, wie du es sagst.

---

## 2. Gesamtprozess

```
Brainstorm
  → Spec erstellen
  → Spec prüfen (workorder-ready?)
  → Workorder-Splitting
  → Batch Plan
  → Workorder Review
  → Queue / Run
  → Reports / Dossier
```

**Brainstorm:** Freies Denken mit Claude. Alles erlaubt.

**Spec:** Verdichtung. Ziel, Scope, Risiken, Akzeptanzkriterien, betroffene Module. Keine Workorders ohne Spec.

**Spec prüfen:** Ist alles klar? Sind Kernfragen beantwortet? → Checkliste Abschnitt 4.

**Workorder-Splitting:** Eine Spec → mehrere kleine WOs. Jede WO = ein Schritt.

**Batch Plan:** Reihenfolge festlegen, Abhängigkeiten setzen, parallele Kandidaten erkennen.

**Workorder Review:** Jede WO vor dem Run prüfen — Schema, Größe, Risk, Scope, Conflicts.

**Queue / Run:** Nur geprüfte WOs starten.

**Reports / Dossier:** Nach dem Run: Morning Report, Failed Report, Dossier.

---

## 3. Brainstorming-Regeln

Brainstorming darf frei sein. Kein Schema. Keine Regeln. Alles aufschreiben.

Aber bevor daraus Arbeit wird, muss es in eine **Spec verdichtet** werden.

Eine gute Brainstorming-Session beantwortet am Ende:

- Was wollen wir bauen?
- Warum? (Nutzerbedarf, Problem)
- Für wen?
- Welche Dateien / Module sind wahrscheinlich betroffen?
- Was ist **explizit nicht** Teil davon?
- Welche Risiken gibt es? (Daten, Auth, DB, Performance)
- Welche offenen Fragen bleiben?
- Welche Akzeptanzkriterien gibt es?

Wenn diese Fragen nach dem Brainstorm **nicht** beantwortet sind → weiter brainstormen, keine Spec.

---

## 4. Wann ist eine Spec gut genug?

Eine Spec ist **workorder-ready**, wenn:

```
[ ] Ziel klar formuliert
[ ] Scope klar abgegrenzt
[ ] Out-of-scope explizit genannt
[ ] Betroffene Module / Dateien benannt
[ ] Risiken benannt (db, auth, rls, payments...)
[ ] Akzeptanzkriterien vorhanden und messbar
[ ] Technische Constraints benannt
[ ] Keine offenen Kernentscheidungen mehr
[ ] Feature ist in kleine Schritte teilbar
[ ] Risk Category vorgeschlagen
```

Wenn ein Punkt **nicht** erfüllt ist:

```
→ Keine Workorders erzeugen.
→ Erst Spec nachschärfen.
```

Ausnahme: einzelne "offene Fragen" sind OK wenn sie nicht die Umsetzung blockieren.

---

## 5. Spec-Struktur

Standardformat für alle Specs im Repo. Datei in `docs/specs/<Modul>/` ablegen.

```markdown
# SPEC — <Name>
**Stand:** YYYY-MM-DD | **Status:** draft / review / approved

## Ziel
Was soll nach Umsetzung möglich sein? (1-3 Sätze)

## Hintergrund
Warum bauen wir das? Welches Problem löst es?

## Aktueller Stand
Was existiert bereits? Was fehlt?

## Gewünschtes Verhalten
Konkrete User Stories oder Funktionsbeschreibungen.

## Betroffene Module / Dateien
Welche services/, apps/, packages/ sind betroffen?

## Out of Scope
Was ist ausdrücklich NICHT Teil dieser Spec?

## Risk Category
Vorschlag: standard / db-migration / auth / ... (siehe Abschnitt 8)

## Akzeptanzkriterien
- [ ] Kriterium 1 (messbar)
- [ ] Kriterium 2

## Negative Constraints
- NIEMALS ...
- NIEMALS ...

## Validierung
Welche Tests / Commands nach Umsetzung?
z.B. pnpm tsc --noEmit, pnpm test, manuelle Prüfung

## Rollback / Recovery
Falls db-migration: DROP TABLE XY. Falls release: git revert.

## Offene Fragen
- [ ] Frage 1 (unkritisch für ersten Schritt)

## Workorder-Splitting-Hinweise
Wie lässt sich diese Spec sinnvoll aufteilen?
Empfohlene Reihenfolge: Schema → API → UI → Tests → Docs
```

---

## 6. Workorder-Grundregeln

### Eine gute Workorder:

- ändert wenige Dateien (1–5)
- hat klare `scope_files`
- hat sinnvolle `files_blocked` wenn nötig
- hat eine eindeutige `risk_category`
- hat mindestens 2 messbare `acceptance_criteria`
- hat mindestens 4 `negative_constraints`
- hat konkrete `validation_commands`
- ist in einem Run prüfbar
- hat keine offenen Designfragen

### Eine schlechte Workorder:

```
✗  "baue das Feature fertig"
✗  "refactore das ganze Modul"
✗  "mach Nutrition besser"
✗  "fix alle Bugs"
✗  "implementiere die ganze Spec"
✗  betrifft 10+ Dateien quer durch mehrere Module
✗  enthält DB + UI + API + Docs in einem Auftrag
✗  hat keine Tests oder Validierung
✗  hat unklare Akzeptanzkriterien ("sieht gut aus")
```

---

## 7. Workorder-Größe

| Größe | Dateien | Risk | Night-Run | Wann |
|---|---|---|---|---|
| **XS** | 1–2 | docs / i18n / test | ✅ autonom | immer |
| **S** | 2–5 | standard / docs | ✅ autonom | normal |
| **M** | 5–10 | standard / cautious | ⚠️ cautious | tagsüber prüfen |
| **L** | 10+ | beliebig | 🔴 nicht empfohlen | **muss gesplittet werden** |

```
Regel: Wenn eine Workorder mehr als 10 Dateien betrifft,
       muss sie fast immer gesplittet werden.
```

---

## 8. Risk Categories für Workorders

| risk_category | Wann verwenden | Night-Run | Approval | Spark D? |
|---|---|:---:|:---:|:---:|
| `standard` | Normale Code-Änderungen | ✅ | ❌ | ❌ |
| `docs` | Nur Dokumentation | ✅ | ❌ | ❌ |
| `i18n` | Nur Übersetzungen | ✅ | ❌ | ❌ |
| `test` | Nur Testdateien | ✅ | ❌ | ❌ |
| `security` | Sicherheitsrelevanter Code | ⚠️ | ❌ | ✅ |
| `auth` | Login, Sessions, Tokens, JWT | ⚠️ | ❌ | ✅ |
| `rls` | Supabase Row Level Security | ⚠️ | ❌ | ✅ |
| `shared-core` | Shared Packages, breaking changes | ⚠️ | ❌ | ✅ |
| `architecture` | Strukturelle Änderungen, Interfaces | ⚠️ | ❌ | ✅ |
| `db-migration` | Supabase Schema-Änderungen | 🔴 | ✅ | ✅ |
| `payments` | Stripe, Billing, Checkout | 🔴 | ✅ | ✅ |
| `medical` | Health Data, HIPAA-sensitiv | 🔴 | ✅ | ✅ |
| `release` | Deployment, CI/CD, Versionierung | 🔴 | ✅ | ✅ |

- ✅ Night-Run: darf autonom nachts laufen
- ⚠️ Night-Run: läuft cautious (Spark D mandatory, kein Auto-Retry)
- 🔴 Night-Run: erst Approval, dann Start

---

## 9. Workorder-Template

Pflichtfelder laut `system/workorders/schemas/workorder.schema.json`:

```json
{
  "workorder_id": "WO-<modul>-<nummer>",
  "agent_id": "micro-executor",
  "task": "Konkrete, begrenzte Aufgabe. Min. 10 Zeichen. Kein 'mach alles fertig'.",
  "risk_category": "standard",
  "scope_files": [
    "path/to/file.ts"
  ],
  "files_blocked": [],
  "acceptance_criteria": [
    "Kriterium 1 ist messbar erfüllbar",
    "TypeScript kompiliert ohne Fehler"
  ],
  "negative_constraints": [
    "NIEMALS außerhalb scope_files schreiben",
    "NIEMALS neue Dependencies hinzufügen",
    "NIEMALS bestehende Exports ändern",
    "NIEMALS Side-Effects oder Logging einbauen"
  ],
  "validation_commands": [
    "pnpm tsc --noEmit"
  ],
  "context_files": [],
  "blocked_by": []
}
```

Bei `db-migration` ist `rollback_hint` **Pflicht**:

```json
{
  "risk_category": "db-migration",
  "rollback_hint": "DROP TABLE IF EXISTS my_table; -- keine abhängigen Tabellen"
}
```

**Hinweis zu `requires_approval`:**  
`requires_approval` ist ein **optionales Feld**. Die primäre Approval-Steuerung erfolgt über `risk_category`. Für `db-migration`, `payments`, `medical` und `release` ist Approval über die Risk-Policy systemseitig verpflichtend — unabhängig davon ob `requires_approval: true` gesetzt ist. Das Feld kann ergänzt werden um Approval explizit zu dokumentieren, ist aber für die Enforcement nicht nötig.

---

## 10. Beispiele

### Beispiel 1 — Docs-only

```json
{
  "workorder_id": "WO-docs-012",
  "agent_id": "docs-agent",
  "task": "Add JSDoc to all exported functions in services/nutrition-api/src/utils/macros.ts",
  "risk_category": "docs",
  "scope_files": [
    "services/nutrition-api/src/utils/macros.ts"
  ],
  "acceptance_criteria": [
    "every exported function has JSDoc with @param and @returns",
    "no production logic changed",
    "TypeScript compiles without errors"
  ],
  "negative_constraints": [
    "NIEMALS Produktionscode ändern",
    "NIEMALS Imports hinzufügen oder entfernen",
    "NIEMALS außerhalb scope_files schreiben",
    "NIEMALS Funktionssignaturen verändern"
  ],
  "validation_commands": ["pnpm tsc --noEmit"],
  "context_files": [],
  "blocked_by": []
}
```

### Beispiel 2 — UI-only

```json
{
  "workorder_id": "WO-ui-023",
  "agent_id": "micro-executor",
  "task": "Add a loading spinner to the NutritionDiaryPage component while data is being fetched. Use the existing Spinner component from packages/ui/src/components/Spinner.tsx.",
  "risk_category": "standard",
  "scope_files": [
    "apps/web/src/pages/nutrition/NutritionDiaryPage.tsx"
  ],
  "context_files": [
    "packages/ui/src/components/Spinner.tsx"
  ],
  "acceptance_criteria": [
    "Spinner appears during data fetch",
    "Spinner disappears when data is loaded",
    "No existing functionality broken",
    "TypeScript compiles without errors"
  ],
  "negative_constraints": [
    "NIEMALS außerhalb scope_files schreiben",
    "NIEMALS neue npm-Pakete installieren",
    "NIEMALS bestehende Props-Interfaces ändern",
    "NIEMALS State-Management außerhalb der Komponente ändern"
  ],
  "validation_commands": ["pnpm tsc --noEmit"],
  "blocked_by": []
}
```

### Beispiel 3 — API-only

```json
{
  "workorder_id": "WO-nutrition-043",
  "agent_id": "micro-executor",
  "task": "Add GET /diary/summary endpoint to services/nutrition-api that returns total calories and macros for a given date. Use existing NutritionEntry type.",
  "risk_category": "standard",
  "scope_files": [
    "services/nutrition-api/src/routes/diary.ts"
  ],
  "context_files": [
    "services/nutrition-api/src/types.ts",
    "services/nutrition-api/src/db/queries.ts"
  ],
  "acceptance_criteria": [
    "GET /diary/summary?date=YYYY-MM-DD returns { calories, protein, carbs, fat }",
    "returns 400 if date missing or invalid",
    "uses existing DB query functions",
    "TypeScript compiles without errors"
  ],
  "negative_constraints": [
    "NIEMALS außerhalb scope_files schreiben",
    "NIEMALS neue DB-Queries in routes anlegen",
    "NIEMALS Auth-Middleware ändern",
    "NIEMALS breaking changes an bestehenden Endpoints"
  ],
  "validation_commands": ["pnpm tsc --noEmit", "pnpm test"],
  "blocked_by": []
}
```

### Beispiel 4 — Test-only

```json
{
  "workorder_id": "WO-test-007",
  "agent_id": "test-agent",
  "task": "Write unit tests for the calculateBMI function in services/nutrition-api/src/utils/metrics.ts. Test normal cases, edge cases (height 0, negative values), and type safety.",
  "risk_category": "test",
  "scope_files": [
    "services/nutrition-api/src/__tests__/utils/metrics.test.ts"
  ],
  "context_files": [
    "services/nutrition-api/src/utils/metrics.ts"
  ],
  "acceptance_criteria": [
    "tests cover normal BMI calculation",
    "tests cover edge case: height = 0 (should throw or return NaN)",
    "tests cover negative values",
    "all tests pass",
    "TypeScript compiles without errors"
  ],
  "negative_constraints": [
    "NIEMALS Produktionscode in metrics.ts ändern",
    "NIEMALS außerhalb scope_files schreiben",
    "NIEMALS echte API-Calls in Tests",
    "NIEMALS Test-Framework-Konfiguration ändern"
  ],
  "validation_commands": ["pnpm tsc --noEmit", "pnpm test"],
  "blocked_by": ["WO-nutrition-042"]
}
```

### Beispiel 5 — DB-Migration

```json
{
  "workorder_id": "WO-db-008",
  "agent_id": "db-migration-agent",
  "task": "Create Supabase migration to add nutrition_goals table: id uuid pk, user_id uuid references auth.users, calorie_target int, protein_target int, created_at timestamptz default now(). Enable RLS: only owner can SELECT/INSERT/UPDATE.",
  "risk_category": "db-migration",
  "scope_files": [
    "supabase/migrations/20260430_001_add_nutrition_goals.sql"
  ],
  "rollback_hint": "DROP TABLE IF EXISTS nutrition_goals; -- no dependent tables or foreign keys",
  "acceptance_criteria": [
    "table nutrition_goals created with all columns",
    "RLS enabled on nutrition_goals",
    "policy: SELECT/INSERT/UPDATE only for auth.uid() = user_id",
    "migration is idempotent (IF NOT EXISTS where applicable)"
  ],
  "negative_constraints": [
    "NIEMALS bestehende Tabellen oder Spalten ändern",
    "NIEMALS RLS deaktivieren",
    "NIEMALS supabase db push aufrufen",
    "NIEMALS DROP TABLE ohne expliziten Rollback-Plan"
  ],
  "validation_commands": ["pnpm tsc --noEmit"],
  "blocked_by": []
}
```

*Hinweis: `requires_approval` ist hier weggelassen — Approval wird durch `risk_category: db-migration` systemseitig erzwungen.*

---

## 11. Batch Planning

### Standardreihenfolge aus einer Spec

```
WO-001  Types / Schema / Interfaces       (standard / shared-core)
WO-002  DB-Migration                      (db-migration) — separate, mit Approval
WO-003  Backend / API Service             (standard)
WO-004  Frontend / UI Komponente          (standard)
WO-005  Tests                             (test)
WO-006  Docs / JSDoc                      (docs)
```

### Batch-Regeln

```
[ ] erst Types/Schema, dann Implementierung
[ ] DB-Migrationen immer separat
[ ] High-Risk WOs immer separat und einzeln
[ ] keine zwei WOs auf denselben scope_files gleichzeitig
[ ] blocked_by setzen wenn Reihenfolge wichtig ist
[ ] Night-Run Batch nur mit standard/docs/i18n/test
[ ] Approval-WOs morgens vor Night-Run entscheiden
```

### `blocked_by` verwenden

```json
{
  "workorder_id": "WO-003",
  "blocked_by": ["WO-001", "WO-002"]
}
```

WO-003 startet erst wenn WO-001 und WO-002 erfolgreich completed sind.

---

## 12. Workorder Review vor dem Run

Checkliste für jede WO bevor sie dispatcht wird:

```
[ ] Ist die Workorder klein genug? (max. 5–10 Dateien)
[ ] Ist risk_category korrekt gesetzt?
[ ] Sind scope_files eng genug gefasst?
[ ] Sind files_blocked sinnvoll gesetzt?
[ ] Sind acceptance_criteria messbar (mindestens 2, nicht "sieht gut aus")?
[ ] Sind negative_constraints konkret (mindestens 4, nicht "mach nichts kaputt")?
[ ] Sind validation_commands vorhanden?
[ ] Gibt es noch offene Designfragen?
[ ] Braucht sie Approval? → risk_category prüfen
[ ] Darf sie nachts laufen? → risk_category prüfen
[ ] Gibt es blocked_by-Abhängigkeiten?
[ ] Hat db-migration eine rollback_hint?
```

---

## 13. Typische Fehler

| Fehler | Warum schlecht | Korrektur |
|---|---|---|
| `scope_files` zu breit | Agent schreibt unerwartete Dateien | Enger fassen, `files_blocked` ergänzen |
| `risk_category` falsch | Falsches Routing, falsche Review-Tier | Aus Tabelle Abschnitt 8 korrekt wählen |
| keine `files_blocked` | Auth/RLS-Dateien könnten angetastet werden | Sensitive Pfade explizit sperren |
| `negative_constraints` zu weich | "nicht alles kaputt machen" ist nicht deterministisch | Konkret: "NIEMALS X ändern" |
| `acceptance_criteria` nicht messbar | "funktioniert gut" ist kein Kriterium | "gibt HTTP 200 zurück", "TypeScript 0 Fehler" |
| weniger als 2 `acceptance_criteria` | Unvollständige Prüfbarkeit | Mindestens 2 messbare Kriterien formulieren |
| `db-migration` ohne `rollback_hint` | Preflight-REJECT, WO startet nicht | Immer DROP/REVERT-Statement angeben |
| UI + DB + API in einer WO | Zu groß, schwer zu reviewen, Konflikte | In 3 separate WOs splitten |
| High-Risk nachts ohne Approval | Night-Run-Policy blockiert, HOLD | Approval vor Night-Run einholen |
| `blocked_by` vergessen | WO-002 startet bevor WO-001 fertig | Abhängigkeiten explizit setzen |
| `validation_commands` leer | Keine automatische Qualitätsprüfung | Mindestens `pnpm tsc --noEmit` |

---

## 14. Operator-Ablauf für Tom

### Schritt 1 — Brainstorm

Tom diskutiert frei mit Claude. Alles erlaubt. Kein Schema.

### Schritt 2 — Spec erzeugen

```
→ Masterprompt: MASTERPROMPT_BRAINSTORM_TO_SPEC.md
```

Claude verdichtet die Brainstorm-Notizen in eine strukturierte Spec.

### Schritt 3 — Spec prüfen

Tom prüft Spec gegen Checkliste Abschnitt 4. Offene Fragen klären.

### Schritt 4 — Workorders erzeugen

```
→ Masterprompt: MASTERPROMPT_SPEC_TO_WORKORDERS.md
```

Claude erzeugt kleine WOs aus der Spec.

### Schritt 5 — Workorders reviewen

```
→ Masterprompt: MASTERPROMPT_WORKORDER_REVIEW.md
```

Claude prüft jede WO auf Schema, Größe, Risk, Konflikte.

### Schritt 6 — Batch planen

```
→ Masterprompt: MASTERPROMPT_WORKORDER_BATCH_PLAN.md
```

Claude plant sichere Ausführungsreihenfolge.

### Schritt 7 — Ausführen

Tom startet nur geprüfte WOs. Night-Run nur nach `night-run-policy.ts check`.

### Schritt 8 — Reports lesen

```bash
npx tsx system/reports/morning-report.ts
npx tsx system/reports/failed-wo-report.ts
npx tsx system/reports/wo-dossier.ts --all-completed
```
