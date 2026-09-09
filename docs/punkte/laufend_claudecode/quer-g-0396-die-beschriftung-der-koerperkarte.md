---
nr: G-396
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-393
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - packages/ui/src/koerperkarte.tsx
zahlen:
  gemessen: 2026-09-08
  punkte: 10
---

# G-396 — die Beschriftung der Koerperkarte

## Befund

Tom, 2026-09-08, am Schirm: *,,ja karte ist da, aber nicht lesbar.
ich hab gesagt: die beschriftung weiter ausserhalb lesbar und mit
feinen linien auf den punkt zeigen."*

`[cmd]` **`packages/ui/src/koerperkarte.tsx:326`:**

    <text x={x} y={y + r + 28} textAnchor="middle"
          fill="var(--fg)" fontSize="22" fontWeight="600">
      {p.label}
    </text>

`[read]` **Die Beschriftung steht 28 px UNTER dem Punkt, mittig
darauf.**

`[cmd]` **Bei zehn Punkten je Ansicht ueberlappen sie** ? **auf dem
Bildschirmfoto sind *Deltoid* und *Vastus lateralis* nicht mehr
trennbar.**

`[read]` **Und es wird schlimmer:** `[cmd]` **G-395 schlaegt sechs
weitere Punkte vor.**

## Was Tom verlangt

    Beschriftung   weiter aussen, ausserhalb der Figur
    Linie          fein, vom Text zum Punkt
    Lesbar         auch wenn Punkte nahe beieinander liegen

`[read]` **Das ist die uebliche Bauart fuer beschriftete
Koerperbilder** ? **Text am Rand, Fuehrungslinie zum Ort.**

## Was zu messen ist, bevor gebaut wird

`[cmd]` **`packages/ui` gehoert Admin und Coach mit** ? **die Karte
hat drei Aufrufer:**

    ErmuedungsKarte     Muskeln eingefaerbt, KEINE Punkte
    AktivierungsKarte   Muskeln eingefaerbt, KEINE Punkte
    InjektionsKarte     Punkte ueber der Figur

`[read]` **Nur der dritte zeigt Beschriftungen** ? **eine Aenderung
an der Punktbeschriftung trifft die anderen zwei nicht.**

`[cmd]` **Das ist zu belegen, nicht anzunehmen.**

## Wie es gebaut werden koennte

`[read]` **Der Text wandert an den Rand der Ansicht, links oder
rechts je nach `xPct`.**

`[read]` **Die Linie geht vom Textende zum Punkt** ? **eine
`<line>` oder ein `<path>` mit Knick.**

`[cmd]` **Und die Hoehe muss verteilt werden** ? **zwei Punkte auf
derselben Hoehe brauchen zwei Zeilen, sonst ueberlappt der Text
wieder.**

`[read]` **Das ist der eigentliche Teil der Arbeit:** **nicht die
Linie, sondern die Verteilung.**

`[cmd]` **Bei acht Punkten je Ansicht und einer Zeilenhoehe von
etwa 26 px** ? **das passt, aber es muss gerechnet werden.**

## Was NICHT zu tun ist

`[read]` **Keine Beschriftung weglassen** ? **ein Punkt ohne Namen
ist nutzlos.**

`[read]` **Und kein Aufklappen bei Ueberfahren** ? **die Karte
soll lesbar sein, nicht erkundbar.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Zuerst belegen, dass nur ein Aufrufer betroffen ist

`[cmd]` **Drei Aufrufer:** `ErmuedungsKarte`, `AktivierungsKarte`,
`InjektionsKarte`.

`[read]` **Nur der dritte uebergibt `punkte`** ? **das ist zu
messen, nicht anzunehmen.**

`[read]` **Wenn einer der anderen zwei doch Punkte zeigt: melden,
bevor du etwas aenderst.**

### 2 · Die Verteilung ist die Arbeit

`[read]` **Nicht die Linie** ? **die ist eine `<line>`.**

`[cmd]` **Zehn Punkte, verteilt auf zwei Ansichten** ? **fuenf bis
sechs je Seite.**

`[read]` **Zwei Punkte auf aehnlicher Hoehe brauchen zwei Zeilen,
sonst ueberlappt der Text wieder, nur weiter aussen.**

`[read]` **Miss zuerst, wie nah sie sich kommen** ? `yPct` **steht
in `INJEKTIONS_ORTE`.**

`[cmd]` **`delt_l` 0.22, `lat_l` 0.32, `glute_l` 0.52, `vg_l` 0.48,
`quad_l` 0.65** ? **`vg` und `glute` liegen 0.04 auseinander.**

### 3 · Links und rechts

`[read]` **Ein Punkt links der Mitte bekommt seinen Text links,
einer rechts davon rechts.**

`[cmd]` **`xPct < 0.5`** ? **die Entscheidung ist einfach, die
Ausrichtung des Textes folgt** (`textAnchor="end"` links,
`"start"` rechts).

### 4 · Was mit dem Abstand geschieht

`[cmd]` **Die Ansicht hat heute eine feste Breite** ? **miss sie,
und ob daneben Platz ist.**

`[read]` **Wenn nicht: die Figur schmaler machen, nicht den Text
hineinschieben.**

### Abnahmebedingungen

    A1  nur InjektionsKarte uebergibt punkte. Belegt.
    A2  zehn Beschriftungen, keine ueberlappt.
        Bildschirmfoto beider Ansichten.
    A3  je Text eine Linie zum Punkt. Sichtbar im Foto.
    A4  vg_l und glute_l (0.48 gegen 0.52): beide lesbar.
    A5  ErmuedungsKarte und AktivierungsKarte unveraendert.
        Bildschirmfoto von recovery.
    A6  1529 Tests bleiben gruen.

### Was nicht zu tun ist

**Keine Beschriftung weglassen** ? **ein Punkt ohne Namen ist
nutzlos.**
**Kein Aufklappen bei Ueberfahren** ? **die Karte soll lesbar
sein, nicht erkundbar.**
**Die sechs fehlenden SubQ-Punkte NICHT anlegen** ? **das ist
G-395, eine Entscheidung.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### Vorbemerkung: zwei Auftraege, einer gebaut

