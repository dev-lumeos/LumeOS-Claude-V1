---
nr: E-44
getroffen: 2026-08-30
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-373, C-377, C-379, G-290]
modul: nutrition
---

# E-44 — drei Lebenszyklen fuer Plaene

## Warum diese Nummer erst jetzt entsteht

Aus B-20, Codex, 2026-09-01: *,,Der Verweis auf E-31 ist falsch —
E-31 betrifft Referenzbewertungen, nicht Meal-Plan-Lebenszyklen."*

`[cmd]` **E-31 ist *zwei Wahrheiten messen statt anbinden*, vom
29.08.**

`[read]` **Der Orchestrator hat den Lebenszyklus mehrfach als E-31
zitiert.** **Zweiter falscher Verweis an einem Tag — nach E-03 fuer
BLS.**

## Die Entscheidung

`[cmd]` **Getroffen am 30.08. beim Schemabau, dokumentiert im
`lifecycle_type`-CHECK:**

    once       endet nach der letzten Woche
    rollover   beginnt danach von vorn
    sequence   geht in einen Folgeplan ueber

`[cmd]` **Vorgabe `once`, Tageszahl 7.**

## Wie sie ausgefuehrt werden

`[cmd]` **C-373 und E-42, 31.08.:** **die Meldung beim Ablauf ist die
Ausfuehrung.**

`[read]` **Kein Zeitplaner, kein Hintergrundlauf.** **Der Plan
laeuft ab, der Nutzer bekommt eine Frage, und der Zyklus bestimmt den
Vorschlag:**

    once       der Vorschlag ist die Bibliothek
    rollover   der Vorschlag lautet "neu starten"
    sequence   der Vorschlag nennt den Folgeplan

`[cmd]` **`rollover` ist gebaut und belegt** — `rollover_count` 0 auf
1, Wochen verschoben (G-306).

## Was bei `sequence` offen ist

`[cmd]` **`next_plan_id` steht live, mit Ziel- und
Selbstreferenz-Constraint** (B-20, Codex).

`[cmd]` **Aber es gibt keinen Schreiber:** beide Web-Schreibschemata
lassen sie nicht zu, der Aktivierungsdialog bietet nur `once` und
`rollover`, **und live gibt es 0 `sequence`-Plaene.**

`[read]` **Die Spec fordert automatische Uebergabe, C-373 bevorzugt
die manuelle Auswahl.** `[read]` **Das ist ein offener Widerspruch —
er gehoert entschieden, bevor eine Kette gebaut wird.** **C-379.**
