---
nr: G-238
typ: entscheidung
modul: nutrition
schwere: niedrig
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien: [docs/specs/Nutrition/05_reviews/OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md]
zahlen: null
---

# G-238 — `Plan.source = 'buddy'` in SPEC_10 ohne UI-Trigger

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, MIN-9.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

`SPEC_10 §MealPlanComponents` listet `MealPlanList` mit "Source-Badge". Source-Werte: `user | coach | marketplace | buddy`. Decisions §1: "Buddy MealPlan Builder" ist Phase 2.

UI zeigt also einen Quellentyp, dessen Erzeugungs-Flow Phase 2 ist. Konsistent mit `MealPlanCard` (Anzeige), aber widersprüchlich für UX-Erwartung (User sieht Buddy-Plan-Quelle, kann sie aber nicht erzeugen).

---

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

**Verwandter Punkt:** G-98 (Meal plans braucht einen Zustand und eine Herkunft). `[read]` **Nicht zusammengelegt** — ob es
derselbe Befund ist, gehoert geprueft, nicht angenommen.

## Gegen den heutigen Stand gemessen, 2026-08-30

`[read]` **Dieser Punkt stammt aus
`OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`** — **einer
Spec-Review von vor dem `/v2/`-Umbau.** `[cmd]` **Acht Punkte kommen
aus derselben Datei.**

`[cmd]` **Gemessen 2026-08-30: `plan_origin` erlaubt
`self_created`, `coach_created`, `marketplace`** — **`buddy` ist im
CHECK nicht enthalten.**
`[read]` **Der Punkt hat recht, und die Frage ist praeziser
geworden:** **soll ein Buddy-erstellter Plan eine eigene Herkunft
bekommen, oder ist er `self_created` mit Buddy als Werkzeug?**

## Auftrag

**Vorbereitet mit G-226 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.