`[read]` **G-394 (Ladezustand und settings) und G-396 kamen
zusammen.** `[cmd]` **Gebaut ist G-396** — Tom wartet am Schirm, und
der Auftrag ist in sich abgeschlossen. `[read]` **G-394 ist nicht
angefasst:** keine `loading.tsx` in der Schale, `settings`
unveraendert. **Nichts halb begonnen.**

### A1 ? Nur `InjektionsKarte` uebergibt Punkte

`[cmd]` **In `koerperkarte.tsx` gemessen:**

    ErmuedungsKarte    (393)  baut `muskeln`, uebergibt `muskeln={muskeln}`
    AktivierungsKarte  (414)  baut `muskeln`, uebergibt `muskeln={muskeln}`
    InjektionsKarte    (438)  baut `punkte`,  uebergibt `punkte={punkte}`

`[cmd]` **Und kein Aufrufer reicht `punkte` von aussen nach** —
`rg` ueber `apps/web/src` und `packages`, mit drei Zeilen Umfeld je
Treffer: **0 Fundstellen.**

`[read]` **Wichtig, weil die Typen es zuliessen:** beide Muskelkarten
nehmen `Omit<KoerperkarteProps, 'muskeln' | 'legende'>` — **`punkte`
ist darin NICHT ausgeschlossen.** Ein Aufrufer koennte es also
uebergeben. **Er tut es nur nirgends**, und genau das war zu messen.

### A2 ? Zehn Beschriftungen, keine ueberlappt

`[cmd]` **Am Schirm gemessen**, Kaesten paarweise auf Schnitt
geprueft:

    Beschriftungen   10
    Fuehrungslinien  10
    Ueberlappungen   KEINE

`[cmd]` **Bildschirmfoto beider Ansichten:
`backup/g396-karte.png`.** Vorne Deltoid und Quadriceps, hinten
Latissimus, Ventrogluteal und Gluteus — **alle ausserhalb der Figur,
links linksbuendig, rechts rechtsbuendig.**

#### Zwei Fassungen unterwegs, beide gemessen und verworfen

`[cmd]` **Erste Fassung: Rand 300, Schrift 22** ? *„svg am Schirm
200 px, viewBox-Breite 1324, Faktor 0,151. Text 4 px hoch."*
**Unlesbar, und die Figur war winzig.**

`[read]` **Die Ursache war `maxWidth: breite`:** die erlaubte Breite
galt dem RAHMEN, nicht der Figur. **Waechst der Rahmen fuer die
Beschriftung, muss die erlaubte Breite mitwachsen** — sonst zahlt die
Figur fuer den Text.

`[cmd]` **Zweite Fassung: Rand 200, Schrift 34, Breite mitgewachsen**
? Faktor 0,246, **Text 10 px hoch.** Lesbar.

### A3 ? Je Text eine Linie zum Punkt

`[cmd]` **10 `polyline`-Elemente, eines je Beschriftung** — im Foto
sichtbar als feine Linie vom Textende zum Punkt.

`[read]` **Zweigeteilt, nicht schraeg:** waagerecht vom Text bis
neben den Punkt, dann der kurze Schwenk auf den Punkt. **Eine
Diagonale ueber die halbe Figur waere schwerer zu verfolgen.**

`[cmd]` **`vectorEffect="non-scaling-stroke"`** — dieselbe Technik
wie beim Umriss. **Ohne sie wird die Linie beim Herunterrechnen auf
200 px unsichtbar.**

### A4 ? `vg_l` und `glute_l`: beide lesbar ? und eine Einschraenkung

`[cmd]` **Gemessen:**

    Ventrogluteal L   786..796
    Gluteus L         800..810

**4 px Abstand, keine Ueberlappung.** Dasselbe rechts.

`[cmd]` **Aber: das ist NICHT das Verdienst der Entzerrung.** Ich
habe sie versuchsweise entfernt und erneut gemessen — **dieselben
Werte.** `[read]` **Bei 0.04 Abstand (58 Einheiten) und Schrift 34
reicht der natuerliche Abstand schon.**

`[cmd]` **Die Entzerrung ist heute wirkungslos, und auch mit den
sechs Punkten aus G-395 bliebe sie es** — nachgerechnet, alle sechs
liegen weit genug auseinander. `[cmd]` **Sie wirkt erst ab etwa 0.03
Abstand:** zwei Punkte 0.01 auseinander bekommen 46 Einheiten statt
14.

