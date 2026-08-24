# C-262 — Codex, 2026-08-24

Bericht: `docs/berichte/c-262-codex.md`

**Der Import. Vier Wellen, live.** Kein weiterer Abgleich — die
Grundlage steht.

---

## Warum jetzt

`[cmd]` **Stichprobe des Orchestrators an 300 gemeldeten FEHLT-Werten
gegen den Volltext der Entitaet in `data/`: 289 fehlen tatsaechlich,
11 waren Fehlmeldungen** (kurze generische Werte wie `substrate`, die
irgendwo im Datensatz vorkamen). **Rund 3,7 % Rauschen — belastbar
genug.**

`[read]` **Die 37.886 FEHLT-Zeilen sind aber nicht 37.886
Importposten.** Drei Sorten stecken darin:

    Sachwerte       pk_fields.elimination_route.value,
                    renal.severity_bands[], cyp.*.evidence
    Pruefvermerke   transporters.OATP1B1.role = "not_relevant"
                    - fachlich richtig, sagt "hier gibt es nichts"
    Provenienz      sources[].setid, .url, .type

**Alle drei gehoeren importiert**, aber in verschiedene Spalten und
mit verschiedenem Gewicht. `[read]` **Ein `not_relevant` ist ein
Ergebnis, kein fehlender Wert** — es darf in der Oberflaeche nicht wie
eine Luecke aussehen.

---

## WELLE 1 — die pharmakologische Ebene

**Das Wichtigste zuerst, weil es das Einzige ist, was Warnungen
ermoeglicht.**

`[cmd]` Quellen unter `data/evidence/`:

    cyp_enrichment.jsonl                    666 Zeilen
    transporter_enrichment.jsonl            513
    medication_pk_enrichment_crawl_038.jsonl 407
    medication_renal_hepatic_enrichment.jsonl 391
    medication_reproductive_enrichment.jsonl 417
    supplement_dosing_enrichment.jsonl      290
    human_evidence_flags.jsonl              293
    wada_status_enrichment.jsonl            448
    thailand_medication_regulatory_enrichment.jsonl 477
    thailand_product_regulatory_enrichment.jsonl    499

**Ziel:** `supplement_pharmacology`, `supplement_dosing`,
`supplement_evidence`, `supplement_wada`, `supplement_regulatory` —
und wo das Schema nicht reicht, **neue Tabellen**, nicht neue Spalten
an der Haupttabelle.

`[cmd]` **Zehn Transporter je Entitaet** (P-gp, BCRP, OATP1B1,
OATP1B3, OAT1, OAT3, OCT2, MATE1, MATE2-K) mit `role` und `evidence`.
`[cmd]` **Sechs CYP-Enzyme** (3A4, 2D6, 2C9, 2C19, 1A2, 2B6) mit
`role`, `evidence`, `note`, `source_ids`.

`[read]` **Das gehoert in eigene Zeilen, nicht in Spalten.** Zehn
Transporter mal zwei Felder waeren zwanzig Spalten — und beim naechsten
Transporter dieselbe Diskussion. **Tabelle `supplement_transporters`
mit einer Zeile je Entitaet und Transporter.** Dasselbe fuer CYP.

`[read]` **`not_relevant` wird gespeichert, nicht weggelassen.** Der
Unterschied zwischen *„geprueft, kein Effekt"* und *„nie geprueft"* ist
genau das, was die Oberflaeche zeigen muss.

**Erwartung, hinschreiben vor dem Lauf:** Zeilen je Zieltabelle.
`[cmd]` Heute: `supplement_pharmacology` 566, `supplement_dosing` 566 —
beide mit ueberwiegend leeren Feldern.

## WELLE 2 — Biomarker und Symptome

`[cmd]` `biomarker_explanations.jsonl` **66 Marker, 24 Felder, auf
Deutsch** — `what_it_measures`, `major_physiological_role`,
`common_reasons_high`, `common_reasons_low`, `exercise_effects`,
`fasting_effects`, `important_confounders`, `interpretation_caveats`.

`[cmd]` `symptom_biomarker_map.jsonl` **102 Kanten** ueber **34
Symptome** (`taxonomy/symptom_ids.json`), je mit `is_diagnosis_claim`
und `boundary_note`.

**Neue Tabellen:** `medical.biomarker_explanations`,
`medical.symptoms`, `medical.symptom_biomarker_map`.

`[cmd]` **Die 66 LOINC-Kandidaten stehen auf
`candidate_only_needs_repo_validation`** — Kimi kannte unseren Katalog
nicht. **Gegen `medical.biomarker_reference_ranges` (560 Zeilen)
abgleichen.** Wo der Code passt: verknuepfen. Wo nicht: **melden, nicht
zuordnen.**

`[read]` C-248 hat die LOINC-Eindeutigkeit repariert und dabei einen
Waechter gebaut. **Der muss nach diesem Import gruen bleiben.**

## WELLE 3 — Namensbruecke und die 248 verborgenen

