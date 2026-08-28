---
nr: C-129
typ: befund
modul: supplements
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: C-128
entscheidung: null
beruehrt:
  tabellen:
    - supplements.supplements
    - supplements.rule_catalog
    - medical.medication_active_substances
    - medical.medication_formulations
    - medical.medication_products
    - medical.user_medications
    - medical.user_conditions
  dateien: []
zahlen:
  gemessen: 2026-08-28
  supplements_gesamt: 596
  supplements_sichtbar: 412
  wirkstoffe: 498
  formulierungen: 453
  produkte: 448
  regelkatalog: 64
  regeln_auswertbar_statisch: 44
  regeln_blockiert_statisch: 14
  regeln_teilweise_statisch: 6
  medikamentenregeln: 20
  medikamentenregeln_missing_input_runtime: 1
  medikamentenregeln_unsupported_operator_runtime: 7
  medikamentenregeln_not_fulfilled_runtime: 12
---

# C-129 - Der Kimi-Import ist da; die Restluecken sind getrennt

## Befund

`[cmd]` **Gemessen 2026-08-28:** Der importierte Bestand umfasst 596
Supplements, davon 412 sichtbar, sowie 498
`medical.medication_active_substances`, 453 Formulierungen und 448
Produkte. Der historische Befund mit 237 Substanzen, 56 Wirkstoffen
und 124 Produkten ist erledigt; der Import ist keine offene Arbeit.

`[cmd]` `medical.medications` existiert nicht in
`information_schema` und hat nie den Bestand getragen. Die heutige
Struktur ist `medical.medication_active_substances`; die Erfassung hat
`medical.user_medications` (2 Zeilen) und `medical.user_conditions`
(2 Zeilen). Eine sichere Erfassung bleibt C-285, nicht dieser Befund.

### Regeln: zwei unterschiedliche Messungen

`[cmd]` **Katalogabgrenzung:** ueber alle 64 Zeilen von
`supplements.rule_catalog` sind 44 `auswertbar`, 14 `blockiert` und 6
`teilweise`. Das ist die statische Eingabedeckung im Katalog, keine
Auswertung fuer einen Nutzer.

`[cmd]` **Laufzeitabgrenzung:** `supplements.rule_assessment` fuer
`dev@lumeos.app` und den heutigen Tag ergibt bei genau 20
Medikamentenregeln 1 `missing_input`, 7 `unsupported_operator` und 12
`not_fulfilled`; keine ist `fulfilled`. Die fruehere Behauptung
"20 durch fehlendes medical.medications blockiert" ist damit falsch:
8 Regeln sind heute nicht auswertbar, aber aus zwei anderen Gruenden;
die anderen 12 wurden ausgewertet und treffen nicht zu.

## Getrennte Restpunkte

`[cmd]` **Regelauswertung:** C-313 traegt die 25 Regeln mit unbekannten
Operatoren; C-327 trennt die einzelne Chelationsregel mit fehlender
`supplements.substance_group_membership` ab.

`[cmd]` **Kimi-Arbeitsberichte:** C-260 bleibt fuer die nicht
uebernommenen `crawl_027`-Werte und Aliase. C-262 bleibt fuer die leeren
PK- und Renal-Hepatic-Zieltabellen sowie die unvollstaendige
Wellenabdeckung.

`[cmd]` **Produkte:** C-202 traegt Verpackung und Kennungen; C-308 die
fehlenden deutschen Marktzeilen. Diese Aufgaben sind nicht Teil einer
Regel- oder Importblockade.

`[cmd]` **Erfassungsschutz:** C-285 traegt die Verschluesselung und
Berechtigung von `user_medications`.

`[read]` C-129 ist damit nur noch der nachgemessene Herkunftsbefund.
Jede verbleibende Arbeit steht in einem eigenen Punkt; weder Import noch
alte Katalogzahlen sind als offene Luecke fortzuschreiben.
