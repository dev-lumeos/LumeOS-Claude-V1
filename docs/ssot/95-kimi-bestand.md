# Kimis Rechercheverzeichnis — vollstaendige Bestandsaufnahme

Erhoben 2026-08-23 · Orchestrator · **1.289 Dateien einzeln geoeffnet.**

Ort: `backup/kimi-research/Kimi_Agent/supplement_performance_database/`

**Diese Fassung ersetzt die erste vom selben Tag.** Die war auf einer
Groessenmessung geschrieben, kannte `data/admin` nicht und hatte fuenf
Ordner ausgelassen.

---

## 1. Wie das hier zustande kam

`[read]` Der Orchestrator hat `RESEARCH_STATUS.md` in drei Dokumenten
zitiert und nie geoeffnet, dann bei der Bestandsaufnahme nur
Dateinamen und Groessen erfasst, dann nur die Ordner nachgesehen, die
Tom einzeln benannt hat. **Erst nach dreimaliger Aufforderung wurde
jede Datei geoeffnet.**

`[cmd]` Zwischenergebnis dieser Trippelschritte: ein Nachtlauf (C-257)
erzeugte 289 Schablonentexte und 867 FAQ-Zeilen mit drei
verschiedenen Antworten — fuer Felder, deren Inhalt seit Wochen auf
der Platte liegt.

---

## 2. Kimi hat seine eigene Betriebsanleitung mitgeliefert

`context_kimiclaw/`, 16 Dateien, `00` bis `15`, plus
`KIMI_CONTEXT_MANIFEST.json` und ein Selbsttest.

**`05_KIMI_ROLE.md` — die Arbeitsteilung, schriftlich:**

> *Kimi/K3 = Knowledge Factory. NICHT verantwortlich: Produktionscode,
> Repo-Integration, UI-Implementierung, Schema-Aenderungen gegen
> ungesehenes Repo. Kimi ersetzt Repo-Fakten niemals durch Annahmen.
> Repo-Daten noetig → REPO_DEPENDENCY markieren und an Claude/Codex
> uebergeben.*

`[read]` **Die Uebergabe war also von Anfang an vorgesehen** — mit
einem Marker, nach dem man suchen kann. Es hat sie nur nie jemand
abgeholt.

**`06_RESEARCH_POLICY.md`:** *„Unknown > invented. Fehlende Daten =
null, nie zu false/true erzwingen. Missing input is not false."*
Konflikte bleiben erhalten, beide Claims mit Quellen, nie still
gemittelt.

**`07_EVIDENCE_POLICY.md`:** Evidenzklassen A bis E, dazu fuer
Trainings- und Recovery-Konstanten eigene Klassen —
`SUPPORTED_NUMERIC_THRESHOLD` nur mit reproduzierbarer Evidenz plus
Population, Endpunkt und Einheit; sonst `SUPPORTED_DIRECTION_ONLY`.

**`08_SOURCE_POLICY.md`:** Quellenhierarchie von Behoerden bis
Reviews. *„Nicht als Source of Truth: kommerzielle Anbieter, Blogs,
Foren, Bro-Science."* PMIDs live gegen NCBI geprueft.

**`11_RESEARCH_HOLD_POLICY.md`:** **249 Holds** —
`RESEARCH_AGAIN_LATER` 99 · **`REPO_DEPENDENCY` 66** · `DEAD_END` 52 ·
`WAIT_FOR_NEW_EVIDENCE` 32. Die Substanzdomaene ist
**`FROZEN_PENDING_NEW_EVIDENCE_OR_REPO_NEED`** — sie wird nicht
weiter beforscht, sie wartet auf uns.

**`12_CURRENT_STATUS.md`:** **788 pharmakologisch relevante
Entitaeten** (498 Medikamente, 154 Supplements, 61 Peptide, 75
Enhanced). **64 von 64 Regeln evaluierbar.**

---

## 3. Die 17 Punkte, die auf uns warten

`reports/crawl_026A_desktop_backlog.json`, alle mit
`blocked_until_repo_access=true`. **Nichts loeschen, nur anhaengen.**

