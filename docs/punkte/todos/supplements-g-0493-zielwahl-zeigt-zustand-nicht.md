---
nr: G-493
typ: fehler
modul: supplements
schwere: niedrig
angelegt: 2026-09-08
braucht: []
kind_von: G-492
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-produkte.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-493 - die Zielwahl im Modal zeigt ihren Zustand nicht

## Befund

`[cmd]` **Im G-492-Modal: `In den Stack` und `Zu einer
Mahlzeit` sehen gleich aus, ob gewaehlt oder nicht.**

`[read]` **Welcher gewaehlt ist, zeigt nur das Formular
darunter.**

## Abnahmebedingungen

    A1  der gewaehlte Knopf ist als gewaehlt erkennbar.
        Foto beider Zustaende.
    A2  Kontraste gemessen.
    A3  bei einer Kapsel: nur ein Knopf, und er ist
        gewaehlt.
