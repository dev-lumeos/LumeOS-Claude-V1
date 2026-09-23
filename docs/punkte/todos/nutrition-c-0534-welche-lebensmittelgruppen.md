---
nr: C-534
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-507
entscheidung: C-507
beruehrt:
  tabellen: [nutrition.foods]
zahlen:
  gemessen: 2026-09-08
---

# C-534 - welche Lebensmittelgruppen gibt es?

## Die Frage

`[read]` **Welche Eintraege gehoeren zusammen, und welcher
ist je Gruppe die Vorgabe?**

## Der Anlass

`[cmd]` **31 Varianten mit *Haehnchen* und *Brust*.**

Tom (C-507): *,,ich wuerde sagen, wir legen anfaengergruppen
an. da wird der PARENT, zb haehnchenbrust gegrillt, als
vorgabe angezeigt, aber er kann die CHILD anwaehlen."*

## Zu messen

    A  wie viele Gruppen gibt es? Die zehn groessten.
    B  welcher Eintrag ist je Gruppe der Parent?
       "die, die man isst" -- woran erkennbar?
    C  trennt is_prepared_dish die Fertiggerichte
       (Clubsandwich) von den Grundformen?
    D  wie weit liegen die Naehrwerte auseinander?
       Nicht fuer einen Mittelwert -- sondern um zu
       wissen, ob die Wahl des Parents zaehlt.

`[cmd]` **`nutrition.foods` hat `category_id`,
`is_prepared_dish` und `processing_level` (acht Werte, raw
3.247, cooked 2.346, ...).**

`[read]` **Punkt B ist die Arbeit** ? **7.140 Lebensmittel,
und je Gruppe muss einer als Vorgabe ausgezeichnet werden.**

`[cmd]` **Automatisch geht es vermutlich nicht** ? **MISS, ob
`processing_level` und der Name reichen, und MELDE es.**

## Was NICHT zu tun ist

**Keine Spalte anlegen** ? **das ist C-535.**

**Keine Gruppe erfinden** ? **wo es nicht messbar ist:
gemeldet.**

## Abnahmebedingungen

    A1  die zehn groessten Gruppen. TABELLE.
    A2  je Gruppe ein Parentvorschlag, mit Begruendung.
    A3  trennt is_prepared_dish? Gemessen.
    A4  die Spannen je Naehrwert, an drei Gruppen.
    A5  reicht processing_level plus Name? Zahl.
    A6  KEINE Umsetzung.
