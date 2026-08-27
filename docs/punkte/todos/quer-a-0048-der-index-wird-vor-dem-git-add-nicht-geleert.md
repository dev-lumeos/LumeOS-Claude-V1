---
nr: A-48
typ: feature
modul: quer
schwere: mittel
angelegt: 2026-08-22
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["docs/todo/LAUFEND.md"]
zahlen: null
---

# A-48 - Der Index wird vor dem `git add` nicht geleert

## Befund

(neu
  2026-08-22).

  `[cmd]` **`LAUFEND.md` ist im falschen Commit gelandet** — `863124c`
  traegt Fables Evidenz-Code **und** den Eintrag *„G-133 laeuft bei
  Claude Code"*. Zwei logische Changes in einem Commit.

  `[read]` Die Datei war seit Stunden gestaged, und `git add <pfad>`
  entfernt nichts aus dem Index. **Die Projektanweisung sagt, vor jedem
  Commit `git diff --cached --name-only` zu lesen** — das Skript hat
  es ausgegeben, der Orchestrator hat es erst nachher gelesen.

  **Zu bauen:** vor einem gezielten Commit den Index leeren, oder die
  gestagten Pfade gegen die beabsichtigten pruefen und abbrechen, wenn
  sie abweichen.
