---
nr: C-409
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: C-408
entscheidung: E-65
beruehrt:
  tabellen: [nutrition.shopping_lists]
zahlen:
  gemessen: 2026-09-07
  checks: 2
---

# C-409 — `nutrition_reorder` ist unerreichbar

## Befund

Aus C-408, nachgemessen 2026-09-07.

`[cmd]` **Zwei CHECKs auf `shopping_lists.source_type`:**

    shopping_lists_source_target_check
      ... manual | supplement_reorder | nutrition_reorder ...

    shopping_lists_source_type_check
      source_type = ANY (ARRAY['manual', 'recipe', 'meal_plan',
                               'supplement_reorder'])

`[cmd]` **Der zweite kennt `nutrition_reorder` nicht.**

`[read]` **Beide muessen halten** — **also faellt jeder Versuch, eine
solche Liste anzulegen.**

`[cmd]` **Und es liegt keine im Bestand** — **der Weg wurde nie
begangen.**

## Warum es zaehlt

`[read]` **C-408 hat den Ursprung bewusst eingefuehrt:** *,,Neuer
eigener Listenursprung: `nutrition_reorder`."*

`[read]` **Er steht in einem CHECK und fehlt im anderen** — **die
Aenderung hat nur die Haelfte erwischt.**

`[read]` **Dieselbe Klasse wie ein CHECK-Wert ohne Schreibweg
(G-337)** — **nur umgekehrt: hier gibt es den Schreibweg, aber der
Wert wird abgelehnt.**

## Zu tun

`[read]` **Den zweiten CHECK nachziehen** — **und pruefen, ob es
weitere Stellen gibt, die die vier alten Werte aufzaehlen.**

`[cmd]` **Und eine Gegenprobe:** **eine `nutrition_reorder`-Liste
anlegen und wieder entfernen.**
