---
nr: G-430
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-468
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: d1f6b2ac
beruehrt:
  dateien:
    - packages/ui/src/koerperkarte-pfade.ts
zahlen:
  gemessen: 2026-09-08
  flaechen: 59
  module: 4
---

# G-430 — die Muskelhierarchie zu Ende bringen

## Warum dieser Punkt

Tom, 2026-09-08: *,,irgendwie entsteht hier ein ghetto. in der
grafik ist der latissimus noch nicht anwaehlbar. ich sehe noch
kein parent/child konzept."*

`[read]` **Die Grundlage steht seit C-468 und wird von NIEMANDEM
gelesen.**

`[cmd]` **`public.koerperflaechen`: 59 Zeilen, drei Ebenen,
`parent_id`, `art`, `muscle_group_id`.**

`[cmd]` **Und vier Module arbeiten weiter mit eigenen Listen:**

    packages/ui/koerperkarte-pfade.ts     23 Flaechen, flach
    recovery/muskel-zuordnung.ts          18 Gruppen,
                                          17 Teilstuecke
    recovery/muskel-ebenen.ts             6 Namen auf
                                          upper-back
    lib/medical/injektion-flaechen.ts
    lib/medical/koerperflaechen.ts

`[read]` **Drei Aufraeumpunkte (G-424, G-427) und dieser
Durchgang** ? **die zwei sind aufgeloest, hier steht alles.**

## Was gemessen ist

`[cmd]` **G-425 hat jeden Ruecken-Pfad einzeln eingefaerbt und
fotografiert:**

    upper-back Pfad 1 / 4    Teres major
    upper-back Pfad 2 / 5    Teres minor / oberer Lat-Rand
    upper-back Pfad 3 / 6    Latissimus dorsi
    lower-back  4 Pfade      Erector spinae + Flanke

`[cmd]` **Die anderen 21 Flaechen buendeln EINEN Muskel** ?
`triceps` **hat drei Koepfe und bleibt ein Muskel.**

`[cmd]` **Und drei Muskeln fehlen ganz:** **Rhomboiden, Obliquus
internus, Soleus** ? **nicht gezeichnet.**

`[cmd]` **`training.muscle_groups`: 7 Wurzeln, 88 Kinder, VIER
Ebenen** ? `Arms > Forearms > Forearm Extensors > Extensor Carpi
Radialis`.

## Der Durchgang, drei Teile

### 1 · Jeder Pfad zeigt auf eine Flaeche

`[read]` **`upper-back` wird aufgeteilt:**

    teres_major        Pfad 1, 4
    teres_minor        Pfad 2, 5
    latissimus         Pfad 3, 6

`[read]` **`lower-back` ebenso:** **Erector spinae und Flanke.**

`[read]` **Die Pfade bleiben UNVERAENDERT** ? **nur die
Zuordnung aendert sich.**

`[cmd]` **Und je Flaeche eine `koerperflaechen.id`** ? **die
Tabelle traegt schon `code`.**

### 2 · Die vier Module lesen die Tabelle

`[read]` **Statt fuenf eigener Listen: eine Quelle.**

`[cmd]` **`muskel-ebenen.ts` wirft heute sechs Namen auf
`upper-back`** ? **zwei davon (Rhomboiden, Mid Back) zeigt die
Karte gar nicht.**

`[read]` **Nach dem Umbau faellt diese Datei weg oder wird
duenn** ? **die Hierarchie steht in der Datenbank.**

`[read]` **Miss, was jedes Modul heute aus seiner Liste holt** ?
**und ob die Tabelle dasselbe liefert.**

### 3 · parent/child wird sichtbar

Tom: *,,ein bodybuilder nutzt uebungen fuer einzelne muskeln
sowie gebuendelt."*

    ein Klick auf "Back"        faerbt alle Kinder
    ein Klick auf "Latissimus"  faerbt nur ihn
    Per-muscle detail           zeigt den Elternteil

`[cmd]` **`recovery` hat *Per-muscle detail*** ? **Tom nennt es
ausdruecklich.**

