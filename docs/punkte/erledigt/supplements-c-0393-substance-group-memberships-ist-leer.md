---
nr: C-393
typ: befund
modul: supplements
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: C-391
entscheidung: null
agent: codex
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: f9db161b
beruehrt:
  tabellen: [supplements.supplement_groups]
zahlen:
  gemessen: 2026-09-02
  soll: 8
  ist: 0
---

# C-393 — `substance_group_memberships` ist leer

## Befund

Aus C-391, Codex, 2026-09-02, nebenbei gemessen.

`[cmd]` **Die Schema-Vollstaendigkeitspruefung bleibt rot:**
`supplements.substance_group_memberships` **traegt 0 statt 8.**

`[cmd]` **Nachgemessen: die Tabelle existiert gar nicht.**

`[read]` **Die Pruefung erwartet also eine Tabelle, die nie gebaut
wurde** — **nicht eine leere.**

`[read]` **Der Fehler ist nicht neu und gehoerte nicht zum
Auftrag** — **er wird seither bei jedem Lauf mitgemeldet.**

## Zu messen

`[read]` **Woher kommt die Sollzahl 8?** `[cmd]` **Und wer sollte die
Zeilen schreiben** — ein Kettenschritt, ein Seed, oder eine
Ableitung?

`[read]` **Solange die Pruefung rot bleibt, verdeckt sie neue
Fehler** — **dieselbe Klasse wie ein Gate, das immer rot ist.**


## Gemessen am 2026-09-02: die Sollzahl 8 stammt aus `wr_chelation_timing`.

`[cmd]` **327 und 327a sind der vorgesehene Tabellen- und
Schreibweg** — **auf `dev` nie eingespielt.**

`[read]` **Zu entscheiden: einspielen oder die Erwartung
zuruecknehmen.** **Der Punkt bleibt offen.**

## Auftrag

**Mitbeauftragt mit C-385 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-09-02, mit C-385 abgenommen: 8 von 8.**

`[cmd]` **`substance_group_memberships` traegt jetzt 8
Mitgliedschaften.**

`[cmd]` **C-327 mit einem deploybaren 327a ergaenzt** — **statt die
Erwartung zurueckzunehmen.**

`[read]` **Die rote Pruefung ist gruen, ohne dass jemand die Sollzahl
gesenkt hat.**
