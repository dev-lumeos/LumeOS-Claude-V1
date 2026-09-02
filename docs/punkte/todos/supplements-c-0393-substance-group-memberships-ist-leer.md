---
nr: C-393
typ: befund
modul: supplements
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: C-391
entscheidung: null
beruehrt:
  tabellen: [supplements.substance_groups]
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
