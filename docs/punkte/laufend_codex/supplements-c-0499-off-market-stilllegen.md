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

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

