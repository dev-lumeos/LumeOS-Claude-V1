# C-296 - `drug_class` erheben

Datum: 2026-08-27
Auftrag: `docs/auftraege/c-296-codex.md`

## Ergebnis

`medical.medication_active_substances.drug_class` enthaelt 183 exakte
Tags. Fuenf Tags sind vollstaendig nur durch Gross-/Kleinschreibung
doppelt vorhanden: neben `maoi`/`MAOI`, `ssri`/`SSRI` und `snri`/`SNRI`
auch `ace_inhibitor`/`ACE_inhibitor` sowie `arb`/`ARB`. In allen fuenf
Faellen tragen exakt dieselben Wirkstoffe beide Schreibweisen; eine nur
kleingeschriebene Variante gibt es nicht.

Die zehn Regeln mit `medications[].drug_class` verlangen 24
Klassenwerte. 20 dieser Werte kommen exakt im Katalog vor. Der fehlende
Wert `thyroid` ist ein Arm von `wr_lab_ashwagandha_thyroid`; die
Alternative `TSH` verhindert, dass aus der Datenlage allein eine tote
Gesamtregel folgt. Der aktuelle Evaluator verarbeitet `any_of` jedoch
nicht, deshalb ist diese Regel im heutigen Code trotzdem stets
`not_fulfilled`.

Es wurde nichts bereinigt, keine Regel angepasst und keine
Wirkstoffzeile geaendert. Die Abfragen liefen lesend gegen die laufende
lokale Datenbank.

## Zahlen: Auftrag gegen Messung

| Messpunkt | Auftrag | Eigene Messung | Geltend |
|---|---:|---:|---:|
| `maoi` / `MAOI` | 15 / 15 | 15 / 15, gemeinsame Traeger 15 | 15 / 15 |
| `ssri` / `SSRI` | 10 / 10 | 10 / 10, gemeinsame Traeger 10 | 10 / 10 |
| `snri` / `SNRI` | 4 / 4 | 4 / 4, gemeinsame Traeger 4 | 4 / 4 |
| weitere reine Case-Dubletten | nicht genannt | 2 (`ace_inhibitor`, `arb`) | 2 |
| Wirkstoffe mit allen vier SSRI/MAOI-Varianten | 8 | 8 | 8 |
| Regeln mit `drug_class`-Praedikat | 10 | 10 | 10 |
| unterschiedliche Regelwerte | nicht genannt | 24 | 24 |
| Regelwerte ohne exakten Traeger | nicht genannt | 1 | 1 |
| exakte Katalogtags ohne eine der zehn Regeln | nicht genannt | 163 von 183 | 163 |
| deren Tag-Zuweisungen | nicht genannt | 533 | 533 |
| `wr_serotonergic`-Traeger | 21 Grossform + 5 Stoffe | 26 eindeutig | 26 |
| davon mit explizit falschem MAOI-Tag | nicht genannt | 9 | 9 |

Die drei regelbezogenen C-310-Zahlen sind ebenfalls bestaetigt:
`rule_type = 'medication'` liefert 20, eine Textsuche nach
`medication` in `conditions` liefert 31 und `medical = ANY(modules_involved)`
liefert 48. Sie beantworten verschiedene Fragen.

## Case-Dubletten und fachlich falsche Tags

| Kleinschreibung | Grossschreibung | klein / gross / beide / nur klein / nur gross |
|---|---|---:|
| `ace_inhibitor` | `ACE_inhibitor` | 4 / 4 / 4 / 0 / 0 |
| `arb` | `ARB` | 6 / 6 / 6 / 0 / 0 |
| `maoi` | `MAOI` | 15 / 15 / 15 / 0 / 0 |
| `snri` | `SNRI` | 4 / 4 / 4 / 0 / 0 |
| `ssri` | `SSRI` | 10 / 10 / 10 / 0 / 0 |

Alle vier SSRI/MAOI-Schreibweisen tragen: Bupropion Hydrochloride,
Citalopram, Escitalopram, Fluvoxamine Maleate, Paroxetine Hydrochloride,
Trazodone, Vilazodone Hydrochloride und Vortioxetine.

