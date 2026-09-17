---
nr: G-471
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-470
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/components/shell/app-shell.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-471 - der Browserreiter stuerzt im Produktionsbau ab

## Befund

Aus G-470, Claude Code, 2026-09-08:

> *,,Der Browserreiter stuerzt auf `/v2/*` im Produktionsbau ab
? Serverprotokoll LEER, HTTP 200, voller Inhalt. Rein
clientseitig, war bisher vom `document`-Fehler VERDECKT."*

## Abnahmebedingungen

    A1  die Ausnahme im Browser, mit Stapel.
    A2  welche Routen betroffen? TABELLE.
    A3  behoben, und der Reiter bleibt stehen.
    A4  ein Waechter, der es faengt. Sabotageprobe.
    A5  Gegenprobe: der Dev-Server bleibt unveraendert,
        3200 und 3220 laufen weiter.
    A6  vier Module unveraendert.
    A7  apps/web 1830 oder mehr, apps/coach 65.
    A8  NIE .next loeschen, nie next build direkt.
        Nur pnpm gate oder
        pnpm --filter @lumeos/web build.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

