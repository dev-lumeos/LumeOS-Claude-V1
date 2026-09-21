---
nr: C-528
typ: befund
modul: training
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [training.muscle_groups]
zahlen:
  gemessen: 2026-09-08
  muskeln: 105
---

# C-528 - die Muskelhierarchie ist unsauber

## Toms Anstoss

Tom, 2026-09-08:

> meine excel zeigt, dass die uebungen primary und secondary
> muskeln zeigen

> ich denke, wir brauchen eine komplette muskelhierarchie
> tabelle und dann muss diese mit uebungen/recovery/etc richtig
> hinterlegt werden und womoeglich angereichert werden

## Was schon da ist

`[cmd]` **Die Hierarchie EXISTIERT:**

    training.muscle_groups        105 Zeilen
      id, name, body_region, parent_id,
      display_order, name_display_en
      Ebene 1:  7   Arms, Back, Chest, Core, Legs,
                    Neck Muscles, Shoulders
      Ebene 2: 30
      Ebene 3: 51
      Ebene 4: 17

    training.exercise_muscles   6.744 Zeilen
      exercise_id, muscle_group_id, role, faktor,
      source_id, evidence_class
      primary 3.169 (faktor 1.00)
      secondary 3.575 (faktor 0.50)
      1.416 Uebungen, davon 1.411 mit Muskeln

`[read]` **Toms Excel-Klammern SIND die Hierarchie:**

    Legs -> Hamstrings -> Biceps Femoris,
                          Semitendinosus,
                          Semimembranosus

## Was daran haengt

    training.exercise_muscles.muscle_group_id
    training.muscle_groups.parent_id
    public.koerperflaechen.muscle_group_id
    training.exercise_muscle_resolution_notes
    training.muscle_group_level_decisions
    recovery.muscle_recovery_profiles  (105 Profile)

`[read]` **Sechs Fremdschluessel** ? **eine NEUE Tabelle waere
teuer und loest nichts. Die Struktur ist richtig.**

`[cmd]` **Und zwei Tabellen heissen `resolution_notes` und
`level_decisions`** ? **jemand hat schon einmal aufgeraeumt.
LIES sie, bevor du misst.**

## Was unsauber ist

### Drei Namen fuer dasselbe Verhaeltnis

    Legs -> Abductors
    Legs -> Hip Abductors  -> Outer Thigh,
                              Tensor Fasciae Latae
    Legs -> Adductors      -> Hip Adductors,
                              Inner Thigh,
                              adductor brevis/magnus,
                              Adductor Longus

`[read]` **`Hip Adductors` ist KIND von `Adductors`,
`Hip Abductors` ist GESCHWISTER von `Abductors`** ? **zwei
Bauformen fuer dasselbe.**

### Alte und neue Bezeichnung nebeneinander

    Lower Legs -> Peroneals
    Lower Legs -> Fibularis Muscles
    Lower Legs -> Peroneus Brevis

`[read]` **`Peroneus` ist die alte Bezeichnung, `Fibularis`
die heutige** ? **derselbe Muskel.**

### Eltern, die Geschwister sein sollten

    Lower Legs -> Tibialis
    Lower Legs -> Tibialis Posterior
    Lower Legs -> Anterior Tibialis

`[read]` **Zwei davon sind Kinder des ersten.**

### Und zwei Sammelnamen

    Legs -> Thighs
    Legs -> Upper Legs

## Die Zeichnung hat Luecken

`[cmd]` **`public.koerperflaechen`: 51 Flaechen, davon 33 mit
Muskel** ? **18 ohne.**

`[cmd]` **Das ist G-447, ein alter Befund.**

## Zu messen

    A  welche Namen meinen DASSELBE? Je Paar ein
       Beleg -- anatomische Quelle, nicht geraten.
    B  welche Eltern sind falsch? Je Fall eine
       Begruendung.
    C  was sagen resolution_notes und
       level_decisions? Gelesen.
    D  wenn zwei Namen zusammengefuehrt werden:
       wie viele exercise_muscles-Zeilen betrifft es?
       Zaehlt die Belastung heute DOPPELT?
    E  welche 18 Koerperflaechen haben keinen Muskel?
    F  fehlt anatomisch etwas? Vergleich gegen eine
       Quelle.

`[read]` **Punkt D ist der teure** ? **wenn `Abductors` und
`Hip Abductors` dasselbe meinen und beide an einer Uebung
haengen, zaehlt die Muskelbelastung doppelt.**

## Was NICHT zu tun ist

**Keine neue Tabelle** ? **sechs Fremdschluessel haengen an
der bestehenden.**

**Keine Zusammenfuehrung** ? **MESSEN und EMPFEHLEN. Welche
Namen zusammengelegt werden, entscheidet Tom.**

**Kein Raten bei Anatomie** ? **wo unsicher: gemeldet.**

## Abnahmebedingungen

    A1  welche Namen meinen dasselbe? TABELLE mit
        Quelle je Paar.
    A2  welche Eltern sind falsch? Je Fall begruendet.
    A3  resolution_notes und level_decisions gelesen,
        was steht drin?
    A4  je Zusammenfuehrung: wie viele
        exercise_muscles-Zeilen? Zaehlt es doppelt?
    A5  die 18 Koerperflaechen ohne Muskel benannt.
    A6  fehlt anatomisch etwas? Gemessen.
    A7  eine Empfehlung mit Reihenfolge.
    A8  KEINE Umsetzung. git status supabase/
        unveraendert.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

