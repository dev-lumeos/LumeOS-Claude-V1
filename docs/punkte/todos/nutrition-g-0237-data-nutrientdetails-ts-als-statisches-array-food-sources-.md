---
nr: G-237
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

# G-237 — `data/nutrientDetails.ts` als statisches Array — `food_sources` Array veraltet (per Review 1 ADR_IMPROVEMENTS_PACKAGE #20)

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, MIN-8.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

SPEC_10 dokumentiert `food_sources: string[]` als statisches Array. ADR_IMPROVEMENTS_PACKAGE #20 (Review-1-Scope) ersetzt das durch dynamischen Endpoint. Diese Korrektur wurde in `INDEX.md` als Pass-1-Patch eingearbeitet, aber `SPEC_10_COMPONENTS.md` zeigt noch das alte Array. SPEC_10_PASS2_PATCH ergänzt nichts dazu.

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

