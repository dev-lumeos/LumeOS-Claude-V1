---
nr: G-25
typ: befund
modul: training
schwere: mittel
angelegt: 2026-08-17
braucht: []
kind_von: G-16
kinder: []
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/training/ansicht.tsx
zahlen: null
---

# G-25 - Training an echte Daten anschliessen

## Befund

(neu 2026-08-17).
  Folgt auf C-66.

  `[cmd]` `/v2/training` steht mit **38 Kacheln, alle Attrappe** — der
  Grund war, dass es keine Sitzungen gab. **Seit `106` gibt es sie.**

  `[cmd]` Live liegen 9 Sitzungen, 18 Uebungen, 60 Saetze; dazu die
  Stammdaten mit 1.416 Uebungen, 58 Geraeten und 6.624
  Muskelzuordnungen.

  **Der Tab „Exercises" ist der naechste Schritt.** `[read]` Aus dem
  G-16-Bericht: *vier von sechs Spalten sind sofort da; `e1RM` und
  `Best set` bleiben `—`, weil sie Saetze brauchen.* **Jetzt sind sie
  da.**

  `[cmd]` `e1RM` braucht eine Formel — `[read]` das Vorgaengerrepo hat
  `OneRepMaxCalculator.tsx` mit **42 Fundstellen zu Epley und Brzycki**.
  **Dort nachsehen, bevor jemand rechnet.**

  **Angebunden heisst: Marke weg.** Alles andere behaelt sie.

## Nachgemessen, 2026-09-08 ? der Punkt ist halb ueberholt

`[cmd]` **Die Daten sind seither gewachsen:**

                      17.08.   08.09.
    Sitzungen              9       76
    Saetze                60      396
    Uebungen           1.416    1.416
    Muskelzuordnungen  6.624    6.726

`[cmd]` **Und der Reiter existiert: `tab-uebungen.tsx`,
9,7 KB.**

`[cmd]` **`e1RM` steht in sechs Dateien**, darunter
`training/ansicht.tsx` und `dashboard-echt.tsx`.

`[read]` **Der Satz *,,38 Kacheln, alle Attrappe"* stimmt so
nicht mehr** ? **aber es sind noch 81 Marken in 9 Dateien.**

    mockup-referenz.tsx     23
    ansicht.tsx             12
    fehlende-kacheln.tsx    12
    modale.tsx               1
    page.tsx                 1

## Der Auftrag, neu gefasst

`[read]` **MESSEN, dann anbinden, was anbindbar ist** ?
**nicht alles auf einmal.**

    A  welche Kacheln tragen heute eine Marke?
       Je Kachel: welche Zahl fehlt, und liegt sie in
       der Datenbank?
    B  welche lassen sich SOFORT anbinden?
       76 Sitzungen, 396 Saetze, 1.416 Uebungen,
       6.726 Muskelzuordnungen sind da.
    C  welche brauchen etwas, das fehlt? GEMELDET,
       je Kachel EIN Punkt -- nicht gesammelt.
    D  e1RM: was deckt es heute? G-68 sagt 6 von 1.416.
       MISS es, bevor du es anfasst.

`[cmd]` **Das Vorgaengerrepo hat `OneRepMaxCalculator.tsx` mit
42 Fundstellen zu Epley und Brzycki** ? **Struktur ja, Code
nie.**

## Was NICHT zu tun ist

`[read]` **Keine Marke ohne echte Zahl entfernen** ? **eine
Attrappe, die aussieht wie ein Wert, ist schlimmer als eine,
die sich als solche zeigt.**

`[read]` **Die Entwurfsreferenz bleibt** ? **E-68 und E-70.**

`[cmd]` **Und E-89 gilt auch hier: Wissen offen, Protokoll
gesperrt.** **MISS, ob im Trainingsmodul etwas hinter eine
Pruefung gehoert.**

## Abnahmebedingungen

    A1  je Kachel: Marke, fehlende Zahl, liegt sie in
        der Datenbank? TABELLE.
    A2  angebunden, was anbindbar ist -- mit Zahl
        vorher/nachher.
    A3  je nicht anbindbare Kachel EIN Punkt,
        nicht gesammelt.
    A4  keine Marke ohne echte Zahl entfernt. Belegt.
    A5  e1RM: was deckt es heute, was danach? Zahl.
    A6  Fotos: vorher und nachher, derselbe Reiter.
    A7  die Entwurfsreferenz unveraendert.
    A8  vier Module unveraendert.
    A9  apps/web 2000 oder mehr, apps/coach 65.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

