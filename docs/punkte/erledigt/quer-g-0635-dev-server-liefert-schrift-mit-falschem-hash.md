---
nr: G-635
typ: fehler
modul: quer
schwere: mittel
angelegt: 2026-10-08
agent: claudecode
beauftragt: 2026-10-08
erledigt: 2026-10-09
commit: 8390b67c

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
## Auftrag - Kopf

    AUFTRAG FUER Claude Code - G-635: wer schreibt in apps/web/.next
    Bereich: tools/, apps/web (Build-Konfiguration, Tests)
    Fremd:   supabase/_pipeline/ (Codex). docs/ gehoert dem Orchestrator.
    Stand:   2026-10-08, HEAD 113fbfae


## Erledigt - 2026-10-09, Commit `8390b67c`

`[read]` Claude Code: Die Ursache war Turbo. `turbo.json` meldete für build die Ausgaben `.next/**`. Der Gate-Lauf am 08.10. 16:18:45 hatte einen Cache-Treffer (`49586e6a`), dessen Artefakt 1.912 Dateien unter `apps/web/.next` enthielt, darunter `layout.css` mit `__variable_8b3a0b`. Zweiter Schreiber war der `next lint`-Cache.

`[cmd]` Orchestrator: Der Diff von `turbo.json` entfernt `.next/**`. Lint läuft jetzt mit `--cache-location .next-gate/cache/eslint/`. Wächter `tools/__tests__/g635-next-nur-dev.test.mjs`. Gate grün.

`[read]` Gegenprobe 5/5 rot. Ein Cache-Treffer danach schrieb 0 Dateien nach `.next`.