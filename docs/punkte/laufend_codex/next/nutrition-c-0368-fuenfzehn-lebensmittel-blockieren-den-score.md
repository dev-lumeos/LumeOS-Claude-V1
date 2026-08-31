---
nr: C-368
typ: entscheidung
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: C-367
entscheidung: null
beruehrt:
  tabellen: [nutrition.food_nutrients]
zahlen:
  gemessen: 2026-08-31
  luecken_carotpaxb: 108
  betroffene_lebensmittel: 14
  spuren_lebensmittel: 1
  scorefaehige_tage: 0
---

# C-368 — fuenfzehn Lebensmittel blockieren den Score

## Befund

Aus C-367, Codex, 2026-08-31.

`[cmd]` **In den 392 Mahlzeitpositionen von `dev` liegen 108 echte
`CAROTPAXB`-Luecken — aus 14 Lebensmitteln.** `[cmd]` **Plus 12
Spuren aus einem weiteren.**

`[read]` **Fuenfzehn Lebensmittel blockieren dreissig Tage.**

`[cmd]` **`RETOL` ist an 30 von 30 Tagen vollstaendig, `CARTB` an
10** — **nur `CAROTPAXB` faellt auf 0.**

## Die Frage

**Was geschieht mit fuenfzehn Lebensmitteln ohne
Carotinoid-Messwert?**

`[read]` **Es sind wenige, und sie sind benannt.** `[read]` **Wenn
sie eine Quelle haetten, waere der Score morgen rechenbar.**

## Drei Wege

`[read]` **Eine zweite Quelle.** `[cmd]` **BLS 4.0 ist die einzige
Lebensmittelquelle (E-03)** — **eine zweite waere eine
Grundsatzentscheidung, nicht ein Nachtrag.**

`[read]` **Oder der Score bleibt `incomplete`, bis die Datenlage
besser ist.** `[read]` **Ehrlich, aber die Kachel bliebe leer.**

`[read]` **Oder Vitamin A wird aus der Formel genommen.** `[cmd]`
**Dann ist es nicht mehr NRF9.3** — **und Codex hat belegt, dass
NRF8.3 keine Vitamin-A-lose Fassung ist.**

## Zuerst messen

`[read]` **Welche fuenfzehn sind es?** **Bevor entschieden wird,
gehoert die Liste auf den Tisch** — **vielleicht sind es Randfaelle,
vielleicht Grundnahrungsmittel.**

## Auftrag — die fuenfzehn benennen

`[read]` **Vorbereitet am 2026-08-31.**

### Was zu tun ist

**Die Liste auf den Tisch legen, bevor Tom entscheidet.**

`[cmd]` **14 Lebensmittel mit `CAROTPAXB`-Luecke, eines mit Spuren.**

`[read]` **Je Lebensmittel: Name, wie oft es in den 392 Positionen
vorkommt, und ob `CARTB` und `RETOL` dort vorhanden sind.**

`[read]` **Und die Frage dahinter:** **sind es Randfaelle oder
Grundnahrungsmittel?** `[cmd]` **Bei `CARTB` waren es zwei
Lebensmittel fuer 17 Luecken** — **wenn dieselben zwei auch bei
`CAROTPAXB` fehlen, ist es ein enger Kreis.**

### Und eine Gegenprobe

`[read]` **Wie viele der 4.970 Lebensmittel im Katalog haben
vollstaendige Vitamin-A-Komponenten?** `[cmd]` **Wenn es die Mehrheit
ist, ist das Problem die Auswahl auf `dev`, nicht die Datenlage.**

### Was nicht zu tun ist

**Keine Werte setzen** — C-368 ist eine Entscheidung.
**Keine zweite Quelle heranziehen** — E-03 gilt.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    die 15                Namen, Haeufigkeit, welche Komponente
    Katalog gesamt        wie viele mit vollstaendigem Vitamin A
    Randfall oder nicht   beurteilt, mit Zahlen

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
