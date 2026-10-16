---
nr: G-644
typ: aufgabe
modul: goals
schwere: hoch
angelegt: 2026-10-10
agent: codex
beauftragt: 2026-10-16
erledigt: 2026-10-16
commit: fca2b3f0

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

## Auftrag - Kopf

    AUFTRAG FUER codex - G-650 Korrektur + G-644 Teil 1: Neuer Plan nach Entwurf
    Bereich: supabase/_pipeline/ (Kette). Live erst nach Freigabe.
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-16, HEAD d8c2e924

## Teil 1 committet - 2026-10-16, Commit `107da592` (nicht live)

`[read]` Fünf Dateien unter 11_goals/644_* und 650_plan_position_outlook.sql, dazu 2 Proben.
- `goal_programs_one_per_goal` entfällt. Es bleibt genau ein aktiver Plan je Nutzer.
- `goal_plan_create(uuid,text,text,date)` kommt neu dazu, ohne Vorgabewerte. Der Aufruf mit zwei Argumenten bleibt, die App läuft also weiter.
- Die Vorlagen `goal_plan_templates` entsprechen dem Entwurf (PhaseEngine.dc.html Z. 362/364):
  - Contest Prep 16 W: early 6, mid 7, late 2, Peak Week 1, Anker A
  - Expert BB Jahreszyklus: 8/20/4/12/8
  - Mini-Cut 4
  - Leerer Plan: Halten 4
- `early`, `mid` und `late` sind vorhandene Unterphasen von contest_prep. Codex hat keinen Katalogcode erfunden.
`[read]` Codex schlägt diese weiteren Vorlagen vor (Entscheidung offen):
- Lean Bulk → Mini Cut → Halten
- Conservative Cut → Reverse Diet → Halten
- Body Recomp → Halten
`[read]` Codex: G-644-Proben 15/15, Sabotage rot. Kette 409 grün, Turbo 21/21.
Offen:
- Live zusammen mit G-650 (Tom hat freigegeben, 16.10.)
- App-Anschluss in G-649 (Claude Code)
- Wachen, Wochenanpassung (G-627), Coach-Freigabe

## Teil 1 live - 2026-10-16

`[cmd]` Live gemessen:
- `goal_plan_templates` hat 4 Zeilen mit Quelle lumeos.
- `goal_plan_create` gibt es mit 2 und mit 4 Argumenten.
- dev hat genau 1 aktiven Plan.

Offen bleiben der App-Anschluss (G-649), die Wachen, die Wochenanpassung (G-627) und die Coach-Freigabe.

## App angeschlossen - 2026-10-16, Commit `62cf1bfb`

`[read]` Claude Code hat auf test-user bedient:
- Neuer Plan aus Mini-Cut
- Zwei Pläne an einem Ziel
- Als Vorlage speichern
- Position löschen
- Contest Prep rückwärts vom A-Termin 04.03.27

Danach zurückgebaut.

**Teil 2 noch offen** (in der App als "kommt (G-644)"):
- Leser für die Wachen der aktuellen Phase
- "Speichern und neu berechnen" für bestehende Positionen, mit Programmwechsel und Wochen −/+
- Abgeschlossene Pläne: "Neu starten" und "Löschen"
- Plantyp ("Einfacher Plan · aus Goals", "Contest Prep"): Die App zeigt "N Phasen", weil die Kette keinen Typ kennt
- Soll-Linie über dem Ziel: Laut Claude Code steigt sie auf 89,5 kg, obwohl das Ziel 88 kg ist. Sie muss am Zielwert enden.

## Teil 2 erledigt - 2026-10-16, Commit `fca2b3f0` (live)

`[read]` Codex, dev:
- Wachen: Kraftverlust ok (−3,7 %), Trend neben Soll ausgelöst (3 Wochen), Körperfett ok (16,18 / 18)
- Plantyp lesbar: prep, annual, einfach
- Programmwechsel und Wochen an einem Entwurf geprüft, A-Termin bleibt; Neustart und Löschen geprüft. Alles zurückgerollt; dev hat 5 Pläne, 18 Positionen, 5 Termine.
- Die Soll-Linie endet bei 88,000 kg, vorher 89,536.

Proben 5/5, Sabotage rot.
Abschluss: Die Wochenanpassung bleibt bei G-627. Die Coach-Freigabe kommt mit dem Coach-Modul (im Entwurf "Vom Coach · später").
