---
nr: G-221
typ: entscheidung
modul: nutrition
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: E-22
agent: codex
beauftragt: 2026-08-28
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

## Auftrag — die sechs neuen Tags

**Entschieden in `docs/entscheidungen/E-22`.** `[read]` **Lies sie
zuerst; sie ist die Vorgabe, nicht dieser Auftrag.**

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator.

### Zu tun

**Sechs Tags ergaenzen:** `low_protein`, `high_carb`, `high_fat`,
`low_fiber`, `gluten_free`, `lactose_free`.

### Die Schwellen sind der schwierige Teil

`[cmd]` **Die vier bestehenden Makro-Tags tragen ihre Regel als
`macro_rule` in `tag_definitions`** — `high_protein` >= 20 g
`PROT625`, `low_carb` <= 10 g `CHO`, `low_fat` <= 3 g `FAT`,
`high_fiber` >= 6 g `FIBT`.

`[read]` **Die Umkehrungen sind nicht die Negation.** Zwischen
`low_carb` (<= 10 g) und einem sinnvollen `high_carb` liegt ein
Bereich, der zu keinem von beiden gehoert — **und das ist richtig
so.** Ein Lebensmittel mit 25 g Kohlenhydraten ist weder das eine
noch das andere.

`[read]` **Die Schwellen gehoeren belegt, nicht gesetzt** — dieselbe
Regel wie bei den Umrechnungsfaktoren in C-149. **Nenn die Quelle je
Schwelle.** `[read]` **Wenn du keine findest, sag es** — dann ist es
eine Entscheidung fuer Tom und keine Recherche.

### `gluten_free` ist nicht `NOT contains_gluten`

`[cmd]` **622 Eintraege tragen `contains_gluten`.** `[read]` **Der
Rest ist nicht glutenfrei, sondern ueberwiegend ungeprueft.**

`[read]` **Miss zuerst, worauf sich eine positive Aussage stuetzen
laesst** — eine Zutatenliste, eine Kategorie, ein BLS-Feld. **Wenn
die Grundlage fehlt, vergib das Tag nicht.** `[read]` **Ein falsches
`gluten_free` bei einem Zoeliakiekranken ist schlimmer als ein
fehlendes.**

### Was nicht zu tun ist

**`halal` und `kosher` nicht anfassen** — sie bleiben liegen, ohne
Prioritaet.
**`thai_food` nicht befuellen**, `mediterranean` nicht anlegen —
Kuechenrichtungen kommen spaeter in den Mealplaner.
**Keine Profi-Tags** aus `SPEC_04`/`SPEC_05` — Phase 2.
**`is_exclusion_relevant` fuer die neuen Tags nicht setzen** ohne zu
sagen warum. `[read]` **Ein Ausschluss filtert, eine Eigenschaft
beschreibt** — das ist eine eigene Frage.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Tags vorher / nachher          Zahl
    je neue Schwelle               Quelle genannt
    Zuordnungen je neuem Tag       Zahl
    Ueberschneidung                traegt ein Lebensmittel
                                   high_carb UND low_carb? Soll 0
    gluten_free: Grundlage         woraus abgeleitet
    Eintraege ohne Aussage         Zahl - weder frei noch enthaltend
    bestehende Tags unveraendert   belegt

`[read]` **Die vorletzte Zeile ist die ehrliche:** wie viele
Lebensmittel lassen sich weder als glutenfrei noch als glutenhaltig
einordnen? **Diese Zahl gehoert in den Bericht, nicht versteckt.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Wegwerf-Datenbank, nie gegen die laufende testen.**
**Vollsicherung vor jedem Live-Eingriff nach `backup/`.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
