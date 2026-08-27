---
nr: C-325
typ: messung
modul: supplements
schwere: hoch
angelegt: 2026-08-27
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien:
    - docs/punkte/todos/supplements-c-0129-der-kimi-bestand-brauchbar-aber-nicht-importierbar.md
zahlen:
  gemessen: 2026-08-27
  supplements_punkte: 42
  blocker: 3
agent: codex
beauftragt: 2026-08-27
---

# C-325 — die drei Supplements-Blocker gegen den heutigen Stand pruefen

## Befund

`[cmd]` **42 offene Supplements-Punkte, drei davon `blocker` mit
`schwere: hoch`:**

    C-129   Der Kimi-Bestand - brauchbar, aber nicht importierbar
    C-260   Die Arbeitsberichte sind nicht in die Daten
            zurueckgeflossen
    C-202   Produkte, Marken, Hersteller, Kennungen

`[read]` **Alle drei stammen aus der Zeit vor dem Katalogaufbau.**
`[cmd]` Seither sind 412 Substanzen sichtbar, 446 mit Nutzertext und
FAQ, und Kimis Wellen 1 bis 4 sind importiert.

`[read]` **Vier von vier stichprobenartig geprueften Punkten waren
heute veraltet** — G-207, G-211, G-138, G-176. **Ein Bauauftrag auf
C-129 waere der fuenfte auf toter Praemisse.**

`[cmd]` **C-202 dagegen ist heute erst richtig aufgegangen:** die
Produktebene existiert mit 448 Produkten und 428 Marken, **aber `DE`
steht bei 0.** C-308 haengt daran.

## Auftrag

### Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine.** `[cmd]`
**Du hast heute fuenfmal meine Zahl berichtigt** — 20 statt 31
Regeln, 43 statt 47 C-Punkte, 6.084 statt 6.600 Zeilen, 411 statt 412
Nutzertexte, 43 statt 47 Punkte in der Liste.

### Vier Punkte, je ein Urteil mit `[cmd]`

    C-129   Kimi-Bestand importierbar?
    C-260   Arbeitsberichte in den Daten?
    C-262   Der Import - vier Wellen
    C-202   Produkte, Marken, Hersteller, Kennungen

**Je Punkt:** `erledigt` · `teilweise` · `offen` · `ueberholt` ·
`unklar` — **mit `[cmd]` je Urteil, ohne Ausnahme.**

`[read]` **Ein Punkt, den du ohne Messung fuer erledigt haeltst,
bleibt `unklar`.** Das ist kein Makel, sondern das ehrliche Ergebnis.

### Bei `teilweise` und `offen`: was genau fehlt

`[read]` **Nicht *,,noch nicht fertig"*, sondern die Zahl.** Wenn
C-262 drei von vier Wellen importiert hat, **welche fehlt und wie
viele Zeilen sind es?**

`[cmd]` **Bei C-202 weiss ich schon, was fehlt:** 448 Produkte, davon
`US` 324, `CA` 56, `TH` 6, `UK` 4, `AU` 2 — **`DE` null.** `[read]`
**Pruef, ob der Punkt noch mehr meint als die fehlenden Marktdaten**
— Kennungen, Hersteller, Verpackungen sind eigene Fragen.

### Und die zwei formalen Blockaden aufloesen

`[cmd]` **C-272 traegt `braucht: C-275, C-276`, C-317 traegt
`braucht: C-274`.** `[read]` **Alle drei Vorbedingungen sind
geschlossen** — die Blockade ist nur noch formal. **Entfernen und im
Bericht nennen.**

### Was nicht zu tun ist

**Nichts reparieren, nichts importieren, nichts anlegen.** `[read]`
**Dies ist eine Bestandsaufnahme.** Was du findest, wird ein Auftrag.
**Keinen Punkt zusammenlegen oder streichen.**
`apps/` nicht anfassen — Claude Code arbeitet dort.
`docs/todo/` nicht anfassen. Nicht committen, nicht stagen, nicht
pushen.

### Nachweis

    Punkte geprueft            4
    je Urteil                  mit `[cmd]`
    bei teilweise/offen        was genau fehlt, in Zahlen
    braucht-Felder bereinigt   2
    Waechter                   gruen, Sollstand genannt

`[read]` **Und die Zahl, die zaehlt:** wie viele der drei
`hoch`-Blocker bleiben? **Wenn zwei wegfallen, sortiert sich die
Liste von selbst.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Lesend gegen live ist in Ordnung.**
**Nach jeder Aenderung `node tools/punkte-index.mjs --schreiben`.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

**Stand: 2026-08-28.** Ausgangszahlen wurden gegengeprueft: 412 von 596
Katalogeintraegen sind sichtbar. 446 Textzeilen und 1.970 FAQ-Zeilen
liegen vor, aber nur 411 der 412 sichtbaren Eintraege haben einen
nichtleeren deutschen Kurztext und FAQ. Die Annahme "446 mit Nutzertext
und FAQ" verwechselt somit Gesamt- und sichtbaren Bestand.

