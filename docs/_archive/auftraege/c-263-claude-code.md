# C-263 — Claude Code, 2026-08-24

Bericht: `docs/berichte/c-263-claude-code.md`

**Die deutschen Beschreibungen.** Laeuft parallel zu C-262 bei Codex —
du liest die Kimi-Dateien direkt, nicht die Datenbank, und bist damit
nicht blockiert.

---

## Warum es diesmal geht

`[read]` **Ein frueherer Anlauf (C-257) ist gescheitert**, weil im
Auftrag *„nichts erfinden"* stand — gemeint waren erfundene **Zahlen**,
gelesen wurde ein Verbot, ueberhaupt Fachwissen hinzuschreiben. Ergebnis:
`[cmd]` 289 Texte mit **98 verschiedenen Formulierungen**, sechs
Schablonen mit eingesetztem Namen.

**Das gilt hier ausdruecklich nicht.** Du weisst, was Kreatin,
Magnesium, Dianabol oder Bacopa sind. **Schreib es hin.** Was bei NIH
ODS, EFSA, DGE, WHO oder in jedem Lehrbuch steht, ist kein Erfinden.
**Leer bleiben nur unbelegte Zahlen.**

## Die Quelle liegt vor

`backup/kimi-research/Kimi_Agent/supplement_performance_database/data/substances/`

    supplements.jsonl              154
    peptides.jsonl                  61
    performance_compounds.jsonl     75

`[cmd]` Feldabdeckung Supplements: `description` 154 · `dosing` 154 ·
`safety` 154 · `pharmacology` 154 · `monitoring` 154 ·
`warning_triggers` 154 · `interactions` 154 · `mechanism_of_action` 73
· `lab_effects` 56.

**Am Beispiel Kreatin liegt alles vor, um den Text abzuleiten:**

    mechanism_of_action  "Phosphocreatine buffer for rapid ATP
                          regeneration in muscle and brain"
    pharmacology         bioavailability "high oral (~99%)",
                          metabolism "spontaneous cyclization to
                          creatinine; renal excretion"
    studied_dose_ranges  "ISSN position stand: 3-5 g/day maintenance
                          (20 g/day loading 5-7 d optional)"
    common_side_effects  "GI upset at loading doses"
    lab_effects          Serum-Kreatinin real +0,1-0,3 mg/dL,
                          eGFR faelschlich niedrig, KEIN Nierenschaden,
                          Cystatin C unbeeinflusst

`[read]` **Das ist eine Uebersetzungsaufgabe, keine Rechercheaufgabe.**
Wo `mechanism_of_action` fehlt — bei 81 von 154 — recherchierst du
online.

## Der Massstab

    SCHLECHT  Creatine monohydrate ist eine Supplement-Substanz mit
              eigener Beleglage und eigenen Grenzen.

    GUT       Kreatin ist eine koerpereigene Verbindung aus drei
              Aminosaeuren. Der Koerper speichert sie in den Muskeln
              und greift bei kurzen, harten Belastungen darauf zu -
              etwa beim Sprint oder in den ersten Wiederholungen
              einer schweren Uebung.

    SCHLECHT  Bromocriptine ist ein leistungs- oder hormonbezogener
              Wirkstoff; der Katalog beschreibt Fakten, keine
              Anwendung.

    GUT       Bromocriptin ahmt im Gehirn den Botenstoff Dopamin nach
              und senkt dadurch die Ausschuettung von Prolaktin.
              Zugelassen ist es bei zu hohem Prolaktinspiegel und bei
              Parkinson.

`[read]` **Der Unterschied ist nicht Laenge, sondern Information.** Der
schlechte Satz sagt ueber Kreatin nichts, was nicht auch ueber Zink
gelten wuerde.

## Die Felder

Je Substanz, **auf Deutsch**, in `supplements.supplement_user_texts`
(die Tabelle existiert):

    kurz_was_de       ein Satz, ohne Fachwort, <= 140 Zeichen
    wofuer_de         2-4 Stichpunkte, je <= 60 Zeichen
    wie_wirkt_de      2-3 Saetze, Alltagssprache
    was_bringt_es_de  2-4 Saetze, MIT Groessenordnung
    zu_viel_de        1-3 Saetze, konkret
    zu_wenig_de       1-2 Saetze - LEER, wo es kein Mangelbild gibt
    wann_wie_de       Zeitpunkt, mit/ohne Essen, womit nicht
    wer_nicht_de      Stichpunkte
    mythen_de         wo es welche gibt

