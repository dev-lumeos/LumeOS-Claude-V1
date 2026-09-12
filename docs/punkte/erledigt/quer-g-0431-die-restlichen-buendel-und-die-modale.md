---
nr: G-431
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-430
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 741638c3
beruehrt:
  dateien:
    - packages/ui/src/koerperkarte-pfade.ts
zahlen:
  gemessen: 2026-09-08
  buendel: 14
---

# G-431 — die restlichen Buendel und die Modale

## Toms Befund

Tom, 2026-09-08, nach G-430:

> Muscle recovery: sehe ich nun latissimus/teres major/teres minor,
> aber alle anderen bundles wurden nicht freigeloest wie
> calves/quadriceps/adductors/abs/forearm/obliques/neck/triceps/
> hamstrings.

> Per-muscle detail: werden die alten gelistet, da will ich das
> parent/child konzept sehen, sowie die einzelnen modals
> angepasst ? sprich wenn gruppe, wird im modal aufgeschluesselt,
> und wenn child, dann nur dieses.

## Was gemessen ist

`[cmd]` **VIERZEHN Flaechen mit mehr als zwei Pfaden je
Ansicht:**

    obliques      front 16
    hands         front 12  back 11
    abs           front  8
    hamstring     front  8
    calves        front  4  back  8
    forearm       front  6  back  8
    triceps       front  2  back  6
    adductors     front  6  back  2
    quadriceps    front  6
    neck          front  5  back  2
    gluteal       front  4
    knees         front  4
    ankles        front  4  back  2
    feet          front  4  back  2

`[read]` **G-430 hat NUR den Ruecken aufgeteilt** ? **fuenf
Flaechen aus zwei.**

## Die Regel aus G-425 gilt weiter

    EIN Muskel, mehrere Pfade     zusammenlassen
    Spiegelpaare                  links/rechts trennen
    VERSCHIEDENE Muskeln          aufteilen

`[cmd]` **G-425 hat `triceps` geprueft:** **acht Pfade, EIN
Muskel mit drei Koepfen** ? **zusammenlassen.**

`[cmd]` **Und C-468 hat `obliques` geprueft:** **sechzehn Pfade,
EIN Muskel je Seite plus sieben Zeichenteile** ? **der Internus
liegt darunter und wird nicht gezeichnet.**

`[read]` **Zwei der vierzehn sind also schon entschieden.**

`[read]` **Die anderen zwoelf sind UNGEPRUEFT.**

## Was anatomisch zu erwarten ist

`[read]` **Nicht als Vorgabe, als Anhaltspunkt** ? **das Bild
entscheidet:**

    quadriceps    vier Koepfe, aber EIN Muskel
                  (rectus femoris, vastus lateralis/
                   medialis/intermedius)
    hamstring     DREI Muskeln je Seite
                  (biceps femoris, semitendinosus,
                   semimembranosus)
    calves        ZWEI je Seite
                  (gastrocnemius, soleus)
    adductors     mehrere (longus, magnus, brevis)
    forearm       Beuger und Strecker -- zwei Gruppen
    neck          Sternocleidomastoideus, Trapezius-Anteil
    abs           rectus abdominis -- EIN Muskel,
                  die Segmente sind Sehnenzwischenstuecke
    hands/feet/
    ankles/knees  Umriss, kein Muskel (art='umriss')

`[cmd]` **`training.muscle_groups` fuehrt sie:** `Biceps Femoris`,
`Gluteus Maximus/Medius/Minimus`, `Forearm Extensors`,
`Forearm Flexors`, `Hip Adductors`.

`[read]` **Die Namen stehen** ? **sie muessen nicht erfunden
werden.**

## Teil 2: die Modale

Tom: *,,wenn gruppe, wird im modal aufgeschluesselt, und wenn
child, dann nur dieses."*

`[read]` **Ein Klick auf `Back` zeigt im Modal die Kinder mit je
ihrem Wert.**

`[read]` **Ein Klick auf `latissimus` zeigt nur ihn.**

`[cmd]` **G-430 hat das Detail gebaut** (`hierarchie.ts`,
`hierarchie-read.ts`) ? **die Modale nicht.**

