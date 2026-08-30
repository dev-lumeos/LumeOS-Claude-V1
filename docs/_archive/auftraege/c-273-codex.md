# C-273 — Codex, 2026-08-25

Bericht: `docs/berichte/c-273-codex.md`

**Welle 2: Schema `wissen`** — alles aus Kimis Bestand, das wir noch
nicht anzeigen, aber nicht verlieren duerfen.

Grundlage: `docs/ssot/96-kimi-inhalt.md`, dort ist jede Datei
geoeffnet und beschrieben.

Quelle: `docs/kimi_research/supplement_performance_database/data/`

---

## Warum jetzt

`[cmd]` **`docs/kimi_research/` steht in `.gitignore`** — der Bestand
ist **nicht versioniert, nicht gesichert, nicht gemessen.**

`[cmd]` **In vier Tagen dreimal belegt, dass Dateien dort vergessen
werden:** `RESEARCH_STATUS.md` dreimal zitiert und nie geoeffnet · die
Dosis-Anreicherung in C-262 durchgerutscht · `data/admin` im ersten
Bestandsbericht nicht erwaehnt.

`[read]` **In der Datenbank ist Wissen auffindbar, zaehlbar und
gesichert. In einem ignorierten Ordner ist es eine Hoffnung.**

## Warum ein eigenes Schema

`[read]` **Nicht nach `supplements`.** Was dort liegt, gehoert in den
Katalog; alles andere macht ihn unuebersichtlich **und verleitet dazu,
es anzuzeigen, bevor es durchdacht ist.**

**Schema `wissen`.** Nichts davon wird angezeigt.

---

## WAS ZU IMPORTIEREN IST

### 1 · Die Regel-Engine — der wertvollste Block

`[cmd]` **64 Regeln mit ausfuehrbaren Bedingungen:** `warning_rules`
29 · `medication_rules` 20 · `nutrient_gap_rules` 15, aus
`data/platform/`.

**Beispiel `wr_warfarin_vitk`:**

    conditions   medical.medications[].drug_class contains
                 'anticoagulant:warfarin'
                 UND supplements.stack contains_any_substance
                 $RULE_SUBSTANCES
    substance_ids  sub_52bdb964c4, sub_0b5c620106, sub_6764c8891c
    message_de   "Vitamin K veraendert die Warfarin-Wirkung (INR
                  sinkt). Jede Aenderung -> INR-Kontrolle aerztlich
                  abstimmen."
    explain_template  rule_id, triggered_by, reason, evidence_ids

`[cmd]` **Dazu zwingend:** `module_field_spec.json` — die kanonischen
Feldpfade je Modul (`medical.labs`, `supplements.stack_item`,
`training.load_spike`, `profile.athlete_tested_pool`) — und
`rule_trait_mapping.json`, das 157 `drug_class`-Werte auf
Regel-Merkmale abbildet.

`[read]` **Ohne diese beiden sind die Regeln Text.** Mit ihnen sind
sie eine Schnittstelle, die auf unsere Datenmodelle passt.

`[cmd]` **`rule_catalog` in `supplements` traegt bereits 64 Zeilen** —
**miss, ob es dieselben sind.** Wo ja: nicht doppelt anlegen, sondern
die fehlenden Felder ergaenzen. Wo nein: melden.

### 2 · Die Register — sie sagen, was wir NICHT bauen sollen

`[cmd]` `constant_evidence_registry` **181** ·
`formula_evidence_registry` **22** · `recovery_modality_evidence`
**32** · `fatigue_signal_evidence` **17** ·
`training_structure_registry` **13**. Alle mit `current_value: null`.

`[cmd]` **`formula_evidence_registry` traegt
`acwr_decision: implement: no`** mit Begruendung und PMID 32502973.
`[cmd]` **`recovery_modality_evidence` traegt `synthetic_seed_flags`**
— vier Konzepte, die als synthetische Startwerte markiert sind.

`[read]` **Das sind die P0-Punkte aus Kimis Backlog** — *ACWR nicht
implementieren*, *Recovery-Boni und synthetische Seed-Werte entfernen*.
**Heute wertvoll, nicht spaeter.**

`[read]` **Aber nur importieren, nicht anwenden.** Ob im Repo
tatsaechlich ACWR steckt oder Seed-Werte stehen, ist ein eigener
Punkt — **dieser Auftrag legt die Grundlage, er raeumt nicht auf.**

### 3 · Die Lueckenkarten

`[cmd]` `knowledge_gap_resolution` **56** ·
`knowledge_gap_dependency_map` **46** · `research_hold_registry`
**305 Holds** (davon 67 `REPO_DEPENDENCY`).

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
nicht*** — und eine fertige Priorisierung dazu. **Ohne sie laesst in
sechs Wochen jemand recherchieren, was `NOT_APPLICABLE` ist.**

### 4 · Die Produktebene

`[cmd]` **50 Produkte, deren Zutaten unsere `sub_*`-IDs tragen:**

    product_id     prd_882416d5
    ingredients    [{ingredient_id: sub_43b1e64b52,
                     amount: 24, unit: "g"}]
    certifications gmp, informed_sport, third_party_tested
    pricing        USD 39.99, price_per_serving 1.38
    availability   thailand: "widely available"

`[cmd]` Dazu **120 Marken**, **63 Hersteller** mit `GMP_status`,
`recalls`, `regulatory_actions`, und `brand_index.json` mit
Thailand-Praesenz.

`[read]` **Das ist die Ebene, fuer die die Kosten-Kachel seit C-250
markiert ist** — mit **Preis je Portion**, den wir nirgends haben.
**Importieren, nicht anzeigen:** laut C-266 kommt die Produktebene im
Endausbau von den Anbietern. **Dies ist das Muster, an dem sich der
Anbau messen laesst.**

