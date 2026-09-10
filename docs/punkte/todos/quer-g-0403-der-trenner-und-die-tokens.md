---
nr: G-403
typ: entscheidung
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-402
entscheidung: null
beruehrt:
  dateien:
    - packages/ui/src/shell/app-shell.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-403 — der Trenner und die Tokens, zweite Haelfte

## Befund

Aus G-402, Claude Code, 2026-09-08.

`[cmd]` **Der Referenz-Trenner liegt jetzt in `packages/ui`, die
Kopie in `apps/coach` ist weg.**

`[cmd]` **`apps/web` behaelt seine eigene** ? **der Auftrag verbot,
sie anzufassen.**

> *,,Die Tokens habe ich bewusst nicht verschoben: ein dritter Ort
> im Paket haette drei Dateien statt zwei ergeben, solange
> `apps/web` nicht mitziehen darf."*

`[read]` **Beide Male dieselbe Ursache** ? **die Regel
*,,`apps/web` nicht anfassen"* verhindert das Aufraeumen.**

## Was zu entscheiden ist

`[read]` **Ein Auftrag, der `apps/web` ausdruecklich erlaubt** ?
**nur fuer diese zwei Sachen:**

    1  referenz-trenner: apps/web nutzt den aus packages/ui
       -> eine Fassung statt zwei

    2  die Tokens: lume.css und apps/coach/tokens.css
       -> eine Fassung im Paket, --acc bleibt lokal

`[cmd]` **Claude Code hat gemessen: nur `--acc` weicht ab,
absichtlich.**

`[read]` **Mit Gegenprobe: `apps/web` sieht danach gleich aus,
1545 Tests bleiben gruen.**

## Und zwei Zeilen aus G-402

`[cmd]` **Workspaces:** `nav.ts` **fuehrt *Coach Portal* selbst** ?
**im Portal waere das ein Verweis auf sich.**

`[cmd]` **Settings:** `SETTINGS_ENTRY` **zeigt auf `/v2/settings`,
das es in `apps/coach` nicht gibt.**

`[read]` **Soll das Portal beides tragen?** `[read]` **Dann
braucht es eigene Ziele** ? **Workspaces zurueck nach
`apps/web`, Settings auf den Portal-Reiter.**
