---
nr: G-377
typ: entscheidung
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-375
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
  bloecke: 11
  zeilen: 523
---

# G-377 — ein gemeinsames Bauteil fuer den Modulkopf

## Befund

Aus G-375, Claude Code, 2026-09-08.

`[cmd]` **11 Kopfbloecke, rund 523 Zeilen** — **alle setzen
dieselben vier bis fuenf Teile zusammen: Name, Untertitel,
Kennzahlen, Wechslerplatz, Aktionen.**

> *,,Genau deshalb driften sie ? elf Stellen, an denen man eine
> Klasse vergessen kann, und es ist zweimal passiert."*

`[cmd]` **Die zwei Male sind belegt:** **`medical` und `recovery`
hatten `hero-lite` nicht** — **und niemand merkte es, bis Tom
hinsah.**

## Der Aufwand

    ~80 Zeilen     das Bauteil
    30-45 Zeilen   je Modul ersetzt
    9 Vergleiche   Bildschirmfotos vorher/nachher
    settings       bleibt draussen, hat nie einen Kopf gehabt

`[cmd]` **In `apps/web`, nicht `packages/ui`** — **Admin und Coach
nutzen das gemeinsame Paket mit** (Lehre aus G-17).

## Was dafuer spricht

`[read]` **Eine Stelle statt elf** — **eine vergessene Klasse faellt
sofort auf.**

`[cmd]` **Und der Wechslerplatz waere dann ueberall gleich
gebaut** — **heute tragen ihn vier von neun.**

## Was dagegen spricht

`[read]` **Die Koepfe sind nicht gleich:** `[cmd]` **`goals` traegt
`v2-goals-phase-kopf`, `medical` einen Score-Kopf, `training` einen
Sitzungskopf.**

`[read]` **Ein Bauteil, das alle Faelle kann, ist kein Bauteil
mehr** — **es ist elf Faelle mit einem gemeinsamen Namen.**

`[read]` **Zu messen waere: wie viel ist wirklich gleich** —
**nicht wie viel sieht gleich aus.**
