---
nr: C-366
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-31
braucht: []
kind_von: G-226
entscheidung: E-55
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

## Auftrag

**Mitbeauftragt mit G-296 am 2026-08-31.** Der Auftragstext
und der Bericht stehen dort.

## Bericht

Siehe [G-296](../quer-g-0296-das-globale-tsc-ist-rot-wegen-packages-ui.md#bericht):
Die Adminseite liest Tags bereits, hat aber keinen Schreibweg; der
Kettenlauf ersetzt verwaltete Tag-Codes ohne Herkunftsunterscheidung.

## Gemessen am 2026-08-31

`[cmd]` **Admin zeigt und filtert Tags, ist aber vollstaendig
lesend.**

`[cmd]` **Der Import ersetzt 12 Tag-Codes ohne
Herkunftsunterscheidung** — **eine Kuration waere nicht geschuetzt.**

`[read]` **Bei den Anzeigenamen ist dieselbe Frage geloest** (C-29):
der Kettenschritt liest `name_display_de` aus der Quelldatei und
laesst Kuratiertes stehen. **Bei den Tags fehlt das.**

## Entschieden: E-55, 2026-09-02

`[read]` **Der Pflegeweg entsteht als zweite Tabelle**,
`food_tags_kuriert` — dasselbe Muster wie C-29 bei den Namen.

`[cmd]` **Vorher wird gemessen, wer die 30.797 Zeilen schreibt**
(C-384).
