---
nr: C-490
typ: feature
modul: training
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-487
entscheidung: E-82
beruehrt:
  tabellen: [training.exercise_muscles]
zahlen:
  gemessen: 2026-09-08
  zuordnungen: 6588
---

# C-490 — der Faktor an der Zuordnung

## Die Entscheidung

`[cmd]` **E-82: der Faktor gehoert an die ZUORDNUNG, nicht an die
Rolle.**

`[cmd]` **Quelle:** **Pelland JC et al., *The Resistance Training
Dose Response*, Sports Med. 2026;56(2):481-505** ? **67 Studien,
2.058 Teilnehmer.**

> *,,Distinguishing between direct and indirect sets appears
> ESSENTIAL for predicting adaptations."*

`[cmd]` **`fractional` (indirekt = 0,5) hat den staerksten
Evidenzgrad fuer Hypertrophie, Bayes-Faktor 9,48 gegen
`total`.**

## Was heute dasteht

`[cmd]` **`training.exercise_muscles`:**

    exercise_id, muscle_group_id, role

`[cmd]` **`role`:** `primary` **3.053,** `secondary` **3.535.**

`[read]` **Zwei Stufen, keine Zahl.**

## Zu bauen

    faktor           numeric, Voreinstellung aus role
                       primary   -> 1.0
                       secondary -> 0.5
    source_id        woher der Faktor kommt
    evidence_class   A | B | C

`[cmd]` **`supplements.supplement_field_sources` fuehrt es je
Feld** ? **dieselbe Bauform.**

`[read]` **Und `role` BLEIBT** ? **als Etikett, nicht als
Rechengrundlage.**

## Warum eine Zahl und nicht zwei Stufen

`[read]` **Wenn eine Quelle spaeter sagt *,,Kniebeuge: Rectus
femoris 0,4"*, geht das** ? **ohne eine dritte Rolle zu
erfinden.**

`[cmd]` **E-82, Abschnitt 3:** **die Bauform traegt bessere Daten
schon, wenn sie kommen.**

## Was NICHT zu tun ist

**KEINEN Faktor je Uebung erfinden** ? **1,0 und 0,5 sind die
belegten Werte, alles andere braucht eine Quelle.**

**`role` nicht loeschen.**

## Abnahmebedingungen

    A1  faktor, source_id, evidence_class angelegt.
    A2  alle 6.588 Zeilen haben einen Faktor
        (1.0 oder 0.5 aus role).
    A3  die Quelle steht: Pelland et al. 2026,
        evidence_class A.
    A4  ein Waechter: kein Faktor ausser 1.0/0.5
        ohne source_id.
    A5  Struktur nach migrations/, Daten in _pipeline/.
    A6  Sicherung, Vollkette, Punktelauf.

## Berichtigt 2026-09-08 — belegt schlaegt Rueckfall

`[cmd]` **`docs/ssot/182` hat vier Quellen geprueft.**

`[read]` **Die 1,0/0,5 aus Pelland sind der RUECKFALL, nicht das
Ziel.**

### Belegte Zahlen gibt es

`[cmd]` **Bankdruecken, EMG:**

    Pectoralis major     0,95
    Anterior deltoid     0,79
    Triceps brachii      0,67

`[cmd]` **Brust, ACE, neun Uebungen auf die beste
normalisiert:** **Langhantel 1,00, Pec-Deck 0,98, Kabelzug
0,93.**

`[cmd]` **PMC7112217: sechs Beinmuskeln ueber drei Uebungen.**

`[read]` **Der Kunstgriff von ACE: sie normalisieren auf die
BESTE Uebung, nicht auf MVIC** ? **relative Anteile statt
%MVIC mit 30 Punkt Streuung.**

### Also zwei Klassen

    evidence_class A   aus einer EMG-Studie, source_id gesetzt
    evidence_class C   Rueckfall aus role: 1,0 / 0,5

`[read]` **Und die Kachel sagt, welche welche ist.**

### Wo die Zahlen liegen

    acefitness.org/certifiednewsarticle/
      je Muskelgruppe eine Studie mit Tabelle
    PMC (NCBI)
      Einzelstudien mit Mehrmuskelmessung
    PLOS One 2020, Kreuzheben
      systematische Uebersicht, sieben Studien

`[read]` **Fang mit den Uebungen an, die im Seed vorkommen** ?
**sechs Stueck.**
