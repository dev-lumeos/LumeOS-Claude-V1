---
nr: G-520
typ: feature
modul: goals
schwere: hoch
angelegt: 2026-09-27
beauftragt: 2026-09-29
agent: claudecode
quellen:
  - docs/specs/Goals/PHASE_MODELS.md:175

braucht: [G-519]
kind_von: G-519
entscheidung: E-68

beruehrt:
  tabellen:
    - goals.goal_phases
    - goals.nutrition_targets
    - recovery.checkins
  dateien:
    - docs/specs/Goals/PHASE_MODELS.md

zahlen:
  gemessen: 2026-09-27
  waechter_in_der_spec: 7
  anpassungsregeln_in_der_spec: 6
  gebaut: 0
---

# G-520 - der Anpassungsalgorithmus und die sieben Uebergangswaechter fehlen

## Der Befund

`[cmd]` **`docs/specs/Goals/PHASE_MODELS.md` Zeile 175 bis 223 fuehrt
zwei Bauteile, die es im Repo nicht gibt:**

**1. `weeklyAdjustment(data, phase)`** — die woechentliche Korrektur,
mit Bedingungen UND Betraegen:

| Phase | Bedingung | Aktion |
|---|---|---|
| fat_loss | `weightTrend > -0.1` und `calorieAdherence > 85` | `-100 kcal` (Plateau) |
| fat_loss | `weightTrend < -1.0` | `+150 kcal` (zu schnell) |
| fat_loss | `strengthTrend < -10` | `+20 g Protein` |
| lean_bulk | `weightTrend > 0.75` | `-100 kcal` |
| lean_bulk | `weightTrend < 0.1` und `calorieAdherence > 85` | `+100 kcal` |
| alle | `hrv7d < hrv_baseline * 0.85` | `recovery_alert` |

**2. Die Waechtertabelle**, sieben Zeilen, ebenfalls mit Betraegen —
darunter zwei, die es nur dort gibt: **BF% unter 5 % (M) / 10 % (F)
loest eine Gesundheitswarnung aus**, und **max_duration_weeks
erreicht empfiehlt einen Uebergang.**

`[read]` **Das ist keine Entscheidung, das ist Bauarbeit.** Die
Betraege stehen da, die Bedingungen stehen da. Was fehlt, ist der
Aufrufer.

## Was die Rechnung braucht

`[read]` **Vier Eingangsgroessen, je eine Frage an den Bestand:**

- `weightTrend` — kg/Woche aus `goals.body_measurements`
- `calorieAdherence` — Prozent aus `nutrition.daily_summary` gegen
  `goals.nutrition_targets`
- `strengthTrend` — Prozent auf den Grunduebungen, aus
  `training.workout_sets` (e1RM liegt als Trigger vor, G-25)
- `hrv7d` gegen `hrv_baseline` — aus `recovery.checkins`

**Vor dem Bauen messen, ob jede der vier ueberhaupt rechenbar ist.**
G-25 hat gezeigt, dass eine Groesse vorhanden sein kann und trotzdem
keine Reihe traegt.

## Nachweiszeilen

**A1** — je Eingangsgroesse gemessen: rechenbar oder nicht, mit
Zeilenzahl und Stichtag. Was nicht traegt, wird gemeldet, nicht
geschaetzt.

**A2** — alle sechs Anpassungsregeln und alle sieben Waechter
gebaut, je mit einem Test, der die Grenze von beiden Seiten trifft.

**A3** — **Grenze zu C-108/F-02 pruefen:** eine Empfehlung ist
keine Bewertung, aber sie ist nah dran. Vorher klaeren, ob der
Waechter vorschlaegt oder handelt.

**A4** — die Gesundheitswarnung bei BF% unter 5 % (M) / 10 % (F)
ist eine Aussage ueber den Koerper des Nutzers. Sie faellt unter
E-74 und braucht die dort festgelegte Form.

**A5** — vier andere Module zeichengleich, Testlaeufe gruen,
Sabotageprobe je Waechter, nichts committet.

## Abhaengigkeit

`[read]` **Blockiert durch G-519.** Solange die Phasen nicht stehen,
gibt es nichts, was angepasst werden koennte.

## Vorbereiteter Auftrag - Claude Code, geschrieben 2026-09-29, 08:20

**Noch nicht raus.** Geht raus, wenn G-519 A5-A8 zurueck ist — dieser
Punkt ist durch G-519 blockiert, und ein Bericht aendert oft die
Praemisse des naechsten Auftrags (`00-LIESMICH.md:405`).

    Bereich: apps/web/src/lib/goals/, apps/web/src/app/v2/goals/,
             packages/scoring/
    Fremd:   supabase/ (Codex) · docs/ (Orchestrator)

### DER WIDERSPRUCH, DER VOR DEM BAUEN ZU KLAEREN IST

`[cmd]` **`PHASE_MODELS.md:175-223` gibt alle Betraege in KALORIEN:**
`-100 kcal` bei Plateau, `+150 kcal` bei zu schnellem Verlust,
`-100 kcal` bei zu schnellem Aufbau, `+100 kcal` bei Stillstand.

`[cmd]` **Nach E1 ist die gespeicherte Groesse die RATE**, nicht das
Kaloriendelta — `goal_phases.zielrate_pct_kg_woche`, und auf
`goal_phases` gibt es null Kalorienspalten (selbst gemessen).

