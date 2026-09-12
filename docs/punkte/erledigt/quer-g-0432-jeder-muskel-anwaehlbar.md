---
nr: G-432
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-431
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 10ff0c83
beruehrt:
  dateien:
    - packages/ui/src/koerperkarte-pfade.ts
zahlen:
  gemessen: 2026-09-08
  pfade: 160
---

# G-432 — jeder gezeichnete Muskel ist anwaehlbar

## Toms Auftrag, woertlich

Tom, 2026-09-08:

> 1. schauen was die grafik an einzelmuskeln hergibt
> 2. online anatomie analysieren und matchen
> 3. muskelgruppen definieren und childs zuweisen
> 4. auf der grafik muss jeder angezeigte muskel anwaehlbar sein
>    (nicht die gruppe)
> 5. die details zeigen die zugehoerigkeit
> 6. per muscle detail bildet alle muskelgruppen und deren childs
>    ab

## Warum es bisher schieflief

`[read]` **Der Orchestrator hat bei Schritt 4 angefangen** ?
**ohne 1 bis 3.**

`[cmd]` **Und mit einer falschen Regel:** *,,triceps hat drei
Koepfe und bleibt EIN Muskel"* (G-425) ? **anatomisch falsch,
dreimal weitergereicht.**

`[read]` **Die Frage war nie *,,ist das ein Muskel?"*** ?
**sondern *,,welchen Muskel zeigt dieser Pfad?"*.**

## Schritt 1 — was die Grafik hergibt

`[cmd]` **160 Pfade in 28 Flaechen.**

`[cmd]` **`docs/bilder/g431/`: 38 Einzelbilder, 13 Tafeln** ?
**fuer zwoelf Flaechen.**

`[read]` **Die anderen sechzehn sind nicht einzeln fotografiert**
? **`chest`, `biceps`, `deltoids`, `trapezius`, `obliques`,
`tibialis`, `knees` und die Rueckenflaechen aus G-430.**

`[read]` **Je Pfad ein Bild, bis alle 160 einen Namen haben.**

`[read]` **Wo ein Pfad KEINEN eigenen Muskel zeigt** (Segment,
Sehne, Schattierung) ? **das wird so benannt.**

## Schritt 2 — Anatomie abgleichen

`[read]` **Je Pfad: welcher Muskel ist das anatomisch?**

`[cmd]` **`training.muscle_groups` fuehrt 95 Namen in vier
Ebenen** ? **das ist die Namensquelle.**

`[cmd]` **Beispiele, gemessen:**

    Legs > Quadriceps  > Rectus Femoris
    Legs > Hamstrings  > Biceps Femoris
                       > Semimembranosus
                       > Semitendinosus
    Legs > Glutes      > Gluteus Maximus / Medius / Minimus
    Legs > Lower Legs  > Calves / Anterior Tibialis /
                         Tibialis Posterior / Peroneals
    Arms > Triceps
    Back > Latissimus dorsi / Rhomboids / Teres Major /
           Trapezius / Erector spinae

`[read]` **Wo die Grafik einen Muskel zeigt, den
`muscle_groups` NICHT fuehrt** ? **melden.**

`[read]` **Wo `muscle_groups` einen fuehrt, den die Grafik nicht
zeigt** ? **auch melden.**

`[read]` **Nichts erfinden, in beide Richtungen.**

## Schritt 3 — Gruppen und Kinder

`[read]` **Die Hierarchie steht in `muscle_groups`** ? **sie wird
uebernommen, nicht neu erfunden.**

`[cmd]` **`public.koerperflaechen` traegt heute 59 Zeilen plus
die fuenf aus C-479** ? **Ebene 1 Wurzel, 2 Flaeche, 3
Seite.**

`[read]` **Eine vierte Ebene kann noetig werden:** **Wurzel >
Gruppe > Muskel > Seite.**

`[cmd]` **Das ist Codex** ? **melden, nicht bauen.**

## Schritt 4 — jeder Muskel anwaehlbar

Tom: *,,jeder angezeigte muskel anwaehlbar (NICHT die gruppe)."*

`[read]` **Ein Klick trifft den MUSKEL, nicht seine Gruppe.**

