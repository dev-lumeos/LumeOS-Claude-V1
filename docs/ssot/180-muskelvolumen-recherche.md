# 180 — wie man Trainingsvolumen auf einzelne Muskeln bringt

**Recherchiert 2026-09-08** nach Toms Frage:

> vielleicht mal online recherchieren, ob es irgendwelche
> wissenschaftliche formeln gibt

## Die kurze Antwort

`[read]` **Es gibt KEINE Formel, die aus *,,Kniebeuge"* automatisch
Muskelanteile rechnet.**

`[read]` **Es gibt DREI Wege, und die Trainingswissenschaft hat
sich auf den dritten geeinigt.**

## Weg 1 — EMG je Uebung

`[cmd]` **Der Goldstandard: %MVIC, gemessen mit
Oberflaechen-Elektroden.**

`[cmd]` **Beispiel, JOSPT 2007:** **Gluteus medius 74 +- 30 %MVIC
bei der Seitbruecke, Gluteus maximus 56 +- 22 bei der
Vierfuessler-Streckung.**

`[cmd]` **Und eine systematische Uebersicht zum Kreuzheben
(PLOS One 2020) fand SIEBEN Studien mit %MVIC, drei mit
%peak-RMS, zwei in Mikrovolt, drei in %1RM** ?
*,,no unified criteria for the sEMG normalization method."*

### Warum das nicht traegt

`[read]` **Vier Probleme, alle belegt:**

**1** ? **Die Abdeckung.** `[read]` **Studien gibt es fuer
Grundzuege und Reha-Uebungen, nicht fuer 1.416 Katalogeintraege.**

**2** ? **Die Streuung.** `[cmd]` **74 +- 30 %MVIC** ? **die
Standardabweichung ist fast so gross wie die Haelfte des Werts.**

**3** ? **Die Normalisierung ist uneinheitlich** (PLOS One 2020)
? **Werte aus zwei Studien sind nicht vergleichbar.**

**4** ? **MVIC unterschaetzt** `[cmd]` **(Frontiers 2025):**
**bei Sprungbewegungen um 71 bis 140 Prozent** ? **Werte ueber
100 %MVIC sind moeglich.**

`[read]` **EMG sagt, WELCHE Uebung einen Muskel stark trifft** ?
**nicht, wie sich EIN Satz auf mehrere Muskeln aufteilt.**

## Weg 2 — biomechanische Simulation

`[cmd]` **OpenSim, AnyBody:** **inverse Kinematik plus statische
Optimierung, verteilt Gelenkmomente auf Muskelkraefte.**

`[cmd]` **Braucht:** **3D-Motion-Capture, Kraftmessplatten, ein
skaliertes Modell je Person.**

`[cmd]` **Eine OpenSim-Simulation dauert 15,5 s** (arXiv
2006.10618).

`[read]` **Fuer eine App unbrauchbar** ? **niemand traegt
Marker.**

## Weg 3 — fraktionierte Satzzaehlung

`[cmd]` **Pelland et al., Sports Medicine 2026, 56(2):481-505.**

`[cmd]` **67 Studien, 2.058 Teilnehmer.** **Drei Zaehlweisen
verglichen:**

    total       ein indirekter Satz zaehlt 1,0
    fractional  ein indirekter Satz zaehlt 0,5
    direct      ein indirekter Satz zaehlt 0,0

`[cmd]` **Ergebnis:** `fractional` **hat die staerkste Evidenz
fuer Hypertrophie (Bayes-Faktor 9,48 gegen `total`),**
`direct` **die staerkste fuer Kraft.**

> *,,Distinguishing between direct and indirect sets appears
> ESSENTIAL for predicting adaptations."*

### Wie es angewandt wird

`[cmd]` **Ein Satz Bankdruecken:**

    Brust        direkt     1,0
    Front-Delt   indirekt   0,5
    Trizeps      indirekt   0,5

`[cmd]` **Zehn Saetze Bankdruecken = 10 Brust, 5 Front-Delt,
5 Trizeps.**

