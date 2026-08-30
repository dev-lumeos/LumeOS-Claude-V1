---
nr: G-258
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-29
braucht: []
kind_von: G-254
entscheidung: E-29
agent: claudecode
beauftragt: 2026-08-30
beruehrt:
  tabellen: [coach.pending_actions]
zahlen: null
---

# G-258 — Pending actions im Tagebuch

## Befund

`[cmd]` **`coach.pending_actions` traegt Zeilen und eine Spalte
`module`** — die Tabelle ist modulueebergreifend gedacht.

`[read]` **Eine der sechs Kacheln aus G-254**, herausgeloest, weil
Tom sie am 2026-08-29 entschieden hat. **Die anderen fuenf bleiben
dort offen.**

## Entschieden: E-29

**Ueber eine Funktion, nicht direkt.**

`[cmd]` **Das Coach-Schema fuehrt drei Aenderungsprotokolle**, und
`client_permissions` / `client_autonomy` sagen, was ein Coach darf.
`[read]` **Ein direkter Lesezugriff umgeht beides und muesste die
Rechtelogik nachbauen** — ab dem zweiten Modul doppelt.

## Offen

`[read]` **Die Gegenrichtung:** wenn ein Modul eine offene
Coach-Aktion zeigt, kann der Nutzer sie vermutlich bestaetigen.
**Ein Schreibweg zurueck ist eine eigene Entscheidung** — er beruehrt
`confirmed_by` und die Protokolle.

## Auftrag

**Mitbeauftragt mit G-276 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.
