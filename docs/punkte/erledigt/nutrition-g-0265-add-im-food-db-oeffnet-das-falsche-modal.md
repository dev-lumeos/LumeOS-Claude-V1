---
nr: G-265
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-29
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-29
erledigt: 2026-08-29
commit: 1a2032b0
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-foods.tsx
zahlen: null
---
# G-265 — Add im Food DB oeffnet das falsche Modal

## Befund

**Tom, 2026-08-29:** *,,food db +add falsches modal"*.

`[cmd]` **Der Food-DB-Reiter listet 4.970 Lebensmittel mit einem
`+ Add` je Zeile.**

`[read]` **Was das Modal zeigt und was es zeigen muesste, ist zu
messen** — Tom hat den Befund benannt, nicht beschrieben.

`[read]` **Naheliegend ist, dass es das Modal einer anderen Ansicht
oeffnet** — dieselbe Klasse wie die falsch verknuepften Detailtexte
aus C-336: **formal richtig verdrahtet, inhaltlich am falschen
Ort.**

## Auftrag

**Mitbeauftragt mit G-271 am 2026-08-29.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-08-29, mit G-271 abgenommen.**

`[cmd]` **Es war kein falsches Modal, sondern gar keins** — ein
`Link`, dessen Ziel `?food=` nie gelesen hat.

`[cmd]` **Behoben und nachgemessen: 3 Treffer, Lebensmittel
ausgewaehlt, 101 Naehrstoffe.**

`[read]` **Was `+ Add` sein muesste, steht als G-272 offen.**
