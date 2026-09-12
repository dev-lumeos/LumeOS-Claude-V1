---
nr: E-81
getroffen: 2026-09-08
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-468, C-479, C-482, C-483]
modul: quer
---

# E-81 — parent_id fuer die Tiefe, Seite als Spalte

## Entscheidung

Tom, 2026-09-08:

> die trainings muessen bis auf die kleinsten muskeln
> runterbrechen koennen

    Tiefe        parent_id, KEINE Ebenenzahl
    Bedeutung    art: wurzel | gruppe | muskel | umriss
    Seite        eine SPALTE am Messwert,
                 keine eigene Flaechenzeile

## Warum keine feste Ebenenzahl

`[read]` **Wenn Training bis zum kleinsten Muskel runterbricht,
ist die Tiefe nicht vorhersehbar:**

    Chest > Pectoralis Major > Pars clavicularis      3
    Legs > Lower Legs > Calves > Gastrocnemius
                              > Caput mediale         5

`[cmd]` **Eine feste Zahl haette bei `Chest` *Ebene 2* fuer
*Muskel* bedeutet, bei `Legs` *Ebene 4*.**

`[read]` **Die Zahl saegt dann nicht mehr, WAS die Zeile ist** ?
**`art` tut das.**

`[cmd]` **`training.muscle_groups` fuehrt 95 Namen ohne
Ebenenfeld** ? **und hat heute vier Ebenen, ohne dass jemand
etwas anpassen musste.**

## Warum die Seite eine Spalte ist

`[read]` **Die Seite ist keine Eigenschaft des MUSKELS, sondern
der MESSUNG.**

`[read]` **Der Gastrocnemius existiert einmal** ? **dass er links
trainiert wurde, gehoert zum Satz.**

`[cmd]` **Heute: 26 Flaechen, 34 Seitenzeilen.**

`[cmd]` **Die Karte hat 43 Flaechen** (G-434) ? **bei
Aufschluesselung bis zum Muskelkopf waeren es hunderte, jede
doppelt.**

`[cmd]` **Und die openGym-Analyse nennt den Fall:** *,,unilaterale
Uebungen erhoehen Reps PRO SEITE"* ? **mit `seite` am Satz ist
das eine Spalte, keine zweite Zeile.**

## Was das aendert

    public.koerperflaechen
      ebene faellt weg
      34 Seitenzeilen fallen weg (68 -> 34)
      art bekommt 'kopf' als moeglichen Wert

    Tabellen mit Flaechenbezug bekommen `seite`
      user_injection_site_selections
      workout_sets (spaeter)
      und was folgt

`[cmd]` **Und `recovery` liest heute `koerperflaechen`** ? **es
muss die Seite aus dem Messwert nehmen.**

## Was NICHT entschieden ist

`[read]` **Wo die Muskelkater-Werte leben** ? `[cmd]` **C-462 hat
gemessen, dass sie in `checkins.soreness` und
`checkins.pain_areas` stehen.**

`[read]` **Ob dort eine Seite hinkommt, ist ein eigener Punkt.**
