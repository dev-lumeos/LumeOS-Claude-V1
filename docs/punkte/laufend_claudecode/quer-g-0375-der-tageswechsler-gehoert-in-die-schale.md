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

**Claude Code, 2026-09-08.** **Alle Nachweise auf
`test-user@lumeos.local`, im Browser, angemeldet.**

### A1 — wie viele Module zeigen den Wechsler?

**9 Module / 4 mit Wechsler / 5 ohne.**

    dashboard    JA    fuehrt datum seit G-152
    nutrition    JA    fuehrt es seit jeher
    goals        JA    angeschlossen (A5)
    training     JA    angeschlossen (A5)

    supplements  nein  Tag wird entgegengenommen, aber die Anzeige
                       folgt dem juengsten Protokolltag — gemessen
    recovery     nein  fuehrt keinen Tag, Lesewege kennen keinen
    medical      nein  fuehrt keinen Tag
    coach        nein  fuehrt keinen Tag
    settings     nein  fuehrt keinen Tag

### A2 — blaettern aendert die Anzeige, je Modul

**Der Wechsler selbst, in allen vier:**

    dashboard    ,,Heute" -> ,,Mo., 7. Sept. 2026"   datum=2026-09-07
    nutrition    ,,Heute" -> ,,Mo., 7. Sept. 2026"   datum=2026-09-07
    goals        ,,Heute" -> ,,Mo., 7. Sept. 2026"   datum=2026-09-07
    training     ,,Heute" -> ,,Mo., 7. Sept. 2026"   datum=2026-09-07

**Und der INHALT folgt — das ist die eigentliche Frage:**

    dashboard    heute ,,Alle Zahlen fuer den 8.9."
                 15.8. ,,Alle Zahlen fuer den 15.8."
    goals        heute ,,Stand 2026-09-08"
                 15.8. ,,Stand 2026-08-15"
    training     heute 2026-08-23
                 15.8. 2026-08-16
    nutrition    06.09. ,,39 von 138"
                 08.09. ,,0 von 0"

`[read]` **Bei Nutrition musste ich einen Tag MIT Daten waehlen** —
`test-user` hat am 08.09. und am 15.08. keine Mahlzeit, beide Tage
saehen gleich leer aus. **Eine Probe an zwei leeren Tagen haette
nichts bewiesen.**

### A3 — Modulwechsel danach

**Der Tag bleibt.**

    Tagebuch gestern    tab=diary&datum=2026-09-07    2026-08-16
    Dashboard danach    datum=2026-09-07
    Tagebuch zurueck    datum=2026-09-07              2026-08-16

`[read]` **G-17 traegt weiter** — `V2Link` haengt das Datum an, der
Wechsler setzt es.

### A4 — E-69: Referenz unter der Linie

**8 angebunden / 7 Referenzen — unveraendert.**

### A5 — die vier mit festem `heute()`

**3 angeschlossen / 1 nicht.**

**Angeschlossen — `goals`, `training`, und `supplements` teilweise:**

`[cmd]` **Alle drei rechneten `const stichtag = heute()`** und
reichten ihn bereits ueberall durch. **Sie nahmen ihn nur nicht
entgegen** — zwei Zeilen je Datei.

**NICHT angeschlossen — `recovery`, mit Grund:**

`[cmd]` **Seine drei Lesewege nehmen kein Datum:**
`ladeCheckins()`, `ladeScores()`, `ladeModalitaeten()` — **ohne
Parameter.** `[cmd]` **Sie laden die juengsten Zeilen**
(`heute: juengster ? …`).

`[read]` **Ein Anschluss waere Arbeit an drei Lesefunktionen**, nicht
an der Seite — **eigener Punkt, nicht in dieser Arbeit.**

**Und `supplements` traegt kein Merkmal, obwohl es den Tag
entgegennimmt:**

`[cmd]` **Gemessen am Schirm:** mit `?datum=2026-09-06` und mit
`?datum=2026-08-15` steht **beide Male 2026-09-06** da.

`[cmd]` **Die Ursache steht in `page.tsx:119`:** `bilanzTag` faellt
auf `daten.einnahmen[0].intake_date` zurueck — **der Reiter zeigt
bewusst den juengsten Protokolltag** (G-275).

`[read]` **Der Wechsler waere dort ein Regler ohne sichtbare
Wirkung** (C-426). **`stichtag` kommt an und geht an `ladeRegeln`,
aber nichts am Schirm folgt ihm.** **Merkmal wieder entfernt und der
Grund an der Stelle vermerkt** — statt es zu ueberdecken.

### A6 — Sabotageprobe

**Belegt.**

`[cmd]` **`data-fuehrt-tag="goals"` entfernt:**

    goals   Wechsler=0  Merkmal=0     ==  9 Module, 3 mit Wechsler

**Zurueckgedreht:**

    goals   Wechsler=1  Merkmal=1     ==  9 Module, 4 mit Wechsler

