# C-272 — Codex, 2026-08-25

Bericht: `docs/berichte/c-272-codex.md`

**Welle 1: Der Katalog wird inhaltlich fertig.** Alles, was in Kimis
Bestand zu den sichtbaren Substanzen liegt und noch nicht bei uns ist.

Grundlage: `docs/ssot/96-kimi-inhalt.md` — dort ist jede Datei
geoeffnet und beschrieben.

Quelle:
`docs/kimi_research/supplement_performance_database/data/evidence/`

---

## Stand am 2026-08-25, nach C-275 bis C-277

`[cmd]` **Der Auftrag wurde am selben Tag einmal gestoppt** — er ging
raus, waehrend dem Katalog **128 Substanzen fehlten**, darunter
Testosteron mit allen Estern. **Das ist behoben:**

    supplements.supplements       596
    im_katalog                    412   (vorher 318)
    davon sichtbare Unterformen     0
    Unterformen mit parent_id     101
    supplement_user_texts         446
    supplement_faq              1.970

`[cmd]` **Und die Ausgangszahlen fuer diesen Auftrag, frisch
gemessen:** `supplement_wada.note_de` **0** ·
`supplement_lab_effects` **222** ·
`entity_transporters` mit `entity_type='supplement'` **135**.

`[read]` **Der Entwurf `141d_kimi_wada_scope.ts` liegt bereits im
Baum**, nicht verkettet und nicht ausgefuehrt — aus dem gestoppten
Lauf. **Pruef ihn, statt neu anzufangen.**

---

## WAS ZU IMPORTIEREN IST

### 1 · WADA-Geltungsbereich — die groesste Luecke

`[cmd]` **`wada_scope_enrichment.jsonl` 446 Records** ·
**`wada_scope_notes_enrichment.jsonl` 318 Records.**

`[cmd]` **Heute: `supplement_wada.note_de` bei 0 von 290.** Die Kachel
sagt seit G-182 *„im getesteten Wettkampf"* — **aber worauf sich das
bezieht, steht nirgends.**

Felder: `note_de` · `scope_class` · `wada_category` · `sources` (je
Record mit `verified`).

`[read]` **Zwei Dateien, zwei Detailgrade.** `wada_scope_enrichment`
hat den Kategorie- und Geltungssatz; `wada_scope_notes_enrichment`
hat **fuenf verifizierte Quellen** und den schaerferen Hinweis, dass
Natural-Ligen eigene, weitergehende Listen fuehren. **Miss, ob sie
sich widersprechen** — wo ja: beide behalten, Konflikt melden.

`[cmd]` **Und sechs Korrekturrecords in `wada_status_enrichment`:**
z. B. Hydrochlorothiazid steht bei uns `not_prohibited`, die Liste 2026
sagt **S5, jederzeit verboten.** `[read]` **Das ist eine inhaltliche
Korrektur, keine Ergaenzung** — als Konflikt behandeln, nicht still
ueberschreiben.

### 2 · Laborwirkung mit einer Unterscheidung, die uns fehlt

`[cmd]` `lab_effects_enrichment.jsonl` **47 Zeilen.**

**Das wichtigste Feld ist `effect_class`:**

    physiological_lab_change        der Wert aendert sich wirklich
    analytical_assay_interference   der Wert wird falsch gemessen

`[read]` **Beispiel Daptomycin: INR bis +43 % — Schein-Antikoagulation
ohne Blutungsrisiko.** Wer das verwechselt, behandelt einen Messfehler.
`[cmd]` **`supplement_lab_effects` (222 Zeilen) hat kein solches
Feld.** Ergaenzen.

Dazu `direction`, `magnitude_context`, `clinical_relevance`,
`source_ids`.

### 3 · Human-Evidenz statt Zaehlfelder

`[cmd]` `human_evidence_flags.jsonl` **293 Zeilen** mit
`human_evidence_available`, `rct_evidence_available`,
`meta_analysis_available`, `source_ids`, **`missing_reason`.**

`[read]` **Kimi empfiehlt ausdruecklich, die Zaehlfelder abzuloesen** —
`human_trials`, `randomized_trials`, `meta_analyses`. `[cmd]` Genau
die stehen in unserem `supplement_evidence`. **Importieren, aber die
alten Spalten nicht anfassen** — die Ablaesung ist ein eigener Punkt.

