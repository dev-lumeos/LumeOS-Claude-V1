---
nr: C-547
typ: befund
modul: training
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: E-90
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [training.exercise_muscles]
zahlen:
  gemessen: 2026-09-08
---

# C-547 - 6.723 Pauschalen sehen aus wie Messwerte

## Toms Vorgabe

Tom, 2026-09-08:

> darunter kennen wir seine einzelnen muskeln, wo wir wissen
> muessen wie prozentual die belastung ist

## Der Befund

`[cmd]` **Gemessen:**

    faktor                        Quelle           Klasse
    primary   1.00   3.155        pelland_2026     C
    secondary 0.50   3.568        pelland_2026     C
    primary   0.95       1        pmc4327372_emg   A
    secondary 0.67       1        pmc4327372_emg   A
    secondary 0.79       1        pmc4327372_emg   A

`[read]` **`faktor`, `source_id` und `evidence_class` sind
genau der Bauplan, den Tom beschreibt ? und DREI Zeilen
beweisen, dass er funktioniert.**

`[cmd]` **6.723 Zeilen tragen ZWEI Konstanten aus EINER Quelle,
Klasse C.**

`[read]` **Das ist keine prozentuale Belastung, das ist eine
Pauschale, die wie Daten aussieht.**

## Warum das zaehlt

`[read]` **Solange die Pauschale steht, sieht LumeOS aus, als
wuesste es die Belastung je Muskel.** **Wird sie ehrlich,
faellt auf, wie wenig belegt ist ? und genau das ist der
Zweck.**

`[cmd]` **`evidence_class` traegt die Unterscheidung schon:
A = gemessen, C = angenommen.**

## Zu messen, VOR dem Bauen

    A  fuer wie viele der 1.416 Uebungen gibt es
       ueberhaupt EMG-Belege?
    B  was sagt pelland_2026 wirklich? Eine Quelle,
       die 6.723 Zeilen traegt, sollte gelesen sein.
    C  reicht evidence_class, oder braucht es eine
       Spanne (0,4 bis 0,6)?
    D  was tut die Oberflaeche heute mit dem faktor?

`[read]` **MESSEN und EMPFEHLEN, keine Zahl erfinden.**

## Abnahmebedingungen

    A1  wie viele Uebungen haben EMG-Belege? Zahl.
    A2  was sagt pelland_2026? Gelesen, nicht zitiert.
    A3  Spanne oder Einzelwert? Empfohlen.
    A4  wer liest den faktor? Gemessen.
    A5  KEINE Umsetzung.

## Bericht, 2026-09-25, Codex

### Vier Quellen

- **Code:** Migration und Katalogdaten aus C-490, alle aktuellen
  Training-Leser, Datenbankfunktionen und Sichten wurden nach
  `faktor`, `source_id` und `evidence_class` durchsucht.
- **Daten:** Alle 6.726 Zuordnungen wurden live nur lesend nach
  Quelle, Evidenzklasse, Uebung und Faktor gruppiert.
- **Spec und Mockup:** Die Training-Spec beschreibt Muskelrollen,
  EMG und volumenbasierte Auswertungen; das Mockup zeigt Muskeln und
  Volumen, aber keinen angebundenen Faktorwert.
- **Vorgaengerrepo:** Es kennt Rollen und Muskelzuordnungen, aber
  weder belastbare Faktoren je Uebung/Muskel noch einen Leser dafuer.
  Die heutigen 1,00/0,50-Werte stammen erst aus C-490.

### A1 - wirkliche Abdeckung

| Evidenz | Zeilen | verschiedene Uebungen | verschiedene Muskeln |
|---|---:|---:|---:|
| Klasse A, `pmc4327372_bench_press_emg` | 3 | 1 | 3 |
| Klasse C, `pelland_2026_fractional_sets` | 6.723 | 1.410 | 85 |

Damit haben **1 von 1.416 Uebungen** EMG-belegte Faktoren:
`Barbell Bench Press` mit Pectoralis Major 0,95, Anterior Deltoid
0,79 und Triceps 0,67. 1.410 Uebungen tragen nur die Pauschale;
5 Uebungen haben ueberhaupt keine Muskelzuordnung.

### A2 - was Pelland 2026 wirklich sagt

