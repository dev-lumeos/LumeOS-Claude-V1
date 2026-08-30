# C-260 — Codex, 2026-08-24

Bericht: `docs/berichte/c-260-codex.md`

**Vor jedem Import.** Der Abgleich entscheidet, ob wir den vollen oder
den aermeren Stand importieren.

---

## Der Befund, der diesen Auftrag ausgeloest hat

`reports/crawl_027_ws/` — zehn Arbeitsagenten (A bis J) ueber 37
Peptide. `A.json` traegt die Identitaet: Sequenz, CAS, UNII, PubChem,
ChEMBL, InChIKey, Molekularformel, Salzform, Modifikationen, je mit
`identity_confidence` und Quellen.

`[cmd]` **Abgleich gegen `data/substances/peptides.jsonl` und
`performance_compounds.jsonl`:**

    Feld            im Report   in Daten      FEHLT
    CAS                    19          0         19
    UNII                   20         18          2
    PubChem_CID            19         18          1
    InChIKey               19         18          1
    Sequenz                19         17          2
    ChEMBL                  6          6          0

`[cmd]` **Keine einzige CAS-Nummer ist uebernommen worden.** Dazu **37
Aliase**, die im Report stehen und in den Daten fehlen.

`[cmd]` **17 der 37 Peptide haben kein Gegenstueck in den Daten** —
TB-500, Thymosin beta-4, GHK-Cu, KPV, CJC-1295 DAC, Modified GRF
(1-29), GHRP-2, Hexarelin, MGF, Mecasermin, IGF-1 LR3, IGF-1 DES,
DSIP, Melanotan I, Bremelanotide, Thymosin alpha-1, 5-Amino-1MQ.

`[read]` **Ob sie fehlen oder anders heissen, ist ohne Abgleich nicht
entscheidbar.** `universe.json` fuehrt *„TB-500 (Thymosin beta-4
fragment)"*, die Daten moeglicherweise unter anderem Namen. **Genau das
ist die Aufgabe.**

`[read]` **Die `reports/`-Ebene ist also nicht redundant zu `data/`.**
Der Orchestrator hatte sie als *„QA-Berichte und Coverage-Vergleiche"*
abgetan — ein Urteil ohne Pruefung. `crawl_027_ws` war eines von
vierzehn Arbeitsverzeichnissen.

## WAS ICH GEMESSEN HABE

`[cmd]` **14 Arbeitsverzeichnisse unter `reports/`, 390 Dateien:**

    crawl_038_ws       108     crawl_032_ws        30
    crawl_037_ws        42     crawl_034_ws        26
    crawl_027_profiles  37     crawl_029_ws        22
    crawl_031_ws        19     crawl_033_ws        19
    crawl_035_ws        19     crawl_036_ws        17
    crawl_025_ws        16     crawl_030_ws        12
    crawl_028_ws        12     crawl_027_ws        11

`[cmd]` Dazu **52 Einzelberichte** direkt unter `reports/`.

`[cmd]` **Zielbestand:** `data/substances/` fuehrt 290 Substanzen
(154 Supplements, 61 Peptide, 75 Enhanced), `data/medications/` 498
Wirkstoffe.

## WAS ZU TUN IST

### 1 · Jede Datei in den 14 Arbeitsverzeichnissen oeffnen

**Keine Stichprobe.** Fuer jede Datei: welche Entitaeten, welche
Felder, welche Werte.

`[read]` **Die Struktur ist je Verzeichnis anders.** `crawl_027_ws`
hat zehn Agenten mit `entries`-Listen; `crawl_027_profiles` hat 37
Einzeldateien. **Erst die Struktur bestimmen, dann auslesen** — nicht
ein Muster auf alle anwenden.

### 2 · Feld fuer Feld gegen `data/` halten

Fuer jeden Wert im Report drei moegliche Zustaende:

    UEBERNOMMEN     steht in data/, gleicher Wert
    FEHLT           steht im Report, nicht in data/
    ABWEICHEND      steht in beiden, verschiedene Werte

