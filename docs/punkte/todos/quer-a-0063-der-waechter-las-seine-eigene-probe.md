---
nr: A-63
typ: befund
modul: quer
schwere: niedrig
angelegt: 2026-08-30
braucht: []
kind_von: A-62
entscheidung: null
beruehrt:
  dateien:
    - tools/abwesenheit-pruefen.mjs
zahlen:
  gemessen: 2026-08-30
  markierte_aussagen: 3
---

# A-63 — der Waechter las seine eigene Probe

## Befund

`[cmd]` **`tools/abwesenheit-pruefen.mjs` aus A-62 war rot, sobald er
im Gate stand** — **zweimal aus demselben Grund.**

**Erst ein Absturz.** `[cmd]` **Die Wirkungsprobe traegt
`@abwesend public\.user_inventory` in einem Regex-Literal.** `[read]`
**Das Muster bricht am `\` ab, `ziel` wird `public` ohne Punkt, und
`tabelleDa` laeuft auf `undefined`.**

**Dann ein falscher Befund.** `[cmd]` **Dieselbe Probe schreibt eine
Marke auf `supplements.stack_items`, damit der Waechter faellt** —
**genau das soll sie.** `[read]` **Der Waechter las seinen eigenen
Beweis als Aussage und meldete ihn.**

## Behoben

`[cmd]` **Zwei Orte uebersprungen:** die eigene Datei — sie traegt die
Formbeschreibung — **und `__tests__/`.**

`[cmd]` **Und eine Marke ohne Punkt gilt nicht als Marke** statt
abzustuerzen.

`[cmd]` **Gegenprobe:** sauber 0, Marke auf etwas Vorhandenes 1,
zurueck 0. `[cmd]` **1031 Tests gruen, seine Wirkungsprobe
inbegriffen.**

## Die Lehre

`[read]` **Ein Waechter, der seine eigene Dokumentation oder seine
eigene Probe liest, prueft nichts** — **G-186 zum dritten Mal, und
diesmal in einem Werkzeug, das genau gegen diese Klasse gebaut
wurde.**

`[read]` **Er hat es beim Bau nicht gesehen, weil er ihn ausserhalb
des Gates gepruaft hat.** `[cmd]` **Im Gate faellt er sofort auf.**