### 4 · Thailand

`[cmd]` `thailand_regulatory_enrichment` **85** ·
`thailand_product_regulatory` **499** ·
`thailand_medication_regulatory` **477** · `thai_legal_glossary` 19
Begriffe.

`[read]` **Quellen sind die offiziellen NARCO- und PHYCHO-Listen der
Thai FDA** (09/2025 und 07/2025). **Fuer Nutzer in Thailand ist das
kein Nebenthema.**

### 5 · Der Rest der Pharmakologie

`[cmd]` `cyp_enrichment` 666 und `transporter_enrichment` 513 sind
teilweise drin — `[cmd]` `entity_cyp` traegt 816 mit
`entity_type='supplement'` plus 295 Performance, `entity_transporters`
nur **135**.

**Miss je Datei, was fehlt, und importier den Rest.** `[read]`
**`role = 'not_relevant'` ist ein Ergebnis, kein fehlender Wert** —
mitimportieren.

### 6 · Studien und Alias-Kandidaten

`[cmd]` `studies.jsonl` **43** mit `evidence_level`, `pmid`, `subjects`
— **die Substanzen stehen im Klartext drin.**
`[cmd]` `alias_resolution_candidates` **64** mit `resolution_state` und
`resolution_type`.

### 7 · Die PubChem-Konflikte

`[cmd]` `conflict_records_gap_fill_pubchem.jsonl` **20 Zeilen**: **6
echte Konflikte** (Creatine HCl, Caffeine anhydrous, NR, GLP-1,
Andarine, hCG), 2 InChIKey-Abweichungen, 12 Lookup-Artefakte.

`[cmd]` **Unser Waechter aus C-267 kennt drei als Ausnahme und
muesste sechs kennen.** Die Konflikt-Records importieren und die
Ausnahmeliste daraus speisen — **nicht von Hand pflegen.**

`[read]` **Keine Kennung korrigieren.** Der Konflikt bleibt sichtbar.

---

## WAS NICHT ZU TUN IST

**Die 248 unsichtbaren nicht anfassen.** `[cmd]` 122 davon sind bei
Kimi bekannt, 126 nicht — **das ist ein eigener Schritt.**

**Nichts anzeigen.** Dieser Auftrag fuellt die Datenbank; die
Oberflaeche kommt danach.

**Keinen Wert still ueberschreiben.** Wo Kimi etwas anderes sagt als
unser Bestand: **beide behalten, Konflikt melden.**

`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS — Erwartung VOR dem Lauf

    supplement_wada.note_de        0 -> Zahl nennen
    lab_effects mit effect_class   0 -> Zahl nennen
    human_evidence_flags           neu, Erwartung 293
    Thailand-Records               neu, Erwartung ~1060
    entity_transporters          135 -> Zahl nennen
    Konflikt-Records               neu, Erwartung 20

`[read]` **Und weil es zweimal an genau dieser Stelle schiefging:
nenn nach dem Lauf `im_katalog` fuer Kette UND Live.** `[cmd]` Beide
stehen heute bei **412**, sichtbare Unterformen **0**. **Weichen sie
danach ab, ist der Import die Ursache** — C-276 und C-277 waren beide
von dieser Sorte.

**Gegenprobe an drei namentlich genannten Substanzen:** eine mit WADA-
Verbot, eine ohne, und **Biotin** — `[cmd]` dessen Laborwirkung auf
Troponin ist der Fall, an dem `effect_class` zaehlt.

**Negativprobe:** eine Erwartungszahl um eins verstellen, der Lauf muss
rot werden.

## PIPELINE

Kettenschritte hinter `141c`, **eine Sache je Schritt.** Wegwerf-
Datenbank, Sicherung vorher, **und live einspielen** mit Vollsicherung
in `backup/vollsicherung/`.

`[cmd]` **Die Kette steht bei 101 Schritten, `KETTE OK`, Gate gruen.**
Halt sie so.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
`docs/kimi_research/` steht in `.gitignore` — lesen, nicht committen.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
