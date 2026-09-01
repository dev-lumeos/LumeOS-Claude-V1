---
nr: G-309
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-01
braucht: []
kind_von: G-304
entscheidung: E-42
beruehrt:
  tabellen: [nutrition.meal_plan_logs]
zahlen:
  gemessen: 2026-09-01
  logs: 0
---

# G-309 — der Plan erzeugt keine Eintraege im Tagebuch

## Befund

Aus G-304, Claude Code, 2026-08-31.

`[cmd]` **`meal_plan_day_to_diary` existiert ohne Aufrufer.**
`[cmd]` **`meal_plan_logs` traegt 0 Zeilen.**

`[cmd]` **Und beim Aktivieren wird der bestehende aktive Plan nicht
auf `paused` gesetzt** — `SPEC_03` Flow 3, Schritt 7.

## Warum das der letzte Schritt ist

Tom, 2026-08-31: *,,ist der plan aktiv werden in diary die
tagesmahlzeiten eingetragen welche dann durch den user entweder zu
bestaetigen oder per mealcam einzulesen und dann zu bestaetigen."*

Und: *,,die protokolle der benutzen plaene muessen entsprechend
angelegt sein dass wir auswerten koennen welcher plan wie und wie
exakt umgesetzt wurde."*

`[read]` **Ohne diesen Weg ist der Plan ein Dokument.** **Mit ihm ist
er ein Ablauf.**

## Was da ist

`[cmd]` **`meal_plan_logs` traegt vier Zustaende** — `pending`,
`confirmed`, `deviated`, `skipped` — **mit `deviation_kcal`,
`deviation_pct`, `plan_entry_id`, `actual_meal_id`.**

`[cmd]` **`meals` traegt `entry_source` und `source_detail`.**

`[cmd]` **Der Bestaetigungsweg steht seit G-274:** bestaetigen und
auslassen schreiben.

`[read]` **Es fehlt der Anfang: aus einem aktiven Plantag entstehen
Tagebuchzeilen.**

## Was `SPEC_03` dazu sagt

`[cmd]` **Flow 3, Schritt 7:** *,,ab Startdatum: Ghost Entries im
Diary."*

`[cmd]` **Flow 4 beschreibt das Bestaetigen** — und `SPEC_03_FLOW4_RECIPE_PATCH`
sagt: **ein Ghost Entry aus einem Rezept zeigt den Rezeptnamen als
Ueberschrift und darunter alle Einzelzutaten mit eigenen
Mengenfeldern.**

`[cmd]` **`ADR_GHOST_ENTRY_RECIPE`: beim Loggen entstehen immer
Einzelzutaten, je Zutat ein `MealItem` mit eingefrorenen
Naehrwerten.**

## Auftrag — den Kreis schliessen

`[read]` **Vorbereitet am 2026-09-01.**

### Das Ergebnis

`[read]` **Nach diesem Auftrag laeuft der Weg vollstaendig:**

    Plan bauen -> aktivieren -> Tagebuch zeigt die Plantage
    -> bestaetigen, abweichen oder auslassen
    -> das Protokoll traegt es
    -> die Auswertung sagt, welche Mahlzeit immer gewechselt wurde

`[cmd]` **Alles davon ist einzeln gebaut. Es fehlt die Naht.**

### 1 · Ghost Entries entstehen

`[cmd]` **`meal_plan_day_to_diary` existiert ohne Aufrufer.**
`[cmd]` **Flow 3 Schritt 7: *ab Startdatum: Ghost Entries im
Diary*.**

`[read]` **Miss zuerst, was die Funktion tut** — **sie ist da, aber
niemand hat sie je gerufen.** `[cmd]` **Dieselbe Klasse wie
`reference_assessment_window_flags` vor G-273.**

`[cmd]` **Und `ADR_GHOST_ENTRY_RECIPE` gilt:** ein Rezept-Eintrag
zeigt den Rezeptnamen als Ueberschrift **und darunter alle
Einzelzutaten mit eigenen Mengenfeldern.** `[read]` **Kein *Rezept
als Einheit bestaetigen*.**

### 2 · Der bestehende Plan wird pausiert

`[cmd]` **Flow 3 Schritt 7: *bestehender aktiver Plan -> status:
paused*.** `[cmd]` **Das geschieht heute nicht.**

`[read]` **Sonst haetten zwei Plaene gleichzeitig Anspruch auf
denselben Tag.**

### 3 · Das Protokoll fuellt sich

`[cmd]` **`meal_plan_logs` traegt 0 Zeilen.** `[cmd]` **Der
Bestaetigungsweg aus G-274 steht** — bestaetigen und auslassen
schreiben.

`[read]` **Miss, ob er in `meal_plan_logs` schreibt oder nur ins
Tagebuch.** `[read]` **Wenn nur ins Tagebuch: das ist die Luecke.**

`[cmd]` **Der `resolution_check` erzwingt die Form:** `confirmed`
braucht `actual_meal_id` und `confirmed_at`, `deviated` zusaetzlich
`deviation_kcal` und `deviation_pct`, `skipped` nur `skipped_at`.

### 4 · Und dann die Auswertung, die Tom will

Tom, 2026-08-31: *,,dass er seinen plan dementsprechend vielleicht
anpassen sollte wenn er eh zb die eine mahlzeit immer gewechselt hat
weil er es vielleicht nicht mag."*

`[read]` **Das ist eine Abfrage ueber `status = 'deviated'` je
`plan_entry_id`.** `[read]` **Bau sie erst, wenn Zeilen da sind** —
**und wenn nicht: sag, was fehlt, statt eine leere Kachel zu
stellen.**

### Was nicht zu tun ist

**Keine zweite Schreibnaht** — `addMealItem` aus G-272 ist der Weg.
**Nichts erfinden, was nicht in `SPEC_03` oder den ADRs steht.**
**Nichts auf `dev@lumeos.app`** — eine Probe, die schreiben kann,
gehoert nicht auf ein unantastbares Konto.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Plan aktivieren       Ghost Entries im Tagebuch, gezaehlt
    alter Plan            steht auf paused, belegt
    bestaetigen           meal_plan_logs zaehlt, status confirmed
    abweichen             deviated mit deviation_kcal
    auslassen             skipped mit skipped_at
    Rezept-Eintrag        Einzelzutaten, nicht als Einheit
    Auswertung            gebaut, oder benannt was fehlt
    Rueckbau              gezaehlt, dev unveraendert

`[read]` **Die vorletzte Zeile ist die, an der Tom es messen wird.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
