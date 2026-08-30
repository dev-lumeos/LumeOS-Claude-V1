# C-313 - Operatoren der Regel-Engine erheben

Datum: 2026-08-27
Auftrag: `docs/auftraege/c-313-codex.md`

## Ergebnis

Die Ausgangsmessung ist im Kern richtig, aber die zeichenkettenbasierte
Suche verdeckt zwei wichtige Details:

1. Von 27 Operatornamen haben 12 einen passenden Kontrollpfad in
   `supplements.rule_assessment`. `dsl` hat keinen allgemeinen Pfad,
   aber drei der 15 DSL-Regeln werden einzeln ueber ihre `rule_id`
   behandelt. 14 Operatornamen haben keinerlei Behandlung.
2. Der Name `contains` kommt im Evaluator vor, die zwei verschachtelten
   `contains`-Bedingungen unter `any_of` werden trotzdem nie erreicht.
   Ein Namensfund ist also kein Funktionsbeleg.

Damit tragen weiter 28 von 64 Regeln mindestens einen der 15 im Auftrag
genannten Operatoren. Nach semantischer Pruefung sind 25 Regeln wirklich
ohne Behandlung eines benoetigten Operators: 4 `high`, 6 `medium`, 15
`low`, keine `critical`. Die drei ausgenommenen DSL-Regeln sind
`gap_protein_training`, `gap_magnesium_intake` und
`gap_folate_pregnancy_plan`.

Der Ursprung ist keine durch Schritt 145 verlorene Implementierung:
C-133 legte den 64er-Katalog und den Evaluator gemeinsam am 2026-08-20
an. Schritt 145 wurde erst am 2026-08-25 hinzugefuegt, haengt von 133 ab
und importiert Medikamentenregeln erneut, ohne `rule_assessment` zu
aendern. Es ist eine von Anfang an unvollstaendige Implementierung, nicht
eine dokumentierte, bewusst zurueckgestellte Operator-Roadmap und kein
durch 145 entstandener Regressionseffekt.

## Zahlen: Auftrag gegen Messung

| Messpunkt | Auftrag | Eigene Messung | Geltend |
|---|---:|---:|---:|
| Operatornamen in `conditions` | 27 | 27, rekursiv inklusive `any_of`-Kinder | 27 |
| Namen ohne exakten Operatorpfad | 15 | 14 vollstaendig fehlend, `dsl` nur teilweise individuell umgesetzt | 14 + 1 teilweise |
| Regeln mit einem der 15 Namen | 28 von 64 | 28 von 64 | 28 |
| Regeln mit wirklich unbehandelter Bedingung | nicht getrennt gemessen | 25 von 64 | 25 |
| davon `critical` / `high` / `medium` / `low` | 0 / 4 / 6 / 18 | 0 / 4 / 6 / 15 | 0 / 4 / 6 / 15 |
| `wr_lab_biotin` bei unbekanntem Operator | lautlos vermutet | `not_fulfilled`, kein Fehler | `not_fulfilled` |

Die Auftragssumme 28 umfasst die 15 DSL-Regeln. Drei davon besitzen
zwar keinen `dsl`-Dispatcher, werden im Evaluator aber bewusst einzeln
ausgewertet. Sie duerfen nicht als fehlende Operatorimplementierung
gezaehlt werden.

## Operatoren und Kontrollpfade

"Behandelt" heisst hier: Der Operator erreicht fuer das passende
`module`/`field` eine fachliche Bedingung, nicht nur dass sein Name im
SQL-Text vorkommt. Die Verzweigungen stehen in
`supabase/_pipeline/13_supplements/133_kimi_rules.ts:508` bis `:584`.