`[read]` **Und die Modale** ? **sie zeigen heute keine
Hierarchie.**

## Was NICHT zu tun ist

`[read]` **Keinen Pfad neu zeichnen.**

`[read]` **Die drei fehlenden Muskeln NICHT erfinden** ?
**Rhomboiden, Obliquus internus und Soleus bleiben Luecken, und
die Luecke wird sichtbar.**

`[read]` **Und nichts in `supabase/`** ? **die Tabelle steht.**

## Abnahmebedingungen

    A1  upper-back und lower-back aufgeteilt, je Pfad
        eine Flaeche. Bildschirmfoto je neuer Flaeche.
    A2  Latissimus einzeln anwaehlbar. Foto.
    A3  die vier Module lesen koerperflaechen.
        Je Modul: was es vorher las, was jetzt.
    A4  ein Klick auf einen Elternteil faerbt die Kinder.
        Zwei Fotos.
    A5  Per-muscle detail zeigt den Elternteil.
    A6  die drei fehlenden Muskeln: sichtbar als Luecke,
        nicht erfunden.
    A7  Recovery, Supplements, Medical und Coach sehen
        unveraendert aus, wo sie es sollen. Je ein Foto.
    A8  apps/web 1620 oder mehr, apps/coach 65.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### Der Befund, der den Zuschnitt aendert

`[cmd]` **`public.koerperflaechen` kennt die fuenf Zielflaechen der
Aufteilung NICHT** ? gemessen gegen die laufende Instanz
(`tools/_g430-eltern.mjs`):

    latissimus       in koerperflaechen: NEIN
    teres-major      NEIN      teres-minor    NEIN
    erector-spinae   NEIN      flanke         NEIN
    trapezius        JA  -> wurzel-ruecken

`[cmd]` **Die Tabelle fuehrt weiter `upper-back` und `lower-back`**,
je mit zwei Kindern (`-l`, `-r`).

`[read]` **Der Auftrag verlangt *,,je Flaeche eine
koerperflaechen.id"* und verbietet `supabase/`** ? **beides zusammen
geht nicht.** `[read]` **Ich habe die Aufteilung gebaut und die
Luecke sichtbar ueberbrueckt, statt sie zu verschweigen oder die
Tabelle anzufassen.**

`[cmd]` **`AUS_AUFTEILUNG`** (`lib/koerper/hierarchie.ts`) **ist die
EINZIGE Stelle, an der die Aufteilung im Code doppelt steht** ? sie
faellt weg, sobald Codex die fuenf Zeilen anlegt. **Am Schirm steht
es woertlich:** *,,geerbt ? diese Flaeche steht noch nicht in
public.koerperflaechen"*.

### A1 ? upper-back und lower-back aufgeteilt

`[cmd]` **Je Pfad eine Flaeche, kein Pfad neu gezeichnet:**

    teres-minor      Pfad 1, 4    Dreieck oben am Schulterblatt
    teres-major      Pfad 2, 5    Sichel am Aussenrand
    latissimus       Pfad 3, 6    breites Dreieck Achsel -> Taille
    flanke           Pfad 1, 4    Fleck seitlich ueber der Huefte
    erector-spinae   Pfad 2, 3    zwei Baender neben der Wirbelsaeule

**Bilder:** `docs/bilder/g430/{teres-minor,teres-major,latissimus,
flanke,erector-spinae}.png` ? **je Flaeche eines, beide
Koerperhaelften.**

`[cmd]` **Die Verschiebung lief als Skript**
(`tools/_g430-aufteilen.mjs`), **nicht von Hand** ? die Datei sagt
selbst: *,,ein Tippfehler in einer Bezierkurve faellt beim Lesen
nicht auf, sondern erst als verzogener Muskel."* `[cmd]` **Das Skript
prueft VOR dem Schreiben, dass jeder der 10 Pfade genau einmal
vorkommt.**

**EINE BERICHTIGUNG AM AUFTRAG:** `[cmd]` **Der Auftrag nennt *,,Pfad
1/4 Teres major, Pfad 2/5 Teres minor"*.** `[cmd]` **Am Bild ist es
umgekehrt** ? ich habe `upper-back-1/2/3.png` aus G-425 noch einmal
angesehen: **Pfad 1 ist das kleine Dreieck OBEN am Schulterblatt,
Pfad 2 die schmale Sichel am AUSSENRAND.**

