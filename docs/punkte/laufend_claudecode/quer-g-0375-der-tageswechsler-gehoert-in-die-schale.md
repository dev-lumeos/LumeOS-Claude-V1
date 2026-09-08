---
nr: G-375
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-17
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/shell.tsx
zahlen:
  gemessen: 2026-09-08
  module: 9
  mit_datum: 2
---

# G-375 — der Tageswechsler gehoert in die Schale

## Befund

Tom, 2026-09-08:

> und wenn es nur in nutrition im header den datumswechsel gibt ist
> das verwirrend, denn niemand liest oben diesen kleinen hinweis.
> also denke ich die beste variante ist den daychanger in jedem
> modul oben in der mitte zu haben

`[cmd]` **G-17 hat das Datum zum Mitreisen gebracht** — **aber
steuern kann man es nur in Nutrition.**

`[read]` **Wer im Dashboard steht und gestern sehen will, muss nach
Nutrition wechseln, dort blaettern und zurueckgehen.**

`[read]` **Ein Datum, das mitreist, aber nur an einer Stelle
steuerbar ist, ist eine halbe Sache.**

## Was gemessen ist

`[cmd]` **`datum` je Modul:**

    nutrition    200    fuehrt den Tag
    dashboard     15    fuehrt ihn seit G-152
    supplements   15
    medical       10
    goals          8
    training       6
    settings       3
    coach          1
    recovery       0

`[cmd]` **`Datumsnavigation` ist bereits eine eigene Komponente,
126 Zeilen** — **mit `Zukunftshinweis`.**

`[cmd]` **Und `V2Shell` ist der Ort, an den sie gehoert** —
**derselbe, an dem `V2Link` das Datum anhaengt.**

## Was dagegen spricht, und wie es zu loesen ist

`[cmd]` **`recovery` traegt kein einziges `datum`, `coach` eines,
`settings` drei.**

`[read]` **Ein Tageswechsler ueber einem Modul, das keinen Tag
kennt, waere ein Regler ohne Wirkung** — **dasselbe Muster wie die
Autonomieachsen ohne Erlaubnisliste** (C-426).

`[read]` **Also: in der Schale, aber nur wo das Modul einen Tag
fuehrt.**

`[read]` **Und die Entscheidung, welches Modul einen fuehrt, gehoert
ins Modul** — **nicht in eine Liste in der Schale.**

## Auftrag

**Beauftragt am 2026-09-08.**

### Der Ort

`[cmd]` **Oben in der Mitte, in jedem Modul, das einen Tag
fuehrt.**

`[read]` **`Datumsnavigation` verschieben, nicht nachbauen** — **sie
kann schon blaettern und warnt vor der Zukunft.**

### Die Bedingung

`[read]` **Ein Modul sagt selbst, ob es einen Tag fuehrt.**

`[read]` **Wo es keinen fuehrt, erscheint kein Wechsler** — **nicht
ein ausgegrauter.**

### Und die vier mit festem `heute()`

`[cmd]` **goals, supplements, training, recovery rechnen mit einem
festen `heute()`** — **sie wuerden den Wechsler zeigen und
ignorieren.**

`[read]` **Miss, welche davon in dieser Arbeit anschliessbar sind**
— **und melde die, die es nicht sind.**

### Abnahmebedingungen

**Miss jede einzeln, schreib die Zahl in den Bericht.**

    A1  wie viele Module zeigen den Wechsler? Zahl: 9 / davon
        mit Wechsler / davon ohne, mit Grund.
    A2  je Modul mit Wechsler: blaettern aendert die Anzeige.
        Vorher/nachher belegt, je Modul.
    A3  Modulwechsel danach: der Tag bleibt. Belegt.
    A4  E-69: Referenz unter der Linie, unveraendert.
        Zahl: angebunden / Referenzen.
    A5  die vier mit festem heute(): welche angeschlossen,
        welche nicht, je mit Grund.
    A6  Sabotageprobe: der Wechsler in einem Modul ohne Tag
        erscheint NICHT. Belegt.

### Was nicht zu tun ist

**Nichts in `@lumeos/ui` aendern** — **Admin und Coach nutzen es
mit** (deine eigene Lehre aus G-17).
**Nichts in `supabase/`** — **Codex arbeitet an C-429.**
**Nachweise auf `test-user@lumeos.local`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **Bei `hasStartTime` im Log: nur `.next/cache/webpack`
loeschen** (A-73).

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