`[read]` **Zwei Werte, nicht zwoelf** ? **`primary` und
`secondary`.**

## Was das fuer LumeOS heisst

`[cmd]` **`training.exercise_muscles` hat GENAU DAS:**

    role: primary    3.053
    role: secondary  3.535

`[read]` **Die Struktur ist richtig. Der Faktor fehlt.**

    primary    1,0
    secondary  0,5

`[cmd]` **Und die openGym-Analyse nannte 1,0 / 0,4 als Mangel** ?
**0,5 ist derselbe Ansatz, nur belegt.**

`[read]` **C-487 hat EMG-Studien als Quelle verlangt** ? **das
war zu hoch gegriffen.**

`[read]` **Die Quelle ist Pelland et al. 2026, eine Zahl, fuer
alle Uebungen.**

## Die drei Luecken, die bleiben

**1** ? **Die Rolle muss STIMMEN.**

`[cmd]` **3.331 Zuordnungen zeigen auf GRUPPEN
(`Hamstrings`), 1.105 auf WURZELN (`Legs`).**

`[read]` **Eine Kniebeuge mit `role: primary` auf `Legs` sagt
nichts** ? **sie muss auf Quadriceps, Glutes, Erector spinae
zeigen.**

`[read]` **Das ist die eigentliche Arbeit** ? **nicht der
Faktor.**

**2** ? **Muskelkoepfe bekommen keinen eigenen Wert.**

`[read]` **Kein Satzzaehlverfahren trennt Vastus lateralis von
medialis** ? **EMG kann es, die Satzzaehlung nicht.**

`[cmd]` **G-438 hat das Leihen gebaut** ? **`Wert von
Quadriceps`.**

`[read]` **Das ist die richtige Antwort, nicht eine
Notloesung.**

**3** ? **Die Naehe zum Muskelversagen.**

`[cmd]` **Pelland et al. zaehlen Saetze *,,near or to muscular
failure"*.**

`[cmd]` **`workout_sets` hat `rpe` und `rir`** ? **ein Satz mit
RIR 5 zaehlt nicht wie einer mit RIR 0.**

`[read]` **Miss, ob das in die Rechnung soll** ? **die
Meta-Analyse trennt es nicht.**

## Und die Volumenmarken

`[cmd]` **Israetel: MV, MEV, MAV, MRV** ? **Saetze je Muskel je
Woche.**

    MV    ~6 Saetze     erhaelt die Masse
    MEV   der Anfang    wo Wachstum beginnt
    MAV   der Bereich   bestes Verhaeltnis
    MRV   die Decke     was noch erholbar ist

`[read]` **Das ist die Anwendung der Zaehlung** ? **wenn LumeOS
je Muskel Saetze je Woche kennt, kann es gegen diese Marken
messen.**

`[cmd]` **RP Strength selbst zaehlt NUR direkte Saetze** ?
*,,rather than complex fractional calculations."*

`[read]` **Ein Widerspruch zur Meta-Analyse, der zu entscheiden
ist.**

## Die Quellen

    Pelland JC, Remmert JF, Robinson ZP, Hinson SR,
    Zourdos MC. The Resistance Training Dose Response:
    Meta-Regressions Exploring the Effects of Weekly Volume
    and Frequency on Muscle Hypertrophy and Strength Gains.
    Sports Med. 2026;56(2):481-505.
    PubMed 41343037

    Electromyographic activity in deadlift exercise and its
    variants. A systematic review. PLOS One 2020.
    10.1371/journal.pone.0229507

    Electromyographic Analysis of Core Trunk, Hip, and Thigh
    Muscles. JOSPT 2007. 10.2519/jospt.2007.2471

    Voluntary contractions underestimate peak muscle activity
    in drop jumps. PMC12152988

    OpenSim: a musculoskeletal modeling and simulation
    framework. PubMed 25893160

    Israetel M, Hoffmann J, Smith CW. Scientific Principles
    of Hypertrophy Training. (Volumenmarken)
