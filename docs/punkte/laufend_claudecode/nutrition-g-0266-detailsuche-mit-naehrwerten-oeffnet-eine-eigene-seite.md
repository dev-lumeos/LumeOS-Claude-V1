---
nr: G-266
typ: entscheidung
modul: nutrition
schwere: mittel
angelegt: 2026-08-29
braucht: []
kind_von: null
entscheidung: E-33
agent: claudecode
beauftragt: 2026-08-29
beruehrt:
  dateien: [apps/web/src/app/v2/nutrition/ansicht.tsx]
zahlen: null
---
# G-266 — Detailsuche mit Naehrwerten oeffnet eine eigene Seite

## Befund

**Tom, 2026-08-29:** *,,Detailsuche mit naehrwerten koennen wir
drinlassen, aber dann mit einen anstaendigen clickhandler, denn es
oeffnet eine eigene seite -> koennte man direkt da als pulldown
einbinden unter filters oder mach andere vorschlaege"*.

`[cmd]` **Der Verweis steht rechts ueber der Trefferliste im
Food-DB-Reiter** und fuehrt auf `/v2/nutrition/suche`.

## Die Entscheidung

**Bleibt es eine eigene Seite, oder wird es ein Ausklappbereich unter
den Filtern?**

`[read]` **Fuer den Ausklappbereich spricht:** der Nutzer verliert
seine Trefferliste nicht. `[cmd]` **Die Filterzeile traegt bereits
elf Kategorien und einen Filter-Knopf** — die Stelle ist da.

`[read]` **Dagegen spricht:** eine Detailsuche ueber 138 Naehrstoffe
ist keine Verfeinerung, sondern eine andere Suche. **Ein
Ausklappbereich, der eine halbe Seite fuellt, ist eine Seite mit
schlechterem Rahmen.**

`[read]` **Ein dritter Weg:** die eigene Seite behalten, **aber den
Zustand mitnehmen** — wer mit *,,reis"* im Feld hinueberwechselt,
findet es dort wieder.

## Auftrag

**Mitbeauftragt mit G-271 am 2026-08-29.** Der Auftragstext
und der Bericht stehen dort.

## Zwischenstand, 2026-08-29

**Aus G-271 gemessen:** drei Wege gemessen, Weg C bevorzugt (Seite behalten, Zustand mitnehmen) — Toms Entscheidung.
**Die Messung steht dort.**

## Auftrag

**Mitbeauftragt mit G-272 am 2026-08-29.** Der Auftragstext
und der Bericht stehen dort.
