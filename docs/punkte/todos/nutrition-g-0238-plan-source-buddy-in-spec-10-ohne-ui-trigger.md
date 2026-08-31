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

**Mitbeauftragt mit G-226 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

## Bericht — Urteil: **Entscheidung**

**Claude Code, 2026-08-31.** Mitbeauftragt mit G-226. **Der vollstaendige Bericht steht in [G-226](nutrition-g-0226-v1-status-marker-fehlen-fuer-recipes-shopping-mealplans-co.md#bericht).**

`[cmd]` **Der CHECK erlaubt `self_created`, `coach_created`,
`marketplace`** — oder `NULL`. **`buddy` fehlt.**

`[cmd]` **Und die Anzeige kennt dieselben drei:**
`plan-lage.ts:40-52` bildet sie ab, sonst *„Herkunft nicht
hinterlegt"*.

`[read]` **Das schaerft die Frage:** ein `buddy`-Plan wuerde nicht nur
am CHECK scheitern — **kaeme er durch, erschiene er als „Herkunft
nicht hinterlegt".**

**Die Frage:** *eigene Herkunft (`buddy`) oder `self_created` mit
Buddy als Werkzeug?*

`[read]` **Was daran haengt:** eigene Herkunft heisst vierter
CHECK-Wert, vierter Anzeigetext und die Frage, ob der Nutzer es
unterscheiden koennen soll. **`self_created` laesst alles wie es ist**
— und die Information, dass Buddy geholfen hat, ist verloren.

`[read]` **Keine Eile:** der Buddy-Plan-Builder ist Phase 2,
`meal_plan_logs` hat 0 Zeilen.

## Geprueft am 2026-08-31

**Urteil aus G-226:** Entscheidung: eigene Herkunft fuer Buddy-Plaene, oder
`self_created` mit Buddy als Werkzeug?.

`[read]` **Die Messung steht in der G-226-Datei.**
