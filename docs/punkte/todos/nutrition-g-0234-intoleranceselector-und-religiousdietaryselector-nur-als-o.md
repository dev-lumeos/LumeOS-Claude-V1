---
nr: G-234
typ: befund
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

# G-234 — `IntoleranceSelector` und `ReligiousDietarySelector` nur als Onboarding-Components definiert

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, MIN-5.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

`SPEC_10_PASS2_PATCH.md` listet diese Components unter "Nutrition Preferences — Onboarding Components". Settings-Components-Block listet nur `PreferencesView (erweitert)`, `ExcludedFoodsManager`, `PreferredFoodsManager`, `CoachPermissionsPanel`.

Decisions §6 fordert: "In den Nutrition Settings kann der User diese Angaben später bearbeiten" inkl. Allergien, Unverträglichkeiten, Religiös. Wird `IntoleranceSelector` und `ReligiousDietarySelector` von Onboarding und Settings beide verwendet? Nicht explizit belegt.

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

**Verwandter Punkt:** C-174 (`ADR_NUTRITION_PREFERENCES_V1` kennt drei Constraint-Stufen). `[read]` **Nicht zusammengelegt** — ob es
derselbe Befund ist, gehoert geprueft, nicht angenommen.
