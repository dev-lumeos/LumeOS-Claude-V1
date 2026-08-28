---
nr: G-223
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien: [docs/specs/Nutrition/05_reviews/OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md]
zahlen: null
---

# G-223 — Recalculate-UI in SPEC_10 fehlt (bekanntes Open Item)

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, IMP-1.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

`SPEC_06_RECALCULATE_PATCH.md` §Offene Punkte:
> [ ] Recalculate-UI in Meal Item Editor ergänzen
>     (SPEC_10: "Neu berechnen" Button wenn Food-Daten neuer als Snapshot)

API-Endpoints existieren:
- `POST /api/nutrition/meal-items/:id/recalculate`
- `POST /api/nutrition/meals/:id/recalculate`

Components fehlen in `SPEC_10_COMPONENTS.md` und `SPEC_10_PASS2_PATCH.md`:
- Kein `MealItemRecalculateButton` o. ä.
- Kein `MealRecalculateModal` (für Batch-Recalculate eines Meals)
- Kein Hook (z. B. `useMealItemRecalculate`)
- Kein Trigger-Mechanismus dokumentiert: Wann erscheint der Button? Soll System Veränderungen am Food erkennen und User benachrichtigen? Nicht belegt.

User Flow für Recalculate fehlt vollständig.

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

