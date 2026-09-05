---
nr: G-328
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: G-279
entscheidung: E-56
agent: claudecode
beauftragt: 2026-09-07
erledigt: 2026-09-07
commit: 7759013e
beruehrt:
  tabellen: [nutrition.meals]
zahlen:
  gemessen: 2026-09-02
---

# G-328 — was zaehlt *am haeufigsten*?

## Befund

Aus E-56, 2026-09-02.

`[cmd]` **G-263 nannte: ein Fruehstueck kam an 27 von 30 Tagen
vor.**

`[cmd]` **Heute auf `dev` gemessen: das haeufigste Fruehstueck kommt
einmal in 30 Tagen vor.** `[cmd]` **Gestern waren es fuenf
Mahlzeiten.**

`[read]` **Die 27 stammen aus einer anderen Zaehlung oder einem
anderen Zeitraum** — **welche, ist ungeklaert.**

## Die Frage

**Was ist dieselbe Mahlzeit?**

    derselbe Name          "Banane-Joghurt-Haferflocken"
    dieselben Posten       drei Zutaten, gleiche Mengen
    dieselbe Zusammen-     drei Zutaten, Mengen egal
      setzung

`[read]` **Die drei liefern verschiedene Zahlen.** `[cmd]` **Und die
Kachel soll sagen, was sie zaehlt** — sonst steht dort eine Zahl ohne
Bedeutung, wie *,,78 %"* in der entfernten Attrappe.

## Und die zweite Frage

`[read]` **Ueber welchen Zeitraum?** `[cmd]` **30 Tage waeren
naheliegend** — dieselbe Spanne wie die Insights-Kacheln.

`[read]` **Aber wer seit einer Woche etwas Neues isst, sieht dann
noch das Alte.**

## Auftrag

**Mitbeauftragt mit G-343 am 2026-09-07.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-09-07, mit G-343 abgenommen: Tage, nicht Eintraege.**

`[cmd]` **Olivenoel: 52 Eintraege an 30 Tagen.**

`[read]` **Wer siebenmal Kaffee an einem Tag traegt, hat einen Tag,
nicht sieben.**

`[cmd]` **Und die *27 von 30* in E-56 ist eine Eintragszahl aus
`vorschlags-lage.ts`, zitiert als Tageszahl** — **im
Entscheidungstext berichtigt.**
