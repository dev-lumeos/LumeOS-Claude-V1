---
nr: G-221
typ: entscheidung
modul: nutrition
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien: [docs/specs/Nutrition/05_reviews/OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md]
zahlen: null
---

# G-221 — Food-Tag-Set V1 widersprüchlich definiert

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, CRIT-2.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

Drei Quellen mit unterschiedlichen Tag-Listen:

**`NUTRITION_NEXT_SPEC_DECISIONS.md §5` — V1 Tags (16):**
```
high_protein, low_carb, low_fat, high_fiber, vegan, vegetarian,
gluten_free, lactose_free, nut_free, halal, kosher, spicy,
thai_food, mediterranean, processed_food, ultra_processed
```

**`SPEC_04_FEATURES.md §Feature 3` — "Phase 1 Tags (zum Launch)" (100+):**
- Listet ingredient, diet, allergen, fitness, gym, processing Kategorien mit insgesamt über 100 Tags.
- Enthält esoterische Tags wie `creatine_source`, `carnitine_source`, `cortisol_management`, `insulin_sensitivity`, `bcaa_rich`, `leucine_rich`, `pre_workout_carbs`, `post_workout_recovery`, `contest_prep`, `powerlifting_bulk`.
- Nennt `halal`, `kosher` explizit als **Phase 3** (entgegen Decisions).

**`SPEC_05_FOOD_TAXONOMY.md` — Tags, vollständiger Profi-Katalog:**
- Listet identische Tag-Liste wie SPEC_04 (Phase 1 zum Launch).
- Nennt `halal`, `kosher` als Phase 3.
- `nut_free`, `spicy`, `thai_food` aus Decisions §5 fehlen komplett oder sind nur indirekt abbildbar (z. B. `nut_free` ⇔ NOT `allergen_nuts`).

**Konflikte:**

| Tag | Decisions §5 (V1) | SPEC_04/05 |
|---|---|---|
| `nut_free` | V1 | nicht belegt (nur `allergen_nuts` als Negation) |
| `halal` | V1 | Phase 3 |
| `kosher` | V1 | Phase 3 |
| `spicy` | V1 | nicht belegt |
| `thai_food` | V1 | nicht belegt |
| `processed_food` | V1 | `processed` (anders benannt) |
| `creatine_source` | nicht in Decisions | "Phase 1 zum Launch" in SPEC_05 |
| `cortisol_management` | nicht in Decisions | "Phase 1" |
| `pre_workout_carbs` | nicht in Decisions | "Phase 1" |

**Konsequenz:** Nicht klar, was V1 Tag-WOs umfassen sollen. Auto-Tag-Trigger in `SPEC_06` ist auf SPEC-04/05-Tags ausgerichtet. Workorders auf Tag-bezogene Features (Filter-UI, Smart Search Boost, Auto-Tagging) sind blockiert bis V1-Tag-Set entschieden ist.

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

