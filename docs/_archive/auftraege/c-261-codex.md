# C-261 — Codex, 2026-08-24

Bericht: `docs/berichte/c-261-codex.md`

**Nachtrag zu C-260.** Der Lauf ist gemacht, das Ergebnis ist in der
Rohfassung nicht benutzbar. **Kein neuer Abgleich — der bestehende wird
gefiltert und ausgewertet.**

---

## Was C-260 geliefert hat, und warum es so nicht traegt

`[cmd]` **330.397 Vergleichszeilen: FEHLT 293.559 (88,9 %) ·
ABWEICHEND 23.336 (7,1 %) · UEBERNOMMEN 13.502 (4,1 %).**

`[cmd]` **Vom Orchestrator nachgemessen — die FEHLT-Zeilen sind
ueberwiegend Artefakte.** Die haeufigsten Felder:

    entity_id                6006      generated_at        1560
    source_ids[]             4044      _baseline_hashes    5735
    optional_context[]       3066      mismatch_dimensions 2308

**Das sind Lauf-Metadaten, keine Inhalte.**

`[cmd]` **Die haeufigsten „Entitaeten" sind Dateinamen:**
`brand_searches` 10.037 · `supp_searches` 7.188 · `L_result` 5.695 ·
`amb_details` 4.404 · `I_result` 3.956.

`[cmd]` **Die staerksten Quellen sind Caches und Sicherungen:**
`crawl_038_ws/K_cache/brand_searches.json` · `_atlas_backup_pre_merge`
· `_G_ckpt.json` · `_apps_stage2.json`. **Ein Checkpoint gehoert nicht
nach `data/` — dass sein Inhalt dort fehlt, ist kein Befund.**

`[cmd]` **12.727 verschiedene Feldnamen, 2.198 „Entitaeten"** — bei 290
Substanzen und 498 Wirkstoffen. Es wurde alles gegen alles verglichen.

`[read]` **Der Auftrag hat das nicht ausgeschlossen. Das ist mein
Fehler, nicht deiner.**

## Was du richtig gemacht hast

`[read]` **Du hast meiner Gegenprobe widersprochen, statt sie zu
erfuellen — und du hattest recht.** `[cmd]` CAS steht in `cas_number`
auf oberster Ebene, nicht in `external_ids`. Ich hatte nur letzteres
geprueft und daraus *„19 fehlende CAS"* konstruiert. BPC-157 traegt
`137525-51-0`, exakt den Reportwert.

`[cmd]` Ebenso die Dateizahl: 384 statt meiner 390, plus 1.251
rekursiv. **Beides als Befund festgehalten statt passend gemacht.**

---

## WAS ZU TUN IST

### 1 · Filtern, nicht neu abgleichen

`REPORT_DATA_ABGLEICH.jsonl` bleibt unveraendert als Rohstand.
**Erzeuge daneben eine gefilterte Fassung.**

**Quelldateien ausschliessen**, deren Pfad enthaelt:

    _cache/     _ckpt       _backup_pre_merge     _stage
    _apps_      _baseline   _tmp                  .log

**Felder ausschliessen**, die Lauforganisation sind, nicht Inhalt:

    entity_id            generated_at         *_hashes
    mismatch_dimensions  source_relationship_ids
    optional_context     high_value_context
    domain               *_ckpt*

`[read]` **Die Liste ist ein Vorschlag, kein Gesetz.** Wenn du beim
Durchsehen merkst, dass ein ausgeschlossenes Feld doch Sachinhalt
traegt: **nimm es rein und begruende es.** Umgekehrt genauso.

**Nenne im Bericht, wie viele Zeilen der Filter entfernt** — je Regel
einzeln. `[read]` Ein Filter, der nicht sagt, was er wegwirft, ist
keine Auswertung, sondern eine Behauptung.

### 2 · Die ABWEICHEND-Zeilen sind der wichtige Teil

`[cmd]` **Sie sehen anders aus als die FEHLT-Zeilen** — hier stehen
echte Sachfelder:

    mentions[].title              927
    hepatic.sources[].type/title/url  je 698
    renal.severity_bands[].effect 515
    cyp.CYP3A4.note               486
    cyp.CYP2D6.note               450
    thailand.last_verified        448
    wada.last_verified            444

