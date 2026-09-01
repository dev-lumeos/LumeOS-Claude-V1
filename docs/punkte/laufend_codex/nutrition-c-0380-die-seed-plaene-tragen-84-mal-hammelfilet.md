---
nr: C-380
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: null
entscheidung: null
agent: codex
beauftragt: 2026-09-02
beruehrt:
  tabellen: [nutrition.meal_plan_entries]
zahlen:
  gemessen: 2026-09-02
  hammelfilet: 84
---

# C-380 — die Seed-Plaene tragen 84 mal Hammelfilet

## Befund

Tom, 2026-09-02: *,,selten so einen scheiss gesehen wie das gerade
4mal am tag hammelfilet ein monat lang."*

`[cmd]` **Der Orchestrator hat am 02.09. drei Plaene auf
`dev@lumeos.app` gefuellt** — **mit `select id from nutrition.foods
order by id limit 1`.**

`[cmd]` **Das ergab 84 Positionen *Hammel Filet/Lende, gegrillt*** —
viermal taeglich, sieben Tage, drei Plaene.

`[read]` **Kein Fehler im Code. Ein fauler Seed.**

## Was die Plaene sein sollen

    Cut 4-Meal 2200      2200 kcal, 165 g Protein, Defizit
    Lean bulk 3100       3100 kcal, 190 g Protein, Aufbau
    Buddy auto-plan      2700 kcal, 175 g Protein

`[cmd]` **Die Zielwerte stehen an `meal_plans`** — `target_kcal`,
`target_protein_g`.

`[read]` **Die Positionen sollten dazu passen** — **nicht exakt
gerechnet, aber plausibel:** Fruehstueck, Mittag, Abend, Snack aus
verschiedenen Lebensmittelgruppen.

## Und die Lage sonst

`[cmd]` **Ein Plan ist aktiv** (`Aufbau-Wochenplan`), einer pausiert,
zwei zugewiesen. `[cmd]` **Ghost Entries entstehen nur aus dem
aktiven** — das ist richtig.

## Auftrag — die Plaene mit passendem Inhalt fuellen

**Beauftragt am 2026-09-02.**

`[read]` **Der Orchestrator hat drei Plaene gefuellt, indem er das
erste Lebensmittel nach `id` genommen hat.** **84 mal Hammelfilet.**

### Was zu tun ist

**Die 84 Positionen ersetzen, passend zum Ziel des Plans.**

    Cut 4-Meal 2200      2200 kcal, 165 g Protein
    Lean bulk 3100       3100 kcal, 190 g Protein
    Buddy auto-plan      2700 kcal, 175 g Protein

`[cmd]` **Die Zielwerte stehen an `meal_plans`** — `target_kcal`,
`target_protein_g`.

`[read]` **Nicht exakt rechnen, aber plausibel:** je Tag vier
Positionen — Fruehstueck, Mittag, Abend, Snack — **aus verschiedenen
Lebensmittelgruppen.**

`[cmd]` **`nutrition.foods` traegt 7.140 Zeilen mit `sort_weight` als
Gruppenpriorität** (E-43, BLS 4.0). `[cmd]` **Und
`food_nutrient_snapshot()` liefert die Naehrwerte je Menge** — damit
kannst du die Tagessumme pruefen.

`[read]` **Und die Woche darf sich unterscheiden** — **sieben gleiche
Tage sind derselbe Fehler in klein.**

### Wo es hingehoert

`[read]` **Das ist Seed-Arbeit, kein Produktcode.** `[cmd]`
**C-150 hat den `Aufbau-Wochenplan` als Kettenschritt angelegt** —
**dieselbe Stelle, wenn es dauerhaft sein soll.**

`[read]` **Wenn du es nur auf `dev` einspielst: sag es, damit es beim
naechsten Kettenlauf nicht verschwindet.**

### Was nicht zu tun ist

**Den `Aufbau-Wochenplan` nicht anfassen** — er ist aktiv und traegt
Protokollzeilen.
**Keine `meal_plan_logs` anlegen** — sechs stehen schon.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    je Plan          Tagessumme kcal und Protein, gegen das Ziel
    Vielfalt         wie viele verschiedene Lebensmittel
    Woche            unterscheiden sich die sieben Tage
    Aufbau-Plan      unveraendert, gezaehlt

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
