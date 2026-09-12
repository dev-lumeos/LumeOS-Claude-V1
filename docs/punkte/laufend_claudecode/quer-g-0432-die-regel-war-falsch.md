---
nr: G-432
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-431
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - packages/ui/src/koerperkarte-pfade.ts
zahlen:
  gemessen: 2026-09-08
---

# G-432 — die Regel war falsch

## Toms Befund

Tom, 2026-09-08:

> quadrizeps ist eine muskelgruppe und hat x muskeln. was ist
> daran so schwer zu verstehen?

`[read]` **Er hat recht.** **Der Quadriceps femoris ist eine
GRUPPE:** **Rectus femoris, Vastus lateralis, medialis,
intermedius.**

## Was der Orchestrator falsch gemacht hat

`[cmd]` **G-425 formulierte die Regel:**

    EIN Muskel, mehrere Pfade     zusammenlassen

`[cmd]` **Mit der Begruendung:** *,,triceps hat drei Koepfe und
bleibt EIN Muskel."*

`[read]` **Das ist anatomisch falsch** ? **und der Orchestrator
hat es dreimal weitergereicht: G-425, C-468, G-431.**

`[cmd]` **G-431 hat daraufhin `quadriceps` und `calves`
zusammengelassen:**

> *,,Eine Masse mit zwei schmalen Raendern ? vier Koepfe, ein
> Muskel. Wer ihn teilt, teilt einen Muskel."*

`[read]` **Die Messung war richtig, das Urteil folgte einer
falschen Regel.**

## Was die Datenbank sagt

`[cmd]` **`training.muscle_groups`, gemessen:**

    Legs > Quadriceps > Rectus Femoris
    Legs > Hamstrings > Biceps Femoris
                      > Semimembranosus
                      > Semitendinosus
    Legs > Glutes     > Gluteus Maximus
                      > Gluteus Medius
                      > Gluteus Minimus
    Legs > Lower Legs > Calves
                      > Anterior Tibialis
                      > Tibialis Posterior
                      > Peroneals
    Arms > Triceps

`[read]` **Die Hierarchie ist DA und richtig** ? **niemand hat
sie gelesen.**

## Die richtige Frage

`[read]` **Nicht:** *,,ist das ein Muskel?"*

`[read]` **Sondern:** *,,welche EBENE der Hierarchie zeigt dieser
Pfad?"*

    ein Pfad zeigt eine Gruppe    -> die Gruppe ist die Flaeche,
                                     die Kinder sind Kinder
    ein Pfad zeigt einen Muskel   -> der Muskel ist die Flaeche
    mehrere Pfade zeigen denselben
      Muskel (Seiten, Segmente)   -> zusammenlassen

`[cmd]` **`abs` ist der Fall, wo Zusammenlassen richtig ist:**
**acht Pfade, ein Rectus abdominis je Seite, die Segmente sind
Sehnenzwischenstuecke.**

`[read]` **Sie haben KEINEN eigenen Namen in `muscle_groups`** ?
**das ist der Pruefstein.**

## Der Auftrag

**1** ? **Die zwoelf aus G-431 neu beurteilen, mit den Bildern
von dort.**

`[cmd]` **`docs/bilder/g431/` hat 38 Einzelbilder und 13
Tafeln** ? **nichts muss neu fotografiert werden.**

`[read]` **Je Flaeche: welche Ebene zeigen die Pfade?**

`[cmd]` **Und je Kandidat: fuehrt `muscle_groups` einen Namen
dafuer?**

`[read]` **Wenn nein** ? **zusammenlassen, wie `abs`.**
`[read]` **Wenn ja** ? **teilen, und die Gruppe wird der
Elternteil.**

**2** ? **`quadriceps` und `calves` neu ansehen.**

`[cmd]` **`Quadriceps` fuehrt nur `Rectus Femoris` als Kind** ?
**die drei Vastus fehlen in `muscle_groups`.**

`[read]` **Also: die Flaeche `quadriceps` bleibt, aber als
GRUPPE** ? **und wenn ein Pfad den Rectus femoris zeigt, wird er
sein Kind.**

`[cmd]` **`Lower Legs` fuehrt `Calves`, `Anterior Tibialis`,
`Tibialis Posterior`, `Peroneals`** ? **die Flaeche `calves`
ist ein KIND, nicht die Gruppe.**

**3** ? **Und die Regel berichtigen, wo sie steht.**

`[cmd]` **`docs/ssot/104-muskelkarte.md` und die Punktdateien
G-425, C-468, G-431 tragen sie.**

## Abnahmebedingungen

    A1  je der zwoelf: welche EBENE zeigen die Pfade?
        TABELLE mit Bild und muscle_groups-Name.
    A2  quadriceps und calves neu beurteilt.
    A3  wo geteilt wird: der Elternteil bleibt als Gruppe.
    A4  wo NICHT geteilt wird: weil muscle_groups keinen
        Namen fuehrt. Je Fall belegt.
    A5  die falsche Regel in der SSOT berichtigt.
    A6  vier Module unveraendert, je ein Foto.
    A7  apps/web 1642 oder mehr, apps/coach 65.

## Was nicht zu tun ist

**Keinen Muskelnamen erfinden** ? **die drei Vastus stehen nicht
in `muscle_groups`, also gibt es sie fuer LumeOS nicht.**

**Keinen Pfad neu zeichnen.**

**Nichts in `supabase/`** ? **C-481 liegt bei Codex.**

Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
