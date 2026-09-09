---
nr: G-396
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-393
entscheidung: null
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