### 5 · Das Scan-Konzept

`[cmd]` Vier Vertraege, alle `schema_only_no_implementation`:
`supplement_cam_contract` · `medication_cam_contract` ·
`peptide_cam_contract` · `prescription_vision_contract`. Dazu
`vision_learning_example_schema`, `vision_product_match_signals`,
`product_media_rights_registry`.

`[read]` **Die Regeln darin sind das Wertvolle:** *„never match by name
alone if several products exist"* · sicherheitskritische Felder
(Wirkstoff, Staerke, Route, Frequenz) mit Bestaetigungszwang ·
**QR-COA-Vertrauensmodell** mit Allowlist · **Batch ist kein
Produkt-Identifier** · acht Medienrechte-Zustaende mit
`can_display`/`can_store`/`can_train`.

### 6 · Reise mit Medikamenten

`[cmd]` `travel_medication_requirement_schema.json` — je Land und
Medikament: Verschreibungspflicht, Arztbrief, Mengenbegrenzung,
Zolldeklaration, Originalverpackung, Kuehlkette, Vorabgenehmigung.
**Sieben Beispiellaender.** Dazu `thai_legal_glossary` mit 19
Begriffen.

`[read]` **Fuer eine Plattform mit Nutzern in Thailand kein
Nebenthema.**

### 7 · Buddy — importieren, nicht anzeigen

`[cmd]` `population_response_atlas` **425** · `_synthesis` **277** ·
`_applicability` **277** · `response_confounder_graph` **799** ·
`response_modifier_graph` **453** · `response_resolver_index` **277**.

`[cmd]` **`observation_comparison_semantics`** definiert **14
Zustaende, je mit `allowed_buddy_language` und
`forbidden_buddy_language`** — ein fertiges Sprachregelwerk. Dazu 46
synthetische Beispiele.

`[cmd]` **`buddy_capability_map`** 23 Faehigkeiten mit
`blocking_gaps` · **`buddy_dependency_graph`** 64 Knoten, 140 Kanten,
**Vokabular nur `REQUIRES`** — ausdruecklich *„no CAUSES edge type; no
speculative medical causality."*

`[cmd]` **`personal_response_readiness_model`** — 66 Marker mit
biologischer und analytischer Variabilitaet aus der EFLM-Datenbank.
`[read]` **Damit ist beantwortbar, ob eine Veraenderung echt ist oder
Messrauschen.**

### 8 · Community — `admin_only`

`[cmd]` `data/admin/`: 123 Nutzungsmuster · 86 Einnahmemuster · 43
Laborbeobachtungen mit `lab_verified` · 40 Qualitaetssignale · 37
Nebenwirkungsmuster · 31 Stack-Muster · **30 `community_science_delta`
— wo die Community von der Wissenschaft abweicht, mit Begruendung** ·
179 Alias-Vorschlaege · 315 Quellen.

`[read]` **Jeder Datensatz traegt `admin_only: true`,
`not_medical_recommendation: true`, `evidence_class: E`.** **Diese
Marken werden mitimportiert und sind nicht optional** — sie sind der
Grund, warum das Material ueberhaupt getrennt gefuehrt werden kann.

---

## WAS NICHT ZU TUN IST

**Nichts anzeigen.** Kein Lesepfad, keine Komponente.
`apps/` nicht anfassen — Claude Code arbeitet an G-191.

**Nichts nach `supplements` oder `medical` importieren.** Was dorthin
gehoert, ist mit C-272 drin.

**Kimis Schema nicht kopieren.** `[read]` Abbilden auf unsere
Struktur — sonst ist die Breittabelle zurueck, die C-232 bis C-235
abgeschafft haben.

**Keine Regel ausfuehren, kein Register anwenden.**

Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS — Erwartung VOR dem Lauf

**Je Tabelle: Zeilen vorher (0), Zeilen nachher, Erwartung vorher
hingeschrieben.**

`[read]` **Und die Marken zaehlen, nicht nur die Zeilen:** wie viele
Community-Zeilen tragen `admin_only`, wie viele Vertraege
`schema_only_no_implementation`, wie viele Register
`current_value: null`. **Eine Marke, die beim Import verlorengeht, ist
schlimmer als eine fehlende Zeile.**

**Gegenprobe an drei namentlich genannten:** `wr_warfarin_vitk` (Regel
mit Substanz-IDs) · `kgap_852572baac` (Lueckenkarte) ·
`prd_882416d5` (Produkt mit `sub_*`-Zutat, **die ID muss auf eine
existierende Substanz zeigen**).

**Negativprobe:** eine Erwartungszahl um eins verstellen, der Lauf muss
rot werden.

`[cmd]` **Und wie bei C-272: nenn `im_katalog` fuer Kette UND Live.**
Beide stehen bei **412**, sichtbare Unterformen **0**. **Weichen sie
ab, hat dieser Import etwas beruehrt, das er nicht sollte.**

## PIPELINE

Kettenschritte in einem neuen Bereich, **eine Sache je Schritt.**
Wegwerf-Datenbank, Sicherung vorher, live einspielen mit Vollsicherung
in `backup/vollsicherung/`.

`[read]` **Nach jedem Block sichern und den Zwischenstand melden.**
Acht Bloecke sind viel — wenn Block 7 scheitert, sollen 1 bis 6 nicht
verloren sein.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
`docs/kimi_research/` steht in `.gitignore` — lesen, nicht committen.
Keine Datei ueber 10 MB ins Repo.

`[cmd]` **Der Dev-Server laeuft auf PID 343416** — Tom sieht sich den
Katalog an. **Nicht neu starten.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
