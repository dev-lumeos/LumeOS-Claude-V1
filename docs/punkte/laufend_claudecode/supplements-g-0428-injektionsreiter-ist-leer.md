---
nr: G-428
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-389
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-injektionen.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-428 — der Injektionsreiter ist leer

## Befund 1: der Reiter zeigt NICHTS

Tom, 2026-09-08, nach G-389.

`[cmd]` **Bildschirmfoto, `/v2/supplements?tab=injektionen`:**

    test-user@lumeos.local   Reiterleiste, darunter LEER
    dev@lumeos.app           Reiterleiste, darunter LEER

`[cmd]` **Beide Nutzer, kein Konsolenfehler ausser der
bekannten `data-mode`-Warnung.**

`[read]` **Vor G-389 zeigte der Reiter die Rotationskarte, die
Konfiguration und die Protokollliste** ? **jetzt nichts.**

`[cmd]` **G-389 hat geaendert:** `ansicht.tsx`, `modale.tsx`,
**plus vier neue Dateien.**

`[read]` **Miss, was den Reiter heute leer laesst** ? **ein
Fehler beim Rendern, ein falscher Zweig, oder eine Abfrage, die
nichts liefert.**

## Befund 2: zwei nackte Bedienleisten in Extended

Tom: *,,supplements/Extended ? nach modulmenu Zyklen und
Protokolle halbherzig eingebaut, was ist das?"*

`[cmd]` **Bildschirmfoto zeigt ganz oben, VOR der Vorlage:**

    Zyklen 0      supplements.user_supplement_cycles
                  [Substanz waehlen] [+ Zyklus starten]
                  "Noch kein Zyklus. Die Tabelle ist seit
                   C-456 da und leer."

    Protokolle 0  3 Vorlagen bereit
                  [Vorlage waehlen] [Ankersubstanz]
                  [Aus Vorlage anlegen]
                  "Noch kein Protokoll."

`[read]` **Das sind SCHREIBWEGE ohne Ansicht** ? **Knoepfe, die
etwas anlegen, aber nichts zeigen.**

`[cmd]` **G-423 hat sie gebaut, um die C-456-Funktionen zu
rufen** ? **A3 und A4 verlangten genau das.**

`[read]` **Aber sie stehen VOR der Vorlage, ohne Kachel, ohne
Rahmen** ? **wie ein Werkzeugkasten, den jemand auf den Tisch
gelegt hat.**

## Was die Vorlage zeigt

`[cmd]` **`docs/spezifikation/10-plattform/design-system/theme-v1/`**
? **die Extended-Kacheln:**

    Extended supplements - log
    Active protocols          5 compounds
    Bloodwork - linked from Medical

`[read]` **`Active protocols` IST die Protokollansicht** ? **sie
steht als Attrappe da, waehrend darueber eine nackte Bedienleiste
anlegt.**

`[read]` **Und einen Zyklenbereich hat die Vorlage nicht
sichtbar** ? **miss, ob es ihn gibt.**

## Was zu tun ist

**1** ? **Den Injektionsreiter wieder zum Laufen bringen.**

`[read]` **Zuerst messen, WARUM er leer ist** ? **nicht raten.**

**2** ? **Die zwei Bedienleisten in die Vorlage einfuegen.**

`[read]` **Ein Zyklus gehoert in eine Kachel, nicht ueber die
Seite.**

`[cmd]` **`Active protocols` zeigt heute Entwurfsdaten** ? **wenn
ein Protokoll angelegt wird, gehoert es DORT hinein.**

`[read]` **Und wenn keines da ist: der Leerzustand in derselben
Kachel, nicht daneben.**

**3** ? **Wo gehoert der Zyklus hin?**

`[read]` **Miss, ob die Vorlage einen Zyklenbereich hat.**

`[read]` **Wenn nicht: melden und Tom entscheiden lassen** ?
**nicht erfinden.**

## Abnahmebedingungen

    A1  warum der Reiter leer war: GEMESSEN.
    A2  der Reiter zeigt wieder Inhalt. Foto.
    A3  Gegenprobe: der kaputte Zustand -> faellt sie?
    A4  Zyklen und Protokolle in einer Kachel der Vorlage.
        Foto vorher/nachher.
    A5  hat die Vorlage einen Zyklenbereich? Gemessen.
    A6  apps/web 1613 oder mehr.

## Was nicht zu tun ist

**Nichts in `supabase/`** ? **Codex arbeitet an C-470.**
**Die Schreibwege NICHT entfernen** ? **sie sind richtig, sie
stehen nur am falschen Ort.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### A1 — warum der Reiter leer war: GEMESSEN

`[cmd]` **Die Adresse traf keinen Zweig. Der Reiter war nie
kaputt.**

