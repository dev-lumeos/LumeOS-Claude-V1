---
nr: G-661
typ: befund
modul: goals
schwere: hoch
angelegt: 2026-10-17
agent: codex
beauftragt: 2026-10-17
erledigt: 2026-10-17
commit: 342f78c7

braucht: []
kind_von: G-522

quellen:
  - supabase/_pipeline/11_goals/661_duplicate_daily_weight.sql

beruehrt:
  tabellen:
    - goals.body_measurements
  dateien:
    - supabase/_pipeline/11_goals/661_duplicate_daily_weight.sql
---
# Doppelte Tagesgewichte blockieren das Tagesziel

## Befund

`[cmd]` Am 17.10. hatte dev 12 Tage mit zwei Gewichtszeilen. `goals.berechne_zielwerte` verlangte genau eine Zeile und lieferte deshalb kcal null mit dem Grund "profil_unvollstaendig". Auf dem Bildschirm stand beim Tagesziel "—".
Die Nummer hat Codex beim Bau vergeben. Der Orchestrator hat den Punkt nachträglich angelegt.

## Auftrag - Kopf

    AUFTRAG FUER codex - G-661 doppelte Tagesgewichte (im G-660-Auftrag vom 17.10.)
    Bereich: supabase/_pipeline/ (Kette, Testdaten), Live dev nach A-105
    Fremd:   apps/, docs/
    Stand:   2026-10-17, HEAD ea9f54f1

## Erledigt - 2026-10-17, Commit `342f78c7` (live)

`[read]` Codex:
- Die Funktion verträgt jetzt mehrere Gewichtszeilen an einem Tag.
- Die Navy-Testmessungen stehen in der vorhandenen Tageszeile.
- Die Messung vom 09.10. (84,75 kg) blieb erhalten, die Navy-Zeile wich um 0,20 kg ab.

Sicherungen: `backup/a105-g661-*`.
`[cmd]` Doppelte Messtage in allen Konten: 0.
`[cmd]` Bild von dev (`.git/o-goals5.png`): Tagesziel 2.714 kcal · 170 g P.
