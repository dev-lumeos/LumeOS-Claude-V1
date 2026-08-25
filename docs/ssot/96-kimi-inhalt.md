# Was Kimis Bestand wirklich enthaelt

Erhoben 2026-08-25 · Orchestrator · **jede Datei geoeffnet, nicht
gezaehlt.**

Ort: `docs/kimi_research/supplement_performance_database/data/`

**Diese Fassung ergaenzt `95-kimi-bestand.md`.** Jene beschreibt, *wie
viel* dort liegt. Diese beschreibt, *was* darin steht — und was davon
wir einbauen koennen.

---

## Warum es diesen Bericht gibt

**Tom, 2026-08-25:** *„das ist alles was du findest? schau das genau
an auch die genannten dateien das ist wahres gold."*

`[read]` Der Orchestrator hatte dreimal nur Dateinamen und Zeilenzahlen
erfasst. **Die Struktur der Dateien beantwortet Fragen, an denen wir
uns tagelang abgearbeitet haben.**

---

## 1. Die Regel-Engine ist fertig spezifiziert

`[cmd]` **64 Regeln, ausfuehrbar, mit Bedingungen und Meldetext:**
`warning_rules` 29 · `medication_rules` 20 · `nutrient_gap_rules` 15.

**Beispiel `wr_warfarin_vitk`:**

    conditions   medical.medications[].drug_class contains
                 'anticoagulant:warfarin'
                 UND supplements.stack contains_any_substance
                 $RULE_SUBSTANCES
    substance_ids  sub_52bdb964c4, sub_0b5c620106, sub_6764c8891c
    message_de   "Vitamin K veraendert die Warfarin-Wirkung (INR sinkt).
                  Jede Aenderung -> INR-Kontrolle aerztlich abstimmen."
    explain_template  rule_id, triggered_by, reason, evidence_ids

`[cmd]` **`module_field_spec.json` ist der Schluessel dazu** — es
definiert die kanonischen Feldpfade je Modul (`medical.labs`,
`nutrition.daily`, `supplements.stack_item`, `training.load_spike`,
`profile.athlete_tested_pool`), **damit die Regeln 1:1 auf unsere
Datenmodelle passen.**

`[cmd]` **`rule_trait_mapping.json`** uebersetzt unsere `drug_class`-
Werte in die Regel-Merkmale — 157 Klassen auf Regel-Traits.

`[read]` **Das ist keine Sammlung von Hinweisen, das ist eine
Schnittstelle.** Wer sie baut, hat Warnungen ueber Module hinweg.

## 2. Die WADA-Frage ist zweifach beantwortet

`[cmd]` **`wada_scope_enrichment.jsonl` — 446 Records** mit `note_de`,
`scope_class` und zwei verifizierten Quellen.

`[cmd]` **`wada_scope_notes_enrichment.jsonl` — 318 Records** mit
`scope_note_de` und **fuenf** verifizierten Quellen, darunter
IFBB-Anti-Doping, IFBB-Pro-Natural-Regeln, NPC-Worldwide,
INBA/PNBA-Testpolitik.

`[read]` **Und die Antwort ist genauer als meine Vermutung:** die
Natural-Ligen fuehren **eigene, teils weitergehende Sperrlisten**
(DHEA, Ephedrin, 7-Keto) mit Sperrfristen bis zehn Jahre — und
NPC/IFBB Pro testen **bei ausgewiesenen Natural-Wettkaempfen**, sonst
nicht.

`[cmd]` Dazu `wada_status_enrichment` 448 mit `tue_relevance` und
`sports_scope`, und **sechs Korrekturrecords** — z. B.
Hydrochlorothiazid: unser Bestand sagt `not_prohibited`, die Liste 2026
sagt **S5, jederzeit verboten.**

## 3. Die Laborebene traegt eine Unterscheidung, die wir nicht haben

`[cmd]` **`lab_effects_enrichment`, 47 Zeilen**, mit `effect_class`:

    physiological_lab_change        der Wert aendert sich wirklich
    analytical_assay_interference   der Wert wird falsch gemessen

`[read]` **Beispiel Daptomycin:** INR bis **+43 %** zwischen Peak und
Trough — *„Schein-Antikoagulation ohne Blutungsrisiko; kann zu
Fehlanpassung von Warfarin fuehren."* **Wer das verwechselt, behandelt
einen Messfehler.**