`[cmd]` **Gemessen** (`tools/_g428-messen.mjs`), **beide Konten,
dieselben Zahlen:**

    Adresse                          Kacheln  Zeichen  Rotation map
    ---------------------------------------------------------------
    /v2/supplements?tab=injektionen        1      801  nein
    /v2/supplements?tab=injection         14    6.605  ja
    /v2/supplements (Standard)            17    4.925  nein

`[cmd]` **`test-user@lumeos.local` und `dev@lumeos.app` liefern
identische Zahlen** ? **kein Kontounterschied, kein Datenproblem.**

`[cmd]` **Null Seitenfehler in allen drei Faellen** ? **kein
Fehler beim Rendern.**

**Die Ursache, Zeile fuer Zeile:**

`[cmd]` **Die Reiter-Id heisst `injection`** (`ansicht.tsx:122`),
**und jeder Zweig unten fragt `tab === 'injection'`**
(`ansicht.tsx:451`). `[cmd]` **Der deutsche Name `injektionen` ist
die BESCHRIFTUNG** (`t('tabInjektionen')`), **nicht die Id.**

`[cmd]` **`lib/tab-url.ts` nahm den Wert ungeprueft entgegen** ?
**und der alte Kommentar sagte es woertlich:**

> *,,Ein von Hand getippter unbekannter Wert wird NICHT geklammert
> ? die Ansicht zeigt dann ihren Kopf ohne Inhalt."*

`[read]` **Das ist genau, was Tom gesehen hat: Reiterleiste,
darunter leer.**

`[cmd]` **Und `tab=injektionen` steht NIRGENDS im Quelltext** ?
`rg` **ueber `apps/web/src` findet 15 Treffer fuer `injektionen`,
alle sind Dateinamen, Propnamen oder Kommentare.** `[read]` **Kein
Knopf erzeugt diese Adresse** ? **sie war von Hand getippt.**

### Die Praemisse des Auftrags ist widerlegt: G-389 war es nicht

`[read]` **Der Auftrag sagt:** *,,Vor G-389 zeigte der Reiter
Rotationskarte, Konfiguration und Protokollliste."*

`[cmd]` **Nachgemessen, nicht geglaubt.** **Die zwei von G-389
geaenderten Dateien auf den Stand VOR dem Commit gesetzt:**

    git checkout 05425238^ -- ansicht.tsx modale.tsx

`[cmd]` **Dieselbe Probe, derselbe Server:**

    Adresse                     vor G-389        nach G-389
    ---------------------------------------------------------
    ?tab=injektionen            1 / 801          1 / 801
    ?tab=injection             14 / 6.605       14 / 6.605

`[read]` **Byte-identisch.** `[cmd]` **`?tab=injektionen` war schon
VOR G-389 leer** ? **G-389 hat den Reiter nicht angefasst.**

`[cmd]` **Der Commit aendert an `ansicht.tsx` genau EINE Zeile**
(`git show --stat`): **`konfig={konfig?.flaechen ?? []}` als Prop
an die Modale.** `[read]` **Die uebrigen 714 Zeilen liegen in
`modale.tsx` und vier neuen Dateien.**

`[cmd]` **Danach zurueck auf HEAD** ? `git status` **sauber.**

### A2 — der Reiter zeigt wieder Inhalt

`[cmd]` **Die Klammer ist gebaut:** **ein unbekannter Reiter faellt
auf den Standard, statt ins Leere zu zeigen.**

    Adresse                    vorher            nachher
    ---------------------------------------------------------
    ?tab=injektionen           1 / 801           17 / 4.925
    ?tab=injection            14 / 6.605         14 / 6.605

`[read]` **Der gute Fall bleibt unveraendert** ? **die Klammer
greift nur, wo vorher nichts stand.**

**Bild:** `docs/bilder/g428/injektionsreiter.png` ?
**Konfigurationskachel, Rotationskarte mit beiden Silhouetten,
Ortskachel rechts, vier Kennzahlen, Mockup-Referenz unter der
Linie.**

**Wo die Klammer liegt** (`lib/tab-url.ts`):

`[read]` **Der alte Kommentar hatte einen richtigen Grund** ?
*,,die Tab-Listen leben in den Modulen, eine zweite Liste hier waere
Drift."* `[read]` **Deshalb bringt der Aufrufer seine Liste MIT**,
statt dass der Hook eine zweite fuehrt.

`[cmd]` **Und die Liste wird ABGELEITET, nicht abgeschrieben:**
`reiterIds()` **ruft `tabs()` ? dieselbe Funktion, die die Leiste
rendert.** `[read]` **Wer einen Reiter ergaenzt, hat ihn damit
automatisch in der Klammer.**

`[cmd]` **Ohne Liste bleibt alles beim Alten** ? **die sechs
anderen Module rufen den Hook unveraendert, kein stiller Eingriff.**

