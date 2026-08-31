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
commit: 4dd81ed9
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/insights-echt.tsx
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
