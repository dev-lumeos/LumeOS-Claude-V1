# G-192 — Claude Code, 2026-08-26

Bericht: `docs/berichte/g-192-claude-code.md`

**Ein Community-Reiter im Substanzdetail.**

**Tom, 2026-08-25:** *„was ich bisher sehe sind allgemeine infos aber
nicht was der bodybuilder in diesen stoffen sieht."* Und zur Grenze:
*„kombinationen der szene von denen abgeraten wird im sinne von
solltest du nicht tun, das waere nicht eine empfehlung etwas zu tun.
schau ob irgendwelche infos invertiert als sachliche infos dienen
koennen."*

---

## Die Regel, die alles entscheidet

`[read]` **Was etwas kostet, darf gezeigt werden. Was etwas erreicht,
nicht.**

Der Katalog sagt seit dem ersten Tag: *Fakt ja, Anweisung nein* — **der
Unterschied liegt im Subjekt.** *„Diese Kombination belastet die
Leber"* ist eine Aussage ueber Stoffe. *„Nimm Cabergolin gegen
Prolaktin"* ist eine ueber den Leser.

`[cmd]` **Kimi zieht dieselbe Grenze:** jeder Datensatz traegt
`admin_only: true`, `not_medical_recommendation: true`,
`evidence_class: E`. `[read]` **Die Marken sind Kennzeichnung, kein
Filter** — sie machen ein Feld nicht zu etwas anderem, als es ist.

---

## WAS ANGEZEIGT WIRD — fuenf Bloecke

Quelle:
`docs/kimi_research/supplement_performance_database/data/admin/`

### 1 · Berichtete Nebenwirkungen — 37 Muster

`[cmd]` `community_side_effect_patterns.jsonl`. **Verbreitung:** 9
`WIDESPREAD` · 20 `COMMON` · 5 `RECURRING` · 2 `OCCASIONAL` · 1 `RARE`.
**Ueber 19 Substanzklassen**, nicht nur AAS — auch Beta-2-Agonisten,
GH-Sekretagoga, Melanocortine, SARMs, Peptide.