### C-129 - teilweise

`[cmd]` Live: 596 Supplements (412 sichtbar), 498 Wirkstoffe, 448
Medikamenteprodukte und exakt 29 Warn-, 15 Gap- und 20
Medikamentenregeln. Gegenueber der Ausgangslage 237 / 56 / 124 ist der
Bestand importiert. Alle 20 Medikamentenregeln sind `auswertbar`;
`user_medications` und `user_conditions` existieren mit je 2
referenzierbaren Zeilen. Es gibt 2.843 `supplement_aliases` fuer alle
596 Eintraege und 1.541 `substance_aliases` fuer 654 Entitaeten.

`[cmd]` Von 64 Regeln sind 44 `auswertbar`, 14 `blockiert` und 6
`teilweise`: **20/64 Regeln** haben keine volle Eingabedeckung. Der
sichere Nutzer-Schreibweg fuer Medikamente bleibt C-285. Der Befund ist
kein historischer Importblocker mehr, aber nicht erledigt.

### C-260 - teilweise

`[cmd]` `crawl_027_ws/A.json` hat 37 Eintraege, aber nicht die alten
Feldzahlen: 34 nichtleere CAS- und UNII-Eintraege (je 33 unterschiedliche
Werte), 31 PubChem_CID, 31 InChIKey, 13 ChEMBL und 35 Sequenzen. In
`supplement_identifiers` liegen 30/33 UNII, 29/31 PubChem_CID, 27/31
InChIKey und 13/13 ChEMBL, jedoch **0/33 CAS**.

`[cmd]` Von 89 unterschiedlichen Report-Aliasen sind 41 vorhanden,
davon 39 mit Quelle `kimi_crawl_027`: **48/89 fehlen**. Eine fachliche
Sequenzspalte oder -tabelle fehlt in `supplements`/`medical`; damit
bleiben **35/35 Sequenzen** ohne Zielstruktur. Der Report ist teilweise
eingeflossen, blockiert aber nicht mehr pauschal jeden Import.

### C-262 - teilweise

`[cmd]` Welle 2 und 4 treffen die Ausgangszahlen: 66
`biomarker_explanations`, 34 `symptoms`, 102 `symptom_biomarker_map`,
498 Wirkstoffe, 453 Formulierungen, 448 Produkte und 20
Medikamentenregeln.

`[cmd]` Welle 1 ist nicht vollstaendig: `entity_cyp` hat 3.001 und
`entity_transporters` 4.617 Zeilen, aber `entity_pk` und
`entity_renal_hepatic` stehen bei **0**; WADA hat **337** statt 448.
Welle 3 hat 1.541 Namensbruecken, aber **0 sichtbare Unterformen** bei
101 Unterformen insgesamt, nicht 29 sichtbar. Diese zwei leeren
Zieltabellen und die 29 erwarteten sichtbaren Unterformen bleiben offen.

### C-202 - teilweise

`[cmd]` `medical.medication_products` hat **448 Produkte**, **428
Marken**, 244 Hersteller und 443 referenzierte Formulierungen. Die
Ausgangszahlen 448/428 stimmen. Die Verteilung weicht ab: US 380, CA
112, TH 62, UK 60, AU 58, EU 56, **DE 0** statt 324/56/6/4/2.

`[cmd]` Der Punkt meint mehr als DE: Verpackung ist **0/448** nichtleer;
GTIN, EAN, UPC, nationaler Produktcode und Herstellerproduktcode sind
je **0** nichtleer. Befuellt sind NDC 355/448, canada_din 56/392,
EU-Kennung 7/448, Thailand 6/448, UK-PL 4/4 und AU-ARTG 2/2. Nur
31/448 Zeilen haben nichtleere Identifier-Provenienz. Tabellen fuer
`product_media`, `packaging_versions`, `batch_coa` und
`vision_learning_examples` gibt es in `medical` und `supplements`
jeweils **0**. Die vorhandene Produktebene liegt ausserdem unter
`medical`, nicht als Supplements-Produktschema.

### Formale Abhaengigkeiten

`[cmd]` C-272 verwies auf C-275 und C-276; deren Abschlussberichte
liegen vor. Sein `braucht`-Feld wurde von zwei Eintraegen auf leer
bereinigt.

`[cmd]` Die zweite geforderte Bereinigung geht nicht auf: C-315 bewertet
C-274 als `teilweise`, und die heutige Messung ergibt weiter 0 sichtbare
Unterformen. C-317 behaelt deshalb `braucht: ["C-274"]`. Es wurden **1
statt 2** braucht-Felder bereinigt; eine Entfernung waere eine falsche
Entblockierung.

**Ergebnis:** C-129, C-260 und C-202 bleiben `teilweise`, also **3/3**
der hoch gefuehrten Blocker. C-262 ist ebenfalls `teilweise`.

`[cmd]` Nach der Aenderung: `node tools/punkte-index.mjs --schreiben`.
Der Waechterlauf und sein Sollstand stehen im Nachweis.


## Abnahme

_(vom Orchestrator)_
