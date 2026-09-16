---
nr: G-454
typ: befund
modul: supplements
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-453
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [supplements.supplier_products]
zahlen:
  gemessen: 2026-09-08
---

# G-454 - Suche und Filter schliessen sich aus

## Befund

Aus G-453, Claude Code, 2026-09-08:

> *,,Smartsuche und diese Filter schliessen sich heute noch
aus."*

`[cmd]` **Selbst nachgemessen:**

    search_supplier_products(
      p_query text,
      p_market_status text DEFAULT 'On Market',
      p_marke text DEFAULT NULL,
      p_limit integer DEFAULT 50)

`[read]` **Keine Parameter fuer Kategorie und Form.**

`[read]` **Wer *,,whey"* sucht UND auf `protein` filtert, kann
nur eines haben.**

## Was zu entscheiden ist

**a** ? **`search_supplier_products` bekommt zwei Parameter.**

`[cmd]` **`p_kategorie text`, `p_form text`** ? **der Filter
wirkt AUF PRODUKTE (Toms Entscheidung), also ein
`EXISTS`-Zweig auf `product_contents`.**

`[read]` **MISS die Laufzeit** ? **heute 14 ms, ein `EXISTS`
auf 3 Mio Zeilen kann teuer werden.**

**b** ? **Der Filter wirkt NACH der Suche, in der Anwendung.**

`[read]` **Einfacher, aber die Trefferzahl stimmt nicht mehr** ?
**50 Treffer, davon 3 mit Protein.**

`[cmd]` **`p_limit` ist 50** ? **wer filtert, sieht drei.**

## Was dafuer spricht, a zu nehmen

`[cmd]` **Die Kategorienzahlen stehen schon in der Leiste:**
`mineral 39.960`, `vitamin 39.523`, `protein 11.813`.

`[read]` **Sie kommen aus einer eigenen Abfrage** ? **miss, ob
sie beim Filtern mitwandern oder stehenbleiben.**

`[read]` **Eine Zahl, die sich nicht mitaendert, ist eine
zweite Wahrheit.**

## Tom hat es am Schirm gesehen, 2026-09-08

> die filter wie protein, sprich kategorie, funktioniert nicht
> mehr und wenn, enorm langsam

`[cmd]` **Zwei Ursachen, gemessen:**

**1** ? **Die Funktion kennt den Filter nicht.**

    search_supplier_products(
      p_query, p_market_status, p_marke, p_limit)

`[read]` **Kein Parameter fuer Kategorie oder Form.**

**2** ? **Kein Index auf `ingredient_category`.**

`[cmd]` **Sieben Indizes auf `product_contents`:**

    product_idx, supplement_idx, blend_idx,
    ingredient_name (zweimal), dsld_order_key, pkey
    KEINER auf ingredient_category

`[cmd]` **`EXPLAIN ANALYZE` mit `EXISTS` auf `protein`:**

    Seq Scan on supplier_products, 68.620 Zeilen
    Execution Time 9,2 ms bei LIMIT 50

`[read]` **Mit Limit ertraeglich, ohne teuer** ? **und die
Kategorienzahlen in der Leiste (`mineral 39.960`, `protein
11.813`) kommen aus einer eigenen Abfrage ueber 3 Mio
Zeilen.**

## Was zu bauen ist

`[read]` **Zwei Parameter, `p_kategorie` und `p_form`.**

`[cmd]` **Toms Entscheidung aus G-453: der Filter wirkt auf
PRODUKTE** ? **ein `EXISTS` auf `product_contents`.**

`[read]` **Und ein Index darauf** ? **miss, ob
`(ingredient_category, product_id)` taugt oder ein Teilindex
besser ist.**

`[cmd]` **Die Form steht in `supplier_products.produktform`** ?
**dort gibt es schon `marke_idx` und `market_status_idx`.**

## Und die Kategorienzahlen

`[read]` **Sie stehen heute fest in der Leiste.**

`[cmd]` **Miss, ob sie beim Filtern MITWANDERN oder
stehenbleiben** ? **eine Zahl, die sich nicht mitaendert, ist
eine zweite Wahrheit.**

## Abnahmebedingungen

    A1  p_kategorie und p_form, Filter auf PRODUKTE.
    A2  Laufzeit vorher/nachher, mit EXPLAIN.
    A3  ein Index, und BELEGT dass er benutzt wird.
    A4  "whey" UND Kategorie protein zusammen. Zahl.
    A5  die Kategorienzahlen: wandern sie mit?
        Gemessen, und wenn nein: gemeldet.
    A6  Gegenprobe: eine erfundene Kategorie -> 0.
    A7  Sicherung, Vollkette, ALLE Waechter.

