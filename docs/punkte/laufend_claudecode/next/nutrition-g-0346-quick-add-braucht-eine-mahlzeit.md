---
nr: G-346
typ: entscheidung
modul: nutrition
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-340
entscheidung: E-58
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/modale.tsx
zahlen:
  gemessen: 2026-09-07
---

# G-346 — Quick-Add braucht eine Mahlzeit

## Befund

Aus G-340, Claude Code, 2026-09-07.

`[cmd]` **Der Quick-Add-Posten haengt an einer echten Mahlzeit,
nicht an einer Kategorie.**

`[read]` **Das heisst: fuer den Tag muss mindestens eine Mahlzeit
angelegt sein.** `[cmd]` **Das Modal sagt es.**

`[read]` **Er hat es gemeldet, statt einen Einstieg zu erfinden.**

## Warum es so gebaut ist

`[cmd]` **`meal_items.meal_id` ist Pflicht** — **ein Posten ohne
Mahlzeit gibt es nicht.**

`[read]` **Und E-58 sagt: die Zeit ordnet zu.** `[read]` **Ein
Posten ohne Mahlzeit haette keine Zeit und damit keinen Ort im
Tag.**

## Zu entscheiden

`[read]` **Soll Quick-Add die Mahlzeit selbst anlegen?**

`[read]` **Dafuer:** **wer schnell etwas eintraegt, will nicht erst
eine Mahlzeit anlegen.** `[cmd]` **Und seit G-336 gibt es das
Mahlzeiten-Modal** — **der Weg existiert, er ist nur ein zweiter
Schritt.**

`[read]` **Dagegen:** **eine automatisch angelegte Mahlzeit hat einen
Namen und eine Zeit, die niemand gewaehlt hat.** `[read]` **Die
naechstliegende Slot-Zeit waere der naheliegende Wert** — **aber
dann entstehen Mahlzeiten, die der Nutzer nicht erwartet.**

`[read]` **Ein dritter Weg: Quick-Add fragt nach der Zeit und legt
die Mahlzeit mit an** — **ein Schritt, zwei Wirkungen.**

## Auftrag

**Vorbereitet mit G-345 am 2026-09-07.** Der Auftragstext
und der Bericht stehen dort.
