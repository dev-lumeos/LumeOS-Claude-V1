# C-280 — Codex, 2026-08-26

Bericht: `docs/berichte/c-280-codex.md`

**Eine Sicht, die nur zeigt, was gezeigt werden darf.**

Aus G-192: Claude Code hat den Community-Reiter gebaut, **kann ihn aber
nicht befuellen** — `wissen` ist bewusst nicht ueber PostgREST
erreichbar.

---

## Warum keine Freigabe des Schemas

`[cmd]` **In `wissen.community_records` liegen 1.033 Zeilen in
derselben Tabelle. Davon duerfen 212 angezeigt werden:**

    community_side_effect_patterns      37   Nebenwirkungen
    community_stack_patterns            31   nur expected_tradeoff
    community_product_quality_signals   40   Faelschungsquoten
    community_terminology_terms         71   Szene-Begriffe
    community_science_delta             30   fuer mythen_de
    community_usage_concepts             3   Blast and Cruise

**Und 821 nicht:**

    community_sources                  315
    community_terminology_aliases      179   gehoert zu C-274
    community_intelligence_patterns    123   nur 3 davon (CONTRADICTED)
    community_exposure_patterns         86   Dosierungen
    community_lab_patterns              43   fremde Blutbilder
    community_research_hypotheses       20   offene Fragen
    ... plus Register, Logs, Schema

`[read]` **Gibt man `wissen` frei, ist alles davon erreichbar.** Die
Trennung laege dann nur in der Abfrage, nicht in der Berechtigung.
**Ein Filter im Lesepfad ist eine Vereinbarung. Eine Sicht ist eine
Grenze.**

`[cmd]` **Die Policies stehen auf `service_role`** (C-273), und
`nicht_ueber_api` im Sollstand haelt das fest. `tools/schemafreigabe-
pruefen.mjs` meldet es, wenn jemand `wissen` doch eintraegt —
Negativprobe belegt.

## WAS ZU TUN IST

### 1 · Sicht `supplements.community_anzeige`

**Im Fachschema, nicht in `wissen`** — damit sie ueber die bestehende
Freigabe erreichbar ist.

**Sie zeigt nur die sechs Datensaetze oben, und darin nur die
erlaubten Felder.**

`[cmd]` **Bei den Nebenwirkungen ist das entscheidend:**
`reported_mitigations` steht **bei allen 37** im `raw`-JSON.

`[read]` *„Cabergolin gegen Prolaktin, PDE5-Hemmer, Dosisreduktion"*
ist eine Anweisung, egal wie das Feld heisst. **Die Sicht schneidet es
weg, statt sich darauf zu verlassen, dass niemand danach fragt.**

**Erlaubt je Datensatz:**

    Nebenwirkungen   side_effect · substance_class ·
                     community_attribution_note · prevalence ·
                     onset_context · attribution_confidence ·
                     community_consistency · scientific_alignment ·
                     limitations · community_evidence_grade
    Stacks           name · expected_tradeoff ·
                     scientific_alignment · limitations
    Qualitaet        signal · prevalence · community_evidence_grade ·
                     limitations · Quellenangabe
    Begriffe         term · community_definition
    Delta            das Narrativ und seine Aufloesung
    Konzepte         concept · physiological_implications

`[cmd]` **Verboten, in keiner Spalte:** `reported_mitigations` ·
`components` · `reported_reason_for_combination` · `why_these_doses`.

`[read]` **Und `raw` selbst darf nicht durchgereicht werden.** Wer das
ganze JSON weitergibt, hat nichts gefiltert.

### 2 · Die Zuordnung zur Substanz

`[read]` **Miss zuerst, wie die Datensaetze auf Substanzen zeigen.**
`[cmd]` Die Nebenwirkungen tragen `substance_class` (19 Klassen), nicht
`substance_id` — **die Zuordnung laeuft ueber die Klasse, nicht ueber
den Einzelstoff.**

`[read]` **Das ist wichtiger als es klingt:** ein Nebenwirkungsmuster
zu *19-nor-AAS* gilt fuer Nandrolon **und** Trenbolon. **Wenn die
Sicht das nicht abbildet, erscheint der Reiter bei keiner oder bei
jeder Substanz.**

`[cmd]` `supplement_categories` traegt bereits Klassen
(`injizierbare_aas`, `sarm`, `orale_aas`). **Miss, ob sie auf Kimis
`substance_class` passen** — wo nicht: **melden, nicht zuordnen.**

### 3 · Die Marken bleiben sichtbar

`[cmd]` `evidence_class`, `admin_only` und
`not_medical_recommendation` stehen bei allen 1.033 Zeilen.

`[read]` **`evidence_class` gehoert in die Sicht** — es heisst
*Erfahrungsberichte, nicht Studien*, und **das muss man sehen, ohne zu
suchen.** `admin_only` und `not_medical_recommendation` sind
Betriebsmarken und bleiben in der Tabelle.

## WAS NICHT ZU TUN IST

**`wissen` nicht in `config.toml` eintragen.** `[read]` Der Waechter
meldet es, und die Sperre ist Absicht.

**Kein Feld erfinden, keinen Text uebersetzen.** `[cmd]` Die Inhalte
sind englisch — **ob und wie sie uebersetzt werden, ist eine eigene
Frage** und gehoert an Kimi, nicht in eine Sicht.

**Keine Zeile loeschen.** Die Sicht filtert, die Tabelle bleibt
vollstaendig.

`apps/` nicht anfassen — Claude Code hat den Lesepfad in G-192 gebaut
und wartet auf die Sicht.

Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS — Erwartung VOR dem Lauf

    Zeilen in der Sicht        Erwartung 212
    davon Nebenwirkungen       37
    Sicht enthaelt raw         muss NEIN sein
    Sicht enthaelt eines der
      vier Anleitungsfelder    muss NEIN sein

**Gegenprobe an drei namentlich genannten Substanzen:** ein 19-nor-AAS
(muss *„Deca dick"* bekommen), ein SARM (muss die JAMA-Zahlen
bekommen), **ein Vitamin — dort muss die Sicht leer bleiben.**

**Negativprobe:** `reported_mitigations` in die Sicht aufnehmen — **ein
Gate-Waechter muss rot werden.** `[read]` Claude Codes Waechter aus
G-192 prueft `substanz-read.ts`; **dieser prueft die Sicht.** Zwei
Ebenen, nicht eine.

`[read]` **Und das ist der Punkt:** ein Waechter auf den Lesepfad
verhindert, dass jemand das Feld abfragt. Ein Waechter auf die Sicht
verhindert, dass es ueberhaupt ankommt.

## PIPELINE

Kettenschritt hinter dem `16_wissen`-Bereich. Wegwerf-Datenbank,
Sicherung vorher, live einspielen mit Vollsicherung in
`backup/vollsicherung/`.

`[cmd]` **Und wie zuletzt: nenn `im_katalog` fuer Kette und Live.**
Beide stehen bei **412**, sichtbare Unterformen **0**.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.

`[cmd]` **Der Dev-Server laeuft auf PID 351936** — Tom sieht sich den
Katalog an. **Nicht neu starten.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
