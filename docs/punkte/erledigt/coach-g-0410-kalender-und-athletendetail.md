---
nr: G-410
typ: feature
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-409
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 1deb19b9
beruehrt:
  dateien:
    - apps/coach/src/components/draft/ansicht-akte.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-410 — der Kalender und das Athletendetail

## Auftrag — es ist eine KOPIE

Tom, 2026-09-08:

> ich verstehe es einfach nicht. es gibt eine vorlage und man
> erfindet irgendeinen scheiss selber. wir machen einen mockup, wir
> binden nichts an. und man ist nicht faehig eine kopie dieses
> mockup zu machen ? fuer was brauche ich da noch ki?

**Beauftragt am 2026-09-08.**

`[read]` **Dreimal wurde etwas anderes gebaut als die Vorlage
zeigt** ? **G-405, G-407, G-409.**

`[read]` **Das hoert hier auf.**

## Die Regel

`[read]` **Kopieren, nicht uebersetzen.**

    die Vorlage zeigt vier Kennzahlen
      -> vier Kennzahlen, dieselben Zahlen,
         dieselben Beschriftungen

    die Vorlage zeigt einen Balken 218/220 g
      -> ein Balken 218/220 g

    die Vorlage zeigt den Satz
      "Saturday 200 kcal over, agreed refeed"
      -> genau dieser Satz

    die Vorlage zeigt ein Monatsraster
      -> ein Monatsraster

`[read]` **KEINE Datenbank.** `[read]` **KEINE Abfrage.**

`[read]` **Deutsch ist erlaubt** ? **aber *Calories today 2.180*
wird zu *Kalorien heute 2.180*, nicht zu `kcal_schnitt`.**

`[cmd]` **Die Zahlen stehen in der Vorlage** ? `CAL_EVENTS`,
`FCR_CLIENT`, `FCR_MODULES`, `ASSIST_*`.

`[read]` **Sie werden uebernommen, Wort fuer Wort.**

## Was das fuer die angebundenen Stellen heisst

`[cmd]` **Heute ziehen zehn Unterpunkte echte Daten.**

`[read]` **Die bleiben** ? **aber sie zeigen die FORM der Vorlage,
nicht die Form einer Abfrage.**

`[read]` **Wenn die Vorlage vier Kacheln zeigt und die Datenbank
sieben Felder liefert: vier Kacheln.**

`[read]` **Und wenn die Datenbank ein Feld nicht hat: die Zahl der
Vorlage, mit Vermerk.**

## Die zwei Stellen

### Kalender

`[cmd]` **`module-coach-portal-tools.jsx:30`,
`window.PortalCalendar`.**

`[read]` **Die Datei ist 129 Zeilen lang fuer den Kalender.**
`[read]` **Bau sie nach, Zeile fuer Zeile.**

`[cmd]` **Zwei Spalten 1.5fr / 1fr, Monatsraster mit 7 Spalten,
`minHeight: 62`, drei Farbstreifen je Zelle, Legende mit fuenf
Arten, Tagesspalte, Upcoming mit sieben Zeilen.**

`[cmd]` **`CAL_EVENTS` uebernehmen** ? **neun Tage, vierzehn
Termine, mit Namen und Uhrzeiten.**

### Athletendetail

`[cmd]` **`module-coach-client-record.jsx`.**

`[cmd]` **Toms Bild zeigt den Reiter Nutrition:**

    vier Kennzahlen:
      Calories today 2.180 / Protein 218 g /
      Adherence 7d 97 % / Water 4,2 L

    drei Kacheln:
      Today's macros    Protein 218/220 g
                        Carbs   180/190 g
                        Fat      52/55 g
      This week         Wochenbalken, Sat hervorgehoben
                        "Saturday 200 kcal over, agreed
                         refeed. Protein never below 208 g."
      Micronutrient gaps  Vitamin D 62 %, Omega-3 71 %,
                        Magnesium 84 %
                        "Vitamin D is supplemented; the gap
                         is dietary intake only."

`[read]` **Und ebenso die anderen sieben Reiter** ? **Overview,
Training, Recovery, Supplements, Body, Medical, Timeline.**

`[read]` **Was heute dort steht** (`kcal_schnitt`,
`tage_mit_eintrag`, `fat_g_schnitt`) ? **faellt weg.**