`[cmd]` **Heute faerbt ein Klick auf `latissimus` drei Flaechen**
(G-430: `["latissimus","teres-major","teres-minor"]`) ? **das
ist die Gruppe.**

`[read]` **Nach dem Umbau: ein Klick auf den Latissimus faerbt
den Latissimus.**

## Schritt 5 — das Detail zeigt die Zugehoerigkeit

`[read]` **Wer einen Muskel waehlt, sieht, zu welcher Gruppe er
gehoert.**

    Latissimus dorsi
    gehoert zu: Ruecken

## Schritt 6 — Per-muscle detail bildet alles ab

Tom: *,,bildet ALLE muskelgruppen und deren childs ab."*

`[read]` **Nicht eine Liste der gefaerbten Flaechen** ? **die
vollstaendige Hierarchie.**

    Ruecken
      Latissimus dorsi      Wert
      Trapezius             Wert
      Rhomboiden            (nicht gezeichnet)
      Teres major           Wert
    Beine
      Quadriceps
        Rectus femoris      Wert
      Hamstrings
        Biceps femoris      Wert
        Semitendinosus      Wert

`[read]` **Was nicht gezeichnet ist, steht als Luecke drin** ?
**nicht weggelassen.**

## Abnahmebedingungen

    A1  alle 160 Pfade benannt. TABELLE: Pfad, Bild,
        Muskel, muscle_groups-Name.
    A2  wo kein eigener Muskel: als Segment/Sehne/
        Schattierung benannt.
    A3  Grafik ohne muscle_groups-Namen: gemeldet.
        muscle_groups ohne Grafik: gemeldet.
    A4  jeder gezeichnete Muskel einzeln anwaehlbar.
        Foto: Klick auf Latissimus faerbt NUR ihn.
    A5  das Detail zeigt die Gruppe. Foto.
    A6  Per-muscle detail zeigt die vollstaendige
        Hierarchie, Luecken eingeschlossen. Foto.
    A7  braucht koerperflaechen eine vierte Ebene?
        Gemeldet, nicht gebaut.
    A8  vier Module unveraendert, je ein Foto.
    A9  apps/web 1642 oder mehr, apps/coach 65.

## Was nicht zu tun ist

**Keinen Pfad neu zeichnen.**
**Keinen Muskelnamen erfinden** ? **`muscle_groups` ist die
Quelle.**
**Nichts in `supabase/`** ? **C-481 liegt bei Codex.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### Zuerst: die Regel war falsch, und sie ist berichtigt

`[read]` **Bevor ein Pfad benannt werden kann, muss die Regel
stimmen.** `[cmd]` **G-425 formulierte** *,,EIN Muskel, mehrere
Pfade -> zusammenlassen"*, **begruendet mit** *,,triceps hat drei
Koepfe und bleibt EIN Muskel"*.

`[cmd]` **Berichtigt an vier Stellen:** `docs/ssot/104-muskelkarte.md`
(Warnhinweis in der Urteilstabelle plus ein eigener Abschnitt),
**und die Punktdateien G-425, C-468, G-431** je mit einem
Berichtigungsblock.

`[read]` **Die Urteile bleiben gueltig, die Begruendungen nicht** ?
**der Pruefstein traegt sie: fuehrt `muscle_groups` einen Namen?**

`[cmd]` **`triceps` ist der Fall, an dem man es sieht:** **`Arms >
Triceps` ist ein BLATT, ohne Kinder.** **Das Urteil war richtig, aus
dem falschen Grund** ? nicht weil ein Muskel mit Koepfen ein Muskel
bleibt, sondern **weil die drei Koepfe keinen Namen haben.**

### A1 — alle Pfade benannt

**EINE BERICHTIGUNG AM AUFTRAG:** `[cmd]` **Es sind 158 Pfade, nicht
160.** **Zweimal unabhaengig gezaehlt** ? ueber die Bloecke
(`_g431-zaehlen.mjs`) und ueber die Zeichenketten direkt. **Alle 158
verschieden.**

`[cmd]` **40 Flaeche/Ansicht-Paare, je mit Tafel** ? **die 16
fehlenden wurden nachgezeichnet** (`chest`, `biceps`, `deltoids`,
`trapezius`, `obliques`, `tibialis`, `knees`, die neun
Rueckenflaechen, `hands`, `ankles`, `feet`, `head`, `hair`).