`[cmd]` `data/admin/_canonical_id_lookup.json` — **1.131 Namen auf
`sub_`-IDs.** *anavar → oxandrolone*, *dianabol → methandienone*.

**Zu tun:** die 248 verborgenen `f05_substance_candidate`-Zeilen
aufloesen. Handelsname wird Alias am recherchierten Eintrag, der
Eintrag traegt beide Namen im Titel (`Methandienone (Dianabol)`), die
`f05`-Zeile haengt per `parent_id` daran.

`[cmd]` **Und die 29 Unterformen zurueck in die Sichtbarkeit.** C-257
hat `im_katalog` um `parent_id IS NULL` erweitert; seither sind sieben
Magnesiumformen mit Evidenzgraden unsichtbar, samt der 29
`form_note_de`. **Entweder Regel zuruecknehmen oder Lesepfad bauen, der
sie unter dem Elterneintrag zeigt.**

## WELLE 4 — das Medikamentenmodul

`[cmd]` **498 Wirkstoffe** (39 Felder: ATC, CAS, RxNorm, UNII,
`adverse_effects`, `contraindications`, `cyp`, `dosage_models`,
`fertility`, `food_interactions`) · **453 Formulierungen** · **448
Produkte** · **498 Regulatory**.

`[cmd]` Heute: `medical.user_medications` **2 Zeilen**, kein
Wirkstoffkatalog. **Das ist ein neues Modul, kein Nachtrag.**

`[cmd]` Dazu **20 Medikamentenregeln** aus `data/platform/` — dann kann
das System Wechselwirkungen zwischen Medikament und Supplement pruefen.

---

## WAS NICHT ZU TUN IST

**Keine Nutzertexte erfinden.** `[cmd]` `claimed_effects` 0 von 154,
`common_research_uses` 0 von 154 — **auch bei Kimi.** Die kommen in
einem eigenen Auftrag.

**Keine Community-Daten importieren.** `data/admin/` ist `admin_only`,
`evidence_class E`, `not_medical_recommendation`. **Ausnahme:
`_canonical_id_lookup.json`** — das ist eine Namenstabelle, keine
Community-Aussage.

**Kein Buddy-Material:** `population_*`, `observation_comparison_*`,
`response_*`, CAM- und Vision-Vertraege. `[read]` Tom, 2026-08-23:
*„gehoert nicht in eine userplattform welche erklaerend/aufklaerend
sein soll."*

**Kimis Schema nicht uebernehmen.** 44 Felder in einem Objekt gegen
unsere 43 Tabellen. **Abbilden, nicht kopieren** — sonst ist die
Breittabelle zurueck, die C-232 bis C-235 abgeschafft haben.

**Keinen Sachkonflikt still aufloesen.** `[cmd]` 10.010 stehen in
`SACHKONFLIKTE.md`. **Wo Report und `data/` verschiedene Aussagen
tragen: den `data/`-Stand importieren und den Konflikt in einer
Spalte vermerken.** Nicht entscheiden.

`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.
Nichts in `docs/todo/` oder `docs/ssot/` schreiben.

## NACHWEIS — Erwartung VOR dem Lauf, beide Richtungen

**Je Welle und je Zieltabelle: Zeilen vorher, Zeilen nachher,
Erwartung vorher hingeschrieben.**

**Gegenprobe an fuenf namentlich genannten Entitaeten** — Digoxin
(P-gp-Substrat, enge therapeutische Breite), Metformin, Kreatin,
Biotin (verfaelscht Laborwerte), Semaglutid. **Bei jeder muss nach dem
Import stehen, was vorher fehlte.**

**Negativprobe:** eine Erwartungszahl um eins verstellen, der Lauf muss
rot werden.

**Und der Beleg ueber die Datenbank hinaus:** `pnpm gate` gruen, der
LOINC-Waechter aus C-248 gruen, `node tools/schuss.mjs` auf
`/v2/supplements` und `/v2/medical` ohne Konsolenfehler.

`[read]` **Gegen Kimis eigene Engine pruefen:** `tools/rule_engine.py`
und `tools/validate_dataset.py` liegen im Quellverzeichnis. **Ein
Import, der andere Ergebnisse liefert als der Referenzlauf, ist falsch
importiert.**

## PIPELINE

Kettenschritte hinter `140_supplement_nutzertexte.sql`, **eine Welle je
Schritt.**

Wegwerf-Datenbank, Sicherung vorher, voller Kettenlauf, **und live
einspielen** mit Vollsicherung davor.

`[read]` **Nach jeder Welle sichern und den Zwischenstand melden.**
Wenn Welle 4 scheitert, sollen 1 bis 3 nicht verloren sein.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Pruefschleifen als Skript-Datei, nicht als Shell-Einzeiler mit `$(...)`.
Repo-Text mit Sonderzeichen nicht ueber die Standardeingabe einer
interaktiven Sitzung schreiben — `encoding="utf-8", newline="\n"`.
**Keine Datei ueber 10 MB ins Repo** — der Hook weist sie ab.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
