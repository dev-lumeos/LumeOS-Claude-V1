---
nr: C-543
typ: feature
modul: training
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: E-90
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 89ad933a
beruehrt:
  tabellen: [training.exercise_muscles]
zahlen:
  gemessen: 2026-09-25
---

# C-543 - ein Muskel erbt die Uebungen seiner Eltern

## Die Frage

`[read]` **Wer `Vastus Lateralis` waehlt, soll die Uebungen
sehen, die am `Quadriceps` haengen.**

## Der Befund

`[cmd]` **Gemessen, 2026-09-08:**

    Ebene 1      4 Zuordnungen,  7 Muskeln
    Ebene 2  4.174,             31
    Ebene 3  2.300,             53
    Ebene 4    248,             21

    Legs               Ebene 1      0 Uebungen
    Quadriceps         Ebene 2    356
    Vastus Lateralis   Ebene 3      0   <- Sackgasse
    Pectoralis Major   Ebene 2    211
    Clavicular Head    Ebene 3     46

`[read]` **Nicht weil es keine Uebungen gibt** - **weil die
Zuordnung eine Ebene hoeher liegt.**

## Warum es keine Kuration braucht

`[read]` **Eine Uebung am `Quadriceps` belastet alle seine
Kinder** - **die Hierarchie IST die Antwort, sie muss nur nach
unten durchgereicht werden.**

`[cmd]` **Und aufwaerts gilt dasselbe: wer `Legs` waehlt, will
alles darunter.** **Heute: 0 Uebungen.**

## Was zu klaeren ist

    A  der faktor beim Erben: bleibt er, oder sinkt er?
       Eine Kniebeuge belastet den Quadriceps zu 1.00 --
       den Vastus intermedius auch?
    B  die Richtung: nach unten (Kind erbt) UND nach
       oben (Eltern sammeln)?
    C  Aliase: C-531 hat vier Knoten abgeloest -- sie
       duerfen nicht doppelt zaehlen.
    D  Laufzeit: 1.416 Uebungen x 112 Muskeln x 4 Ebenen.

`[read]` **Punkt A ist eine Entscheidung** - **MESSEN, was
sinnvoll ist, und VORLEGEN.**

## Abnahmebedingungen

    A1  Vastus Lateralis liefert Uebungen. Zahl.
    A2  Legs liefert Uebungen. Zahl.
    A3  keine Uebung doppelt, auch nicht ueber Aliase.
    A4  der geerbte faktor ist gekennzeichnet --
        geerbt ist nicht gemessen.
    A5  Laufzeit gemessen.
    A6  die 6.726 Zuordnungen unveraendert.
    A7  Sicherung, Vollkette, ALLE Waechter.

## Punkt A entschieden, 2026-09-08, Orchestrator

**Der geerbte faktor ist der des Elternteils, unveraendert -
aber gekennzeichnet als GEERBT.**

