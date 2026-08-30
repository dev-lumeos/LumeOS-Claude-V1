---
nr: C-351
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-08-30
braucht: []
kind_von: C-350
entscheidung: E-35
agent: codex
beauftragt: 2026-08-30
beruehrt:
  tabellen: [supplements.intake_logs, supplements.supplement_nutrients]
zahlen:
  gemessen: 2026-08-30
  intake_logs: 744
  supplement_nutrients: 17
  tagesfunktionen: 0
---

# C-351 — Supplements braucht eine Tagesbilanz

## Befund

**Entschieden in E-35.** Tom, 2026-08-30: *,,das ist fernab von jeder
spec und modullogik das tagesbilanzen nicht pro modul vorhanden sind
und wenn noetig fuer dashboard oder buddy summiert werden"*.

`[cmd]` **`supplements` fuehrt 744 Einnahmen und 17
Naehrstoffzuordnungen — und keine einzige Tagesfunktion.**

`[cmd]` **`nutrition.daily_summary` liest ausschliesslich
`meal_items`** und ist damit richtig gebaut. **Die Luecke ist die
Gegenseite.**

## Warum es zaehlt

`[cmd]` **Die Obergrenzen fuer Magnesium, Niacin und Folsaeure gelten
nur fuer Supplemente** (C-344). `[read]` **Ohne getrennte Summen kann
die Quellengeltung rechnerisch nicht wirken** — sie steht im Schema
und bleibt wirkungslos.

`[cmd]` **Codex hat es in C-350 gemessen:** die 88
Magnesium-Ueberschreitungen sind **keine nachgewiesenen
Supplementueberschreitungen.**

## Was vorher zu messen ist

`[cmd]` **Die Kette ist gebaut und leer:** von 360 Einnahmen
erreichen 90 einen Naehrstoffcode, **alle denselben** (C-323).
`[cmd]` **Und 2 von 4 Stack-Positionen auf `dev` haben kein
`supplement_id`** — ausgerechnet Magnesium und Vitamin D3.

`[read]` **Eine Tagesbilanz ueber eine leere Kette ist eine Tabelle
voller Nullen.** **Erst messen, was ueberhaupt ankommt.**

## Auftrag

**Mitbeauftragt mit C-163 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.
