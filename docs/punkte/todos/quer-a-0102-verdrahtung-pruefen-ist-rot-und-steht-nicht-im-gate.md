---
nr: A-102
typ: fehler
modul: quer
schwere: niedrig
angelegt: 2026-10-05

braucht: []
kind_von: G-592

quellen:
  - docs/punkte/erledigt/nutrition-g-0592-die-hydration-zusammenfassung-hat-keinen-leser.md

beruehrt:
  tabellen: []
  dateien:
    - tools/verdrahtung-pruefen.mjs
---

# verdrahtung-pruefen ist rot und steht nicht im Gate

## Befund

`[read]` Claude Code, Bericht G-592: `tools/verdrahtung-pruefen.mjs`
meldet 26 Namen ohne Test, **auch in der HEAD-Fassung vor G-592**.
Das Werkzeug steht nicht im Gate - ein Waechter, der seit unbekannt
langer Zeit rot ist und den niemand sieht. Bestandsliste nach G-592: 53.

## Was zu tun ist

Die 26 Namen messen und je einordnen (Test fehlt, Name tot, Liste
veraltet). Danach entscheiden: ins Gate mit eingefrorenem Sollstand
(wie `punkte-pruefen`) oder loeschen. Ein roter Waechter ausserhalb des
Gates misst nichts.
