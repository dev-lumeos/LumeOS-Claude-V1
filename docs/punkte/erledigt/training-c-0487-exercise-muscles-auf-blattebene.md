---
nr: C-487
typ: feature
modul: training
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: E-82
erledigt: 2026-09-08
commit: 0e8969e8
beruehrt:
  tabellen: [training.exercise_muscles]
zahlen:
  gemessen: 2026-09-08
  zuordnungen: 6588
  auf_blatt: 2152
---

# C-487 — exercise_muscles auf Blattebene

## Toms Vorgabe

Tom, 2026-09-08:

> wir bauen hier kein plauschzeugs, all diese berechnungen und
> daten sind bewiesen und werden angewandt, also recherchiere das
> und bilde es ab

`[read]` **Jede Zuordnung und jeder Anteil braucht eine
QUELLE** ? **keine Schaetzung, keine Plausibilitaet.**

## Der Befund

`[cmd]` **`training.exercise_muscles`: 6.588 Zuordnungen,
1.416 Uebungen.**

`[cmd]` **Auf welcher Ebene sie haengen:**

    Blatt    2.152    ein einzelner Muskel
    Gruppe   3.331    "Hamstrings", "Quadriceps"
    Wurzel   1.105    "Legs", "Arms"

`[read]` **Zwei Drittel zeigen NICHT auf einen Muskel.**

`[cmd]` **Und die Rollen:** `primary` **3.053,** `secondary`
**3.535** ? **zwei Stufen, kein Anteil.**

`[read]` **Eine Kniebeuge trainiert nicht *,,Legs"*** ? **sie
trainiert Quadriceps, Glutes, Erector spinae, Hamstrings, mit
verschiedenen Anteilen.**

## Was daran haengt

`[cmd]` **Die Muskelkarte zeigt 22 von 105 Muskeln mit Werten,
83 Luecken** (G-435).

`[read]` **Ein Muskel ohne Volumenzuordnung kann keinen Wert
haben** ? **die Luecke ist nicht in der Anzeige, sie ist in den
Daten.**

`[cmd]` **Und der Muskelkater: `checkins.soreness` traegt
`{"back": 1, "chest": 1}`** ? **zwei grobe Regionen, kein
Muskelname.**

`[read]` **Zwei verschiedene Luecken:**

    kein Volumen    keine Uebung zeigt auf diesen Muskel
    kein Kater      der Check-in kennt nur Regionen

## Der gemessene Mangel

`[cmd]` **Die openGym-Analyse, 2026-09-11, Abschnitt 06:**

> *,,Primaermuskel pauschal 1,0, Sekundaermuskel pauschal
> 0,4."*

`[read]` **Dasselbe hat LumeOS** ? `primary` **und** `secondary`
**ohne Anteil.**

`[cmd]` **Das Fremdprojekt bekommt dafuer 4/10.**

## Was zu recherchieren ist

`[read]` **Je Uebung: welche Muskeln, mit welchem Anteil ?
BELEGT.**

### Die Quellen

`[read]` **EMG-Studien sind der Goldstandard** ? **sie messen die
Aktivierung je Muskel in Prozent der maximalen willkuerlichen
Kontraktion (%MVIC).**

`[cmd]` **Bekannte Sammlungen:**

    ACE (American Council on Exercise)
      EMG-Studien je Uebungsgruppe, oeffentlich
    PubMed / PMC
      Einzelstudien, oft mit %MVIC-Tabellen
    Strength and Conditioning Journal
      Uebersichtsarbeiten

`[read]` **Und die Anatomie fuer die Zuordnung selbst:**

    NCBI Bookshelf (StatPearls)
      Ursprung, Ansatz, Funktion je Muskel
      -- Codex hat sie in C-482 schon benutzt

`[read]` **Was eine Uebung trainiert, folgt aus der BEWEGUNG:**
**wer die Funktion des Muskels kennt und die Bewegung der Uebung,
kann zuordnen** ? **aber der ANTEIL braucht eine Messung.**

### Was NICHT als Quelle gilt

`[read]` **Fitness-Webseiten, Trainingsapps, Foren.**

`[read]` **Und das Vorgaengerrepo** ? **`referenz/lumeos-2026/`:
Struktur ja, Werte nie.**

