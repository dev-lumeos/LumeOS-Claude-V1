---
nr: C-260
typ: blocker
modul: supplements
schwere: hoch
angelegt: 2026-08-24
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: 707cba93
beruehrt:
  tabellen: [supplements.supplements]
zahlen: null
---

# C-260 - Die Arbeitsberichte sind nicht in die Daten zurueckgeflossen

## Befund

(neu 2026-08-24). Aus der Pruefung von
  `reports/crawl_027_ws`.

  `[cmd]` **Abgleich `A.json` gegen `peptides.jsonl` und
  `performance_compounds.jsonl`, 37 Peptide:**

  | Feld | im Report | in Daten | fehlt |
  |---|---:|---:|---:|
  | **CAS** | 19 | **0** | **19** |
  | UNII | 20 | 18 | 2 |
  | PubChem_CID | 19 | 18 | 1 |
  | InChIKey | 19 | 18 | 1 |
  | Sequenz | 19 | 17 | 2 |
  | ChEMBL | 6 | 6 | 0 |

  `[cmd]` **Keine einzige CAS-Nummer uebernommen.** Dazu **37 Aliase**,
  die im Report stehen und in den Daten fehlen.

  `[cmd]` **17 der 37 Peptide haben kein Gegenstueck in den Daten** —
  TB-500, Thymosin beta-4, GHK-Cu, KPV, CJC-1295 DAC, Modified GRF,
  GHRP-2, Hexarelin, MGF, Mecasermin, IGF-1 LR3, IGF-1 DES, DSIP,
  Melanotan I, Bremelanotide, Thymosin alpha-1, 5-Amino-1MQ.

  `[read]` **Ob sie fehlen oder anders heissen, ist ohne Abgleich nicht
  entscheidbar.**

  `[read]` **Der Orchestrator hat die `reports/`-Ebene als *„QA-Berichte
  und Coverage-Vergleiche"* abgetan** — ein Urteil ohne Pruefung, im
  Bestandsbericht `95-kimi-bestand.md` so festgehalten. `crawl_027_ws`
  war eines von **vierzehn** Arbeitsverzeichnissen.

  `[cmd]` **Umfang: 14 Verzeichnisse, 390 Dateien.** `crawl_038_ws`
  108 · `crawl_037_ws` 42 · `crawl_027_profiles` 37 · `crawl_032_ws`
  30 · `crawl_034_ws` 26 · `crawl_029_ws` 22 · drei mit je 19 · 17 ·
  16 · zweimal 12 · 11. Dazu 52 Einzelberichte.

  **BLOCKIERT JEDEN IMPORT.** `[read]` Wer vorher importiert, holt den
  aermeren Stand und haelt ihn fuer vollstaendig.

## Auftrag

**Mitbeauftragt mit C-202 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `server.py neustart`, kein `start`, kein
`aufraeumen`.** `[read]` **Wenn eine Messung ihn braucht: melden,
nicht starten.**

`[cmd]` **Gemessen in G-280: 18 Starts, sechs an einem Tag, vor keinem
ein Fehler** — **`neustart` fuehrt `taskkill /T /F` auf Port 3200
aus, und Tom arbeitet dort mit.**

## Abnahme

**2026-08-30, mit C-202 abgenommen: teilweise erledigt.**

`[cmd]` **UNII, PubChem, ChEMBL, InChIKey und 57 Aliase sind
vollstaendig zurueckgeflossen.**

`[cmd]` **Offen: 33 CAS-Nummern und 27 Peptidsequenzen** — **fuer die
Sequenzen gibt es kein Ziel im Live-Schema.**

`[read]` **Als C-365 weitergefuehrt.**