`[read]` **Und dieselbe Probe laeuft ohnehin fuenfmal mit:**
`recovery`, `medical`, `coach`, `settings` und `supplements` tragen
kein Merkmal — **und zeigen keinen Wechsler.**

### Der Weg

`[cmd]` **`Datumsnavigation` VERSCHOBEN, nicht nachgebaut** —
dieselben drei Knoepfe, dieselbe Bewegung, derselbe
,,Heute"-Zustand. **Zwei Aenderungen waren noetig:**

    /v2/nutrition fest   ->  pathname (er steht jetzt ueber mehreren)
    t('vorherigerTag')   ->  fester Text (der Namensraum ist
                             ,,Nutrition", die Schale gehoert keinem
                             Modul)

`[cmd]` **Nutrition hat seine eigene Navigation abgegeben** — sie
steht nicht zweimal da. **`Zukunftshinweis` bleibt dort**, den zeigt
nur Nutrition.

`[cmd]` **Nichts in `@lumeos/ui`** — `Topbar` kennt nur `actions`
rechts, und das Paket gehoert Admin und Coach mit (G-17). **Der
Wechsler steht als erstes im Inhaltsbereich**, direkt unter der
Kopfleiste — fuer das Auge dieselbe Stelle.

`[cmd]` **Und die Entscheidung liegt beim Modul:**
`data-fuehrt-tag` am Wurzelelement. **Die Schale liest es, statt es
zu wissen** — eine Liste in der Schale veraltet still, sobald ein
Modul einen Tag bekommt oder verliert.

### Pruefstand

    tsc --noEmit                gruen
    next lint                   gruen
    encoding-pruefen            20.944 Dateien, sauber
    pnpm --filter web test      1503 pass, 0 fail

### Geaendert

    app/v2/tageswechsler.tsx        NEU, der Wechsler der Schale
    app/v2/shell.tsx                haengt ihn ueber die Inhalte
    app/v2/nutrition/ansicht.tsx    gibt die eigene Navigation ab
    app/v2/dashboard/page.tsx       Merkmal
    app/v2/goals/page.tsx           Tag aus der Adresse + Merkmal
    app/v2/training/page.tsx        Tag aus der Adresse + Merkmal
    app/v2/supplements/page.tsx     Tag aus der Adresse, KEIN Merkmal

**Nichts in `@lumeos/ui`. Nichts in `supabase/`. Nichts geschrieben
— alle Messungen lesend. Nicht committet, nicht gestaget.**

## Abnahme

_(vom Orchestrator)_

## Auftrag 2 — in den Header, nicht darueber

**Beauftragt am 2026-09-08.**

Tom, 2026-09-08:

> der changer soll in den headerteil rein wie es vorher bei
> nutrition war und die actions die nun mittig sind zurueck nach
> rechts in diesem header. dann hat er die schoenen headers
> zerschossen

`[read]` **Der Orchestrator hat *,,oben in der Mitte"* als eigene
Zeile UEBER dem Header gelesen** — **gemeint war: IN den Header.**

### Was falsch ist

`[cmd]` **Bild 1, Nutrition:** **der Wechsler steht als eigener
Kasten ueber dem Modulkopf** — **und `Quick-add`, `Recalc macros`,
`Find food`, `MealCam` sind nach mittig gerutscht.**

`[cmd]` **Bild 2, Recovery:** **kein Wechsler, aber der Kopf ist
trotzdem anders als vorher.**

### Was richtig ist

    LINKS    Modulname, Untertitel, Kennzahlen
    MITTE    der Tageswechsler -- IM Kopf, nicht darueber
    RECHTS   die Aktionsknoepfe, wie vorher

`[read]` **So stand es bei Nutrition, bevor die Navigation
verschoben wurde** — **das ist die Vorlage.**

`[cmd]` **`git show` auf den Stand vor `b3bb6420` zeigt, wie der
Kopf aussah.**

### Und die Module ohne Tag

`[read]` **Wo kein Wechsler steht, bleibt der Kopf so, wie er
vorher war** — **die Mitte bleibt leer, die Aktionen rechts.**

`[cmd]` **Recovery, Medical, Coach, Settings, Supplements** —
**fuenf Module.**

### Abnahmebedingungen

    A1  je Modul ein Bildschirmfoto: Name links, Aktionen
        rechts. Zahl: 9 Module / davon richtig.
    A2  die vier mit Wechsler: er steht IM Kopf, mittig.
        Bildschirmfoto je Modul.
    A3  die fuenf ohne: der Kopf ist wie vor b3bb6420.
        Gegen `git show` verglichen, je Modul.
    A4  keine Aktionsknoepfe mittig. Zahl: geprueft / gefunden.
    A5  E-69: Referenz unter der Linie, unveraendert.

### Was nicht zu tun ist

**Nichts in `@lumeos/ui` aendern** — **deine eigene Lehre.**
`[read]` **Wenn der Kopf dort liegt: melden, nicht anfassen.**
Nicht committen, nicht stagen, nicht pushen.
