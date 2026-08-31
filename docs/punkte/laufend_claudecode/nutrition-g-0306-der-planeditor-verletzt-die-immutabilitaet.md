---
nr: G-306
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: G-298
entscheidung: E-41
agent: claudecode
beauftragt: 2026-08-31
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/plan-eintrag-editor.tsx
zahlen:
  gemessen: 2026-08-31
---

# G-306 — der Planeditor verletzt die Immutabilitaet

## Befund

`[cmd]` **`ADR_IMPROVEMENTS_PACKAGE` #17, bestaetigt in `SPEC_01`
Abschnitt 8, `SPEC_04` und `SPEC_02_PATCH_NOTES`:**

    MealPlan.status = 'active'
      -> MealPlanDay READ-ONLY
      -> MealPlanItem READ-ONLY
      -> API gibt 409 bei PUT/PATCH/DELETE

`[cmd]` **G-298 hat am 31.08. genau das gebaut, was der ADR
verbietet** — hinzufuegen, aendern und entfernen an einem Plan mit
`status = active`.

`[read]` **Weder Claude Code noch der Orchestrator hatten den ADR
gelesen.** `[read]` **Der Auftrag nannte `SPEC_03` und `SPEC_10`,
nicht die ADRs.**

## Warum die Regel gut ist

`[cmd]` **Die Begruendung steht im ADR:** *,,MealPlanLog referenziert
`plan_item_id`. Wenn Items nachtraeglich geaendert werden, stimmt die
Compliance-History nicht mehr und Deviation-Berechnungen werden
falsch."*

`[read]` **Aus einem aktiven Plan entstehen Ghost Entries im
Tagebuch.** **Wer ihn nachtraeglich aendert, aendert rueckwirkend,
was geplant war.**

## Was zu tun ist

`[read]` **Die Bearbeitung an `status` binden:** Entwurf ja, aktiv
nein.

`[cmd]` **Und der Ausweg steht im ADR:** *,,pausieren, eine Kopie
erstellen, bearbeiten und neu aktivieren."*

`[read]` **Ohne einen Knopf dafuer ist die Regel eine Sackgasse** —
der Nutzer sieht, dass er nicht darf, und findet keinen Weg. **E-41
schlaegt *Kopie bearbeiten* vor.**

## Auftrag

**Mitbeauftragt mit C-372 am 2026-08-31.** Der Auftragstext
und der Bericht stehen dort.
