---
nr: G-481
typ: fehler
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-480
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/lib/nutrition/supplement-posten-read.ts
zahlen:
  gemessen: 2026-09-08
  treffer: 1450
---

# G-481 - die Suche benutzt die Suche nicht

## Toms Befund

Tom, 2026-09-08:

> also die suche ist laecherlich, das man nur schon sowas
> liefert ist unterste schublade. whey bringt wohl tausende und
> es werden vielleicht 20 angezeigt, nicht scrollbar und
> vielzuwenig infos dazu. dann keine smartsuche wie whey isolate
> optimum nutrition moeglich, also kurz gesagt irgend ein
> kindergarten modal aber fernab von dem, was ein
> professionelles lumeos haben muss

> wir haben schon gute suchen, bau das vernuenftig und
> anstaendige filter mit gruppentitel und nicht nur irgendwelche
> buttons verteilt

## Gemessen

    1.458 On-Market-Produkte mit "whey"
    1.450 davon untermischbar
       20 gezeigt

`[cmd]` **`supplement-posten-read.ts:77`: `grenze = 20`,
Zeile 102: `.limit(grenze)`.**

`[cmd]` **Und die Begruendung im Code:** *,,`.in()` kippt um
200 Ids (G-64) ? 20 Treffer sind ..."*

`[read]` **Das ist ein Grund fuer die NACHFRAGE, nicht fuer die
Trefferzahl.**

## Was schon da ist und nicht benutzt wird

`[cmd]` **`supplements.search_supplier_products`** ? **C-495
bis C-504:**

    pg_trgm-Smartsuche, "gold standart wey" trifft
    p_query, p_market_status, p_marke, p_limit,
    p_kategorie, p_form, p_allergien_ausblenden,
    p_meidestoffe, p_marken, p_nur_bewertet
    Deckel 500 (G-463), 33,6 ms

`[cmd]` **`supplements.supplier_product_search_meta`** ?
**Gesamtzahl und mitgefilterte Kategorienzahlen (G-463).**

`[cmd]` **`nutrition.food_search`** ? **die Lebensmittelseite.**

`[read]` **Der neue Leseweg ruft keine davon** ? **er macht
`.limit(20)` auf die Tabelle.**

## Und die Filterleiste existiert auch schon

`[cmd]` **`tab-produkte.tsx` traegt `KATEGORIEN`, `FORMEN`,
`MARKEN_PULLDOWN` mit Gruppentiteln (G-453):**

    MARKT               On Market | Off Market | Alle
    KATEGORIE           14 Werte mit Zahlen
    DARREICHUNGSFORM    ohne E-Codes
    MARKE               Eingabefeld + Pulldown

Tom: *,,anstaendige filter mit gruppentitel und nicht nur
irgendwelche buttons verteilt"*

`[read]` **Die Leiste im Produkte-Reiter hat Gruppentitel.
Das Modal hat lose Pillen.**

## Mein Auftragsfehler

`[cmd]` **G-480 sagte *,,food-such-modal.tsx bekommt
Supplemente"*** ? **ohne zu sagen, dass die bestehende
Suchfunktion zu benutzen ist.**

`[read]` **Er hat einen zweiten Leseweg gebaut, und ich habe
ihn abgenommen, weil die Filterpillen stimmten.**

## Abnahmebedingungen

    A1  die Suche ruft search_supplier_products.
        Belegt.
    A2  "whey isolate optimum nutrition" trifft. Foto.
    A3  die Trefferzahl steht: "20 von 1.450" oder
        aehnlich. Foto.
    A4  mehr als 20 erreichbar -- scrollen oder
        nachladen. Foto.
    A5  Filter mit GRUPPENTITELN, wie im
        Produkte-Reiter. Foto.
    A6  je Zeile mehr Infos: Marke, Portion, Form.
        Foto.
    A7  die Lebensmittelseite ruft food_search.
        Belegt.
    A8  Laufzeit gemessen, vorher/nachher.
    A9  vier Module unveraendert.
    A10 apps/web 1876 oder mehr, apps/coach 65.

## Was NICHT zu bauen ist

**Keine neue Suchfunktion** ? **sie existieren.**

**Nichts in `supabase/`** ? **wenn ein Parameter fehlt:
MELDEN.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

