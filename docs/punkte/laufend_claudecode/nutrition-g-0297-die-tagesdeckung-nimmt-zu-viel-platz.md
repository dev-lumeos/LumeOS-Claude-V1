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