`[cmd]` **`apps/web/src/lib/koerper/pfadnamen.ts` traegt sie, und
`tools/_g432-pfadtabelle.mjs` prueft sie gegen die Karte:**

    Karte:   40 Paare, 158 Pfade
    Tabelle: 40 Paare, 158 Pfade
    DIE TABELLE STIMMT.

**Die Tabelle, verdichtet** (je Zeile: Flaeche/Ansicht, Pfade, Art,
`muscle_groups`-Name, was im Bild steht):

    chest/front        2  seite    Chest
    abs/front          8  segment  Abdominals     2x4-Raster, EINE Platte
    obliques/front    16  segment  Obliques       acht Keile je Flanke
    biceps/front       2  seite    Biceps
    triceps/front      2  seite    Triceps
    triceps/back       6  segment  Triceps        drei Koepfe je Arm
    forearm/front      6  segment  Forearms       Beugerseite
    forearm/back       8  segment  Forearms       Streckerseite
    deltoids/front     2  seite    Deltoids
    deltoids/back      2  seite    Deltoids
    neck/front         5  segment  Neck Muscles   zwei Straenge + Kehle
    neck/back          2  seite    Neck Muscles
    trapezius/front    2  seite    Trapezius
    trapezius/back     2  seite    Trapezius
    latissimus/back    2  seite    latissimus dorsi
    teres-major/back   2  seite    Teres Major
    teres-minor/back   2  seite    Teres Minor
    erector-spinae     2  seite    erector spinae
    flanke/back        2  seite    (KEIN NAME)
    quadriceps/front   6  segment  Quadriceps     Masse + zwei Raender
    adductors/front    6  segment  Adductors      drei Streifen je Seite
    adductors/back     2  seite    Adductors
    tibialis/front     2  seite    Tibialis
    calves/front       4  segment  Calves
    calves/back        8  segment  Calves         zwei Baeuche + zwei Sehnen
    biceps-femoris     4  segment  Biceps Femoris
    semitendinosus     4  segment  Semitendinosus
    gluteus-maximus    2  seite    Gluteus Maximus
    gluteus-medius     2  seite    Gluteus Medius
    knees/front        4  umriss   (Knochen)
    hands front/back  23  umriss   (Finger)
    ankles front/back  6  umriss   (Gelenk)
    feet front/back    6  umriss   (Umriss)
    head front/back    2  umriss   (fester Hautton)
    hair front/back    2  umriss   (fester Ton)

### A2 — wo kein eigener Muskel: benannt

`[cmd]` **Je Pfadgruppe eine ART**, und ein Waechter prueft, dass
jede eine Begruendung aus dem Bild traegt:

    seite         46 Pfade   derselbe Muskel, andere Haelfte
    segment       67 Pfade   Teil EINES Muskels ohne eigenen Namen
    umriss        45 Pfade   Figur, kein Muskel

`[read]` **`segment` ist der grosse Posten** ? **Muskelkoepfe
(`triceps` 6, `calves` 8), Bauchsegmente (`abs` 8), Zackenmuster
(`obliques` 16), Schattierungsstreifen (`forearm` 14).** **Keiner
von ihnen hat einen eigenen Namen in `muscle_groups`.**

### A3 — der Abgleich, in beide Richtungen

`[cmd]` **Grafik OHNE `muscle_groups`-Namen: EINER.**

    flanke/back    2 Pfade
                   weder `Quadratus Lumborum` noch `Flank`
                   noch `Obliquus externus` stehen in der Tabelle

`[cmd]` **`muscle_groups` OHNE Grafik: 74 von 95.** **Nach
Elternteil geordnet, die groessten:**

    Legs               9   Hamstrings, Lower Legs, Glutes, Hips …
    Forearm Flexors    8   Flexor Carpi Radialis, Grip Muscles …
    Lower Legs         7   Anterior Tibialis, Peroneals …
    (Wurzeln)          5   Back, Core, Arms, Legs, Shoulders
    Forearm Extensors  5   Extensor Carpi Radialis …
    Adductors          5   adductor brevis, longus, magnus …

`[read]` **21 von 95 sind gezeichnet** ? **das steht jetzt im
Detail, je Name.**

