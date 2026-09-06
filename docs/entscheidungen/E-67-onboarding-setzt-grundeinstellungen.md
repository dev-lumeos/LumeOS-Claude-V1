---
nr: E-67
getroffen: 2026-09-07
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [G-222, G-352, E-46, E-54]
modul: quer
---

# E-67 — das Onboarding setzt Grundeinstellungen, nicht Ziele

## Entscheidung

Tom, 2026-09-07:

> das onboarding setzt initial die prinzipiellen
> grundeinstellungen, die tiefgruendigen goals und organisatorische
> planner wie phase engine kommen in goals

## Was gilt

    Onboarding   Grundeinstellungen
                 profiles.nutrition_goal, Slots, Vorlieben
                 -- alles mit Vorgabe, alles ueberspringbar

    Goals        Zielwerte, Fortschritt, Termine
                 user_goals, goal_phases, goal_milestones
                 -- die Phasenplanung

`[read]` **Zwei verschiedene Tiefen:** **eine Grundeinstellung sagt
*wohin ungefaehr*, ein Ziel sagt *wieviel bis wann*.**

## Warum die Trennung traegt

`[cmd]` **Gemessen 2026-09-07 (G-352):**
**`profiles.nutrition_goal` ist die einzige Achse mit einem
Schreibweg.** `[cmd]` **`lib/goals/schreiben.ts` kann nur aendern,
nicht anlegen** — **und kennt weder `goal_type` noch `subtype`.**

`[read]` **Das Onboarding kann also ohnehin nur setzen, was
schreibbar ist.**

`[read]` **Und es soll nicht mehr wollen:** **wer sich anmeldet, hat
noch kein Zielgewicht mit Termin** — **er hat eine Richtung.**

## Die vier Achsen bleiben, mit klaren Rollen

    profiles.nutrition_goal   die Richtung, im Onboarding
    goal_type                 die Kategorie, in Goals
    subtype                   die Unterart, in Goals
    phase_type                die Zeitachse, in der Phase Engine
    difficulty_level          eine eigene Achse, in Goals

`[cmd]` **`subtype` bekommt einen CHECK** — **aber erst, wenn ein
Schreibweg existiert.**

Tom, 2026-09-07, zur Frage: *,,1 ok."*

`[read]` **Ein CHECK auf einer Spalte, die niemand fuellt, schuetzt
nichts und friert eine Liste ein, die noch waechst.**

## Und E-54 bleibt gueltig

`[cmd]` **`goal_phases` ist die Zeitachse** — **fuenf Zeilen, 14
Spalten, `expert_bb_annual` im CHECK vorgesehen** (C-383).

`[read]` **Die Phase Engine gehoert dorthin, nicht ins
Onboarding.**
