---
nr: G-225
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

# G-225 — Coach Suggestion User Flow fehlt

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, IMP-3.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

`SPEC_10_PASS2_PATCH.md` definiert UI-Components:
- `CoachSuggestionBadge`
- `CoachSuggestionList`
- `CoachSuggestionCard`
- `SuggestionTypeDisplay`

Es gibt aber keinen User Flow in `SPEC_03_USER_FLOWS.md` der beschreibt:
- Wann erscheinen Suggestions im UI? (Push? In-App-Banner? Tab-Badge?)
- Wie navigiert User zur Suggestion-Liste?
- Was passiert nach Accept/Reject? (UI-Feedback, sofortige Wirkung, Coach-Notification?)
- Wie wird `expired`-Status visualisiert vs. ignoriert?
- Per-Type-Akzeptanz-Verhalten (`nutrition_target` setzt Target sofort, `food_alternative` ist nur Info — wie unterscheidbar?)
- Kann User Begründung für Reject hinterlegen? (Schema hat `decision_note` — UI nicht beschrieben.)

`SPEC_07_PASS2_PATCH.md §6` hat API-Endpoints, aber UI-Flow fehlt.

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