**Und die Alltagsfragen** in `supplement_faq`, 3-6 je Substanz:

`[cmd]` Heute stehen dort **867 Zeilen mit drei verschiedenen
Antworten**, jede 289-mal. **Die werden ersetzt.**

    GUT  "Muss ich eine Ladephase machen?"
         "Noetig ist sie nicht. Mit der ueblichen Tagesmenge sind die
          Muskelspeicher nach etwa drei bis vier Wochen genauso voll -
          nur langsamer."

    GUT  "Macht Kreatin Haarausfall?"
         "Eine einzelne kleine Studie fand einen Anstieg von DHT,
          einem Hormon, das bei erblichem Haarausfall eine Rolle
          spielt. Spaetere Untersuchungen konnten das nicht
          bestaetigen, und ein Zusammenhang mit Haarausfall selbst
          wurde nie gezeigt."

**Nur Substanzfragen.** Gilt die Antwort fuer jede Dose desselben
Stoffs, gehoert sie hierher. *„Wie schmeckt diese Dose?"* nicht.

## Reihenfolge

    Durchgang 1   supplements       154
    Durchgang 2   peptides           61
    Durchgang 3   performance        75

**Nach jedem Durchgang Zwischenstand melden.** `[read]` Wenn die
Vorgabe nicht traegt, merkst du es nach 154 statt nach 290.

## Bei Peptiden und Enhanced kommt etwas dazu

**Die Frage ist dort nicht *„wirkt es"*, sondern *„was macht es mit dir
und was musst du ueberwachen"*.** Zusaetzlich:

    irreversibel_de   was bleiben kann, auch nach dem Absetzen
    ueberwachung_de   welche Werte, in welchem Abstand
    reinheit_de       wie zuverlaessig ist der Inhalt der Aufschrift

`[read]` **Drei Aussagen muessen stehen, wo sie zutreffen:** dass die
koerpereigene Hormonproduktion sich unterschiedlich erholt und bei
einem Teil unvollstaendig bleibt · welche Werte gemessen gehoeren · dass
in SARM-Praeparaten wiederholt andere Wirkstoffe gefunden wurden.
**Die letzte entwertet jede Dosisangabe und gehoert daneben, nicht drei
Abschnitte weiter.**

## WAS NICHT ZU TUN IST

**Keine Anweisungen.** *„In Studien wurden X bis Y eingesetzt"* ist ein
Fakt, *„nimm X"* nicht. Keine Zyklen, keine PCT-Protokolle, keine
Kombinationsempfehlungen.

**Keine Wertung.** Kein *„eines der besten"*, kein *„nicht
empfehlenswert"*.

**Keine Marken, keine Preise.** Produktdaten kommen von den Anbietern.

**Keine erfundenen Zahlen.** `[cmd]` 115 von 290 tragen
`dosing.status = 'unbekannt'` — **das ist ein ehrliches Ergebnis.**

`supabase/_pipeline/` **nicht anfassen** — dort laeuft Codex an C-262.
`apps/` **nicht anfassen.**
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS — und er misst diesmal das Richtige

`[read]` **Die Pruefung in C-257 war blind:** Laengenpruefung und
Sperrwortliste bestehen Schablonen muehelos.

**Pflichtpruefungen, Erwartung vor dem Lauf:**

    verschiedene kurz_was_de       >= 280 von 290
    verschiedene antwort_de        >= 700
    verschiedene frage_de          >= 400
    laengster gemeinsamer Schluss  hoechstens 3 Woerter
                                   ueber alle kurz_was_de

`[cmd]` **Heute: 98 verschiedene Formulierungen und 3 FAQ-Antworten auf
867 Zeilen.** Genau das darf nicht wieder herauskommen.

**Negativprobe:** setz zehn Zeilen auf denselben Text — die Pruefung
muss rot werden und die Zahl nennen.

**Gegenprobe an fuenf namentlich genannten Substanzen**, je eine aus
`supplement`, `peptide`, `enhanced`, dazu Magnesium und eine Unterform.
**Bei jeder muss der erste Satz sagen, was der Stoff ist — so, dass
jemand ohne Vorbildung es versteht.**

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Repo-Text mit Sonderzeichen nicht ueber die Standardeingabe einer
interaktiven Sitzung schreiben — `encoding="utf-8", newline="\n"`.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