Die Zahl "zehn fachlich falsche Tags" ist nicht als solche
reproduzierbar: Die im Auftrag ausgeschriebene Liste nennt neun falsche
MAOI-Zuordnungen und sieben weitere Zuordnungen, also 16 fachliche
Korrekturfaelle bereits vor der Entscheidung, ob Case-Dubletten als
eine oder mehrere fehlerhafte Zuweisungen gezaehlt werden. Bupropions
MoA-Note beanstandet zusaetzlich seine SSRI-Zuordnung. Eine bereinigende
Zahl ohne zuvor festgelegte Tag-Grammatik waere deshalb irrefuehrend.

| Befund aus MoA-Note | Betroffene Wirkstoffe oder Zuordnung |
|---|---|
| kein MAO-Hemmer | Bupropion Hydrochloride, Citalopram, Escitalopram, Fluvoxamine Maleate, Mirtazapine, Paroxetine Hydrochloride, Trazodone, Vilazodone Hydrochloride, Vortioxetine: jeweils `maoi`/`MAOI` vorhanden |
| falscher Klassentag | Olmesartan `diuretic_thiazide`; Acetaminophen `opioid`; Phenobarbital `anticholinergic`; Pioglitazone Hydrochloride `insulin`; Griseofulvin `antineoplastic_misc`; Mercaptopurine `antiviral_nucleoside`; Chlorine `vitamin_c` |

Damit kann `wr_serotonergic` bei 26 Wirkstoffen als relevante
Voraussetzung erfuellt sein. Bei neun davon ist wenigstens die
MAOI-Voraussetzung laut importierter MoA-Note fachlich falsch. Die Regel
ist also nicht nur ein Anzeigeproblem: Sie kann eine `critical`-Warnung
auf einer falschen Klassenbasis erzeugen.

## Regelwerte und Abdeckung

Die folgende Liste entpackt auch den verschachtelten `any_of`-Arm. Die
Traegerzahlen vergleichen exakte Zeichenketten, genau wie der Evaluator
bei `contains` und `contains_any`.

| Regel | Schweregrad | verlangter Klassenwert | Traeger |
|---|---|---|---:|
| `wr_anticoag_stack` | medium | `anticoagulant:doac`, `anticoagulant:warfarin`, `antiplatelet` | 8, 1, 5 |
| `wr_chelation_timing` | medium | `bisphosphonate`, `levothyroxine`, `quinolone`, `tetracycline` | 2, 1, 5, 2 |
| `wr_hypoglycemic_additive` | medium | `antidiabetic` | 22 |
| `wr_lab_ashwagandha_thyroid` | medium | `thyroid` | 0 |
| `wr_potassium_raas` | high | `ACE_inhibitor`, `ARB`, `potassium_sparing_diuretic`, `RAAS_inhibitor` | 4, 6, 4, 10 |
| `wr_sedative_additive` | medium | `sedative` | 9 |
| `wr_serotonergic` | critical | `MAOI`, `SNRI`, `SSRI`, `tramadol`, `triptan` | 15, 4, 10, 1, 4 |
| `wr_stimulant_med` | high | `antiarrhythmic`, `antihypertensive`, `MAOI` | 10, 43, 15 |
| `wr_warfarin_ginseng` | high | `anticoagulant:warfarin` | 1 |
| `wr_warfarin_vitk` | high | `anticoagulant:warfarin` | 1 |

`wr_lab_ashwagandha_thyroid` ist damit der einzige Regelwert ohne
Traeger. Die Regel verlangt aber `any_of(thyroid, TSH)`: Ein
TSH-Laborwert kann den zweiten Arm liefern. Sie ist deshalb nicht wegen
des fehlenden Tags logisch tot. Der Evaluator in
`supabase/_pipeline/13_supplements/133_kimi_rules.ts:508` behandelt nur
`contains` und `contains_any` fuer `medications[].drug_class`; fuer das
aeussere `any_of` gibt es keinen Zweig. Dadurch setzt die Funktion die
Regel heute unabhaengig von den Daten auf `not_fulfilled`. Das ist ein
getrennter Implementierungsbefund, keine in diesem Auftrag vorgenommene
Reparatur.

Von den 183 exakten Tags werden somit nur 20 ueberhaupt von einer der
zehn Regeln verlangt. 163 Tags mit 533 Zuweisungen sind durch diese
Regelmenge ungeprueft. "Ohne Regel" bedeutet hier nur: keine dieser zehn
direkten `drug_class`-Bedingungen; andere Regeln koennen dieselben
Wirkstoffe ueber Risikoflags, CYP, Labore oder Namen verwenden.

## Vollstaendige `drug_class`-Liste

