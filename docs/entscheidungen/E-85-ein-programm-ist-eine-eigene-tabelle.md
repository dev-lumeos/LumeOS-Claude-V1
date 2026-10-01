---
nr: E-85
titel: Ein Programm ist eine eigene Tabelle, die Teilphasen erben ein Verhaeltnis
entschieden: 2026-10-01
entscheider: Tom
betrifft: [G-560, G-562, G-544, G-540]
---

# E-85 — Ein Programm ist eine eigene Tabelle, die Teilphasen erben ein Verhaeltnis

## Die Entscheidung zu G-560

**Tom, 2026-10-01:** eigene Tabelle `goal_programs` mit Positionen.

`[read]` **Damit ist eine geplante Phase ein Datensatz, nicht eine
Rechnung.** Der Jahresplan ist ein Programm wie jedes andere, und eine
geplante Phase kann verschoben werden, bevor sie beginnt.

`[cmd]` **Warum die billigere Form ausfiel:** eine Ordnungsspalte an
`goal_phases` haette verlangt, dass eine geplante Phase offen und
unbegonnen existiert — und `uq_goal_phases_one_open` laesst je Nutzer
genau eine offene Phase zu. **„Offen" haette dann zwei Dinge geheissen.**

## Die Entscheidung zu G-562

**Tom, 2026-10-01:** *„ein user erwartet einen vorschlag, der soll aber
individuell von ihm editiert werden koennen"*.

Daraus zwei Teile:

**1. Der Vorschlag kommt aus einem Verhaeltnis, nicht aus Wochen.**
`[cmd]` Die Stufenwochen stehen nur in der ueberholten Quelle (0–4,
4–12, 12–18 — also 4, 8 und 6 Wochen). **Als Anteil gelesen sind das
22 % / 44 % / 33 %**, und das widerspricht v2.0 nicht: v2.0 nennt kein
Stufenfenster, sondern 16–20 Wochen fuer die ganze Vorbereitung.

    Gesamtdauer 16 Wochen  ->  4 / 7 / 5
    Gesamtdauer 20 Wochen  ->  4 / 9 / 7

`[read]` **Niemand behauptet damit absolute Wochen**, und der
Widerspruch aus G-545/A5 (Dokument C rechnet aus Start- und Ziel-KFA,
v2.0 nennt ein Fenster) muss dafuer nicht vorher geloest werden.

**2. Die editierten Zahlen liegen im Programm, nicht im Katalog.**
`[read]` Der Katalog traegt das Verhaeltnis fuer alle Nutzer, das
Programm die Wochen dieses einen — dieselbe Trennung wie bei der
Zielrate in E-83.

## Was daraus folgt

`[read]` **`sub_phases` bekommt `weeks` NICHT zurueck.** Was G-545
entfernt hat, bleibt entfernt; was fehlte, war nicht die Zahl, sondern
die Regel, aus der sie entsteht.

`[read]` **`anker.ts` rechnet weiter richtig** (G-544) — es bekommt
jetzt eine Quelle: Gesamtdauer mal Anteil, und danach die Werte des
Nutzers, wenn er sie geaendert hat.

## Was damit nicht entschieden ist

`[read]` **Die Form der Tabelle** — Spalten, ob eine Position eine Phase
referenziert oder beschreibt, wie ein laufendes Programm sich zur
laufenden Phase verhaelt. **Das ist Bau, und es gehoert Codex.**

`[read]` **Und der Widerspruch aus G-545/A5 bleibt offen** — er betrifft
die Gesamtdauer, nicht mehr die Stufen.
