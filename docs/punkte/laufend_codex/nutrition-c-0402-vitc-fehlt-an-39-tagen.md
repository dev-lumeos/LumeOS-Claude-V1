---
nr: C-402
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: C-398
entscheidung: null
agent: codex
beauftragt: 2026-09-02
beruehrt:
  tabellen: [nutrition.food_nutrients]
zahlen:
  gemessen: 2026-09-02
  vollstaendig: 44
  vitc: 39
  fibt: 22
  fe: 1
  ohne_daten: 15
---

# C-402 — `VITC` fehlt an 39 Tagen

## Befund

Aus C-398, Codex, 2026-09-02, nach E-61.

`[cmd]` **`VITA` blockiert keinen der 120 Tage mehr.**

`[cmd]` **Aber nur 44 von 120 Scores sind vollstaendig:**

    61 unvollstaendig   VITC (39), FIBT (22), FE (1)
    15 ohne Daten
    44 vollstaendig

`[read]` **Der ganze 02.09. ging um `CAROTPAXB`** — **und `VITC`
fehlt an fast dreimal so vielen Tagen.**

Tom, 2026-09-02: *,,wir kuemmern uns um sachen die sehr
wahrscheinlich ueber den schnitt keinen einfluss haben."*

## Zu messen

`[read]` **Warum fehlt `VITC` an 39 Tagen?** `[cmd]` **Fehlt der Wert
im BLS, oder tragen einzelne Posten ihn nicht?**

`[read]` **Und `FIBT` an 22** — **Ballaststoffe sind ein
Standardnaehrwert, das ist ueberraschend.**

`[read]` **Die 15 Tage ohne Daten sind kein Befund** — **an ihnen
wurde nichts erfasst.**

## Und die Frage dahinter

`[read]` **E-61 hat gezeigt, dass eine Luecke die Summe nicht
verhindern muss.**

`[read]` **Gilt dasselbe fuer `VITC` und `FIBT`?** `[cmd]` **Oder
sind es echte Datenluecken, die C-378 unterliegen** — *,,wenn die
daten nicht da sind erfinden wir sie nicht"*?

`[read]` **Der Unterschied entscheidet, ob es ein Rechenfehler ist
oder ein Datenproblem.**

## Auftrag — warum `VITC` an 39 Tagen fehlt

**Mitbeauftragt: C-403.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · C-402 — die Zahl nach E-61

`[cmd]` **Du hast gemessen:**

    44 vollstaendig
    61 unvollstaendig   VITC (39), FIBT (22), FE (1)
    15 ohne Daten

`[read]` **`VITA` blockiert keinen Tag mehr** — **aber `VITC` fehlt
an 39.**

Tom, 2026-09-02: *,,wir kuemmern uns um sachen die sehr
wahrscheinlich ueber den schnitt keinen einfluss haben."*

### Was zu messen ist

`[read]` **Fehlt `VITC` im BLS, oder tragen einzelne Posten es
nicht?**

`[read]` **Und `FIBT` an 22 Tagen** — **Ballaststoffe sind ein
Standardnaehrwert, das ist ueberraschend.**

`[read]` **Die Frage dahinter ist dieselbe wie bei E-61:**
**verhindert eine Luecke die Summe, wo sie nur nichts beitragen
sollte?**

`[cmd]` **E-61 hat gezeigt, dass die IE-Funktion bei jeder
Komponentenluecke ausstieg.** `[read]` **Miss, ob `VITC` und `FIBT`
denselben Fehler haben** — **oder ob es echte Datenluecken sind, die
C-378 unterliegen.**

`[read]` **Der Unterschied entscheidet, ob es ein Rechenfehler ist
oder ein Datenproblem.**

### 2 · C-403 — die fehlenden Wochen

`[cmd]` **Du hast gemessen: `Cut` (28 Tage) und `Lean bulk` (84) sind
beide `lifecycle_type = 'once'`, mit je einer Woche.**

`[read]` **Bei `once` laeuft der Plan einmal ab** — **also braucht er
alle Tage, die er behauptet.**

`[cmd]` **Dem Seed fehlen 3 beziehungsweise 11 Wochen.**

`[read]` **Bau sie** — **und trag sie in die C-380-Seedwege ein**,
damit sie den naechsten Kettenlauf ueberleben.

`[cmd]` **`meal_plan_slots` bekommen sie schon mit** (C-397) —
**die Wochen fehlen daneben.**

### Was nicht zu tun ist

**`days_count` nicht aendern** — E-62.
**Keine weiteren Zeilen loeschen** — die Freigabe galt fuer eine.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    VITC       woran es liegt: Rechenweg oder Datenluecke
    FIBT       dasselbe, mit Zahl
    Score      wie viele der 120 nach der Klaerung vollstaendig
    Cut/Lean   4 bzw. 12 Wochen, Eintraege gezaehlt
    Seed       traegt sie kuenftig mit

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
