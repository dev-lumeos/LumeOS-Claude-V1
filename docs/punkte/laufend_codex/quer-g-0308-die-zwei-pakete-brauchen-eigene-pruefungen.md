---
nr: G-308
typ: feature
modul: quer
schwere: mittel
angelegt: 2026-09-01
braucht: []
kind_von: G-303
entscheidung: null
agent: codex
beauftragt: 2026-09-01
beruehrt:
  dateien:
    - packages/ui/package.json
zahlen:
  gemessen: 2026-09-01
  ui_transitiv: 16
  shared_transitiv: 9
  root_tsc_fehler: 486
---

# G-308 — die zwei Pakete brauchen eigene Pruefungen

## Befund

Aus G-303, Codex, 2026-09-01.

`[cmd]` **`web#typecheck` bindet 16 von 16 UI-Dateien ein und 9 von
10 Shared-Dateien** — `auth/admin-session.ts` fehlt, absichtlich kein
Barrel-Export.

`[read]` **Codex' Fassung ist praeziser als meine Frage:** *,,UI
vollstaendig und Shared teilweise werden als Nebenwirkung eines
einzelnen Verbrauchers geprueft. Das ist kein Paketvertrag und
entfaellt, sobald der Import verschwindet."*

`[cmd]` **Beide Pakete melden `<NONEXISTENT>` fuer `typecheck` und
`build`.**

`[cmd]` **Root-`tsconfig` ohne `jsx`: 486 Fehler, alle aus UI-JSX.**
`[cmd]` **Die ersten UI-Dateien kamen am 15.08., das Root-tsconfig
steht seit dem 23.04.**

## Was zu bauen ist

**Eigene `typecheck`- und `build`-Skripte fuer `@lumeos/ui` und
`@lumeos/shared`, mit eigenem `tsconfig`.**

`[read]` **Die heutige transitive Abdeckung hoechstens als
zusaetzliche Gegenprobe** — nicht als Ersatz.

`[read]` **Und das Root-`tsconfig` gehoert dabei entschieden:**
entweder `jsx` setzen, oder das globale `tsc` ausdruecklich aufgeben
und sagen warum.

## Auftrag

**Beauftragt am 2026-09-01.**

`[read]` **Du hast es in G-303 gemessen. Jetzt bauen.**

**Eigene `typecheck`- und `build`-Skripte fuer `@lumeos/ui` und
`@lumeos/shared`, mit eigenem `tsconfig`.**

`[cmd]` **Beide melden heute `<NONEXISTENT>`** — **eine
Gate-11/11-Meldung ist fuer sie kein Nachweis.**

`[read]` **Die transitive Abdeckung bleibt hoechstens Gegenprobe.**
`[cmd]` **Bei Shared fehlt `auth/admin-session.ts`** — absichtlich
kein Barrel-Export, **also von einem Paketvertrag erfasst, von der
Nebenwirkung nicht.**

### Und das Root-`tsconfig`

`[cmd]` **486 Fehler, alle `TS17004`/`TS6142` aus UI-JSX.** `[cmd]`
**Kein `jsx` gesetzt, seit dem 23.04.**

`[read]` **Entweder `jsx` setzen, oder das globale `tsc` ausdruecklich
aufgeben und sagen warum.** **Ein rotes Kommando, das jeder ignoriert,
ist schlimmer als keines.**

### Was nicht zu tun ist

**Keine Quelldatei aendern, um Fehler wegzubekommen** — erst messen,
was der Typecheck findet.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    ui#typecheck      laeuft, Exit und Fehlerzahl
    shared#typecheck  laeuft, admin-session.ts erfasst
    build             beide, Exit
    Gate              vorher 11, nachher wie viele
    Root-tsc          gesetzt oder begruendet aufgegeben
    Gegenprobe        ein eingebauter Typfehler wird gefangen

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
