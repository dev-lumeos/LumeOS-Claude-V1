---
nr: G-463
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-454
entscheidung: null
beruehrt:
  tabellen: [supplements.supplier_products]
zahlen:
  gemessen: 2026-09-08
  deckel: 100
---

# G-463 - die Suche deckelt bei 100, die Liste will 500

## Befund

`[cmd]` **`search_supplier_products`, Zeile 85:**

    LIMIT least(greatest(coalesce(p_limit, 50), 1), 100)

`[cmd]` **Gemessen:**

    p_limit  100  ->  100 Zeilen
    p_limit 1500  ->  100
    p_limit 5000  ->  100

`[read]` **Die Obergrenze steht fest, unabhaengig vom
Parameter.**

## Was daran haengt

`[cmd]` **G-453 hat die Oberflaeche auf ein WACHSENDES FENSTER
gebaut: 500 -> 1.000.**

`[read]` **Sie kann nie mehr als 100 zeigen** ? **das
"Mehr laden" bringt nichts.**

`[cmd]` **Und `whey` + `protein` hat 1.500 Treffer** ? **der
Nutzer sieht 100 und weiss nicht, dass 1.400 fehlen.**

## Was zu entscheiden ist

**a** ? **Den Deckel anheben.**

`[read]` **Auf wie viel? G-453 hat gemessen: 500 Zeilen sind
3.002 DOM-Knoten, unter den 4.713 aus G-176.**

`[cmd]` **Und `OFFSET 100.000` kostet 113 ms gegen 17** ?
**teuer ist das tiefe Blaettern, nicht die Menge.**

**b** ? **Den Deckel lassen und die Trefferzahl melden.**

`[read]` **"100 von 1.500 gezeigt"** ? **ehrlich, aber der
Nutzer kommt nicht an die uebrigen.**

**c** ? **Beides: Deckel auf 500, plus die Gesamtzahl.**

## Und die Kategorienzahlen

`[cmd]` **Aus G-454, gemeldet:** *,,Die Kategorienzahlen in der
Leiste wandern nicht mit: Sie sind aktuell feste
Browserwerte."*

`[read]` **Eine zweite Wahrheit** ? **wer auf `protein`
filtert, sieht weiter `mineral 39.960`, obwohl davon nur ein
Teil uebrig ist.**

## Abnahmebedingungen

    A1  der Deckel: gemessen, was die Oberflaeche
        traegt. Nicht geraten.
    A2  die Gesamtzahl steht, wenn mehr da ist als
        gezeigt.
    A3  die Kategorienzahlen wandern mit ODER es steht
        dran, dass sie es nicht tun.
    A4  Laufzeit beim neuen Deckel. Gemessen.
    A5  Gegenprobe: eine Suche mit genau 100 Treffern
        -> steht "100 von 100"?
    A6  Sicherung, Vollkette, ALLE Waechter.
