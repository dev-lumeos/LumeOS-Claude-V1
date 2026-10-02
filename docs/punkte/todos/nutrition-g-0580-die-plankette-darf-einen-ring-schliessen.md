---
nr: G-580
typ: fehler
modul: nutrition
schwere: mittel
angelegt: 2026-10-02

braucht: [G-579]
kind_von: G-579

quellen:
  - docs/punkte/erledigt/nutrition-g-0579-der-plansprung-hat-keinen-aufrufer.md

beruehrt:
  tabellen:
    - nutrition.meal_plans
  dateien:
    - supabase/_pipeline/05_user_tabellen/058b_recipes_meal_plans.sql
---

# Die Plankette darf einen Ring schliessen

## Der Befund

`[cmd]` **Claude Code hat es im G-579-Lauf versehentlich erzeugt und
gemeldet, statt es zu verdecken:** `A → B` und `B → A` gleichzeitig
gesetzt, **beide CHECKs waren zufrieden.** Der Rumpf von
`nutrition.meal_plan_set_next_plan` verbietet nur den Selbstbezug
(`22023`), und `meal_plans_sequence_target_check` koppelt
`lifecycle_type` an `next_plan_id` — **ueber einen Ring sagt keiner von
beiden etwas.**

`[read]` **Er hat dagegen keine Regel erfunden**, und das war richtig:
`moeglicheFolgeplaene` schliesst genau den Plan selbst aus, weil der
Rumpf das verlangt, und nichts weiter. **Eine Anzeige, die mehr verbietet
als das Schema, ist eine zweite Wahrheit.**

## Was zu entscheiden ist

`[read]` **Die Frage ist, was ein Ring im Produkt bedeutet** — und das
ist keine Bauentscheidung:

1. **Ein Ring ist ein Fehler.** Dann gehoert er ins Schema: ein Trigger
   oder eine rekursive Pruefung beim Setzen, mit eigenem SQLSTATE und
   einem Fachtext in `lib/fehler/ladefehler.ts`.
2. **Ein Ring ist erlaubt und bedeutet „laeuft im Kreis".** Dann braucht
   die Anzeige es, nicht das Schema: der Reiter muss sagen, dass die
   Kette zurueckspringt, sonst sieht ein Nutzer eine endlose Folge.
3. **Ein Ring ist unentschieden und bleibt moeglich.** Dann gehoert
   mindestens ein Satz in die Spec, damit der naechste Punkt ihn nicht
   als Fehler meldet.

`[annahme]` **Die erste Form ist wahrscheinlicher** — eine Plankette ist
eine Folge, und eine Folge mit Ring hat kein Ende, das ein Nutzer
erreichen kann. **Aber das ist eine Vermutung, und ein Ring aus drei
Plaenen (A → B → C → A) ist teurer zu pruefen als einer aus zwei.** Die
Tiefe der Pruefung ist Teil der Entscheidung.

**Nicht Teil:** der Plansprung selbst (G-579, erledigt) und die
Aktivierungsregeln (`lifecycle_type`, unveraendert).

**Zu belegen, sobald entschieden:** der Ring aus zwei und aus drei
Plaenen gegen eine Wegwerf-Datenbank · die Gegenprobe, dass eine gerade
Kette weiter durchgeht · der Fachtext, falls es einer wird · kein
`db push`.
