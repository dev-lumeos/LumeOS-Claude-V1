# C-313b - Operator-Melder

Datum: 2026-08-27

## Ergebnis

Nicht implementierte Regeloperatoren enden nicht mehr als
`not_fulfilled`. `supplements.rule_assessment()` liefert fuer die
betroffene Regel isoliert `evaluation_state = 'unsupported_operator'`
und legt die nicht unterstuetzten Operatoren sowie die zugehoerigen
Condition-Objekte in `matched_context` ab. Die Funktion verarbeitet
anschliessend die weiteren Regeln weiter; eine unauswertbare Regel
loest keinen Fehler fuer die restlichen 63 aus.

Der neue Kettenschritt
`supabase/_pipeline/13_supplements/313_rule_operator_melder.sql`
enthaelt den zentralen Vertrag
`rule_operator_supported(...)`. Er wird sowohl von der Auswertung als
auch vom Gate-Waechter verwendet. Damit kann ein neuer Operator nicht
in der einen Stelle als unterstuetzt und in der anderen als unbekannt
gelten.

`tools/regel-operatoren-pruefen.mjs` ist in `pnpm gate` eingehangen.
Er verlangt exakt 25 unauswertbare Regeln und exakt diese vier
`high`-Regeln:

```
wr_drug_hyperkalemia_lab
wr_drug_testosterone_hct
wr_lab_biotin
wr_lab_vitc_glucose
```

Er prueft damit bewusst in beide Richtungen: 24 und 26 sind beide rot.
Die bestehende Testdatenpruefung erwartet bei `wr_lab_biotin` jetzt
den neuen Zustand inklusive `lte` und `substance_gte`.

## Zahlen

| Messpunkt | Auftrag | Eigene Messung | Ergebnis |
|---|---:|---:|---|
| echte Auswertungspfade | 12 | 12 | bestaetigt |
| individuell behandeltes `dsl` | 3 von 15 | 3 von 15 | bestaetigt |
| vollstaendig fehlende Operatoren | 14 | 14 | bestaetigt |
| unauswertbare Regeln | 25 | 25 | bestaetigt |
| davon `high` | 4 | 4 | bestaetigt |
| davon `critical` | 0 | 0 | bestaetigt |
| authenticated Laufzeit nach C-305 | 147-155 ms | vorher: 127.371 / 112.801 / 108.160 ms, Median 112.801 ms | abweichend |
| authenticated Laufzeit mit Melder | - | 123.308 / 109.616 / 107.024 ms, Median 109.616 ms | -3.185 ms Median im Klon |

Die Laufzeitwerte wurden jeweils dreimal unter `authenticated` fuer
`dev@lumeos.app` gemessen. Der Klonwert ist gegen die Vorhermessung
vergleichbar, aber nicht auf einzelne Cache-Zustaende normiert. Er
zeigt keine Laufzeitverschiebung durch den Melder. Die spaetere
Live-Kontrolle ergab 121.754 / 103.228 / 104.381 ms.

Vor dem Einspielen ergab die Live-Auswertung 1 `fulfilled`, 11
`missing_input` und 52 `not_fulfilled`. Laesst man die 25 bekannten
unauswertbaren Regeln aus dieser Vorhermessung heraus, bleiben 1 / 1 /
37. Danach sind es 1 `fulfilled`, 1 `missing_input`, 37
`not_fulfilled` und 25 `unsupported_operator`. Die 39 auswertbaren
Regeln haben somit unveraenderte Ergebnisse.

## Unauswertbare Regeln

```
low     gap_calcium_dairy (dsl)
low     gap_creatine_strength (dsl)
low     gap_electrolytes_endurance (dsl)
low     gap_eye_screen_time (dsl)
low     gap_immune_winter (dsl)
low     gap_joint_loading (dsl)
low     gap_omega3_fish (dsl)
low     gap_sleep_onset (dsl)
low     gap_stress_training_load (dsl)
low     gap_vegan_b12 (dsl)
low     gap_vegan_iron (dsl)
low     gap_vitd_sun (dsl)
high    wr_drug_hyperkalemia_lab (lab_above)
medium  wr_drug_statin_ck (symptom_present)
low     wr_drug_symptom_contributor (medication_started_within_days, symptom_matches_adverse_effect)
high    wr_drug_testosterone_hct (lab_above)
low     wr_drug_tki_fasting (has_fasting_requirement)
medium  wr_lab_ashwagandha_thyroid (any_of, contains)
medium  wr_lab_b6_neuropathy (substance_gte)
high    wr_lab_biotin (lte, substance_gte)
high    wr_lab_vitc_glucose (eq)
medium  wr_lab_zinc_copper (substance_gte)
medium  wr_med_rx_unverified (prescription_status_in, regulatory_state_is)
low     wr_med_supervised_androgen (care_context_is, prescription_status_is)
medium  wr_stimulant_stack_total (gt)
```

## Nachweis

- Wegwerf-Klon: neuen Kettenschritt eingespielt; die Testdatenpruefung
  lief in 76.4 s gruen durch.
- Erfundener Operator: In einer Wegwerf-Kopie von
  `wr_anticoag_stack` fuehrte `c313b_unknown_operator` zu
  `unsupported_operator`, ohne die Auswertung abzubrechen. Der
  Waechter meldete 26 statt 25 und war rot.
- Kuenstlich behandelt: In einer Wegwerf-Kopie von
  `wr_lab_vitc_glucose` wurde die Bedingung voruebergehend durch einen
  bereits unterstuetzten Operator ersetzt. Der Waechter meldete 24
  statt 25 sowie die fehlende `high`-Regel und war rot. Beide
  Wegwerf-Aenderungen wurden vor dem weiteren Test zurueckgesetzt.
- Vollstaendige Aufbaukette: 125 Schritte in
  `lumeos_c313b_chain`, 145 s, gruen. Anschliessend Waechter gruen.
  Beide Wegwerf-Datenbanken wurden entfernt.
- Live-Sicherung vor dem Eingriff:
  `backup/c313b/20260827162131_c313b_vor_live.dump` (25,246,360 Byte).
  Danach Kettenschritt eingespielt und Waechter auf Live gruen.
- Syntax und JSON: `node --check tools/regel-operatoren-pruefen.mjs`
  sowie JSON-Parsing von `package.json` und `kette.json` gruen.

`pnpm gate` wurde nicht vollstaendig ausgefuehrt, weil es laut Auftrag
wegen der parallelen Arbeit in `apps/web` bereits rot ist und weitere
fremde Pruefer ausfuehrt. Der neue Gate-Schritt selbst wurde im Klon,
nach dem vollstaendigen Kettenlauf und auf Live gruen ausgefuehrt.

Die README/Kette-Pruefung ist weiterhin rot: vor dieser Arbeit fehlten
bereits 38 dokumentierte Kettenschritte; mit dem neuen Schritt sind es
39. Die README-Tabelle ist damit als bestehende Dokumentationsluecke
nicht zum Gate geeignet. Ich habe sie nicht partiell umgeschrieben.

Keine Migration, keine Regel, kein Operator, keine `drug_class`-Daten
und keine Datei unter `apps/` wurden geaendert. Nichts wurde gestaged,
committet oder gepusht.
