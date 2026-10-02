---
nr: G-589
typ: befund
modul: quer
schwere: niedrig
angelegt: 2026-10-02

braucht: [G-585]
kind_von: G-585

quellen:
  - docs/punkte/erledigt/quer-g-0585-die-inventur-der-ausfuhren-ohne-aufrufer.md

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src
    - apps/coach/src
    - packages
---

# 328 Ausfuhren zu viel — und wie die Zahl 385 zu 56 wurde

## Der Befund

`[cmd]` **Aus der Inventur G-585**, 2.949 benannte Ausfuhren ueber 796
Dateien:

    tot         0 fremde Aufrufer, 0 Tests, auch intern ungenutzt    56
    nur intern  0 fremde, aber in der eigenen Datei benutzt         328
    geliehen    nur von Tests gerufen                              279
    einmalig    genau 1 fremder Aufrufer                          1.329
    mehrfach    2 und mehr                                          957

`[read]` **Die 328 sind nicht tot** — sie werden gebraucht, nur nicht von
aussen. **`export` ist dort eine Zusage, die niemand einloest:** jede
oeffentliche Ausfuhr ist eine Oberflaeche, die jemand benutzen darf, und
jede davon muss beim Umbau beruecksichtigt werden.

`[cmd]` **Die 279 „geliehenen" sind der zweite Teil derselben Frage:**
eine Ausfuhr, die nur ein Test ruft, ist oft nur deshalb oeffentlich,
damit der Test sie erreicht.

## Warum dieser Punkt bei den Zahlen anfaengt

`[cmd]` **Der erste Lauf meldete 385 tote Ausfuhren. Das war falsch.** Die
Stichprobe zeigte, dass vier von fuenf in der eigenen Datei benutzt
werden (`calcBMR:468`, `PlanTag:111`, `AnsichtPerClient:676`,
`ServerSort:86`). **Der Agent hat seine eigene Zahl angezweifelt, weil
sie unplausibel war, und dabei zwei Lagen getrennt, die vorher eine
waren.**

`[read]` **Das ist die Lehre, die ueber diesen Punkt hinausgeht:** eine
unplausible Zahl ist ein Befund ueber den Zaehler, nicht ueber den
Bestand. **385 zu 56 kam aus dem Zweifel an der eigenen Messung.**

## Was zu entscheiden ist

`[read]` **Keine Aufraeumaktion ueber 328 Stellen** — das waere ein
Grossumbau mit kleinem Gewinn und grosser Kollisionsflaeche. **Drei
sinnvolle Formen:**

1. **Nichts tun, nur wissen.** Die Zahl steht hier, der naechste Umbau
   nimmt sie je Datei mit.
2. **Je Modul mitnehmen**, wenn ein Punkt die Datei sowieso anfasst — das
   ist billig und entsteht von selbst.
3. **Ein Waechter**, der neue ueberzaehlige Ausfuhren verhindert. `[read]`
   **Tom hat am 2026-10-02 gesagt, dass keine neuen Waechter entstehen,
   solange er sie nicht verlangt** — diese Form steht hier nur der
   Vollstaendigkeit wegen.

`[annahme]` **Form 2** — mitnehmen statt kampagnenweise aufraeumen.

**Nicht Teil:** die 56 toten (G-587 fuer `createServiceClient`, G-588 fuer
die sechs Serveraktionen, der Rest offen) und die drei Eintraege, die in
Werkzeugen namentlich stehen.

`[cmd]` **Rohdaten:** `g585-roh2.json`, erzeugt von
`g585-inventur2.mjs` — beide liegen beim Agenten, nicht im Repo.