Zahl nach jedem Tag: Anzahl unterschiedlicher Wirkstoffe mit exakt diesem
Tag. Die Regelreferenzen stehen vollstaendig in der vorigen Tabelle;
alle hier nicht genannten Tags sind in den zehn Regeln ungeprueft.

### A-C

`ace_inhibitor` 4; `ACE_inhibitor` 4; `adenosine_triphosphate_citrate_lyase_inhibitor` 1; `adrenal_steroid_synthesis_inhibitor` 1; `aldehyde_dehydrogenase_inhibitor` 1; `alkalinizer` 1; `alkaloid` 1; `alpha_agonist` 2; `alpha_blocker` 5; `alpha_glucosidase_inhibitor` 1; `alpha2_agonist` 3; `aminosalicylate` 2; `analgesic_antipyretic` 1; `androgen` 3; `anti_coagulant` 1; `anti_epileptic_agent` 5; `anti_ige` 1; `antianginal` 1; `antiarrhythmic` 10; `antibiotic_fluoroquinolone` 5; `antibiotic_macrolide` 2; `antibiotic_misc` 21; `antibiotic_penicillin` 3; `antibiotic_tetracycline` 2; `anticholinergic` 10; `anticoagulant_antiplatelet_misc` 2; `anticoagulant_doac` 7; `anticoagulant_vka` 1; `anticoagulant:doac` 8; `anticoagulant:warfarin` 1; `antidiabetic` 22; `antidote` 3; `antiemetic` 1; `antiepileptic` 4; `antifibrinolytic` 2; `antihistamine` 5; `antihistamine_h1` 1; `antihypertensive` 43; `antimetabolite` 1; `antineoplastic_misc` 9; `antiplatelet` 5; `antipsychotic` 9; `antiviral_neuraminidase` 2; `antiviral_nucleoside` 12; `arb` 6; `ARB` 6; `aromatase_inhibitor` 2; `aromatic_amino_acid` 1; `arteriolar_vasodilator` 1; `bcl_2_inhibitor` 1; `benzodiazepine` 6; `beta_blocker` 7; `beta_lactamase_inhibitor` 1; `beta2_agonist` 4; `beta3_adrenergic_agonist` 1; `biguanide` 1; `bile_acid_sequestrant` 3; `biologic_dmard` 16; `bisphosphonate` 2; `bone_agent` 2; `calcium_channel_blocker` 5; `carbonic_anhydrase_inhibitor` 4; `cardiac_glycoside` 1; `ccr5_co_receptor_antagonist` 1; `cholesterol_absorption_inhibitor` 1; `cholinergic_agonist` 3; `cholinergic_nicotinic_agonist` 1; `cholinesterase_inhibitor` 2; `comt_inhibitor` 2; `corticosteroid_systemic` 12; `cortisol_synthesis_inhibitor` 1; `CYP1A2_inhibitor` 1; `CYP2C19_inhibitor` 1; `CYP2C19_substrate` 2; `CYP2C8_inhibitor` 2; `CYP2C9_inhibitor` 3; `CYP2C9_substrate` 1; `CYP2D6_inhibitor` 4; `CYP2D6_substrate` 2; `CYP3A4_inducer` 2; `CYP3A4_inhibitor` 6; `CYP3A4_substrate` 8; `cytochrome_p450_3a_inhibitor` 1; `cytochrome_p450_3a4_inducers_moa` 1.

### D-H

`diuretic_loop` 4; `diuretic_potassium_sparing` 4; `diuretic_thiazide` 6; `dmard` 2; `dopamine_agonist` 3; `dopamine_d2_antagonist` 2; `dpp4_inhibitor` 3; `endothelin_receptor_antagonist` 1; `enzyme_activator` 1; `ergot_derivative` 1; `esa` 2; `estrogen` 5; `fibrate` 3; `free_radical_scavenger` 1; `fxr_agonist` 1; `gaba_a_modulator` 1; `gaba_a_positive_modulator` 1; `gamma_aminobutyric_acid_a_receptor_agonist` 1; `gamma_aminobutyric_acid_ergic_agonist` 1; `glinide` 1; `glp1_agonist` 5; `growth_factor` 3; `h2_blocker` 3; `hcn_channel_blocker` 1; `hepatitis_c_virus_ns5a_inhibitor` 1; `hepatitis_c_virus_nucleotide_analog_ns5b_polymerase_inhibitor` 2; `hiv_integrase_inhibitor` 3; `hormonal_agent` 9.

