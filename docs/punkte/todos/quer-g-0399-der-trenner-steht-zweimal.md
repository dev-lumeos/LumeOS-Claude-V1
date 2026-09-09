---
nr: G-399
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-398
entscheidung: null
beruehrt:
  dateien:
    - packages/ui/src/index.ts
zahlen:
  gemessen: 2026-09-08
  fassungen: 2
  ungezaehlt: 11
---

# G-399 — der Trenner steht zweimal, und elf Karten zaehlt niemand

## Befund 1: zwei Fassungen desselben Trenners

Aus G-398, Claude Code, 2026-09-08:

> *,,Technisch waere der aus `apps/web` wiederverwendbar (haengt
> nur an `Pill`), aber er liegt in `apps/web/src/` und `apps/coach`
> hat dafuer keinen Alias. Der richtige Ort waere `packages/ui`."*

`[cmd]` **Jetzt steht er zweimal im Haus.**

`[read]` **Er hat es gemeldet statt `packages/ui` anzufassen** ?
**der Auftrag verbot es.**

`[read]` **Aber zwei Fassungen laufen auseinander** ? **das ist die
Erfahrung aus G-388 (*,,zwei Wahrheiten ueber dieselbe Figur"*).**

## Befund 2: elf ungezaehlte Karten

`[cmd]` **`tools/vollstaendigkeit.mjs`, `coach.dateien` fuehrt
sechs Vorlagen** ? **NICHT `module-coach-portal-v2.jsx` und
`-portal-workflows.jsx`.**

`[cmd]` **Elf `<Card>` darin, acht mit Titel.**

`[read]` **Nach G-398 ist klar, wohin sie gehoeren:** **beide sind
Portal, und der Portalzweig ist jetzt die Aufgabe von
`apps/coach`.**

`[read]` **Also gehoeren sie in `dateien`, nicht in
`bekanntOffen`** ? **umgekehrt als in G-397 vermutet.**

## Was zu tun ist

    1  den Trenner nach packages/ui,
       beide Anwendungen darauf umstellen
    2  die zwei Vorlagen in vollstaendigkeit.mjs aufnehmen
    3  pruefen, ob die elf Karten schon eine Referenz haben
       -- G-398 hat 44 gebaut, aus 62 benannten
