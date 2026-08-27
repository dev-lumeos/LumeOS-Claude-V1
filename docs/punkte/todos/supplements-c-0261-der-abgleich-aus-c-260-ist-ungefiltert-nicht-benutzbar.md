---
nr: C-261
typ: befund
modul: supplements
schwere: mittel
angelegt: 2026-08-24
braucht: []
kind_von: C-260
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-261 - Der Abgleich aus C-260 ist ungefiltert nicht benutzbar

## Befund

(neu 2026-08-24). Nachtrag zu C-260.

  `[cmd]` **330.397 Vergleichszeilen: FEHLT 293.559 (88,9 %) ·
  ABWEICHEND 23.336 (7,1 %) · UEBERNOMMEN 13.502 (4,1 %).**

  `[cmd]` **Vom Orchestrator nachgemessen — die FEHLT-Zeilen sind
  ueberwiegend Artefakte.** Haeufigste Felder: `entity_id` 6.006 ·
  `source_ids[]` 4.044 · `_baseline_hashes` 5.735 ·
  `mismatch_dimensions[]` 2.308 · `generated_at` 1.560. **Lauf-
  Metadaten, keine Inhalte.**

  `[cmd]` **Haeufigste „Entitaeten" sind Dateinamen:** `brand_searches`
  10.037 · `supp_searches` 7.188 · `L_result` 5.695 · `amb_details`
  4.404.

  `[cmd]` **Staerkste Quellen sind Caches und Sicherungen:**
  `K_cache/brand_searches.json` · `_atlas_backup_pre_merge` ·
  `_G_ckpt.json` · `_apps_stage2.json`.

  `[cmd]` **12.727 verschiedene Feldnamen, 2.198 „Entitaeten"** bei 290
  Substanzen und 498 Wirkstoffen.

  `[read]` **Der Auftragstext hat das nicht ausgeschlossen — mein
  Fehler.** Der Lauf hat getan, was dastand.

  ### Zwei Korrekturen an meiner eigenen Vorgabe

  `[cmd]` **Die Gegenprobe war falsch.** Ich hatte *„19 fehlende CAS"*
  vorgegeben; `cas_number` steht auf oberster Ebene, nicht in
  `external_ids`. BPC-157 traegt `137525-51-0`, exakt den Reportwert.
  **Tatsaechlich fehlen 2.** `[read]` **Codex hat widersprochen statt
  passend gemacht** — genau das war verlangt.

  `[cmd]` Ebenso die Dateizahl: **384 statt 390**, plus 1.251 rekursiv.

  ### Was der wertvolle Teil ist

  `[cmd]` **Die ABWEICHEND-Zeilen sehen anders aus** — dort stehen
  Sachfelder: `cyp.CYP3A4.note` 486 · `cyp.CYP2D6.note` 450 ·
  `renal.severity_bands[].effect` 515 · `hepatic.sources[]` je 698 ·
  `thailand.last_verified` 448 · `wada.last_verified` 444.

  `[read]` **`last_verified` ist Rauschen, `cyp.*.note` ist eine
  Aussage.** Beides steht heute nebeneinander — der echte Konflikt geht
  darin unter.