## Teil 3: Per-muscle detail listet die alten

Tom: *,,werden die alten gelistet."*

`[cmd]` **Miss, WORAUS die Liste kommt** ? **aus
`MUSKEL_ZU_FLAECHE` oder aus `koerperflaechen`?**

`[read]` **G-430 hat die Handliste bewusst behalten** ? **60 von
96 Namen erreichen die Tabelle.**

`[read]` **Aber die LISTE sollte die Hierarchie zeigen, auch wenn
die Farbe aus der Handliste kommt.**

## Abnahmebedingungen

    A1  je der zwoelf ungeprueften Flaechen: ein Bild
        je Pfad, wie in G-425. Welcher Muskel?
    A2  aufgeteilt oder zusammengelassen, je mit
        Begruendung aus dem Bild. TABELLE.
    A3  Umriss-Flaechen (hands, feet, ankles, knees)
        als art='umriss' behandelt, nicht aufgeteilt.
    A4  die Modale: Gruppe -> aufgeschluesselt,
        Kind -> nur dieses. Zwei Fotos.
    A5  Per-muscle detail zeigt die Hierarchie.
        Foto vorher/nachher.
    A6  was NICHT gezeichnet ist, bleibt Luecke.
    A7  vier Module unveraendert, je ein Foto.
    A8  apps/web 1631 oder mehr, apps/coach 65.

## Was nicht zu tun ist

**Keinen Pfad neu zeichnen.**
**Keinen Muskelnamen erfinden** ? **`training.muscle_groups`
fuehrt 95.**
**Nichts in `supabase/`** ? **C-479 liegt bei Codex.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### A1 — zwoelf Flaechen, je Pfad ein Bild

`[cmd]` **Zuerst selbst nachgezaehlt** (`tools/_g431-zaehlen.mjs`) ?
**die vierzehn stimmen.** `[cmd]` **Zwei Berichtigungen am Auftrag:**
`hamstring` **steht in der RUECKansicht** (nicht front), **und**
`gluteal` **ebenso** ? beide waren als `front` gelistet.

`[cmd]` **38 Einzelbilder plus 13 Tafeln** in `docs/bilder/g431/`:

    tafel-<flaeche>-<ansicht>.png   alle Pfade nebeneinander,
                                    je eine eigene Farbe
    <flaeche>-<ansicht>-<n>.png     ein Pfad hervorgehoben

`[read]` **Die Tafel war noetig, weil die Frage ein VERGLEICH ist** ?
*,,ist Pfad 3 ein anderer Muskel als Pfad 1?"* **laesst sich an einem
Einzelbild nicht beantworten.**

### A2 — aufgeteilt oder zusammengelassen

    Flaeche      Pfade  Urteil      Begruendung AUS DEM BILD
    ---------------------------------------------------------------
    gluteal        4    GETEILT     grosse Masse + kleine Kappe oben
                                    aussen -> Maximus und Medius
    hamstring      8    GETEILT     je Seite ZWEI breite Straenge
                                    nebeneinander -> Biceps femoris
                                    aussen, Semitendinosus innen
    quadriceps     6    zusammen    EINE grosse Masse mit zwei
                                    schmalen Raendern -- vier Koepfe,
                                    ein Muskel
    calves         8    zusammen    zwei Baeuche nebeneinander plus
                                    zwei Sehnenlaeufer -- der
                                    Gastrocnemius hat zwei Koepfe
    adductors      6    zusammen    drei ueberlappende Streifen aus
                                    der Leiste -- EINE Gruppe
    forearm        8    zusammen    Beuger vorne, Strecker hinten --
                                    die Ansicht trennt sie schon
    abs            8    zusammen    2x4-Raster auf EINER Platte --
                                    Sehnenzwischenstuecke
    neck           5    zusammen    zwei Straenge je Seite, am
                                    Brustbein zusammenlaufend
    knees          4    zusammen    Umriss, kein Muskel
    hands         12    zusammen    Umriss, kein Muskel
    ankles         4    zusammen    Umriss, kein Muskel
    feet           4    zusammen    Umriss, kein Muskel

