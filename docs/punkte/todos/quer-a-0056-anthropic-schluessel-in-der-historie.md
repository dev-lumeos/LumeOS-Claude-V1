---
nr: A-56
typ: blocker
modul: quer
schwere: hoch
angelegt: 2026-08-27
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien:
    - docs/_archive/project/frontdoor/legacy/brainstorm-docs/BuddyandAICoach/coach_MIGRATION.md
zahlen:
  gemessen: 2026-08-27
  getrackte_dateien_mit_key: 1
---

# A-56 — ein Anthropic-Schluessel steht im Klartext in der Historie

## Befund

`[cmd]` **Gefunden beim Lesen des Vorgaengerrepos fuer die
Cam-Entscheidungen:**

    docs/_archive/project/frontdoor/legacy/brainstorm-docs/
        BuddyandAICoach/coach_MIGRATION.md      sk-ant-api03-...

`[cmd]` **Die Datei ist getrackt und committet.** `[cmd]` Das
Vorgaengerrepo selbst ist per `.gitignore:175` ausgeschlossen —
**die Archivkopie nicht.**

`[cmd]` **Und es wurde heute gepusht.** `[read]` **Der Schluessel ist
auf GitHub, unabhaengig davon, ob das Repo privat ist.**

`[cmd]` **Derselbe Schluessel steht in
`referenz/lumeos-2026/src/api/shared/claude-vision.ts`** — dort
allerdings ungetrackt.

## Was zu tun ist, in dieser Reihenfolge

**1. Rotieren.** `[read]` **Das kann nur Tom.** Solange der alte
Schluessel gueltig ist, aendert nichts anderes etwas.

**2. Dann erst bereinigen.** `[read]` **Ein Nachtrag im
Arbeitsbaum reicht nicht** — der Schluessel steht in der Historie und
bleibt ueber `git log -p` lesbar.

**3. Einen Waechter.** `[cmd]` `pnpm gate` prueft heute Encoding,
Nummern, Verdrahtung, Migrationen, Punkte — **aber nichts sucht nach
Schluesselmustern.** `sk-ant-`, `sk-`, `eyJ` (JWT), `SUPABASE_SERVICE_ROLE`.

`[read]` **Das ist dieselbe Klasse wie alles andere heute:** ein
Waechter fehlt genau dort, wo niemand hinsieht. **Und `docs/_archive/`
steht in der Liste *,,nicht als Referenz lesen"* — deshalb hat es
niemand gelesen.**

## Verwandt

`docs/todo/SICHERHEIT.md`, Abschnitt 3 *Zugaenge*. Dort steht der
`SUPABASE_SERVICE_ROLE_KEY` in `.env` — **dieser hier steht schlimmer,
weil er in der Historie liegt.**
