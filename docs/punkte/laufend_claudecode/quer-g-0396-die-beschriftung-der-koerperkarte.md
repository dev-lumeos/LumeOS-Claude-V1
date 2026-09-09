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