`[read]` **Zwei von zwoelf geteilt.** `[read]` **Die Regel aus G-425
hat gehalten** ? **und `quadriceps` ist der Fall, an dem man sie
sieht:** vier Koepfe, aber am Bild EINE Masse mit zwei Raendern.
**Wer ihn teilt, teilt einen Muskel.**

`[cmd]` **158 Pfade vor und nach G-431** ? **keiner erzeugt, keiner
verloren.** **Ein Waechter zaehlt sie.**

### A3 — die Umriss-Flaechen

`[cmd]` **Gemessen: sie waren es schon.** `EINORDNUNG` **fuehrt
`hands`, `feet`, `ankles`, `knees` (plus `head`, `hair`) als
`nicht-muskel`**, `OHNE_FARBE` **listet dieselben sechs, und kein
Muskelname zeigt auf sie.**

`[read]` **Nichts zu bauen** ? **ein bestehender Waechter haelt es
fest, und ein neuer prueft zusaetzlich, dass ihre Pfadzahl sich
nicht aendert.**

### A4 — die Modale: Gruppe gegen Kind

`[cmd]` **Am Schirm gemessen** (`tools/_g431-modal.mjs`):

    Klick auf `latissimus`   Group · 3 muscles · 6 of 96
                             drei Bloecke: latissimus,
                             teres-major, teres-minor
                             je mit eigenem Wert (2/3 · 14 h)

    Klick auf `chest`        Muscle · 5 of 96
                             EIN Block: Brust/chest
                             mit eigenem Wert (1/3 · 38 h)

**Bilder:** `a4-gruppe.png`, `a4-kind.png`

`[read]` **Die Entscheidung ist eine Zeile** ? `flaechen.length > 1`.
`[read]` **Deshalb prueft der Waechter sie in BEIDE Richtungen:**
eine Fassung, die alles aufschluesselt, waere sonst gruen.

### A5 — Per-muscle detail zeigt die Hierarchie

`[cmd]` **GEMESSEN, woraus die Liste kam:** `muskelnZurFlaeche`
(`modale.tsx:509`) ? **also `MUSKEL_ZU_FLAECHE`, die Handliste.**
**Nicht `koerperflaechen`.** `[read]` **Das ist genau Toms Befund
*,,werden die alten gelistet"*.**

`[cmd]` **Vorher:** eine flache Reihe Pillen ?
*,,Back · Mid Back · Teres Major · Teres Minor · Upper Back ·
latissimus dorsi"*.

`[cmd]` **Nachher:** je Flaeche ein Block mit Name, Code, eigenem
Wert und den Muskeln darunter.

**Bilder:** `a5-vorher.png`, `a5-nachher.png`

`[read]` **Die FARBE kommt weiter aus der Handliste** ? sie deckt 96
Namen, die Tabelle 60 (G-430). **Die LISTE zeigt die Hierarchie.**

### A6 — was nicht gezeichnet ist, bleibt Luecke

`[cmd]` **Zwei neue dazu, beide aus `training.muscle_groups`
belegt:**

    Gluteus Minimus    liegt unter dem Medius
    Semimembranosus    liegt unter dem Semitendinosus

`[cmd]` **`Vastus Intermedius` stand kurz auf der Liste und ist
WIEDER RAUS** ? `107_muscle_groups_hierarchy.sql` **fuehrt ihn
nicht.** `[read]` **Eine Luecke fuer einen Muskel, den die Datenbank
nicht kennt, waere ein erfundener Name** ? **nachgesehen, nicht
angenommen.**

`[cmd]` **Fuenf Luecken insgesamt**, alle im Per-muscle-Detail
sichtbar.

### A7 — die vier Module unveraendert

`[cmd]` **Gemessen** (`tools/_g431-regression.mjs`), je ein Bild:

    Modul         Kacheln  Zeichen  Kartenflaechen  Fehler
    ---------------------------------------------------------
    recovery          17    5.712        28            0
    supplements       14    6.605        28            0
    medical           11    4.724         0            0
    coach             13    5.124         0            0

