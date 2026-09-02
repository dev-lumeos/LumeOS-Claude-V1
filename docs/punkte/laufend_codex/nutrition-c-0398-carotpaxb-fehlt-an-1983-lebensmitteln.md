---
nr: C-398
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-294
entscheidung: E-61
agent: codex
beauftragt: 2026-09-02
beruehrt:
  tabellen: [nutrition.food_nutrients]
zahlen:
  gemessen: 2026-09-02
  missing: 1983
  trace: 63
  tage_durch_vita: 78
---

# C-398 — `CAROTPAXB` fehlt an 1.983 Lebensmitteln

## Befund

Aus G-294, Claude Code, 2026-09-02.

`[cmd]` **Der NRF9.3-Score ist an 120 von 120 Nutzertagen
`incomplete`.**

`[cmd]` **Selbst nachgemessen:**

    CAROTPAXB ohne Wert    2046 von 7140
      davon trace            63    -- zaehlt als 0 (E-38)
      davon missing        1983    -- die echte Luecke
    VITA ohne Wert            6

`[read]` **`CAROTPAXB` blockiert `VITA`** — und `VITA` ist einer der
neun NRF-Naehrstoffe.

## Die Zahl, die entscheidet

`[cmd]` **Eine VITA-Loesung allein braechte 78 von 120 Tagen.**

`[read]` **Zwei Drittel waeren zu haben** — **das ist der Unterschied
zwischen *es fehlt etwas* und *es lohnt sich*.**

## Und C-378 schliesst Annahmen aus

`[cmd]` **Tom, 01.09.:** *,,wenn die daten nicht da sind erfinden wir
sie nicht."*

`[read]` **Also keine Rechenfrage, sondern eine Datenfrage:**
**woher kaeme `CAROTPAXB` fuer die 1.983?**

`[read]` **Der BLS fuehrt es nicht** — **eine zweite Quelle waere
noetig, und die muesste zu E-43 passen** (BLS 4.0 ist die einzige
Lebensmittelquelle).

`[read]` **Damit ist es moeglicherweise gar nicht loesbar** — **und
dann ist die Antwort, den Score zurueckzustellen, nicht ihn zu
reparieren.**

## Auftrag

**Mitbeauftragt mit C-399 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-02: die Ursache steht

`[cmd]` **`VITA` in ug ist ein direkt eingefrorener Snapshot, 60/60
vollstaendig.**

`[cmd]` **Die IE-Funktion rechnet aus `RETOL`, `CARTB`, `CAROTPAXB`
und verweigert die Ausgabe bei jeder Komponentenluecke.** `[cmd]`
**Sie summiert keine Nullen, nutzt keinen Gesamtfaktor.**

`[read]` **Der ug-Wert kommt fertig aus dem BLS, der IE-Wert wird
gerechnet** — **und die Rechnung ist strenger als die Quelle.**

Tom, 2026-09-02: *,,eine summe kann man bilden mit 0."*

`[read]` **Zu entscheiden: soll eine fehlende Komponente 0 beitragen,
wie es der ug-Snapshot offenbar tut?**

`[read]` **Das waere keine Erfindung** — **es waere dieselbe Regel,
die der BLS-Wert schon anwendet.**

## Auftrag — die Summe bilden

**Mitbeauftragt: C-324.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### E-61 entscheidet es

Tom: *,,die einzelgesamt schnitt/tag haben wir ja, egal ob sie
vollstaendig sind oder nicht. also nehmen wir diese werte, rechnen
sie um zu IE und verwenden dann die summe."*

    RETOL       x 3,3333
    CARTB       x 1,6667
    CAROTPAXB   x 0,8333
                  --------
                  Summe in IE

`[cmd]` **Beispiel `dev`, 60 Tage:** 391,5 / 15.329,3 / 1.088,6 ug
**ergeben 27.761 IE.**

### Was zu aendern ist

`[cmd]` **Die IE-Funktion verweigert die Ausgabe bei jeder
Komponentenluecke.** `[read]` **Sie soll die vorhandenen summieren.**

`[read]` **Eine fehlende Komponente traegt nichts bei** — **sie
verhindert die Summe nicht.**

`[cmd]` **E-34 bleibt gueltig:** kein Gesamtfaktor, drei
Komponenten, drei Faktoren.

`[cmd]` **E-38 gilt weiter:** `censored` und `trace` sind Nullen,
`missing` traegt nichts bei.

### Und die Anzeige bleibt ehrlich

`[cmd]` **Die drei Komponenten bleiben einzeln im Reiter, mit ihrer
Vollstaendigkeitsangabe.**

`[read]` **Nur der Score wird nicht mehr blockiert.**

### C-324 — der Score selbst

`[read]` **Lies den Punkt und miss, was nach E-61 noch fehlt.**

`[cmd]` **`nrf93_daily` meldete `VITA` als einzigen fehlenden
Code** — **mit der Summe muesste der Score an allen Tagen
berechenbar sein.**

`[read]` **Miss es, statt es anzunehmen.**

### Was nicht zu tun ist

**Keinen Gesamtfaktor auf `VITA`** — E-34.
**Keine Vollstaendigkeitsangabe aendern** — sie bleibt ehrlich.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    Summe          IE je Tag, gegen 27.761 fuer den 60-Tage-Schnitt
    Score          an wie vielen von 120 Tagen jetzt berechenbar
    Anzeige        die drei Komponenten unveraendert
    Gegenprobe     ein Tag ohne CAROTPAXB liefert trotzdem einen Wert

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
