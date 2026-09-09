---
nr: G-223
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 4cc4c7cb
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

## Auftrag

**Mitbeauftragt mit G-224 am 2026-09-08.** Der Auftragstext
und der Bericht stehen dort.

## Bericht

**Der Bericht steht in G-224** ? beide wurden zusammen beauftragt.

**Kurz, 2026-09-08:**

`[cmd]` **Die zwei Endpunkte existieren NICHT** ? `recalculate`
**kommt zweimal in `apps/web/src` vor, beide in `recovery`.**

`[read]` **Also kein A-71** ? **der Weg wurde nie gebaut.**

`[cmd]` **Geplant als `nutrition-recalculate-v1` in
`NUTRITION_WORKORDER_PLAN_V1.md:102`.**

`[cmd]` **9065 Zeilen, alle vergleichbar, 0 veraltet** ?
**`frozen_at` 08-23 bis 09-06, `foods.updated_at` zuletzt 08-15.**

`[cmd]` **Der Knopf ist gebaut, ohne neuen Endpunkt:**
`PATCH /api/nutrition/diary` **friert schon aus dem heutigen
Bestand neu ein.**

`[read]` **Zwei neue Endpunkte waeren eine zweite Wahrheit neben
einem Weg, der dasselbe tut.**

## Abnahme

**2026-09-08, abgenommen: gebaut ohne neuen Endpunkt.**

`[cmd]` **Die zwei SPEC_10-Endpunkte existieren nicht** ? **kein
A-71, sondern ungebaut.**

`[cmd]` **`PATCH /api/nutrition/diary` friert schon aus dem
heutigen Bestand neu ein** ? **der Knopf sitzt darauf.**

`[cmd]` **Am Schirm belegt: `frozen_at` 08-01 -> 09-09, `enercc`
unveraendert.**

`[read]` **Und ein Befund darunter: `frozen_at` wird seit C-03
geschrieben und nirgends gelesen** ? **A-71 auf Spaltenebene.**
