---
nr: C-87
typ: befund
modul: training
schwere: mittel
angelegt: 2026-08-18
braucht: []
kind_von: G-64
kinder: []
entscheidung: null
beruehrt:
  tabellen: ["training.exercises"]
  dateien: []
zahlen: null
---

# C-87 - `exercises_select` war aus der Datenbank verschwunden

## Befund

(neu 2026-08-18). **Behoben, aber die Ursache ist offen.** Befund aus
  G-64.

  `[cmd]` **`training.exercises` hatte RLS an und null Policies.** Alle
  sieben anderen `training`-Tabellen hatten welche — `equipment` 1,
  `exercise_muscles` 1, `muscle_groups` 1, `workout_*` je 4.

  `[cmd]` **Es ist Drift, kein Entwurf:** Die Kette definiert
  `exercises_select` in `100_training_schema.sql:266`, und sie greift —
  alle 1.416 sind `is_active`, `public.is_admin()` existiert.

  `[cmd]` **Wiederhergestellt am 2026-08-18**, woertlich aus der Kette.
  **Der Beleg fuer das Verschwinden:** `DROP POLICY IF EXISTS` meldete
  *„does not exist, skipping"*. Danach 1.416 Zeilen als `authenticated`.

  **Offen:** Wie ist sie verlorengegangen? `[read]` Ein Kettenschritt,
  der die Tabelle neu anlegt, waere der Verdacht — **`108` und `109`
  haben `training` angefasst.** `[cmd]` **Und die
  Schema-Vollstaendigkeitspruefung hat es nicht gemeldet** — sie prueft
  Tabellen und Spalten, offenbar nicht Policies.