| | Bereich | Prio | Worum es geht |
|---|---|---|---|
| 01 | training/recovery | **P0** | 13 Handoff-Items: ACWR nicht implementieren, Recovery-Boni entfernen, keine fixen Ruhetage |
| 12 | recovery | **P0** | **Recovery-Score-Boni und synthetische Seed-Werte (2,76 / 0,13 / 0,05 / −0,07) repo-seitig entfernen** |
| 17 | training/formulas | **P0** | **ACWR nicht implementieren** (`acwr_decision = implement:no`); Safe-Zone 0,8–1,3 nur als Heuristik |
| 02 | labs | **P0** | **66 LOINC-Kandidaten** gegen unseren Medical-Katalog validieren |
| 04 | medications/supplements | P1 | 498 Medikamente + 291 Substanzen repo-seitig anzeigen |
| 05 | platform | P1 | `MISSING_INPUT`-Pfade: Schlaf, Standort, **Symptomtabelle** |
| 06 | platform/rules | P1 | `fulfilled` / `not_fulfilled` / `missing_input` — **kein stilles Scheitern** |
| 07 | platform/rules | P1 | Konstanten-Klassifikationen uebernehmen |
| 13 | fatigue | P1 | HRV/RESTQ/POMS **nur intraindividuell**, keine Populationsnormen |
| 15 | anthropometrics | P1 | WHO-Schwellen behalten: WHR M ≥ 0,90 / F ≥ 0,85, WHtR 0,5, Taille 94/80 |
| 16 | training | P1 | MEV/MAV/MRV nur als Bereich mit Richtung |
| 03 | nutrition | P2 | 138 Items gegen 136 Naehrstoff-Horizonte abgleichen |
| 09 | labs/nutrition | P2 | LOINC fuer 25(OH)D, Ferritin, B12, Folat, Jod |
| 10 | nutrition | P2 | 136 Horizont-Records (`DAILY`/`WEEKLY`/`MULTI_WEEK`/`LONG_TERM`) |
| 11 | training | P2 | Programm-Schema: Programm → Makrozyklus → Mesozyklus → Woche → Session |
| 08 | injection | P3 | IM-Volumen je Injektionsort |
| 14 | injection | P3 | Nadelstaerke und -laenge nach CDC/ACIP |

`[read]` **Drei P0-Punkte sagen „entfernt etwas", nicht „baut etwas".**
Recovery-Boni und ACWR sind geprueft und **abgelehnt** — wir haben sie
womoeglich implementiert, ohne das zu wissen.

---

## 4. Der Bestand, Ordner fuer Ordner

### `data/substances/` — 290 Substanzen

`[cmd]` `supplements.jsonl` **154** (43 Felder) · `peptides.jsonl`
**61** (45 Felder, mit `cyp_relevance` und Begruendung) ·
`performance_compounds.jsonl` **75** (42 Felder).

`[cmd]` Feldabdeckung Supplements: `description` 154 · `dosing` 154 ·
`safety` 154 · `monitoring` 154 · `warning_triggers` 154 · `quality`
154 · `interactions` 154 · `pharmacology` 154 ·
`mechanism_of_action` 73 · `lab_effects` 56 · **`claimed_effects` 0** ·
**`common_research_uses` 0**.

### `data/medications/` — 498 Wirkstoffe

`[cmd]` `medication_active_substances.jsonl` **498 Zeilen, 3,5 MB, 39
Felder** — ATC, CAS, RxNorm, UNII, `adverse_effects`,
`contraindications`, `cyp`, `dosage_models`, `fertility`,
`food_interactions`. Dazu 453 Formulierungen, 448 Produkte, 498
Regulatory-Records.

`[cmd]` **Im Repo existiert kein Wirkstoffkatalog.**
`medical.user_medications` traegt **2 Zeilen.**

### `data/platform/` — die Regelwerke, alle evaluierbar

`[cmd]` `warning_rules` 29 · `medication_rules` 20 ·
`nutrient_gap_rules` 15 · `interactions_matrix` 24 Paare ·
`lab_markers.json` **66 Marker** mit
`loinc_status = candidate_only_needs_repo_validation` ·
`rule_trait_mapping` (32 Klassen) · `module_field_spec.json` —
**kanonisches Feldschema fuer alle sechs Module**, damit unsere
Datenmodelle 1:1 auf das Regelwerk passen.

