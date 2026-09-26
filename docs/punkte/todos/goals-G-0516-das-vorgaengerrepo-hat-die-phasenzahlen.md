---
nr: G-516
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-09-26

braucht: [G-511]
kind_von: G-510
entscheidung: E-91

beruehrt:
  tabellen:
    - goals.goal_phases
  dateien:
    - referenz/lumeos-2026/research/goals/data/goal-phase-models.md

zahlen:
  gemessen: 2026-09-26
  goal_dateien_im_altrepo: 45
  modul_dokumente: 7
  forschungsdateien_goals: 8
---

# G-516 - das Vorgaengerrepo traegt die Phasenzahlen, die uns fehlen

## Der Befund

`[cmd]` **`referenz/lumeos-2026/research/goals/data/
goal-phase-models.md` traegt je Phase die Zahl**, die G-511 als
fehlend meldet:

    FAT_LOSS moderate     −400 … −600 kcal   Protein 1,8-2,4 g/kg
    FAT_LOSS aggressive   −750 … −1000       2,3-3,1
    LEAN_BULK             +200 … +400        1,6-2,2
    MAINTENANCE           TDEE ± 100         1,4-2,0
    REVERSE_DIET          +50 … +150 je Wo   Protein halten
    RECOMP                Trainingstag +200  2,0-2,4
                          Ruhetag     −300
    CONTEST_PREP  early   −300   mid −600   late −750

`[read]` **Das ist keine Anregung, das ist eine
Implementierungsvorlage** — die Datei heisst
*,,Implementation Reference"* und liegt als JSON je Phase vor.

## Und die Zahl steht schon in unserer Datenbank

`[cmd]` **`goal_phases.parameters`, gemessen 2026-09-26:**

    {"source": "GO-07 testdata", "calorie_surplus_kcal": 250}

`[cmd]` **250 liegt im Bereich `LEAN_BULK 200…400`.** `[read]`
**Jemand hat beim Seed nach dieser Datei gearbeitet** — und der
Wert wird nur angezeigt, nie gerechnet (G-511).

## Was das Altrepo sonst traegt

`[cmd]` **Mehr als der Auftrag geschaetzt hat:**

    docs/modules/goals/       7 Dateien  API, COMPONENTS,
                              DATABASE, FEATURES, MIGRATION,
                              README, RESEARCH
    docs/goals-module/        4 Dateien  API, PRD, RESEARCH, SPEC
    research/goals/           goal-phase-models.md
                              tdee-formulas.md
                              competitive-analysis.md
                              4 Konkurrenzprofile
    src/api/goals/            goals.ts, nutrition-goals.ts
    src/modules/goals/        13 Bauteile, 3 Haken

`[read]` **`tdee-formulas.md` liegt direkt neben der
Kalorienfrage** — nicht gelesen in diesem Punkt, gehoert zum
naechsten.

`[cmd]` **Die vier Konkurrenzprofile** (Carbon, MacroFactor, Noom,
RP Strength) `[read]` **beantworten die Frage, die bei
`calcWeeklyAdjustment` auftaucht:** wie oft andere Apps anpassen und
woran.

## Die Adaptionsregel, die uns fehlt

`[cmd]` **`goal-phase-models.md:246-260` traegt sie als
TypeScript:**

    if (phase === 'FAT_LOSS') {
      if (weightTrend > -0.1 && adherence > 85)
        -> REDUCE_CALORIES, -100, 'Plateau detected'
      if (weightTrend < -1.0)
        -> INCREASE_CALORIES, +150, 'Loss rate too aggressive'
      if (strengthTrend < -10)
        -> INCREASE_PROTEIN, +20, 'Strength preservation'
    }

`[cmd]` **Das ist der Rechenweg der Kachel `Weekly
auto-adjustment`**, die heute die Marke traegt:

    wartet auf: eine Regelauswertung je Woche — es gibt weder
    Regeln in der Datenbank noch einen Lauf, der sie anwendet

`[read]` **Die Regeln gibt es** — **im Altrepo, mit Schwellen und
Begruendungstexten.** `[read]` **Was fehlt, ist der Lauf.**

## Struktur ja, Code nie

`[read]` **Dieser Punkt schlaegt NICHT vor, Code zu uebernehmen.**

`[read]` **Was zu uebernehmen ist:** die ZAHLEN und die SCHWELLEN —
**sie sind Fachwissen, kein Code**, und sie stehen dort mit
Varianten und Guards, die sich sonst jemand ausdenken muesste.

`[cmd]` **Der Vermerk an der Kachel muesste dann anders lauten** —
nicht *,,es gibt keine Regeln"*, sondern *,,die Regeln liegen in
`referenz/…/goal-phase-models.md`, der Lauf fehlt"*.

`[read]` **Ein Vermerk mit falschem Grund verhindert, dass jemand
nachsieht** — und hier hat vier Tage lang niemand nachgesehen.

## Warum nicht sofort umgesetzt

`[read]` **Welche Zahl aus dem Bereich gilt, ist Toms
Entscheidung** — `LEAN_BULK` nennt 200 bis 400, **und die Spec sagt
nirgends, wie daraus eine Zahl wird** (gemessen in G-511).

`[read]` **Und es haengt an G-511:** solange die Phase die Kalorien
gar nicht erreicht, ist die Frage nach dem genauen Zuschlag
verfrueht.
