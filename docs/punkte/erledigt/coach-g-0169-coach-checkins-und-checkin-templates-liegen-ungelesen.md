---
nr: G-169
typ: befund
modul: coach
schwere: mittel
angelegt: 2026-08-22
braucht: []
kind_von: G-158
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: 7a6e77a7
beruehrt:
  tabellen: ["coach.checkins"]
  dateien: []
zahlen: null
---

# G-169 - `coach.checkins` und `checkin_templates` liegen ungelesen

## Befund

(neu 2026-08-22). Aus G-158.

  `[cmd]` `checkins` 6, `checkin_templates` 2 — nach G-158 der
  billigste Treffer im Modul.

## Auftrag

**Mitbeauftragt mit G-151 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-09-02, mit G-151 abgenommen:** gemessen: ueberholt.

`[cmd]` **`checkin_templates` traegt 2, `checkins` 6 Zeilen.**
`[cmd]` **Beide werden in `apps/coach` und im V2-Leseweg abgefragt,
`template_id` verknuepft sie.**

`[read]` **Die Behauptung *liegen unbenutzt* gilt nicht mehr.**
