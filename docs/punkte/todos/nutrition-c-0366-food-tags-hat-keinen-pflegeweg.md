---
nr: C-366
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-31
braucht: []
kind_von: G-226
entscheidung: null
beruehrt:
  tabellen: [nutrition.food_tags]
zahlen:
  gemessen: 2026-08-31
  zeilen: 30797
---

# C-366 — `food_tags` hat keinen Pflegeweg

## Befund

Aus G-226, Claude Code, 2026-08-31.

`[cmd]` **`nutrition.food_tags` traegt 30.797 Zeilen.** `[cmd]` **Es
gibt keinen Weg, sie zu aendern** — **kein Trigger, keine Funktion,
keine Oberflaeche.**

`[cmd]` **Und `auto_tag_food` existiert nicht** — **kein Trigger im
Nutrition-Schema schreibt Tags.**

`[read]` **Die 30.797 Zeilen stammen aus dem Import und sind seither
unangetastet.**

## Warum es zaehlt

`[cmd]` **Die Tags wirken:** E-22 fuehrt 14 Tag-Definitionen, und
`food_search` rankt danach. `[cmd]` **G-116 und E-30 haben gemessen,
dass ein einzelner Tag 162 Treffer entscheidet.**

`[read]` **Etwas, das die Suche steuert und niemand aendern kann, ist
ein Einbahnweg** — **wenn eine Zuordnung falsch ist, bleibt sie
falsch.**

## Zu klaeren

`[read]` **Wer pflegt Tags?** `[cmd]` **`apps/admin` hat eine
Kurationsseite mit 314 Zeilen** (A-36) — **ob sie Tags kennt, ist zu
messen.**

`[read]` **Und ob der Import sie ueberschreiben wuerde** —
**dieselbe Frage wie C-29 bei den Anzeigenamen, die dort geloest
ist.**
