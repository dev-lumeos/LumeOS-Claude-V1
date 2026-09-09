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

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