### A4 — jeder Muskel einzeln anwaehlbar

`[cmd]` **Am Schirm gemessen** (`tools/_g432-anwaehlbar.mjs`):

    vor dem Klick                []
    Klick auf latissimus         ["latissimus"]          1
    Klick auf chest              ["chest"]               1
    Klick auf gluteus-maximus    ["gluteus-maximus"]     1
    Klick auf quadriceps         ["quadriceps"]          1
    Klick auf teres-major        ["teres-major"]         1

`[cmd]` **Vorher waren es DREI** ? `flaechenFuer('upper_back')` gab
`["latissimus","teres-major","teres-minor"]`.

`[read]` **Der Wert haengt weiter am Kuerzel** (Recovery misst den
oberen Ruecken als eine Gruppe), **die Hervorhebung am geklickten
Muskel.**

**Bild:** `docs/bilder/g432/a4-latissimus.png` ? **nur der
Latissimus ist umrandet, seine Nachbarn nicht.**

**EIN BEFUND AUS DER PROBE SELBST:** `[cmd]` **Der erste Klick auf
`teres-major` traf NICHT** ? `elementFromPoint` **in der Mitte des
Kastens lieferte `svg`, keine Flaeche.** `[read]` **Der Muskel ist
eine SICHEL, und die Mitte ihrer Bounding-Box liegt neben der
Form.** `[cmd]` **Mit einem Punkt AUF der Form: `["teres-major"]`.**
`[read]` **Ein Fehler der Probe, nicht des Baus** ? **aber er haette
als *,,Muskel nicht anwaehlbar"* durchgehen koennen.**

### A5 — das Detail zeigt die Zugehoerigkeit

**Bild:** `docs/bilder/g432/a5-a6-detail.png`

    ZUGEHOERIGKEIT · TRAINING.MUSCLE_GROUPS
      latissimus dorsi   gehoert zu:  Back
      Teres Major        gehoert zu:  Back
      Teres Minor        gehoert zu:  Shoulders

`[cmd]` **`Teres Minor` gehoert zu `Shoulders`, nicht zu `Back`** ?
**er haengt an der Rotatorenmanschette.** `[read]` **Die
Zugehoerigkeit kommt aus der Datenbank, nicht aus der Nachbarschaft
auf der Karte.**

### A6 — die vollstaendige Hierarchie, Luecken eingeschlossen

**Am Schirm:**

    ALLE MUSKELGRUPPEN · 21 VON 95 GEZEICHNET · 74 LUECKEN

      Arms  (nicht gezeichnet)
        Biceps                        1/3
          Brachialis  (nicht gezeichnet)
        …

`[cmd]` **74 mal *,,(nicht gezeichnet)"*** ? **gezaehlt am Schirm,
nicht behauptet.**

**EIN FEHLER, DEN DIE SCHIRMPROBE GEFUNDEN HAT:** `[cmd]` **Die
erste Fassung meldete *,,95 von 95 gezeichnet, 0 Luecken"*.**
`[read]` **Ursache: ich nahm `MUSKEL_ZU_FLAECHE`** ? **jene
Abbildung legt JEDEN der 96 Namen auf eine Flaeche**, auch
`Rhomboids`, der nicht gezeichnet ist. **Sie beantwortet die Frage
*,,welche Flaeche faerbt der Wert dieses Muskels"*, nicht *,,ist er
gezeichnet"*.**

`[cmd]` **Die richtige Quelle ist `EBENEN`** ? je Flaeche der
Muskel, den sie WIRKLICH zeigt. **Danach: 21 von 95.**

### A7 — braucht `koerperflaechen` eine vierte Ebene? JA

`[cmd]` **Gemessen:** `public.koerperflaechen` **hat drei Ebenen**
(Wurzel, Flaeche, Seite: 8 / 26 / 34).

`[cmd]` **ZEHN gezeichnete Flaechen stehen in `muscle_groups` auf
Ebene 3 oder tiefer:**

    calves            Legs > Lower Legs > Calves
    tibialis          Legs > Lower Legs > Tibialis
    trapezius         Back > Upper Back > Trapezius
    teres-major       Back > Upper Back > Teres Major
    teres-minor       Shoulders > Rotator Cuff > Teres Minor
    erector-spinae    Back > Lower Back > erector spinae
    gluteus-maximus   Legs > Glutes > Gluteus Maximus
    gluteus-medius    Legs > Glutes > Gluteus Medius
    biceps-femoris    Legs > Hamstrings > Biceps Femoris
    semitendinosus    Legs > Hamstrings > Semitendinosus

