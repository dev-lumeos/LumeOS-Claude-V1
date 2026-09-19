---
nr: C-523
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-19
braucht: [C-521]
agent: codex
beauftragt: 2026-09-19
erledigt: 2026-09-19
commit: kein-codechange
beruehrt:
  tabellen:
    - nutrition.food_aliases
    - supplements.supplement_aliases
    - nutrition.nutrient_aliases
    - nutrition.nutrient_search_aliases
    - public.allergen_aliases
    - medical.medication_active_substances
zahlen:
  gemessen: 2026-09-19
---

# C-523 - welche Aliase fehlen noch?

## Ergebnis

Messauftrag, ohne Code- oder Schema-Change. `allergy_catalog_suggestions`
findet `gluten` und `milch`, aber nicht `brot`, `weizen` oder `glutenfrei`:
der Allergieweg liest `allergen_aliases`, nicht die Food-Aliase.

| Suchweg | Quelle | Aliasbestand |
|---|---|---|
| `nutrition.food_search` | Foods | `nutrition.food_aliases` |
| `nutrition.preference_search_preview` | Food-Suchziel | Food-Aliase |
| Allergie Nahrung | Ausschluss-Tags und `food_tags` | `allergen_aliases` |
| Allergie Supplement | `product_contents`, Warnungen | keiner |
| Allergie Medikament | Wirkstoffnamen, Generika, Synonyme | keiner |
| Produktsuche | Produktname, Marke | keiner der Substanzbestände |

| Bestand | Ziele ohne Alias | Ziele gesamt |
|---|---:|---:|
| Food-Aliase | 0 | 7.140 |
| Supplement-Aliase | 0 | 617 |
| Nährstoff-Aliase | 88 | 138 |
| Nährstoff-Suchaliase | 88 | 138 |
| Allergen-Aliase für sechs Food-Tags | 3 | 6 |
| Medikamentwirkstoffe | 498 | 498 |

Die Stichprobe bestätigt: `Brot` Nahrung-Allergie 0, `Milch` 1 (Lactose),
`Kopfschmerztablette` Medikament-Allergie 0, `Eisen` Nahrung-Allergie 0,
`Blutzucker` Medikament-Allergie 0, `Gluten` 1, `Penicillin` 3 und
`Ibuprofen` 1.

## Befund und Empfehlung

Die bestehenden Aliase sind überwiegend Schreib- und Namensvarianten.
`Brot -> contains_gluten` wäre dagegen ein kuratierter Suchbegriff. Zuerst
sollte deshalb ein getrennter Suchwortschatz für die sechs Nahrungsausschluss-
Tags entstehen, ohne Food-Aliase umzudeuten. Medikament-Anwendung zu
Wirkstoff ist eine andere, nicht zu ratende Brücke.

Tom hat dieser Empfehlung zugestimmt. `supabase/` blieb unverändert.
