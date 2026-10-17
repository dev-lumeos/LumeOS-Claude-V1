---
nr: G-662
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-10-17
agent: codex
beauftragt: 2026-10-17
erledigt: 2026-10-17
commit: c990485b

braucht: []
kind_von: G-627

quellen:
  - supabase/_pipeline/11_goals/627_weekly_adjustment_protocol.sql
  - docs/spezifikation/goals-ziel-setzen/entwurf/PhaseEngine.dc.html

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/11_goals/627_weekly_adjustment_protocol.sql
---
# Das Wochensoll ist 0, weil die Planlinie schon am Ziel gedeckelt ist

## Befund

`[read]` Codex (17.10.): Im Wochenprotokoll für dev ab 05.10. steht Soll Δ 0,000 kg. Grund: Die historische Planlinie hat 88 kg schon am 01.09. erreicht und ist dort gedeckelt (G-644 Teil 2, G-653).
`[read]` Im Entwurf zeigt die Wochentabelle Soll Δ +0,21, also die Rate der laufenden Phase. Wer hinter dem Plan liegt, hat in der laufenden Phase weiterhin ein Wochensoll.

## Was zu tun ist (Codex)

- Soll Δ je Woche ist die Rate der in dieser Woche laufenden Plan-Position (Lean Bulk 0,25 %/Wo ≈ +0,21 kg), nicht die Differenz der gedeckelten Linie.
- Die Lage (hinterher/voraus) bleibt an der Linie.
- Die Wache "3 Wochen hinter Soll" prüfen: Sie soll gegen dieses Wochensoll laufen.
- Das Protokoll für dev nachrechnen. Probe mit Sabotage.

## Auftrag - Kopf

    AUFTRAG FUER codex - G-662 Wochensoll aus der laufenden Plan-Position
    Bereich: supabase/_pipeline/ (Kette), Live dev/test-user nach A-105
    Fremd:   apps/, packages/, tools/, docs/
    Stand:   2026-10-17, HEAD 88f6307b

## Erledigt - 2026-10-17, Commit `c990485b` (live)

`[read]` Codex, dev:
- Soll Δ je Woche: +0,229 (ab 21.09.), +0,229 (ab 28.09.), +0,212 (ab 05.10.)
- Trend Δ dazu: +0,035, +0,033, +0,110

Die Lage bleibt "hinterher". Bei test-user ist das Soll leer, weil keine Planrate vorliegt. 42 Wochenzeilen wurden aktualisiert, die Wiederholung ändert 0. Sicherungen: `backup/a105-g662-*`.
`[cmd]` Gate grün beim Commit.
