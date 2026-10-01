---
nr: G-560
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-30

braucht: [G-536, G-538, G-544]
kind_von: G-544

quellen:
  - docs/punkte/erledigt/goals-g-0544-der-phase-reiter-zeigt-keine-zeitachse.md
  - docs/ssot/130-goals-bauordnung.md

beruehrt:
  tabellen:
    - goals.goal_phases
    - goals.goal_strategies
  dateien:
    - supabase/_pipeline/11_goals/
---

# Die Reihenfolge eines Programms ist nirgends speicherbar

## Der Befund

`[cmd]` **Claude Code hat G-544/A3 gemessen und gemeldet, dass es nicht
baubar ist:** `goals.goal_phases` hat **keine Ordnungsspalte**, und es
gibt **keine Kettentabelle**. Die Achse rechnet je Ziel EINE Strategie.

`[read]` **Der Jahresplan ist aber eine Folge von fuenf.**
`goal_strategies.expert_bb_annual.annual` traegt sie als Inhalt —
**aber es gibt keinen Ort, an dem die GEWAEHLTE Folge eines Nutzers
liegt.** `next` sagt, welche Folgephase erlaubt ist; das ist eine Regel,
keine Reihenfolge.

`[read]` **Damit ist Ebene 3 der Bauordnung — Terminierung — zur
Haelfte offen.** ,,Planen" nach Toms Definition heisst: Strategien in
Folge an ein Ziel haengen. Heute kann ein Nutzer **eine** Phase je Ziel
haben, und die naechste entsteht erst, wenn die vorige endet.

## Was zu entscheiden ist, bevor es beauftragbar wird

`[read]` **Drei Formen sind moeglich, und keine ist entschieden:**

1. eine Ordnungsspalte an `goal_phases` (`reihenfolge int`) — billig,
   aber eine geplante Phase muesste dann offen und unbegonnen
   existieren, was der CHECK aus G-538 heute verbietet
2. eine eigene Tabelle `goal_programs` mit Positionen — sauber, und der
   Jahresplan waere ein Programm wie jedes andere
3. die Folge nur als Vorschau rechnen, nichts speichern — dann ist der
   Jahresplan eine Anzeige und kein Plan

`[read]` **Die Wahl entscheidet, ob eine geplante Phase ein Datensatz
ist oder eine Rechnung.** Das gehoert vor den Auftrag, nicht in ihn.

---

## Entschieden — 2026-10-01, E-85

**Tom:** eigene Tabelle `goal_programs` mit Positionen. **Eine geplante
Phase ist ein Datensatz, nicht eine Rechnung.**

`[cmd]` **Die Ordnungsspalte fiel aus, weil `uq_goal_phases_one_open`
je Nutzer genau eine offene Phase zulaesst** — eine geplante, unbegonnene
Phase haette „offen" zweideutig gemacht.

`[read]` **Beauftragbar fuer Codex.** Die Form der Tabelle ist Bau, nicht
Entscheidung: Spalten, ob eine Position eine Phase referenziert oder
beschreibt, und wie ein laufendes Programm sich zur laufenden Phase
verhaelt.