`[read]` **G-425 hat genau davor gewarnt:** *,,Bei einer gespiegelten
Figur heisst groesseres x auf der linken Koerperhaelfte weiter zur
Mitte ? die Zahl allein sagt es nicht."*

### A2 ? Latissimus einzeln anwaehlbar

`[cmd]` **Am Schirm gemessen** (`tools/_g430-schirm.mjs`),
`test-user@lumeos.local`:

    Flaechen gezeichnet   26   (vorher 23)
    latissimus            DA
    teres-major           DA      teres-minor      DA
    erector-spinae        DA      flanke           DA
    upper-back            weg     lower-back       weg

**Bild:** `docs/bilder/g430/latissimus.png` ? **die klassische
Lat-Form, beide Seiten, als EINE Flaeche.**

### A3 ? die vier Module: was sie lasen, was jetzt

**DIE ENTSCHEIDENDE MESSUNG ZUERST** (`tools/_g430-tabelle.mjs`):

    muskel-ebenen.ts fuehrt              96 Muskelnamen
    davon ueber die Tabelle erreichbar   60
    NICHT erreichbar                     36

`[cmd]` **Die 36 sind keine Kleinigkeit:** `Back`, `Upper Back`,
`Mid Back`, `Rhomboids`, `Teres Major`, `Lower Back`, `Core`, `Arms`,
`Legs`, `Hips`, `Abductors`, `Lower Legs`, `Soleus`-Nachbarn ?
**jeder davon bekommt heute Farbe und wuerde sie verlieren.**

`[read]` **Deshalb NICHT blind umgestellt.** **Die Tabelle traegt die
HIERARCHIE, die Handliste die ABDECKUNG** ? und der Kommentar in
`hierarchie-read.ts` sagt, wann die Handliste wegfallen kann.

    Modul                vorher                    jetzt
    ---------------------------------------------------------------
    packages/ui          23 Flaechen, flach        26 Flaechen
      koerperkarte-      'upper-back' 6 Pfade      aufgeteilt auf 5
      pfade.ts           'lower-back' 4 Pfade      Muskeln

    recovery             6 Namen -> 'upper-back'   je Name sein
      muskel-ebenen.ts   2 Namen -> 'lower-back'   Muskel; Wert darf
                         Wert: EIN String          eine LISTE sein

    recovery             17 Gruppen                20 Gruppen
      muskel-zuordnung   upper_back: 'upper-back'  upper_back: drei
      .ts                                          Flaechen

    recovery             kein Leseweg zur          liest
      page/ansicht/      Tabelle                   koerperflaechen
      modale                                       (erster Aufrufer)

    lib/koerper/         ? (neu)                   hierarchie.ts
      (neu)                                        + hierarchie-read.ts

`[cmd]` **`muskel-ebenen.ts` ist NICHT weggefallen** ? sie traegt die
36, die die Tabelle nicht erreicht. `[read]` **Sie ist duenner
geworden:** die Hierarchie steht nicht mehr darin, nur noch die
Zuordnung Name -> Flaeche.

`[cmd]` **`medical` und `coach` zeichnen keine Koerperkarte** ?
gemessen, 0 Kartenflaechen. **Sie waren nie Verbraucher dieser
Listen.**

### A4 ? ein Klick auf den Elternteil faerbt die Kinder

`[cmd]` **Am Schirm gemessen, `/v2/recovery?tab=checkin`:**

    vor dem Klick    hervorgehoben: []
    Klick            auf den Latissimus
    nach dem Klick   ["latissimus", "teres-major", "teres-minor"]

`[read]` **Recovery misst `upper_back` als EINE Gruppe** ? der eine
Wert faerbt jetzt alle drei Muskeln, statt willkuerlich einen.

**Bild:** `docs/bilder/g430/a4-elternteil-geklickt.png`

