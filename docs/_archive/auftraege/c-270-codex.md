# C-270 — Codex, 2026-08-25

Bericht: `docs/berichte/c-270-codex.md`

**Der Dosierungs-Reiter ist duenn, weil die Daten nie importiert
wurden — nicht weil sie fehlen.**

---

## Der Befund

`[cmd]` **Vom Orchestrator gemessen, Kimis Datei gegen die Datenbank:**

    Feld                    Kimi    Datenbank
    guideline_dose           290            0
    upper_limit              252           38
    studied_dose_ranges      206           83
    dose_units                61            -
    frequency                 61   kein Feld
    duration_studied          61   kein Feld

Quelle:
`docs/kimi_research/supplement_performance_database/data/evidence/supplement_dosing_enrichment.jsonl`
— **290 Zeilen**, Struktur `{entity_id, canonical_name, fields{...},
provenance_note, integration_note}`.

`[read]` **C-262 hat CYP, Transporter, PK und Renal/Hepatic geholt, die
Dosis-Anreicherung aber nicht.** Sie stand im Auftrag als Welle 1 —
**offenbar durchgerutscht.**

`[cmd]` **Die Folge sieht man in der Oberflaeche:** von 318 sichtbaren
Substanzen tragen **19 einen Einnahmehinweis, 83 einen Dosisbereich,
38 eine Obergrenze.** Claude Code hat den Reiter in G-186 als *„wirklich
duenn"* gemeldet.

## WAS ZU TUN IST

### 1 · Die 290 Anreicherungen importieren

Ziel ist `supplement_dosing`. `[cmd]` Die Tabelle hat heute
`official_label_dose`, `guideline_dose`, `studied_dose_ranges`,
`anecdotal_dose_ranges`, `upper_limit`, `dose_unit`, `usage_hint_*`,
`status`.

`[read]` **`frequency` und `duration_studied` haben kein Gegenstueck.**
Beide sind bei 61 Substanzen gefuellt und **fuer die Anzeige
wertvoll** — *wie oft* und *ueber welchen Zeitraum* ist genau das, was
ein Nutzer sucht. **Spalten ergaenzen, nicht wegwerfen.**

### 2 · `status` mitfuehren

`[cmd]` Heute stehen **115 von 290** auf `status = 'unbekannt'`.
**Nach dem Import muss die Zahl sinken — nenn sie vorher und
nachher.**

`[read]` **Aber nicht auf 0 zwingen.** Wo Kimi nichts hat, bleibt
`unbekannt` richtig. `[cmd]` `dose_units` ist nur bei 61 von 290
gefuellt — **eine Menge ohne Einheit ist keine Angabe**, dort bleibt
das Feld leer.

### 3 · Die Provenienz mitnehmen

`[cmd]` Jede Zeile traegt `provenance_note` und `integration_note`.
`[read]` **Das ist der Unterschied zu einer geratenen Zahl** — bei
Vitamin A steht dort `NIH ODS Fact Sheet, verified=false`. **Wo das
Schema kein Feld hat: anlegen.** C-264 hat `sources` als `jsonb` an
`supplement_user_texts` gehaengt, dasselbe Muster.

## WAS NICHT ZU TUN IST

**Keine Dosis erfinden, keine Einheit ergaenzen.**
**Keine Anweisung ableiten** — *„in Studien 20-40 g"* ist ein Fakt,
*„nimm 30 g"* nicht.
`apps/` nicht anfassen — Claude Code baut dort.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS — Erwartung VOR dem Lauf

    guideline_dose        0 -> Zahl nennen, Erwartung 290
    upper_limit          38 -> Erwartung 252
    studied_dose_ranges  83 -> Erwartung 206
    status='unbekannt'  115 -> Zahl nennen

**Gegenprobe an drei namentlich genannten Substanzen** — eine mit
voller Angabe, eine ohne Einheit, eine ohne jede Dosis. `[cmd]`
Kreatin traegt *„ISSN position stand: 3-5 g/day maintenance"*, Vitamin A
*„750-3000 mcg RAE/day"* mit Quelle.

**Negativprobe:** eine Erwartungszahl um eins verstellen, der Lauf muss
rot werden.

## PIPELINE

Kettenschritt hinter `141b`. Wegwerf-Datenbank, Sicherung vorher,
**und live einspielen** mit Vollsicherung davor.

`[cmd]` **Die Kette steht bei 100 Schritten, `KETTE OK`, Gate gruen** —
halt sie so.

`[read]` **Und leg die Sicherung in `backup/vollsicherung/`**, nicht in
den Auftragsordner. `[cmd]` C-255 hat eine 132-MB-Datei nach
`backup/c255/` gelegt; die `.gitignore` faengt das inzwischen ab, aber
der richtige Ort ist der andere.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
`docs/kimi_research/` steht in `.gitignore` — lesen, nicht committen.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
