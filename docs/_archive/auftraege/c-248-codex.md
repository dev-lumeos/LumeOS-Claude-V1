# C-248 + C-240 — Codex, 2026-08-23

Bericht: `docs/berichte/c-248-codex.md`

Zwei Datenbefunde, beide aus der Pruefung deiner letzten Auftraege.

---

## 1 · C-248: LOINC `1869-7` traegt zwei verschiedene Marker

`[cmd]` In `medical.biomarker_reference_ranges`:

| LOINC | `curated_slug` | `canonical_name_en` | Zeilen |
|---|---|---|---:|
| `1869-7` | `apob` | ApoB | **6** |
| `1869-7` | `apolipoprotein_a1` | Apolipoprotein A1 | 2 |
| `1884-6` | `apolipoprotein_b` | Apolipoprotein B | 2 |

`[cmd]` **`1869-7` ist der LOINC-Code fuer Apolipoprotein A-I.** Die
sechs ApoB-Zeilen darauf sind falsch.

`[read]` **C-191 hat ApoB auf `1884-6` korrigiert — gespiegelt, nicht
verschoben.** Dein C-247-Bericht sagt es selbst: *„Spec-Zeile von
falschem `1869-7` auf belegten ApoB-Code gespiegelt."* Kopiert heisst:
die falschen sechs stehen weiter da.

`[read]` **Warum das mehr ist als eine Zaehlfrage:** wer ueber
`loinc_code` liest — und das tut die Laborbruecke — bekommt unter
`1869-7` Referenzbereiche zweier verschiedener Stoffe gemischt. **Ein
ApoA1-Wert wuerde gegen ApoB-Grenzen bewertet.**

### Zu tun

**Erst messen, dann entfernen.** Vergleiche die sechs ApoB-Zeilen auf
`1869-7` mit den zwei auf `1884-6`: sind die Bereiche identisch, oder
tragen die sechs Werte, die es auf `1884-6` nicht gibt? **Wenn Werte
verloren gingen, ist es kein Entfernen, sondern ein Umhaengen** —
melde, was du misst, bevor du loeschst.

Dazu eine **Gate-Pruefung**, die anschlaegt, wenn ein `loinc_code` mehr
als einen `curated_slug` traegt. `[read]` Das ist die eigentliche Lehre:
die bestehende Pruefung zaehlt nur die Gesamtzahl und hat deshalb sechs
Jahre lang nichts gemerkt.

Pruefe zugleich, **ob es weitere Faelle gibt** — nicht nur diesen.

### Nachweis

Die Zahl der `loinc_code`-Werte mit mehr als einem `curated_slug`,
**vor dem Lauf hingeschrieben**, nachher 0. Negativprobe: eine
absichtlich doppelt belegte Zeile muss die neue Pruefung rot machen.

---

## 2 · C-240: 31 Kimi-Substanzen ohne Evidenzgrad

`[cmd]` `supplement_evidence` 566 Zeilen, **259** mit `overall_grade`.
`[cmd]` Die Spec (`SCHEMA_NEUAUFBAU.md:146`) nennt **290** — das ist
die Zahl der Kimi-Zeilen, nicht der benoteten:

    kimi_supplement    154 Zeilen / 151 benotet
    kimi_performance    75 /  63
    kimi_peptide        61 /  45

`[cmd]` Die uebrigen 276 (`f05_substance_candidate` 248,
`lumeos_supplement_catalog` 28) tragen weder Grad noch Beschreibung —
das ist gewollt und seit C-243 ueber `im_katalog` geregelt.

### Zu tun

**Zwei Dinge, die nicht dasselbe sind.**

**a)** Die Spec-Zeile korrigieren — eine Zeile. `[read]` Der
Orchestrator hat die 290 dort selbst falsch hineingeschrieben.

**b)** Klaeren, ob die **31** in Kimis Quelle einen Grad haben und der
Import ihn fallen laesst, oder ob die Quelle selbst keinen liefert.
`[cmd]` Die Rohdaten liegen unter
`backup/kimi-research/Kimi_Agent/supplement_performance_database/`,
Crawls 017 bis 028 — **029 bis 035 sind noch nicht angekommen**, also
gegen das messen, was da ist, und den Stichtag nennen.

**Melden, nicht auffuellen.** Wenn die Quelle keinen Grad hat, ist
`unbekannt` der richtige Zustand — nicht ein geratener Buchstabe.

### Nachweis

Die 31 namentlich, mit Quelle je Zeile: Grad in der Rohdatei vorhanden
ja/nein. Danach entweder 290 benotet (Import war luecken haft) oder eine
belegte Aussage, dass 259 der richtige Stand ist.

---

## WAS NICHT ZU TUN IST

Nichts in `apps/` — dort laufen zwei UI-Agenten.
Keine Entscheidung zur Salzform (C-244), keine zu den 276 verborgenen
Zeilen (entschieden in C-243).

Nicht committen, nicht stagen, nicht pushen.
Nichts in `docs/todo/` oder `docs/ssot/` schreiben.

## REGELN

Wegwerf-Datenbank zum Pruefen, danach verwerfen. Vollsicherung vor
jedem Live-Eingriff. **Ein Auftrag ist nicht fertig, wenn die Kette
gruen laeuft, sondern wenn die Aenderung dort ist, wo Tom sie sieht.**

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Pruefschleifen als Skript-Datei, nicht als Shell-Einzeiler mit `$(...)`.
Nachweisdateien mit `encoding="utf-8", newline="\n"`.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
