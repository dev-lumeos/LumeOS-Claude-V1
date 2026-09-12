---
nr: C-474
typ: feature
modul: training
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  tabellen: [training.programs]
zahlen:
  gemessen: 2026-09-08
---

# C-474 — Progressionsregeln fuer Programme

## Woher

`[cmd]` **Due Diligence openGym, 2026-09-11, Abschnitt 07.**

`[read]` **Das Fremdprojekt fuehrt FUENF Regelwerke, LumeOS
keines.**

## Was gemessen ist

`[cmd]` **C-461 hat `programs`, `program_blocks`, `program_days`,
`program_assignments`, `routines`, `routine_exercises` gebaut.**

`[cmd]` **KEINE Progressionsfunktion in `training`:**

    p.proname ~* '1rm|epley|progress|deload|volume'
      -> (keine)

`[cmd]` **`workout_sets` traegt `estimated_1rm`** ? **234 von 258
Zeilen haben einen Wert.**

`[read]` **Miss, WER ihn schreibt** ? **eine Funktion gibt es
nicht.**

## Die fuenf Regelwerke

    Linear              alle Ziel-Reps -> Gewicht rauf,
                        wiederholte Fehlschlaege -> Deload
    Greyskull LP        2 Straight Sets + AMRAP,
                        doppelter Sprung bei deutlich
                        uebertroffenem AMRAP, Fail -> 10 % Reset
    Double Progression  erst Reps innerhalb der Range,
                        dann Last rauf und Reps zurueck
    Timed               Haltezeit vollstaendig -> Zeit rauf,
                        Fehlschlaege -> Zeit runter
    Bodyweight          Reps -> Sets bis max. 6 ->
                        Zusatzgewicht oder schwerere Variante

## Die zwei Bauentscheidungen dahinter

> *,,Die Engine leitet Vorschlaege aus der HISTORIE ab, statt
> fragile Zaehler zu speichern."*

`[read]` **Kein Zustandsfeld *,,dritter Fehlschlag in Folge"*** ?
**gerechnet aus den letzten Saetzen.**

`[read]` **Ein Zaehler, der einmal falsch steht, bleibt falsch.
Eine Rechnung nicht.**

> *,,Jede Empfehlung liefert ein *why*."*

`[cmd]` **Dasselbe Muster wie der Nutrition-Score** (G-417) ?
**die Kachel sagt, warum sie rechnet, was sie rechnet.**

`[cmd]` **Und Deloads rasten auf dem verfuegbaren Lastgitter
ein** ? **eine Empfehlung von 47,3 kg ist unbrauchbar, wenn die
kleinste Scheibe 1,25 kg wiegt.**

## Die Warnung, die mitkommt

`[cmd]` **Das Fremdprojekt dokumentiert selbst:**

> *,,Rest-Pause kollidiert mit Progressions- und 1RM-Logik.
> Gesamt-Reps werden gegen ein Plain-Set-Ziel geprueft und liegen
> oft ueber 12."*

`[cmd]` **LumeOS `workout_sets.set_type`:**
`working | warmup | dropset | failure`.

`[read]` **Vier Typen, und die Progression muesste je Typ anders
rechnen** ? **ein Warmup zaehlt nicht, ein Dropset nicht wie ein
Arbeitssatz.**

`[read]` **Also: satztyp-spezifische Regeln von Anfang an, nicht
nachtraeglich.**

## Was zu entscheiden ist

`[read]` **Welche der fuenf gelten fuer LumeOS?**

`[read]` **Und wo leben sie?** `[cmd]` **`packages/scoring/`
traegt seit G-417 die Nutrition-Formeln** ? **dieselbe
Bauform.**
