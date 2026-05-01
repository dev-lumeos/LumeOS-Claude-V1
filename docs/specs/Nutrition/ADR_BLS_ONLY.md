# ADR: BLS 4.0 als einzige Food-Datenquelle

**Datum:** April 2026 | **Status:** Final — V1 Entscheidung

---

## Kontext

Für den Aufbau der Food-Datenbank in Nutrition V1 wurden mehrere Quellen evaluiert:
- BLS 4.0 (Bundeslebensmittelschlüssel, Deutschland)
- OpenFoodFacts (internationale Community-Datenbank)
- USDA FoodData Central (amerikanische Behördendatenbank)

## Entscheidung

**BLS 4.0 ist die einzige Master-Food-Datenquelle für V1.**

OpenFoodFacts und USDA sind nicht Teil von V1 und werden auch nicht für Phase 2 eingeplant ohne explizite erneute Entscheidung.

## Begründung

| Kriterium | BLS 4.0 | OpenFoodFacts | USDA |
|---|---|---|---|
| Datenqualität | Sehr hoch (wissenschaftlich, 138 Nährstoffe) | Variabel (Community) | Hoch |
| Lizenz | CC BY 4.0 | ODbL (kompatibel) | Public Domain |
| Merge-Overhead | keiner | hoch (Deduplication) | hoch |
| Sprache | DE + EN | mehrsprachig | EN |
| Nährstoff-Tiefe | 138 Codes | 40-80 typisch | 150+ |
| Relevanz für DE-User | sehr hoch | mittel | niedrig |
| Pflege | bundesbehördlich | Community | bundesbehördlich |

BLS 4.0 deckt den deutschen Markt optimal ab, hat hohe Datenqualität und erfordert keinen Merge-Aufwand.

## Konsequenz für foods_custom.source

Custom Foods dürfen nur aus diesen Quellen stammen:

```
user    — User erstellt manuell
manual  — Direkte Eingabe (z.B. via Onboarding)
import  — Import-Pipeline (z.B. eigene Datenbank)
admin   — Admin pflegt zentral
```

**`openfoodfacts` ist als source-Wert entfernt.** Barcode-basierter OpenFoodFacts-Lookup ist Phase 2 und wird dann separat entschieden.

## Phase 2

BLS 5.0 Update-Mechanismus wenn BLS 5.0 erscheint — separat zu entscheiden.
Barcode Scanner mit OpenFoodFacts-Lookup — separat zu entscheiden.