`[cmd]` **Identisch zu den G-430-Zahlen** ? **nur die Flaechenzahl
steigt von 26 auf 28.** `[cmd]` **Keine alte Flaeche mehr da, alle
neun neuen gezeichnet.**

### A8 — die Proben

    apps/web    1642 / 1642 gruen   (1631 gefordert)
    apps/coach    65 / 65 gruen
    tsc         EXIT 0

`[cmd]` **Zehn neue Waechter** (`g431-buendel.test.ts` 6,
`g431-modal.test.ts` 4).

`[cmd]` **SIEBEN bestehende Waechter mussten nachgezogen werden** ?
sie froren Zahlen ein, die die Aufteilung aendert. **Jede neue Zahl
steht mit ihrer Rechnung im Kommentar.**

### Die Gegenprobe: ZEHN Sabotagen, alle ROT

    gluteal wird wieder zusammengefuehrt              ROT
    ein Pfad des Beinbeugers faellt weg               ROT
    quadriceps wird doch geteilt                      ROT
    der Umriss `knees` verliert Pfade                 ROT
    die Bruecke kennt das Gesaess nicht mehr          ROT
    ein Muskelname faellt auf die alte Flaeche zurueck ROT
    das Gesaess-Kuerzel faerbt wieder nur EINE Flaeche ROT
    das Modal schluesselt eine Gruppe nicht mehr auf  ROT
    das Modal zeigt beim KIND auch die Gruppenfassung ROT
    je Kind faellt der eigene Wert weg                ROT

`[cmd]` **Jede prueft zuerst, ob sie ankommt.** `[cmd]` **Gesund
vorher gruen, nach dem Zuruecksetzen wieder gruen.**

## Drei Befunde am Rande

**1 ? C-479 ist angekommen, waehrend ich gearbeitet habe.**

`[cmd]` **Nachgemessen:** **die fuenf Flaechen aus G-430 stehen
jetzt in `public.koerperflaechen`**, je unter `wurzel-ruecken`.
**Die vier aus G-431 noch nicht.** `[read]` **Die Bruecke greift nur
noch fuer diese vier** ? und das Modal schreibt es sichtbar hin.

`[cmd]` **`gluteal` und `hamstring` haengen in der Tabelle unter
`wurzel-beine`** ? **der geerbte Elternteil ist also anatomisch
richtig.**

**2 ? Eine Zusage hatte sich umgedreht.**

`[cmd]` `injektion-flaechen.test.ts` **behauptete
*,,latissimus gibt es nicht"*** ? **G-430 hat ihn gebaut.**
`[read]` **Ein Verbot-Waechter ueber eine Abwesenheit blockiert
spaeter genau deren Behebung** ? **umgedreht, nicht geloescht.**

**3 ? Ein Waechter suchte nur nackte Schluessel.**

