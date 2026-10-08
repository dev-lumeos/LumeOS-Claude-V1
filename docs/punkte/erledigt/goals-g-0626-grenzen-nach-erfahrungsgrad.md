---
nr: G-626
typ: aufgabe
modul: goals
schwere: hoch
angelegt: 2026-10-08
agent: codex
beauftragt: 2026-10-08
erledigt: 2026-10-08
commit: 11cb4e44

braucht: []
kind_von: G-610

quellen:
  - docs/spezifikation/goals-ziel-setzen/README.md
  - docs/spezifikation/goals-ziel-setzen/dossier.html

beruehrt:
  tabellen:
    - goals.goal_strategies
  dateien: []
---

# Grenzen nach Erfahrungsgrad

## Entschieden - 2026-10-08 09:50 und 12:16, Tom

`[read]` Tom 08.10.2026 12:16: „dieser stand ist fuer mich vertretbar kannst umsetzen“. Vorlage: `docs/spezifikation/goals-ziel-setzen/` (Dossier Kapitel 8/9 gilt vor dem Entwurf).

Beginner: alles, was vom Standard abweicht, gesperrt. Advanced: stufenweise geöffnet, mit Warnung. Pro/Elite: nur Warnungen. Werte (Dossier 8.2):

| Grenze | Beginner | Advanced | Pro/Elite |
|---|---|---|---|
| Tempo/Woche | nur Standard (0,5 % ab / 0,3 % auf) | bis 0,75 % frei, 0,75–1 % Warnung, darüber Sperre | bis 1 % frei, darüber Warnung |
| Diätdauer am Stück | über 16 Wo Sperre | über 16 Warnung, über 20 Sperre | über 16 Warnung |
| Ziel-BMI | unter 18,5 Sperre | unter 18,5 Warnung, unter 17,5 Sperre | unter 18,5 Warnung |
| Kalorien | unter 1.500 ♂ / 1.200 ♀ Sperre | darunter Warnung, unter 1.300 / 1.000 Sperre | darunter Warnung |
| Fett (eigene Werte) | – | – | unter 0,5 g/kg Warnung |

Immer gesperrt: Zielgewicht gegen die Richtung. Systemregel: Protein wird nie gekürzt. Warnungen der Programme (`goal_strategies.warnings`) brauchen eine Bestätigung.

## Was zu tun ist (Codex)

Die Regeln als Daten (eine Tabelle, keine Liste im Code) und eine Prüffunktion, die für Grad + Eingaben (Richtung, Start, Ziel, Datum, Programm oder eigene Werte, Geschlecht, Größe) die Liste der Befunde mit Art (Sperre/Warnung), Text und Schlüssel liefert. Oberfläche und Schreibweg nutzen dieselbe Funktion; der Schreibweg weist Sperren ab und verlangt bestätigte Warnungen.

## Auftrag - Kopf

    AUFTRAG FUER Codex - G-626: Grenzen nach Erfahrungsgrad als Daten und Pruefung
    Bereich: supabase/_pipeline/ (Kette), danach Live nach Toms Freigabe
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-08


## Kette committet - 2026-10-08, Commit `11cb4e44`

`[cmd]` Gelesen: `goals.experience_goal_limits` mit vier Zeilen (beginner, advanced, pro, elite), Werte = Tabelle oben (advanced 0,75 frei / bis 1,0 Warnung / 16–20 Wo / BMI 18,5–17,5 / kcal 1.500–1.300 ♂, 1.200–1.000 ♀; pro/elite nur Warnungen, Fett 0,5 g/kg). Schreibschutz `g626_guard_controlling_phase`: `G626_BLOCK:` bei Sperre, `G626_CONFIRM:` bei unbestätigter Warnung, Bestätigungen in `parameters.g626_confirmed_warnings`. Gate grün.

`[read]` Codex: Kette 367, Proben 5/5, testdaten-pruefen 186/0, drei widersprüchliche `requirements.min_experience` entfernt. Der mehrphasige Planer ist noch nicht abgesichert -> G-625/G-629.

**Live nur zusammen mit G-628 Teil 2**: sonst weist der Schreibschutz Ziele mit Warnung ab, weil die Oberfläche noch keine Bestätigungen übergibt.


## Live - 2026-10-08 15:51, Codex (Paket A-105, Freigabe Tom)

`[cmd]` Eingespielt in dieser Reihenfolge: 613, 617 mit Backfill, 617-Erweiterung, 622 (beide Dateien), 626 (beide Dateien mit G-632-Texten); danach NOTIFY pgrst. Sicherung `backup/a105-paket-g626-vorher.sql` 1.252.413 Byte, `-nachher.sql` 1.317.811 Byte.

`[cmd]` Orchestrator nachgemessen: aktiv steuernd/messend dev 1/1, max.seed 0/1, test-user 1/0, tom.seed 1/1. `experience_goal_limits` 4 Zeilen. Trigger a617_goal_role_guard, a617_phase_role_sync, a617_program_role_sync, g626_guard_controlling_phase, g626_guard_controlling_goal_update vorhanden. Keine Funktion enthaelt mehr die Titelregel `bankdruecken`. `kein_aktives_ziel` steht in 2 Funktionen. Hex "Diät" in `ziel_grenzen_pruefen` = 44 69 C3 A4 74.

`[read]` Codex: 4/4 Bankdrueck-Ziele auf Barbell Bench Press. Waechter ohne Bestaetigung G626_CONFIRM, mit Bestaetigung angenommen, Probe zurueckgerollt. Ohne aktives Ziel: kein_aktives_ziel, zwei Werte maintenance_no_active_goal. pnpm gate gruen 18/18. Wegwerf-DB verworfen (23 -> 22).