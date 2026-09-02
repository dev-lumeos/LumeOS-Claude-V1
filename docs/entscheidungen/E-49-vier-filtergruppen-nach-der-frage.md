---
nr: E-49
getroffen: 2026-09-02
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [G-134, C-164, E-22]
modul: nutrition
---

# E-49 — vier Filtergruppen nach der Frage, die sie beantworten

## Entscheidung

Tom, 2026-09-02, zu G-134:

> logisch optimieren dass es fuer menschen auch verstaendlich ist

## Der Befund, gemessen

`[cmd]` **`tag_type` traegt drei Werte, `diet` hat neun Codes:**

    diet          halal, high_fiber, high_protein, kosher, low_carb,
                  low_fat, thai_food, vegan, vegetarian
    processing    ultra_processed, whole_food
    allergen      contains_gluten, contains_lactose, contains_nuts

`[read]` **`diet` mischt drei verschiedene Fragen:**

    was ich grundsaetzlich esse   vegan, vegetarisch, halal, koscher
    wonach ich gerade suche       proteinreich, ballaststoffreich,
                                  fettarm, low-carb
    welche Kueche                 Thai Food

`[cmd]` **Deshalb verodert eine stumpfe Gruppierung `vegan` mit
`high_protein`** — der Befund aus C-164.

## Die Aufteilung

    Ernaehrungsform    vegan, vegetarian, halal, kosher
                       -- was ich grundsaetzlich esse; gilt dauerhaft
    Naehrwert          high_protein, high_fiber, low_carb, low_fat
                       -- wonach ich in diesem Moment suche
    Verarbeitung       whole_food, ultra_processed
    Allergene          contains_gluten, contains_lactose,
                       contains_nuts

`[cmd]` **`thai_food` faellt aus allen vieren heraus** — **es ist
eine Kueche, keine Ernaehrungsform.**

`[read]` **Und dafuer gibt es bereits eine Spalte:**
`food_preferences.preferred_cuisines` (E-47, zurueckgestellt).
`[read]` **Bis die Kuechenfilter kommen, steht `thai_food` unter
Ernaehrungsform** — **mit dem Vermerk, dass es dort nur geparkt
ist.**

## Warum die Trennung fuer Menschen zaehlt

`[read]` **Die zwei Gruppen verhalten sich verschieden:**

`[read]` **Ernaehrungsform ist ein Ausschluss** — wer vegan waehlt,
will Fleisch nicht sehen. **Sie gilt dauerhaft und gehoert in die
Vorlieben.**

`[read]` **Naehrwert ist eine Suche** — wer heute proteinreich sucht,
sucht morgen fettarm. **Sie gilt fuer diese Anfrage.**

`[cmd]` **Und die Zahlen zeigen es:** koscher trifft 6.451
Lebensmittel, ballaststoffreich 558. **Das eine ist ein Rahmen, das
andere eine Auswahl.**

## Wo die Zuordnung steht

`[read]` **Eine Gruppenspalte in `tag_definitions`, nicht in der
Anzeige.**

`[cmd]` **Heute steht die Vierteilung nur in der Oberflaeche** —
**damit an einer Stelle, die kein Waechter erreicht.**

`[read]` **Mit einer Spalte ist sie messbar** — **und der naechste
Tag bekommt seine Gruppe beim Anlegen, nicht beim Anzeigen.**