`[read]` **Die fehlende Ebene ist die GRUPPE zwischen Wurzel und
Flaeche** ? `Lower Legs`, `Upper Back`, `Glutes`, `Hamstrings`,
`Rotator Cuff`. **Wurzel > Gruppe > Muskel > Seite.**

`[cmd]` **GEMELDET, NICHT GEBAUT** ? das ist Codex.

### A8 — die vier Module unveraendert

    Modul         Kacheln  Zeichen  Kartenflaechen  Fehler
    ---------------------------------------------------------
    recovery          17    5.712        28            0
    supplements       14    6.605        28            0
    medical           11    4.724         0            0
    coach             13    5.124         0            0

`[cmd]` **Identisch zu den G-431-Zahlen.** **Bilder:**
`docs/bilder/g432/a8-*.png`

### A9 — die Proben

    apps/web    1660 / 1660 gruen   (1642 gefordert)
    apps/coach    65 / 65 gruen
    tsc         EXIT 0

`[cmd]` **18 neue Waechter** ? `g432-ebenen.test.ts` (9),
`g432-muskelbaum.test.ts` (8), plus einer in `g431-modal.test.ts`.

### Die Gegenprobe: ZWOELF Sabotagen, alle ROT

    ein erfundener Muskelname (Vastus Lateralis)      ROT
    quadriceps gilt wieder als einzelner Muskel       ROT
    calves verliert seine Gruppe `Lower Legs`         ROT
    eine Gruppe verliert ihren Grund                  ROT
    ein Umriss bekommt einen Muskelnamen              ROT
    die Pfadsumme stimmt nicht mehr                   ROT
    ein Umriss traegt ploetzlich einen Namen          ROT
    eine Begruendung aus dem Bild faellt weg          ROT
    der Baum laesst die Luecken weg                   ROT
    die Zugehoerigkeit nennt den Elternteil           ROT
    die Tiefensperre im Baum faellt weg               ROT
    der Klick waehlt wieder die GRUPPE                ROT

**ZWEI WAECHTER WAREN BLIND** ? **und das ist der Grund, warum die
Gegenprobe laeuft:**

`[cmd]` **1 ? Die Tiefensperre.** **Die Zyklusprobe blieb gruen bei
`ebene >= 100000`** ? **ein Zyklus zwischen zwei Knoten endet von
selbst**, weil keiner eine Wurzel ist und `baueBaum` nur von Wurzeln
startet. `[read]` **Die Sperre wirkt auf die TIEFE** ? **jetzt
misst die Probe eine KETTE von zwoelf Ebenen und erwartet genau
sechs.** **Dieselbe Lehre wie in G-430, zum zweiten Mal.**

`[cmd]` **2 ? Der Klick.** **Die Sabotage *,,der Klick waehlt wieder
die GRUPPE"* kam durch** ? **die Schirmprobe faengt sie, aber keine
Probe im Gate.** `[read]` **Jetzt prueft ein Waechter die
Entscheidung im Quelltext, in beide Richtungen: `setSelFlaeche([id])`
muss da sein, die alte Fassung darf NICHT zurueck sein.**

## Ein Befund am Rande

