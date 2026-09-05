---
nr: C-409
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: C-408
entscheidung: E-65
agent: codex
beauftragt: 2026-09-07
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

## Auftrag — der halbe CHECK und zwei Lesewege

**Mitbeauftragt: G-279, C-31.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · C-409 — `nutrition_reorder` ist unerreichbar

`[cmd]` **Zwei CHECKs auf `shopping_lists.source_type`:**

    shopping_lists_source_target_check   kennt nutrition_reorder
    shopping_lists_source_type_check     kennt ihn NICHT

`[read]` **Beide muessen halten** — **jeder Versuch faellt.**

`[cmd]` **Und es liegt keine Liste dieser Art im Bestand** — **der
Weg wurde nie begangen.**

`[read]` **Den zweiten CHECK nachziehen** — **und pruefen, ob weitere
Stellen die vier alten Werte aufzaehlen.**

`[read]` **Gegenprobe:** **eine `nutrition_reorder`-Liste anlegen und
wieder entfernen.**

### 2 · G-279 — der Leseweg fuer *haeufig erfasst*

`[cmd]` **Claude Code hat gemessen: 388 Posten in den Browser gegen
4 Zeilen aus einer Sicht** (E-52).

`[cmd]` **Und G-328 hat die Zaehlweise entschieden: Tage, nicht
Eintraege.** `[cmd]` **Olivenoel: 52 Eintraege an 30 Tagen.**

`[read]` **Bau die Sicht** — **haeufigste Position je Nutzer, in
Tagen gezaehlt.**

`[cmd]` **Und beachte G-348:** **manuelle Posten tragen keine
`food_id`** — **sie duerfen nicht still uebersprungen werden.**

`[read]` **Die Kachel selbst ist ein UI-Auftrag** — **melde, was sie
braucht.**

### 3 · C-31 — der Schreibweg fuer die Kuration

`[cmd]` **Du hast die drei Teile gemessen:** serverseitige
Admin-Mutation, Overlay-Upsert, Lesen ueber `food_tags_effective`.

`[cmd]` **Der dritte steht seit C-366.**

`[read]` **Bau die ersten beiden** — **die Oberflaeche ist ein
UI-Auftrag.**

`[cmd]` **`food_tags_kuriert` traegt `food_id`, `tag_code`,
`action`** — **`removed` ueberdeckt auch einen erneuten Import.**

### Was nicht zu tun ist

**Keine Datenlogik in `migrations/`.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    nutrition_reorder   Liste angelegt und entfernt, belegt
    weitere Stellen     gezaehlt
    Sicht               vier Zeilen statt 388 Posten, gemessen
    manuelle Posten     nicht uebersprungen, belegt
    Kuration            Admin-Mutation und Upsert, RLS in beide
                        Richtungen

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