`[read]` **Ich habe sie trotzdem drin gelassen und sage warum:** der
Auftrag nennt sie ausdruecklich (*„zwei Punkte auf aehnlicher Hoehe
brauchen zwei Zeilen"*), und sie kostet nichts. **Aber sie als
Loesung fuer A4 auszugeben waere falsch** — A4 loest der aeussere
Rand, nicht die Entzerrung.

### A5 ? Die zwei Muskelkarten sind unveraendert

`[cmd]` **Vier Figuren in `recovery` gemessen:**

    viewBox "0 0 724 1448"   /  "724 0 724 1448"
    Punkte 0, Linien 0, Breite 150 px

**Der Rahmen ist der alte**, weil `hatPunkte` falsch ist.
`[cmd]` **Bildschirmfoto: `backup/g396-recovery.png`** — die
Muskelkarte wie zuvor, drei Farbstufen, keine Beschriftung.

`[cmd]` **Sabotageprobe belegt die Bedingung:** `hatPunkte = true`
gesetzt ? **recovery bekam `viewBox="-200 0 1124 1448"` und 233 px
Breite.** Zurueckgebaut, wieder `0 0 724`.

### A6 ? 1529 -> 1534 Tests gruen

`[cmd]` **tsc** sauber, **`next lint`** sauber, **1534 pass / 0
fail** (fuenf neue). `[cmd]` **`encoding-pruefen`: 21.132 Dateien
sauber.** `[cmd]` **Und der Hydrationsfehler aus G-392 bleibt
behoben** — `SAUBER (2 Laeufe)`.

`[read]` **Die neuen Waechter stehen in `apps/web`, nicht in
`packages/ui`** — **dort gibt es keinen Testlauf** (kein
`__tests__`, keine Einbindung). **Einen einzurichten waere ein
eigener Auftrag**; der Test liest die Quelle stattdessen von hier.

**Sabotageprobe, je Waechter einzeln:**

    Entzerrung entfernt    -> not ok 3
    `hatPunkte = true`     -> not ok 4

**Beide zurueckgenommen, 5/5 gruen.**

### `packages/ui` ? geaendert, mit Begruendung

`[read]` **Diesmal ging es nicht ohne.** Die Beschriftung ist ein
`<text>` mit gerechneter Position, die Linie ein neues Element —
**beides steht in `koerperkarte.tsx`, und CSS erreicht es nicht.**

`[cmd]` **Der Eingriff ist auf den Punktzweig begrenzt:** alles
Neue haengt an `hatPunkte` oder steht im
`punkte.filter(...)`-Block. **Die Muskelkarten sind nachweislich
unberuehrt** (A5, mit Sabotageprobe).

`[read]` **Gemeldet, nicht stillschweigend:** Admin und Coach nutzen
das Paket mit. **Wenn du den Eingriff anders willst, ist das deine
Entscheidung** — die Alternative waere eine eigene Beschriftungs-
schicht in `apps/`, die die Punkte ein zweites Mal positioniert.
**Zwei Wahrheiten ueber dieselbe Figur**, und genau das war der
Befund aus G-388.

### Was offen bleibt

**1 ? G-394 ist nicht angefasst** (Ladezustand in der Schale,
settings-Kopf). **Eigener Durchgang.**

**2 ? Die sechs SubQ-Punkte** bleiben ungebaut ? G-395, deine
Entscheidung. `[cmd]` **Nachgerechnet: sie passen ohne Entzerrung**,
die Beschriftung traegt sie.

**3 ? `packages/ui` hat keinen Testlauf.** `[read]` **Meine fuenf
Waechter lesen die Datei von `apps/web` aus** — das geht, ist aber
ein Umweg. **Ein Testlauf im Paket waere der gerade Weg.**


## Abnahme

_(vom Orchestrator)_

## Auftrag 2 — die Punkte liegen falsch

Tom, 2026-09-08, am Schirm: *,,seit wann ist der quadriceps am knie
und latissimus am triceps?"*

`[read]` **Er hat recht, und der Orchestrator hat die Koordinaten
nie geprueft.**

`[cmd]` **`packages/ui/src/koerperkarte-pfade.ts`, gemessen:**

    quad_l   xPct 0.38  yPct 0.65   <- Kniehoehe
    lat_l    xPct 0.32  yPct 0.32   <- Oberarm
    tricep_l xPct 0.22  yPct 0.34   <- daneben
    vg_l     xPct 0.35  yPct 0.48   <- ueber glute
    glute_l  xPct 0.42  yPct 0.52

`[read]` **Die Figur reicht von 0 bis 1** ? **0.65 ist das Knie,
nicht der Oberschenkel.**

`[read]` **Und `lat` bei 0.32/0.32 liegt fast auf `tricep`
(0.22/0.34)** ? **beide am Oberarm, obwohl der Latissimus am Rumpf
sitzt.**

`[read]` **`vg` ueber `glute` ist ebenfalls falsch** ? **der
Ventrogluteus liegt SEITLICH am Beckenkamm, nicht darueber.**

### Was zu tun ist

`[read]` **Die Koordinaten gegen die Figur pruefen** ? **nicht
gegen eine Vorstellung.**

`[cmd]` **Die Muskelpfade stehen in derselben Datei** ? **miss, wo
der Quadriceps-Pfad tatsaechlich liegt, und setz den Punkt in
seine Mitte.**

`[read]` **Dasselbe fuer Latissimus, Ventrogluteus, Gluteus.**

`[read]` **Und dann alle zehn** ? **wenn drei falsch sind, sind es
vermutlich mehr.**

### Und die sechs fehlenden SubQ-Punkte

Tom: *,,wir haben 16 injektionsstellen und gezeigt werden 10."*

`[read]` **G-395 hat es als Entscheidung angelegt** ? **das war zu
vorsichtig.**

`[cmd]` **Die sechs sind `abd_l/r`, `sq_delt_l/r`,
`thigh_sq_l/r`** ? **alle SubQ.**

`[read]` **Bau sie** ? **subkutan liegt flacher und weiter aussen
als intramuskulaer, das ist die Regel.**

    abd_l/r        Bauch, seitlich vom Nabel
    sq_delt_l/r    versetzt neben delt, weiter aussen
    thigh_sq_l/r   Oberschenkel aussen, ueber quad

`[cmd]` **Und `pec`, `bicep`, `tricep` bleiben** ? **sie gehoeren
zur Erholungskarte, nicht zu den Injektionen** (dein eigener Satz
aus G-393).

### Zusaetzliche Abnahmebedingungen

    A7  je der zehn bestehenden Punkte: liegt er im richtigen
        Muskel? Gegen den Pfad gemessen, nicht geschaetzt.
    A8  die sechs SubQ-Punkte angelegt. 16 von 16 auf der Figur.
        Bildschirmfoto.
    A9  ErmuedungsKarte unveraendert -- die Muskelpfade werden
        NICHT angefasst, nur die Punktkoordinaten.

## Auftrag 3 — keine Punkte, sondern Flaechen

Tom, 2026-09-08: *,,diese muskelbildkomponente hat die meisten
muskeln und die sind sogar beschriftet. was sucht man da stellen on
top heraus? der bodybuilder weiss schon wo exakt, er muss nur wissen
welcher bereich dran ist."*

`[read]` **Das macht Auftrag 1 und 2 hinfaellig** ? **die Punkte
sind der falsche Ansatz.**

### Was die Karte schon hat

`[cmd]` **`koerperkarte-pfade.ts`: 37 Eintraege, davon 21
Muskelflaechen:**

    chest      abs        obliques    biceps
    triceps    deltoids   trapezius   neck
    forearm    adductors  quadriceps  knees
    tibialis   calves     gluteal     hamstring
    head       hair       hands       ankles   feet

`[cmd]` **Und die uebrigen 16 sind die Punkte** ? **`delt_l`,
`quad_l`, `vg_l` und so fort.**

`[read]` **Die Flaechen sind da, beschriftet und anatomisch
richtig** ? **die Punkte liegen daneben und sind es nicht.**

### Links und rechts geht

`[cmd]` **Jeder Muskel hat `paths` als Array** ? **mehrere Pfade je
Muskel.**

`[cmd]` **`obliques` traegt sogar den Kommentar `// right`.**

`[read]` **Eine Seite laesst sich also einzeln einfaerben** ?
**das ist zu belegen, aber es sieht danach aus.**

### Die Zuordnung

`[cmd]` **Die 16 Orte aus `medical.injection_sites`:**

    delt_l/r      -> deltoids, je Seite
    quad_l/r      -> quadriceps
    glute_l/r     -> gluteal
    vglute_l/r    -> gluteal, obere aeussere Ecke
    lat_l/r       -> latissimus  (FEHLT in den Flaechen)
    abd_l/r       -> abs oder obliques
    sq_delt_l/r   -> deltoids
    thigh_sq_l/r  -> quadriceps

`[read]` **Zwei Orte teilen sich eine Flaeche:** `glute` **und**
`vglute`, `delt` **und** `sq_delt`, `quad` **und**
`thigh_sq`.

`[read]` **Das ist kein Problem, sondern der Punkt:** **der
Bodybuilder sieht, welcher BEREICH dran ist.**

`[cmd]` **Und `latissimus` fehlt unter den Flaechen** ? **messen,
ob `trapezius` ihn mit abdeckt oder ob eine Flaeche fehlt.**

### Was zu bauen ist

`[read]` **Die Rotationskarte faerbt Flaechen, nicht Punkte.**

`[cmd]` **`ErmuedungsKarte` macht es schon so** ? **dieselbe
Technik, andere Daten.**

`[read]` **Die Farbe kommt aus `siteState`** (Injection Planner
5.1): `fresh`, `ready`, `soon`, `resting`.

`[read]` **Und wo zwei Orte eine Flaeche teilen: die dringendere
Farbe gewinnt** ? **oder es wird geteilt, wenn die Pfade es
hergeben.**

### Die Beschriftung

`[read]` **Sie ist damit weitgehend erledigt** ? **die Flaechen
sind schon beschriftet.**

`[cmd]` **Miss, ob die Beschriftung der Flaechen sichtbar ist oder
nur im Pfadnamen steht.**

### Abnahmebedingungen — ersetzen A1 bis A9

    A1  laesst sich EINE Seite eines Muskels einfaerben?
        Belegt an deltoids oder quadriceps.
    A2  die Zuordnung 16 Orte -> Flaechen. Je Ort die
        Flaeche, und wo zwei sich teilen.
    A3  latissimus: eigene Flaeche oder von trapezius
        gedeckt? Gemessen.
    A4  die Karte faerbt Flaechen. Bildschirmfoto beider
        Ansichten.
    A5  ohne Protokollzeilen: alle in "nie"-Farbe, mit
        benanntem Hinweis.
    A6  ErmuedungsKarte unveraendert. Foto von recovery.
    A7  die 16 Punkte in INJEKTIONS_ORTE: noch gebraucht?
        Wenn nein, melden -- nicht loeschen.
    A8  1529 Tests bleiben gruen.

### Was nicht zu tun ist

**Keine Punkte mehr verschieben** ? **Auftrag 1 und 2 sind
hinfaellig.**
**Keine Muskelpfade aendern** ? **sie sind anatomisch richtig.**
Nicht committen, nicht stagen, nicht pushen.

## Auftrag 4 — endgueltig, mit Auswahl und Modal

Tom, 2026-09-08: *,,die injektionsorte sollen auch anwaehlbar sein
wie in muscle soreness, und ein modal mit all den werten betreffs
punkt und daten dazu, die wir haben oder haben werden. sowie die
farblichen unterscheidungen logisch nach gebrauch wie in muscle
soreness."*

`[read]` **Auftrag 1, 2 und 3 sind damit ueberholt** ? **das hier
gilt.**

### `Koerperkarte` KANN das schon

`[cmd]` **`packages/ui/src/koerperkarte.tsx:205`:**

    onPick?: (id: string, typ: 'muscle' | 'point',
              daten?: unknown) => void

`[cmd]` **Zeile 313: `onClick` auf der Muskelflaeche.**
`[cmd]` **Zeile 314-315: `role="button"`, `tabIndex`.**
`[cmd]` **Zeile 320: Tastaturbedienung.**

`[read]` **Es ist gebaut und wird von der Injektionskachel nicht
benutzt** ? **fuenfzehnter A-71-Fall.**

### Wie `tab-checkin` es macht — die Vorlage

`[cmd]` **`recovery/tab-checkin.tsx:122-150`:**

    <Koerperkarte
      muskeln={katerAlsMuskeln(soreness)}
      ausgewaehlt={sel ? RECOVERY_ZU_KARTE[sel] : null}
      legende={[
        { color: 'var(--surface-2)', label: '0 none' },
        { color: 'var(--acc-recov)', label: '1 mild' },
        { color: 'var(--warn)',      label: '2 moderate' },
        { color: 'var(--neg)',       label: '3 severe' },
      ]}
      onPick={(id, typ) => {
        if (typ !== 'muscle') return
        const slug = KARTE_ZU_RECOVERY[id]
        if (slug) { cycle(slug); setSel(slug) }
      }}
    />
    {sel && ( ...Detailzeile... )}

`[read]` **Vier Stufen, eine Zuordnungstabelle in beide
Richtungen, und eine Detailzeile unter der Karte.**

`[cmd]` **Und der Kommentar Zeile 116-121 sagt, warum dort NICHT
`ErmuedungsKarte` steht:** *,,zwei Legenden nebeneinander, die
dieselbe Flaeche verschieden benennen, sind schlimmer als
keine."*

### 1 · Flaechen statt Punkte

`[cmd]` **21 Muskelflaechen sind da** ? `quadriceps`, `gluteal`,
`deltoids`, `abs`, `obliques`, `trapezius` **und weitere.**

`[cmd]` **Jeder Muskel hat `paths` als Array, `obliques` traegt den
Kommentar `// right`** ? **eine Seite laesst sich einzeln
einfaerben.**

**Die Zuordnung, 16 Orte auf Flaechen:**

    delt_l/r      -> deltoids          je Seite
    sq_delt_l/r   -> deltoids          dieselbe Flaeche
    quad_l/r      -> quadriceps
    thigh_sq_l/r  -> quadriceps        dieselbe Flaeche
    glute_l/r     -> gluteal
    vglute_l/r    -> gluteal           dieselbe Flaeche
    abd_l/r       -> abs oder obliques
    lat_l/r       -> latissimus        FEHLT, messen

`[read]` **Wo zwei Orte eine Flaeche teilen: die dringendere Farbe
gewinnt** ? **und das Modal zeigt beide.**

### 2 · Die Farben nach Gebrauch

`[cmd]` **`Injection Planner:117-135` nennt vier Zustaende:**

    fresh     nie benutzt
    ready     rest_remaining < 0
    soon      rest_remaining >= 0
    resting   rest_remaining > 1

`[read]` **Dieselbe Machart wie Muscle Soreness** ? **vier Stufen,
eine Legende, die zur Skala gehoert.**

`[read]` **Und je Ort mit SEINEM `rest_days`** ? **Deltoid 5 Tage,
Gluteus 7.** `[read]` **Nicht *,,vor 7 Tagen"*, sondern *,,noch 2
Tage Ruhe"*.**

### 3 · Klick oeffnet ein Modal

`[read]` **Nicht eine Zeile darunter wie im Check-in** ? **Tom
verlangt ein Modal.**

**Was hineingehoert, aus dem was da ist:**

    aus injection_sites
      display_name, route (im/sc)
      minimum_rest_days + _reason
      rotation_distance_mm
      rotation_quadrant_interval_days

    aus injection_logs        (0 Zeilen -- dann: nie benutzt)
      letzter Einstich, volume_ml, pain_score
      complication, substance_name

    aus injection_needle_recommendations   (8 Zeilen)
      Nadelgroesse -- ueber die ORTSART, nicht den Ort
      (C-445, A5)

    aus injection_tissue_condition_guidance (1 Zeile)
      Gewebehinweis

`[cmd]` **Und `injection_site_conditions` hat 0 Zeilen** ?
**messen, was sie traegt, und ob sie ins Modal gehoert.**

`[read]` **Was es noch nicht gibt, wird benannt, nicht
erfunden** ? **E-72: keine nackte Null, aber auch keine
Attrappe.**

### Abnahmebedingungen — ersetzen ALLE vorherigen

    A1  die Karte faerbt Flaechen, nicht Punkte.
        Bildschirmfoto beider Ansichten.
    A2  laesst sich EINE Seite einfaerben? Belegt an
        deltoids oder quadriceps.
    A3  die Zuordnung 16 Orte -> Flaechen, je genannt.
        Und: latissimus vorhanden oder nicht.
    A4  vier Farbstufen nach siteState, je Ort mit SEINEM
        rest_days. Zahl: 16 Orte / je Zustand.
    A5  Klick oeffnet ein Modal. Foto.
    A6  im Modal: welches Feld aus welcher Tabelle.
        Zahl: Felder / gefuellt / benannt leer.
    A7  Tastaturbedienung: Tab zur Flaeche, Enter oeffnet.
    A8  wo zwei Orte eine Flaeche teilen: beide im Modal.
    A9  ErmuedungsKarte unveraendert. Foto von recovery.
    A10 1529 Tests bleiben gruen.

### Was nicht zu tun ist

**Keine Punkte mehr** ? **die 16 Eintraege in `INJEKTIONS_ORTE`
bleiben stehen, werden aber nicht mehr benutzt. Melden, nicht
loeschen.**
**Keine Muskelpfade aendern** ? **sie sind anatomisch richtig.**
**Nichts erfinden, was die Tabellen nicht tragen.**
Nicht committen, nicht stagen, nicht pushen.

## Auftrag 5 — es ist eine Kopie, keine Neuentwicklung

Tom, 2026-09-08: *,,anstatt von trainingsdaten kommen einfach
injektionsdaten rein, kann ja nicht so schwer sein."*

`[read]` **Er hat recht, und die vorherigen vier Auftraege waren zu
kompliziert gedacht.**

### Die Vorlage ist vierzehn Zeilen

`[cmd]` **`recovery/muskel-zuordnung.ts:249-270`:**

    const KATER_FARBE = [
      'var(--surface-2)',   // 0 none
      'var(--acc-recov)',   // 1 mild
      'var(--warn)',        // 2 moderate
      'var(--neg)',         // 3 severe
    ]

    export function katerAlsMuskeln(werte) {
      const raus = []
      for (const [slug, wert] of Object.entries(werte)) {
        if (wert == null) continue
        const id = RECOVERY_ZU_KARTE[slug]
        if (!id || !MUSKELN[id]) continue
        const stufe = Math.min(Math.max(Math.round(wert), 0), 3)
        const schon = raus.find(r => r.id === id)
        // Deltoids: der schlechtere Wert gewinnt.
        if (schon) {
          if (stufe > schon.stufe) { ... }
          continue
        }
        raus.push({ id, color: KATER_FARBE[stufe], opacity: 0.85, stufe })
      }
      return raus
    }

`[read]` **Drei Dinge, und alle drei braucht die Injektionskarte
auch:**

**1** ? **eine Zuordnungstabelle `Wert -> Flaeche`.**
**2** ? **vier Farben.**
**3** ? **bei doppelter Belegung gewinnt der dringendere Wert.**

`[cmd]` **Punkt 3 ist genau der Fall `glute`/`vglute`,
`delt`/`sq_delt`, `quad`/`thigh_sq`** ? **die Loesung steht schon
da.**

### Also: `injektionAlsMuskeln`

    const ZUSTAND_FARBE = {
      fresh:   'var(--surface-2)',   // nie benutzt
      ready:   'var(--pos)',         // frei
      soon:    'var(--warn)',        // bald frei
      resting: 'var(--neg)',         // ruht
    }

    ORT_ZU_KARTE = {
      delt_l: 'deltoids_l',  sq_delt_l: 'deltoids_l',
      quad_l: 'quadriceps_l', thigh_sq_l: 'quadriceps_l',
      glute_l: 'gluteal_l',  vglute_l: 'gluteal_l',
      abd_l: 'abs',  lat_l: 'latissimus_l',
      ... je Seite
    }

`[read]` **Dieselbe Machart, andere Quelle** ? **`siteState` statt
`soreness`.**

`[cmd]` **`siteState` steht in `Injection Planner:117-135` und
rechnet je Ort mit SEINEM `rest_days`.**

### Und der Klick ist auch schon gebaut

`[cmd]` **`tab-checkin.tsx:132`:**

    onPick={(id, typ) => {
      if (typ !== 'muscle') return
      const slug = KARTE_ZU_RECOVERY[id]
      if (slug) { cycle(slug); setSel(slug) }
    }}

`[read]` **Dieselbe Rueckrichtung** ? `KARTE_ZU_ORT`.

`[read]` **Nur der Klick oeffnet ein Modal statt eine Zeile
darunter** ? **das ist der einzige echte Unterschied.**

### Was das fuer den Aufwand heisst

`[read]` **Eine Zuordnungsdatei nach dem Muster von
`muskel-zuordnung.ts`, ein Modal, und die Kachel ruft
`Koerperkarte` mit `muskeln=` statt `punkte=`.**

`[read]` **Die 16 Punkte in `INJEKTIONS_ORTE` werden nicht mehr
gebraucht** ? **stehen lassen, melden.**

**Die Abnahmebedingungen aus Auftrag 4 bleiben.**

---

## Bericht zu Auftrag 4 und 5

### Vorbemerkung: Auftrag 5 beschreibt, was gebaut ist

`[read]` **Auftrag 5 nennt die Vorlage** ? `katerAlsMuskeln` in
`recovery/muskel-zuordnung.ts:249-270` ? **und genau nach dem
Muster ist es gebaut:** eine Zuordnungsdatei, ein Modal, und die
Kachel ruft `Koerperkarte` mit `muskeln=` statt `punkte=`.

`[cmd]` **Ein Unterschied:** Auftrag 5 schreibt Flaechen wie
`deltoids_l` und `latissimus_l`. **Die gibt es in `MUSKELN` nicht**
? sie fuehrt `deltoids` als EINE Flaeche aus mehreren Pfaden, und
`latissimus` gar nicht (A3). `[read]` **Deshalb Flaeche PLUS Seite
als Schluessel**, und die Seite entsteht aus der x-Lage des Pfades.
**Die Wirkung ist dieselbe: eine Haelfte allein einfaerbbar** (A2).

### A1 ? Die Karte faerbt Flaechen, keine Punkte

`[cmd]` **Am Schirm gemessen** (`test-user@lumeos.local`,
`backup/g396a4-karte.png`):

    Punkte (data-punkt)        0
    gefaerbte Flaechenhaelften 34
    Koerperkarten              2   viewBox "0 0 724 1448" / "724 0 724 1448", je 200 px

`[read]` **Die Kachel ruft jetzt `Koerperkarte` mit `muskeln=`**,
nicht `InjektionsKarte` mit `punkte=`. **Dieselbe Datei, dieselben
Pfade, anderer Zweig** ? genau der aus `muscle soreness`.

`[cmd]` **34 gefaerbte Haelften bei 10 Flaechenhaelften:** eine
Flaeche besteht aus mehreren Pfaden (obliques allein aus 16), und
jeder traegt die Farbe seiner Haelfte.

### A2 ? Eine Seite allein, gemessen

`[cmd]` **`deltoids` liefert vier Haelften mit vier verschiedenen
x-Werten** (383, 453 vorne; 593, 668 hinten). **Die Zuordnung
entsteht aus der x-Lage des Pfadanfangs**, `(ersterX % 724) < 362`.

`[cmd]` **Der entscheidende Beleg kam aus einer Probezeile:**
`vglute_l` bekam einen Protokolleintrag ?

    gluteal links    var(--acc-suppl)     (benutzt)
    gluteal rechts   var(--fg-dim)        (nie benutzt)

**Eine Haelfte gefaerbt, die andere nicht** ? das war ohne Daten
nicht zu zeigen.

`[cmd]` **Die Zeile ist gezaehlt zurueckgebaut:** 0 -> 1 -> 0 in
`medical.injection_logs`.

### A3 ? Die Zuordnung, und `latissimus` gibt es nicht

`[cmd]` **`MUSKELN` fuehrt 21 Flaechen** (gemessen in
`koerperkarte-pfade.ts`): chest, abs, obliques, biceps, triceps,
deltoids, trapezius, neck, forearm, adductors, quadriceps, knees,
tibialis, calves, gluteal, hamstring, head, hair, hands, ankles,
feet.

`[cmd]` **`latissimus` ist NICHT dabei.** **Die Frage des Auftrags
ist damit beantwortet: nein.**

    delt_l/r        -> deltoids     quad_l/r      -> quadriceps
    sq_delt_l/r     -> deltoids     thigh_sq_l/r  -> quadriceps
    glute_l/r       -> gluteal      abd_l/r       -> obliques
    vglute_l/r      -> gluteal      lat_l/r       -> trapezius  (Naeherung)

`[read]` **`lat_l/r` faellt auf `trapezius`** ? die naechstliegende
vorhandene Flaeche, nicht die anatomisch genaue. **Eine eigene
Latissimus-Flaeche waere neue Pfaddaten in `packages/ui`**, und
Muskelpfade zu aendern verbietet der Auftrag. `[read]` **Das ist eine
Naeherung, keine Loesung** ? sie steht hier, statt still zu bleiben.

`[cmd]` **16 von 16 Orten haben eine Flaeche**, mit Waechter und
Sabotageprobe.

### A4 ? Zwei Farbstufen statt vier, und der Grund ist E-57

`[cmd]` **Der Auftrag verlangt vier Stufen mit je eigenem
`rest_days`** ? *,,Deltoid 5 Tage, Gluteus 7. Nicht ,vor 7 Tagen',
sondern ,noch 2 Tage Ruhe'."*

`[cmd]` **Gemessen: `minimum_rest_days` ist bei ALLEN 16 Orten
NULL**, und `minimum_rest_days_reason` sagt warum:

    E-57: Keine wissenschaftlich validierte Mindest-Ruhezeit
    fuer wiederholte IM-Injektionen.

`[cmd]` **E-57 ist gueltig** (`status: gueltig`, 18 recherchierte
Quellen): **keine Leitlinie von WHO, CDC oder einer
Fachgesellschaft, keine kontrollierte Humanstudie.** *,,Die Zahlen,
die auf TRT-Seiten und in Foren stehen, sind Praxisregeln ? nicht
validierte Grenzwerte."* **Sie schreibt `minimum_rest_days = null`
ausdruecklich vor.**

`[read]` **Die Zahlen der Spec sind genau das, was E-57 nach 18
Quellen verworfen hat.** **Sie einzusetzen hiesse, eine
medizinische Empfehlung zu erfinden** ? und der Auftrag sagt
selbst: *,,NICHTS erfinden, was die Tabellen nicht tragen."*

`[cmd]` **Gebaut sind die zwei Zustaende, die die Daten tragen:**

    nie benutzt   kein Protokolleintrag       var(--fg-dim)
    benutzt       mit Datum des Einstichs     var(--acc-suppl)

`[cmd]` **Und der Grund steht am Schirm**, nicht nur hier:
*,,Keine Ampel nach Ruhetagen: `minimum_rest_days` ist bei allen 16
Orten leer (E-57 ? keine validierte Mindestruhezeit fuer
wiederholte IM-Injektionen)."*

`[read]` **Das ist der eine Punkt des Auftrags, der nicht wie
verlangt gebaut ist.** **Wenn du die Praxiszahlen trotzdem willst,
ist das eine Entscheidung gegen E-57** ? und die gehoert dir, nicht
mir. **Dann waeren es zwei Zeilen je Ort in `injection_sites` und
vier Farben statt zwei.**

### A5 ? Der Klick oeffnet ein Modal

`[cmd]` **Gemessen** (`backup/g396a4-modal.png`):

    Modale vorher / nachher    0 / 1
    aria-label                 "gluteal - links"
    Bloecke                    3   (2 Orte + Gewebehinweise)
    Felder                     12
    Escape schliesst           ja

`[read]` **Ein Modal ueber der Seite**, keine Zeile darunter wie
beim Check-in ? so stand es im Auftrag.

### A6 ? Welches Feld aus welcher Tabelle

`[cmd]` **Je Ort sechs Felder, jedes mit seiner Quelle unter dem
Wert** (am Schirm lesbar, nicht nur im Quelltext):

    Zuletzt benutzt      injection_logs.injected_at
    Mindestruhezeit      injection_sites.minimum_rest_days
    Volumen letzte Gabe  injection_logs.volume_ml
    Substanz             injection_logs.substance_name
    Schmerz              injection_logs.pain_score
    Komplikation         injection_logs.complication

**Dazu je Ort:**

    Nadelempfehlung      injection_needle_recommendations  (ueber site-ART)
    Gewebehinweise       injection_tissue_condition_guidance

`[cmd]` **Mit der Probezeile gemessen: 12 Felder, 9 mit benanntem
Leerhinweis, vier gefuellt** (Datum, Volumen 0,6 ml, Substanz,
Schmerz 1 bei `vglute_l`). `[cmd]` **Ohne sie: 13 Leerhinweise.**

`[read]` **Kein nackter Strich** (E-72): jedes leere Feld nennt den
Grund ? *,,nie benutzt, 0 Protokollzeilen"*, *,,kein Eintrag"*, und
bei der Ruhezeit den Satz aus der Datenbank selbst.

**Was es nicht gibt, ist benannt statt erfunden:**

    Maximalvolumen je Ort   keine Spalte in injection_sites
    Ruhezeit in Tagen       NULL bei allen 16, Grund E-57
    Nadelzeile fuer         Gluteus und Latissimus ? die Tabelle
                            fuehrt nur deltoid, vastus_lateralis,
                            ventrogluteal, subcutaneous

`[cmd]` **Die Nadelempfehlung haengt an der ORTSART, nicht an der
Id** (C-445/A5): **8 Zeilen fuer 16 Orte.** `quad` liest
`vastus_lateralis`, alle vier SubQ-Orte lesen `subcutaneous`.

### A7 ? Tastatur

`[cmd]` **Gemessen:**

    Pfade mit tabindex="0"     34
    Pfade mit role="button"    34
    fokussiert                 path gluteal links
    Enter oeffnet das Modal    ja
    Escape schliesst           ja

`[read]` **Die Karte kann das seit G-55** ? `onPick`, `role`,
`tabIndex`, Enter/Space. **Die Injektionskachel hat es nie
benutzt.** `[cmd]` **Der fuenfzehnte A-71-Fall: Weg vorhanden, kein
Aufrufer.**

### A8 ? Zwei Orte auf einer Flaeche, beide im Modal

`[cmd]` **`gluteal links` traegt `glute_l` und `vglute_l`.** Am
Schirm gemessen:

    "Gluteus L"          JA
    "Ventrogluteal L"    JA
    "Gluteus R"          nein
    "Ventrogluteal R"    nein

`[read]` **Die letzten zwei sind das Entscheidende** ? die rechte
Haelfte gehoert nicht dazu, und der Waechter prueft genau das.
`[cmd]` **Die erste Fassung des Waechters zaehlte nur (2 Orte) und
ueberlebte die Sabotage** ? ohne die Seite im Schluessel waeren es
auch zwei gewesen. **Jetzt vergleicht er die Ids.**

**Welcher Ort die Farbe gibt:** `[read]` **Dringlichkeit waere eine
Ruhezeitrechnung**, die es nach E-57 nicht gibt. **Also der zuletzt
benutzte Ort** ? die vorsichtigere Richtung: sie zeigt Gebrauch an,
statt ihn zu verdecken. **Beide Orte stehen im Modal, jeder mit
eigenem Datum.**

### A9 ? Die Ermuedungskarte ist unveraendert

`[cmd]` **`recovery` gemessen** (`backup/g396a4-recovery.png`):

    viewBox "0 0 724 1448"    150 px   89 Pfade
    viewBox "724 0 724 1448"  150 px   69 Pfade
    (viermal, zwei Karten)

    Punkte                    0
    Pfade mit data-seite      0

`[read]` **`data-seite` steht nur, wo ein Wert eine Seite nennt** ?
und das tut nur die Injektionskachel. **Die Muskelkarten bekommen
kein Attribut und keine Aenderung.**

### A10 ? 1545 Tests gruen

`[cmd]` **tsc sauber, `next lint` sauber, 1545 pass / 0 fail.**
**Der Stand vor dem Auftrag war 1534** (nicht 1529, wie der Text
sagt) ? **elf neue Waechter.**

**Sabotageprobe, je Waechter einzeln:**

    Ort ohne Flaeche (lat_r entfernt)      -> ROT
    erfundene Flaeche (latissimus)         -> ROT
    Ruhezeitzustand 'resting' zurueck      -> ROT
    falscher Spaltenname (site_id)         -> ROT
    Gruppierung ohne Seite                 -> ROT
    Nadelart fuer Gluteus erfunden         -> ROT
    Kachel zeichnet selbst                 -> ROT
    Modal wieder durchsichtig              -> ROT
    Tabellendeckel zurueck                 -> ROT
    tabIndex entfernt                      -> ROT
    Enter entfernt                         -> ROT

**Alle zurueckgenommen, 1545/1545 gruen.**

### Ein Waechter musste weichen ? und warum das richtig ist

`[cmd]` **`tabs-vollstaendig.test.ts` verlangte
`/<InjektionsKarte/`** und fiel beim Umbau. `[read]` **Der Name war
nie die Bedingung** ? *,,da will ich dieselbe grafik wie
recovery/muscle map"* heisst: **aus `@lumeos/ui` zeichnen, nicht
selbst.**

`[read]` **Ein Namensverbot altert zur Blockade.** `[cmd]` **Jetzt
prueft er die Sache:** eine der drei Karten aus dem Paket, keine
lokale `SILHOUETTE`, **und neu: keine Pfaddaten in der Kachel.**
**Die Sabotage ist dieselbe geblieben und macht rot.**

### Zwei Fehler, die nur der Schirm zeigte

`[cmd]` **1. `--surface-1` gibt es nicht.** Das Modal war
durchsichtig ? gemessen `rgba(0, 0, 0, 0)`, die Seite schien
hindurch. `[read]` **Ein unbekanntes CSS-Token faellt stumm auf
durchsichtig zurueck:** kein Fehler, keine Warnung, kein Typfehler.
**`lume.css` fuehrt `--bg-elev` und `--surface-2`.**

`[cmd]` **2. `.v2-supp-tbl-wrap` traegt `min-height: 320px`.** Die
Nadeltabelle ist 135 px hoch ? **185 px Leere mitten im Modal.**
`[read]` **Die geteilte Regel ist fuer die langen Listen der
uebrigen Reiter richtig**, also hat das Modal eine eigene bekommen,
statt vier Reiter mitzuverschieben.

`[read]` **Beide waren im Quelltext unsichtbar und in den Tests
gruen.** **Gefunden hat sie erst die Messung am gerenderten
Element.**

### Was nicht angefasst ist

**1 ? Die 16 Eintraege in `INJEKTIONS_ORTE`** stehen unveraendert
in `packages/ui`. `[cmd]` **Kein Aufrufer mehr** ? gemeldet, nicht
geloescht, wie verlangt.

**2 ? `tageSeitInjektion`** wird von der Kachel nicht mehr gerufen.
`[cmd]` **Die Funktion bleibt** ? 11 Proben haengen daran, und
`injektion-read.ts` reicht sie weiter. **Wenn sie weg soll, ist das
ein eigener Punkt.**

**3 ? Keine Muskelpfade geaendert.** `[cmd]`
`koerperkarte-pfade.ts` ist unberuehrt.

**4 ? G-394 ist weiterhin nicht angefasst** (Ladezustand in der
Schale, settings-Kopf).

### `packages/ui` ? geaendert, mit Begruendung

`[read]` **Ohne ging es nicht.** `[cmd]` **Die Karte konnte je
Flaeche nur EINEN Wert fuehren** (`Record<string, MuskelWert>`) ?
und eine Flaeche hat zwei Haelften mit verschiedenen Farben.

**Geaendert ist:**

    MuskelWert       neues Feld `seite?: 'links' | 'rechts'`
    farben           Record<string, MuskelWert[]> statt <..., MuskelWert>
    Pfadzweig        waehlt den Wert nach der x-Lage der Haelfte
                     + data-seite, role, tabIndex, Enter/Space

`[read]` **Rueckwaertsvertraeglich:** ein Wert ohne `seite` faerbt
weiter beide Haelften. `[cmd]` **A9 belegt es** ? recovery
unveraendert, mit Sabotageprobe.

`[read]` **Gemeldet, nicht stillschweigend:** Admin und Coach
nutzen das Paket mit.

### Neustart

`[cmd]` **`packages/ui` ist geaendert ? Neustart noetig**, die
Schale laedt das Paket einmal.
