# CLAUDE.md — LumeOS Runtime Instructions

## Rolle

Du bist Claude im LumeOS-Repo (`D:\GitHub\LumeOS-Claude-V1`).
Du arbeitest hier **direkt** mit Tom — kein Workorder-Workflow, keine
Governance-Pipeline. Du änderst Dateien nur, wenn Tom es explizit verlangt.

---

## Wo der Ist-Zustand steht

Diese Datei beschreibt **bewusst keinen Repo-Zustand.** Zustandssätze
veralten hier unbemerkt und wurden dann als Regel befolgt — zweimal
passiert („services/ ist leer"; „keine Writes, kein Auth").

| Frage | Ort |
|---|---|
| Was ist gebaut, was gilt? | `docs/ssot/00-INDEX.md` (Einstieg, Herkunftsmarker, Rangfolge: Code > ssot > Rest) |
| Was ist als Nächstes zu tun? | `docs/todo/TODO.md` |
| Was ist das Zielbild? | `docs/spezifikation/` (Rollen der Ordner, Statuskopf, Regeln: `00-INDEX.md`) |
| Was ist vom Altbestand schon ausgewertet? | `docs/spezifikation/00-KONSOLIDIERUNG.md` (Ablauf und Register) |
| Wie entsteht die Datenbank? | `supabase/README.md` (Baseline + Pipeline, Rollenteilung) |
| Wie starte ich, welche Gates gelten? | Root-`README.md` (u. a. `pnpm gate`, Hook-Aktivierung) |

---

## Schreibregeln

- Keine Codeänderung ohne explizite Freigabe.
- Keine Commits oder Pushes ohne Tom. Ein logischer Change pro Commit.
- Markdown nur mit vollständigem Inhalt schreiben, Datei vorher einlesen —
  Teil-Edits zerstören Tabellen, Rekonstruktion aus dem Gedächtnis hat
  schon Abschnitte verloren.
- Aussagen über den Ist-Zustand tragen `[cmd]`, `[read]` oder `[annahme]` —
  Details in `docs/spezifikation/10-plattform/konventionen/`.
- Nie gegen die laufende Datenbank testen; Wegwerf-Datenbank, danach
  verwerfen. Strukturelle Live-Änderungen nur nach Freigabe.
- **`docs/specs/` und `docs/BrainstormDocs/` sind Datenquelle, nie
  Current Truth.** Sie beschreiben teils eine Vorgänger-Codebasis. Wer an
  einem Modul arbeitet, liest den zugehörigen Altbestand **mit** — er
  enthält getroffene Produktentscheidungen, die sonst zweimal getroffen
  werden. Verbindlich wird ein Inhalt erst, wenn er besprochen und nach
  `docs/spezifikation/` (Soll) oder `docs/ssot/` (Ist) übernommen ist.
  Ablauf und Stand: `docs/spezifikation/00-KONSOLIDIERUNG.md`.
- In `docs/specs/` wird nicht geschrieben — einzige Ausnahme ist ein
  Statusvermerk im Kopf, der auf das Konsolidierungsregister zeigt.
- Bei Unsicherheit: im Repo nachsehen, nicht raten.

---

## Altlasten

Die frühere Governance-Maschinerie ist archiviert (`_archive/governance/`,
Regeln im dortigen README) bzw. in ein eigenes Repo umgezogen.
**Die Wurzel ist seit 2026-08-06 (A-10) geräumt:** `COMMANDS.md`,
`SESSION_ONBOARDING.md`, `STACK_REFERENCE.md` und `CLAUDE.md.v1.bak`
liegen jetzt unter `_archive/governance/wurzel-altlast/` (mit README, das
je Datei nennt, warum). `project.profile.json` ist bereits früher
entfallen.
**`AGENTS.md` bleibt bewusst im Wurzelverzeichnis** — sie ist keine
Altlast mehr, sondern der Einstiegspunkt für Agenten-Werkzeuge
(lean-ctx-Block, Verweis auf `CLAUDE.md`); mehrere Werkzeuge lesen sie von
sich aus. Wenn Tom nach Governance fragt: das gehört ins Governance-Repo,
nicht hierher.

---

## gstack

- Für Browsing/Scraping/Headless-Aufgaben das gstack-`/browse`-Skill
  verwenden, **nicht** die `mcp__claude-in-chrome__*`-Tools.
- gstack-Skills, die auto-committen oder auto-pushen (`/ship`,
  `/land-and-deploy`), brauchen explizite Tom-Freigabe gemäss Schreibregeln.

## Befehle schreiben

Claude Code kann Befehle mit Schleifen, Befehlssubstitution oder
Variablenexpansion nicht statisch prüfen und fragt dann nach — unabhängig
von der Permission-Liste. Das kostet Tom bei jedem Zwischenschritt einen
Klick, ohne dass er entscheiden könnte, was er da freigibt.

Deshalb:

- **Kein `cd`-Präfix.** Die Sitzung läuft im Repo-Wurzelverzeichnis.
- **Keine Schleifen** (`for`, `while`) in Bash-Aufrufen.
- **Keine Befehlssubstitution** (`$(...)`, Backticks).
- **Keine Variablenexpansion** (`${PIPESTATUS[0]}`, `${x:-y}`, `$out`).
- **Keine Heredocs** für mehrzeilige Inhalte.

Stattdessen: mehrere einfache Befehle nacheinander, oder — wenn wirklich
Logik nötig ist — ein Skript als Datei anlegen und die Datei aufrufen.
Der Aufruf ist dann eine gerade Zeile und geht ohne Nachfrage durch.

Exit-Codes werden einzeln abgefragt, nicht über `PIPESTATUS` aus einer
Pipeline gezogen. Wiederholungsläufe werden als einzelne Aufrufe geschrieben,
nicht als Schleife.
