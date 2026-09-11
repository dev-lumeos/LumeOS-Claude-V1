---
nr: G-416
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-412
entscheidung: E-80
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-insights.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-416 — Hoehen, Flaechen, Deckkraft

## Auftrag

Tom, 2026-09-08, nach dem Blick auf Diary und Insights.

**Beauftragt am 2026-09-08.**

`[read]` **Die Vorlage liegt in
`docs/spezifikation/10-plattform/design-system/coach-portal-draft/`
? `module-nutrition.jsx` und `module-charts-pro.jsx`.**

---

## 1 · Die Flaeche unter der Kurve FEHLT ganz

`[cmd]` **Selbst gemessen am Schirm
(`backup/nut-insights.png`):** **bei *Calorie balance* ist die
Linie da, geglaettet, mit gestricheltem Ziel** ? **aber KEIN
Farbverlauf darunter.**

`[cmd]` **Dasselbe bei *Verlauf - Kalorien - 30 Tage*.**

`[cmd]` **`primitives.tsx` traegt `linearGradient` und
`showArea`** ? **die Bauteile sind da.**

`[read]` **Miss, warum die Flaeche nicht erscheint** ? **wird
`showArea` nicht gesetzt, oder greift der Verlauf nicht?**

`[cmd]` **Die Vorlage:** `module-charts-pro.jsx:115` ?
`showArea = true` **als Vorgabe, Flaeche nur bei `si === 0`.**

## 2 · Verlauf: Flaeche ja, Glaettung NEIN

Tom: *,,die grafik auch abbilden wie in calorie balance, aber
nicht geglaettet ? sprich die untere flaeche schattiert."*

`[read]` **Zwei verschiedene Kurven:**

    Calorie balance   geglaettet + Flaeche
    Verlauf           ECKIG + Flaeche

`[read]` **Also braucht `LineChart` einen Schalter** ? **oder der
Verlauf ruft eine andere Fassung.**

`[cmd]` **`module-charts-pro.jsx` hat `smooth(pts)` als eigene
Funktion** ? **sie laesst sich ueberspringen.**

## 3 · Jede Kachel hat ihre eigene Hoehe

Tom: *,,jede kachel hat ihre hoehe, die sollen nicht mit den
anderen kacheln daneben auf die hoehe abgeglichen werden."*

`[cmd]` **Das Raster gleicht heute ab** ? **`v2-grid` mit
`align-items: stretch` als Vorgabe.**

`[read]` **`align-items: start`** ? **dann nimmt jede Kachel ihre
eigene Hoehe.**

`[read]` **Und die Verlaufskachel passt sich an die Daten an** ?
**Tom: *,,die kachelhoehe auf die daten darin anpassen"*.**

## 4 · Tagesdeckung: Farben zu schrill, Box zu gross

`[cmd]` **Heute: kraeftiges Gruen und Gelb, Zellen gross.**

`[cmd]` **Die Vorlage, `NutrientHeatmap` in
`module-nutrition.jsx:399`:**

    Zellhoehe 16, Abstand 2
    Beschriftungsspalte 80 px
    >= 0.8  var(--pos)
    >= 0.5  var(--warn)
    sonst   var(--neg)

`[cmd]` **Und die DECKKRAFT** ? **messen, ob die Vorlage
`opacity` setzt oder eine gedaempfte Farbe nimmt.**

`[read]` **G-412 hat auf 411 px gestaucht** ? **Tom sagt, es ist
immer noch zu gross.**

`[read]` **Die Zellhoehe 16 der Vorlage ist der Massstab** ?
**nicht die Kachelhoehe.**

## 5 · Micronutrient trend: dasselbe, plus die Durchschnittsspalte

Tom: *,,rechts fehlt durchschnittsprozentangabe, siehe mockup
referenz Micronutrient trend."*

`[cmd]` **`module-nutrition.jsx:399ff` nachsehen** ? **die
Vorlage hat rechts je Zeile einen Prozentwert.**

`[read]` **Das ist der Schnitt ueber die 30 Tage** ? **eine
Zahl je Naehrstoff.**

`[cmd]` **Und die Deckkraft wie bei 4.**

## 6 · Diary: Deckung je Naehrstoff 30 Prozent hoeher

Tom: *,,30% hoeher bauen, dass ein bisschen mehr direkt sehbar
sind."*

`[cmd]` **Heute zeigt die Kachel acht Naehrstoffe** ? **messen,
wie viele bei 30 Prozent mehr Hoehe hineinpassen.**

`[read]` **Mehr Hoehe, nicht kleinere Zeilen.**

## 7 · Und eine Zahl stimmt nicht

`[cmd]` **Sein Bericht sagte *,,8 von 30 am Ziel"*.**

`[cmd]` **Am Schirm steht `7 von 30`.**

`[read]` **Messen, welche stimmt** ? **und ob sich die Zahl
zwischen Bericht und Abnahme geaendert hat (neue Daten) oder ob
eine der beiden falsch ist.**

---

## Abnahmebedingungen

    A1  die Flaeche unter beiden Kurven. Warum sie fehlte:
        gemessen.
    A2  Verlauf: eckig MIT Flaeche, Calorie balance
        geglaettet MIT Flaeche. Zwei Fotos.
    A3  jede Kachel eigene Hoehe. Foto vorher/nachher,
        die Hoehen gemessen.
    A4  Tagesdeckung: Zellhoehe 16 wie die Vorlage,
        Deckkraft gemessen und angeglichen.
    A5  Micronutrient trend: dieselbe Deckkraft, plus
        die Durchschnittsspalte rechts.
    A6  Diary: Deckung je Naehrstoff 30 % hoeher.
        Zahl: Naehrstoffe sichtbar vorher/nachher.
    A7  "7 von 30" oder "8 von 30"? Gemessen.
    A8  apps/web 1552 oder mehr.

## Was nicht zu tun ist

**Die Mockup-Referenz im Insights-Block BLEIBT** ? **Tom: *,,das
kommt weg, wenn ich es abgenommen habe."***

**Nichts in `supabase/`** ? **Codex arbeitet an C-463.**
**Keine Farbe erfinden** ? **die Vorlage nennt sie.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