`[read]` **Einen Abschlag zu erfinden (*,,das Kind traegt
60 %"*) waere genau der Fehler, der in C-547 schon steht: eine
Zahl, die wie eine Messung aussieht.**

`[cmd]` **`evidence_class` traegt die Unterscheidung bereits:
A = gemessen, C = angenommen.** **Geerbt braucht eine eigene
Kennzeichnung, keine eigene Zahl.**

`[read]` **Wer spaeter misst, dass die Kniebeuge den Vastus
intermedius schwaecher belastet als den lateralis, setzt eine
ECHTE Zeile - und die schlaegt die geerbte.**

### Punkt B: beide Richtungen

`[cmd]` **`Legs` mit 0 Uebungen ist genauso falsch wie
`Vastus Lateralis` mit 0.**

### Und eine Auflage

`[read]` **Die 6.726 Zeilen bleiben unveraendert** - **die
Vererbung ist eine SICHT, keine Kopie.** **Sonst hat LumeOS
zweimal dieselbe Wahrheit.**

## Bericht, 2026-09-25, Codex

### Vier Quellen

`[read]` **Code:** Der produktive Leser
`apps/web/src/lib/training/uebungen-read.ts` sammelt fuer einen
gewaehlten Knoten nur dessen Nachfahren und liest danach die rohen
Zuordnungen. Ein Blatt sieht deshalb keine Zuordnung seines
Elternteils. Faktor und Evidenz liest der Weg nicht.

`[cmd]` **Daten:** 1.416 Uebungen, 112 Muskelknoten und 6.726
Zuordnungen. 108 Knoten sind kanonisch, vier sind die in C-531
abgeloesten Aliase; an den Aliasen haengt keine Zuordnung.

`[read]` **Spec und Mockup:** Die Training-Spec verlangt die
hierarchische Muskelauswahl. Das Mockup zeigt Muskeln an der
Uebung, aber weder eine zweite Faktorwahrheit noch eine Pflege
kopierter Zuordnungen.

`[read]` **Vorgaengerrepo:** Dort wurde flach nach einer
Muskel-ID gefiltert. Eine vererbte Relation oder eine belastbare
zweite Faktorquelle gibt es dort nicht.

### Gebaut

`[cmd]` **Neu ist die Sicht
`training.muscle_exercises_effective`.** Sie liefert genau eine
Zeile je kanonischem Zielmuskel und Uebung:

    direct                 echte Zuordnung am Zielmuskel
    inherited_ancestor     Kind erbt vom Vorfahren
    collected_descendant   Elternteil sammelt vom Nachfahren

`[read]` **Eine direkte Zuordnung schlaegt fuer dasselbe
Ziel-Muskel/Uebungs-Paar alle indirekten Beitraege.** Der Faktor
wird unveraendert uebernommen. `relation_kind`, `inherited`,
Quelle, Evidenzklasse und Hierarchiedistanz kennzeichnen, was
gemessen und was nur ueber die Hierarchie sichtbar ist.

`[cmd]` **Die Sicht waehlt keinen Faktor aus mehreren
Wahrheiten.** Vor dem Bau ergaben 5.196 Ziel/Uebungs-Paare mehr
als einen Beitrag; bei 950 davon widersprachen sich Rolle oder
Faktor. Deshalb bewahrt `contributions` alle tragenden Beitraege
als JSON, statt einen davon zu erraten.

`[cmd]` **Geaendert:**

    supabase/migrations/20260925100000_c543_muscle_exercise_inheritance.sql
    supabase/_pipeline/_validierung/training-c543-muscle-inheritance.test.ts
    supabase/_pipeline/kette.json

`[read]` **Keine Tabelle und keine der 6.726 Grundzeilen wurde
geaendert.** Die Sicht ist `security_invoker`, fuer `anon`
gesperrt und nur fuer `authenticated` und `service_role`
lesbar.

### Abnahmezahlen

`[cmd]` **In der aus der Vollkette gebauten Wegwerf-Datenbank:**

    effektive Zielmuskel/Uebungs-Paare          23.402
    doppelte Zielmuskel/Uebungs-Paare                0
    Beitraege insgesamt                         27.364
      direct                                     6.726
      inherited_ancestor                        13.115
      collected_descendant                       7.523

    Vastus Lateralis       vorher 0   jetzt 356
    Legs                   vorher 0   jetzt 613
    Pectoralis Major                  jetzt 252
    Clavicular Head                   jetzt 252

    Alias-Ziele                                  0
    Alias-Quellen                                0
    geaenderte Faktoren                          0
    Grundzuordnungen vorher/nachher         6.726 / 6.726

`[cmd]` **Warum 6.721 direkte Sichtzeilen, aber 6.726 direkte
Beitraege:** Fuenf Uebung/Muskel-Paare tragen zwei echte Rollen.
Die eine Ergebniszeile vermeidet die Dublette; beide echten
Zuordnungen bleiben in `contributions` erhalten.

### Laufzeit und Pruefung

`[cmd]` **`Legs`, der breiteste Gegencheck: 613 Ergebnisse,
1,401 ms Planung und 18,737 ms Ausfuehrung.** Gemessen mit
`EXPLAIN (ANALYZE)` in der Wegwerf-Datenbank.

`[test]` **TDD:** Der neue Test war vor der Migration mit 4/4
Pruefungen rot, danach 4/4 gruen. Die komplette Kette lief mit
273 Schritten und Exitcode 0; der fokussierte C-543-Test war auf
deren Ergebnis erneut 4/4 gruen.

`[cmd]` **Sicherungen vor dem Strukturtest:**

    backup/schema/20260925-c543-before.sql
    backup/schema/20260925013439_c43_vor_kettenlauf.sql

`[read]` **`apps/`, Dev-Server und Git-Historie wurden nicht
angefasst.**

## Abnahme

**2026-09-08, Orchestrator. Gebaut ? NICHT live.**

`[cmd]` **`training.muscle_exercises_effective` gibt es in der
laufenden Datenbank nicht.**

`[cmd]` **6.726 Grundzuordnungen unveraendert ? selbst
geprueft. Die Auflage ist eingehalten: eine SICHT, keine
Kopie.**

    Vastus Lateralis   0 -> 356
    Legs               0 -> 613
    23.402 eindeutige Paare, keine Dubletten
    Aliase zaehlen nicht doppelt
    Legs: 18,7 ms

`[read]` **Und die Herkunft ist gekennzeichnet** ? **geerbt ist
nicht gemessen, genau wie entschieden.**

**Abgenommen. Einspielen steht aus.**

## Nachtrag: LIVE eingespielt, 2026-09-08

`[cmd]` **Selbst nachgemessen:**

    Grundzuordnungen   6.726  (unveraendert)
    effektive Paare   23.402
    Vastus Lateralis     356  (vorher 0)
    Legs                 613  (vorher 0)
    Dubletten              0

`[read]` **Die Sackgasse ist weg, und die Grundzuordnungen
sind unangetastet** ? **eine Sicht, keine Kopie.**