### I-M

`immunosuppressant` 4; `insulin` 6; `integrin_receptor_antagonist` 1; `iron_chelator` 3; `jak_inhibitor` 2; `laxative` 3; `leukotriene_antagonist` 1; `levothyroxine` 1; `maoi` 15; `MAOI` 15; `mast_cell_stabilizer` 1; `methylxanthine` 2; `mood_stabilizer` 2.

### N-S

`nicotinic_agonist` 1; `nitrate_vasodilator` 2; `non_standardized_plant_allergenic_extract` 1; `nsaid` 7; `nucleic_acid_synthesis_inhibitor` 1; `oat_interaction_agent` 1; `opioid` 14; `parenteral_iron_replacement` 1; `pcsk9_inhibitor` 2; `pde5_inhibitor` 3; `phosphate_binder` 1; `phosphodiesterase_4_inhibitor` 1; `potassium_binder` 2; `potassium_sparing_diuretic` 4; `ppi` 5; `progestin` 3; `prostaglandin_analog` 2; `protease_inhibitor` 4; `pyrimidine_synthesis_inhibitor` 1; `quinolone` 5; `RAAS_inhibitor` 10; `respiratory_misc` 2; `retinoid` 3; `s1p_receptor_modulator` 1; `sars_cov_2_nucleotide_analog_rna_polymerase_inhibitor` 1; `sedative` 9; `serotonergic_agent` 1; `sglt2_inhibitor` 4; `sigma_1_agonist` 1; `sleep_agent_misc` 1; `snri` 4; `SNRI` 4; `sodium_channel_blocker` 1; `somatostatin_analog` 2; `ssri` 10; `SSRI` 10; `statin` 6; `stimulant_adhd` 4; `substance_p_neurokinin_1_receptor_antagonist` 1; `sulfonylurea` 3; `sympathomimetic` 1.

### T-Z

`5_alpha_reductase_inhibitor` 2; `tetracycline` 2; `thrombin_inhibitor` 1; `thymic_stromal_lymphopoietin_blocker` 1; `thyroid_hormone` 1; `tki` 17; `tramadol` 1; `tricyclic` 5; `triptan` 4; `unclassified` 33; `uncompetitive_n_methyl_d_aspartate_receptor_antagonist` 1; `uricosuric` 2; `vasodilator` 1; `vasopressin_agent` 2; `vitamin_c` 1; `vitamin_d_analog` 1; `vitamin_k` 1.

## Vorschlag fuer eine spaetere Bereinigung

1. **Nur Daten normalisieren:** Alle Tags werden auf eine definierte
   kanonische Grammatik, etwa Kleinbuchstaben mit Unterstrich und dem
   beibehaltenen Doppelpunkt in `anticoagulant:warfarin`, umgestellt.
   Ohne gleichzeitige Regelumstellung waere dies gefaehrlich:
   `wr_serotonergic` verlierte `SSRI`, `SNRI` und `MAOI` und wuerde fuer
   diese Klassen nicht mehr feuern.

2. **Nur Regeln tolerant vergleichen:** Der Evaluator casefoldet beide
   Seiten. Das verhindert die unmittelbare Stummschaltung, laesst aber
   die doppelte und fachlich falsche Katalogsemantik bestehen. Es loest
   auch keine Synonyme wie `diuretic_potassium_sparing` gegen
   `potassium_sparing_diuretic`.

3. **Empfohlen: Taxonomie zuerst, Daten und Regeln gemeinsam:** Eine
   versionierte Liste erlaubter kanonischer Tags plus Alias-Mapping wird
   beschlossen. Danach werden Katalogwerte kuratiert normalisiert,
   Regelwerte auf dieselben Codes ueberfuehrt und der Evaluator vergleicht
   nur diese Codes. Die fachlich falschen MoA-Faelle bleiben dabei
   explizite Kurationsentscheidungen mit Provenance, statt durch
   Casefolding unsichtbar zu werden. Vorher sind Regressionstests fuer
   alle zehn Regeln notwendig, besonders eine positive und negative Probe
   fuer `wr_serotonergic`.

Variante 3 darf erst nach C-310 umgesetzt werden: Eine vorherige
Identitaetszusammenfuehrung koennte die doppelten und falschen Tags in
eine neue Fuehrungszeile uebernehmen.

Keine `apps/`-Datei wurde veraendert. Kein Staging, Commit oder Push.
