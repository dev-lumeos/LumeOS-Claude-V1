# Kimi-Ingestion — was hier liegt und was nicht

Erzeugt 2026-08-24 aus den Auftraegen C-259 (Ingestion), C-260
(Report-Daten-Abgleich) und C-261 (Filterlauf).

## Vier Dateien liegen auf der Platte, nicht im Repo

`[cmd]` Der Pre-Commit-Hook weist Dateien ueber 10 MB ab. Diese vier
stehen deshalb in `.gitignore` daneben:

| Datei | Groesse | warum draussen |
|---|---:|---|
| `konsolidierung/REPORT_DATA_ABGLEICH.jsonl` | **158,7 MB** | 330.397 Zeilen, davon **89 % Artefakte** — Cache-Inhalte, Checkpoints, Lauf-Metadaten |
| `analysis/KIMI_ARCHIVE_CONTENTS.jsonl` | **98,5 MB** | Inhaltsverzeichnis der 18 Archive, Zeile je Eintrag |
| `konsolidierung/FEHLENDE_WERTE.md` | **27,4 MB** | Prosafassung derselben 293.559 Zeilen |
| `analysis/KIMI_FILE_ANALYSIS_DETAILS.jsonl` | **24,8 MB** | Feldanalyse je Datei ueber 10.030 Dateien |

`[read]` **Das ist kein Verlust, sondern der Rohstand.** C-261 erzeugt
daraus die gefilterte Fassung — nur Sachfelder, nur echte Quellen. Die
gehoert dann ins Repo, weil sie klein und benutzbar ist.

`[read]` **Sie bleiben auf der Platte liegen**, damit die Filterung
nachvollziehbar ist. Wer pruefen will, ob der Filter zu viel wegwirft,
braucht das Original.

## Was im Repo steht

    analysis/KIMI_FILE_MANIFEST.jsonl        10.030 Zeilen, eine je Datei
    analysis/KIMI_DATASET_INVENTORY.*        25 Datensaetze
    analysis/KIMI_TO_LUMEOS_MAPPING.*        Zuordnung auf unsere Tabellen
    analysis/KIMI_RELATIONSHIP_MAP.*         529 Beziehungen
    analysis/KIMI_CONFLICTS.*                32 gemeldete Konflikte
    analysis/KIMI_KNOWLEDGE_GAPS.md
    analysis/KIMI_LUMEOS_IMPORT_PLAN.md
    analysis/KIMI_ORCHESTRATOR_BACKLOG.md
    analysis/KIMI_FINAL_ACCOUNTING.json      Invariante
    konsolidierung/FEHLENDE_ENTITAETEN.md
    konsolidierung/KONSOLIDIERUNG_ZUSAMMENFASSUNG.md
    konsolidierung/REPORT_FILE_STATUS.jsonl

## Zwei Warnungen zum Lesen dieser Dateien

`[cmd]` **Die Mengenangaben im Mapping sind Kopienzaehlungen.**
`performance_compounds: 114.934` bei tatsaechlich **75** Substanzen —
gezaehlt ueber alle Archivkopien. **Die echten Zahlen stehen in
`docs/ssot/95-kimi-bestand.md`**, aus dem entpackten `data/`-Stand
gemessen.

`[cmd]` **Der Konfliktbericht ist aus derselben Ursache unbrauchbar.**
*„154 doppelte IDs in `supplements.jsonl`"* bei tatsaechlich 154
eindeutigen — die Datei wurde zweimal gelesen, entpackt und aus dem
Archiv, und die Treffer ueber beide Quellen gezaehlt. Dasselbe bei
Peptiden, Enhanced und Wirkstoffen.

`[cmd]` **Die sieben Archivfehler tragen denselben Fehler an derselben
Position** (`Extra data: line 2 column 1, char 2169`) — ein
JSON-Parse-Fehler auf `.tar.gz`-Dateien. Vom Orchestrator mit
`tarfile` nachgeprueft: **alle sieben sind einwandfrei lesbar**,
`crawl_038` mit 7.402 Eintraegen. **Kein Datenverlust.**
