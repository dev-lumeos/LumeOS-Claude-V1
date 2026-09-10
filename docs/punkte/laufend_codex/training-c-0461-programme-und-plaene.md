---
nr: C-461
typ: feature
modul: training
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [training.exercises]
zahlen:
  gemessen: 2026-09-08
  uebungen: 1416
---

# C-461 — Programme und Plaene

## Befund

`[cmd]` **`training` hat acht Tabellen:**

    exercises          1.416
    exercise_muscles   6.588
    muscle_groups         95
    equipment             58
    workout_sessions      66
    workout_exercises    132
    workout_sets         258
    exercise_catalog_enrichment

`[cmd]` **KEINE Programm-, Plan- oder Routinentabelle.**

`[read]` **Der Katalog ist reich, die Protokolle laufen** ? **aber
ein Plan kann nirgends stehen.**

## Was das blockiert

    C-452   Marketplace verkauft Programme,
            sie kommen nirgends an
    Coach   "Program: PPL Woche 6/12" im Dashboard
            (SPEC_05:174)
    G-410   der Draft zeigt Plaene als Attrappe

`[read]` **Drei Module warten auf dieselbe Tabelle.**

## Was zu lesen ist

`[cmd]` **`docs/specs/Training/`** ? **die Spec zuerst.**

`[cmd]` **Und das Altrepo:**

    referenz/lumeos-2026/src/api/marketplace/routes/activate.ts
      Zeile 1: der Aktivierungsweg
      training_plans, training_plan_days,
      routines, routine_exercises

`[read]` **Vier Tabellen** ? **messen, ob diese Aufteilung
traegt.**

`[cmd]` **Und `docs/modules/training/DATABASE.md` im Altrepo.**

## Was gebaut wird

**1** ? **die Vorlage: ein Programm als Bauplan.**

`[read]` **Wochen, Tage, Uebungen, Saetze, Wiederholungen,
Gewicht oder Prozent.**

`[cmd]` **`SPEC_05:120` (Coach) nennt Bloecke:** *,,Woche 1-4:
Hypertrophy, Woche 5-8: Strength, Woche 9-12: Peaking."*

**2** ? **die Zuweisung: wer laeuft welches Programm, seit wann.**

`[cmd]` **`SPEC_01:99` (HumanCoach):** *,,Assignment = Vorschlag,
Client bestaetigt."*

`[read]` **Also: eine Zuweisung hat einen Zustand** ?
**vorgeschlagen, bestaetigt, laufend, beendet.**

**3** ? **die Verbindung zu `workout_sessions`.**

`[read]` **Eine Sitzung gehoert zu einem Programmtag** ? **oder zu
keinem, wenn frei trainiert wird.**

`[cmd]` **`workout_sessions` hat 66 Zeilen** ? **sie bleiben
gueltig, `NULL` ist erlaubt.**

**4** ? **Der Weg aus dem Marketplace.**

`[cmd]` **C-452, Codex' eigener Vorschlag:** *,,eine idempotente
Auslieferung mit einer fachmodul-eigenen Programm-ID."*

`[read]` **Die Programmtabelle muss eine Quelle tragen** ?
`self | coach | marketplace`.

## Was NICHT zu bauen ist

`[read]` **Keine Auslieferung aus dem Marketplace** ? **das ist
C-452 und folgt.**

`[read]` **Keine Coach-Zuweisung** ? **erst die Tabellen.**

`[cmd]` **Und die Wallet-Buchung bleibt unberuehrt** ? **dein
eigener Befund aus C-452: *,,nicht faelschlich eine externe
Auslieferung in dieselbe Transaktion pressen."***

## Abnahmebedingungen

    A1  die Spec gelesen: welche Tabellen nennt sie?
        Liste mit Fundstelle.
    A2  das Altrepo: vier Tabellen (training_plans,
        training_plan_days, routines, routine_exercises)
        -- traegt die Aufteilung? Gemessen.
    A3  die Tabellen gebaut. Je Tabelle: Spalten,
        Fremdschluessel, Indizes.
    A4  ein Programm angelegt, einem Nutzer zugewiesen,
        eine Sitzung daran gehaengt. ROLLBACK.
    A5  RLS je Tabelle, beide Richtungen. anon ohne
        EXECUTE auf neue Funktionen.
    A6  die 66 workout_sessions bleiben gueltig.
        Zahl vorher/nachher.
    A7  Sicherung, Vollkette, Punktelauf.

## Danach

`[read]` **C-462 (Recovery) und C-463 (Goals) folgen** ? **je
eigener Bericht.**