**Beispiel:** *„Sexuelle Dysfunktion unter 19-nor-AAS (‚Deca dick')"*
— `attribution_confidence: MODERATE`, `community_consistency: HIGH`,
`scientific_alignment: PARTIALLY_SUPPORTED`, `onset_context:
subakut, oft innerhalb weniger Wochen`.

**Anzeigen:** `side_effect` · `community_attribution_note` ·
`prevalence` · `onset_context` · `attribution_confidence` ·
`scientific_alignment` · **`limitations`**.

`[cmd]` **NICHT anzeigen: `reported_mitigations`** — 36 von 37 tragen
es. `[read]` *„Cabergolin gegen Prolaktin, PDE5-Hemmer"* ist eine
Anweisung, egal wie das Feld heisst.

### 2 · Was eine Kombination kostet — 24 von 31

`[cmd]` `community_stack_patterns.jsonl`, Feld `expected_tradeoff`.
**Ausnahmslos Nachteile:**

    Test + Deca        Progestogen-/Prolaktin-Risiko; sehr lange
                       Suppression; Verhaeltnis ungeklaert
    Test + EQ + Tren   Haematokrit und mentale Nebenwirkungen
                       addieren sich; E2-Absturz durch EQ
    Dianabol-Kickstart Wassereinlagerung und Oestrogenlast stapeln
                       sich; hepatotoxisches Fenster; Blutdruck

`[read]` **Der wertvollste Eintrag ist der Organschutz-Stack:** sein
Nachteil lautet **`false security risk if used to justify heavier
orals`** — **die Szene warnt selbst davor, dass Leberschutz als
Freibrief missverstanden wird.**

`[cmd]` **Anzeigen: `name` und `expected_tradeoff`. NICHT
`components`, NICHT `reported_reason_for_combination`** — das eine ist
ein Rezept, das andere die Begruendung dafuer.

### 3 · Widerlegte Narrative — 3

`[cmd]` `community_intelligence_patterns.jsonl` mit
`scientific_alignment: CONTRADICTED`. Darunter das groesste der Szene:
*„SARMs sind selektiv = AAS-Ergebnisse ohne AAS-Nebenwirkungen"*,
benannt als **Einstiegstreiber ohne Injektion.**

`[read]` **Das gehoert in `mythen_de`**, wo der Katalog es ohnehin
zeigt — nicht in einen eigenen Block.

### 4 · Produktqualitaet — 40 Signale

`[cmd]` `community_product_quality_signals.json`. **Das erste ist die
JAMA-Studie 2017:** von 44 SARM-Produkten enthielten **nur 52 % den
angegebenen Wirkstoff, 59 % wichen in der Menge ab, 9 % hatten gar
keinen.** `prevalence: WIDESPREAD`, `community_evidence_grade: E1`.

`[read]` **Das ist keine Community-Meinung, das ist eine
begutachtete Studie**, die in der Szene als Standardzitat dient. **Sie
gehoert neben die Mengenangabe**, aus demselben Grund wie `reinheit_de`
in G-180: **wer den Inhalt nicht kennt, kann die Dosis nicht
einschaetzen.**

### 5 · Szene-Begriffe — 71 plus 3 Konzepte

`[cmd]` `community_terminology.json`: 71 Begriffe mit
`community_definition` — *„blast"*, *„cruise"*, *„pin"*.
`[cmd]` `community_usage_contexts.json`: **Blast and Cruise** mit
`physiological_implications` — *„durchgehende HPTA-Suppression,
anhaltende Unfruchtbarkeit waehrend der Anwendung, schwankende
Haematokrit- und Lipidlast."*

`[read]` **Ein Glossar ist Aufklaerung.** Wer *„blast"* liest und nicht
weiss, was gemeint ist, kann nichts einordnen. **Und die
`physiological_implications` sind wieder das, was es kostet.**

`[cmd]` **Die 179 Aliase gehoeren NICHT hierher** — die sind eine
Namenstabelle und laufen ueber C-274.

---

## WAS NICHT ANGEZEIGT WIRD

`[cmd]` **`community_exposure_patterns` (86)** — Dosierungen,
Frequenzen, Injektionswege. *„500 mg/Woche, zwei Injektionen"* ist ein
Protokoll.

`[cmd]` **`community_lab_patterns` (43)** — echte Blutbilder aus
Foren-Logs mit `attribution_confidence: VERY_LOW`. `[read]` **Ein
fremdes Laborergebnis neben der eigenen Substanz ist ein Vergleich,
den nur ein Begleiter ziehen darf, der die eigenen Werte kennt.**

`[cmd]` **`community_research_hypotheses` (20)** — offene Fragen, keine
Auskunft.

`[cmd]` **`reported_mitigations`, `components`,
`reported_reason_for_combination`, `why_these_doses`** — alle vier
sind Anleitungen.

---

## WIE ES AUSSEHEN SOLL

**Nach dem Modell aus G-181, das steht:** eigener Reiter neben
*Ueberblick · Dosierung · Sicherheit · Fragen · Quellen*, **mit der
Zahl im Kopf**, und er **erscheint nicht, wenn nichts vorliegt.**

    Reitername      "Aus der Community" oder "Szene"  - waehl und
                    begruende
    Kopfzeile       ein Satz, was das ist und was es nicht ist
    Bloecke         je nach Vorhandensein, Reihenfolge:
                    Nebenwirkungen - Kombinationen - Produktqualitaet
                    - Begriffe
    Je Eintrag      Verbreitung und Verlaesslichkeit sichtbar,
                    Einschraenkung DANEBEN, nicht darunter

`[read]` **Die Einschraenkung gehoert in denselben Block**, sonst wird
aus einer Beobachtung eine Tatsache. `[cmd]` `limitations` ist bei
allen Bloecken gefuellt.

**Feste Kachelbreiten wie in G-181**, kein `1fr` ohne `max-width`.

`[read]` **Und die Kennzeichnung ist Teil der Anzeige, nicht des
Kleingedruckten.** `evidence_class: E` heisst: Erfahrungsberichte,
nicht Studien. **Das muss man sehen, ohne zu suchen.**

---

## WAS NICHT ZU TUN IST

**Keine Texte aendern, keinen Wert erfinden.**
**Keine Anleitung anzeigen**, auch nicht als Zitat.
**Keinen Block mit Platzhalter fuellen** — was leer ist, entfaellt.

`supabase/_pipeline/` nicht anfassen — Codex arbeitet an C-273.

`[read]` **Die Daten sind noch nicht in der Datenbank.** C-273
importiert sie nach `wissen`, `admin_only`. **Bau gegen das Schema,
nicht gegen die Dateien** — und wenn C-273 noch laeuft, meldest du,
welche Tabellen du brauchst, statt aus `docs/kimi_research/` zu lesen.

Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

**Je Block: bei wie vielen der 412 Substanzen erscheint er?** `[cmd]`
Erwartung: Nebenwirkungen ueber 19 Klassen, Kombinationen fast nur AAS.
**Vor dem Bau hinschreiben.**

**Gegenprobe an drei namentlich genannten:** ein 19-nor-AAS (Deca
dick), ein SARM (Produktqualitaet), ein Vitamin — **dort darf der
Reiter nicht erscheinen.**

**Negativprobe:** `reported_mitigations` in den Lesepfad einbauen — ein
Waechter muss rot werden. `[read]` **Das ist die Prueffung, die den
Auftrag ueberlebt** — ohne sie steht die Grenze nur in dieser Datei.

`node tools/schuss.mjs`, `test-user@lumeos.local`, **1280 und 1920.**

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.

`[cmd]` **Der Dev-Server laeuft auf PID 351936.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