`[cmd]` `^\s*${flaeche}:` **fand `'gluteus-maximus':` nicht** ? der
Bindestrich verlangt Anfuehrungszeichen. **Er meldete die Flaeche als
fehlend, obwohl sie in Zeile 153 steht.** `[read]` **Dieselbe Falle
wie in G-425** (*,,wer nach nackten Schluesseln sucht, findet 21
statt 23"*).

## Was NICHT gebaut wurde

**1 ? Die vier Zeilen in `public.koerperflaechen`.** `[read]`
**`supabase/` ist gesperrt** ? C-479 liegt bei Codex. **Der
Folgeauftrag ist klein:** vier `INSERT`s unter `wurzel-beine`, dann
fallen vier `AUS_AUFTEILUNG`-Eintraege weg.

**2 ? Die fuenf toten Bruecken-Eintraege aus G-430.** `[cmd]` **Sie
feuern seit C-479 nicht mehr** ? **stehen gelassen und vermerkt,
statt sie ungemessen zu entfernen.**

**3 ? `lat_l`/`lat_r` auf den echten Latissimus umgestellt.**
`[cmd]` **Sie zeigen weiter auf `trapezius`** ? die
Injektionsstelle liegt ueber dem oberen Rand. **Gemeldet, nicht
nebenbei geaendert.**

**4 ? Kein Pfad neu gezeichnet, kein Muskelname erfunden.**

**5 ? Nichts in `supabase/`.** `[cmd]` **Die drei Eintraege dort
sind C-479 von Codex.**

**6 ? Nicht committet, nicht gestaged.**

## Nachgetragen

`[cmd]` **`docs/ssot/104-muskelkarte.md`** ? Urteilstabelle, neue
Zahlen, fuenf Luecken, der C-479-Stand.

## Neustart

`[cmd]` **NOETIG** ? `packages/ui/src/koerperkarte-pfade.ts` ist
geaendert. `[cmd]` **Waehrend meiner Messungen hat das heisse
Nachladen gegriffen** (die Flaechenzahl stieg im laufenden Server von
26 auf 28) ? **fuer Toms Ansicht ist ein Neustart trotzdem
sicherer.**

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  38 Einzelbilder plus 13 Tafeln
    A2  zwei von zwoelf geteilt
    A3  vier Umriss-Flaechen belegt, nichts gebaut
    A4  Modal: Gruppe aufgeschluesselt, Kind einzeln
    A5  die Liste kam aus der Handliste
    A6  fuenf Luecken, eine Zusage zurueckgenommen
    A8  1642/1642, 65/65

`[cmd]` **Selbst gemessen: 28 Flaechen, 160 Pfade.**

`[cmd]` **`gluteus-maximus`, `gluteus-medius`, `biceps-femoris`,
`semitendinosus` da** ? **`gluteal` und `hamstring` weg.**

`[cmd]` **`tafel-hamstring-back.png` angesehen:** **acht Pfade
nebeneinander, plus alle in einem Bild** ? **zwei breite
Straenge je Seite, aussen und innen.**

### Die Tafel ist die Bauform, die gefehlt hat

> *,,Die Tafel war noetig, weil die Frage ein VERGLEICH ist ? an
> einem Einzelbild nicht zu beantworten."*

`[read]` **G-425 hatte sechs Einzelbilder** ? **hier sind es
Einzelbilder UND eine Tafel.**

`[read]` **Ob zwei Pfade denselben Muskel zeigen, sieht man erst
nebeneinander.**

### A2 — zwei geteilt, zehn zusammengelassen

`[cmd]` **`quadriceps` ist der Beleg fuer die Regel:**

> *,,Eine Masse mit zwei schmalen Raendern ? vier Koepfe, ein
> Muskel. Wer ihn teilt, teilt einen Muskel."*

`[cmd]` **Und `calves`:** *,,zwei Baeuche plus zwei Sehnenlaeufer
? Gastrocnemius hat zwei Koepfe."*

`[read]` **Die Versuchung war gross** ? **acht bzw. zwoelf Pfade
sehen nach mehreren Muskeln aus.**

`[cmd]` **158 Pfade vorher wie nachher** ? **nichts verloren.**

### A3 war schon erfuellt

> *,,Alle vier stehen als nicht-muskel in EINORDNUNG, kein
> Muskelname zeigt darauf. Nichts zu bauen, nur zu belegen."*

`[read]` **Er hat nicht gebaut, was schon da war.**

### A6 — eine Zusage zurueckgenommen

> *,,Vastus Intermedius habe ich wieder gestrichen ?
> `muscle_groups` fuehrt ihn nicht, das waere ein erfundener Name
> gewesen."*

`[read]` **Er hat es geschrieben, gemessen, und wieder
entfernt.**

### Drei Befunde am Rande

`[cmd]` **C-479 ist waehrend der Arbeit angekommen** ? **die
fuenf G-430-Flaechen stehen in der Tabelle, die vier neuen noch
nicht.**

`[cmd]` **Selbst nachgemessen:** `latissimus`, `teres-major`,
`teres-minor`, `erector-spinae`, `flanke` ? **je mit `-l` und
`-r`.**

`[cmd]` **Und `lat_l`/`lat_r` zeigen weiter auf `trapezius`,
obwohl `latissimus` jetzt existiert** ? **gemeldet, nicht
geaendert.**

**Abgenommen.**

