# Trainingsstammdaten aus LumeOS-V2 — Export 2026-08-07

Vollständiger Datenexport der vier Übernahmekandidaten aus der
Legacy-Cloud-Instanz. **Daten, nicht Schema.**

| Datei | Zeilen | Bytes |
|---|---|---|
| `exercises.json` | 1.448 | 3.043.692 |
| `exercise_muscles.json` | 6.398 | 985.749 |
| `muscle_groups.json` | 157 | 28.410 |
| `equipment.json` | 61 | 10.973 |

`[cmd]` Zeilenzahlen gegen die Quelle geprüft: identisch
(1.448 / 6.398 / 157 / 61). LF, ohne BOM, UTF-8.

---

## Warum JSON

Kriterium war: **ein späterer Import in ein NEU entworfenes Schema muss
möglich sein** — nicht, dass die alte Struktur erhalten bleibt.

- **JSON** trägt die `text[]`-Spalten (`primary_muscles`,
  `secondary_muscles`, `common_mistakes`, `aliases`) verlustfrei und ohne
  Trennzeichen-Konvention. Jeder Datensatz ist selbstbeschreibend: wer das
  alte Schema nicht kennt, sieht die Feldnamen mit.
- **CSV** verworfen: Die Arrays müssten in eine Textform gepresst werden,
  und `instructions`/`tips` enthalten Kommata und Zeilenumbrüche. Jede
  Wiederherstellung hinge an einer Quoting-Konvention.
- **SQL-INSERTs** verworfen: Sie zementieren die alte Struktur — genau
  das, was hier **nicht** gewollt ist. Das Schema wird neu entworfen
  (siehe unten).

## Das Schema wurde bewusst NICHT übernommen

`[cmd]` Gemessener Grund: `exercises.primary_muscles` ist ein `text[]`
**und** `exercise_muscles` ist eine Zuordnungstabelle — dieselbe Tatsache
in zwei Formen.

| Posten | Wert |
|---|---|
| Paare im Array | 3.139 |
| Paare in der Zuordnung (`role='primary'`) | 2.972 |
| in beiden gleich | 2.972 |
| **nur im Array** | **166** |
| nur in der Zuordnung | **0** |

Das Array ist eine **echte Obermenge**; die beiden Quellen widersprechen
einander nie. Wer nur die Zuordnungstabelle übernimmt, verliert 166
Zuordnungen.

## Weitere Befunde, die beim Neuentwurf zählen

`[cmd]` 2026-08-07 am Export gemessen:

- **`name_de` und `name_th` sind durchgehend `NULL`** in allen vier
  Dateien. Die Lokalisierung existierte nur als Spalte.
- **63 von 157** Muskelgruppennamen tragen eine überzählige schliessende
  Klammer (`Triceps)`) — Importartefakt, zu bereinigen.
- `muscle_groups.body_region`: 65 von 157 auf `other`.
- `equipment.category`: **alle 61** auf `general` — die Spalte trägt keine
  Information.
- Leer in `exercises`: `description`, `score_hypertrophy`,
  `score_strength`, `score_sfr`, `common_mistakes`, `aliases`.
- **Der eigentliche Wert:** `instructions` (1.448 von 1.448) und `tips`
  (1.444) — ausformulierte, mehrschrittige Anleitungen. Bei Neuerzeugung
  der teuerste Posten.
- **Keine Fremdschlüssel** in der Quelle: `equipment_id` und die beiden
  Spalten in `exercise_muscles` sind Konvention, kein Constraint.
  `[cmd]` Gegenprobe am Export: **0 Waisen** in allen drei Beziehungen.

## Medienverweise

Nicht Teil dieses Exports, aber daran hängend: Die fünf Medienspalten in
`exercises.json` tragen **absolute URLs** mit der Projekt-Referenz. Vor
einer Übernahme gehören sie in Bucket + relativen Pfad zerlegt (E-06,
ADR-0004). Details in `docs/ssot/60-legacy-cloud.md`, Abschnitt 5.

## Herkunft

Erhoben über eine **nur lesende** Rolle
(`default_transaction_read_only = on`). Keine Zugangsdaten in diesem
Verzeichnis oder im Repo.
