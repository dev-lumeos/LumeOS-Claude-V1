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
erledigt: 2026-09-08
commit: 84bb575f
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

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  9 / 9 richtig. Nutrition von -221 px auf -21 px
    A2  4 / 4 im Kopf, per header.contains geprueft
    A3  5 / 5 wie vor b3bb6420, data-fuehrt-tag entfernt
    A4  9 geprueft / 0 mit mittigen Aktionen
    A5  7 Referenzen, unveraendert
        gemeinsames Bauteil: machbar, ~80 Zeilen

`[cmd]` **Selbst nachgemessen: 8 von 9 mit `hero-lite`, 4 mit
`data-tageswechsler`, `data-fuehrt-tag` restlos weg.**

### Der Portal-Weg loest, was ich falsch beauftragt hatte

`[read]` **Ich schrieb *,,oben in der Mitte"* und meinte eine Zeile
darueber** — **Tom meinte: im Kopf.**

`[cmd]` **Seine Loesung: das Modul stellt den Platz
(`data-tageswechsler`), die Schale fuellt ihn.**

`[read]` **Der Kopf bleibt beim Modul, der Wechsler bei der
Schale** — **und keiner doppelt den anderen.**

### Und er hat den echten Grund gefunden

`[cmd]` **Nutritions Aktionen standen bei -221 px** — **das
Dreispaltenraster reservierte Platz fuer eine leere Mitte.**

`[read]` **Nicht der Wechsler hatte sie verschoben, sondern die
Luecke, die er hinterliess.**

`[cmd]` **Jetzt -21 px, wie in allen Modulen mit Aktionen.**

### Meine Klasse war falsch, sein Befund richtig

`[cmd]` **Ich nannte `.v2-module`** — **die Kastenform kommt von
`.v2-module-hero-lite`.**

`[read]` **Er hat es berichtigt und trotzdem gebaut, was gemeint
war.**

### Eine Abweichung, die er offenlegt statt vergraebt

`[cmd]` **`module-recovery-v2.jsx:18` und `module-medical-v2.jsx:16`
lassen `hero-lite` bewusst weg** — **und `recovery/ansicht.tsx`
hatte das als Absicht vermerkt.**

`[read]` **Tom hat am Schirm anders entschieden.** `[cmd]` **Er ist
gefolgt und hat es in beiden Dateien vermerkt.**

`[read]` **E-70: das Mockup ist Referenzobjekt, kein SSOT** —
**eine begruendete Abweichung ist erlaubt, eine stille nicht.**

`[read]` **Und seine Beobachtung trifft:** *,,Die Vorlage ist hier
uneinheitlich, der gebaute Stand ist es nicht mehr."*

### A3 fuer settings — nicht erfunden

`[cmd]` **`git show b3bb6420^`: weder `v2-module` noch
`v2-module-header`.** `[cmd]` **`v2-wahl-titel`, eine eigene
Form.**

`[read]` **Es hatte nie einen** — **gemessen, nicht angenommen.**

### A5 — die Kosten der Drift

`[cmd]` **11 Kopfbloecke, rund 523 Zeilen, alle setzen dieselben
vier bis fuenf Teile zusammen.**

> *,,Genau deshalb driften sie ? elf Stellen, an denen man eine
> Klasse vergessen kann, und es ist zweimal passiert."*

`[cmd]` **Aufwand: ~80 Zeilen fuer das Bauteil, 30-45 je Modul
ersetzt, 9 Bildvergleiche.** `[cmd]` **In `apps/web`, nicht
`packages/ui`.**

**Als Entscheidung fuer Tom.**

**Abgenommen.**


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

## Gemessen am 2026-09-08 — die Koepfe sind uneinheitlich

Tom: *,,alle module checken, da hat es mehr die nicht mehr richtig
sind oder gar keine headerbox mehr haben."*

`[cmd]` **Der Orchestrator hat nachgemessen. Er hat recht.**

### Die Klasse macht den Kasten

`[cmd]` **`v2.css:391`:**

    .v2-module-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 20px;
    }

`[read]` **Keine Kastenform** — **die kommt von `.v2-module`.**

### Wer welche traegt

    coach          v2-module-header v2-module
    dashboard      v2-module-header v2-module
    goals          v2-module-header v2-module
    nutrition      v2-module-header v2-module
    supplements    v2-module-header v2-module
    training       v2-module-header v2-module
    ------------------------------------------
    medical        v2-module-header          <- ohne Kasten
    recovery       v2-module-header          <- ohne Kasten
    settings       v2-wahl-titel             <- gar keiner

`[cmd]` **Das ist genau, was Tom auf dem Recovery-Bild sieht:
keine Kopfbox.**

`[read]` **Und der Modulkopf hat kein gemeinsames Bauteil** —
**jedes Modul baut ihn selbst.** `[cmd]` **`Topbar` in
`packages/ui` ist die obere Leiste mit Synced und Hell/Dunkel,
nicht der Modulkopf.**

## Auftrag 3 — alle neun Koepfe

**Beauftragt am 2026-09-08.**

