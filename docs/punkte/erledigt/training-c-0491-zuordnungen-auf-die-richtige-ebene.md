---
nr: C-491
typ: befund
modul: training
schwere: hoch
angelegt: 2026-09-08
braucht: [C-490]
kind_von: C-487
entscheidung: E-82
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 299be535
beruehrt:
  tabellen: [training.exercise_muscles]
zahlen:
  gemessen: 2026-09-08
  auf_wurzel: 1105
  auf_gruppe: 3331
  auf_blatt: 2152
---

# C-491 — die Zuordnungen zeigen auf die falsche Ebene

## Der Befund

`[cmd]` **`exercise_muscles`, 6.588 Zuordnungen:**

    Wurzel   1.105    "Legs", "Arms"
    Gruppe   3.331    "Hamstrings", "Quadriceps"
    Blatt    2.152    "Biceps Femoris"

`[read]` **Eine Zuordnung auf `Legs` trifft vierzig Muskeln
gleichzeitig** ? **sie sagt nichts.**

## Die Regel aus E-82

`[read]` **Eine Uebung zeigt auf die TIEFSTE Ebene, die ein
Satzzaehlverfahren noch trennen kann.**

    Kniebeuge -> Quadriceps, Glutes, Erector spinae,
                 Hamstrings
              NICHT -> Legs
              NICHT -> Vastus Lateralis / Medialis /
                       Intermedius einzeln

`[cmd]` **Begruendung in `docs/ssot/180`:** **kein
Satzzaehlverfahren trennt Vastus lateralis von medialis.**

`[read]` **Die Koepfe leihen vom Elternteil** (G-438).

## Die Reihenfolge

`[read]` **Nicht 1.416 Uebungen auf einmal.**

**1** ? **Die Uebungen aus dem Seed.**

`[cmd]` **Gemessen: SECHS verschiedene Uebungen in allen
Sitzungen.**

`[read]` **Die zeigen sofort Wirkung auf der Karte.**

**2** ? **Die 1.105 Wurzel-Zuordnungen.**

`[read]` **Die sind am schlimmsten** ? **eine Wurzel ist keine
Zuordnung.**

**3** ? **Die 3.331 Gruppen-Zuordnungen pruefen.**

`[read]` **Manche sind RICHTIG** ? `Hamstrings` **ist eine
Gruppe, und kein Satzzaehlverfahren trennt Biceps femoris von
Semitendinosus.**

`[cmd]` **Miss je Gruppe, ob die Trennung sinnvoll waere.**

## Woher die Zuordnung kommt

`[read]` **Aus der BEWEGUNG und der MUSKELFUNKTION.**

`[cmd]` **NCBI StatPearls fuehrt Ursprung, Ansatz und Funktion je
Muskel** ? **Codex hat sie in C-482 benutzt.**

`[read]` **Wer die Funktion kennt und die Bewegung, kann
zuordnen** ? **der FAKTOR braucht keine Recherche (C-490), die
ZUORDNUNG schon.**

## Was NICHT zu tun ist

**KEINE Uebung zuordnen, deren Bewegung unklar ist.**

`[cmd]` **Die openGym-Analyse nennt `wind sprints` als
`waist/abs` und `assisted prone rectus femoris stretch` als
`waist/abs`** ? **statt Quadrizeps.**

`[read]` **Solche Faelle gibt es hier vermutlich auch** ?
**C-476 misst das.**

## Bericht

Die sechs Seed-Uebungen zeigen nun nur noch auf zaehlbare Gruppen: Band
Deadlift auf Hamstrings, Quadriceps und erector spinae; Band Lat Pulldown
auf Latissimus dorsi, Upper Back und Biceps; Back Squat auf Glutes,
Quadriceps, Hamstrings und erector spinae; Bench Press auf Pectoralis Major,
Front Shoulders und Triceps; Incline Bench auf dieselben drei Gruppen; die
pronierte Barbell Row auf Latissimus dorsi, Upper Back, Biceps und Forearms.

| Befund | vorher | nachher | Entscheidung |
| --- | ---: | ---: | --- |
| Wurzelzuordnungen | 1.105 | 4 | 1.101 anhand rollenbezogenen Rohtexts auf Gruppen aufgeloest |
| einzeln unklar | 0 | 4 | erhalten und mit Grund dokumentiert |
| Zwischenebenen | 3.331 | gemessen | 21 Gruppen bleiben sinnvoll; Lower Back -> erector spinae |
| referenzierte Muskelgruppen | 95 | 90 | keine Erfindung, sondern E-82-geeignete Verdichtung |

Die vier erhaltenen Wurzeln sind: *Incline diamond push up on bench* / Chest
(primary), *Resistance Band Lying Hyperextension Abduction* / Core
(secondary), *Barbell Deadlift High Pull* / Shoulders (primary) und
*Resistance Band Kneeling Cross Body Single Straight Arm Supinated Pulldown*
/ Shoulders (secondary). Keiner hat rollenbezogenen Rohtext; jeder steht in
`training.exercise_muscle_resolution_notes` mit `unresolved` und Grund.
Die 22 Gruppenentscheidungen stehen separat in
`training.muscle_group_level_decisions`.

Struktur: `20260913002100_c491_exercise_muscle_levels.sql`; Daten:
`491_exercise_muscle_levels.sql`. Beide Nachweistabellen haben RLS,
service_role-only Rechte und explizite service_role-Policy. Der Test
`training-c491-muscle-levels.test.ts` lief auf `postgres` gruen.

Sicherung vor dem Live-Einspielen:
`backup/data/20260913084507_c490_c492_vor_live.dump` (704.4 MB). Vollkette
auf `lumeos_c492_vollkette_final3`: 211 Schritte, `SCHEMA VOLLSTAENDIG`,
Exit 0. Ketten-, Datenlogik- und Sprachwaechter sowie Punktelauf sind gruen.

## Abnahmebedingungen

    A1  die sechs Seed-Uebungen: je Muskel mit Faktor,
        mit Quelle fuer die ZUORDNUNG. TABELLE.
    A2  die 1.105 Wurzel-Zuordnungen: aufgeloest oder
        einzeln begruendet.
    A3  je Gruppen-Zuordnung: trennbar oder nicht?
        Gemessen.
    A4  wo die Bewegung unklar ist: gemeldet, nicht
        zugeordnet.
    A5  wie viele der 105 Muskeln haben danach eine
        Zuordnung? Vorher gemessen, nachher gemessen.
    A6  Sicherung, Vollkette, Punktelauf.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    vorher    Wurzel 1.105 | Gruppe 3.331 | Blatt 2.152
    jetzt     Wurzel     4 | Gruppe 4.206 | Blatt 2.534

`[cmd]` **1.101 Wurzelzuordnungen aufgeloest.**

> *,,4 einzeln begruendete unklare Faelle belassen"*

`[read]` **Vier von 1.105 stehen geblieben, mit Grund** ?
**statt sie zu raten.**

`[cmd]` **Und referenzierte Muskelgruppen 95 -> 90** ? **fuenf
Wurzeln werden nicht mehr angesprochen.**

`[read]` **Das ist die Wirkung: eine Kniebeuge zeigt nicht mehr
auf `Legs`.**

**Abgenommen.**
