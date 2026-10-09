---
nr: G-611
typ: fehler
modul: goals
schwere: mittel
angelegt: 2026-10-07
agent: codex
beauftragt: 2026-10-09

braucht: []
kind_von: G-608

quellen:
  - docs/punkte/erledigt/goals-g-0608-die-stufenwochen-sind-im-programm-editierbar.md

beruehrt:
  tabellen:
    - goals.user_goals
  dateien: []
---

# Ein Ziel laesst sich nicht loeschen

## Befund

`[read]` Claude Code, G-608: es gibt in der App keinen Loeschweg fuer
Ziele - das Testziel musste per SQL entfernt werden. Ein Nutzer, der sich
vertippt oder ein Ziel aufgibt, kann es nur pausieren.

## Was zu klaeren ist

Messen, ob die Datenbank einen Loesch- oder Archivweg hat (Status,
Funktion, Kaskaden auf Phasen, Programme, Zielwerte, Snapshots), und
was das Mockup vorsieht. Danach entscheiden: echtes Loeschen oder
Archivieren mit Historie.

## Entschieden - 2026-10-08, Tom (Dossier 9, Fragen 1 und 2)

`[read]` Tom 08.10.2026 12:16: „dieser stand ist fuer mich vertretbar kannst umsetzen“. Vorlage: `docs/spezifikation/goals-ziel-setzen/` (Dossier Kapitel 8/9 gilt vor dem Entwurf).

Frist abgelaufen oder Ziel erreicht: das Ziel wird eingefroren (Status sichtbar, keine weitere Wertung), Details bleiben lesbar; Aktionen Neustart (neue Eingabe, vorbelegt) und Löschen. Ein eingefrorenes steuerndes Ziel heißt: Erhaltung mit Warnung (G-622). Dazu Archivieren für abgeschlossene Ziele. Löschen eines Ziels mit Verlauf: Bestätigung, Hinweis auf Beenden.

## Auftrag - Kopf

    AUFTRAG FUER Codex - G-611: Ziel einfrieren, archivieren, loeschen
    Bereich: supabase/_pipeline/ (Kette). Live erst nach Freigabe.
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-09, HEAD b2cfb4bb


## Kette committet - 2026-10-09, Commit `b1d2c0af`

`[cmd]` 5 Dateien nur in der Kette. Gelesen:
- `goal_state_at` und `goal_list_at` liefern den wirksamen Zustand am Stichtag. Gespeichert wird nichts, der Status bleibt.
- `berechne_zielwerte` liefert Hindernis `ziel_eingefroren`.
- Wächter `G611_BLOCK:ziel_eingefroren` auf Phase und Plan.
- `goal_archive`, `goal_restart` und `goal_delete(p_goal_id, p_confirm_history)` prüfen alle `auth.uid()`. Bei Verlauf ohne Bestätigung kommt `G611_CONFIRM:beenden_statt_loeschen`.
- FKs auf `ON DELETE CASCADE`.
- Die G-625-Probe ist datumsfest (`CURRENT_DATE` statt 2026-10-08).

Gate grün.

`[read]` Codex:
- 389 Schritte grün, G-611-Probe 5/5, Sabotage rot.
- Live würden zwei aktive Bankdrück-Messziele einfrieren (dev, tom.seed, Frist 18.08.2026).
- Bei der Kaskade zu beachten: 5 FKs auf `user_goals` und 3 auf `goal_phases`.

Live erst, wenn die App den Zustand kennt (`ziel_eingefroren`, `goal_state_at`): G-640. Zusammen mit G-638.