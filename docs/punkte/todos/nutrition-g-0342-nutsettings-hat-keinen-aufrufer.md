---
nr: G-342
typ: befund
modul: nutrition
schwere: niedrig
angelegt: 2026-09-02
braucht: []
kind_von: G-339
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/modale.tsx
zahlen:
  gemessen: 2026-09-02
---

# G-342 — `nutsettings` hat keinen Aufrufer

## Befund

Aus G-339, Claude Code, 2026-09-02.

`[cmd]` **`nutsettings` hat keinen Aufrufer.** `[cmd]` **Der
`meal_schedule`-Block darin ist toter Code.**

`[read]` **Und er ist seit E-58 ueberholt:** **die Mahlzeitenstruktur
liegt in `meal_slots`, nicht in einem Einstellungsblock.**

## Zu entscheiden

`[read]` **Loeschen oder anschliessen?**

`[cmd]` **G-332 hat die Slotliste in Preferences gebaut, G-335 hat
sie in Settings angeschlossen** — **der Ort existiert.**

`[read]` **Ein zweiter Block waere ein zweiter Schreibweg** — **genau
das, was G-72 vermieden hat.**

`[read]` **A-59: geloescht, nicht auskommentiert.**
