---
nr: C-259
typ: feature
modul: quer
schwere: mittel
angelegt: 2026-08-23
braucht: []
kind_von: C-258
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["docs/todo/LAUFEND.md"]
zahlen: null
---

# C-259 - Kimis Bestand ist weit groesser als angenommen — und der Orchestrator hat den Statusbericht nie gelesen

## Befund

(neu 2026-08-23).

  **Tom, 2026-08-23:** *„diese datei schonmal gesehen was kimi
  ueberhaupt schon alles gemacht hat?"*

  ### Der Fehler

  `[read]` **Nein.** Der Orchestrator hat `RESEARCH_STATUS.md` in drei
  Dokumenten erwaehnt — Uebergabe, `LAUFEND.md`, C-257 — und **nie
  geoeffnet.** Auf dieser Grundlage stand mehrfach die Behauptung, Kimi
  habe *„fuer Fachleute recherchiert"* und es gebe keine
  Nutzertext-Quelle. **Das war falsch.**

  `[cmd]` **Und die Bestandsangabe war ebenfalls falsch:** in
  `LAUFEND.md` stand *„Crawls 017 bis 028 auf der Platte, 029 bis 035
  noch nicht angekommen"*. **Tatsaechlich liegen 021A bis 038 dort**,
  plus ein entpacktes `data/`-Verzeichnis.

  ### Was tatsaechlich vorliegt

  `[cmd]` **38 Crawls, 575 Zeilen Statusbericht.** Im entpackten
  `data/`:

  | Ordner | Inhalt |
  |---|---|
  | `substances/` | `supplements.jsonl` **154**, `peptides.jsonl`, `performance_compounds.jsonl` |
  | `medications/` | 498 Wirkstoffe, Formulierungen, Produkte, Regulatory |
  | `platform/` | `warning_rules` 29, `medication_rules` 20, `nutrient_gap_rules` 15, `interactions_matrix` 24, `lab_markers`, `module_field_spec` |
  | `evidence/` | **76 Dateien** — u. a. `biomarker_explanations.jsonl` (66), `symptom_biomarker_map` (102 Kanten), `cyp_enrichment`, `alias_resolution_candidates` |
  | `indexes/` | `lab_trigger_index` (77 Analyte), `aliases`, `cross_domain_substance_mapping` |

  `[cmd]` **Feldabdeckung in `supplements.jsonl` (154 Zeilen):**
  `description` 154 · `dosing` 154 · `safety` 154 · `monitoring` 154 ·
  `warning_triggers` 154 · `quality` 154 · `interactions` 154 ·
  `pharmacology` 154 · `mechanism_of_action` 73 · `lab_effects` 56.

  `[cmd]` **`biomarker_explanations.jsonl` traegt genau die Textsorte,
  die C-258 neu schreiben sollte** — auf Deutsch, kuratiert, mit
  Quellenvermerk und ehrlichem `verified=false`, wo nicht live geprueft:

      marker_id: lab_alt
      what_it_measures: "Alanin-Aminotransferase im Serum; Enzym, das
        bei Hepatozytenschaedigung ins Blut freigesetzt wird ..."
      major_physiological_role: "Katalysiert die Umwandlung von Alanin
        und alpha-Ketoglutarat zu Pyruvat und Glutamat ..."
      common_reasons_high: [ ... ]

  ### Die Einschraenkung, die trotzdem gilt

  `[cmd]` **Kimis `description` ist dieselbe Fachnotiz**, die heute in
  der Datenbank steht: *„Complete fast protein; grade A for MPS/lean
  mass support as part of protein intake targets."*
  `[cmd]` `claimed_effects` **0 von 154**, `common_research_uses`
  **0 von 154**.

  `[read]` **Der Nutzertext fehlt also weiterhin — aber alles
  drumherum ist da.** Dosierung, Sicherheit, Monitoring,
  Warnschwellen, Wechselwirkungen, Pharmakologie, Laboreffekte,
  Biomarker-Erklaerungen. **Es fehlt eine Textebene, nicht die
  Recherche.**

  ### Was daraus folgt

  **C-258 wird angehalten.** In der jetzigen Fassung laesst er Codex
  recherchieren, was seit Wochen auf der Platte liegt.

  **Zu tun, in dieser Reihenfolge:**

  1. **Messen, was aus `data/` bereits in der Datenbank ist und was
     nicht.** `[cmd]` `supplement_evidence`, `supplement_dosing`,
     `supplement_safety` sind befuellt — aber
     `biomarker_explanations`, `symptom_biomarker_map`,
     `nutrient_gap_rules`, `interactions_matrix` und der
     Medikamentenbestand (498) sind im Repo **nicht gemessen worden**.
  2. **Importieren, was fehlt** — Kettenschritte, nicht neu schreiben.
  3. **Erst dann** die Nutzertextebene, und nur fuer die Felder, die
     Kimi nicht liefert.

  `[read]` **Die Lehre ist die alte, an mir selbst:** *vor jedem
  Auftrag vier Quellen lesen — Code, Daten, Spec, Vorgaengerrepo.*
  Ein 32-KB-Statusbericht im Datenordner ist die Datenquelle. **Ihn
  nur zu zitieren, statt ihn zu lesen, hat einen ganzen Nachtlauf in
  die falsche Richtung geschickt.**

  ### Der Ordner ist groesser als der Supplements-Strang

  `[cmd]` **4.723 Dateien, 148,5 MB.** Ohne Cache und Adminspuren
  bleiben **103 Kerndateien.**

  `[cmd]` **Und ein erheblicher Teil beantwortet offene Punkte im
  Register, die nichts mit Supplements zu tun haben:**

  | offener Punkt | Entsprechung in `data/` |
  |---|---|
  | **C-183** Symptom-Ontologie (21 Records) | `evidence/symptom_ontology_seed.json` — **32 Symptome** mit Synonymen, Systemen, Schweregrad- und Zeitdimensionen, moeglichen Kontexten |
  | **C-176** `biomarkerDetails.ts` (121 KB) | `evidence/biomarker_explanations.jsonl` — **66 Marker**, deutsch, mit `what_it_measures`, `major_physiological_role`, `common_reasons_high` |
  | **C-207** Cam-Entscheidungen | `medication_cam_contract.json`, `supplement_cam_contract.json`, `peptide_cam_contract.json`, `prescription_vision_contract.json`, `vision_product_match_signals.json`, `vision_learning_example_schema.json` |
  | Buddy (aufgeschoben) | `buddy_capability_map.json` — **23 Faehigkeiten** mit benoetigten Domaenen und Wissenseingaben; `buddy_dependency_graph.json` |
  | Recovery, Training | `recovery_modality_evidence.json`, `training_structure_registry.json`, `fatigue_signal_evidence.json` |

  `[cmd]` **Dazu Ebenen, die es im Repo ueberhaupt nicht gibt:**
  `population_response_atlas.jsonl` **425** ·
  `response_confounder_graph.jsonl` **799** ·
  `response_modifier_graph.jsonl` **453** ·
  `symptom_biomarker_map.jsonl` **102 Kanten** ·
  `personal_baseline_methodology.json` ·
  `cyp_enrichment.jsonl` **666** · `transporter_enrichment.jsonl` **513**.

  `[cmd]` **Und die Dosisluecke ist teilweise geschlossen:**
  `supplement_dosing_enrichment.jsonl` traegt **290 Zeilen** — genau
  die Zahl der sichtbaren Substanzen — mit `studied_dose_ranges`
  inklusive Menge, Einheit, Darreichung, Dauer, Population,
  Endpunktkontext und Quelle je Eintrag. **Beispiel Vitamin A: 750–3000
  mcg RAE/Tag, NIH ODS als Quelle, `verified: false` ehrlich
  gekennzeichnet.**

  `[read]` **Damit ist die Aussage aus C-258 — `guideline_dose` 0 von
  290 — zwar richtig gemessen, aber irrefuehrend:** die Dosisangaben
  liegen vor, sie sind nur nicht importiert.

  `[read]` **Der Befund ist damit groesser als der Supplements-Strang.**
  Er beruehrt Medical, Recovery, Training, MealCam und Buddy. **Vor der
  naechsten Auftragsrunde gehoert eine Gegenueberstellung her: was
  liegt in `data/`, was ist im Repo, was fehlt.** Ohne sie wird
  weiterhin beauftragt, was schon da ist.