### A3 — die Gegenprobe: ELF Sabotagen, alle ROT

`[cmd]` **`tools/_g428-sabotage.mjs`, je Sabotage wird ZUERST
geprueft, ob sie ankommt:**

    die Klammer faellt weg (der alte Zustand)           ROT
    die Klammer dreht sich um                           ROT
    die leere Liste verschluckt jeden Reiter            ROT
    der Hook nimmt keine Liste mehr entgegen            ROT
    supplements uebergibt seine Liste nicht mehr        ROT
    die Liste wird abgeschrieben statt abgeleitet       ROT
    der Reiter "injection" faellt aus der Leiste        ROT
    die Protokollkachel wird entfernt (Schreibweg weg)  ROT
    die Kacheln stehen wieder VOR der Vorlage           ROT
    die Protokollkachel rutscht UNTER die Attrappe      ROT
    die Zyklenkachel rutscht UNTER die Zeitleiste       ROT

`[cmd]` **Gesund vorher GRUEN, nach dem Zuruecksetzen wieder
GRUEN.**

**DREI BEFUNDE AUS DER GEGENPROBE SELBST** ? **sie sind der Grund,
warum sie laeuft:**

`[cmd]` **1 ? Zwei Waechter waren BLIND.**

    "die Liste wird abgeschrieben"     blieb GRUEN
    "die Protokollkachel wird entfernt" blieb GRUEN

`[read]` **Beide suchten ein WORT statt der WIRKUNG.** `[cmd]` **Der
erste fragte, ob `reiterIds()` das Wort `tabs(` enthaelt** ? **er
haette `return ['today', 'stack']` durchgelassen.** `[cmd]` **Der
zweite fragte, ob `<ProtokollKarte` im Text steht** ? **und
`false && <ProtokollKarte` enthaelt es.**

`[read]` **Jetzt messen beide das Ergebnis:** **der eine prueft, was
`reiterIds()` zurueckgibt, der andere, ob vor der Kachel eine
Bedingung steht, die nie zutrifft.**

`[cmd]` **2 ? Eine Sabotage kam NICHT an.** **Sie suchte
`'{zyklen}\nSPACES<CycleTimeline />'`** ? **die Datei hat CRLF, das
Muster LF.** `[read]` **Sie meldete `FEHLER`, nicht `GRUEN`** ?
**weil die Probe zuerst fragt, ob die Ersetzung greift.** **Ohne
diese Frage waere sie als bestandener Waechter durchgegangen.**

### A4 — Zyklen und Protokolle in einer Kachel der Vorlage

`[cmd]` **Gemessen** (`tools/_g428-extended.mjs`) ? **der Ort, nicht
der Titel:**

    Frage                        vorher              nachher
    -------------------------------------------------------------
    VOR dem Raster               Zyklen, Protokolle  (nichts)
    Zyklen IM Raster             nein                ja
    Protokolle IM Raster         nein                ja
    Kacheln gesamt               16                  16

`[read]` **16 vorher, 16 nachher** ? **nichts entfernt, nur
verschoben.**

**Die Reihenfolge im Raster, nachher:**

    Protokolle                   <- das Echte
    Active protocols             <- die Attrappe
    Zyklen                       <- das Echte
    Cycle timeline · 16 weeks    <- die Attrappe

`[read]` **Oben das Angebundene, darunter die Mockup-Fassung** ?
**E-68, je Kachel, nicht als Block.**

**Bilder:** `docs/bilder/g428/extended-vorher.png` **und**
`extended-nachher.png`

`[cmd]` **Vorher zeigt genau Toms Befund:** **zwei nackte
Bedienleisten ueber der vollen Breite, VOR der Kopfzeile
*,,Extended supplements · log"*, ohne Kachel, ohne Rahmen.**

`[cmd]` **Nachher steht `Protokolle` als gerahmte Kachel in der
linken Spalte ueber `Active protocols`, `Zyklen` ueber `Cycle
timeline`** ? **und die Kopfzeile wieder ganz oben.**

`[read]` **Die Schreibwege sind NICHT entfernt** ? **beide Kacheln
tragen ihre Auswahlfelder und Knoepfe unveraendert.** `[cmd]` **Ein
Waechter haelt das fest, und die Sabotage dazu ist rot.**

**Wie:** `SuppExtended` **nimmt zwei Fuellungen entgegen**
(`protokolle`, `zyklen`). `[read]` **Weggelassen heisst: die
Entwurfsfassung bleibt allein stehen** ? **so aendert sich nichts
fuer einen Aufrufer ohne Gate.**

### A5 — hat die Vorlage einen Zyklenbereich? JA

