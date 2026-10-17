---
nr: G-664
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-10-17

braucht: []
kind_von: G-655

quellen:
  - supabase/_pipeline/_testdaten/eigenes-konto-fuellen.sql

beruehrt:
  tabellen:
    - goals.body_measurements
  dateien:
    - supabase/_pipeline/_testdaten/eigenes-konto-fuellen.sql
---
# Testdaten mit Messungen in der Zukunft

## Befund

`[cmd]` dev hat Gewichtszeilen bis zum 16.11.2026 mit source_detail "Kopie aus tom.seed@example.com". Sie wurden am 17.10. um 04:28 aktualisiert. Heute ist der 17.10.
Das Beitragsvertrag sieht `tag <= stichtag` vor (G-522 A3). Ob jeder Leser (Trend, Tempo, Lage, Wochenprotokoll) Zukunftswerte ausschliesst, ist nicht belegt.

## Was zu tun ist (Codex)

- Messen, welche Leser Zukunftswerte sehen.
- Die tägliche Kopie aus tom.seed legt keine Zeilen nach dem Kopiertag an.
- Bestehende Zukunftszeilen auf dev entfernen, nach A-105.
