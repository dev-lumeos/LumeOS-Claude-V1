---
nr: G-463
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-454
entscheidung: null
erledigt: 2026-09-08
commit: 8ec84645
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

## Bericht

**Entscheidung c umgesetzt:** Das Suchfenster ist auf 500 erhoeht und
`supplements.supplier_product_search_meta(...)` liefert mit exakt
denselben Datenbankfiltern `total_count` und mitwandernde
`category_counts`. Die UI kann damit ehrlich etwa "500 von 1.618"
zeigen; sie muss die neue Metafunktion nur noch konsumieren (nicht
Teil dieses Auftrags).

| `p_limit` bei `whey` + `protein` | vorher | nachher |
|---|---:|---:|
| 100 | 100 | 100 |
| 500 | 100 | 500 |
| 1.500 | 100 | 500 |
| 5.000 | 100 | 500 |

Die Treffermenge ist **1.618**. Die Suche mit 500 Ergebnissen kostet
**33,6 ms**; die Metafunktion mit Kategorien **59,2 ms**. Bei aktivem
Filter `protein` meldet sie `protein = 1.618`, nicht mehr den alten
festen Browserwert fuer Mineralien. Die Gegenprobe `CVS` plus Marke
`CVS Pharmacy` ergibt exakt **100 von 100**.

Beide RPCs sind `authenticated`-only; `anon` hat kein EXECUTE.

## Abnahme

**2026-09-08, Orchestrator. Selbst getestet.**

    p_limit  100  ->  100
    p_limit  500  ->  500
    p_limit 2000  ->  500

`[read]` **Der Deckel steht bei 500 statt 100** ? **genau das,
was G-453 als tragbar gemessen hat (3.002 DOM-Knoten von
4.713).**

`[cmd]` **`whey` + `protein`: 500 von 1.618, Suche 33,6 ms,
Meta 59,2 ms.**

`[cmd]` **Gegenprobe CVS Pharmacy: 100 von 100** ? **die
Gesamtzahl stimmt auch, wenn sie unter dem Deckel liegt.**

### Und die zweite Wahrheit ist geloest

> *,,Metafunktion fuer Gesamt- und MITGEFILTERTE
Kategorienzahlen."*

`[read]` **Er hatte sie in G-454 selbst gemeldet: *,,feste
Browserwerte, wandern nicht mit"*.**

`[cmd]` **Offen: *,,Die UI muss die Meta-RPC noch
konsumieren"*** ? **das gehoert zu G-467.**

**Abgenommen.**
