---
nr: G-297
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-31
braucht: []
kind_von: G-295
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
erledigt: 2026-08-31
commit: 5bb0e056
agent: claudecode
beauftragt: 2026-08-31
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/insights-kacheln.tsx
zahlen: null
---

# G-297 — die Tagesdeckung nimmt zu viel Platz

## Befund

Tom, 2026-08-31, nach dem Durchsehen: *,,tagesdeckung geht kleiner,
dann hat verlauf auch nicht mehr soviel freiflaeche."*

`[cmd]` **Die Heatmap fuellt 28 Felder ueber die volle Kachelhoehe** —
jedes Feld traegt nur eine Tageszahl.

`[read]` **Und die Verlaufskachel daneben richtet sich nach ihr:**
das Liniendiagramm sitzt oben, darunter stehen Schnitt und
Tageszahl — **dazwischen bleibt Leerraum.**

## Was zu tun ist

**Die Felder kleiner, die Kachel kompakter** — **und die
Verlaufskachel folgt.**

`[cmd]` **Die Vorlage im Fundus zeigt es so:** `HeatmapView.js` baut
ein 7x5-Gitter mit Farbintensitaet, **ohne dass ein Feld eine
Bildschirmzeile fuellt.**

`[read]` **Die Zahl im Feld ist verzichtbar** — **die Farbe traegt
die Aussage, die Zahl steht beim Darauffahren.**

## Auftrag

**Mitbeauftragt mit G-298 am 2026-08-31.** Der Auftragstext
und der Bericht stehen dort.

## Ergebnis (Kurzfassung, Einzelheiten in G-298)

`[cmd]` **Vorher: `repeat(7, 1fr)` mit `aspectRatio: 1`** — ein Feld
war ein Siebtel der Kartenbreite hoch, rund 90 px, und 28 davon
fuellten die Kachel.

`[cmd]` **`HeatmapView.js` macht es zweifach anders, und beides ist
uebernommen:** eine **gedeckelte Feldbreite** (`minmax(0, 26px)`
statt `1fr`) **und die Legende als Flex-Zeile statt als Liste** —
fuenf Zeilen werden zu einer.

`[cmd]` **Die Zahl im Feld ist entfernt** (Auftrag: sie ist
verzichtbar): die Farbe traegt die Aussage, die Zahl steht im
`title`. `[read]` **Damit darf das Feld so klein werden, dass keine
Ziffer mehr hineinpassen muss.**

`[cmd]` **Und `tagNummer()` ist mitentfernt, nicht unbenutzt
liegengelassen** — A-59. Ein Waechter prueft, dass sie nicht
zurueckkommt, und dass das Gitter nicht wieder mit der Karte waechst.

Bild: `backup/g298-final-insights.png`

## Abnahme

**2026-08-31, mit G-298 abgenommen:** kleiner: begrenzte Zellbreite, Legende als eine Zeile, Zahl aus
dem Feld entfernt.

## Wieder offen, 2026-08-31

**Tom:** *,,die hoehe ist nun definiert fuer tagesdeckung, wieso
verteilt man dann nicht auf optimale groesse die grafik darin?"*

`[read]` **Der Auftrag sagte *kleiner*. Falsch gestellt:** **das
Gitter soll die feste Kachelhoehe ausfuellen, nicht schrumpfen.**


## Auftrag

**Mitbeauftragt mit G-289 am 2026-08-31.** Der Auftragstext
und der Bericht stehen dort.

## Berichtigt: die Kachel soll AUSGEFUELLT werden, nicht schrumpfen

**Tom, 2026-08-31:** *„die hoehe ist nun definiert fuer tagesdeckung,
wieso verteilt man dann nicht auf optimale groesse die grafik
darin?"*

`[read]` **Der erste Auftrag hiess *„kleiner"* und war falsch
gestellt.** Die Umsetzung dazu (26-px-Deckelung, Legende als
Flex-Zeile, Zahl aus dem Feld) ist damit teilweise zurueckgenommen.

`[cmd]` **Gemessen am 2026-08-31, vorher:** beide Kacheln **386 px**
hoch — die Hoehe richtet sich nach der Verlaufskachel daneben —, und
**unter dem Gitter blieben 58 px leer.**

`[cmd]` **Nachher: 463 px, 17 px Rest**, und beide Kacheln bleiben
gleich hoch.

`[cmd]` **`repeat(7, minmax(0, 1fr))` statt einer festen Obergrenze.**
`[read]` **Die 0 darin ist nicht schmueckend:** ohne sie kann eine
Spalte nicht unter ihre Inhaltsbreite schrumpfen, und auf 375 px
sprengt das Gitter die Karte.

`[read]` **Was aus dem ersten Auftrag BLEIBT:** die Zahl im Feld
(sie steht im `title`), die Legende als Zeile und die Entfernung von
`tagNummer` (A-59). **Der Waechter sicherte die Deckelung und ist
mit Begruendung umgedreht** — er prueft jetzt, dass das Gitter mit
der Kachel waechst UND dass `minmax(0, …)` steht.

Bild: `backup/g297-nachher.png`

## Abnahme

**2026-08-31, mit G-289 abgenommen:** umgekehrt auf Toms Korrektur: 58 px ungenutzte Hoehe auf 17 px,
beide Kacheln gleich hoch.
