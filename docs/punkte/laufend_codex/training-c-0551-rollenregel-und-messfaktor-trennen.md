---
nr: C-551
typ: feature
modul: training
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-547
entscheidung: C-547
agent: codex
beauftragt: 2026-09-27
beruehrt:
  tabellen: [training.exercise_muscles]
zahlen:
  gemessen: 2026-09-27
---

# C-551 - Rollenregel und Messfaktor trennen

## Der Fund aus C-547

> Codex: *,,Pellands 0,5 ist eine RECHENKONVENTION fuer
indirekte Saetze im WOECHENTLICHEN VOLUMEN, keine gemessene
Muskelaktivierung je Uebung."*

`[read]` **Die 6.723 Zeilen sind nicht falsch geraten** -
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
6.723 Zeilen** - **nach der Trennung braucht die Rollenregel
gar keine Evidenzklasse, sie ist eine Konvention.**

`[cmd]` **MISS, wer `faktor` liest, bevor du ihn aufteilst.**

`[read]` **Und die drei EMG-Zeilen bleiben** - **sie sind das
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

## Bericht

`[cmd]` **Gebaut:** `training.muscle_role_volume_rules` traegt die
zwei woechentlichen Volumenregeln `primary = 1,0` und
`secondary = 0,5` mit der Quelle
`pelland_2026_fractional_sets`.

`[cmd]` **Die drei Messspalten heissen jetzt eindeutig
`activation_factor`, `activation_source_id` und
`activation_evidence_class`.** Die 6.723 Pelland-Zeilen tragen dort
`NULL`; die drei EMG-Zeilen der einen Uebung bleiben mit `0,95`,
`0,79` und `0,67`, Quelle `pmc4327372_emg`, Klasse A erhalten.

`[cmd]` **Die effektive Muskelsicht liefert beide Wahrheiten
getrennt:** `weekly_volume_factor`/`weekly_volume_source_id` fuer die
Rollenrechnung und `activation_*` fuer eine konkrete Messung.
Geerbte Zuordnungen behalten beide Werte ihrer Grundzuordnung.

`[cmd]` **Leser gemessen:** Produktiver Code unter `apps/` las den
alten Faktor nicht; er las nur Rolle oder Muskel-ID. Die betroffenen
DB-Tests und die effektive Sicht wurden nachgezogen. `apps/` blieb
unveraendert.

`[cmd]` **Gegenprobe:** Vorher und nachher ergibt die
Rollenrechnung unveraendert **4.941,0** gewichtete Saetze. Die Summe
der alten Mischspalte war 4.941,41 und ist gerade deshalb kein
Volumenwert mehr.

`[cmd]` **Sicherung:**
`backup/schema/20260927105121_c551_vor_bau.dump`, 473.965.860 Byte,
SHA-256
`548C6915DBEA88A323FB6B5A3965554F6A72824761BE13AA79B8C14808368139`.

`[cmd]` **Nachweis:** Vollkette mit 281 Schritten und
Schema-Abschlusspruefung gruen. C-490/C-543/C-551 ergeben zusammen
10/10 gruene Fachtests; C-551 allein 5/5. Migration-Kette,
Datenlogik- und Encoding-Waechter sind gruen.

## Abnahme

_(vom Orchestrator)_