`[read]` **Zusaetzlich zu Auftrag 2** (Wechsler in den Kopf,
Aktionen rechts).

### Was zu tun ist

`[read]` **`medical` und `recovery` bekommen `v2-module`
dazu** — **dann haben sie ihren Kasten zurueck.**

`[read]` **`settings` messen:** **hat es je einen Kopf gehabt?**
`[cmd]` **`git show` vor `b3bb6420`.** `[read]` **Wenn nein: melden,
nicht erfinden.**

### Und die Frage dahinter

`[read]` **Jedes Modul baut seinen Kopf selbst** — **deshalb driften
sie auseinander.**

`[read]` **Miss, ob ein gemeinsames Bauteil moeglich waere, und was
es kosten wuerde** — **nicht bauen.**

`[cmd]` **Es duerfte in `apps/web` liegen, nicht in
`packages/ui`** — **deine eigene Lehre aus G-17.**

### Abnahmebedingungen

    A1  9 Module / davon mit Kasten / davon ohne, mit Grund.
        Je Modul ein Bildschirmfoto.
    A2  medical und recovery: Kasten vorher/nachher, belegt.
    A3  settings: hatte es je einen? Gemessen gegen git show.
    A4  Aktionen rechts, Wechsler mittig IM Kopf.
        Zahl: 9 / davon richtig.
    A5  ein gemeinsames Bauteil: moeglich? Mit Aufwand, nicht
        gebaut.


## Nachtrag — Berichtigung und Kopfform

**Claude Code, 2026-09-08.** **Nachweise auf
`test-user@lumeos.local`.**

**Tom:** *,,der changer soll in den headerteil rein wie es vorher bei
nutrition war und die actions die nun mittig sind zurueck nach rechts
in diesem header. dann hat er die schoenen headers zerschossen"*

`[read]` **Er hat recht, und der Fehler war meiner:** ich habe
*,,oben in der Mitte"* als eigene Zeile UEBER dem Kopf gelesen.
**Gemeint war: IN den Kopf**, wie es bei Nutrition stand.

### Was gemessen war

`[cmd]` **Vorher, am Schirm:**

    nutrition    Aktionsknoepfe 221 px vom rechten Rand
    uebrige       Aktionsknoepfe  21 px
    alle neun    wechslerImKopf = false

`[cmd]` **Der Grund:** die Dreispaltenregel aus `nutrition.css`
(G-73) blieb stehen, aber die Mittelspalte war leer — das Raster
reservierte Platz fuer etwas, das nicht mehr da war.

### Der Weg zurueck — und warum kein Nachbau

`[cmd]` **Das Modul stellt den Platz, die Schale fuellt ihn:**

    Modul    <div className="v2-kopf-mitte" data-tageswechsler />
    Schale   createPortal(<Wechsler/>, platz)

`[read]` **Der Kopf gehoert dem Modul, der Wechsler der Schale** —
**und keiner baut den anderen nach.** Ein zweiter Wechsler je Modul
waere dieselbe Dublette, die G-375 vermeiden sollte.

`[cmd]` **Die Dreispaltenregel ist aus `nutrition.css` nach
`app/v2/kopf.css` gewandert** — verallgemeinert ueber
`:has(> [data-tageswechsler])`, **nicht neu erfunden.** Die dortigen
Messungen (71 px Abweichung bei `flex: 1`, Ueberlappung bei absoluter
Position) gelten weiter und stehen im Kopf der Datei.

### A1 — Name links, Aktionen rechts

**9 Module / 9 richtig.**

`[cmd]` **Alle Aktionsknoepfe stehen bei −21 px vom rechten Rand**
(dashboard und settings fuehren keine).

    dashboard   grid   Wechsler im Kopf
    nutrition   grid   Wechsler im Kopf   Aktionen −21 (war −221)
    goals       grid   Wechsler im Kopf   Aktionen −21
    training    grid   Wechsler im Kopf   Aktionen −21
    supplements flex   kein Wechsler      Aktionen −21
    recovery    flex   kein Wechsler      Aktionen −21
    medical     flex   kein Wechsler      Aktionen −21
    coach       flex   kein Wechsler      Aktionen −21
    settings    block  eigener Titel, keine Aktionen

### A2 — die vier mit Wechsler: IM Kopf

**4 / 4.** `[cmd]` **`wechslerImKopf = true`** — gemessen ueber
`header.contains(datumsfeld)`, nicht am Augenschein.

`[cmd]` **Bildschirmfoto Nutrition:** Titel links, `‹ Heute ›`
mittig im Kasten, Quick-add / Recalc macros / Find food / MealCam
rechts. **Der schwebende Kasten darueber ist weg.**

### A3 — die fuenf ohne: wie vor `b3bb6420`

**5 / 5.** `[cmd]` **Gegen `git show b3bb6420^` verglichen** —
keines der fuenf hatte dort eine Mitte, und keines hat jetzt eine.
**Die G-375-Merkmale (`data-fuehrt-tag`) sind aus allen Dateien
wieder entfernt.**

### A4 — keine Aktionsknoepfe mittig

