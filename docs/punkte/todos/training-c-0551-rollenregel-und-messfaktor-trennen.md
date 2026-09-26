---
nr: C-551
typ: feature
modul: training
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-547
entscheidung: C-547
beruehrt:
  tabellen: [training.exercise_muscles]
zahlen:
  gemessen: 2026-09-08
---

# C-551 - Rollenregel und Messfaktor trennen

## Der Fund aus C-547

> Codex: *,,Pellands 0,5 ist eine RECHENKONVENTION fuer
indirekte Saetze im WOECHENTLICHEN VOLUMEN, keine gemessene
Muskelaktivierung je Uebung."*

`[read]` **Die 6.723 Zeilen sind nicht falsch geraten** ?
**sie sind eine RICHTIGE Zahl an der falschen Stelle.**

`[cmd]` **Und nur EINE Uebung hat konkrete EMG-Faktoren.**

## Die Entscheidung

    Rollenregel     primary 1,0 / secondary 0,5
                    -> Volumenrechnung, Pelland
                    -> gilt IMMER, je Rolle

    Messfaktor      je Uebung UND Muskel, aus EMG
                    -> heute: eine Uebung
                    -> NULL, wo nichts gemessen ist

`[read]` **Dann sagt die Datenbank die Wahrheit: wir kennen die
Volumenregel, und wir kennen die Aktivierung fast nie.**

## Was zu bedenken ist

`[cmd]` **`evidence_class` traegt heute A fuer 3 und C fuer
6.723 Zeilen** ? **nach der Trennung braucht die Rollenregel
gar keine Evidenzklasse, sie ist eine Konvention.**

`[cmd]` **MISS, wer `faktor` liest, bevor du ihn aufteilst.**

`[read]` **Und die drei EMG-Zeilen bleiben** ? **sie sind das
Einzige, was wirklich gemessen ist.**

## Abnahmebedingungen

    A1  Rollenregel und Messfaktor getrennt. Bauform
        begruendet.
    A2  die drei EMG-Zeilen stehen weiter, als Messung.
    A3  die 6.723 sind als KONVENTION erkennbar, nicht
        als Messung.
    A4  wer las faktor? Gemessen und nachgezogen oder
        GEMELDET.
    A5  Gegenprobe: eine Volumenrechnung gibt dasselbe
        Ergebnis wie vorher.
    A6  Sicherung, Vollkette, ALLE Waechter.
