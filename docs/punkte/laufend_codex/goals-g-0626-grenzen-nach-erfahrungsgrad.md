---
nr: G-626
typ: aufgabe
modul: goals
schwere: hoch
angelegt: 2026-10-08
agent: codex
beauftragt: 2026-10-08

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

