---
nr: G-525
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-09-27
quellen:
  - docs/specs/Goals/FEATURES.md
  - docs/specs/Goals/DATABASE.md

beruehrt:
  tabellen:
    - goals.goal_milestones
    - goals.user_goals
  dateien:
    - docs/specs/Goals/FEATURES.md
    - docs/specs/Goals/DATABASE.md

zahlen:
  gemessen: 2026-09-27
  zeilen: 13
  davon_aus_seed: 13
  davon_prozentual: 0
  mit_schwelle: 0
---

# G-525 - Meilensteine gibt es nur als Seed

## Der Befund

`[cmd]` **Alle 13 Zeilen in `goals.goal_milestones` am 2026-09-27:**

    source = 'seed'                 13 von 13
    milestone_type = 'percentage'     0
    threshold_pct IS NOT NULL         0

Die Typen verteilen sich auf `absolute_value` (10) und `behavioral`
(3). **Kein einziger prozentualer Meilenstein.**

`[cmd]` **Der CHECK erlaubt ihn:** `goal_milestones_type_ck` fuehrt
`percentage`, und `goal_milestones_target_ck` verlangt dafuer
`threshold_pct`. Die Spalte ist da, sie ist leer.

## Was die Spec verlangt

`[read]` **`FEATURES.md` Abschnitt 7, erster Punkt:** ,,Automatische
Milestones: 25%, 50%, 75%, 100%". `DATABASE.md` Abschnitt 4 fuehrt
dazu `auto_generated BOOLEAN DEFAULT true` und
`percentage_threshold NUMERIC(5,2) -- 25 / 50 / 75 / 100`.

`[cmd]` **Live heisst die Spalte `threshold_pct` statt
`percentage_threshold`, und `auto_generated` gibt es nicht** —
stattdessen traegt `source` die Herkunft, mit `derived` als
vorgesehenem Wert im CHECK. **Der Platz fuer ,,automatisch entstanden"
ist also gebaut und wird nicht benutzt.**

## Was fehlt

`[read]` **Der Erzeuger.** Es gibt `goals.goal_milestone_status` —
das bewertet einen bestehenden Meilenstein. Es gibt nichts, das aus
einem neuen Ziel vier Meilensteine macht.

`[read]` **Und die Feier fehlt auch.** `FEATURES.md` nennt ein
Celebration-System, das Coach und Buddy ausloesen. Dafuer braucht es
erst einen Meilenstein, der von selbst erreicht wird.

## Nachweiszeilen

**A1** — messen, wo ein Ziel entsteht (`active_goal_create` liegt
vor) und ob dort vier Zeilen mitentstehen koennen, ohne den
Schreibweg zu verbiegen.

**A2** — die vier Schwellen bei jedem neuen Ziel mit
`source = 'derived'`, `milestone_type = 'percentage'`. **Nicht bei
bestehenden Zielen nachtragen** — das waere eine Wanderung durch
fremde Daten.

**A3** — Erreichen heisst: `progress_pct` des Ziels kreuzt die
Schwelle. Messen, ob `progress_pct` ueberhaupt fortgeschrieben wird;
`refresh_user_goal_progress` deutet darauf hin, aber die Existenz
einer Funktion belegt ihren Lauf nicht.

**A4** — ein Test, der ein Ziel von 20 auf 30 Prozent hebt: der
25er-Meilenstein muss kippen, der 50er nicht.

**A5** — Nachweise auf `test-user@lumeos.local`.
