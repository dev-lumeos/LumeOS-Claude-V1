---
nr: G-477
typ: fehler
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-474
entscheidung: null
beruehrt:
  dateien:
    - tools/schuss.mjs
zahlen:
  gemessen: 2026-09-08
---

# G-477 - Playwright ist anderthalb Jahre alt

## Befund

Aus G-474, Claude Code, 2026-09-08:

> *,,Playwright 1.41.2 bringt Chromium 121 von Anfang 2024."*

`[cmd]` **Chromium 121 stirbt im Produktionsbau, Chrome 150
und Edge 150 nicht.**

`[read]` **Vier Auftraege (G-471, G-473, G-474) und achtzehn
ausgeschlossene Verdaechtige gingen darauf zurueck.**

## Was zu tun ist

`[read]` **Anheben** ? **und messen, ob die Proben danach
noch gruen sind.**

`[cmd]` **`schuss.mjs` nutzt Playwright** ? **miss, ob es
bricht.**

`[read]` **Bis dahin gilt:** *,,wer im Produktionsbau misst,
nimmt `channel: chrome`"*.

## Abnahmebedingungen

    A1  Playwright angehoben, Fassung genannt.
    A2  schuss.mjs laeuft. Foto.
    A3  die Proben bleiben gruen.
    A4  der Produktionsbau ueberlebt zwei Navigationen
        mit der neuen Fassung.
    A5  vier Module unveraendert.
