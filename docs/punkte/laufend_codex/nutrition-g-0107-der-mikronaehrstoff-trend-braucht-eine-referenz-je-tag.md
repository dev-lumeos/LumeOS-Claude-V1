---
nr: G-107
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-101
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-28
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-107 - Der Mikronaehrstoff-Trend braucht eine Referenz je Tag

## Befund

(neu 2026-08-20, aus G-101).

  `[cmd]` **Die Werte liegen je Tag vor** — `daily_summary` fuehrt 28
  Mikronaehrstoffe als Spalten. Ein Trend waere rechenbar.

  `[cmd]` **Was fehlt, ist die Referenz je Tag.**
  `daily_reference_assessment` rechnet **einen Tag auf einmal**; ein
  Trend ueber 30 Tage braeuchte 30 Aufrufe je Seitenaufruf.

  `[read]` **Zwei Wege:** eine Sammelfunktion in der Datenbank (die
  bessere), oder die Referenz einmal holen und ueber den Zeitraum
  konstant halten (die billigere — sie unterschlaegt aber, dass sich
  Profilwerte aendern koennen).

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du, mit Nutzer und Zeitraum** (`CLAUDE.md`).
`[cmd]` **Fuenf Konten haben Tagesdaten** — `dev`, drei Seed-Konten
mit je rund 180 Tagen, `test-user` mit einem.

`[cmd]` **Und `.limit()` hebt den PostgREST-Deckel nicht auf** —
1.000 Zeilen serverseitig, egal was angefragt wird. **Das hat G-249
fast einen Fehlbefund gekostet.**

### Der Anlass ist frisch

`[cmd]` **Der Nutrients-Reiter laedt bei 90 Tagen in 6,4 s kalt /
5,8 s warm.** `[read]` **Weil der Leseweg die Bewertung Tag fuer Tag
holt** — `daily_reference_assessment` rechnet einen Tag auf einmal.

`[read]` **Claude Code hat es selbst benannt:** *,,eine Reihenfunktion
in der Datenbank waere schneller, das ist Codex' Bereich."*

### Zu tun

**Eine Sammelfunktion, die einen Zeitraum auf einmal bewertet.**

`[read]` **Der Punkt nennt zwei Wege und bevorzugt diesen.** Der
billigere — die Referenz einmal holen und konstant halten —
**unterschlaegt, dass sich Profilwerte aendern koennen.** `[cmd]`
`daily_reference_assessment` liefert `profile_age_years`,
`profile_biological_sex`, `profile_is_pregnant`,
`profile_is_lactating` je Zeile. **Eine Schwangerschaft aendert die
Referenz mitten im Zeitraum.**

**Erst mitteln, dann bewerten** — das ist E-24 und gilt weiter.
`[read]` **Nicht: dreissig Tagesbewertungen mitteln.** Ein
Prozentwert-Durchschnitt ist etwas anderes als die Bewertung des
Durchschnitts, sobald sich die Referenz aendert.

### Was zu messen ist

    Laufzeit je Zeitfenster    heute / 7 / 14 / 30 / 45 / 60 / 90
                              vorher und nachher
    Ergebnisgleichheit        die Sammelfunktion muss fuer einen
                              Tag dasselbe liefern wie heute
    Profilwechsel im Zeitraum kommt er vor? wie oft?

`[read]` **Die zweite Zeile ist der eigentliche Nachweis.** Eine
schnellere Funktion, die andere Zahlen liefert, ist keine
Verbesserung — **und G-249 hat gerade gezeigt, wie leicht sich Zahlen
unbemerkt verschieben.**

### Was nicht zu tun ist

**Keine Referenzwerte aendern.**
**Die Einzeltagsfunktion nicht entfernen** — sie traegt den
Tagesmodus.
`apps/` nicht anfassen — Claude Code arbeitet dort an G-70.
Nicht committen, nicht stagen, nicht pushen.

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Wegwerf-Datenbank, nie gegen die laufende testen.**
**Vollsicherung vor jedem Live-Eingriff nach `backup/`.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