`[cmd]` **Die openGym-Analyse warnt:** *,,ein grosser Katalog ist
nicht automatisch eine gute Ontologie."*

## Was zu bauen ist

**1** ? **Die Zuordnung auf Blattebene.**

`[read]` **Wo heute `Legs` steht, stehen die Muskeln.**

`[cmd]` **1.105 Wurzel-Zuordnungen und 3.331 Gruppen-Zuordnungen
sind zu ersetzen** ? **nicht alle auf einmal.**

**2** ? **Der Anteil.**

    role                primary | secondary   (heute)
    activation_pct      %MVIC oder relativer Anteil
    source_id           die Studie
    evidence_class      A | B | C

`[cmd]` **`supplements` fuehrt `evidence_grade` und
`supplement_field_sources`** ? **dieselbe Bauform.**

**3** ? **Die Luecke bleibt sichtbar.**

`[read]` **Eine Uebung ohne belegte Anteile behaelt
`primary`/`secondary`** ? **und ein Merkmal sagt, dass der Anteil
geschaetzt ist.**

`[cmd]` **C-466 macht es so:** `unmapped_taken_log_count` **zaehlt,
was fehlt.**

## Die Reihenfolge

`[read]` **Nicht 1.416 Uebungen auf einmal.**

    1  die Grundzuege: Kniebeuge, Kreuzheben, Bankdruecken,
       Klimmzug, Schulterdruecken, Rudern
       -- dafuer gibt es die meisten Studien
    2  die Uebungen, die im Seed vorkommen
       (66 Sitzungen, 258 Saetze)
    3  der Rest, nach Haeufigkeit

`[cmd]` **Miss, welche Uebungen in `workout_sets` ueberhaupt
vorkommen** ? **258 Saetze, vermutlich zwanzig bis dreissig
Uebungen.**

`[read]` **Die zeigen sofort Wirkung auf der Karte.**

## Abnahmebedingungen

    A1  je Ebene die Zahl: wie viele Zuordnungen zeigen
        heute auf Wurzel, Gruppe, Blatt?
    A2  welche Uebungen kommen in workout_sets vor?
        Liste.
    A3  fuer diese Uebungen: die Muskeln mit Anteil,
        JE MIT QUELLE. Tabelle: Uebung, Muskel, Anteil,
        Studie, Evidenzklasse.
    A4  wo KEINE Quelle gefunden wurde: gemeldet,
        nicht geschaetzt.
    A5  die Spalten activation_pct, source_id,
        evidence_class.
    A6  ein Waechter: keine Zuordnung ohne Quelle,
        wenn activation_pct gesetzt ist.
    A7  wie viele der 83 Kartenluecken schliessen sich
        dadurch? Gemessen.
    A8  RLS, Rechte, Sicherung, Vollkette, Punktelauf.

## Was nicht zu tun ist

**KEINEN Anteil schaetzen** ? **Tom: *,,all diese berechnungen
und daten sind bewiesen und werden angewandt."***

**KEINE Uebung zuordnen, deren Bewegung unklar ist** ? **die
openGym-Analyse nennt `wind sprints` als `waist/abs` und
`assisted prone rectus femoris stretch` als `waist/abs` statt
Quadrizeps.**

`[read]` **Solche Faelle gibt es hier vermutlich auch** ?
**C-476 misst das.**

**Keine Oberflaeche.**

## Aufgeloest 2026-09-08 in C-490 und C-491

`[read]` **Die EMG-Forderung war zu hoch gegriffen.**

`[cmd]` **`docs/ssot/180` hat es recherchiert:** **EMG-Studien
gibt es fuer Grundzuege, nicht fuer 1.416 Uebungen** ? **und
`74 +- 30 %MVIC` ist als Faktor unbrauchbar.**

`[cmd]` **Die Trainingswissenschaft nimmt die fraktionierte
Satzzaehlung** (Pelland et al. 2026, 67 Studien): **direkt 1,0,
indirekt 0,5.**

`[read]` **Eine Zahl fuer alle Uebungen, mit Meta-Analyse
belegt.**

    C-490   der Faktor an der Zuordnung
    C-491   die Zuordnungen auf die richtige Ebene
