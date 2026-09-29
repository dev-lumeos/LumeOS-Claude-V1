---
nr: C-551
typ: feature
modul: training
schwere: hoch
angelegt: 2026-09-08
erledigt: 2026-09-28
commit: 4972b27e
braucht: []
kind_von: C-547
entscheidung: C-547
agent: codex
beauftragt: 2026-09-27
beruehrt:
  tabellen: [training.exercise_muscles]
  dateien:
    - supabase/migrations/20260927040500_c551_role_measurement_separation.sql
    - supabase/_pipeline/10_training/490_exercise_muscle_factors.sql
zahlen:
  gemessen: 2026-09-27
  volumenregeln: 2
  pelland_zeilen_null: 6723
  emg_zeilen: 3
  gewichtete_saetze_vorher_nachher: 4941.0
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

_(Orchestrator, 2026-09-28 — einen Tag zu spaet. Der Punkt stand seit
dem 27.09. mit vollem Bericht und leerer Abnahme in `laufend_codex`.
Das ist mein Versaeumnis, nicht ein Zustand des Punktes.)_

### Was ich nachgezaehlt habe

`[cmd]` **Alle fuenf behaupteten Bezeichner stehen in der Kette**
(gemessen ueber 265 SQL-Dateien aus `migrations/` und `_pipeline/`):

    training.muscle_role_volume_rules      12 Vorkommen
    activation_factor                      14
    activation_evidence_class              14
    weekly_volume_factor                   13
    activation_source_id                   12
    weekly_volume_source_id                 4

`[cmd]` **Gegenprobe eingebaut:** die erfundenen Namen
`activation_phantom_factor` und `training.muscle_nonsense_xyz`
werden nicht gefunden. Die Messung kann also beides.

`[cmd]` **Die Umbenennung steht als drei `RENAME COLUMN`**
(`20260927040500_c551_role_measurement_separation.sql:33-38`):
`faktor` → `activation_factor`, `source_id` → `activation_source_id`,
`evidence_class` → `activation_evidence_class`.

`[cmd]` **Die drei EMG-Werte sind belegt**
(`_pipeline/10_training/490_exercise_muscle_factors.sql:15-27`):
Chest 0,95, Shoulders 0,79, Triceps 0,67, `evidence_class = 'A'`,
nur fuer `Barbell Bench Press`. Die 6.723 Rollenzeilen davor tragen
`source_id = 'pelland_2026_fractional_sets'` und Klasse C.

`[cmd]` **Die Reihenfolge traegt:** `490_exercise_muscle_factors_daten`
steht in `kette.json` (Zeile 2064) **vor** der C-551-Migration
(Zeile 2745). Der Kettenschritt schreibt also noch `faktor`, und die
Migration benennt danach um. Das ist kein Fehler, aber es ist eine
Reihenfolgeabhaengigkeit: wer `490` nach `c551` laufen laesst, bricht.

### Eine Ungenauigkeit im Bericht

`[cmd]` **Der Bericht nennt die EMG-Quelle `pmc4327372_emg`. Im Code
steht `pmc4327372_bench_press_emg`.** Der Bericht hat den Bezeichner
verkuerzt. Sachlich dasselbe, aber eine Suche nach der Berichtszeile
findet nichts — und genau dafuer gibt es die Abnahme.

### Was ich NICHT nachgerechnet habe

`[read]` **Die Zahlen 4.941,0 gewichtete Saetze, 6.723 NULL-Zeilen
und 10/10 Fachtests sind nicht von mir gemessen.** Sie brauchen einen
Kettenlauf gegen eine Wegwerf-Datenbank, und den starte ich nicht,
waehrend Codex gegen denselben Server arbeitet. **Das ist in C-555
als offener Nachweis festgehalten, nicht stillgelegt.**

`[cmd]` **Die behauptete Sicherung
`backup/schema/20260927105121_c551_vor_bau.dump` ist nicht mehr da.**
Erwartbar: Tom hat `backup/` von 8,96 GiB auf 3.958 MiB geleert. Kein
Fund gegen Codex.

### Nebenbefund zum Commit

`[cmd]` **Dieser Punkt kam unter `4972b27e` herein, dessen Betreff
`goals(G-523, G-529, G-526)` lautet** — zwei Training-Punkte sind in
einem Goals-Commit mitgefahren, ohne genannt zu werden. Dasselbe
Muster wie bei G-512 unter `goals(G-510)`. **Der Commit-Betreff ist
kein Signal dafuer, was erledigt wurde.** Deshalb steht die Nummer
hier im Punkt und nicht nur dort.
