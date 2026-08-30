# C-264 — Codex, 2026-08-24

Bericht: `docs/berichte/c-264-codex.md`

**Kimis Nutzertexte importieren. Die Schablonen werden ersetzt, nicht
ergaenzt.**

---

## Die Quelle

    docs/kimi_research/supplement_performance_database/data/substances/
      substance_user_texts.jsonl    290 Records
      substance_faq.jsonl         1.279 Zeilen

`[cmd]` **Vom Orchestrator geprueft, an der Zahl, an der C-257
gescheitert ist:**

    kurz_was_de verschieden, Name herausgerechnet   290 von 290
    haeufigste 5-Wort-Folge                          3x
    FAQ Fragen verschieden                       1.276
    FAQ Antworten verschieden                    1.279
    kurz_was_de Zeichen                     91-140, keine ueber 140
    Englisch und Thai                          290 / 290

**Zum Vergleich, was heute in der Datenbank steht:** `[cmd]` 289 Texte
mit **11** Mustern, haeufigste Wortfolge **103x**, 867 FAQ-Zeilen mit
**3** verschiedenen Antworten.

`[cmd]` Feldabdeckung: sieben der neun Felder 290/290 · `mythen_de`
260 · **`zu_wenig_de` 49** — richtig so, ein Mangelbild gibt es bei
Vitaminen, nicht bei SARMs. **Leere Felder sind ein Ergebnis, kein
Fehler.**

`[cmd]` **`sources` ist vorhanden** — die Belegkette je Record.

## WAS ZU TUN IST

1. **`supplement_user_texts` leeren und neu befuellen.** Die 289
   Schablonenzeilen fliegen. `[read]` **Nicht danebenschreiben** —
   dieselbe Substanz zweimal ist schlimmer als eine Schablone.

2. **`supplement_faq` leeren und neu befuellen.** 867 alte Zeilen raus,
   1.279 neue rein.

3. **`sources` mit importieren.** Wenn das Schema kein Feld dafuer hat:
   **anlegen**, nicht weglassen. Ein Text ohne Beleg ist der Unterschied
   zwischen diesem Bestand und dem vorigen.

4. **`_en` und `_th` mit importieren.** Beide sind vollstaendig.

5. **Zuordnung ueber `entity_id`.** `[read]` Wo eine `entity_id` in der
   Datenbank nicht existiert: **melden, nicht raten.** `[cmd]` Der
   Bestand hat 290 Records, die Datenbank 318 sichtbare Substanzen —
   die Differenz muss erklaert werden.

## WAS NICHT ZU TUN IST

**Keinen Text aendern, kuerzen oder umformulieren.** Import heisst
uebernehmen.

**Keine leeren Felder fuellen.** `zu_wenig_de` bleibt bei 241 leer.

`apps/` nicht anfassen — dort baut Claude Code parallel die Ansicht.
Nicht committen, nicht stagen, nicht pushen.
Nichts in `docs/todo/` oder `docs/ssot/` schreiben.

## NACHWEIS — Erwartung VOR dem Lauf

    supplement_user_texts   nachher 290, vorher 289
    supplement_faq          nachher 1.279, vorher 867
    kurz_was_de verschieden ohne Name   >= 285 von 290
    FAQ Antworten verschieden           >= 1.270
    Substanzen ohne Text                melden, mit Namen

**Gegenprobe an fuenf namentlich genannten Substanzen** — Magnesium
glycinate, Kreatin, Vitamin D3, Bromocriptin und ein Peptid. **Bei
jeder muss der neue Text dastehen, nicht der alte.**

**Negativprobe:** setz zehn Zeilen auf denselben Text; die
Vielfaltspruefung muss rot werden.

`[read]` **Die Pruefung rechnet den Substanznamen heraus, bevor sie
zaehlt.** Ohne das war C-257 mit 289 von 289 gruen bei tatsaechlich 11
Mustern. `tools/texte-pruefen.mjs` von Claude Code macht es richtig —
nutz es.

## PIPELINE

Kettenschritt hinter `140_supplement_nutzertexte.sql`.
Wegwerf-Datenbank, Sicherung vorher, **und live einspielen** mit
Vollsicherung davor.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Repo-Text mit Sonderzeichen nicht ueber die Standardeingabe einer
interaktiven Sitzung schreiben — `encoding="utf-8", newline="\n"`.
**`docs/kimi_research/` steht in `.gitignore`** — die Quelle wird
gelesen, nicht committet.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
