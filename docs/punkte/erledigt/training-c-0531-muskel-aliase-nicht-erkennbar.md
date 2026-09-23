---
nr: C-531
typ: fehler
modul: training
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-530
entscheidung: null
erledigt: 2026-09-08
commit: 04ab0120
beruehrt:
  tabellen: [training.muscle_groups]
zahlen:
  gemessen: 2026-09-08
  aliase: 4
---

# C-531 - Muskel-Aliase sind nicht als Aliase erkennbar

## Befund

`[cmd]` **C-530 hat Doppelungen richtig zusammengefuehrt:**
`Upper Chest` **hat 0 Zuordnungen,** `Clavicular Head` **46.**

`[cmd]` **Aber der Knoten steht im Baum weiter als GESCHWISTER
von `Pectoralis Major`.**

`[cmd]` **Es gibt keine Aliastabelle fuer Muskeln** ? **die
*,,4 erhaltenen Aliaszeilen"* sind Knoten, die nichts als
Alias kennzeichnet.**

`[read]` **Wer den Baum liest ? ein Mensch, eine Auswahl, ein
Filter ? sieht vier Muskeln, die es nicht gibt.**

## Was zu klaeren ist

    a  eine Spalte alias_of in muscle_groups
    b  eine eigene Aliastabelle, wie
       supplement_aliases
    c  die Knoten in einen Status "abgeloest" setzen

`[read]` **Die Fremdschluessel verbieten das Loeschen** ?
**darum war die Zusammenfuehrung richtig.**

## Abnahmebedingungen

    A1  welche vier Knoten sind Aliase? Benannt.
    A2  sie sind als Aliase erkennbar. Bauform
        begruendet.
    A3  eine Baumabfrage zeigt sie nicht mehr als
        eigene Muskeln.
    A4  wer den alten Namen sucht, findet den neuen.
    A5  Sicherung, Vollkette, ALLE Waechter.

## Abnahme

**2026-09-08, Orchestrator. Gebaut ? NICHT live.**

`[cmd]` **`muscle_group_tree` und `search_muscle_groups` gibt
es in der laufenden Datenbank nicht.**

### Er hat die Bauform GEFUNDEN, nicht gebaut

> *,,Vorhandenes `canonical_muscle_group_id` (C-530), kein
zweiter Aliasbestand."*

`[cmd]` **Selbst nachgemessen: die Spalte steht, 4 von 112
gesetzt:**

    Upper Chest    -> Clavicular Head of Pectoralis Major
    Abductors      -> Hip Abductors
    Peroneals      -> Fibularis Muscles
    Hip Adductors  -> Adductors

`[read]` **Mein Punkt behauptete, nichts kennzeichne die
Aliase** ? **C-530 hatte die Spalte schon gesetzt, nur kein
Leseweg nutzte sie.**

`[read]` **Er hat drei Wege angeboten bekommen und einen
vierten gefunden: den, der schon da war.**

### Was er gebaut hat

`[cmd]` **`training.muscle_group_tree`: 108 kanonische Knoten,
0 Aliaszeilen sichtbar.**

`[cmd]` **`training.search_muscle_groups(text)`: alle vier
alten Namen fuehren zum kanonischen Muskel.**

`[read]` **A3 und A4 damit erfuellt: der Baum zeigt sie nicht
mehr, wer den alten Namen sucht, findet den neuen.**

`[cmd]` **RLS: `authenticated` liest, `anon` nichts,
`service_role` nur SELECT.**

**Abgenommen. Einspielen steht aus.**
