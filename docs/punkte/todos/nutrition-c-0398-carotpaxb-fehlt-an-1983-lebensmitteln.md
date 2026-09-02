---
nr: C-398
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-294
entscheidung: E-38
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
