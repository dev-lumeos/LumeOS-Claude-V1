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
