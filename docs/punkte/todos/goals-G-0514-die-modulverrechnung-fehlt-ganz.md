---
nr: G-514
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-09-26

braucht: []
kind_von: G-510
entscheidung: E-91

beruehrt:
  tabellen:
    - goals.user_goals
  dateien:
    - apps/web/src/app/v2/goals/tab-phase.tsx
    - docs/specs/Goals/DATABASE.md

zahlen:
  gemessen: 2026-09-26
  spec_tabellen: 10
  davon_gebaut: 6
  davon_ohne_treffer: 4
  spec_views: 2
  views_gebaut: 0
---

# G-514 - die Modulverrechnung, der Zweck des Moduls, fehlt ganz

## Der Befund

`[cmd]` **`docs/specs/Goals/DATABASE.md:9-27` nennt zehn Tabellen
und zwei Sichten.** `[cmd]` **Gemessen 2026-09-26 gegen die
Datenbank und das Repo:**

    user_goals                      gebaut      11 Zeilen
    goal_phases                     gebaut       5
    goal_milestones                 gebaut      13
    body_measurements               gebaut     362
    body_circumferences             gebaut      54
    progress_photos                 gebaut       0
    ---------------------------------------------------
    goal_contributions              FEHLT    0 Treffer
    goal_adjustments                FEHLT    0 Treffer
    tdee_settings                   FEHLT    0 Treffer
    weekly_reports                  FEHLT    0 Treffer
    VIEW user_goal_dashboard        FEHLT    0 Treffer
    VIEW weekly_contributions_summ. FEHLT    0 Treffer

`[read]` **Die vier fehlenden sind nicht irgendwelche vier.**

## Warum genau diese vier zaehlen

`[cmd]` **`docs/specs/Goals/README.md:3` und
`CONSOLIDATED_KNOWLEDGE.md:14`:** *,,Goals ist KEIN weiteres
Feature-Modul — es ist der Betriebssystem-Kern."*

`[cmd]` **`goal_contributions` ist die Tabelle, die das einloest** —
sie haelt, **was jedes Modul zu einem Ziel beitraegt.**

`[read]` **Toms Rahmen E-91 sagt dasselbe in seinen Worten:** Goals
ist das, **WOFUER** die vier anderen erfassen. `[read]` **Die
Tabelle, in der dieses *wofuer* zusammenlaeuft, gibt es nicht.**

## Was deshalb Attrappe bleiben MUSS

`[cmd]` **Der ganze `cross`-Reiter** — fuenf Kacheln, alle mit
Marke (`tab-phase.tsx:585-703`):

    Ring-Kopf
    Module contributions       braucht goal_contributions
    Bottleneck identified      braucht goal_contributions
    Achievement probability    braucht goal_contributions
    Weekly report              braucht weekly_reports

`[cmd]` **Und `Cross-module health` im `goals`-Reiter**
(`fehlende-kacheln.tsx:282`).

`[read]` **Die Marken sind richtig gesetzt** — sie nennen Quelle und
Grund. `[read]` **Dieser Punkt sagt nur, dass der Grund EINE Ursache
hat und nicht sechs.**

## Die weiteren Bezeichner ohne Treffer

`[cmd]` **Aus der Spec, null Vorkommen im Repo:**

    phase_calorie_modifier   DATABASE.md:221   -> siehe G-511
    achievement_probability  DATABASE.md:63
    realism_score            DATABASE.md:69
    contribution_score       DATABASE.md:146
    tdee_adaptive/_active    DATABASE.md:215-216
    macro_cycling            DATABASE.md:224

`[cmd]` **`calorie_target` kommt viermal vor** — **ausschliesslich
als `calorie_target_hit_rate` in Coach-Attrappen.** **Im
Goals-Modul: null.**

## Was die Spec anders baut, als wir gebaut haben

`[read]` **Kein Widerspruch, aber es muss jemand wissen:**

`[cmd]` **Die Spec legt die Zielwerte in `goals.tdee_settings`.**
`[cmd]` **Gebaut ist `goals.nutrition_targets`** — **ein Name, den
keine der zehn Specdateien nennt.**

`[cmd]` **Die Spec beschreibt einen Hono-Dienst mit 16 Routen auf
Port 5900** (`API.md:4-25`). `[cmd]` **Gebaut ist Next.js mit
direktem Supabase-Zugriff.**

`[read]` **Beides sind getroffene Entscheidungen, keine Luecken** —
**aber `docs/ssot/00-SPEC-ABGLEICH.md` sollte sie tragen**, sonst
meldet der naechste Abgleich sie wieder als Fehlmenge.

## Nicht in diesem Punkt zu loesen

`[read]` **Ob `goal_contributions` gebaut wird, ist eine
Entscheidung ueber den Umfang** — **sie beruehrt alle fuenf
Module** und gehoert zu Codex, nicht in `apps/`.

`[read]` **Dieser Punkt stellt nur fest, dass sechs Kacheln auf
EINE fehlende Tabelle warten** — und dass das nirgends an einer
Stelle stand.

## Nachtrag 2026-09-28 — aus G-524 zusammengefuehrt

`[cmd]` **G-524 (27.09.) hat dieselbe Messung noch einmal gemacht**
und ist eine Dublette dieses Punktes. Drei Zeilen daraus sind neu
und stehen deshalb hier:

**1. Zwei Teile von `tdee_settings` haben KEINEN Ersatz.**
`[cmd]` `macro_cycling` und `cycling_config` haben null Treffer im
ganzen Repo. **Das ist der Kern von RECOMP** —
`PHASE_MODELS.md` gibt Trainingstag `TDEE+200` und Ruhetag
`TDEE-300`. Ohne diesen Block hat RECOMP keinen Ort, an dem die
zwei Werte stehen koennten. Die Zielwerte selbst sind ersetzt
(`goals.nutrition_targets` plus `goals.adaptive_tdee`).

**2. Der Gueltigkeitszeitraum wird NICHT zur Flagge zurueckgebaut.**
`[cmd]` `DATABASE.md` Abschnitt 2 schreibt `is_active BOOLEAN` und
`UNIQUE (user_id) WHERE (is_active = true)` in die
Tabellendefinition. **Das ist kein gueltiges PostgreSQL** — eine
teilweise Eindeutigkeit geht nur als Index. Live steht sie als
`uq_goal_phases_one_open` auf `(user_id) WHERE actual_end_date IS
NULL`, und `goal_phases` hat `gueltig_ab`/`actual_end_date` statt
einer Flagge. **Damit ist die Phasenhistorie befragbar.** Wer die
Spec woertlich einspielt, baut das zurueck.

**3. `DATABASE.md` ist eine Beschreibung, kein Skript.** Abschnitt 9
schreibt `UUID FK -> goals.user_goals` als Prosa in einen
SQL-Block.

`[read]` **Die TDEE-Reihe ist aus diesem Punkt herausgeloest** und
geht als eigener Auftrag raus: sie blockiert G-523 und damit G-529.
`tdee_settings` waere nur ein Zustand — gebraucht wird eine Reihe.
