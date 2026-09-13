---
nr: G-439
typ: fehler
modul: nutrition
schwere: niedrig
angelegt: 2026-09-08
braucht: []
kind_von: C-464
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 7e7e37b7
beruehrt:
  tabellen: [goals.nutrition_targets]
zahlen:
  gemessen: 2026-09-08
---

# G-439 — der Sollstand kennt fiber_g nicht

## Befund

Aus C-485, Codex, 2026-09-08:

> *,,`pnpm gate` bleibt an der unabhaengigen G-261-Abweichung rot:
> `goals.nutrition_targets` hat 7 statt 6 Sollspalten. Nicht von
> C-485 veraendert."*

`[cmd]` **Gemessen:** **15 Spalten, darunter `fiber_g`,
`linoleic_acid_g`, `alpha_linolenic_acid_g`.**

`[cmd]` **C-464 hat `fiber_g` HEUTE gebaut** ? **abgenommen,
30 g Ziel, 5 Nutzer.**

`[read]` **Der Sollstand wurde nicht nachgezogen.**

## Und die Regel gilt

Tom, 2026-09-08:

> wenn ein waechter gebraucht wird, dass der sauber laeuft und den
> auftrag damit abschliesst

`[cmd]` **C-464 hat `fiber_g` gebaut und den Waechter rot
gelassen** ? **genau der Fall, den die Regel verbietet.**

`[read]` **Der Punkt ist klein, die Lehre nicht.**

## Was zu tun ist

`[read]` **Den Sollstand auf 7 setzen** ? **oder messen, welche
Zahl richtig ist.**

`[cmd]` **`linoleic_acid_g` und `alpha_linolenic_acid_g` kamen
aus einem fruehen Punkt** ? **miss, ob sie im Sollstand stehen.**

`[read]` **Und dann ist `pnpm gate` gruen** ? **das ist der
Zweck.**

## Bericht

**Claude Code, 2026-09-13.**

### Wo der Waechter steht

`[cmd]` **`tools/zwei-wahrheiten-pruefen.mjs`** ? **nicht
`schema-sollstand.json`.**

`[read]` **Der Punkt sagt *,,Sollstand"*, und die Datei
`schema-sollstand.json` fuehrt `goals.nutrition_targets`
tatsaechlich** ? **aber ohne Spaltenliste.** `[cmd]` **Die Zahl 6
stand woanders:** `const SOLL_NAEHRSTOFFSPALTEN = 6`.

`[cmd]` **Gefunden ueber `grep "G-261"`, nicht ueber
`"Sollspalten"`** ? **das Wort aus Codex' Meldung kommt im Repo
nicht vor.**

### Die Messung

`[cmd]` **`goals.nutrition_targets`, 15 Spalten
(`information_schema.columns`, 2026-09-13).**

`[cmd]` **Der Waechter zaehlt ueber eine AUSSCHLUSSLISTE** ?
**alles, was nicht `user_id`, `gueltig_ab`, `herkunft`, `tdee`,
`nutrition_goal`, `notiz`, `created_at`, `updated_at` heisst.**

`[cmd]` **Die sieben, die er damit heute zaehlt:**

    kcal · protein_g · carbs_g · fat_g
    linoleic_acid_g · alpha_linolenic_acid_g · fiber_g

### Die Frage des Auftrags, beantwortet

`[cmd]` **`linoleic_acid_g` und `alpha_linolenic_acid_g` stehen
NICHT im Sollstand als Einzelnamen** ? **es gibt dort keine
Namensliste.** `[cmd]` **Aber sie sind in der ALTEN Sechs
enthalten** ? **die Abfrage zaehlt sie seit je mit.**

`[read]` **Sie sind aelter als C-464 und keine Abweichung.**

`[cmd]` **Genau EINE Spalte ist neu: `fiber_g`** ? **die
siebente.**

`[cmd]` **Dass sie zu Recht da ist, gemessen statt geglaubt:**

    5 Zeilen, 5 mit fiber_g, min 30.0, max 30.0, 5 Nutzer
    C-464 abgenommen (c5efd107, "fiber_g mit 30 g")

`[read]` **Also 6 -> 7, um genau eins** ? **nicht 6 -> 15 und
nicht auf gut Glueck.**

### Was ich NICHT getan habe

`[read]` **Die Frage, die der Waechter stellt, ist nicht
beantwortet** ? **er fragt, ob zu viele Naehrstoffe gleichzeitig
ein persoenliches Ziel UND eine wissenschaftliche Referenz
tragen (G-261/G-218).**

