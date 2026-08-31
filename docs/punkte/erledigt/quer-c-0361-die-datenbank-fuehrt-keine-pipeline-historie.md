---
nr: C-361
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-30
braucht: []
kind_von: C-209
entscheidung: null
agent: codex
beauftragt: 2026-08-30
erledigt: 2026-08-31
commit: fcd36338
beruehrt:
  dateien:
    - supabase/_pipeline/kette.json
zahlen:
  gemessen: 2026-08-30
---

# C-361 — die Datenbank fuehrt keine Pipeline-Historie

## Befund

Aus G-280/C-209, Codex, 2026-08-30.

`[cmd]` **Der konkrete Blocker ist behoben:**
`reference_assessment_window_flags` existiert live.

`[cmd]` **Aber es gibt keine Stelle, die sagt, welche Kettenschritte
live sind.** `[read]` **Die Datenbank fuehrt keine Historie darueber,
was aus `supabase/_pipeline/` je eingespielt wurde.**

## Warum es zaehlt

`[cmd]` **C-195 ist der bekannte Fall, und er hat am 30.08. G-273
blockiert** — 78 Zeilen lagen in der Kette und waren nie eingespielt.

`[read]` **Claude Code hat es gefunden, weil er gegen `pg_proc`
geprueft hat, bevor er baute.** `[read]` **Ohne diese Gewohnheit
haette er eine tote Funktion gerufen und die Seite gebrochen.**

`[read]` **Die Gewohnheit ist gut. Sie sollte nicht noetig sein.**

## Was zu klaeren ist

`[read]` **Eine Tabelle, die je Kettenschritt festhaelt, wann er lief
und mit welcher Pruefsumme** — **das ist das uebliche Muster.**

`[cmd]` **`kette.json` fuehrt die Reihenfolge, aber nicht den
Zustand.**

`[read]` **Und die Vorfrage: wer schreibt hinein?** **Der Schritt
selbst, oder der Lauf, der ihn ausfuehrt?**

## Auftrag

**Mitbeauftragt mit C-345 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `server.py neustart`, kein `start`, kein
`aufraeumen`.** `[read]` **Wenn eine Messung ihn braucht: melden,
nicht starten.**

`[cmd]` **Gemessen in G-280: 18 Starts, sechs an einem Tag, vor keinem
ein Fehler** — **`neustart` fuehrt `taskkill /T /F` auf Port 3200
aus, und Tom arbeitet dort mit.**

## Abnahme

**2026-08-31, mit C-345 abgenommen: Vorschlag vorgelegt.**

`[cmd]` **138 Kettenschritte, keine Historientabelle, weder in der
Datenbank noch beim Ausfuehrer.** `[read]` **Der Vorschlag steht in
der C-345-Datei.**
