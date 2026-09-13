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
