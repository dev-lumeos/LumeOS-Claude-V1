---
nr: G-473
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-471
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/components/shell/app-shell.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-473 - der Absturzpunkt im unverkleinerten Code

## Stand aus G-471

`[cmd]` **Die Bedingung ist eine UND-Verknuepfung:**

    angemeldeter Reiter  UND  /v2  UND  Produktionsbau

`[cmd]` **A1: KEINE Ausnahme, 0 Konsolenzeilen, Speicher 10 MB
und flach, `Inspector.targetCrashed` nach 1,5 s.**

`[cmd]` **`/dashboard`, `/nutrition`, `/training` leben,
`/v2` toetet. Der Dev-Server besteht alle fuenf Ziele.**

`[cmd]` **Sieben Verdaechtige ausgeschlossen:** `navigator.locks`,
`ResizeObserver`, `requestAnimationFrame`, Canvas/WebGL,
Speichermangel, kopfloser Betrieb, G-470.

## Und eine Berichtigung zu G-470

> *,,*Der Produktionsbau ist anmeldefaehig* gilt nur auf
HTTP-Ebene. Der BROWSER kommt nicht an."*

`[read]` **Meine G-470-Abnahme war zu weit** ? **HTTP 200 und
ein lebender Reiter sind zwei Sachen.**

## Abnahmebedingungen

    A1  der Absturzpunkt, im unverkleinerten Code.
    A2  behoben, und der Reiter bleibt stehen.
    A3  eine angemeldete /v2-Route im Produktionsbau,
        im BROWSER geoeffnet. Foto.
    A4  ein Waechter, der es faengt. Sabotageprobe.
    A5  Gegenprobe: der Dev-Server bleibt unveraendert,
        3200 und 3220 laufen weiter.
    A6  vier Module unveraendert.
    A7  apps/web 1831 oder mehr, apps/coach 65.
    A8  NIE .next loeschen, nie next build direkt.
        Nur pnpm gate oder
        pnpm --filter @lumeos/web build.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

