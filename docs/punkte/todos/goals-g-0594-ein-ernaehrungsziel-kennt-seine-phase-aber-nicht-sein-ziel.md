---
nr: G-594
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-03

braucht: [G-563, A-95]
kind_von: A-95

quellen:
  - docs/punkte/erledigt/goals-g-0563-berechne-zielwerte-waehlt-selbst-eine-phase.md
  - docs/punkte/erledigt/goals-g-0559-phase-am-deckelt-auf-eine-phase.md

beruehrt:
  tabellen:
    - goals.nutrition_targets
    - goals.goal_phases
  dateien: []
---

# Ein Ernaehrungsziel kennt seine Phase, aber nicht sein Ziel

## Der Befund — A-95 hat ihn sichtbar gemacht, nicht erzeugt

`[cmd]` **`goals.nutrition_targets` traegt `phase_id`, aber keine
`goal_id`** — gemessen am 03.10. gegen `information_schema.columns`:

    user_id · gueltig_ab · kcal · protein_g · carbs_g · fat_g ·
    herkunft · tdee · nutrition_goal · notiz · created_at ·
    updated_at · linoleic_acid_g · alpha_linolenic_acid_g ·
    fiber_g · phase_id · zielrate_pct_kg_woche · body_weight_kg ·
    tdee_herkunft · tdee_history_id

    Spalte goal_id:  0

`[cmd]` **Der Trigger `nutrition_targets_assign_phase` (aktiv, `O`) muss
das Ziel deshalb aus den Phasen ableiten** — und er weigert sich, zu
raten:

    SELECT max(p.phase_id::text)::uuid, max(p.goal_id::text)::uuid,
           count(*)
      INTO v_phase_id, v_goal_id, v_phase_count
      FROM goals.phase_am(NEW.user_id, NEW.gueltig_ab) p;

    IF v_phase_count > 1 THEN
      RAISE EXCEPTION
        'nutrition_targets: mehrere aktive Phasen am Gueltigkeitstag;
         Zielbezug fehlt' USING ERRCODE = '23514';
    END IF;

`[read]` **Das `max()` ist KEIN stilles Auswaehlen** — es ist der eine
Wert, wenn es genau einen gibt, und bei zwei bricht die Funktion laut ab.
**Das ist richtig gebaut.** Die Funktion nennt die Luecke selbst:
*„Zielbezug fehlt."*

### Warum es jetzt zaehlt

`[cmd]` **Seit A-95 traegt `test-user@lumeos.local` zwei offene Phasen**
an zwei Zielen — das war der Zweck des Seeds:

    30000000-...-901  fat_loss   ab 2026-05-19   offen
    30000000-...-902  lean_bulk  ab 2026-05-20   offen
    goals.phase_am(test-user, heute)  ->  2

`[cmd]` **Gegenprobe:** `tom.seed@example.com` hat eine offene Phase →
`phase_am` gibt 1, der Trigger laeuft.

`[read]` **Damit ist jeder Schreibvorgang auf `nutrition_targets` mit
`herkunft = 'formel'` fuer test-user ab heute unmoeglich** — er faellt mit
`23514`. **Und test-user ist der Nutzer, auf dem laut Projektregel jeder
Nachweis zu fuehren ist.** Wer als naechstes eine
Ernaehrungsziel-Oberflaeche beweisen soll, laeuft in diese Wand.

`[cmd]` **Bestand heute:** je eine Zeile in `nutrition_targets` fuer dev,
max.seed, sarah.seed, test-user und tom.seed. **Die bestehende Zeile des
test-users ist aus der Zeit mit einer Phase** — sie bleibt lesbar, nur
neue kommen nicht mehr hinein.

## Was zu entscheiden ist, bevor gebaut wird

`[read]` **Drei Formen, und sie unterscheiden sich im Datenmodell:**

1. **`nutrition_targets` bekommt eine `goal_id`** — der Aufrufer sagt,
   fuer welches Ziel er rechnet; der Trigger nimmt sie und braucht
   `max()` nicht mehr. `[annahme]` **Das passt zu G-563 und E-89** und ist
   die gerade Linie: `berechne_zielwerte` verlangt seit A-95 ein Ziel,
   also soll die Tabelle eines tragen.
2. **Der Trigger nimmt `NEW.phase_id`, wenn er gegeben ist** — die Phase
   kennt ihr Ziel, und die Spalte existiert schon. `[cmd]` **Heute geht
   das nicht**, weil die Zaehlpruefung VOR der `phase_id`-Pruefung
   feuert: auch wer die Phase nennt, faellt an `count(*) > 1`. **Die
   kleinste Aenderung von allen** — aber sie laesst die Tabelle ohne
   Zielbezug.
3. **Ein Nutzer darf nur eine offene Phase haben** — dann war der A-95-
   Seed falsch. `[read]` **Das widerspricht G-559 und G-563**, die beide
   darauf gebaut sind, dass es mehrere gibt. **Nicht empfohlen, aber zu
   nennen**, weil es die Frage beantwortet.

`[annahme]` **Form 1 mit Form 2 als Durchgriff** — Spalte dazu, und wenn
nur `phase_id` kommt, leitet der Trigger das Ziel aus der Phase ab statt
aus `phase_am`. **Aber das ist eine Entscheidung ueber das Datenmodell,
keine Messung** — sie gehoert Tom.

**Nicht Teil:** A-95 (erledigt, hat den Fall nur aufgedeckt) · die
Oberflaeche fuer Ernaehrungsziele · G-532/A2, das auf
`goal_contributions` wartet.
