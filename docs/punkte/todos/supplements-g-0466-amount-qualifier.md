---
nr: G-466
typ: fehler
modul: supplements
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-485
entscheidung: null
beruehrt:
  tabellen: [supplements.product_contents]
zahlen:
  gemessen: 2026-09-08
---

# G-466 - amount_qualifier wird nicht gelesen

## Befund

Aus G-464, Claude Code, 2026-09-08:

> *,,`amount_qualifier` traegt `per_serving` und
`per_container`. Mein Auftrag sagte, die Portionsspalte fehle.
Der Wert ist da ? und der ZWEITE Wert ist nicht *die zweite
Portionsgroesse*, sondern das, was IN DER PACKUNG steckt."*

`[cmd]` **`Total Fat 19 g` je Portion, `4 g` je Behaelter** ?
**oder umgekehrt.**

## Meine Fehldiagnose

`[cmd]` **C-485 hat gemeldet, `product_contents` habe keine
Portionsspalte** ? **und ich habe es in G-452, G-453, G-464
weitergereicht.**

`[read]` **Sie fehlt nicht. Sie wird nicht gelesen.**

## Was zu tun ist

`[read]` **Die Tafel zeigt beide Werte untereinander, ohne zu
sagen, welcher was ist.**

`[cmd]` **MISS, welche Werte `amount_qualifier` traegt und wie
viele Zeilen je Wert.**

`[read]` **Dann: je Portion als Vorgabe, je Behaelter
daneben** ? **oder ein Umschalter.**

## Und die Naehrwertsicht

`[cmd]` **`supplier_product_nutrients` rechnet je Portion
(C-496)** ? **miss, ob sie den `qualifier` beruecksichtigt oder
beide Werte mittelt.**

`[read]` **Wenn sie mittelt, sind die Naehrwerte falsch.**

## Abnahmebedingungen

    A1  welche Werte traegt amount_qualifier? Zahl je
        Wert.
    A2  die Tafel sagt, welcher Wert was ist. Foto.
    A3  supplier_product_nutrients: rechnet sie richtig?
        Gemessen an einem Produkt mit beiden Werten.
    A4  Gegenprobe: ein Produkt mit nur einem Wert.
