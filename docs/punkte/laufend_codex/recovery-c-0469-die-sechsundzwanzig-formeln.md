---
nr: C-469
typ: feature
modul: recovery
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [recovery.scores]
zahlen:
  gemessen: 2026-09-08
  fehlend: 26
---

# C-469 — die sechsundzwanzig Formeln

## Befund

`[cmd]` **`tools/vollstaendigkeit.mjs recovery`: 66 von 71.**

    FEHLT (Daten/Formeln)   26 Stueck

`[cmd]` **Darunter `ACWR_DATA`, `MAX_DAILY_BONUS`,
`MODALITY_BONUS`, `calcModalityBonus`,
`calcTrainingLoadScore`.**

`[read]` **Das Werkzeug misst NAMEN** ? **der Orchestrator hat an
einem Tag fuenfmal einen Namen geraten und lag jedes Mal
falsch.**

`[read]` **Also zuerst messen, ob die 26 wirklich fehlen.**

## Was recovery hat

    checkins              29 Spalten, 370 Zeilen
    scores                34 Spalten, 370
    modality_log          17 Spalten
    recovery_protocols    12
    stress_logs           12
    score_contributions   11
    overtraining_alerts   11

`[cmd]` **C-462 wurde als ueberholt geschlossen** ? **drei
vermeintlich fehlende Tabellen gab es unter anderem Namen, zwei
Messungen liegen in `checkins`.**

## Was zu messen ist

**1** ? **Welche der 26 sind Rechenwege, welche brauchen
Daten?**

**2** ? **Welche existieren unter anderem Namen?**

**3** ? **Wo gehoeren die Rechenwege hin?**

`[cmd]` **`packages/scoring/` traegt seit G-417 die
Nutrition-Formeln.**

`[cmd]` **`SPEC_09_SCORING.md:11` legt Coach-Formeln dorthin.**

**4** ? **Was sagt `docs/specs/Recovery/`?**

`[cmd]` **Und der Draft:**
`docs/spezifikation/10-plattform/design-system/theme-v1/`
? `module-recovery*.jsx`.

## Abnahmebedingungen

    A1  die 26 einzeln: existiert / Umbenennung / fehlt
        wirklich. TABELLE mit Fundstelle.
    A2  je fehlendem: Rechenweg oder Datenbedarf?
    A3  wo gehoeren die Rechenwege hin? Gemessen.
    A4  wenn eine Tabelle gebaut wird: Spalten mit
        Fundstelle aus Spec oder Draft.
    A5  die 370 scores und 370 checkins bleiben gueltig.
    A6  RLS beide Richtungen, anon ohne EXECUTE.
    A7  Sicherung, Vollkette, Punktelauf.

## Was nicht zu tun ist

**KEINE Formel erfinden** ? **was Spec und Draft nicht nennen,
wird gemeldet.**
**Keine Oberflaeche.**
**`apps/` und `packages/ui` nicht anfassen.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