`[cmd]` **`lab_markers.json`** fuehrt 66 Marker mit `loinc_candidates`
und `needs_repo_validation` — **die Bruecke zu C-248.**

`[cmd]` **`personal_response_readiness_model.json`** traegt fuer
dieselben 66 Marker die **biologische und analytische Variabilitaet**
aus der EFLM-Datenbank. `[read]` **Damit ist beantwortbar, ob eine
Veraenderung echt ist oder Messrauschen** — ohne das ist jeder
Verlaufsvergleich geraten.

## 4. Was leer ist und warum — als Datei

`[cmd]` **`knowledge_gap_resolution.jsonl` 56 · `knowledge_gap_
dependency_map.jsonl` 46.**

    gap_id                kgap_852572baac
    field                 dosing.official_label_dose
    current_coverage      known 0, unknown 154, not_applicable 0
    dependent_capabilities  dosing_guidance, label_display
    safety_relevance      MODERATE
    researchability       LOW
    terminal_status       NOT_APPLICABLE
    reason                "Nahrungsergaenzungen haben i.d.R. keine
                           behoerdliche Label-Dosis (DSHEA/MOPH)."

`[read]` **Das ist der Unterschied zwischen *fehlt* und *gibt es
nicht*** — und dazu eine fertige Priorisierung: welche Faehigkeit
haengt daran, wie sicherheitsrelevant, wie erforschbar.

`[cmd]` **`research_hold_registry.json` — 305 Holds:**
`RESEARCH_AGAIN_LATER` 141 · **`REPO_DEPENDENCY` 67** · `DEAD_END` 55 ·
`WAIT_FOR_NEW_EVIDENCE` 42. Je Hold `resume_condition`.

## 5. Training und Recovery — die P0-Punkte liegen als Register vor

`[cmd]` `constant_evidence_registry.json` **181 Konstanten** ·
`formula_evidence_registry.json` **22** · `recovery_modality_evidence`
**32** · `fatigue_signal_evidence` **17** ·
`training_structure_registry` **13**.

`[cmd]` **`formula_evidence_registry` traegt `acwr_decision:
implement: no`** mit Begruendung und PMID 32502973.

`[cmd]` **`recovery_modality_evidence` traegt `synthetic_seed_flags`**
— vier Konzepte, die als synthetische Startwerte markiert sind.
`[read]` **Das sind die Werte, die laut Backlog aus dem Repo entfernt
gehoeren.**

`[cmd]` Je Record: `classification`, `evidence_grade`,
`context_modifiers`, `population`, `recommended_product_handling`,
**`current_value: null`** — *„Machine-readable evidence
classification"*, keine Zahlenvorgabe.

## 6. Die Produktebene zeigt auf unsere Substanzen

`[cmd]` **`products.jsonl` — 50 Produkte**, und die Zutaten tragen
**unsere Substanz-IDs:**

    product_id     prd_882416d5
    brand          Optimum Nutrition
    ingredients    [{ingredient_id: sub_43b1e64b52,
                     name: "Whey protein isolate (WPI)",
                     amount: 24, unit: "g"}]
    certifications gmp, informed_sport, third_party_tested
    pricing        USD 39.99, price_per_serving 1.38
    availability   thailand: "widely available (Lazada Mall, Shopee)"

`[cmd]` Dazu 120 Marken, 63 Hersteller mit `GMP_status`, `recalls`,
`regulatory_actions`, und **`brand_index.json` mit Thailand-Praesenz je
Marke.**

`[read]` **Das ist die Produktebene, die laut C-266 spaeter von
Anbietern kommt** — als vollstaendiges Muster, inklusive Preis je
Portion, das unsere Kosten-Kachel braucht.

## 7. Ein komplettes Scan-Konzept

`[cmd]` Vier Vertraege, alle `schema_only_no_implementation`:
`supplement_cam_contract` · `medication_cam_contract` ·
`peptide_cam_contract` · `prescription_vision_contract`.

`[read]` **Die Regeln darin sind das Wertvolle**, nicht das Schema:

- *„never match by name alone if several products exist for that
  name"*
- **`safety_critical_fields`** — Wirkstoff, Staerke, Route, Frequenz:
  jede Abweichung erzwingt Bestaetigung
- **QR-COA-Vertrauensmodell:** *„Ein QR-Ziel wird NICHT automatisch
  vertraut"*, Allowlist je Anbieter