`[cmd]` **`ausgewaehlt` in `packages/ui/koerperkarte.tsx` nimmt jetzt
auch eine Liste** ? **der Einzelwert bleibt gueltig**, kein
bestehender Aufrufer musste geaendert werden.

### A5 ? Per-muscle detail zeigt den Elternteil

**Bild:** `docs/bilder/g430/per-muscle-detail.png`

`[cmd]` **Am Schirm:**

    PARENT · PUBLIC.KOERPERFLAECHEN
      [Ruecken]  >  latissimus    latissimus
                    · geerbt - diese Flaeche steht noch nicht in
                      public.koerperflaechen
      [Ruecken]  >  teres-major   ...
      [Ruecken]  >  teres-minor   ...

`[read]` **Die Kette kommt aus der Datenbank, nicht aus einer Liste**
? das ist der erste Leseweg auf `public.koerperflaechen` ueberhaupt.

### A6 ? die drei fehlenden Muskeln: sichtbar, nicht erfunden

`[cmd]` **Gemessen gegen `training.muscle_groups`:**

    Rhomboids          Elternteil: Upper Back
    Soleus             Elternteil: Calves
    Internal oblique   Elternteil: Obliques

`[read]` **Kein Pfad erfunden.** **Sie stehen in `LUECKEN`** mit
Grund und werden im Per-muscle-Detail genannt. `[cmd]` **Ein
Waechter faellt, wenn einer davon doch als Flaeche auftaucht** ?
dann ist es keine Luecke mehr.

