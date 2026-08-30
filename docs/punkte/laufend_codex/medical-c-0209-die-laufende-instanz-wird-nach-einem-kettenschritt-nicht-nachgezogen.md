---
nr: C-209
typ: blocker
modul: medical
schwere: hoch
angelegt: 2026-08-22
braucht: []
kind_von: C-215
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-30
beruehrt:
  tabellen: ["medical.biomarker_reference_ranges"]
  dateien: ["supabase/_pipeline/_validierung/testdaten-pruefen.ts"]
zahlen: null
---

# C-209 - Die laufende Instanz wird nach einem Kettenschritt nicht nachgezogen

## Befund

(neu 2026-08-22).

  `[cmd]` `tools/testdaten-pruefen.ts` ist rot:
  `medical.biomarker_reference_ranges` ist live **564**, erwartet
  **566**. `[cmd]` `144_biomarker_spec_enrichment.ts:771` und
  `schema-sollstand.json:1459` sagen beide 566.

  `[read]` **Kein Fehler in C-191 und keiner in C-192.** Die Erwartung
  ist der neuen Wahrheit vorausgeeilt, der Bestand nicht nachgezogen —
  weil wir bewusst nie gegen die laufende Datenbank arbeiten und
  niemand einen Schritt dafuer hat.

  `[read]` **Ein dauerhaft roter Waechter wird uebersprungen.** Dasselbe
  Muster wie der Selbsttest, der die falsche Pruefung feuerte.

  ### Nachgeschaerft 2026-08-22 — es sind zwei Dinge

  `[cmd]` Codex meldet aus C-215 die Zahlen **umgekehrt**: *„ist 566,
  erwartet 564"*. **Beide Beobachtungen stimmen — sie messen
  verschiedene Datenbanken.**

  | | Bestand | Erwartung |
  |---|---:|---:|
  | laufende Instanz | **564** | 566 |
  | frisch gebaute Kette | **566** | 564 |

  `[cmd]` **Auf der Wegwerf-Instanz erzeugt C-191 die zwei
  ApoB/Prolactin-Zeilen**, also 566 — waehrend
  `testdaten-pruefen.ts:126` noch 564 erwartet.
  `[cmd]` **Live steht 564**, weil die Kette dort nie lief, waehrend
  `144_biomarker_spec_enrichment.ts:772` auf 566 steht.

  **Damit zerfaellt der Punkt in zwei Arbeiten:**

  **1.** `testdaten-pruefen.ts` traegt eine stehengebliebene Erwartung.
  Sie gehoert auf 566 gezogen — das ist eine Zeile und blockiert heute
  jeden Kettenlauf mit einem Fehler, der keiner ist.

  **2.** Die laufende Instanz ist nie nachgezogen worden. `[read]` Hier
  ist die Frage groesser als die Zahl: **wann und wie wird sie nach
  einem Schemaschritt aktualisiert, ohne Toms Daten zu verlieren?**
  Solange das offen ist, faellt es bei jeder Pipeline-Aenderung wieder
  an.

## Auftrag

**Mitbeauftragt mit G-280 am 2026-08-30.** Bericht dort.

`[read]` **Dieselbe Klasse wie der Serverbefund: die Arbeitsumgebung
sagt nicht, in welchem Zustand sie ist.**

`[cmd]` **C-195 ist der bekannte Fall:** die Kette ist gruen, die
Aenderung steht nicht live. `[cmd]` **Am 30.08. hat es G-273
blockiert** — `reference_assessment_window_flags` lag 78 Zeilen lang
in der Kette und war nie eingespielt.

`[read]` **Miss, ob ein Kettenschritt melden kann, dass er nicht live
ist** — **oder ob die laufende Instanz sagen kann, wie weit sie ist.**
