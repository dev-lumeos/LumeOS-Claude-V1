---
nr: G-226
typ: entscheidung
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

# G-226 — V1-Status-Marker fehlen für Recipes/Shopping/MealPlans Components in SPEC_10

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, IMP-4.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

`ADR_RECIPES_SCHEMA_ONLY.md`:
> V1: Schema vorbereiten — kein Full-UI, kein Full-API Pflicht.
> Wenn Zeit knapp: Recipes, Meal Plans und Shopping Lists komplett auf Phase 2 verschoben.

`SPEC_10_COMPONENTS.md` listet:
- 5 Recipe Components (`RecipeList`, `RecipeCard`, `RecipeBuilder`, `RecipeDetail`, `RecipeLogModal`)
- 3 Shopping List Components (`ShoppingListView`, `ShoppingListDetail`, `ShoppingListItem`)
- 8 Meal Plan Components (`MealPlanList`, `MealPlanCard`, ...)

Ohne V1-Status-Hinweis. Reader interpretiert sie als V1-Pflicht.

`SPEC_10_PASS2_PATCH.md` adressiert das nicht. Der Pass-2-Patch ergänzt nur neue Components.

`SPEC_03_USER_FLOWS.md §Flow 7` (Rezepte) und §Flow 8 (Einkaufsliste) sind als komplette V1-Flows beschrieben — ohne Phase-2-Markierung.

**Konsequenz:** WO-Generator könnte vollen Recipe-Builder als V1-Pflicht-WO schreiben, obwohl ADR sagt: optional.

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

## Gegen den heutigen Stand gemessen, 2026-08-30

`[read]` **Dieser Punkt stammt aus
`OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`** — **einer
Spec-Review von vor dem `/v2/`-Umbau.** `[cmd]` **Acht Punkte kommen
aus derselben Datei.**

`[cmd]` **Gemessen 2026-08-30:** `nutrition.recipes` 6 Zeilen,
`shopping_lists` 1, `meal_plans` 2, `meal_plan_logs` 0.
`[read]` **Alle drei Tabellen existieren und tragen Daten.** **Der
Bestaetigungsweg dazu ist seit G-274 gebaut.**

## Auftrag — acht Punkte aus einer Review

**Mitbeauftragt: G-227, G-228, G-229, G-230, G-235, G-238, G-222.**
Bericht in diese Datei.

`[read]` **Vorbereitet am 2026-08-30.**

### Warum als Gruppe

`[cmd]` **Alle acht stammen aus
`OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`** — **einer
Spec-Review von vor dem `/v2/`-Umbau.**

`[read]` **Sie kennen den heutigen Stand nicht.** `[cmd]` **Der
Orchestrator hat je Punkt eine Messung eingetragen; sie steht unter
*Gegen den heutigen Stand gemessen*.**

`[read]` **Deine Aufgabe ist das Urteil, nicht die Messung** — **aber
pruef sie nach, sie stammt von mir und ich habe die Punkttexte nicht
einzeln gelesen.**

### Je Punkt ein Urteil

    erledigt      die Sache existiert und wirkt
    ueberholt     die Review beschreibt etwas, das es nie gab
    offen         der Befund gilt weiter
    Entscheidung  Tom muss ran, mit der Frage praezise gestellt

`[cmd]` **Bei C-112 blieben von elf drei, bei C-29 blieb null.**
`[read]` **Wenn hier fuenf ueberholt sind, ist das das Ergebnis** —
kein halber Auftrag.

### Zwei, die schon halb beantwortet sind

**G-222:** `[cmd]` **Tom hat am 30.08. entschieden:** *,,wir bauen ein
initiales komplettes onboarding fuer jeden user wenn er nach der
registrierung sich einloggt."* `[read]` **Damit ist das Ob geklaert.**
`[cmd]` **Und die Spec traegt das Wie:** vier Schritte in
`SPEC_03_USER_FLOWS.md`, neun Komponenten in `SPEC_10_PASS2_PATCH.md`.
`[read]` **Tom will die Inhalte spaeter gemeinsam festlegen, wenn ein
repraesentativer Datenbestand vorliegt** — **also: pruefen, was die
Spec vorgibt, und den Punkt darauf zuschneiden.**

**G-238:** `[cmd]` **`plan_origin` erlaubt `self_created`,
`coach_created`, `marketplace` — `buddy` fehlt.** `[read]` **Die
Frage ist praezise: eigene Herkunft, oder `self_created` mit Buddy als
Werkzeug?** **Das ist eine Entscheidung, keine Messung.**

### Was nicht zu tun ist

**Nichts bauen** — dieser Auftrag urteilt.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    je Punkt ein Urteil    mit Beleg
    Messung nachgeprueft   stimmt sie?
    Entscheidungen         praezise gestellt, nicht beantwortet

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen** — er laesst einen gesunden
Server stehen. **Codex fasst ihn nicht an.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
