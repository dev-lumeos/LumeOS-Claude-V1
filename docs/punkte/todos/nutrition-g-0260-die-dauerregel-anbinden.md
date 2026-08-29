---
nr: G-260
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-29
braucht: [G-259]
kind_von: G-108
entscheidung: null
beruehrt:
  dateien: [apps/web/src/app/v2/nutrition/naehrstoff-ordnung-tab.tsx]
zahlen:
  gemessen: 2026-08-29
  flagvon_ms_90d: 1786
  reiter_warm_ms: 5906
---

# G-260 — die Dauerregel anbinden

## Befund

Aus G-108, Claude Code, 2026-08-29.

`[cmd]` **`flagVon` aus C-323 ist fertig, getestet und hat keinen
Aufrufer.** `[cmd]` **Es kostet 1.786 ms fuer 90 Tage, und der Reiter
braucht bereits 5.906 ms warm.**

`[read]` **Zusammen rund 7,7 Sekunden.** `[cmd]` **C-189 hat neun
Sekunden als Defekt behandelt.**

`[read]` **Deshalb absichtlich nicht angebunden** — eine
Verbesserung, die den Reiter unbenutzbar macht, ist keine.

## Warum es sich lohnt

`[cmd]` **Der `Auffaellig`-Filter liefert bei 7, 30 und 90 Tagen
dieselben zwoelf Codes.** `[read]` **Der Zeitraumwaehler aendert die
Zahlen, nicht die Auswahl** — genau das behebt die Dauerregel.

## Braucht zuerst

**G-259** — die Fensterlaufzeit. `[read]` **Solange der Reiter
5.906 ms braucht, ist jede Ergaenzung zu teuer.**