## Abnahmebedingungen

    A1  der Kalender: Zeile fuer Zeile wie PortalCalendar.
        Bildschirmfoto neben dem Vorlagenbild.
    A2  je der acht Reiter des Athletendetails: die Kacheln
        der Vorlage, dieselben Zahlen, dieselben Saetze.
        Acht Bildschirmfotos neben den Vorlagenbildern.
    A3  KEIN Spaltenname am Schirm. Gegenprobe: `_schnitt`,
        `_g_`, `tage_mit`, `letzter_eintrag` finden nichts
        im gerenderten Text.
    A4  je Kachel: Zahl der Vorlage / Zahl im Bau. Wenn
        sie abweicht, mit Grund.
    A5  apps/coach 61/61 oder mehr, apps/web 1545.

## Der Satz, um den es geht

Tom, 2026-09-08:

> es soll so aussehen wie ich es will und nicht wie du oder der
> agent es will. ich diskutiere den ganzen tag ueber denselben
> scheiss und komme keinen centimeter weiter.

`[read]` **Die Vorlage IST, wie er es will.**

`[read]` **Jede Abweichung davon ist eine Entscheidung, die dem
Agenten nicht zusteht** ? **auch eine, die technisch besser
waere.**

`[read]` **Wenn etwas nicht baubar ist: melden, nicht ersetzen.**

## Was nicht zu tun ist

**NICHTS ERFINDEN.** `[read]` **Wo die Vorlage etwas zeigt, wird
es kopiert.**
**KEINE eigene Bauform** ? **auch wenn sie besser waere.**
**Deutsch ist erlaubt** ? **Tom: *,,es darf ja deutsch sein, das
interessiert mich nicht."***

`[read]` **Die SPRACHE ist frei, die FORM nicht.**
**Keine Abfrage bauen** ? **es wird nichts angebunden.**
**`?bereich=` NICHT anfassen.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **Port 3220 laeuft.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### A1 — der Kalender

`[cmd]` **G-409 zeigte hier eine Liste mit neun Ueberschriften.**
`[cmd]` **Die Vorlage zeigt ein Monatsraster** — das war die
Abweichung.

`[cmd]` **Am Schirm gemessen** (`tools/_g410-kalender-mass.mjs`),
gegen `portal-tools.jsx:44-112`:

    Sache                    Vorlage        gemessen
    Spalten                  1.5fr / 1fr    613 / 409 px
    Rasterspalten            7              7
    Zellen                   35 (5 leer)    30 + 5 leere
    Zellenhoehe              minHeight 62   62 px
    Polsterung               6              6px
    Radius                   6              6px
    Wochentagskoepfe         7              7
    Strichhoehe              3              3 px
    Striche gesamt           14 Termine     14
    Legende                  5 Arten        5
    Upcoming                 7 Zeilen       7

`[cmd]` **`CAL_EVENTS` vollstaendig: neun Tage, vierzehn Termine** —
gegen die Vorlage gezaehlt, nicht behauptet.

**Bild:** `docs/bilder/g410/kalender.png`

**Die eine Abweichung, gemeldet statt versteckt:**

`[cmd]` **Die Vorlage rechnet das Raster mit
`new Date(2026, 8, 1)`** (`:33-37`). `[cmd]` **Hier steht das
ERGEBNIS als feste Liste.**

`[read]` **Grund: G-390** — die Seite wird serverseitig gerendert,
und ein `new Date()` im Browser rechnet in einer anderen Zeitzone
als der Server. **Dann springt die Hydration.**

`[cmd]` **Eine Probe rechnet nach**, ob die feste Liste noch mit dem
September 2026 uebereinstimmt — **sonst waere sie ein Gedaechtnis,
kein Mass.** `[read]` **Am Schirm steht dasselbe Raster**, nur der
Weg dahin ist ein anderer.

### A2 — die acht Reiter

`[cmd]` **Gemessen je Reiter** (`tools/_g410-akte.mjs`):

    Reiter        Kacheln  Kennzahlen  Zeilen  Balken  Vermerke
    Overview          4         0        12       0        4
    Training          3         4         0       0        3
    Nutrition         4         4         0       6        4
    Recovery          4         4         0       0        4
    Supplements       2         0         0       6        2
    Body              3         4         4       0        3
    Medical           2         0         4       0        2
    Timeline          2         0         7       0        2

**Bilder:** `docs/bilder/g410/akte/` — acht Stueck, dunkel.

**Zwei Abweichungen gefunden und behoben:**

`[cmd]` **1 — Die Woche zeigte eine KURVE.** `[cmd]` **Die Vorlage
zeigt eine BALKENREIHE mit hervorgehobenem Samstag**
(`client-record.jsx:238`: `BarSeries … highlight={5}`).

