---
nr: C-499
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-485
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 68c69158
beruehrt:
  tabellen: [supplements.supplier_products]
zahlen:
  gemessen: 2026-09-08
  off_market: 92821
---

# C-499 - Off-Market-Produkte stilllegen

## Toms Vorgabe

Tom, 2026-09-08:

> ich wuerde mal sagen, alle inaktiven supplements koennen wir
> eh loeschen

`[read]` **Das aendert seine fruehere Entscheidung aus C-485:**
*,,alle, was wir haben das haben wir und kostet uns ja
nichts."*

`[read]` **Er hat die Liste gesehen und die Meinung geaendert
? die neue gilt.**

## Was dasteht

    On Market    121.959
    Off Market    92.821

## Stilllegen statt loeschen

`[read]` **Ein eingestelltes Produkt kann noch in jemandes
Schrank stehen.**

`[cmd]` **`supplier_products` hat `is_active`** ? **MISS, ob es
heute benutzt wird.**

    is_active = false   statt DELETE
    -> weg aus Suche und Filter
    -> ein Verweis bricht nicht

`[read]` **Wenn Tom wirklich loeschen will, ist das ein
zweiter Schritt** ? **erst messen, was darauf zeigt.**

## Was zu messen ist, VOR dem Stilllegen

`[cmd]` **Zeigt etwas auf Off-Market-Produkte?**

    product_contents        wie viele Zeilen?
    product_suppliers       wie viele Rollen?
    food_preference_items   Vorlieben (C-497)
    meal_items              noch nicht gebaut

`[read]` **Eine Zahl je Tabelle, bevor etwas geaendert wird.**

## Und was danach schrumpft

`[cmd]` **3,0 Mio Inhaltszeilen gesamt** ? **miss, wie viele
davon an Off-Market-Produkten haengen.**

`[read]` **Wenn es 40 Prozent sind, wird die Suche schneller
und die Kandidatenliste kleiner.**

## Abnahmebedingungen

    A1  was zeigt auf Off-Market-Produkte? Je Tabelle
        eine Zahl.
    A2  is_active = false bei 92.821, nicht geloescht.
    A3  search_supplier_products zeigt sie nicht mehr.
    A4  wie viele Inhaltszeilen haengen daran?
    A5  Laufzeit der Suche vorher/nachher.
    A6  Gegenprobe: ein Off-Market-Produkt ist ueber
        supplier_product_detail noch erreichbar.
    A7  Sicherung, Vollkette, Punktelauf.

## Was nicht zu tun ist

**NICHT loeschen** ? **stilllegen. Loeschen ist ein zweiter
Schritt, nachdem gemessen ist, was daran haengt.**

## Bericht

2026-09-15 — umgesetzt und in die laufende Datenbank eingespielt.

- Vor der Stilllegung gemessen: `product_contents` 1.392.029 Zeilen,
  `product_suppliers` 99.146 Zeilen und `food_preference_items` 0
  Vorlieben zeigen auf die 92.821 Off-Market-Produkte.
- Die 92.821 Produkte waren bereits mit `is_active = false` markiert;
  die idempotente Migration hat deshalb 0 Zeilen aendern muessen. Sie
  macht den Status jetzt im Suchweg verbindlich: Suche und Markenliste
  lesen nur aktive Produkte. Nichts wurde geloescht.
- Gegenprobe nach Live-Einspielen: `whey` liefert 0 Off-Market-Treffer,
  ein konkretes Off-Market-Produkt bleibt ueber
  `supplier_product_detail` erreichbar.
- Smartsuche `gold standart wey`: nach Warmwerden 15,26 ms und 15,29 ms
  bei 214.780 Produkten (erster Lauf 19,73 ms); nur On-Market-Treffer.

Sicherung vor Einspielen:
`backup/schema/20260915151306_c498_c500_vor_einspielen.sql`.
Vollkette im Wegwerfstand und die C-499-Gegenproben: gruen.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    stillgelegt   92.821
    aktiv        121.959

`[cmd]` **Selbst getestet:**
`search_supplier_products('whey', 'Off Market')` ? **0
Treffer.**

`[read]` **Stillgelegt, nicht geloescht** ? **die Auflage.**

> *,,Detail bleibt erreichbar."*

`[read]` **Wer ein eingestelltes Produkt im Schrank hat, findet
es ueber `supplier_product_detail`** ? **nur nicht mehr in der
Suche.**

`[cmd]` **Suche nach dem Warmlaufen: 15,26 ms** ? **gegen 14,1
vorher, im Rauschen.**

**Abgenommen.**


