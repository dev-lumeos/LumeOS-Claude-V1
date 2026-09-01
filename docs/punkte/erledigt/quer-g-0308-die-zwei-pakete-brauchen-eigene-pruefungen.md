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
erledigt: 2026-09-01
commit: 6d4a155a
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

### 2026-09-01 — Codex

**Gebaut:** Beide Quellpakete haben jetzt ein eigenes `tsconfig.json`
sowie `typecheck` und `build`:

    tsc --noEmit --project tsconfig.json

`build` ist absichtlich ebenfalls ein Emissions-freier Compilerlauf:
`main` und `types` zeigen weiterhin auf `src`, die konsumierende
Next-App erzeugt den auslieferbaren Code. Ein `dist` waere damit ein
unbenutztes zweites Artefakt; der eigene Build-Vertrag prueft die
vollstaendige Paketquelle stattdessen direkt.

`[cmd]` Vormessung vor der Konfiguration: UI **16/16**, Shared
**10/10** Quelldateien (einschliesslich
`auth/admin-session.ts`) kompilieren mit den vorgesehenen Optionen
fehlerfrei. Danach:

| Nachweis | Ergebnis |
|---|---|
| `@lumeos/ui#typecheck` | Exit 0, 0 TypeScript-Fehler, 16 Quellen |
| `@lumeos/shared#typecheck` | Exit 0, 0 TypeScript-Fehler, 10 Quellen inklusive `auth/admin-session.ts` |
| `@lumeos/ui#build` | Exit 0, 0 TypeScript-Fehler |
| `@lumeos/shared#build` | Exit 0, 0 TypeScript-Fehler |
| Root-`tsc` | `jsx: preserve` gesetzt; Exit 0, 0 Fehler statt 486 |
| `pnpm gate` | Exit 0; **15** ausfuehrbare Turbo-Aufgaben statt vorher 11 |

Die verbleibenden drei `<NONEXISTENT>`-Aufgaben sind ausschliesslich
`nutrition-api#test`, `shared#test` und `ui#test`; sie sind keine
Build- oder Typecheck-Luecken mehr.

`[cmd]` Gegenprobe: Eine temporaere Datei in `packages/shared/src`
mit `const g308Probe: string = 1` liess den eigenen Shared-Check wie
gefordert mit Exit 2 und genau `TS2322` scheitern. Die Probe wurde
anschliessend entfernt.

Der Konfigurationsvertrag ist als Test in
`tools/g308-package-checks.test.mjs` gesichert: eigene Skripte,
vollstaendige `src`-Includes, `strict`, `noEmit` und JSX am UI- sowie
Root-tsconfig. Keine Quelldatei und nichts unter `apps/` wurde
geaendert.

## Abnahme

**2026-09-01, Orchestrator. Nachgemessen.**

`[cmd]` **`turbo run typecheck --dry-run` zeigt keine
`<NONEXISTENT>` mehr:**

    @lumeos/shared#typecheck   tsc --noEmit --project tsconfig...
    @lumeos/ui#typecheck       tsc --noEmit --project tsconfig...

`[cmd]` **Dasselbe bei `build`.** `[cmd]` **Der Gate fuehrt 15
ausfuehrbare Aufgaben statt 11.**

`[cmd]` **Root-`tsc`: Exit 0, 0 Fehler** — vorher 486.

### Die Zahlen stimmen

`[cmd]` **UI: 0 Fehler, 16 Dateien.** `[cmd]` **Shared: 0 Fehler, 10
Dateien — einschliesslich `auth/admin-session.ts`.**

`[read]` **Damit ist die Luecke geschlossen, die er in G-303 gefunden
hat:** die Datei war absichtlich kein Barrel-Export und wurde von der
transitiven Pruefung nicht erreicht. **Jetzt erfasst der
Paketvertrag sie.**

### Und die Gegenprobe ist gefahren

`[cmd]` **Eine absichtlich falsche Typzuweisung in Shared wurde mit
`TS2322` und Exit 2 gefangen, danach entfernt.**

`[read]` **Das ist der Teil, der zaehlt:** **ein Skript, das laeuft
und nichts findet, ist von einem, das nichts prueft, nicht zu
unterscheiden** — **ausser man baut einen Fehler ein.**

`[cmd]` **`jsx: preserve` im Root-`tsconfig`** — die zweite Haelfte
des Befunds, entschieden statt aufgegeben.

**Abgenommen.**

