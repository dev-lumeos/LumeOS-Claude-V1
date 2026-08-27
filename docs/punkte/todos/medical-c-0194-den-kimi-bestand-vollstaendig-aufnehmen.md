---
nr: C-194
typ: befund
modul: medical
schwere: mittel
angelegt: 2026-08-22
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["backup/kimi-bestand-aufnahme.json", "tools/_kimi-bestand.py"]
zahlen: null
---

# C-194 - Den Kimi-Bestand vollstaendig aufnehmen

## Befund

(neu
  2026-08-22). **Bei Fable gelaufen, Bericht geprueft.**

  `[cmd]` **8.881 Dateien, 346 MB, Crawls 017-035.** Neun Unterordner
  unter `data/`. Ergebnis: `backup/kimi-bestand-aufnahme.json`,
  Werkzeug `tools/_kimi-bestand.py`.

  **Der Bericht ist die Grundlage der Gruppe K.** Schliessen, sobald
  die Gruppe angelegt und die widerlegten Punkte nachgezogen sind.

  `[cmd]` **Drei Zaehlkorrekturen aus der Gegenpruefung:**
  `data/metadata/sources.jsonl` hat **2.288 Zeilen** (Fable suchte ohne
  `metadata/`) · **163 Punkte**, nicht 189 (Fable zaehlte Checkboxen
  inklusive Unterpunkten) · `symptom_ontology_seed` hat **32**
  Symptome, nicht 21 — **das war mein Fehler**, aus dem Punkttext
  uebernommen statt aus der Datei.

## F — Gedächtnisschichten (AMF)

**Warum das hier steht.** Tom verliert seit Monaten Zeit damit, eigene Inhalte
wiederzufinden, und jede Agentensitzung beginnt bei null. `[cmd]` Unter
`D:\GitHub` liegen 31 Verzeichnisse, neun davon mit „lumeos" im Namen, vier mit
Git, zwei auf dasselbe Remote. `[cmd]` In `~/.claude/projects/` liegen 54
Sitzungen mit 85,5 MB, in `~/.codex/sessions/` weitere 31 — eine davon allein
73 MB. Das Material ist da und maschinenlesbar; es ist nur nicht auffindbar.

**Grundlage:** Toms AMF-Blueprint vom 2026-08-13 (ChatGPT) mit vier Schichten:
was ist WAHR (Repo + Git), was ist RELEVANT (semantisches Retrieval), was ist
PASSIERT (episodisch), was hat sich VERÄNDERT (temporal). Die Zerlegung nach
Fragen statt nach Technologien trägt. Die Reihenfolge im Blueprint nicht:
dort steht die Schnittstelle in Phase 6, nach vier Backends.

**Was hier NICHT gilt:** Das ist kein LumeOS-Produktpunkt. AMF ist
projektübergreifend und lebt in einem eigenen Repo. Es steht hier, weil Tom es
hier führen will und weil LumeOS der erste Anwender ist.

**Recherchebefunde `[read]` 2026-08-13, die die Reihenfolge bestimmen:**

- `kepano/obsidian-skills` — MIT, 44.300 Sterne, 46 Commits, vom Obsidian-CEO.
  Fünf Fertigkeiten (`obsidian-markdown`, `obsidian-bases`, `json-canvas`,
  `obsidian-cli`, `defuddle`), folgen der Agent-Skills-Spezifikation und laufen
  in **Claude Code, Codex und OpenCode**. Kein Speicher — die Fähigkeit, ein
  Format zu lesen und zu schreiben. Das ist der Unterschied: das Gedächtnis
  *sind* die Dateien, nicht ein Index darüber.
- Supermemory — lokale Binärdatei auf `localhost:6767`, fertige Anbindungen für
  Claude Code, Codex und OpenCode. Lizenzlage widersprüchlich (MIT, Apache-2.0
  und „geschlossen" je nach Quelle); vor einer Entscheidung am Objekt zu klären.
- Graphiti — fachlich das stärkste der vier, bi-temporal mit
  `valid_at`/`invalid_at`. Aber: braucht Neo4j, FalkorDB oder Neptune, und
  **jeder `add_episode`-Aufruf kostet Modellaufrufe** zur Entitätsextraktion.
  `[read]` Zep hat den Selbstbetrieb 2025 eingestellt; Graphiti bleibt quelloffen,
  aber es gibt keinen Rückfallweg auf eine fertige Community-Edition.
- MemPalace — **abgelehnt.** Vier Monate alt, 7.199 Sterne pro Tag, und die
  Benchmark-Behauptung von 96,6 % musste binnen 48 Stunden korrigiert werden:
  falsche Tokenizer-Heuristik, „verlustfreie" Kompression ist verlustbehaftet
  und verliert 12,4 Punkte, eine angekündigte Funktion war nicht verdrahtet.
  Speichert unbegrenzt wörtlich. Das ist dieselbe Fehlerklasse, die LumeOS
  heute viermal getroffen hat: ein Werkzeug, das Sicherheit behauptet, ohne
  sie zu erzeugen.
- Alternativen, die der Blueprint nicht kennt: `basic-memory` (lokaler
  MCP-Server über Markdown), `engram` (eine Go-Binärdatei, SQLite + FTS5, MCP),
  `claude-mem`, `Cognee` (Apache-2.0, Graph), `mem0` (grösste Gemeinschaft,
  aber nur 49,0 % LongMemEval).

**Die fünfte Frage, die im Blueprint fehlt:** *Ist das noch wahr?* Alle vier
Schichten beantworten Fragen über die Vergangenheit. Keine beantwortet, ob eine
gefundene Aussage heute noch gilt. `[cmd]` LumeOS trägt 719 `[cmd]`-, 178
`[read]`- und 75 `[annahme]`-Marker mit Datum — semantische Ähnlichkeit
unterscheidet nicht zwischen richtig und veraltet. Jede Antwort aus AMF muss
sagen können: erhoben am X gegen Commit Y, seither Z Commits.