`[read]` **Das Anheben sagt nur: die Zunahme ist bekannt und
begruendet.** `[cmd]` **Das steht so im Kommentar** ? **damit die
naechste Person nicht denkt, G-261 sei erledigt.**

### A3 ? der Waechter gruen, das Gate nicht

`[cmd]` **`node tools/zwei-wahrheiten-pruefen.mjs`:**

    vorher   ROT: 7 Naehrstoffspalten, Soll 6.     exit 1
    nachher  gruen: 7 Naehrstoffspalten, Soll 7.   exit 0

`[cmd]` **Im Gate-Lauf ebenfalls gruen** ? **die Zeile steht
drin.**

**Aber `pnpm gate` ist NICHT gruen** ? **es faellt neun Waechter
spaeter an einer anderen Stelle:**

    [abwesenheit] FEHLER: 3 Aussage(n) sichern eine
    Abwesenheit, die geendet hat.
      apps/web/src/app/v2/training/modale.tsx:202
        "training.routines" steht in der Pipeline
      docs/ssot/93-trainingssitzungen.md:66
        "training.routine_exercises" steht in der Pipeline
      docs/ssot/93-trainingssitzungen.md:67
        "training.routine_schedule_days" steht in der Pipeline

`[cmd]` **Belegt als fremd, nicht behauptet:** **meine drei
Dateien weggestasht und `abwesenheit-pruefen.mjs` allein laufen
lassen** ? **dieselben drei Zeilen.**

`[read]` **Die Ursache ist dieselbe Klasse wie G-439 selbst:**
**C-461 hat `training.routines`, `routine_exercises` und
`routine_schedule_days` gebaut** ? **und die drei
Abwesenheitszusagen, die sich auf ihr Fehlen beriefen, stehen
noch da.**

`[read]` **Der Waechter arbeitet genau wie gebaut** (A-62) ?
**er meldet eine Zusage, die abgelaufen ist.**

**Warum ich sie nicht behoben habe:** `[cmd]` **zwei der drei
liegen in `docs/ssot/`** ? **das gehoert dem Orchestrator
allein** (CLAUDE.md). `[read]` **Und die dritte ist ein
Trainings-Vermerk, nicht Nutrition** ? **ein eigener Punkt, kein
Anhaengsel von G-439.**

### A5 ? Bestand

`[cmd]` **`apps/web`: 1707 Pruefungen, 1707 gruen, 0 rot.**
`[cmd]` **`apps/coach`: 65 Pruefungen, 65 gruen, 0 rot.**

### A4 ? Gegenprobe

`[cmd]` **Eine achte Spalte angelegt:**

    alter table goals.nutrition_targets
      add column sabotage_g439_g numeric;

    -> ROT: 8 Naehrstoffspalten, Soll 7.   exit 1

`[cmd]` **Danach `drop column`, nachgezaehlt: 15 Spalten,
Waechter gruen.**

`[read]` **Der Waechter faellt bei genau einer Spalte mehr** ?
**er misst die Wirkung in der Datenbank, nicht ein Wort im
Quelltext.**

### Was ich angefasst habe

    tools/zwei-wahrheiten-pruefen.mjs   EINE Datei

`[read]` **Die Sabotagespalte war voruebergehend und ist
entfernt** ? **die Wegwerfprobe lief gegen die laufende
Instanz, weil der Waechter sie liest; Zustand danach
nachgezaehlt.**

`[read]` **Nichts in `supabase/`.**

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **`zwei-wahrheiten-pruefen.mjs` selbst gelaufen:**

    exit 0
    "gruen: 7 Naehrstoffspalten, Soll 7.
     G-261 bleibt zurueckgestellt."

### Meine Frage ist beantwortet

`[read]` **Ich hatte gefragt, ob `linoleic_acid_g` und
`alpha_linolenic_acid_g` im Sollstand stehen.**

> *,,Beide Fettsaeuren waren bereits INNERHALB der alten 6 ?
sie sind aelter als C-464 und keine Abweichung. `fiber_g` ist
die einzige siebte Spalte."*

`[cmd]` **Belegt: 5 von 5 Zeilen, 30 g, 5 Nutzer, C-464
abgenommen.**

`[read]` **6 -> 7, um genau eins** ? **keine Sammelanpassung.**

### Und der Waechter war woanders

`[cmd]` **`tools/zwei-wahrheiten-pruefen.mjs`, nicht
`schema-sollstand.json`** ? **mein Auftrag nannte die falsche
Datei.**

`[read]` **Und er hat im Code vermerkt, dass die Erhoehung G-261
NICHT beantwortet** ? **sie haelt nur fest, dass sie bekannt
ist.**

**Abgenommen.**