**9 geprueft / 0 gefunden.**

### A5 — E-69: Referenz unter der Linie

**8 angebunden / 7 Referenzen — unveraendert.**

## Nachtrag 2 — die Kastenform

### A1 — wie viele Module haben einen Kasten

**9 Module / 8 mit Kasten / 1 ohne.**

`[cmd]` **Die Kastenform kommt NICHT von `.v2-module`**, wie im
Auftrag vermutet, **sondern von `.v2-module-hero-lite`**
(`v2.css:1136`): Rahmen, Radius, Verlauf, Innenabstand.
**`.v2-module-header` allein ist nur ein Flex mit Abstand** — das
stimmt.

### A2 — medical und recovery

**vorher: kein Kasten. nachher: Kasten.**

    medical    v2-module-header                       -> + hero-lite
    recovery   v2-module-header                       -> + hero-lite

**Und eine Abweichung, die ich melde statt sie zu verschweigen:**

`[cmd]` **Beide Mockups machen es ohne Kasten** —
`module-recovery-v2.jsx:18` und `module-medical-v2.jsx:16` benutzen
`module-header` ohne `hero-lite`. `[cmd]` **In `recovery/ansicht.tsx`
stand das sogar als Begruendung:** *,,Die Vorlage benutzt hier
`module-header` OHNE `module-hero-lite` — uebernommen wie sie
ist."*

`[read]` **Die Vorlage ist an dieser Stelle uneinheitlich, der
gebaute Stand ist es jetzt nicht mehr.** **Tom hat es gemessen und
entschieden** — der Vermerk steht an beiden Stellen im Quelltext.

### A3 — settings: hatte es je einen Kasten?

**Nein.** `[cmd]` **`git show b3bb6420^:.../settings/page.tsx` fuehrt
weder `v2-module` noch `v2-module-header`** — settings baut seinen
Titel ueber `v2-wahl-titel`, eine eigene Bauform.

`[read]` **Nicht erfunden**, wie beauftragt.

### A4 — Aktionen rechts, Wechsler mittig im Kopf

**9 / 9.** Siehe A1 und A2 oben.

### A5 — ein gemeinsames Bauteil: moeglich?

**Ja, und der Aufwand ist gemessen.**

`[cmd]` **11 Kopfbloecke, rund 523 Zeilen**, ueber neun Module und
zwei Entwurfsfassungen:

    coach/ai            83   Titel, Pill, Untertitel, Aktionen
    coach               47   Titel, Pill, Untertitel, Aktionen
    dashboard-echt      47   Titel, Pill, Untertitel, Mitte
    dashboard/entwurf   46   Titel, Pill, Untertitel, Aktionen
    goals               45   Titel, Pill, Untertitel, Aktionen, Mitte
    nutrition           45   Titel, Pill, Untertitel, Aktionen, Mitte
    medical             44   Titel, Pill
    settings            45   eigene Bauform
    supplements         42   Titel, Pill, Untertitel, Aktionen
    training            41   Titel, Pill, Untertitel, Aktionen, Mitte
    recovery            38   Titel, Pill, Untertitel

`[read]` **Alle bauen dieselben vier bis fuenf Teile** — Titel,
Marke, Untertitel, Mitte, Aktionen. **Genau deshalb driften sie:**
elf Stellen, an denen jemand eine Klasse vergessen kann, und zweimal
ist es passiert.

**Was ein Bauteil kosten wuerde:**

    Bauteil schreiben               ~80 Zeilen, apps/web/src/app/v2/
    9 Module umstellen              je 30-45 Zeilen ersetzen
    2 Entwurfsfassungen             dito
    settings                        eigene Bauform, bliebe aussen vor
    Nachweis                        je Modul ein Foto, 9 Vergleiche

`[read]` **Es gehoert nach `apps/web`, nicht nach `packages/ui`** —
Admin und Coach nutzen das Paket mit, und der Modulkopf mit
Tageswechsler ist eine Sache dieser Anwendung (G-17).

`[read]` **Der Nutzen ist nicht die Zeilenzahl, sondern die eine
Stelle:** heute muss ein Kopfmerkmal elfmal richtig gesetzt werden.

**Nicht gebaut** — wie beauftragt.

### Pruefstand

    tsc --noEmit                gruen
    next lint                   gruen
    pnpm --filter web test      1503 pass, 0 fail

### Geaendert

    app/v2/tageswechsler.tsx        rendert per Portal in den Kopf
    app/v2/kopf.css                 NEU, die Dreispaltenregel
    app/v2/layout.tsx               bindet sie ein
    app/v2/shell.tsx                Kommentar berichtigt
    nutrition/ansicht.tsx           Platz zurueck im Kopf
    dashboard/dashboard-echt.tsx    Platz im Kopf
    goals/ansicht.tsx               Platz im Kopf
    training/ansicht.tsx            Platz im Kopf
    medical/ansicht.tsx             hero-lite
    recovery/ansicht.tsx            hero-lite, mit Vermerk

**Nichts in `@lumeos/ui`. Nichts in `supabase/`. Nicht committet.**
