---
nr: C-523
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-19
braucht: [C-521]
agent: codex
beauftragt: 2026-09-19
---

# C-523 - welche Aliase fehlen noch?

## Ergebnis

Dies ist ein Messauftrag. Es wurde nichts gebaut und nichts in `supabase/`
veraendert.

Der Anlass ist bestaetigt: `allergy_catalog_suggestions('nahrung', ...)`
findet `gluten` und `milch`, aber nicht `brot`, `weizen` oder `glutenfrei`.
Die vorhandenen Food-Aliase helfen hier nicht, weil dieser Suchweg sie nicht
liest.

## A - Aliasquellen im Funktionsrumpf

| Suchweg | tatsaechliche Quelle | Aliasverwendung |
|---|---|---|
| `nutrition.food_search` | Foods und `nutrition.food_aliases` | ja |
| `nutrition.preference_search_preview` | Food-Suchziel | ja, ueber Food-Aliase |
| `public.allergy_catalog_suggestions('nahrung')` | exclusion-relevante `tag_definitions`, `food_tags`, `allergen_aliases` | ja, aber nur `allergen_aliases` |
| `public.allergy_catalog_suggestions('supplement')` | `product_contents`, `supplement_warnings` | nein |
| `public.allergy_catalog_suggestions('medikament')` | `canonical_name`, `generic_names`, `synonyms` in `medication_active_substances` | keine Aliastabelle |
| `supplements.search_supplier_products` | Produktname und Marke | keine der drei Substanz-Aliastabellen |

## B - Ziele ohne Alias

| Aliasbestand | Ziele ohne Alias | Ziele gesamt | Hinweis |
|---|---:|---:|---|
| `nutrition.food_aliases` | 0 | 7.140 Foods | vollstaendig, 32.845 Zeilen |
| `supplements.supplement_aliases` | 0 | 617 Supplements | vollstaendig, 2.868 Zeilen |
| `nutrition.nutrient_aliases` | 88 | 138 Naehrstoffcodes | 98 Zeilen |
| `nutrition.nutrient_search_aliases` | 88 | 138 Naehrstoffcodes | 50 Suchalias-Ziele |
| `public.allergen_aliases` fuer sechs relevante Food-Tags | 3 | 6 Tags | 29 Zeilen, nur vier Codes belegt |
| Medikamente | 498 | 498 Wirkstoffe | keine eigene Aliastabelle |
| `medical.biomarker_aliases` | 11.620 | 11.676 LOINC-Biomarker | 292 Zeilen; kein Allergievorschlagsweg |

`substance_aliases` ist kein einheitlicher 617er-Zielkatalog: 1.541 Zeilen
verteilen sich auf 320 F05-Kandidaten, 290 Kimi-Substanzen und 44 LumeOS-
Katalogeintraege. Es ist deshalb keine verlaessliche Abdeckungszahl fuer die
Produkt- oder Allergiesuche.

## C und D - menschliche Stichprobe

| Eingabe | Weg | Ergebnis | Befund |
|---|---|---|---|
| Brot | Nahrung-Allergie | 0 | Suchbegriff fuer Gluten fehlt |
| Milch | Nahrung-Allergie | 1 | findet Lactose |
| Kopfschmerztablette | Medikament-Allergie | 0 | kein Wirkstoffname und keine semantische Bruecke |
| Eisen | Nahrung-Allergie | 0 | kein exclusion-relevanter Tagbegriff |
| Blutzucker | Medikament-Allergie | 0 | kein Wirkstoffname und keine semantische Bruecke |
| Gluten | Nahrung-Allergie | 1 | `nutrition:contains_gluten` |
| Penicillin | Medikament-Allergie | 3 | vorhandene Katalogfelder treffen |
| Ibuprofen | Medikament-Allergie | 1 | vorhandene Katalogfelder treffen |

## E - Varianten oder Suchbegriffe

Die Food- und Supplement-Aliase sind vorwiegend Namens-/Schreibvarianten.
`nutrient_search_aliases` ist der einzige klar als Suchwortschatz benannte
Bestand, deckt aber nur 50 von 138 Naehrstoffzielen ab.

`allergen_aliases` sind fuer die Produktpruefung vorwiegend Etikettbegriffe:
beispielsweise `Lactose`, `Laktose`, `Milchzucker` und `Milk Protein Isolate`.
Sie enthalten kein konzeptionelles Vokabular wie `Brot -> contains_gluten` oder
`Weizen -> contains_gluten`. Genau diese zweite Kategorie fehlt in der
Allergievorschlagsfunktion.

Bei Medikamenten gibt es keine Aliastabelle: `generic_names` und `synonyms`
sind Schreib- und Handelsnamen zum Wirkstoff. Begriffe wie
`Kopfschmerztablette` oder `Blutzucker` beschreiben Anwendung bzw. Wirkung,
nicht denselben Katalogeintrag.

## Empfehlung fuer Tom

Zuerst die sechs Nahrungsausschluss-Tags um einen getrennten, kuratierten
Suchwortschatz erweitern. Das schliesst die sichtbare Luecke `Brot`, `Weizen`
und `glutenfrei` ohne die Food-Aliase zweckzuentfremden. Medikamente sind eine
andere Produktentscheidung: Eine Anwendung-zu-Wirkstoff-Bruecke waere keine
Alias-Ergaenzung und darf nicht geraten werden.

Keine Umsetzung. `git status -- supabase/` blieb unveraendert.

## Abnahme

**2026-09-08, Orchestrator. Ein Messauftrag, kein Bau.**

`[cmd]` **Selbst nachgemessen:**

    contains_gluten      0 Aliase
    vegan                0
    vegetarian           0
    contains_lactose     6
    contains_soy         7
    contains_nuts       13

    Naehrstoffe         88 von 138 ohne Alias
    food_search nutzt food_aliases: JA

`[read]` **Genau die drei, die er nennt** ? **und
`contains_gluten` ist der, den Tom getippt hat.**

### Der Kernbefund

> *,,`food_search` nutzt Food-Aliase, die Allergievorschlaege
aber nur `allergen_aliases` plus Tagnamen. Deshalb findet
*gluten* den Tag, *brot*, *weizen* und *glutenfrei* jedoch
nicht."*

`[read]` **Zwei Suchwege, zwei Aliaspools** ? **einer voll,
einer fast leer.**

### Und die Unterscheidung, die ich verlangt hatte

> *,,Medikamente: 498 Wirkstoffe ohne eigene Aliastabelle;
Namenfelder treffen *Penicillin*/*Ibuprofen*, nicht aber
ANWENDUNGSSPRACHE wie *Kopfschmerztablette*."*

`[read]` **Er hat den Unterschied zwischen Variante und
Suchbegriff auf die Medikamente uebertragen** ? **dort heisst
er Anwendungssprache.**

### Seine Empfehlung

> *,,Einen getrennten, kuratierten Suchwortschatz fuer die
sechs Nahrungsausschluss-Tags schaffen ? NICHT Food-Aliase
umwidmen."*

`[read]` **Die Food-Aliase sagen, wie ein Lebensmittel noch
heisst** ? **nicht, welches Allergen darin steckt.**

> *,,Medikament-Anwendung -> Wirkstoff waere eine separate,
NICHT ZU RATENDE Bruecke."*

`[cmd]` **Tom hat zugestimmt:** *,,ja das passt so fuer mich"*.

**Abgenommen.**
