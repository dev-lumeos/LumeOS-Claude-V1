---
nr: G-474
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-473
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/next.config.js
zahlen:
  gemessen: 2026-09-08
---

# G-474 - der Absturz auf der Anstrichebene

## Stand aus G-473

    Route            1. Aufruf   2. Aufruf
    /login           200         TOT
    /dashboard       200         TOT
    /v2/dashboard    200         TOT
    Dev-Server: fuenfmal dieselbe Route, alle 200

`[cmd]` **Jede ZWEITE Navigation stirbt, egal wohin.**

`[cmd]` **Achtzehn Verdaechtige ausgeschlossen (sieben aus
G-471, elf aus G-473).**

> *,,Der Renderer wird BEENDET, ohne dass Javascript beteiligt
ist."*

## Der naechste Schritt, aus seinem Bericht

> *,,Der naechste Schritt gehoert auf die ANSTRICHEBENE ?
`--disable-gpu`, `--single-process` ? nicht zu weiteren
JS-Verdaechtigen."*

## Abnahmebedingungen

    A1  stirbt der Reiter mit --disable-gpu? Gemessen.
    A2  stirbt er mit --single-process? Gemessen.
    A3  wenn einer der beiden hilft: die Ursache
        benannt.
    A4  behoben, und der Reiter bleibt stehen.
    A5  eine /v2-Route im Produktionsbau, zweimal
        navigiert. Foto.
    A6  Gegenprobe: der Dev-Server bleibt unveraendert,
        3200 und 3220 laufen weiter.
    A7  vier Module unveraendert.
    A8  apps/web 1835 oder mehr, apps/coach 65.
    A9  NIE .next loeschen, nie next build direkt.
        Nur pnpm gate oder
        pnpm --filter @lumeos/web build.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