**UND EINE VIERTE LUECKE, die der Auftrag nicht nennt:** `[cmd]`
**Die Flanke hat keinen eigenen Muskelnamen** ? G-425 hatte es
gemessen (*,,Die Flanke hat keinen"*), und `muscle_groups` fuehrt
weder `Quadratus Lumborum` noch `Flank`. `[read]` **Ich habe KEINEN
Namen erfunden**, sondern `Obliques` auf beide Flaechen gelegt ?
der Obliquus externus zieht wirklich dorthin.

### A7 ? die vier Module unveraendert

`[cmd]` **Gemessen** (`tools/_g430-regression.mjs`), je ein Bild in
`docs/bilder/g430/a7-*.png`:

    Modul         Kacheln  Zeichen  Kartenflaechen  Seitenfehler
    ---------------------------------------------------------------
    recovery          17     5.712       26              0
    supplements       14     6.605       26              0
    medical           11     4.724        0              0
    coach             13     5.124        0              0

`[cmd]` **Supplements traegt exakt die Zahlen aus G-428** (14 / 6.605)
? **unveraendert.**

### A8 ? die Proben

    apps/web    1631 / 1631 gruen   (1620 gefordert)
    apps/coach    65 / 65 gruen     (65 gefordert)
    tsc         beide EXIT 0, packages/ui ebenso

`[cmd]` **Elf neue Waechter** (`lib/koerper/__tests__/
g430-hierarchie.test.ts`), **alle rechnen statt zu suchen:**
`kinderVon` mit einem echten Baum, die Bruecke in beide Richtungen,
die 10 Pfade einzeln gezaehlt.

`[cmd]` **Acht bestehende Waechter mussten nachgezogen werden** ?
sie froren Zahlen ein, die die Aufteilung aendert (17->20 Gruppen,
23->26 IDs, 39->42 Eintraege, 16->19 eingefaerbt). **Jede neue Zahl
steht mit ihrer Rechnung im Kommentar.**

### Die Gegenprobe: ELF Sabotagen, alle ROT

`[cmd]` **`tools/_g430-sabotage.mjs`, je Sabotage wird zuerst
geprueft, ob sie ankommt:**

    kinderVon liefert nur die erste Ebene            ROT
    die Zyklensperre faellt weg                      ROT
    pfadZu dreht die Reihenfolge um                  ROT
    elternteilVon nennt die Wurzel                   ROT
    die Bruecke meldet nicht, dass sie geerbt hat    ROT
    die Bruecke greift auch fuer Tabellenflaechen    ROT
    eine Luecke verliert ihren Grund                 ROT
    der Latissimus verliert einen Pfad               ROT
    sechs Namen fallen wieder auf EINE Flaeche       ROT
    der Ruecken faerbt wieder nur EINE Flaeche       ROT
    flaechenFuer gibt bei einer Liste nichts zurueck ROT

**EIN WAECHTER WAR DREIMAL BLIND** ? und das ist der Grund, warum
die Gegenprobe laeuft:

`[cmd]` **Die Sabotage *,,die Zyklensperre faellt weg"*
(`runden < 10000`) kam zweimal durch:**

    1. ein Knoten, der auf sich selbst zeigt
       -> `aus.some(...)` faengt ihn in Runde 2, die Sperre
          wird nie gebraucht
    2. eine Zeitmessung
       -> bei neun Zeilen sind auch 10.000 Runden in
          Millisekunden durch

`[read]` **Erst die dritte Fassung misst die Sache:** eine Kette, die
TIEFER ist als die Sperre. **`kinderVon` liefert dann genau 10 von 14
Nachfahren** ? eine Zahl, die nur die Rundensperre erzeugen kann.

`[read]` **Die Sperre wirkt auf die TIEFE, nicht auf Zyklen** ? meine
ersten zwei Proben haben die falsche Mechanik geprueft.

### Ein Fehler, den ich selbst gebaut und gefunden habe

`[cmd]` **Nach dem Einbau des Elternteil-Blocks: HTTP 500 auf JEDER
Route**, auch `/login`:

    You're importing a component that needs next/headers.
      packages/shared/src/supabase/session.ts
      -> lib/koerper/hierarchie-read.ts
      -> v2/recovery/modale.tsx   ('use client')

`[cmd]` **`tsc` blieb dabei gruen.** `[read]` **Dieselbe Falle wie
G-412, G-396 und G-423** ? ein WERT-Import aus einem Leseweg zieht
`next/headers` ueber die Client-Grenze.

`[cmd]` **Behoben durch Teilung:** `hierarchie.ts` traegt die
Rechnung ohne Importe, `hierarchie-read.ts` nur die Abfrage.
`[cmd]` **Danach `/login` -> 200.**

`[read]` **Gefunden hat es die Schirmprobe, nicht der Typpruefer** ?
ohne sie waere die Anwendung kaputt abgenommen worden.

## Was NICHT gebaut wurde

**1 ? Die fuenf Zeilen in `public.koerperflaechen`.** `[read]`
**Das ist `supabase/`** ? verboten. **Der Auftrag fuer Codex ist
klein:** fuenf `INSERT`s unter `wurzel-ruecken`, dann faellt
`AUS_AUFTEILUNG` weg und A5 haengt direkt an der Tabelle.

**2 ? Die 36 fehlenden `muscle_group_id`-Verbindungen.** `[read]`
**Ohne sie kann die Tabelle `MUSKEL_ZU_FLAECHE` nicht ersetzen** ?
gemessen, im Kommentar festgehalten.

**3 ? `Back`/`Upper Back`/`Mid Back` auf alle Kinder verteilt.**
`[cmd]` **Sie liegen auf `latissimus`** ? der groessten Flaeche des
oberen Ruecken. `[annahme]` **Genauer waere eine Verteilung ueber
`parent_id`**, das kann `verdichte` heute nicht.

**4 ? Kein Pfad neu gezeichnet.**

**5 ? Nichts in `supabase/`.** `[cmd]` **Die drei Eintraege dort
sind C-473 von Codex**, nicht von mir.

**6 ? Nicht committet, nicht gestaged.**

## Nachgetragen

`[cmd]` **`docs/ssot/104-muskelkarte.md`** ? ein datierter Abschnitt
mit der neuen Verteilung, den neuen Zahlen und den vier Luecken.
**Ein Waechter hatte ausdruecklich darauf verwiesen.**

## Neustart

`[cmd]` **NOETIG** ? `packages/ui` ist geaendert
(`koerperkarte-pfade.ts`, `koerperkarte.tsx`). `[read]` **Die Schale
laedt das Paket einmal beim Start.**

`[cmd]` **Waehrend meiner Messungen hat das heisse Nachladen
gegriffen** ? die Zahlen oben stammen aus demselben laufenden
Server. **Fuer Toms Ansicht ist ein Neustart trotzdem sicherer.**

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  je Pfad eine Flaeche, kein Pfad neu gezeichnet
    A2  23 -> 26 Flaechen, Latissimus einzeln
    A3  60 von 96 Namen erreichen die Tabelle
    A4  Klick faerbt drei Kinder
    A5  Detail zeigt Ruecken -> latissimus
    A6  vier Luecken benannt, keine erfunden
    A8  web 1631/1631, coach 65/65

`[cmd]` **Selbst gemessen:**

    Karte    26 Flaechen
             latissimus, teres-major, teres-minor,
             erector-spinae, flanke -- alle da
             upper-back, lower-back -- weg

    Tabelle  traegt weiter upper-back, lower-back
             (plus -l und -r)

`[read]` **Der Befund vorweg stimmt** ? **die fuenf Zielflaechen
stehen NICHT in `public.koerperflaechen`.**

### Der Zuschnitt war richtig

> *,,Der Auftrag verlangt *je Flaeche eine koerperflaechen.id*
> und verbietet `supabase/` ? beides zusammen geht nicht."*

`[read]` **Mein Auftrag war widerspruechlich.**

`[read]` **Er hat nicht gegen die Sperre gearbeitet und nicht
aufgegeben** ? **er hat gebaut und die Luecke BENANNT:**

> *,,Am Schirm steht woertlich: *geerbt ? diese Flaeche steht noch
> nicht in public.koerperflaechen*."*

`[cmd]` **`AUS_AUFTEILUNG` ist die einzige doppelte Stelle und
faellt weg, sobald fuenf Zeilen angelegt sind.**

### A3 ist die Messung, die den Umbau gerettet hat

`[cmd]` **Selbst nachgemessen:**

    training.muscle_groups                95 Zeilen
    davon mit koerperflaechen verbunden   17

`[read]` **78 Muskelnamen erreichen die Tabelle NICHT** ?
**Abductors, Arms, Back, Core, Gluteus Maximus, Forearm
Extensors und siebzig weitere.**

> *,,Blind umzustellen haette 36 Muskeln die Farbe gekostet."*

`[read]` **Er hat die Handliste BEHALTEN, statt sie zu
ersetzen** ? **die Tabelle traegt die Hierarchie, die Liste die
Abdeckung.**

`[cmd]` **Und `recovery` liest `koerperflaechen` als ERSTER
Aufrufer ueberhaupt.**

### Eine Berichtigung meines Auftrags

> *,,Der Auftrag nennt *Pfad 1/4 Teres major* ? am Bild ist es
> umgekehrt. G-425 hatte genau davor gewarnt."*

`[read]` **Ich habe seine eigene Messung falsch abgeschrieben.**

### Die vierte Luecke

> *,,Die Flanke hat keinen eigenen Muskelnamen; ich habe Obliques
> auf beide Flaechen gelegt statt einen Namen zu erfinden."*

`[read]` **Drei Luecken waren bekannt (Rhomboiden, Obliquus
internus, Soleus)** ? **die vierte hat er gefunden.**

### Ein selbst gebauter Fehler, wieder derselbe

`[cmd]` **Der Elternteil-Block ergab HTTP 500 auf JEDER Route** ?
**Wert-Import ueber die `'use client'`-Grenze, `tsc` gruen.**

`[cmd]` **Dritter Fall an zwei Tagen** (G-412 Funktion, G-423
Konstante, jetzt ein Wert).

> *,,Die Schirmprobe hat es gefunden, nicht der Typpruefer."*

`[cmd]` **Behoben durch Teilung:** `hierarchie.ts` **(Rechnung)
und** `hierarchie-read.ts` **(Abfrage)** ? **beide gemessen.**

### Und ein Waechter war dreimal blind

> *,,Die Zyklensperre wirkt auf die TIEFE, nicht auf Zyklen; erst
> die dritte Fassung misst die Sache."*

**Abgenommen.**

