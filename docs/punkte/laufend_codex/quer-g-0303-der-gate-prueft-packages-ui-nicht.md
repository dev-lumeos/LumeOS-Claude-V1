---
nr: G-303
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: G-296
entscheidung: null
agent: codex
beauftragt: 2026-08-31
beruehrt:
  dateien:
    - packages/ui/package.json
zahlen:
  gemessen: 2026-08-31
  ui_fehler_global: 486
---

# G-303 — der Gate prueft `packages/ui` nicht

## Befund

Aus G-296, Codex, 2026-08-31. **Vom Orchestrator nachgemessen.**

`[cmd]` **`turbo run typecheck --dry-run`:**

    @lumeos/admin#typecheck          tsc --noEmit
    @lumeos/coach#typecheck          tsc --noEmit
    @lumeos/nutrition-api#typecheck  tsc --noEmit
    @lumeos/web#typecheck            tsc --noEmit
    @lumeos/shared#typecheck         <NONEXISTENT>
    @lumeos/ui#typecheck             <NONEXISTENT>

`[cmd]` **Zwei Pakete haben kein Skript** — **der Gate laeuft ueber
sie hinweg und meldet Gruen.**

`[cmd]` **Dasselbe bei `build`.**

## Warum es `hoch` ist

`[cmd]` **`packages/ui` traegt `InEntwicklung` mit 135 Aufrufern**
(C-177) — **die Datei ist quer durch alle Module im Umlauf.**

`[read]` **Jede *Gate 11/11 gruen*-Meldung der letzten Wochen hat
diese beiden Pakete nicht geprueft.**

`[cmd]` **Und das globale `tsc` ist rot: 486 UI-Fehler, weil das
Root-`tsconfig` kein `jsx` setzt** — **seit dem 15.08., den ersten
UI-TSX-Dateien.**

`[read]` **Beide Befunde zusammen heissen: die UI-Pakete werden
nirgends typgeprueft** — **weder einzeln noch global.**

## Was daran zu klaeren ist

`[read]` **Ob `web#typecheck` sie mitprueft, weil es aus ihnen
importiert.** `[cmd]` **`tsc --noEmit` folgt Importen** — **also
vielleicht teilweise.**

`[read]` **Aber *teilweise, als Nebenwirkung* ist keine Pruefung.**

## Auftrag

**Mitbeauftragt mit C-368 am 2026-08-31.** Bericht dort.

`[cmd]` **Zwei Pakete haben kein `typecheck`- und kein
`build`-Skript** — der Gate laeuft darueber hinweg und meldet Gruen.

`[read]` **Jede *Gate 11/11*-Meldung der letzten Wochen hat sie nicht
geprueft.** `[cmd]` **Und `packages/ui` traegt `InEntwicklung` mit
135 Aufrufern.**

`[read]` **Zu klaeren, bevor gebaut wird:** **prueft
`web#typecheck` sie mit, weil es aus ihnen importiert?** `[cmd]`
**`tsc --noEmit` folgt Importen** — **aber *teilweise, als
Nebenwirkung* ist keine Pruefung.**

`[cmd]` **Und das Root-`tsconfig` setzt kein `jsx`: 486 Fehler seit
dem 15.08.** `[read]` **Beides gehoert zusammen.**
