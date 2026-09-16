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
erledigt: 2026-09-08
commit: a3a91527
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

## Bericht

### Umsetzung

- `supplements.search_supplier_products` hat jetzt die beiden optionalen
  Parameter `p_kategorie` und `p_form`. Die Kategorie schraenkt Produkte
  ueber `EXISTS (product_contents)` ein; die Form wird gegen den gespeicherten
  DSLD-Wert `supplier_products.produktform` verglichen. Die bisherigen
  Vier-Argumente-Aufrufe bleiben ueber die Defaultwerte kompatibel.
- `product_contents_ingredient_category_product_idx` ist ein B-Tree auf
  `(ingredient_category, product_id)`. Ein Teilindex brächte nichts: von
  3.000.982 Inhaltszeilen hat keine `ingredient_category IS NULL`.
- Die bestehende Kategorienleiste ist nicht mitwandernd: `KATEGORIEN` steht
  als feste Liste samt festen Zahlen in `apps/web/src/lib/supplements/produkt-etikett.ts`.
  Sie fragt weder Suche noch Kategorie noch Form ab. Das ist der gemeldete
  Zweite-Wahrheit-Befund; gemaess Auftrag keine App-Aenderung in G-454.

### Abnahme

| Bedingung | Messung / Beleg |
| --- | --- |
| A1 | Live-Signatur: `search_supplier_products(text,text,text,integer,text,text)`. `p_kategorie` nutzt produktbezogenes `EXISTS`; `p_form` nutzt die echte DSLD-Form. Gegenprobe kombiniert `whey`, `protein` und `Capsule [E0159]`: 24 Zeilen, jede zugleich Capsule und Proteinprodukt. |
| A2 | Gleicher `On Market`-`EXISTS(protein)`-Plan, `LIMIT 50`: vorher 8,249 ms (Seq Scan Produkte, Inhaltsindex mit Kategorie-Filter), nachher 0,923 ms. |
| A3 | Nachher `Index Only Scan using product_contents_ingredient_category_product_idx`, Indexbedingung gleichzeitig Kategorie `protein` und Produkt-ID; 0 Heap-Fetches. |
| A4 | `whey` UND `protein`: 1.500 aktive On-Market-Produkte. Der bestehende Suchvertrag deckelt die gelieferte Liste bei `p_limit=100`, alle 100 besitzen eine Protein-Inhaltszeile. |
| A5 | Nein, die Zahlen wandern nicht mit; siehe Umsetzung. Die Leiste zeigt feste Messwerte (u. a. `mineral 39.960`, `protein 11.813`) trotz aktiver Suche/Filter. Gemeldet, nicht in `apps/` korrigiert. |
| A6 | `p_kategorie => 'g454_erfunden'` liefert live 0 Zeilen. |
| Rechte | `anon`: kein Execute; `authenticated`: Execute auf der neuen Sechs-Parameter-Signatur. |
| A7 | Vollkette `g454_final`: `SCHEMA VOLLSTAENDIG`, 1.004,2 s; Sicherung vor dem Lauf: `backup/schema/20260916074143_c43_vor_kettenlauf.sql`. G-454-Frischaufbau-Test 2/2 und C-495-Regression 3/3 gruen. Alle Waechter liefen: Lint gruen (eine bekannte `<img>`-Warnung), Typcheck/Build gruen; Web-Test hat zwei fremde Fehler (Settings-G-455, Theme-Kontrakt), G-444 meldet drei ueberholte Abwesenheitsaussagen, Testdatenpruefung die bekannten 15 Altbefunde. |

Keine App-Datei, kein Dev-Server, kein Commit.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen, LIVE.**

`[cmd]` **Die Signatur:**

    search_supplier_products(
      p_query, p_market_status, p_marke, p_limit,
      p_kategorie, p_form)

`[cmd]` **Index `product_contents_ingredient_category_product_idx`
da.**

`[cmd]` **Selbst getestet:**

    'whey' + 'protein'                 100
    'whey' + 'protein' + Capsule        24
    'whey' + 'qzvwxjplk'                 0

`[cmd]` **Und der Plan: 8,249 ms -> 0,923 ms, Index-Only-Scan.**

`[read]` **Der Teilindex verworfen, weil KEINE der 3.000.982
Zeilen eine leere Kategorie hat** ? **gemessen, nicht
angenommen.**

### Ein Befund: die Funktion deckelt bei 100

`[cmd]` **Zeile 85 der Migration:**

    LIMIT least(greatest(coalesce(p_limit, 50), 1), 100)

`[cmd]` **Gemessen:**

    p_limit  100  ->  100
    p_limit 1500  ->  100
    p_limit 5000  ->  100

`[read]` **Er meldet *,,1.500 passende Produkte"*** ? **die
Funktion gibt nie mehr als 100 zurueck.**

`[read]` **Die 1.500 sind die TREFFERMENGE, nicht die
Rueckgabe** ? **beides richtig, aber im Bericht nicht
getrennt.**

`[cmd]` **Und G-453 hat die Oberflaeche auf ein wachsendes
Fenster von 500 gebaut** ? **das kann sie nie fuellen.**

`[cmd]` **Als G-463.**

### Die Kategorienzahlen, gemeldet statt gebaut

> *,,Die Kategorienzahlen in der Leiste wandern nicht mit: Sie
sind aktuell feste Browserwerte. Das ist im Bericht als ZWEITE
WAHRHEIT dokumentiert; gemaess Auftrag keine App-Aenderung."*

`[read]` **Genau die Auflage** ? **gemessen, benannt, nicht
heimlich gebaut.**

### Und die zwei roten Web-Tests

`[cmd]` **Selbst gemessen: 1793/1793, fail 0.**

`[read]` **Sie waren Claude Codes laufende G-459-Arbeit** ?
**inzwischen gruen.**

**Abgenommen.**
