# docs/_archive/ — Altlast-Archiv

**Angelegt:** 2026-08-02 (Aufräum-Sitzung, TODO A-03)

## Regel

**Aus diesem Ordner wird nicht mehr zitiert.** Nichts hier ist aktuelle
Referenz; wer eine Aussage braucht, nimmt `docs/ssot/` (Ist-Zustand),
`docs/spezifikation/` (Zielbild) oder `docs/todo/TODO.md` (nächste Schritte).
Bei Widerspruch gilt die Rangfolge aus `docs/ssot/00-INDEX.md` —
Archivinhalt steht ganz unten.

Die Dateien bleiben erhalten (verschoben per `git mv`, nichts gelöscht),
weil sie Herkunft und Entscheidungen der Governance-Ära dokumentieren.

## Inhalt

| Pfad | Was es war | Warum hier |
|---|---|---|
| `todos/` | 11 Todo-Dateien der Spark/System-Ära | Workorder-Betrieb, durch `docs/todo/TODO.md` ersetzt |
| `governance/` | Handover, Import-Inventar, Todo-Register, Findings | Governance ist in ein eigenes Repo umgezogen; hier tot |
| `ist-zustand/` | Read-only Repo-Inventar vom 2026-07-30 | Vollständig in `docs/ssot/` aufgegangen; Detailfehler dort korrigiert |
| `project/` | Governance-Anteile aus `docs/project/` | Workorder-Pipeline, Sparks, Codex-Dispatcher, Governance-UI, Masterprompts, Runtime-Pläne, Frontdoor, System-Audits — nichts davon gilt in diesem Repo |
| `loeschliste-2026-08-02.md` + `.ps1` | Prüfliste + Skript für untracked Ballast | Ausführung ist Toms Entscheidung |

**In `docs/project/` verblieben (Produkt, kein Archiv):** `p1-005/` und
`local-supabase/` (Teil der DB-Aufbaukette), `GSTACK*.md` (aktives Tooling),
`P1_005_*_CANDIDATE.md` (Aufbaukette-Herkunft), `PRODUCT_WORK_GATE.md` und
`FIRST_PRODUCT_GATE_OPENING_PROPOSAL.md` (Grenzfälle: Governance-Form, aber
das Product-Gate-Konzept wird von `docs/ssot/40-spec-code-matrix.md` weiter
referenziert — Einordnung ist Toms Entscheidung).
