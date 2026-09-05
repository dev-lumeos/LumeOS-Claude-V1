---
nr: G-348
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-343
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/lib/nutrition/vorschlags-lage.ts
zahlen:
  gemessen: 2026-09-07
---

# G-348 — `wieGestern` ueberspringt manuelle Posten

## Befund

Aus G-343, Claude Code, 2026-09-07.

`[cmd]` **`wieGestern` ueberspringt Posten ohne `food_id`.**

`[cmd]` **Seit G-340 ist der Fall erreichbar:** `food_source =
'manual'` **traegt weder `food_id` noch `custom_food_id`.**

`[read]` **Quick-Add hat einen Fall geschaffen, den eine aeltere
Funktion nicht kennt.**

## Warum es zaehlt

`[read]` **Wer gestern *450 kcal Restaurant* eingetragen hat, findet
es in *Wie gestern* nicht wieder** — **und merkt nicht, warum.**

`[cmd]` **Die Funktion ueberspringt still** — **sie meldet nichts.**

`[read]` **Dasselbe Muster wie bei den Waechtern in G-343:** **eine
Funktion, die einen neuen Fall nicht kennt, wird nicht rot** — **sie
laesst ihn aus.**

## Zu tun

`[read]` **Manuelle Posten mitnehmen.** `[cmd]` **Sie tragen
`food_name`, `amount_g` und `nutrients`** — **alles, was ein
Vorschlag braucht.**

`[read]` **Und pruefen, ob weitere Funktionen `food_id` als Pflicht
annehmen.** `[cmd]` **`custom_food_id` ist der dritte Fall** —
**`foods_custom` traegt 0 Zeilen, aber der Weg steht.**
