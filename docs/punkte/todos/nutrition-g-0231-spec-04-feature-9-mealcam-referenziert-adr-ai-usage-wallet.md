---
nr: G-231
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

# G-231 — `SPEC_04 §Feature 9 MealCam` referenziert `ADR_AI_USAGE_WALLET.md` — nicht im Nutrition Spec Pfad

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, MIN-2.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

`SPEC_04 Feature 9`:
> Jeder Scan wird in `usage_events` geloggt (event_type: `mealcam_scan`).
> Basis für spätere Wallet-Abrechnung. Siehe ADR_AI_USAGE_WALLET.md.

Die ADR-Datei existiert nicht im Nutrition Spec Pfad (Glob-Liste enthält sie nicht). Ist `usage_events` ein Cross-Modul-Konzept oder nutritionsspezifisch? Nicht belegt im Review-Scope.

V1-Wirkung: Wenn Wallet-Logik V1 erforderlich ist, fehlt sie in Specs. Wenn nicht V1, sollte Hinweis "Phase 2" beigefügt werden.

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

