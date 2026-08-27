---
nr: C-313
typ: entscheidung
modul: medical
schwere: mittel
angelegt: 2026-08-27
braucht: []
kind_von: C-296
kinder: []
entscheidung: E-15
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-313 - 25 Regeln koennen nicht feuern

## Befund

(neu 2026-08-27,
  **erhoben**). Aus C-296.

  `[cmd]` **Codex hat gemessen:** von 27 Operatoren in
  `rule_catalog.conditions` haben **12 echte Pfade** im Evaluator,
  **14 fehlen vollstaendig**, und `dsl` ist fuer **3 von 15** Regeln
  individuell behandelt. **25 Regeln sind damit unbehandelt** — vier
  `high`, **keine `critical`**.

  `[cmd]` **Die vier `high`:** `wr_drug_hyperkalemia_lab` und
  `wr_drug_testosterone_hct` (`lab_above`), `wr_lab_biotin` (`lte`,
  `substance_gte`), `wr_lab_vitc_glucose` (`eq`). `[read]` **Alle vier
  verknuepfen Medikamente oder Supplements mit Laborwerten.**
  `wr_lab_biotin` ist die Regel gegen Biotin-Interferenz bei
  Troponin- und TSH-Messungen.

  `[cmd]` **Die Klonprobe entscheidet:** ein erfundener Operator
  `c313_unknown_operator` endet **lautlos mit `not_fulfilled`, ohne
  Fehler.**

  `[read]` **Die Regeln sind nicht defekt — sie sind unsichtbar, und
  das System meldet Vollzug.** Wer die 64 Zeilen im Katalog zaehlt,
  zaehlt 64 wirksame Regeln.

  `[cmd]` **Ursache: unvollstaendige C-133-Implementierung**, kein
  Verlust durch Schritt 145. `[read]` **Also eine offene Baustelle,
  kein Defekt** — die Regeln wurden eingespielt, bevor der Evaluator
  sie auswerten konnte.

  `[read]` **Meine Ausgangsmessung war zweimal falsch gemessen:** die
  Suche nach dem Operatornamen als Zeichenkette war zu weit (15
  fehlend), die Suche nach `WHEN '<op>'` zu eng (0 Treffer fuer alle
  27, auch die funktionierenden). **Der Evaluator ist nicht als
  `CASE`-Kaskade gebaut.**

  ### Die Entscheidung, die ansteht

  **1 · Alle 14 nachbauen** — vollstaendig, Wochen, und
  `wr_lab_biotin` wirkt erst am Ende.
  **2 · Die vier `high` zuerst** — `lab_above`, `lte`,
  `substance_gte`, `eq`: vier Operatoren fuer vier Regeln.
  **3 · Erst laut scheitern lassen** — ein unbekannter Operator
  wirft, statt still nicht zu erfuellen.

  `[read]` **Vorschlag: 3, dann 2.** Solange ein unbekannter Operator
  schweigt, entsteht derselbe Fehler mit der naechsten Kimi-Welle
  wieder — und niemand merkt es. **Erst den Melder, dann die
  Regeln.**
