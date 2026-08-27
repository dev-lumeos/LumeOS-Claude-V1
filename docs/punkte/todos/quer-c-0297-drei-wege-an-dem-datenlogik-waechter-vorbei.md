---
nr: C-297
typ: messung
modul: quer
schwere: mittel
angelegt: 2026-08-27
braucht: []
kind_von: C-291
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-297 - drei Wege, an dem Datenlogik-Waechter vorbei

## Befund

(neu
  2026-08-27). Aus der Pruefung von C-291.

  `[cmd]` **Dreizehn echte Probemigrationen gelegt und wieder
  entfernt. Zehn urteilen richtig, drei nicht:**

      DO $outer$ EXECUTE $q$INSERT ...$q$ $outer$   gruen  FALSCH
      CREATE TABLE x AS SELECT * FROM y             gruen  FALSCH
      SELECT * INTO x FROM y                        gruen  FALSCH

  `[read]` **Der geschachtelte Dollar-Block** entsteht, weil
  `ohneKommentareUndStrings()` den inneren `$q$`-Block entfernt, bevor
  der aeussere geprueft wird. **`CREATE TABLE AS` und `SELECT INTO`
  schreiben Daten, ohne einen der sechs Befehle zu nennen.**

  `[read]` **Alle drei sind exotischer als die vier aus C-291** — ein
  Backfill ueber `EXECUTE` ist unwahrscheinlich, `CTAS` in einer
  Migration nicht. **Aber die Aufzaehlung ist jetzt eine
  Aufzaehlung**, und wer eine Aufzaehlung umgeht, tut es an ihrem
  Rand.