`[read]` **Damit kann `weeklyAdjustment` keine Kalorien verstellen.**
Es verstellt die Rate, und die Spec-Betraege werden umgerechnet:

    kcal/Tag = 11 x Rate(% KG/Woche) x Gewicht(kg)

    -100 kcal bei 80 kg  ->  -0,114 %/Woche
    +150 kcal bei 80 kg  ->  +0,170 %/Woche

**Die Umrechnung haengt am Gewicht.** Derselbe kcal-Betrag ist bei
45 kg eine andere Rate als bei 120 kg — das ist genau der Befund, der
zu E1 gefuehrt hat. **Rechne jede Anpassung als Rate und belege die
Umrechnung mit einem Test an beiden Raendern.**

`[read]` **Die Aussengrenze bleibt:** eine Anpassung darf die Rate
nicht ueber `-2,5 … 1,5` hinaustragen, und das Vorzeichen je Phasenart
bleibt gewahrt (`goal_phases_zielrate_passt_zur_art`). Eine Anpassung,
die gegen einen CHECK laeuft, wird zu einem Hindernissatz, nicht zu
einem HTTP 500 — G-527 hat den Weg dafuer gebaut.

### A1 - zuerst messen, ob die vier Eingangsgroessen tragen

    weightTrend        kg/Woche aus goals.body_measurements
    calorieAdherence   Prozent aus nutrition.daily_summary gegen
                       goals.nutrition_targets
    strengthTrend      Prozent auf den Grunduebungen aus
                       training.workout_sets (e1RM liegt als Trigger
                       vor, G-25)
    hrv7d / hrv_baseline   aus recovery.checkins

Je Groesse: rechenbar oder nicht, mit Zeilenzahl und Stichtag. **Was
nicht traegt, wird gemeldet, nicht geschaetzt.** G-25 hat gezeigt, dass
eine Groesse vorhanden sein kann und trotzdem keine Reihe traegt.

`[read]` **A1 entscheidet, ob A2 ein Auftrag ist oder vier.** Genau wie
bei G-522 A1, wo von fuenf Modulen nur zwei einen Tagesscore liefern
konnten.

### A2 - sechs Regeln, sieben Waechter

Alle mit einem Test, der die Grenze von BEIDEN Seiten trifft. Die
Bedingungen und Betraege stehen in der Spec; **was fehlt, ist der
Aufrufer.**

`[cmd]` **Zwei Waechter gibt es nur dort:** BF% unter 5 % (M) / 10 % (F)
loest eine Gesundheitswarnung aus, und `max_duration_weeks` erreicht
empfiehlt einen Uebergang.

`[read]` **`max_duration_weeks` existiert nirgends als Daten** — das ist
G-529 A3 und liegt bei Codex. Bis dahin ist dieser Waechter nicht
rechenbar und wird als solcher gemeldet, nicht mit einer geratenen Dauer
gebaut.

### A3 - die Grenze zu C-108/F-02

Eine Empfehlung ist keine Bewertung, aber sie ist nah dran. **Vorher
klaeren, ob der Waechter vorschlaegt oder handelt.** Ein Waechter, der
die Rate selbst verstellt, trifft eine Entscheidung ueber den Nutzer.

### A4 - die Gesundheitswarnung faellt unter E-74

BF% unter 5 % (M) / 10 % (F) ist eine Aussage ueber den Koerper des
Nutzers. **Sie braucht die in E-74 festgelegte Form** — nachlesen, nicht
erfinden.

### A5 - die Grenze

Vier andere Module zeichengleich vorher/nachher, Testlaeufe gruen,
Sabotageprobe je Waechter in beide Richtungen. Nachweise auf
`test-user@lumeos.local`. Nichts committen, nichts pushen.

### Nachzug aus G-519, 2026-09-29 - VOR dem Bauen lesen

`[cmd]` **A6 von G-519 hat FUENF Arten gemessen, die ins Leere fuehren,
nicht sieben:** `recomp`, `contest_prep`, `reverse_diet`,
`expert_bb_annual`, `peak_week`. **`maintenance` liefert mit Rate 0,0 ein
Ziel** (der CHECK erlaubt `|x| <= 0,1`), und `fat_loss`, `lean_bulk`,
`mini_cut` liefern ebenfalls, sobald sie anlegbar sind.

`[cmd]` **Und drei davon sind ueber `goals.goal_phase_start` heute NICHT
anlegbar** — die Funktion hat keinen Rate-Parameter, der CHECK verlangt
die Rate aber `NOT NULL`. **Das ist G-531 und liegt bei Codex.**

`[cmd]` **Bis G-531 steht, hat `apps/web/src/lib/goals/phase-write.ts`
einen zweigeteilten Schreibweg:** ohne Rate die Funktion, mit Rate ein
`INSERT` mit vorheriger Sperrpruefung. `[read]` **Wenn dein
Anpassungsalgorithmus eine Rate schreibt, laeuft er ueber denselben
zweiten Weg** — und die Sperrpruefung ist kein gleichwertiger Ersatz fuer
die `23505`-Sperre. **Ein Waechter, der selbsttaetig schreibt, macht aus
einem hinnehmbaren Augenblick einen Dauerzustand.** Das ist ein Grund
mehr, A3 (vorschlagen oder handeln?) vor A2 zu klaeren.

`[cmd]` **`max_duration_weeks` existiert weiterhin nirgends als Daten.**
Der Waechter dazu ist nicht rechenbar und wird als solcher gemeldet,
nicht mit einer geratenen Dauer gebaut. Das ist G-529 A3, und es liegt
hinter G-531.