| Operator | Befund im Evaluator | Betroffene Regeln, Schweregrad |
|---|---|---|
| `any_of` | kein Pfad; aeusserer Fall faellt in `ELSE false` | `wr_lab_ashwagandha_thyroid` medium |
| `care_context_is` | kein Pfad | `wr_med_supervised_androgen` low |
| `contains` | 5 direkte Faelle behandelt; 2 Kinder unter nicht behandeltem `any_of` unerreichbar | 6: critical 1, high 2, medium 3 |
| `contains_any` | fuer Conditions, Laboranalyte und Klassen behandelt | 7: critical 1, high 2, medium 4 |
| `contains_any_class` | behandelt | 7: critical 1, high 2, medium 2, low 2 |
| `contains_any_group` | behandelt, Stack-Pfad | 8: critical 1, high 3, medium 4 |
| `contains_any_substance` | behandelt, Stack-Pfad | 18: critical 6, high 6, medium 5, low 1 |
| `contains_cyp_inducer` | behandelt | `wr_drug_cyp3a4_induction` high |
| `contains_cyp_inhibitor` | behandelt | `wr_drug_cyp3a4_inhibition` critical |
| `contains_cyp_substrate` | behandelt | 3: critical 1, high 2 |
| `contains_medication` | behandelt | 4: critical 1, medium 3 |
| `count_group_gte` | behandelt | `wr_hepatotox_stack` high |
| `count_risk_flag_gte` | behandelt | 5: critical 1, high 4 |
| `dsl` | kein allgemeiner Pfad; nur 3 der 15 `rule_id`-Sonderfaelle behandelt | 15 low, davon 3 behandelt und 12 unbehandelt |
| `eq` | kein Pfad | `wr_lab_vitc_glucose` high |
| `gt` | kein Pfad; `daily_total_mg` wird pauschal `false` | `wr_stimulant_stack_total` medium |
| `has_fasting_requirement` | kein Pfad | `wr_drug_tki_fasting` low |
| `lab_above` | kein Pfad | `wr_drug_hyperkalemia_lab`, `wr_drug_testosterone_hct`, beide high |
| `lte` | kein Pfad | `wr_lab_biotin` high |
| `medication_started_within_days` | kein Pfad | `wr_drug_symptom_contributor` low |
| `missing_analyte_within_months` | behandelt | 6: medium 5, low 1 |
| `prescription_status_in` | kein Pfad | `wr_med_rx_unverified` medium |
| `prescription_status_is` | kein Pfad | `wr_med_supervised_androgen` low |
| `regulatory_state_is` | kein Pfad | `wr_med_rx_unverified` medium |
| `substance_gte` | kein Pfad; `daily_total_mg` wird pauschal `false` | `wr_lab_b6_neuropathy` medium, `wr_lab_biotin` high, `wr_lab_zinc_copper` medium |
| `symptom_matches_adverse_effect` | kein Pfad | `wr_drug_symptom_contributor` low |
| `symptom_present` | kein Pfad | `wr_drug_statin_ck` medium |

Die vier weiterhin unbehandelten `high`-Regeln sind
`wr_drug_hyperkalemia_lab` (`lab_above`),
`wr_drug_testosterone_hct` (`lab_above`), `wr_lab_biotin` (`lte`,
`substance_gte`) und `wr_lab_vitc_glucose` (`eq`). Sie koppeln
Medikament oder Supplement mit einem Laborbezug. Es gibt keine
unbehandelte `critical`-Regel; die vorhandenen critical-Regeln verwenden
die bereits behandelten Operatoren.

`wr_lab_biotin` bleibt besonders relevant: Die Katalogregel prueft
Biotin ab 5 mg und einen bevorstehenden Labortermin in sieben Tagen. Die
beiden Operatoren `substance_gte` und `lte` erreichen keine fachliche
Pruefung; die Regel kann daher weder die Biotin-Interferenz noch ihren
Laborbezug auswerten.

## Negativprobe: unbekannter Operator

Die Probe lief ausschliesslich in `lumeos_c313_verify`, einer Kopie der
laufenden Datenbank, mit `dev@lumeos.app` und `CURRENT_DATE`.

