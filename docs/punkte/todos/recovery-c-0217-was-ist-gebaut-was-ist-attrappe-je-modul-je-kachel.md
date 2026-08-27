---
nr: C-217
typ: befund
modul: recovery
schwere: mittel
angelegt: 2026-08-22
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: ["recovery.checkins", "recovery.scores", "recovery.modality_log"]
  dateien: ["backup/bestand/00-toms-bildschirmfotos.md"]
zahlen: null
---

# C-217 - Was ist gebaut, was ist Attrappe — je Modul, je Kachel

## Befund

(neu 2026-08-22). **Laeuft bei Fable.**

  `[read]` **Anlass:** Der Orchestrator hat behauptet, es gebe keine
  Arbeit fuer zwei freie Agenten. Tom hat sieben Bildschirmfotos aus
  **einem** Modul geschickt, auf denen jede Kachel *„Attrappe"* traegt.
  **`TODO.md` ist ein Befundregister, kein Arbeitsvorrat** — ein ganzes
  Modul voller Attrappen steht nicht drin, weil es niemand als Befund
  aufgeschrieben hat.

  `[cmd]` Beleg und Bildinhalt: `backup/bestand/00-toms-bildschirmfotos.md`.

  `[cmd]` **Recovery zeigt auf jeder Kachel *„das Schema `recovery` gibt
  es noch nicht"*** — dabei hat `recovery.checkins` **340** Zeilen,
  `recovery.scores` **340**, `recovery.modality_log` **178**, und drei
  Lesefunktionen greifen bereits darauf zu (`checkin-read.ts:62`,
  `scores-read.ts:145`, `scores-read.ts:239`).

  `[cmd]` **42 Attrappen-Marken in sieben Recovery-Dateien.** Dasselbe
  Pauschalbanner in `coach`, `coach/ai`, `medical`, `training`.

  **Was der Bericht liefert:** je Kachel echt oder Attrappe, je Modul
  Schema und Zeilenzahlen, je Attrappe was zum Anbinden fehlt — Tabelle
  fehlt / leer / nicht verdrahtet / haengt an einer Entscheidung. Gegen
  alle vier Quellen. **Daraus werden die Gruppen mit Abhaengigkeiten.**
