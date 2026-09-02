---
nr: G-338
typ: entscheidung
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: G-336
entscheidung: E-58
beruehrt:
  tabellen: [nutrition.meals]
zahlen:
  gemessen: 2026-09-02
---

# G-338 — eine freie Mahlzeit hat keinen Namen

## Befund

Aus G-336, Claude Code, 2026-09-02.

`[cmd]` **Nachgemessen: `nutrition.meals` traegt `notes`, nicht
`name`.**

`[read]` **Deshalb heisst das Feld im neuen Modal *Notiz*** — **der
Freitext geht nach `notes`.**

`[cmd]` **E-58: wer um 22:00 isst und keinen Slot dafuer hat, erfasst
trotzdem.**

`[read]` **Er kann es erfassen** — **aber nicht benennen.**

## Zu entscheiden

`[read]` **Braucht eine freie Mahlzeit einen eigenen Namen?**

`[read]` **Dafuer:** *,,Kino-Popcorn"* oder *,,Nachtschicht"* sagt
mehr als eine Uhrzeit. `[cmd]` **Und die Slots tragen Namen, also
kennt der Nutzer das Muster.**

`[read]` **Dagegen:** **die Zuordnung macht die Zeit** (E-58) —
**ein Name aendert daran nichts, und `notes` traegt schon Freitext.**

`[read]` **Ein dritter Weg: die Mahlzeit erzeugt einen Slot.**
`[cmd]` **Wer regelmaessig um 22:00 isst, haette dann ab dem zweiten
Mal einen** — **aber das waere eine Automatik, die niemand verlangt
hat.**
