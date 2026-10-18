---
nr: G-668
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-10-18
agent: codex
beauftragt: 2026-10-18

braucht: []
kind_von: G-648

quellen:
  - supabase/_pipeline/11_goals/662_weekly_position_target.sql

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/11_goals
---
# Planlinie steht bei 88,0, das Wochensoll meldet weiter +0,21

## Befund

`[read]` Claude Code (18.10.): `soll_kg` steht seit 06.09. bei 88,0 (gedeckelt). `soll_delta_kg` meldet weiter +0,21 (G-662, Rate der Position). Auf dem Bildschirm widersprechen sich Linie und Wochensoll.

## Was zu tun ist (Codex)

- Die Bedeutung trennen und benennen: Die Planlinie zeigt den historischen Soll-Weg (gedeckelt). Das Wochensoll ist die Rate der laufenden Phase.
- Für den Verlauf zusätzlich die Soll-Linie ab heute liefern (heutiger Trend plus Raten), damit sie zum Wochensoll passt.
- Mit Claude Code abstimmen, welche Linie im Verlauf gezeichnet wird. Der Entwurf zeigt eine Soll-Linie, die zum Wochensoll passt.

## Auftrag - Kopf

    AUFTRAG FUER codex - Goals-Rest aus der Abnahme (Sammelauftrag 18.10.: G-667/668/669/670/646/525)
    Bereich: supabase/_pipeline/ (Kette, Testdaten), Live dev nach A-105
    Fremd:   docs/ gehoert dem Orchestrator.
    Stand:   2026-10-18, HEAD 4f45fd2d

