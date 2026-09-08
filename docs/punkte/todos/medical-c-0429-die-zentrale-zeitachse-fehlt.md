---
nr: C-429
typ: befund
modul: medical
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-241
entscheidung: E-26
beruehrt:
  tabellen: [medical.lab_reports]
zahlen:
  gemessen: 2026-09-08
  reiter: 5
---

# C-429 — die zentrale Zeitachse fehlt

## Befund

Aus G-241, Codex, 2026-09-08.

`[cmd]` **E-26 vermutete: *,,`History` ist vermutlich in `tracking`
aufgegangen. Das gehoert gemessen."***

`[cmd]` **Gemessen: `tracking` enthaelt nur Symptome und
Medikamente.**

    Biomarker-Verlauf     -> Biomarkers
    Import-Historie       -> Import
    Symptome, Medikamente -> Tracking
    Diagnose, Behandlung,
    Bildgebung, Operation -> NIRGENDS

`[read]` **Die alte zentrale Zeitachse hat weder Reiter noch
Tabelle.**

## Was das heisst

`[read]` **Vier Ereignisarten haben keinen Ort:** **Diagnose,
Behandlung, Bildgebung, Operation.**

`[read]` **Das sind genau die, die ein Arzt sehen will** — **und
die ein Nutzer ueber Jahre sammelt.**

## Zusammenhang

`[cmd]` **`public.activity_stream` vereint sechs Module** (C-414) —
**`medical` traegt dort 10 Zeilen, aus Laborberichten.**

`[read]` **Zu klaeren, ob die Zeitachse eine eigene Tabelle
braucht** — **oder ob sie aus den bestehenden entsteht, sobald
Diagnosen und Behandlungen einen Ort haben.**

`[cmd]` **`docs/specs/Medical/SPEC_02_ENTITIES.md` und
`SPEC_06_DATABASE_SCHEMA.md` sind zu lesen.**