- **Batch ist kein Produkt-Identifier** — eigene Entitaetskette
- **`product_media_rights_registry`:** *„Oeffentliche Verfuegbarkeit
  ungleich Wiederverwendungsrecht"*, acht Rechtezustaende mit
  `can_display`/`can_store`/`can_train`

`[cmd]` **`vision_learning_example_schema`** traegt eine
Consent-Politik (`PRIVATE_ONLY` als Vorgabe, Opt-in noetig, Widerruf
jederzeit) und **kein Online-Self-Modification.**

## 8. Thailand — mehr als Registriernummern

`[cmd]` **`thailand_medication_regulatory` 477 · `thailand_product_
regulatory` 499 · `thailand_regulatory` 85** — Quellen sind die
offiziellen **NARCO-** und **PHYCHO-Listen** der Thai FDA (Stand
09/2025 und 07/2025) plus die Reisendenrichtlinie.

`[cmd]` **`thai_legal_glossary.json`** — 19 Rechtsbegriffe Thai/
Englisch mit `legal_basis` und `translation_confidence`.

`[cmd]` **`travel_medication_requirement_schema.json`** — je Land und
Medikament: Verschreibungspflicht, Arztbrief, Mengenbegrenzung,
Zolldeklaration, Originalverpackung, Kuehlkette, Vorabgenehmigung.
**Sieben Beispiellaender.**

`[read]` **Fuer eine Plattform mit Nutzern in Thailand ist das kein
Nebenthema.**

## 9. Buddy — und diesmal mit Zahlen

`[cmd]` `population_response_atlas` **425** · `_synthesis` **277** ·
`_applicability` **277** (plus Compact-Fassungen) ·
`response_confounder_graph` **799** · `response_modifier_graph`
**453** · `response_resolver_index` **277**.

`[cmd]` **`population_response_index.json`** fasst zusammen:
`by_evidence_grade` A 185 · B 167 · C 63 · D 10;
`by_readiness` DIRECTION_READY 113 · TIMECOURSE_READY 104 ·
POPULATION_RESPONSE_READY 103 · MAGNITUDE_READY 62.

`[cmd]` **`observation_comparison_semantics.json`** definiert 14
Zustaende, **je mit `allowed_buddy_language` und
`forbidden_buddy_language`.** Dazu 46 synthetische Beispiele und 13
Flaggschiff-Faelle.

`[read]` **Das ist ein fertiges Sprachregelwerk fuer einen
Begleiter** — was er bei welcher Evidenzlage sagen darf und was
nicht. `[read]` **Gehoert nicht in den Katalog**, aber es ist mehr als
Rohmaterial.

`[cmd]` **`buddy_capability_map.json`** — 23 Faehigkeiten, je mit
`blocking_gaps`, `repo_dependencies`, `research_dependencies`.
`[cmd]` **`buddy_dependency_graph.json`** — 64 Knoten, 140 Kanten,
**Vokabular nur `REQUIRES`** mit dem ausdruecklichen Vermerk: *„No
CAUSES edge type; no speculative medical causality."*

---

## Was das fuer die naechsten Schritte heisst

**Sofort einbaubar, ohne neue Recherche:**

| Was | Wohin | Zeilen |
|---|---|---:|
| WADA-Geltungsbereich | `supplement_wada.note_de` | 446 + 318 |
| PubChem-Konflikte | Waechter-Ausnahmeliste | 20 |
| Laborwirkung mit `effect_class` | `supplement_lab_effects` | 47 |
| Human-Evidenz-Flaggen | `supplement_evidence` | 293 |
| Thailand | `supplement_regulatory` | 976 |
| CYP und Transporter, Rest | `entity_cyp`, `entity_transporters` | 1.179 |
| Studien | neu | 43 |

**Braucht eine Entscheidung, aber liegt vollstaendig vor:**

- **Die Regel-Engine** — 64 Regeln plus `module_field_spec` als
  Schnittstelle
- **Die Produktebene** — 50 Produkte, 120 Marken, 63 Hersteller, mit
  Preis je Portion
- **Die Trainings- und Recovery-Register** — 265 Konstanten, darunter
  die P0-Punkte *ACWR nicht implementieren* und *synthetische
  Seed-Werte entfernen*
- **Reise mit Medikamenten** — Schema plus sieben Laender

**Buddy, spaeter, aber nicht wegwerfen:** 2.817 Zeilen
Populationsevidenz plus ein Sprachregelwerk mit 14 Zustaenden.