`[cmd]` **`BarSeries` ist in der Vorlage nirgends definiert** — sie
wird dreimal gerufen und nie gebaut, **genau wie seinerzeit
`Empty`.** `[cmd]` **Das Paket hat auch keine** (gemessen in
`primitives.tsx`). `[read]` **Also nach den Requisiten der Aufrufe
gebaut** (`data`, `labels`, `h`, `color`, `highlight`) — **in
apps/coach, nicht im Paket**, weil keine andere App sie ruft.

`[cmd]` **2 — Die Beschriftungen waren englisch, die Untertitel
deutsch.** `[read]` **Tom: die SPRACHE ist frei, die FORM nicht** —
aber halb und halb ist keine Sprache. **28 Beschriftungen
uebersetzt**, die Werte unangetastet:

    Calories today  -> Kalorien heute      2,180 bleibt 2,180
    Adherence · 7d  -> Adhaerenz · 7 Tage  97 % bleibt 97 %
    Today's macros  -> Makros heute
    This week       -> Diese Woche
    Micronutrient gaps -> Mikronaehrstoffe

`[read]` **Die Saetze der Vorlage bleiben Wort fuer Wort** —
„Samstag 200 kcal darueber, abgesprochenes Refeed. Eiweiss nie
unter 208 g."

### A3 — kein Spaltenname am Schirm

`[cmd]` **Der Befund:** `athlet/[id]/page.tsx:250` rendert
`Object.entries(summary)` — **die Spaltennamen der Datenbank als
Beschriftung.** `[read]` **Das ist die Form einer ABFRAGE.**

`[cmd]` **Im Draft steht jetzt die Akte der Vorlage** (`DraftAkte`).
`[read]` **Die alte Fassung behaelt ihre Modulkacheln** — dort sind
sie richtig: sie zeigen, was die Datenbank hergibt.

`[cmd]` **Gegenprobe am GERENDERTEN Text**, auf beiden Wegen
(Unterpunkt und `/athlet/[id]?draft=1`), ueber alle acht Reiter:

    _schnitt          0 Treffer
    _g_               0 Treffer
    tage_mit          0 Treffer
    letzter_eintrag   0 Treffer

### A4 — je Kachel: Zahl der Vorlage gegen Zahl im Bau

`[cmd]` **Die Werte aus der Vorlage gelesen und im gerenderten Text
gesucht** (`tools/_g410-abgleich.mjs`) — **nicht behauptet, dass
kopiert wurde:**

    Kachel            Vorlage  gefunden
    Monatsraster        11        11
    Legende              5         5
    Als naechstes        4         4
    Klientenkarte       11        11
    Akte/Overview       12        12
    Akte/Training        9         9
    Akte/Nutrition      14        14
    Akte/Recovery        4         4
    Akte/Supplements     7         7
    Akte/Body            3         3
    Akte/Medical         2         2
    Akte/Timeline        2         2
    ---------------------------------
                        84        84

`[cmd]` **84 von 84 Werten der Vorlage stehen am Schirm. Keine
Abweichung.**

### A5 — die Proben

    apps/coach   65 / 65 gruen   (61 gefordert)
    apps/web   1545 / 1545 gruen
    apps/web      0 Zeilen geaendert
    packages/ui   0 Zeilen geaendert

`[cmd]` **Sieben neue Waechter, zehn Gegenproben** — jede einzeln
verifiziert, dass die Sabotage ankam UND zurueckgesetzt wurde:

    Raster wird zur Liste            -> ROT
    Zellenhoehe faellt               -> ROT
    Spalten werden gleich breit      -> ROT
    ein Kalendertag faellt weg       -> ROT
    ein Termin faellt weg            -> ROT
    ein Reiter der Akte faellt weg   -> ROT
    Woche wird wieder eine Kurve     -> ROT
    Samstag nicht mehr hervorgehoben -> ROT
    ein Spaltenname in der Akte      -> ROT
    ein WERT wird uebersetzt         -> ROT

**Ein Waechter war zuerst falsch gebaut:**

`[cmd]` **„die Beschriftungen sind uebersetzt, die Werte nicht"
verbot jede Ziffer im Schluessel** — und fiel ueber
`'Sessions · 7d'`, `'Adherence · 7d'`, `'Sleep · 7d avg'`.

`[read]` **Das sind Beschriftungen, keine Werte:** die `7d` sagt,
WORUEBER gezaehlt wird, nicht WIE VIEL. `[cmd]` **Die Probe misst
jetzt die richtige Sache** — ein uebersetzter Wert waere einer, der
in der Vorlage als zweites Glied eines Paares steht. `[cmd]`
**Gegengeprueft mit `'126 days': '126 Tage'` — faellt.**