Gelesen wurde die veroeffentlichte Meta-Analyse
[The Resistance Training Dose Response](https://pubmed.ncbi.nlm.nih.gov/41343037/)
(Sports Medicine 2026, DOI `10.1007/s40279-025-02344-w`) samt
[freiem Manuskript](https://sportrxiv.org/index.php/server/preprint/download/460/967/908).

Sie untersucht die Beziehung von **woechentlichem Satzvolumen und
Trainingsfrequenz** zu Hypertrophie und Kraft in 67 Studien mit
2.058 Teilnehmenden. Dafuer klassifizieren die Autoren Saetze relativ
zum jeweils gemessenen Outcome als direkt oder indirekt und
vergleichen drei Rechenweisen:

    total       direkt + indirekt voll
    fractional  direkt + indirekt * 0,5
    direct      nur direkt

Das Fractional-Modell passte die Meta-Regressionsdaten am besten.
Fuer Hypertrophie bedeutet *direkt*: Der gemessene Muskel ist
wahrscheinlich der primaere Krafterzeuger; *indirekt* bedeutet
sinnvoll beteiligter Synergist. Die Autoren schreiben zugleich, dass
die genaue Quantifizierung von Synergisten unklar bleibt und dass
ihre Direct/Indirect-Einordnung nicht vollstaendig objektiv war.

Der entscheidende Befund fuer LumeOS: **0,5 ist dort eine
Rechenkonvention fuer indirekte Saetze auf Studien- und
Wochenvolumenebene.** Es ist weder eine gemessene Aktivierung einer
konkreten Uebung noch der Beleg, dass jeder primaere Muskel 100 % und
jeder sekundaere Muskel 50 % Belastung erhaelt.

### A3 - Empfehlung zu Einzelwert und Spanne

Eine erfundene Spanne `0,4 bis 0,6` waere nur eine breitere erfundene
Zahl. Empfohlen wird stattdessen die semantische Trennung:

1. **Rollen-Regel:** `primary=1,0`, `secondary=0,5` bleibt, falls Tom
   sie nutzen will, als versionierte Rechenregel fuer fraktionale
   Satzvolumina mit Pelland als Modellquelle.
2. **Uebung/Muskel-Fakt:** Ein Faktor an einer konkreten Zuordnung
   existiert nur, wenn eine konkrete Quelle diese Uebung und diesen
   Muskel traegt. Ohne solche Quelle bleibt er offen.
3. **Unsicherheit:** Wenn eine Messquelle Konfidenzintervall,
   Streuung, Population, Last oder Messprotokoll nennt, werden diese
   Quellenangaben gespeichert. LumeOS erfindet keine Standardspanne.

`evidence_class=C` ist nuetzlich, reicht allein aber nicht: Ein
nicht-null Wert `0,50` wird von Lesern weiterhin wie eine konkrete
Zahl behandelt. Zusaetzlich braucht das Modell eine explizite Art wie
`measured` gegen `role_policy`, oder die Pauschale muss ganz aus der
Zuordnung in die Berechnungsregel wandern.

### A4 - heutige Leser

Vor C-543 gab es **keinen** produktiven Leser:

- `apps/` liest bei Uebungen nur Muskel-ID und Rolle, nicht den
  Faktor;
- keine Datenbanksicht und keine Funktion verwendete `faktor`;
- C-490/C-491/C-530 und ihre Tests schreiben, erhalten oder pruefen
  ihn lediglich;
- die Oberflaeche zeigt und berechnet damit nichts.

Die in demselben Arbeitsgang gebaute C-543-Sicht reicht den Faktor
jetzt **unveraendert und mit Herkunftskennzeichnung** in
`contributions` durch. Auch sie berechnet oder bewertet ihn nicht,
und `apps/` ist weiterhin nicht angebunden. Der heutige sichtbare
Produkteffekt bleibt daher null.

### A5 - keine Umsetzung

C-547 hat weder Faktorwerte noch Schema noch `apps/` veraendert. Die
empfohlene Trennung ist ein Folgeauftrag und braucht Toms
Modellentscheidung. Der Dev-Server wurde nicht beruehrt und es wurde
nicht committed.

## Abnahme

_(vom Orchestrator)_