### `data/evidence/` — 76 Dateien

Die tragenden, nach Zeilen: `response_confounder_graph` **799** ·
`cyp_enrichment` **666** · `transporter_enrichment` **513** ·
`thailand_product_regulatory` **499** ·
`thailand_medication_regulatory` **477** · `response_modifier_graph`
**453** · `wada_status_enrichment` **448** ·
`population_response_atlas` **425** (39 Felder) ·
`medication_reproductive` **417** · `medication_pk` **407** ·
`medication_renal_hepatic` **391** · `human_evidence_flags` **293** ·
**`supplement_dosing_enrichment` 290** ·
`population_applicability_atlas` **277** ·
`medication_clinical_context` **107** ·
**`symptom_biomarker_map` 102** · **`biomarker_explanations` 66** ·
`alias_resolution_candidates` **64** · `studies` **43**.

`[cmd]` **`biomarker_explanations` hat 24 Felder je Marker**, nicht
drei: `what_it_measures`, `major_physiological_role`,
`common_reasons_high`, `common_reasons_low`, `exercise_effects`,
`fasting_effects`, `important_confounders`, `interpretation_caveats`,
`implementation_ready`. **Auf Deutsch.**

`[cmd]` **`symptom_biomarker_map` traegt `is_diagnosis_claim` und
`boundary_note`** — Kimi hat die Grenze mitgeliefert, nicht nur die
Verknuepfung.

`[cmd]` **`population_response_synthesis` traegt
`can_compare_to_user_observation` und `cannot_infer`** — die Datei
sagt selbst, wo sie nicht angewendet werden darf.

### `data/admin/` — Community Intelligence, `admin_only`

**Dieser Ordner fehlte in der ersten Fassung vollstaendig.**

`[cmd]` **`_canonical_id_lookup.json` — 1.131 Namen auf `sub_`-IDs.**
Handelsnamen, Strassennamen, chemische Bezeichnungen: *anavar*,
*anadrol*, *arimidex*, *android*, *acomplia* — alle auf eine
Substanz-ID. **Das ist die Bruecke, fuer die C-258 Codex raten lassen
wollte.**

`[cmd]` `community_intelligence_patterns` **123** (41 Felder) ·
`community_exposure_patterns` **86** (61 Felder) ·
`community_lab_patterns` **43** (mit `lab_verified`) ·
`community_product_quality_signals` **40** ·
`community_side_effect_patterns` **37** ·
`community_stack_patterns` **31** · `community_science_delta` **30** —
*wo die Community von der Wissenschaft abweicht, mit Begruendung* ·
`community_terminology` mit **179 Alias-Vorschlaegen** ·
`community_sources` **315 Quellen** · `community_longitudinal_logs`
**13**.

`[read]` **Jeder Datensatz traegt `admin_only: true`,
`not_medical_recommendation: true` und `evidence_class: E`.** Kimi hat
die Trennung selbst gezogen: Community-Wissen ist sichtbar fuer
Betreiber, nicht fuer Nutzer.

### `data/companies/` und `data/products/`

`[cmd]` 63 Hersteller (23 Felder, mit `GMP_status`, `recalls`,
`contract_manufacturer`) · 120 Marken · **50 Produkte** (27 Felder,
mit `allergens`, `certifications`, `ingredients`, `package_size`) ·
**72 Produktkennungen** mit `check_digit_valid` · 3 Medienrecords mit
Rechtestatus.

`[read]` **Das ist die Produktebene, von der du gesagt hast, sie kommt
von den Suppliern.** Ein vollstaendiges Muster liegt vor.

### `data/metadata/` — die Belegkette

`[cmd]` **`sources.jsonl` 2.288 Quellen** mit `evidence_level`,
`publisher`, `supports_fields`, `retrieved_at`. Dazu Konflikte,
Dedup-Protokolle, Laufprotokolle, `crawl_status.json`.

### `taxonomy/` — klein, aber es entscheidet

`[cmd]` **`symptom_ids.json` — 34 Symptome, kanonisch.** Das ist die
Symptomtabelle, die laut Handoff fehlt.
`[cmd]` `medication_classes.json` **157 Klassen** · `care_context` mit
der Regel *„Regulatory Status ≠ User Authorization"* ·
`prescription_status` mit *„OCR_ONLY darf niemals automatisch VERIFIED
werden"* · 10 Verabreichungswege.

