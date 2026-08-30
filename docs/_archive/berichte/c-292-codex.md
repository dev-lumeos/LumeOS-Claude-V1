# C-292 - Medikamenten-Enrichment, Kimi Welle 1

Datum: 2026-08-27  
Auftrag: `docs/auftraege/c-292-codex.md`

## Ausgangsvermutungen und eigene Messung

Die Dateipfade im Auftrag stimmen: Alle vier neuen Quellen liegen unter
`docs/kimi_research/supplement_performance_database/data/evidence/`.
Der neue Step liest ausschliesslich von dort; die elf bestehenden Schritte mit
dem alten `backup/`-Pfad blieben unveraendert.

| Datei / Feld | Ausgangsvermutung | Eigene Messung vor dem Import | Geltender Wert |
|---|---:|---:|---:|
| Identifier-Zeilen | 465 | 465 | 465 |
| Identifier eindeutige `entity_id` | 442 | 442 | 442 |
| nichtleere CAS | 442 | 433 | 433 |
| nichtleere ATC | 23 | 21 | 21 |
| Identifier ohne CAS und ATC, mit `missing_reason` | 9 bzw. 2 Leerwerte | 11 Records | 11 |
| MoA-Zeilen | 302 | 302 | 302 |
| nichtleere MoA | 302 | 298 | 298 |
| leere MoA mit `missing_reason` | 4 | 4 | 4 |
| Precaution-Zeilen | 385 | 385 | 385 |
| nichtleere Precautions | 385 | 381 | 381 |
| leere Precautions mit `missing_reason` | 4 | 4 | 4 |
| Reproduktions-Restzeilen | 81 | 81 | 81 |
| nichtleere Pregnancy/Lactation/Fertility | 81 je Feld | 81 je Feld | 81 je Feld |
| nichtleere `sex_specific`-Objekte | im Auftrag als Fallstrick benannt | 0 von 81 | 0 von 81 |

Die 11 Identifier-Missing-Records sind nicht mit den neun verbleibenden
CAS-Luecken gleichzusetzen: Identifier-Zeilen sind nicht eins zu eins
Wirkstoffe. Die 465 Zeilen verteilen sich auf 442 IDs und enthalten getrennte
CAS- und ATC-Records.

Gegen den Livebestand vor dem Import ergaben sich diese Zielwerte:

| Feld | Live vorher | neu befuellbar | Ziel laut Auftrag | Eigener Zielwert |
|---|---:|---:|---:|---:|
| `cas_number` | 56 | 433 | 498 | 489 |
| `atc_code` | 490 | 7 | 498 | 497 |
| `pharmacology.mechanism_of_action` | 196 | 298 | 498 | 494 |
| `precautions` | 12 | 381 | 397 | 393 |
| `medication_reproductive_evidence` | 417 | 81 | 498 | 498 |

Bei ATC waren nicht 15, sondern 14 der 21 Quellenwerte schon gefuellt. Sie
wurden nicht ueberschrieben; sieben leere Felder wurden ergaenzt. Ein ATC-Wert
bleibt ohne Quelle leer. Alle IDs aus den vier Dateien loesten auf den
Medikamentenkatalog auf (0 unbekannt).

## Umsetzung

- Neuer Step: `supabase/_pipeline/14_medical/292_medication_wave1_enrichments.ts`.
  Abhaengigkeit: `286a`; keine der elf alten Pfadreferenzen wurde geaendert.
- CAS und ATC werden nur in leere Skalare geschrieben. Die 465
  Identifier-Rohrecords bleiben pro Wirkstoff als Array unter
  `evidence_provenance.c292_identifiers`, damit getrennte CAS-/ATC-Records
  sowie `missing_reason` und `note` erhalten bleiben.
- MoA wird nur als fehlender
  `pharmacology.mechanism_of_action` ergaenzt. Precautions werden nur in
  leere JSON-Felder geschrieben. Die jeweiligen vollstaendigen Quellenrecords
  liegen unter `c292_mechanism_of_action` und `c292_precautions` in der
  Provenienz.
