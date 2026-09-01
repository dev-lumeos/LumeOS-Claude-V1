---
nr: G-320
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-300
entscheidung: null
agent: claudecode
beauftragt: 2026-09-02
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-foods.tsx
zahlen:
  gemessen: 2026-09-02
  tab_foods_zeilen: 1061
---

# G-320 — die Lebensmittelsuche als Modal

## Befund

Tom, 2026-09-02: *,,offen planner ist die lebensmittelsuche die muss
gleich aufgebaut sein wie die suche in food db."*

`[cmd]` **Heute steht im Planner ein Pulldown mit dem Satz
*,,Lebensmittel werden ueber die Suche hinzugefuegt — dieser Weg ist
noch nicht angebunden."***

`[cmd]` **Und `tab-foods.tsx` traegt 1.061 Zeilen:** Herkunftsfilter,
Sortierung, Favoriten, Detailansicht.

## Warum Modal und nicht Pulldown

`[cmd]` **`SPEC_10` fuehrt acht Food-Search-Komponenten:**
`FoodSearch`, `FoodSearchFilters`, `FoodSearchResults`, `FoodCard`,
`FoodAmountInput`, `CustomFoodForm`, `FoodDetail`,
`SmartSuggestions`.

`[read]` **Das passt in kein Pulldown.**

`[cmd]` **Die Zelle im Wochenraster ist rund 150 px breit.** `[cmd]`
**`food_search` liefert aus 4.970 Lebensmitteln, mit zehn
Sortierwerten und Treffergrund** (G-281).

`[read]` **Und dieselbe Suche wird an drei Stellen gebraucht:**
Planner, Rezept-Zutaten (seit G-289), **Quick-add im Tagebuch.**
`[read]` **Ein Modal ist einmal gebaut und dreimal gerufen.**

## `FoodAmountInput` fehlt und gehoert dazu

`[cmd]` **`SPEC_10`: *,,Mengen-Eingabe mit Portions-Selector und
Live-Naehrstoff-Preview"*.** `[cmd]` **Nirgends gebaut.**

`[cmd]` **Flow 1 verlangt sie:** man soll sehen, was 150 g bedeuten,
**bevor man eintraegt.**

`[read]` **Im Modal hat sie Platz, im Pulldown nicht.**

## Und der Kontext gehoert mit

`[read]` **Das Modal soll wissen, wohin es schreibt:** Tag,
Mahlzeit, **und was der Tag schon traegt.**

`[cmd]` **Der Plan traegt `target_kcal`** — **wer mittags 800 kcal
eintraegt, sollte sehen, dass er bei 2.200 landet.**

## Auftrag — ein Modal, dreimal gerufen

**Beauftragt am 2026-09-02.**

### Was zu bauen ist

**Ein Suchmodal, das die Bauteile aus `tab-foods.tsx` wiederverwendet
statt sie nachzubauen.**

`[cmd]` **Dort stehen: Herkunftsfilter, zehn Sortierwerte,
Favoriten, Detailansicht.** `[read]` **Wenn sie nicht
wiederverwendbar sind, sag welche und warum** — **eine zweite Suche
ist der Fehler, den wir bei der Rezepte-Liste entfernt haben.**

### Und `FoodAmountInput`

`[cmd]` **`SPEC_10`: *Mengen-Eingabe mit Portions-Selector und
Live-Naehrstoff-Preview*.** `[cmd]` **Nirgends gebaut, und Flow 1
verlangt sie.**

`[cmd]` **`food_nutrient_snapshot()` liefert die Naehrwerte je
Menge** — dieselbe Funktion, die C-380 zum Rechnen genutzt hat.

`[read]` **Man soll sehen, was 150 g bedeuten, bevor man eintraegt.**

### Der Kontext gehoert ins Modal

`[read]` **Tag, Mahlzeit, und was der Tag schon traegt.**

`[cmd]` **Der Plan traegt `target_kcal`** — bei den Seed-Plaenen
2.200, 3.100, 2.700.

`[read]` **Wer mittags 800 kcal eintraegt, soll sehen, wo er
landet.**

### Drei Aufrufer, einer davon jetzt

    Planner        die Zelle im Wochenraster   <- jetzt
    Rezept         Zutat hinzufuegen (G-289)   <- pruefen, ob es
                                                  dieselbe sein kann
    Quick-add      im Tagebuch                 <- spaeter

`[read]` **Bau es fuer den Planner, aber so, dass die anderen zwei
es rufen koennen.** `[read]` **Und wenn das Rezept-Formular heute
schon eine eigene Suche hat: sag es, statt eine dritte zu bauen.**

### Was nicht zu tun ist

**Keine zweite Suchfunktion** — `food_search` ist gebaut.
**Kein `CustomFoodForm`** — das ist ein eigener Punkt, Flow 6.
**Nichts auf `dev@lumeos.app` schreiben** — vier Plaene und sechs
Protokollzeilen stehen dort zum Ansehen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Suche im Modal      Filter, Sortierung, Treffergrund wie in
                        Food DB
    Wiederverwendung    welche Bauteile geteilt, welche nicht
    FoodAmountInput     Menge eingeben, Naehrwerte aendern sich
    Kontext             Tag, Mahlzeit, Tagessumme sichtbar
    schreiben           Position entsteht, gezaehlter Rueckbau
    Rezept-Formular     hat es eine eigene Suche? gemessen

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