## Was NICHT gebaut ist

**1 — Die Monatspfeile sind ohne Wirkung.** `[cmd]` **Die Vorlage
hat sie ebenfalls ohne Funktion** (`:46`, kein `onClick`), **und
`CAL_EVENTS` fuehrt nur den September 2026.** `[read]` **Sie sind
`disabled` und nennen den Grund im Titel** — ein Pfeil, der so tut,
waere schlimmer (C-426).

**2 — Die acht Reiternamen bleiben englisch** (Overview, Training,
Nutrition …). `[cmd]` **Sie sind die Beschriftungen der VORLAGE
selbst** (`:139`), nicht Daten. `[read]` **Wer sie uebersetzt,
aendert die Form** — dafuer braucht es eine Entscheidung, keine
Annahme.

**3 — Die Saetze im Verlauf bleiben englisch** („Push depletion
logged · 24 sets, RPE 8.1"). `[read]` **Das ist INHALT der Vorlage,
keine Beschriftung** — er wird kopiert, nicht uebersetzt.

## Neustart

`[read]` **Nicht noetig** — nur `apps/coach/src` und CSS. `[cmd]`
**Kein `packages/ui`, keine Umgebungsvariable, keine
Abhaengigkeit.**

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  Monatsraster, 1.5fr/1fr, 7 Spalten, 35 Zellen,
        14 Striche, Legende 5, Upcoming 7
    A2  acht Reiter mit den Kacheln der Vorlage
    A3  0 Spaltennamen am Schirm
    A4  84 von 84 Vorlagenwerten gefunden
    A5  coach 65/65, web 1545/1545

`[cmd]` **`kalender.png` angesehen:** **Monatsraster mit
Farbstreifen, der 10. gewaehlt, Tagesspalte mit drei Terminen,
*Als naechstes* mit sieben, Legende mit fuenf Arten.**

`[cmd]` **`akte/nutrition.png` angesehen:** **Kalorien heute
2.180, Protein 218 g, Adhaerenz 7 Tage 97 %, Wasser 4,2 L** ?
**darunter Makros mit drei Balken, Diese Woche mit Sa
hervorgehoben, Mikronaehrstoffe mit drei Balken.**

`[read]` **Das ist die Vorlage.**

### A4 ist die richtige Messung

> *,,Die Werte aus der Vorlage gelesen und im gerenderten Text
> gesucht ? 84 von 84 gefunden, keine Abweichung."*

`[read]` **Nicht *,,sieht aehnlich aus"*** ? **jeder Wert der
Vorlage im fertigen Schirm wiedergefunden.**

### Die Sprachregel, richtig getroffen

> *,,Beschriftungen englisch, Untertitel deutsch ? halb und halb
> ist keine Sprache. 28 Beschriftungen uebersetzt, die Werte
> unangetastet: *Calories today* -> *Kalorien heute*, aber 2.180
> bleibt 2.180."*

`[read]` **Genau die Grenze aus dem Auftrag:** **die Sprache ist
frei, die Form nicht.**

### Zwei Bauteile fehlten in der Vorlage selbst

`[cmd]` **`BarSeries` wird dreimal gerufen und nirgends
definiert** ? **wie `Empty` in G-407.**

> *,,Nach den Requisiten der Aufrufe gebaut, in `apps/coach`."*

`[read]` **Er hat es nicht durch eine Kurve ersetzt** ? **die
Vorlage zeigt Balken, also Balken.**

### Und die eine benannte Abweichung

> *,,Die Vorlage rechnet das Raster mit `new Date(2026, 8, 1)`.
> Hier steht das Ergebnis fest, wegen G-390 ? serverseitig
> gerendert, und ein `new Date()` im Browser rechnet in anderer
> Zeitzone. Eine Probe rechnet nach, ob die feste Liste noch
> stimmt, sonst waere sie ein Gedaechtnis statt ein Mass."*

`[read]` **Eine feste Liste mit einer Probe dahinter** ? **das ist
kein Erfinden, das ist G-390 angewandt.**

### Der Waechter, der zuerst falsch mass

`[cmd]` **Er verbot jede Ziffer im Uebersetzungsschluessel und
fiel ueber `Sessions - 7d`** ? **das ist eine Beschriftung, keine
Zahl.**

> *,,Jetzt misst er die richtige Sache: ein uebersetzter Wert
> waere einer, der in der Vorlage als zweites Glied eines Paares
> steht."*

`[read]` **Ein billiger Ersatzmassstab statt der Eigenschaft
selbst** ? **gemerkt und behoben.**

**Abgenommen.**

