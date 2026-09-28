---
nr: G-520
typ: feature
modul: goals
schwere: hoch
angelegt: 2026-09-27
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
