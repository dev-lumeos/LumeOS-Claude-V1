---
nr: G-454
typ: befund
modul: supplements
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-453
entscheidung: null
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