- Die 81 Reproduktions-Restrecords werden additiv in
  `medical.medication_reproductive_evidence` eingefuegt. Der volle Record,
  einschliesslich des leeren `sex_specific` und der beiden Missing-Objekte,
  bleibt in `raw`; bestehende Reproduktionszeilen werden nicht ueberschrieben.
- `schema-sollstand.json` und der globale Abschlusspruefer enthalten jetzt die
  Untergrenzen 489 CAS, 497 ATC, 494 MoA, 393 Precautions, 465 Identifier-,
  302 MoA- und 385 Precaution-Rohrecords sowie 498 Reproduktionszeilen.

## Nachweis

Der frische Kettenlauf `lumeos_c292_probe` mit 120 Schritten war gruen und
dauerte 135,6 Sekunden. Die erweiterte Abschlusspruefung war auch gegen Live
gruen (24,4 Sekunden).

| Messung | Frische Kette | Live nach Import |
|---|---:|---:|
| Wirkstoffe | 498 | 498 |
| CAS | 489 | 489 |
| ATC | 497 | 497 |
| MoA | 494 | 494 |
| Precautions | 393 | 393 |
| Identifier-Rohrecords | 465 | 465 |
| MoA-Rohrecords | 302 | 302 |
| Precaution-Rohrecords | 385 | 385 |
| Reproduktionszeilen | 498 | 498 |
| C-292-Reproduktions-Restzeilen | 81 | 81 |
| leeres `sex_specific`, aber befuelltes `missing_fertility_sex` | 81 | 81 |
| leere MoA ohne `missing_reason` | 0 | 0 |
| leere Precautions ohne `missing_reason` | 0 | 0 |
| `im_katalog` | 412 | 412 |
| sichtbare Unterformen | 0 | 0 |

Die Negativprobe verwendete ein temporaeres Manifest ohne Schritt `292`.
Der 119-Schritte-Lauf wurde erst in der Abschlusspruefung rot: Reproduktion
417 statt 498, CAS 56 statt 489, ATC 490 statt 497, MoA 196 statt 494,
Precautions 12 statt 393 und alle drei neuen Provenienz-Mindestwerte bei 0.
Damit erkennt die Abschlusspruefung einen uebersprungenen Step.

Vor dem Live-Import wurde eine Vollsicherung erzeugt:
`backup/c292/20260827_074611_vor_live.dump` (23.891.583 Bytes).

## Dokumentierte Klassifikationsbefunde

Kimis MoA-Notes nennen nicht 10 betroffene Records, sondern 10 verschiedene
falsche `drug_class`-Tags in 17 Records. Nicht korrigiert:

| falscher Tag | betroffene Wirkstoffe |
|---|---|
| `diuretic_thiazide` | Olmesartan |
| `insulin` | Pioglitazone Hydrochloride |
| `maoi` | Escitalopram, Citalopram, Paroxetine Hydrochloride, Fluvoxamine Maleate, Mirtazapine, Bupropion Hydrochloride, Trazodone, Vilazodone Hydrochloride, Vortioxetine |
| `ssri` | Bupropion Hydrochloride, Trazodone |
| `snri` | Atomoxetine Hydrochloride |
| `opioid` | Acetaminophen |
| `vitamin_c` | Chlorine |
| `antineoplastic_misc` | Griseofulvin |
| `anticholinergic` | Phenobarbital |
| `antiviral_nucleoside` | Mercaptopurine |

Das ist ein eigener Korrekturpunkt; C-292 importiert nur die Notes als
Provenienz und aendert keine `drug_class`-Tags.

## Abgrenzung und Gate

Keine Migration, keine `apps/`-Datei, kein `user_medications`-Schreibweg und
keine bestehende Kettenstufe wurden angefasst. Die Kimi-Dateien wurden nur
gelesen. Kein Commit, Staging oder Push.

`pnpm gate` ist derzeit rot, bevor C-292-spezifische Gate-Schritte laufen:
`docs/todo/TODO.md` enthaelt fuenf Doppelkodierungen (unter anderem Zeilen
6593, 6598 und 6603). Diese fremde Datei wurde nicht veraendert. Die gezielten
C-292-Nachweise und die globale Schema-Abschlusspruefung liefen gruen.
