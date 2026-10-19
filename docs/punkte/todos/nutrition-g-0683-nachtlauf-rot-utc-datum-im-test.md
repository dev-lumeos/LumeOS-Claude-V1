---
nr: G-683
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-10-19

braucht: []
kind_von: null

quellen:
  - backup/_manifests/kettenlauf-status.json

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/_validierung/nutrition-c413-test-user-seed.test.ts
---
# Der Nachtlauf vom 19.10. ist rot, weil ein Test das UTC-Datum nimmt

## Befund

`[cmd]` `kettenlauf-status.json`: Der Lauf am 19.10. lief von 04:00 bis 04:18 (1.078,8 s) und endete mit Status `failed`.
Rot war `nutrition-c413-test-user-seed.test.ts`, Test C-241: erwartet `2026-10-18`, bekommen `2026-10-19`.

`[cmd]` Zeile 75 vergleicht mit `new Date().toISOString().slice(0, 10)`, also mit dem UTC-Datum.
Um 04:00 in Bangkok ist es 21:00 UTC des Vortags. Der Seed schreibt aber das lokale Datum.
Der Test fällt deshalb in jedem Nachtlauf zwischen 00:00 und 07:00 Ortszeit.

## Was zu tun ist (Codex)

- Das Vergleichsdatum aus derselben Quelle nehmen wie der Seed, zum Beispiel `current_date` der Datenbank.
- Gegenprobe: Den Test mit einer Uhrzeit vor 07:00 Ortszeit laufen lassen, er muss grün bleiben.
- `rg` nach weiteren `toISOString().slice(0, 10)` in `_validierung` und melden.
