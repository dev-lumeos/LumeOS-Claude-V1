---
nr: C-215
typ: feature
modul: recovery
schwere: mittel
angelegt: 2026-08-22
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: ["recovery.scores"]
  dateien: ["supabase/_pipeline/12_recovery/121_recovery_scores_modalities.sql", "supabase/_pipeline/13_supplements/132a_rule_input_status.sql"]
zahlen: null
---

# C-215 - ACWR rechnet in der Datenbank weiter

## Befund

(neu 2026-08-22).
  **Laeuft bei Codex.** Die zweite Haelfte von C-181.

  `[read]` **Seit `538b7dd` zeigt die Oberflaeche einen Recovery-Score
  OHNE ACWR, die Datenbank rechnet einen MIT.** Zwei Wahrheiten
  nebeneinander — der 79,4 im Bildschirmfoto kam aus der Tabelle, nicht
  aus dem bereinigten Motor.

  `[cmd]` Alles in `121_recovery_scores_modalities.sql`:

  | Zeile | |
  |---|---|
  | 85 | `CREATE FUNCTION recovery.training_load_score(p_acwr NUMERIC)` |
  | 93–97 | die Kurve: NULL→70, **0,8–1,2**→100, drei Abfallzweige |
  | 105 | `CREATE FUNCTION recovery.acwr_for_day(p_user_id, p_entry_date)` |
  | 165 | `acwr_used NUMERIC(8,3)` in `recovery.scores` |
  | 336–337 | Aufruf und Einsetzen in den Score |
  | 485 | `GRANT EXECUTE ON acwr_for_day TO authenticated` |

  `[cmd]` **Die DB-Kurve ist nicht die des Frontends.** Dort galt
  0,8–1,3, hier **0,8–1,2** mit drei Abfallzweigen und einem
  NULL-Fallback auf 70. Eigenstaendig gebaut, eigenstaendig zu
  entfernen — nicht nach dem Muster des Frontends raten.

  `[cmd]` `recovery.scores.acwr_used` ist die einzige `acwr`-Spalte im
  ganzen Schema.

  `[cmd]` **`132a_rule_input_status.sql` ruft `acwr_for_day`** (Zeile
  100) und schreibt den Feldvertrag `training.load_spike` (Zeile
  337–339). **Der Vertrag bleibt** — aber der Aufruf bricht, wenn die
  Funktion faellt. Zu loesen, bevor entfernt wird.

  **Offen fuer Tom:** faellt `acwr_used` als Spalte, oder bleibt sie
  leer stehen? In `recovery.scores` liegen Zeilen, und eine geloeschte
  Spalte nimmt Messwerte mit.