`[read]` **Der dritte Fall ist der gefaehrlichste** und darf nicht
still aufgeloest werden. Kimis eigene Regel: *„Konflikte werden
erhalten, beide Claims plus Quellen, nie still gemittelt"*
(`context_kimiclaw/06_RESEARCH_POLICY.md`).

### 3 · Entitaeten aufloesen, nicht raten

Fuer die 17 Peptide ohne Gegenstueck — und alle vergleichbaren Faelle:
ist es **dieselbe Substanz unter anderem Namen** oder **fehlt sie
wirklich**?

`[cmd]` **Die Bruecke liegt bereit:**
`data/admin/_canonical_id_lookup.json` mit **1.131 Namen** auf
`sub_`-IDs. Nutz sie, statt ueber Namensaehnlichkeit zu raten.

`[read]` **Wo sie nicht traegt: melden, nicht zuordnen.** Eine falsche
Zuordnung ist schlimmer als eine offene.

### 4 · Ergebnis als Datei, nicht als Prosa

Schreib nach `docs/kimi-ingestion/konsolidierung/`:

    REPORT_DATA_ABGLEICH.jsonl    eine Zeile je Report-Wert:
                                  quelldatei, entitaet, feld,
                                  wert_report, wert_daten, zustand
    FEHLENDE_WERTE.md             nach Entitaet gruppiert, was fehlt
    ABWEICHUNGEN.md               beide Werte, beide Quellen, keine
                                  Entscheidung
    FEHLENDE_ENTITAETEN.md        was im Report steht und in data/
                                  nirgends auftaucht
    KONSOLIDIERUNG_ZUSAMMENFASSUNG.md

`[read]` **Eine `.jsonl`-Zeile je Wert**, damit der spaetere Import
sie maschinell verarbeiten kann. Prosa reicht nicht.

## WAS NICHT ZU TUN IST

**Nichts nach `data/` zurueckschreiben.** Das Quellverzeichnis ist
READ-ONLY. Dieser Auftrag stellt fest, was fehlt — er repariert es
nicht.

**Nichts in die Datenbank importieren.** Kein Kettenschritt, keine
Migration.

**Keine Abweichung still aufloesen.** Beide Werte, beide Quellen, in
`ABWEICHUNGEN.md`.

**Keine Entitaet zuordnen, die die Namensbruecke nicht traegt.**

`apps/` und `supabase/_pipeline/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.
Nichts in `docs/todo/` oder `docs/ssot/` schreiben.

## NACHWEIS — Erwartung VOR dem Lauf, beide Richtungen

**Zahl der geoeffneten Dateien: 390.** Weniger heisst, es wurde
ausgelassen — dann nenn welche und warum.

**Je Verzeichnis: Entitaeten, verglichene Felder, davon fehlend,
abweichend.**

**Gegenprobe an `crawl_027_ws`, weil das Ergebnis bekannt ist:** dein
Lauf muss **19 fehlende CAS**, **37 fehlende Aliase** und **17
Entitaeten ohne Gegenstueck** finden. `[read]` **Findet er weniger,
misst er nicht genug. Findet er mehr, will ich wissen warum** — beides
ist ein Ergebnis, keines ist ein Fehler.

**Negativprobe:** nimm einen Wert, der nachweislich uebernommen wurde
(BPC-157 `PubChem_CID` 9941957), und aendere ihn in einer Kopie des
Reports. Der Abgleich muss ihn als `ABWEICHEND` melden.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Pruefschleifen als Skript-Datei, nicht als Shell-Einzeiler mit `$(...)`.
Repo-Text mit Sonderzeichen nicht ueber die Standardeingabe einer
interaktiven Sitzung schreiben — `encoding="utf-8", newline="\n"`.

Arbeitsdateien nach `scratchpad/`, nicht ins Quellverzeichnis.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
