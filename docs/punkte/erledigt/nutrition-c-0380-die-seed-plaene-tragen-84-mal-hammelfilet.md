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
erledigt: 2026-09-02
commit: 6992fca2
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

**2026-09-02, Orchestrator. Nachgemessen.**

    Plan               kcal/Tag          Protein/Tag     Vielfalt
    Cut 4-Meal 2200    2.190,8-2.212,5   162,8-183,1 g   12 Lebensmittel
    Lean bulk 3100     3.084,8-3.131,9   172,9-211,5 g   13
    Buddy auto-plan    2.668,5-2.714,1   170,9-194,9 g   14

`[cmd]` **Gegen die Ziele: 2.200, 3.100, 2.700** — **jeder Plan
trifft sein Ziel auf unter ein Prozent.**

`[cmd]` **Nachgemessen: 0 Hammelfilet-Positionen.** `[cmd]` **12, 13
und 14 verschiedene Lebensmittel je Plan, sieben Tagesmenues.**

`[read]` **Und die Zusammenstellung folgt der Vorgabe:** vier
Positionen je Tag aus Milchprodukten, Gefluegel/Fisch/Fleisch,
Getreide und Nuessen.

### Der Seed ist dauerhaft, nicht nur eingespielt

`[cmd]` **`testdaten-einspielen.ts:2167` erzeugt die drei Plaene
kuenftig mit.** `[cmd]` **Und `380_seed_meal_plan_variety.sql` ist
idempotent und ruehrt nur diese drei an.**

`[read]` **Das war die Frage im Auftrag** — *,,sag es, damit es beim
naechsten Kettenlauf nicht verschwindet."* **Er hat es nicht nur
gesagt, sondern verhindert.**

### Und er hat den Kopierlauf nicht gestartet

`[cmd]` **Begruendung: er wuerde den protokollierten Aufbau-Plan
beruehren.**

`[read]` **Richtig.** `[cmd]` **Der Aufbau-Plan traegt 6
Protokollzeilen und ist der einzige aktive** — **ein allgemeiner
Kopierlauf haette die Compliance-Anzeige zerstoert, die seit G-315
sichtbar ist.**

`[cmd]` **Nachgemessen: Aufbau-Wochenplan unveraendert, 6
Protokollzeilen, keine angelegt.**

### Der Nachweis lief in beide Richtungen

`[cmd]` **`nutrition-c380-seed-plan-variety.test.ts` lief erst rot
gegen die 84 Hammelfilet-Zeilen, danach gruen.**

`[read]` **Genau das verlangt die Regel: eine Pruefung ohne
eingebauten Fehler misst nichts.**

**Abgenommen.**