`[cmd]` **Meine Berichtigungen an der SSOT und den drei Punktdateien
sind waehrend der Arbeit von aussen committet worden** (`76451abb`,
*,,punkte: C-479 abgenommen"*). `[cmd]` **Inhalt geprueft: alle vier
Berichtigungen stehen.**

## Was NICHT gebaut wurde

**1 ? Die vierte Ebene in `koerperflaechen`.** `[read]` **A7 sagt
melden, nicht bauen** ? und `supabase/` ist gesperrt.

**2 ? Die vier fehlenden Zeilen fuer `gluteus-*`, `biceps-femoris`,
`semitendinosus`.** `[cmd]` **C-479 hat die fuenf aus G-430
geliefert** ? **fuer diese vier greift weiter `AUS_AUFTEILUNG`, und
das Modal schreibt es hin.**

**3 ? Kein Pfad neu gezeichnet, kein Muskelname erfunden.**
`[cmd]` **Ein Waechter prueft jeden Namen gegen
`107_muscle_groups_hierarchy.sql`**, und ein zweiter nennt die drei
Vastus ausdruecklich.

**4 ? Nichts in `supabase/`.** `[cmd]` **`git status supabase/` ist
leer.**

**5 ? Nicht committet, nicht gestaged.**

## Neustart

`[cmd]` **NICHT noetig** ? nur `apps/web/src`. `[cmd]`
**`packages/ui` wurde in dieser Runde nicht angefasst.**

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  158 Pfade, 40 Flaeche/Ansicht-Paare
    A2  46 seite, 67 segment, 45 umriss
    A3  1 Grafik ohne Namen, 74 Namen ohne Grafik
    A4  Klick auf latissimus -> nur latissimus
    A5  "gehoert zu: Back"
    A6  21 von 95 gezeichnet, 74 Luecken
    A7  vierte Ebene noetig, gemeldet
    A9  1660/1660, 65/65

`[cmd]` **Seine Werkzeuge selbst laufen lassen:**

    _g432-pfadtabelle.mjs   "Karte: 40 Paare, 158 Pfade.
                             Tabelle: 40, 158. STIMMT."
    _g432-pruefen.mjs       "ALLE EINTRAEGE STIMMEN.
                             Grafik OHNE Namen: 1 (flanke)
                             muscle_groups OHNE Grafik: 74"

`[cmd]` **`104-muskelkarte.md`: die falsche Regel ist raus.**

### Die 160 waren meine Zahl, die 158 sind richtig

`[cmd]` **Ich zaehlte Zeichenketten (`"M`), sein Werkzeug parst
die Struktur.**

`[read]` **Meine Abschnittsgrenze war zu weit** ? **zum zweiten
Mal heute habe ich Treffer gezaehlt statt Sachen.**

### Der Kern: die Regel war richtig, der Grund falsch

> *,,`triceps` ist der Fall, an dem man es sieht: `Arms > Triceps`
> ist ein Blatt. Das Urteil war richtig, aus dem falschen Grund ?
> nicht weil ein Muskel mit Koepfen ein Muskel bleibt, sondern
> weil die KOEPFE KEINEN NAMEN haben."*

`[read]` **Das ist der Pruefstein, den ich gesucht und nicht
gefunden hatte.**

### A5/A6 — die erste Fassung log

> *,,Die erste Fassung meldete *95 von 95, 0 Luecken* ? ich hatte
> `MUSKEL_ZU_FLAECHE` genommen, die eine ANDERE FRAGE
> beantwortet."*

`[cmd]` **Die Tabelle sagt *,,welche Flaeche faerbt dieser
Muskel"*** ? **nicht *,,ist er gezeichnet"*.**

`[read]` **Eine gruene Zahl aus der falschen Quelle** ? **er hat
es selbst gefunden.**

### A4 — die Probe log, nicht der Bau

> *,,Der erste `teres-major`-Klick traf nicht, weil die
> Bounding-Box-Mitte einer SICHEL neben der Form liegt ? Fehler
> der Probe, haette aber als *nicht anwaehlbar* durchgehen
> koennen."*

`[read]` **Eine konkave Form hat ihren Mittelpunkt ausserhalb.**

### A7 ist mit Zahlen beantwortet

> *,,Ja, eine vierte Ebene wird gebraucht: ZEHN gezeichnete
> Flaechen stehen auf `muscle_groups`-Ebene 3+; es fehlt die
> Gruppe zwischen Wurzel und Flaeche."*

`[read]` **Gemeldet, nicht gebaut** ? **das ist C-482.**

### Und mein Commit hat seine Arbeit mitgenommen

`[cmd]` **`76451abb` (*,,punkte: C-479 abgenommen"*) enthaelt
vier G-432-Bilder und seine SSOT-Berichtigungen.**

`[read]` **Mein `git add -A docs/` hat sie erfasst, waehrend er
arbeitete** ? **der Inhalt ist geprueft und unversehrt, aber der
Commit traegt den falschen Namen.**

**Abgenommen.**

