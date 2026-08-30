# C-265/C-267 Codex-Bericht

## C-265: Kette gegen Live

Ausgangslage:

- Live-Schemapruefung war gruen.
- Ein frischer Kettenlauf erzeugte den Live-Stand nicht.
- Betroffen waren `medical.biomarker_spec_enrichment`, `medical.biomarker_aliases`, die Funktionen `medical.biomarker_marker_candidates` und `medical.import_lab_report_rows` sowie die LOINC-Slug-Eindeutigkeit.

Messung:

- Die Medical-Dateien lagen im Repo, standen aber nicht in `supabase/_pipeline/kette.json`:
  - `14_medical/142_laborimport_matching.sql`
  - `14_medical/143_biomarker_aliases.ts`
  - `14_medical/144_biomarker_spec_enrichment.ts`
- Der Sollstand verwies bereits auf Objekte aus diesen Schritten.

Einordnung:

- Fall: `KETTE UNVOLLSTAENDIG`.
- Nicht: `LIVE AUSSERHALB`.
- Live war gepruefter als die Kette; die Kette musste die vorhandenen Schritte nachziehen.

Umsetzung:

- `142_medical` in die Kette eingetragen.
- `143_medical` in die Kette eingetragen.
- `144_medical` in die Kette eingetragen.
- `145_medical` haengt jetzt an `144_medical`.

Nachweis im frischen Kettenlauf:

| Objekt | Zahl/Zustand |
|---|---:|
| `medical.biomarker_spec_enrichment` | 51 |
| `medical.biomarker_aliases` | 292 |
| `medical.biomarker_reference_ranges` | 560 |
| `medical.biomarker_marker_candidates` | vorhanden |
| `medical.import_lab_report_rows` | vorhanden |
| Medical LOINC-Slug-Eindeutigkeit | 0 Abweichungen |

Der volle Kettenlauf lief danach durch:

```text
Kette: supabase/_pipeline/kette.json (99 Schritte)
KETTE OK: 219.8s
Wegwerf-Datenbank geloescht: lumeos_kette_20260825040939
```

## C-265 Nachtrag: Nutzertexte

Der erste Kettenlauf nach der Medical-Reparatur zeigte einen zweiten Drift:

```text
substance_user_texts: 318, erwartet 290
```

Messung der Quelle:

| Quelle | Zeilen |
|---|---:|
| `substance_user_texts.jsonl` | 318 |
| `substance_faq.jsonl` | 1421 |

Zuordnung:

- Exakter Slug gegen `entity_id`.
- Danach normalisierter Slug gegen normalisierten `canonical_name`.
- Danach exaktes `name_en`.
- Danach Alias.
- Ranking: exakter Slug, normalisierter Slug, sichtbarer Katalogeintrag `im_katalog`, Slug.

Warum der normalisierte Slug noetig war:

- Live: `ashwagandha-ksm66` steht als `Ashwagandha (KSM-66)`.
- Frischer Kettenaufbau: derselbe sichtbare Eintrag stand noch als `Ashwagandha (KSM-66/Sensoril)`.
- Der Kimi-Text `Ashwagandha (KSM-66)` trifft deterministisch auf den Slug `ashwagandha-ksm66`; das ist keine Salzform- oder Fachentscheidung.

Live nach erneutem Einspielen:

| Messwert | Zahl |
|---|---:|
| `supplement_user_texts` | 318 |
| `supplement_faq` | 1421 |
| `texts_sources_nonempty` | 318 |
| `faq_sources_nonempty` | 1421 |
| sichtbare Supplements ohne Text | 0 |

Enhanced-Textfelder:

| Feld | gefuellt |
|---|---:|
| `irreversibel_de` | 112 |
| `ueberwachung_de` | 96 |
| `reinheit_de` | 134 |
| `nicht_im_blut_de` | 134 |
| `rechtslage_klartext_de` | 136 |

Sollstand wurde nachgezogen:

- `supplements.supplement_user_texts`: mindestens 318
- `supplements.supplement_faq`: mindestens 1421

Live-Sicherung vor dem Nachtrag:

```text
backup/c267-nachtrag/20260825_105606_before_live.dump
```

## C-267: Kennungswaechter

Ausgangslage:

- `supplements.supplement_identifiers`: 1226 Zeilen.
- 239 Substanzen tragen die Triade `PubChem_CID`, `molecular_formula`, `InChIKey`.
- Der bestaetigte Caffeine-Konflikt muss gefunden werden.
- Eine dauerhaft rote Gate-Pruefung blockiert aber alle Commits.

Umsetzung:

- Werkzeug: `tools/supplement-kennungen-pruefen.mjs`
- In `pnpm gate` eingehangen.
- Die Pruefung korrigiert keine Kennung.
- Sie meldet bekannte C-267-Konflikte gelb und neue Konflikte rot.

Bekannte Ausnahmen:

| Gruppe | Einordnung |
|---|---|
| `Caffeine (anhydrous)` / `Caffeine (fat-loss context cross-ref)` | bekannter C-267-Konflikt, nicht korrigiert |
| `Vitamin K2 (menaquinone-7)` / `Vitamin K2 (menaquinone-4)` | gleicher UNII-Wert bei abweichenden Triaden, nicht korrigiert |
| `Chromium (as chromium picolinate)` / `Chromium picolinate (metabolic cross-ref)` | gleicher UNII-Wert bei abweichenden Triaden, nicht korrigiert |

Normaler Lauf:

```text
[kennungen] 239 Substanzen mit CID/Formel/InChIKey geprueft
[kennungen] 3 Konfliktgruppe(n)
[kennungen] 3 bekannte C-267-Konfliktgruppe(n), 0 neue.
```

Negativprobe:

```text
KENNUNGEN_NEGATIVPROBE=1
[kennungen] 4 Konfliktgruppe(n)
ROT ... Octodrine (DMHA) | DMHA (octodrine) — see supplements entry
[kennungen] ROT: 1 neue Kennungskonfliktgruppe(n)
```

Damit ist die Richtung belegt:

- Die drei bekannten Konflikte blockieren das Gate nicht.
- Eine vierte Konfliktgruppe macht den Waechter rot.

## Schlusspruefungen

Schemapruefung live:

```text
SCHEMA VOLLSTAENDIG
supplements.supplement_user_texts 318 / 318 ok
supplements.supplement_faq 1421 / 1421 ok
Medical LOINC-Slug-Eindeutigkeit 0 Abweichungen
```

Testdatenpruefung live:

```text
OK: C-82 Testdaten stimmen.
```

Gate:

```text
pnpm gate
Tasks: 11 successful, 11 total
```

## Nachweisdateien

- `scratchpad/c267_nachtrag_141a_rerun.out.txt`
- `scratchpad/c267_nachtrag_141b_rerun.out.txt`
- `scratchpad/c267_nachtrag_counts.py`
- `scratchpad/c267_nachtrag_kette2.out.txt`
- `scratchpad/c267_nachtrag_schema_final2.out.txt`
- `scratchpad/c267_nachtrag_testdaten_final2.out.txt`
- `scratchpad/c267_nachtrag_kennungen_final.out.txt`
- `scratchpad/c267_nachtrag_kennungen_negativ_final.out.txt`
- `scratchpad/c267_nachtrag_gate_final.out.txt`
- `backup/c267/supplement-kennungen-konflikte.json`
- `backup/c267/supplement-kennungen-negativprobe-nachtrag.json`
- `backup/c267-nachtrag/20260825_105606_before_live.dump`

Nicht committet, nicht gestaged, nicht gepusht.
