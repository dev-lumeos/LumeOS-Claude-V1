---
nr: G-664
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-10-17
agent: codex
beauftragt: 2026-10-18
erledigt: 2026-10-18
commit: 9b173777

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

## Auftrag - Kopf

    AUFTRAG FUER codex - G-664 keine Zukunftsmessungen
    Bereich: siehe Auftrag vom 18.10.
    Fremd:   docs/ gehoert dem Orchestrator.
    Stand:   2026-10-18, HEAD b2594c1f

## Erledigt - 2026-10-18, Commit `9b173777`

`[read]` Codex:
- Die tägliche Kopie aus tom.seed endet am Kopiertag.
- Die betroffenen Messleser lesen nur noch bis heute.
- 29 Zukunftskopien auf dev gelöscht.
- Drei Trigger wurden beim ersten Live-Lauf neu angelegt. Die Definitionen sind identisch, die überflüssigen Befehle sind aus der Kette entfernt.

Sicherungen: `backup/a105-g664-*`.
`[cmd]` dev: Messungen nach heute: 0.

