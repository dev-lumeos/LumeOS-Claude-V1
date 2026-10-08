---
nr: G-635
typ: fehler
modul: quer
schwere: mittel
angelegt: 2026-10-08

braucht: []
kind_von: null

quellen:
  - tools/server.py
  - apps/web/src/app/layout.tsx

beruehrt:
  tabellen: []
  dateien:
    - apps/web/.next
    - tools/server.py
---

# Dev-Server liefert die Schrift mit falschem Hash

## Befund

`[read]` Tom 08.10.2026 17:43: alles schlecht lesbar, flackert beim Überfahren.

`[cmd]` Die Seite zeigte Times New Roman. Das HTML trug `__variable_176161 __variable_5f34dc`, `layout.css` definierte aber `.__variable_8b3a0b` und `.__variable_e896d9`. Damit waren `--lumeos-inter` und `--font-sans` leer. Server- und Client-Teil von `.next` passten nicht zusammen. `apps/web/.next/server` und `.next/static` wurden um 16:18 neu geschrieben, eine Minute vor dem Gate-Build nach `.next-gate` (16:19). Der Dev-Server lief seit 06.10.

`[cmd]` `python tools/server.py neustart` hat es behoben: Der Body nutzt `__Inter_176161`, das Bildschirmfoto `backup/orch-nach-neustart-goals.png` ist wieder normal.

## Was zu tun ist (Claude Code)

Finden, wer um 16:18 in `apps/web/.next` geschrieben hat (Gate, Test, Typecheck, `next build` ohne `LUMEOS_DIST_DIR`). Danach die Ursache abstellen und einen Wächter einbauen: Ein Build ausser `next dev` darf `.next` nie berühren.