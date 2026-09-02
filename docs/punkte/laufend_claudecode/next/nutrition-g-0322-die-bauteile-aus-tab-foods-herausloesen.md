---
nr: G-322
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: G-320
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-foods.tsx
zahlen:
  gemessen: 2026-09-02
  zeilen: 1060
  usestate_suche: 14
  usestate_reiter: 1
---

# G-322 — die Bauteile aus `tab-foods.tsx` herausloesen

## Befund

Aus G-320, Claude Code, 2026-09-02.

`[cmd]` **`tab-foods.tsx` exportiert genau ein Bauteil:
`NutritionFoodsTab`** — **den ganzen Reiter.**

`[cmd]` **Die neun inneren Teile sind privat:** `FilterChip`,
`SortKopf`, `DaumenKnoepfe` und sechs weitere.

`[cmd]` **14 von 15 `useState` sind reine Suchlogik, genau einer
(`erfassen`) ist reiterspezifisch.**

## Warum es zaehlt

`[read]` **Solange sie privat sind, baut jeder Aufrufer sie nach.**
`[cmd]` **G-320 hat den Hook geteilt und die Darstellung neu
gebaut** — **weil es keinen anderen Weg gab.**

`[read]` **Das ist ein Umbau von 1.060 Zeilen, kein Nebenbei.**
`[read]` **Und die Zahl 14 zu 1 sagt, dass es geht:** die Suchlogik
ist fast vollstaendig vom Reiter trennbar.

## Auftrag

**Vorbereitet mit G-72 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.