`[cmd]` **Gemessen, nicht erfunden** ?
`docs/spezifikation/10-plattform/design-system/theme-v1/module-supplements.jsx`:

    Zeile 1381   const CycleTimeline = () => {
    Zeile 1393   <Card title="Cycle timeline · 16 weeks"
                       sub="Apr 7 → Jul 28"
    Zeile 1212   <CycleTimeline />   <- IM Extended-Bereich,
                                        direkt unter Active protocols

`[read]` **Die Vorlage hat den Bereich also nicht nur** ? **sie
stellt ihn genau dorthin, wo Tom die Zyklen vermutet hat: unter die
Protokolle.**

`[cmd]` **Und die Kachel ist inhaltlich eine Zyklenansicht:** **16
Wochen als Raster, fuenf Substanzen, je Woche `on | past | off`,
eine Marke fuer *,,diese Woche"*, Legende mit drei Zustaenden.**

`[cmd]` **Eine ZWEITE Zyklenstelle steht im Grundreiter:**
`module-supplements.jsx:367-370`, `<Card title="Active cycles"
sub="time-bound items">` ? **mit dem Kommentar
`{/* Cycle awareness */}`.** `[read]` **Die gehoert zu `Today`,
nicht zu Extended** ? **gemeldet, nicht angefasst.**

`[cmd]` **Im Bau existiert die Zeitleiste bereits als Attrappe**
(`tab-extended.tsx:264`, *,,Cycle timeline · 16 weeks"*) ? **die
echte Kachel steht jetzt darueber.**

`[read]` **Nichts zu entscheiden, nichts zu erfinden.**

### A6 — die Proben

    apps/web   1620 / 1620 gruen   (1613 gefordert)
    tsc        EXIT 0, keine Meldung

`[cmd]` **Sieben neue Waechter** (`g428-reiter-und-vorlage.test.ts`),
**davon drei, die RECHNEN statt zu suchen:** **die Klammer wird mit
echten Werten aufgerufen** ? `'injektionen'` **und fuenf weitere
Tippfehler muessen fallen, und JEDER Reiter der Leiste muss sich
selbst ergeben.**

`[cmd]` **Ein Waechter bindet die Testkopie der Klammer an den Hook**
? **ohne ihn koennte `tab-url.ts` sich aendern, waehrend die Proben
weiter die alte Fassung messen.**

`[cmd]` **Ein Waechter haelt A5 fest** ? **er liest die Vorlage und
faellt, wenn `CycleTimeline` verschwindet.**

## Ein Befund, der ueber diesen Punkt hinausgeht

`[cmd]` **Die Luecke ist NICHT auf supplements beschraenkt.**
**Gemessen** (`tools/_g428-foto.mjs`), `?tab=gibtesnicht` **gegen
den Standard:**

    Modul        Standard   ?tab=gibtesnicht
    ------------------------------------------
    training       11             1
    recovery       17             1
    medical        11             1
    goals          13             1
    nutrition      14            14   (klammert schon)
    coach          13            13   (klammert schon)

`[read]` **Vier weitere Module zeigen bei jedem Tippfehler eine
Seite ohne Inhalt** ? **dieselbe Ursache, derselbe Hook.**

`[cmd]` **Zwei klammern bereits** ? **`nutrition` und `coach`
fuehren ihre Reiter anders.**

`[read]` **NICHT gebaut** ? **der Auftrag nennt supplements.** **Die
Klammer im Hook ist vorbereitet: diese vier Module brauchen je eine
Zeile** (`useTabParam('<standard>', <liste>)`). **Das ist ein
eigener Punkt, wenn Tom ihn will.**

## Was NICHT gebaut wurde

**1 ? Die vier anderen Module.** `[read]` **Siehe oben** ? gemessen,
gemeldet, nicht angefasst.

**2 ? Die Protokollliste auf echte Zeilen.** `[read]` **Steht seit
G-389/A4 offen** (`tab-injektionen.tsx:525` rendert `INJ_PROTOKOLL`)
? **dieser Auftrag beruehrt sie nicht.**

**3 ? `Active protocols` und `Cycle timeline` bleiben Attrappen.**
`[read]` **Sie tragen ihre Marke weiter und stehen jetzt UNTER dem
Echten** ? **das Umstellen der Entwurfsfassungen auf echte Daten ist
nicht beauftragt.**

**4 ? Nichts in `supabase/`.** `[cmd]` **`git status supabase/` ist
leer.**

**5 ? Nichts in `packages/ui`.**

**6 ? Nicht committet, nicht gestaged.**

## Neustart

`[cmd]` **NICHT noetig** ? **nur `apps/web/src` und `tools/`.**
`[read]` **Heisses Nachladen hat waehrend der Messungen gegriffen**
? **die Zahlen vorher/nachher stammen aus demselben laufenden
Server.**

## Abnahme

_(vom Orchestrator)_