1. In einer Transaktion wurde nur die Klonzeile `wr_lab_biotin` auf die
   Bedingung `c313_unknown_operator` gesetzt. `input_paths` und
   `missing_input_paths` wurden fuer die Probe geleert, damit der
   Evaluator die Bedingung wirklich erreicht.
2. `supplements.rule_assessment(...)` lieferte fuer die weiterhin
   `high`-schwere Regel `evaluation_state = 'not_fulfilled'`,
   `missing_inputs = {}` und keinen Fehler.
3. Die Transaktion wurde mit `ROLLBACK` beendet.

Damit ist das Verhalten belegt: Ein unbekannter Operator wird nicht als
ungueltige Regel markiert und nicht geloggt, sondern lautlos als
Nicht-Treffer behandelt. Regeln mit fehlenden Eingaben koennen zuvor
`missing_input` liefern; das aendert nicht das Verhalten, sobald eine
unbekannte Bedingung ausgefuehrt wird.

## Herkunft und Dokumentation

| Zeitpunkt | Befund |
|---|---|
| 2026-08-20, Commit `4bccac2` | C-133 wurde angelegt: Import aller drei Kimi-Regeldateien (29 Warning, 15 Gap, 20 Medication) und `rule_assessment` im selben Schritt. Die heutige unvollstaendige Operatorabdeckung war damit schon bei Anlage des 64er-Katalogs vorhanden. |
| 2026-08-21, Commit `5d4b5e9` | C-133 las den Input-Status nur noch einmal je Lauf. Keine Operatorergaenzung. |
| 2026-08-25, Commit `bb40e13` | Schritt 145 entstand unter `supabase/_pipeline/13_supplements/`, nicht unter `14_medical`; er importiert Medikamentenkatalog und die 20 Medikamentenregeln, aendert aber nicht den Evaluator. |
| 2026-08-26, Commit `d68c230` | Schritt 145 erhielt nur Pfad-/Enrichment-Aenderungen. Keine Operatorergaenzung. |

`kette.json` zeigt entsprechend: 145 haengt von 133 ab. Die im Auftrag
genannte Datei unter `14_medical` existiert nicht; dort liegt nur
`145_medications_schema.sql`. Die relevante Regeldatei ist
`13_supplements/145_kimi_wave4_medications_rules.ts`.

In `docs/spezifikation/` und `docs/specs/` findet sich keine
Operator-Spezifikation und keine dokumentierte Entscheidung, die 15
Operatoren bewusst aufzuschieben. `docs/spezifikation/pruefung-kimi-bestand.md`
vom 2026-08-20 beschreibt zwar fehlende Medical-Eingaben und fordert
`missing_input` statt eines stillen Nicht-Treffers. Das beschreibt die
Datenabdeckung, nicht die Operatorluecke. Daher lautet der Befund:
offene Implementierungsbaustelle aus C-133, nicht nachweisbar ein
spaeter Verlust.

## Folgen einer spaeteren Entscheidung

Das heutige Verhalten (`not_fulfilled`) ist fail-closed im Sinn von
keiner falsch positiven Warnung, aber nicht fail-loud: Es verdeckt, dass
eine Regel nicht auswertbar war. Zwei Optionen muessen vor jeder
Implementierung entschieden werden:

1. **Import oder Lauf mit unbekanntem Operator abbrechen:** Der Katalog
   wird frueh validiert und eine nicht implementierte Sicherheitsregel
   kann nicht lautlos produktiv werden. Bestehende 25 Regeln muessten
   zuvor absichtlich implementiert, gesperrt oder als Ausnahme
   klassifiziert werden.
2. **Eigenen Zustand `unsupported_operator` ausgeben:** Der Lauf bleibt
   vollstaendig, zeigt aber die fehlende Auswertung pro Regel an. Das
   verlangt einen erweiterten Ergebnisvertrag, Tests und eine sichtbare
   Behandlung durch aufrufende Oberflaechen.

Keine Option wird mit diesem Auftrag entschieden oder implementiert.
Keine `apps/`-Datei wurde veraendert. Kein Staging, Commit oder Push.
