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
erledigt: 2026-09-01
commit: OFFEN
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

## Bericht — 2026-09-01, Codex

`[cmd]` `pnpm --filter @lumeos/web exec tsc --noEmit
--listFilesOnly` endet mit 0 und bindet **alle 16 von 16** Dateien
unter `packages/ui/src` ein. `web#typecheck` prueft UI damit heute
tatsaechlich transitiv, weil seine Pfade direkt auf `packages/ui/src`
zeigen.

`[cmd]` Fuer Shared sind es nur **9 von 10**: nicht eingebunden ist
`packages/shared/src/auth/admin-session.ts`. Die Datei ist absichtlich
kein Barrel-Export und wird von keinem `apps/web`-Import erreicht.
Damit ist der Befund nicht „nirgends“, sondern: UI vollstaendig und
Shared teilweise werden als Nebenwirkung eines einzelnen Verbrauchers
geprueft. Das ist kein Paketvertrag und entfaellt, sobald der Import
verschwindet oder ein nicht exportierter Pfad betroffen ist.

`[cmd]` Die Turbo-Dry-Run-Ausgabe nennt fuer beide Pakete bei
`typecheck` **und** `build` jeweils `<NONEXISTENT>`. Der Gate hat
daher weiterhin keine eigene `@lumeos/ui`- oder `@lumeos/shared`-
Pruefung. Eine Gate-11/11-Meldung ist fuer diese beiden Aufgaben kein
Nachweis.

`[cmd]` Das Root-`tsconfig.json` hat weiter kein `jsx`; `pnpm exec
tsc --noEmit --pretty false` endet mit Code 2 und **486** Fehlern,
alle `TS17004`/`TS6142` aus UI-JSX. Die ersten UI-Quelldateien kamen
mit `f0140ef7` am 2026-08-15; das Root-tsconfig besteht seit
2026-04-23. Der globale Lauf ist deshalb kein brauchbarer Ersatz.

**Folgerung:** Der Gate soll eigene Skripte/tsconfigs der zwei Pakete
ausfuehren; die heutige transitive Abdeckung darf dabei hoechstens
eine zusaetzliche Gegenprobe sein. Nicht gebaut — dies ist der
Messbefund.

## Abnahme

**2026-09-01, Orchestrator.**

### Die Antwort ist praeziser als meine Frage

`[cmd]` **`web#typecheck` bindet alle 16 von 16 Dateien unter
`packages/ui/src` ein** — die Pfade zeigen direkt darauf.

`[cmd]` **Bei Shared sind es 9 von 10:** `auth/admin-session.ts`
fehlt, **absichtlich kein Barrel-Export, von keinem
`apps/web`-Import erreicht.**

`[read]` **Damit ist mein *,,nirgends geprueft"* zu scharf gewesen.**
`[read]` **Und seine Fassung trifft es:** *,,UI vollstaendig und
Shared teilweise werden als Nebenwirkung eines einzelnen Verbrauchers
geprueft. Das ist kein Paketvertrag und entfaellt, sobald der Import
verschwindet."*

### Der Rest steht

`[cmd]` **Beide Pakete melden `<NONEXISTENT>` fuer `typecheck` und
`build`.** `[read]` **Eine Gate-11/11-Meldung ist fuer diese beiden
kein Nachweis.**

`[cmd]` **Root-`tsconfig` ohne `jsx`: 486 Fehler, alle `TS17004` und
`TS6142` aus UI-JSX.** `[cmd]` **Die ersten UI-Dateien kamen am
2026-08-15, das Root-tsconfig steht seit dem 2026-04-23.**

`[read]` **Seine Folgerung ist die richtige:** eigene Skripte fuer
beide Pakete, **und die heutige transitive Abdeckung hoechstens als
zusaetzliche Gegenprobe.**

### C-371, C-374, C-375 — eingespielt

`[cmd]` **`recipes.source`, `buddy` in `plan_origin`,
`darf_weiterverkaufen` an beiden Tabellen — alle live.**

`[cmd]` **Migration
`20260901090000_c371_recipe_source_plan_origin_buddy.sql`.**

`[read]` **Der Weg ist richtig:** `supabase/README.md` sagt seit dem
05.08., **Strukturaenderungen entstehen als Migration und, wo sie zur
Kette gehoeren, als Pipeline-Schritt.**

`[cmd]` **Keine RLS- und keine Schreibwegaenderung, Sicherung vorher.**

**Abgenommen.** **Der Bau der Paketskripte geht als G-308.**
