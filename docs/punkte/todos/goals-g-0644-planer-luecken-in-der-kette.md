---
nr: G-644
typ: aufgabe
modul: goals
schwere: hoch
angelegt: 2026-10-10

braucht: []
kind_von: G-629

quellen:
  - docs/spezifikation/goals-ziel-setzen/README.md
  - docs/punkte/laufend_claudecode/goals-g-0629-die-phase-engine-zeigt-plaene.md

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/11_goals
---

# Planer: Lücken in der Kette

## Befund

`[read]` Claude Code, G-629. Diese Teile stehen in der App als "kommt":
1. Vorlagen (LumeOS-Standard, eigene, vom Coach). Es fehlen Tabelle und Funktionen.
2. Zweiwege-Bestätigung durch den Coach (Contest Prep, Peak Week).
3. Eine geplante Position löschen.
4. "Wachen" der aktuellen Phase: Es gibt keinen Leser, der die Regeln auswertet.
5. Wöchentliche Anpassung mit Protokoll (Dossier 8.8). Gleiches Thema wie G-627.
6. Vom A-Termin rückwärts rechnen; ein Sperrtermin wird zur Diätpause.
7. "Speichern und neu berechnen" und "Als Vorlage speichern".
8. Vorschau für Custom/Expert (G-624).
9. Neuer Plan ohne neues Ziel: `goal_plan_create` verlangt ein Ziel ohne Plan.
10. Positionen aus dem Backfill tragen keine Rate.

## Was zu tun ist

Codex legt eine Reihenfolge vor. Mein Vorschlag: zuerst 3, 9 und 10 (klein, machen die Bedienung vollständig), dann 5 mit G-627, dann 6, dann 1 mit 7, zuletzt 2, 4 und 8. Zu 9 entscheidet Tom.

## Entschieden - 2026-10-16 08:21, Tom

"ja nach entwurf und allfaellig die ausgangspunkte erweitern falls wir mehr haben"

Es gilt `PhaseEngine.dc.html`. Neuer Plan heisst: Dialog mit Name und Ausgangspunkt, angelegt als Entwurf am steuernden Ziel, aktiv erst über "Aktivieren". Damit fällt "ein Plan je Ziel"; aktiv bleibt einer je Nutzer.

Ausgangspunkte laut Entwurf (Zeile 362):
- Contest Prep 16 Wochen (4 Stufen early/mid/late/Peak Week, rückwärts vom A-Termin)
- Expert BB Jahreszyklus 52 Wochen (Reverse Diet 8, Lean Bulk 20, Mini Cut 4, Lean Bulk 12, Halten 8)
- Mini-Cut-Block 4 Wochen
- Leerer Plan
- Eigene Vorlage
- Vom Coach (kommt)

Gibt der Katalog weitere sinnvolle Vorlagen her, kommen sie dazu (Tom).