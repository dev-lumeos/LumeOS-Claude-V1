---
nr: C-423
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-365
entscheidung: E-72
beruehrt:
  tabellen: [supplements.stack_templates]
zahlen:
  gemessen: 2026-09-07
  zeilen: 0
  spalten: 14
---

# C-423 — `stack_templates` hat null Zeilen

## Befund

Aus G-365, Claude Code, 2026-09-07.

Tom, 2026-09-07: *,,supplements.stack_templates haben wir soviel ich
weiss noch nichts gemacht."* — **bestaetigt.**

`[cmd]` **Vierzehn Spalten, null Zeilen:**

    id, supplement_id
    name_de, name_en, name_th
    description_de, description_en, description_th
    goal, source, is_public, sort_order

`[cmd]` **Die Kachel *Vorlagen* ist deshalb leer, nicht kaputt.**

`[read]` **E-72: eine angebundene Kachel ohne Daten zeigt einen
benannten Leerhinweis, keine Null.**

## Was zu klaeren ist

`[read]` **Woher kommen die Vorlagen?**

`[cmd]` **`source` und `is_public` deuten auf zwei Herkuenfte** —
**Katalog und Nutzer.**

`[read]` **Ein oeffentlicher Stack ist Katalogmaterial** — **wie ein
kuratiertes Rezept** (C-411).

`[cmd]` **Und `goal` verbindet ihn mit den Zielen** — `goals.
user_goals` **traegt vier `goal_type`-Werte** (G-352).

`[read]` **Vor dem Fuellen: was ist eine Vorlage?** **Ein
vorgeschlagener Stack fuer ein Ziel, oder eine Sammlung, die ein
Nutzer teilt?**
