---
nr: G-609
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-07
agent: claudecode
beauftragt: 2026-10-07

braucht: [A-105]
kind_von: G-608

quellen:
  - docs/punkte/erledigt/goals-g-0608-die-stufenwochen-sind-im-programm-editierbar.md
  - docs/punkte/erledigt/quer-a-0105-der-live-nachzug-der-sieben-schritte.md

beruehrt:
  tabellen:
    - goals.goal_phases
  dateien:
    - apps/web/src/lib/goals/phasenziel-write.ts
    - apps/web/src/app/v2/goals/strategie-vorschau.tsx
---

# Die Strategie wird beim Phasenstart nicht durchgereicht

## Auftrag - Kopf

    AUFTRAG FUER Claude Code - G-609: der Phasenstart speichert die gewaehlte Strategie
    Bereich: apps/web/src/lib/goals, apps/web/src/app/v2/goals
    Fremd:   supabase/_pipeline/ (Codex). docs/ gehoert dem Orchestrator.
    Stand:   2026-10-07

## Befund

`[cmd]` Seit A-105 (07.10.) nimmt `goals.goal_phase_start` live 8 Argumente,
darunter `p_strategie_code` (G-558). `[read]` Claude Code, G-608: die App
reicht den Code nicht durch und meldet ,Strategie offen"; die Vermerke in
`phasenziel-write.ts` und `strategie-vorschau.tsx` beschreiben noch den
Stand vor A-105.

## Was zu tun ist

1. Messen: Signatur live, jeder Aufrufer in `apps/`, was die Vorschau heute
   zeigt (Bild vorher).
2. Die gewaehlte Strategie wird beim Phasenstart mitgegeben und landet in
   der Phase; ,Strategie offen" erscheint nur noch, wenn keine gewaehlt ist.
   Veraltete Vermerke berichtigen.
3. Schirmnachweis auf `test-user@lumeos.local`: Phase mit Strategie starten
   (G-604 beachten), neu laden, Strategie steht; Rueckbau.
4. Sabotage beidseitig, Gate gruen mit Testzahl. Kein Commit.