`[read]` **`cyp.*.note` und `renal.severity_bands[].effect` sind
Sachaussagen.** Weichen sie ab, hat entweder der Report einen neueren
Stand oder die Daten einen korrigierten. **Beides muss unterscheidbar
sein.**

**Teil die ABWEICHEND-Zeilen in drei Gruppen:**

    ZEITSTEMPEL     last_verified, retrieved_at, generated_at -
                    verschiedene Laufzeitpunkte, kein Sachkonflikt
    FORMAT          gleicher Inhalt, andere Schreibweise
                    (Einheiten, Gross-/Kleinschreibung, Reihenfolge)
    SACHKONFLIKT    verschiedene Aussagen

`[read]` **Nur die dritte Gruppe ist eine Entscheidung.** Die ersten
beiden sind Rauschen und duerfen nicht danebenstehen, sonst geht der
echte Konflikt darin unter.

### 3 · Was daraus wirklich importierbar ist

Nach dem Filtern: **je Substanz und je Feld, was der Report hat und
die Daten nicht.**

Schreib nach `docs/kimi-ingestion/konsolidierung/`:

    ABGLEICH_GEFILTERT.jsonl       nur Sachfelder, nur echte Quellen
    NACHZUTRAGEN.md                je Entitaet: Feld, Wert, Quelldatei
    SACHKONFLIKTE.md               beide Werte, beide Quellen,
                                   KEINE Entscheidung
    FILTER_PROTOKOLL.md            welche Regel wie viele Zeilen nahm

`[read]` **`NACHZUTRAGEN.md` ist das Ergebnis, auf das alles
zulaeuft.** Es beantwortet die Frage, die seit gestern offen ist: **was
haben wir an Daten, das noch nicht in der Datenbank ist.**

## WAS NICHT ZU TUN IST

**Nichts nach `data/` zurueckschreiben.** Quellverzeichnis READ-ONLY.
**Nichts importieren.** Kein Kettenschritt, keine Migration.
**Keinen Sachkonflikt aufloesen.** Beide Werte, beide Quellen.
**`REPORT_DATA_ABGLEICH.jsonl` nicht ueberschreiben** — der Rohstand
bleibt, damit die Filterung nachvollziehbar ist.

`apps/` und `supabase/_pipeline/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.
Nichts in `docs/todo/` oder `docs/ssot/` schreiben.

## NACHWEIS — Erwartung VOR dem Lauf, beide Richtungen

**Zeilen vorher 330.397, nachher — Zahl hinschreiben, bevor du
filterst.** `[annahme]` Ich erwarte eine Groessenordnung von wenigen
Tausend. **Weicht es stark ab, ist das ein Befund, kein Fehler.**

**Je Filterregel: wie viele Zeilen sie entfernt.** Eine Regel, die 0
entfernt, gehoert nicht in die Liste — nenn sie trotzdem.

**Gegenprobe:** BPC-157 `cas_number` **muss** nach dem Filtern als
`UEBERNOMMEN` dastehen, nicht verschwinden. `[read]` Ein Filter, der
auch Treffer wegwirft, ist zu grob.

**Negativprobe:** setz eine Cache-Datei absichtlich auf einen
Sachfeldnamen; sie muss trotzdem ausgeschlossen werden, weil der Pfad
zaehlt, nicht das Feld.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Pruefschleifen als Skript-Datei, nicht als Shell-Einzeiler mit `$(...)`.
Repo-Text mit Sonderzeichen nicht ueber die Standardeingabe einer
interaktiven Sitzung schreiben — `encoding="utf-8", newline="\n"`.

**Artefakte nur nach `docs/kimi-ingestion/`.** `[cmd]` Beim letzten
Lauf lagen sie zusaetzlich unter
`backup/kimi-research/.../lumeos_ingestion_analysis/`; zwei davon waren
nicht als UTF-8 dekodierbar und haben **jeden Commit im Repo
blockiert**. Die Dublette ist entfernt.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