### `tools/` — 29 Python-Dateien

`[cmd]` **`validate_dataset.py` 48 KB** und **`rule_engine.py` 14 KB**
— eine lauffaehige Referenz-Engine. **Damit ist pruefbar, ob unser
Import dasselbe Ergebnis liefert wie Kimis eigener Lauf.**

### `schemas/` — 15 JSON-Schemas

`[read]` **Vorschlaege, nicht Vorlage.** `substance.schema.json` hat
44 Felder in einem Objekt; unser Schema `supplements` hat **43 Tabellen
mit 615 Spalten** — dieselben Inhalte, normalisiert. Wer Kimis Schema
uebernimmt, holt die Breittabelle zurueck, die C-232 bis C-235 gerade
abgeschafft haben.

### `reports/` — 442 Dateien

QA-Berichte, Coverage-Vergleiche vorher/nachher, Konfliktlisten,
Validierungslaeufe. **Acht `repo_handoff`-Dateien** — die
Uebergabelisten. Dazu `crawl_038_ws_src/` mit den thailaendischen
Betaeubungsmittel-Listen als PDF und Text.

---

## 5. Was fehlt — und es ist wenig

`[cmd]` **`claimed_effects` 0 von 154. `common_research_uses` 0 von
154.** Und Kimis `description` ist dieselbe Fachnotiz wie bei uns:
*„Complete fast protein; grade A for MPS/lean mass support as part of
protein intake targets."*

`[read]` **Es fehlt eine Uebersetzungsebene, keine Recherche.** Am
Beispiel Kreatin liegt alles vor, um sie abzuleiten:

    mechanism_of_action  "Phosphocreatine buffer for rapid ATP
                          regeneration in muscle and brain"
    pharmacology         bioavailability "high oral (~99%)",
                          metabolism "spontaneous cyclization to
                          creatinine; renal excretion"
    studied_dose_ranges  "ISSN position stand: 3-5 g/day maintenance
                          (20 g/day loading 5-7 d optional)"
    common_side_effects  "GI upset at loading doses"
    lab_effects          Serum-Kreatinin real +0,1-0,3 mg/dL,
                          eGFR faelschlich niedrig, KEIN Nierenschaden,
                          Cystatin C unbeeinflusst

**Daraus wird ein Nutzertext ohne eine einzige neue Recherche.** Wo
`mechanism_of_action` fehlt — bei 81 von 154 — wird online recherchiert.

---

## 6. Was daraus folgt

**Die Arbeit ist Import, Zuordnung und Uebersetzung — nicht
Recherche.**

1. **Die 17 Backlog-Punkte abarbeiten.** Drei P0-Punkte sagen
   *entfernt etwas*: ACWR, Recovery-Boni, synthetische Seed-Werte.
2. **Importieren, was `DATA_READY` ist** — als Kettenschritte, auf
   unsere 43 Tabellen abgebildet, nicht als Breittabelle.
3. **Bauen, was `SCHEMA_CHANGE_REQUIRED` ist** — Symptomtabelle (34
   Symptome liegen bereit), reproduktive Struktur, renal/hepatic.
4. **Zuordnen, was `REPO_DEPENDENCY` ist** — **66 LOINC-Kandidaten**
   gegen unseren Katalog. `[cmd]` C-248 hat am selben Tag
   LOINC-Eindeutigkeit repariert, ohne dass jemand wusste, dass 66
   Marker darauf warten.
5. **Uebersetzen**, was Kimi in Fachsprache hat.
6. **Trennen, was Buddy ist:** `population_*`,
   `observation_comparison_*`, `response_*`, die CAM- und
   Vision-Vertraege und der gesamte `data/admin`-Ordner. `[read]`
   **Rund ein Drittel des `evidence`-Ordners gehoert nicht in den
   Katalog.**

`[read]` **Und gegen Kimis eigene Engine pruefen.** `rule_engine.py`
und `validate_dataset.py` liegen bei — ein Import, der andere
Ergebnisse liefert als der Referenzlauf, ist falsch importiert.
