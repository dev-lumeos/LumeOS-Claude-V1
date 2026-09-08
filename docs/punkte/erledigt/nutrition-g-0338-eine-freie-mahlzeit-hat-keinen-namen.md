---
nr: G-338
typ: entscheidung
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: G-336
entscheidung: E-58
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: b3bb6420
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

## Auftrag

**Mitbeauftragt mit G-17 am 2026-09-08.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-09-08, mit G-17 abgenommen: grundlos, gemessen.**

`[cmd]` **`nutrition.meals` hat keine Namensspalte.**
`[cmd]` **`meal_type` ist NOT NULL mit Sieben-Werte-CHECK.**

`[cmd]` **Am Schirm bietet das Formular elf Punkte** — **vier eigene
Slots mit Zeiten, sechs Kategorien** — **Vorgabe `slot:1`.**

`[read]` **Eine Mahlzeit kann nicht namenlos entstehen.**

`[cmd]` **Und *,,Sonstiges"* ist weg, G-336 hat es ersetzt.**
