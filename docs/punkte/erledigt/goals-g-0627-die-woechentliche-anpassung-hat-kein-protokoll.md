---
nr: G-627
typ: aufgabe
modul: goals
schwere: mittel
angelegt: 2026-10-08
agent: codex
beauftragt: 2026-10-17
erledigt: 2026-10-17
commit: 342f78c7

braucht: [G-625]
kind_von: G-625

quellen:
  - docs/spezifikation/goals-ziel-setzen/README.md
  - docs/spezifikation/goals-ziel-setzen/dossier.html

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/11_goals/627_weekly_adjustment_protocol.sql
---

# Die wöchentliche Anpassung hat kein Protokoll

## Befund

`[read]` Tom 08.10.2026 12:16: „dieser stand ist fuer mich vertretbar kannst umsetzen“. Vorlage: `docs/spezifikation/goals-ziel-setzen/` (Dossier Kapitel 8/9 gilt vor dem Entwurf).

`[read]` Entwurf Phase engine: je Woche Trend Δ, Soll Δ, Logtage, Anpassung kcal, Grund (feste Regeln, keine KI). Heute ist „Weekly auto-adjustment“ eine Attrappe; eine Datenquelle für das Protokoll gibt es nicht `[annahme]` – Codex misst zuerst.

## Was zu tun ist (Codex)

Messen, was die adaptive TDEE-Rechnung je Woche schon festhält; fehlt ein Protokoll, eines anlegen (Woche, Trend, Soll, Logtage, Anpassung, Regel), lesbar je Plan.

## Regelquelle - Orchestrator 2026-10-17

`[read]` Codex: Dossier Kapitel 8/9 nennt nur Spalten, keine Schwellen.
`[cmd]` Die Regeln stehen in `docs/specs/Goals/SCORING.md` §6 `calcWeeklyAdjustment` (Z. 208-240):
- fat_loss: −100 bei Δ > −0,05 kg und Treue > 85 %, +150 bei < −1,0 kg, +20 g Protein bei Kraft < −10 %
- lean_bulk: −100 bei > 0,8 kg, +100 bei < 0,1 kg und Treue > 85 %
- reverse_diet: +100 je Woche, Stopp bei > 0,5 kg

`[cmd]` In `PHASE_MODELS.md` Z. 223-229 stehen leicht andere Werte (Lean Bulk 0,75 statt 0,8).
Aus dem Entwurf kommen zwei weitere Regeln: mindestens 5 Logtage, sonst keine Anpassung, und die Wache "Trend 3 Wochen neben Soll → ±100 kcal".
Entscheidung: SCORING §6 gilt als Rechenregel. Logtage und Wache gelten aus dem Entwurf. Widersprüche zu PHASE_MODELS werden gemeldet, nicht still aufgelöst.

## Auftrag - Kopf

    AUFTRAG FUER codex - G-627 Woechentliche Anpassung mit Protokoll (Regeln SCORING.md 6)
    Bereich: supabase/_pipeline/ (Kette), Live auf dev und test-user nach A-105
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-17, HEAD ea9f54f1

## Erledigt - 2026-10-17, Commit `342f78c7` (live)

`[read]` Codex:
- `goals.record_weekly_adjustments()` mit 15 Regelzeilen samt Quelle, 42 Wochen für zwei Pläne.
- Die Wiederholung ändert 0.
- dev, Woche ab 05.10.: Trend +0,110 kg, Soll 0,000, 7 Logtage, Treue 82,84 %, Empfehlung +100 kcal (Wache "3 Wochen hinter Soll").
- Die Empfehlung ist nur protokolliert, sie wird nicht auf die Phase geschrieben.

Sicherungen: `backup/a105-g627-*`.
Gemeldete Widersprüche:
- PHASE_MODELS nennt für Lean Bulk 0,75 statt 0,8 und für langsamen Fettverlust 0,1 statt 0,05.
- Der Entwurf zeigt +50, SCORING verlangt +100.

Es gilt SCORING.md §6, wie am 17.10. entschieden.
Folgebefund G-662: Das Soll Δ von 0,000 ist falsch.
